# Environment Variables for SIRTIS Deployment

This document lists all required environment variables for deploying SIRTIS to Render.

## Required Environment Variables

### Database Configuration
- `DATABASE_URL` - PostgreSQL connection string (Primary database URL)
- `DIRECT_URL` - Direct PostgreSQL connection string (for migrations)

### Authentication
- `NEXTAUTH_SECRET` - Secret key for NextAuth.js sessions (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your application URL (e.g., `https://your-app.onrender.com`)

### Node Environment
- `NODE_ENV` - Set to `production` for production deployments
- `PORT` - Port number (Render sets this automatically, default: 10000)

### Optional Services
- `OPENAI_API_KEY` - OpenAI API key for AI features (optional)
- `REDIS_HOST` - Redis host for caching (optional)
- `REDIS_PORT` - Redis port (optional, default: 6379)
- `REDIS_PASSWORD` - Redis password (optional)
- `REDIS_DB` - Redis database number (optional, default: 0)

## Setting Environment Variables on Render

1. Go to your Render Dashboard
2. Select your web service
3. Go to "Environment" tab
4. Add each environment variable with its value

### Critical Variables for Render Deployment:

```bash
# Required for database connection
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
DIRECT_URL=postgresql://username:password@host:port/database?sslmode=require

# Required for authentication
NEXTAUTH_SECRET=your-generated-secret-key
NEXTAUTH_URL=https://your-app-name.onrender.com

# Required for proper deployment
NODE_ENV=production

# Optional but recommended
OPENAI_API_KEY=your-openai-api-key
```

## Troubleshooting Environment Issues

1. **Database Connection Issues**: Ensure both `DATABASE_URL` and `DIRECT_URL` are set correctly
2. **Authentication Issues**: Verify `NEXTAUTH_SECRET` is set and `NEXTAUTH_URL` matches your deployed URL
3. **Build Issues**: Ensure `NODE_ENV=production` is set for production builds

## Render-Specific Considerations

- Render automatically sets the `PORT` environment variable
- Render automatically sets the `RENDER` environment variable to indicate the platform
- Use connection pooling for database connections in production
- Ensure SSL is enabled for database connections (`sslmode=require`)