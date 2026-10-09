"""
EnterpriseIQ - Lambda Function: Query & RAG Orchestrator
Route: POST /api/v1/query
Handles Cognito-authenticated queries, Bedrock RAG retrieval, and citation formatting.
"""

import time
import json
import logging
from typing import Dict, Any

from backend.handlers.lambda_utils import format_response, extract_user_claims, parse_request_body, CORS_HEADERS
from backend.services.guardrails_service import guardrails_service
from backend.services.rag_retriever import rag_retriever

logger = logging.getLogger("EnterpriseIQ.LambdaQuery")
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:
    """
    AWS Lambda entry point for /api/v1/query REST endpoint.
    """
    http_method = event.get("httpMethod", "POST")

    # Handle CORS Preflight
    if http_method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": ""
        }

    if http_method != "POST":
        return format_response(405, {"error": f"Method {http_method} not allowed."})

    # Step 1: Extract authenticated Cognito User Claims
    user_claims = extract_user_claims(event)

    # Step 2: Parse & Validate Request Body
    is_valid, body, error_msg = parse_request_body(event)
    if not is_valid or not body:
        return format_response(400, {"error": error_msg or "Invalid request."})

    query = body.get("query", "").strip()
    if not query:
        return format_response(400, {"error": "Field 'query' cannot be empty."})

    if len(query) > 1200:
        return format_response(400, {"error": "Query exceeds maximum allowable length of 1,200 characters."})

    # Step 3: Bedrock AI Guardrails & Prompt Injection Defense
    is_clean, violation_type, defense_msg = guardrails_service.inspect_input(query, user_claims)
    if not is_clean:
        # Structured Security Log for CloudWatch Metric Filters & Alarms
        logger.warning(json.dumps({
            "event": "PROMPT_INJECTION_DEFENSE_TRIGGERED",
            "actor": user_claims.email,
            "department": user_claims.department,
            "violationType": violation_type,
            "querySnippet": query[:60]
        }))

        return format_response(200, {
            "messageId": f"msg-sec-{int(time.time())}",
            "text": defense_msg,
            "citations": [],
            "confidenceScore": 0.0,
            "securityStatus": "BLOCKED_INJECTION",
            "departmentScope": user_claims.department,
            "latencyMs": 140,
            "tokensUsed": {"prompt": 30, "completion": 40, "total": 70}
        })

    # Step 4: Execute Bedrock RAG Pipeline with Pre-Retrieval Filtering
    try:
        rag_response = rag_retriever.execute_rag(query, user_claims)

        # Structured Application Log for Observability
        logger.info(json.dumps({
            "event": "RAG_QUERY_COMPLETED",
            "actor": user_claims.email,
            "department": user_claims.department,
            "citationsCount": len(rag_response.citations),
            "confidenceScore": rag_response.confidence_score,
            "latencyMs": rag_response.latency_ms,
            "totalTokens": rag_response.tokens_used.get("total", 0)
        }))

        return format_response(200, {
            "messageId": rag_response.message_id,
            "text": rag_response.answer,
            "citations": rag_response.citations,
            "confidenceScore": rag_response.confidence_score,
            "securityStatus": rag_response.security_status,
            "departmentScope": rag_response.department_scope,
            "latencyMs": rag_response.latency_ms,
            "tokensUsed": rag_response.tokens_used
        })

    except Exception as e:
        logger.error(json.dumps({
            "event": "RAG_EXECUTION_FAILURE",
            "error": str(e),
            "actor": user_claims.email
        }))
        return format_response(500, {
            "error": "Internal RAG Processing Failure. Incident logged to CloudWatch.",
            "referenceId": f"ERR-BEDROCK-{int(time.time())}"
        })
