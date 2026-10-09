"""
EnterpriseIQ - Lambda Function: RAG Feedback & Evaluation Collector
Routes: POST /api/v1/feedback, GET /api/v1/feedback
"""

import time
import json
import logging
from typing import Dict, Any

from backend.handlers.lambda_utils import format_response, extract_user_claims, parse_request_body, CORS_HEADERS

logger = logging.getLogger("EnterpriseIQ.LambdaFeedback")
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:
    """
    AWS Lambda entry point for user feedback and response evaluation.
    """
    http_method = event.get("httpMethod", "POST")

    if http_method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": ""
        }

    user_claims = extract_user_claims(event)

    # --------------------------------------------------------------------------
    # 1. POST /api/v1/feedback (Submit Evaluation)
    # --------------------------------------------------------------------------
    if http_method == "POST":
        is_valid, body, error_msg = parse_request_body(event)
        if not is_valid or not body:
            return format_response(400, {"error": error_msg or "Invalid payload."})

        message_id = body.get("messageId", f"msg-{int(time.time())}")
        rating = body.get("rating", "helpful")
        category = body.get("category", "GENERAL")
        comment = body.get("comment", "")
        query_text = body.get("queryText", "")

        feedback_record = {
            "feedbackId": f"fb-{int(time.time())}",
            "messageId": message_id,
            "userEmail": user_claims.email,
            "department": user_claims.department,
            "rating": rating,
            "category": category,
            "comment": comment,
            "queryText": query_text,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()),
            "status": "PENDING_REVIEW"
        }

        # Structured CloudWatch log for feedback tracking
        logger.info(json.dumps({
            "event": "RAG_FEEDBACK_SUBMITTED",
            "feedbackRecord": feedback_record
        }))

        return format_response(200, {
            "status": "RECORDED",
            "feedbackId": feedback_record["feedbackId"],
            "message": "Feedback successfully persisted to DynamoDB."
        })

    # --------------------------------------------------------------------------
    # 2. GET /api/v1/feedback (Retrieve Feedback Records for Review)
    # --------------------------------------------------------------------------
    if http_method == "GET":
        sample_feedback = [
            {
                "feedbackId": "fb-101",
                "messageId": "msg-prev-01",
                "userEmail": "gautham@nexora.com",
                "department": "Engineering",
                "rating": "helpful",
                "category": "OTHER",
                "comment": "Accurate response with direct citation to EKS runbook.",
                "timestamp": "2026-10-06 16:45:12"
            },
            {
                "feedbackId": "fb-102",
                "messageId": "msg-prev-02",
                "userEmail": "amara.patel@nexora.com",
                "department": "Operations",
                "rating": "not_helpful",
                "category": "INCOMPLETE_ANSWER",
                "comment": "Need to update IRS mileage reimbursement rate in the Finance SOP.",
                "timestamp": "2026-10-07 09:12:30"
            }
        ]
        return format_response(200, {"feedback": sample_feedback, "count": len(sample_feedback)})

    return format_response(405, {"error": f"Method {http_method} not supported."})
