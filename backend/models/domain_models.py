"""
EnterpriseIQ - Domain Models & Data Transfer Objects (DTOs)
Strict schemas for RAG requests, Bedrock chunk retrievals, citations, and audit logs.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any
from datetime import datetime

@dataclass
class UserClaims:
    user_id: str
    email: str
    department: str
    cognito_groups: List[str] = field(default_factory=list)
    clearance_level: List[str] = field(default_factory=lambda: ["PUBLIC_INTERNAL"])
    role: str = "Employee"
    employee_id: str = "NEX-0000"

    def is_admin(self) -> bool:
        return self.role == "Admin" or self.department == "All Departments"

    def has_clearance(self, classification: str) -> bool:
        if self.is_admin():
            return True
        return classification in self.clearance_level

@dataclass
class RetrievalChunk:
    chunk_id: str
    text: str
    document_id: str
    title: str
    department: str
    classification: str
    s3_uri: str
    score: float
    page_number: int = 1

    def to_citation_dict(self) -> Dict[str, Any]:
        return {
            "id": self.chunk_id,
            "documentId": self.document_id,
            "documentTitle": self.title,
            "department": self.department,
            "classification": self.classification,
            "s3Uri": self.s3_uri,
            "pageNumber": self.page_number,
            "snippet": self.text[:280] + ("..." if len(self.text) > 280 else ""),
            "relevanceScore": round(self.score, 3)
        }

@dataclass
class RAGQueryRequest:
    query: str
    user_claims: UserClaims
    session_id: Optional[str] = None
    stream: bool = False

@dataclass
class RAGQueryResponse:
    message_id: str
    answer: str
    citations: List[Dict[str, Any]]
    confidence_score: float
    latency_ms: int
    tokens_used: Dict[str, int]
    department_scope: str
    security_status: str = "CLEAN"
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class DocumentApprovalRecord:
    approval_id: str
    document_id: str
    document_title: str
    department: str
    classification: str
    submitted_by: str
    submitted_at: str
    status: str = "PENDING"
    version: str = "1.0"
    diff_summary: str = ""
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    review_notes: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class SupportTicketRecord:
    ticket_id: str
    employee_id: str
    employee_name: str
    employee_email: str
    department: str
    category: str
    priority: str
    status: str
    subject: str
    description: str
    assigned_to: str
    created_at: str
    updated_at: str
    sla_hours: int = 8
    conversation_context: Optional[str] = None
    resolution_notes: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class AuditEvent:
    id: str
    timestamp: str
    actor: str
    department: str
    action: str
    resource: str
    status: str
    details: str
    ip_address: str
    aws_service: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


