/**
 * Validation utilities for Performance Plans and Appraisals
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Essential fields required for Performance Plans
 */
export const REQUIRED_PLAN_FIELDS = {
  employeeId: 'Employee is required',
  planYear: 'Plan year is required',
  planTitle: 'Plan title is required',
  startDate: 'Start date is required',
  endDate: 'End date is required',
  keyResponsibilities: 'At least one key responsibility is required',
} as const;

/**
 * Essential fields required for Performance Appraisals
 */
export const REQUIRED_APPRAISAL_FIELDS = {
  employeeId: 'Employee is required',
  reviewPeriod: 'Review period is required',
  achievements: 'Achievements section must be completed',
  performanceCategories: 'Performance categories must be rated',
} as const;

/**
 * Validate performance plan data
 */
export function validatePerformancePlan(planData: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate employee
  if (!planData.employee?.id) {
    errors.push({
      field: 'employee',
      message: REQUIRED_PLAN_FIELDS.employeeId
    });
  }

  // Validate plan year
  if (!planData.planYear) {
    errors.push({
      field: 'planYear',
      message: REQUIRED_PLAN_FIELDS.planYear
    });
  } else {
    const year = parseInt(planData.planYear.toString());
    if (isNaN(year) || year < 2020 || year > 2100) {
      errors.push({
        field: 'planYear',
        message: 'Plan year must be a valid year between 2020 and 2100'
      });
    }
  }

  // Validate plan title
  if (!planData.planTitle || planData.planTitle.trim() === '') {
    errors.push({
      field: 'planTitle',
      message: REQUIRED_PLAN_FIELDS.planTitle
    });
  }

  // Validate dates
  if (!planData.startDate || planData.startDate.trim() === '') {
    errors.push({
      field: 'startDate',
      message: REQUIRED_PLAN_FIELDS.startDate
    });
  }

  if (!planData.endDate || planData.endDate.trim() === '') {
    errors.push({
      field: 'endDate',
      message: REQUIRED_PLAN_FIELDS.endDate
    });
  }

  // Validate date range
  if (planData.startDate && planData.endDate) {
    const start = new Date(planData.startDate);
    const end = new Date(planData.endDate);
    if (start >= end) {
      errors.push({
        field: 'endDate',
        message: 'End date must be after start date'
      });
    }
  }

  // Validate plan period object if provided
  if (planData.planPeriod && typeof planData.planPeriod === 'object') {
    if (!planData.planPeriod.startDate || planData.planPeriod.startDate.trim() === '') {
      errors.push({
        field: 'planPeriod.startDate',
        message: 'Plan period start date is required'
      });
    }
    if (!planData.planPeriod.endDate || planData.planPeriod.endDate.trim() === '') {
      errors.push({
        field: 'planPeriod.endDate',
        message: 'Plan period end date is required'
      });
    }
  }

  // Validate key responsibilities (required for submission)
  const keyResponsibilities = planData.keyResponsibilities || [];
  if (!Array.isArray(keyResponsibilities) || keyResponsibilities.length === 0) {
    errors.push({
      field: 'keyResponsibilities',
      message: REQUIRED_PLAN_FIELDS.keyResponsibilities
    });
  } else {
    // Validate each responsibility has at least a description
    keyResponsibilities.forEach((resp: any, index: number) => {
      if (!resp.description || resp.description.trim() === '') {
        errors.push({
          field: `keyResponsibilities[${index}].description`,
          message: `Key responsibility ${index + 1} must have a description`
        });
      }
    });
  }

  // Validate value goals if provided (should be array)
  if (planData.valueGoals !== undefined && !Array.isArray(planData.valueGoals)) {
    errors.push({
      field: 'valueGoals',
      message: 'Value goals must be an array'
    });
  }

  // Validate competencies if provided (should be array)
  if (planData.competencies !== undefined && !Array.isArray(planData.competencies)) {
    errors.push({
      field: 'competencies',
      message: 'Competencies must be an array'
    });
  }

  // Validate development needs if provided (should be array)
  if (planData.developmentNeeds !== undefined && !Array.isArray(planData.developmentNeeds)) {
    errors.push({
      field: 'developmentNeeds',
      message: 'Development needs must be an array'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate performance appraisal data
 */
export function validatePerformanceAppraisal(appraisalData: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate employee
  if (!appraisalData.employee?.id) {
    errors.push({
      field: 'employee',
      message: REQUIRED_APPRAISAL_FIELDS.employeeId
    });
  }

  // Validate review period
  if (appraisalData.employee?.reviewPeriod) {
    const reviewPeriod = appraisalData.employee.reviewPeriod;
    if (!reviewPeriod.startDate || reviewPeriod.startDate.trim() === '') {
      errors.push({
        field: 'employee.reviewPeriod.startDate',
        message: 'Review period start date is required'
      });
    }
    if (!reviewPeriod.endDate || reviewPeriod.endDate.trim() === '') {
      errors.push({
        field: 'employee.reviewPeriod.endDate',
        message: 'Review period end date is required'
      });
    }
    if (reviewPeriod.startDate && reviewPeriod.endDate) {
      const start = new Date(reviewPeriod.startDate);
      const end = new Date(reviewPeriod.endDate);
      if (start >= end) {
        errors.push({
          field: 'employee.reviewPeriod.endDate',
          message: 'Review period end date must be after start date'
        });
      }
    }
  } else {
    errors.push({
      field: 'employee.reviewPeriod',
      message: REQUIRED_APPRAISAL_FIELDS.reviewPeriod
    });
  }

  // Validate achievements (at least one key responsibility assessment)
  const achievements = appraisalData.achievements || {};
  const keyResponsibilities = achievements.keyResponsibilities || [];
  if (!Array.isArray(keyResponsibilities) || keyResponsibilities.length === 0) {
    errors.push({
      field: 'achievements.keyResponsibilities',
      message: 'At least one key responsibility assessment is required'
    });
  } else {
    // Validate each key responsibility has been assessed
    keyResponsibilities.forEach((resp: any, index: number) => {
      if (!resp.achievementStatus || resp.achievementStatus === '') {
        errors.push({
          field: `achievements.keyResponsibilities[${index}].achievementStatus`,
          message: `Key responsibility ${index + 1} must have an achievement status`
        });
      }
      if (!resp.comment || resp.comment.trim() === '') {
        errors.push({
          field: `achievements.keyResponsibilities[${index}].comment`,
          message: `Key responsibility ${index + 1} must have a comment`
        });
      }
    });
  }

  // Validate performance categories (at least ratings should be provided)
  const performance = appraisalData.performance || {};
  const categories = performance.categories || [];
  if (!Array.isArray(categories) || categories.length === 0) {
    errors.push({
      field: 'performance.categories',
      message: 'Performance categories must be defined'
    });
  } else {
    categories.forEach((category: any, index: number) => {
      if (category.rating === undefined || category.rating === null || category.rating === 0) {
        errors.push({
          field: `performance.categories[${index}].rating`,
          message: `${category.name || `Category ${index + 1}`} must have a rating`
        });
      }
      if (category.rating && (category.rating < 1 || category.rating > 5)) {
        errors.push({
          field: `performance.categories[${index}].rating`,
          message: `${category.name || `Category ${index + 1}`} rating must be between 1 and 5`
        });
      }
      if (!category.comment || category.comment.trim() === '') {
        errors.push({
          field: `performance.categories[${index}].comment`,
          message: `${category.name || `Category ${index + 1}`} must have a comment`
        });
      }
    });
  }

  // Validate development section if provided
  const development = appraisalData.development || {};
  if (development.trainingNeeds !== undefined && !Array.isArray(development.trainingNeeds)) {
    errors.push({
      field: 'development.trainingNeeds',
      message: 'Training needs must be an array'
    });
  }
  if (development.skillsToImprove !== undefined && !Array.isArray(development.skillsToImprove)) {
    errors.push({
      field: 'development.skillsToImprove',
      message: 'Skills to improve must be an array'
    });
  }

  // Validate ratings if provided
  const ratings = appraisalData.ratings || {};
  if (ratings.finalRating !== undefined) {
    if (ratings.finalRating < 0 || ratings.finalRating > 5) {
      errors.push({
        field: 'ratings.finalRating',
        message: 'Final rating must be between 0 and 5'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  
  const errorMessages = errors.map(err => `• ${err.message} (${err.field})`);
  return errorMessages.join('\n');
}

/**
 * Get user-friendly field name
 */
export function getFieldDisplayName(field: string): string {
  const fieldNames: Record<string, string> = {
    'employee': 'Employee',
    'employeeId': 'Employee',
    'planYear': 'Plan Year',
    'planTitle': 'Plan Title',
    'startDate': 'Start Date',
    'endDate': 'End Date',
    'planPeriod': 'Plan Period',
    'planPeriod.startDate': 'Plan Period Start Date',
    'planPeriod.endDate': 'Plan Period End Date',
    'keyResponsibilities': 'Key Responsibilities',
    'valueGoals': 'Value Goals',
    'competencies': 'Competencies',
    'developmentNeeds': 'Development Needs',
    'employee.reviewPeriod': 'Review Period',
    'employee.reviewPeriod.startDate': 'Review Period Start Date',
    'employee.reviewPeriod.endDate': 'Review Period End Date',
    'achievements': 'Achievements',
    'achievements.keyResponsibilities': 'Key Responsibility Assessments',
    'performance': 'Performance',
    'performance.categories': 'Performance Categories',
    'development': 'Development',
    'development.trainingNeeds': 'Training Needs',
    'development.skillsToImprove': 'Skills to Improve',
    'ratings': 'Ratings',
    'ratings.finalRating': 'Final Rating'
  };

  return fieldNames[field] || field.replace(/([A-Z])/g, ' $1').trim();
}
