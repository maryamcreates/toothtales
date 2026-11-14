
const welcomeScreen = document.getElementById("welcomeScreen");
const profileScreen = document.getElementById("profileScreen");
const creatorScreen = document.getElementById("creatorScreen");
const finishScreen = document.getElementById("finishScreen");

const avatar = document.getElementById("avatar");

let child = {
  name: "",
  age: "",
  skin: "#f5c7a5",
  hair: "#593b2e",
  eyes: "#65432d",
  outfit: "#a88be0",
  clothes: "shirt"
};

// Screen navigation
function showScreen(screen) {
  [welcomeScreen, profileScreen, creatorScreen, finishScreen]
    .forEach(item => item.classList.add("hidden"));

  screen.classList.remove("hidden");
}

document.getElementById("startButton").addEventListener("click", () => {
  showScreen(profileScreen);
});

// Save child's basic profile
document.getElementById("profileForm").addEventListener("submit", event => {
  event.preventDefault();

  child.name = document.getElementById("childName").value.trim();
  child.age = document.getElementById("childAge").value;

  if (!child.name || !child.age) return;

  showScreen(creatorScreen);
});

// Update avatar appearance
function updateAvatar() {
  avatar.style.setProperty("--skin", child.skin);
  avatar.style.setProperty("--hair", child.hair);
  avatar.style.setProperty("--eyes", child.eyes);
  avatar.style.setProperty("--outfit", child.outfit);

  avatar.classList.toggle("dress", child.clothes === "dress");
}

// Color selection
document.querySelectorAll(".color-choice").forEach(button => {
  button.addEventListener("click", () => {
    const group = button.dataset.group;
    const color = button.dataset.color;

    child[group] = color;

    document.querySelectorAll(
      `.color-choice[data-group="${group}"]`
    ).forEach(item => item.classList.remove("active"));

    button.classList.add("active");

    updateAvatar();
  });
});

// Outfit selection
document.querySelectorAll(".outfit-choice").forEach(button => {
  button.addEventListener("click", () => {
    child.clothes = button.dataset.outfit;

    document.querySelectorAll(".outfit-choice")
      .forEach(item => item.classList.remove("active"));

    button.classList.add("active");
    updateAvatar();
  });
});

// Finish character creation
document.getElementById("finishButton").addEventListener("click", () => {
  localStorage.setItem("toothTalesProfile", JSON.stringify(child));

  document.getElementById("welcomeName").textContent =
    `Hello, ${child.name}! 💗`;

  const finalAvatar = document.getElementById("finalAvatar");

  finalAvatar.innerHTML = avatar.innerHTML;

  ["skin", "hair", "eyes", "outfit"].forEach(color => {
    finalAvatar.style.setProperty(
      `--${color}`,
      child[color]
    );
  });

  finalAvatar.classList.toggle("dress", child.clothes === "dress");

  showScreen(finishScreen);
});


continueButton.addEventListener("click", () => {
  document.getElementById("finishScreen").classList.add("hidden");
  document.getElementById("worldScreen").classList.remove("hidden");

  document.getElementById("worldName").textContent = child.name;
});


// Restore saved profile
function restoreProfile() {
  const saved = localStorage.getItem("toothTalesProfile");

  if (!saved) return;

  try {
    child = JSON.parse(saved);

    if (!child.name || !child.age) return;

    document.getElementById("welcomeName").textContent =
      `Hello, ${child.name}! 💗`;

    const finalAvatar = document.getElementById("finalAvatar");
    finalAvatar.innerHTML = avatar.innerHTML;

    ["skin", "hair", "eyes", "outfit"].forEach(color => {
      finalAvatar.style.setProperty(`--${color}`, child[color]);
    });

    finalAvatar.classList.toggle("dress", child.clothes === "dress");

    showScreen(finishScreen);
  } catch (error) {
    localStorage.removeItem("toothTalesProfile");
  }
}

updateAvatar();
restoreProfile();

// TOOTHTALES: SNACK & RESCUE GAME

let ttSelectedSnack = "";
let ttRescuedCount = 0;
let ttActiveSession = "morning";
let ttDraggingBrush = false;

function startBrushing(session) {
  ttActiveSession = session;

  document.getElementById("worldScreen").classList.add("hidden");
  document.getElementById("mealScreen").classList.remove("hidden");
}

function chooseSnack(snack) {
  ttSelectedSnack = snack;

  document.getElementById("snackMessage").textContent =
    "Yummy! You chose " + snack + "! 😋";
}

function finishSnack() {
  if (!ttSelectedSnack) {
    document.getElementById("snackMessage").textContent =
      "Choose your snack first! 💗";
    return;
  }

  document.getElementById("mealScreen").classList.add("hidden");
  document.getElementById("rescueScreen").classList.remove("hidden");

  ttRescuedCount = 0;

  document.querySelectorAll(".crumb").forEach(crumb => {
    crumb.classList.remove("rescued");
  });

  document.getElementById("rescuedCount").textContent = "0";
  document.getElementById("rescueMessage").textContent =
    "Let's rescue all the little food pieces! 🪥";

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

  document.querySelectorAll(".crumb:not(.rescued)").forEach(crumb => {
    const foodRect = crumb.getBoundingClientRect();

    const touching =
      brushRect.left < foodRect.right &&
      brushRect.right > foodRect.left &&
      brushRect.top < foodRect.bottom &&
      brushRect.bottom > foodRect.top;

    if (touching) {
      crumb.classList.add("rescued");
      ttRescuedCount++;

      document.getElementById("rescuedCount").textContent =
        ttRescuedCount;

      if (ttRescuedCount === 3) {
        document.getElementById("rescueMessage").textContent =
          "You rescued all the food! Amazing! 🎉";

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


function finishRescue() {
  if (ttRescuedCount < 3) return;

  document.getElementById("rescueScreen").classList.add("hidden");
  document.getElementById("worldScreen").classList.remove("hidden");

  document.getElementById("brushMessage").textContent =
    "Amazing rescue! Your teeth are ready for the next adventure! 💗";

  ttBrush.style.position = "";
  ttBrush.style.left = "";
  ttBrush.style.top = "";
}
