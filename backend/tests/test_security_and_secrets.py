"""
EnterpriseIQ - Automated Security, Secrets Management & DR Unit Test Suite
Verifies AWS Secrets Manager / SSM Parameter Store retrieval, cache invalidation,
zero hardcoded secrets, and Disaster Recovery SLA compliance.
"""

import sys
import unittest
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from backend.config.aws_config import AWSConfig
from backend.services.secrets_service import SecretsService, secrets_service
from scripts.dr_restore_drill import run_dr_restore_drill
from scripts.security_scan import scan_for_secrets, audit_rbac_and_least_privilege

class TestEnterpriseIQSecurityAndSecrets(unittest.TestCase):

    def setUp(self):
        self.service = SecretsService(ttl_seconds=2)

    def test_01_ssm_parameter_fallback_and_defaults(self):
        """Test that SSM parameter store returns fallback default value when AWS offline."""
        val = self.service.get_parameter("/enterpriseiq/test/key", default="fallback_value")
        self.assertEqual(val, "fallback_value")
        print("\n[PASS] Security Test 1: SSM Parameter Store fallback verified")

    def test_02_secrets_manager_json_parsing(self):
        """Test Secrets Manager JSON parsing and fallback structure."""
        default_secret = {"api_key": "mock-token-xyz", "db_pass": "vault-secure-123"}
        secret = self.service.get_secret("nonexistent-secret", default=default_secret)
        self.assertEqual(secret["api_key"], "mock-token-xyz")
        self.assertEqual(secret["db_pass"], "vault-secure-123")
        print("\n[PASS] Security Test 2: Secrets Manager JSON structure verified")

    def test_03_in_memory_ttl_caching(self):
        """Test that in-memory cache stores and retrieves values without repeated fetches."""
        self.service._cache["ssm:/enterpriseiq/cached_key"] = {
            "value": "cached_enterprise_secret",
            "timestamp": 9999999999
        }
        val = self.service.get_parameter("/enterpriseiq/cached_key")
        self.assertEqual(val, "cached_enterprise_secret")

        # Invalidate cache
        self.service.invalidate_cache()
        self.assertNotIn("ssm:/enterpriseiq/cached_key", self.service._cache)
        print("\n[PASS] Security Test 3: In-Memory TTL Cache and Invalidation verified")

    def test_04_aws_config_dynamic_attributes(self):
        """Test that AWSConfig loads properly from SecretsService."""
        self.assertTrue(hasattr(AWSConfig, "BEDROCK_MODEL_ID_PRIMARY"))
        self.assertTrue(hasattr(AWSConfig, "S3_DOCUMENT_VAULT_BUCKET"))
        self.assertTrue(hasattr(AWSConfig, "DYNAMODB_SINGLE_TABLE_NAME"))
        self.assertIn("EnterpriseIQ-Core-State", AWSConfig.DYNAMODB_SINGLE_TABLE_NAME)
        print("\n[PASS] Security Test 4: AWSConfig dynamic parameter resolution verified")

    def test_05_static_code_credentials_audit(self):
        """Test codebase static analysis for exposed secrets (must be 0)."""
        findings = scan_for_secrets()
        self.assertEqual(len(findings), 0, f"Detected potential hardcoded secrets: {findings}")
        print("\n[PASS] Security Test 5: Static Code Analysis (0 exposed credentials) verified")

    def test_06_least_privilege_iam_audit(self):
        """Test IAM templates to ensure no wildcard AdministratorAccess exists."""
        passed = audit_rbac_and_least_privilege()
        self.assertTrue(passed)
        print("\n[PASS] Security Test 6: CloudFormation least-privilege IAM policies verified")

    def test_07_dr_restore_drill_sla_compliance(self):
        """Test Disaster Recovery drill meets RTO <= 15m and RPO <= 5m."""
        results = run_dr_restore_drill()
        self.assertEqual(results["overallStatus"], "AUDIT_PASSED")
        self.assertLessEqual(results["targetSLA"]["maxRTO_minutes"], 15)
        self.assertLessEqual(results["targetSLA"]["maxRPO_minutes"], 5)
        print("\n[PASS] Security Test 7: Automated DR Restore Drill SLA Compliance verified")

if __name__ == "__main__":
    unittest.main()
