# Visual Guide: Where to Find Conditional Logic in the UI

## 📍 Navigation Path

```
Home Screen
    ↓
Programs (Main Menu)
    ↓
MEAL Module
    ↓
Forms Tab (Click here)
    ↓
Create New Form / Edit Existing Form
    ↓
Scroll to: 🔀 Conditional Logic Section
```

---

## 🖥️ Form Editor Layout

When you open the form editor, you'll see this layout:

```
┌────────────────────────────────────────────────────────────────┐
│  📋 Edit MEAL Form                                     [✕ Close]│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Form Name: _______________________________________________    │
│  Description: ___________________________________________      │
│  Status: [Draft ▼]  Language: [English ▼]                     │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│  📝 Form Fields                                                │
│  ┌──────────────────────────────────────────────────┐         │
│  │ 1. Gender [Text]                          [Edit] │         │
│  │ 2. Call Frequency [Radio]                 [Edit] │         │
│  │ 3. Prompt Response [Radio]                [Edit] │         │
│  │ 4. Knowledgeable Reps [Radio]             [Edit] │         │
│  │ 5. Reasonable Wait Time [Radio]           [Edit] │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
│  [+ Add Field]                                                 │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│  🔀 Conditional Logic                    [Show Rules] [Hide]   │  ← LOOK HERE!
├────────────────────────────────────────────────────────────────┤
│  (Click "Show Rules" to expand this section)                   │
│                                                                 │
│  When Expanded:                                                │
│  ┌──────────────────────────────────────────────────┐         │
│  │ Trigger Field:    [call_frequency ▼]             │         │
│  │ Operator:         [Equals ▼]                     │         │
│  │ Trigger Value:    [Never____________]            │         │
│  │ Action:           [Hide ▼]                       │         │
│  │ Target Fields:                                   │         │
│  │   ☐ gender                                       │         │
│  │   ☐ call_frequency                               │         │
│  │   ☑ prompt_response                              │         │
│  │   ☑ knowledgeable_reps                           │         │
│  │   ☑ reasonable_wait_time                         │         │
│  │                                                   │         │
│  │                              [Add Rule]           │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
│  Active Rules:                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │ call_frequency equals Never → hide               │         │
│  │   prompt_response, knowledgeable_reps,           │         │
│  │   reasonable_wait_time                  [Remove] │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│  📊 Indicator Mapping                  [Show Mappings] [Hide]  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Update Form]  [Cancel]                                       │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔍 The Conditional Logic Section Expanded

Here's what you'll see inside the Conditional Logic section:

```
╔══════════════════════════════════════════════════════════════════╗
║  🔀 CONDITIONAL LOGIC                           [Hide Rules] ▼    ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─── Configure New Rule ──────────────────────────────────────┐ ║
║  │                                                              │ ║
║  │  Trigger Field:        Operator:                            │ ║
║  │  ┌──────────────────┐  ┌──────────────┐                    │ ║
║  │  │ call_frequency ▼ │  │ equals     ▼ │                    │ ║
║  │  └──────────────────┘  └──────────────┘                    │ ║
║  │                                                              │ ║
║  │  Trigger Value (comma separated for multiple):              │ ║
║  │  ┌──────────────────────────────────────────────────────┐  │ ║
║  │  │ Never                                                 │  │ ║
║  │  └──────────────────────────────────────────────────────┘  │ ║
║  │                                                              │ ║
║  │  Action:               Target Fields:                       │ ║
║  │  ┌──────────────────┐                                      │ ║
║  │  │ hide           ▼ │  Select which fields to affect:      │ ║
║  │  └──────────────────┘  ┌──────────────────────────────┐   │ ║
║  │                         │ ☐ gender                     │   │ ║
║  │                         │ ☐ call_frequency             │   │ ║
║  │  Other Action Options:  │ ☑ prompt_response            │   │ ║
║  │  • show                 │ ☑ knowledgeable_reps         │   │ ║
║  │  • hide                 │ ☑ reasonable_wait_time       │   │ ║
║  │  • require              │ ☐ additional_comments        │   │ ║
║  │  • optional             │                              │   │ ║
║  │                         └──────────────────────────────┘   │ ║
║  │                                                              │ ║
║  │                                        [Add Rule]            │ ║
║  └──────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  ┌─── Active Rules ─────────────────────────────────────────────┐ ║
║  │                                                              │ ║
║  │  ✓ call_frequency equals Never → hide                      │ ║
║  │    prompt_response, knowledgeable_reps,                    │ ║
║  │    reasonable_wait_time                         [Remove]    │ ║
║  │                                                              │ ║
║  └──────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 🎯 Field Dropdown Contents

When you click on "Trigger Field" or select "Target Fields", you'll see your form's fields:

```
┌─────────────────────────────┐
│ Select trigger field...      │  ← Default option
├─────────────────────────────┤
│ gender                       │  ← Your fields appear here
│ call_frequency               │
│ prompt_response              │
│ knowledgeable_reps           │
│ reasonable_wait_time         │
│ additional_comments          │
└─────────────────────────────┘
```

---

## 📋 Operator Dropdown

```
┌─────────────────────────────┐
│ Equals                       │  ← Select this for exact match
│ Not Equals                   │
│ Contains                     │
│ Greater Than                 │
│ Less Than                    │
└─────────────────────────────┘
```

---

## 🎬 Action Dropdown

```
┌─────────────────────────────┐
│ Show                         │
│ Hide                         │  ← Select this to hide fields
│ Require                      │
│ Make Optional                │
└─────────────────────────────┘
```

---

## 📱 What the Form Looks Like to Users

### Before Answering Question 2:
```
┌────────────────────────────────────────────┐
│  SAYWHAT Call Centre Service Survey        │
├────────────────────────────────────────────┤
│                                             │
│  1. What is your gender? *                 │
│     ○ Male  ○ Female  ○ Other              │
│                                             │
│  2. How frequently do you call the         │
│     SAYWHAT Call Centre department? *      │
│     ○ Daily                                 │
│     ○ Weekly                                │
│     ○ Monthly                               │
│     ○ Rarely                                │
│     ○ Never                                 │
│                                             │
│  3. The Call Centre department responds    │
│     promptly to inquiries and requests.    │
│     ○ 5. Strongly Agree                    │
│     ○ 4. Agree                             │
│     ○ 3. Neutral                           │
│     ○ 2. Disagree                          │
│     ○ 1. Strongly Disagree                 │
│                                             │
│  4. The Call Centre representatives are    │
│     knowledgeable...                       │
│     ○ 5. Strongly Agree                    │
│     ...                                    │
│                                             │
│  5. The wait time to connect with a        │
│     Call Centre representative...          │
│     ○ 5. Strongly Agree                    │
│     ...                                    │
│                                             │
│  [Submit Form]                             │
└────────────────────────────────────────────┘
```

### After Selecting "Never" on Question 2:
```
┌────────────────────────────────────────────┐
│  SAYWHAT Call Centre Service Survey        │
├────────────────────────────────────────────┤
│                                             │
│  1. What is your gender? *                 │
│     ○ Male  ○ Female  ○ Other              │
│                                             │
│  2. How frequently do you call the         │
│     SAYWHAT Call Centre department? *      │
│     ○ Daily                                 │
│     ○ Weekly                                │
│     ○ Monthly                               │
│     ○ Rarely                                │
│     ● Never                                 │  ← User selected this
│                                             │
│  [Questions 3, 4, 5 are HIDDEN]            │  ← Automatically hidden!
│                                             │
│  [Submit Form]                             │  ← Can submit immediately
└────────────────────────────────────────────┘
```

---

## ✨ Key UI Elements

| Element | Location | Purpose |
|---------|----------|---------|
| **"Show Rules" button** | Next to "🔀 Conditional Logic" heading | Expands the rule configuration panel |
| **Trigger Field dropdown** | Top left of rule config | Select which question controls the logic |
| **Operator dropdown** | Top right of rule config | Choose how to compare values |
| **Trigger Value textbox** | Middle of rule config | Type the value that triggers the rule |
| **Action dropdown** | Bottom left of rule config | Choose what happens when triggered |
| **Target Fields checkboxes** | Bottom right of rule config | Select which fields to show/hide/require |
| **"Add Rule" button** | Bottom of rule config | Saves the current rule |
| **Active Rules list** | Below rule config | Shows all saved rules |
| **"Remove" button** | Right side of each active rule | Deletes a specific rule |

---

## 🎨 Color Coding in the UI

- **Orange buttons**: Primary actions (Add Rule, Update Form)
- **Green buttons**: Secondary actions (Show Mappings)
- **Red text**: Required fields marked with *
- **Gray background**: Active rules display area
- **Green text** in rules: Action description (e.g., "hide")

---

## 📍 Location in Main Interface

```
Main Navigation Bar
─────────────────────────────────────────────────────────────
Home | Dashboard | Programs | Call Centre | HR | Documents | ...
              ↑
         [Click here]

Programs Page
─────────────────────────────────────────────────────────────
Projects | MEAL Module | Other Modules
           ↑
      [Click here]

MEAL Module Tabs
─────────────────────────────────────────────────────────────
Forms | Submissions | Indicators | Dashboards | Repository | ...
  ↑
[You are here]

Forms Tab Content
─────────────────────────────────────────────────────────────
[+ Create New Form]

Existing Forms List:
• Call Centre Survey              [View] [Edit] [Delete]
• Beneficiary Registration        [View] [Edit] [Delete]
• ...
    ↑
[Click Edit to open form editor]

Form Editor (This is where you configure conditional logic!)
```

---

## 💡 Visual Tips

### Finding the Conditional Logic Section

1. **Scroll down** in the form editor - it's below the fields list
2. Look for the **🔀 icon** - that's the conditional logic section
3. If you see **"Hide Rules"** instead of "Show Rules", the section is already expanded
4. The section is **collapsible** to save space

### Verifying Your Rule Was Added

✅ **You'll know it worked when:**
- The rule appears in the "Active Rules" list
- You can see the rule summary: `trigger → action targets`
- A "Remove" button appears next to the rule

❌ **Signs something went wrong:**
- "Active Rules" list is empty after clicking "Add Rule"
- No rule appears
- Error message displayed

**If this happens:**
- Make sure you filled in all fields
- Check that you selected at least one target field
- Verify the trigger field is selected

---

## 🚀 Quick Access Tip

**Keyboard shortcut when form editor is open:**
- Press **Escape (Esc)** to close the form editor
- Scroll with **mouse wheel** or **Page Down** to reach Conditional Logic section quickly

---

## ✅ Final Checklist

Before you leave the form editor, verify:

- [ ] Your rule shows in "Active Rules" list
- [ ] Target fields are listed correctly in the rule
- [ ] You clicked "Update Form" or "Save Form" to persist changes
- [ ] You see a success message confirming the save

---

## 📸 What to Look For (Summary)

```
Look for this heading:
🔀 Conditional Logic                    [Show Rules]
                                            ↑
                                     Click this!

After clicking, you'll see:
📦 Rule configuration panel with dropdowns and checkboxes
📋 Active Rules list showing your saved rules

That's it! You're in the right place. 🎉
```

---

## Need Help Finding It?

If you can't locate the Conditional Logic section:

1. ✓ Make sure you're in the **form editor** (not just viewing forms)
2. ✓ Check that you have **at least 2 fields** in your form
3. ✓ **Scroll down** - it's below the "Add Field" button
4. ✓ Look for the **🔀 icon** or "Conditional Logic" text
5. ✓ Try refreshing the page and opening the form again

Still can't find it? You might need to:
- Update your browser to the latest version
- Clear browser cache
- Check that you have admin/MEAL_ADMIN permissions

---

**You're all set!** The UI is straightforward and intuitive once you know where to look. 🚀

