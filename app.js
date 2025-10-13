let sections = [];
let currentSection = null;
let questions = [];
let currentQuestion = 0;
let selectedAnswers = [];
let showingTranslation = false;

// Get DOM elements
const mainMenu = document.getElementById('main-menu');
const sectionsContainer = document.getElementById('sections-container');
const quizContainer = document.getElementById('quiz-container');
const questionTextEl = document.getElementById('question-text');
const optionsContainer = document.getElementById('options');
const checkBtn = document.getElementById('check-btn');
const nextBtn = document.getElementById('next-btn');
const translateBtn = document.getElementById('translate-btn');
const restartBtn = document.getElementById('restart-btn');
const installBtn = document.getElementById('install-btn');

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

questionTextEl.innerText = 'Lädt...';


// Load sections and show main menu
fetch('questions.json')
  .then(res => {
    if (!res.ok) throw new Error('HTTP error ' + res.status);
    return res.json();
  })
  .then(data => {
    sections = data;
    showMainMenu();
  })
  .catch(err => {
    console.error('Failed to load sections:', err);
    questionTextEl.innerText = 'Fehler beim Laden der Fragen.';
  });

function showMainMenu() {
    mainMenu.style.display = 'block';
    quizContainer.style.display = 'none';
    sectionsContainer.innerHTML = '';
    
    sections.forEach(section => {
        const button = document.createElement('button');
        button.textContent = section.title;
        button.onclick = () => startSection(section);
        sectionsContainer.appendChild(button);
    });
}

function startSection(section) {
    currentSection = section;
    questions = section.questions;
    currentQuestion = 0;
    mainMenu.style.display = 'none';
    quizContainer.style.display = 'block';
    showQuestion(currentQuestion);
}

function goHome() {
    showMainMenu();
}

function restartSection() {
    if (currentSection) {
        startSection(currentSection);
    }
}

function showQuestion(index) {
  const q = questions[index];
  if (!q) return;

  questionTextEl.innerText = `Frage ${q.id}: ${q.question}`;
  
  // Add error handling for images
  const questionImage = document.getElementById('question-image');
  questionImage.onerror = () => {
    console.warn('Failed to load image:', q.image);
    questionImage.src = 'images/offline-image.png';
  };
  questionImage.src = q.image;

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
//  answer selection
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
//  answer check
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
//  next question
// ------------------------
function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        showQuestion(currentQuestion);
    } else {
        alert('Abschnitt beendet! Kehren Sie zur Übersicht zurück oder starten Sie neu.');
        nextBtn.style.display = 'none';
    }
}

// ------------------------
//   toggle translation
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
//  restart quiz
// ------------------------
function restartQuiz() {
  currentQuestion = 0;
  showQuestion(currentQuestion);
}

// ------------------------
//  PWA installation
// ------------------------
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  if (isIOS) {
  
    installBtn.style.display = 'inline-block';
    installBtn.addEventListener('click', () => {
      alert('To install the app:\n1. Click the “Share” button (Share)\n2. Select “To the Home screen” (Add to Home Screen)\n3. Confirm by clicking “Add”');
    });
  } else {
    
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
