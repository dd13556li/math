// =================================================================
// FILE: js/unit2.js (深色主題修正版)
// =================================================================

// 將Game定義為全局變量以支持onclick事件
let Game;

document.addEventListener('DOMContentLoaded', () => {
    Game = {
        // =====================================================
        // 資料
        // =====================================================
        gameData: {
            title: "單元二：點數錢幣和紙鈔",
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
                selectedItems: [],
                questionCount: 10
            },
            runningTotal: 0,
            itemsToCount: 0,
            countedItems: 0,
            correctTotal: 0
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
        // 設定畫面 (加入深色主題)
        // =====================================================
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
                                        簡單 (AI幫你數-自動判斷)
                                    </button>
                                    <button class="selection-btn ${settings.difficulty === 'normal' ? 'active' : ''}" 
                                            data-type="difficulty" data-value="normal">
                                        普通 (AI幫你數-選擇題)
                                    </button>
                                    <button class="selection-btn ${settings.difficulty === 'hard' ? 'active' : ''}" 
                                            data-type="difficulty" data-value="hard">
                                        困難 (自己數-輸入數字)
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
                            
                            <div id="item-selection-group" class="setting-group" style="display: none;">
                                <label>🔢 選擇要數的錢 (可多選)：</label>
                                <div id="item-selection" class="button-group">
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

        handleSelection(event) {
            // 🔓 解鎖手機音頻播放權限
            if (window.AudioUnlocker && !window.AudioUnlocker.isUnlocked) {
                window.AudioUnlocker.unlock();
            }
            
            const btn = event.target.closest('.selection-btn');
            if (!btn) return;

            const { type, value } = btn.dataset;
            
            // 播放選單選擇音效
            this.playMenuSelectSound();
            
            const settings = this.state.settings;
            
            // 處理題目設定選項
            if (type === 'questions') {
                if (value === 'custom') {
                    this.showCustomQuestionInput();
                    return;
                } else {
                    settings.questionCount = parseInt(value);
                    this.state.totalQuestions = parseInt(value);
                    this.hideCustomQuestionInput();
                }
            } else if (type === 'category' || type === 'difficulty' || type === 'mode') {
                settings[type] = value;
                
                // 如果選擇幣值，顯示錢幣選擇
                if (type === 'category' && value) {
                    this.showItemSelection();
                }
            } else if (type === 'selectedItem') {
                const numValue = parseInt(value, 10);
                const index = settings.selectedItems.indexOf(numValue);
                
                if (index > -1) {
                    settings.selectedItems.splice(index, 1);
                    btn.classList.remove('active');
                } else {
                    settings.selectedItems.push(numValue);
                    btn.classList.add('active');
                }
                this.updateStartButton();
                return;
            }

            // 更新同組按鈕的active狀態
            const buttonGroup = btn.closest('.button-group');
            buttonGroup.querySelectorAll('.selection-btn')
                .forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 檢查是否所有必要設定都已完成
            this.updateStartButton();
        },

        showItemSelection() {
            const category = this.state.settings.category;
            if (!category) return;

            const itemSelectionGroup = document.getElementById('item-selection-group');
            const itemContainer = document.getElementById('item-selection');
            
            // 清空之前的選項
            itemContainer.innerHTML = '';
            this.state.settings.selectedItems = [];

            const items = (category === 'mixed')
                ? [...this.gameData.items.coins, ...this.gameData.items.notes]
                : this.gameData.items[category];

            items.forEach(item => {
                const button = document.createElement('button');
                button.className = 'selection-btn';
                button.dataset.type = 'selectedItem';
                button.dataset.value = item.value;
                button.textContent = item.name;
                itemContainer.appendChild(button);
            });

            itemSelectionGroup.style.display = 'block';
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
            const { category, difficulty, selectedItems, mode, questionCount } = this.state.settings;
            const startBtn = document.getElementById('start-quiz-btn');
            
            if (category && difficulty && selectedItems.length > 0 && mode && questionCount) {
                startBtn.disabled = false;
                startBtn.textContent = '開始測驗！';
                startBtn.classList.remove('disabled');
            } else {
                startBtn.disabled = true;
                startBtn.textContent = '請完成所有選擇';
                startBtn.classList.add('disabled');
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
            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="store-layout">
                    <div class="title-bar">
                        <div class="title-bar-left">
                            <div class="progress-info">第 1 / ${this.state.totalQuestions} 題</div>
                        </div>
                        <div class="title-bar-center">
                            <div class="target-amount">點數錢幣和紙鈔</div>
                        </div>
                        <div class="title-bar-right">
                            <div class="score-info">分數: 0 分</div>
                            <button id="back-to-menu-btn" class="back-to-menu-btn">返回主選單</button>
                        </div>
                    </div>
                    
                    <div class="unified-task-frame">
                        <div id="question-area" class="task-description"></div>
                        <div id="feedback-area" class="answer-feedback-area" style="display: none; text-align: center; padding: 20px;"></div>
                    </div>
                </div>
            `;
            
            this.elements.questionArea = document.getElementById('question-area');
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
            this.elements.feedbackArea.innerHTML = '';
            // 移除任何現有的提示數字框
            const existingHintBox = document.getElementById('total-hint-box');
            if (existingHintBox) {
                existingHintBox.remove();
            }

            this.startQuestion(question);
        },

        generateQuestions() {
            this.state.quizQuestions = [];
            const { selectedItems, category } = this.state.settings;
            let itemPool = [];

            if (selectedItems.length > 0) {
                const allItems = [...this.gameData.items.coins, ...this.gameData.items.notes];
                itemPool = allItems.filter(item => selectedItems.includes(item.value));
            } else {
                const source = (category === 'mixed')
                    ? [...this.gameData.items.coins, ...this.gameData.items.notes]
                    : this.gameData.items[category];
                if (source) itemPool = source;
            }

            if (!itemPool || itemPool.length === 0) { 
                return; 
            }

            for (let i = 0; i < this.state.totalQuestions; i++) {
                let questionItems = [];
                let questionTotal = 0;

                const targetTotalCount = Math.floor(Math.random() * 16) + 5;
                let currentTotalCount = 0;
                const itemsCountMap = new Map();

                while(currentTotalCount < targetTotalCount) {
                    const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)];
                    itemsCountMap.set(randomItem.value, (itemsCountMap.get(randomItem.value) || 0) + 1);
                    currentTotalCount++;
                }

                itemsCountMap.forEach((quantity, value) => {
                    const itemData = itemPool.find(item => item.value === value);
                    if (itemData) {
                        questionItems.push({ item: itemData, quantity: quantity });
                        questionTotal += itemData.value * quantity;
                    }
                });
                
                this.state.quizQuestions.push({ 
                    items: questionItems, 
                    correctTotal: questionTotal 
                });
            }
        },

        startQuestion(question) {
            this.state.runningTotal = 0;
            this.state.countedItems = 0;
            this.state.correctTotal = question.correctTotal;

            const difficulty = this.state.settings.difficulty;
            let hintBoxHtml = '';
            
            if (difficulty === 'easy') {
                // 簡單模式：只顯示總計，無提示按鈕
                hintBoxHtml = `
                    <div id="total-hint-box">
                        <div class="total-hint-container simple-mode">
                            <div class="total-display simple-display">
                                <span>總計：</span>
                                <span id="hint-total-amount">0</span>元
                            </div>
                        </div>
                    </div>
                `;
            } else if (difficulty === 'normal') {
                // 普通模式：顯示總計，有提示按鈕
                hintBoxHtml = `
                    <div id="total-hint-box">
                        <div class="total-hint-container">
                            <div class="total-display" onclick="Game.showNumberInput()">
                                <span>總計：</span>
                                <span id="hint-total-amount">0</span>元
                            </div>
                            <button class="hint-button" onclick="Game.showTotalHint()" title="顯示總計金額">
                                💡 <span class="hint-text">提示</span>
                            </button>
                        </div>
                    </div>
                `;
            } else {
                // 困難模式：顯示總計，有提示按鈕，但總計會隱藏
                hintBoxHtml = `
                    <div id="total-hint-box">
                        <div class="total-hint-container">
                            <div class="total-display" onclick="Game.showNumberInput()">
                                <span>總計：</span>
                                <span id="hint-total-amount">?</span>元
                            </div>
                            <button class="hint-button" onclick="Game.showTotalHint()" title="顯示總計金額">
                                💡 <span class="hint-text">提示</span>
                            </button>
                        </div>
                    </div>
                `;
            }
            
            this.elements.questionArea.innerHTML = `
                ${hintBoxHtml}
                <div id="coin-display-area"></div>
            `;
            
            const coinDisplayArea = document.getElementById('coin-display-area');

            let allItemDivs = [];
            let totalItemsToCount = 0;

            question.items.forEach(questionPart => {
                totalItemsToCount += questionPart.quantity;
                
                for (let i = 0; i < questionPart.quantity; i++) {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'countable-item';
                    itemDiv.dataset.value = questionPart.item.value;
                    itemDiv.dataset.name = questionPart.item.name;
                    itemDiv.innerHTML = `
                        <img src="${this.getRandomImage(questionPart.item)}" 
                             alt="${questionPart.item.name}">
                    `;
                    // 添加點擊和觸控事件支持
                    itemDiv.addEventListener('click', (e) => this.handleItemClick(e));
                    itemDiv.addEventListener('touchend', (e) => {
                        e.preventDefault(); // 防止觸控後的點擊事件重複觸發
                        this.handleItemClick(e);
                    }, { passive: false });
                    allItemDivs.push(itemDiv);
                }
            });

            this.state.itemsToCount = totalItemsToCount;

            this.shuffleArray(allItemDivs)
                .forEach(div => coinDisplayArea.appendChild(div));

            this.speak("鼠鼠看有幾元");
        },

        handleItemClick(event) {
            console.log('🎯 [C2-點數] 項目點擊事件觸發', {
                eventType: event.type,
                currentTarget: event.currentTarget.className,
                value: event.currentTarget.dataset.value,
                name: event.currentTarget.dataset.name
            });
            
            const item = event.currentTarget;
            if (item.classList.contains('counted')) {
                console.log('⚠️ [C2-點數] 項目已被點數，忽略重複點擊');
                return;
            }
            
            // 添加視覺和音效反饋
            item.classList.add('counted');
            const value = parseInt(item.dataset.value, 10);
            this.state.runningTotal += value;
            
            console.log('✅ [C2-點數] 項目點數成功', {
                itemValue: value,
                newTotal: this.state.runningTotal,
                countedItems: this.state.countedItems + 1
            });
            
            // 播放點擊音效
            const clickSound = document.getElementById('click-sound');
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.log('音效播放失敗:', e));
            }

            const difficulty = this.state.settings.difficulty;

            // 在簡單、普通和困難模式下添加數數字顯示
            if (difficulty === 'easy') {
                this.state.countedItems++;
                
                // 創建並顯示數數字
                const countNumber = document.createElement('div');
                countNumber.className = 'count-number';
                countNumber.textContent = this.state.countedItems;
                item.appendChild(countNumber);
                
                // 簡單模式：即時更新提示數字框，先播放語音
                const hintAmount = document.getElementById('hint-total-amount');
                if (hintAmount) {
                    hintAmount.textContent = this.state.runningTotal;
                }
                
                this.speak(`${this.state.runningTotal}元`, () => {
                    // 檢查是否為最後一個金錢圖示，如果是則進入答題階段
                    if (this.state.countedItems === this.state.itemsToCount) {
                        this.proceedToAnswerPhase();
                    }
                });
            } else if (difficulty === 'normal') {
                this.state.countedItems++;
                
                // 創建並顯示數數字
                const countNumber = document.createElement('div');
                countNumber.className = 'count-number';
                countNumber.textContent = this.state.countedItems;
                item.appendChild(countNumber);
                
                // 普通模式：即時更新提示數字框，先播放語音
                const hintAmount = document.getElementById('hint-total-amount');
                if (hintAmount) {
                    hintAmount.textContent = this.state.runningTotal;
                }
                
                this.speak(`${this.state.runningTotal}元`, () => {
                    // 檢查是否為最後一個金錢圖示，如果是則進入答題階段
                    if (this.state.countedItems === this.state.itemsToCount) {
                        this.proceedToAnswerPhase();
                    }
                });
            } else if (difficulty === 'hard') {
                this.state.countedItems++;
                new Audio('audio/menu_select.mp3').play();
                
                // 困難模式下立即檢查是否完成
                if (this.state.countedItems === this.state.itemsToCount) {
                    this.proceedToAnswerPhase();
                }
            }
        },

        proceedToAnswerPhase() {
            const difficulty = this.state.settings.difficulty;
            if (difficulty === 'easy') {
                // 簡單模式：自動判斷，播放"總共是×元"後進入下題
                setTimeout(() => {
                    // 自動判斷正確，增加分數
                    this.state.score++;
                    this.updateProgress();
                    
                    // 顯示中央回饋
                    this.showCenterFeedback('🎉', '#4CAF50', '答對了！');
                    document.getElementById('correct-sound')?.play();
                    
                    this.speak(`總共是 ${this.state.correctTotal} 元`, () => {
                        // 語音播放完畢後直接進入下題
                        setTimeout(() => {
                            this.hideCenterFeedback();
                            this.loadNextQuestion();
                        }, 1000);
                    });
                }, 500);
            } else if (difficulty === 'normal') {
                // 普通模式：選擇題方式，隱藏金額後顯示3個選項
                setTimeout(() => {
                    const hintAmount = document.getElementById('hint-total-amount');
                    if (hintAmount) {
                        hintAmount.textContent = '?';
                    }
                    // 播放語音提示後顯示選項
                    this.speak('請選擇正確的金額', () => {
                        this.showOptions();
                    });
                }, 500);
            } else {
                // 困難模式：數字輸入方式
                setTimeout(() => {
                    const hintAmount = document.getElementById('hint-total-amount');
                    if (hintAmount) {
                        hintAmount.textContent = '?';
                    }
                    // 播放語音提示後顯示數字選擇器
                    this.speak('請輸入數錢的金額', () => {
                        this.showNumberInput();
                    });
                }, 500);
            }
        },


        // 顯示總計提示
        showTotalHint() {
            const hintAmount = document.getElementById('hint-total-amount');
            if (hintAmount) {
                hintAmount.textContent = this.state.correctTotal;
                this.speak(`總計金額是 ${this.state.correctTotal} 元`, () => {
                    // 播放完語音後讓金額消失
                    setTimeout(() => {
                        if (hintAmount) {
                            hintAmount.textContent = '?';
                        }
                    }, 1000);
                });
            }
        },

        showOptions() {
            const correct = this.state.correctTotal;
            let wrong1, wrong2;

            do {
                const offset1 = (Math.floor(Math.random() * 4) + 1) * 5;
                wrong1 = Math.random() > 0.5 ? correct + offset1 : correct - offset1;
            } while (wrong1 === correct || wrong1 < 0);

            do {
                const offset2 = (Math.floor(Math.random() * 4) + 1) * 10;
                wrong2 = Math.random() > 0.5 ? correct + offset2 : correct - offset2;
            } while (wrong2 === correct || wrong2 < 0 || wrong2 === wrong1);

            const options = this.shuffleArray([correct, wrong1, wrong2]);
            
            // 創建選項區域
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';
            optionsContainer.innerHTML = '<h3>請選擇正確答案</h3>';
            
            const buttonsWrapper = document.createElement('div');
            buttonsWrapper.className = 'options-buttons';
            
            options.forEach(optionValue => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.textContent = `${optionValue} 元`;
                button.dataset.value = optionValue;
                button.addEventListener('click', (e) => this.checkAnswer(e));
                // 添加觸控事件支持
                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    console.log('🎯 [C2-選項] 觸控選擇答案:', optionValue);
                    this.checkAnswer(e);
                }, { passive: false });

                const speakOptionText = () => {
                    if (this.state.isAnswering) return;
                    this.speak(button.textContent);
                };

                button.addEventListener('mouseenter', speakOptionText);
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    speakOptionText();
                }, { passive: false });

                buttonsWrapper.appendChild(button);
            });
            
            optionsContainer.appendChild(buttonsWrapper);
            this.elements.questionArea.appendChild(optionsContainer);
        },

        showNumpad() {
            this.showNumberInput();
        },

        // 顯示數字輸入器（採用unit6樣式）
        showNumberInput(title = '請輸入金額數字', callback = null) {
            // 檢查是否已存在數字輸入器
            if (document.getElementById('number-input-popup')) {
                return;
            }

            // 儲存回調函數
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
            
            // 為數字按鈕添加觸控支持
            this.setupNumberInputTouchEvents();
        },
        
        // 為數字輸入鍵盤添加觸控事件支持
        setupNumberInputTouchEvents() {
            const popup = document.getElementById('number-input-popup');
            if (!popup) return;
            
            const buttons = popup.querySelectorAll('button');
            buttons.forEach(button => {
                // 添加觸控事件，防止重複執行onclick
                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🎯 [C2-數字鍵盤] 觸控事件觸發:', button.textContent);
                    
                    // 手動觸發按鈕點擊
                    if (button.onclick) {
                        button.onclick();
                    }
                }, { passive: false });
                
                // 添加觸控反饋
                button.addEventListener('touchstart', (e) => {
                    button.style.transform = 'scale(0.95)';
                }, { passive: true });
                
                button.addEventListener('touchend', (e) => {
                    setTimeout(() => {
                        button.style.transform = '';
                    }, 100);
                }, { passive: true });
            });
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
                this.checkNumpadAnswer(inputValue);
            }
        },

        closeNumberInput() {
            const popup = document.getElementById('number-input-popup');
            const styles = document.getElementById('number-input-styles');
            
            if (popup) popup.remove();
            if (styles) styles.remove();
            this.numberInputCallback = null;
        },

        checkNumpadAnswer(inputValue) {
            this.state.isAnswering = true;
            const userAnswer = parseInt(inputValue, 10) || 0;
            const isCorrect = userAnswer === this.state.correctTotal;
            const { mode } = this.state.settings;

            // 顯示回饋訊息
            this.elements.feedbackArea.style.display = 'block';

            if (isCorrect) {
                this.state.score++;
                this.showCenterFeedback('🎉', '#4CAF50', '答對了！');
                document.getElementById('correct-sound')?.play();
                
                this.speak(`恭喜你答對了，總共是 ${this.state.correctTotal} 元`, () => {
                    setTimeout(() => {
                        this.hideCenterFeedback();
                        this.loadNextQuestion();
                    }, 1200);
                });
            } else {
                document.getElementById('error-sound')?.play();
                
                if (mode === 'retry') {
                    this.showCenterFeedback('❌', '#f44336', '答錯了，再試一次！');
                    
                    this.speak('答錯了，再試一次', () => {
                        setTimeout(() => {
                            this.hideCenterFeedback();
                            this.elements.feedbackArea.style.display = 'none';
                            this.state.isAnswering = false;
                            this.resetCounting();
                        }, 1500);
                    });
                } else {
                    const feedbackText = `答錯了，正確答案是 ${this.state.correctTotal} 元`;
                    this.showCenterFeedback('❌', '#f44336', feedbackText);
                    
                    this.speak(feedbackText, () => {
                        setTimeout(() => {
                            this.hideCenterFeedback();
                            this.loadNextQuestion();
                        }, 2000);
                    });
                }
            }
        },

        checkAnswer(event) {
            this.state.isAnswering = true;
            const selectedBtn = event.currentTarget;
            const selectedValue = parseInt(selectedBtn.dataset.value, 10);
            const isCorrect = selectedValue === this.state.correctTotal;
            const { mode } = this.state.settings;

            document.querySelectorAll('.option-btn')
                .forEach(btn => btn.disabled = true);

            if (isCorrect) {
                this.state.score++;
                selectedBtn.classList.add('correct-option');
                
                // 顯示中央回饋
                this.showCenterFeedback('🎉', '#4CAF50', '答對了！');
                document.getElementById('correct-sound')?.play();
                
                this.speak(`恭喜你答對了，總共是 ${this.state.correctTotal} 元`, () => {
                    setTimeout(() => {
                        this.hideCenterFeedback();
                        this.loadNextQuestion();
                    }, 1200);
                });
            } else {
                selectedBtn.classList.add('incorrect-option');
                document.getElementById('error-sound')?.play();
                
                if (mode === 'retry') {
                    this.showCenterFeedback('❌', '#f44336', '答錯了，再試一次！');
                    
                    this.speak('答錯了，再試一次', () => {
                        setTimeout(() => {
                            selectedBtn.classList.remove('incorrect-option');
                            document.querySelectorAll('.option-btn')
                                .forEach(btn => btn.disabled = false);
                            this.hideCenterFeedback();
                            this.state.isAnswering = false;
                            this.resetCounting();
                        }, 1500);
                    });
                } else {
                    const correctBtn = document
                        .querySelector(`[data-value="${this.state.correctTotal}"]`);
                    
                    if (correctBtn) correctBtn.classList.add('correct-option');
                    
                    const feedbackText = `答錯了，正確答案是 ${this.state.correctTotal} 元`;
                    this.showCenterFeedback('❌', '#f44336', feedbackText);
                    
                    this.speak(feedbackText, () => {
                        setTimeout(() => {
                            this.hideCenterFeedback();
                            this.loadNextQuestion();
                        }, 2000);
                    });
                }
            }
        },
        
        resetCounting() {
            this.state.runningTotal = 0;
            this.state.countedItems = 0;
            document.querySelectorAll('.countable-item').forEach(item => {
                item.classList.remove('counted');
                // 移除數數字
                const countNumber = item.querySelector('.count-number');
                if (countNumber) {
                    countNumber.remove();
                }
            });
            // 重置提示數字框顯示
            const hintAmount = document.getElementById('hint-total-amount');
            if (hintAmount) {
                hintAmount.textContent = '0';
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
                <div class="results-screen">
                    <div class="results-header">
                        <div class="trophy-icon">${performanceIcon}</div>
                        <h1 class="results-title">🎉 測驗結束 🎉</h1>
                        <div class="performance-badge">${performanceMessage}</div>
                    </div>
                    
                    <div class="results-container">
                        <div class="results-grid">
                            <div class="result-card">
                                <div class="result-icon">✅</div>
                                <div class="result-label">答對題數</div>
                                <div class="result-value">${correctCount} / ${totalQuestions}</div>
                            </div>
                            <div class="result-card">
                                <div class="result-icon">⭐</div>
                                <div class="result-label">總分</div>
                                <div class="result-value">${scoreInPoints} 分</div>
                            </div>
                            <div class="result-card">
                                <div class="result-icon">📊</div>
                                <div class="result-label">正確率</div>
                                <div class="result-value">${percentage}%</div>
                            </div>
                        </div>
                        
                        <div class="result-buttons">
                            <button class="play-again-btn" onclick="location.reload()">
                                <span class="btn-icon">🔄</span>
                                <span class="btn-text">再玩一次</span>
                            </button>
                            <button class="main-menu-btn" onclick="window.location.href='index.html'">
                                <span class="btn-icon">🏠</span>
                                <span class="btn-text">返回主選單</span>
                            </button>
                        </div>
                    </div>
                </div>
                <style>
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    
                    @keyframes celebrate {
                        0% { transform: scale(0.8) rotate(-10deg); opacity: 0; }
                        50% { transform: scale(1.1) rotate(5deg); opacity: 1; }
                        100% { transform: scale(1) rotate(0deg); opacity: 1; }
                    }
                    
                    @keyframes bounce {
                        0%, 20%, 60%, 100% { transform: translateY(0); }
                        40% { transform: translateY(-20px); }
                        80% { transform: translateY(-10px); }
                    }
                    
                    @keyframes glow {
                        0%, 100% { box-shadow: 0 0 20px rgba(52, 152, 219, 0.4); }
                        50% { box-shadow: 0 0 30px rgba(52, 152, 219, 0.8); }
                    }
                    
                    .results-screen {
                        position: relative;
                        text-align: center;
                        padding: 40px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 20px;
                        margin: 20px auto;
                        max-width: 700px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                        animation: celebrate 1s ease-out, fadeIn 1s ease-out;
                        overflow: hidden;
                    }
                    
                    .results-screen::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="stars" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.3)"/></pattern></defs><rect width="100" height="100" fill="url(%23stars)"/></svg>');
                        opacity: 0.3;
                        pointer-events: none;
                    }
                    
                    .results-header {
                        position: relative;
                        z-index: 2;
                        margin-bottom: 30px;
                    }
                    
                    .trophy-icon {
                        font-size: 4em;
                        margin-bottom: 10px;
                        animation: bounce 2s infinite;
                    }
                    
                    .results-title {
                        font-size: 2.5em;
                        color: #fff;
                        margin: 20px 0;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                        font-weight: bold;
                    }
                    
                    .performance-badge {
                        display: inline-block;
                        background: linear-gradient(45deg, #f39c12, #e67e22);
                        color: white;
                        padding: 12px 30px;
                        border-radius: 25px;
                        font-size: 1.3em;
                        font-weight: bold;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                        animation: glow 2s ease-in-out infinite;
                    }
                    
                    .results-container {
                        position: relative;
                        z-index: 2;
                        background: rgba(255,255,255,0.95);
                        padding: 30px;
                        border-radius: 15px;
                        margin-top: 20px;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    }
                    
                    .results-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                        margin-bottom: 30px;
                    }
                    
                    .result-card {
                        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                        padding: 20px;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                        border: 2px solid transparent;
                    }
                    
                    .result-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                        border-color: #3498db;
                    }
                    
                    .result-icon {
                        font-size: 2em;
                        margin-bottom: 10px;
                    }
                    
                    .result-label {
                        font-size: 1em;
                        color: #6c757d;
                        margin-bottom: 8px;
                        font-weight: 500;
                    }
                    
                    .result-value {
                        font-size: 1.6em;
                        font-weight: bold;
                        color: #2c3e50;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                    }
                    
                    .result-buttons {
                        display: flex;
                        gap: 20px;
                        justify-content: center;
                        flex-wrap: wrap;
                    }
                    
                    .play-again-btn, .main-menu-btn {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 15px 30px;
                        border: none;
                        border-radius: 10px;
                        font-size: 1.1em;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-decoration: none;
                        min-width: 160px;
                        justify-content: center;
                    }
                    
                    .play-again-btn {
                        background: linear-gradient(135deg, #27ae60, #2ecc71);
                        color: white;
                    }
                    
                    .play-again-btn:hover {
                        background: linear-gradient(135deg, #2ecc71, #27ae60);
                        transform: translateY(-3px);
                        box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
                    }
                    
                    .main-menu-btn {
                        background: linear-gradient(135deg, #8e44ad, #9b59b6);
                        color: white;
                    }
                    
                    .main-menu-btn:hover {
                        background: linear-gradient(135deg, #9b59b6, #8e44ad);
                        transform: translateY(-3px);
                        box-shadow: 0 8px 25px rgba(142, 68, 173, 0.3);
                    }
                    
                    .btn-icon {
                        font-size: 1.2em;
                    }
                    
                    .btn-text {
                        font-family: inherit;
                    }
                    
                    @media (max-width: 600px) {
                        .results-screen {
                            margin: 10px;
                            padding: 20px;
                        }
                        
                        .results-title {
                            font-size: 2em;
                        }
                        
                        .results-grid {
                            grid-template-columns: 1fr;
                            gap: 15px;
                        }
                        
                        .result-buttons {
                            flex-direction: column;
                            align-items: center;
                        }
                        
                        .play-again-btn, .main-menu-btn {
                            width: 100%;
                            max-width: 250px;
                        }
                    }
                </style>
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
        }
    };

    Game.init();
});
