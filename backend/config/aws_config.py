"""
EnterpriseIQ - AWS Environment & Configuration Manager
Centralizes all AWS service IDs, Model ARNs, DynamoDB table names, Bedrock parameters,
and AWS Secrets Manager / SSM Parameter Store integrations.
"""

import os
from typing import Dict, Any, Optional
from backend.services.secrets_service import secrets_service

class AWSConfig:
    # Deployment Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "prod")

    # AWS Region
    AWS_REGION: str = secrets_service.get_parameter("/enterpriseiq/region", os.getenv("AWS_REGION", "us-east-1"))

    # Amazon Bedrock Foundation Models
    # Primary LLM: Anthropic Claude 3.5 Sonnet
    BEDROCK_MODEL_ID_PRIMARY: str = secrets_service.get_parameter(
        "/enterpriseiq/bedrock/primary_model",
        os.getenv("BEDROCK_MODEL_ID_PRIMARY", "anthropic.claude-3-5-sonnet-20240620-v1:0")
    )
    # Fast / Cost-Optimized LLM: Anthropic Claude 3 Haiku
    BEDROCK_MODEL_ID_FAST: str = secrets_service.get_parameter(
        "/enterpriseiq/bedrock/fast_model",
        os.getenv("BEDROCK_MODEL_ID_FAST", "anthropic.claude-3-haiku-20240307-v1:0")
    )
    # Embedding Model: Amazon Titan Text Embeddings V2 (1024 dimensions)
    BEDROCK_EMBEDDING_MODEL_ID: str = secrets_service.get_parameter(
        "/enterpriseiq/bedrock/embedding_model",
        os.getenv("BEDROCK_EMBEDDING_MODEL_ID", "amazon.titan-embed-text-v2:0")
    )

    # Amazon Bedrock Knowledge Base
    BEDROCK_KNOWLEDGE_BASE_ID: str = secrets_service.get_parameter(
        "/enterpriseiq/bedrock/kb_id",
        os.getenv("BEDROCK_KNOWLEDGE_BASE_ID", "NEXORAKB01")
    )
    BEDROCK_GUARDRAIL_ID: str = secrets_service.get_parameter(
        "/enterpriseiq/bedrock/guardrail_id",
        os.getenv("BEDROCK_GUARDRAIL_ID", "nexora-ai-guardrail-v1")
    )
    BEDROCK_GUARDRAIL_VERSION: str = secrets_service.get_parameter(
        "/enterpriseiq/bedrock/guardrail_version",
        os.getenv("BEDROCK_GUARDRAIL_VERSION", "DRAFT")
    )

    # Storage & Persistence
    S3_DOCUMENT_VAULT_BUCKET: str = secrets_service.get_parameter(
        "/enterpriseiq/s3/vault_bucket",
        os.getenv("S3_DOCUMENT_VAULT_BUCKET", f"nexora-enterprise-kb-vault-{ENVIRONMENT}")
    )
    S3_STAGING_QUARANTINE_BUCKET: str = secrets_service.get_parameter(
        "/enterpriseiq/s3/staging_bucket",
        os.getenv("S3_STAGING_QUARANTINE_BUCKET", f"nexora-enterprise-staging-quarantine-{ENVIRONMENT}")
    )
    DYNAMODB_SINGLE_TABLE_NAME: str = secrets_service.get_parameter(
        "/enterpriseiq/dynamodb/table_name",
        os.getenv("DYNAMODB_SINGLE_TABLE_NAME", f"EnterpriseIQ-Core-State-{ENVIRONMENT}")
    )
    KMS_KEY_ALIAS: str = secrets_service.get_parameter(
        "/enterpriseiq/kms/key_alias",
        os.getenv("KMS_KEY_ALIAS", f"alias/enterpriseiq-document-vault-{ENVIRONMENT}")
    )

    # Cognito
    COGNITO_USER_POOL_ID: str = secrets_service.get_parameter(
        "/enterpriseiq/cognito/user_pool_id",
        os.getenv("COGNITO_USER_POOL_ID", "us-east-1_NexoraUserPool")
    )
    COGNITO_APP_CLIENT_ID: str = secrets_service.get_parameter(
        "/enterpriseiq/cognito/app_client_id",
        os.getenv("COGNITO_APP_CLIENT_ID", "nexora-app-client-01")
    )

    # RAG Tuning Parameters
    RAG_TOP_K_CHUNKS: int = int(os.getenv("RAG_TOP_K_CHUNKS", "4"))
    RAG_MIN_SIMILARITY_SCORE: float = float(os.getenv("RAG_MIN_SIMILARITY_SCORE", "0.72"))
    MAX_GENERATION_TOKENS: int = int(os.getenv("MAX_GENERATION_TOKENS", "768"))
    TEMPERATURE: float = float(os.getenv("TEMPERATURE", "0.1"))  # Low temperature for strict factual grounding

    @classmethod
    def get_secure_credentials(cls, secret_name: str = "enterpriseiq/api-tokens") -> Dict[str, Any]:
        """Fetch encrypted credentials from AWS Secrets Manager."""
        return secrets_service.get_secret(secret_name, default={})
