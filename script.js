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

function openScreen(screenId) {
  document.querySelectorAll(".screen").forEach(sc => sc.classList.add("hidden"));
  document.getElementById(screenId).classList.remove("hidden");
  
  if (screenId !== 'welcomeScreen' && screenId !== 'profileScreen') {
    document.getElementById("headerStats").style.display = "flex";
  }
}

// --- Profile & Character Creator ---
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


// --- 14 Levels Education Flow with Finger-Draggable Toothbrush ---
const educationSteps = [
  { title: "Step 1: Pick up toothbrush 🪥", desc: "Drag the toothbrush to pick it up and hold it.", action: "normal" },
  { title: "Step 2: Squeeze toothpaste ✨", desc: "Tap the tube to put magical fluoride paste on your brush.", action: "paste" },
  { title: "Step 3: Top teeth — outside 🦷", desc: "Move your brush left and right on the upper outer teeth.", action: "normal" },
  { title: "Step 4: Top teeth — inside 🌟", desc: "Carefully move the brush on the inner side of upper teeth.", action: "normal" },
  { title: "Step 5: Top teeth — chewing surface 🍪", desc: "Scrub back and forth right on top of upper molars.", action: "normal" },
  { title: "Step 6: Bottom teeth — outside 😁", desc: "Move your brush left and right on lower outer teeth.", action: "normal" },
  { title: "Step 7: Bottom teeth — inside ✨", desc: "Gently move the brush on the inner side of lower teeth.", action: "normal" },
  { title: "Step 8: Bottom teeth — chewing surface 🥞", desc: "Scrub back and forth on lower chewing molars.", action: "normal" },
  { title: "Step 9: Rescue trapped food 🍎", desc: "Brush over food particles stuck between teeth to clear them.", action: "normal" },
  { title: "Step 10: Brush your tongue 👅", desc: "Move the brush gently across your tongue for fresh breath.", action: "normal" },
  { title: "Step 11: Spit out foam 💧", desc: "Tap the sink button to spit out the foam safely.", action: "spit" },
  { title: "Step 12: Rinse your mouth 🥤", desc: "Tap the cup of water to rinse your mouth thoroughly.", action: "rinse" },
  { title: "Step 13: Wash your brush 🚿", desc: "Move your brush under running water to clean it.", action: "normal" },
  { title: "Step 14: Smile! ✨", desc: "Flash a brilliant, glowing clean smile with healthy teeth!", action: "normal" }
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

  const box = document.getElementById("eduInteractiveContainer");
  box.innerHTML = "";
  const btn = document.getElementById("completeStepBtn");
  btn.style.display = "inline-block";

  // Интерактив для выдавливания пасты (Шаг 2)
  if (st.action === "paste") {
    btn.style.display = "none";
    const pasteBtn = document.createElement("button");
    pasteBtn.className = "magical-btn";
    pasteBtn.textContent = "Squeeze Toothpaste Tube 🪥✨";
    pasteBtn.onclick = () => {
      pasteBtn.textContent = "Toothpaste squeezed successfully! 💙";
      setTimeout(completeEducationStep, 600);
    };
    box.appendChild(pasteBtn);
  } 
  // Интерактив для сплевывания (Шаг 11)
  else if (st.action === "spit") {
    btn.style.display = "none";
    const spitBtn = document.createElement("button");
    spitBtn.className = "magical-btn";
    spitBtn.textContent = "Tap Sink to Spit 💧";
    spitBtn.onclick = () => {
      spitBtn.textContent = "Clean foam spat out! ✨";
      setTimeout(completeEducationStep, 600);
    };
    box.appendChild(spitBtn);
  }
  // Интерактив для полоскания (Шаг 12)
  else if (st.action === "rinse") {
    btn.style.display = "none";
    const rinseBtn = document.createElement("button");
    rinseBtn.className = "magical-btn";
    rinseBtn.textContent = "Drink Water & Rinse 🥤";
    rinseBtn.onclick = () => {
      rinseBtn.textContent = "Mouth rinsed and fresh! ✨";
      setTimeout(completeEducationStep, 600);
    };
    box.appendChild(rinseBtn);
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

// Настройка перетаскивания зубной щетки пальцем/мышкой по челюсти
const toothbrushEl = document.getElementById("draggableToothbrush");
const mouthBoard = document.getElementById("interactiveMouthBoard");

let isDragging = false;
let startX = 0, startY = 0;

toothbrushEl.addEventListener("pointerdown", (e) => {
  isDragging = true;
  startX = e.clientX - toothbrushEl.offsetLeft;
  startY = e.clientY - toothbrushEl.offsetTop;
  toothbrushEl.setPointerCapture(e.pointerId);
  e.preventDefault();
});

toothbrushEl.addEventListener("pointermove", (e) => {
  if (!isDragging) return;
  let newX = e.clientX - startX;
  let newY = e.clientY - startY;

  // Ограничиваем движение внутри челюсти
  const boardRect = mouthBoard.getBoundingClientRect();
  const brushRect = toothbrushEl.getBoundingClientRect();

  if (newX >= 0 && newX <= boardRect.width - brushRect.width) {
    toothbrushEl.style.left = newX + "px";
  }
  if (newY >= 0 && newY <= boardRect.height - brushRect.height) {
    toothbrushEl.style.top = newY + "px";
  }
});

function stopDrag(e) {
  isDragging = false;
  if (e.pointerId) {
    try { toothbrushEl.releasePointerCapture(e.pointerId); } catch(err){}
  }
}

toothbrushEl.addEventListener("pointerup", stopDrag);
toothbrushEl.addEventListener("pointercancel", stopDrag);


// --- Streaks & 2-Min Timers ---
let timerInterval = null;

function checkStreakDate() {
  const today = new Date().toDateString();
  if (child.lastBrushDate !== today) {
    const lastDate = child.lastBrushDate ? new Date(child.lastBrushDate) : null;
    const currentDate = new Date(today);
    if (lastDate) {
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        child.streak = 0;
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

  let timeLeft = 120;
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

  if (child.morningDone && child.nightDone && child.lastBrushDate !== today) {
    child.streak += 1;
    child.lastBrushDate = today;
    child.coins += 50;

    if (child.streak % 10 === 0) {
      child.coins += 200;
      alert(`🌟 Amazing milestone! ${child.streak} days streak! You earned a mega bonus of 200 coins!`);
    } else {
      alert(`🔥 Day streak increased! Current streak: ${child.streak} days. +50 coins!`);
    }
  } else {
    child.coins += 20;
    alert(`Great job on your ${session} brushing! +20 coins.`);
  }

  saveProfile();
  updateTimerUI();
}


// --- Jaw Anatomy Puzzles ---
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


// --- House & Shop ---
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
