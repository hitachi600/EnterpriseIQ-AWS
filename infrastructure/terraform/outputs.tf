output "s3_document_vault_id" {
  value       = aws_s3_bucket.document_vault.id
  description = "Name of S3 Document Vault"
}

output "dynamodb_table_name" {
  value       = aws_dynamodb_table.core_state.name
  description = "Name of DynamoDB State Store"
}

output "lambda_role_arn" {
  value       = aws_iam_role.lambda_exec_role.arn
  description = "ARN of Lambda Execution Role"
}
