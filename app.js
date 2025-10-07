let questions = [];
let currentQuestion = 0;
let selectedAnswers = [];
let showingTranslation = false;

const questionTextEl = document.getElementById('question-text');
const optionsContainer = document.getElementById('options');
const checkBtn = document.getElementById('check-btn');
const nextBtn = document.getElementById('next-btn');
const translateBtn = document.getElementById('translate-btn');
const restartBtn = document.getElementById('restart-btn');
const installBtn = document.getElementById('install-btn');

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

questionTextEl.innerText = 'Lädt...';

// ------------------------
//  Загрузка вопросов
// ------------------------
fetch('questions.json')
  .then(res => {
    if (!res.ok) throw new Error('HTTP error ' + res.status);
    return res.json();
  })
  .then(data => {
    questions = data.map((q, i) => ({ id: i + 1, ...q }));
    showQuestion(currentQuestion);
  })
  .catch(err => {
    console.error('Failed to load questions.json', err);
    questionTextEl.innerText = 'Fehler beim Laden der Fragen.';
  });

// ------------------------
//  Показ вопроса
// ------------------------
function showQuestion(index) {
  const q = questions[index];
  if (!q) return;

  questionTextEl.innerText = `Frage ${q.id}: ${q.question}`;
  document.getElementById('question-image').src = q.image;

  optionsContainer.innerHTML = '';
  q.options.forEach((option, i) => {
    const btn = document.createElement('button');
    btn.innerText = option;
    btn.type = 'button';
    btn.onclick = () => selectAnswer(i, btn);
    optionsContainer.appendChild(btn);
  });

  selectedAnswers = [];
  showingTranslation = false;
  translateBtn.innerText = 'Übersetzung anzeigen';
  nextBtn.style.display = 'none';
  checkBtn.style.display = 'inline-block';
}

// ------------------------
//  Выбор ответа
// ------------------------
function selectAnswer(index, button) {
  const selectedIndex = selectedAnswers.indexOf(index);
  if (selectedIndex > -1) {
    selectedAnswers.splice(selectedIndex, 1);
    button.style.backgroundColor = '';
  } else {
    selectedAnswers.push(index);
    button.style.backgroundColor = '#a0e7a0';
  }
}

// ------------------------
//  Проверка ответа
// ------------------------
function arraysEqual(a, b) {
  return a.length === b.length && a.sort().every((v, i) => v === b.sort()[i]);
}

function checkAnswer() {
  if (selectedAnswers.length === 0) {
    alert('Bitte wählen Sie mindestens eine Antwort aus!');
    return;
  }

  const correct = questions[currentQuestion].answer;
  if (arraysEqual(correct, selectedAnswers)) {
    alert('Richtig!');
    nextBtn.style.display = 'inline-block';
    checkBtn.style.display = 'none';
  } else {
    alert('Falsch! Versuche es erneut.');
    for (let btn of optionsContainer.children) btn.style.backgroundColor = '';
    selectedAnswers = [];
  }
}

// ------------------------
//  Следующий вопрос
// ------------------------
function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion(currentQuestion);
  } else {
    alert('Alle Fragen wurden beantwortet!');
  }
}

// ------------------------
//  Перевод
// ------------------------
function toggleTranslation() {
  const q = questions[currentQuestion];
  showingTranslation = !showingTranslation;

  questionTextEl.innerText = showingTranslation
    ? `Frage ${q.id}: ${q.question_translation}`
    : `Frage ${q.id}: ${q.question}`;

  const optionsButtons = optionsContainer.children;
  for (let i = 0; i < optionsButtons.length; i++) {
    optionsButtons[i].innerText = showingTranslation
      ? q.options_translation[i]
      : q.options[i];
  }

  translateBtn.innerText = showingTranslation
    ? 'Original anzeigen'
    : 'Übersetzung anzeigen';
}

// ------------------------
//  Начать заново
// ------------------------
function restartQuiz() {
  currentQuestion = 0;
  showQuestion(currentQuestion);
}

// ------------------------
//  Установка PWA
// ------------------------
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  if (isIOS) {
    // На iOS показываем инструкцию по установке
    installBtn.style.display = 'inline-block';
    installBtn.addEventListener('click', () => {
      alert('Чтобы установить приложение:\n1. Нажмите кнопку "Поделиться" (Share)\n2. Выберите "На экран «Домой»"');
    });
  } else {
    // Стандартная логика для Android/Desktop
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'inline-block';
  }
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    console.log('Install result:', result.outcome);
    installBtn.style.display = 'none';
  }
});
