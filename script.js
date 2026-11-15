// --- Global Game State ---
let child = {
  name: "",
  age: "",
  skin: "#f5c7a5",
  hair: "#593b2e",
  eyes: "#65432d",
  outfit: "#a88be0",
  clothes: "shirt",
  coins: 0,
  streak: 0,
  lastBrushDate: "",
  morningDone: false,
  nightDone: false,
  inventory: []
};

// Загрузка сохраненного профиля из localStorage
function loadProfile() {
  const saved = localStorage.getItem("toothTalesProfile");
  if (saved) {
    try {
      child = JSON.parse(saved);
    } catch(e) {
      console.error(e);
    }
  }
}

function saveProfile() {
  localStorage.setItem("toothTalesProfile", JSON.stringify(child));
  updateHeaderStats();
}

function updateHeaderStats() {
  document.getElementById("globalCoins").textContent = child.coins;
  document.getElementById("globalStreak").textContent = child.streak;
  document.getElementById("shopCoins").textContent = child.coins;
}

// Управление экранами
function openScreen(screenId) {
  document.querySelectorAll(".screen").forEach(sc => sc.classList.add("hidden"));
  document.getElementById(screenId).classList.remove("hidden");
  
  if (screenId !== 'welcomeScreen' && screenId !== 'profileScreen') {
    document.getElementById("headerStats").style.display = "flex";
  }
}

// --- 1 & 2. Profile & Character Creator ---
const avatar = document.getElementById("avatar");

function updateAvatarDisplay() {
  avatar.style.setProperty("--skin", child.skin);
  avatar.style.setProperty("--hair", child.hair);
  avatar.style.setProperty("--eyes", child.eyes);
  avatar.style.setProperty("--outfit", child.outfit);
}

document.querySelectorAll(".color-choice").forEach(btn => {
  btn.addEventListener("click", () => {
    const group = btn.dataset.group;
    const color = btn.dataset.color;
    child[group] = color;
    document.querySelectorAll(`.color-choice[data-group="${group}"]`).forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    updateAvatarDisplay();
  });
});

document.querySelectorAll(".outfit-choice").forEach(btn => {
  btn.addEventListener("click", () => {
    child.clothes = btn.dataset.outfit;
    document.querySelectorAll(".outfit-choice").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

document.getElementById("startAdventureBtn").addEventListener("click", () => {
  openScreen("profileScreen");
});

document.getElementById("profileForm").addEventListener("submit", (e) => {
  e.preventDefault();
  child.name = document.getElementById("childName").value.trim();
  child.age = document.getElementById("childAge").value;
  if (!child.name || !child.age) return;

  saveProfile();
  document.getElementById("worldChildName").textContent = child.name;
  openScreen("worldScreen");
});


// --- 4. Education Flow (14 Levels on Jaw) ---
const educationSteps = [
  { title: "Step 1: Pick up toothbrush 🪥", desc: "Tap to pick up your brush and get ready.", action: "normal", brushPos: "top: 15px; left: 15px;" },
  { title: "Step 2: Squeeze toothpaste ✨", desc: "Tap the tube to put toothpaste on the brush.", action: "paste", brushPos: "top: 15px; left: 45%;" },
  { title: "Step 3: Top teeth — outside 🦷", desc: "Move the brush left and right on upper outer incisors.", action: "normal", brushPos: "top: 25px; left: 30%;" },
  { title: "Step 4: Top teeth — inside 🌟", desc: "Brush the inner surface of upper teeth.", action: "normal", brushPos: "top: 28px; left: 55%;" },
  { title: "Step 5: Top teeth — chewing 🍪", desc: "Scrub back and forth on top of upper molars.", action: "normal", brushPos: "top: 20px; left: 70%;" },
  { title: "Step 6: Bottom teeth — outside 😁", desc: "Move the brush left and right on lower outer teeth.", action: "normal", brushPos: "bottom: 25px; left: 30%;" },
  { title: "Step 7: Bottom teeth — inside ✨", desc: "Brush the inner side of your lower teeth gently.", action: "normal", brushPos: "bottom: 28px; left: 50%;" },
  { title: "Step 8: Bottom teeth — chewing 🥞", desc: "Scrub back and forth on lower chewing molars.", action: "normal", brushPos: "bottom: 20px; left: 65%;" },
  { title: "Step 9: Rescue trapped food 🍎", desc: "Clear away stuck food particles to protect from germs.", action: "normal", brushPos: "top: 45%; left: 45%;" },
  { title: "Step 10: Brush your tongue 👅", desc: "Clean your tongue gently for super fresh breath.", action: "normal", brushPos: "top: 48%; left: 48%;" },
  { title: "Step 11: Spit out foam 💧", desc: "Tap to spit out the toothpaste foam safely.", action: "normal", brushPos: "top: 75%; left: 80%;" },
  { title: "Step 12: Rinse your mouth 🥤", desc: "Take clean water and rinse thoroughly.", action: "normal", brushPos: "top: 45%; left: 15%;" },
  { title: "Step 13: Wash your brush 🚿", desc: "Clean your toothbrush under running water.", action: "normal", brushPos: "top: 15px; right: 15px;" },
  { title: "Step 14: Smile! ✨", desc: "Flash a brilliant, glowing clean smile!", action: "normal", brushPos: "top: 45%; left: 45%;" }
];

let currentEduStep = 0;
let stepDoneStatus = new Array(educationSteps.length).fill(false);

function startEducationFlow() {
  currentEduStep = 0;
  stepDoneStatus.fill(false);
  openScreen("educationScreen");
  renderEducationStep();
  renderEduSidebar();
}

function renderEduSidebar() {
  const list = document.getElementById("eduStepsList");
  list.innerHTML = "";
  educationSteps.forEach((st, idx) => {
    const div = document.createElement("div");
    div.className = "edu-step-item";
    if (idx === currentEduStep) div.classList.add("active");
    if (stepDoneStatus[idx]) div.classList.add("done");
    div.textContent = `Step ${idx + 1}: ${st.title.split(":")[1] || st.title}`;
    list.appendChild(div);
  });
}

function renderEducationStep() {
  const st = educationSteps[currentEduStep];
  document.getElementById("eduLevelIndicator").textContent = `Step ${currentEduStep + 1} of 14`;
  document.getElementById("eduCoinsCount").textContent = child.coins;
  document.getElementById("eduStepTitle").textContent = st.title;
  document.getElementById("eduStepDesc").textContent = st.desc;
  document.getElementById("brushCursor").style.cssText = st.brushPos;

  const box = document.getElementById("eduInteractiveContainer");
  box.innerHTML = "";
  const btn = document.getElementById("completeStepBtn");
  btn.style.display = "inline-block";

  if (st.action === "paste") {
    btn.style.display = "none";
    const pasteBtn = document.createElement("button");
    pasteBtn.className = "magical-btn";
    pasteBtn.textContent = "Squeeze Toothpaste 🪥✨";
    pasteBtn.onclick = () => {
      pasteBtn.textContent = "Toothpaste added! 💙";
      setTimeout(completeEducationStep, 600);
    };
    box.appendChild(pasteBtn);
  }

  renderEduSidebar();
}

function completeEducationStep() {
  if (!stepDoneStatus[currentEduStep]) {
    stepDoneStatus[currentEduStep] = true;
    child.coins += 10; // 10 монеток за каждый уровень
    saveProfile();
  }

  currentEduStep++;
  if (currentEduStep < educationSteps.length) {
    renderEducationStep();
  } else {
    alert("🎉 Fantastic! You completed all 14 educational steps and earned 140 coins!");
    openScreen("worldScreen");
  }
}


// --- 5. Streaks & 2-Min Timers ---
let timerInterval = null;

function checkStreakDate() {
  const today = new Date().toDateString();
  if (child.lastBrushDate !== today) {
    // Новый день — сбрасываем статусы чисток, если пропущен день, можно обнулять огонёк при необходимости
    const lastDate = child.lastBrushDate ? new Date(child.lastBrushDate) : null;
    const currentDate = new Date(today);
    if (lastDate) {
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        child.streak = 0; // Сгорает огонёк при пропуске больше 1 дня
      }
    }
  }
  document.getElementById("streakDaysNum").textContent = child.streak;
  updateTimerUI();
}

function updateTimerUI() {
  document.getElementById("morningStatus").textContent = child.morningDone ? "Status: Done today! ✅" : "Status: Not done today";
  document.getElementById("nightStatus").textContent = child.nightDone ? "Status: Done today! ✅" : "Status: Not done today";
}

function startBrushingTimer(session) {
  if (session === 'morning' && child.morningDone) {
    alert("You already completed morning brushing today!");
    return;
  }
  if (session === 'night' && child.nightDone) {
    alert("You already completed night brushing today!");
    return;
  }

  let timeLeft = 120; // 2 минуты
  const displayEl = document.getElementById(session === 'morning' ? 'morningTimerDisplay' : 'nightTimerDisplay');
  const btnEl = document.getElementById(session === 'morning' ? 'startMorningTimerBtn' : 'startNightTimerBtn');
  
  btnEl.disabled = true;
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    let mins = Math.floor(timeLeft / 60);
    let secs = timeLeft % 60;
    displayEl.textContent = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      finishBrushingSession(session);
      btnEl.disabled = false;
      displayEl.textContent = "02:00";
    }
    timeLeft--;
  }, 1000);
}

function finishBrushingSession(session) {
  const today = new Date().toDateString();
  
  if (session === 'morning') child.morningDone = true;
  if (session === 'night') child.nightDone = true;

  // Если обе чистки выполнены за день и дата еще не засчитывалась сегодня
  if (child.morningDone && child.nightDone && child.lastBrushDate !== today) {
    child.streak += 1;
    child.lastBrushDate = today;
    child.coins += 50; // Бонус за полный день огонька

    // Награды за круглые числа дней (10, 20, 30...)
    if (child.streak % 10 === 0) {
      child.coins += 200;
      alert(`🌟 Amazing milestone! ${child.streak} days streak! You earned a mega bonus of 200 coins!`);
    } else {
      alert(`🔥 Day streak increased! Current streak: ${child.streak} days. +50 coins!`);
    }
  } else {
    child.coins += 20; // бонус за одну сессию таймера
    alert(`Great job on your ${session} brushing! +20 coins.`);
  }

  saveProfile();
  updateTimerUI();
}


// --- 6. Jaw Anatomy Puzzles ---
function answerPuzzle(isCorrect) {
  const res = document.getElementById("puzzleResult");
  if (isCorrect) {
    res.textContent = "Correct! Incisors are sharp front teeth used for biting. +15 coins! ✨";
    res.style.color = "#2e7d32";
    child.coins += 15;
    saveProfile();
  } else {
    res.textContent = "Not quite! Try again, think about the front teeth.";
    res.style.color = "#c62828";
  }
}


// --- 7. House & Shop ---
function buyItem(itemName, price) {
  if (child.coins < price) {
    alert("Not enough coins! Complete education steps or daily streaks to earn more.");
    return;
  }
  child.coins -= price;
  child.inventory.push(itemName);
  saveProfile();
  updateHouseDisplay();
  alert(`Successfully bought ${itemName}! Added to your room.`);
}

function updateHouseDisplay() {
  const room = document.getElementById("placedDecorations");
  if (child.inventory.length === 0) {
    room.textContent = "🛏️ (Empty room - buy items in the shop below!)";
  } else {
    room.textContent = "Decorated with: " + child.inventory.join(", ");
  }
}


// --- Init on load ---
window.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  updateAvatarDisplay();
  checkStreakDate();
  updateHouseDisplay();
  if (child.name) {
    document.getElementById("worldChildName").textContent = child.name;
  }
});
