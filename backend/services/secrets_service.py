"""
EnterpriseIQ - AWS Secrets Manager & SSM Parameter Store Manager
Provides centralized, cached, and encrypted runtime configuration management
with automatic fallback to environment variables for local development.
"""

import os
import json
import time
import logging
from typing import Any, Dict, Optional
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

logger = logging.getLogger("EnterpriseIQ.SecretsService")
logging.basicConfig(level=logging.INFO)

class SecretsService:
    """
    Centralized Secrets & SSM Parameter Store Manager.
    Implements in-memory TTL caching to optimize Lambda latency and reduce AWS API costs.
    """

    def __init__(self, ttl_seconds: int = 300):
        self.region_name = os.getenv("AWS_REGION", "us-east-1")
        self.ttl_seconds = ttl_seconds
        self._cache: Dict[str, Dict[str, Any]] = {}
        
        # Initialize Boto3 clients lazily or handle credential absence gracefully
        try:
            self._secrets_client = boto3.client("secretsmanager", region_name=self.region_name)
            self._ssm_client = boto3.client("ssm", region_name=self.region_name)
        except Exception as e:
            logger.warning(f"Unable to initialize AWS SDK clients: {e}. Defaulting to env vars.")
            self._secrets_client = None
            self._ssm_client = None

    def get_parameter(self, param_name: str, default: Optional[str] = None, decrypt: bool = True) -> Optional[str]:
        """
        Fetch configuration parameter from AWS SSM Parameter Store with caching.
        Falls back to os.environ[param_name] or default.
        """
        now = time.time()
        cache_key = f"ssm:{param_name}"

        # 1. Check in-memory cache
        if cache_key in self._cache:
            entry = self._cache[cache_key]
            if now - entry["timestamp"] < self.ttl_seconds:
                return entry["value"]

        # 2. Try fetching from AWS SSM Parameter Store
        if self._ssm_client:
            try:
                response = self._ssm_client.get_parameter(
                    Name=param_name,
                    WithDecryption=decrypt
                )
                val = response["Parameter"]["Value"]
                self._cache[cache_key] = {"value": val, "timestamp": now}
                logger.info(f"Loaded SSM Parameter '{param_name}' from AWS")
                return val
            except (ClientError, NoCredentialsError, Exception) as e:
                logger.debug(f"SSM Parameter Store lookup for '{param_name}' bypassed ({e})")

        # 3. Fallback to OS environment variable or provided default
        env_key = param_name.replace("/", "_").strip("_").upper()
        return os.getenv(env_key, default)

    def get_secret(self, secret_id: str, default: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Fetch JSON secret from AWS Secrets Manager with in-memory caching.
        Falls back to environment variables or provided default dict.
        """
        now = time.time()
        cache_key = f"secret:{secret_id}"

        # 1. Check in-memory cache
        if cache_key in self._cache:
            entry = self._cache[cache_key]
            if now - entry["timestamp"] < self.ttl_seconds:
                return entry["value"]

        # 2. Try fetching from AWS Secrets Manager
        if self._secrets_client:
            try:
                response = self._secrets_client.get_secret_value(SecretId=secret_id)
                if "SecretString" in response:
                    val = json.loads(response["SecretString"])
                    self._cache[cache_key] = {"value": val, "timestamp": now}
                    logger.info(f"Loaded Secret '{secret_id}' from AWS Secrets Manager")
                    return val
            except (ClientError, NoCredentialsError, Exception) as e:
                logger.debug(f"Secrets Manager lookup for '{secret_id}' bypassed ({e})")

        # 3. Fallback to default
        return default or {}

    def invalidate_cache(self):
        """Clears in-memory parameter and secret cache."""
        self._cache.clear()

# Singleton instance for application-wide reuse
secrets_service = SecretsService()
