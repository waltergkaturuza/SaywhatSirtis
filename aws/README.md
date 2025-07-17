# AWS Infrastructure for SIRTIS

## Architecture Overview
- **EC2**: Application hosting (t3.medium or t3.large)
- **RDS**: PostgreSQL database (db.t3.micro for dev, db.t3.small+ for prod)
- **S3**: Document storage and static assets
- **CloudFront**: CDN for global distribution
- **ELB**: Load balancer for high availability
- **Route 53**: DNS management

## Deployment Options

### Option 1: Manual AWS Setup
1. Create EC2 instance (Ubuntu 22.04 LTS)
2. Setup RDS PostgreSQL database
3. Configure S3 bucket for file storage
4. Setup CloudFront distribution
5. Configure security groups and IAM roles

### Option 2: AWS CDK (Recommended)
```bash
npm install -g aws-cdk
cdk init app --language typescript
cdk deploy
```

### Option 3: Docker + ECS
```bash
docker build -t sirtis .
# Push to ECR and deploy to ECS
```

## Environment Variables for AWS
```bash
# Production Database
DATABASE_URL="postgresql://username:password@sirtis-db.cluster-xxx.us-east-1.rds.amazonaws.com:5432/sirtis_production"

# S3 Configuration
AWS_S3_BUCKET="sirtis-production-documents"
AWS_REGION="us-east-1"

# Domain
NEXTAUTH_URL="https://sirtis.saywhat.org"
```

## Security Considerations
- Use IAM roles instead of access keys where possible
- Enable RDS encryption at rest
- Configure VPC with private subnets for database
- Use AWS Secrets Manager for sensitive data
- Enable CloudTrail for audit logging
