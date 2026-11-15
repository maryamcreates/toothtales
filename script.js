
const $ = id => document.getElementById(id);

const STORE = "toothtales_complete_v1";

const defaults = {
  name: "",
  age: "",
  color: "#b99be8",
  coins: 120,
  streak: 0,
  lastCompleted: "",
  morningDone: "",
  eveningDone: "",
  owned: [],
  placed: []
};

let data = { ...defaults };

try {
  const saved = JSON.parse(localStorage.getItem(STORE) || "null");
  if (saved) data = { ...defaults, ...saved };
} catch (e) {}

function save() {
  localStorage.setItem(STORE, JSON.stringify(data));
  updateHeader();
}

function updateHeader() {
  $("coinCount").textContent = data.coins;
  $("streakCount").textContent = data.streak;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  $(id).classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* PROFILE */

function saveProfile() {
  const name = $("childName").value.trim();
  const age = $("childAge").value;

  if (!name || !age) {
    alert("Please add a name and age first.");
    return;
  }

  data.name = name;
  data.age = age;
  data.color = $("avatarColor").value;

  save();

  $("playerName").textContent = name;
  $("avatarGreeting").textContent = name + "'s smile buddy";
  $("avatarFace").style.background = data.color;

  showScreen("world");
}

/* SNACK TIME */

function chooseSnack(name, emoji) {
  $("eatingAvatar").textContent = "😋";
  $("eatingAvatar").classList.add("chewing");

  $("eatingText").textContent =
    `Munch, munch! ${name} is a tasty choice.`;

  $("afterSnackBtn").classList.remove("hidden");
  $("eatingAvatar").dataset.snack = emoji;
}

/* BRUSH & RESCUE */

let rescued = 0;
let brushing = false;

const mouth = $("mouthGame");
const brush = $("movingBrush");

function startRescue() {
  document.querySelectorAll(".food-crumb").forEach((crumb, index) => {
    crumb.classList.remove("rescued");
    crumb.textContent = ["🍎", "🍞", "🧀"][index];
  });

  rescued = 0;

  $("rescuedCount").textContent = "0";
  $("rescueBar").style.width = "0%";
  $("rescueContinue").disabled = true;

  $("rescueMessage").textContent =
    "Move your finger over each crumb to rescue it.";

  brush.style.left = "8px";
  brush.style.top = "8px";

  showScreen("rescue");
}

function moveBrush(event) {
  const rect = mouth.getBoundingClientRect();

  const x = Math.max(
    0,
    Math.min(rect.width - 45, event.clientX - rect.left - 22)
  );

  const y = Math.max(
    0,
    Math.min(rect.height - 45, event.clientY - rect.top - 22)
  );

  brush.style.left = x + "px";
  brush.style.top = y + "px";

  document.querySelectorAll(".food-crumb:not(.rescued)").forEach(crumb => {
    const crumbRect = crumb.getBoundingClientRect();
    const brushRect = brush.getBoundingClientRect();

    const hit = !(
      brushRect.right < crumbRect.left ||
      brushRect.left > crumbRect.right ||
      brushRect.bottom < crumbRect.top ||
      brushRect.top > crumbRect.bottom
    );

    if (hit) {
      crumb.classList.add("rescued");
      rescued++;

      $("rescuedCount").textContent = rescued;
      $("rescueBar").style.width = (rescued / 3 * 100) + "%";
    }
  });

  if (rescued === 3) {
    $("rescueMessage").textContent =
      "Wonderful! All the snack pieces are rescued!";

    $("rescueContinue").disabled = false;
  }
}

mouth.addEventListener("pointerdown", event => {
  brushing = true;
  mouth.setPointerCapture(event.pointerId);
  moveBrush(event);
  event.preventDefault();
});

mouth.addEventListener("pointermove", event => {
  if (brushing) moveBrush(event);
});

mouth.addEventListener("pointerup", () => {
  brushing = false;
});

mouth.addEventListener("pointercancel", () => {
  brushing = false;
});

function finishRescue() {
  data.coins += 15;
  save();

  $("eatingAvatar").classList.remove("chewing");

  showScreen("world");
}

/* TOOTH ACADEMY */

const anatomyInfo = {
  Lips: [
    "Lips",
    "Your lips help keep food in your mouth and help you speak and smile."
  ],
  Gums: [
    "Gums",
    "Gums are the soft pink tissue that support and protect your teeth."
  ],
  Teeth: [
    "Teeth",
    "Incisors cut, canines tear, and molars help grind food into smaller pieces."
  ],
  Tongue: [
    "Tongue",
    "Your tongue moves food around, helps you taste, and helps you speak."
  ]
};

let selectedPiece = null;
let placedLabels = new Set();

document.querySelectorAll(".hotspot").forEach(hotspot => {
  hotspot.addEventListener("click", () => {
    showAnatomy(hotspot.dataset.part);
  });
});

function showAnatomy(part) {
  const [title, description] = anatomyInfo[part];

  $("anatomyInfo").innerHTML =
    `<b>${title}</b><p>${description}</p>`;

  if (selectedPiece) {
    if (selectedPiece === part) {
      placedLabels.add(part);

      const button = document.querySelector(
        `.puzzle-piece[data-answer="${part}"]`
      );

      button.classList.add("placed");
      button.classList.remove("selected");
      button.disabled = true;

      $("puzzleFeedback").textContent =
        `Correct! ${part} is in the right place.`;

      selectedPiece = null;

      document.querySelectorAll(".puzzle-piece").forEach(button => {
        button.classList.remove("selected");
      });

      if (placedLabels.size === 4) {
        $("puzzleFeedback").textContent =
          "Amazing! You completed the mouth puzzle! +20 coins";

        data.coins += 20;
        save();
      }
    } else {
      $("puzzleFeedback").textContent =
        "Not quite. Try another numbered area.";
    }
  }
}

document.querySelectorAll(".puzzle-piece").forEach(button => {
  button.addEventListener("click", () => {
    if (button.disabled) return;

    selectedPiece = button.dataset.answer;

    document.querySelectorAll(".puzzle-piece").forEach(item => {
      item.classList.toggle("selected", item === button);
    });

    $("puzzleFeedback").textContent =
      `Now tap the ${selectedPiece.toLowerCase()} area in the illustration.`;
  });
});

/* MY ROOM */

const catalog = {
  furniture: [
    { id: "bed", name: "Cloud bed", icon: "🛏️", price: 35 },
    { id: "sofa", name: "Cozy sofa", icon: "🛋️", price: 30 },
    { id: "desk", name: "Study desk", icon: "🪑", price: 25 },
    { id: "lamp", name: "Moon lamp", icon: "💡", price: 15 },
    { id: "bookcase", name: "Bookcase", icon: "📚", price: 25 },
    { id: "rug", name: "Soft rug", icon: "🟣", price: 20 }
  ],

  decor: [
    { id: "plant", name: "Little plant", icon: "🪴", price: 12 },
    { id: "picture", name: "Wall art", icon: "🖼️", price: 18 },
    { id: "teddy", name: "Teddy bear", icon: "🧸", price: 20 },
    { id: "star", name: "Star cushion", icon: "⭐", price: 10 },
    { id: "clock", name: "Cute clock", icon: "🕒", price: 14 }
  ],

  wall: [
    {
      id: "wallpink",
      name: "Blush walls",
      icon: "🌸",
      price: 20,
      color: "#f4dfe9"
    },
    {
      id: "wallmint",
      name: "Mint walls",
      icon: "🌿",
      price: 20,
      color: "#e0f0e8"
    },
    {
      id: "wallsky",
      name: "Sky walls",
      icon: "☁️",
      price: 20,
      color: "#e2edf7"
    },
    {
      id: "walllilac",
      name: "Lilac walls",
      icon: "💜",
      price: 20,
      color: "#ece4f5"
    }
  ]
};

let activeShop = "furniture";

function openRoom() {
  showScreen("room");
  renderRoom();

  showShop(
    "furniture",
    document.querySelector(".tab")
  );
}

function showShop(category, button) {
  activeShop = category;

  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.remove("active");
  });

  if (button) button.classList.add("active");

  const grid = $("shopGrid");
  grid.innerHTML = "";

  if (category === "inventory") {
    const ownedItems = catalog.furniture
      .concat(catalog.decor)
      .filter(item => data.owned.includes(item.id));

    if (!ownedItems.length) {
      grid.innerHTML = "<p>You haven't bought any furniture yet.</p>";
    }

    ownedItems.forEach(item => {
      grid.appendChild(shopCard(item, true));
    });

    return;
  }

  (catalog[category] || []).forEach(item => {
    grid.appendChild(shopCard(item, false));
  });
}

function shopCard(item, inventory) {
  const card = document.createElement("div");
  card.className = "shop-item";

  const owned = data.owned.includes(item.id);

  card.innerHTML = `
    <div class="item-icon">${item.icon}</div>
    <b>${item.name}</b>
    <small>${inventory ? "Ready to place" : `🪙 ${item.price}`}</small>
  `;

  const button = document.createElement("button");

  button.textContent = inventory
    ? "Place in room"
    : owned
      ? "Owned"
      : "Buy";

  button.disabled = !inventory && owned;

  button.addEventListener("click", () => {
    if (inventory) {
      placeItem(item.id);
    } else {
      buyItem(item);
    }
  });

  card.appendChild(button);

  return card;
}

function buyItem(item) {
  if (data.owned.includes(item.id)) return;

  if (data.coins < item.price) {
    $("shopMessage").textContent =
      "Not enough coins yet. Complete an adventure to earn more.";

    return;
  }

  data.coins -= item.price;
  data.owned.push(item.id);

  if (item.color) data.wallColor = item.color;

  save();

  $("shopMessage").textContent =
    `You bought ${item.name}! Open My items to place it.`;

  showShop(
    activeShop,
    document.querySelector(".tab.active")
  );
}

function placeItem(id) {
  if (!data.owned.includes(id)) return;

  const item = [...catalog.furniture, ...catalog.decor]
    .find(item => item.id === id);

  if (!item) return;

  data.placed.push({
    id,
    x: 25 + Math.random() * 50,
    y: 45 + Math.random() * 35
  });

  save();
  renderRoom();

  $("shopMessage").textContent =
    `${item.name} placed! Drag it to move it.`;
}

function renderRoom() {
  if (data.wallColor) {
    $("roomStage").style.background =
      `linear-gradient(${data.wallColor} 0 72%,#d7c1b3 72% 100%)`;
  }

  const container = $("roomItems");
  container.innerHTML = "";

  data.placed.forEach(placed => {
    const item = [...catalog.furniture, ...catalog.decor]
      .find(item => item.id === placed.id);

    if (!item) return;

    const element = document.createElement("div");

    element.className = "placed-item";
    element.textContent = item.icon;
    element.style.left = placed.x + "%";
    element.style.top = placed.y + "%";
    element.title = "Drag to move";

    element.addEventListener("pointerdown", event => {
      event.preventDefault();

      element.setPointerCapture(event.pointerId);

      const rect = $("roomStage").getBoundingClientRect();

      const move = moveEvent => {
        placed.x = Math.max(
          5,
          Math.min(95, (moveEvent.clientX - rect.left) / rect.width * 100)
        );

        placed.y = Math.max(
          10,
          Math.min(90, (moveEvent.clientY - rect.top) / rect.height * 100)
        );

        element.style.left = placed.x + "%";
        element.style.top = placed.y + "%";
      };

      const up = () => {
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerup", up);
        save();
      };

      element.addEventListener("pointermove", move);
      element.addEventListener("pointerup", up);
    });

    container.appendChild(element);
  });
}

/* DAILY STREAKS AND TIMERS */

let timer = null;
let activeSession = null;
let remaining = 120;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function openStreaks() {
  showScreen("streaks");
  updateStreakUI();
}

function updateStreakUI() {
  $("streakDays").textContent = data.streak;

  const today = todayKey();

  $("morningState").textContent =
    data.morningDone === today
      ? "Completed today ✓"
      : "Ready when you are";

  $("eveningState").textContent =
    data.eveningDone === today
      ? "Completed today ✓"
      : "Ready when you are";

  $("morningStart").disabled =
    data.morningDone === today || !!activeSession;

  $("eveningStart").disabled =
    data.eveningDone === today || !!activeSession;
}

function startTimer(session) {
  if (activeSession) {
    $("timerMessage").textContent =
      "A timer is already running. Finish or cancel it first.";

    return;
  }

  const today = todayKey();

  if (
    (session === "morning" ? data.morningDone : data.eveningDone) === today
  ) {
    return;
  }

  activeSession = session;
  remaining = 120;

  $("timerMessage").textContent =
    `${session === "morning" ? "Morning" : "Evening"} brushing is in progress. Keep going!`;

  $("stopTimer").classList.remove("hidden");

  updateTimerDisplay();
  updateStreakUI();

  timer = setInterval(() => {
    remaining--;
    updateTimerDisplay();

    if (remaining <= 0) {
      completeTimer();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  $(activeSession === "morning" ? "morningTime" : "eveningTime")
    .textContent = `${minutes}:${seconds}`;
}

function stopTimer() {
  if (timer) clearInterval(timer);

  timer = null;

  const previous = activeSession;
  activeSession = null;

  if (previous) {
    $(previous === "morning" ? "morningTime" : "eveningTime")
      .textContent = "02:00";
  }

  $("stopTimer").classList.add("hidden");

  $("timerMessage").textContent =
    "Timer cancelled. You can start again when ready.";

  updateStreakUI();
}

function completeTimer() {
  clearInterval(timer);
  timer = null;

  const today = todayKey();

  if (activeSession === "morning") {
    data.morningDone = today;
  } else {
    data.eveningDone = today;
  }

  const finished = activeSession;
  activeSession = null;

  const both =
    data.morningDone === today &&
    data.eveningDone === today;

  if (both && data.lastCompleted !== today) {
    data.streak++;
    data.lastCompleted = today;
    data.coins += 30;
  } else {
    data.coins += 10;
  }

  save();

  $(finished === "morning" ? "morningTime" : "eveningTime")
    .textContent = "02:00";

  $("stopTimer").classList.add("hidden");

  $("timerMessage").textContent =
    "Wonderful work! Your brushing session is complete.";

  updateStreakUI();
}

/* INITIALIZE */

updateHeader();

if (data.name) {
  $("playerName").textContent = data.name;
  $("avatarGreeting").textContent = data.name + "'s smile buddy";
  $("avatarFace").style.background = data.color;

  showScreen("world");
} else {
  showScreen("home");
}
