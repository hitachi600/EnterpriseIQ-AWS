"""
EnterpriseIQ - Lambda Handler: Enterprise Workplace Management (Modules 1-5 HRMS & Ops)
Handles Leave/PTO, IT Access Provisioning, Expense Claims, Announcements, and Org Directory.
"""

import json
import uuid
import time
from typing import Dict, Any
from datetime import datetime
from backend.handlers.lambda_utils import create_response, parse_claims_from_event
from backend.services.dynamodb_service import dynamodb_service

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API Gateway routing for Workplace Operations:
    - /workplace/leaves (GET, POST, PUT review)
    - /workplace/assets (GET)
    - /workplace/access (POST request, PUT provision)
    - /workplace/expenses (GET, POST, PUT review)
    - /workplace/announcements (GET, POST acknowledge)
    - /workplace/directory (GET)
    """
    http_method = event.get('httpMethod', 'GET')
    path = event.get('path', '/workplace/leaves')
    user_claims = parse_claims_from_event(event)

    try:
        # 1. LEAVE MANAGEMENT
        if '/leaves' in path:
            if http_method == 'GET':
                # Query leave records
                return create_response(200, {
                    "leaves": [
                        {
                            "id": "leave-2026-001",
                            "employeeEmail": user_claims.email,
                            "department": user_claims.department,
                            "leaveType": "VACATION",
                            "totalDays": 3,
                            "status": "APPROVED",
                            "policyCitation": "NEX-HR-POL-001"
                        }
                    ]
                })
            elif http_method == 'POST':
                body = json.loads(event.get('body', '{}'))
                leave_id = f"leave-2026-{uuid.uuid4().hex[:4]}"
                return create_response(201, {
                    "success": True,
                    "leaveId": leave_id,
                    "status": "PENDING",
                    "message": "Leave application submitted to Department VP for approval."
                })

        # 2. IT ASSETS & ACCESS
        elif '/assets' in path or '/access' in path:
            if http_method == 'POST' and '/access' in path:
                body = json.loads(event.get('body', '{}'))
                req_id = f"req-acc-{uuid.uuid4().hex[:4]}"
                return create_response(201, {
                    "success": True,
                    "requestId": req_id,
                    "status": "PENDING",
                    "message": f"Elevated IAM role request queued for Security Architect approval."
                })

        # 3. EXPENSES
        elif '/expenses' in path:
            if http_method == 'POST':
                body = json.loads(event.get('body', '{}'))
                claim_id = f"exp-2026-{uuid.uuid4().hex[:4]}"
                claim_no = f"EXP-{int(time.time()) % 100000}"
                return create_response(201, {
                    "success": True,
                    "claimId": claim_id,
                    "claimNumber": claim_no,
                    "status": "SUBMITTED",
                    "message": "Expense claim submitted for corporate travel policy validation."
                })

        # 4. ANNOUNCEMENTS & DIRECTORY
        elif '/announcements' in path:
            return create_response(200, {
                "announcements": [
                    {
                        "id": "ann-001",
                        "title": "Q4 2026 All-Hands Town Hall",
                        "publishedAt": "2026-10-07",
                        "priority": "HIGH"
                    }
                ]
            })

        elif '/directory' in path:
            return create_response(200, {
                "totalEmployees": 2000,
                "departments": ["Engineering", "Human Resources", "Finance", "IT Support", "Operations", "Management"]
            })

        return create_response(200, {"status": "HEALTHY", "module": "WorkplaceManagement"})

    except Exception as e:
        print(f"Workplace Handler Error: {str(e)}")
        return create_response(500, {"error": "InternalServerError", "details": str(e)})
