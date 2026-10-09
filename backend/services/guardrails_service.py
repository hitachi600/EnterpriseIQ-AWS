"""
EnterpriseIQ - AI Security & Bedrock Guardrails Service
Detects adversarial prompt injections, jailbreak attempts, and PII leakage
before queries reach the Bedrock Knowledge Base and Foundation Models.
"""

import re
import logging
from typing import Dict, Any, Tuple, Optional
from backend.config.aws_config import AWSConfig
from backend.models.domain_models import UserClaims, AuditEvent

logger = logging.getLogger("EnterpriseIQ.Guardrails")
logger.setLevel(logging.INFO)

class GuardrailsService:
    # Adversarial patterns & prompt override attempts
    INJECTION_PATTERNS = [
        r"ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)",
        r"system\s+prompt",
        r"reveal\s+(internal|system|confidential|secret)",
        r"jailbreak",
        r"developer\s+mode",
        r"bypass\s+(security|authorization|rbac|filter)",
        r"you\s+are\s+now\s+in\s+unrestricted\s+mode",
        r"dan\s+mode",
        r"override\s+security",
        r"show\s+all\s+passwords",
        r"dump\s+database"
    ]

    # Sensitive PII patterns
    SSN_PATTERN = r"\b\d{3}-\d{2}-\d{4}\b"
    CREDIT_CARD_PATTERN = r"\b(?:\d{4}[-\s]?){3}\d{4}\b"
    AWS_ACCESS_KEY_PATTERN = r"\bAKIA[0-9A-Z]{16}\b"

    def __init__(self, region: str = AWSConfig.AWS_REGION):
        self.region = region
        self.guardrail_id = AWSConfig.BEDROCK_GUARDRAIL_ID
        self.guardrail_version = AWSConfig.BEDROCK_GUARDRAIL_VERSION
        self._client = None

    def _get_client(self):
        if self._client is None:
            try:
                import boto3
                self._client = boto3.client("bedrock-runtime", region_name=self.region)
            except Exception as e:
                self._client = None
        return self._client

    def inspect_input(self, user_query: str, user_claims: UserClaims) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Inspects query for prompt injection attacks and unauthorized data harvesting.
        Returns: (is_clean, violation_type, defense_message)
        """
        query_lower = user_query.lower()

        # 1. Check for prompt injection signatures
        for pattern in self.INJECTION_PATTERNS:
            if re.search(pattern, query_lower):
                logger.warning(f"Adversarial Prompt Injection blocked from user {user_claims.email}: {user_query}")
                return (
                    False, 
                    "PROMPT_INJECTION", 
                    "⚠️ **Security Alert - Amazon Bedrock Guardrail Triggered**\n\nYour query contains input patterns that violate Nexora AI Security Policies (adversarial instruction or prompt override attempt). This incident has been logged to CloudWatch and CloudTrail security audit logs."
                )

        # 2. Check for PII or API key leakage in input
        if re.search(self.AWS_ACCESS_KEY_PATTERN, user_query):
            return (
                False,
                "PII_LEAK_AWS_KEY",
                "⚠️ **Input Blocked:** Detected AWS Access Key in query input. Never paste live credentials into the AI Assistant."
            )

        if re.search(self.SSN_PATTERN, user_query) or re.search(self.CREDIT_CARD_PATTERN, user_query):
            return (
                False,
                "PII_LEAK_CARD_SSN",
                "⚠️ **Input Blocked:** Detected Social Security Number or Payment Card number. Queries containing sensitive customer PII are blocked."
            )

        # 3. Bedrock Native Guardrail Integration
        client = self._get_client()
        if client is not None:
            try:
                response = client.apply_guardrail(
                    guardrailIdentifier=self.guardrail_id,
                    guardrailVersion=self.guardrail_version,
                    source="INPUT",
                    content=[{"text": {"text": user_query}}]
                )
                action = response.get("action", "NONE")
                if action == "GUARDRAIL_INTERVENED":
                    return (
                        False,
                        "BEDROCK_GUARDRAIL_TRIGGERED",
                        "⚠️ **Input Blocked by AWS Bedrock Guardrail:** The submitted query violates content safety policies."
                    )
            except Exception as e:
                # Fallback to regex filter
                pass

        return (True, None, None)

guardrails_service = GuardrailsService()
