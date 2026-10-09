"""
EnterpriseIQ - DynamoDB Single-Table Service Layer
Implements single-table access patterns for chat history, feedback, documents, and audit logs.
"""

import time
import json
import logging
from typing import Dict, Any, List, Optional

from backend.config.aws_config import AWSConfig
from backend.models.domain_models import AuditEvent

logger = logging.getLogger("EnterpriseIQ.DynamoDBService")
logger.setLevel(logging.INFO)

class DynamoDBService:
    def __init__(self, region: str = AWSConfig.AWS_REGION):
        self.region = region
        self.table_name = AWSConfig.DYNAMODB_SINGLE_TABLE_NAME
        self._resource = None
        self._table = None
        # Local mock memory cache for zero-credential testing
        self._mock_store: Dict[str, Dict[str, Any]] = {}

    def _get_table(self):
        if self._table is None:
            try:
                import boto3
                self._resource = boto3.resource("dynamodb", region_name=self.region)
                self._table = self._resource.Table(self.table_name)
            except Exception as e:
                logger.info(f"DynamoDB client running in local mock state: {e}")
                self._table = None
        return self._table

    # 1. Chat Message Persistence
    def save_chat_message(
        self, 
        session_id: str, 
        user_id: str, 
        department: str, 
        sender: str, 
        text: str, 
        citations: List[Dict[str, Any]] = None,
        latency_ms: int = 0
    ) -> str:
        msg_id = f"msg-{int(time.time()*1000)}"
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())

        item = {
            "PK": f"SESSION#{session_id}",
            "SK": f"MSG#{timestamp}#{msg_id}",
            "GSI1PK": f"DEPT#{department}",
            "GSI1SK": timestamp,
            "messageId": msg_id,
            "userId": user_id,
            "sender": sender,
            "text": text,
            "citations": citations or [],
            "latencyMs": latency_ms,
            "ttl": int(time.time()) + (90 * 86400) # 90 days retention
        }

        table = self._get_table()
        if table is not None:
            try:
                table.put_item(Item=item)
            except Exception as e:
                logger.warning(f"DynamoDB put_item failed: {e}")

        # Local cache
        key = f"{item['PK']}###{item['SK']}"
        self._mock_store[key] = item
        return msg_id

    # 2. Feedback Persistence
    def save_feedback(
        self,
        message_id: str,
        user_email: str,
        department: str,
        rating: str,
        category: str,
        comment: str,
        query_text: str = ""
    ) -> str:
        feedback_id = f"fb-{int(time.time()*1000)}"
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())

        item = {
            "PK": f"FEEDBACK#{message_id}",
            "SK": f"USER#{user_email}",
            "GSI1PK": f"RATING#{rating}",
            "GSI1SK": timestamp,
            "feedbackId": feedback_id,
            "department": department,
            "category": category,
            "comment": comment,
            "queryText": query_text,
            "status": "PENDING_REVIEW"
        }

        table = self._get_table()
        if table is not None:
            try:
                table.put_item(Item=item)
            except Exception as e:
                logger.warning(f"DynamoDB feedback put_item failed: {e}")

        key = f"{item['PK']}###{item['SK']}"
        self._mock_store[key] = item
        return feedback_id

    # 3. Audit Log Persistence
    def save_audit_event(self, event: AuditEvent):
        item = {
            "PK": f"AUDIT#{event.timestamp[:10]}",
            "SK": f"TIMESTAMP#{event.timestamp}#{event.id}",
            "GSI1PK": f"DEPT#{event.department}",
            "GSI1SK": f"STATUS#{event.status}",
            "eventId": event.id,
            "actor": event.actor,
            "action": event.action,
            "resource": event.resource,
            "status": event.status,
            "details": event.details,
            "ipAddress": event.ip_address,
            "awsService": event.aws_service,
            "ttl": int(time.time()) + (365 * 86400) # 1 year compliance retention
        }

        table = self._get_table()
        if table is not None:
            try:
                table.put_item(Item=item)
            except Exception as e:
                logger.warning(f"DynamoDB audit put_item failed: {e}")

    # 4. Support Tickets (Module 17)
    def create_ticket(self, ticket_dict: Dict[str, Any]):
        ticket_id = ticket_dict["ticket_id"]
        item = {
            "PK": f"TICKET#{ticket_id}",
            "SK": "METADATA",
            "GSI1PK": f"DEPT#{ticket_dict['department']}",
            "GSI1SK": f"STATUS#{ticket_dict['status']}",
            **ticket_dict
        }
        table = self._get_table()
        if table is not None:
            try:
                table.put_item(Item=item)
            except Exception as e:
                logger.warning(f"DynamoDB ticket put_item failed: {e}")
        key = f"{item['PK']}###{item['SK']}"
        self._mock_store[key] = item
        return ticket_id

    def get_all_tickets(self) -> List[Dict[str, Any]]:
        return [v for k, v in self._mock_store.items() if k.startswith("TICKET#")]

    def get_tickets_by_user(self, user_email: str) -> List[Dict[str, Any]]:
        return [v for k, v in self._mock_store.items() if k.startswith("TICKET#") and v.get("employee_email") == user_email]

    def update_ticket_status(self, ticket_id: str, status: str, resolution_notes: str = None, resolved_by: str = None):
        key = f"TICKET#{ticket_id}###METADATA"
        if key in self._mock_store:
            self._mock_store[key]["status"] = status
            if resolution_notes:
                self._mock_store[key]["resolution_notes"] = resolution_notes

    # 5. Document Approvals (Module 11)
    def get_pending_approvals(self, department: Optional[str] = None) -> List[Dict[str, Any]]:
        results = [v for k, v in self._mock_store.items() if k.startswith("APPROVAL#")]
        if department:
            results = [r for r in results if r.get("department") == department]
        return results

    def update_approval_status(self, approval_id: str, status: str, reviewer: str, notes: str = ""):
        key = f"APPROVAL#{approval_id}###METADATA"
        if key in self._mock_store:
            self._mock_store[key]["status"] = status
            self._mock_store[key]["reviewed_by"] = reviewer
            self._mock_store[key]["reviewed_at"] = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
            self._mock_store[key]["review_notes"] = notes

dynamodb_service = DynamoDBService()

