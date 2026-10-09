# EnterpriseIQ: AWS Cost Optimization & One-Click Teardown Playbook

This guide ensures your personal AWS account is protected from unexpected charges, outlines Free Tier utilization, and provides automated teardown scripts.

---

## 💰 AWS Cost Breakdown & Free Tier Strategy

```
┌───────────────────────────────┬──────────────────────┬────────────────────────────────────────────────────────┐
│ AWS Service                   │ Free Tier Allowance  │ Personal Account Cost Control Strategy                 │
├───────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ Amazon Bedrock (Claude 3.5)   │ Pay-per-token        │ • Capped max output tokens to 768.                     │
│                               │                      │ • Use Claude 3 Haiku for lightweight routing.          │
│                               │                      │ • Estimated demo cost: < $0.50 for 100 queries.        │
├───────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ Amazon Bedrock (Titan V2)     │ $0.00002 / 1k tokens │ • Extremely inexpensive (< $0.01 for all demo docs).   │
├───────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ OpenSearch Serverless (AOSS)  │ 4 OCUs minimum       │ ⚠️ CRITICAL COST WARNING:                              │
│ (Bedrock KB Vector Store)     │ (~$0.24/OCU/hour)    │ • Running AOSS 24/7 costs ~$175/month!                 │
│                               │                      │ • Strategy: Create AOSS only during active demos;      │
│                               │                      │   run the local vector engine for day-to-day dev, and  │
│                               │                      │   run teardown when finished.                          │
├───────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ AWS Lambda                    │ 1M requests/month    │ 100% FREE Tier covered.                                │
├───────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ Amazon DynamoDB               │ 25 GB & 25 WCU/RCU   │ 100% FREE Tier covered (On-Demand billing).            │
├───────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ Amazon S3                     │ 5 GB Storage         │ 100% FREE Tier covered (< 10 MB demo docs).            │
├───────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ Amazon Cognito                │ 50,000 MAUs          │ 100% FREE Tier covered.                                │
├───────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ Amazon CloudFront             │ 1 TB Data Transfer   │ 100% FREE Tier covered.                                │
├───────────────────────────────┼──────────────────────┼────────────────────────────────────────────────────────┤
│ AWS KMS                       │ 20,000 requests/mo   │ ~$1.00/month per Customer Managed Key.                 │
└───────────────────────────────┴──────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 🛡️ Mandatory Cost Safety Steps in AWS Console

### 1. Configure AWS Budgets Alert ($10.00)
1. In the AWS Console, navigate to **AWS Billing $\rightarrow$ Budgets**.
2. Click **Create Budget $\rightarrow$ Cost Budget**.
3. Set **Budget Name:** `EnterpriseIQ-Personal-Budget-Alert`.
4. Set **Budget Amount:** `$10.00 USD`.
5. Set Alert threshold: **80% ($8.00)** and enter your personal email address.

---

## 🧹 One-Click Teardown Script

Run the automated cleanup script to delete billable AWS resources and CloudFormation stacks:

```bash
python scripts/teardown.py --all
```

Or execute via AWS CLI:

```bash
# 1. Empty S3 Document Lake Bucket
aws s3 rm s3://nexora-enterprise-kb-vault-prod --recursive

# 2. Delete CloudFormation Stacks
aws cloudformation delete-stack --stack-name EnterpriseIQ-Serverless-prod
aws cloudformation delete-stack --stack-name EnterpriseIQ-Cognito-prod
aws cloudformation delete-stack --stack-name EnterpriseIQ-DynamoDB-prod
aws cloudformation delete-stack --stack-name EnterpriseIQ-S3-Vault-prod
```
