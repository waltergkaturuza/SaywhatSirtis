# AWS Infrastructure Configuration for SIRTIS
# Account: 388163694401 (codestech)
# Region: eu-west-1 (Ireland) - Recommended for Zimbabwe/EMEA

# Terraform Configuration
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region              = var.aws_region
  allowed_account_ids = ["388163694401"]
}

# Variables
variable "aws_region" {
  description = "AWS region for SIRTIS deployment"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "sirtis"
}

# VPC Configuration
resource "aws_vpc" "sirtis_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-vpc"
    Environment = var.environment
    Project     = "SIRTIS"
  }
}

# RDS PostgreSQL Database
resource "aws_db_instance" "sirtis_db" {
  identifier                = "${var.project_name}-database"
  engine                   = "postgres"
  engine_version           = "15.4"
  instance_class           = "db.t3.micro"
  allocated_storage        = 20
  max_allocated_storage    = 100
  
  db_name  = "sirtis_production"
  username = "sirtis_admin"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.sirtis.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Sun:04:00-Sun:05:00"
  
  skip_final_snapshot = true
  deletion_protection = false

  tags = {
    Name        = "${var.project_name}-database"
    Environment = var.environment
  }
}

# S3 Bucket for Document Storage
resource "aws_s3_bucket" "sirtis_documents" {
  bucket = "${var.project_name}-documents-${random_string.bucket_suffix.result}"

  tags = {
    Name        = "${var.project_name}-documents"
    Environment = var.environment
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# ECS Cluster for Application
resource "aws_ecs_cluster" "sirtis_cluster" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.project_name}-cluster"
    Environment = var.environment
  }
}
