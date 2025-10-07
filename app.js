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

questionTextEl.innerText = 'Lädt...';

// Загрузка JSON
fetch('questions.json')
  .then(res => {
    if (!res.ok) throw new Error('HTTP error ' + res.status);
    return res.json();
  })
  .then(data => {
    questions = data;
    if (!questions || !questions.length) {
      questionTextEl.innerText = 'Keine Fragen gefunden.';
      checkBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      return;
    }
    showQuestion(currentQuestion);
  })
  .catch(err => {
    console.error('Failed to load questions.json', err);
    questionTextEl.innerText = 'Fehler beim Laden der Fragen. Starten Sie einen lokalen Server und öffnen Sie http://localhost:8000';
    optionsContainer.innerHTML = '';
    checkBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  });

// Функция сравнения массивов ответов
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x,y)=>x-y);
  const sortedB = [...b].sort((x,y)=>x-y);
  return sortedA.every((v,i) => v === sortedB[i]);
}

// Показ вопроса
function showQuestion(index) {
  const q = questions[index];
  if (!q) {
    questionTextEl.innerText = 'Keine Frage verfügbar.';
    return;
  }

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

// Выбор ответа
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

// Проверка ответа
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
    // Сброс выделения
    for (let btn of optionsContainer.children) {
      btn.style.backgroundColor = '';
    }
    selectedAnswers = [];
  }
}

// Следующий вопрос
function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion(currentQuestion);
  } else {
    alert('Alle Fragen wurden beantwortet!');
  }
}

// Переключение перевода
function toggleTranslation() {
  const q = questions[currentQuestion];
  showingTranslation = !showingTranslation;

  questionTextEl.innerText = showingTranslation 
    ? `Frage ${q.id}: ${q.question_translation}`
    : `Frage ${q.id}: ${q.question}`;

  const optionsButtons = optionsContainer.children;
  for (let i = 0; i < optionsButtons.length; i++) {
    optionsButtons[i].innerText = showingTranslation ? q.options_translation[i] : q.options[i];
  }

  translateBtn.innerText = showingTranslation ? 'Original anzeigen' : 'Übersetzung anzeigen';
}

// Начать заново
function restartQuiz() {
  currentQuestion = 0;
  showQuestion(currentQuestion);
}

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  });
}
