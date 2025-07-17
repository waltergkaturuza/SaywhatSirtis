# SIRTIS Deployment Configurations

## AWS Deployment Architecture

### Infrastructure Components:
- **EC2**: Application hosting
- **RDS PostgreSQL**: Production database
- **S3**: Document/file storage
- **CloudFront**: CDN for static assets
- **Route 53**: DNS management
- **ALB**: Load balancer

### Deployment Options:

#### Option 1: AWS Amplify (Recommended)
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify project
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### Option 2: Docker + EC2
```bash
# Build and deploy using Docker
docker build -t sirtis .
docker run -p 3000:3000 sirtis
```

#### Option 3: Vercel (Quick Deploy)
```bash
npm install -g vercel
vercel --prod
```

## Environment Configuration

### Production Database (AWS RDS)
- **Engine**: PostgreSQL 15
- **Instance**: db.t3.micro (for development)
- **Database Name**: sirtis_production

### Required AWS Services:
1. RDS PostgreSQL instance
2. S3 bucket for file storage
3. SES for email notifications
4. CloudWatch for monitoring
