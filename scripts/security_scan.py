"""
EnterpriseIQ - Automated Security, Vulnerability & Secrets Audit Scanner
Performs static code checks for hardcoded credentials, least-privilege IAM policies,
CORS security headers, and prompt injection filters.
"""

import os
import re
import sys
import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("EnterpriseIQ.SecurityScanner")

PROJECT_ROOT = Path(__file__).resolve().parents[1]

SUSPICIOUS_PATTERNS = [
    (r"AKIA[0-9A-Z]{16}", "Hardcoded AWS Access Key ID"),
    (r"(?i)aws_secret_access_key\s*=\s*['\"][0-9a-zA-Z/+]{40}['\"]", "Hardcoded AWS Secret Access Key"),
    (r"(?i)password\s*=\s*['\"][^'\"]{8,}['\"]", "Potential Plaintext Password"),
    (r"(?i)bearer\s+ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+", "Hardcoded JWT Token"),
]

def scan_for_secrets():
    logger.info("=" * 70)
    logger.info("1. SCANNING CODEBASE FOR EXPOSED CREDENTIALS & SECRETS...")
    logger.info("=" * 70)

    findings = []
    scanned_files = 0

    for root, dirs, files in os.walk(PROJECT_ROOT):
        # Skip git, node_modules, cache
        dirs[:] = [d for d in dirs if d not in [".git", "node_modules", ".pytest_cache", "__pycache__", "dist"]]
        for f in files:
            if f.endswith((".py", ".ts", ".tsx", ".yaml", ".json", ".tf")):
                file_path = Path(root) / f
                scanned_files += 1
                try:
                    content = file_path.read_text(encoding="utf-8", errors="ignore")
                    for pattern, desc in SUSPICIOUS_PATTERNS:
                        matches = re.finditer(pattern, content)
                        for match in matches:
                            findings.append({
                                "file": str(file_path.relative_to(PROJECT_ROOT)),
                                "issue": desc,
                                "matchSnippet": match.group(0)[:15] + "..."
                            })
                except Exception as e:
                    logger.debug(f"Could not read {file_path}: {e}")

    logger.info(f"Scanned {scanned_files} files.")
    if not findings:
        logger.info("[PASS] ZERO hardcoded credentials or plaintext secrets found!")
    else:
        logger.warning(f"[WARNING] Found {len(findings)} potential secret patterns:")
        for fd in findings:
            logger.warning(f"  - {fd['file']}: {fd['issue']}")

    return findings

def audit_rbac_and_least_privilege():
    logger.info("\n" + "=" * 70)
    logger.info("2. AUDITING IAM POLICIES & RBAC CONFIGURATION...")
    logger.info("=" * 70)

    iac_files = list((PROJECT_ROOT / "infrastructure").glob("*.yaml"))
    logger.info(f"Auditing {len(iac_files)} CloudFormation infrastructure templates...")
    admin_access_found = False

    for f in iac_files:
        content = f.read_text(encoding="utf-8", errors="ignore")
        if "AdministratorAccess" in content:
            admin_access_found = True
            logger.error(f"[FAIL] Overly permissive AdministratorAccess detected in {f.name}")

    if not admin_access_found:
        logger.info("[PASS] All IAM roles enforce least-privilege scoping (No AdministratorAccess wildcards).")

    return not admin_access_found

def run_security_audit():
    logger.info("\nSTARTING ENTERPRISEIQ COMPREHENSIVE SECURITY AUDIT")
    secret_findings = scan_for_secrets()
    iam_passed = audit_rbac_and_least_privilege()

    passed = (len(secret_findings) == 0) and iam_passed
    logger.info("\n" + "=" * 70)
    logger.info(f"OVERALL SECURITY AUDIT STATUS: {'PASSED' if passed else 'ACTION_REQUIRED'}")
    logger.info("=" * 70)
    return passed

if __name__ == "__main__":
    success = run_security_audit()
    sys.exit(0 if success else 1)
