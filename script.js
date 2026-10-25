/**
 * FOCUS MODE - Core System Engine
 * Features: Topic-Driven Sequential Progression, No-Repeat FIFO Memory Queue,
 * Custom Auras, Active Boost Timers, and Tab-Persistent Auth via sessionStorage.
 */

// DOM Elements
const streakCountEl = document.getElementById("streak-count");
const userDisplayNameEl = document.getElementById("user-display-name");
const demonSpeechEl = document.getElementById("demon-speech");
const demonRankTitle = document.getElementById("demon-rank-title");
const completeBtn = document.getElementById("complete-lesson-btn");
const resetBtn = document.getElementById("reset-btn");
const mascotSvgContainer = document.getElementById("mascot-svg-container");
const quizAvatarContainer = document.getElementById("quiz-avatar-container");
const themeToggleBtn = document.getElementById("theme-toggle");
const brandSuffix = document.getElementById("brand-suffix");

// Settings Modal
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsBtn = document.getElementById("close-settings-btn");

// Currency & Boost Displays
const currencyCountEl = document.getElementById("currency-count");
const currencyIconEl = document.getElementById("currency-icon");
const boostIndicator = document.getElementById("boost-indicator");
const boostTimerEl = document.getElementById("boost-timer");

const toggleAnalyticsBtn = document.getElementById("toggle-analytics-btn");
const toggleAltarBtn = document.getElementById("toggle-altar-btn");
const analyticsPanel = document.getElementById("analytics-panel");
const altarPanel = document.getElementById("altar-panel");
const altarTitle = document.getElementById("altar-title");

// Shop Buttons
const buyShieldBtn = document.getElementById("buy-shield-btn");
const buyStarBtn = document.getElementById("buy-star-btn");
const buyGlyphsBtn = document.getElementById("buy-glyphs-btn");
const buyBoost10 = document.getElementById("buy-boost-10");
const buyBoost15 = document.getElementById("buy-boost-15");
const buyBoost20 = document.getElementById("buy-boost-20");

const buyAuraRed = document.getElementById("buy-aura-red");
const buyAuraCyan = document.getElementById("buy-aura-cyan");
const buyAuraPurple = document.getElementById("buy-aura-purple");
const buyAuraGold = document.getElementById("buy-aura-gold");

// Analytics Displays
const statAccuracy = document.getElementById("stat-accuracy");
const statSolved = document.getElementById("stat-solved");
const statShields = document.getElementById("stat-shields");

// Tabs & Paths
const tabButtons = document.querySelectorAll(".tab-btn");
const currentPathTitle = document.getElementById("current-path-title");
const biomeIndicator = document.getElementById("biome-indicator");
const pathContainer = document.getElementById("path-container");
const startTrialBtn = document.getElementById("start-trial-btn");

const subjectTitleDisplay = document.getElementById("subject-title-display");
const subjectDescDisplay = document.getElementById("subject-desc-display");
const subjectIconDisplay = document.getElementById("subject-icon-display");

// Modal Elements
const studyModal = document.getElementById("study-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalTitle = document.getElementById("modal-subject-title");
const modalLessonText = document.getElementById("modal-lesson-text");
const quizQuestion = document.getElementById("quiz-question");
const quizOptionsContainer = document.getElementById("quiz-options-container");
const quizFeedback = document.getElementById("quiz-feedback");
const finishLessonBtn = document.getElementById("finish-lesson-btn");
const quizDemonSpeech = document.getElementById("quiz-demon-speech");
const conceptScoreEl = document.getElementById("concept-score");
const explanationBox = document.getElementById("explanation-box");
const explanationText = document.getElementById("explanation-text");

// Auth Elements
const authModal = document.getElementById("auth-modal");
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const authUsernameInput = document.getElementById("auth-username");
const authPasswordInput = document.getElementById("auth-password");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const authToggleBtn = document.getElementById("auth-toggle-btn");
const authToggleText = document.getElementById("auth-toggle-text");

const firstChoiceModal = document.getElementById("first-choice-modal");
const selectDemonPathBtn = document.getElementById("select-demon-path");
const selectAngelPathBtn = document.getElementById("select-angel-path");

// State Initialization
let activeSubjectKey = "math";
let currentTheme = localStorage.getItem("focus_path_theme") || "demon";
let conceptCorrectCount = 0;
let questionPools = {};
let boostInterval = null;
let isSignUpMode = false;
let currentUser = sessionStorage.getItem("focus_session_user") || null;

let userProgress = { math: 1, english: 1, social: 1, science: 1 };
let userStats = { 
  totalSolved: 0, 
  totalCorrect: 0, 
  currency: 0, 
  shields: 0, 
  elderGlyphs: false,
  hasStar: false,
  auraTheme: null,
  boostEndTime: 0
};

let askedQuestionsBuffer = {
  math: [],
  english: [],
  social: [],
  science: []
};

const subjectDetails = {
  math: { name: "Core Math", icon: "📐", desc: "Algebra, Geometry & Trigonometry" },
  english: { name: "English Language", icon: "✍️", desc: "Grammar, Essays & Comprehension" },
  social: { name: "Social Studies", icon: "🌍", desc: "Governance, Economy & Culture" },
  science: { name: "Int. Science", icon: "🔬", desc: "Biology, Chemistry & Physics" }
};

const demonicRanks = [
  { name: "Rank I: Lesser Grimoire", title: "NEOPHYTE" },
  { name: "Rank II: Bound Fiend", title: "ADEPT" },
  { name: "Rank III: Crimson Sovereign", title: "WARLORD" },
  { name: "Rank IV: Void Abomination", title: "OVERLORD" },
  { name: "Rank V: Supreme Arch Demon", title: "ARCH DEMON" },
  { name: "Rank VI: Lord of the Abyss", title: "ABYSSAL LORD" },
  { name: "Rank VII: Hellfire Sovereign", title: "HELLFIRE KING" }
];

const angelicRanks = [
  { name: "Rank I: Seraph Apprentice", title: "NOVICE" },
  { name: "Rank II: Halo Scholar", title: "ACOLYTE" },
  { name: "Rank III: Radiant Archon", title: "TEMPLAR" },
  { name: "Rank IV: Seraphim Guardian", title: "JUSTICAR" },
  { name: "Rank V: Ascended Divinity", title: "ARCH ANGEL" },
  { name: "Rank VI: Throne of Light", title: "CELESTIAL CHIEF" },
  { name: "Rank VII: Prime Seraphim", title: "DIVINE SOVEREIGN" }
];

let glyphs = ["∆", "∇", "Φ", "Ω", "Ψ"];

// --------------------------------------------------------------------------
// ASYNC QUESTION LOADER
// --------------------------------------------------------------------------
async function loadQuestions() {
  try {
    const res = await fetch("questions.json");
    questionPools = await res.json();
  } catch (err) {
    console.error("Could not fetch questions.json:", err);
  }
}

// Sound Synthesizer
function playSound(type) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    if (type === "correct") {
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start(); osc.stop(audioCtx.currentTime + 0.2);
    } else {
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    }
  } catch(e) {}
}

loadQuestions();

// --------------------------------------------------------------------------
// AUTHENTICATION & SESSION ENGINE
// --------------------------------------------------------------------------
authToggleBtn.addEventListener("click", (e) => {
  e.preventDefault();
  isSignUpMode = !isSignUpMode;

  if (isSignUpMode) {
    authTitle.textContent = "CREATE ACCOUNT";
    authSubmitBtn.textContent = "Register & Start";
    authToggleText.textContent = "Already have an account?";
    authToggleBtn.textContent = "Log In";
  } else {
    authTitle.textContent = "FOCUS MODE AUTH";
    authSubmitBtn.textContent = "Log In";
    authToggleText.textContent = "Don't have an account?";
    authToggleBtn.textContent = "Create One";
  }
});

authForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = authUsernameInput.value.trim().toLowerCase();
  const password = authPasswordInput.value.trim();

  if (!username || !password) return;

  let userDB = JSON.parse(localStorage.getItem("focus_user_db")) || {};

  if (isSignUpMode) {
    if (userDB[username]) {
      alert("Username already exists! Choose another or log in.");
      return;
    }

    userDB[username] = {
      password: password,
      progress: { math: 1, english: 1, social: 1, science: 1 },
      stats: { totalSolved: 0, totalCorrect: 0, currency: 0, shields: 0, elderGlyphs: false, hasStar: false, auraTheme: null, boostEndTime: 0 },
      askedBuffer: { math: [], english: [], social: [], science: [] },
      theme: null
    };

    localStorage.setItem("focus_user_db", JSON.stringify(userDB));
    sessionStorage.setItem("focus_session_user", username);
    currentUser = username;

    authModal.classList.remove("active");
    firstChoiceModal.classList.add("active");
  } else {
    const userData = userDB[username];
    if (!userData || userData.password !== password) {
      alert("Invalid username or password!");
      return;
    }

    sessionStorage.setItem("focus_session_user", username);
    currentUser = username;
    loadUserData(userData);
    authModal.classList.remove("active");
  }
});

selectDemonPathBtn.addEventListener("click", () => setInitialPath("demon"));
selectAngelPathBtn.addEventListener("click", () => setInitialPath("angel"));

function setInitialPath(chosenTheme) {
  currentTheme = chosenTheme;
  localStorage.setItem("focus_path_theme", currentTheme);

  let userDB = JSON.parse(localStorage.getItem("focus_user_db")) || {};
  if (userDB[currentUser]) {
    userDB[currentUser].theme = chosenTheme;
    localStorage.setItem("focus_user_db", JSON.stringify(userDB));
  }

  applyTheme(currentTheme);
  updateMascotAndRank();
  firstChoiceModal.classList.remove("active");
}

function loadUserData(userData) {
  userProgress = userData.progress || { math: 1, english: 1, social: 1, science: 1 };
  userStats = userData.stats || { totalSolved: 0, totalCorrect: 0, currency: 0, shields: 0, elderGlyphs: false, hasStar: false, auraTheme: null, boostEndTime: 0 };
  askedQuestionsBuffer = userData.askedBuffer || { math: [], english: [], social: [], science: [] };

  if (userData.theme) {
    currentTheme = userData.theme;
    localStorage.setItem("focus_path_theme", currentTheme);
  }

  if (userStats.elderGlyphs) {
    glyphs = ["☠", "⚡", "🔮", "✦", "☸"];
  }

  applyTheme(currentTheme);
  renderPath();
  updateMascotAndRank();
  updateAnalyticsUI();
  startBoostTimer();
}

function saveStats() {
  if (currentUser) {
    let userDB = JSON.parse(localStorage.getItem("focus_user_db")) || {};
    if (userDB[currentUser]) {
      userDB[currentUser].progress = userProgress;
      userDB[currentUser].stats = userStats;
      userDB[currentUser].askedBuffer = askedQuestionsBuffer;
      userDB[currentUser].theme = currentTheme;
      localStorage.setItem("focus_user_db", JSON.stringify(userDB));
    }
  }
  updateAnalyticsUI();
}

window.addEventListener("DOMContentLoaded", () => {
  if (currentUser) {
    let userDB = JSON.parse(localStorage.getItem("focus_user_db")) || {};
    if (userDB[currentUser]) {
      loadUserData(userDB[currentUser]);
      authModal.classList.remove("active");
    } else {
      authModal.classList.add("active");
    }
  } else {
    authModal.classList.add("active");
  }
});

// Settings Controls
settingsBtn.addEventListener("click", () => settingsModal.classList.add("active"));
closeSettingsBtn.addEventListener("click", () => settingsModal.classList.remove("active"));

toggleAnalyticsBtn.addEventListener("click", () => {
  analyticsPanel.classList.toggle("hidden");
  altarPanel.classList.add("hidden");
});

toggleAltarBtn.addEventListener("click", () => {
  altarPanel.classList.toggle("hidden");
  analyticsPanel.classList.add("hidden");
});

// Shop Purchases
buyShieldBtn.addEventListener("click", () => {
  if (userStats.currency >= 20) {
    userStats.currency -= 20;
    userStats.shields += 1;
    saveStats();
    alert("Streak Protection Rune acquired!");
  } else { alert("Need 20 Essences!"); }
});

buyStarBtn.addEventListener("click", () => {
  if (userStats.currency >= 15 && !userStats.hasStar) {
    userStats.currency -= 15;
    userStats.hasStar = true;
    saveStats();
    updateMascotAndRank();
    alert("Prestige Rank Star Unlocked!");
  } else if (userStats.hasStar) {
    alert("Prestige Rank Star already equipped!");
  } else { alert("Need 15 Essences!"); }
});

buyGlyphsBtn.addEventListener("click", () => {
  if (userStats.currency >= 30 && !userStats.elderGlyphs) {
    userStats.currency -= 30;
    userStats.elderGlyphs = true;
    glyphs = ["☠", "⚡", "🔮", "✦", "☸"];
    saveStats();
    renderPath();
    alert("Elder Glyphs Unlocked!");
  } else if (userStats.elderGlyphs) {
    alert("Elder Glyphs already owned!");
  } else { alert("Need 30 Essences!"); }
});

function applyBoost(minutes, cost) {
  if (userStats.currency >= cost) {
    userStats.currency -= cost;
    const now = Date.now();
    userStats.boostEndTime = Math.max(userStats.boostEndTime, now) + (minutes * 60 * 1000);
    saveStats();
    startBoostTimer();
    alert(`${minutes}-Minute Aura Boost Activated!`);
  } else {
    alert(`Need ${cost} Essences.`);
  }
}

buyBoost10.addEventListener("click", () => applyBoost(10, 5));
buyBoost15.addEventListener("click", () => applyBoost(15, 8));
buyBoost20.addEventListener("click", () => applyBoost(20, 10));

function applyAuraTheme(themeClass, cost) {
  if (userStats.currency >= cost || userStats.auraTheme === themeClass) {
    if (userStats.auraTheme !== themeClass) {
      userStats.currency -= cost;
      userStats.auraTheme = themeClass;
    }
    document.body.className = document.body.className.replace(/aura-theme-\w+/g, "");
    document.body.classList.add(themeClass);
    saveStats();
    alert("Aura Theme Applied!");
  } else {
    alert(`Need ${cost} Essences.`);
  }
}

buyAuraRed.addEventListener("click", () => applyAuraTheme("aura-theme-red", 12));
buyAuraCyan.addEventListener("click", () => applyAuraTheme("aura-theme-cyan", 12));
buyAuraPurple.addEventListener("click", () => applyAuraTheme("aura-theme-purple", 12));
buyAuraGold.addEventListener("click", () => applyAuraTheme("aura-theme-gold", 12));

function startBoostTimer() {
  clearInterval(boostInterval);
  boostInterval = setInterval(() => {
    const now = Date.now();
    const remaining = userStats.boostEndTime - now;
    if (remaining > 0) {
      boostIndicator.classList.remove("hidden");
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      boostTimerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
      boostIndicator.classList.add("hidden");
      clearInterval(boostInterval);
    }
  }, 1000);
}

themeToggleBtn.addEventListener("click", () => {
  currentTheme = currentTheme === "demon" ? "angel" : "demon";
  localStorage.setItem("focus_path_theme", currentTheme);
  applyTheme(currentTheme);
  updateMascotAndRank();
  saveStats();
});

function applyTheme(theme) {
  if (theme === "angel") {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    themeToggleBtn.textContent = "👼";
    brandSuffix.textContent = "ASCENSION";
    currencyIconEl.textContent = "✨";
    altarTitle.textContent = "Altar of Ascension (Vault)";
  } else {
    document.body.classList.remove("light-mode");
    document.body.classList.add("dark-mode");
    themeToggleBtn.textContent = "🔥";
    brandSuffix.textContent = "MODE";
    currencyIconEl.textContent = "💎";
    altarTitle.textContent = "Altar of Damnation (Vault)";
  }

  if (userStats.auraTheme) {
    document.body.classList.add(userStats.auraTheme);
  }
}

function updateMascotAndRank() {
  const totalConquered = userProgress.math + userProgress.english + userProgress.social + userProgress.science - 4;
  let rankIdx = Math.floor(totalConquered / 15);
  if (rankIdx > 6) rankIdx = 6;

  const ranksList = currentTheme === "demon" ? demonicRanks : angelicRanks;
  const currentRank = ranksList[rankIdx];

  const starBadge = userStats.hasStar ? " ⭐" : "";
  userDisplayNameEl.textContent = currentRank.title + starBadge;
  streakCountEl.textContent = totalConquered;
  demonRankTitle.textContent = currentRank.name;

  if (currentTheme === "demon") {
    demonSpeechEl.textContent = `"Conquer the active topic nodes to expand your realm."`;
    mascotSvgContainer.innerHTML = `<svg viewBox="0 0 120 120" width="80" height="80"><path d="M 10 95 Q 60 115 110 95 L 110 25 Q 60 40 10 25 Z" fill="#1f1118" stroke="#ff2e55" stroke-width="3"/><circle cx="60" cy="62" r="16" fill="#ff2e55"/><path d="M 25 25 Q 5 -10 -8 5 Q 8 15 18 32" fill="#8b0000"/><path d="M 95 25 Q 115 -10 128 5 Q 112 15 102 32" fill="#8b0000"/></svg>`;
    quizAvatarContainer.innerHTML = `<svg viewBox="0 0 140 120" width="80" height="70"><text x="15" y="50" fill="#ff2e55" font-size="12" font-family="monospace">∇×B</text><circle cx="70" cy="60" r="14" fill="#0b0c10" stroke="#ff2e55" stroke-width="3"/><circle cx="70" cy="60" r="5" fill="#ff2e55"/></svg>`;
  } else {
    demonSpeechEl.textContent = `"Align your focus with celestial light to ascend higher."`;
    mascotSvgContainer.innerHTML = `<svg viewBox="0 0 120 120" width="80" height="80"><circle cx="60" cy="20" r="18" fill="none" stroke="#ffd700" stroke-width="4"/><path d="M 15 85 Q 60 105 105 85 L 105 35 Q 60 50 15 35 Z" fill="#ffffff" stroke="#ffd700" stroke-width="3"/><circle cx="60" cy="65" r="12" fill="#0284c7"/></svg>`;
    quizAvatarContainer.innerHTML = `<svg viewBox="0 0 140 120" width="80" height="70"><ellipse cx="70" cy="25" rx="25" ry="8" fill="none" stroke="#ffd700" stroke-width="3"/><circle cx="70" cy="65" r="12" fill="#ffffff" stroke="#ffd700" stroke-width="3"/></svg>`;
  }
}

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeSubjectKey = btn.getAttribute("data-subject");
    const data = subjectDetails[activeSubjectKey];
    subjectTitleDisplay.textContent = data.name;
    subjectIconDisplay.textContent = data.icon;
    subjectDescDisplay.textContent = data.desc;
    currentPathTitle.textContent = `Path of ${data.name}`;
    renderPath();
  });
});

function renderPath() {
  pathContainer.innerHTML = "";
  const currentLevel = userProgress[activeSubjectKey];
  const positions = ["pos-center", "pos-left", "pos-center", "pos-right", "pos-center"];

  for (let i = 1; i <= 120; i++) {
    if (i > 1 && (i - 1) % 30 === 0) {
      const divider = document.createElement("div");
      divider.className = "path-divider-line";
      divider.innerHTML = `<span>TOPIC SHIFT: NODES ${i} - ${i + 29}</span>`;
      pathContainer.appendChild(divider);
    }

    const node = document.createElement("div");
    const isMajor = (i % 5 === 0);
    const posClass = positions[(i - 1) % 5];
    node.className = `path-node ${posClass} ${isMajor ? 'major-peak' : ''}`;
    
    if (i < currentLevel) node.classList.add("completed");
    else if (i === currentLevel) node.classList.add("active");

    const glyphIndex = (i - 1) % glyphs.length;
    node.innerHTML = `
      <div class="pentagon-base"><span class="glyph-symbol">${isMajor ? '★' : glyphs[glyphIndex]}</span></div>
      <span class="node-title">${isMajor ? `PEAK ${i/5}` : `Node ${i}`}</span>
    `;
    node.addEventListener("click", () => openWorkspace());
    pathContainer.appendChild(node);
  }

  const sectorNum = Math.floor((currentLevel - 1) / 30) + 1;
  biomeIndicator.textContent = `SECTOR ${sectorNum}: ACTIVE NODES`;
}

startTrialBtn.addEventListener("click", openWorkspace);

function openWorkspace() {
  conceptCorrectCount = 0;
  conceptScoreEl.textContent = conceptCorrectCount;
  modalTitle.textContent = subjectDetails[activeSubjectKey].name;
  quizFeedback.textContent = "";
  explanationBox.classList.add("hidden");
  finishLessonBtn.disabled = true;

  if (currentTheme === "demon") {
    quizDemonSpeech.textContent = `"Master this topic to conquer the node!"`;
  } else {
    quizDemonSpeech.textContent = `"Demonstrate discipline across this active topic."`;
  }

  loadNextConceptQuestion();
  studyModal.classList.add("active");
}

function getNextNonRepeatingQuestion() {
  const currentLevel = userProgress[activeSubjectKey] || 1;
  const topicsList = questionPools[activeSubjectKey] || [];

  let activeTopic = topicsList.find(t => currentLevel >= t.nodeRange[0] && currentLevel <= t.nodeRange[1]);

  if (!activeTopic && topicsList.length > 0) {
    activeTopic = topicsList[0];
  }

  const topicQuestions = activeTopic ? activeTopic.questions : [
    { q: "Simplify 2³ × 2⁴", options: [{t: "2⁷", c: true}, {t: "2¹²", c: false}], exp: "Add exponents." }
  ];

  if (modalLessonText) {
    modalLessonText.innerHTML = `Active Topic: <strong>${activeTopic ? activeTopic.topicName : "General Mastery"}</strong><br>Answer 5 questions correctly to conquer this node.`;
  }

  let buffer = askedQuestionsBuffer[activeSubjectKey] || [];
  let availablePool = topicQuestions.filter(q => !buffer.includes(q.q));

  if (availablePool.length === 0) {
    buffer = [];
    availablePool = topicQuestions;
  }

  const selected = availablePool[Math.floor(Math.random() * availablePool.length)] || topicQuestions[0];

  buffer.push(selected.q);
  if (buffer.length > 30) buffer.shift();

  askedQuestionsBuffer[activeSubjectKey] = buffer;
  saveStats();

  return selected;
}

function loadNextConceptQuestion() {
  explanationBox.classList.add("hidden");
  const randQ = getNextNonRepeatingQuestion();

  quizQuestion.textContent = randQ.q;
  quizOptionsContainer.innerHTML = "";

  randQ.options.forEach(opt => {
    const optionBtn = document.createElement("button");
    optionBtn.className = "quiz-option-btn";
    optionBtn.textContent = opt.t;

    optionBtn.addEventListener("click", () => {
      const allBtns = quizOptionsContainer.querySelectorAll(".quiz-option-btn");
      allBtns.forEach(b => b.disabled = true);

      userStats.totalSolved++;

      if (opt.c) {
        optionBtn.classList.add("correct");
        quizFeedback.textContent = "✅ Correct concept match!";
        quizFeedback.style.color = "#16a34a";
        
        userStats.totalCorrect++;
        conceptCorrectCount++;
        conceptScoreEl.textContent = conceptCorrectCount;
        playSound("correct");

        explanationText.textContent = randQ.exp;
        explanationBox.classList.remove("hidden");

        if (conceptCorrectCount >= 5) {
          quizFeedback.textContent = "🏆 Topic Block Mastered! You may now conquer this node.";
          finishLessonBtn.disabled = false;
        } else {
          setTimeout(loadNextConceptQuestion, 2000);
        }
      } else {
        optionBtn.classList.add("wrong");
        quizFeedback.textContent = "❌ Incorrect! Study the explanation below.";
        quizFeedback.style.color = "#dc2626";
        playSound("wrong");

        explanationText.textContent = randQ.exp;
        explanationBox.classList.remove("hidden");

        setTimeout(loadNextConceptQuestion, 2600);
      }

      saveStats();
    });

    quizOptionsContainer.appendChild(optionBtn);
  });
}

function updateAnalyticsUI() {
  currencyCountEl.textContent = userStats.currency;
  statSolved.textContent = userStats.totalSolved;
  statShields.textContent = userStats.shields;

  const accuracy = userStats.totalSolved > 0 
    ? Math.round((userStats.totalCorrect / userStats.totalSolved) * 100) 
    : 0;
  statAccuracy.textContent = `${accuracy}%`;

  document.getElementById("bar-math").style.width = `${Math.min(100, (userProgress.math / 120) * 100)}%`;
  document.getElementById("bar-english").style.width = `${Math.min(100, (userProgress.english / 120) * 100)}%`;
  document.getElementById("bar-social").style.width = `${Math.min(100, (userProgress.social / 120) * 100)}%`;
  document.getElementById("bar-science").style.width = `${Math.min(100, (userProgress.science / 120) * 100)}%`;
}

closeModalBtn.addEventListener("click", () => { studyModal.classList.remove("active"); });

finishLessonBtn.addEventListener("click", () => {
  advanceProgress();
  studyModal.classList.remove("active");
});

completeBtn.addEventListener("click", advanceProgress);

function advanceProgress() {
  userProgress[activeSubjectKey]++;
  userStats.currency += 2;
  saveStats();
  playSound("correct");
  renderPath();
  updateMascotAndRank();
}

resetBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all progress?")) {
    userProgress = { math: 1, english: 1, social: 1, science: 1 };
    userStats = { totalSolved: 0, totalCorrect: 0, currency: 0, shields: 0, elderGlyphs: false, hasStar: false, auraTheme: null, boostEndTime: 0 };
    askedQuestionsBuffer = { math: [], english: [], social: [], science: [] };
    
    saveStats();
    renderPath();
    updateMascotAndRank();
    settingsModal.classList.remove("active");
  }
});