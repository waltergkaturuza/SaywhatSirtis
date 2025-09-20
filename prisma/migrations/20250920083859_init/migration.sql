-- CreateEnum
CREATE TYPE "public"."ActivityStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."AssetCategory" AS ENUM ('COMPUTER', 'FURNITURE', 'VEHICLE', 'EQUIPMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AssetCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "public"."AssetStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'DISPOSED', 'LOST');

-- CreateEnum
CREATE TYPE "public"."AuditLogSeverity" AS ENUM ('LOW', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."CallDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "public"."CallPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."CallStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED', 'SPAM');

-- CreateEnum
CREATE TYPE "public"."CallType" AS ENUM ('INQUIRY', 'COMPLAINT', 'REQUEST', 'EMERGENCY', 'FEEDBACK', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DocumentApprovalStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'UNDER_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "public"."DocumentAuditAction" AS ENUM ('CREATED', 'VIEWED', 'DOWNLOADED', 'EDITED', 'DELETED', 'RESTORED', 'SHARED', 'UNSHARED', 'FAVORITED', 'UNFAVORITED', 'COMMENTED', 'CHECKED_OUT', 'CHECKED_IN', 'APPROVED', 'REJECTED', 'CLASSIFIED', 'PERMISSIONS_CHANGED', 'MOVED', 'COPIED', 'ARCHIVED', 'UNARCHIVED');

-- CreateEnum
CREATE TYPE "public"."DocumentCategory" AS ENUM ('POLICY', 'PROCEDURE', 'FORM', 'REPORT', 'CONTRACT', 'INVOICE', 'PRESENTATION', 'SPREADSHEET', 'IMAGE', 'VIDEO', 'AUDIO', 'ARCHIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DocumentClassification" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET');

-- CreateEnum
CREATE TYPE "public"."DocumentPermissionType" AS ENUM ('VIEW', 'COMMENT', 'EDIT', 'DOWNLOAD', 'SHARE', 'DELETE', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."DocumentReviewStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REQUIRES_CHANGES', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."DocumentWorkflowTaskType" AS ENUM ('REVIEW', 'APPROVE', 'EDIT', 'TRANSLATE', 'DESIGN', 'LEGAL_REVIEW', 'COMPLIANCE_CHECK', 'PUBLISH');

-- CreateEnum
CREATE TYPE "public"."EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "public"."MitigationStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'PERFORMANCE_PLAN', 'APPRAISAL', 'TRAINING', 'DEADLINE', 'ESCALATION', 'APPROVAL', 'EMERGENCY_LEAVE', 'LEAVE_EXTENSION', 'MEDICAL_LEAVE');

-- CreateEnum
CREATE TYPE "public"."ProjectPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."QualificationType" AS ENUM ('EDUCATION', 'CERTIFICATION', 'SKILL', 'TRAINING', 'LICENSE', 'AWARD');

-- CreateEnum
CREATE TYPE "public"."RiskCategory" AS ENUM ('OPERATIONAL', 'STRATEGIC', 'FINANCIAL', 'COMPLIANCE', 'REPUTATIONAL', 'ENVIRONMENTAL', 'CYBERSECURITY', 'HR_PERSONNEL');

-- CreateEnum
CREATE TYPE "public"."RiskImpact" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."RiskProbability" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."RiskStatus" AS ENUM ('OPEN', 'MITIGATED', 'ESCALATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER', 'CALL_CENTRE_AGENT', 'EMPLOYEE', 'USER', 'SUPERUSER', 'BASIC_USER_1', 'BASIC_USER_2', 'ADVANCE_USER_1', 'ADVANCE_USER_2', 'HR', 'SYSTEM_ADMINISTRATOR');

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asset_audits" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "auditDate" TIMESTAMP(3) NOT NULL,
    "condition" TEXT NOT NULL,
    "notes" TEXT,
    "auditedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assets" (
    "id" TEXT NOT NULL,
    "assetTag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "location" TEXT,
    "condition" "public"."AssetCondition" NOT NULL DEFAULT 'GOOD',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "warrantyExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."batch_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentIds" TEXT[],
    "analysisType" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."call_records" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "callNumber" TEXT,
    "officerName" TEXT,
    "callerName" TEXT NOT NULL,
    "callerPhone" TEXT,
    "callerEmail" TEXT,
    "callerAge" TEXT,
    "callerGender" TEXT,
    "callerKeyPopulation" TEXT,
    "callerProvince" TEXT,
    "callerAddress" TEXT,
    "callType" TEXT DEFAULT 'INBOUND',
    "modeOfCommunication" TEXT,
    "howDidYouHearAboutUs" TEXT,
    "callValidity" TEXT DEFAULT 'valid',
    "newOrRepeatCall" TEXT DEFAULT 'new',
    "language" TEXT DEFAULT 'English',
    "callDescription" TEXT,
    "purpose" TEXT DEFAULT 'HIV/AIDS',
    "isCase" TEXT DEFAULT 'NO',
    "clientName" TEXT,
    "clientAge" TEXT,
    "clientSex" TEXT,
    "clientAddress" TEXT,
    "clientProvince" TEXT,
    "perpetrator" TEXT,
    "servicesRecommended" TEXT,
    "referral" TEXT,
    "voucherIssued" TEXT DEFAULT 'NO',
    "voucherValue" TEXT,
    "comment" TEXT,
    "category" TEXT DEFAULT 'INQUIRY',
    "priority" TEXT DEFAULT 'MEDIUM',
    "status" TEXT DEFAULT 'OPEN',
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "assignedOfficer" TEXT,
    "summary" TEXT,
    "notes" TEXT,
    "resolution" TEXT,
    "satisfactionRating" INTEGER,
    "callStartTime" TIMESTAMP(3),
    "callEndTime" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "district" TEXT,
    "ward" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "budget" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT,
    "location" TEXT,
    "manager" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "parentId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."development_plans" (
    "id" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "development_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_activities" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_analysis" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "sentiment" JSONB NOT NULL,
    "readability" JSONB NOT NULL,
    "quality" JSONB NOT NULL,
    "keyPhrases" TEXT[],
    "summary" TEXT,
    "topics" TEXT[],
    "language" TEXT,
    "wordCount" INTEGER,
    "estimatedReadingTime" INTEGER,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analyzedBy" TEXT,

    CONSTRAINT "document_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_audit_logs" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT,
    "action" "public"."DocumentAuditAction" NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_classification_ai" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "tags" TEXT[],
    "securityLevel" TEXT,
    "reasons" TEXT[],
    "suggestedActions" TEXT[],
    "classifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classifiedBy" TEXT,

    CONSTRAINT "document_classification_ai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_comments" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_content" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "document_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_favorites" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "path" TEXT NOT NULL,
    "parentId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "department" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_permissions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT,
    "folderId" TEXT,
    "userId" TEXT,
    "userEmail" TEXT,
    "groupId" TEXT,
    "permission" "public"."DocumentPermissionType" NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isInherited" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "document_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_shares" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "sharedBy" TEXT NOT NULL,
    "sharedWith" TEXT,
    "sharedWithEmail" TEXT,
    "permission" "public"."DocumentPermissionType" NOT NULL,
    "shareToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "template" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_workflow_tasks" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "taskType" "public"."DocumentWorkflowTaskType" NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "public"."TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_workflow_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "category" "public"."DocumentCategory",
    "description" TEXT,
    "summary" TEXT,
    "extractedText" TEXT,
    "ocrText" TEXT,
    "searchKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" TEXT NOT NULL DEFAULT '1.0',
    "versionComment" TEXT,
    "isLatestVersion" BOOLEAN NOT NULL DEFAULT true,
    "parentDocumentId" TEXT,
    "classification" "public"."DocumentClassification" NOT NULL DEFAULT 'PUBLIC',
    "accessLevel" TEXT NOT NULL DEFAULT 'internal',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isCheckedOut" BOOLEAN NOT NULL DEFAULT false,
    "checkedOutBy" TEXT,
    "checkedOutAt" TIMESTAMP(3),
    "lockExpiresAt" TIMESTAMP(3),
    "author" TEXT,
    "department" TEXT,
    "departmentId" TEXT,
    "projectId" TEXT,
    "customMetadata" JSONB,
    "approvalStatus" "public"."DocumentApprovalStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "reviewStatus" "public"."DocumentReviewStatus" NOT NULL DEFAULT 'PENDING',
    "sentimentScore" DOUBLE PRECISION,
    "readabilityScore" DOUBLE PRECISION,
    "qualityScore" DOUBLE PRECISION,
    "keyPhrases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiSummary" TEXT,
    "uploadedBy" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "lastAccessedBy" TEXT,
    "retentionPeriod" INTEGER,
    "archiveDate" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."employees" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "nationality" TEXT,
    "nationalId" TEXT,
    "passportNumber" TEXT,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "alternativePhone" TEXT,
    "personalEmail" TEXT,
    "alternativeEmail" TEXT,
    "address" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "emergencyContactAddress" TEXT,
    "emergencyContactRelationship" TEXT,
    "profilePicture" TEXT,
    "department" TEXT,
    "position" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "salary" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "supervisor_id" TEXT,
    "is_supervisor" BOOLEAN NOT NULL DEFAULT false,
    "is_reviewer" BOOLEAN NOT NULL DEFAULT false,
    "medical_aid" BOOLEAN NOT NULL DEFAULT false,
    "funeral_cover" BOOLEAN NOT NULL DEFAULT false,
    "vehicle_benefit" BOOLEAN NOT NULL DEFAULT false,
    "fuel_allowance" BOOLEAN NOT NULL DEFAULT false,
    "airtime_allowance" BOOLEAN NOT NULL DEFAULT false,
    "other_benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "archived_at" TIMESTAMP(3),
    "archive_reason" TEXT,
    "access_revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hireDate" TIMESTAMP(3),
    "departmentId" TEXT,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_registrations" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "participantEmail" TEXT NOT NULL,
    "participantPhone" TEXT,
    "organization" TEXT,
    "position" TEXT,
    "specialRequirements" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "startDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endDate" TIMESTAMP(3),
    "endTime" TEXT,
    "location" TEXT,
    "address" TEXT,
    "venue" TEXT,
    "capacity" INTEGER,
    "expectedAttendees" INTEGER,
    "actualAttendees" INTEGER,
    "agenda" JSONB,
    "objectives" JSONB,
    "speakers" JSONB,
    "budget" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requiresRegistration" BOOLEAN NOT NULL DEFAULT false,
    "registrationDeadline" TIMESTAMP(3),
    "registrationFields" JSONB,
    "partners" JSONB,
    "organizer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_descriptions" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "jobSummary" TEXT,
    "keyResponsibilities" JSONB NOT NULL,
    "essentialExperience" TEXT,
    "essentialSkills" TEXT,
    "acknowledgment" BOOLEAN NOT NULL DEFAULT false,
    "signatureFileName" TEXT,
    "signatureFileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "job_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."maintenance_records" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "description" TEXT,
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nextDueDate" TIMESTAMP(3),
    "performedBy" TEXT,
    "performedDate" TIMESTAMP(3) NOT NULL,
    "maintenanceType" TEXT NOT NULL,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "count" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_routes" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "deadline" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "notification_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_routing_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastTriggered" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "notification_routing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "employeeId" TEXT,
    "metadata" JSONB,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "recipientId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "senderId" TEXT,
    "sentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_achievements" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dateAchieved" TIMESTAMP(3) NOT NULL,
    "impact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_activities" (
    "id" TEXT NOT NULL,
    "responsibilityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_appraisals" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "appraisalType" TEXT NOT NULL,
    "overallRating" DOUBLE PRECISION,
    "selfAssessments" JSONB,
    "supervisorAssessments" JSONB,
    "valueGoalsAssessments" JSONB,
    "electronicSignature" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_appraisals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_criteria" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_feedback" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "feedbackType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_plan_comments" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "commentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_plan_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_plans" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "planYear" INTEGER NOT NULL,
    "planPeriod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewerApprovedAt" TIMESTAMP(3),
    "reviewerComments" TEXT,
    "reviewerId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "supervisorApprovedAt" TIMESTAMP(3),
    "supervisorComments" TEXT,

    CONSTRAINT "performance_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_responsibilities" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_responsibilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_responsibility_assessments" (
    "id" TEXT NOT NULL,
    "appraisalId" TEXT NOT NULL,
    "responsibilityId" TEXT NOT NULL,
    "selfRating" TEXT,
    "supervisorRating" TEXT,
    "reviewerRating" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_responsibility_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_reviews" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reviewPeriod" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "overallRating" DOUBLE PRECISION,
    "goals" JSONB,
    "feedback" TEXT,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "areasForImprovement" TEXT,
    "improvementPlan" TEXT,
    "nextSteps" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'draft',
    "reviewedAt" TIMESTAMP(3),
    "reviewerId" TEXT,
    "strengths" TEXT,
    "submittedAt" TIMESTAMP(3),
    "supervisorId" TEXT,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_value_assessments" (
    "id" TEXT NOT NULL,
    "appraisalId" TEXT NOT NULL,
    "valueType" TEXT NOT NULL,
    "valueTitle" TEXT NOT NULL,
    "selfRating" TEXT,
    "supervisorRating" TEXT,
    "reviewerRating" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_value_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objectives" JSONB,
    "timeframe" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "country" TEXT,
    "province" TEXT,
    "budget" DOUBLE PRECISION,
    "actualSpent" DOUBLE PRECISION DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "progress" INTEGER DEFAULT 0,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currency" TEXT DEFAULT 'USD',
    "creatorId" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."qualifications" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "public"."QualificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "institution" TEXT,
    "description" TEXT,
    "dateObtained" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "grade" TEXT,
    "certificateUrl" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "creditsEarned" DOUBLE PRECISION,
    "skillsGained" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."risk_assessments" (
    "id" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessorId" TEXT,
    "previousProbability" "public"."RiskProbability",
    "previousImpact" "public"."RiskImpact",
    "newProbability" "public"."RiskProbability" NOT NULL,
    "newImpact" "public"."RiskImpact" NOT NULL,
    "newRiskScore" INTEGER NOT NULL,
    "reasoning" TEXT,
    "evidence" TEXT,
    "recommendations" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "reviewedAt" TIMESTAMP(3),
    "reviewerId" TEXT,
    "reviewComments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."risk_audit_logs" (
    "id" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "description" TEXT,

    CONSTRAINT "risk_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."risk_documents" (
    "id" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "description" TEXT,
    "documentType" TEXT NOT NULL DEFAULT 'SUPPORTING',
    "uploadedById" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."risk_mitigations" (
    "id" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "controlMeasure" TEXT,
    "ownerId" TEXT,
    "deadline" TIMESTAMP(3),
    "implementationProgress" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."MitigationStatus" NOT NULL DEFAULT 'PLANNED',
    "milestones" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "risk_mitigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."risk_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "riskId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "risk_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."risks" (
    "id" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."RiskCategory" NOT NULL,
    "department" TEXT,
    "probability" "public"."RiskProbability" NOT NULL,
    "impact" "public"."RiskImpact" NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "status" "public"."RiskStatus" NOT NULL DEFAULT 'OPEN',
    "dateIdentified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAssessed" TIMESTAMP(3),
    "ownerId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."search_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "resultsCount" INTEGER NOT NULL,
    "searchTime" INTEGER NOT NULL,
    "filters" JSONB,
    "searchType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_attendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_certificates" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_enrollments" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completionDate" TIMESTAMP(3),
    "attendanceRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feedback" TEXT,
    "finalScore" DOUBLE PRECISION,
    "programId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENROLLED',

    CONSTRAINT "training_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_programs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "capacity" INTEGER,
    "instructor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "enrollmentDeadline" TIMESTAMP(3),
    "certificationAvailable" BOOLEAN NOT NULL DEFAULT false,
    "prerequisites" TEXT,
    "learningObjectives" JSONB,
    "materials" JSONB,
    "cost" DOUBLE PRECISION DEFAULT 0,
    "currency" TEXT DEFAULT 'USD',
    "location" TEXT,
    "onlineLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_sessions" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "instructor" TEXT,
    "location" TEXT,
    "onlineLink" TEXT,
    "materials" JSONB,
    "maxAttendees" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "department" TEXT,
    "position" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "firstName" TEXT,
    "lastName" TEXT,
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "phoneNumber" TEXT,
    "profileImage" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "supervisorId" TEXT,
    "employeeId" TEXT,
    "passwordHash" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "public"."accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "activities_dueDate_idx" ON "public"."activities"("dueDate");

-- CreateIndex
CREATE INDEX "activities_projectId_idx" ON "public"."activities"("projectId");

-- CreateIndex
CREATE INDEX "activities_status_idx" ON "public"."activities"("status");

-- CreateIndex
CREATE INDEX "asset_audits_assetId_idx" ON "public"."asset_audits"("assetId");

-- CreateIndex
CREATE INDEX "asset_audits_auditDate_idx" ON "public"."asset_audits"("auditDate");

-- CreateIndex
CREATE UNIQUE INDEX "assets_assetTag_key" ON "public"."assets"("assetTag");

-- CreateIndex
CREATE INDEX "assets_assetTag_idx" ON "public"."assets"("assetTag");

-- CreateIndex
CREATE INDEX "assets_category_idx" ON "public"."assets"("category");

-- CreateIndex
CREATE INDEX "assets_location_idx" ON "public"."assets"("location");

-- CreateIndex
CREATE INDEX "assets_status_idx" ON "public"."assets"("status");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "public"."audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "public"."audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "public"."audit_logs"("userId");

-- CreateIndex
CREATE INDEX "batch_analyses_createdAt_idx" ON "public"."batch_analyses"("createdAt");

-- CreateIndex
CREATE INDEX "batch_analyses_userId_idx" ON "public"."batch_analyses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "call_records_caseNumber_key" ON "public"."call_records"("caseNumber");

-- CreateIndex
CREATE INDEX "call_records_assignedOfficer_idx" ON "public"."call_records"("assignedOfficer");

-- CreateIndex
CREATE INDEX "call_records_callStartTime_idx" ON "public"."call_records"("callStartTime");

-- CreateIndex
CREATE INDEX "call_records_caseNumber_idx" ON "public"."call_records"("caseNumber");

-- CreateIndex
CREATE INDEX "call_records_category_idx" ON "public"."call_records"("category");

-- CreateIndex
CREATE INDEX "call_records_priority_idx" ON "public"."call_records"("priority");

-- CreateIndex
CREATE INDEX "call_records_status_idx" ON "public"."call_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "public"."departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "public"."departments"("code");

-- CreateIndex
CREATE INDEX "departments_level_idx" ON "public"."departments"("level");

-- CreateIndex
CREATE INDEX "departments_name_idx" ON "public"."departments"("name");

-- CreateIndex
CREATE INDEX "departments_parentId_idx" ON "public"."departments"("parentId");

-- CreateIndex
CREATE INDEX "departments_status_idx" ON "public"."departments"("status");

-- CreateIndex
CREATE INDEX "development_plans_status_idx" ON "public"."development_plans"("status");

-- CreateIndex
CREATE INDEX "development_plans_targetDate_idx" ON "public"."development_plans"("targetDate");

-- CreateIndex
CREATE INDEX "document_activities_action_idx" ON "public"."document_activities"("action");

-- CreateIndex
CREATE INDEX "document_activities_createdAt_idx" ON "public"."document_activities"("createdAt");

-- CreateIndex
CREATE INDEX "document_activities_documentId_idx" ON "public"."document_activities"("documentId");

-- CreateIndex
CREATE INDEX "document_activities_userId_idx" ON "public"."document_activities"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "document_analysis_documentId_key" ON "public"."document_analysis"("documentId");

-- CreateIndex
CREATE INDEX "document_analysis_analyzedAt_idx" ON "public"."document_analysis"("analyzedAt");

-- CreateIndex
CREATE INDEX "document_analysis_language_idx" ON "public"."document_analysis"("language");

-- CreateIndex
CREATE INDEX "document_audit_logs_action_idx" ON "public"."document_audit_logs"("action");

-- CreateIndex
CREATE INDEX "document_audit_logs_documentId_idx" ON "public"."document_audit_logs"("documentId");

-- CreateIndex
CREATE INDEX "document_audit_logs_timestamp_idx" ON "public"."document_audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "document_audit_logs_userId_idx" ON "public"."document_audit_logs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "document_classification_ai_documentId_key" ON "public"."document_classification_ai"("documentId");

-- CreateIndex
CREATE INDEX "document_classification_ai_category_idx" ON "public"."document_classification_ai"("category");

-- CreateIndex
CREATE INDEX "document_classification_ai_classifiedAt_idx" ON "public"."document_classification_ai"("classifiedAt");

-- CreateIndex
CREATE INDEX "document_comments_documentId_idx" ON "public"."document_comments"("documentId");

-- CreateIndex
CREATE INDEX "document_comments_parentId_idx" ON "public"."document_comments"("parentId");

-- CreateIndex
CREATE INDEX "document_comments_userId_idx" ON "public"."document_comments"("userId");

-- CreateIndex
CREATE INDEX "document_content_documentId_idx" ON "public"."document_content"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "document_content_documentId_version_key" ON "public"."document_content"("documentId", "version");

-- CreateIndex
CREATE INDEX "document_favorites_userId_idx" ON "public"."document_favorites"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "document_favorites_documentId_userId_key" ON "public"."document_favorites"("documentId", "userId");

-- CreateIndex
CREATE INDEX "document_folders_department_idx" ON "public"."document_folders"("department");

-- CreateIndex
CREATE INDEX "document_folders_name_idx" ON "public"."document_folders"("name");

-- CreateIndex
CREATE INDEX "document_folders_ownerId_idx" ON "public"."document_folders"("ownerId");

-- CreateIndex
CREATE INDEX "document_folders_parentId_idx" ON "public"."document_folders"("parentId");

-- CreateIndex
CREATE INDEX "document_folders_projectId_idx" ON "public"."document_folders"("projectId");

-- CreateIndex
CREATE INDEX "document_permissions_documentId_idx" ON "public"."document_permissions"("documentId");

-- CreateIndex
CREATE INDEX "document_permissions_folderId_idx" ON "public"."document_permissions"("folderId");

-- CreateIndex
CREATE INDEX "document_permissions_permission_idx" ON "public"."document_permissions"("permission");

-- CreateIndex
CREATE INDEX "document_permissions_userEmail_idx" ON "public"."document_permissions"("userEmail");

-- CreateIndex
CREATE INDEX "document_permissions_userId_idx" ON "public"."document_permissions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "document_shares_shareToken_key" ON "public"."document_shares"("shareToken");

-- CreateIndex
CREATE INDEX "document_shares_documentId_idx" ON "public"."document_shares"("documentId");

-- CreateIndex
CREATE INDEX "document_shares_expiresAt_idx" ON "public"."document_shares"("expiresAt");

-- CreateIndex
CREATE INDEX "document_shares_shareToken_idx" ON "public"."document_shares"("shareToken");

-- CreateIndex
CREATE INDEX "document_shares_sharedBy_idx" ON "public"."document_shares"("sharedBy");

-- CreateIndex
CREATE INDEX "document_shares_sharedWith_idx" ON "public"."document_shares"("sharedWith");

-- CreateIndex
CREATE INDEX "document_templates_category_idx" ON "public"."document_templates"("category");

-- CreateIndex
CREATE INDEX "document_templates_isActive_idx" ON "public"."document_templates"("isActive");

-- CreateIndex
CREATE INDEX "document_workflow_tasks_assignedTo_idx" ON "public"."document_workflow_tasks"("assignedTo");

-- CreateIndex
CREATE INDEX "document_workflow_tasks_documentId_idx" ON "public"."document_workflow_tasks"("documentId");

-- CreateIndex
CREATE INDEX "document_workflow_tasks_dueDate_idx" ON "public"."document_workflow_tasks"("dueDate");

-- CreateIndex
CREATE INDEX "document_workflow_tasks_status_idx" ON "public"."document_workflow_tasks"("status");

-- CreateIndex
CREATE INDEX "document_workflow_tasks_taskType_idx" ON "public"."document_workflow_tasks"("taskType");

-- CreateIndex
CREATE INDEX "documents_approvalStatus_idx" ON "public"."documents"("approvalStatus");

-- CreateIndex
CREATE INDEX "documents_category_idx" ON "public"."documents"("category");

-- CreateIndex
CREATE INDEX "documents_checkedOutBy_idx" ON "public"."documents"("checkedOutBy");

-- CreateIndex
CREATE INDEX "documents_classification_idx" ON "public"."documents"("classification");

-- CreateIndex
CREATE INDEX "documents_createdAt_idx" ON "public"."documents"("createdAt");

-- CreateIndex
CREATE INDEX "documents_department_idx" ON "public"."documents"("department");

-- CreateIndex
CREATE INDEX "documents_filename_idx" ON "public"."documents"("filename");

-- CreateIndex
CREATE INDEX "documents_isArchived_idx" ON "public"."documents"("isArchived");

-- CreateIndex
CREATE INDEX "documents_isCheckedOut_idx" ON "public"."documents"("isCheckedOut");

-- CreateIndex
CREATE INDEX "documents_isDeleted_idx" ON "public"."documents"("isDeleted");

-- CreateIndex
CREATE INDEX "documents_isPublic_idx" ON "public"."documents"("isPublic");

-- CreateIndex
CREATE INDEX "documents_lastAccessedAt_idx" ON "public"."documents"("lastAccessedAt");

-- CreateIndex
CREATE INDEX "documents_projectId_idx" ON "public"."documents"("projectId");

-- CreateIndex
CREATE INDEX "documents_reviewStatus_idx" ON "public"."documents"("reviewStatus");

-- CreateIndex
CREATE INDEX "documents_uploadedBy_idx" ON "public"."documents"("uploadedBy");

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "public"."employees"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeId_key" ON "public"."employees"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "employees_nationalId_key" ON "public"."employees"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "public"."employees"("email");

-- CreateIndex
CREATE INDEX "employees_archived_at_idx" ON "public"."employees"("archived_at");

-- CreateIndex
CREATE INDEX "employees_department_idx" ON "public"."employees"("department");

-- CreateIndex
CREATE INDEX "employees_email_idx" ON "public"."employees"("email");

-- CreateIndex
CREATE INDEX "employees_employeeId_idx" ON "public"."employees"("employeeId");

-- CreateIndex
CREATE INDEX "employees_is_reviewer_idx" ON "public"."employees"("is_reviewer");

-- CreateIndex
CREATE INDEX "employees_is_supervisor_idx" ON "public"."employees"("is_supervisor");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "public"."employees"("status");

-- CreateIndex
CREATE INDEX "employees_supervisor_id_idx" ON "public"."employees"("supervisor_id");

-- CreateIndex
CREATE INDEX "event_registrations_eventId_idx" ON "public"."event_registrations"("eventId");

-- CreateIndex
CREATE INDEX "event_registrations_status_idx" ON "public"."event_registrations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_eventId_participantEmail_key" ON "public"."event_registrations"("eventId", "participantEmail");

-- CreateIndex
CREATE INDEX "events_startDate_idx" ON "public"."events"("startDate");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "public"."events"("status");

-- CreateIndex
CREATE INDEX "events_type_idx" ON "public"."events"("type");

-- CreateIndex
CREATE UNIQUE INDEX "job_descriptions_employeeId_key" ON "public"."job_descriptions"("employeeId");

-- CreateIndex
CREATE INDEX "job_descriptions_employeeId_idx" ON "public"."job_descriptions"("employeeId");

-- CreateIndex
CREATE INDEX "job_descriptions_isActive_idx" ON "public"."job_descriptions"("isActive");

-- CreateIndex
CREATE INDEX "maintenance_records_assetId_idx" ON "public"."maintenance_records"("assetId");

-- CreateIndex
CREATE INDEX "maintenance_records_performedDate_idx" ON "public"."maintenance_records"("performedDate");

-- CreateIndex
CREATE UNIQUE INDEX "notification_categories_name_key" ON "public"."notification_categories"("name");

-- CreateIndex
CREATE INDEX "notification_routes_ruleId_idx" ON "public"."notification_routes"("ruleId");

-- CreateIndex
CREATE INDEX "notification_routing_rules_isActive_idx" ON "public"."notification_routing_rules"("isActive");

-- CreateIndex
CREATE INDEX "notification_routing_rules_trigger_idx" ON "public"."notification_routing_rules"("trigger");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "public"."notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_deadline_idx" ON "public"."notifications"("deadline");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "public"."notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "public"."notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "public"."notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "public"."notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "public"."notifications"("userId");

-- CreateIndex
CREATE INDEX "performance_achievements_dateAchieved_idx" ON "public"."performance_achievements"("dateAchieved");

-- CreateIndex
CREATE INDEX "performance_achievements_employeeId_idx" ON "public"."performance_achievements"("employeeId");

-- CreateIndex
CREATE INDEX "performance_activities_responsibilityId_idx" ON "public"."performance_activities"("responsibilityId");

-- CreateIndex
CREATE INDEX "performance_activities_targetDate_idx" ON "public"."performance_activities"("targetDate");

-- CreateIndex
CREATE INDEX "performance_appraisals_employeeId_idx" ON "public"."performance_appraisals"("employeeId");

-- CreateIndex
CREATE INDEX "performance_appraisals_planId_idx" ON "public"."performance_appraisals"("planId");

-- CreateIndex
CREATE INDEX "performance_appraisals_reviewerId_idx" ON "public"."performance_appraisals"("reviewerId");

-- CreateIndex
CREATE INDEX "performance_appraisals_supervisorId_idx" ON "public"."performance_appraisals"("supervisorId");

-- CreateIndex
CREATE INDEX "performance_criteria_category_idx" ON "public"."performance_criteria"("category");

-- CreateIndex
CREATE INDEX "performance_feedback_feedbackType_idx" ON "public"."performance_feedback"("feedbackType");

-- CreateIndex
CREATE INDEX "performance_feedback_reviewId_idx" ON "public"."performance_feedback"("reviewId");

-- CreateIndex
CREATE INDEX "performance_plan_comments_commentType_idx" ON "public"."performance_plan_comments"("commentType");

-- CreateIndex
CREATE INDEX "performance_plan_comments_createdAt_idx" ON "public"."performance_plan_comments"("createdAt");

-- CreateIndex
CREATE INDEX "performance_plan_comments_planId_idx" ON "public"."performance_plan_comments"("planId");

-- CreateIndex
CREATE INDEX "performance_plan_comments_userId_idx" ON "public"."performance_plan_comments"("userId");

-- CreateIndex
CREATE INDEX "performance_plans_employeeId_idx" ON "public"."performance_plans"("employeeId");

-- CreateIndex
CREATE INDEX "performance_plans_planYear_idx" ON "public"."performance_plans"("planYear");

-- CreateIndex
CREATE INDEX "performance_plans_reviewerId_idx" ON "public"."performance_plans"("reviewerId");

-- CreateIndex
CREATE INDEX "performance_plans_status_idx" ON "public"."performance_plans"("status");

-- CreateIndex
CREATE INDEX "performance_plans_supervisorId_idx" ON "public"."performance_plans"("supervisorId");

-- CreateIndex
CREATE INDEX "performance_responsibilities_planId_idx" ON "public"."performance_responsibilities"("planId");

-- CreateIndex
CREATE INDEX "performance_responsibility_assessments_appraisalId_idx" ON "public"."performance_responsibility_assessments"("appraisalId");

-- CreateIndex
CREATE INDEX "performance_responsibility_assessments_responsibilityId_idx" ON "public"."performance_responsibility_assessments"("responsibilityId");

-- CreateIndex
CREATE INDEX "performance_reviews_employeeId_idx" ON "public"."performance_reviews"("employeeId");

-- CreateIndex
CREATE INDEX "performance_reviews_reviewDate_idx" ON "public"."performance_reviews"("reviewDate");

-- CreateIndex
CREATE INDEX "performance_reviews_reviewStatus_idx" ON "public"."performance_reviews"("reviewStatus");

-- CreateIndex
CREATE INDEX "performance_value_assessments_appraisalId_idx" ON "public"."performance_value_assessments"("appraisalId");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "public"."projects"("status");

-- CreateIndex
CREATE INDEX "qualifications_dateObtained_idx" ON "public"."qualifications"("dateObtained");

-- CreateIndex
CREATE INDEX "qualifications_employeeId_idx" ON "public"."qualifications"("employeeId");

-- CreateIndex
CREATE INDEX "qualifications_expiryDate_idx" ON "public"."qualifications"("expiryDate");

-- CreateIndex
CREATE INDEX "qualifications_type_idx" ON "public"."qualifications"("type");

-- CreateIndex
CREATE UNIQUE INDEX "risks_riskId_key" ON "public"."risks"("riskId");

-- CreateIndex
CREATE INDEX "search_logs_createdAt_idx" ON "public"."search_logs"("createdAt");

-- CreateIndex
CREATE INDEX "search_logs_searchType_idx" ON "public"."search_logs"("searchType");

-- CreateIndex
CREATE INDEX "search_logs_userId_idx" ON "public"."search_logs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "public"."system_config"("key");

-- CreateIndex
CREATE INDEX "system_config_category_idx" ON "public"."system_config"("category");

-- CreateIndex
CREATE INDEX "training_attendance_employeeId_idx" ON "public"."training_attendance"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "training_attendance_sessionId_employeeId_key" ON "public"."training_attendance"("sessionId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "training_certificates_enrollmentId_key" ON "public"."training_certificates"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "training_certificates_certificateNumber_key" ON "public"."training_certificates"("certificateNumber");

-- CreateIndex
CREATE INDEX "training_certificates_certificateNumber_idx" ON "public"."training_certificates"("certificateNumber");

-- CreateIndex
CREATE INDEX "training_certificates_issuedDate_idx" ON "public"."training_certificates"("issuedDate");

-- CreateIndex
CREATE INDEX "training_enrollments_employeeId_idx" ON "public"."training_enrollments"("employeeId");

-- CreateIndex
CREATE INDEX "training_enrollments_status_idx" ON "public"."training_enrollments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "training_enrollments_programId_employeeId_key" ON "public"."training_enrollments"("programId", "employeeId");

-- CreateIndex
CREATE INDEX "training_programs_category_idx" ON "public"."training_programs"("category");

-- CreateIndex
CREATE INDEX "training_programs_startDate_idx" ON "public"."training_programs"("startDate");

-- CreateIndex
CREATE INDEX "training_programs_status_idx" ON "public"."training_programs"("status");

-- CreateIndex
CREATE INDEX "training_sessions_programId_idx" ON "public"."training_sessions"("programId");

-- CreateIndex
CREATE INDEX "training_sessions_sessionDate_idx" ON "public"."training_sessions"("sessionDate");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "public"."verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "public"."verificationtokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_audits" ADD CONSTRAINT "asset_audits_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batch_analyses" ADD CONSTRAINT "batch_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_activities" ADD CONSTRAINT "document_activities_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_activities" ADD CONSTRAINT "document_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_analysis" ADD CONSTRAINT "document_analysis_analyzedBy_fkey" FOREIGN KEY ("analyzedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_analysis" ADD CONSTRAINT "document_analysis_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_audit_logs" ADD CONSTRAINT "document_audit_logs_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_classification_ai" ADD CONSTRAINT "document_classification_ai_classifiedBy_fkey" FOREIGN KEY ("classifiedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_classification_ai" ADD CONSTRAINT "document_classification_ai_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_comments" ADD CONSTRAINT "document_comments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_comments" ADD CONSTRAINT "document_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."document_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_content" ADD CONSTRAINT "document_content_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_content" ADD CONSTRAINT "document_content_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_favorites" ADD CONSTRAINT "document_favorites_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_folders" ADD CONSTRAINT "document_folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."document_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_permissions" ADD CONSTRAINT "document_permissions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_permissions" ADD CONSTRAINT "document_permissions_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."document_folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_shares" ADD CONSTRAINT "document_shares_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_workflow_tasks" ADD CONSTRAINT "document_workflow_tasks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_parentDocumentId_fkey" FOREIGN KEY ("parentDocumentId") REFERENCES "public"."documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "public"."employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_registrations" ADD CONSTRAINT "event_registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_descriptions" ADD CONSTRAINT "job_descriptions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maintenance_records" ADD CONSTRAINT "maintenance_records_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_routes" ADD CONSTRAINT "notification_routes_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."notification_routing_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_routing_rules" ADD CONSTRAINT "notification_routing_rules_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_achievements" ADD CONSTRAINT "performance_achievements_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_activities" ADD CONSTRAINT "performance_activities_responsibilityId_fkey" FOREIGN KEY ("responsibilityId") REFERENCES "public"."performance_responsibilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_appraisals" ADD CONSTRAINT "performance_appraisals_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_appraisals" ADD CONSTRAINT "performance_appraisals_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."performance_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_appraisals" ADD CONSTRAINT "performance_appraisals_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_appraisals" ADD CONSTRAINT "performance_appraisals_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_plan_comments" ADD CONSTRAINT "performance_plan_comments_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."performance_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_plan_comments" ADD CONSTRAINT "performance_plan_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_plans" ADD CONSTRAINT "performance_plans_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_plans" ADD CONSTRAINT "performance_plans_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_plans" ADD CONSTRAINT "performance_plans_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_responsibilities" ADD CONSTRAINT "performance_responsibilities_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."performance_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_responsibility_assessments" ADD CONSTRAINT "performance_responsibility_assessments_appraisalId_fkey" FOREIGN KEY ("appraisalId") REFERENCES "public"."performance_appraisals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_responsibility_assessments" ADD CONSTRAINT "performance_responsibility_assessments_responsibilityId_fkey" FOREIGN KEY ("responsibilityId") REFERENCES "public"."performance_responsibilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_reviews" ADD CONSTRAINT "performance_reviews_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_reviews" ADD CONSTRAINT "performance_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_reviews" ADD CONSTRAINT "performance_reviews_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_value_assessments" ADD CONSTRAINT "performance_value_assessments_appraisalId_fkey" FOREIGN KEY ("appraisalId") REFERENCES "public"."performance_appraisals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."qualifications" ADD CONSTRAINT "qualifications_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_assessments" ADD CONSTRAINT "risk_assessments_assessorId_fkey" FOREIGN KEY ("assessorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_assessments" ADD CONSTRAINT "risk_assessments_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_assessments" ADD CONSTRAINT "risk_assessments_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "public"."risks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_audit_logs" ADD CONSTRAINT "risk_audit_logs_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "public"."risks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_audit_logs" ADD CONSTRAINT "risk_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_documents" ADD CONSTRAINT "risk_documents_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "public"."risks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_documents" ADD CONSTRAINT "risk_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_mitigations" ADD CONSTRAINT "risk_mitigations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_mitigations" ADD CONSTRAINT "risk_mitigations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_mitigations" ADD CONSTRAINT "risk_mitigations_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "public"."risks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_notifications" ADD CONSTRAINT "risk_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risks" ADD CONSTRAINT "risks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risks" ADD CONSTRAINT "risks_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."search_logs" ADD CONSTRAINT "search_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_attendance" ADD CONSTRAINT "training_attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_attendance" ADD CONSTRAINT "training_attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."training_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_certificates" ADD CONSTRAINT "training_certificates_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "public"."training_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_enrollments" ADD CONSTRAINT "training_enrollments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_enrollments" ADD CONSTRAINT "training_enrollments_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_sessions" ADD CONSTRAINT "training_sessions_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
