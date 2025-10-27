let sections = [];
let currentSection = null;
let questions = [];
let currentQuestion = 0;
let selectedAnswers = [];
let showingTranslation = false;

// Add new variables
let examQuestions = [];
let examMode = false;
let correctAnswers = 0;
let timer;

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
const practiceExamBtn = document.getElementById('practice-exam-btn');
const examTimer = document.getElementById('exam-timer');
const timerDisplay = document.getElementById('timer');

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
    if (examMode) {
        if (confirm('Möchten Sie die Prüfung wirklich abbrechen?')) {
            clearInterval(timer);
            examTimer.style.display = 'none';
            examMode = false;
            showMainMenu();
        }
    } else {
        showMainMenu();
    }
}

function restartSection() {
    if (currentSection) {
        startSection(currentSection);
    }
}

// Fix image loading in showQuestion function
function showQuestion(index) {
  const q = questions[index];
  if (!q) return;

  questionTextEl.innerText = q.question ? 
    `Frage ${q.id}: ${q.question}` : 
    `Frage ${index + 1}`;
  
  const questionImage = document.getElementById('question-image');
  if (q.image) {
    questionImage.style.display = 'block';
    questionImage.src = q.image;
  } else {
    questionImage.style.display = 'none';
  }

  optionsContainer.innerHTML = '';
  if (q.options && q.options.length) {
    q.options.forEach((option, i) => {
      const btn = document.createElement('button');
      btn.innerText = option;
      btn.onclick = () => selectAnswer(i, btn);
      optionsContainer.appendChild(btn);
    });
  }

  selectedAnswers = [];
  showingTranslation = false;
  translateBtn.innerText = 'Übersetzung anzeigen';

  if (examMode) {
    document.getElementById('confirm-answer').style.display = 'block';
    document.getElementById('check-btn').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'none'; // Hide restart button in exam mode
  } else {
    document.getElementById('confirm-answer').style.display = 'none';
    document.getElementById('check-btn').style.display = 'block';
    document.getElementById('restart-btn').style.display = 'block'; // Show restart button in practice mode
  }
  document.getElementById('next-btn').style.display = 'none';
}

// ------------------------
//  answer selection
// ------------------------
function selectAnswer(index, button) {
  if (examMode) {
    // Single selection in exam mode
    const buttons = optionsContainer.getElementsByTagName('button');
    Array.from(buttons).forEach(btn => {
      btn.classList.remove('option-selected');
    });
    selectedAnswers = [index];
    button.classList.add('option-selected');
  } else {
    // Multiple selection in practice mode
    const selectedIndex = selectedAnswers.indexOf(index);
    if (selectedIndex > -1) {
      selectedAnswers.splice(selectedIndex, 1);
      button.classList.remove('option-selected');
    } else {
      selectedAnswers.push(index);
      button.classList.add('option-selected');
    }
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
  const buttons = optionsContainer.getElementsByTagName('button');

  if (arraysEqual(correct, selectedAnswers)) {
    // Correct answer
    for (let index of selectedAnswers) {
      buttons[index].classList.add('option-correct');
    }
    document.getElementById('next-btn').style.display = 'block';
    document.getElementById('check-btn').style.display = 'none';
  } else {
    // Wrong answer
    alert('Falsch! Versuchen Sie es erneut.');
    for (let btn of buttons) {
      btn.classList.remove('option-selected', 'option-wrong', 'option-correct');
    }
    selectedAnswers = [];
  }
}

function confirmAnswer() {
  if (selectedAnswers.length === 0) {
    alert('Bitte wählen Sie mindestens eine Antwort aus');
    return;
  }

  const correct = questions[currentQuestion].answer;
  if (arraysEqual(correct, selectedAnswers)) {
    correctAnswers++;
  }
  
  document.getElementById('confirm-answer').style.display = 'none';
  document.getElementById('next-btn').style.display = 'block';
}

// ------------------------
//  next question
// ------------------------
function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        showQuestion(currentQuestion);
    } else if (examMode) {
        finishExam();
    } else {
        alert('Abschnitt beendet!');
        nextBtn.style.display = 'none';
    }
}

function finishExam() {
    clearInterval(timer);
    examTimer.style.display = 'none';
    
    const totalQuestions = examQuestions.length;
    const requiredToPass = Math.ceil(totalQuestions * 0.9); // 90% to pass
    const passed = correctAnswers >= requiredToPass;
    
    const message = passed ? 
        `Gratulation! Sie haben bestanden!\nRichtige Antworten: ${correctAnswers}/${totalQuestions}` :
        `Leider nicht bestanden.\nRichtige Antworten: ${correctAnswers}/${totalQuestions}\nMin. ${requiredToPass} richtige Antworten erforderlich.`;
    
    alert(message);
    examMode = false;
    showMainMenu();
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

// Add exam functions
function startPracticeExam() {
    examMode = true;
    correctAnswers = 0;
    examQuestions = getRandomQuestions(50); // Get up to 50 random questions
    questions = examQuestions;
    currentQuestion = 0;
    
    mainMenu.style.display = 'none';
    quizContainer.style.display = 'block';
    examTimer.style.display = 'block';
    document.getElementById('restart-btn').style.display = 'none'; // Hide restart button
    
    startTimer(45); // 45 minutes
    showQuestion(currentQuestion);
}

function getRandomQuestions(count) {
  let allQuestions = [];
  let questionsPerSection = Math.ceil(count / sections.length); // Distribute questions evenly

  // First, collect questions from all sections
  sections.forEach(section => {
    if (section.questions && section.questions.length > 0) {
      // Get random questions from each section
      let sectionQuestions = [...section.questions];
      shuffleArray(sectionQuestions);
      sectionQuestions = sectionQuestions.slice(0, questionsPerSection);
      allQuestions.push(...sectionQuestions);
    }
  });

  // Shuffle final array
  shuffleArray(allQuestions);
  
  // Trim to requested count
  return allQuestions.slice(0, count);
}

// Add Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startTimer(minutes) {
    let time = minutes * 60;
    timer = setInterval(() => {
        const mins = Math.floor(time / 60);
        const secs = time % 60;
        timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        if (time <= 0) {
            clearInterval(timer);
            alert('Zeit ist abgelaufen!');
            timerDisplay.textContent = '0:00';
        } else {
            time--;
        }
    }, 1000);
}

// Fix practice exam button by adding event listener
document.addEventListener('DOMContentLoaded', () => {
  const practiceExamBtn = document.getElementById('practice-exam-btn');
  if (practiceExamBtn) {
    practiceExamBtn.addEventListener('click', () => {
      console.log('Starting practice exam...'); // Debug log
      startPracticeExam();
    });
  }
});

// Update startPracticeExam to include debug logs
function startPracticeExam() {
  console.log('Initializing exam mode...'); // Debug log
  
  examMode = true;
  correctAnswers = 0;
  examQuestions = getRandomQuestions(50);
  
  console.log(`Got ${examQuestions.length} random questions`); // Debug log
  
  questions = examQuestions;
  currentQuestion = 0;
  
  mainMenu.style.display = 'none';
  quizContainer.style.display = 'block';
  examTimer.style.display = 'block';
  document.getElementById('restart-btn').style.display = 'none'; // Hide restart button
  
  startTimer(45);
  showQuestion(currentQuestion);
}