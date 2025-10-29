# Conditional Logic - Quick Reference Card

## 🎯 What You Want to Do
**Hide questions 3, 4, 5 when someone answers "Never" to question 2 about Call Centre frequency**

---

## ✅ Step-by-Step (5 Minutes)

### 1️⃣ Open Form Editor
- Navigate: **Programs → MEAL Module → Forms Tab**
- Click: **Create New Form** or select existing form

### 2️⃣ Add Your Questions
```
Question 1: Gender [Radio/Checkbox]
Question 2: Call Frequency [Radio] ← TRIGGER FIELD
  Options: Daily, Weekly, Monthly, Rarely, Never
  Field Key: call_frequency

Question 3: Prompt Response [Radio] ← TARGET FIELD
Question 4: Knowledgeable Reps [Radio] ← TARGET FIELD  
Question 5: Reasonable Wait Time [Radio] ← TARGET FIELD
```

### 3️⃣ Add Conditional Logic Rule
Scroll down to **🔀 Conditional Logic** section, click "Show Rules"

```
╔═══════════════════════════════════════╗
║ TRIGGER                               ║
║ ─────────────────────────────────────║
║ Field:  call_frequency               ║
║ When:   equals                       ║
║ Value:  Never                        ║
║                                      ║
║ ACTION                               ║
║ ─────────────────────────────────────║
║ Do:     Hide                         ║
║                                      ║
║ TARGETS                              ║
║ ─────────────────────────────────────║
║ ☑ prompt_response                    ║
║ ☑ knowledgeable_reps                 ║
║ ☑ reasonable_wait_time               ║
╚═══════════════════════════════════════╝
```

Click **Add Rule** → Click **Save Form**

### 4️⃣ Test It
- Click **Test Submission**
- Select "Never" → Questions 3, 4, 5 disappear ✓
- Select "Daily" → Questions 3, 4, 5 appear ✓

---

## 🔑 Key Concepts

| Element | Description | Example |
|---------|-------------|---------|
| **Trigger Field** | The question that controls visibility | "How frequently do you call?" |
| **Operator** | How to compare values | equals, not equals, contains |
| **Trigger Value** | The answer that activates the rule | "Never" |
| **Action** | What to do when triggered | Hide, Show, Require |
| **Target Fields** | Which questions to affect | Questions 3, 4, 5 |

---

## 📐 Available Operators

| Operator | Use Case | Example |
|----------|----------|---------|
| **Equals** | Exact match | Frequency = "Never" |
| **Not Equals** | Opposite match | Frequency ≠ "Never" |
| **Contains** | Partial match | Comment contains "bad" |
| **Greater Than** | Numeric comparison | Age > 18 |
| **Less Than** | Numeric comparison | Score < 50 |

---

## 🎬 Available Actions

| Action | Effect | Example Use |
|--------|--------|-------------|
| **Hide** | Remove fields from view | Hide service questions for non-users |
| **Show** | Display fields | Show follow-up for dissatisfied users |
| **Require** | Make fields mandatory | Require details if issue reported |
| **Make Optional** | Remove required status | Optional feedback for satisfied users |

---

## 💡 Common Patterns

### Pattern 1: Skip Irrelevant Questions
```
IF user_type = "Not Applicable"
THEN Hide all_detailed_questions
```

### Pattern 2: Require Follow-up
```
IF satisfaction = "Dissatisfied"
THEN Require explanation_field
```

### Pattern 3: Show Based on Multiple Values
```
IF frequency = "Never" OR "Rarely"
THEN Hide service_quality_questions
```
*Trigger Value: `Never, Rarely` (comma-separated)*

### Pattern 4: Progressive Disclosure
```
IF interested = "Yes"
THEN Show detailed_questions
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Questions don't hide | Check field keys match exactly (case-sensitive) |
| Can't find Conditional Logic section | Add at least 2 fields first |
| Rule doesn't save | Ensure all required fields filled |
| Multiple values not working | Use comma separation: `Never, Rarely` |

---

## 📱 Where It Works

✓ Web browsers (Chrome, Firefox, Safari, Edge)
✓ Mobile devices (iOS, Android)  
✓ Tablets
✓ Offline mode (rules evaluated client-side)
✓ Public form submissions

---

## 🎨 Visual Flow Example

```
┌─────────────────────────────────────┐
│ 1. What is your gender?             │
│    ○ Male  ○ Female  ○ Other        │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ 2. How often do you call?           │
│    ○ Daily  ○ Weekly  ● Never       │  ← User selects "Never"
└─────────────────────────────────────┘
         ↓
    [CONDITIONAL LOGIC TRIGGERED]
         ↓
┌─────────────────────────────────────┐
│ Questions 3, 4, 5 are HIDDEN        │
│ (Not shown in form)                 │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ [Submit] button enabled             │
└─────────────────────────────────────┘
```

**If user selects "Daily" instead:**
```
┌─────────────────────────────────────┐
│ 2. How often do you call?           │
│    ● Daily  ○ Weekly  ○ Never       │  ← User selects "Daily"
└─────────────────────────────────────┘
         ↓
    [CONDITIONAL LOGIC NOT TRIGGERED]
         ↓
┌─────────────────────────────────────┐
│ 3. Prompt response? [Likert Scale]  │  ← SHOWN
│ 4. Knowledgeable reps? [Likert]     │  ← SHOWN
│ 5. Wait time? [Likert]              │  ← SHOWN
└─────────────────────────────────────┘
```

---

## 📋 Checklist Before Publishing

- [ ] All questions added with clear labels
- [ ] Field keys are set (especially for trigger field)
- [ ] Conditional rule added and saved
- [ ] Form tested with different answer combinations
- [ ] Rule appears in "Active Rules" list
- [ ] Form status set to "Published"
- [ ] Public link tested on mobile device

---

## 🚀 Ready to Start?

1. Open your MEAL Module now
2. Create your Call Centre survey
3. Add the conditional logic rule
4. Test it once
5. Publish and share!

**Time needed:** 5-10 minutes

---

## 📚 More Information

- **Full Guide**: See `CONDITIONAL_LOGIC_GUIDE.md`
- **Template**: Import `CALL_CENTRE_SURVEY_TEMPLATE.json`
- **How-To**: Read `HOW_TO_USE_CONDITIONAL_LOGIC.md`

---

## ✨ Remember

**The feature is already working in your system!**

No installation, no configuration, no coding needed.

Just:
1. Create form
2. Add rule
3. Test
4. Publish

**That's it!** 🎉

