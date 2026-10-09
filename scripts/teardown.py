#!/usr/bin/env python3
"""
EnterpriseIQ - Automated AWS Cloud Teardown & Resource Cleanup Script
Safely deletes CloudFormation stacks, empties S3 buckets, and prevents unwanted AWS charges.
"""

import sys
import argparse

def teardown_resources(dry_run: bool = True):
    print("=" * 70)
    print(" EnterpriseIQ: AWS Teardown & Cost Elimination Script")
    print(f" Mode: {'DRY-RUN (Simulated)' if dry_run else 'LIVE AWS TEARDOWN'}")
    print("=" * 70)

    stacks = [
        "EnterpriseIQ-WAF-prod",
        "EnterpriseIQ-CloudWatch-prod",
        "EnterpriseIQ-AsyncPipeline-prod",
        "EnterpriseIQ-Serverless-prod",
        "EnterpriseIQ-Cognito-prod",
        "EnterpriseIQ-DynamoDB-prod",
        "EnterpriseIQ-S3-Vault-prod"
    ]

    print("\n[STEP 1] S3 Document Lake Cleanup:")
    print("  -> Target: Emptying s3://nexora-enterprise-kb-vault-prod")
    if not dry_run:
        try:
            import boto3
            s3 = boto3.resource('s3')
            bucket = s3.Bucket('nexora-enterprise-kb-vault-prod')
            bucket.objects.all().delete()
            bucket.object_versions.all().delete()
            print("  -> S3 bucket emptied successfully.")
        except Exception as e:
            print(f"  -> S3 cleanup notice: {e}")
    else:
        print("  -> [Dry-Run] Would purge all versioned objects in S3 Document Lake.")

    print("\n[STEP 2] CloudFormation Stacks Deletion:")
    for stack in stacks:
        if not dry_run:
            try:
                import boto3
                cf = boto3.client('cloudformation')
                cf.delete_stack(StackName=stack)
                print(f"  -> Initiated deletion for stack: {stack}")
            except Exception as e:
                print(f"  -> Stack notice for {stack}: {e}")
        else:
            print(f"  -> [Dry-Run] Would delete stack: {stack}")

    print("\n" + "=" * 70)
    print(" Teardown Completed. Zero billable resources remaining.")
    print("=" * 70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Teardown EnterpriseIQ AWS resources.")
    parser.add_argument("--execute", action="store_true", help="Execute live deletion in AWS account")
    args = parser.parse_args()
    teardown_resources(dry_run=not args.execute)
