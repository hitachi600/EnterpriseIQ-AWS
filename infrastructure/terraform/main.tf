terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ------------------------------------------------------------------------------
# 1. S3 Document Vault with KMS Encryption & Block Public Access
# ------------------------------------------------------------------------------
resource "aws_s3_bucket" "document_vault" {
  bucket        = "nexora-enterprise-kb-vault-${var.environment}"
  force_destroy = var.environment == "dev" ? true : false
}

resource "aws_s3_bucket_versioning" "vault_versioning" {
  bucket = aws_s3_bucket.document_vault.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "vault_encryption" {
  bucket = aws_s3_bucket.document_vault.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "vault_public_block" {
  bucket = aws_s3_bucket.document_vault.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ------------------------------------------------------------------------------
# 2. DynamoDB Single-Table State Store with Point-in-Time Recovery
# ------------------------------------------------------------------------------
resource "aws_dynamodb_table" "core_state" {
  name         = "${var.project_name}-Core-State-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI1-Department-Index"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}

# ------------------------------------------------------------------------------
# 3. AWS SSM Parameter Store Definitions for Dynamic Config & Secrets
# ------------------------------------------------------------------------------
resource "aws_ssm_parameter" "bedrock_primary_model" {
  name  = "/enterpriseiq/bedrock/primary_model"
  type  = "String"
  value = "anthropic.claude-3-5-sonnet-20240620-v1:0"
}

resource "aws_ssm_parameter" "s3_vault_bucket" {
  name  = "/enterpriseiq/s3/vault_bucket"
  type  = "String"
  value = aws_s3_bucket.document_vault.id
}

resource "aws_ssm_parameter" "dynamodb_table_name" {
  name  = "/enterpriseiq/dynamodb/table_name"
  type  = "String"
  value = aws_dynamodb_table.core_state.name
}

# ------------------------------------------------------------------------------
# 4. IAM Execution Role for Lambda Microservices (Least Privilege)
# ------------------------------------------------------------------------------
resource "aws_iam_role" "lambda_exec_role" {
  name = "${var.project_name}-Lambda-Role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_permissions" {
  name = "${var.project_name}-Lambda-Policy-${var.environment}"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:log-group:/aws/lambda/EnterpriseIQ-*"
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:ApplyGuardrail",
          "bedrock:Retrieve"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.core_state.arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.document_vault.arn,
          "${aws_s3_bucket.document_vault.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = "arn:aws:ssm:*:*:parameter/enterpriseiq/*"
      }
    ]
  })
}
