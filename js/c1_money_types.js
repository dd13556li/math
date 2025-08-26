// =================================================================
// FILE: js/unit1.js (深色主題修正版)
// =================================================================

// 將Game定義為全局變量以支持onclick事件
let Game;

document.addEventListener('DOMContentLoaded', () => {
    Game = {
        // =====================================================
        // 資料
        // =====================================================
        gameData: {
            title: "單元一：認識錢幣和紙鈔",
            items: {
                coins: [
                    { 
                        value: 1, 
                        name: '1元', 
                        images: { 
                            front: 'images/1_yuan_front.png', 
                            back: 'images/1_yuan_back.png' 
                        } 
                    },
                    { 
                        value: 5, 
                        name: '5元', 
                        images: { 
                            front: 'images/5_yuan_front.png', 
                            back: 'images/5_yuan_back.png' 
                        } 
                    },
                    { 
                        value: 10, 
                        name: '10元', 
                        images: { 
                            front: 'images/10_yuan_front.png', 
                            back: 'images/10_yuan_back.png' 
                        } 
                    },
                    { 
                        value: 50, 
                        name: '50元', 
                        images: { 
                            front: 'images/50_yuan_front.png', 
                            back: 'images/50_yuan_back.png' 
                        } 
                    }
                ],
                notes: [
                    { 
                        value: 100, 
                        name: '100元', 
                        images: { 
                            front: 'images/100_yuan_front.png', 
                            back: 'images/100_yuan_back.png' 
                        } 
                    },
                    { 
                        value: 500, 
                        name: '500元', 
                        images: { 
                            front: 'images/500_yuan_front.png', 
                            back: 'images/500_yuan_back.png' 
                        } 
                    },
                    { 
                        value: 1000, 
                        name: '1000元', 
                        images: { 
                            front: 'images/1000_yuan_front.png', 
                            back: 'images/1000_yuan_back.png' 
                        } 
                    }
                ]
            }
        },

        // =====================================================
        // 狀態
        // =====================================================
        state: {
            score: 0,
            totalQuestions: 10,
            currentQuestionIndex: 0,
            quizQuestions: [],
            isAnswering: false,
            settings: { 
                category: null, 
                difficulty: null, 
                mode: null,
                questionCount: 10
            }
        },

        // =====================================================
        // DOM 元素
        // =====================================================
        elements: {},

        // =====================================================
        // 語音
        // =====================================================
        speech: {
            synth: window.speechSynthesis,
            voice: null,
            isReady: false,

            init() {
                const setVoice = () => {
                    const voices = this.synth.getVoices();
                    if (voices.length === 0) return;
                    
                    const preferredVoices = [
                        'Microsoft HsiaoChen Online', 
                        'Google 國語 (臺灣)'
                    ];
                    
                    this.voice = voices.find(v => preferredVoices.includes(v.name));
                    
                    if (!this.voice) {
                        const otherTWVoices = voices.filter(v => 
                            v.lang === 'zh-TW' && !v.name.includes('Hanhan')
                        );
                        if (otherTWVoices.length > 0) { 
                            this.voice = otherTWVoices[0]; 
                        }
                    }
                    
                    if (!this.voice) { 
                        this.voice = voices.find(v => v.lang === 'zh-TW'); 
                    }
                    
                    if (this.voice) {
                        this.isReady = true;
                        console.log(`語音已就緒: ${this.voice.name}`);
                        this.synth.onvoiceschanged = null;
                    }
                };
                
                this.synth.onvoiceschanged = setVoice;
                setVoice();
            }
        },

        // =====================================================
        // 初始化
        // =====================================================
        init() {
            this.speech.init();
            this.initAudio();
            this.showSettings();
        },

        // =====================================================
        // 設定畫面 (採用unit6樣式結構)
        // =====================================================
        showSettings() {
            const app = document.getElementById('app');
            const settings = this.state.settings;
            
            app.innerHTML = `
                <div class="unit-welcome">
                    <div class="welcome-content">
                        <h1>${this.gameData.title}</h1>
                        
                        <div class="game-settings">
                            <div class="setting-group">
                                <label>🎯 難度選擇：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${settings.difficulty === 'easy' ? 'active' : ''}" 
                                            data-type="difficulty" data-value="easy">
                                        簡單 (看圖選圖)
                                    </button>
                                    <button class="selection-btn ${settings.difficulty === 'normal' ? 'active' : ''}" 
                                            data-type="difficulty" data-value="normal">
                                        普通 (看字選圖)
                                    </button>
                                    <button class="selection-btn ${settings.difficulty === 'hard' ? 'active' : ''}" 
                                            data-type="difficulty" data-value="hard">
                                        困難 (聽音選圖)
                                    </button>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>💰 幣值選擇：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${settings.category === 'coins' ? 'active' : ''}" 
                                            data-type="category" data-value="coins">
                                        硬幣
                                    </button>
                                    <button class="selection-btn ${settings.category === 'notes' ? 'active' : ''}" 
                                            data-type="category" data-value="notes">
                                        紙鈔
                                    </button>
                                    <button class="selection-btn ${settings.category === 'mixed' ? 'active' : ''}" 
                                            data-type="category" data-value="mixed">
                                        混合
                                    </button>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>🎲 題目設定：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${settings.questionCount === 5 ? 'active' : ''}" 
                                            data-type="questions" data-value="5">
                                        5題
                                    </button>
                                    <button class="selection-btn ${settings.questionCount === 10 ? 'active' : ''}" 
                                            data-type="questions" data-value="10">
                                        10題
                                    </button>
                                    <button class="selection-btn ${settings.questionCount === 15 ? 'active' : ''}" 
                                            data-type="questions" data-value="15">
                                        15題
                                    </button>
                                    <button class="selection-btn ${settings.questionCount === 20 ? 'active' : ''}" 
                                            data-type="questions" data-value="20">
                                        20題
                                    </button>
                                    <button class="selection-btn ${settings.questionCount === 'custom' ? 'active' : ''}" 
                                            data-type="questions" data-value="custom">
                                        自訂
                                    </button>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>📋 測驗模式：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${settings.mode === 'retry' ? 'active' : ''}" 
                                            data-type="mode" data-value="retry">
                                        反複作答
                                    </button>
                                    <button class="selection-btn ${settings.mode === 'proceed' ? 'active' : ''}" 
                                            data-type="mode" data-value="proceed">
                                        單次作答
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="game-buttons">
                            <button class="back-btn" onclick="window.location.href='index.html'">
                                返回主選單
                            </button>
                            <button id="start-quiz-btn" class="start-btn" disabled>
                                請完成所有選擇
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // 使用事件委派方式處理所有設定按鈕
            const gameSettings = app.querySelector('.game-settings');
            gameSettings.addEventListener('click', this.handleSelection.bind(this));
            
            const startBtn = app.querySelector('#start-quiz-btn');
            startBtn.addEventListener('click', this.start.bind(this));
        },

        handleSelection(event) {
            const btn = event.target.closest('.selection-btn');
            if (!btn) return;

            const { type, value } = btn.dataset;
            
            // 播放選單選擇音效
            this.playMenuSelectSound();
            
            // 處理題目設定選項
            if (type === 'questions') {
                if (value === 'custom') {
                    this.showCustomQuestionInput();
                    return;
                } else {
                    this.state.settings.questionCount = parseInt(value);
                    this.state.totalQuestions = parseInt(value);
                    this.hideCustomQuestionInput();
                }
            } else {
                this.state.settings[type] = value;
            }

            // 更新同組按鈕的active狀態
            const buttonGroup = btn.closest('.button-group');
            buttonGroup.querySelectorAll('.selection-btn')
                .forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 檢查是否所有必要設定都已完成
            this.updateStartButton();
        },

        // 初始化音效
        initAudio() {
            try {
                this.menuSelectAudio = new Audio('audio/menu-select.mp3');
                this.menuSelectAudio.volume = 0.5;
                this.menuSelectAudio.preload = 'auto';
            } catch (error) {
                console.log('無法載入選單音效:', error);
            }
        },

        // 播放選單選擇音效
        playMenuSelectSound() {
            try {
                if (this.menuSelectAudio) {
                    this.menuSelectAudio.currentTime = 0;
                    this.menuSelectAudio.play().catch(e => {
                        console.log('音效播放失敗:', e);
                    });
                }
            } catch (error) {
                console.log('無法播放選單音效:', error);
            }
        },

        // 顯示自訂題目數量輸入框
        showCustomQuestionInput() {
            this.showNumberInput('請輸入題目數量', (value) => {
                const questionCount = parseInt(value);
                if (isNaN(questionCount) || questionCount < 1 || questionCount > 100) {
                    alert('請輸入 1-100 之間的有效數字');
                    return false;
                }
                
                this.state.settings.questionCount = questionCount;
                this.state.totalQuestions = questionCount;
                
                // 更新active狀態
                const customBtn = document.querySelector('[data-value="custom"]');
                if (customBtn) {
                    const buttonGroup = customBtn.closest('.button-group');
                    buttonGroup.querySelectorAll('.selection-btn')
                        .forEach(b => b.classList.remove('active'));
                    customBtn.classList.add('active');
                }
                
                // 檢查是否可以開始遊戲
                this.updateStartButton();
                
                alert(`已設定測驗題數為 ${questionCount} 題`);
                return true;
            });
        },

        // 隱藏自訂題目數量輸入框
        hideCustomQuestionInput() {
            // 不再需要隱藏，因為使用彈出式數字選擇器
        },

        // 更新開始按鈕狀態
        updateStartButton() {
            const { category, difficulty, mode, questionCount } = this.state.settings;
            const startBtn = document.getElementById('start-quiz-btn');
            
            if (category && difficulty && mode && questionCount) {
                startBtn.disabled = false;
                startBtn.textContent = '開始測驗！';
                startBtn.classList.remove('disabled');
            } else {
                startBtn.disabled = true;
                startBtn.textContent = '請完成所有選擇';
                startBtn.classList.add('disabled');
            }
        },

        // =====================================================
        // 遊戲流程
        // =====================================================
        start() {
            this.state.score = 0;
            this.state.currentQuestionIndex = 0;
            this.generateQuestions();
            this.setupQuizUI();
            this.loadNextQuestion();
        },

        setupQuizUI() {
            const gameContainer = document.getElementById('app');
            gameContainer.innerHTML = `
                <div class="store-layout">
                    <div class="title-bar">
                        <div class="title-bar-left">
                            <div class="progress-info">第 1 / ${this.state.totalQuestions} 題</div>
                        </div>
                        <div class="title-bar-center">
                            <div class="target-amount">認識錢幣和紙鈔</div>
                        </div>
                        <div class="title-bar-right">
                            <div class="score-info">分數: 0 分</div>
                            <button id="back-to-menu-btn" class="back-to-menu-btn">返回主選單</button>
                        </div>
                    </div>
                    
                    <div class="unified-task-frame">
                        <div id="question-area" class="task-description"></div>
                        <div id="feedback-area" class="answer-feedback-area" style="display: none; text-align: center; padding: 20px;"></div>
                        <h3 id="options-title" class="section-title" style="display: none;">請選擇正確答案</h3>
                        <div id="options-area" class="product-selection-area"></div>
                    </div>
                </div>
            `;
            
            this.elements.questionArea = document.getElementById('question-area');
            this.elements.optionsArea = document.getElementById('options-area');
            this.elements.feedbackArea = document.getElementById('feedback-area');
            
            // 綁定返回主選單按鈕事件
            const backBtn = document.querySelector('#back-to-menu-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    window.location.href = 'index.html';
                });
            }
        },

        loadNextQuestion() {
            this.state.isAnswering = false;
            
            if (this.state.currentQuestionIndex >= this.state.totalQuestions) {
                this.endGame();
                return;
            }

            const question = this.state.quizQuestions[this.state.currentQuestionIndex];
            this.state.currentQuestionIndex++;
            
            this.updateProgress();
            this.elements.optionsArea.innerHTML = '';
            this.elements.feedbackArea.innerHTML = '';
            this.elements.feedbackArea.style.display = 'none';
            
            // 隱藏選項標題
            const optionsTitle = document.getElementById('options-title');
            if (optionsTitle) {
                optionsTitle.style.display = 'none';
            }
            
            // 確保清除之前的中央回饋
            this.hideCenterFeedback();

            const { difficulty } = this.state.settings;
            const questionText = `請找出 ${question.answer.name}`;
            const questionImage = this.getRandomImage(question.answer);

            switch (difficulty) {
                case 'easy':
                    this.elements.questionArea.innerHTML = `
                        <h2 class="section-title">請找出相同的錢幣/紙鈔</h2>
                        <div class="target-item-display">
                            <img src="${questionImage}" alt="題目" class="target-money-img">
                        </div>
                    `;
                    break;
                case 'normal':
                    this.elements.questionArea.innerHTML = `
                        <h2 class="section-title">請找出以下錢幣/紙鈔</h2>
                        <div class="target-item-display">
                            <div class="item-details">
                                <div class="item-name">${question.answer.name}</div>
                            </div>
                        </div>
                    `;
                    break;
                case 'hard':
                    this.elements.questionArea.innerHTML = `
                        <h2 class="section-title">請聽音找出錢幣/紙鈔</h2>
                        <div class="target-item-display">
                            <svg id="replay-audio-btn" class="replay-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
                            </svg>
                            <p class="target-hint">點擊播放按鈕聽題目</p>
                        </div>
                    `;
                    document.getElementById('replay-audio-btn').addEventListener('click', () => {
                        this.speak(questionText);
                    });
                    break;
            }
            
            this.speak(questionText, () => {
                this.renderOptions(question.options, questionImage, question.answer);
            });
        },

        generateQuestions() {
            const { category } = this.state.settings;
            let sourceData;
            
            if (category === 'mixed') {
                sourceData = [...this.gameData.items.coins, ...this.gameData.items.notes];
            } else {
                sourceData = this.gameData.items[category];
            }
            
            this.state.quizQuestions = [];
            
            for (let i = 0; i < this.state.totalQuestions; i++) {
                const allItems = [...sourceData];
                const correctItem = allItems.splice(
                    Math.floor(Math.random() * allItems.length), 1
                )[0];
                
                let options = [correctItem];
                
                while (options.length < 3 && allItems.length > 0) {
                    const wrongOption = allItems.splice(
                        Math.floor(Math.random() * allItems.length), 1
                    )[0];
                    
                    if (!options.some(opt => opt.value === wrongOption.value)) {
                        options.push(wrongOption);
                    }
                }
                
                this.state.quizQuestions.push({
                    answer: correctItem,
                    options: this.shuffleArray(options)
                });
            }
        },

        renderOptions(options, questionImage, correctAnswer) {
            // 顯示選項標題
            const optionsTitle = document.getElementById('options-title');
            if (optionsTitle) {
                optionsTitle.style.display = 'block';
            }
            
            this.elements.optionsArea.innerHTML = `
                <div class="products-grid horizontal-layout"></div>
            `;
            const productsGrid = this.elements.optionsArea.querySelector('.products-grid');
            
            options.forEach(option => {
                const button = document.createElement('div');
                button.className = 'product-item';
                button.dataset.value = option.value;
                button.setAttribute('tabindex', '0');
                button.setAttribute('role', 'button');
                
                let optionImageSrc;
                if (this.state.settings.difficulty === 'easy' && 
                    option.value === correctAnswer.value) {
                    optionImageSrc = questionImage;
                } else {
                    optionImageSrc = this.getRandomImage(option);
                }
                
                button.innerHTML = `
                    <img src="${optionImageSrc}" alt="${option.name}">
                    <div class="product-info">
                        <div class="product-name">${option.name}</div>
                    </div>
                `;
                
                button.addEventListener('click', (e) => this.checkAnswer(e, correctAnswer));
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.checkAnswer(e, correctAnswer);
                    }
                });

                const speakOptionName = () => {
                    if (this.state.isAnswering) return;
                    this.speak(option.name);
                };

                button.addEventListener('mouseenter', speakOptionName);
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    speakOptionName();
                }, { passive: false });

                productsGrid.appendChild(button);
            });
        },

        checkAnswer(event, correctAnswer) {
            this.state.isAnswering = true;
            const selectedBtn = event.currentTarget;
            const selectedValue = parseInt(selectedBtn.dataset.value, 10);
            const isCorrect = selectedValue === correctAnswer.value;
            const { mode } = this.state.settings;

            this.elements.optionsArea.querySelectorAll('.product-item')
                .forEach(btn => btn.style.pointerEvents = 'none');

            if (isCorrect) {
                this.state.score++;
                selectedBtn.classList.add('selected');
                
                // 顯示答對圖示（正方形，視窗正中央）
                this.showCenterFeedback('🎉', '#4CAF50', '答對了！');
                document.getElementById('correct-sound')?.play();
                
                this.speak('答對了', () => 
                    setTimeout(() => {
                        this.hideCenterFeedback();
                        this.loadNextQuestion();
                    }, 1200)
                );
            } else {
                selectedBtn.classList.add('incorrect-selection');
                document.getElementById('error-sound')?.play();
                
                setTimeout(() => {
                    if (mode === 'retry') {
                        this.showCenterFeedback('❌', '#f44336', '答錯了，再試一次！');
                        
                        this.speak('答錯了，再試一次', () => {
                            setTimeout(() => {
                                selectedBtn.classList.remove('incorrect-selection');
                                this.hideCenterFeedback();
                                this.elements.optionsArea.querySelectorAll('.product-item')
                                    .forEach(btn => btn.style.pointerEvents = 'auto');
                                this.state.isAnswering = false;
                            }, 1500);
                        });
                    } else {
                        const correctBtn = this.elements.optionsArea
                            .querySelector(`[data-value="${correctAnswer.value}"]`);
                        
                        if (correctBtn) correctBtn.classList.add('selected');
                        
                        const feedbackText = `答錯了，正確答案是 ${correctAnswer.name}`;
                        this.showCenterFeedback('❌', '#f44336', feedbackText);
                        
                        this.speak(feedbackText, () => 
                            setTimeout(() => {
                                this.hideCenterFeedback();
                                this.loadNextQuestion();
                            }, 2000)
                        );
                    }
                }, 200);
            }
        },

        // 顯示視窗正中央的回饋圖示（正方形）
        showCenterFeedback(icon, color, text) {
            // 移除舊的回饋元素
            this.hideCenterFeedback();
            
            // 創建新的回饋元素
            const feedbackDiv = document.createElement('div');
            feedbackDiv.id = 'center-feedback';
            feedbackDiv.innerHTML = `
                <div class="center-feedback-content">
                    <div class="feedback-icon">${icon}</div>
                    <div class="feedback-text">${text}</div>
                </div>
            `;
            
            document.body.appendChild(feedbackDiv);
        },

        // 隱藏視窗正中央的回饋圖示
        hideCenterFeedback() {
            const existingFeedback = document.getElementById('center-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }
        },

        // =====================================================
        // 通用工具函式
        // =====================================================
        updateProgress() {
            const progressInfo = document.querySelector('.progress-info');
            const scoreInfo = document.querySelector('.score-info');
            if (progressInfo) {
                progressInfo.textContent = `第 ${this.state.currentQuestionIndex} / ${this.state.totalQuestions} 題`;
            }
            if (scoreInfo) {
                scoreInfo.textContent = `分數: ${this.state.score * 10} 分`;
            }
        },

        endGame() {
            const gameContainer = document.getElementById('app');
            const correctCount = this.state.score;
            const scoreInPoints = correctCount * 10;
            const totalQuestions = this.state.totalQuestions;
            const percentage = Math.round((correctCount / totalQuestions) * 100);
            
            let performanceMessage = '';
            let performanceIcon = '';
            if (percentage >= 90) {
                performanceMessage = '表現優異！';
                performanceIcon = '🏆';
            } else if (percentage >= 70) {
                performanceMessage = '表現良好！';
                performanceIcon = '👍';
            } else if (percentage >= 50) {
                performanceMessage = '還需努力！';
                performanceIcon = '💪';
            } else {
                performanceMessage = '多加練習！';
                performanceIcon = '📚';
            }

            gameContainer.innerHTML = `
                <div class="game-complete">
                    <div class="result-card">
                        <div class="results-header">
                            <div class="trophy-icon">${performanceIcon}</div>
                            <h1>🎉 測驗結束 🎉</h1>
                            <div class="achievement-message">
                                <p><strong>${performanceMessage}</strong></p>
                            </div>
                        </div>
                        
                        <div class="final-stats">
                            <div class="stat-item">
                                <span class="stat-label">答對題數</span>
                                <span class="stat-value">${correctCount} / ${totalQuestions}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">總分</span>
                                <span class="stat-value">${scoreInPoints} 分</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">正確率</span>
                                <span class="stat-value">${percentage}%</span>
                            </div>
                        </div>
                        
                        <div class="action-buttons">
                            <button class="primary-btn" onclick="location.reload()">
                                🔄 再玩一次
                            </button>
                            <button class="secondary-btn" onclick="window.location.href='index.html'">
                                🏠 返回主選單
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // 播放成功音效和語音
            setTimeout(() => {
                document.getElementById('success-sound')?.play();
                this.triggerConfetti();
                
                let finalText = '';
                if (percentage === 100) {
                    finalText = `太厲害了，你全部答對了，恭喜你得到${scoreInPoints}分！`;
                } else if (percentage >= 80) {
                    finalText = `很棒喔，你總共答對了${correctCount}題，恭喜你得到了${scoreInPoints}分。`;
                } else if (percentage >= 60) {
                    finalText = `不錯喔，你總共答對了${correctCount}題，恭喜你得到了${scoreInPoints}分。`;
                } else {
                    finalText = `要再加油喔，你總共答對了${correctCount}題，你得到了${scoreInPoints}分。`;
                }
                this.speak(finalText);
            }, 100);
        },

        triggerConfetti() {
            if (typeof confetti !== 'function') return;
            
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { 
                startVelocity: 30, 
                spread: 360, 
                ticks: 60, 
                zIndex: 1001 
            };
            const randomInRange = (min, max) => Math.random() * (max - min) + min;
            
            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                
                const particleCount = 50 * (timeLeft / duration);
                confetti({ 
                    ...defaults, 
                    particleCount, 
                    origin: { 
                        x: randomInRange(0.1, 0.3), 
                        y: Math.random() - 0.2 
                    } 
                });
                confetti({ 
                    ...defaults, 
                    particleCount, 
                    origin: { 
                        x: randomInRange(0.7, 0.9), 
                        y: Math.random() - 0.2 
                    } 
                });
            }, 250);
        },

        speak(text, callback) {
            if (!this.speech.isReady || !text) {
                if (callback) callback();
                return;
            }
            
            this.speech.synth.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = this.speech.voice;
            utterance.lang = this.speech.voice.lang;
            utterance.rate = 1.0;
            
            if (callback) {
                utterance.onend = callback;
            }
            
            this.speech.synth.speak(utterance);
        },

        getRandomImage(item) {
            if (!item.images || !item.images.front || !item.images.back) {
                return item.img || '';
            }
            return Math.random() < 0.5 ? item.images.front : item.images.back;
        },

        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },

        // 數字選擇器系統（採用unit2樣式）
        showNumberInput(title, callback) {
            // 檢查是否已存在數字輸入器
            if (document.getElementById('number-input-popup')) {
                return;
            }

            this.numberInputCallback = callback;
            
            const inputPopupHTML = `
                <div id="number-input-popup" class="number-input-popup">
                    <div class="number-input-container">
                        <div class="number-input-header">
                            <h3>${title}</h3>
                            <button class="close-btn" onclick="Game.closeNumberInput()">×</button>
                        </div>
                        <div class="number-input-display">
                            <input type="text" id="number-display" readonly value="">
                        </div>
                        <div class="number-input-buttons">
                            <button onclick="Game.appendNumber('1')">1</button>
                            <button onclick="Game.appendNumber('2')">2</button>
                            <button onclick="Game.appendNumber('3')">3</button>
                            <button onclick="Game.clearNumber()" class="clear-btn">清除</button>
                            
                            <button onclick="Game.appendNumber('4')">4</button>
                            <button onclick="Game.appendNumber('5')">5</button>
                            <button onclick="Game.appendNumber('6')">6</button>
                            <button onclick="Game.backspaceNumber()" class="backspace-btn">⌫</button>
                            
                            <button onclick="Game.appendNumber('7')">7</button>
                            <button onclick="Game.appendNumber('8')">8</button>
                            <button onclick="Game.appendNumber('9')">9</button>
                            <button onclick="Game.confirmNumber()" class="confirm-btn">確認</button>
                            
                            <button onclick="Game.appendNumber('0')" class="zero-btn">0</button>
                        </div>
                    </div>
                </div>
            `;

            // 添加數字輸入器樣式
            const inputStyles = `
                <style id="number-input-styles">
                    .number-input-popup {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.7);
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        padding-top: 200px;
                        z-index: 10000;
                        animation: fadeIn 0.3s ease-out;
                    }

                    .number-input-container {
                        background: white;
                        border-radius: 15px;
                        padding: 20px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                        width: 320px;
                        max-width: 95vw;
                        animation: bounceIn 0.3s ease-out;
                    }

                    .number-input-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #f0f0f0;
                        padding-bottom: 10px;
                    }

                    .number-input-header h3 {
                        margin: 0;
                        color: #333;
                        font-size: 18px;
                    }

                    .close-btn {
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .close-btn:hover {
                        background: #f0f0f0;
                    }

                    .number-input-display {
                        margin-bottom: 20px;
                    }

                    #number-display {
                        width: 100%;
                        border: 2px solid #ddd;
                        padding: 15px;
                        font-size: 24px;
                        text-align: center;
                        border-radius: 8px;
                        background: #f9f9f9;
                        font-family: 'Courier New', monospace;
                        box-sizing: border-box;
                    }

                    .number-input-buttons {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 10px;
                    }

                    .number-input-buttons button {
                        padding: 15px;
                        font-size: 18px;
                        font-weight: bold;
                        border: 2px solid #ddd;
                        border-radius: 8px;
                        background: white;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .number-input-buttons button:hover {
                        background: #f0f0f0;
                        transform: translateY(-1px);
                    }

                    .number-input-buttons button:active {
                        transform: translateY(0);
                        background: #e0e0e0;
                    }

                    .number-input-buttons button.clear-btn {
                        background: #ff6b6b !important;
                        color: white !important;
                        border-color: #ff6b6b !important;
                        padding: 15px 8px !important;
                        font-size: 14px !important;
                        width: auto !important;
                        min-width: 60px !important;
                        max-width: 80px !important;
                    }

                    .number-input-buttons button.clear-btn:hover {
                        background: #ff5252 !important;
                    }

                    .number-input-buttons button.backspace-btn {
                        background: #ffa726 !important;
                        color: white !important;
                        border-color: #ffa726 !important;
                        padding: 15px 8px !important;
                        font-size: 16px !important;
                        width: auto !important;
                        min-width: 60px !important;
                        max-width: 80px !important;
                    }

                    .number-input-buttons button.backspace-btn:hover {
                        background: #ff9800 !important;
                    }

                    .number-input-buttons button.confirm-btn {
                        background: #4caf50 !important;
                        color: white !important;
                        border-color: #4caf50 !important;
                        grid-row: span 2;
                        padding: 15px 8px !important;
                        font-size: 14px !important;
                        width: auto !important;
                        min-width: 60px !important;
                        max-width: 80px !important;
                    }

                    .number-input-buttons button.confirm-btn:hover {
                        background: #45a049 !important;
                    }

                    .number-input-buttons button.zero-btn {
                        grid-column: span 3;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes bounceIn {
                        from {
                            opacity: 0;
                            transform: scale(0.3) translateY(-50px);
                        }
                        50% {
                            opacity: 1;
                            transform: scale(1.05) translateY(10px);
                        }
                        70% {
                            transform: scale(0.95) translateY(-5px);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }
                </style>
            `;

            // 添加樣式和彈窗到頁面
            document.head.insertAdjacentHTML('beforeend', inputStyles);
            document.body.insertAdjacentHTML('beforeend', inputPopupHTML);
        },

        // 數字輸入器相關函數
        appendNumber(number) {
            const display = document.getElementById('number-display');
            if (display.value.length < 6) {
                display.value += number;
            }
            
            // 播放點擊音效
            const clickSound = document.getElementById('click-sound');
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play();
            }
        },

        clearNumber() {
            const display = document.getElementById('number-display');
            display.value = '';
            
            // 播放點擊音效
            const clickSound = document.getElementById('click-sound');
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play();
            }
        },

        backspaceNumber() {
            const display = document.getElementById('number-display');
            display.value = display.value.slice(0, -1);
            
            // 播放點擊音效
            const clickSound = document.getElementById('click-sound');
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play();
            }
        },

        confirmNumber() {
            const display = document.getElementById('number-display');
            const inputValue = display.value;
            
            if (this.numberInputCallback) {
                const result = this.numberInputCallback(inputValue);
                if (result !== false) {
                    this.closeNumberInput();
                }
            } else {
                this.closeNumberInput();
            }
        },

        closeNumberInput() {
            const popup = document.getElementById('number-input-popup');
            const styles = document.getElementById('number-input-styles');
            
            if (popup) popup.remove();
            if (styles) styles.remove();
            this.numberInputCallback = null;
        }
    };

    Game.init();
});
