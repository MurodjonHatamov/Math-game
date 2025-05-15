document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlari
    const screens = {
        home: document.getElementById('home-screen'),
        settings: document.getElementById('settings-screen'),
        history: document.getElementById('history-screen'),
        gameMode: document.getElementById('game-mode-screen'),
        difficulty: document.getElementById('difficulty-screen'),
        game: document.getElementById('game-screen'),
        result: document.getElementById('result-screen')
    };
    
    const usernameInput = document.getElementById('username');
    const startBtn = document.getElementById('start-btn');
    const historyBtn = document.getElementById('history-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const backBtn = document.getElementById('back-btn');
    const historyBackBtn = document.getElementById('history-back-btn');
    const modeBackBtn = document.getElementById('mode-back-btn');
    const difficultyBackBtn = document.getElementById('difficulty-back-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const homeBtn = document.getElementById('home-btn');
    
    const gameModes = document.querySelectorAll('.game-mode');
    const difficultyLevels = document.querySelectorAll('.difficulty-level');
    
    const questionElement = document.getElementById('question');
    const optionsContainer = document.getElementById('options');
    const timeElement = document.getElementById('time');
    const scoreElement = document.getElementById('current-score');
    const feedbackElement = document.getElementById('feedback');
    const progressBar = document.getElementById('progress-bar');
    
    const resultUsername = document.getElementById('result-username');
    const resultCorrect = document.getElementById('result-correct');
    const resultScore = document.getElementById('result-score');
    const resultDifficulty = document.getElementById('result-difficulty');
    const resultMode = document.getElementById('result-mode');
    const confettiContainer = document.getElementById('confetti-container');
    
    // Audio elementlari
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');
    const gameMusic = document.getElementById('game-music');
    
    // Sozlamalar elementlari
    const soundToggle = document.getElementById('sound-toggle');
    const musicToggle = document.getElementById('music-toggle');
    const themeSelect = document.getElementById('theme-select');
    
    // O'yin o'zgaruvchilari
    let gameState = {
        username: '',
        gameMode: '',
        difficulty: '',
        score: 0,
        correctAnswers: 0,
        totalQuestions: 10,
        currentQuestion: 0,
        timeLeft: 0,
        timer: null,
        questions: [],
        history: JSON.parse(localStorage.getItem('mathGameHistory')) || []
    };
    
    // Qiyinlik darajalari
    const difficulties = {
        easy: { min: 1, max: 10, time: 60, points: 1 },
        medium: { min: 10, max: 100, time: 45, points: 2 },
        hard: { min: 100, max: 1000, time: 30, points: 3 }
    };
    
    // Sahifalar navigatsiyasi
    function showScreen(screen) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }
    
    startBtn.addEventListener('click', function() {
        if (!usernameInput.value.trim()) {
            usernameInput.focus();
            return;
        }
        gameState.username = usernameInput.value.trim();
        showScreen(screens.gameMode);
    });
    
    historyBtn.addEventListener('click', function() {
        loadHistory();
        showScreen(screens.history);
    });
    
    settingsBtn.addEventListener('click', function() {
        showScreen(screens.settings);
    });
    
    backBtn.addEventListener('click', function() {
        showScreen(screens.home);
    });
    
    historyBackBtn.addEventListener('click', function() {
        showScreen(screens.home);
    });
    
    modeBackBtn.addEventListener('click', function() {
        showScreen(screens.home);
    });
    
    difficultyBackBtn.addEventListener('click', function() {
        showScreen(screens.gameMode);
    });
    
    playAgainBtn.addEventListener('click', function() {
        resetGame();
        showScreen(screens.gameMode);
    });
    
    homeBtn.addEventListener('click', function() {
        resetGame();
        showScreen(screens.home);
    });
    
    // O'yin turini tanlash
    gameModes.forEach(mode => {
        mode.addEventListener('click', function() {
            gameState.gameMode = this.dataset.type;
            showScreen(screens.difficulty);
        });
    });
    
    // Qiyinlik darajasini tanlash
    difficultyLevels.forEach(level => {
        level.addEventListener('click', function() {
            gameState.difficulty = this.dataset.level;
            startGame();
        });
    });
    
    // O'yinni boshlash
    function startGame() {
        gameState.score = 0;
        gameState.correctAnswers = 0;
        gameState.currentQuestion = 0;
        gameState.timeLeft = difficulties[gameState.difficulty].time;
        gameState.questions = [];
        
        // Savollar generatsiyasi
        for (let i = 0; i < gameState.totalQuestions; i++) {
            gameState.questions.push(generateQuestion());
        }
        
        // Taymer
        updateTimerDisplay();
        gameState.timer = setInterval(updateTimer, 1000);
        
        // Musiqa
        if (musicToggle.checked) {
            gameMusic.currentTime = 0;
            gameMusic.play().catch(e => console.log("Audio play failed:", e));
        }
        
        showScreen(screens.game);
        displayQuestion();
    }
    
    // Savol generatsiyasi
    function generateQuestion() {
        const difficulty = difficulties[gameState.difficulty];
        let num1, num2, answer, operator;
        
        switch (gameState.gameMode) {
            case 'addition':
                num1 = getRandomNumber(difficulty.min, difficulty.max);
                num2 = getRandomNumber(difficulty.min, difficulty.max);
                answer = num1 + num2;
                operator = '+';
                break;
            case 'subtraction':
                num1 = getRandomNumber(difficulty.min, difficulty.max);
                num2 = getRandomNumber(difficulty.min, num1);
                answer = num1 - num2;
                operator = '-';
                break;
            case 'multiplication':
                num1 = getRandomNumber(1, Math.min(20, difficulty.max));
                num2 = getRandomNumber(1, Math.min(20, difficulty.max));
                answer = num1 * num2;
                operator = '×';
                break;
            case 'division':
                num2 = getRandomNumber(1, Math.min(20, difficulty.max));
                answer = getRandomNumber(1, Math.min(20, difficulty.max));
                num1 = num2 * answer;
                operator = '÷';
                break;
            case 'mixed':
                const modes = ['addition', 'subtraction', 'multiplication', 'division'];
                const randomMode = modes[Math.floor(Math.random() * modes.length)];
                const mixedQuestion = generateMixedQuestion(randomMode, difficulty);
                return mixedQuestion;
        }
        
        // Variantlar generatsiyasi
        let options = [answer];
        while (options.length < 4) {
            let randomAnswer;
            if (gameState.gameMode === 'multiplication' || gameState.gameMode === 'division') {
                randomAnswer = getRandomNumber(answer - 5, answer + 5);
            } else {
                randomAnswer = getRandomNumber(answer - 10, answer + 10);
            }
            
            if (randomAnswer !== answer && !options.includes(randomAnswer) && randomAnswer > 0) {
                options.push(randomAnswer);
            }
        }
        
        // Variantlarni aralashtirish
        options = shuffleArray(options);
        
        return {
            question: `${num1} ${operator} ${num2}`,
            answer: answer,
            options: options,
            type: gameState.gameMode
        };
    }
    
    function generateMixedQuestion(mode, difficulty) {
        let num1, num2, answer, operator;
        
        switch (mode) {
            case 'addition':
                num1 = getRandomNumber(difficulty.min, difficulty.max);
                num2 = getRandomNumber(difficulty.min, difficulty.max);
                answer = num1 + num2;
                operator = '+';
                break;
            case 'subtraction':
                num1 = getRandomNumber(difficulty.min, difficulty.max);
                num2 = getRandomNumber(difficulty.min, num1);
                answer = num1 - num2;
                operator = '-';
                break;
            case 'multiplication':
                num1 = getRandomNumber(1, Math.min(20, difficulty.max));
                num2 = getRandomNumber(1, Math.min(20, difficulty.max));
                answer = num1 * num2;
                operator = '×';
                break;
            case 'division':
                num2 = getRandomNumber(1, Math.min(20, difficulty.max));
                answer = getRandomNumber(1, Math.min(20, difficulty.max));
                num1 = num2 * answer;
                operator = '÷';
                break;
        }
        
        // Variantlar generatsiyasi
        let options = [answer];
        while (options.length < 4) {
            let randomAnswer;
            if (mode === 'multiplication' || mode === 'division') {
                randomAnswer = getRandomNumber(answer - 5, answer + 5);
            } else {
                randomAnswer = getRandomNumber(answer - 10, answer + 10);
            }
            
            if (randomAnswer !== answer && !options.includes(randomAnswer) && randomAnswer > 0) {
                options.push(randomAnswer);
            }
        }
        
        // Variantlarni aralashtirish
        options = shuffleArray(options);
        
        return {
            question: `${num1} ${operator} ${num2}`,
            answer: answer,
            options: options,
            type: mode
        };
    }
    
    // Tasodifiy son generatsiyasi
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Massivni aralashtirish
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Savolni ko'rsatish
    function displayQuestion() {
        if (gameState.currentQuestion >= gameState.totalQuestions) {
            endGame();
            return;
        }
        
        const question = gameState.questions[gameState.currentQuestion];
        questionElement.textContent = question.question;
        
        // Progress bar
        progressBar.style.width = `${(gameState.currentQuestion / gameState.totalQuestions) * 100}%`;
        
        // Variantlarni ko'rsatish
        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.dataset.value = option;
            optionElement.addEventListener('click', checkAnswer);
            optionsContainer.appendChild(optionElement);
        });
    }
    
    // Javobni tekshirish
    function checkAnswer(e) {
        const selectedOption = e.target;
        const selectedValue = parseInt(selectedOption.dataset.value);
        const correctAnswer = gameState.questions[gameState.currentQuestion].answer;
        
        // Barcha variantlarni noaktiv qilish
        document.querySelectorAll('.option').forEach(option => {
            option.style.pointerEvents = 'none';
        });
        
        if (selectedValue === correctAnswer) {
            // To'g'ri javob
            selectedOption.classList.add('correct');
            feedbackElement.textContent = 'Toʻgʻri!';
            feedbackElement.style.color = '#4CAF50';
            
            if (soundToggle.checked) {
                correctSound.currentTime = 0;
                correctSound.play().catch(e => console.log("Audio play failed:", e));
            }
            
            gameState.correctAnswers++;
            gameState.score += difficulties[gameState.difficulty].points;
            scoreElement.textContent = gameState.score;
        } else {
            // Noto'g'ri javob
            selectedOption.classList.add('wrong');
            feedbackElement.textContent = `Notoʻgʻri! Toʻgʻri javob: ${correctAnswer}`;
            feedbackElement.style.color = '#F44336';
            
            if (soundToggle.checked) {
                wrongSound.currentTime = 0;
                wrongSound.play().catch(e => console.log("Audio play failed:", e));
            }
            
            // To'g'ri javobni ko'rsatish
            document.querySelectorAll('.option').forEach(option => {
                if (parseInt(option.dataset.value) === correctAnswer) {
                    option.classList.add('correct');
                }
            });
        }
        
        // Keyingi savolga o'tish
        gameState.currentQuestion++;
        setTimeout(() => {
            feedbackElement.textContent = '';
            displayQuestion();
        }, 1500);
    }
    
    // Taymer
    function updateTimer() {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            endGame();
        }
    }
    
    function updateTimerDisplay() {
        timeElement.textContent = gameState.timeLeft;
        
        // Taymer rangini o'zgartirish
        if (gameState.timeLeft <= 10) {
            timeElement.style.color = '#F44336';
        } else if (gameState.timeLeft <= 20) {
            timeElement.style.color = '#FF9800';
        } else {
            timeElement.style.color = 'white';
        }
    }
    
    // O'yinni tugatish
    function endGame() {
        clearInterval(gameState.timer);
        gameMusic.pause();
        
        // Natijalarni ko'rsatish
        resultUsername.textContent = gameState.username;
        resultCorrect.textContent = `${gameState.correctAnswers} / ${gameState.totalQuestions}`;
        resultScore.textContent = gameState.score;
        resultDifficulty.textContent = getDifficultyName(gameState.difficulty);
        resultMode.textContent = getModeName(gameState.gameMode);
        
        // Tarixga yozish
        saveGameResult();
        
        // Konfetti animatsiyasi (agar yaxshi natija bo'lsa)
        if (gameState.correctAnswers / gameState.totalQuestions >= 0.7) {
            createConfetti();
        }
        
        showScreen(screens.result);
    }
    
    // Qiyinlik darajasini nomini olish
    function getDifficultyName(difficulty) {
        switch (difficulty) {
            case 'easy': return 'Oson';
            case 'medium': return 'Oʻrta';
            case 'hard': return 'Qiyin';
            default: return difficulty;
        }
    }
    
    // O'yin turini nomini olish
    function getModeName(mode) {
        switch (mode) {
            case 'addition': return 'Qoʻshish';
            case 'subtraction': return 'Ayirish';
            case 'multiplication': return 'Koʻpaytirish';
            case 'division': return 'Boʻlish';
            case 'mixed': return 'Aralash';
            default: return mode;
        }
    }
    
    // O'yin natijasini saqlash
    function saveGameResult() {
        const gameResult = {
            username: gameState.username,
            date: new Date().toLocaleString(),
            correctAnswers: gameState.correctAnswers,
            totalQuestions: gameState.totalQuestions,
            score: gameState.score,
            difficulty: gameState.difficulty,
            mode: gameState.gameMode
        };
        
        gameState.history.unshift(gameResult);
        
        // Faqat oxirgi 50 ta natijani saqlash
        if (gameState.history.length > 50) {
            gameState.history = gameState.history.slice(0, 50);
        }
        
        localStorage.setItem('mathGameHistory', JSON.stringify(gameState.history));
    }
    
    // Tarixni yuklash
    function loadHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        if (gameState.history.length === 0) {
            historyList.innerHTML = '<p>Tarixda hech qanday natija mavjud emas</p>';
            return;
        }
        
        gameState.history.forEach(result => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            historyItem.innerHTML = `
                <div><strong>Foydalanuvchi:</strong> ${result.username}</div>
                <div><strong>Sana:</strong> ${result.date}</div>
                <div><strong>Natija:</strong> ${result.correctAnswers}/${result.totalQuestions}</div>
                <div><strong>Ball:</strong> ${result.score}</div>
                <div><strong>Qiyinlik:</strong> ${getDifficultyName(result.difficulty)}</div>
                <div><strong>Tur:</strong> ${getModeName(result.mode)}</div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }
    
    // Konfetti animatsiyasi
    function createConfetti() {
        confettiContainer.innerHTML = '';
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            confettiContainer.appendChild(confetti);
        }
    }
    
    // O'yinni qayta boshlash
    function resetGame() {
        clearInterval(gameState.timer);
        gameMusic.pause();
        confettiContainer.innerHTML = '';
    }
    
    // Sozlamalar
    soundToggle.addEventListener('change', function() {
        localStorage.setItem('mathGameSound', this.checked);
    });
    
    musicToggle.addEventListener('change', function() {
        localStorage.setItem('mathGameMusic', this.checked);
        if (!this.checked) {
            gameMusic.pause();
        }
    });
    
    themeSelect.addEventListener('change', function() {
        document.body.className = '';
        document.body.classList.add(`${this.value}-theme`);
        localStorage.setItem('mathGameTheme', this.value);
    });
    
    // Sozlamalarni yuklash
    function loadSettings() {
        const soundSetting = localStorage.getItem('mathGameSound');
        if (soundSetting !== null) {
            soundToggle.checked = soundSetting === 'true';
        }
        
        const musicSetting = localStorage.getItem('mathGameMusic');
        if (musicSetting !== null) {
            musicToggle.checked = musicSetting === 'true';
        }
        
        const themeSetting = localStorage.getItem('mathGameTheme');
        if (themeSetting) {
            themeSelect.value = themeSetting;
            document.body.classList.add(`${themeSetting}-theme`);
        }
    }
    
    // Dasturni ishga tushirish
    loadSettings();
    
    // Enter tugmasi bilan o'yinni boshlash
    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            startBtn.click();
        }
    });
});