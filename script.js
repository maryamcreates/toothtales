// --- Global Game State ---
let child = {
  name: "",
  age: "",
  skin: "#f5c7a5",
  hair: "#593b2e",
  eyes: "#65432d",
  outfit: "#a88be0",
  clothes: "shirt",
  coins: 200, // Стартовый бонус для проверки покупок
  streak: 0,
  lastBrushDate: "",
  morningDone: false,
  nightDone: false,
  inventory: [],
  currentWallColor: "#fdfcff"
};

function loadProfile() {
  const saved = localStorage.getItem("toothTalesProfile");
  if (saved) {
    try {
      child = JSON.parse(saved);
      if (typeof child.coins === 'undefined') child.coins = 200;
    } catch(e) { console.error(e); }
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
  if (screenId === 'jawExploreScreen') {
    document.getElementById("anatomyStudyView").classList.remove("hidden");
    document.getElementById("anatomyPuzzleView").classList.add("hidden");
  }
  if (screenId === 'houseScreen') {
    switchShopTab('walls');
  }
}

// --- Profile & Creator (с переключением шорт и платья) ---
const avatar = document.getElementById("avatar");
const avatarBodyEl = document.getElementById("avatarBodyEl");
const avatarShortsEl = document.getElementById("avatarShortsEl");

function updateAvatarDisplay() {
  avatar.style.setProperty("--skin", child.skin);
  avatar.style.setProperty("--hair", child.hair);
  avatar.style.setProperty("--eyes", child.eyes);
  avatar.style.setProperty("--outfit", child.outfit);

  if (child.clothes === 'dress') {
    avatarBodyEl.style.height = "100px";
    avatarBodyEl.style.borderRadius = "20px 20px 35px 35px";
    avatarBodyEl.style.clipPath = "polygon(15% 0, 85% 0, 100% 100%, 0 100%)";
    avatarShortsEl.style.display = "none";
  } else {
    avatarBodyEl.style.height = "75px";
    avatarBodyEl.style.borderRadius = "20px 20px 10px 10px";
    avatarBodyEl.style.clipPath = "none";
    avatarShortsEl.style.display = "block";
  }
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
    updateAvatarDisplay();
  });
});

document.getElementById("startAdventureBtn").addEventListener("click", () => openScreen("profileScreen"));

document.getElementById("profileForm").addEventListener("submit", (e) => {
  e.preventDefault();
  child.name = document.getElementById("childName").value.trim();
  child.age = document.getElementById("childAge").value;
  if (!child.name || !child.age) return;

  saveProfile();
  document.getElementById("worldChildName").textContent = child.name;
  openScreen("worldScreen");
  updateAvatarDisplay();
});


// --- Brushing & Cleaning Flow (с валидацией пасты и воды) ---
const brushingSteps = [
  { title: "Step 1: Apply Toothpaste", desc: "Drag the toothpaste onto your toothbrush to apply paste!" },
  { title: "Step 2: Brush Upper & Lower Teeth", desc: "Use your finger to move the toothbrush all over the teeth." },
  { title: "Step 3: Rinse with Water", desc: "Drag the water cup to rinse your mouth clean." }
];

let currentBrushStep = 0;
let hasPaste = false;
let hasRinsed = false;

function startEducationFlow() {
  currentBrushStep = 0;
  hasPaste = false;
  hasRinsed = false;
  openScreen("educationScreen");
  updateBrushStepUI();
}

function updateBrushStepUI() {
  document.getElementById("eduLevelIndicator").textContent = `Step ${currentBrushStep + 1} of ${brushingSteps.length}`;
  document.getElementById("eduCoinsCount").textContent = child.coins;
  document.getElementById("eduStepTitle").textContent = brushingSteps[currentBrushStep].title;
  document.getElementById("eduStepDesc").textContent = brushingSteps[currentBrushStep].desc;
}

function nextBrushStep() {
  if (currentBrushStep === 0 && !hasPaste) {
    alert("Please apply toothpaste first by dragging it to the toothbrush!");
    return;
  }
  if (currentBrushStep === 2 && !hasRinsed) {
    alert("Please rinse with water first!");
    return;
  }

  currentBrushStep++;
  child.coins += 20;
  saveProfile();

  if (currentBrushStep < brushingSteps.length) {
    updateBrushStepUI();
  } else {
    alert("🎉 Brilliant! Brushing complete. You earned 60 coins!");
    openScreen("worldScreen");
  }
}

// Перетаскивание щетки, пасты и воды
const toothbrushEl = document.getElementById("draggableToothbrush");
const mouthBoard = document.getElementById("interactiveMouthBoard");
const tubeEl = document.getElementById("toothpasteTube");
const waterEl = document.getElementById("waterCup");

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

  const tableRect = document.getElementById("brushingTable").getBoundingClientRect();
  const brushRect = toothbrushEl.getBoundingClientRect();

  if (newX >= 0 && newX <= tableRect.width - brushRect.width) toothbrushEl.style.left = newX + "px";
  if (newY >= 0 && newY <= tableRect.height - brushRect.height) toothbrushEl.style.top = newY + "px";

  if (currentBrushStep === 0 && !hasPaste) {
    const tubeRect = tubeEl.getBoundingClientRect();
    if (Math.abs(brushRect.x - tubeRect.x) < 50 && Math.abs(brushRect.y - tubeRect.y) < 50) {
      hasPaste = true;
      toothbrushEl.textContent = "🪥✨";
      alert("Toothpaste applied to toothbrush! ✨");
    }
  }

  if (currentBrushStep === 2 && !hasRinsed) {
    const waterRect = waterEl.getBoundingClientRect();
    if (Math.abs(brushRect.x - waterRect.x) < 50 && Math.abs(brushRect.y - waterRect.y) < 50) {
      hasRinsed = true;
      alert("Mouth rinsed cleanly with water! 🥤✨");
    }
  }
});

function stopDrag(e) {
  isDragging = false;
  if (e.pointerId) { try { toothbrushEl.releasePointerCapture(e.pointerId); } catch(err){} }
}
toothbrushEl.addEventListener("pointerup", stopDrag);
toothbrushEl.addEventListener("pointercancel", stopDrag);


// --- Full Mouth Anatomy Puzzle ---
function startFullMouthPuzzle() {
  document.getElementById("anatomyStudyView").classList.add("hidden");
  document.getElementById("anatomyPuzzleView").classList.remove("hidden");

  const pool = document.getElementById("puzzlePiecesPool");
  pool.innerHTML = "";
  document.getElementById("puzzleFeedback").textContent = "";

  const labels = ["Top Lip", "Upper Gums", "Molars", "Canines", "Incisors", "Tongue", "Lower Gums", "Bottom Lip"];
  const shuffled = [...labels].sort(() => Math.random() - 0.5);

  shuffled.forEach(label => {
    const p = document.createElement("div");
    p.className = "puzzle-drag-piece";
    p.textContent = label;
    p.draggable = true;
    p.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", label));
    pool.appendChild(p);
  });

  document.querySelectorAll(".puzzle-drop-zone").forEach(zone => {
    zone.classList.remove("filled");
    zone.textContent = `Drop ${zone.dataset.target} Here`;
    zone.addEventListener("dragover", (e) => e.preventDefault());
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      const draggedLabel = e.dataTransfer.getData("text/plain");
      if (draggedLabel === zone.dataset.target) {
        zone.textContent = `✅ ${draggedLabel}`;
        zone.classList.add("filled");
        
        // Проверка победы
        const allFilled = Array.from(document.querySelectorAll(".puzzle-drop-zone")).every(z => z.classList.contains("filled"));
        if (allFilled) {
          child.coins += 50;
          saveProfile();
          document.getElementById("puzzleFeedback").textContent = "🎉 Incredible! Full mouth successfully assembled! +50 coins!";
        }
      } else {
        document.getElementById("puzzleFeedback").textContent = "❌ Not quite right here, try another zone!";
      }
    });
  });
}


// --- Streaks & Timers ---
let timerInterval = null;

function checkStreakDate() {
  const today = new Date().toDateString();
  if (child.lastBrushDate !== today) {
    const lastDate = child.lastBrushDate ? new Date(child.lastBrushDate) : null;
    const currentDate = new Date(today);
    if (lastDate) {
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 1) child.streak = 0;
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
  if (session === 'morning' && child.morningDone) { alert("Already done morning brushing today!"); return; }
  if (session === 'night' && child.nightDone) { alert("Already done night brushing today!"); return; }

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
      alert(`🌟 Milestone! ${child.streak} days streak! Mega bonus +200 coins!`);
    } else {
      alert(`🔥 Streak increased to ${child.streak} days! +50 coins!`);
    }
  } else {
    child.coins += 20;
    alert(`Great job! +20 coins.`);
  }

  saveProfile();
  updateTimerUI();
}


// --- Shop & Room Customization (fully fixed and filled) ---
const shopItems = {
  walls: [
    { id: 'wall_pink', name: 'Pink Wall', price: 30, type: 'wall', color: '#ffecf2' },
    { id: 'wall_blue', name: 'Blue Sky Wall', price: 30, type: 'wall', color: '#e4f2ff' },
    { id: 'wall_rainbow', name: 'Rainbow Wallpaper (VIP)', price: 150, type: 'wall', color: 'linear-gradient(135deg, #ffcccb, #ffeb99, #ccffcc, #cce6ff)' }
  ],
  furniture: [
    { id: 'sofa', name: 'Cozy Sofa', price: 80, icon: '🛋️' },
    { id: 'bed', name: 'Cute Bed', price: 90, icon: '🛏️' },
    { id: 'tv', name: 'Big TV', price: 120, icon: '📺' },
    { id: 'computer', name: 'Gaming PC', price: 150, icon: '💻' },
    { id: 'lamp', name: 'Magic Lamp', price: 40, icon: '🏮' },
    { id: 'kitchen', name: 'Kitchen Unit', price: 200, icon: '🍳' },
    { id: 'bathroom', name: 'Bath & Sink', price: 180, icon: '🛁' },
    { id: 'expansion', name: 'Expand Room Space', price: 500, icon: '🏰' }
  ],
  garden: [
    { id: 'rose', name: 'Rose Pot', price: 50, icon: '🌹' },
    { id: 'ficus', name: 'Big Ficus', price: 70, icon: '🪴' },
    { id: 'painting', name: 'Art Painting', price: 60, icon: '🖼️' },
    { id: 'garden_area', name: 'Magical Garden', price: 300, icon: '🌳' }
  ]
};

function switchShopTab(category) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");

  const panel = document.getElementById("shopPanelContent");
  panel.innerHTML = "";

  shopItems[category].forEach(item => {
    const isOwned = child.inventory.includes(item.id);
    const card = document.createElement("div");
    card.className = "shop-card";
    card.innerHTML = `
      <p>${item.icon || '🎨'} <b>${item.name}</b><br>🪙 ${item.price}</p>
      <button onclick="buyShopItem('${item.id}', ${item.price}, '${item.type || category}', '${item.color || item.icon}')" ${isOwned && item.type !== 'wall' ? 'disabled' : ''}>
        ${isOwned && item.type !== 'wall' ? 'Owned' : 'Buy'}
      </button>
    `;
    panel.appendChild(card);
  });
}

function buyShopItem(id, price, category, value) {
  if (child.coins < price) {
    alert("Not enough coins! Earn more through brushing and daily streaks.");
    return;
  }

  child.coins -= price;
  if (!child.inventory.includes(id) || category === 'walls') {
    child.inventory.push(id);
  }

  if (category === 'walls') {
    child.currentWallColor = value;
  }

  saveProfile();
  updateRoomDisplay();
  switchShopTab(category);
  alert(`Successfully bought!`);
}

function updateRoomDisplay() {
  const room = document.getElementById("myRoom");
  room.style.background = child.currentWallColor;

  const itemsBox = document.getElementById("roomPreviewItems");
  if (child.inventory.length === 0) {
    itemsBox.textContent = "🛏️ (Empty room. Buy furniture in shop!)";
  } else {
    itemsBox.innerHTML = child.inventory.map(i => {
      let icon = "✨";
      if (i === 'sofa') icon = "🛋️";
      if (i === 'bed') icon = "🛏️";
      if (i === 'tv') icon = "📺";
      if (i === 'computer') icon = "💻";
      if (i === 'lamp') icon = "🏮";
      if (i === 'kitchen') icon = "🍳";
      if (i === 'bathroom') icon = "🛁";
      if (i === 'expansion') icon = "🏰";
      if (i === 'rose') icon = "🌹";
      if (i === 'ficus') icon = "🪴";
      if (i === 'painting') icon = "🖼️";
      if (i === 'garden_area') icon = "🌳";
      return `<span style="font-size:32px; margin: 6px; display:inline-block;">${icon}</span>`;
    }).join(" ");
  }
}


// --- Init ---
window.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  updateAvatarDisplay();
  checkStreakDate();
  updateRoomDisplay();
  if (child.name) {
    document.getElementById("worldChildName").textContent = child.name;
    updateAvatarDisplay();
  }
});
