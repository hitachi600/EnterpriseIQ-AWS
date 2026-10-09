#!/usr/bin/env python3
"""
EnterpriseIQ - S3 Document & Bedrock Metadata Synchronization Script
Uploads multi-department policies and their Bedrock .metadata.json sidecars
to Amazon S3 with SSE-KMS encryption and tag validation.
"""

import os
import sys
import json
import argparse
from pathlib import Path

def validate_metadata_file(meta_path: Path) -> bool:
    """Validates that the .metadata.json matches Bedrock Knowledge Base schema."""
    try:
        with open(meta_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if "metadataAttributes" not in data:
                print(f"[ERROR] Missing 'metadataAttributes' key in {meta_path}")
                return False
            attrs = data["metadataAttributes"]
            required = ["department", "classification", "documentId", "title"]
            for req in required:
                if req not in attrs:
                    print(f"[ERROR] Missing required attribute '{req}' in {meta_path}")
                    return False
        return True
    except Exception as e:
        print(f"[ERROR] Invalid JSON in {meta_path}: {e}")
        return False

def sync_documents(documents_dir: str, bucket_name: str, dry_run: bool = True):
    print("=" * 70)
    print(" EnterpriseIQ: S3 Document Lake & Bedrock Metadata Sync")
    print(f" Source Directory : {documents_dir}")
    print(f" Target S3 Bucket : {bucket_name}")
    print(f" Dry-Run Mode     : {'ENABLED (Simulated)' if dry_run else 'DISABLED (Live AWS Upload)'}")
    print("=" * 70)

    base_path = Path(documents_dir)
    if not base_path.exists():
        print(f"[ERROR] Directory not found: {documents_dir}")
        return

    doc_files = list(base_path.rglob("*.txt")) + list(base_path.rglob("*.pdf")) + list(base_path.rglob("*.docx"))
    
    uploaded_count = 0
    validated_count = 0

    for doc in doc_files:
        meta_file = doc.parent / f"{doc.name}.metadata.json"
        rel_key = doc.relative_to(base_path).as_posix()
        meta_key = f"{rel_key}.metadata.json"

        # Check sidecar existence
        if not meta_file.exists():
            continue

        if not validate_metadata_file(meta_file):
            continue

        validated_count += 1
        print(f"[VALIDATED] {rel_key}")
        print(f"            --> Sidecar: {meta_key}")

        if not dry_run:
            try:
                import boto3
                s3_client = boto3.client('s3')
                s3_client.upload_file(str(doc), bucket_name, rel_key, ExtraArgs={'ServerSideEncryption': 'aws:kms'})
                s3_client.upload_file(str(meta_file), bucket_name, meta_key, ExtraArgs={'ServerSideEncryption': 'aws:kms'})
                print(f"            --> S3 Upload Successful (SSE-KMS)")
                uploaded_count += 1
            except Exception as err:
                print(f"            --> S3 Upload Failed: {err}")
        else:
            uploaded_count += 1

    print("\n" + "=" * 70)
    print(f" Synchronization Summary:")
    print(f" Total Documents Validated : {validated_count}")
    print(f" Total Objects Processed   : {uploaded_count * 2} (Docs + Sidecars)")
    print("=" * 70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync enterprise documents to AWS S3 for Bedrock Knowledge Bases.")
    parser.add_argument("--docs-dir", default="./documents", help="Path to local documents directory")
    parser.add_argument("--bucket", default="nexora-enterprise-kb-vault-prod", help="Target AWS S3 bucket name")
    parser.add_argument("--execute", action="store_true", help="Execute live AWS upload using boto3 (default is dry-run)")

    args = parser.parse_args()
    sync_documents(args.docs_dir, args.bucket, dry_run=not args.execute)
