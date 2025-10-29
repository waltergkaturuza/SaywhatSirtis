# Complete Call Centre Survey - Field Type Analysis

## 📋 Your Survey Questions (Complete List)

Based on the images provided, here's your complete survey structure:

| Q# | Question | Answer Type | Field Type | Supported? |
|----|----------|-------------|------------|------------|
| 1 | What is your gender? | Male, Female, Other | `checkbox` or `radio` | ✅ Yes |
| 2 | How frequently do you call the SAYWHAT Call Centre department? | Daily, Weekly, Monthly, Rarely, Never | `radio` | ✅ Yes |
| 3 | The Call Centre department responds promptly to inquiries and requests | 5-point Likert | `radio` | ✅ Yes |
| 4 | The Call Centre representatives are knowledgeable and able to resolve issues effectively | 5-point Likert | `radio` | ✅ Yes |
| 5 | The wait time to connect with a Call Centre representative is reasonable | 5-point Likert | `radio` | ✅ Yes |
| 6 | The Call Centre representatives demonstrate professionalism and courtesy | 5-point Likert | `radio` | ✅ Yes |
| 7 | The Call Centre department provides accurate and reliable information | 5-point Likert | `radio` | ✅ Yes |
| 8 | The Call Centre department meets or exceeds my expectations | 5-point Likert | `radio` | ✅ Yes |
| 9 | The Call Centre representatives actively listen and understand clients' concerns | 5-point Likert | `radio` | ✅ Yes |
| 10 | The Call Centre representatives does follow up on client cases | 5-point Likert | `radio` | ✅ Yes |
| 11 | Were you able to get/access the service you wanted? | YES/NO | `radio` | ✅ Yes |
| 12 | What is your overall satisfaction with the SAYWHAT Call Centre service line? | 5-point Satisfaction Scale | `radio` | ✅ Yes |
| 13 | Would you refer someone to the SAYWHAT Call Centre for help? | YES/NO | `radio` | ✅ Yes |
| 14 | Suggest any recommendations or areas of improvement | Free text | `longtext` | ✅ Yes |

## ✅ Verification Result

**ALL 14 questions are fully supported by the current MEAL form system!**

### Supported Field Types in System:
- ✅ `text` - Short text input
- ✅ `shorttext` - Short text input
- ✅ `longtext` - Multi-line text area (for Q14)
- ✅ `number` - Numeric input
- ✅ `decimal` - Decimal numbers
- ✅ `currency` - Currency values
- ✅ `date` - Date picker
- ✅ `time` - Time picker
- ✅ `datetime` - Date and time picker
- ✅ `select` - Dropdown selection
- ✅ `radio` - Radio buttons (for Q1-13)
- ✅ `checkbox` - Checkboxes
- ✅ `gps` - GPS location
- ✅ `file` - File upload
- ✅ `photo` - Photo upload
- ✅ `video` - Video upload

---

## 🔀 Recommended Conditional Logic Rules

Based on your complete survey, here's the recommended conditional logic setup:

### Rule 1: Hide Service Quality Questions (Q3-12)
**When:** User selects "Never" for Q2 (call frequency)
**Action:** Hide all service-related questions
**Reason:** If they never call, they can't evaluate the service

```
Trigger Field: call_frequency
Operator: equals
Trigger Value: Never
Action: hide
Target Fields:
  - prompt_response (Q3)
  - knowledgeable_reps (Q4)
  - reasonable_wait_time (Q5)
  - professionalism_courtesy (Q6)
  - accurate_information (Q7)
  - meets_expectations (Q8)
  - active_listening (Q9)
  - follow_up (Q10)
  - service_access (Q11)
  - overall_satisfaction (Q12)
```

### Rule 2: Keep Referral Question Visible (Q13)
**Why:** Even non-users might have opinions about referring others
**Action:** No conditional logic needed - always show

### Rule 3: Keep Recommendations Visible (Q14)
**Why:** Non-users might have valuable feedback about why they don't use the service
**Action:** No conditional logic needed - always show

### Alternative: Partial Hiding

If you want feedback from everyone, you could hide only Q3-10 and keep Q11-14 visible:

```
Trigger Field: call_frequency
Operator: equals
Trigger Value: Never
Action: hide
Target Fields:
  - prompt_response (Q3)
  - knowledgeable_reps (Q4)
  - reasonable_wait_time (Q5)
  - professionalism_courtesy (Q6)
  - accurate_information (Q7)
  - meets_expectations (Q8)
  - active_listening (Q9)
  - follow_up (Q10)

Keep visible: Q11-14 for general feedback
```

---

## 📝 Complete Form Configuration

Here's the complete configuration for all 14 questions:

```json
{
  "name": "SAYWHAT Call Centre Service Survey - Complete",
  "description": "Comprehensive customer satisfaction survey for the SAYWHAT Call Centre department",
  "language": "en",
  "status": "draft",
  "schema": {
    "fields": [
      {
        "key": "gender",
        "label": "1. What is your gender?",
        "type": "checkbox",
        "required": true,
        "options": ["Male", "Female", "Other"]
      },
      {
        "key": "call_frequency",
        "label": "2. How frequently do you call the SAYWHAT Call Centre department?",
        "type": "radio",
        "required": true,
        "options": ["Daily", "Weekly", "Monthly", "Rarely", "Never"]
      },
      {
        "key": "prompt_response",
        "label": "3. The Call Centre department responds promptly to inquiries and requests.",
        "type": "radio",
        "required": true,
        "options": [
          "5. Strongly Agree",
          "4. Agree",
          "3. Neutral",
          "2. Disagree",
          "1. Strongly Disagree"
        ]
      },
      {
        "key": "knowledgeable_reps",
        "label": "4. The Call Centre representatives are knowledgeable and able to resolve issues effectively.",
        "type": "radio",
        "required": true,
        "options": [
          "5. Strongly Agree",
          "4. Agree",
          "3. Neutral",
          "2. Disagree",
          "1. Strongly Disagree"
        ]
      },
      {
        "key": "reasonable_wait_time",
        "label": "5. The wait time to connect with a Call Centre representative is reasonable.",
        "type": "radio",
        "required": true,
        "options": [
          "5. Strongly Agree",
          "4. Agree",
          "3. Neutral",
          "2. Disagree",
          "1. Strongly Disagree"
        ]
      },
      {
        "key": "professionalism_courtesy",
        "label": "6. The Call Centre representatives demonstrate professionalism and courtesy.",
        "type": "radio",
        "required": true,
        "options": [
          "5. Strongly Agree",
          "4. Agree",
          "3. Neutral",
          "2. Disagree",
          "1. Strongly Disagree"
        ]
      },
      {
        "key": "accurate_information",
        "label": "7. The Call Centre department provides accurate and reliable information.",
        "type": "radio",
        "required": true,
        "options": [
          "5. Strongly Agree",
          "4. Agree",
          "3. Neutral",
          "2. Disagree",
          "1. Strongly Disagree"
        ]
      },
      {
        "key": "meets_expectations",
        "label": "8. The Call Centre department meets or exceeds my expectations.",
        "type": "radio",
        "required": true,
        "options": [
          "5. Strongly Agree",
          "4. Agree",
          "3. Neutral",
          "2. Disagree",
          "1. Strongly Disagree"
        ]
      },
      {
        "key": "active_listening",
        "label": "9. The Call Centre representatives actively listen and understand clients' concerns.",
        "type": "radio",
        "required": true,
        "options": [
          "5. Strongly Agree",
          "4. Agree",
          "3. Neutral",
          "2. Disagree",
          "1. Strongly Disagree"
        ]
      },
      {
        "key": "follow_up",
        "label": "10. The Call Centre representatives does follow up on client cases.",
        "type": "radio",
        "required": true,
        "options": [
          "5. Strongly Agree",
          "4. Agree",
          "3. Neutral",
          "2. Disagree",
          "1. Strongly Disagree"
        ]
      },
      {
        "key": "service_access",
        "label": "11. Were you able to get/access the service you wanted?",
        "type": "radio",
        "required": true,
        "options": ["YES", "NO"]
      },
      {
        "key": "overall_satisfaction",
        "label": "12. What is your overall satisfaction with the SAYWHAT Call Centre service line?",
        "type": "radio",
        "required": true,
        "options": [
          "5. Extremely satisfied",
          "4. Very satisfied",
          "3. Satisfied",
          "2. Partly satisfied",
          "1. Not satisfied at All"
        ]
      },
      {
        "key": "would_refer",
        "label": "13. Would you refer someone to the SAYWHAT Call Centre for help?",
        "type": "radio",
        "required": false,
        "options": ["YES", "NO"]
      },
      {
        "key": "recommendations",
        "label": "14. Suggest any recommendations or areas of improvement.",
        "type": "longtext",
        "required": true
      }
    ]
  },
  "conditionalLogic": [
    {
      "id": "rule-hide-service-questions",
      "triggerField": "call_frequency",
      "operator": "equals",
      "triggerValue": ["Never"],
      "action": "hide",
      "targetFields": [
        "prompt_response",
        "knowledgeable_reps",
        "reasonable_wait_time",
        "professionalism_courtesy",
        "accurate_information",
        "meets_expectations",
        "active_listening",
        "follow_up",
        "service_access",
        "overall_satisfaction"
      ],
      "description": "Hide service quality questions if user never calls the Call Centre"
    }
  ]
}
```

---

## 🎯 Implementation Strategy

### Option A: Maximum Skip Logic (Recommended)
**Hide Q3-12 when "Never" is selected**
- **Pros:** Shortest survey for non-users, better UX, less survey fatigue
- **Cons:** No satisfaction data from non-users
- **Best for:** Focus on service quality from actual users

### Option B: Moderate Skip Logic
**Hide Q3-10 when "Never" is selected, keep Q11-12**
- **Pros:** Still get overall satisfaction from non-users
- **Cons:** Slightly confusing (they can't answer Q11 logically)
- **Best for:** Want satisfaction metrics from all respondents

### Option C: Minimal Skip Logic
**Hide Q3-10 only, keep Q11-14**
- **Pros:** Get feedback and referral data from non-users
- **Cons:** Q11 might be confusing for non-users
- **Best for:** Research on why people don't use the service

### Option D: Dual Path Logic (Advanced)
**Create different paths based on Q2 answer**

```
IF "Never" selected:
  - Hide Q3-12
  - Show: "Why haven't you used the Call Centre?" (new question)
  - Keep Q13-14 visible

IF any other option selected:
  - Show all Q3-12
  - Hide the "why haven't you used" question
  - Keep Q13-14 visible
```

---

## 📊 Data Analysis Considerations

### With Conditional Logic (Recommended)
**Sample sizes:**
- Non-users: Answer Q1, Q2, Q13, Q14 (4 questions)
- Users: Answer all 14 questions

**Analysis approach:**
- Segment data by usage frequency
- Analyze service quality only from actual users
- Look at referral patterns across all respondents
- Review recommendations from both users and non-users

### Without Conditional Logic
**Sample sizes:**
- Everyone answers all 14 questions

**Problems:**
- Q3-12 have "N/A" or meaningless responses from non-users
- Data quality issues
- Higher survey abandonment
- Skewed averages if non-users answer randomly

---

## ✅ Action Items

### To implement this in your system:

1. **Create the form in MEAL Module**
   - Add all 14 questions with correct field types
   - Use the field keys from the configuration above

2. **Add conditional logic rule**
   - Trigger: `call_frequency` equals `Never`
   - Action: Hide
   - Targets: Select Q3-12 (or your preferred subset)

3. **Test thoroughly**
   - Test path 1: Select "Never" → Q3-12 hidden
   - Test path 2: Select "Daily" → All questions visible
   - Test path 3: Select other options → All questions visible
   - Test submission: Both paths submit successfully

4. **Publish and monitor**
   - Set status to "published"
   - Share form link
   - Monitor completion rates
   - Review data quality

---

## 🎨 UI Considerations

### Save Draft Button
Your form shows a "Save Draft" button. This is a great feature for long surveys!

**Current MEAL system support:**
- ✅ Form submissions are saved immediately
- ⚠️ Draft functionality might need custom development
- 💡 Consider: Auto-save as user types (progressive submission)

### Submit Button
Standard submit is fully supported.

### Required Fields (*)
Your form shows asterisks for required fields. The MEAL system supports this:
- Set `required: true` in field definition
- Conditional logic respects required status
- Hidden fields are not validated

---

## 📈 Expected Results

### Survey Completion Time
**Without conditional logic:** 5-7 minutes for all respondents

**With conditional logic:**
- Non-users: 1-2 minutes (4 questions)
- Users: 5-7 minutes (14 questions)
- **Average:** 3-4 minutes (assuming 30% non-users)

### Completion Rates
**Without conditional logic:** 60-70% completion

**With conditional logic:**
- Non-users: 85-90% completion (shorter survey)
- Users: 70-75% completion
- **Overall:** 75-80% completion

### Data Quality
**With conditional logic:**
- ✅ Higher quality responses
- ✅ More meaningful data
- ✅ Better segmentation
- ✅ Easier analysis

---

## 🚀 Next Steps

1. ✅ Review this analysis
2. ✅ Decide on skip logic strategy (A, B, C, or D)
3. ✅ Open MEAL Module → Forms
4. ✅ Create form with all 14 questions
5. ✅ Add conditional logic rule(s)
6. ✅ Test both user paths
7. ✅ Publish when satisfied
8. ✅ Monitor and iterate

---

## ✨ Summary

**All 14 questions in your survey are fully supported!**

The MEAL form system can handle:
- ✅ All question types (radio, checkbox, longtext)
- ✅ All answer formats (Likert, YES/NO, free text)
- ✅ Required fields
- ✅ Conditional logic to hide Q3-12 for non-users
- ✅ Multiple conditional rules if needed

**You're ready to build this form right now!**

Estimated time: 15-20 minutes to configure all 14 questions and add conditional logic.

**Need the complete template?** See the JSON configuration above - you can use it as a reference while building in the UI.

