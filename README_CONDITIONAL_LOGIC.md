# 🎯 Conditional Logic for MEAL Forms - Complete Documentation Package

## 📌 Quick Answer to Your Question

**Question:** *"Can we have conditional logic so that if someone answers 'Never' to the Call Centre frequency question, the irrelevant questions won't be asked?"*

**Answer:** ✅ **YES! This feature already exists and is fully functional in your system.**

---

## 🚀 Get Started in 3 Steps

### 1️⃣ Read the Quick Guide (5 min)
Open: **`HOW_TO_USE_CONDITIONAL_LOGIC.md`**
- Step-by-step instructions
- Perfect for beginners
- Includes your exact Call Centre survey example

### 2️⃣ Use the Template (2 min)
Import: **`CALL_CENTRE_SURVEY_TEMPLATE.json`**
- Pre-configured Call Centre survey
- Conditional logic already set up
- Just customize and publish

### 3️⃣ Test It (3 min)
- Open MEAL Module → Forms Tab
- Create or import the form
- Click "Test Submission"
- Try selecting "Never" vs "Daily"

**Total Time: 10 minutes to working form!** ⏱️

---

## 📚 Documentation Files

### For End Users
| Document | Best For | Read Time |
|----------|----------|-----------|
| **HOW_TO_USE_CONDITIONAL_LOGIC.md** | New users, step-by-step guide | 10 min |
| **CONDITIONAL_LOGIC_QUICK_REFERENCE.md** | Quick lookup, cheat sheet | 5 min |
| **CONDITIONAL_LOGIC_SCREENSHOT_GUIDE.md** | Visual learners, UI walkthrough | 10 min |

### For Administrators
| Document | Best For | Read Time |
|----------|----------|-----------|
| **CONDITIONAL_LOGIC_GUIDE.md** | Complete feature documentation | 20 min |
| **CALL_CENTRE_SURVEY_TEMPLATE.json** | Ready-to-use template | 2 min |
| **CONDITIONAL_LOGIC_IMPLEMENTATION_SUMMARY.md** | Technical details | 15 min |

### For Developers
| Document | Best For | Read Time |
|----------|----------|-----------|
| **CONDITIONAL_LOGIC_IMPLEMENTATION_SUMMARY.md** | Architecture, code references | 20 min |
| Source Code: `src/components/programs/MealModule.tsx` | Implementation details | 30 min |
| Database: `prisma/schema.prisma` | Schema structure | 10 min |

---

## 🎓 Learning Paths

### Path 1: "Just Make It Work" (10 minutes)
```
1. Open HOW_TO_USE_CONDITIONAL_LOGIC.md
2. Follow Step 1, 2, 3
3. Test your form
4. Publish
```
**You're done!** ✅

### Path 2: "I Want to Understand It" (30 minutes)
```
1. Read CONDITIONAL_LOGIC_GUIDE.md
2. Review CONDITIONAL_LOGIC_SCREENSHOT_GUIDE.md
3. Create a test form from scratch
4. Experiment with different rules
5. Keep CONDITIONAL_LOGIC_QUICK_REFERENCE.md handy
```

### Path 3: "I'm a Developer" (1 hour)
```
1. Read CONDITIONAL_LOGIC_IMPLEMENTATION_SUMMARY.md
2. Review source code in MealModule.tsx
3. Understand database schema
4. Experiment with API endpoints
5. Test edge cases
```

---

## 🎯 Your Specific Use Case: Call Centre Survey

### The Problem
You have a survey with 5 questions:
1. Gender
2. Call frequency (Daily, Weekly, Monthly, Rarely, Never)
3. Prompt response (Likert scale)
4. Knowledgeable reps (Likert scale)
5. Reasonable wait time (Likert scale)

**If someone selects "Never" for question 2, questions 3-5 are irrelevant.**

### The Solution
Use conditional logic to **automatically hide questions 3, 4, and 5** when "Never" is selected.

### How to Implement
```
1. Create form with all 5 questions
2. Add conditional rule:
   - Trigger: call_frequency = "Never"
   - Action: Hide
   - Targets: questions 3, 4, 5
3. Save and test
```

**Detailed instructions:** See `HOW_TO_USE_CONDITIONAL_LOGIC.md`

**Pre-made template:** Import `CALL_CENTRE_SURVEY_TEMPLATE.json`

---

## ✨ Key Features

### What Conditional Logic Can Do

✅ **Hide/Show Questions**
- Hide irrelevant questions based on previous answers
- Show follow-up questions only when needed

✅ **Dynamic Requirements**
- Make fields required conditionally
- Remove required status based on context

✅ **Multiple Triggers**
- Respond to multiple answer values (e.g., "Never" OR "Rarely")
- Combine multiple rules for complex logic

✅ **Real-time Updates**
- Questions appear/disappear instantly as user types
- No page reload needed

✅ **Universal Support**
- Works on desktop, tablet, mobile
- Functions offline
- Supports public forms

---

## 🎬 How It Works (Simple Explanation)

```
┌─────────────────────────────────────┐
│ User answers Question 2:            │
│ "How often do you call?"            │
│                                     │
│ Selects: [●] Never                  │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ System checks conditional rules:    │
│                                     │
│ IF call_frequency = "Never"         │
│ THEN hide questions 3, 4, 5         │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Questions 3, 4, 5 disappear         │
│ User can submit immediately         │
└─────────────────────────────────────┘
```

**No coding required!** Everything is configured through the UI.

---

## 🛠️ Where to Find It

### Step-by-step Navigation:
```
1. Open your application
2. Click "Programs" in main menu
3. Select "MEAL Module"
4. Click "Forms" tab
5. Create new form or edit existing
6. Scroll down to "🔀 Conditional Logic" section
7. Click "Show Rules"
8. Configure your rule
9. Click "Add Rule"
10. Save the form
```

**Visual guide:** See `CONDITIONAL_LOGIC_SCREENSHOT_GUIDE.md`

---

## 📊 Feature Comparison

| Feature | Available? | Notes |
|---------|-----------|-------|
| Hide/Show fields | ✅ Yes | Real-time dynamic hiding |
| Conditional required fields | ✅ Yes | Make fields required based on logic |
| Multiple triggers (OR logic) | ✅ Yes | Comma-separated values |
| Multiple rules per form | ✅ Yes | Unlimited rules |
| Nested dependencies | ✅ Yes | Use with caution |
| AND logic | ⚠️ Partial | Use multiple rules |
| Regular expressions | ❌ No | Use "contains" operator |
| Date comparisons | ⚠️ Limited | Convert to numeric |

**For your Call Centre survey:** All needed features are available! ✅

---

## ⚙️ Technical Specifications

### Database
- **Table:** `meal_forms`
- **Column:** `conditional_logic` (JSONB)
- **Index:** GIN index for fast queries

### API Endpoints
- **GET** `/api/meal/forms` - List forms with rules
- **GET** `/api/meal/forms/[id]` - Get form with rules
- **POST** `/api/meal/forms` - Create form with rules
- **PUT** `/api/meal/forms/[id]` - Update form with rules

### Frontend
- **Component:** `MealModule.tsx`
- **State Management:** React hooks
- **Evaluation:** Client-side, real-time

---

## 🧪 Testing Your Implementation

### Basic Test
```
1. Create form with 2 questions:
   Q1: "Do you want dessert?" (Yes/No)
   Q2: "Which dessert?" (Ice cream, Cake, Fruit)

2. Add rule:
   - Trigger: Q1 = "No"
   - Action: Hide
   - Target: Q2

3. Test:
   - Select "No" → Q2 disappears ✓
   - Select "Yes" → Q2 appears ✓
```

### Call Centre Survey Test
```
1. Import CALL_CENTRE_SURVEY_TEMPLATE.json
2. Test submission form
3. Select "Never" on Q2 → Q3, Q4, Q5 hidden ✓
4. Select "Daily" on Q2 → Q3, Q4, Q5 shown ✓
5. Submit form → Success ✓
```

---

## 🎓 Common Scenarios

### Scenario 1: Skip to End
**Use case:** User opts out of survey

**Solution:**
```
Trigger: "Continue survey?" = "No"
Action: Hide
Targets: All remaining questions
```

### Scenario 2: Progressive Disclosure
**Use case:** Show details only for interested users

**Solution:**
```
Trigger: "Interest level" = "High"
Action: Show
Targets: Detailed questions
```

### Scenario 3: Context-based Validation
**Use case:** Require documentation for certain answers

**Solution:**
```
Trigger: "Issue reported?" = "Yes"
Action: Require
Targets: Description field, Photo upload
```

---

## 💡 Best Practices

### ✅ Do This:
- Use clear, descriptive field keys
- Test all possible answer combinations
- Keep rules simple and logical
- Document complex rule sets
- Use the "Hide" action for skip logic

### ❌ Don't Do This:
- Create circular dependencies (A shows B, B hides A)
- Use too many nested rules (hard to maintain)
- Forget to test on mobile devices
- Make all fields conditionally required (confusing)
- Skip testing before publishing

---

## 🐛 Troubleshooting

### Quick Fixes

| Problem | Fix |
|---------|-----|
| Rules don't work | Check field keys match exactly |
| Can't find section | Scroll down in form editor |
| Changes don't save | Click "Update Form" button |
| Questions still show | Hard refresh browser (Ctrl+F5) |
| Multiple values fail | Use comma separation: `Never, Rarely` |

**Detailed troubleshooting:** See `CONDITIONAL_LOGIC_IMPLEMENTATION_SUMMARY.md`

---

## 📞 Getting Help

### Self-Service Resources
1. 📖 Read the documentation files (you're here!)
2. 🔍 Check the troubleshooting sections
3. 🧪 Test with simple examples first
4. 📋 Review the templates

### When to Ask for Help
- After trying the troubleshooting guide
- When you need a complex custom rule
- If you find a bug
- For training assistance

### Who to Contact
- **Form creators:** Your MEAL administrator
- **Technical issues:** System administrator
- **Custom development:** Development team

---

## 📅 Next Steps

### Today (10 minutes)
- [ ] Read `HOW_TO_USE_CONDITIONAL_LOGIC.md`
- [ ] Open MEAL Module in your system
- [ ] Import or create the Call Centre survey
- [ ] Add the conditional logic rule
- [ ] Test it works

### This Week (30 minutes)
- [ ] Review `CONDITIONAL_LOGIC_GUIDE.md`
- [ ] Create additional forms with conditional logic
- [ ] Train team members
- [ ] Gather feedback from users

### This Month
- [ ] Analyze form submission patterns
- [ ] Optimize rules based on usage
- [ ] Explore indicator mapping feature
- [ ] Consider advanced use cases

---

## 🎉 Success Metrics

**You'll know it's working when:**
✅ Users spend less time on irrelevant questions
✅ Survey completion rates increase
✅ Data quality improves (fewer N/A responses)
✅ User feedback is positive
✅ Form logic matches your business rules

---

## 🏆 Benefits

### For Users
- ✅ Faster form completion
- ✅ Less confusion
- ✅ Better experience
- ✅ More relevant questions

### For You
- ✅ Higher quality data
- ✅ Better response rates
- ✅ Easier data analysis
- ✅ More professional forms

### For Organization
- ✅ Improved efficiency
- ✅ Better insights
- ✅ Cost savings (less time wasted)
- ✅ Modern, adaptive systems

---

## 📦 What's Included in This Package

### Documentation
- ✅ 6 comprehensive guides
- ✅ Visual UI walkthrough
- ✅ Technical implementation details
- ✅ Quick reference card
- ✅ This README file

### Templates
- ✅ Call Centre survey template
- ✅ Example rules and configurations
- ✅ Test scenarios

### Code
- ✅ Fully functional implementation
- ✅ Database schema
- ✅ API endpoints
- ✅ Frontend components

**Everything you need to start using conditional logic today!**

---

## ✨ Final Words

**Congratulations!** You have a powerful, fully-functional conditional logic system at your fingertips.

Your Call Centre survey with smart question hiding can be up and running in **less than 10 minutes**.

**Just follow these steps:**
1. Open `HOW_TO_USE_CONDITIONAL_LOGIC.md`
2. Follow the instructions
3. Test your form
4. Publish and share

**That's it!** 🚀

No coding, no installation, no complex configuration. Just simple, intuitive form building with smart conditional logic.

---

## 📖 Documentation Index

| File | Purpose | Time |
|------|---------|------|
| `README_CONDITIONAL_LOGIC.md` | **START HERE** - Overview | 5 min |
| `HOW_TO_USE_CONDITIONAL_LOGIC.md` | Step-by-step tutorial | 10 min |
| `CONDITIONAL_LOGIC_QUICK_REFERENCE.md` | Quick lookup guide | 5 min |
| `CONDITIONAL_LOGIC_SCREENSHOT_GUIDE.md` | Visual UI guide | 10 min |
| `CONDITIONAL_LOGIC_GUIDE.md` | Complete documentation | 20 min |
| `CONDITIONAL_LOGIC_IMPLEMENTATION_SUMMARY.md` | Technical details | 15 min |
| `CALL_CENTRE_SURVEY_TEMPLATE.json` | Ready-to-use template | 2 min |

**Total reading time:** 1 hour (if you read everything)
**Time to working form:** 10 minutes (if you just do it!)

---

## 🎯 Remember

**The feature is already built, tested, and working.**

All you need to do is:
1. Open the form editor
2. Add your questions
3. Configure the conditional rule
4. Save and test

**It's that simple!**

Happy form building! 🎉

---

**Questions?** Check the documentation files above.

**Ready to start?** Open `HOW_TO_USE_CONDITIONAL_LOGIC.md` now!

**Want the shortcut?** Import `CALL_CENTRE_SURVEY_TEMPLATE.json` and you're done!

✨ **You've got this!** ✨

