# EnterpriseIQ: ATS-Optimized Resume Project Descriptions

Use these high-impact, quantifiable bullet points for your resume and LinkedIn profile. Choose the format that best matches your target job title.

---

## 🎯 Format 1: For AWS Cloud Engineer / Cloud Solutions Architect

### Project Title
**EnterpriseIQ – Secure Multi-Department Generative AI Knowledge Platform on AWS**  
*AWS Services: Amazon Bedrock, S3, Lambda, API Gateway, Cognito, DynamoDB, OpenSearch Serverless, KMS, WAF, CloudWatch, CloudFormation*

### High-Impact Bullet Points
- Architected and deployed an enterprise-grade Generative AI knowledge retrieval platform on AWS for 1,200+ employees, utilizing **Amazon Bedrock (Anthropic Claude 3.5 Sonnet & Titan Text Embeddings V2)** and **Bedrock Knowledge Bases**.
- Engineered a **Zero-Trust Multi-Department Role-Based Access Control (RBAC)** architecture using **Amazon Cognito User Pools** and pre-retrieval vector metadata filtering in OpenSearch Serverless, preventing cross-department confidential data leakage.
- Built a modular, serverless REST API backend using **AWS Lambda (Python 3.11 on ARM64 Graviton2)** and **Amazon API Gateway**, reducing compute costs by 20% and maintaining p95 query latency under 640ms.
- Implemented an asynchronous event-driven document ingestion pipeline via **Amazon S3, Amazon EventBridge, and Amazon SQS with Dead-Letter Queues (DLQ)**, eliminating API Gateway timeout risks for large enterprise PDFs.
- Hardened security and governance using **AWS KMS Customer Managed Keys (CMK)** with envelope encryption, **AWS WAF** rate-limiting rules, **Bedrock Guardrails** for prompt-injection defense, and structured JSON auditing in **Amazon CloudWatch** and **CloudTrail**.
- Authored 100% Infrastructure-as-Code (IaC) deployment templates using **AWS CloudFormation** and built automated CI/CD validation test suites.

---

## 🎯 Format 2: For Generative AI Engineer / LLM Application Developer

### Project Title
**Enterprise Generative AI & Knowledge Retrieval Engine (RAG) on AWS Bedrock**  
*Tech Stack: Amazon Bedrock, Claude 3.5 Sonnet, Titan Embeddings V2, RAG, OpenSearch Serverless, Python, React, TypeScript*

### High-Impact Bullet Points
- Designed an enterprise Retrieval-Augmented Generation (RAG) platform with strict deterministic citations (S3 URI, page number, confidence scores) and low-temperature (0.1) factual grounding prompts to eliminate AI hallucinations.
- Implemented semantic document chunking (500 tokens / 20% overlap) and 1024-dimensional normalized vector indexing using **Amazon Titan Text Embeddings V2**.
- Developed dual-layer AI security safeguards integrating **Amazon Bedrock Guardrails** and context-isolation XML prompting to mitigate direct and indirect prompt-injection attacks.
- Built a modern, responsive Single Page Application (SPA) in **React, TypeScript, and Vanilla CSS**, featuring token generation streaming effects, sliding citation drawers, and interactive RBAC persona simulation.
- Integrated an automated model evaluation and feedback loop storing user thumbs up/down ratings and knowledge gap reports in **Amazon DynamoDB**.

---

## 🎯 Format 3: For DevOps / Cloud Security Engineer

### Project Title
**Enterprise Cloud Security, Observability & Serverless Infrastructure on AWS**  
*Tech Stack: AWS IAM Least Privilege, AWS KMS, AWS WAF, CloudTrail, CloudWatch, EventBridge, SQS, CloudFormation*

### High-Impact Bullet Points
- Enforced defense-in-depth security across AWS workloads with **S3 Block Public Access, TLS 1.2+ HTTPS transport enforcement**, and KMS envelope encryption with annual key rotation.
- Configured **AWS WAF WebACLs** with IP rate limiting (100 req/5 min) and AWS Managed OWASP Top 10 rulesets, defending against DDoS and automated exploit probes.
- Designed an automated asynchronous ingestion architecture leveraging **EventBridge rules, SQS dead-letter queues (DLQ), and SNS alert topics** for automated failure notifications.
- Deployed unified operational dashboards, structured metric filters, and automated alarms in **Amazon CloudWatch** for sub-second anomaly detection.
