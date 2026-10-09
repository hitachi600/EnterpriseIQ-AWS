"""
EnterpriseIQ - Lambda Handler: IT Helpdesk & Support Tickets (Module 17)
Handles AI-to-engineer incident escalation and DynamoDB state persistence.
"""

import json
import uuid
from typing import Dict, Any
from datetime import datetime
from backend.handlers.lambda_utils import create_response, parse_claims_from_event
from backend.services.dynamodb_service import dynamodb_service

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API Gateway routing for IT Support Tickets:
    - GET /tickets -> List support tickets for user / department
    - POST /tickets -> Create new support ticket from conversation context
    - PUT /tickets/{id}/resolve -> Resolve ticket with engineer resolution notes
    """
    http_method = event.get('httpMethod', 'GET')
    path = event.get('path', '/tickets')
    user_claims = parse_claims_from_event(event)

    try:
        if http_method == 'GET':
            # Support engineers and Admins see all tickets; employees see their own / department's
            if user_claims.is_admin() or user_claims.department in ["IT Support", "Management"]:
                tickets = dynamodb_service.get_all_tickets()
            else:
                tickets = dynamodb_service.get_tickets_by_user(user_claims.email)
            return create_response(200, {"tickets": tickets})

        elif http_method == 'POST':
            body = json.loads(event.get('body', '{}'))
            subject = body.get('subject')
            description = body.get('description', '')
            category = body.get('category', 'OTHER')
            priority = body.get('priority', 'MEDIUM')
            conversation_context = body.get('conversationContext', '')

            if not subject:
                return create_response(400, {"error": "MissingSubject", "message": "Subject is required."})

            ticket_id = f"TCK-2026-{uuid.uuid4().hex[:4].upper()}"
            ticket_data = {
                "ticket_id": ticket_id,
                "employee_id": user_claims.employee_id,
                "employee_name": user_claims.email.split('@')[0].capitalize(),
                "employee_email": user_claims.email,
                "department": user_claims.department,
                "category": category,
                "priority": priority,
                "status": "OPEN",
                "subject": subject,
                "description": description,
                "conversation_context": conversation_context,
                "assigned_to": "IT Support Tier 2 (David Kim)" if category in ["VPN_NETWORK", "HARDWARE"] else "Alex Mercer (Admin)",
                "created_at": datetime.utcnow().isoformat() + "Z",
                "sla_hours": 2 if priority == "CRITICAL" else 4 if priority == "HIGH" else 8 if priority == "MEDIUM" else 24
            }

            dynamodb_service.create_ticket(ticket_data)

            return create_response(201, {
                "success": True,
                "ticket": ticket_data,
                "message": f"Support ticket {ticket_id} created with {ticket_data['sla_hours']}h SLA target."
            })

        elif http_method in ['PUT', 'POST'] and '/resolve' in path:
            body = json.loads(event.get('body', '{}'))
            ticket_id = path.split('/')[-2] if '/resolve' in path else body.get('ticketId')
            resolution_notes = body.get('resolutionNotes', 'Resolved by engineer')

            dynamodb_service.update_ticket_status(
                ticket_id=ticket_id,
                status="RESOLVED",
                resolution_notes=resolution_notes,
                resolved_by=user_claims.email
            )

            return create_response(200, {
                "success": True,
                "status": "RESOLVED",
                "message": f"Ticket {ticket_id} resolved and archived."
            })

        return create_response(404, {"error": "NotFound"})

    except Exception as e:
        print(f"Ticket Handler Error: {str(e)}")
        return create_response(500, {"error": "InternalServerError", "details": str(e)})
