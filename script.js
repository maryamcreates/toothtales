
/* =====================================
   TOOTHTALES — MAIN GAME SCRIPT
===================================== */

const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "toothtales_save_v2";

const defaultData = {
  name: "",
  age: "",
  color: "#f5b6c8",
  coins: 100,
  inventory: [],
  unlockedRooms: ["Спальня"],
  currentRoom: "Спальня",
  roomItems: {},
  wallColors: {
    "Спальня": "#f6dfe6"
  },
  morningDone: "",
  eveningDone: "",
  streak: 0
};

let data;

try {
  data = {
    ...defaultData,
    ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
  };
} catch {
  data = { ...defaultData };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  updateWallet();
}

function updateWallet() {
  $("coinCount").textContent = data.coins;
}

function addCoins(amount) {
  data.coins += amount;
  saveData();
}

/* =====================================
   NAVIGATION AND PROFILE
===================================== */

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  const target = $(name);

  if (target) {
    target.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function saveProfile() {
  const name = $("childName").value.trim();
  const age = $("childAge").value;

  if (!name) {
    alert("Напиши своё имя! 💗");
    return;
  }

  data.name = name;
  data.age = age;
  data.color = $("avatarColor").value;

  saveData();
  updateProfile();
  showScreen("world");
}

function updateProfile() {
  if (data.name) {
    $("playerName").textContent = data.name;
  }

  $("coinCount").textContent = data.coins;
  $("avatarFace").style.background = data.color;
}

function loadProfile() {
  if (data.name) {
    $("childName").value = data.name;
    $("childAge").value = data.age || "";
    $("avatarColor").value = data.color;
    updateProfile();
    showScreen("world");
  }
}

/* =====================================
   SNACK AND FOOD RESCUE GAME
===================================== */

let selectedSnack = {
  name: "Яблоко",
  emoji: "🍎"
};

function chooseSnack(name, emoji) {
  selectedSnack = { name, emoji };

  $("eatingAvatar").textContent = "🧚🏻‍♀️ 😋";
  $("eatingText").textContent = "Ням-ням! Ты съел(а): " + name;
  $("afterSnackBtn").classList.remove("hidden");
}

let rescued = 0;
let brushMoving = false;

function startRescue() {
  showScreen("rescue");

  rescued = 0;

  $("rescuedCount").textContent = "0";
  $("rescueBar").style.width = "0%";
  $("rescueMessage").textContent =
    "Передвигай щётку пальцем и собирай кусочки еды!";
  $("rescueContinue").classList.add("hidden");

  const crumbs = document.querySelectorAll(".crumb");

  crumbs.forEach((crumb, index) => {
    crumb.classList.remove("hidden");
    crumb.style.display = "block";
    crumb.style.opacity = "1";

    const positions = [
      { left: "27%", top: "45%" },
      { left: "49%", top: "62%" },
      { left: "68%", top: "40%" }
    ];

    crumb.style.left = positions[index].left;
    crumb.style.top = positions[index].top;
  });

  $("movingBrush").style.left = "20px";
  $("movingBrush").style.top = "15px";
}

function collectCrumb(crumb) {
  if (crumb.dataset.collected === "yes") return;

  crumb.dataset.collected = "yes";
  crumb.style.display = "none";

  rescued++;

  $("rescuedCount").textContent = rescued;
  $("rescueBar").style.width = (rescued / 3 * 100) + "%";

  if (rescued === 3) {
    $("rescueMessage").textContent =
      "УРА! Все кусочки спасены! Зубки чистые! ✨";

    $("rescueContinue").classList.remove("hidden");
  } else {
    $("rescueMessage").textContent =
      "Отлично! Продолжай спасать еду! 💗";
  }
}

const brush = $("movingBrush");
const mouth = $("mouthGame");

if (brush && mouth) {
  brush.addEventListener("pointerdown", event => {
    brushMoving = true;
    brush.setPointerCapture(event.pointerId);
  });

  brush.addEventListener("pointerup", () => {
    brushMoving = false;
  });

  brush.addEventListener("pointercancel", () => {
    brushMoving = false;
  });

  brush.addEventListener("pointermove", event => {
    if (!brushMoving) return;

    const rect = mouth.getBoundingClientRect();

    let x = event.clientX - rect.left - 25;
    let y = event.clientY - rect.top - 25;

    x = Math.max(0, Math.min(x, rect.width - 55));
    y = Math.max(0, Math.min(y, rect.height - 55));

    brush.style.left = x + "px";
    brush.style.top = y + "px";

    const brushRect = brush.getBoundingClientRect();

    document.querySelectorAll(".crumb").forEach(crumb => {
      if (crumb.style.display === "none") return;

      const crumbRect = crumb.getBoundingClientRect();

      const touching =
        brushRect.left < crumbRect.right &&
        brushRect.right > crumbRect.left &&
        brushRect.top < crumbRect.bottom &&
        brushRect.bottom > crumbRect.top;

      if (touching) {
        collectCrumb(crumb);
      }
    });
  });
}

function finishRescue() {
  addCoins(15);
  alert("Ты получил(а) 15 монет! 🪙");
  showScreen("world");
}

/* =====================================
   DENTAL ANATOMY ACADEMY
===================================== */

const anatomyDescriptions = {
  "Резцы": "Резцы — передние зубы. Они помогают откусывать пищу. У взрослого человека обычно 8 резцов.",
  "Клыки": "Клыки — заострённые зубы рядом с резцами. Они помогают отрывать и удерживать пищу. У взрослого обычно 4 клыка.",
  "Малые коренные": "Малые коренные зубы находятся за клыками. Они помогают раздавливать и пережёвывать пищу. У взрослого обычно 8 таких зубов.",
  "Большие коренные": "Большие коренные зубы расположены дальше всех. Их широкая поверхность помогает тщательно пережёвывать пищу. У взрослого обычно 12 больших коренных зубов, включая зубы мудрости.",
  "Дёсны": "Дёсны — мягкая ткань вокруг зубов. Они помогают удерживать и защищать зубы.",
  "Язык": "Язык помогает чувствовать вкус, перемещать пищу и участвует в речи.",
  "Губы": "Губы помогают удерживать пищу во рту, говорить и выражать эмоции.",
  "Нёбо": "Нёбо образует верхнюю часть полости рта. Оно разделяет полость рта и носовую полость."
};

function showPart(part) {
  $("anatomyInfo").innerHTML = `
    <h3>${part}</h3>
    <p>${anatomyDescriptions[part] || "Изучай строение полости рта!"}</p>
  `;
}

document.querySelectorAll(".tooth").forEach(tooth => {
  tooth.addEventListener("click", () => {
    showPart(tooth.dataset.part);
  });
});

function showAcademyTab(tab) {
  $("jawTab").classList.toggle("hidden", tab !== "jaw");
  $("toolsTab").classList.toggle("hidden", tab !== "tools");
}

function showTool(name, description) {
  $("toolInfo").innerHTML = `
    <h3>${name}</h3>
    <p>${description}</p>
  `;
}

/* =====================================
   ROOM SHOP CATALOG
===================================== */

const catalog = {
  furniture: [
    ["Кровать", "🛏️", 35],
    ["Двуспальная кровать", "🛌", 55],
    ["Диван", "🛋️", 45],
    ["Кресло", "💺", 25],
    ["Стол", "🪑", 25],
    ["Обеденный стол", "🍽️", 45],
    ["Стул", "🪑", 15],
    ["Шкаф", "🚪", 40],
    ["Комод", "🗄️", 35],
    ["Книжная полка", "📚", 25],
    ["Тумбочка", "🗃️", 20],
    ["Письменный стол", "🖥️", 45],
    ["Холодильник", "🧊", 55],
    ["Плита", "🍳", 50],
    ["Кухонная раковина", "🚰", 35],
    ["Кухонные шкафы", "🗄️", 40],
    ["Ванна", "🛁", 60],
    ["Душ", "🚿", 50],
    ["Зеркало", "🪞", 25],
    ["Раковина для ванной", "🚰", 35],
    ["Телевизор", "📺", 65],
    ["Киноэкран", "🎬", 80],
    ["Кресло для кино", "💺", 35],
    ["Попкорн-машина", "🍿", 45],
    ["Игровой стол", "🎮", 60],
    ["Пианино", "🎹", 70],
    ["Ковёр", "🧶", 20],
    ["Напольная лампа", "💡", 20]
  ],

  decor: [
    ["Комнатное растение", "🪴", 15],
    ["Цветочная ваза", "💐", 20],
    ["Картина", "🖼️", 25],
    ["Настенные часы", "🕰️", 20],
    ["Настольная лампа", "🛋️", 15],
    ["Плюшевый мишка", "🧸", 20],
    ["Кукла", "🎎", 25],
    ["Игрушечный домик", "🏠", 35],
    ["Глобус", "🌎", 20],
    ["Книги", "📚", 15],
    ["Свеча", "🕯️", 10],
    ["Подушки", "🛏️", 15],
    ["Звёздный светильник", "🌟", 30],
    ["Аквариум", "🐠", 45],
    ["Настенный декор", "🪄", 20],
    ["Будильник", "⏰", 15]
  ],

  garden: [
    ["Роза", "🌹", 15],
    ["Тюльпан", "🌷", 12],
    ["Подсолнух", "🌻", 15],
    ["Ромашка", "🌼", 10],
    ["Цветочный куст", "🌺", 20],
    ["Кактус", "🌵", 12],
    ["Пальма", "🌴", 35],
    ["Яблоня", "🌳", 45],
    ["Сосна", "🌲", 35],
    ["Куст роз", "🥀", 25],
    ["Горшок с цветами", "🪴", 20],
    ["Садовая скамейка", "🪑", 30],
    ["Садовый фонарь", "🏮", 25],
    ["Гирлянда", "✨", 30],
    ["Качели", "🎠", 65],
    ["Карусель", "🎡", 100],
    ["Пруд", "💧", 55],
    ["Фонтан", "⛲", 75],
    ["Садовый столик", "🍵", 30],
    ["Садовый зонт", "⛱️", 35],
    ["Гамак", "🛏️", 40],
    ["Птичий домик", "🐦", 20],
    ["Садовая дорожка", "🪨", 20],
    ["Бабочки", "🦋", 15],
    ["Садовый гном", "🧙", 25],
    ["Качалка", "🛝", 55],
    ["Качели-балансир", "🎠", 50],
    ["Детская горка", "🛝", 55]
  ],

  wall: [
    ["Нежно-розовые стены", "#f6dfe6", 10],
    ["Лавандовые стены", "#e8e0fa", 10],
    ["Мятные стены", "#d9f0e2", 10],
    ["Голубые стены", "#dcecf9", 10],
    ["Персиковые стены", "#fbe2d2", 10],
    ["Кремовые стены", "#fff0d5", 10],
    ["Небесные стены", "#cce6f5", 15],
    ["Сиреневые стены", "#d8c7ed", 15],
    ["Зелёные стены", "#dce9c9", 15],
    ["Звёздные стены", "#d9d2f5", 20]
  ],

  rooms: [
    ["Кухня", "🍳", 100],
    ["Гостиная", "🛋️", 100],
    ["Детская", "🧸", 120],
    ["Ванная", "🛁", 100],
    ["Кинотеатр", "🎬", 180],
    ["Игровая", "🎮", 140],
    ["Сад", "🌷", 150]
  ]
};

let selectedShopCategory = "furniture";
let selectedRoomItem = null;

function openRoom() {
  showScreen("room");
  renderRoom();
  showShop("furniture");
}

function showShop(category) {
  selectedShopCategory = category;

  document.querySelectorAll(".room-tabs button").forEach(button => {
    button.style.background = "white";
  });

  const buttons = document.querySelectorAll(".room-tabs button");
  const categories = ["furniture", "decor", "wall", "garden", "rooms"];
  const index = categories.indexOf(category);

  if (buttons[index]) {
    buttons[index].style.background = "#f5e5f1";
  }

  renderShop();
}

function renderShop() {
  const grid = $("shopGrid");
  grid.innerHTML = "";

  const items = catalog[selectedShopCategory] || [];

  items.forEach((item, index) => {
    const [name, emoji, price] = item;

    const card = document.createElement("div");
    card.className = "shop-item";

    const alreadyOwned =
      data.inventory.includes(name) ||
      (selectedShopCategory === "rooms" &&
       data.unlockedRooms.includes(name));

    card.innerHTML = `
      <div class="item-emoji">${emoji}</div>
      <strong>${name}</strong>
      <p>🪙 ${price}</p>
      <button>${alreadyOwned ? "Уже куплено" : "Купить"}</button>
    `;

    card.querySelector("button").disabled = alreadyOwned;
    card.querySelector("button").style.opacity =
      alreadyOwned ? ".5" : "1";

    card.querySelector("button").addEventListener("click", () => {
      buyItem(selectedShopCategory, index);
    });

    grid.appendChild(card);
  });
}

function buyItem(category, index) {
  const item = catalog[category][index];
  const [name, value, price] = item;

  if (data.coins < price) {
    $("shopMessage").textContent =
      "Пока не хватает монет. Играй и зарабатывай! ⭐";
    return;
  }

  if (category === "rooms") {
    if (data.unlockedRooms.includes(name)) return;

    data.coins -= price;
    data.unlockedRooms.push(name);
    data.currentRoom = name;

    if (!data.roomItems[name]) {
      data.roomItems[name] = [];
    }

    if (!data.wallColors[name]) {
      data.wallColors[name] = "#f6dfe6";
    }

    saveData();
    renderRoom();
    renderShop();

    $("shopMessage").textContent =
      "Поздравляем! Ты открыл(а) комнату: " + name + " 🎉";
    return;
  }

  if (category === "wall") {
    data.coins -= price;
    data.wallColors[data.currentRoom] = value;

    saveData();
    renderRoom();
    $("shopMessage").textContent =
      "Цвет стен изменён! 🎨";
    return;
  }

  if (data.inventory.includes(name)) {
    $("shopMessage").textContent = "Этот предмет уже куплен!";
    return;
  }

  data.coins -= price;
  data.inventory.push(name);

  if (!data.roomItems[data.currentRoom]) {
    data.roomItems[data.currentRoom] = [];
  }

  data.roomItems[data.currentRoom].push({
    name,
    emoji: value,
    x: 45 + Math.random() * 100,
    y: 150 + Math.random() * 100,
    size: 100
  });

  saveData();
  renderRoom();
  renderShop();

  $("shopMessage").textContent =
    "Ты купил(а): " + name + "! Теперь расставь его в комнате. 💗";
}

/* =====================================
   ROOM DECORATING AND ITEM MOVEMENT
===================================== */

function currentRoomItems() {
  if (!data.roomItems[data.currentRoom]) {
    data.roomItems[data.currentRoom] = [];
  }

  return data.roomItems[data.currentRoom];
}

function renderRoom() {
  const stage = $("roomStage");
  const container = $("roomItems");

  if (!stage || !container) return;

  const backgrounds = {
    "Спальня": "#f6dfe6",
    "Кухня": "#e5f0e6",
    "Гостиная": "#e8e0fa",
    "Детская": "#fce8ca",
    "Ванная": "#dcecf9",
    "Кинотеатр": "#d6c9e8",
    "Игровая": "#e4e4fa",
    "Сад": "#d9f0e2"
  };

  stage.style.background =
    backgrounds[data.currentRoom] || "#f6dfe6";

  const wallColor =
    data.wallColors[data.currentRoom] ||
    backgrounds[data.currentRoom] ||
    "#f6dfe6";

  if (data.currentRoom !== "Сад") {
    stage.style.background =
      `linear-gradient(to bottom, ${wallColor} 0 65%, #d9bda4 65% 100%)`;
  } else {
    stage.style.background =
      "linear-gradient(to bottom, #cce9f7 0 45%, #9ccf91 45% 100%)";
  }

  container.innerHTML = "";

  currentRoomItems().forEach((item, index) => {
    const element = document.createElement("div");

    element.className = "room-item";
    element.textContent = item.emoji;
    element.style.left = item.x + "px";
    element.style.top = item.y + "px";
    element.style.fontSize = (55 * item.size / 100) + "px";

    if (selectedRoomItem === index) {
      element.classList.add("selected");
    }

    element.addEventListener("pointerdown", event => {
      if (event.target !== element) return;

      selectedRoomItem = index;

      const rect = stage.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - item.x;
      const offsetY = event.clientY - rect.top - item.y;

      element.setPointerCapture(event.pointerId);

      function moveItem(moveEvent) {
        const x = moveEvent.clientX - rect.left - offsetX;
        const y = moveEvent.clientY - rect.top - offsetY;

        item.x = Math.max(0, Math.min(x, rect.width - 45));
        item.y = Math.max(0, Math.min(y, rect.height - 45));

        element.style.left = item.x + "px";
        element.style.top = item.y + "px";
      }

      function stopMoving() {
        element.removeEventListener("pointermove", moveItem);
        element.removeEventListener("pointerup", stopMoving);
        element.removeEventListener("pointercancel", stopMoving);

        saveData();
        renderRoom();
      }

      element.addEventListener("pointermove", moveItem);
      element.addEventListener("pointerup", stopMoving);
      element.addEventListener("pointercancel", stopMoving);
    });

    element.addEventListener("click", () => {
      selectedRoomItem = index;
      $("itemSize").value = item.size;
      renderRoom();
    });

    container.appendChild(element);
  });
}

$("itemSize").addEventListener("input", event => {
  if (selectedRoomItem === null) return;

  const item = currentRoomItems()[selectedRoomItem];

  if (!item) return;

  item.size = Number(event.target.value);

  renderRoom();
  saveData();
});

/* =====================================
   MORNING AND EVENING TOOTHBRUSH TIMER
===================================== */

let activeTimer = null;
let timerInterval = null;
let secondsLeft = 120;

function localDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return String(minutes).padStart(2, "0") + ":" +
    String(remaining).padStart(2, "0");
}

function startTimer(type) {
  if (activeTimer) {
    $("timerMessage").textContent =
      "Сначала закончи текущую чистку! 🪥";
    return;
  }

  const today = localDateKey();
  const completed =
    type === "morning" ? data.morningDone : data.eveningDone;

  if (completed === today) {
    $("timerMessage").textContent =
      "Ты уже выполнил(а) эту чистку сегодня! ⭐";
    return;
  }

  activeTimer = type;
  secondsLeft = 120;

  $("timerMessage").textContent =
    "Отлично! Чистим зубки целых две минуты!";

  $("stopTimer").classList.remove("hidden");

  $("morningStart").disabled = true;
  $("eveningStart").disabled = true;

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    secondsLeft--;
    updateTimerDisplay();

    if (secondsLeft <= 0) {
      completeTimer();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const display =
    activeTimer === "morning" ? $("morningTime") : $("eveningTime");

  if (display) {
    display.textContent = formatTime(secondsLeft);
  }
}

function completeTimer() {
  clearInterval(timerInterval);
  timerInterval = null;

  const today = localDateKey();

  if (activeTimer === "morning") {
    data.morningDone = today;
    $("morningState").textContent = "Выполнено! 🌞";
  } else {
    data.eveningDone = today;
    $("eveningState").textContent = "Выполнено! 🌙";
  }

  addCoins(10);

  if (data.morningDone === today && data.eveningDone === today) {
    data.streak++;
    addCoins(10);
    $("streakDays").textContent =
      "🔥 " + data.streak + " дней! Обе чистки выполнены!";
  }

  activeTimer = null;

  $("timerMessage").textContent =
    "Прекрасная работа! Ты получил(а) монетки! 🪙";

  $("stopTimer").classList.add("hidden");

  $("morningStart").disabled = false;
  $("eveningStart").disabled = false;

  saveData();
  updateTimerButtons();
}

function stopTimer() {
  if (!activeTimer) return;

  clearInterval(timerInterval);
  timerInterval = null;

  activeTimer = null;
  secondsLeft = 120;

  $("morningTime").textContent = "02:00";
  $("eveningTime").textContent = "02:00";

  $("morningStart").disabled = false;
  $("eveningStart").disabled = false;

  $("stopTimer").classList.add("hidden");

  $("timerMessage").textContent =
    "Таймер остановлен. Попробуй ещё раз!";

  updateTimerButtons();
}

function updateTimerButtons() {
  const today = localDateKey();

  $("morningStart").disabled =
    data.morningDone === today || activeTimer !== null;

  $("eveningStart").disabled =
    data.eveningDone === today || activeTimer !== null;
}

/* =====================================
   STARTUP
===================================== */

updateWallet();
updateTimerButtons();
loadProfile();

/* Кнопка спасения сначала ведёт к перекусу */
const rescueCard = document.querySelector(".feature-card");

if (rescueCard) {
  rescueCard.onclick = () => showScreen("snack");
}

/* Если профиль ещё не создан, показываем приветствие */
if (!data.name) {
  showScreen("home");
}
