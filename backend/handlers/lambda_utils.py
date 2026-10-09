"""
EnterpriseIQ - AWS Lambda REST API Utilities & Helpers
Handles API Gateway proxy event parsing, CORS response formatting, and error handling.
"""

import json
import logging
from typing import Dict, Any, Tuple, Optional
from backend.models.domain_models import UserClaims

logger = logging.getLogger("EnterpriseIQ.LambdaUtils")
logger.setLevel(logging.INFO)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,x-department",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Content-Type": "application/json"
}

def format_response(status_code: int, body: Any) -> Dict[str, Any]:
    """Formats standard API Gateway Proxy JSON response."""
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body) if not isinstance(body, str) else body
    }

create_response = format_response


def extract_user_claims(event: Dict[str, Any]) -> UserClaims:
    """
    Extracts authenticated user identity from Amazon Cognito JWT Authorizer context.
    Falls back to HTTP headers or query params for local simulation.
    """
    request_context = event.get("requestContext", {})
    authorizer = request_context.get("authorizer", {})
    claims = authorizer.get("claims", {})

    if claims:
        groups = claims.get("cognito:groups", "")
        if isinstance(groups, str):
            groups_list = [g.strip() for g in groups.split(",") if g.strip()]
        else:
            groups_list = list(groups)

        department = claims.get("custom:department", "Engineering")
        role = "Admin" if "Global-Administrators" in groups_list or department == "All Departments" else "Employee"
        
        clearance_raw = claims.get("custom:clearance", "PUBLIC_INTERNAL,DEPARTMENT_ONLY")
        clearance_list = [c.strip() for c in clearance_raw.split(",") if c.strip()]

        return UserClaims(
            user_id=claims.get("sub", "usr-cognito-001"),
            email=claims.get("email", "employee@nexora.com"),
            department=department,
            cognito_groups=groups_list,
            clearance_level=clearance_list,
            role=role,
            employee_id=claims.get("custom:employee_id", "NEX-1000")
        )

    # Fallback to headers (for local testing / frontend simulator)
    headers = event.get("headers") or {}
    email = headers.get("x-user-email", "gautham@nexora.com")
    department = headers.get("x-department", "Engineering")
    role = headers.get("x-role", "Employee")

    clearance_map = {
        "Engineering": ["PUBLIC_INTERNAL", "DEPARTMENT_ONLY"],
        "Human Resources": ["PUBLIC_INTERNAL", "DEPARTMENT_ONLY", "CONFIDENTIAL"],
        "Finance": ["PUBLIC_INTERNAL", "DEPARTMENT_ONLY", "CONFIDENTIAL", "RESTRICTED"],
        "IT Support": ["PUBLIC_INTERNAL", "DEPARTMENT_ONLY"],
        "Operations": ["PUBLIC_INTERNAL", "DEPARTMENT_ONLY", "CONFIDENTIAL"],
        "Management": ["PUBLIC_INTERNAL", "DEPARTMENT_ONLY", "CONFIDENTIAL", "RESTRICTED"],
        "All Departments": ["PUBLIC_INTERNAL", "DEPARTMENT_ONLY", "CONFIDENTIAL", "RESTRICTED"]
    }

    return UserClaims(
        user_id=f"usr-{department.lower()[:3]}-001",
        email=email,
        department=department,
        cognito_groups=[f"{department}-Members"],
        clearance_level=clearance_map.get(department, ["PUBLIC_INTERNAL"]),
        role="Admin" if department == "All Departments" or role == "Admin" else "Employee",
        employee_id="NEX-8821"
    )

parse_claims_from_event = extract_user_claims


def parse_request_body(event: Dict[str, Any]) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
    """Parses JSON request body from API Gateway event."""
    body = event.get("body")
    if not body:
        return False, None, "Missing request payload body."

    try:
        if isinstance(body, str):
            parsed = json.loads(body)
        else:
            parsed = body
        return True, parsed, None
    except json.JSONDecodeError as e:
        return False, None, f"Invalid JSON payload: {e}"
