# SIRTIS (SAYWHAT Integrated Real-Time Information System) - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a comprehensive AI-powered enterprise platform for SAYWHAT organization with the following key characteristics:

## Technology Stack
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, App Router
- **Backend**: Node.js with Express.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with multi-factor authentication
- **Real-time**: Socket.io for real-time updates
- **AI Integration**: OpenAI API for chatbot functionality
- **File Storage**: AWS S3 or Azure Blob Storage
- **Email**: Nodemailer with Office 365 integration

## Architecture Principles
- Use role-based access control (RBAC) for all features
- Implement offline-first capabilities where possible
- Follow security best practices with AES-256 encryption
- Use Progressive Web App (PWA) standards
- Ensure WCAG 2.1 accessibility compliance
- Implement comprehensive audit trails

## Code Style Guidelines
- Use TypeScript strictly with proper type definitions
- Follow Next.js 15 App Router patterns
- Use Tailwind CSS for styling with consistent design system
- Implement proper error handling and validation
- Use React Query for data fetching and caching
- Follow atomic design principles for components

## Key Modules to Implement
1. **Authentication & Authorization**: Biometric login, MFA, RBAC
2. **Dashboard**: Real-time analytics, predictive insights
3. **Programs Management**: Project tracking, GIS mapping, KPI monitoring
4. **Call Centre**: Voice transcription, sentiment analysis, case management
5. **HR Management**: Employee self-service, performance tracking
6. **Inventory Management**: RFID tracking, asset management
7. **Document Repository**: AI-powered document management
8. **AI Chatbot**: Context-aware assistance across all modules

## Security Requirements
- Implement AES-256 encryption for sensitive data
- Use secure session management
- Implement comprehensive audit logging
- Follow OWASP security guidelines
- Implement rate limiting and DDoS protection

## Integration Requirements
- Office 365 and SharePoint integration
- Email notifications system
- Real-time synchronization across modules
- API-first design for future integrations

## Performance Requirements
- Optimize for fast loading times
- Implement proper caching strategies
- Use lazy loading for large datasets
- Implement efficient database queries

When generating code, prioritize security, scalability, and maintainability. Always include proper error handling, loading states, and user feedback mechanisms.
