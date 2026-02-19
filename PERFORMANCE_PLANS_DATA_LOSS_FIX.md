# Performance Plans Data Loss Fix

## Problem
Employees reported that information saved in their performance working plans was disappearing. Investigation revealed several root causes.

## Root Causes Identified

### 1. **Existing Draft Overwrite Bug** (Critical)
When an employee with an existing draft navigated to "Create Plan" (without planId in URL) and saved:
- The API found their existing draft by employee + year
- It **overwrote** the draft with the current form data
- The current form was often **empty or minimal** (auto-filled from job description)
- Result: All their previously saved work was **wiped out**

### 2. **Empty Payload Overwriting Content**
When saving, if the frontend sent empty arrays for `keyResponsibilities`, `deliverables`, `valueGoals`, etc.:
- The API would overwrite existing content with empty values
- This could happen due to race conditions, stale state, or form not fully loaded

### 3. **Overly Strict planPeriod Matching**
The `existingDraft` query required exact `planPeriod` string match. Format variations (e.g., "January 2025 - December 2025" vs "2025-01-01 - 2025-12-31") caused:
- Wrong draft to be matched, or no match
- Duplicate drafts being created
- Inconsistent behavior

### 4. **No Redirect to Existing Draft**
When employees clicked "Create Plan" with an existing draft:
- They were not redirected to edit their draft
- They would unknowingly overwrite their work on save

## Fixes Implemented

### API: `/api/hr/plans` (POST)

1. **Data loss prevention**
   - When an existing draft has content but the incoming payload is sparse/empty → return `redirectToExistingDraft: true` with existing plan ID instead of overwriting
   - Frontend redirects user to edit their existing draft

2. **Preservation on update**
   - `safeJsonField` helper: Only overwrite JSON fields when incoming has content
   - If incoming is empty array and existing has data → preserve existing
   - Applied to: deliverables, valueGoals, competencies, developmentNeeds

3. **Broader draft matching**
   - Match by `employeeId` + `planYear` only (removed strict `planPeriod` match)
   - Handles date format variations

4. **Preservation in update path (formData.id exists)**
   - Same logic: Don't overwrite deliverables/valueGoals/competencies/developmentNeeds with empty when existing has content
   - Only replace keyResponsibilities when incoming has content

### API: `/api/hr/performance/plans/[id]` (PUT)

- Same preservation logic for JSON fields
- Empty arrays no longer overwrite existing content

### Frontend: Create Plan Page

1. **Handle `redirectToExistingDraft`**
   - In `handleSaveDraft` and `handleSubmit`: When API returns this, redirect to edit URL
   - Prevents overwriting with empty form

2. **Check for existing draft on load**
   - When user lands on create page (no planId) for **self** (`isForCurrentUser`):
   - Fetch `/api/employee/performance/plans?year=currentYear`
   - If draft exists → redirect to edit it immediately
   - Prevents user from starting "new" when they have unsaved draft

3. **Restore from localStorage**
   - Also check `plan-draft-{id}` keys (not just `plan-draft-temp`)
   - If user has saved draft with ID in localStorage, redirect to edit it
   - Prevents losing work when navigating without planId in URL

## Files Modified

- `src/app/api/hr/plans/route.ts` - Main save logic, preservation, redirect response
- `src/app/api/hr/performance/plans/[id]/route.ts` - PUT preservation logic
- `src/app/hr/performance/plans/create/page.tsx` - Redirect handling, draft check, localStorage

## Testing Recommendations

1. **Create draft, navigate away, click Create again** → Should redirect to edit draft
2. **Create draft, close browser, reopen and Create** → Should redirect if localStorage has it, or API finds draft
3. **Fill in key responsibilities, save draft** → Reload page → Data should persist
4. **Empty form auto-save** → Should not overwrite existing draft (API returns redirect)
5. **HR creating plan for another employee** → Should work normally (draft check only for self)

## Backward Compatibility

- All changes are backward compatible
- Existing plans are unaffected
- Only behavior change: preventing accidental overwrites
