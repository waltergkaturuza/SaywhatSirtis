import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { validatePerformancePlan, formatValidationErrors, ValidationResult } from "@/lib/validations/performance-validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get all performance plans
    const plans = await prisma.performance_plans.findMany({
      include: {
        employees: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            departments: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ plans, success: true });
  } catch (error) {
    console.error("Error fetching performance plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance plans", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { formData, isDraft } = body;

    console.log('📝 Creating/Updating performance plan:', {
      planId: formData.id,
      employee: formData.employee,
      isDraft,
      planYear: formData.planYear
    });

    // If formData has an ID, this is an update - redirect to PUT endpoint logic
    if (formData.id) {
      // Find the existing plan
      const existingPlan = await prisma.performance_plans.findUnique({
        where: { id: formData.id },
        include: {
          performance_responsibilities: true
        }
      });

      if (!existingPlan) {
        return NextResponse.json(
          { error: 'Performance plan not found', success: false },
          { status: 404 }
        );
      }

      // Check permissions - user must be the employee owner, HR, supervisor, or reviewer
      const employeeRecord = await prisma.employees.findFirst({
        where: { email: session.user.email },
        select: { id: true }
      });

      const isOwnPlan = existingPlan.employeeId === employeeRecord?.id;
      const isHR = session.user.roles?.some((r: string) => ['HR', 'ADMIN', 'HR_MANAGER', 'SUPERUSER'].includes(r));
      const isSupervisor = existingPlan.supervisorId === session.user.id;
      const isReviewer = existingPlan.reviewerId === session.user.id;

      // Allow updates if user is the owner or HR (even for submitted plans, owners can update drafts)
      // For supervisors/reviewers, only allow updates if they're reviewing (not editing the plan itself)
      if (!isOwnPlan && !isHR) {
        // Supervisors and reviewers can only update via workflow, not edit the plan directly
        return NextResponse.json(
          { error: 'Insufficient permissions to update this plan. Only the plan owner or HR can edit plans.', success: false },
          { status: 403 }
        );
      }

      // If plan is submitted (not draft) and user is not HR, only allow draft saves (not status changes)
      if (existingPlan.status !== 'draft' && isDraft && !isHR) {
        // Only owner can continue editing as draft even if previously submitted
        // This allows users to make revisions after submission
      }

      // Validate plan data if submitting (not draft)
      if (!isDraft && formData.status === 'submitted') {
        const validation = validatePerformancePlan(formData);
        if (!validation.isValid) {
          return NextResponse.json({
            success: false,
            error: 'Validation failed',
            errors: validation.errors,
            message: formatValidationErrors(validation.errors)
          }, { status: 400 });
        }
      }

      // Prepare update data with ALL fields from formData
      const updateData: any = {
        status: isDraft ? 'draft' : (formData.status || 'submitted'),
        updatedAt: new Date()
      };

      // Update all basic fields
      if (formData.planTitle !== undefined) {
        updateData.planTitle = formData.planTitle;
      }
      if (formData.planYear !== undefined) {
        updateData.planYear = parseInt(formData.planYear.toString());
      }
      
      // Handle planPeriod
      let planPeriod: string;
      if (formData.planPeriod) {
        if (typeof formData.planPeriod === 'string') {
          planPeriod = formData.planPeriod;
        } else if (typeof formData.planPeriod === 'object') {
          const startDate = formData.planPeriod.startDate || formData.startDate || '';
          const endDate = formData.planPeriod.endDate || formData.endDate || '';
          if (startDate && endDate) {
            planPeriod = `${startDate} - ${endDate}`;
          } else {
            planPeriod = existingPlan.planPeriod || `January ${updateData.planYear || existingPlan.planYear} - December ${updateData.planYear || existingPlan.planYear}`;
          }
        } else {
          planPeriod = existingPlan.planPeriod || `January ${updateData.planYear || existingPlan.planYear} - December ${updateData.planYear || existingPlan.planYear}`;
        }
        updateData.planPeriod = planPeriod;
      }
      
      // Update date fields - check multiple sources
      const startDate = formData.startDate || formData.reviewPeriod?.startDate || formData.planPeriod?.startDate
      const endDate = formData.endDate || formData.reviewPeriod?.endDate || formData.planPeriod?.endDate
      
      if (startDate) {
        updateData.startDate = new Date(startDate);
      }
      if (endDate) {
        updateData.endDate = new Date(endDate);
      }
      
      // Also update planPeriod string if dates are provided and planPeriod wasn't already set
      if (startDate && endDate && !updateData.planPeriod) {
        updateData.planPeriod = `${startDate} - ${endDate}`;
      }

      // Save JSON fields - PRESERVE existing when incoming would wipe (empty array overwriting content)
      const hasContent = (val: any) => {
        const arr = typeof val === 'string' ? (() => { try { return JSON.parse(val); } catch { return []; } })() : val;
        return Array.isArray(arr) && arr.length > 0;
      };
      if (formData.deliverables !== undefined) {
        if (hasContent(formData.deliverables) || !existingPlan.deliverables) {
          updateData.deliverables = typeof formData.deliverables === 'string' ? formData.deliverables : JSON.stringify(formData.deliverables ?? []);
        }
      }
      if (formData.valueGoals !== undefined) {
        if (hasContent(formData.valueGoals) || !existingPlan.valueGoals) {
          updateData.valueGoals = typeof formData.valueGoals === 'string' ? formData.valueGoals : JSON.stringify(formData.valueGoals ?? []);
        }
      }
      if (formData.competencies !== undefined) {
        if (hasContent(formData.competencies) || !existingPlan.competencies) {
          updateData.competencies = typeof formData.competencies === 'string' ? formData.competencies : JSON.stringify(formData.competencies ?? []);
        }
      }
      if (formData.developmentNeeds !== undefined) {
        if (hasContent(formData.developmentNeeds) || !existingPlan.developmentNeeds) {
          updateData.developmentNeeds = typeof formData.developmentNeeds === 'string' ? formData.developmentNeeds : JSON.stringify(formData.developmentNeeds ?? []);
        }
      }
      if (formData.comments !== undefined) {
        updateData.comments = typeof formData.comments === 'string' ? formData.comments : JSON.stringify(formData.comments ?? []);
      }

      // Set submittedAt if status is submitted
      if (!isDraft && formData.status === 'submitted' && !existingPlan.submittedAt) {
        updateData.submittedAt = new Date();
      }

      console.log('💾 Updating existing plan with data:', { ...updateData, deliverables: '[data]', valueGoals: '[data]', competencies: '[data]', developmentNeeds: '[data]', comments: '[data]' });

      // Update the plan
      const updatedPlan = await prisma.performance_plans.update({
        where: { id: formData.id },
        data: updateData,
        include: {
          performance_responsibilities: true
        }
      });

      // Update performance_responsibilities - ONLY if incoming has content; never delete when incoming is empty
      if (formData.keyResponsibilities && Array.isArray(formData.keyResponsibilities) && formData.keyResponsibilities.length > 0) {
        // Sync keyResponsibilities to deliverables JSON for full structure (successIndicators, etc.)
        const fullDeliverables = formData.keyResponsibilities.map((r: any) => ({
          id: r.id,
          description: r.description || r.title,
          tasks: r.tasks,
          weight: r.weight ?? 0,
          targetDate: r.targetDate,
          status: r.status || 'not-started',
          progress: r.progress ?? 0,
          successIndicators: r.successIndicators || [],
          comments: r.comments || ''
        }));
        await prisma.performance_plans.update({
          where: { id: updatedPlan.id },
          data: { deliverables: JSON.stringify(fullDeliverables) }
        });

        // Delete existing responsibilities
        await prisma.performance_responsibilities.deleteMany({
          where: { planId: updatedPlan.id }
        });

        // Create new responsibilities
        for (const responsibility of formData.keyResponsibilities) {
          const respData = {
            id: responsibility.id || crypto.randomUUID(),
            planId: updatedPlan.id,
            title: (responsibility.description || responsibility.title || 'Responsibility')?.substring(0, 100) || 'Responsibility',
            description: responsibility.description || responsibility.title || '',
            weight: responsibility.weight || 0,
            updatedAt: new Date()
          };

          await prisma.performance_responsibilities.create({
            data: respData
          });
        }
      }

      console.log('✅ Performance plan updated:', updatedPlan.id);

      return NextResponse.json({
        success: true,
        message: isDraft ? 'Draft saved successfully!' : 'Performance plan updated successfully',
        plan: {
          id: updatedPlan.id,
          planYear: updatedPlan.planYear,
          status: updatedPlan.status
        }
      });
    }

    // Validate plan data if submitting (not draft)
    if (!isDraft && formData.status === 'submitted') {
      const validation = validatePerformancePlan(formData);
      if (!validation.isValid) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          errors: validation.errors,
          message: formatValidationErrors(validation.errors)
        }, { status: 400 });
      }
    }

    // Validate required fields for new plan creation
    if (!formData.employee?.id) {
      return NextResponse.json(
        { error: 'Employee ID is required', success: false },
        { status: 400 }
      );
    }

    // Get employee record to get the database ID
    const employee = await prisma.employees.findFirst({
      where: {
        OR: [
          { employeeId: formData.employee.id },
          { id: formData.employee.id }
        ]
      },
      select: {
        id: true,
        employeeId: true,
        supervisor_id: true,
        reviewer_id: true
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found', success: false },
        { status: 404 }
      );
    }

    // Determine status
    const status = isDraft ? 'draft' : 'submitted';

    // Get supervisor user ID (performance_plans.supervisorId is a foreign key to users table)
    // supervisor_id is an employee ID, so we need to get the employee first, then their userId
    let supervisorUserId = null;
    if (employee.supervisor_id) {
      const supervisorEmployee = await prisma.employees.findUnique({
        where: { id: employee.supervisor_id },
        select: { userId: true }
      });
      if (supervisorEmployee?.userId) {
        supervisorUserId = supervisorEmployee.userId;
      }
    }

    if (!supervisorUserId) {
      return NextResponse.json(
        { error: 'Employee must have a supervisor with a user account to create a performance plan', success: false },
        { status: 400 }
      );
    }

    // Prepare plan data matching the actual schema
    const currentYear = new Date().getFullYear();
    const planYear = formData.planYear ? parseInt(formData.planYear) : currentYear;
    
    // Handle planPeriod - it might come as an object with startDate/endDate or as a string
    let planPeriod: string;
    if (typeof formData.planPeriod === 'string') {
      planPeriod = formData.planPeriod;
    } else if (formData.planPeriod && typeof formData.planPeriod === 'object') {
      // If it's an object, convert to string format
      const startDate = formData.planPeriod.startDate || '';
      const endDate = formData.planPeriod.endDate || '';
      if (startDate && endDate) {
        planPeriod = `${startDate} - ${endDate}`;
      } else {
        planPeriod = `January ${planYear} - December ${planYear}`;
      }
    } else {
      planPeriod = `January ${planYear} - December ${planYear}`;
    }
    
    console.log('📝 Plan period resolved:', planPeriod);
    
    // Check for existing draft plan - match by employee + year (planPeriod can vary in format)
    const existingDraft = await prisma.performance_plans.findFirst({
      where: {
        employeeId: employee.id,
        planYear: planYear,
        status: 'draft'
      },
      include: {
        performance_responsibilities: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    let plan;
    
    // CRITICAL: Prevent data loss - if user has existing draft but came from create page (no formData.id),
    // and incoming form would WIPE their saved content (empty/sparse), return existing draft and tell frontend to redirect
    const incomingHasContent = 
      (formData.keyResponsibilities && Array.isArray(formData.keyResponsibilities) && formData.keyResponsibilities.length > 0) ||
      (formData.valueGoals && Array.isArray(formData.valueGoals) && formData.valueGoals.some((v: any) => v && (v.description || v.objective))) ||
      (formData.deliverables && Array.isArray(formData.deliverables) && formData.deliverables.length > 0);
    
    const existingHasContent = 
      (existingDraft?.performance_responsibilities?.length ?? 0) > 0 ||
      (existingDraft?.deliverables && (() => {
        try {
          const d = typeof existingDraft.deliverables === 'string' ? JSON.parse(existingDraft.deliverables) : existingDraft.deliverables;
          return Array.isArray(d) ? d.length > 0 : false;
        } catch { return false; }
      })()) ||
      (existingDraft?.valueGoals && (() => {
        try {
          const v = typeof existingDraft.valueGoals === 'string' ? JSON.parse(existingDraft.valueGoals) : existingDraft.valueGoals;
          return Array.isArray(v) ? v.some((x: any) => x && (x.description || x.objective)) : false;
        } catch { return false; }
      })());
    
    if (existingDraft && isDraft && existingHasContent && !incomingHasContent) {
      // User's existing draft has content but incoming form would wipe it - redirect to edit, don't overwrite
      console.log('🛡️ Preventing data loss: existing draft has content, incoming is sparse. Returning redirect.');
      return NextResponse.json({
        success: true,
        redirectToExistingDraft: true,
        existingPlanId: existingDraft.id,
        message: 'You have an existing draft. Redirecting to continue editing.',
        plan: {
          id: existingDraft.id,
          planYear: existingDraft.planYear,
          status: existingDraft.status
        }
      });
    }
    
    // If draft exists and we're saving as draft, update it instead of creating new
    if (existingDraft && isDraft) {
      console.log('📝 Found existing draft plan, updating:', existingDraft.id);
      
      // Helper: only overwrite JSON field if incoming has content, otherwise preserve existing to prevent data loss
      const safeJsonField = (incoming: any, existing: any): string | undefined => {
        if (incoming === undefined) return undefined; // Don't update
        const arr = typeof incoming === 'string' ? (() => { try { return JSON.parse(incoming); } catch { return []; } })() : incoming;
        const hasContent = Array.isArray(arr) && arr.length > 0;
        if (!hasContent && existing) return undefined; // Preserve existing when incoming would wipe
        return typeof incoming === 'string' ? incoming : JSON.stringify(incoming ?? []);
      };
      
      const updateData: any = {
        status: 'draft',
        updatedAt: new Date(),
        planTitle: formData.planTitle || existingDraft.planTitle || `Annual Plan ${planYear}`,
        planPeriod: planPeriod,
        planYear: planYear
      };
      
      const startDate = formData.startDate || formData.reviewPeriod?.startDate || formData.planPeriod?.startDate;
      const endDate = formData.endDate || formData.reviewPeriod?.endDate || formData.planPeriod?.endDate;
      
      if (startDate) updateData.startDate = new Date(startDate);
      if (endDate) updateData.endDate = new Date(endDate);
      if (startDate && endDate && !updateData.planPeriod) updateData.planPeriod = `${startDate} - ${endDate}`;
      
      // Preserve existing data when incoming would wipe it
      const d = safeJsonField(formData.deliverables, existingDraft.deliverables);
      if (d !== undefined) updateData.deliverables = d;
      const v = safeJsonField(formData.valueGoals, existingDraft.valueGoals);
      if (v !== undefined) updateData.valueGoals = v;
      const c = safeJsonField(formData.competencies, existingDraft.competencies);
      if (c !== undefined) updateData.competencies = c;
      const dn = safeJsonField(formData.developmentNeeds, existingDraft.developmentNeeds);
      if (dn !== undefined) updateData.developmentNeeds = dn;
      if (formData.comments !== undefined) {
        updateData.comments = typeof formData.comments === 'string' ? formData.comments : JSON.stringify(formData.comments || []);
      }
      
      plan = await prisma.performance_plans.update({
        where: { id: existingDraft.id },
        data: updateData,
        include: {
          performance_responsibilities: true
        }
      });

      // Only replace responsibilities if incoming has content; otherwise preserve
      if (formData.keyResponsibilities && Array.isArray(formData.keyResponsibilities) && formData.keyResponsibilities.length > 0) {
        // Sync keyResponsibilities to deliverables JSON for full structure (successIndicators, etc.)
        const fullDeliverables = formData.keyResponsibilities.map((r: any) => ({
          id: r.id,
          description: r.description || r.title,
          tasks: r.tasks,
          weight: r.weight ?? 0,
          targetDate: r.targetDate,
          status: r.status || 'not-started',
          progress: r.progress ?? 0,
          successIndicators: r.successIndicators || [],
          comments: r.comments || ''
        }));
        await prisma.performance_plans.update({
          where: { id: plan.id },
          data: { deliverables: JSON.stringify(fullDeliverables) }
        });

        await prisma.performance_responsibilities.deleteMany({ where: { planId: plan.id } });
        for (const responsibility of formData.keyResponsibilities) {
          await prisma.performance_responsibilities.create({
            data: {
              id: responsibility.id || crypto.randomUUID(),
              planId: plan.id,
              title: (responsibility.description || responsibility.title || 'Responsibility')?.substring(0, 100) || 'Responsibility',
              description: responsibility.description || responsibility.title || '',
              weight: responsibility.weight || 0,
              updatedAt: new Date()
            }
          });
        }
      }

      console.log('✅ Performance plan draft updated:', plan.id);
    } else {
      // Check if there's a submitted plan for the same period (match by employee + year)
      if (!existingDraft) {
        const existingSubmitted = await prisma.performance_plans.findFirst({
          where: {
            employeeId: employee.id,
            planYear: planYear,
            status: { in: ['submitted', 'active', 'approved', 'supervisor_review', 'reviewer_assessment', 'completed'] }
          }
        });

        if (existingSubmitted) {
          return NextResponse.json({
            success: false,
            error: 'A plan for this period already exists and has been submitted. Please edit the existing plan instead.',
            existingPlanId: existingSubmitted.id
          }, { status: 400 });
        }
      }

      // Get reviewer user ID if employee has a reviewer
      let reviewerUserId = null;
      if (employee.reviewer_id) {
        const reviewerEmployee = await prisma.employees.findUnique({
          where: { id: employee.reviewer_id },
          select: { userId: true }
        });
        if (reviewerEmployee?.userId) {
          reviewerUserId = reviewerEmployee.userId;
        }
      }

      // Prepare plan data with ALL fields from formData
      const planData: any = {
        id: crypto.randomUUID(),
        employeeId: employee.id,
        supervisorId: supervisorUserId, // This must be a user ID, not an employee ID
        planYear: planYear,
        planPeriod: planPeriod,
        planTitle: formData.planTitle || `Annual Plan ${planYear}`,
        status,
        workflowStatus: isDraft ? 'draft' : 'submitted',
        updatedAt: new Date(),
        reviewerId: reviewerUserId, // This must be a user ID, not an employee ID
        comments: formData.comments ? (typeof formData.comments === 'string' ? formData.comments : JSON.stringify(formData.comments)) : JSON.stringify([])
      };
      
      // Add date fields if provided
      if (formData.startDate) {
        planData.startDate = new Date(formData.startDate);
      }
      if (formData.endDate) {
        planData.endDate = new Date(formData.endDate);
      }
      
      // Save JSON fields (deliverables, valueGoals, competencies, developmentNeeds)
      if (formData.deliverables !== undefined) {
        planData.deliverables = typeof formData.deliverables === 'string' 
          ? formData.deliverables 
          : JSON.stringify(formData.deliverables);
      }
      if (formData.valueGoals !== undefined) {
        planData.valueGoals = typeof formData.valueGoals === 'string'
          ? formData.valueGoals
          : JSON.stringify(formData.valueGoals);
      }
      if (formData.competencies !== undefined) {
        planData.competencies = typeof formData.competencies === 'string'
          ? formData.competencies
          : JSON.stringify(formData.competencies);
      }
      if (formData.developmentNeeds !== undefined) {
        planData.developmentNeeds = typeof formData.developmentNeeds === 'string'
          ? formData.developmentNeeds
          : JSON.stringify(formData.developmentNeeds);
      }
      
      // Set submittedAt if not draft
      if (!isDraft) {
        planData.submittedAt = new Date();
      }

      console.log('💾 Saving plan to database:', { ...planData, deliverables: '[data]', valueGoals: '[data]', competencies: '[data]', developmentNeeds: '[data]' });

      // Create the performance plan
      plan = await prisma.performance_plans.create({
        data: planData
      });

      console.log('✅ Performance plan created:', plan.id);
    }

    console.log('✅ Performance plan created:', plan.id);

    // Create performance responsibilities and sync to deliverables JSON
    if (formData.keyResponsibilities && formData.keyResponsibilities.length > 0) {
      console.log(`📋 Creating ${formData.keyResponsibilities.length} key responsibilities`);
      
      // Save full structure to deliverables for preload (successIndicators, etc.)
      const fullDeliverables = formData.keyResponsibilities.map((r: any) => ({
        id: r.id,
        description: r.description || r.title,
        tasks: r.tasks,
        weight: r.weight ?? 0,
        targetDate: r.targetDate,
        status: r.status || 'not-started',
        progress: r.progress ?? 0,
        successIndicators: r.successIndicators || [],
        comments: r.comments || ''
      }));
      await prisma.performance_plans.update({
        where: { id: plan.id },
        data: { deliverables: JSON.stringify(fullDeliverables) }
      });
      
      for (const responsibility of formData.keyResponsibilities) {
        const respData = {
          id: responsibility.id || crypto.randomUUID(),
          planId: plan.id,
          title: (responsibility.description || responsibility.title || 'Responsibility')?.substring(0, 100) || 'Responsibility',
          description: responsibility.description || responsibility.title || '',
          weight: responsibility.weight || 0,
          updatedAt: new Date()
        };

        await prisma.performance_responsibilities.create({
          data: respData
        });
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: isDraft ? 'Performance plan saved as draft' : 'Performance plan submitted successfully',
      planId: plan.id,
      plan: {
        id: plan.id,
        planYear: plan.planYear,
        status: plan.status
      }
    });

  } catch (error) {
    console.error("❌ Error creating performance plan:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to create performance plan",
        success: false 
      },
      { status: 500 }
    );
  }
}
