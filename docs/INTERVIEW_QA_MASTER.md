# EnterpriseIQ: Master Technical Interview Questions & In-Depth Model Answers

This comprehensive guide prepares you to confidently explain and defend every architectural decision, AWS service, and security control implemented in the **EnterpriseIQ** platform during senior technical interviews.

---

## 📑 Domain Index
1. [Amazon Bedrock & Generative AI](#1-amazon-bedrock--generative-ai)
2. [Retrieval-Augmented Generation (RAG) & Vector Search](#2-retrieval-augmented-generation-rag--vector-search)
3. [AWS Serverless Compute (Lambda & API Gateway)](#3-aws-serverless-compute-lambda--api-gateway)
4. [Identity, Authentication & RBAC (Amazon Cognito)](#4-identity-authentication--rbac-amazon-cognito)
5. [Storage, Databases & Caching (Amazon S3 & DynamoDB)](#5-storage-databases--caching-amazon-s3--dynamodb)
6. [Security, Cryptography & Edge Protection (KMS & WAF)](#6-security-cryptography--edge-protection-kms--waf)
7. [Asynchronous Processing & Event-Driven Architecture (EventBridge, SQS, SNS)](#7-asynchronous-processing--event-driven-architecture)
8. [Observability, Auditing & Governance (CloudWatch & CloudTrail)](#8-observability-auditing--governance-cloudwatch--cloudtrail)
9. [Cost Optimization & High Scalability](#9-cost-optimization--high-scalability)

---

## 1. Amazon Bedrock & Generative AI

### Q1.1: Why did you choose Amazon Bedrock over deploying self-hosted open-source LLMs (e.g., Llama 3 on EC2/EKS)?
> **Model Answer:**
> "Self-hosting large models requires provisioning dedicated GPU instances (e.g., `p4d.24xlarge` or `g5.12xlarge`), managing vLLM/TGI inference engines, implementing auto-scaling policies based on request concurrency, and paying for continuous idle GPU hours.
>
> In contrast, **Amazon Bedrock is a fully managed serverless API**. We pay strictly per input and output token consumed with zero idle compute costs. Furthermore, Bedrock provides native enterprise integrations: IAM execution roles for fine-grained authorization, AWS KMS customer-managed key encryption for prompts and embeddings, and built-in Bedrock Guardrails for automated PII masking and prompt-injection defense."

### Q1.2: Why did you select Anthropic Claude 3.5 Sonnet as the primary foundation model?
> **Model Answer:**
> "Claude 3.5 Sonnet offers industry-leading benchmark performance in complex reasoning, structured JSON output generation, and document comprehension with a 200,000-token context window. For enterprise policy and runbook retrieval, its low hallucination rate and strict adherence to system prompt constraints make it significantly superior for factual question answering compared to generic foundation models."

### Q1.3: How does Amazon Titan Text Embeddings V2 work, and why 1024 dimensions?
> **Model Answer:**
> "Amazon Titan Text Embeddings V2 supports configurable output vector dimensions (256, 512, or 1024). We chose **1024 dimensions with normalization enabled**. 1024 dimensions capture fine-grained semantic nuances in technical runbooks, legal leave policies, and financial SOPs, while normalized unit-length vectors allow our vector engine (OpenSearch Serverless) to compute cosine similarity using high-speed dot products ($A \cdot B$) without recalculating vector magnitudes at query time."

---

## 2. Retrieval-Augmented Generation (RAG) & Vector Search

### Q2.1: Walk me through the exact RAG request lifecycle in your project.
> **Model Answer:**
> 1. **Authentication:** The employee signs in via Cognito; their JWT token contains `custom:department = "Engineering"`.
> 2. **Pre-Filtering:** Lambda constructs a pre-retrieval metadata filter: `{"orAll": [{"equals": {"key": "department", "value": "Engineering"}}, {"equals": {"key": "classification", "value": "PUBLIC_INTERNAL"}}]}`.
> 3. **Vector Similarity Search:** Bedrock Knowledge Bases queries OpenSearch Serverless, generating a query embedding via Titan V2 and retrieving the top-K chunks matching both vector similarity AND the metadata filter.
> 4. **Grounded Prompt Construction:** The retrieved text chunks are wrapped inside XML tags (`<context><document_chunk>...</document_chunk></context>`) and passed to Claude 3.5 Sonnet with a temperature of 0.1.
> 5. **Citation Return:** The LLM generates the answer, and the Lambda response formats the exact S3 object URI, document ID, page number, and similarity score for frontend display.

### Q2.2: What is chunking, and what chunking strategy did you implement?
> **Model Answer:**
> "Chunking splits large documents into discrete semantic segments so the embedding model can capture localized meaning and fit within token limits. We implemented **Semantic Chunking with 500 tokens per chunk and a 20% overlap (100 tokens)**. The 100-token overlap ensures that critical sentences spanning chunk boundaries are not truncated, maintaining contextual continuity across adjacent chunks."

### Q2.3: How do you prevent the AI from hallucinating when no relevant document exists?
> **Model Answer:**
> "We implement a **two-tier anti-hallucination defense**:
> 1. **Confidence Score Thresholding:** If vector retrieval returns 0 chunks or if the top similarity score is below our minimum threshold (`0.72`), Lambda intercepts the request and returns a deterministic fallback message without invoking the LLM, saving token costs.
> 2. **Strict System Prompt Constraints:** Claude's system prompt instructs: *'Use ONLY the facts in the provided `<context>` block. If the answer cannot be verified from the context, state that you cannot find authorized company documentation.'*"

---

## 3. AWS Serverless Compute (Lambda & API Gateway)

### Q3.1: Why did you use modular single-purpose Lambda functions instead of a single 'Fat Lambda'?
> **Model Answer:**
> "Using single-purpose functions (`QueryFunction`, `DocsFunction`, `AdminFunction`, `IngestionWorker`) follows the **Single Responsibility Principle** and enforces **Least Privilege IAM**.
> - `DocsFunction` only needs S3 and DynamoDB access; it has zero permission to call `bedrock:InvokeModel`.
> - `AdminFunction` is isolated to admin routes, minimizing the attack surface.
> - Smaller deployment packages eliminate cold-start overhead and allow independent concurrency scaling without resource contention."

### Q3.2: Why did you configure Lambda on AWS Graviton2 (ARM64)?
> **Model Answer:**
> "AWS Graviton2 processors provide up to **19% better performance** and **20% lower cost per millisecond** compared to x86_64 architecture for Python serverless runtimes. For high-volume query and vector processing workloads, ARM64 delivers measurable operational cost reductions."

### Q3.3: How do you handle API Gateway 29-second timeout limits for long AI operations?
> **Model Answer:**
> "Amazon API Gateway has an immutable integration timeout limit of 29 seconds. We mitigate this through:
> 1. Restricting LLM max tokens to 768 tokens and setting Bedrock API timeout to 10 seconds.
> 2. Offloading heavy, long-running operations (like PDF parsing and batch vectorization) to an asynchronous **EventBridge $\rightarrow$ SQS $\rightarrow$ Lambda Worker pipeline**, returning an immediate HTTP 202 Accepted response to the client."

---

## 4. Identity, Authentication & RBAC (Amazon Cognito)

### Q4.1: How does Amazon Cognito enforce Role-Based Access Control (RBAC)?
> **Model Answer:**
> "We configured Cognito User Pool Groups (`Engineering-Members`, `HR-Specialists`, `Finance-Analysts`, `Global-Administrators`) and custom user attributes (`custom:department`, `custom:clearance`).
> When a user authenticates, Cognito issues a signed JWT Access/ID Token containing these claims. The API Gateway Cognito Authorizer cryptographically validates the token against Cognito's JWKS URI, and the Lambda backend extracts the claims from `requestContext.authorizer.claims` to enforce access control."

### Q4.2: What is the difference between an ID Token, Access Token, and Refresh Token?
> **Model Answer:**
> - **ID Token:** An OIDC token containing user profile claims (`email`, `name`, `custom:department`) intended for frontend UI consumption.
> - **Access Token:** An OAuth 2.0 token containing authorization scopes and group memberships used to authorize API Gateway endpoint requests.
> - **Refresh Token:** A long-lived token (e.g. 30 days) stored securely to obtain new short-lived access/ID tokens without prompting the user to re-enter credentials."

---

## 5. Storage, Databases & Caching (Amazon S3 & DynamoDB)

### Q5.1: Explain your DynamoDB Single-Table Design.
> **Model Answer:**
> "Instead of creating separate tables for chat history, feedback, documents, and audit logs, we use a single table (`EnterpriseIQ-Core-State-prod`) with generic Partition Keys (`PK`) and Sort Keys (`SK`), along with a Global Secondary Index (`GSI1PK`, `GSI1SK`).
> - **Chat Messages:** `PK: SESSION#<sessionId>`, `SK: MSG#<timestamp>`
> - **Feedback:** `PK: FEEDBACK#<messageId>`, `SK: USER#<email>`, `GSI1PK: RATING#helpful`
> - **Audit Events:** `PK: AUDIT#<YYYY-MM-DD>`, `SK: TIMESTAMP#<time>#<id>`
>
> This enables multi-entity transactions, reduces DynamoDB provisioning overhead, and allows querying related items in a single round-trip."

### Q5.2: How is Amazon S3 configured for enterprise compliance?
> **Model Answer:**
> 1. **Block Public Access:** All 4 public access block settings are set to `true`.
> 2. **KMS CMK Encryption:** `ServerSideEncryptionByDefault` enforces `aws:kms` with a Customer Managed Key.
> 3. **Secure Transport:** Bucket policy explicitly denies any non-HTTPS (`aws:SecureTransport: false`) requests.
> 4. **Versioning & Lifecycle:** S3 Versioning protects against accidental deletes, while lifecycle rules transition non-current objects to Glacier after 90 days."

---

## 6. Security, Cryptography & Edge Protection (KMS & WAF)

### Q6.1: What is Envelope Encryption, and how is it used here?
> **Model Answer:**
> "Envelope encryption protects data with a **Data Encryption Key (DEK)**, and encrypts the DEK with a **Customer Master Key (CMK)** managed in AWS KMS.
> When S3 stores an enterprise document:
> 1. S3 requests a plaintext DEK and ciphertext DEK from KMS via `kms:GenerateDataKey`.
> 2. S3 encrypts the document in memory using the plaintext DEK.
> 3. S3 writes the encrypted document and the encrypted DEK to disk, immediately purging the plaintext DEK from memory.
>
> This reduces KMS API calls and ensures keys are never transmitted over the network in plaintext."

### Q6.2: How does AWS WAF protect the GenAI platform?
> **Model Answer:**
> "AWS WAF is deployed on the CloudFront distribution and API Gateway with three rule groups:
> 1. **IP Rate Limiting:** Restricts individual IP addresses to 100 requests per 5 minutes to prevent Denial-of-Wallet attacks.
> 2. **AWS Managed Common Rule Set:** Blocks OWASP Top 10 vulnerabilities (SQLi, XSS, Path Traversal).
> 3. **Known Bad Inputs Rule Set:** Blocks malicious automated bot scanners and exploit payloads."

---

## 7. Asynchronous Processing & Event-Driven Architecture

### Q7.1: Why did you implement an EventBridge $\rightarrow$ SQS $\rightarrow$ Lambda pipeline for document ingestion?
> **Model Answer:**
> "Synchronous document ingestion blocks the client, risks API Gateway 29-second timeouts on large files, and cannot handle sudden bursts of 500+ document uploads.
> By configuring S3 Event Notifications to send `ObjectCreated` events to Amazon EventBridge, EventBridge routes events to an SQS queue. SQS acts as a **shock absorber** that buffers ingestion jobs, while Lambda processes documents in controlled micro-batches with automatic exponential backoff retry and a Dead-Letter Queue (DLQ)."

---

## 8. Observability, Auditing & Governance (CloudWatch & CloudTrail)

### Q8.1: What is the architectural difference between Amazon CloudWatch and AWS CloudTrail?
> **Model Answer:**
> - **Amazon CloudWatch:** Focuses on **Application & Infrastructure Observability** (Lambda execution logs, structured JSON application events, latency percentiles, p95 Bedrock response duration, and operational alarms).
> - **AWS CloudTrail:** Focuses on **Governance & AWS API Auditing** (records *who* made *which* API call to AWS services—e.g. who created an IAM role, who deleted an S3 bucket, or who invoked a Bedrock model—with caller IAM ARN and IP address)."

---

## 9. Cost Optimization & High Scalability

### Q9.1: How do you scale this architecture from 500 to 50,000 employees without architectural changes?
> **Model Answer:**
> 1. **Compute:** Lambda scales automatically to thousands of concurrent executions; API Gateway scales horizontally up to 10,000 RPS.
> 2. **Storage:** S3 handles 3,500 PUT and 5,500 GET requests per second per prefix automatically.
> 3. **Database:** DynamoDB On-Demand handles sudden traffic spikes instantaneously without capacity pre-provisioning.
> 4. **Caching:** CloudFront caches static SPA assets at edge locations, offloading 95%+ of traffic from S3."

### Q9.2: How do you prevent unexpected high bills on personal AWS accounts?
> **Model Answer:**
> "We implement:
> 1. **AWS Budgets Alert:** Configured to trigger email notifications at $10.00 and $25.00 thresholds.
> 2. **Serverless On-Demand:** DynamoDB and Lambda run on 100% pay-per-request pricing, incurring zero cost when idle.
> 3. **Token Capping:** Claude output tokens are capped at 768 tokens, preventing runaway token billing.
> 4. **Teardown Automation:** A single-command teardown script destroys billable OpenSearch Serverless vector indices when testing is complete."
