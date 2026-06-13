// ===== 体組成・栄養計算 =====
const calcBtn = document.getElementById("calc-btn");
const calcResult = document.getElementById("calc-result");

calcBtn.addEventListener("click", () => {
  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("weight").value);
  const age = parseFloat(document.getElementById("age").value);
  const gender = document.getElementById("gender").value;
  const activity = parseFloat(document.getElementById("activity").value);
  const goal = document.getElementById("goal").value;

  if (!height || !weight || !age) {
    calcResult.hidden = false;
    calcResult.innerHTML =
      '<p class="result-label">身長・体重・年齢を入力してください。</p>';
    return;
  }

  // BMI
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  let bmiLabel = "標準";
  if (bmi < 18.5) bmiLabel = "低体重";
  else if (bmi >= 25) bmiLabel = "肥満";

  // 基礎代謝量 (Mifflin-St Jeor)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += gender === "male" ? 5 : -161;

  // 消費カロリー
  let tdee = bmr * activity;

  // 目標による補正
  if (goal === "bulk") tdee += 300;
  else if (goal === "cut") tdee -= 400;

  // タンパク質目安 (体重1kgあたり)
  const proteinPerKg = goal === "cut" ? 2.0 : goal === "bulk" ? 1.8 : 1.6;
  const protein = weight * proteinPerKg;

  calcResult.hidden = false;
  calcResult.innerHTML = `
    <div class="result-row">
      <span class="result-label">BMI</span>
      <span class="result-value">${bmi.toFixed(1)}（${bmiLabel}）</span>
    </div>
    <div class="result-row">
      <span class="result-label">基礎代謝量</span>
      <span class="result-value">${Math.round(bmr)} kcal/日</span>
    </div>
    <div class="result-row">
      <span class="result-label">目標カロリー</span>
      <span class="result-value">${Math.round(tdee)} kcal/日</span>
    </div>
    <div class="result-row">
      <span class="result-label">タンパク質目安</span>
      <span class="result-value">${Math.round(protein)} g/日</span>
    </div>
  `;
});

// ===== トレーニング記録 =====
const STORAGE_KEY = "muscle-base-logs";
const logBtn = document.getElementById("log-btn");
const logBody = document.getElementById("log-body");
const logEmpty = document.getElementById("log-empty");

function loadLogs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function renderLogs() {
  const logs = loadLogs();
  logBody.innerHTML = "";
  logEmpty.hidden = logs.length > 0;

  logs.forEach((log, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${log.date}</td>
      <td>${log.exercise}</td>
      <td>${log.weight ? log.weight + " kg" : "-"}</td>
      <td>${log.reps ? log.reps + " 回" : "-"}</td>
      <td>${log.sets ? log.sets + " set" : "-"}</td>
      <td><button class="del-btn" data-index="${index}">削除</button></td>
    `;
    logBody.appendChild(tr);
  });

  document.querySelectorAll(".del-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const logs = loadLogs();
      logs.splice(parseInt(btn.dataset.index, 10), 1);
      saveLogs(logs);
      renderLogs();
    });
  });
}

logBtn.addEventListener("click", () => {
  const exercise = document.getElementById("log-exercise").value.trim();
  if (!exercise) {
    alert("種目を入力してください。");
    return;
  }

  const logs = loadLogs();
  const today = new Date();
  const date = `${today.getMonth() + 1}/${today.getDate()}`;

  logs.unshift({
    date,
    exercise,
    weight: document.getElementById("log-weight").value,
    reps: document.getElementById("log-reps").value,
    sets: document.getElementById("log-sets").value,
  });
  saveLogs(logs);
  renderLogs();

  document.getElementById("log-exercise").value = "";
  document.getElementById("log-weight").value = "";
  document.getElementById("log-reps").value = "";
  document.getElementById("log-sets").value = "";
});

renderLogs();
