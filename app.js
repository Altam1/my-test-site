// app.js - DEFAULT_QUESTIONS_RAW
// Firebase imports for cloud sync (added without breaking existing features)
import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, updateDoc, doc, setDoc, getDoc, collection, getDocs, query, where, arrayUnion, arrayRemove } from './firebase-config.js';
// ---------- 全局变量 ----------
let allQuestions = [];
let correctIds = [];
let wrongIds = [];
let remainingUnseenIds = [];
let currentQuestionObj = null;
let consecutiveCorrect = 0;
let autoNextTimer = null;
let selectedGroup = "all";
let selectedSubgroup = "all";
let practiceMode = "all"; // "all" or "wrongOnly"ly"
let currentUser = null;        // Stores current user object from localStorage
let isFirebaseUser = false;    // True if logged in (not guest)
let isProcessing = false;   
let deleteGroupSelect, deleteSubgroupSelect;  // سيتم تعيينهما لاحقاً
let lastAnsweredId = null;   
//  نظام شاشة الانتظار =
let waitingOverlay = null;
let canvas = null;
let ctx = null;
let animationFrameId = null;
let overlayActive = false;

// دوال الرسم (مختلفة كل مرة)
function getRandomPastel() {
    return `hsl(${Math.random() * 360}, 70%, 65%)`;
}

function drawCat(ctx, w, h, frame) {
    const t = Date.now() / 400;
    ctx.clearRect(0, 0, w, h);
    // خلفية
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, `hsl(${frame % 360}, 70%, 75%)`);
    grad.addColorStop(1, `hsl(${(frame + 60) % 360}, 70%, 65%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // رسم وجه قط
    ctx.fillStyle = "#F4C2A2";
    ctx.beginPath();
    ctx.ellipse(w/2, h/2, 50, 55, 0, 0, Math.PI*2);
    ctx.fill();
    // أذنان
    ctx.fillStyle = "#C78A5E";
    ctx.beginPath();
    ctx.moveTo(w/2-45, h/2-45);
    ctx.lineTo(w/2-20, h/2-25);
    ctx.lineTo(w/2-35, h/2-60);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w/2+45, h/2-45);
    ctx.lineTo(w/2+20, h/2-25);
    ctx.lineTo(w/2+35, h/2-60);
    ctx.fill();
    // عيون
    ctx.fillStyle = "#2F2E41";
    ctx.beginPath();
    ctx.arc(w/2-20, h/2-10, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w/2+20, h/2-10, 6, 0, Math.PI*2);
    ctx.fill();
    // أنف
    ctx.fillStyle = "#FF9999";
    ctx.beginPath();
    ctx.ellipse(w/2, h/2+5, 7, 5, 0, 0, Math.PI*2);
    ctx.fill();
    // شوارب
    ctx.beginPath();
    ctx.moveTo(w/2-35, h/2);
    ctx.lineTo(w/2-10, h/2+2);
    ctx.moveTo(w/2+35, h/2);
    ctx.lineTo(w/2+10, h/2+2);
    ctx.stroke();
    // قبعة عالية
    ctx.fillStyle = "#5A3E2B";
    ctx.fillRect(w/2-40, h/2-75, 80, 35);
    ctx.fillStyle = "#FFD966";
    ctx.fillRect(w/2-30, h/2-70, 60, 15);
}

function drawParticles(ctx, w, h, frame) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#1E2A38";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
        const angle = frame * 0.05 + i;
        const rad = 50 + Math.sin(angle) * 20;
        const x = w/2 + Math.cos(angle) * rad;
        const y = h/2 + Math.sin(angle * 1.5) * rad * 0.7;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI*2);
        ctx.fillStyle = `hsl(${(frame + i * 20) % 360}, 80%, 65%)`;
        ctx.fill();
    }
    ctx.font = `bold 26px "Segoe UI Emoji"`;
    ctx.fillStyle = "white";
    ctx.fillText("✨", w-40, h-30);
    ctx.fillText("📚", 20, 50);
}

function drawWavy(ctx, w, h, frame) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#2C3E50";
    ctx.fillRect(0, 0, w, h);
    const t = frame * 0.03;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 15) {
            const y = h/2 + Math.sin(x * 0.03 + t + i) * 15 + Math.cos(x * 0.02 + t*1.2) * 10;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fillStyle = `hsla(${i * 60 + t * 50}, 70%, 60%, 0.6)`;
        ctx.fill();
    }
    ctx.fillStyle = "#FFD966";
    ctx.font = `24px "Segoe UI Emoji"`;
    ctx.fillText("⭐", w*0.2, h*0.8);
    ctx.fillText("📖", w*0.7, h*0.3);
}

let activeRender = null;
let frameCount = 0;

function startWaitingAnimation() {
    if (!canvas || !ctx) return;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    // اختيار نوع الرسم عشوائياً
    const renderType = Math.floor(Math.random() * 3); // 0 قط, 1 جسيمات, 2 موجات
    frameCount = 0;
    function animate() {
        if (!overlayActive) return;
        frameCount++;
        if (renderType === 0) drawCat(ctx, 200, 200, frameCount);
        else if (renderType === 1) drawParticles(ctx, 200, 200, frameCount);
        else drawWavy(ctx, 200, 200, frameCount);
        animationFrameId = requestAnimationFrame(animate);
    }
    animate();
}

function showWaitingOverlay() {
    waitingOverlay = document.getElementById('waitingOverlay');
    if (!waitingOverlay) return;
    overlayActive = true;
    waitingOverlay.style.display = 'flex';
    waitingOverlay.style.opacity = '1';
    canvas = document.getElementById('funCanvas');
    if (canvas) ctx = canvas.getContext('2d');
    // حقيقة عشوائية للعرض
    const facts = [
        '🧠 Spaced repetition doubles your memory power!',
        '📖 Every new word opens a door to a new world.',
        '⭐ You are joining over 1000 active learners today!',
        '🎨 Look! Every refresh brings a new surprise animation.',
        '💪 Consistency beats intensity. Keep going, you are doing great!',
        '🌍 Language connects hearts across cultures. You are building bridges!',
        '✨ Small daily progress = huge results over time.',
        '🎯 Every correct answer rewires your brain for success.',
        '📚 Learning is a journey, not a race. Enjoy every step!',
        '🧘 Breathe, focus, and get ready to master new knowledge.',
        '🔥 You are training your brain to become stronger every day.',
        '💡 Fun fact: Your brain grows new connections when you learn.',
        '🎉 Get ready for a fresh set of questions just for you!',
        '🚀 Knowledge is the only treasure that grows when you share it.',
        '🏆 Every effort counts. You are closer to fluency than yesterday!'
    ];
    const factDiv = document.getElementById('funFactText');
    if (factDiv) factDiv.innerText = facts[Math.floor(Math.random() * facts.length)];
    startWaitingAnimation();
}

function hideWaitingOverlay() {
    overlayActive = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (waitingOverlay) {
        waitingOverlay.style.opacity = '0';
        setTimeout(() => {
            if (waitingOverlay) waitingOverlay.style.display = 'none';
        }, 300);
    }
}  

// إدارة المستخدم 
function loadCurrentUser() {
    const storedUser = localStorage.getItem('ch_current_user');
    if (!storedUser) {
        // لا يوجد مستخدم - انتقل إلى صفحة التسجيل
        window.location.href = 'login.html';
        return false;
    }
    
    currentUser = JSON.parse(storedUser);       
    isFirebaseUser = !currentUser.isGuest;       
    const user = currentUser; // يمكنك استخدام currentUser مباشرة بدلاً من تحليل مرة أخرى
    
    const userSpan = document.getElementById('userDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const upgradeBtn = document.getElementById('upgradeAccountBtn');
    
    // عرض اسم المستخدم
    if (userSpan) {
        if (user.isGuest) {
            userSpan.innerHTML = `👤 ${user.name || 'Guest'}`;
        } else {
            // للمستخدمين المسجلين، نحاول جلب الاسم من Firebase إذا أمكن
            if (user.name) {
                userSpan.innerHTML = `👤 ${user.name}`;
            } else if (user.email) {
                userSpan.innerHTML = `👤 ${user.email.split('@')[0]}`;
            } else {
                userSpan.innerHTML = `👤 User`;
            }
        }
    }
    
    // زر تسجيل الخروج
    if (logoutBtn) {
        logoutBtn.style.display = 'inline-block';
        logoutBtn.onclick = () => {
            localStorage.removeItem('ch_current_user');
            window.location.href = 'login.html';
        };
    }
    
    // زر الترقية للحساب الدائم (يظهر فقط للضيوف)
    if (upgradeBtn) {
        if (user.isGuest) {
            upgradeBtn.style.display = 'inline-block';
            upgradeBtn.onclick = () => {
                window.location.href = 'login.html';
            };
        } else {
            upgradeBtn.style.display = 'none';
        }
    }
    
    // عرض رسالة تشجيع للضيف بعد 5 زيارات
    if (user.isGuest) {
        let visitCount = localStorage.getItem('ch_visit_count');
        if (!visitCount) {
            localStorage.setItem('ch_visit_count', '1');
            visitCount = '1';
        }
        const currentVisits = parseInt(visitCount);
        if (currentVisits >= 5 && currentVisits < 10) {
            localStorage.setItem('ch_visit_count', '10');
            setTimeout(() => {
                const msg = '🎉 You\'ve visited several times as a guest! Create a free account to save your progress across all devices?';
                if (confirm(msg)) {
                    window.location.href = 'login.html';
                }
            }, 2000);
        } else if (currentVisits < 5) {
            localStorage.setItem('ch_visit_count', (currentVisits + 1).toString());
        }
    }
    
    return true;
}

async function loadAvailablePacks() {
    try {
        const response = await fetch('packs-list.json');
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch(e) {
        console.warn('Could not load packs-list.json, using fallback (empty).', e);
        // Fallback فارغ أو بسيط جداً (لن يظهر أي شيء في الـ modal)
        return {};
    }
}

function populateDeleteGroupFilter() {
    const groups = [...new Set(allQuestions.map(q => q.group))];
    const groupSelect = document.getElementById('deleteGroupSelect');
    if (!groupSelect) return;
    groupSelect.innerHTML = '<option value="">-- Select Group --</option>';
    groups.forEach(g => {
        if (g) groupSelect.innerHTML += `<option value="${g}">${g}</option>`;
    });
    // عند تغيير المجموعة، قم بتحديث قائمة المجموعات الفرعية
    groupSelect.onchange = () => {
        const selectedGroup = groupSelect.value;
        populateDeleteSubgroupFilter(selectedGroup);
    };
    // تحديث القائمة الفرعية لأول مرة إذا كانت هناك مجموعة محددة
    if (groupSelect.value) populateDeleteSubgroupFilter(groupSelect.value);
}

function populateDeleteSubgroupFilter(group) {
    const subgroupSelect = document.getElementById('deleteSubgroupSelect');
    if (!subgroupSelect) return;
    let subgroups = [];
    if (group) {
        subgroups = [...new Set(allQuestions.filter(q => q.group === group).map(q => q.subgroup))];
    } else {
        subgroups = [...new Set(allQuestions.map(q => q.subgroup))];
    }
    subgroupSelect.innerHTML = '<option value="all">All Subgroups</option>';
    subgroups.forEach(sg => {
        if (sg) subgroupSelect.innerHTML += `<option value="${sg}">${sg}</option>`;
    });
}

// حذف مجموعة كاملة
function deleteGroup() {
    const group = document.getElementById('deleteGroupSelect').value;
    if (!group) {
        alert("Please select a group to delete.");
        return;
    }
    if (group === "General") {
        if (!confirm("⚠️ Warning: 'General' contains default questions. Are you sure you want to delete ALL questions in General group?")) return;
    } else {
        if (!confirm(`🗑️ Delete ALL questions in group "${group}"? This action cannot be undone.`)) return;
    }
    
    const toDeleteIds = allQuestions.filter(q => q.group === group).map(q => q.id);
    if (toDeleteIds.length === 0) {
        alert(`No questions found in group "${group}".`);
        return;
    }
    
    // إزالة الأسئلة من allQuestions
    allQuestions = allQuestions.filter(q => !toDeleteIds.includes(q.id));
    // إزالة المعرفات من سجلات الصواب والخطأ
    correctIds = correctIds.filter(id => !toDeleteIds.includes(id));
    wrongIds = wrongIds.filter(id => !toDeleteIds.includes(id));
    
    persistAll();
    refreshRemainingPool();
    loadNewQuestion();
    updateCounters();
    renderCategoryHint();
    populateGroupFilter();
    populateDeleteGroupFilter();   // تحديث قوائم الحذف
    alert(`✅ Deleted ${toDeleteIds.length} questions from group "${group}".`);
}

// حذف درس (group + subgroup)
function deleteSubgroup() {
    const group = document.getElementById('deleteGroupSelect').value;
    const subgroup = document.getElementById('deleteSubgroupSelect').value;
    if (!group) {
        alert("Please select a group first.");
        return;
    }
    if (!subgroup || subgroup === "all") {
        alert("Please select a specific subgroup (lesson).");
        return;
    }
    if (!confirm(`🗑️ Delete ALL questions in "${group} / ${subgroup}"? This will also delete your progress for these questions.`)) return;
    
    const toDeleteIds = allQuestions.filter(q => q.group === group && q.subgroup === subgroup).map(q => q.id);
    if (toDeleteIds.length === 0) {
        alert(`No questions found in "${group} / ${subgroup}".`);
        return;
    }
    
    allQuestions = allQuestions.filter(q => !toDeleteIds.includes(q.id));
    correctIds = correctIds.filter(id => !toDeleteIds.includes(id));
    wrongIds = wrongIds.filter(id => !toDeleteIds.includes(id));
    
    persistAll();
    refreshRemainingPool();
    loadNewQuestion();
    updateCounters();
    renderCategoryHint();
    populateGroupFilter();
    populateDeleteGroupFilter();
    alert(`✅ Deleted ${toDeleteIds.length} questions from "${group} / ${subgroup}".`);
}

// تحميل وإضافة درس فردي ( يحتوي على كلمات وإجابات)
async function downloadAndAddLesson(packId, lessonId, lessonInfo) {
    const { file, name } = lessonInfo;
    try {
        const res = await fetch(file);
        const textContent = await res.text();   // نقرأ كنص أولاً
        let wordsData;
        
        // محاولة تحويل كمصفوفة JSON
        if (textContent.trim().startsWith('[')) {
            wordsData = JSON.parse(textContent);
        } else {
            // معالجة كنص CSV (سطر بسطر)
            const lines = textContent.split(/\r?\n/);
            wordsData = [];
            for (let line of lines) {
                line = line.trim();
                if (line === "") continue;
                // تقسيم الحقول مع احترام علامات الاقتباس البسيطة
                let fields = [];
                let current = '';
                let inQuotes = false;
                for (let ch of line) {
                    if (ch === '"') inQuotes = !inQuotes;
                    else if (ch === ',' && !inQuotes) {
                        fields.push(current.trim());
                        current = '';
                    } else {
                        current += ch;
                    }
                }
                fields.push(current.trim());
                // إزالة علامات الاقتباس من الحقول
                fields = fields.map(f => f.replace(/^"|"$/g, ''));
                
                if (fields.length < 2) continue;
                
                const chinese = fields[0];
                let arabicRaw = fields[1];
                // تقسيم المعاني المتعددة إما بـ "|" أو "،" أو ","
                let arabicMeanings = arabicRaw.split(/[|،,]/).map(m => m.trim()).filter(m => m);
                const pinyinPart = fields[2] || '';
                const group = fields[3] || packId.toUpperCase();
                const subgroup = (fields.length >= 5 && fields[4].trim()) ? fields[4].trim() : lessonId;
                
                wordsData.push({
                    text: chinese,
                    answers: arabicMeanings,
                    pinyin: pinyinPart,
                    group: group,
                    subgroup: subgroup,
                    imageHint: pinyinPart ? `📖 ${pinyinPart}` : "📦"
                });
            }
        }
        
        let newQuestions = [];
        
        // معالجة البيانات حسب نوعها
        if (Array.isArray(wordsData)) {
            for (let item of wordsData) {
                let text, answers, group, subgroup, imageHint;
                // حالة الكائن (object)
                if (typeof item === 'object' && !Array.isArray(item)) {
                    text = item.text;
                    answers = item.answers;
                    group = item.group || packId.toUpperCase();
                    subgroup = item.subgroup || lessonId;
                    imageHint = item.imageHint || (item.pinyin ? `📖 ${item.pinyin}` : "📦");
                }
                // حالة المصفوفة المبسطة ["كلمة", ["ترجمة"]]
                else if (Array.isArray(item)) {
                    text = item[0];
                    answers = item[1];
                    group = packId.toUpperCase();
                    subgroup = lessonId;
                    imageHint = item[2] ? `📖 ${item[2]}` : "📦";
                } else {
                    continue;
                }
                if (text && Array.isArray(answers) && answers.length) {
                    newQuestions.push({ text, answers, group, subgroup, imageHint });
                }
            }
        }
        
        if (newQuestions.length === 0) throw new Error("No valid questions found in file.");
        
        let added = 0, skipped = 0;
        for (let q of newQuestions) {
            const exists = allQuestions.some(ex => ex.text === q.text);
            if (!exists) {
                const newId = Date.now() + Math.random() * 1000 + added;
                allQuestions.push({
                    id: newId,
                    text: q.text,
                    answers: q.answers,
                    category: q.group,
                    group: q.group,
                    subgroup: q.subgroup,
                    imageHint: q.imageHint
                });
                added++;
            } else {
                skipped++;
            }
        }
        if (added > 0) {
            persistAll();
            refreshRemainingPool();
            loadNewQuestion();
            updateCounters();
            renderCategoryHint();
            populateGroupFilter();
            alert(`✅ Added ${added} new words from ${name}. (${skipped} skipped)`);
        } else {
            alert("All words already exist.");
        }
    } catch(e) {
        alert(`❌ Failed to load lesson: ${e.message}`);
        console.error(e);
    }
    document.getElementById('packModal').style.display = 'none';
}

// 🔄 Sync all user data to Firebase (only for registered users)
async function syncToFirebase() {
    if (!currentUser || currentUser.isGuest) return;
    try {
        await setDoc(doc(db, 'users', currentUser.uid), {
            allQuestions: allQuestions,
            correctIds: correctIds,
            wrongIds: wrongIds,
            selectedGroup: selectedGroup,
            selectedSubgroup: selectedSubgroup,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log("Data synced to Firebase");
    } catch(e) { console.error('Sync error:', e); }
}

// 📥 Load user data from Firebase (only for registered users)
async function loadFromFirebase() {
    if (!currentUser || currentUser.isGuest) return false;
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.allQuestions && data.allQuestions.length) allQuestions = data.allQuestions;
            correctIds = data.correctIds || [];
            wrongIds = data.wrongIds || [];
            selectedGroup = data.selectedGroup || "all";
            selectedSubgroup = data.selectedSubgroup || "all";
            return true;
        }
    } catch(e) { console.error('Load error:', e); }
    return false;
}

// اعرض إشعار  (اختياري)
function checkAndPromptSignup() {
    const storedUser = localStorage.getItem('ch_current_user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.isGuest) {
            const visitCount = localStorage.getItem('ch_visit_count');
            if (visitCount && parseInt(visitCount) >= 5) {
                // Done    loadCurrentUser Up
            }
        }
    }
}

// ---------- 存储操作 ----------
function saveQuestionsToLocal() {
    localStorage.setItem('ch_questions_v2', JSON.stringify(allQuestions));
}

function saveCorrectWrong() {
    localStorage.setItem('ch_correct_ids_v2', JSON.stringify(correctIds));
    localStorage.setItem('ch_wrong_ids_v2', JSON.stringify(wrongIds));
}

function loadCorrectWrongFromLocal() {
    const storedCorrect = localStorage.getItem('ch_correct_ids_v2');
    const storedWrong = localStorage.getItem('ch_wrong_ids_v2');
    correctIds = storedCorrect ? JSON.parse(storedCorrect) : [];
    wrongIds = storedWrong ? JSON.parse(storedWrong) : [];
    // 清理无效ID（如果题目已被删除）
    const validIds = new Set(allQuestions.map(q => q.id));
    correctIds = correctIds.filter(id => validIds.has(id));
    wrongIds = wrongIds.filter(id => validIds.has(id));
    saveCorrectWrong();
}

async function loadAllData() {
    // If user is registered and has Firebase data, use it first
    if (currentUser && !currentUser.isGuest) {
        const loaded = await loadFromFirebase();
        if (loaded) {
            // Save to localStorage for offline compatibility
            saveQuestionsToLocal();
            saveCorrectWrong();
            return;
        }
    }
    
    // Fallback to localStorage (existing logic unchanged)
    const storedQuestions = localStorage.getItem('ch_questions_v2');
    if (storedQuestions) {
        allQuestions = JSON.parse(storedQuestions);
        allQuestions = allQuestions.map(q => ({
            ...q,
            group: q.group || "General",
            subgroup: q.subgroup || "General"
        }));
        saveQuestionsToLocal();
    } else {
        if (typeof DEFAULT_QUESTIONS_RAW !== 'undefined' && DEFAULT_QUESTIONS_RAW.length > 0) {
            allQuestions = DEFAULT_QUESTIONS_RAW.map((q, idx) => ({
                id: Date.now() + idx + Math.random() * 1000,
                text: q.text,
                answers: q.answers,
                category: q.category,
                imageHint: q.imageHint,
                group: q.group || "General",
                subgroup: q.subgroup || "General"
            }));
        } else {
            console.error('DEFAULT_QUESTIONS_RAW is not defined or empty!');
            allQuestions = [];
        }
        saveQuestionsToLocal();
    }
    loadCorrectWrongFromLocal();
}

function persistAll() {
    saveQuestionsToLocal();
    saveCorrectWrong();
    updateCounters();
    refreshRemainingPool();
    syncToFirebase();  
}

// ---------- 学习会话池管理 ----------
function refreshRemainingPool() {
    let filtered = allQuestions;
    if (selectedGroup !== "all") {
        filtered = filtered.filter(q => q.group === selectedGroup);
        if (selectedSubgroup !== "all") {
            filtered = filtered.filter(q => q.subgroup === selectedSubgroup);
        }
    }
    let targetIds;
    if (practiceMode === "wrongOnly") {
        //  الخاطئة فقط (من wrongIds)
        targetIds = filtered.filter(q => wrongIds.includes(q.id)).map(q => q.id);
    } else {
        //      صحيح بعد (ليست في correctIds)
        targetIds = filtered.filter(q => !correctIds.includes(q.id)).map(q => q.id);
    }
    // خلط 
    for (let i = targetIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [targetIds[i], targetIds[j]] = [targetIds[j], targetIds[i]];
    }
    remainingUnseenIds = targetIds;
}

function fetchNewQuestionFromPool() {
    if (remainingUnseenIds.length === 0) {
        // التحقق مما إذا كانت المجموعة المحددة تحتوي على أسئلة بالفعل
        let groupHasQuestions = false;
        if (selectedGroup !== "all") {
            groupHasQuestions = allQuestions.some(q => q.group === selectedGroup && (selectedSubgroup === "all" || q.subgroup === selectedSubgroup));
        } else {
            groupHasQuestions = allQuestions.length > 0;
        }
        
        if (groupHasQuestions) {
            let message;
            if (practiceMode === "wrongOnly") {
                message = getTranslation('noWrongInGroup') || `🎉 No wrong questions left in ${selectedGroup}${selectedSubgroup !== "all" ? " / " + selectedSubgroup : ""}! You can reset filter or change group.`;
            } else {
                message = getTranslation('groupCompleted') || `🎉 Congratulations! You've completed all questions in ${selectedGroup}${selectedSubgroup !== "all" ? " / " + selectedSubgroup : ""}! Use Reset Filter or choose another group.`;
            }
            return { type: "complete", message: message };
        } else {
            // لا توجد أسئلة 
            return { type: "complete", message: getTranslation('noQuestionsInGroup') || `✨ No questions found in ${selectedGroup}${selectedSubgroup !== "all" ? " / " + selectedSubgroup : ""}. Please add some.` };
        }
    }
    const nextId = remainingUnseenIds.shift();
    return allQuestions.find(q => q.id === nextId) || null;
}

function loadNewQuestion() {
    isProcessing = false;
    const newQ = fetchNewQuestionFromPool();
    if (!newQ) {
        document.getElementById('questionText').innerHTML = "✨ 暂无新题目，请添加或重置学习记录。";
        document.getElementById('questionImageArea').innerHTML = "🖼️ 待扩充题库";
        currentQuestionObj = null;
        return;
    }
    if (newQ.type === "complete") {
        document.getElementById('questionText').innerHTML = newQ.message;
        document.getElementById('questionImageArea').innerHTML = "🏆 全科制霸";
        currentQuestionObj = null;
        return;
    }
    currentQuestionObj = newQ;
    document.getElementById('questionText').innerHTML = newQ.text;
    document.getElementById('questionImageArea').innerHTML = `🖼️ 【${newQ.category || '文化'}】 ${newQ.imageHint || '知识配图'}`;
    document.getElementById('answerInput').value = '';
    const fb = document.getElementById('feedbackMsg');
    fb.innerHTML = '';
    fb.className = 'feedback';
    if (newQ && newQ.type !== "complete") {
        lastAnsweredId = null;   
    }
}

// ---------- 答案匹配（宽松匹配）----------
function normalizeAnswer(str) {
    // 全角转半角、去标点符号、空格、书名号等
    let s = str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).toLowerCase().trim();
    s = s.replace(/[，,、；;《》【】“”''""!！?？·\s]/g, '');
    return s;
}

function isAnswerCorrect(userAns, question) {
    let normUser = normalizeAnswer(userAns);
    // 特殊处理邻国题
    if (question.text.includes("不是中国的邻国")) {
        const neighborList = ["朝鲜","俄罗斯","蒙古","哈萨克斯坦","吉尔吉斯斯坦","塔吉克斯坦","阿富汗","巴基斯坦","印度","尼泊尔","不丹","缅甸","老挝","越南"];
        const inputClean = normalizeAnswer(userAns);
        const isNeighbor = neighborList.some(nei => normalizeAnswer(nei) === inputClean);
        if (!isNeighbor && inputClean.length > 0) return true;
        for (let std of question.answers) {
            if (normalizeAnswer(std) === inputClean) return true;
        }
        return false;
    }
    // 普通题目匹配
    for (let std of question.answers) {
        let normStd = normalizeAnswer(std);
        if (normUser === normStd) return true;
        // 处理多选（逗号分隔）
        if (normStd.includes(',') && normUser.includes(',')) {
            const userParts = normUser.split(',').sort().join(',');
            const stdParts = normStd.split(',').sort().join(',');
            if (userParts === stdParts) return true;
        }
        // 包含关系（长度足够）
        if (normStd.length > 2 && normUser.includes(normStd)) return true;
        if (normUser.length > 2 && normStd.includes(normUser)) return true;
        // 春节习俗关键词
        if (question.text.includes("春节有哪些习俗") && (normUser.includes("春联") || normUser.includes("年夜饭") || normUser.includes("团圆") || normUser.includes("拜年"))) return true;
    }
    return false;
}

// ---------- 提交与下一题 ----------
function submitCheck() {
    if (isProcessing) return;
    isProcessing = true;
    
    if (!currentQuestionObj) {
        showFeedback(getTranslation('noCurrentQuestion'), false);
        isProcessing = false;
        return;
    }
    const userAnswer = document.getElementById('answerInput').value;
    const correct = isAnswerCorrect(userAnswer, currentQuestionObj);
    const qid = currentQuestionObj.id;
    const mainAnswer = currentQuestionObj.answers[0].substring(0, 60);

    if (correct) {
        // زيادة عدد الإجابات المتتالية الصحيحة
        consecutiveCorrect++;
        
        // بناء رسالة التشجيع
        let encouragement = '';
        if (consecutiveCorrect >= 2) {
            const t = getCurrentTranslations();
            const rand = Math.floor(Math.random() * 5) + 1; // 1-5
            const encourageMsg = t[`encourage${rand}`] || t.encourage1;
            const streakMsg = t.streakMsg.replace('{count}', consecutiveCorrect);
            encouragement = `${encourageMsg} ${streakMsg}<br>`;
        }
        // رسالة الإجابة الصحيحة الأساسية
        const correctFeedback = `${encouragement}✅ ${getTranslation('correctFeedback')}`;
        showFeedback(correctFeedback, true);
        
        if (!correctIds.includes(qid)) correctIds.push(qid);
        wrongIds = wrongIds.filter(id => id !== qid);
        persistAll();
        remainingUnseenIds = remainingUnseenIds.filter(id => id !== qid);
        
        // إلغاء أي مؤقت سابق
        if (autoNextTimer) clearTimeout(autoNextTimer);
        // الانتقال التلقائي بعد 2 ثانية
        autoNextTimer = setTimeout(() => {
            loadNewQuestion();
            autoNextTimer = null;
            isProcessing = false;
        }, 2000);
    } else {
        // إجابة خاطئة: إعادة تعيين العداد المتتالي
        consecutiveCorrect = 0;
        if (autoNextTimer) clearTimeout(autoNextTimer);
        autoNextTimer = null;
        
        showFeedback(`❌ ${getTranslation('wrongFeedbackPrefix')}${mainAnswer}${getTranslation('wrongFeedbackSuffix')}`, false);
        if (!wrongIds.includes(qid)) wrongIds.push(qid);
        correctIds = correctIds.filter(id => id !== qid);
        persistAll();
        remainingUnseenIds = remainingUnseenIds.filter(id => id !== qid);
        
        isProcessing = false;
        
        lastAnsweredId = qid;
    }
    updateCounters();
}

function getTranslation(key) {
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
    const t = translations[lang];
    return t[key] || key;
}

function getCurrentTranslations() {
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'zh';
    return translations[lang];
}

function showFeedback(msg, isCorrect) {
    const fb = document.getElementById('feedbackMsg');
    fb.innerHTML = msg;
    fb.className = `feedback ${isCorrect ? 'correct-fb' : 'wrong-fb'}`;
}

function nextQuestionHandler() {
    loadNewQuestion();
}

// ---------- 界面更新与渲染 ----------
function updateCounters() {
    document.getElementById('totalCount').innerText = allQuestions.length;
    document.getElementById('correctCount').innerText = correctIds.length;
    document.getElementById('wrongCount').innerText = wrongIds.length;
    renderCorrectList();
    renderWrongList();
    if (document.getElementById('managePanel').classList.contains('active-panel')) {
        renderManageList();
    }
}

function renderCorrectList() {
    const container = document.getElementById('correctListContainer');
    const correctQuestions = allQuestions.filter(q => correctIds.includes(q.id));
    if (correctQuestions.length === 0) {
        container.innerHTML = '<div>✨ No questions have been answered correctly yet～</div>';
        return;
    }
    container.innerHTML = correctQuestions.map(q => `
        <div class="list-item">
            <span class="list-qtext">📌 ${q.text}</span>
            <button class="small secondary" data-id="${q.id}" data-action="remove-correct">从答对移除</button>
        </div>
    `).join('');
    document.querySelectorAll('[data-action="remove-correct"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number(btn.dataset.id);
            correctIds = correctIds.filter(i => i !== id);
            persistAll();
            loadNewQuestion();
        });
    });
}

function renderWrongList() {
    const container = document.getElementById('wrongListContainer');
    const wrongQuestions = allQuestions.filter(q => wrongIds.includes(q.id));
    if (wrongQuestions.length === 0) {
        container.innerHTML = '<div>🎉 No mistakes for now, keep it up～</div>';
        return;
    }
    container.innerHTML = wrongQuestions.map(q => `
        <div class="list-item">
            <span class="list-qtext">❌ ${q.text}</span>
            <button class="small secondary" data-id="${q.id}" data-action="practice-wrong">📖 练习此题</button>
            <button class="small warning" data-id="${q.id}" data-action="remove-wrong">🗑️ 忽略</button>
        </div>
    `).join('');
    document.querySelectorAll('[data-action="practice-wrong"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number(btn.dataset.id);
            const q = allQuestions.find(qq => qq.id === id);
            if (q) {
                currentQuestionObj = q;
                document.getElementById('questionText').innerHTML = q.text;
                document.getElementById('questionImageArea').innerHTML = `🖼️ 【${q.category}】 `;
                document.getElementById('answerInput').value = '';
                document.getElementById('feedbackMsg').innerHTML = '';
                document.querySelector('[data-tab="learn"]').click();
            }
        });
    });
    document.querySelectorAll('[data-action="remove-wrong"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number(btn.dataset.id);
            wrongIds = wrongIds.filter(i => i !== id);
            persistAll();
        });
    });
}

function renderManageList() {
    const container = document.getElementById('allQuestionsList');
    const searchTerm = document.getElementById('searchQuestionInput')?.value.toLowerCase() || '';
    let filtered = allQuestions.filter(q => q.text.toLowerCase().includes(searchTerm));
    if (filtered.length === 0) {
        container.innerHTML = '<div>📭 没有找到题目</div>';
        return;
    }
    container.innerHTML = filtered.map(q => `
        <div class="list-item" data-qid="${q.id}">
            <span class="list-qtext">
                <strong>${q.text}</strong><br>
                <span style="font-size:0.75rem;">类别: ${q.category} | 答案: ${q.answers.join('; ').substring(0,50)}${q.answers.join(';').length>50?'…':''}</span>
            </span>
            <div class="edit-buttons">
                <button class="small secondary edit-q-btn" data-id="${q.id}">✏️ 编辑</button>
                <button class="small warning delete-q-btn" data-id="${q.id}">🗑️ 删除</button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.edit-q-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number(btn.dataset.id);
            const q = allQuestions.find(qq => qq.id === id);
            if (q) {
                const newText = prompt("编辑问题:", q.text);
                if (newText && newText.trim()) q.text = newText.trim();
                const newAnswers = prompt("编辑答案 (多个用分号;隔开):", q.answers.join(';'));
                if (newAnswers && newAnswers.trim()) q.answers = newAnswers.split(';').map(s=>s.trim()).filter(s=>s);
                const newCat = prompt("编辑类别:", q.category);
                if (newCat !== null) q.category = newCat.trim() || "未分类";
                const newImg = prompt("图片描述:", q.imageHint);
                if (newImg !== null) q.imageHint = newImg.trim() || "📌";
                persistAll();
                renderManageList();
                renderCorrectList();
                renderWrongList();
                refreshRemainingPool();
                loadNewQuestion();
            }
        });
    });

    document.querySelectorAll('.delete-q-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm("确定删除此题吗？相关学习记录也会清除。")) {
                const id = Number(btn.dataset.id);
                allQuestions = allQuestions.filter(q => q.id !== id);
                correctIds = correctIds.filter(i => i !== id);
                wrongIds = wrongIds.filter(i => i !== id);
                persistAll();
                renderManageList();
                updateCounters();
                refreshRemainingPool();
                loadNewQuestion();
            }
        });
    });
}

function addNewQuestion() {
    const qtext = document.getElementById('newQuestion').value.trim();
    const ansRaw = document.getElementById('newAnswer').value.trim();
    const cat = document.getElementById('newCategory').value.trim() || "自定义";
    const newGroup = document.getElementById('newGroup').value.trim() || "General";
    const newSubgroup = document.getElementById('newSubgroup').value.trim() || "General";
    const img = document.getElementById('newImageDesc').value.trim() || "📌 新知识";
    if (!qtext || !ansRaw) {
        alert("请填写问题和答案");
        return;
    }
    const newId = Date.now() + Math.random();
    allQuestions.push({
        id: newId,
        text: qtext,
        answers: ansRaw.split(';').map(s=>s.trim()),
        category: cat,
        group: newGroup,
        subgroup: newSubgroup,
        imageHint: img
    });
    persistAll();
    // تفريغ الحقول。。。。。。
    document.getElementById('newQuestion').value = '';
    document.getElementById('newAnswer').value = '';
    document.getElementById('newCategory').value = '';
    document.getElementById('newGroup').value = '';
    document.getElementById('newSubgroup').value = '';
    document.getElementById('newImageDesc').value = '';
    refreshRemainingPool();
    loadNewQuestion();
    updateCounters();
    renderCategoryHint();
    populateGroupFilter(); // تحديث قائمة المجموعات
    alert("新题目已添加！");
}
// Batch import questions from textarea
function batchAddQuestions() {
    const rawText = document.getElementById('batchQuestions').value.trim();
    if (!rawText) {
        alert("Please enter questions in the batch field.");
        return;
    }
    
    let newQuestions = [];
    let errors = [];
    let trimmed = rawText.trim();
    
    // 1. محاولة parsing كـ JSON array (يبدأ بـ [ وينتهي بـ ])
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
            const jsonArray = JSON.parse(trimmed);
            if (Array.isArray(jsonArray)) {
                for (let i = 0; i < jsonArray.length; i++) {
                    const q = jsonArray[i];
                    if (q.text && Array.isArray(q.answers)) {
                        newQuestions.push({
                            text: q.text,
                            answers: q.answers,
                            category: q.category || "General",
                            group: q.group || "General",
                            subgroup: q.subgroup || "General",
                            imageHint: q.imageHint || "📌"
                        });
                    } else {
                        errors.push(`JSON item ${i+1}: missing 'text' or 'answers' array`);
                    }
                }
            }
        } catch(e) { 
            errors.push(`JSON parsing failed: ${e.message}`);
        }
    } 
    // 2. محاولة parsing كـ سطور
    else {
        let lines = rawText.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line === "" || line === ",") continue;
            if (line.endsWith(',')) line = line.slice(0, -1);
            
            // 2a. تنسيق CSV (يحتوي على فاصلة ولا يبدأ بـ { أو [)
            if (line.includes(',') && !line.startsWith('{') && !line.startsWith('[')) {
                let parts = [];
                let inQuotes = false;
                let current = '';
                for (let c of line) {
                    if (c === '"') { inQuotes = !inQuotes; }
                    else if (c === ',' && !inQuotes) { parts.push(current.trim()); current = ''; }
                    else { current += c; }
                }
                parts.push(current.trim());
                parts = parts.map(p => p.replace(/^"|"$/g, ''));
                
                if (parts.length >= 2) {
                    let text = parts[0];
                    let answers = parts[1].split('|').map(a => a.trim());
                    let category = parts[2] || "General";
                    let group = parts[3] || "General";
                    let subgroup = parts[4] || "General";
                    let imageHint = parts[5] || "📌";
                    if (text && answers.length) {
                        newQuestions.push({ text, answers, category, group, subgroup, imageHint });
                        continue;
                    }
                }
            }
            
            // 2b. تنسيق النص البسيط (يحتوي على |)
            if (line.includes('|')) {
                let parts = line.split('|').map(p => p.trim());
                if (parts.length >= 2) {
                    let text = parts[0];
                    let answerStr = parts[1];
                    let answers = answerStr.split(',').map(a => a.trim());
                    let category = parts[2] || "General";
                    let group = parts[3] || "General";
                    let subgroup = parts[4] || "General";
                    let imageHint = parts[5] || "📌";
                    if (text && answers.length) {
                        newQuestions.push({ text, answers, category, group, subgroup, imageHint });
                        continue;
                    }
                }
            }
            
            // 2c. تنسيق JavaScript objects
            try {
                const questionObj = new Function('return (' + line + ')')();
                if (questionObj && typeof questionObj === 'object' && questionObj.text && Array.isArray(questionObj.answers)) {
                    newQuestions.push({
                        text: questionObj.text,
                        answers: questionObj.answers,
                        category: questionObj.category || "General",
                        group: questionObj.group || "General",
                        subgroup: questionObj.subgroup || "General",
                        imageHint: questionObj.imageHint || "📌"
                    });
                } else {
                    errors.push(`Line ${i+1}: Invalid format - must have 'text' and 'answers' array.`);
                }
            } catch(e) {
                errors.push(`Line ${i+1}: Syntax error - ${e.message}`);
            }
        }
    }
    
    if (errors.length > 0) {
        alert(`❌ ${errors.length} error(s):\n` + errors.slice(0,5).join('\n') + (errors.length>5 ? `\nand ${errors.length-5} more` : ''));
        if (newQuestions.length === 0) return;
    }
    
    if (newQuestions.length === 0) {
        alert("No valid questions found.");
        return;
    }
    
    // إضافة الأسئلة الجديدة
    for (let q of newQuestions) {
        const newId = Date.now() + Math.random() * 1000;
        allQuestions.push({
            id: newId,
            text: q.text,
            answers: q.answers,
            category: q.category,
            group: q.group,
            subgroup: q.subgroup,
            imageHint: q.imageHint
        });
    }
    
    persistAll();
    refreshRemainingPool();
    loadNewQuestion();
    updateCounters();
    renderCategoryHint();
    populateGroupFilter();
    
    document.getElementById('batchQuestions').value = '';
    alert(`✅ Successfully added ${newQuestions.length} question(s)!`);
}

function renderCategoryHint() {
    const cats = [...new Set(allQuestions.map(q => q.category))];
    const container = document.getElementById('categoryList');
    if (container) {
        container.innerHTML = cats.map(c => `<span class="category-tag">#${c}</span>`).join('');
    }
}

function resetStats() {
    correctIds = [];
    wrongIds = [];
    persistAll();
    refreshRemainingPool();
    loadNewQuestion();
    alert("The study record has been reset, and all questions have been re-added to the practice queue.");
}

function populateGroupFilter() {
    const groups = [...new Set(allQuestions.map(q => q.group))];
    const groupSelect = document.getElementById('groupFilter');
    if (!groupSelect) return;
    groupSelect.innerHTML = '<option value="all">All Groups</option>';
    groups.forEach(g => {
        if (g)
            groupSelect.innerHTML += `<option value="${g}">${g}</option>`;
    });
    groupSelect.value = selectedGroup;
    populateSubgroupFilter(selectedGroup);
}

function populateSubgroupFilter(group) {
    let availableSubgroups = [];
    if (group !== "all") {
        availableSubgroups = [...new Set(allQuestions.filter(q => q.group === group).map(q => q.subgroup))];
    } else {
        availableSubgroups = [...new Set(allQuestions.map(q => q.subgroup))];
    }
    const subgroupSelect = document.getElementById('subgroupFilter');
    if (!subgroupSelect) return;
    subgroupSelect.innerHTML = '<option value="all">All Subgroups</option>';
    availableSubgroups.forEach(sg => {
        if (sg && sg !== "General")
            subgroupSelect.innerHTML += `<option value="${sg}">${sg}</option>`;
    });
    if (selectedSubgroup !== "all" && availableSubgroups.includes(selectedSubgroup)) {
        subgroupSelect.value = selectedSubgroup;
    } else {
        subgroupSelect.value = "all";
        selectedSubgroup = "all";
    }
}

// بدء جديد: مسح تقدم هذا القسم
function studyNewGroup() {
    const group = document.getElementById('groupFilter').value;
    const subgroup = document.getElementById('subgroupFilter').value;
    if (group === "all") {
        alert(getTranslation('selectGroupFirst'));
        return;
    }
    // تحديد الأسئلة المتأثرة
    const affectedQuestions = allQuestions.filter(q => q.group === group && (subgroup === "all" || q.subgroup === subgroup));
    const affectedIds = affectedQuestions.map(q => q.id);
    // إزالة هذه المعرفات من سجلات الصواب والخطأ
    correctIds = correctIds.filter(id => !affectedIds.includes(id));
    wrongIds = wrongIds.filter(id => !affectedIds.includes(id));
    // حفظ
    persistAll();
    // ضبط الفلتر على هذه المجموعة
    selectedGroup = group;
    selectedSubgroup = subgroup;
    practiceMode = "all";
    refreshRemainingPool();
    loadNewQuestion();
    updateCounters();
    alert(`✅ ${getTranslation('groupProgressReset') || `تم إعادة تعيين تقدم مجموعة ${group}${subgroup !== "all" ? "/"+subgroup : ""}`}`);
}

// مواصلة: عرض الأخطاء + الأسئلة غير المجاب عليها (المتبقية)
function studyContinueGroup() {
    const group = document.getElementById('groupFilter').value;
    const subgroup = document.getElementById('subgroupFilter').value;
    if (group === "all") {
        alert(getTranslation('selectGroupFirst'));
        return;
    }
    selectedGroup = group;
    selectedSubgroup = subgroup;
    practiceMode = "wrongOnly"; // سيجلب only الأخطاء + غير المجاب عليها
    refreshRemainingPool();
    loadNewQuestion();
    updateCounters();
}

function applyGroupFilter() {
    const group = document.getElementById('groupFilter').value;
    const subgroup = document.getElementById('subgroupFilter').value;
    
    selectedGroup = group;
    selectedSubgroup = subgroup;
    practiceMode = "all";   // بدون سؤال المستخدم
    
    refreshRemainingPool();
    loadNewQuestion();
    updateCounters();
}
function resetGroupFilter() {
    document.getElementById('groupFilter').value = "all";
    document.getElementById('subgroupFilter').value = "all";
    selectedGroup = "all";
    selectedSubgroup = "all";
    practiceMode = "all";
    populateSubgroupFilter("all");
    refreshRemainingPool();
    loadNewQuestion();
    updateCounters();
}

// ========== إدارة قائمة المستخدم ==========
async function initUserMenu() {
    const display = document.getElementById('userDisplay');
    const dropdown = document.getElementById('userDropdown');
    if (!display || !dropdown) return;
    
    display.onclick = (e) => {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    };
    window.addEventListener('click', () => { dropdown.style.display = 'none'; });
    
    // تغيير الاسم
    document.getElementById('changeNameBtn')?.addEventListener('click', async () => {
        const newName = prompt("Enter your new name:", currentUser.name);
        if (newName && newName.trim()) {
            currentUser.name = newName.trim();
            localStorage.setItem('ch_current_user', JSON.stringify(currentUser));
            document.getElementById('userDisplay').innerHTML = `👤 ${currentUser.name}`;
            if (!currentUser.isGuest && currentUser.uid) {
                await updateDoc(doc(db, 'users', currentUser.uid), { name: currentUser.name });
            }
            alert("Name updated!");
        }
        dropdown.style.display = 'none';
    });
    
    // عرض الترتيب العالمي
document.getElementById('showRankingBtn')?.addEventListener('click', async () => {
    if (!currentUser || currentUser.isGuest) {
        alert("🏆 Ranking is only for registered users. Please sign up.");
        dropdown.style.display = 'none';
        return;
    }

    try {
        console.log("Fetching users collection...");
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        console.log("Number of users found:", snapshot.size);
        
        if (snapshot.empty) {
            alert("Update the website, try again later!");
            dropdown.style.display = 'none';
            return;
        }
        
        let rankings = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const totalCorrect = (data.correctIds || []).length;
            rankings.push({
                name: data.name || docSnap.id,
                correct: totalCorrect,
                uid: docSnap.id
            });
        });
        
        rankings.sort((a, b) => b.correct - a.correct);
        
        // مكان المستخدم الحالي
        let currentRank = rankings.findIndex(r => r.uid === currentUser.uid) + 1;
        let currentCorrect = rankings.find(r => r.uid === currentUser.uid)?.correct || 0;
        
        let rankMsg = `🏆 GLOBAL RANKING 🏆\n\n`;
        rankMsg += `You are #${currentRank} with ${currentCorrect} correct answers.\n\n`;
        rankMsg += `📊 Top 10 Learners:\n`;
        
        const top10 = rankings.slice(0, 10);
        top10.forEach((u, idx) => {
            let medal = "";
            if (idx === 0) medal = "🥇 ";
            else if (idx === 1) medal = "🥈 ";
            else if (idx === 2) medal = "🥉 ";
            rankMsg += `${medal}${idx+1}. ${u.name}: ${u.correct} ✅\n`;
        });
        
        if (rankings.length > 10) {
            rankMsg += `\n... and ${rankings.length - 10} more learners.`;
        }
        
        alert(rankMsg);
    } catch (error) {
        console.error("Error loading ranking:", error);
        alert(`❌ Ranking error: ${error.message}\n\nPlease check Firestore rules and try again.`);
    }
    dropdown.style.display = 'none';
});
    
    // إنشاء مجموعة
    document.getElementById('createGroupBtn')?.addEventListener('click', () => {
        alert("👥 Study Groups feature will be available in the next update.");
        dropdown.style.display = 'none';
    });
    
    // إرسال رسالة
    document.getElementById('sendMessageBtn')?.addEventListener('click', () => {
        alert("💬 Messaging feature will be available in the next update.");
        dropdown.style.display = 'none';
    });
}

// ========== المزامنة مع Firebase ==========
let syncInterval = null;
let isSyncing = false;

async function syncWithFirebaseManual() {
    if (!currentUser || currentUser.isGuest) { alert("Only registered users can sync."); return; }
    if (isSyncing) { alert("Already syncing..."); return; }
    isSyncing = true;
    const btn = document.getElementById('manualSyncBtn');
    if (btn) { btn.innerHTML = '⏳ Syncing...'; btn.disabled = true; }
    try {
        await syncToFirebase();
        await loadFromFirebase();
        refreshRemainingPool();
        loadNewQuestion();
        updateCounters();
        renderCategoryHint();
        populateGroupFilter();
    } catch(e) { alert("Sync failed: " + e.message); }
    finally {
        isSyncing = false;
        if (btn) { btn.innerHTML = '🔄 Sync Now'; btn.disabled = false; }
    }
}

function startAutoSync(intervalMinutes = 5) {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(() => {
        if (currentUser && !currentUser.isGuest && !isSyncing) {
            syncWithFirebaseManual(); // بدون تنبيه (يمكن إضافة alert اختياري)
        }
    }, intervalMinutes * 60 * 1000);
}

// ---------- 初始化 & 事件绑定 ----------
async function init() {
    showWaitingOverlay();
    // أولاً: تحميل المستخدم الحالي
    if (!loadCurrentUser()) return;
    
    // تحميل البيانات
    await loadAllData();
    refreshRemainingPool();
    loadNewQuestion();
    updateCounters();
    renderCategoryHint();

    // الأزرار الأساسية
    document.getElementById('submitAnswer').addEventListener('click', submitCheck);
    document.getElementById('nextQuestion').addEventListener('click', nextQuestionHandler);
    document.getElementById('resetStudyStats').addEventListener('click', resetStats);
    document.getElementById('practiceWrongBtn').addEventListener('click', () => {
        const wrongList = allQuestions.filter(q => wrongIds.includes(q.id));
        if (wrongList.length) {
            currentQuestionObj = wrongList[0];
            document.getElementById('questionText').innerHTML = currentQuestionObj.text;
            document.getElementById('questionImageArea').innerHTML = `🖼️ 【${currentQuestionObj.category}】 `;
            document.getElementById('answerInput').value = '';
            document.getElementById('feedbackMsg').innerHTML = '';
            document.querySelector('[data-tab="learn"]').click();
        } else {
            alert(getTranslation('noWrong') || '暂无错题');
        }
    });
    document.getElementById('clearAllCorrectBtn').addEventListener('click', () => {
        correctIds = [];
        persistAll();
        refreshRemainingPool();
        loadNewQuestion();
    });
    document.getElementById('addQuestionBtn').addEventListener('click', addNewQuestion);
    document.getElementById('batchAddBtn').addEventListener('click', batchAddQuestions);

    // أزرار دراسة المجموعات
    document.getElementById('studyNewBtn').addEventListener('click', studyNewGroup);
    document.getElementById('studyContinueBtn').addEventListener('click', studyContinueGroup);
    document.getElementById('resetGroupFilter').addEventListener('click', resetGroupFilter);

    // البحث في إدارة الأسئلة
    const searchInput = document.getElementById('searchQuestionInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => renderManageList());
    }

    // تبديل التبويبات
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active-panel'));
            const panelId = btn.dataset.tab + 'Panel';
            document.getElementById(panelId).classList.add('active-panel');
            if (btn.dataset.tab === 'manage') renderManageList();
            if (btn.dataset.tab === 'correct') renderCorrectList();
            if (btn.dataset.tab === 'wrong') renderWrongList();
        });
    });

    // ربط أحداث الفلاتر - التطبيق التلقائي عند تغيير القيم
    const groupFilter = document.getElementById('groupFilter');
    const subgroupFilter = document.getElementById('subgroupFilter');
    const applyBtn = document.getElementById('applyGroupFilter');

    if (groupFilter) {
        groupFilter.addEventListener('change', () => {
            if (subgroupFilter) populateSubgroupFilter(groupFilter.value);
            applyGroupFilter();  // تطبيق تلقائي دون انتظار زر
        });
    }
    if (subgroupFilter) {
        subgroupFilter.addEventListener('change', () => applyGroupFilter());
    }
    if (applyBtn) applyBtn.addEventListener('click', applyGroupFilter);

    // تعبئة القوائم المنسدلة
    populateGroupFilter();

    // ✅ ميزة إرسال الإجابة بالضغط على Enter (مع دعم الانتقال السريع بعد الخطأ)
    const answerInput = document.getElementById('answerInput');
    if (answerInput) {
        answerInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                // إذا كانت هناك نتيجة إجابة معروضة بالفعل (تم الإجابة على هذا السؤال)
                if (currentQuestionObj && lastAnsweredId === currentQuestionObj.id) {
                    // الانتقال إلى السؤال التالي (بدلاً من إعادة الإرسال)
                    nextQuestionHandler();
                } else if (autoNextTimer) {
                    // إذا كان هناك تأخير (بعد إجابة صحيحة أو خاطئة) ننتقل فوراً
                    clearTimeout(autoNextTimer);
                    loadNewQuestion();
                    isProcessing = false;
                } else if (!isProcessing && currentQuestionObj) {
                    // لا توجد إجابة بعد، نقوم بإرسال الإجابة
                    document.getElementById('submitAnswer').click();
                }
            }
        });
    }

    // ========== نظام الحزم القابل للطي (Accordion) ==========
    const openModalBtn = document.getElementById('openPackManagerBtn');
    const closeModalBtn = document.getElementById('closePackModalBtn');
    const modal = document.getElementById('packModal');

    if (openModalBtn) {
        openModalBtn.addEventListener('click', async () => {
            modal.style.display = 'flex';
            const packsData = await loadAvailablePacks();
            const container = document.getElementById('packTreeContainer');
            const lang = currentLang === 'zh' ? 'zh' : 'en';
            
            if (!container) return;
            
            let html = '';
            for (const [packId, packInfo] of Object.entries(packsData)) {
                const packName = lang === 'zh' ? (packInfo.nameZh || packInfo.name) : (packInfo.nameEn || packInfo.name);
                html += `<details style="margin-bottom:12px; border-left:3px solid #c67b3c; padding-left:8px;">
                            <summary style="font-size:1rem; font-weight:bold; cursor:pointer; padding:6px 0;">📁 ${packName}</summary>
                            <div style="margin-top:8px; margin-left:20px;">`;
                
                const lessons = packInfo.lessons || {};
                for (const [lessonId, lessonInfo] of Object.entries(lessons)) {
                    const lessonName = lang === 'zh' ? (lessonInfo.nameZh || lessonInfo.name) : (lessonInfo.nameEn || lessonInfo.name);
                    html += `<div style="margin:8px 0; display:flex; justify-content:space-between; align-items:center;">
                                <span>${lessonName}</span>
                                <button class="small downloadLessonBtn" 
                                        data-pack="${packId}" 
                                        data-lesson="${lessonId}" 
                                        data-file="${lessonInfo.file}" 
                                        data-name="${lessonName}">⬇️ Download</button>
                            </div>`;
                }
                html += `</div></details>`;
            }
            container.innerHTML = html;
            
            // ربط أزرار التحميل لكل درس
            document.querySelectorAll('.downloadLessonBtn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const packId = btn.dataset.pack;
                    const lessonId = btn.dataset.lesson;
                    const file = btn.dataset.file;
                    const name = btn.dataset.name;
                    await downloadAndAddLesson(packId, lessonId, { name, file });
                });
            });
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // إغلاق النافذة عند النقر خارجها
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // ========== أدوات الحذف حسب المجموعة ==========
    const deleteGroupBtn = document.getElementById('deleteGroupBtn');
    const deleteSubgroupBtn = document.getElementById('deleteSubgroupBtn');
    if (deleteGroupBtn) deleteGroupBtn.addEventListener('click', deleteGroup);
    if (deleteSubgroupBtn) deleteSubgroupBtn.addEventListener('click', deleteSubgroup);
    populateDeleteGroupFilter();

    // ========== قائمة المستخدم (تعديل الاسم، الترتيب) ==========
    initUserMenu();

    // ========== زر المزامنة اليدوي ==========
    const manualSyncBtn = document.getElementById('manualSyncBtn');
    if (manualSyncBtn) manualSyncBtn.addEventListener('click', syncWithFirebaseManual);
    startAutoSync(5);  // مزامنة تلقائية كل 5 دقائق

    // ========== إخفاء زر Logout للضيوف ==========
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && currentUser && currentUser.isGuest) {
        logoutBtn.style.display = 'none';
    }
    hideWaitingOverlay();
}

// 启动应用
init();