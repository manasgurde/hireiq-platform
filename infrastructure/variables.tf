variable "aws_region" {
  description = "The AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (e.g., dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "hireiq"
}

variable "db_username" {
  description = "Database administrator username"
  type        = string
  default     = "hireiq_admin"
}

# The actual DB password should be set via environment variable: TF_VAR_db_password
variable "db_password" {
  description = "Database administrator password (must be provided securely)"
  type        = string
  sensitive   = true
}
