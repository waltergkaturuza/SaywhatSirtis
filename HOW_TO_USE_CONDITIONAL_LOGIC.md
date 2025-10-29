# How to Use Conditional Logic in MEAL Forms - Quick Start Guide

## 🎯 Your Specific Use Case: Call Centre Survey

You want to **hide questions 3, 4, and 5** when someone answers **"Never"** to question 2.

## ✅ Good News!
**This feature is already fully working in your system!** You don't need to install anything.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Navigate to MEAL Forms
1. Open your application
2. Go to **Programs** menu
3. Click on **MEAL Module** 
4. Select the **Forms** tab

### Step 2: Create or Edit Your Form
Either:
- Click **"+ Create New Form"** to start fresh
- Or click on an existing form to edit it

### Step 3: Set Up Conditional Logic

#### A. First, add all your questions:

**Question 1: Gender**
- Click "Add Field"
- Label: `What is your gender?`
- Type: `checkbox` or `radio`
- Options: `Male, Female, Other`
- Required: ✓

**Question 2: Call Frequency** (This is the TRIGGER question)
- Click "Add Field"  
- Label: `How frequently do you call the SAYWHAT Call Centre department?`
- Type: `radio`
- Options: `Daily, Weekly, Monthly, Rarely, Never`
- **Important:** Note or remember the field key (e.g., `call_frequency`)
- Required: ✓

**Question 3: Prompt Response** (TARGET question - will be hidden)
- Click "Add Field"
- Label: `The Call Centre department responds promptly to inquiries and requests.`
- Type: `radio`
- Options: `5. Strongly Agree, 4. Agree, 3. Neutral, 2. Disagree, 1. Strongly Disagree`
- Field key: `prompt_response`
- Required: ✗ (leave unchecked since it's conditional)

**Question 4: Knowledgeable Reps** (TARGET question - will be hidden)
- Same structure as Question 3
- Field key: `knowledgeable_reps`

**Question 5: Reasonable Wait Time** (TARGET question - will be hidden)
- Same structure as Question 3
- Field key: `reasonable_wait_time`

#### B. Now, add the conditional logic rule:

1. **Scroll down** to the **🔀 Conditional Logic** section
2. Click **"Show Rules"** button
3. Fill in the rule configuration:

```
┌─────────────────────────────────────────────────────┐
│  Trigger Field:     [call_frequency ▼]              │
│  Operator:          [Equals ▼]                      │
│  Trigger Value:     Never                           │
│  Action:            [Hide ▼]                        │
│  Target Fields:     ☑ prompt_response               │
│                     ☑ knowledgeable_reps            │
│                     ☑ reasonable_wait_time          │
└─────────────────────────────────────────────────────┘
        [Add Rule]
```

4. Click **"Add Rule"**
5. You should see the rule appear in the "Active Rules" list
6. Click **"Save Form"** or **"Update Form"**

---

## 🎬 How It Works When Someone Fills Out the Form

### Scenario 1: User selects "Never"
```
✓ Question 1: Gender appears
✓ Question 2: Call frequency appears → User selects "Never"
✗ Question 3: Prompt response HIDDEN
✗ Question 4: Knowledgeable reps HIDDEN
✗ Question 5: Wait time HIDDEN
✓ User can submit the form
```

### Scenario 2: User selects "Daily" (or Weekly/Monthly/Rarely)
```
✓ Question 1: Gender appears
✓ Question 2: Call frequency appears → User selects "Daily"
✓ Question 3: Prompt response SHOWN
✓ Question 4: Knowledgeable reps SHOWN
✓ Question 5: Wait time SHOWN
✓ User answers all questions and submits
```

---

## 📊 Visual Example

Here's what your rule will look like in the system:

**Active Rules:**
```
┌────────────────────────────────────────────────────────────────┐
│ call_frequency equals Never → hide prompt_response,            │
│                                 knowledgeable_reps,             │
│                                 reasonable_wait_time     [Remove]│
└────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Advanced Options

### Multiple Trigger Values
If you want to hide questions for BOTH "Never" AND "Rarely":

```
Trigger Value: Never, Rarely
```
(Separate multiple values with commas)

### Different Actions
Instead of "Hide", you can:
- **Show**: Only show the target fields when condition is met
- **Require**: Make fields required when condition is met  
- **Make Optional**: Remove required status when condition is met

### Multiple Rules
You can add as many rules as you need. For example:

**Rule 1:** Hide service questions if frequency is "Never"
**Rule 2:** Require detailed feedback if satisfaction is "Disagree" or "Strongly Disagree"
**Rule 3:** Show follow-up questions if wait time rating is low

---

## 🧪 Testing Your Form

After setting up conditional logic:

1. Save the form
2. Click **"Test Submission"** (or use the public form link)
3. Try selecting "Never" - questions 3, 4, 5 should disappear
4. Change selection to "Daily" - questions should reappear
5. Submit a test response to verify it works

---

## 📋 Troubleshooting

### Problem: Questions don't hide when I select "Never"

**Solution:**
1. ✓ Check that field keys match exactly (case-sensitive)
2. ✓ Ensure trigger value is typed exactly as it appears in options: `Never` not `never`
3. ✓ Verify you saved the form after adding the rule
4. ✓ Refresh the form submission page

### Problem: I can't find the field keys

**Solution:**
- Field keys are shown in the field list
- If not set manually, they're auto-generated from the label (e.g., "Call Frequency" → `call_frequency`)
- You can edit a field to see/change its key

### Problem: The "Conditional Logic" section doesn't appear

**Solution:**
- Make sure you have at least 2 fields in your form first
- The section appears below the field list in the form editor
- Click "Show Rules" to expand it

---

## 💡 Pro Tips

1. **Use Clear Field Keys**: Set meaningful keys like `call_frequency` instead of auto-generated ones
2. **Test Early**: Test conditional logic as soon as you add it
3. **Start Simple**: Begin with one rule, then add more as needed
4. **Document Your Logic**: Use the description field to explain complex rules

---

## 📱 Works On All Devices

The conditional logic works automatically on:
- ✓ Desktop browsers
- ✓ Tablets
- ✓ Mobile phones (including offline mode)
- ✓ Public form submissions

---

## 🔗 Related Features

Your system also supports:
- **Indicator Mapping**: Automatically update MEAL indicators from form submissions
- **GPS Location**: Auto-capture location data
- **File Uploads**: Attach photos/documents to responses
- **Multi-language**: Create forms in English, Shona, Ndebele

---

## 📞 Need More Help?

If you need assistance:
1. Check the full guide: `CONDITIONAL_LOGIC_GUIDE.md`
2. Use the template: `CALL_CENTRE_SURVEY_TEMPLATE.json`
3. Test with a simple 2-question form first
4. Contact your system administrator

---

## ✨ Summary

**Your call centre survey with conditional logic is ready to use!**

The system will automatically hide questions 3, 4, and 5 when someone answers "Never" to question 2. This creates a better user experience and reduces survey fatigue.

**Next steps:**
1. Create your form in the MEAL Module
2. Add the conditional logic rule (takes 2 minutes)
3. Test it
4. Publish and share the form link

That's it! 🎉

