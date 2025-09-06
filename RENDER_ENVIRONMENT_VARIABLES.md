# Render Production Environment Variables for SIRTIS
# These need to be configured in Render's Environment Variables section

# Database Configuration - Use Supabase direct connection
DATABASE_URL=postgres://postgres.yuwwqupyqpmkbqzvqiee:8FNI4OdtFINUw2GL@aws-0-us-east-1.compute.amazonaws.com:5432/postgres?sslmode=require
DIRECT_URL=postgres://postgres.yuwwqupyqpmkbqzvqiee:8FNI4OdtFINUw2GL@aws-0-us-east-1.compute.amazonaws.com:5432/postgres?sslmode=require

# Authentication
NEXTAUTH_SECRET=6a1f9c25c069957affc22548e3fb186f86caf4dc8005f1148a18b1d9fa912744
NEXTAUTH_URL=https://sirtis-saywhat.onrender.com

# OpenAI Configuration (if needed)
OPENAI_API_KEY=your_openai_api_key_here

# AWS Configuration (if needed for S3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name

# Nodemailer Configuration (if needed)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your_email@saywhat.org
SMTP_PASS=your_email_password

# Important: Configure these variables in Render Dashboard:
# 1. Go to https://dashboard.render.com
# 2. Select your service
# 3. Go to Environment tab
# 4. Add each variable above
