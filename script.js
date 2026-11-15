
/* =========================================
   TOOTHTALES
   Main game logic
========================================= */

const STORAGE_KEY = "toothtales_save_v3";

const DEFAULT_DATA = {
  name: "Friend",
  age: "5",
  avatar: "🧒",
  coins: 100,

  inventory: [],

  unlockedRooms: ["Bedroom"],
  currentRoom: "Bedroom",

  roomItems: {
    Bedroom: []
  },

  wallColors: {
    Bedroom: "#f4e8ff"
  },

  morningDone: "",
  eveningDone: "",
  streak: 0,
  lastStreakDate: ""
};

let data = loadData();

let selectedAvatar = "🧒";
let selectedSnack = null;
let selectedRoomItem = null;
let currentShopCategory = "furniture";
let rescueCount = 0;
let rescueCompleted = false;
let rescuePointerId = null;
let activeTimer = null;
let timerInterval = null;
let timerSeconds = 120;

const $ = (id) => document.getElementById(id);

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved || typeof saved !== "object") {
      return structuredClone(DEFAULT_DATA);
    }

    const result = {
      ...structuredClone(DEFAULT_DATA),
      ...saved
    };

    if (!Array.isArray(result.inventory)) result.inventory = [];
    if (!Array.isArray(result.unlockedRooms)) result.unlockedRooms = ["Bedroom"];
    if (!result.unlockedRooms.includes("Bedroom")) {
      result.unlockedRooms.unshift("Bedroom");
    }

    if (!result.roomItems || typeof result.roomItems !== "object") {
      result.roomItems = { Bedroom: [] };
    }

    if (!result.wallColors || typeof result.wallColors !== "object") {
      result.wallColors = { Bedroom: "#f4e8ff" };
    }

    if (!result.roomItems.Bedroom) {
      result.roomItems.Bedroom = [];
    }

    if (!result.unlockedRooms.includes(result.currentRoom)) {
      result.currentRoom = "Bedroom";
    }

    return result;
  } catch (error) {
    return structuredClone(DEFAULT_DATA);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  updateCoins();
}

function updateCoins() {
  const coinCount = $("coinCount");
  const shopCoins = $("shopCoins");

  if (coinCount) coinCount.textContent = data.coins;
  if (shopCoins) shopCoins.textContent = data.coins;
}

/* =========================================
   SCREEN NAVIGATION
========================================= */

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.add("hidden");
  });

  const target = $(screenId);

  if (target) {
    target.classList.remove("hidden");
  }

  if (screenId === "rescue") {
    startRescue();
  }

  if (screenId === "room") {
    renderRoomSelector();
    renderRoom();
    renderShop();
    renderInventory();
  }

  if (screenId === "streaks") {
    updateRoutineDisplay();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================================
   PROFILE
========================================= */

function loadProfileIntoPage() {
  $("childName").value = data.name === "Friend" ? "" : data.name;
  $("childAge").value = data.age;
  selectedAvatar = data.avatar;

  document.querySelectorAll(".avatar-choice").forEach((button) => {
    button.classList.toggle(
      "selected",
      button.dataset.avatar === selectedAvatar
    );
  });

  updateWorldProfile();
}

function updateWorldProfile() {
  $("playerName").textContent = data.name;
  $("welcomeAvatar").textContent = data.avatar;
}

document.querySelectorAll(".avatar-choice").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".avatar-choice").forEach((item) => {
      item.classList.remove("selected");
    });

    button.classList.add("selected");
    selectedAvatar = button.dataset.avatar;
  });
});

$("startAdventure").addEventListener("click", () => {
  const enteredName = $("childName").value.trim();

  data.name = enteredName || "Friend";
  data.age = $("childAge").value;
  data.avatar = selectedAvatar;

  saveData();
  updateWorldProfile();
  showScreen("world");
});

/* =========================================
   SNACK TIME
========================================= */

document.querySelectorAll(".snack-choice").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".snack-choice").forEach((item) => {
      item.classList.remove("selected");
    });

    button.classList.add("selected");

    selectedSnack = {
      emoji: button.dataset.snack,
      name: button.dataset.name
    };

    $("eatingAvatar").textContent = selectedSnack.emoji;
    $("eatingText").textContent = "Yummy " + selectedSnack.name + "!";

    $("snackResult").classList.remove("hidden");
  });
});

/* =========================================
   RESCUE THE TEETH GAME
========================================= */

function startRescue() {
  rescueCount = 0;
  rescueCompleted = false;
  rescuePointerId = null;

  $("rescuedCount").textContent = "0";
  $("rescueBar").style.width = "0%";

  $("rescueMessage").textContent =
    "Touch and drag the toothbrush to every piece of food!";

  $("rescueContinue").classList.add("hidden");

  const brush = $("movingBrush");
  brush.style.left = "50%";
  brush.style.top = "225px";
  brush.style.transform = "translate(-50%, -50%)";

  document.querySelectorAll(".crumb").forEach((crumb) => {
    crumb.style.display = "inline-grid";
    crumb.style.opacity = "1";
    crumb.style.transform = "scale(1)";
    crumb.dataset.collected = "no";
  });
}

function getBrushRectangle() {
  return $("movingBrush").getBoundingClientRect();
}

function rectanglesOverlap(a, b) {
  return (
    a.left < b.right &&
    a.right > b.left &&
    a.top < b.bottom &&
    a.bottom > b.top
  );
}

function checkFoodCollision() {
  if (rescueCompleted) return;

  const brushRect = getBrushRectangle();

  document.querySelectorAll(".crumb").forEach((crumb) => {
    if (crumb.dataset.collected === "yes") return;

    const crumbRect = crumb.getBoundingClientRect();

    if (rectanglesOverlap(brushRect, crumbRect)) {
      collectCrumb(crumb);
    }
  });
}

function collectCrumb(crumb) {
  if (crumb.dataset.collected === "yes") return;

  crumb.dataset.collected = "yes";
  crumb.style.opacity = "0";
  crumb.style.transform = "scale(0)";
  crumb.style.pointerEvents = "none";

  setTimeout(() => {
    crumb.style.display = "none";
  }, 160);

  rescueCount++;

  $("rescuedCount").textContent = rescueCount;
  $("rescueBar").style.width = (rescueCount / 3 * 100) + "%";

  if (rescueCount < 3) {
    $("rescueMessage").textContent =
      "Great job! " + (3 - rescueCount) + " more to go! ✨";
  }

  if (rescueCount === 3) {
    rescueCompleted = true;
    $("rescueMessage").textContent =
      "Amazing! Every piece of food has been rescued! 🎉";

    $("rescueContinue").classList.remove("hidden");
  }
}

const mouthGame = $("mouthGame");
const movingBrush = $("movingBrush");

movingBrush.addEventListener("pointerdown", (event) => {
  if (rescueCompleted) return;

  event.preventDefault();
  event.stopPropagation();

  rescuePointerId = event.pointerId;

  try {
    mouthGame.setPointerCapture(event.pointerId);
  } catch (error) {
    // Pointer capture may not be available in every browser.
  }

  movingBrush.style.transform = "translate(-50%, -50%) scale(1.08)";
});

mouthGame.addEventListener("pointermove", (event) => {
  if (rescuePointerId !== event.pointerId || rescueCompleted) return;

  event.preventDefault();

  const bounds = mouthGame.getBoundingClientRect();

  let x = event.clientX - bounds.left;
  let y = event.clientY - bounds.top;

  const halfBrush = movingBrush.offsetWidth / 2;

  x = Math.max(halfBrush, Math.min(bounds.width - halfBrush, x));
  y = Math.max(halfBrush, Math.min(bounds.height - halfBrush, y));

  movingBrush.style.left = x + "px";
  movingBrush.style.top = y + "px";

  checkFoodCollision();
});

function stopBrushDrag(event) {
  if (rescuePointerId !== event.pointerId) return;

  rescuePointerId = null;
  movingBrush.style.transform = "translate(-50%, -50%)";
}

mouthGame.addEventListener("pointerup", stopBrushDrag);
mouthGame.addEventListener("pointercancel", stopBrushDrag);

function finishRescue() {
  const allFoodCollected = [...document.querySelectorAll(".crumb")]
    .every((crumb) => crumb.dataset.collected === "yes");

  if (rescueCount !== 3 || !allFoodCollected || !rescueCompleted) {
    $("rescueMessage").textContent =
      "Keep brushing! There is still food left to rescue.";
    $("rescueContinue").classList.add("hidden");
    return;
  }

  data.coins += 10;
  saveData();

  $("rescueMessage").textContent =
    "You earned 10 coins! Your teeth are sparkling clean! 💖";

  $("rescueContinue").textContent = "Back to my world";
  $("rescueContinue").onclick = () => {
    $("rescueContinue").textContent = "Continue ✨";
    $("rescueContinue").onclick = finishRescue;
    showScreen("world");
  };
}

/* =========================================
   TOOTH ACADEMY
========================================= */

const toothDescriptions = {
  Incisors: {
    title: "Incisors",
    text: "These are your front teeth. They help you bite and cut food into smaller pieces!"
  },
  Canines: {
    title: "Canines",
    text: "These pointed teeth help you tear food. You have canines near the front of your mouth."
  },
  Premolars: {
    title: "Premolars",
    text: "Premolars help crush and chew food. They are located between your canines and molars."
  },
  Molars: {
    title: "Molars",
    text: "Molars are the large teeth at the back of your mouth. They help grind food!"
  }
};

document.querySelectorAll(".tooth-part").forEach((button) => {
  button.addEventListener("click", () => {
    const info = toothDescriptions[button.dataset.part];

    $("anatomyInfo").innerHTML =
      "<h2>" + info.title + "</h2><p>" + info.text + "</p>";
  });
});

const toolDescriptions = {
  Toothbrush: "A toothbrush cleans the surfaces of your teeth. Brush gently for two minutes, twice a day!",
  Toothpaste: "Toothpaste with fluoride helps protect your teeth and keep them strong.",
  Floss: "Dental floss helps clean between your teeth where a toothbrush may not reach.",
  Water: "Water helps rinse your mouth and keeps you hydrated. Choose water often!"
};

document.querySelectorAll(".tool-choice").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.tool;

    $("toolInfo").innerHTML =
      "<h2>" + name + "</h2><p>" + toolDescriptions[name] + "</p>";
  });
});

/* =========================================
   DREAM HOME — SHOP CATALOG
========================================= */

const shopCatalog = {
  furniture: [
    { id: "bed", name: "Cozy Bed", emoji: "🛏️", price: 35 },
    { id: "desk", name: "Study Desk", emoji: "🪑", price: 25 },
    { id: "dining-table", name: "Dining Table", emoji: "🍽️", price: 30 },
    { id: "coffee-table", name: "Coffee Table", emoji: "🪵", price: 20 },
    { id: "bedside-table", name: "Bedside Table", emoji: "🗄️", price: 18 },
    { id: "sofa", name: "Soft Sofa", emoji: "🛋️", price: 40 },
    { id: "chair", name: "Comfy Chair", emoji: "💺", price: 20 },
    { id: "wardrobe", name: "Wardrobe", emoji: "🚪", price: 32 },
    { id: "bookshelf", name: "Bookshelf", emoji: "📚", price: 28 },
    { id: "fridge", name: "Fridge", emoji: "🧊", price: 35 },
    { id: "cabinet", name: "Cabinet", emoji: "🗄️", price: 25 },
    { id: "dining-chair", name: "Dining Chair", emoji: "🪑", price: 15 }
  ],

  decor: [
    { id: "lamp", name: "Cute Lamp", emoji: "💡", price: 12 },
    { id: "plant", name: "House Plant", emoji: "🪴", price: 15 },
    { id: "painting", name: "Wall Art", emoji: "🖼️", price: 18 },
    { id: "teddy", name: "Teddy Bear", emoji: "🧸", price: 20 },
    { id: "rug", name: "Soft Rug", emoji: "🟣", price: 18 },
    { id: "clock", name: "Wall Clock", emoji: "🕰️", price: 15 },
    { id: "flower", name: "Flower Vase", emoji: "💐", price: 14 },
    { id: "mirror", name: "Mirror", emoji: "🪞", price: 20 },
    { id: "star", name: "Star Decoration", emoji: "⭐", price: 10 },
    { id: "balloon", name: "Balloons", emoji: "🎈", price: 10 }
  ],

  garden: [
    { id: "tree", name: "Garden Tree", emoji: "🌳", price: 30 },
    { id: "bush", name: "Green Bush", emoji: "🌿", price: 12 },
    { id: "flowers", name: "Flower Bed", emoji: "🌷", price: 15 },
    { id: "swing", name: "Garden Swing", emoji: "🎠", price: 40 },
    { id: "lantern", name: "Garden Lantern", emoji: "🏮", price: 20 },
    { id: "fountain", name: "Water Fountain", emoji: "⛲", price: 35 },
    { id: "bench", name: "Garden Bench", emoji: "🪑", price: 25 },
    { id: "butterfly", name: "Butterflies", emoji: "🦋", price: 10 },
    { id: "mushroom", name: "Garden Mushroom", emoji: "🍄", price: 12 },
    { id: "sunflower", name: "Sunflowers", emoji: "🌻", price: 15 }
  ],

  walls: [
    { id: "wall-pink", name: "Blush Pink", color: "#f9dce7" },
    { id: "wall-lilac", name: "Soft Lilac", color: "#e9e0fa" },
    { id: "wall-blue", name: "Sky Blue", color: "#dceffc" },
    { id: "wall-green", name: "Mint Green", color: "#e0f2e5" },
    { id: "wall-cream", name: "Vanilla Cream", color: "#fff0d8" },
    { id: "wall-peach", name: "Peach", color: "#f9e0d4" },
    { id: "wall-white", name: "Cloud White", color: "#fffafd" }
  ],

  rooms: [
    { id: "room-living", name: "Living Room", emoji: "🛋️", price: 60 },
    { id: "room-kitchen", name: "Kitchen", emoji: "🍳", price: 55 },
    { id: "room-bathroom", name: "Bathroom", emoji: "🛁", price: 50 },
    { id: "room-playroom", name: "Playroom", emoji: "🧸", price: 65 },
    { id: "room-study", name: "Study Room", emoji: "📚", price: 60 },
    { id: "room-garden", name: "Garden", emoji: "🌳", price: 75 }
  ]
};

const roomNames = {
  "Bedroom": "Bedroom",
  "Living Room": "Living Room",
  "Kitchen": "Kitchen",
  "Bathroom": "Bathroom",
  "Playroom": "Playroom",
  "Study Room": "Study Room",
  "Garden": "Garden"
};

const roomCategoryNames = {
  furniture: "Furniture shop",
  decor: "Decor shop",
  garden: "Garden shop",
  walls: "Wall colors",
  rooms: "New rooms"
};

function getCatalogItem(id) {
  for (const category of Object.values(shopCatalog)) {
    const found = category.find((item) => item.id === id);
    if (found) return found;
  }
  return null;
}

function getCurrentRoomItems() {
  if (!Array.isArray(data.roomItems[data.currentRoom])) {
    data.roomItems[data.currentRoom] = [];
  }

  return data.roomItems[data.currentRoom];
}

function setShopMessage(message) {
  $("shopMessage").textContent = message;
}

function renderShop() {
  $("shopTitle").textContent = roomCategoryNames[currentShopCategory];

  const grid = $("shopGrid");
  grid.innerHTML = "";

  const items = shopCatalog[currentShopCategory] || [];

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "shop-item";

    if (currentShopCategory === "walls") {
      const button = document.createElement("button");
      button.textContent = "Choose color";

      button.addEventListener("click", () => {
        data.wallColors[data.currentRoom] = item.color;
        saveData();
        renderRoom();
        setShopMessage(item.name + " selected!");
      });

      card.innerHTML =
        '<div class="shop-item-emoji">🎨</div>' +
        "<strong>" + item.name + "</strong>";

      const swatch = document.createElement("div");
      swatch.style.width = "100%";
      swatch.style.height = "25px";
      swatch.style.borderRadius = "10px";
      swatch.style.background = item.color;

      card.appendChild(swatch);
      card.appendChild(button);
    } else if (currentShopCategory === "rooms") {
      const unlocked = data.unlockedRooms.includes(item.name);

      card.innerHTML =
        '<div class="shop-item-emoji">' + item.emoji + "</div>" +
        "<strong>" + item.name + "</strong>" +
        "<small>🪙 " + item.price + "</small>";

      const button = document.createElement("button");
      button.textContent = unlocked ? "Already unlocked" : "Unlock room";
      button.disabled = unlocked;

      button.addEventListener("click", () => {
        buyRoom(item);
      });

      card.appendChild(button);
    } else {
      const count = data.inventory.filter((id) => id === item.id).length;

      card.innerHTML =
        '<div class="shop-item-emoji">' + item.emoji + "</div>" +
        "<strong>" + item.name + "</strong>" +
        "<small>🪙 " + item.price + (count ? " · Owned: " + count : "") + "</small>";

      const button = document.createElement("button");
      button.textContent = "Buy · " + item.price;

      button.addEventListener("click", () => {
        buyFurniture(item);
      });

      card.appendChild(button);
    }

    grid.appendChild(card);
  });

  updateCoins();
}

function buyFurniture(item) {
  if (data.coins < item.price) {
    setShopMessage("You need more coins to buy this item.");
    return;
  }

  data.coins -= item.price;
  data.inventory.push(item.id);

  saveData();
  renderShop();
  renderInventory();

  setShopMessage(item.name + " added to your collection! 💗");
}

function buyRoom(item) {
  if (data.unlockedRooms.includes(item.name)) {
    setShopMessage("You already own this room!");
    return;
  }

  if (data.coins < item.price) {
    setShopMessage("You need more coins to unlock this room.");
    return;
  }

  data.coins -= item.price;
  data.unlockedRooms.push(item.name);

  if (!data.roomItems[item.name]) {
    data.roomItems[item.name] = [];
  }

  if (!data.wallColors[item.name]) {
    data.wallColors[item.name] = "#f4e8ff";
  }

  data.currentRoom = item.name;

  saveData();
  renderRoomSelector();
  renderRoom();
  renderShop();
  renderInventory();

  setShopMessage(item.name + " is now yours! 🎉");
}

/* =========================================
   ROOM SELECTOR
========================================= */

function renderRoomSelector() {
  const select = $("roomSelect");
  select.innerHTML = "";

  data.unlockedRooms.forEach((roomName) => {
    const option = document.createElement("option");
    option.value = roomName;
    option.textContent = roomNames[roomName] || roomName;
    select.appendChild(option);
  });

  select.value = data.currentRoom;
}

$("roomSelect").addEventListener("change", () => {
  const chosenRoom = $("roomSelect").value;

  if (!data.unlockedRooms.includes(chosenRoom)) return;

  data.currentRoom = chosenRoom;
  selectedRoomItem = null;

  saveData();
  renderRoom();
  renderShop();
  renderInventory();

  setShopMessage("Welcome to your " + chosenRoom + "!");
});

/* =========================================
   ROOM ITEMS — PLACE AND MOVE
========================================= */

function renderRoom() {
  const stage = $("roomStage");
  const wall = stage.querySelector(".room-wall");
  const container = $("roomItems");

  wall.style.background =
    data.wallColors[data.currentRoom] || "#f4e8ff";

  container.innerHTML = "";

  const items = getCurrentRoomItems();

  items.forEach((roomItem) => {
    const catalogItem = getCatalogItem(roomItem.id);
    if (!catalogItem) return;

    const element = document.createElement("button");
    element.className = "room-item";
    element.type = "button";
    element.textContent = catalogItem.emoji;
    element.setAttribute("aria-label", catalogItem.name);

    if (selectedRoomItem === roomItem.uid) {
      element.classList.add("selected");
    }

    element.style.left = (roomItem.x ?? 50) + "%";
    element.style.top = (roomItem.y ?? 65) + "%";
    element.style.transform =
      "translate(-50%, -50%) rotate(" +
      (roomItem.rotation || 0) +
      "deg) scale(" +
      ((roomItem.size || 100) / 100) +
      ")";

    element.addEventListener("click", (event) => {
      event.stopPropagation();
      selectedRoomItem = roomItem.uid;
      updateSelectedItem();
      renderRoom();
    });

    element.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();

      selectedRoomItem = roomItem.uid;
      updateSelectedItem();

      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = roomItem.x ?? 50;
      const startTop = roomItem.y ?? 65;
      const stageRect = stage.getBoundingClientRect();

      element.setPointerCapture(event.pointerId);

      function moveItem(moveEvent) {
        if (moveEvent.pointerId !== event.pointerId) return;

        const deltaX =
          (moveEvent.clientX - startX) / stageRect.width * 100;

        const deltaY =
          (moveEvent.clientY - startY) / stageRect.height * 100;

        roomItem.x = Math.max(5, Math.min(95, startLeft + deltaX));
        roomItem.y = Math.max(5, Math.min(95, startTop + deltaY));

        element.style.left = roomItem.x + "%";
        element.style.top = roomItem.y + "%";
      }

      function finishMove(moveEvent) {
        if (moveEvent.pointerId !== event.pointerId) return;

        element.removeEventListener("pointermove", moveItem);
        element.removeEventListener("pointerup", finishMove);
        element.removeEventListener("pointercancel", finishMove);

        saveData();
        updateSelectedItem();
      }

      element.addEventListener("pointermove", moveItem);
      element.addEventListener("pointerup", finishMove);
      element.addEventListener("pointercancel", finishMove);
    });

    container.appendChild(element);
  });

  updateSelectedItem();
}

function renderInventory() {
  const grid = $("inventoryGrid");
  grid.innerHTML = "";

  if (data.inventory.length === 0) {
    grid.innerHTML =
      "<p>You don't own any furniture yet. Visit the shop to get started!</p>";
    return;
  }

  const counts = {};

  data.inventory.forEach((id) => {
    counts[id] = (counts[id] || 0) + 1;
  });

  Object.entries(counts).forEach(([id, count]) => {
    const item = getCatalogItem(id);
    if (!item) return;

    const card = document.createElement("div");
    card.className = "inventory-item";

    card.innerHTML =
      '<div class="inventory-item-emoji">' + item.emoji + "</div>" +
      "<strong>" + item.name + "</strong>" +
      "<small>Owned: " + count + "</small>";

    const button = document.createElement("button");
    button.textContent = "Place in room";

    button.addEventListener("click", () => {
      placeFurniture(id);
    });

    card.appendChild(button);
    grid.appendChild(card);
  });
}

function placeFurniture(id) {
  const inventoryIndex = data.inventory.indexOf(id);

  if (inventoryIndex === -1) {
    setShopMessage("You need to buy this item first.");
    return;
  }

  data.inventory.splice(inventoryIndex, 1);

  const roomItems = getCurrentRoomItems();

  const newItem = {
    uid: "item-" + Date.now() + "-" + Math.floor(Math.random() * 100000),
    id: id,
    x: 50,
    y: 65,
    size: 100,
    rotation: 0
  };

  roomItems.push(newItem);
  selectedRoomItem = newItem.uid;

  saveData();
  renderRoom();
  renderInventory();

  setShopMessage("Your item has been placed! Drag it to move it.");
}

function findSelectedRoomItem() {
  return getCurrentRoomItems().find(
    (item) => item.uid === selectedRoomItem
  );
}

function updateSelectedItem() {
  const item = findSelectedRoomItem();

  if (!item) {
    $("selectedItemInfo").textContent =
      "Select an item in your room to edit it.";
    $("itemSize").value = 100;
    return;
  }

  const catalogItem = getCatalogItem(item.id);

  $("selectedItemInfo").textContent =
    catalogItem ? catalogItem.name + " selected" : "Furniture selected";

  $("itemSize").value = item.size || 100;
}

$("itemSize").addEventListener("input", () => {
  const item = findSelectedRoomItem();
  if (!item) return;

  item.size = Number($("itemSize").value);

  const element = [...document.querySelectorAll(".room-item")].find(
    (el) => el.classList.contains("selected")
  );

  if (element) {
    element.style.transform =
      "translate(-50%, -50%) rotate(" +
      (item.rotation || 0) +
      "deg) scale(" +
      (item.size / 100) +
      ")";
  }

  saveData();
});

$("rotateItem").addEventListener("click", () => {
  const item = findSelectedRoomItem();
  if (!item) return;

  item.rotation = (item.rotation || 0) + 15;
  saveData();
  renderRoom();
});

$("removeItem").addEventListener("click", () => {
  const items = getCurrentRoomItems();
  const index = items.findIndex(
    (item) => item.uid === selectedRoomItem
  );

  if (index === -1) return;

  const removed = items.splice(index, 1)[0];

  data.inventory.push(removed.id);
  selectedRoomItem = null;

  saveData();
  renderRoom();
  renderInventory();

  setShopMessage("Item returned to your collection.");
});

/* =========================================
   SHOP TABS
========================================= */

document.querySelectorAll(".room-tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".room-tab").forEach((tab) => {
      tab.classList.remove("active");
    });

    button.classList.add("active");
    currentShopCategory = button.dataset.category;

    renderShop();

    if (currentShopCategory === "garden" &&
        data.currentRoom !== "Garden") {
      setShopMessage(
        "You can buy garden decorations here and place them in your Garden room."
      );
    } else {
      setShopMessage("");
    }
  });
});

/* =========================================
   BRUSHING ROUTINE AND TIMER
========================================= */

function getTodayKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

function updateRoutineDisplay() {
  const today = getTodayKey();

  $("morningState").textContent =
    data.morningDone === today ? "Completed today ✓" : "Not completed yet";

  $("eveningState").textContent =
    data.eveningDone === today ? "Completed today ✓" : "Not completed yet";

  $("streakDays").textContent = data.streak;
}

function startTimer(type) {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  activeTimer = type;
  timerSeconds = 120;

  $("timerMessage").textContent =
    type === "morning"
      ? "Good morning! Let's brush your teeth!"
      : "Good night! Let's clean your teeth before bed!";

  $("timerDisplay").textContent = "02:00";

  timerInterval = setInterval(() => {
    timerSeconds--;

    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;

    $("timerDisplay").textContent =
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0");

    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      completeTimer();
    }
  }, 1000);
}

function completeTimer() {
  const today = getTodayKey();

  if (activeTimer === "morning") {
    data.morningDone = today;
  }

  if (activeTimer === "evening") {
    data.eveningDone = today;
  }

  if (
    data.morningDone === today &&
    data.eveningDone === today &&
    data.lastStreakDate !== today
  ) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayKey =
      yesterday.getFullYear() + "-" +
      String(yesterday.getMonth() + 1).padStart(2, "0") + "-" +
      String(yesterday.getDate()).padStart(2, "0");

    data.streak =
      data.lastStreakDate === yesterdayKey
        ? data.streak + 1
        : 1;

    data.lastStreakDate = today;
  }

  saveData();
  updateRoutineDisplay();

  $("timerDisplay").textContent = "02:00";
  $("timerMessage").textContent =
    "Wonderful! You completed your two-minute brushing session! 🌟";

  activeTimer = null;
}

$("morningStart").addEventListener("click", () => {
  startTimer("morning");
});

$("eveningStart").addEventListener("click", () => {
  startTimer("evening");
});

$("stopTimer").addEventListener("click", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  activeTimer = null;
  timerSeconds = 120;

  $("timerDisplay").textContent = "02:00";
  $("timerMessage").textContent =
    "Timer stopped. You can start again whenever you're ready.";
});

/* =========================================
   INITIALIZE THE GAME
========================================= */

function initializeGame() {
  updateCoins();
  loadProfileIntoPage();

  renderRoomSelector();
  renderRoom();
  renderShop();
  renderInventory();

  updateRoutineDisplay();

  showScreen("home");
}

initializeGame();
