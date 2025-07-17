# SIRTIS Deployment Guide for AWS Account 388163694401

## 🏗️ Infrastructure Setup

### Account Details:
- **AWS Account ID**: 388163694401
- **Service Provider**: Amazon Web Services EMEA SARL
- **Account Name**: codestech
- **Recommended Region**: eu-west-1 (Ireland)

### 📋 Pre-Deployment Checklist:

1. **AWS CLI Configuration**:
   ```bash
   aws configure
   # Enter your AWS credentials for account 388163694401
   ```

2. **Create IAM User for Deployment**:
   - User name: `sirtis-deployer`
   - Permissions: EC2, RDS, S3, ECS, ECR, IAM (limited)

3. **Domain Setup**:
   - Register domain for SIRTIS (e.g., `sirtis.saywhat.org`)
   - Configure Route 53 hosted zone

### 🚀 Deployment Options:

#### Option 1: Terraform (Recommended)
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

#### Option 2: AWS CDK
```bash
npm install -g aws-cdk
cdk init app --language typescript
cdk deploy
```

#### Option 3: Manual Setup via AWS Console
1. Create RDS PostgreSQL instance in eu-west-1
2. Set up ECS cluster
3. Configure ALB and target groups
4. Create S3 bucket for documents

### 💰 Estimated Monthly Costs (EU-West-1):
- **RDS db.t3.micro**: ~$15-20/month
- **ECS Fargate**: ~$10-30/month (depending on usage)
- **S3 Storage**: ~$1-5/month
- **ALB**: ~$20/month
- **Total**: ~$46-75/month

### 🔐 Security Configuration:
- Enable CloudTrail for audit logging
- Configure VPC with private subnets
- Set up security groups with minimal access
- Enable encryption at rest for RDS and S3

### 📊 Monitoring:
- CloudWatch for application metrics
- CloudWatch Logs for application logs
- AWS X-Ray for distributed tracing

### 🗄️ Database Configuration:
- **Engine**: PostgreSQL 15.4
- **Instance**: db.t3.micro (can scale up)
- **Storage**: 20GB (auto-scaling to 100GB)
- **Backup**: 7-day retention
