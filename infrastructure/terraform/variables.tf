variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "Primary AWS region for deployment"
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "Target deployment stage (dev, staging, prod)"
}

variable "bedrock_knowledge_base_id" {
  type        = string
  default     = "NEXORAKB01"
  description = "ID of the Amazon Bedrock Knowledge Base"
}

variable "project_name" {
  type        = string
  default     = "EnterpriseIQ"
  description = "Project identifier for resource tagging"
}
