const welcomeScreen = document.getElementById("welcomeScreen");
const profileScreen = document.getElementById("profileScreen");
const creatorScreen = document.getElementById("creatorScreen");
const finishScreen = document.getElementById("finishScreen");
const mealScreen = document.getElementById("mealScreen");
const rescueScreen = document.getElementById("rescueScreen");
const academyScreen = document.getElementById("academyScreen");
const worldScreen = document.getElementById("worldScreen");

const avatar = document.getElementById("avatar");

let child = {
  name: "",
  age: "",
  skin: "#f5c7a5",
  hair: "#593b2e",
  eyes: "#65432d",
  outfit: "#a88be0",
  clothes: "shirt",
  coins: 0,
  streak: 1
};

function showScreen(screen) {
  [welcomeScreen, profileScreen, creatorScreen, finishScreen, mealScreen, rescueScreen, academyScreen, worldScreen]
    .forEach(item => item.classList.add("hidden"));
  screen.classList.remove("hidden");
}

document.getElementById("startButton").addEventListener("click", () => {
  showScreen(profileScreen);
});

document.getElementById("profileForm").addEventListener("submit", event => {
  event.preventDefault();
  child.name = document.getElementById("childName").value.trim();
  child.age = document.getElementById("childAge").value;
  if (!child.name || !child.age) return;
  showScreen(creatorScreen);
});

function updateAvatar() {
  avatar.style.setProperty("--skin", child.skin);
  avatar.style.setProperty("--hair", child.hair);
  avatar.style.setProperty("--eyes", child.eyes);
  avatar.style.setProperty("--outfit", child.outfit);
  avatar.classList.toggle("dress", child.clothes === "dress");
}

document.querySelectorAll(".color-choice").forEach(button => {
  button.addEventListener("click", () => {
    const group = button.dataset.group;
    const color = button.dataset.color;
    child[group] = color;
    document.querySelectorAll(`.color-choice[data-group="${group}"]`).forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    updateAvatar();
  });
});

document.querySelectorAll(".outfit-choice").forEach(button => {
  button.addEventListener("click", () => {
    child.clothes = button.dataset.outfit;
    document.querySelectorAll(".outfit-choice").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    updateAvatar();
  });
});

function renderFinishScreen() {
  document.getElementById("welcomeName").textContent = `Hello, ${child.name}! 💗`;
  document.getElementById("totalCoinsDisplay").textContent = child.coins;
  const finalAvatar = document.getElementById("finalAvatar");
  finalAvatar.innerHTML = avatar.innerHTML;
  ["skin", "hair", "eyes", "outfit"].forEach(color => {
    finalAvatar.style.setProperty(`--${color}`, child[color]);
  });
  finalAvatar.classList.toggle("dress", child.clothes === "dress");
}

document.getElementById("finishButton").addEventListener("click", () => {
  saveProfile();
  renderFinishScreen();
  showScreen(finishScreen);
});

document.getElementById("continueButton").addEventListener("click", () => {
  document.getElementById("worldName").textContent = child.name;
  document.getElementById("coins").textContent = child.coins;
  document.getElementById("streak").textContent = child.streak;
  showScreen(worldScreen);
});

function saveProfile() {
  localStorage.setItem("toothTalesProfile", JSON.stringify(child));
}

function restoreProfile() {
  const saved = localStorage.getItem("toothTalesProfile");
  if (!saved) return;
  try {
    const loaded = JSON.parse(saved);
    if (loaded.name) {
      child = loaded;
      renderFinishScreen();
      showScreen(finishScreen);
    }
  } catch (error) {
    localStorage.removeItem("toothTalesProfile");
  }
}

updateAvatar();
restoreProfile();

// SNACK & RESCUE GAME LOGIC
let ttSelectedSnack = "";
let ttSnackEmoji = "🍎";
let ttRescuedCount = 0;
let ttDraggingBrush = false;

function startBrushing(session) {
  showScreen(mealScreen);
}

function chooseSnack(snackName, emoji) {
  ttSelectedSnack = snackName;
  ttSnackEmoji = emoji;
  document.getElementById("snackMessage").textContent = `Yummy! You chose ${snackName}! 😋`;
}

function finishSnack() {
  if (!ttSelectedSnack) {
    document.getElementById("snackMessage").textContent = "Choose your snack first! 💗";
    return;
  }

  showScreen(rescueScreen);
  ttRescuedCount = 0;

  // Устанавливаем выбранную еду на зубки, никаких шоколадок или хлеба если выбрано яблоко!
  const crumbs = document.querySelectorAll(".dynamic-crumb");
  crumbs.forEach(crumb => {
    crumb.textContent = ttSnackEmoji;
    crumb.classList.remove("rescued");
  });

  document.getElementById("rescuedCount").textContent = "0";
  document.getElementById("rescueSubtitle").textContent = `Oh! Some ${ttSelectedSnack} got stuck between teeth!`;
  document.getElementById("rescueCry").textContent = `«Rescue us please, or we'll make the tooth decay! 😭»`;
  document.getElementById("rescueMessage").textContent = "Move your toothbrush to save them!";
  document.getElementById("rescueDone").disabled = true;
}

const ttBrush = document.getElementById("toothbrush");
const ttMouth = document.getElementById("rescueMouth");

function moveBrush(event) {
  const rect = ttMouth.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  ttBrush.style.left = (x - 28) + "px";
  ttBrush.style.top = (y - 28) + "px";

  const brushRect = ttBrush.getBoundingClientRect();

  document.querySelectorAll(".dynamic-crumb:not(.rescued)").forEach(crumb => {
    const foodRect = crumb.getBoundingClientRect();
    const touching =
      brushRect.left < foodRect.right &&
      brushRect.right > foodRect.left &&
      brushRect.top < foodRect.bottom &&
      brushRect.bottom > foodRect.top;

    if (touching) {
      crumb.classList.add("rescued");
      ttRescuedCount++;
      document.getElementById("rescuedCount").textContent = ttRescuedCount;

      if (ttRescuedCount === 3) {
        child.coins += 30;
        saveProfile();
        document.getElementById("coins").textContent = child.coins;
        document.getElementById("rescueCry").textContent = `«Hurrah! We are saved! Thank you, hero! ✨»`;
        document.getElementById("rescueMessage").textContent = "All food rescued! +30 coins! 🎉";
        document.getElementById("rescueDone").disabled = false;
      }
    }
  });
}

ttMouth.addEventListener("pointerdown", function(event) {
  event.preventDefault();
  ttDraggingBrush = true;
  ttMouth.setPointerCapture(event.pointerId);
  ttBrush.classList.add("active");
  moveBrush(event);
});

ttMouth.addEventListener("pointermove", function(event) {
  if (!ttDraggingBrush) return;
  event.preventDefault();
  moveBrush(event);
});

function ttStopBrush() {
  ttDraggingBrush = false;
  ttBrush.classList.remove("active");
}

ttMouth.addEventListener("pointerup", ttStopBrush);
ttMouth.addEventListener("pointercancel", ttStopBrush);


// TOOTH ACADEMY (14 STEPS FROM INSTRUCTION)
const academySteps = [
  { title: "Step 1: Pick up toothbrush 🪥", desc: "Tap the toothbrush to pick it up and get ready for the adventure!", btn: "Pick up 🪥 (+10 ⭐)" },
  { title: "Step 2: Put toothpaste ✨", desc: "Apply a pea-sized amount of magical fluoride toothpaste onto the brush.", btn: "Add toothpaste 💧 (+10 ⭐)" },
  { title: "Step 3: Top teeth — outside 🦷", desc: "Move the brush left and right on the upper outer teeth to sweep away germs!", btn: "Brush top outside ✨ (+10 ⭐)" },
  { title: "Step 4: Top teeth — inside 🌟", desc: "Carefully brush the inner side of the upper teeth where hidden plaque likes to hide.", btn: "Brush top inside 🌟 (+10 ⭐)" },
  { title: "Step 5: Top teeth — chewing surface 🍪", desc: "Move the brush back and forth right on top of the upper chewing teeth.", btn: "Brush top chewing 🦷 (+10 ⭐)" },
  { title: "Step 6: Bottom teeth — outside 😁", desc: "Great job! Now move the brush left and right on your lower outer teeth.", btn: "Brush bottom outside 😁 (+10 ⭐)" },
  { title: "Step 7: Bottom teeth — inside ✨", desc: "Brush the inner side of your lower teeth gently and thoroughly.", btn: "Brush bottom inside ✨ (+10 ⭐)" },
  { title: "Step 8: Bottom teeth — chewing surface 🥞", desc: "Scrub back and forth on top of the lower chewing teeth to keep them shining.", btn: "Brush bottom chewing 🥞 (+10 ⭐)" },
  { title: "Step 9: Brush your tongue 👅", desc: "Move the brush gently across your tongue to keep your breath super fresh!", btn: "Clean tongue 👅 (+10 ⭐)" },
  { title: "Step 10: Spit out toothpaste 💧", desc: "Tap the sink to spit out the foam. Never swallow toothpaste!", btn: "Spit out foam 💧 (+10 ⭐)" },
  { title: "Step 11: Rinse your mouth 🥤", desc: "Take a sip of water, rinse your mouth, and sparkle clean!", btn: "Rinse mouth 🥤 (+10 ⭐)" },
  { title: "Step 12: Wash your brush 🚿", desc: "Clean your toothbrush under running water so it stays fresh for next time.", btn: "Wash brush 🚿 (+10 ⭐)" },
  { title: "Step 13: Put the brush away 🏠", desc: "Drag or place the brush safely back into its holder.", btn: "Store brush 🏠 (+10 ⭐)" },
  { title: "Step 14: Smile! 😁💖", desc: "Tap the face to flash a brilliant, healthy, glowing clean smile!", btn: "Flash Smile! (+50 ⭐)" }
];

let currentAcademyStep = 0;

function startAcademy() {
  currentAcademyStep = 0;
  showScreen(academyScreen);
  updateAcademyUI();
}

function updateAcademyUI() {
  const step = academySteps[currentAcademyStep];
  document.getElementById("academyTitle").textContent = step.title;
  document.getElementById("academyDesc").textContent = step.desc;
  document.getElementById("academyActionBtn").textContent = step.btn;
  document.getElementById("currentStepNum").textContent = currentAcademyStep + 1;
}

function performAcademyAction() {
  // Начисляем монетки за каждый шаг!
  const reward = currentAcademyStep === 13 ? 50 : 10;
  child.coins += reward;
  saveProfile();

  currentAcademyStep++;
  if (currentAcademyStep < academySteps.length) {
    updateAcademyUI();
  } else {
    // Обучение пройдено, возвращаемся в мир
    document.getElementById("worldName").textContent = child.name;
    document.getElementById("coins").textContent = child.coins;
    document.getElementById("streak").textContent = child.streak;
    document.getElementById("morningLight").textContent = "⭐";
    document.getElementById("brushMessage").textContent = "Fantastic job at Tooth Academy! You earned lots of coins! 💖";
    showScreen(worldScreen);
  }
}

