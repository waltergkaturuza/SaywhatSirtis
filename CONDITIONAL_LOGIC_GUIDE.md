# Conditional Logic Guide for MEAL Forms

## Overview
Your MEAL forms system includes powerful conditional logic (skip logic) that allows you to show/hide questions based on previous answers. This creates a better user experience by only showing relevant questions.

## Your Use Case: Call Centre Survey

### Problem
If someone answers **"Never"** to "How frequently do you call the SAYWHAT Call Centre department?", they shouldn't see questions about:
- Call Centre response time
- Representative knowledge
- Wait time
- Other service quality questions

### Solution: Set Up Conditional Logic

## Step-by-Step Instructions

### 1. Access the MEAL Module
- Navigate to **Programs** → **MEAL Module**
- Click on the **Forms** tab

### 2. Create or Edit Your Form
- Click "Create New Form" or select an existing form to edit
- Add all your questions first:

**Question 1:** Gender
- Type: Radio
- Options: Male, Female, Other

**Question 2:** How frequently do you call the SAYWHAT Call Centre department?
- Type: Radio
- Options: Daily, Weekly, Monthly, Rarely, Never
- **Field Key:** `call_frequency` (important!)

**Question 3:** The Call Centre department responds promptly
- Type: Radio (Likert Scale)
- Options: 5. Strongly Agree, 4. Agree, 3. Neutral, 2. Disagree, 1. Strongly Disagree
- **Field Key:** `prompt_response`

**Question 4:** Representatives are knowledgeable
- Type: Radio (Likert Scale)
- Options: Same as above
- **Field Key:** `knowledgeable_reps`

**Question 5:** Wait time is reasonable
- Type: Radio (Likert Scale)
- Options: Same as above
- **Field Key:** `reasonable_wait_time`

### 3. Add Conditional Logic Rules

In the form editor, scroll down to the **🔀 Conditional Logic** section and click "Show Rules"

#### Rule 1: Hide Questions 3-5 if "Never" is selected

**Configure the rule:**
1. **Trigger Field:** Select "How frequently do you call..."
2. **Operator:** Select "Equals"
3. **Trigger Value:** Type `Never`
4. **Action:** Select "Hide"
5. **Target Fields:** Check the boxes for:
   - `prompt_response`
   - `knowledgeable_reps`
   - `reasonable_wait_time`
6. Click **"Add Rule"**

#### Alternative Rule: Only Show Questions 3-5 if Frequency is NOT "Never"

You could also reverse the logic:

1. **Trigger Field:** Select "How frequently do you call..."
2. **Operator:** Select "Not Equals"
3. **Trigger Value:** Type `Never`
4. **Action:** Select "Show"
5. **Target Fields:** Check the boxes for questions 3-5
6. Click **"Add Rule"**

### 4. Save the Form
Click **"Update Form"** to save your conditional logic rules

---

## Available Conditional Logic Features

### Operators
- **Equals:** Field value exactly matches the trigger value
- **Not Equals:** Field value doesn't match the trigger value
- **Contains:** Field value contains the trigger text
- **Greater Than:** Numeric comparison (field > trigger)
- **Less Than:** Numeric comparison (field < trigger)

### Actions
- **Show:** Display the target fields when condition is met
- **Hide:** Hide the target fields when condition is met
- **Require:** Make the target fields required when condition is met
- **Make Optional:** Make the target fields optional when condition is met

### Multiple Trigger Values
You can specify multiple trigger values separated by commas. For example:
- Trigger Value: `Never, Rarely`
- This will hide questions if the answer is either "Never" OR "Rarely"

---

## Advanced Examples

### Example 1: Progressive Disclosure
Hide detailed questions until basic questions are answered:

**Rule:**
- Trigger: "Are you satisfied with our service?" equals "No"
- Action: Show
- Targets: "What can we improve?", "How likely are you to switch providers?"

### Example 2: Skip to End
Skip all remaining questions if user opts out:

**Rule:**
- Trigger: "Do you wish to continue this survey?" equals "No"
- Action: Hide
- Targets: All remaining question fields

### Example 3: Required Fields Based on Context
Make fields required only when relevant:

**Rule:**
- Trigger: "Employment Status" equals "Employed"
- Action: Require
- Targets: "Employer Name", "Occupation"

---

## How It Works Technically

1. **Storage:** Conditional rules are stored as JSON in the `conditional_logic` column of the `meal_forms` table

2. **Evaluation:** When a form is displayed, the system evaluates each rule in real-time based on user input

3. **Rendering:** Fields that should be hidden are not rendered in the DOM at all (better performance)

4. **Validation:** Required field validation respects conditional logic - hidden fields are not required

---

## Testing Your Conditional Logic

After setting up your rules:

1. **Save the form**
2. **Open the form in submission mode** (click "Test Submission" or access via public link)
3. **Try different answers** to the trigger question
4. **Verify** that the target questions appear/disappear correctly

---

## Tips & Best Practices

✅ **DO:**
- Use clear, memorable field keys (e.g., `call_frequency`, not `question_2`)
- Test all possible paths through your form
- Use "Hide" for questions that should only appear sometimes
- Use "Require" to dynamically make fields mandatory

❌ **DON'T:**
- Create circular logic (Field A shows Field B, Field B hides Field A)
- Make complex nested dependencies without testing
- Forget to save the form after adding rules

---

## Database Schema

For reference, here's what the conditional logic data structure looks like:

```json
[
  {
    "id": "uuid-here",
    "triggerField": "call_frequency",
    "operator": "equals",
    "triggerValue": ["Never"],
    "action": "hide",
    "targetFields": ["prompt_response", "knowledgeable_reps", "reasonable_wait_time"]
  }
]
```

This is automatically managed by the UI - you don't need to edit JSON directly.

---

## Need Help?

If you encounter issues:
1. Check that field keys are unique and correctly spelled
2. Verify that the trigger values match exactly (case-sensitive)
3. Test the form in submission mode to see real-time behavior
4. Check browser console for any errors

---

## Future Enhancements

The system can be extended to support:
- Formula-based conditions
- Date/time-based logic
- Geographic/location-based logic
- Cross-form dependencies

Let us know if you need any of these features!

