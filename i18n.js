// i18n.js - نسخة محسنة وآمنة، تعتمد فقط على data-i18n
const translations = {
    zh: {
        appTitle: "📖 脑力健身房",
        tabLearn: "📝 开始学习",
        tabWrong: "📘 没答对的地方",
        tabCorrect: "✅ 答对的地方",
        tabManage: "✏️ 管理题库",
        tabAdd: "➕ 添加新题",
        statsTotal: "📚 总题库:",
        statsCorrect: "✅ 已答对:",
        statsWrong: "❌ 待巩固:",
        resetBtn: "🗑️ 重置学习记录",
        answerPlaceholder: "输入你的答案 (多选用逗号隔开)",
        submitBtn: "提交答案",
        nextBtn: "下一题 ➡️",
        studyTip: "💡 每轮学习每个题目只出现一次，答对后不再重复，答错也会移出本轮（可去错题本练习）。所有数据自动保存。",
        wrongTitle: "📕 没答对的题目",
        practiceWrongBtn: "✍️ 练习错题本",
        correctTitle: "✅ 答对题库",
        clearCorrectBtn: "清空答对记录",
        manageTitle: "✏️ 编辑或删除已有题目 (修改后自动保存)",
        searchPlaceholder: "🔍 搜索题目关键词...",
        addTitle: "➕ 添加新知识 / 新题目",
        questionLabel: "问题 / 题干",
        answerLabel: "标准答案 (多个答案用分号;隔开)",
        categoryLabel: "类别",
        imageLabel: "图片描述(仅示意)",
        addButton: "📌 添加到总题库",
        noCurrentQuestion: "⚠️ 没有题目，请点击下一题或重置记录。",
        correctFeedback: "答案正确！已存入“答对的地方”",
        wrongFeedbackPrefix: "答案不对。 参考答案：",
        wrongFeedbackSuffix: "。已存入“没答对的地方”",
        encourage1: "👍 太棒了！",
        encourage2: "🎉 真不错！",
        encourage3: "🏅 非常出色！",
        encourage4: "💪 做得好！",
        encourage5: "🌟 你是明星！",
        streakMsg: "🔥 你已经连续答对了{count}题！",
        autoNextMsg: "➡️ 2秒后自动进入下一题...",
        groupLabel: "组别 (例如 HSK 1, General)",
        subgroupLabel: "子组 (例如 第1课)",
        groupFilterLabel: "📁 练习组:",
        applyFilter: "应用筛选",
        subgroupFilterLabel: "子组:",
        resetFilter: "重置筛选",
        batchLabel: "📦 批量添加题目",
        batchAddBtn: "➕ 批量添加",
        batchExampleTitle: "📖 查看示例 (支持多行 / 每行一个题目)",
        batchHelpNote: "💡 可以按照上述格式编写多个题目，每行一个。答案可以是数组 (多个答案)。",
        practiceModeChoice: "是否只练习本组中答错的题目？\n\n确定 = 只练习错题\n取消 = 练习所有题目",
        noWrongInGroup: "🎉 本组没有错题了！请重置筛选或选择其他组。",
        groupCompleted: "🎉 恭喜！您已完成本组所有题目！请重置筛选或选择其他组。",
        noQuestionsInGroup: "✨ 本组没有题目，请先添加。",
        studyNewBtn: "🔄 重新开始本组",
        studyContinueBtn: "📖 继续",
        selectGroupFirst: "请先选择一个具体的组 (Group) 和子组 (Subgroup)",
        userGuest: "游客",
        logout: "退出登录",
        signupPrompt: "🎉 您已多次以游客身份访问！是否创建免费账户保存学习进度？",
        packModalTitle: "📦 可下载的题库包",
        packDownloadBtn: "⬇️ 下载并添加",
        packInstalled: "✅ 已安装",
        packDuplicate: "⚠️ 部分或全部重复，未添加",
    },
    en: {
        appTitle: "📖 Brain Gym",
        tabLearn: "📝 Study",
        tabWrong: "📘 Wrong Answers",
        tabCorrect: "✅ Correct Answers",
        tabManage: "✏️ Manage",
        tabAdd: "➕ Add",
        statsTotal: "📚 Total Questions:",
        statsCorrect: "✅ Correct:",
        statsWrong: "❌ To Review:",
        resetBtn: "🗑️ Reset Progress",
        answerPlaceholder: "Enter your answer (use commas for multiple answers)",
        submitBtn: "Submit",
        nextBtn: "Next ➡️",
        studyTip: "💡 Each question appears once per session. Correct answers are archived and won't repeat. Wrong ones are also removed (can practice in Wrong tab). All data auto-saved.",
        wrongTitle: "📕 Wrong Questions",
        practiceWrongBtn: "✍️ Practice Wrong",
        correctTitle: "✅ Correct Questions",
        clearCorrectBtn: "Clear All Correct",
        manageTitle: "✏️ Edit or Delete Questions (auto-save)",
        searchPlaceholder: "🔍 Search questions...",
        addTitle: "➕ Add New Question",
        questionLabel: "Question",
        answerLabel: "Answer (separate with ;)",
        categoryLabel: "Category",
        imageLabel: "Image hint (optional)",
        addButton: "📌 Add to Library",
        noCurrentQuestion: "⚠️ No active question. Click Next or reset.",
        correctFeedback: "Correct! Saved to \"Correct\" list.",
        wrongFeedbackPrefix: "Incorrect. Reference answer: ",
        wrongFeedbackSuffix: ". Saved to \"Wrong\" list.",
        encourage1: "👍 Excellent!",
        encourage2: "🎉 Great job!",
        encourage3: "🏅 Awesome!",
        encourage4: "💪 Well done!",
        encourage5: "🌟 You're a star!",
        streakMsg: "🔥 You've answered {count} questions correctly in a row!",
        autoNextMsg: "➡️ Moving to next question automatically in 2 seconds...",
        groupLabel: "Group (e.g., HSK 1, General)",
        subgroupLabel: "Subgroup (e.g., Lesson 1)",
        groupFilterLabel: "📁 Study Group:",
        applyFilter: "Apply Filter",
        subgroupFilterLabel: "Subgroup:",
        resetFilter: "Reset Filter",
        batchLabel: "📦 Batch Import Questions",
        batchAddBtn: "➕ Batch Add",
        batchExampleTitle: "📖 View Example (multi-line / one question per line)",
        batchHelpNote: "💡 You can write multiple questions in the format above, one per line. Answers can be arrays (multiple answers).",
        practiceModeChoice: "Do you want to practice ONLY wrong answers in this group?\n\nOK = Wrong answers only\nCancel = All questions",
        noWrongInGroup: "🎉 No wrong questions left in this group! Reset filter or choose another group.",
        groupCompleted: "🎉 Congratulations! You've completed all questions in this group! Reset filter or choose another group.",
        noQuestionsInGroup: "✨ No questions found in this group. Please add some.",
        studyNewBtn: "🔄 Start Over",
        studyContinueBtn: "📖 Continue",
        selectGroupFirst: "Please select a specific Group and Subgroup first.",
        userGuest: "Guest",
        logout: "Logout",
        signupPrompt: "🎉 You've visited several times as a guest! Create a free account to save your progress?",
        packModalTitle: "📦 Downloadable Question Bank Package",
        packDownloadBtn: "⬇️ Download & Add",
        packInstalled: "✅ Installed",
        packDuplicate: "⚠️ Part or all duplicated, not added",
    }
};

let currentLang = 'zh';

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    const t = translations[lang];

    // تحديث جميع العناصر التي تحمل data-i18n (الطريقة الآمنة)
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) {
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.placeholder = t[key];
            } else {
                // بالنسبة للأزرار والعناوين وكل شيء آخر، نغير النص مع الحفاظ على الأيقونات
                el.innerText = t[key];
            }
        }
    });

    // تحديث بعض العناصر التي لا تحمل data-i18n بشكل منفرد (لأنها قد تكون داخل قوالب ديناميكية)
    const submitBtn = document.getElementById('submitAnswer');
    if (submitBtn) submitBtn.innerText = t.submitBtn;
    const nextBtn = document.getElementById('nextQuestion');
    if (nextBtn) nextBtn.innerText = t.nextBtn;
    const resetBtn = document.getElementById('resetStudyStats');
    if (resetBtn) resetBtn.innerText = t.resetBtn;
    const practiceBtn = document.getElementById('practiceWrongBtn');
    if (practiceBtn) practiceBtn.innerText = t.practiceWrongBtn;
    const clearBtn = document.getElementById('clearAllCorrectBtn');
    if (clearBtn) clearBtn.innerText = t.clearCorrectBtn;
    const addBtn = document.getElementById('addQuestionBtn');
    if (addBtn) addBtn.innerText = t.addButton;
    const answerInput = document.getElementById('answerInput');
    if (answerInput) answerInput.placeholder = t.answerPlaceholder;
    const searchInput = document.getElementById('searchQuestionInput');
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;

    // تحديث إحصائيات الأرقام (جزء النص فقط، دون حذف الأرقام)
    const totalSpan = document.querySelector('.stats span:first-child');
    if (totalSpan) {
        const totalCount = document.getElementById('totalCount')?.innerText || '0';
        totalSpan.innerHTML = `${t.statsTotal} <strong id="totalCount">${totalCount}</strong>`;
    }
    const correctSpan = document.querySelector('.stats span:nth-child(2)');
    if (correctSpan) {
        const correctCount = document.getElementById('correctCount')?.innerText || '0';
        correctSpan.innerHTML = `${t.statsCorrect} <strong id="correctCount">${correctCount}</strong>`;
    }
    const wrongSpan = document.querySelector('.stats span:nth-child(3)');
    if (wrongSpan) {
        const wrongCount = document.getElementById('wrongCount')?.innerText || '0';
        wrongSpan.innerHTML = `${t.statsWrong} <strong id="wrongCount">${wrongCount}</strong>`;
    }

    // تحديث النص الصغير الإضافي (الموجود أسفل البطاقة)
    const tipDiv = document.querySelector('.quiz-card + div');
    if (tipDiv && tipDiv.hasAttribute('data-i18n')) {
        tipDiv.innerText = t.studyTip;
    }

    localStorage.setItem('app_lang', lang);
}

function toggleLanguage() {
    const newLang = currentLang === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
    
    // تأخير بسيط لضمان اكتمال تحديث النصوص قبل تبديل التبويب
    setTimeout(() => {
        // العثور على زر التبويب "Study" والنقر عليه
        const learnTabBtn = document.querySelector('.tab-btn[data-tab="learn"]');
        if (learnTabBtn) {
            // إذا كان التبويب نشطاً بالفعل، قم بتحديث المحتوى يدوياً
            if (learnTabBtn.classList.contains('active')) {
                // إعادة تحميل السؤال الحالي لتحديث أي نصوص قد تكون مرتبطة بالترجمة
                if (typeof loadNewQuestion === 'function') {
                    loadNewQuestion();
                }
            } else {
                learnTabBtn.click();
            }
        }
    }, 50);
}

function initLanguage() {
    const savedLang = localStorage.getItem('app_lang');
    if (savedLang && translations[savedLang]) {
        setLanguage(savedLang);
    } else {
        setLanguage('zh');
    }
}

// ربط زر تبديل اللغة بعد تحميل DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initLanguage();
        const langToggle = document.getElementById('langToggleBtn');
        if (langToggle) langToggle.addEventListener('click', toggleLanguage);
    });
} else {
    initLanguage();
    const langToggle = document.getElementById('langToggleBtn');
    if (langToggle) langToggle.addEventListener('click', toggleLanguage);
}