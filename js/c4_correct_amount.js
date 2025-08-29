// =================================================================
// FILE: js/unit4.js
// =================================================================

// 將Game定義為全局變量以支持onclick事件
let Game;

document.addEventListener('DOMContentLoaded', () => {
    Game = {
        // 新增：狀態管理物件，用來儲存使用者的設定
        state: {
            // 完整的設定狀態
            settings: {
                digits: null,
                denominations: [],
                difficulty: null,
                mode: null,
                questionCount: 10,
                customAmount: 50
            },
            gameState: {},
            // 新增：進度追蹤
            quiz: {
                currentQuestion: 0,
                totalQuestions: 10,
                score: 0,
                questions: [],
                startTime: null,
                attempts: 0
            },
            // 防止重複載入題目
            loadingQuestion: false,
            // 點擊功能狀態管理
            clickState: {
                clickCount: 0,
                lastClickTime: 0,
                lastClickedElement: null,
                selectedClickItem: null
            }
        },

        // 點擊功能配置 - 參考 c3_money_exchange 的成功實現
        clickToMoveConfig: {
            easy: {
                enabled: true,
                allowClickToPlace: true,
                allowClickToReturn: true,  // 簡單模式允許取回
                audioFeedback: true,
                speechFeedback: false,     // c4 沒有語音系統
                visualSelection: true,
                selectionTimeout: 0,
                doubleClickDelay: 500
            },
            normal: {
                enabled: true,
                allowClickToPlace: true,
                allowClickToReturn: true,
                audioFeedback: true,
                speechFeedback: false,
                visualSelection: true,
                selectionTimeout: 0,
                doubleClickDelay: 500
            },
            hard: {
                enabled: true,
                allowClickToPlace: true,
                allowClickToReturn: true,
                audioFeedback: true,
                speechFeedback: false,
                visualSelection: true,
                selectionTimeout: 0,
                doubleClickDelay: 500
            }
        },
        
        // 防重複處理標誌
        isProcessingDrop: false,

        // =====================================================
        // 音效系統（參考unit3.js）
        // =====================================================
        audio: {
            dropSound: null,
            errorSound: null,
            successSound: null,
            init() {
                try {
                    this.dropSound = new Audio('audio/drop-sound.mp3');
                    this.dropSound.preload = 'auto';
                    this.dropSound.volume = 0.5;

                    this.errorSound = new Audio('audio/error.mp3');
                    this.errorSound.preload = 'auto';

                    this.successSound = new Audio('audio/correct02.mp3');
                    this.successSound.preload = 'auto';
                } catch (error) {
                    console.log('音效檔案載入失敗:', error);
                }
            },
            playDropSound() {
                if (this.dropSound) {
                    this.dropSound.currentTime = 0;
                    this.dropSound.play().catch(error => console.log('播放音效失敗:', error));
                }
            },
            playErrorSound() {
                if (this.errorSound) {
                    this.errorSound.currentTime = 0;
                    this.errorSound.play().catch(error => console.log('播放音效失敗:', error));
                }
            },
            playSuccessSound() {
                if (this.successSound) {
                    this.successSound.currentTime = 0;
                    this.successSound.play().catch(error => console.log('播放音效失敗:', error));
                }
            }
        },

        // =====================================================
        // 語音系統（參考unit3.js）
        // =====================================================
        speech: {
            synth: window.speechSynthesis,
            voice: null,
            isReady: false,
            init() {
                console.log('開始初始化語音系統...');
                const setVoice = () => {
                    const voices = this.synth.getVoices();
                    console.log(`找到 ${voices.length} 個語音`);
                    if (voices.length === 0) {
                        console.log('沒有找到語音，稍後重試');
                        return;
                    }
                    
                    const preferredVoices = ['Microsoft HsiaoChen Online', 'Google 國語 (臺灣)'];
                    this.voice = voices.find(v => preferredVoices.includes(v.name));
                    if (!this.voice) {
                        const otherTWVoices = voices.filter(v => v.lang === 'zh-TW' && !v.name.includes('Hanhan'));
                        if (otherTWVoices.length > 0) { this.voice = otherTWVoices[0]; }
                    }
                    if (!this.voice) { this.voice = voices.find(v => v.lang === 'zh-TW'); }
                    if (!this.voice) { 
                        // 備用方案：使用任何可用的語音
                        this.voice = voices[0];
                        console.log('未找到中文語音，使用備用語音:', this.voice.name);
                    }
                    
                    if (this.voice) {
                        this.isReady = true;
                        console.log(`語音已就緒: ${this.voice.name} (${this.voice.lang})`);
                        this.synth.onvoiceschanged = null;
                    }
                };
                this.synth.onvoiceschanged = setVoice;
                setVoice();
                
                // 如果立即沒有語音，設定超時重試
                setTimeout(() => {
                    if (!this.isReady) {
                        console.log('語音初始化超時，嘗試再次設定');
                        setVoice();
                    }
                }, 1000);
            },
            speak(text, options = {}) { // 增加 callback 功能
                const { interrupt = true, callback = null } = options;

                console.log(`speech.speak 被調用，文本: "${text}", interrupt: ${interrupt}`);
                console.log(`語音狀態檢查: isReady=${this.isReady}, voice=${this.voice ? this.voice.name : 'null'}, isSpeaking=${this.synth.speaking}`);
                
                // 如果不應該中斷，且有語音正在播放，則直接返回，不打斷重要語音
                if (!interrupt && this.synth.speaking) {
                    console.log(`語音 "${text}" 被忽略，因為已有語音正在播報且不應中斷。`);
                    return;
                }

                if (!this.isReady || !this.voice) {
                    console.log(`語音系統未就緒，嘗試重新初始化並延遲播報`);
                    // 嘗試重新初始化
                    this.init();
                    // 延遲100ms後重試
                    setTimeout(() => {
                        if (this.isReady && this.voice) {
                            console.log(`重新初始化後播報: "${text}"`);
                            this.synth.cancel(); // 重新初始化後總是中斷
                            const utterance = new SpeechSynthesisUtterance(text);
                            utterance.voice = this.voice;
                            utterance.rate = 1.0; // 標準語速（與F1統一）
                            utterance.pitch = 1;
                            if (callback) {
                                utterance.onend = callback;
                            }
                            this.synth.speak(utterance);
                        } else {
                            console.log(`重新初始化後仍無法播報語音: "${text}"`);
                            if (callback) callback(); // 失敗時也要執行回呼，避免流程卡住
                        }
                    }, 100);
                    return;
                }
                
                if (interrupt) {
                    this.synth.cancel(); // 根據 interrupt 標誌決定是否停止之前的語音
                }
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = this.voice;
                utterance.rate = 1.0; // 標準語速（與F1統一）
                utterance.pitch = 1;
                if (callback) {
                    utterance.onend = callback;
                }
                this.synth.speak(utterance);
                console.log(`語音播報已提交到系統`);
            }
        },

        // =====================================================
        // 金錢資料（參考unit3.js）
        // =====================================================
        gameData: {
            allItems: [
                { value: 1, name: '1元', images: { front: 'images/1_yuan_front.png', back: 'images/1_yuan_back.png' } },
                { value: 5, name: '5元', images: { front: 'images/5_yuan_front.png', back: 'images/5_yuan_back.png' } },
                { value: 10, name: '10元', images: { front: 'images/10_yuan_front.png', back: 'images/10_yuan_back.png' } },
                { value: 50, name: '50元', images: { front: 'images/50_yuan_front.png', back: 'images/50_yuan_back.png' } },
                { value: 100, name: '100元', images: { front: 'images/100_yuan_front.png', back: 'images/100_yuan_back.png' } },
                { value: 500, name: '500元', images: { front: 'images/500_yuan_front.png', back: 'images/500_yuan_back.png' } },
                { value: 1000, name: '1000元', images: { front: 'images/1000_yuan_front.png', back: 'images/1000_yuan_back.png' } }
            ]
        },

        // 取得隨機圖片（參考unit3.js）
        getRandomImage(itemData) {
            return Math.random() < 0.5 ? itemData.images.front : itemData.images.back;
        },

        // 根據幣值取得物品資料
        getItemData(value) {
            return this.gameData.allItems.find(item => item.value === value);
        },

        // =====================================================
        // 初始化
        // =====================================================
        init() {
            // 初始化音效和語音系統
            this.audio.init();
            this.speech.init();
            this.initAudio();
            
            // 開發者快捷鍵：快速測試測驗結束視窗
            document.addEventListener('keydown', (event) => {
                if (event.ctrlKey) {
                    let score = 0;
                    let description = '';
                    
                    switch(event.key.toLowerCase()) {
                        case 't': // Ctrl+T: 80分 (良好)
                            score = 80;
                            description = '80分 - 表現良好';
                            break;
                        case 'y': // Ctrl+Y: 100分 (優異)
                            score = 100;
                            description = '100分 - 表現優異';
                            break;
                        case 'u': // Ctrl+U: 60分 (需努力)
                            score = 60;
                            description = '60分 - 還需努力';
                            break;
                        case 'i': // Ctrl+I: 30分 (多練習)
                            score = 30;
                            description = '30分 - 多加練習';
                            break;
                        default:
                            return;
                    }
                    
                    event.preventDefault();
                    console.log(`🎯 開發者快捷鍵觸發：${description}`);
                    
                    // 模擬測驗數據
                    this.state.quiz = {
                        currentQuestion: 10,
                        totalQuestions: 10,
                        score: score,
                        startTime: Date.now() - 120000 // 2分鐘前開始
                    };
                    
                    // 立即觸發測驗結束
                    this.showResults();
                }
            });
            
            // 為了方便測試，暫時重設設定
            this.showSettings();
        },

        // =====================================================
        // 設定畫面 (套用深色護眼模式)
        // =====================================================
        showSettings() {
            const app = document.getElementById('app');
            const settings = this.state.settings;
            
            // 定義可用的錢幣與紙鈔
            const coins = [
                { value: 1, name: '1元' },
                { value: 5, name: '5元' },
                { value: 10, name: '10元' },
                { value: 50, name: '50元' }
            ];
            const bills = [
                { value: 100, name: '100元' },
                { value: 500, name: '500元' },
                { value: 1000, name: '1000元' }
            ];

            // 參考 unit3.js，建立動態產生按鈕的函式
            const createDenominationButtonsHTML = (items) => items.map(item => `
                <button class="selection-btn ${settings.denominations.includes(item.value) ? 'active' : ''}" data-type="denomination" data-value="${item.value}">
                    ${item.name}
                </button>`).join('');
            
            app.innerHTML = `
                <div class="unit-welcome">
                    <div class="welcome-content">
                        <h1>單元四：拿出正確的金額</h1>
                        
                        <div class="game-settings">
                            <div class="setting-group">
                                <label>🎯 難度選擇：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${settings.difficulty === 'easy' ? 'active' : ''}" 
                                            data-type="difficulty" data-value="easy">
                                        簡單 (提示拿取)
                                    </button>
                                    <button class="selection-btn ${settings.difficulty === 'normal' ? 'active' : ''}" 
                                            data-type="difficulty" data-value="normal">
                                        普通 (自由拿取)
                                    </button>
                                    <button class="selection-btn ${settings.difficulty === 'hard' ? 'active' : ''}" 
                                            data-type="difficulty" data-value="hard">
                                        困難 (限時拿取)
                                    </button>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>🔢 目標金額位數：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${settings.digits === 1 ? 'active' : ''}" 
                                            data-type="digits" data-value="1">
                                        1位數
                                    </button>
                                    <button class="selection-btn ${settings.digits === 2 ? 'active' : ''}" 
                                            data-type="digits" data-value="2">
                                        2位數
                                    </button>
                                    <button class="selection-btn ${settings.digits === 3 ? 'active' : ''}" 
                                            data-type="digits" data-value="3">
                                        3位數
                                    </button>
                                    <button class="selection-btn ${settings.digits === 4 ? 'active' : ''}" 
                                            data-type="digits" data-value="4">
                                        4位數
                                    </button>
                                    <button class="selection-btn ${settings.digits === 'custom' ? 'active' : ''}" 
                                            data-type="digits" data-value="custom">
                                        自訂金額
                                    </button>
                                </div>
                                <div id="custom-amount-input" style="display: ${settings.digits === 'custom' ? 'block' : 'none'}; margin-top: 15px;">
                                    <button id="set-custom-amount-btn" 
                                            style="padding: 8px 15px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                        設定自訂金額
                                    </button>
                                    <span id="custom-amount-display" style="margin-left: 10px; font-weight: bold; color: #667eea;">
                                        目前：${settings.customAmount || 50} 元
                                    </span>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>💰 幣值選擇 (可多選)：</label>
                                <div class="denomination-selection">
                                    <div class="denomination-group">
                                        <h4 style="margin: 0 0 10px 0; color: #000;">錢幣</h4>
                                        <div class="button-group">${createDenominationButtonsHTML(coins)}</div>
                                    </div>
                                    <div class="denomination-group" style="margin-top: 15px;">
                                        <h4 style="margin: 0 0 10px 0; color: #000;">紙鈔</h4>
                                        <div class="button-group">${createDenominationButtonsHTML(bills)}</div>
                                    </div>
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
            startBtn.addEventListener('click', this.startQuiz.bind(this));

            // 添加自訂金額設定按鈕事件監聽器
            const setCustomAmountBtn = app.querySelector('#set-custom-amount-btn');
            if (setCustomAmountBtn) {
                setCustomAmountBtn.addEventListener('click', () => {
                    this.showNumberInput('請輸入目標金額', (value) => {
                        const amount = parseInt(value);
                        if (isNaN(amount) || amount < 1 || amount > 9999) {
                            alert('請輸入 1-9999 之間的有效金額');
                            return false;
                        }
                        
                        // 檢查與現有幣值的衝突
                        const { denominations } = this.state.settings;
                        if (denominations.length > 0) {
                            const totalRequired = denominations.reduce((sum, coin) => sum + coin, 0);
                            console.log(`自訂金額設定檢查: 輸入=${amount}元, 幣值=[${denominations.join(',')}], 需要=${totalRequired}元`);
                            if (amount < totalRequired) {
                                // 傳遞正確的資料給警告系統
                                this.showInvalidCombinationWarning('custom', null, {
                                    customAmount: amount,
                                    denominations: denominations
                                });
                                return false;
                            }
                        }
                        
                        this.state.settings.customAmount = amount;
                        
                        // 更新顯示
                        const displaySpan = app.querySelector('#custom-amount-display');
                        if (displaySpan) {
                            displaySpan.textContent = `目前：${amount} 元`;
                        }
                        
                        alert(`已設定目標金額為 ${amount} 元`);
                        
                        // 更新開始按鈕狀態
                        this.checkStartState();
                        return true;
                    });
                });
            }
            
            this.updateDenominationUI(); // 根據預設值，先執行一次連動規則
            this.checkStartState();
        },

        // =====================================================
        // 設定畫面CSS樣式
        // =====================================================
        getSettingsCSS() {
            return `
                /* 深色主題基礎樣式 */
                body { 
                    background-color: #1a1a1a !important;
                    color: #ffffff !important;
                    margin: 0; padding: 0;
                    font-family: 'Microsoft JhengHei', '微軟正黑體', sans-serif;
                    display: block !important; height: auto !important;
                    align-items: initial !important; justify-content: initial !important;
                }
                #game-container { 
                    background-color: #1a1a1a !important; color: #ffffff !important; 
                    max-width: 1200px; margin: 0 auto; padding: 20px;
                }
                h1 { color: #ffffff !important; text-align: center; font-size: 2.2em; margin-bottom: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
                h2 { color: #ffffff !important; font-size: 1.3em; margin-bottom: 15px; }
                
                #setup-area { background: linear-gradient(135deg, #2c3e50, #34495e); padding: 30px; border-radius: 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.4); margin-bottom: 25px; }
                .setup-section { margin-bottom: 25px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); text-align: center; }
                
                .selection-btn { background: linear-gradient(135deg, #3498db, #2980b9); color: #ffffff !important; border: 1px solid #34495e; padding: 15px 25px; margin: 8px; border-radius: 8px; font-size: 16px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.3); text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
                .selection-btn:hover { background: linear-gradient(135deg, #2980b9, #1abc9c); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.4); }
                .selection-btn.active { background: linear-gradient(135deg, #e74c3c, #c0392b); box-shadow: 0 0 20px rgba(231, 76, 60, 0.5); }
                .selection-btn:disabled { background: linear-gradient(135deg, #525252, #333333); color: #888888 !important; cursor: not-allowed; transform: none; box-shadow: none; opacity: 0.5; }

                .unit-btn { background: linear-gradient(135deg, #27ae60, #2ecc71); color: #ffffff !important; border: none; padding: 18px 35px; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; transition: all 0.3s ease; display: block; margin: 25px auto; box-shadow: 0 6px 20px rgba(0,0,0,0.4); text-decoration: none; text-align: center; }
                .unit-btn:hover:not(:disabled) { background: linear-gradient(135deg, #2ecc71, #1abc9c); transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.5); }
                .unit-btn:disabled { background: linear-gradient(135deg, #7f8c8d, #95a5a6); cursor: not-allowed; transform: none; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
                
                .back-btn { background: linear-gradient(135deg, #8e44ad, #9b59b6); color: #ffffff !important; border: none; padding: 12px 25px; border-radius: 8px; font-size: 16px; cursor: pointer; transition: all 0.3s ease; display: block; margin: 20px auto; text-decoration: none; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
                .back-btn:hover { background: linear-gradient(135deg, #9b59b6, #8e44ad); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.4); }

                .denomination-selection { display: flex; justify-content: space-around; gap: 20px; flex-wrap: wrap; }
                .denomination-group { background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; flex: 1; min-width: 200px; }
                .denomination-group h3 { margin-top: 0; text-align: center; color: #f1c40f; border-bottom: 1px solid #f1c40f; padding-bottom: 10px; }
                .denomination-items { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 15px; }
            `;
        },

        // 新增：統一的選擇處理函式
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
                    this.state.quiz.totalQuestions = parseInt(value);
                    this.hideCustomQuestionInput();
                }
            } else if (type === 'denomination') {
                const numValue = parseInt(value, 10);
                const index = this.state.settings.denominations.indexOf(numValue);
                
                if (index > -1) {
                    // 移除幣值
                    btn.classList.remove('active');
                    this.state.settings.denominations.splice(index, 1);
                } else {
                    // 準備添加幣值 - 先檢查衝突
                    const testDenominations = [...this.state.settings.denominations, numValue];
                    
                    // 自訂金額模式：檢查添加此幣值是否會造成衝突
                    if (this.state.settings.digits === 'custom') {
                        const { customAmount } = this.state.settings;
                        const totalRequired = testDenominations.reduce((sum, coin) => sum + coin, 0);
                        console.log(`添加幣值前檢查: 金額=${customAmount}元, 將添加=${numValue}元, 測試幣值=[${testDenominations.join(',')}], 需要=${totalRequired}元`);
                        
                        if (customAmount < totalRequired) {
                            // 傳遞正確的資料給警告系統（不包含即將添加的幣值）
                            this.showInvalidCombinationWarning('custom', null, {
                                customAmount: customAmount,
                                denominations: testDenominations,
                                attemptedCoin: numValue  // 添加嘗試加入的幣值資訊
                            });
                            return; // 拒絕添加
                        }
                    }
                    
                    // 其他模式的智能邏輯檢查
                    if (!this.isValidCombination(this.state.settings.digits, testDenominations)) {
                        this.showInvalidCombinationWarning(this.state.settings.digits, numValue);
                        return;
                    }
                    
                    // 檢查通過，添加幣值
                    btn.classList.add('active');
                    this.state.settings.denominations.push(numValue);
                }
                
                this.updateSmartUI(); // 更新智能UI狀態
                this.checkStartState();
                return; // 不需要更新其他按鈕狀態
            } else {
                if (type === 'digits') {
                    const newDigits = value === 'custom' ? 'custom' : parseInt(value, 10);
                    
                    // 檢查智能邏輯：如果選擇此位數會導致現有幣值無效，則警告
                    if (newDigits !== 'custom') {
                        const invalidDenominations = this.getInvalidDenominations(newDigits, this.state.settings.denominations);
                        if (invalidDenominations.length > 0) {
                            this.showInvalidCombinationWarning(newDigits, invalidDenominations);
                            // 移除無效的幣值
                            this.state.settings.denominations = this.state.settings.denominations.filter(d => !invalidDenominations.includes(d));
                        }
                    }
                    
                    if (value === 'custom') {
                        this.state.settings[type] = 'custom';
                        this.showCustomAmountInput();
                    } else {
                        this.state.settings[type] = parseInt(value, 10);
                        this.hideCustomAmountInput();
                    }
                    this.updateDenominationUI(); // 位數改變時更新幣值選項
                    this.updateSmartUI(); // 更新智能UI狀態
                } else {
                    this.state.settings[type] = value;
                }
            }

            // 更新同組按鈕的active狀態
            const buttonGroup = btn.closest('.button-group');
            buttonGroup.querySelectorAll('.selection-btn')
                .forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 檢查是否所有必要設定都已完成
            this.checkStartState();
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
                this.state.quiz.totalQuestions = questionCount;
                
                // 更新active狀態
                const customBtn = document.querySelector('[data-value="custom"]');
                if (customBtn) {
                    const buttonGroup = customBtn.closest('.button-group');
                    buttonGroup.querySelectorAll('.selection-btn')
                        .forEach(b => b.classList.remove('active'));
                    customBtn.classList.add('active');
                }
                
                // 檢查是否可以開始遊戲
                this.checkStartState();
                
                alert(`已設定測驗題數為 ${questionCount} 題`);
                return true;
            });
        },

        // 隱藏自訂題目數量輸入框
        hideCustomQuestionInput() {
            // 不再需要隱藏，因為使用彈出式數字選擇器
        },

        // 顯示自訂金額輸入框
        showCustomAmountInput() {
            const customInputDiv = document.getElementById('custom-amount-input');
            if (customInputDiv) {
                customInputDiv.style.display = 'block';
            }
        },

        // 隱藏自訂金額輸入框
        hideCustomAmountInput() {
            const customInputDiv = document.getElementById('custom-amount-input');
            if (customInputDiv) {
                customInputDiv.style.display = 'none';
            }
        },


        // 新增：根據位數更新幣值選項的可用性
        updateDenominationUI() {
            const { digits, denominations } = this.state.settings;
            // 規則：可用的最大幣值不能等於或超過目標金額的最小單位
            // 1位數 (1-9元): 可用 < 10元 的幣值
            // 2位數 (10-99元): 可用 < 100元 的幣值
            // 3位數 (100-999元): 可用 < 1000元 的幣值
            // 4位數 (1000-9999元): 全部可用
            const maxDenomination = Math.pow(10, digits);

            const denominationButtons = document.querySelectorAll('.selection-btn[data-type="denomination"]');
            denominationButtons.forEach(btn => {
                const value = parseInt(btn.dataset.value, 10);
                if (value >= maxDenomination) {
                    btn.disabled = true;
                    btn.classList.remove('active');
                    // 從 state 中移除被禁用的已選幣值
                    const index = denominations.indexOf(value);
                    if (index > -1) {
                        denominations.splice(index, 1);
                    }
                } else {
                    btn.disabled = false;
                }
            });
        },

        // 新增：檢查位數和幣值組合是否有效
        isValidCombination(digits, denominations) {
            if (!denominations.length) return true;
            
            if (digits === 'custom') {
                // 自訂金額模式：檢查是否能用所有選擇的幣值組成自訂金額
                const { customAmount } = this.state.settings;
                const minRequired = denominations.reduce((sum, coin) => sum + coin, 0);
                return customAmount >= minRequired;
            }
            
            // 位數模式：檢查是否能在範圍內包含所有幣值
            const minAmount = (digits === 1) ? 1 : Math.pow(10, digits - 1);
            const maxAmount = Math.pow(10, digits) - 1;
            const baseAmount = denominations.reduce((sum, coin) => sum + coin, 0);
            
            // 基礎檢查：最少需求是否超出範圍
            if (baseAmount > maxAmount) {
                return false;
            }
            
            // 進階檢查：計算有效組合數量
            const validCount = this.countValidCombinations(digits, denominations, minAmount, maxAmount, baseAmount);
            
            // 如果組合數量少於4種，顯示警告但仍允許（返回true）
            if (validCount > 0 && validCount < 4) {
                this.showLowCombinationWarning(digits, validCount, minAmount, maxAmount);
            }
            
            return validCount > 0;
        },

        // 新增：計算有效組合數量
        countValidCombinations(digits, denominations, minAmount, maxAmount, baseAmount) {
            let count = 0;
            for (let target = Math.max(minAmount, baseAmount); target <= maxAmount; target++) {
                const combinations = this.findAllMinimumCombinationsWithAllCoins(target, denominations);
                if (combinations.length > 0) {
                    count++;
                }
                // 為了效能，最多計算到10種就足夠判斷
                if (count >= 10) break;
            }
            return count;
        },

        // 新增：顯示低組合數量警告
        showLowCombinationWarning(digits, count, minAmount, maxAmount) {
            const digitNames = { 1: '1位數', 2: '2位數', 3: '3位數', 4: '4位數' };
            const digitName = digitNames[digits] || `${digits}位數`;
            
            const message = `⚠️ 注意：${digitName}範圍(${minAmount}-${maxAmount}元)配合目前選擇的幣值，只能產生${count}種不同的題目。建議選擇更多幣值以增加題目變化性。`;
            
            // 創建警告彈窗
            const modalOverlay = document.createElement('div');
            modalOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0, 0, 0, 0.75);
                display: flex; align-items: center; justify-content: center;
                z-index: 2000; opacity: 0; transition: opacity 0.3s;
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: linear-gradient(135deg, #f39c12, #e67e22);
                padding: 30px 40px; border-radius: 15px; text-align: center;
                color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                transform: scale(0.8); transition: transform 0.3s;
                border: 2px solid #e74c3c; max-width: 450px;
            `;

            modalContent.innerHTML = `
                <h2 style="font-size: 1.8em; margin: 0 0 15px 0; color: #fff;">📊 題目數量提醒</h2>
                <p style="font-size: 1.1em; margin: 0; line-height: 1.4;">${message}</p>
                <div style="margin-top: 20px;">
                    <button onclick="this.closest('.modal-overlay') && document.body.removeChild(this.closest('.modal-overlay'))" 
                            style="padding: 8px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1em;">
                        我知道了
                    </button>
                </div>
            `;
            
            modalOverlay.className = 'modal-overlay';
            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);

            // 語音提示
            this.speech.speak(`${digitName}配合目前幣值只能產生${count}種題目，建議選擇更多幣值`);

            // 點擊關閉
            const closeModal = () => {
                modalOverlay.style.opacity = '0';
                modalContent.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    if (document.body.contains(modalOverlay)) {
                        document.body.removeChild(modalOverlay);
                    }
                }, 300);
            };

            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) closeModal();
            });

            // 動畫效果
            setTimeout(() => {
                modalOverlay.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }, 10);

            // 5秒後自動關閉
            setTimeout(closeModal, 5000);
        },

        // 新增：找出所有包含所有幣值的最少硬幣組合
        findAllMinimumCombinationsWithAllCoins(amount, denominations) {
            // 計算使用所有幣值各1個的基礎金額
            const baseAmount = denominations.reduce((sum, coin) => sum + coin, 0);
            
            if (amount < baseAmount) {
                return []; // 金額不足，無法包含所有幣值
            }
            
            const remaining = amount - baseAmount;
            
            if (remaining === 0) {
                // 恰好等於所有幣值之和，只有一種組合
                return [denominations.slice().sort((a, b) => b - a)];
            }
            
            // 使用更高效的方法找出所有最少硬幣組合
            const allSolutions = this.findAllSolutionsForAmount(remaining, denominations);
            
            // 每個組合都要加上基礎的每種幣值各1個
            const result = [];
            const uniqueCombinations = new Set();
            
            for (const solution of allSolutions) {
                const combination = [...denominations]; // 每種幣值各1個
                solution.forEach(coin => combination.push(coin));
                combination.sort((a, b) => b - a); // 降序排列
                
                // 使用字符串去重
                const combinationKey = combination.join(',');
                if (!uniqueCombinations.has(combinationKey)) {
                    uniqueCombinations.add(combinationKey);
                    result.push(combination);
                }
            }
            
            return result;
        },

        // 新增：找出指定金額的所有最少硬幣組合
        findAllSolutionsForAmount(amount, denominations) {
            if (amount === 0) return [[]];
            
            const minCoins = this.getMinCoinsForAmount(amount, denominations);
            if (minCoins === Infinity) return [];
            
            const solutions = [];
            this.findSolutionsWithExactCoins(amount, denominations, minCoins, [], solutions);
            
            return solutions;
        },

        // 新增：找出使用確切硬幣數量的所有組合
        findSolutionsWithExactCoins(amount, denominations, targetCount, current, solutions) {
            if (current.length === targetCount) {
                if (amount === 0) {
                    solutions.push([...current]);
                }
                return;
            }
            
            if (amount <= 0 || current.length > targetCount) return;
            
            // 按降序嘗試每個面額，避免重複
            const sortedDenoms = denominations.slice().sort((a, b) => b - a);
            
            for (const coin of sortedDenoms) {
                // 避免重複：只選擇不大於前一個硬幣的值
                if (current.length === 0 || coin <= current[current.length - 1]) {
                    if (amount >= coin) {
                        current.push(coin);
                        this.findSolutionsWithExactCoins(amount - coin, denominations, targetCount, current, solutions);
                        current.pop();
                    }
                }
            }
        },


        // 新增：計算指定金額的最少硬幣數量
        getMinCoinsForAmount(amount, denominations) {
            if (amount === 0) return 0;
            
            const dp = new Array(amount + 1).fill(Infinity);
            dp[0] = 0;
            
            for (let i = 1; i <= amount; i++) {
                for (const coin of denominations) {
                    if (i >= coin && dp[i - coin] !== Infinity) {
                        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                    }
                }
            }
            
            return dp[amount] === Infinity ? Infinity : dp[amount];
        },

        // 新增：獲取在指定位數下無效的幣值
        getInvalidDenominations(digits, denominations) {
            if (digits === 'custom') return [];
            
            const maxDenomination = Math.pow(10, digits);
            return denominations.filter(d => d >= maxDenomination);
        },

        // 新增：顯示無效組合警告
        showInvalidCombinationWarning(digits, invalidItems, customData = null) {
            let message;
            
            if (digits === 'custom') {
                // 自訂金額模式的警告
                let customAmount, denominations, attemptedCoin;
                
                if (customData) {
                    // 使用傳遞的自訂資料
                    customAmount = customData.customAmount;
                    denominations = customData.denominations;
                    attemptedCoin = customData.attemptedCoin;
                } else {
                    // 使用當前設定
                    const settings = this.state.settings;
                    customAmount = settings.customAmount;
                    denominations = settings.denominations;
                }
                
                // 防護：確保denominations不為空
                if (!denominations || denominations.length === 0) {
                    console.error('showInvalidCombinationWarning: denominations為空，無法計算需求金額');
                    return;
                }
                
                const minRequired = denominations.reduce((sum, coin) => sum + coin, 0);
                const coinNames = denominations.map(v => `${v}元`).join('、');
                
                console.log(`自訂金額衝突檢測: 目標=${customAmount}元, 測試幣值=[${denominations.join(',')}], 最少需要=${minRequired}元`);
                
                // 統一使用相同的警告格式
                message = `自訂金額${customAmount}元無法使用所有選擇的幣值(${coinNames})，最少需要${minRequired}元才能包含所有幣值`;
            } else {
                // 原有的位數模式警告
                const digitNames = { 1: '1位數', 2: '2位數', 3: '3位數', 4: '4位數' };
                const digitName = digitNames[digits] || digits;
                
                if (Array.isArray(invalidItems)) {
                    const itemNames = invalidItems.map(v => `${v}元`).join('、');
                    message = `選擇${digitName}後，${itemNames}將無法使用，已自動移除`;
                } else {
                    message = `${invalidItems}元無法與${digitName}組合使用，請選擇其他幣值`;
                }
            }
            
            // 創建警告彈窗
            const modalOverlay = document.createElement('div');
            modalOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0, 0, 0, 0.75);
                display: flex; align-items: center; justify-content: center;
                z-index: 2000; opacity: 0; transition: opacity 0.3s;
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                padding: 30px 40px; border-radius: 15px; text-align: center;
                color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                transform: scale(0.8); transition: transform 0.3s;
                border: 2px solid #f39c12; max-width: 450px;
            `;

            modalContent.innerHTML = `
                <h2 style="font-size: 1.8em; margin: 0 0 15px 0; color: #f1c40f;">⚠️ 設定衝突</h2>
                <p style="font-size: 1.1em; margin: 0; line-height: 1.4;">${message}</p>
            `;

            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);

            // 語音提示
            this.speech.speak(message);

            // 點擊關閉
            const closeModal = () => {
                modalOverlay.style.opacity = '0';
                modalContent.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    document.body.removeChild(modalOverlay);
                }, 300);
            };

            modalOverlay.addEventListener('click', closeModal);

            // 動畫效果
            setTimeout(() => {
                modalOverlay.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }, 10);

            // 4秒後自動關閉（自訂金額訊息較長）
            setTimeout(closeModal, 4000);
        },

        // 新增：更新智能UI狀態
        updateSmartUI() {
            const { digits, denominations } = this.state.settings;
            
            // 更新幣值按鈕的active狀態
            const denominationButtons = document.querySelectorAll('.selection-btn[data-type="denomination"]');
            denominationButtons.forEach(btn => {
                const value = parseInt(btn.dataset.value);
                const isActive = denominations.includes(value);
                btn.classList.toggle('active', isActive);
            });
        },

        // 新增：檢查是否可開始測驗
        checkStartState() {
            const { digits, denominations, difficulty, mode, questionCount } = this.state.settings;
            const startBtn = document.getElementById('start-quiz-btn');
            const isReady = digits && denominations.length > 0 && difficulty && mode && questionCount;
            startBtn.disabled = !isReady;
            startBtn.textContent = isReady ? '開始測驗！' : '請完成所有選擇';
            startBtn.classList.toggle('disabled', !isReady);
        },

        // =====================================================
        // 遊戲流程與題目生成
        // =====================================================
        startQuiz() {
            console.log("測驗開始，設定為:", this.state.settings);
            
            // 初始化測驗狀態
            this.state.quiz = {
                currentQuestion: 1,
                totalQuestions: 10,
                score: 0,
                questions: [],
                startTime: Date.now(),
                attempts: 0
            };

            // 生成所有題目
            const questionsGenerated = this.generateAllQuestions();
            
            if (!questionsGenerated) {
                // 題目生成失敗，顯示錯誤訊息並返回設定畫面
                this.showGenerationErrorMessage();
                this.showSettings();
                return;
            }
            
            // 開始第一題
            this.loadQuestion(0);
        },

        showGenerationErrorMessage() {
            // 創建友善的錯誤提示彈窗
            const modalOverlay = document.createElement('div');
            modalOverlay.id = 'error-modal-overlay';
            modalOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0, 0, 0, 0.75);
                display: flex; align-items: center; justify-content: center;
                z-index: 2000; opacity: 0; transition: opacity 0.3s;
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                padding: 40px 50px; border-radius: 15px; text-align: center;
                color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                transform: scale(0.8); transition: transform 0.3s;
                border: 2px solid #ff6b6b;
                max-width: 500px;
            `;

            modalContent.innerHTML = `
                <h2 style="font-size: 2.2em; margin: 0 0 20px 0; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    ⚠️ 設定有問題
                </h2>
                <p style="font-size: 1.3em; margin: 0 0 20px 0; line-height: 1.5;">
                    無法生成足夠的題目！<br>
                    請嘗試以下調整：
                </p>
                <ul style="text-align: left; font-size: 1.1em; line-height: 1.6; margin: 0 0 20px 0;">
                    <li>增加可用的錢幣面額種類</li>
                    <li>調整目標金額位數設定</li>
                    <li>選擇較簡單的難度模式</li>
                </ul>
                <p style="font-size: 1.1em; margin: 0; opacity: 0.9;">
                    點擊任何地方重新設定
                </p>
            `;

            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);

            // 語音提示
            this.speech.speak('設定有問題，無法生成足夠的題目，請重新調整設定');

            // 點擊任何地方關閉彈窗
            const closeModal = () => {
                modalOverlay.style.opacity = '0';
                modalContent.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    document.body.removeChild(modalOverlay);
                }, 300);
            };

            modalOverlay.addEventListener('click', closeModal);

            // 動畫效果：淡入
            setTimeout(() => {
                modalOverlay.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }, 10);

            // 5秒後自動關閉
            setTimeout(closeModal, 5000);
        },

        showInstructionModal(targetAmount, callback) {
            // 檢查是否已經有指令彈窗存在，如果有則先移除
            const existingModal = document.getElementById('instruction-modal-overlay');
            if (existingModal) {
                console.log('移除現有的指令彈窗');
                document.body.removeChild(existingModal);
            }
            
            // 創建彈窗元素
            const modalOverlay = document.createElement('div');
            modalOverlay.id = 'instruction-modal-overlay';
            modalOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0, 0, 0, 0.75);
                display: flex; align-items: center; justify-content: center;
                z-index: 2000; opacity: 0; transition: opacity 0.3s;
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: linear-gradient(135deg, #34495e, #2c3e50);
                padding: 40px 50px; border-radius: 15px; text-align: center;
                color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                transform: scale(0.8); transition: transform 0.3s;
                border: 2px solid #4a90e2;
            `;

            modalContent.innerHTML = `
                <h2 style="font-size: 2.5em; margin: 0 0 20px 0; color: #f1c40f; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">目標金額</h2>
                <p style="font-size: 4em; margin: 0; font-weight: bold;">${targetAmount} 元</p>
            `;

            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);

            // 語音提示，並在唸完後關閉彈窗
            this.speech.speak(`請拿出${targetAmount}元`, {
                callback: () => {
                    setTimeout(() => {
                        modalOverlay.style.opacity = '0';
                        modalContent.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            document.body.removeChild(modalOverlay);
                            if (callback) callback(); // 執行後續的遊戲渲染
                        }, 300);
                    }, 1500); // 語音結束後停留1.5秒
                }
            });

            // 動畫效果：淡入
            setTimeout(() => {
                modalOverlay.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }, 10);
        },

        generateAllQuestions() {
            this.state.quiz.questions = [];
            for (let i = 0; i < this.state.quiz.totalQuestions; i++) {
                // 暫時設定當前題數，用於題目生成
                this.state.quiz.currentQuestion = i;
                
                const question = this.generateQuestion();
                if (question) {
                    this.state.quiz.questions.push(question);
                } else {
                    // 回傳false表示題目生成失敗
                    return false;
                }
            }
            
            // 重置為初始值
            this.state.quiz.currentQuestion = 0;
            
            // 回傳true表示所有題目生成成功
            return true;
        },

        loadQuestion(questionIndex) {
            if (questionIndex >= this.state.quiz.questions.length) {
                this.showResults();
                return;
            }

            // 設置載入標記
            this.state.loadingQuestion = true;
            console.log(`載入第 ${questionIndex + 1} 題`);

            const question = this.state.quiz.questions[questionIndex];
            this.state.quiz.currentQuestion = questionIndex + 1;
            
            // 初始化當前題目的遊戲狀態
            this.state.gameState = {
                targetAmount: question.targetAmount,
                currentTotal: 0,
                droppedItems: [],
                questionIndex: questionIndex,
                startTime: Date.now(),
                questionAnswered: false // 防止重複計分
            };

            // 修正：先渲染遊戲主畫面
            this.renderGameBoard(question);
            
            // 然後在遊戲畫面上方顯示指令彈窗
            this.showInstructionModal(question.targetAmount, () => {
                // 彈窗關閉後清除載入標記
                this.state.loadingQuestion = false;
                console.log(`第 ${questionIndex + 1} 題載入完成`);
            });
        },

        // =====================================================
        // 遊戲主畫面渲染（模式分離）
        // =====================================================
        renderGameBoard(question) {
            const { difficulty } = this.state.settings;
            
            // 完全重置遊戲狀態，避免模式間互相干擾
            this.state.gameState = {
                targetAmount: question.targetAmount,
                currentTotal: 0,
                droppedItems: [],
                questionIndex: this.state.gameState.questionIndex,
                startTime: Date.now()
            };
            
            // 根據難度模式分離渲染
            switch (difficulty) {
                case 'easy':
                    this.renderEasyMode(question);
                    break;
                case 'normal':
                    this.renderNormalMode(question);
                    break;
                case 'hard':
                    this.renderHardMode(question);
                    break;
                default:
                    console.error('未知的難度模式:', difficulty);
            }
        },

        // =====================================================
        // 簡單模式渲染（完全獨立）
        // =====================================================
        renderEasyMode(question) {
            const gameContainer = document.getElementById('app');
            const { denominations } = this.state.settings;
            const { targetAmount } = question;

            // 簡單模式專用：確保droppedItems陣列正確初始化（只在第一次或長度不匹配時初始化）
            const solution = this.findSolution(targetAmount, denominations);
            if (solution) {
                // 確保 droppedItems 和 hintImages 陣列正確初始化
                if (!this.state.gameState.droppedItems || this.state.gameState.droppedItems.length !== solution.length) {
                    this.state.gameState.droppedItems = new Array(solution.length).fill(null);
                    console.log('簡單模式初始化droppedItems:', this.state.gameState.droppedItems);

                    // 同時為提示圖示預先生成固定的圖片，避免每次重繪時閃爍
                    this.state.gameState.hintImages = solution.map(value => {
                        const itemData = this.getItemData(value);
                        return itemData ? this.getRandomImage(itemData) : '';
                    });
                    console.log('簡單模式初始化hintImages:', this.state.gameState.hintImages);
                }
            }

            // 動態產生金錢區的錢幣圖示
            let moneySourceHTML = '';
            denominations.forEach(value => {
                const itemData = this.getItemData(value);
                if (itemData) {
                    const imageSrc = this.getRandomImage(itemData);
                    moneySourceHTML += `<div class="money-item source-money unit4-easy-source-item" draggable="true" data-value="${value}">
                        <img src="${imageSrc}" alt="${itemData.name}" draggable="false" />
                        <div class="money-value">${itemData.name}</div>
                    </div>`;
                }
            });

            // 簡單模式：產生視覺提示（參考unit3.js的做法）
            const visualHintsHTML = this.generateVisualHintsWithState(targetAmount, denominations);

            gameContainer.innerHTML = `
                <style>
                    ${this.getCommonCSS()}
                    ${this.getEasyModeCSS()}
                </style>
                <div class="store-layout">
                    <div class="title-bar">
                        <div class="title-bar-left">
                            <div class="progress-info">第 ${this.state.quiz.currentQuestion} / ${this.state.quiz.totalQuestions} 題</div>
                        </div>
                        <div class="title-bar-center">
                            <div class="target-amount">目標金額: ${targetAmount} 元</div>
                        </div>
                        <div class="title-bar-right">
                            <div class="score-info">分數: ${this.state.quiz.score} 分</div>
                            <button id="back-to-menu-btn" class="back-to-menu-btn">返回主選單</button>
                        </div>
                    </div>
                    
                    <!-- 我的金錢區 -->
                    <div class="my-money-section unit4-easy-money-section">
                        <h2 class="section-title unit4-easy-section-title">我的金錢區</h2>
                        <div id="money-source-area" class="money-source-container unit4-easy-money-source">
                            ${moneySourceHTML}
                        </div>
                    </div>
                    
                    <!-- 兌換區 -->
                    <div class="exchange-section unit4-easy-exchange-section">
                        <h2 class="section-title unit4-easy-section-title">兌換區</h2>
                        <div id="drop-zone-area" class="drop-zone-container unit4-easy-drop-zone">
                            ${visualHintsHTML}
                        </div>
                        <div class="current-total-display unit4-easy-total-display${(this.state.gameState.currentTotal || 0) > targetAmount ? ' over-amount' : ''}">目前總額: ${this.state.gameState.currentTotal || 0} 元</div>
                        <div class="unit4-easy-auto-hint">📝 提示：將錢幣拖到上方，湊出正確金額！</div>
                    </div>
                </div>
            `;

            // 綁定簡單模式專用事件
            this.setupEasyModeEventListeners(question);
        },

        // =====================================================
        // 普通模式渲染（完全獨立）
        // =====================================================
        renderNormalMode(question) {
            const gameContainer = document.getElementById('app');
            const { denominations } = this.state.settings;
            const { targetAmount } = question;

            // 普通模式專用：初始化狀態（無視覺提示）
            if (!this.state.gameState.droppedItems) {
                this.state.gameState.droppedItems = [];
                this.state.gameState.currentTotal = 0;
                console.log('普通模式初始化droppedItems:', this.state.gameState.droppedItems);
            }

            // 動態產生金錢區的錢幣圖示
            let moneySourceHTML = '';
            denominations.forEach(value => {
                const itemData = this.getItemData(value);
                if (itemData) {
                    const imageSrc = this.getRandomImage(itemData);
                    moneySourceHTML += `<div class="money-item source-money unit4-normal-source-item" draggable="true" data-value="${value}">
                        <img src="${imageSrc}" alt="${itemData.name}" draggable="false" />
                        <div class="money-value">${itemData.name}</div>
                    </div>`;
                }
            });

            // 從狀態重建已放置的金錢（狀態驅動渲染）
            let droppedItemsHTML = '';
            if (this.state.gameState.droppedItems && this.state.gameState.droppedItems.length > 0) {
                this.state.gameState.droppedItems.forEach(item => {
                    const itemData = this.getItemData(item.value);
                    if (itemData) {
                        const imageSrc = this.getRandomImage(itemData);
                        droppedItemsHTML += `<div class="money-item unit4-normal-dropped-item" 
                            draggable="true" data-value="${item.value}" id="${item.id}">
                            <img src="${imageSrc}" alt="${itemData.name}" draggable="false" />
                            <div class="money-value">${itemData.name}</div>
                        </div>`;
                    }
                });
            }

            gameContainer.innerHTML = `
                <style>
                    ${this.getCommonCSS()}
                    ${this.getNormalModeCSS()}
                </style>
                <div class="store-layout">
                    <div class="title-bar">
                        <div class="title-bar-left">
                            <div class="progress-info">第 ${this.state.quiz.currentQuestion} / ${this.state.quiz.totalQuestions} 題</div>
                        </div>
                        <div class="title-bar-center">
                            <div class="target-amount">目標金額: ${targetAmount} 元</div>
                        </div>
                        <div class="title-bar-right">
                            <div class="score-info">分數: ${this.state.quiz.score} 分</div>
                            <button id="back-to-menu-btn" class="back-to-menu-btn">返回主選單</button>
                        </div>
                    </div>
                    
                    <!-- 我的金錢區 -->
                    <div class="my-money-section unit4-normal-money-section">
                        <h2 class="section-title unit4-normal-section-title">我的金錢區</h2>
                        <div id="money-source-area" class="money-source-container unit4-normal-money-source">
                            ${moneySourceHTML}
                        </div>
                    </div>
                    
                    <!-- 兌換區 -->
                    <div class="exchange-section unit4-normal-exchange-section">
                        <h2 class="section-title unit4-normal-section-title">兌換區</h2>
                        <div id="drop-zone-area" class="drop-zone-container unit4-normal-drop-zone">
                            ${droppedItemsHTML}
                        </div>
                        <div class="current-total-display unit4-normal-total-display${(this.state.gameState.currentTotal || 0) > targetAmount ? ' over-amount' : ''}">目前總額: ${this.state.gameState.currentTotal || 0} 元</div>
                        <div class="unit4-normal-hint">💡 提示：拖拽金錢到兌換區，然後點擊「完成」按鈕！</div>
                        <button id="confirm-btn" class="unit-btn unit4-normal-confirm-btn">完成</button>
                    </div>
                </div>
            `;

            // 綁定普通模式專用事件
            this.setupNormalModeEventListeners(question);
        },

        // =====================================================
        // 困難模式渲染（完全獨立）
        // =====================================================
        renderHardMode(question) {
            const gameContainer = document.getElementById('app');
            const { denominations } = this.state.settings;
            const { targetAmount } = question;
            const { currentTotal } = this.state.gameState;

            // 動態產生金錢區的錢幣圖示
            let moneySourceHTML = '';
            denominations.forEach(value => {
                const itemData = this.getItemData(value);
                if (itemData) {
                    const imageSrc = this.getRandomImage(itemData);
                    moneySourceHTML += `<div class="money-item source-money unit4-hard-source-item" draggable="true" data-value="${value}">
                        <img src="${imageSrc}" alt="${itemData.name}" />
                        <div class="money-value">${itemData.name}</div>
                    </div>`;
                }
            });

            // 狀態驅動：動態產生兌換區已放置的金錢圖示
            let droppedItemsHTML = '';
            if (this.state.gameState.droppedItems && this.state.gameState.droppedItems.length > 0) {
                this.state.gameState.droppedItems.forEach(item => {
                    const itemData = this.getItemData(item.value);
                    if (itemData) {
                        const imageSrc = this.getRandomImage(itemData);
                        droppedItemsHTML += `<div class="money-item unit4-hard-dropped-item" 
                            draggable="true" data-value="${item.value}" id="${item.id}">
                            <img src="${imageSrc}" alt="${itemData.name}" draggable="false" />
                            <div class="money-value">${itemData.name}</div>
                        </div>`;
                    }
                });
            }

            gameContainer.innerHTML = `
                <style>
                    ${this.getCommonCSS()}
                    ${this.getHardModeCSS()}
                </style>
                <div class="store-layout">
                    <div class="title-bar">
                        <div class="title-bar-left">
                            <div class="progress-info">第 ${this.state.quiz.currentQuestion} / ${this.state.quiz.totalQuestions} 題</div>
                        </div>
                        <div class="title-bar-center">
                            <div class="target-amount">目標金額: ${targetAmount} 元</div>
                        </div>
                        <div class="title-bar-right">
                            <div class="score-info">分數: ${this.state.quiz.score} 分</div>
                            <button id="back-to-menu-btn" class="back-to-menu-btn">返回主選單</button>
                        </div>
                    </div>
                    
                    <!-- 我的金錢區 -->
                    <div class="my-money-section unit4-hard-money-section">
                        <h2 class="section-title unit4-hard-section-title">我的金錢區</h2>
                        <div id="money-source-area" class="money-source-container unit4-hard-money-source">
                            ${moneySourceHTML}
                        </div>
                    </div>
                    
                    <!-- 兌換區 -->
                    <div class="exchange-section unit4-hard-exchange-section">
                        <h2 class="section-title unit4-hard-section-title">兌換區</h2>
                        <div id="drop-zone-area" class="drop-zone-container unit4-hard-drop-zone">
                            ${droppedItemsHTML}
                        </div>
                        <div class="current-total-display unit4-hard-total-display">目前總額: ??? 元</div>
                        <div class="unit4-hard-challenge-hint">💪 挑戰模式：沒有提示，靠實力取勝！</div>
                        <button id="confirm-btn" class="unit-btn unit4-hard-confirm-btn">完成</button>
                    </div>
                </div>
            `;

            // 綁定困難模式專用事件
            this.setupHardModeEventListeners(question);
        },

        // =====================================================
        // CSS樣式分離系統（參考unit3.js架構）
        // =====================================================
        getCommonCSS() {
            return `
                /* 深色主題基礎樣式 */
                body { 
                    background-color: #1a1a1a !important;
                    color: #ffffff !important;
                    margin: 0; 
                    padding: 0;
                    font-family: 'Microsoft JhengHei', '微軟正黑體', sans-serif;
                    display: block !important;
                    height: auto !important;
                    align-items: initial !important;
                    justify-content: initial !important;
                }
                #game-container { 
                    background-color: #1a1a1a !important; 
                    color: #ffffff !important; 
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                /* 遊戲主畫面樣式 */
                .game-board { 
                    background: var(--background-primary);
                    border-radius: 15px;
                    padding: 20px;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                }
                
                /* 標題列 */
                .title-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                    color: var(--text-inverse);
                    padding: 15px 25px;
                    box-shadow: var(--shadow-light);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    transition: var(--transition-normal);
                }
                .progress-info { font-size: 1.2em; font-weight: bold; }
                .target-amount { font-size: 1.8em; font-weight: bold; color: #f1c40f; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
                .score-info { font-size: 1.1em; }
                .back-to-menu-btn {
                    background: rgba(255,255,255,0.2);
                    color: var(--text-inverse);
                    border: 2px solid var(--text-inverse);
                    padding: 8px 16px;
                    border-radius: var(--radius-large);
                    cursor: pointer;
                    font-size: 0.9em;
                    transition: var(--transition-normal);
                }
                .back-to-menu-btn:hover {
                    background: var(--text-inverse);
                    color: var(--primary-color);
                }
                
                /* 區塊樣式 */
                .my-money-section, .exchange-section {
                    background: var(--background-card);
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 20px;
                    border: 2px solid var(--border-color);
                    box-shadow: var(--shadow-medium);
                }
                .section-title {
                    color: #3498db;
                    text-align: center;
                    margin: 0 0 15px 0;
                    font-size: 1.3em;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                }
                
                /* 金錢區域基礎樣式 */
                .money-source-container {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 15px;
                    min-height: 120px;
                    padding: 15px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 8px;
                    border: 2px dashed #7f8c8d;
                }
                .drop-zone-container {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 10px;
                    min-height: 150px;
                    padding: 20px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                    border: 3px dashed #95a5a6;
                    transition: all 0.3s ease;
                    align-content: flex-start;
                }
                .drop-zone-container.drag-over {
                    background: rgba(52, 152, 219, 0.2) !important;
                    border-color: #3498db !important;
                    border-style: solid !important;
                }
                .money-source-container.drag-over {
                    background: rgba(52, 152, 219, 0.1) !important;
                    border-color: #3498db !important;
                    border-style: solid !important;
                }
                
                /* 金錢物件基礎樣式 */
                .money-item { 
                    cursor: grab; 
                    text-align: center; 
                    user-select: none;
                    padding: 0 !important;
                    border-radius: 8px;
                    transition: transform 0.2s;
                    background: transparent !important;
                    border: none !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                
                /* 源金錢特定樣式覆蓋 */
                .source-money {
                    background: transparent !important;
                    border: none !important;
                    outline: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                }
                .money-item img {
                    max-width: 70px;
                    max-height: 50px;
                    object-fit: contain;
                    border-radius: 5px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }
                .money-item:hover {
                    transform: scale(1.05);
                    background: transparent;
                }
                .dropped-item {
                    background: transparent !important;
                    border: none !important;
                    animation: dropIn 0.3s ease-out;
                }
                
                /* 總額顯示基礎樣式 */
                .current-total-display { 
                    font-size: 1.5em; 
                    color: #2ecc71; 
                    text-align: center; 
                    margin: 15px 0; 
                    font-weight: bold;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                    transition: color 0.3s, transform 0.2s; 
                }
                
                /* 拖曳相關樣式 */
                .money-item.dragging { 
                    opacity: 0.5; 
                    transform: scale(1.1); 
                }
                
                @keyframes dropIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                
                /* 按鈕基礎樣式 */
                .unit-btn {
                    background: linear-gradient(135deg, #27ae60, #2ecc71);
                    color: #ffffff !important;
                    border: none;
                    padding: 18px 35px;
                    border-radius: 10px;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: block;
                    margin: 25px auto;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.4);
                    text-decoration: none;
                    text-align: center;
                }
                
                .unit-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, #2ecc71, #1abc9c);
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.5);
                }
            `;
        },

        getEasyModeCSS() {
            return `
                /* 簡單模式專用樣式 (unit4-easy-* 前綴) - 清潔版本 */
                
                .unit4-easy-section-title {
                    color: var(--text-primary) !important;
                }
                
                .unit4-easy-money-source {
                    border-color: #2ecc71;
                    background: rgba(46, 204, 113, 0.1);
                    min-height: 140px;
                }
                
                .unit4-easy-drop-zone {
                    border-color: #2ecc71;
                    background: rgba(46, 204, 113, 0.05);
                    min-height: 160px;
                    position: relative;
                    padding: 0;
                }
                
                .unit4-easy-source-item {
                    border: none;
                    background: transparent;
                    padding: 0;
                }
                
                .unit4-easy-source-item:hover {
                    box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
                    transform: scale(1.05);
                }
                
                /* 禁用圖片的預設拖曳行為，確保無邊框背景 */
                .unit4-easy-source-item img {
                    pointer-events: none;
                    user-select: none;
                    -webkit-user-drag: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    background: transparent !important;
                    border: none !important;
                    outline: none !important;
                }
                
                /* 簡單模式各面額金錢圖示大小調整 */
                .unit4-easy-source-item[data-value="1000"] img {
                    max-width: 154px !important; /* 220% of 70px */
                    max-height: 110px !important; /* 220% of 50px */
                }
                
                .unit4-easy-source-item[data-value="500"] img {
                    max-width: 133px !important; /* 190% of 70px */
                    max-height: 95px !important; /* 190% of 50px */
                }
                
                .unit4-easy-source-item[data-value="100"] img {
                    max-width: 126px !important; /* 180% of 70px */
                    max-height: 90px !important; /* 180% of 50px */
                }
                
                .unit4-easy-source-item[data-value="50"] img {
                    max-width: 140px !important; /* 200% of 70px */
                    max-height: 100px !important; /* 200% of 50px */
                }
                
                .unit4-easy-source-item[data-value="10"] img {
                    max-width: 133px !important; /* 190% of 70px */
                    max-height: 95px !important; /* 190% of 50px */
                }
                
                .unit4-easy-source-item[data-value="5"] img {
                    max-width: 126px !important; /* 180% of 70px */
                    max-height: 90px !important; /* 180% of 50px */
                }
                
                .unit4-easy-source-item[data-value="1"] img {
                    max-width: 119px !important; /* 170% of 70px */
                    max-height: 85px !important; /* 170% of 50px */
                }
                
                /* 確保金錢項目本身無邊框背景 */
                .unit4-easy-source-item {
                    border: none !important;
                    background: transparent !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                
                .unit4-easy-source-item:focus {
                    outline: none !important;
                    border: none !important;
                    background: transparent !important;
                }
                
                .unit4-easy-total-display {
                    color: #2ecc71;
                    font-size: 1.8em;
                    transition: color 0.3s ease;
                }
                
                .unit4-easy-total-display.over-amount {
                    color: #e74c3c !important;
                    font-weight: bold;
                    text-shadow: 0 0 5px rgba(231, 76, 60, 0.5);
                    animation: warning-pulse 1s ease-in-out infinite alternate;
                }
                
                .unit4-easy-auto-hint {
                    text-align: center;
                    color: #f1c40f;
                    background: rgba(241, 196, 15, 0.1);
                    padding: 15px;
                    border-radius: 8px;
                    margin: 10px 0;
                    border: 1px solid rgba(241, 196, 15, 0.3);
                    font-size: 1.1em;
                }
                
                /* 簡潔的視覺提示系統 */
                .visual-hints {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    justify-content: flex-start;
                    align-items: center;
                    padding: 20px;
                    background: transparent;
                    border-radius: 8px;
                    min-height: 120px;
                }
                
                .hint-item {
                    width: 140px;
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                }
                
                .hint-item img {
                    max-width: 140px;
                    max-height: 100px;
                    object-fit: contain;
                    border-radius: 3px;
                }
                
                /* 淡化狀態 */
                .hint-item.faded {
                    opacity: 0.3;
                    filter: grayscale(80%);
                    border: 1px dashed #ccc;
                }
                
                /* 點亮狀態 */
                .hint-item.lit-up {
                    opacity: 1;
                    filter: none;
                    background: rgba(46, 204, 113, 0.2);
                    border: 2px solid #2ecc71;
                    box-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
                }
            `;
        },

        getNormalModeCSS() {
            return `
                /* 普通模式專用樣式 (unit4-normal-* 前綴) */
                
                .unit4-normal-section-title {
                    color: var(--text-primary) !important;
                }
                
                .unit4-normal-money-source {
                    border-color: #3498db;
                    background: rgba(52, 152, 219, 0.1);
                }
                
                .unit4-normal-drop-zone {
                    border-color: #3498db;
                    background: rgba(52, 152, 219, 0.05);
                }
                
                .unit4-normal-source-item {
                    border: none;
                    background: transparent;
                    padding: 0;
                }
                
                .unit4-normal-source-item:hover {
                    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
                    transform: scale(1.05);
                }
                
                /* 普通模式拖曳金錢樣式 */
                .unit4-normal-dropped-item {
                    border: none;
                    background: transparent;
                    padding: 0;
                    margin: 5px;
                    cursor: grab;
                    user-select: none;
                }
                
                .unit4-normal-dropped-item:hover {
                    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
                    transform: scale(1.05);
                }
                
                .unit4-normal-dropped-item.dragging {
                    opacity: 0.5;
                    cursor: grabbing;
                }
                
                .unit4-normal-source-item img,
                .unit4-normal-dropped-item img {
                    pointer-events: none;
                    user-select: none;
                    -webkit-user-drag: none;
                    background: transparent !important;
                    border: none !important;
                    outline: none !important;
                }
                
                /* 普通模式各面額金錢圖示大小調整 */
                .unit4-normal-source-item[data-value="1000"] img,
                .unit4-normal-dropped-item[data-value="1000"] img {
                    max-width: 154px !important; /* 220% of 70px */
                    max-height: 110px !important; /* 220% of 50px */
                }
                
                .unit4-normal-source-item[data-value="500"] img,
                .unit4-normal-dropped-item[data-value="500"] img {
                    max-width: 133px !important; /* 190% of 70px */
                    max-height: 95px !important; /* 190% of 50px */
                }
                
                .unit4-normal-source-item[data-value="100"] img,
                .unit4-normal-dropped-item[data-value="100"] img {
                    max-width: 126px !important; /* 180% of 70px */
                    max-height: 90px !important; /* 180% of 50px */
                }
                
                .unit4-normal-source-item[data-value="50"] img,
                .unit4-normal-dropped-item[data-value="50"] img {
                    max-width: 140px !important; /* 200% of 70px */
                    max-height: 100px !important; /* 200% of 50px */
                }
                
                .unit4-normal-source-item[data-value="10"] img,
                .unit4-normal-dropped-item[data-value="10"] img {
                    max-width: 133px !important; /* 190% of 70px */
                    max-height: 95px !important; /* 190% of 50px */
                }
                
                .unit4-normal-source-item[data-value="5"] img,
                .unit4-normal-dropped-item[data-value="5"] img {
                    max-width: 126px !important; /* 180% of 70px */
                    max-height: 90px !important; /* 180% of 50px */
                }
                
                .unit4-normal-source-item[data-value="1"] img,
                .unit4-normal-dropped-item[data-value="1"] img {
                    max-width: 119px !important; /* 170% of 70px */
                    max-height: 85px !important; /* 170% of 50px */
                }
                
                .unit4-normal-total-display {
                    color: #3498db;
                    font-size: 1.8em;
                    transition: color 0.3s ease;
                }
                
                .unit4-normal-total-display.over-amount {
                    color: #e74c3c !important;
                    font-weight: bold;
                    text-shadow: 0 0 5px rgba(231, 76, 60, 0.5);
                    animation: warning-pulse 1s ease-in-out infinite alternate;
                }
                
                @keyframes warning-pulse {
                    from { opacity: 0.8; }
                    to { opacity: 1; }
                }
                
                .unit4-normal-hint {
                    text-align: center;
                    color: #f39c12;
                    background: rgba(243, 156, 18, 0.1);
                    padding: 15px;
                    border-radius: 8px;
                    margin: 10px 0;
                    border: 1px solid rgba(243, 156, 18, 0.3);
                    font-size: 1.1em;
                }
                
                .unit4-normal-confirm-btn {
                    background: linear-gradient(135deg, #3498db, #2980b9);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-size: 1.2em;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: block;
                    margin: 15px auto;
                    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
                }
                
                .unit4-normal-confirm-btn:hover {
                    background: linear-gradient(135deg, #2980b9, #1abc9c);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
                }
            `;
        },

        getHardModeCSS() {
            return `
                /* 困難模式專用樣式 (unit4-hard-* 前綴) */
                
                .unit4-hard-section-title {
                    color: var(--text-primary) !important;
                }
                
                .unit4-hard-money-source {
                    border-color: #3498db;
                    background: rgba(52, 152, 219, 0.1);
                }
                
                .unit4-hard-drop-zone {
                    border-color: #3498db;
                    background: rgba(52, 152, 219, 0.1);
                }
                
                .unit4-hard-source-item {
                    border: 2px solid #e74c3c;
                    background: rgba(231, 76, 60, 0.1);
                }
                
                .unit4-hard-source-item:hover {
                    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
                    border-color: #c0392b;
                }
                
                .unit4-hard-source-item img,
                .unit4-hard-dropped-item img {
                    pointer-events: none;
                    user-select: none;
                    -webkit-user-drag: none;
                    background: transparent !important;
                    border: none !important;
                    outline: none !important;
                }
                
                /* 困難模式各面額金錢圖示大小調整 */
                .unit4-hard-source-item[data-value="1000"] img,
                .unit4-hard-dropped-item[data-value="1000"] img {
                    max-width: 154px !important; /* 220% of 70px */
                    max-height: 110px !important; /* 220% of 50px */
                }
                
                .unit4-hard-source-item[data-value="500"] img,
                .unit4-hard-dropped-item[data-value="500"] img {
                    max-width: 133px !important; /* 190% of 70px */
                    max-height: 95px !important; /* 190% of 50px */
                }
                
                .unit4-hard-source-item[data-value="100"] img,
                .unit4-hard-dropped-item[data-value="100"] img {
                    max-width: 126px !important; /* 180% of 70px */
                    max-height: 90px !important; /* 180% of 50px */
                }
                
                .unit4-hard-source-item[data-value="50"] img,
                .unit4-hard-dropped-item[data-value="50"] img {
                    max-width: 140px !important; /* 200% of 70px */
                    max-height: 100px !important; /* 200% of 50px */
                }
                
                .unit4-hard-source-item[data-value="10"] img,
                .unit4-hard-dropped-item[data-value="10"] img {
                    max-width: 133px !important; /* 190% of 70px */
                    max-height: 95px !important; /* 190% of 50px */
                }
                
                .unit4-hard-source-item[data-value="5"] img,
                .unit4-hard-dropped-item[data-value="5"] img {
                    max-width: 126px !important; /* 180% of 70px */
                    max-height: 90px !important; /* 180% of 50px */
                }
                
                .unit4-hard-source-item[data-value="1"] img,
                .unit4-hard-dropped-item[data-value="1"] img {
                    max-width: 119px !important; /* 170% of 70px */
                    max-height: 85px !important; /* 170% of 50px */
                }
                
                .unit4-hard-total-display {
                    color: #e74c3c;
                    font-size: 1.4em;
                    filter: blur(2px); /* 困難模式：模糊總額顯示 */
                }
                
                .unit4-hard-confirm-btn {
                    background: linear-gradient(135deg, #3498db, #2980b9);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-size: 1.2em;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: block;
                    margin: 15px auto;
                    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
                }
                
                .unit4-hard-confirm-btn:hover {
                    background: linear-gradient(135deg, #2980b9, #1abc9c);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
                }
                
                .unit4-hard-challenge-hint {
                    text-align: center;
                    color: #f39c12;
                    background: rgba(243, 156, 18, 0.1);
                    padding: 15px;
                    border-radius: 8px;
                    margin: 10px 0;
                    border: 1px solid rgba(231, 76, 60, 0.3);
                    font-size: 1.1em;
                    font-weight: bold;
                }
            `;
        },

        /**
         * 產生一個有解的題目
         * @returns {{targetAmount: number}|null} - 包含目標金額的題目物件，或 null (如果生成失敗)
         */
        generateQuestion() {
            const { digits, denominations, customAmount } = this.state.settings;
            if (denominations.length === 0) return null;

            if (digits === 'custom') {
                // 自訂金額模式：使用最少硬幣+題數變化
                return this.generateCustomAmountQuestion(customAmount, denominations);
            } else {
                // 原有的位數範圍模式
                return this.generateDigitRangeQuestion(digits, denominations);
            }
        },

        // 新增：自訂金額模式的題目生成
        generateCustomAmountQuestion(customAmount, denominations) {
            // 檢查是否能包含所有幣值
            const minRequired = denominations.reduce((sum, coin) => sum + coin, 0);
            if (customAmount < minRequired) {
                console.error(`自訂金額${customAmount}元不足以包含所有幣值，最少需要${minRequired}元`);
                return null;
            }

            // 找出所有最少硬幣組合
            const allCombinations = this.findAllMinimumCombinationsWithAllCoins(customAmount, denominations);
            if (allCombinations.length === 0) {
                console.error("無法找到包含所有幣值的有效組合");
                return null;
            }

            // 根據題數選擇不同的組合，確保每題不同
            const currentQ = this.state.quiz.currentQuestion || 0;
            const selectedCombination = allCombinations[currentQ % allCombinations.length];
            
            console.log(`自訂金額模式 - 第${currentQ + 1}題:`);
            console.log(`目標金額: ${customAmount}元`);
            console.log(`可用組合數: ${allCombinations.length}`);
            console.log(`選中組合:`, selectedCombination);
            console.log(`硬幣總數: ${selectedCombination.length}`);
            
            return { 
                targetAmount: customAmount,
                solution: selectedCombination,
                allPossibleSolutions: allCombinations
            };
        },

        // 新增：位數範圍模式的題目生成（修正為包含所有幣值）
        generateDigitRangeQuestion(digits, denominations) {
            const minAmount = (digits === 1) ? 1 : Math.pow(10, digits - 1);
            const maxAmount = Math.pow(10, digits) - 1;

            // 計算使用所有幣值各1個的基礎金額
            const baseAmount = denominations.reduce((sum, coin) => sum + coin, 0);
            
            // 檢查基礎金額是否超出範圍
            if (baseAmount > maxAmount) {
                console.error(`${digits}位數範圍(${minAmount}-${maxAmount}元)無法包含所有選擇的幣值，最少需要${baseAmount}元`);
                return null;
            }

            // 找出在範圍內且包含所有幣值的所有可能組合
            const validTargets = [];
            for (let target = Math.max(minAmount, baseAmount); target <= maxAmount; target++) {
                const combinations = this.findAllMinimumCombinationsWithAllCoins(target, denominations);
                if (combinations.length > 0) {
                    validTargets.push({
                        targetAmount: target,
                        combinations: combinations
                    });
                }
            }

            if (validTargets.length === 0) {
                console.error(`${digits}位數範圍內無法找到包含所有幣值的有效組合`);
                return null;
            }

            // 根據題數選擇不同的目標金額和組合
            const currentQ = this.state.quiz.currentQuestion || 0;
            const selectedTarget = validTargets[currentQ % validTargets.length];
            const selectedCombination = selectedTarget.combinations[0]; // 使用第一個最少組合

            console.log(`位數模式 - 第${currentQ + 1}題:`);
            console.log(`位數範圍: ${digits}位數(${minAmount}-${maxAmount}元)`);
            console.log(`目標金額: ${selectedTarget.targetAmount}元`);
            console.log(`選中組合:`, selectedCombination);
            console.log(`硬幣總數: ${selectedCombination.length}`);

            return {
                targetAmount: selectedTarget.targetAmount,
                solution: selectedCombination,
                allValidTargets: validTargets
            };
        },

        // =====================================================
        // 視覺提示系統（簡單模式）
        // =====================================================
        generateVisualHints(targetAmount, availableDenominations) {
            // 產生一個可能的解法作為視覺提示
            const solution = this.findSolution(targetAmount, availableDenominations);
            if (!solution) return '';

            let hintsHTML = '<div class="visual-hints">';
            solution.forEach((value, index) => {
                const itemData = this.getItemData(value);
                if (itemData) {
                    const imageSrc = this.getRandomImage(itemData);
                    hintsHTML += `<div class="hint-item" data-value="${value}">
                        <img src="${imageSrc}" alt="${itemData.name}" />
                    </div>`;
                }
            });
            hintsHTML += '</div>';
            
            return hintsHTML;
        },
        
        generateVisualHintsWithState(targetAmount, availableDenominations) {
            // 簡化版本：產生視覺提示
            const solution = this.findSolution(targetAmount, availableDenominations);
            console.log('解法結果:', solution, '目標金額:', targetAmount);
            
            if (!solution) {
                console.error('無法找到解法為', targetAmount, '元');
                return '<div class="visual-hints"></div>';
            }

            // 確保droppedItems已初始化（如果renderEasyMode沒有初始化的話）
            if (!this.state.gameState.droppedItems || this.state.gameState.droppedItems.length !== solution.length) {
                this.state.gameState.droppedItems = new Array(solution.length).fill(null);
                console.log('generateVisualHintsWithState初始化droppedItems陣列:', this.state.gameState.droppedItems);
            }

            let hintsHTML = '<div class="visual-hints">';
            
            solution.forEach((value, index) => {
                const itemData = this.getItemData(value);
                
                if (itemData) {
                    const droppedItem = this.state.gameState.droppedItems[index];
                    const isLitUp = droppedItem !== null;
                    
                    // 決定要使用的圖片來源
                    // 如果已點亮，使用拖曳過來的圖片；否則，使用預設的提示圖片
                    const imageSrc = isLitUp ? droppedItem.imageSrc : this.state.gameState.hintImages[index];
                    
                    const hintClass = isLitUp ? 'hint-item lit-up' : 'hint-item faded';
                    
                    console.log(`位置 ${index}: ${value}元, 狀態: ${isLitUp ? '點亮' : '淡化'}`);
                    
                    hintsHTML += `<div class="${hintClass}" data-value="${value}" data-position="${index}">
                        <img src="${imageSrc}" alt="${itemData.name}" />
                        <div class="money-value">${itemData.name}</div>
                    </div>`;
                }
            });
            hintsHTML += '</div>';
            
            console.log('生成HTML完成，droppedItems狀態:', this.state.gameState.droppedItems);
            return hintsHTML;
        },

        findSolution(targetAmount, denominations) {
            // 簡單的貪心算法找出一個解法
            console.log('開始計算解法:', '目標金額:', targetAmount, '可用金錢:', denominations);
            
            const sortedDenoms = [...denominations].sort((a, b) => b - a); // 從大到小排序
            console.log('排序後的金錢:', sortedDenoms);
            
            const solution = [];
            let remaining = targetAmount;

            for (const denom of sortedDenoms) {
                console.log(`檢查 ${denom}元, 剩餘 ${remaining}元`);
                while (remaining >= denom) {
                    solution.push(denom);
                    remaining -= denom;
                    console.log(`添加 ${denom}元, 剩餘 ${remaining}元, 目前solution:`, solution);
                }
                if (remaining === 0) break;
            }
            
            console.log('最終解法:', solution, '剩餘:', remaining);
            return remaining === 0 ? solution : null;
        },

        // =====================================================
        // 事件監聽器分離系統（參考unit3.js架構）
        // =====================================================
        setupEasyModeEventListeners(question) {
            // 簡單模式專用的事件監聽器（防止重複綁定）
            const moneyItems = document.querySelectorAll('.unit4-easy-source-item');
            const droppedItems = document.querySelectorAll('.unit4-easy-dropped-item');
            const dropZone = document.querySelector('.unit4-easy-drop-zone');
            const moneySource = document.querySelector('.unit4-easy-money-source');

            // 🔧 [新增] 設置點擊事件處理 - 支援點擊放置功能
            this.setupClickEventListeners('easy');

            // 設置觸控拖拽支援
            this.setupTouchDragForEasyMode(question);

            // 直接為現有元素綁定事件（簡化方式）
            moneyItems.forEach(item => {
                // 為元素綁定事件監聽器
                const boundDragStart = this.handleDragStart.bind(this);
                const boundDragEnd = this.handleDragEnd.bind(this);
                
                item.addEventListener('dragstart', boundDragStart);
                item.addEventListener('dragend', boundDragEnd);
                
                console.log('為金錢物件綁定拖曳事件:', item.dataset.value);
                console.log('拖曳屬性:', item.draggable);
                console.log('元素類別:', item.className);
                console.log('元素HTML:', item.outerHTML);
                
                // 測試事件是否正確綁定
                item.addEventListener('mousedown', () => {
                    console.log('mousedown 事件觸發 - 元素可互動');
                });
                
                // 強制確認draggable屬性
                item.setAttribute('draggable', 'true');
            });
            
            // 不要為點亮的提示添加拖曳事件，只有源金錢才能拖曳
            // 點亮的圖示只是視覺顯示，不參與拖曳

            // 為放置區域添加拖放事件（簡化方式）
            if (dropZone) {
                // 創建綁定的函數引用
                const boundHandleDragOver = this.handleDragOver.bind(this);
                const boundHandleEasyModeDrop = (event) => this.handleEasyModeDrop(event, question);
                const boundHandleDragEnter = this.handleDragEnter.bind(this);
                const boundHandleDragLeave = this.handleDragLeave.bind(this);
                
                // 直接為元素綁定事件
                dropZone.addEventListener('dragover', boundHandleDragOver);
                dropZone.addEventListener('drop', boundHandleEasyModeDrop);
                dropZone.addEventListener('dragenter', boundHandleDragEnter);
                dropZone.addEventListener('dragleave', boundHandleDragLeave);
                
                console.log('為放置區域綁定拖放事件');
            }

            // 為金錢區域添加拖放事件（支援拖回）
            if (moneySource) {
                // 創建綁定的函數引用
                const boundHandleDragOver = this.handleDragOver.bind(this);
                const boundHandleDropBack = this.handleDropBack.bind(this);
                const boundHandleDragEnter = this.handleDragEnter.bind(this);
                const boundHandleDragLeave = this.handleDragLeave.bind(this);
                
                // 直接為元素綁定事件
                moneySource.addEventListener('dragover', boundHandleDragOver);
                moneySource.addEventListener('drop', boundHandleDropBack);
                moneySource.addEventListener('dragenter', boundHandleDragEnter);
                moneySource.addEventListener('dragleave', boundHandleDragLeave);
                
                console.log('為金錢源區域綁定拖回事件');
            }

            // 綁定按鈕事件
            const backToMenuBtn = document.querySelector('#back-to-menu-btn');
            if (backToMenuBtn) {
                backToMenuBtn.addEventListener('click', () => {
                    window.location.href = 'index.html';
                });
            }
        },

        setupNormalModeEventListeners(question) {
            // 普通模式專用的事件監聽器
            const moneyItems = document.querySelectorAll('.unit4-normal-source-item');
            const droppedItems = document.querySelectorAll('.unit4-normal-dropped-item');
            const dropZone = document.querySelector('.unit4-normal-drop-zone');
            const moneySource = document.querySelector('.unit4-normal-money-source');
            const confirmBtn = document.getElementById('confirm-btn');

            // 🔧 [新增] 設置點擊事件處理 - 支援點擊放置功能
            this.setupClickEventListeners('normal');

            // 設置觸控拖拽支援
            this.setupTouchDragForNormalMode(question);

            // 為源金錢物件添加拖曳事件
            moneyItems.forEach(item => {
                item.addEventListener('dragstart', this.handleDragStart.bind(this));
                item.addEventListener('dragend', this.handleDragEnd.bind(this));
            });

            // 為拖曳到兌換區的金錢添加事件
            console.log(`找到 ${droppedItems.length} 個兌換區金錢項目`);
            droppedItems.forEach((item, index) => {
                console.log(`綁定兌換區金錢事件 ${index + 1}:`, item.id, item.dataset.value + '元');
                item.addEventListener('dragstart', this.handleDragStart.bind(this));
                item.addEventListener('dragend', this.handleDragEnd.bind(this));
            });

            // 為放置區域添加拖放事件
            if (dropZone) {
                dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
                dropZone.addEventListener('drop', (event) => this.handleNormalModeDrop(event, question));
                dropZone.addEventListener('dragenter', this.handleDragEnter.bind(this));
                dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
            }

            // 為金錢區域添加拖放事件（支援拖回）
            if (moneySource) {
                moneySource.addEventListener('dragover', this.handleDragOver.bind(this));
                moneySource.addEventListener('drop', this.handleDropBack.bind(this));
                moneySource.addEventListener('dragenter', this.handleDragEnter.bind(this));
                moneySource.addEventListener('dragleave', this.handleDragLeave.bind(this));
            }

            // 綁定確認按鈕事件
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => this.handleNormalModeConfirm(question));
            }

            // 綁定返回主選單按鈕事件
            const backToMenuBtn = document.querySelector('#back-to-menu-btn');
            if (backToMenuBtn) {
                backToMenuBtn.addEventListener('click', () => {
                    window.location.href = 'index.html';
                });
            }
        },

        setupHardModeEventListeners(question) {
            // 困難模式專用的事件監聽器
            const moneyItems = document.querySelectorAll('.unit4-hard-source-item');
            const dropZone = document.querySelector('.unit4-hard-drop-zone');
            const moneySource = document.querySelector('.unit4-hard-money-source');

            // 🔧 [新增] 設置點擊事件處理 - 支援點擊放置功能
            this.setupClickEventListeners('hard');

            // 設置觸控拖拽支援
            this.setupTouchDragForHardMode(question);

            // 為每個金錢物件添加拖曳事件
            moneyItems.forEach(item => {
                item.addEventListener('dragstart', this.handleDragStart.bind(this));
                item.addEventListener('dragend', this.handleDragEnd.bind(this));
            });

            // 為兌換區中已存在的金錢添加拖曳事件（支援拖回）
            const droppedItems = document.querySelectorAll('.unit4-hard-dropped-item');
            console.log(`找到 ${droppedItems.length} 個兌換區金錢項目`);
            droppedItems.forEach((item, index) => {
                item.addEventListener('dragstart', this.handleDragStart.bind(this));
                item.addEventListener('dragend', this.handleDragEnd.bind(this));
                console.log(`綁定兌換區金錢事件 ${index + 1}: ${item.id} ${item.dataset.value}元`);
            });

            // 為放置區域添加拖放事件
            if (dropZone) {
                dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
                dropZone.addEventListener('drop', (event) => this.handleHardModeDrop(event, question));
                dropZone.addEventListener('dragenter', this.handleDragEnter.bind(this));
                dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
            }

            // 為金錢區域添加拖放事件（支援拖回）
            if (moneySource) {
                moneySource.addEventListener('dragover', this.handleDragOver.bind(this));
                moneySource.addEventListener('drop', this.handleDropBack.bind(this));
                moneySource.addEventListener('dragenter', this.handleDragEnter.bind(this));
                moneySource.addEventListener('dragleave', this.handleDragLeave.bind(this));
            }

            // 綁定按鈕事件
            const backToMenuBtn = document.querySelector('#back-to-menu-btn');
            if (backToMenuBtn) {
                backToMenuBtn.addEventListener('click', () => {
                    window.location.href = 'index.html';
                });
            }
            
            const confirmBtn = document.querySelector('#confirm-btn');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => this.handleHardModeConfirm(question));
            }
        },

        updateVisualHints() {
            const hintItems = document.querySelectorAll('.hint-item');
            const droppedItems = this.state.gameState.droppedItems;
            
            // 計算每種幣值的數量
            const droppedCounts = {};
            droppedItems.forEach(item => {
                droppedCounts[item.value] = (droppedCounts[item.value] || 0) + 1;
            });

            // 更新提示項目的顯示狀態
            const hintCounts = {};
            hintItems.forEach(hint => {
                const value = parseInt(hint.dataset.value);
                hintCounts[value] = (hintCounts[value] || 0) + 1;
                
                const filledCount = droppedCounts[value] || 0;
                const hintIndex = hintCounts[value] - 1;
                
                if (hintIndex < filledCount) {
                    hint.classList.add('filled');
                } else {
                    hint.classList.remove('filled');
                }
            });
        },

        // =====================================================
        // 拖曳處理分離系統（參考unit3.js架構）
        // =====================================================

        handleDragStart(event) {
            console.log('handleDragStart 被調用');
            console.log('event.target:', event.target);
            console.log('event.target.tagName:', event.target.tagName);
            
            const item = event.target.closest('.money-item');
            console.log('拖曳項目:', item);
            console.log('項目dataset:', item ? item.dataset : 'null');
            
            if (!item || !item.dataset.value) {
                console.error('Invalid drag item or missing data-value');
                console.error('請確認拖曳的是正確的元素');
                return;
            }
            
            const value = parseInt(item.dataset.value);
            if (isNaN(value)) {
                console.error('Invalid value in dataset:', item.dataset.value);
                return;
            }
            
            const imageElement = item.querySelector('img'); // Get the image element
            const imageSrc = imageElement ? imageElement.src : ''; // Get its src

            // 更準確的來源判斷
            let fromZone = 'source'; // 默認為源區域
            if (item.closest('#drop-zone-area')) {
                fromZone = 'drop'; // 來自兌換區
            } else if (item.closest('#money-source-area')) {
                fromZone = 'source'; // 來自金錢區
            }

            const dragData = {
                value: value,
                id: item.id || `money-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                fromZone: fromZone,
                imageSrc: imageSrc // Add the image source
            };
            
            const jsonData = JSON.stringify(dragData);
            console.log('設置拖曳數據:', jsonData);
            
            event.dataTransfer.setData('text/plain', jsonData);
            
            console.log('開始拖曳:', value, '元');
            
            // 視覺效果
            item.style.opacity = '0.5';
            item.classList.add('dragging');
        },

        handleDragEnd(event) {
            const item = event.target;
            item.style.opacity = '1';
            item.classList.remove('dragging');
        },

        handleDragOver(event) {
            event.preventDefault(); // 允許放置
        },

        handleDragEnter(event) {
            event.preventDefault();
            if (event.target.classList.contains('drop-zone-container') || event.target.classList.contains('money-source-container')) {
                event.target.classList.add('drag-over');
            }
        },

        handleDragLeave(event) {
            if (event.target.classList.contains('drop-zone-container') || event.target.classList.contains('money-source-container')) {
                event.target.classList.remove('drag-over');
            }
        },

        // =====================================================
        // 簡單模式拖曳處理（完全獨立）
        // =====================================================
        handleEasyModeDrop(event, question) {
            event.preventDefault();
            const dropZone = event.currentTarget;
            dropZone.classList.remove('drag-over');

            // 防重複觸發機制
            if (this.isProcessingDrop) {
                console.log('拖曳正在處理中，忽略重複事件');
                return;
            }
            this.isProcessingDrop = true;

            try {
                const rawData = event.dataTransfer.getData('text/plain');
                console.log('原始拖曳數據:', rawData);
                
                if (!rawData || rawData.trim() === '') {
                    console.error('拖曳數據為空');
                    return;
                }
                
                const data = JSON.parse(rawData);
                const { value, id, fromZone, imageSrc } = data;
                
                console.log(`=== 開始處理拖曳 ===`);
                console.log(`拖曳資料: value=${value}, id=${id}, fromZone=${fromZone}`);

                // 重新設計：找到與拖曳金錢匹配的淡化圖示位置
                const solution = this.findSolution(question.targetAmount, this.state.settings.denominations);
                if (!solution) {
                    this.audio.playErrorSound();
                    this.showMessage('無法找到解法！', 'error');
                    return;
                }
                
                // 確保droppedItems陣列存在且長度正確（避免重複初始化）
                if (!this.state.gameState.droppedItems || this.state.gameState.droppedItems.length !== solution.length) {
                    this.state.gameState.droppedItems = new Array(solution.length).fill(null);
                    console.log('handleEasyModeDrop重新初始化droppedItems:', this.state.gameState.droppedItems);
                }
                
                // 找到第一個匹配的淡化位置（還沒被點亮的）
                let targetPosition = -1;
                for (let i = 0; i < solution.length; i++) {
                    if (solution[i] === value && this.state.gameState.droppedItems[i] === null) {
                        targetPosition = i;
                        break;
                    }
                }
                
                console.log(`尋找 ${value}元的位置, 找到位置: ${targetPosition}`);
                console.log(`solution:`, solution);
                console.log(`目前droppedItems狀態:`, this.state.gameState.droppedItems);
                
                if (targetPosition === -1) {
                    this.audio.playErrorSound();
                    this.showMessage('沒有匹配的位置或已被佔據！', 'error');
                    console.log(`=== 拖曳失敗：沒有找到匹配位置 ===`);
                    return;
                }

                // 防止超過目標金額
                const { targetAmount } = question;
                const newTotal = this.state.gameState.currentTotal + value;
                
                if (newTotal > targetAmount) {
                    this.audio.playErrorSound();
                    this.showMessage('超過目標金額了！', 'error');
                    return;
                }

                // 播放拖曳音效
                this.audio.playDropSound();

                // 更新遊戲狀態：在指定位置記錄金錢
                this.state.gameState.currentTotal = newTotal;
                console.log(`拖曳前狀態:`, this.state.gameState.droppedItems);
                this.state.gameState.droppedItems[targetPosition] = { id, value, imageSrc };
                
                console.log(`點亮效果：位置 ${targetPosition} 點亮 (${value}元)，總額: ${newTotal}元`);
                console.log('更新後狀態:', this.state.gameState.droppedItems);

                // 重新渲染整個遊戲畫面（從狀態重建，包含更新的總額）
                this.renderEasyMode(question);
                
                // 先重新繫定事件監聽器
                this.setupEasyModeEventListeners(question);
                
                // 簡單模式專用：語音反饋（總額播報），完成後檢查答案
                console.log(`準備播報語音: 總共${newTotal}元`);
                console.log(`語音系統狀態: isReady=${this.speech.isReady}, voice=${this.speech.voice ? this.speech.voice.name : 'null'}`);
                this.speech.speak(`總共${newTotal}元`, {
                    callback: () => {
                        // 語音播放完畢後才檢查答案
                        this.checkEasyModeAutoAnswer(question);
                    }
                });
                console.log(`語音播報已調用`);

            } catch (error) {
                console.error('簡單模式拖放處理錯誤:', error);
                if (error instanceof SyntaxError) {
                    console.error('JSON解析失敗，拖曳數據可能未正確設置');
                    console.error('請檢查handleDragStart是否正確執行');
                }
                // 播放錯誤音效
                this.audio.playErrorSound();
            } finally {
                // 重置處理標誌
                setTimeout(() => {
                    this.isProcessingDrop = false;
                }, 100);
            }
        },

        // =====================================================
        // 普通模式拖曳處理（完全獨立）
        // =====================================================
        handleNormalModeDrop(event, question) {
            event.preventDefault();
            const dropZone = event.currentTarget;
            dropZone.classList.remove('drag-over');

            try {
                const data = JSON.parse(event.dataTransfer.getData('text/plain'));
                const { value, id, fromZone } = data;

                // 計算新的總額（允許超過目標金額）
                const { targetAmount } = question;
                const newTotal = this.state.gameState.currentTotal + value;

                // 播放拖曳音效
                this.audio.playDropSound();

                // 檢查是否已存在相同ID的項目（防止重複）
                const existingItem = this.state.gameState.droppedItems.find(item => item.id === id);
                if (existingItem) {
                    console.log(`物件 ${id} 已存在，跳過重複添加`);
                    return;
                }

                // 更新遊戲狀態（狀態驅動渲染）
                this.state.gameState.currentTotal = newTotal;
                this.state.gameState.droppedItems.push({ id, value });
                
                console.log(`普通模式拖曳：${value}元，總額: ${newTotal}元`);
                console.log('更新後狀態:', this.state.gameState.droppedItems);

                // 重新渲染整個遊戲畫面（從狀態重建）
                this.renderNormalMode(question);
                
                // 重新繫結事件監聽器
                this.setupNormalModeEventListeners(question);

                // 普通模式專用：語音反饋（總額播報）
                this.speech.speak(`現在總共是${newTotal}元`);

            } catch (error) {
                console.error('普通模式拖放處理錯誤:', error);
            }
        },

        // =====================================================
        // 困難模式拖曳處理（完全獨立）
        // =====================================================
        handleHardModeDrop(event, question) {
            event.preventDefault();
            const dropZone = event.currentTarget;
            dropZone.classList.remove('drag-over');

            try {
                const data = JSON.parse(event.dataTransfer.getData('text/plain'));
                const { value, id, fromZone } = data;

                // 檢查重複添加
                const existingItem = this.state.gameState.droppedItems.find(item => item.id === id);
                if (existingItem) {
                    console.log(`物件 ${id} 已存在，跳過重複添加`);
                    return;
                }

                // 計算新的總額（允許超過目標金額，但會有視覺提醒）
                const newTotal = this.state.gameState.currentTotal + value;
                
                // 播放拖曳音效
                this.audio.playDropSound();

                // 更新遊戲狀態
                this.state.gameState.currentTotal = newTotal;
                this.state.gameState.droppedItems.push({ id, value });

                console.log(`困難模式拖曳：${value}元，總額: ${newTotal}元`);
                console.log('更新後狀態:', this.state.gameState.droppedItems);

                // 重新渲染整個遊戲畫面（從狀態重建）
                this.renderHardMode(question);
                this.setupHardModeEventListeners(question);

                // 困難模式專用：無語音提示，無自動檢查

            } catch (error) {
                console.error('困難模式拖放處理錯誤:', error);
            }
        },

        handleDropBack(event) {
            event.preventDefault();
            event.stopPropagation(); // 防止事件冒泡造成重複處理
            const sourceZone = event.currentTarget;
            sourceZone.classList.remove('drag-over');

            try {
                const data = JSON.parse(event.dataTransfer.getData('text/plain'));
                const { value, id, fromZone } = data;
                
                console.log('拖回處理 - 接收到的資料:', data);
                console.log('fromZone:', fromZone, 'value:', value, 'id:', id);

                // 只處理從兌換區拖回的物件
                if (fromZone === 'drop') {
                    const difficulty = this.state.settings.difficulty;
                    let itemFound = false;
                    
                    if (difficulty === 'easy') {
                        // 簡單模式：使用位置陣列
                        if (this.state.gameState.droppedItems) {
                            for (let i = 0; i < this.state.gameState.droppedItems.length; i++) {
                                const item = this.state.gameState.droppedItems[i];
                                if (item && item.value === value) {
                                    this.state.gameState.droppedItems[i] = null;
                                    itemFound = true;
                                    console.log(`簡單模式拖回成功：位置 ${i} 清空 (${value}元)`);
                                    break;
                                }
                            }
                        }
                    } else if (difficulty === 'normal' || difficulty === 'hard') {
                        // 普通/困難模式：使用對象陣列，根據ID移除
                        if (this.state.gameState.droppedItems) {
                            const originalLength = this.state.gameState.droppedItems.length;
                            this.state.gameState.droppedItems = this.state.gameState.droppedItems.filter(item => item.id !== id);
                            itemFound = this.state.gameState.droppedItems.length < originalLength;
                            if (itemFound) {
                                console.log(`${difficulty}模式拖回成功：移除ID ${id} (${value}元)`);
                            }
                        }
                    }
                    
                    // 只有在實際找到並移除物件時才更新總額
                    if (itemFound) {
                        this.state.gameState.currentTotal -= value;
                        console.log(`總額更新：${this.state.gameState.currentTotal + value} -> ${this.state.gameState.currentTotal}元`);
                        
                        // 驗證總額是否與實際兌換區物件一致
                        this.validateCurrentTotal();
                        
                        // 播放拖回後的總額語音
                        const currentTotal = this.state.gameState.currentTotal;
                        if (this.speech && typeof this.speech.speak === 'function') {
                            this.speech.speak(`現在總共是${currentTotal}元`, { interrupt: true });
                        }
                    } else {
                        console.log(`拖回警告：物件 ${id} (${value}元) 在兌換區中未找到，總額不變`);
                    }
                    
                    // 總額顯示會在重新渲染時自動更新
                    
                    // 根據模式重新渲染
                    const currentQuestion = this.state.quiz.questions[this.state.quiz.currentQuestion - 1];
                    
                    if (difficulty === 'easy' && currentQuestion) {
                        this.renderEasyMode(currentQuestion);
                        this.setupEasyModeEventListeners(currentQuestion);
                    } else if (difficulty === 'normal' && currentQuestion) {
                        this.renderNormalMode(currentQuestion);
                        this.setupNormalModeEventListeners(currentQuestion);
                    } else if (difficulty === 'hard' && currentQuestion) {
                        this.renderHardMode(currentQuestion);
                        this.setupHardModeEventListeners(currentQuestion);
                    }
                }

            } catch (error) {
                console.error('拖回處理錯誤:', error);
            }
        },

        // =====================================================
        // 煙火動畫系統
        // =====================================================
        startFullscreenFireworks(callback) {
            console.log('開始全屏煙火動畫');
            
            // 立即清空遊戲容器，避免背景畫面閃現
            const gameContainer = document.getElementById('app');
            gameContainer.innerHTML = '';
            
            // 創建全屏煙火畫布
            const canvas = document.createElement('canvas');
            canvas.id = 'fullscreen-fireworks-canvas';
            canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 9999;
                background: linear-gradient(135deg, #1e3c72, #2a5298, #1a1a2e);
                pointer-events: none;
            `;
            document.body.appendChild(canvas);
            
            // 播放成功音效
            this.audio.playSuccessSound();
            
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const fireworks = [];
            let animationId;
            
            // 煙火和粒子類別（與原函數相同的實現）
            class Firework {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                    this.particles = [];
                    this.hue = Math.random() * 360;
                    this.createParticles();
                }
                
                createParticles() {
                    for (let i = 0; i < 50; i++) {
                        this.particles.push(new Particle(this.x, this.y, this.hue));
                    }
                }
                
                update() {
                    this.particles.forEach((particle, index) => {
                        particle.update();
                        if (particle.alpha <= 0) {
                            this.particles.splice(index, 1);
                        }
                    });
                }
                
                draw(ctx) {
                    this.particles.forEach(particle => {
                        particle.draw(ctx);
                    });
                }
            }
            
            class Particle {
                constructor(x, y, hue) {
                    this.x = x;
                    this.y = y;
                    this.vx = (Math.random() - 0.5) * 8;
                    this.vy = (Math.random() - 0.5) * 8;
                    this.alpha = 1;
                    this.decay = Math.random() * 0.03 + 0.01;
                    this.hue = hue + (Math.random() - 0.5) * 30;
                    this.size = Math.random() * 3 + 1;
                }
                
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.vy += 0.1; // 重力
                    this.alpha -= this.decay;
                }
                
                draw(ctx) {
                    ctx.save();
                    ctx.globalAlpha = this.alpha;
                    ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
            
            function animate() {
                ctx.fillStyle = 'rgba(30, 60, 114, 0.1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // 創建新煙火
                if (Math.random() < 0.3) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height * 0.6;
                    fireworks.push(new Firework(x, y));
                }
                
                // 更新和繪製煙火
                fireworks.forEach((firework, index) => {
                    firework.update();
                    firework.draw(ctx);
                    
                    if (firework.particles.length === 0) {
                        fireworks.splice(index, 1);
                    }
                });
                
                animationId = requestAnimationFrame(animate);
            }
            
            animate();
            
            // 3秒後開始淡出並執行回調
            setTimeout(() => {
                console.log('煙火動畫開始淡出，準備顯示結果視窗');
                canvas.style.transition = 'opacity 1s';
                canvas.style.opacity = '0';
                
                // 1秒淡出後移除畫布並執行回調
                setTimeout(() => {
                    cancelAnimationFrame(animationId);
                    document.body.removeChild(canvas);
                    console.log('煙火動畫結束，執行回調');
                    if (callback) callback();
                }, 1000);
            }, 3000);
        },

        startFireworksAnimation() {
            // 確保在下一個事件循環中執行，讓DOM完全載入
            setTimeout(() => {
                const canvas = document.getElementById('fireworks-canvas');
                if (!canvas) {
                    console.log('煙火畫布未找到');
                    return;
                }
                
                console.log('開始煙火動畫');
                const ctx = canvas.getContext('2d');
                
                // 設置畫布大小
                const updateCanvasSize = () => {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                };
                updateCanvasSize();
                
                const fireworks = [];
                const particles = [];
                
                class Firework {
                    constructor(x, y) {
                        this.x = x;
                        this.y = y;
                        this.targetY = Math.random() * canvas.height * 0.5;
                        this.speed = Math.random() * 3 + 2;
                        this.color = `hsl(${Math.random() * 360}, 50%, 50%)`;
                        this.exploded = false;
                    }
                    
                    update() {
                        if (!this.exploded) {
                            this.y -= this.speed;
                            if (this.y <= this.targetY) {
                                this.explode();
                            }
                        }
                    }
                    
                    explode() {
                        this.exploded = true;
                        for (let i = 0; i < 30; i++) {
                            particles.push(new Particle(this.x, this.y, this.color));
                        }
                    }
                    
                    draw() {
                        if (!this.exploded) {
                            ctx.beginPath();
                            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                            ctx.fillStyle = this.color;
                            ctx.fill();
                        }
                    }
                }
                
                class Particle {
                    constructor(x, y, color) {
                        this.x = x;
                        this.y = y;
                        this.vx = (Math.random() - 0.5) * 8;
                        this.vy = (Math.random() - 0.5) * 8;
                        this.alpha = 1;
                        this.color = color;
                        this.decay = Math.random() * 0.02 + 0.01;
                    }
                    
                    update() {
                        this.x += this.vx;
                        this.y += this.vy;
                        this.vy += 0.1; // gravity
                        this.alpha -= this.decay;
                    }
                    
                    draw() {
                        ctx.save();
                        ctx.globalAlpha = this.alpha;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
                        ctx.fillStyle = this.color;
                        ctx.fill();
                        ctx.restore();
                    }
                }
                
                let animationId;
                function animate() {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // 更新和繪製煙火
                    for (let i = fireworks.length - 1; i >= 0; i--) {
                        fireworks[i].update();
                        fireworks[i].draw();
                        if (fireworks[i].exploded) {
                            fireworks.splice(i, 1);
                        }
                    }
                    
                    // 更新和繪製粒子
                    for (let i = particles.length - 1; i >= 0; i--) {
                        particles[i].update();
                        particles[i].draw();
                        if (particles[i].alpha <= 0) {
                            particles.splice(i, 1);
                        }
                    }
                    
                    animationId = requestAnimationFrame(animate);
                }
                
                // 創建煙火
                function createFirework() {
                    const x = Math.random() * canvas.width;
                    const y = canvas.height;
                    fireworks.push(new Firework(x, y));
                }
                
                // 開始動畫
                animate();
                
                // 定期創建煙火（前5秒）
                const fireworkInterval = setInterval(createFirework, 300);
                setTimeout(() => {
                    clearInterval(fireworkInterval);
                    console.log('停止創建煙火');
                    // 3秒後停止動畫並移除畫布
                    setTimeout(() => {
                        cancelAnimationFrame(animationId);
                        if (canvas && canvas.parentNode) {
                            canvas.style.opacity = '0';
                            canvas.style.transition = 'opacity 2s ease-out';
                            setTimeout(() => {
                                if (canvas.parentNode) {
                                    canvas.remove();
                                    console.log('煙火畫布已移除');
                                }
                            }, 2000);
                        }
                    }, 3000);
                }, 5000);
                
                // 處理視窗大小改變
                window.addEventListener('resize', updateCanvasSize);
                
            }, 100); // 延遲100ms確保DOM載入
        },

        updateCurrentTotal() {
            const totalDisplay = document.querySelector('.current-total-display');
            const { currentTotal, targetAmount } = this.state.gameState;
            
            if (totalDisplay) {
                totalDisplay.textContent = `目前總額: ${currentTotal} 元`;
                
                // 視覺反饋
                if (currentTotal === targetAmount) {
                    totalDisplay.style.color = '#2ecc71'; // 綠色：正確
                    totalDisplay.style.fontWeight = 'bold';
                    totalDisplay.style.textShadow = '0 0 10px rgba(46, 204, 113, 0.5)';
                } else if (currentTotal > targetAmount * 0.8) {
                    totalDisplay.style.color = '#f1c40f'; // 黃色：接近
                    totalDisplay.style.fontWeight = 'normal';
                    totalDisplay.style.textShadow = 'none';
                } else {
                    totalDisplay.style.color = '#ffffff'; // 白色：正常
                    totalDisplay.style.fontWeight = 'normal';
                    totalDisplay.style.textShadow = 'none';
                }
                
                console.log(`總額更新: ${currentTotal}/${targetAmount} 元`);
            }
        },

        // 驗證總額是否與實際兌換區物件一致
        validateCurrentTotal() {
            if (!this.state.gameState.droppedItems) {
                return;
            }
            
            const difficulty = this.state.settings.difficulty;
            let actualTotal = 0;
            
            if (difficulty === 'easy') {
                // 簡單模式：計算位置陣列中的總額
                this.state.gameState.droppedItems.forEach(item => {
                    if (item && item.value) {
                        actualTotal += item.value;
                    }
                });
            } else if (difficulty === 'normal' || difficulty === 'hard') {
                // 普通/困難模式：計算對象陣列中的總額
                this.state.gameState.droppedItems.forEach(item => {
                    if (item && item.value) {
                        actualTotal += item.value;
                    }
                });
            }
            
            // 如果總額不一致，修正它
            if (this.state.gameState.currentTotal !== actualTotal) {
                console.log(`總額不一致修正：${this.state.gameState.currentTotal} -> ${actualTotal}元`);
                this.state.gameState.currentTotal = actualTotal;
            }
        },

        // 語音反饋系統已經被分離到各模式的拖曳處理函數中

        checkEasyModeAutoAnswer(question) {
            const { currentTotal, targetAmount } = this.state.gameState;
            if (currentTotal === targetAmount) {
                this.handleEasyModeCorrectAnswer(question);
            }
        },

        // =====================================================
        // 簡單模式答對處理（完全獨立）
        // =====================================================
        handleEasyModeCorrectAnswer(question) {
            // 防止重複計分
            if (this.state.gameState.questionAnswered) {
                console.log('簡單模式：題目已答對，防止重複計分');
                return;
            }
            this.state.gameState.questionAnswered = true;

            const { targetAmount } = this.state.gameState;

            // 播放成功音效
            this.audio.playSuccessSound();

            // 更新分數
            this.state.quiz.score += 10;

            // 顯示成功訊息
            this.showMessage('恭喜答對了！10分', 'success');

            console.log(`簡單模式答對：目前總分 ${this.state.quiz.score} 分`);

            // 播放語音，並在語音結束後進入下一題
            this.speech.speak(`恭喜你答對了，總共是${targetAmount}元`, {
                callback: () => setTimeout(() => this.nextQuestion(), 500)
            });
        },

        // =====================================================
        // 普通模式確認處理（完全獨立）
        // =====================================================
        handleNormalModeConfirm(question) {
            const { currentTotal } = this.state.gameState;
            const { targetAmount } = question;
            
            if (currentTotal === targetAmount) {
                // 防止重複計分
                if (this.state.gameState.questionAnswered) {
                    console.log('普通模式：題目已答對，防止重複計分');
                    return;
                }
                this.state.gameState.questionAnswered = true;

                // 答對處理：先播放音效，再播放語音
                this.audio.playSuccessSound();
                this.state.quiz.score += 10;
                this.showMessage('恭喜答對了！10分', 'success');

                console.log(`普通模式答對：目前總分 ${this.state.quiz.score} 分`);

                // 語音播報答對結果，並在語音結束後進入下一題
                this.speech.speak(`恭喜你答對了，總共是${targetAmount}元`, {
                    callback: () => setTimeout(() => this.nextQuestion(), 500)
                });
            } else {
                // 答錯處理
                this.handleNormalModeIncorrectAnswer(question);
            }
        },

        // =====================================================
        // 困難模式確認處理（完全獨立）
        // =====================================================
        handleHardModeConfirm(question) {
            const { currentTotal, targetAmount } = this.state.gameState;
            
            if (currentTotal === targetAmount) {
                // 防止重複計分
                if (this.state.gameState.questionAnswered) {
                    console.log('困難模式：題目已答對，防止重複計分');
                    return;
                }
                this.state.gameState.questionAnswered = true;

                // 答對處理：先播放音效，再語音播報
                this.audio.playSuccessSound();
                this.state.quiz.score += 10;
                this.showMessage('恭喜答對了！10分', 'success');

                console.log(`困難模式答對：目前總分 ${this.state.quiz.score} 分`);

                // 語音播報答對結果，並在語音結束後進入下一題
                this.speech.speak(`恭喜你答對了，總共是${targetAmount}元`, {
                    callback: () => setTimeout(() => this.nextQuestion(), 500)
                });
            } else {
                // 答錯處理
                this.handleHardModeIncorrectAnswer(question);
            }
        },

        nextQuestion() {
            // 防止重複調用
            if (this.state.loadingQuestion) {
                console.log('正在載入題目中，忽略重複調用');
                return;
            }
            
            const nextIndex = this.state.gameState.questionIndex + 1;
            this.loadQuestion(nextIndex);
        },

        // 舊的函數已經被分離為handleNormalModeConfirm和handleHardModeConfirm

        // =====================================================
        // 普通模式答錯處理（完全獨立）
        // =====================================================
        handleNormalModeIncorrectAnswer(question) {
            this.audio.playErrorSound();
            this.speech.speak('對不起，你答錯了，請再試一次');
            
            const { mode } = this.state.settings;
            
            if (mode === 'single') {
                // 單次測驗：答錯也進入下一題（0分）
                this.showMessage('答案不正確！0分', 'error');
                setTimeout(() => {
                    this.nextQuestion();
                }, 2000);
            } else {
                // 重複測驗：答錯重試
                this.showMessage('答案不正確，請再試一次！', 'error');
                // 普通模式：答錯時清空兌換區
                this.clearNormalModeDropZone();
            }
        },

        // =====================================================
        // 困難模式答錯處理（完全獨立）
        // =====================================================
        handleHardModeIncorrectAnswer(question) {
            this.audio.playErrorSound();
            
            const { currentTotal, targetAmount } = this.state.gameState;
            const { mode } = this.state.settings;
            
            // 困難模式：答錯時播放詳細語音提示
            this.speech.speak(`對不起，答錯了，你的總金額${currentTotal}元，不是${targetAmount}元，請再試一次`);
            
            if (mode === 'single') {
                // 單次測驗：答錯也進入下一題（0分）
                this.showMessage('答案不正確！0分', 'error');
                setTimeout(() => {
                    this.nextQuestion();
                }, 2000);
            } else {
                // 重複測驗：答錯重試
                this.showMessage('答案不正確，請再試一次！', 'error');
                // 困難模式：答錯時清空兌換區
                this.clearHardModeDropZone();
            }
        },

        // =====================================================
        // 清空處理分離系統（參考unit3.js架構）
        // =====================================================
        clearEasyModeDropZone() {
            // 重置遊戲狀態（狀態驅動渲染）
            this.state.gameState.currentTotal = 0;
            this.state.gameState.droppedItems = [];
            
            console.log('清空簡單模式狀態，重新渲染');
            
            // 重新渲染整個遊戲畫面
            const currentQuestion = this.state.quiz.questions[this.state.quiz.currentQuestion - 1];
            if (currentQuestion) {
                this.renderEasyMode(currentQuestion);
                this.setupEasyModeEventListeners(currentQuestion);
            }
        },

        clearNormalModeDropZone() {
            // 普通模式專用：清空兌換區（狀態驅動渲染）
            // 重置遊戲狀態
            this.state.gameState.currentTotal = 0;
            this.state.gameState.droppedItems = [];
            
            console.log('普通模式清空兌換區，重置狀態');
            
            // 重新渲染整個畫面
            const currentQuestion = this.state.quiz.questions[this.state.quiz.currentQuestion - 1];
            if (currentQuestion) {
                this.renderNormalMode(currentQuestion);
                this.setupNormalModeEventListeners(currentQuestion);
            }
        },

        clearHardModeDropZone() {
            // 困難模式專用：清空兌換區（狀態驅動）
            console.log('清空困難模式狀態，重新渲染');
            
            // 重置遊戲狀態
            this.state.gameState.currentTotal = 0;
            this.state.gameState.droppedItems = [];
            
            // 重新渲染整個遊戲畫面
            const currentQuestion = this.state.quiz.questions[this.state.quiz.currentQuestion - 1];
            if (currentQuestion) {
                this.renderHardMode(currentQuestion);
                this.setupHardModeEventListeners(currentQuestion);
            }
        },

        showMessage(text, type) {
            // 簡單的訊息顯示系統
            const message = document.createElement('div');
            message.className = `message ${type}`;
            message.textContent = text;
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
                color: white;
                padding: 20px;
                border-radius: 10px;
                font-size: 1.2em;
                z-index: 1000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            `;
            
            document.body.appendChild(message);
            
            setTimeout(() => {
                document.body.removeChild(message);
            }, 2000);
        },

        // =====================================================
        // 語音播報測驗結果
        // =====================================================
        speakResults(score, totalQuestions, percentage) {
            const correctAnswers = score / 10;
            let performanceText = '';
            
            // 根據百分比確定表現評價
            if (percentage >= 90) {
                performanceText = '你的表現優異';
            } else if (percentage >= 70) {
                performanceText = '你的表現良好';
            } else if (percentage >= 50) {
                performanceText = '你還需努力';
            } else {
                performanceText = '請你多加練習';
            }
            
            const speechText = `恭喜你完成全部測驗，總共答對${correctAnswers}題，獲得${score}分，${performanceText}`;
            console.log('語音播報:', speechText);
            
            // 使用已有的語音系統播報
            this.speech.speak(speechText, { interrupt: true });
        },

        showResults() {
            const { score, totalQuestions } = this.state.quiz;
            const percentage = Math.round((score / 10 / totalQuestions) * 100);
            
            // 第一階段：啟動全屏煙火動畫 + 音效
            this.startFullscreenFireworks(() => {
                // 第二階段：煙火結束後顯示結果視窗
                this.displayResultsWindow();
                
                // 第三階段：1秒後開始語音播報
                setTimeout(() => {
                    this.speakResults(score, totalQuestions, percentage);
                }, 1000);
            });
        },

        displayResultsWindow() {
            const gameContainer = document.getElementById('app');
            const { score, totalQuestions, startTime } = this.state.quiz;
            const endTime = Date.now();
            const totalTime = Math.round((endTime - startTime) / 1000);
            const minutes = Math.floor(totalTime / 60);
            const seconds = totalTime % 60;
            
            const correctAnswers = score / 10;
            const percentage = Math.round((correctAnswers / totalQuestions) * 100);
            
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
                                <div class="result-value">${correctAnswers} / ${totalQuestions}</div>
                            </div>
                            <div class="result-card">
                                <div class="result-icon">⭐</div>
                                <div class="result-label">總分</div>
                                <div class="result-value">${score} 分</div>
                            </div>
                            <div class="result-card">
                                <div class="result-icon">⏰</div>
                                <div class="result-label">花費時間</div>
                                <div class="result-value">${minutes}分${seconds}秒</div>
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
                        border-radius: 25px;
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
                        box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
                    }
                    
                    .play-again-btn:hover {
                        background: linear-gradient(135deg, #2ecc71, #27ae60);
                        box-shadow: 0 6px 20px rgba(46, 204, 113, 0.6);
                        transform: translateY(-2px);
                    }
                    
                    .main-menu-btn {
                        background: linear-gradient(135deg, #3498db, #2980b9);
                        color: white;
                        box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
                    }
                    
                    .main-menu-btn:hover {
                        background: linear-gradient(135deg, #2980b9, #3498db);
                        box-shadow: 0 6px 20px rgba(52, 152, 219, 0.6);
                        transform: translateY(-2px);
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
        },

        // =====================================================
        // 觸控拖拽支援函數
        // =====================================================
        setupTouchDragForEasyMode(question) {
            console.log('🎯 [C4-正確金額] 檢查 TouchDragUtility 狀態 (簡單模式)', {
                touchUtilityExists: !!window.TouchDragUtility,
                touchUtilityType: typeof window.TouchDragUtility
            });
            
            if (!window.TouchDragUtility) {
                console.error('❌ [C4-正確金額] TouchDragUtility 未載入，觸控拖曳功能無法使用');
                return;
            }
            
            const gameArea = document.getElementById('app');
            if (!gameArea) return;
            
            console.log('✅ [C4-正確金額] TouchDragUtility 已載入，開始註冊觸控拖曳 (簡單模式)');

            // 註冊可拖拽元素（簡單模式）
            window.TouchDragUtility.registerDraggable(
                gameArea,
                '.unit4-easy-source-item',
                {
                    onDragStart: (element, event) => {
                        const syntheticEvent = {
                            target: element,
                            preventDefault: () => {},
                            dataTransfer: { setData: () => {}, getData: () => '', effectAllowed: 'move' }
                        };
                        this.handleDragStart(syntheticEvent);
                        return true;
                    },
                    onDrop: (draggedElement, dropZone, event) => {
                        const syntheticDropEvent = {
                            target: dropZone,
                            currentTarget: dropZone,
                            preventDefault: () => {},
                            stopPropagation: () => {},
                            dataTransfer: { 
                                getData: () => JSON.stringify({
                                    value: parseInt(draggedElement.dataset.value),
                                    id: draggedElement.id,
                                    fromZone: 'source'
                                })
                            }
                        };
                        this.handleEasyModeDrop(syntheticDropEvent, question);
                    },
                    onDragEnd: (element, event) => {
                        const syntheticEvent = { target: element, preventDefault: () => {} };
                        this.handleDragEnd(syntheticEvent);
                    }
                }
            );

            // 註冊放置區域
            const dropZone = gameArea.querySelector('.unit4-easy-drop-zone');
            const moneySource = gameArea.querySelector('.unit4-easy-money-source');
            
            if (dropZone) {
                window.TouchDragUtility.registerDropZone(dropZone, () => true);
            }
            if (moneySource) {
                window.TouchDragUtility.registerDropZone(moneySource, () => true);
            }
        },

        setupTouchDragForNormalMode(question) {
            if (!window.TouchDragUtility) return;
            
            const gameArea = document.getElementById('app');
            if (!gameArea) return;

            // 註冊可拖拽元素（普通模式）
            window.TouchDragUtility.registerDraggable(
                gameArea,
                '.unit4-normal-source-item, .unit4-normal-dropped-item',
                {
                    onDragStart: (element, event) => {
                        const syntheticEvent = {
                            target: element,
                            preventDefault: () => {},
                            dataTransfer: { setData: () => {}, getData: () => '', effectAllowed: 'move' }
                        };
                        this.handleDragStart(syntheticEvent);
                        return true;
                    },
                    onDrop: (draggedElement, dropZone, event) => {
                        const syntheticDropEvent = {
                            target: dropZone,
                            currentTarget: dropZone,
                            preventDefault: () => {},
                            stopPropagation: () => {},
                            dataTransfer: { 
                                getData: () => JSON.stringify({
                                    value: parseInt(draggedElement.dataset.value),
                                    id: draggedElement.id,
                                    fromZone: draggedElement.classList.contains('unit4-normal-dropped-item') ? 'drop' : 'source'
                                })
                            }
                        };
                        
                        if (dropZone.closest('.unit4-normal-drop-zone')) {
                            this.handleNormalModeDrop(syntheticDropEvent, question);
                        } else if (dropZone.closest('.unit4-normal-money-source')) {
                            this.handleDropBack(syntheticDropEvent);
                        }
                    },
                    onDragEnd: (element, event) => {
                        const syntheticEvent = { target: element, preventDefault: () => {} };
                        this.handleDragEnd(syntheticEvent);
                    }
                }
            );

            // 註冊放置區域
            const dropZone = gameArea.querySelector('.unit4-normal-drop-zone');
            const moneySource = gameArea.querySelector('.unit4-normal-money-source');
            
            if (dropZone) {
                window.TouchDragUtility.registerDropZone(dropZone, () => true);
            }
            if (moneySource) {
                window.TouchDragUtility.registerDropZone(moneySource, () => true);
            }
        },

        setupTouchDragForHardMode(question) {
            if (!window.TouchDragUtility) return;
            
            const gameArea = document.getElementById('app');
            if (!gameArea) return;

            // 註冊可拖拽元素（困難模式）
            window.TouchDragUtility.registerDraggable(
                gameArea,
                '.unit4-hard-source-item, .unit4-hard-dropped-item',
                {
                    onDragStart: (element, event) => {
                        const syntheticEvent = {
                            target: element,
                            preventDefault: () => {},
                            dataTransfer: { setData: () => {}, getData: () => '', effectAllowed: 'move' }
                        };
                        this.handleDragStart(syntheticEvent);
                        return true;
                    },
                    onDrop: (draggedElement, dropZone, event) => {
                        const syntheticDropEvent = {
                            target: dropZone,
                            currentTarget: dropZone,
                            preventDefault: () => {},
                            stopPropagation: () => {},
                            dataTransfer: { 
                                getData: () => JSON.stringify({
                                    value: parseInt(draggedElement.dataset.value),
                                    id: draggedElement.id,
                                    fromZone: draggedElement.classList.contains('unit4-hard-dropped-item') ? 'drop' : 'source'
                                })
                            }
                        };
                        
                        if (dropZone.closest('.unit4-hard-drop-zone')) {
                            this.handleHardModeDrop(syntheticDropEvent, question);
                        } else if (dropZone.closest('.unit4-hard-money-source')) {
                            this.handleDropBack(syntheticDropEvent);
                        }
                    },
                    onDragEnd: (element, event) => {
                        const syntheticEvent = { target: element, preventDefault: () => {} };
                        this.handleDragEnd(syntheticEvent);
                    }
                }
            );

            // 註冊放置區域
            const dropZone = gameArea.querySelector('.unit4-hard-drop-zone');
            const moneySource = gameArea.querySelector('.unit4-hard-money-source');
            
            if (dropZone) {
                window.TouchDragUtility.registerDropZone(dropZone, () => true);
            }
            if (moneySource) {
                window.TouchDragUtility.registerDropZone(moneySource, () => true);
            }
        },

        // =====================================================
        // 點擊功能實現 - 參考 c3_money_exchange 成功實現
        // =====================================================

        // 統一點擊事件監聽器設置 - 參考 c3 的成功做法
        setupClickEventListeners(difficulty) {
            const config = this.clickToMoveConfig[difficulty];
            if (!config?.enabled) {
                console.log(`🎯 [C4點擊除錯] ${difficulty}模式未啟用點擊功能`);
                return;
            }

            console.log(`🎯 [C4點擊除錯] 設置${difficulty}模式點擊事件處理`);
            
            // 【核心修正】將事件監聽器綁定到更高層級的容器，
            // 這樣才能同時捕捉到「金錢源區」和「放置區」的點擊事件。
            const eventContainer = document.getElementById('app') || document.body;
            
            // 移除舊的點擊事件監聽器（如果存在）
            if (this._clickEventHandler) {
                eventContainer.removeEventListener('click', this._clickEventHandler, { capture: true });
            }
            
            // 創建新的點擊事件處理器
            this._clickEventHandler = (event) => {
                console.log('🖱️ [C4點擊除錯] 容器點擊事件觸發', {
                    target: event.target.id || event.target.className,
                });

                // 使用更廣泛的選擇器來確保能捕捉到所有模式下的金錢
                const moneyItem = event.target.closest('.unit4-easy-source-item, .unit4-easy-dropped-item, .unit4-normal-source-item, .unit4-normal-dropped-item, .unit4-hard-source-item, .unit4-hard-dropped-item');
                if (moneyItem) {
                    console.log('✅ [C4點擊除錯] 發現金錢物品點擊，路由到 handleActionClick');
                    event.stopPropagation(); // 阻止事件冒泡，避免干擾
                    event.preventDefault(); // 阻止默認行為
                    this.handleActionClick(event, difficulty);
                }
            };
            
            // 綁定新的點擊事件
            eventContainer.addEventListener('click', this._clickEventHandler, {
                capture: true, // 使用捕獲階段確保優先處理
            });

            console.log(`✅ [C4點擊除錯] ${difficulty}模式點擊事件已成功綁定到 #app`);
        },

        // 主要點擊動作處理器
        handleActionClick(event, difficulty) {
            const config = this.clickToMoveConfig[difficulty];
            if (!config?.enabled) return;

            const target = event.target;
            console.log('🎯 [C4點擊除錯] handleActionClick 被呼叫', {
                target: target,
                targetClass: target.className,
                difficulty: difficulty,
                useClickToMove: config.enabled
            });

            // 尋找金錢物品元素 (可能點擊到內部圖片)
            let moneyItem = target.closest('.unit4-easy-source-item, .unit4-easy-dropped-item, .unit4-normal-source-item, .unit4-normal-dropped-item, .unit4-hard-source-item, .unit4-hard-dropped-item');
            
            if (!moneyItem) {
                console.log('ℹ️ [C4點擊除錯] 找不到金錢物品元素');
                return;
            }

            console.log('✅ [C4點擊除錯] 找到金錢物品，路由到點擊移動邏輯');
            this.handleItemClick(event, moneyItem, difficulty);
        },

        // 物品點擊處理
        handleItemClick(event, moneyItem, difficulty) {
            const config = this.clickToMoveConfig[difficulty];
            
            console.log('🎯 [C4點擊除錯] handleItemClick 被呼叫', {
                difficulty: difficulty,
                itemClass: moneyItem.className,
                itemValue: moneyItem.dataset.value
            });

            // 判斷是源物品還是已放置物品
            const isSourceItem = moneyItem.classList.contains(`unit4-${difficulty}-source-item`);
            const isDroppedItem = moneyItem.classList.contains(`unit4-${difficulty}-dropped-item`);

            if (isSourceItem) {
                // 來源物品：處理點擊放置
                console.log('📍 [C4點擊除錯] 來源物品：處理點擊放置');
                this.handleClickToPlace(moneyItem, difficulty);
            } else if (isDroppedItem && config.allowClickToReturn) {
                // 已放置物品：處理點擊取回
                console.log('🔙 [C4點擊除錯] 已放置物品：處理點擊取回');
                this.handleClickToReturn(moneyItem, difficulty);
            } else {
                console.log('ℹ️ [C4點擊除錯] 此物品類型不支援點擊操作');
            }
        },

        // 處理點擊放置
        handleClickToPlace(sourceItem, difficulty) {
            const config = this.clickToMoveConfig[difficulty];
            const currentTime = Date.now();
            const lastClickTime = this.state.clickState.lastClickTime;
            const lastClickedElement = this.state.clickState.lastClickedElement;
            const timeDiff = currentTime - lastClickTime;
            const isSameElement = lastClickedElement === sourceItem;
            
            console.log('🎯 [C4點擊除錯] handleClickToPlace 被呼叫', {
                sourceItem: sourceItem,
                difficulty: difficulty
            });

            console.log('🔍 [C4點擊除錯] 雙擊檢測狀態', {
                currentTime,
                lastClickTime,
                timeDiff,
                doubleClickDelay: config.doubleClickDelay,
                isSameElement,
                clickCount: this.state.clickState.clickCount
            });

            // 雙擊檢測邏輯
            if (this.state.clickState.clickCount === 1 && 
                timeDiff <= config.doubleClickDelay && 
                isSameElement) {
                
                // 這是雙擊 - 執行放置
                console.log('✅ [C4點擊除錯] 偵測到雙擊，準備執行放置');
                
                // 重置點擊狀態
                this.state.clickState.clickCount = 0;
                this.state.clickState.lastClickTime = 0;
                this.state.clickState.lastClickedElement = null;
                
                // 清除選擇狀態
                this.clearItemSelection();
                
                console.log('🔄 [C4點擊除錯] 執行物品放置邏輯');
                
                // 執行放置邏輯 - 直接調用核心函數
                this.simulateCoinPlacement(sourceItem, difficulty);
                
                console.log('✅ [C4點擊除錯] 雙擊放置執行完成');
            } else {
                // 這是第一次點擊，僅選擇物品
                console.log('🔵 [C4點擊除錯] 第一次點擊，選擇物品');
                
                this.state.clickState.clickCount = 1;
                this.state.clickState.lastClickTime = currentTime;
                this.state.clickState.lastClickedElement = sourceItem;
                
                // 清除之前的選擇並設置新選擇
                this.clearItemSelection();
                this.state.clickState.selectedClickItem = {
                    element: sourceItem,
                    value: sourceItem.dataset.value,
                    type: 'source-item'
                };
                
                // 視覺反饋
                if (config.visualSelection) {
                    sourceItem.classList.add('selected-item');
                }
                
                // 音效反饋
                if (config.audioFeedback) {
                    console.log('🎵 [C4點擊除錯] 播放選擇音效');
                    // c4 沒有 playSound 函數，暫時跳過音效或使用其他音效
                    // this.audio.playDropSound();
                }
                
                console.log('🎙️ [C4點擊除錯] 第一次點擊：不播放語音提示');
            }
        },

        // 處理點擊取回
        handleClickToReturn(placedItem, difficulty) {
            const config = this.clickToMoveConfig[difficulty];
            
            if (!config?.allowClickToReturn) {
                console.log('ℹ️ 此模式不允許點擊取回');
                return;
            }
            
            console.log('🔙 [C4點擊除錯] 處理點擊取回', { placedItem });
            
            // 直接執行取回邏輯
            this.simulateCoinReturn(placedItem, difficulty);
        },

        // 清除物品選擇狀態
        clearItemSelection() {
            const selectedItem = this.state.clickState.selectedClickItem;
            
            console.log('🧹 [C4點擊除錯] 清除物品選擇狀態', {
                hasSelectedItem: !!selectedItem
            });
            
            if (selectedItem && selectedItem.element) {
                selectedItem.element.classList.remove('selected-item');
                this.state.clickState.selectedClickItem = null;
                console.log('✅ [C4點擊除錯] 選擇狀態已清除');
            }
        },

        // 直接呼叫金錢放置邏輯 - 不再模擬事件
        simulateCoinPlacement(sourceItem, difficulty) {
            console.log('🎯 [C4點擊除錯] 直接呼叫放置邏輯', {
                difficulty, 
                sourceItemValue: sourceItem.dataset.value
            });
            
            try {
                const value = parseInt(sourceItem.dataset.value);
                const dropData = {
                    value: value,
                    id: sourceItem.id || `item-${Date.now()}`,
                    fromZone: 'source',
                    imageSrc: sourceItem.querySelector('img')?.src || ''
                };
                
                console.log(`📍 [C4點擊除錯] ${difficulty}模式：直接處理放置`);
                
                if (difficulty === 'easy') {
                    // 簡單模式：使用與 handleEasyModeDrop 相同的位置查找邏輯
                    const currentQuestion = this.state.quiz.questions[this.state.quiz.currentQuestion - 1];
                    const solution = this.findSolution(currentQuestion.targetAmount, this.state.settings.denominations);
                    
                    if (!solution) {
                        console.error('🚫 [C4點擊除錯] 無法找到解法');
                        return;
                    }
                    
                    // 確保 droppedItems 陣列正確初始化
                    if (!this.state.gameState.droppedItems || this.state.gameState.droppedItems.length !== solution.length) {
                        this.state.gameState.droppedItems = new Array(solution.length).fill(null);
                    }
                    
                    // 找到第一個匹配的淡化位置（還沒被點亮的）
                    let targetPosition = -1;
                    for (let i = 0; i < solution.length; i++) {
                        if (solution[i] === value && this.state.gameState.droppedItems[i] === null) {
                            targetPosition = i;
                            break;
                        }
                    }
                    
                    console.log(`🎯 [C4點擊除錯] 簡單模式尋找 ${value}元的位置, 找到位置: ${targetPosition}`);
                    console.log(`🎯 [C4點擊除錯] solution:`, solution);
                    console.log(`🎯 [C4點擊除錯] 目前droppedItems狀態:`, this.state.gameState.droppedItems);
                    
                    if (targetPosition === -1) {
                        console.error('🚫 [C4點擊除錯] 沒有匹配的位置或已被佔據！');
                        return;
                    }
                    
                    // 防止超過目標金額
                    const newTotal = this.state.gameState.currentTotal + value;
                    if (newTotal > currentQuestion.targetAmount) {
                        console.error('🚫 [C4點擊除錯] 超過目標金額了！');
                        return;
                    }
                    
                    // 放置在正確位置
                    this.state.gameState.droppedItems[targetPosition] = dropData;
                    this.state.gameState.currentTotal = newTotal;
                    
                    console.log(`✅ [C4點擊除錯] 簡單模式成功放置：位置 ${targetPosition} 放入 ${value}元`);
                    console.log(`💰 [C4點擊除錯] 點擊放置後總金額: ${newTotal}元`);
                    
                } else {
                    // 普通/困難模式：使用原本的 push 邏輯
                    if (this.state.gameState.droppedItems) {
                        this.state.gameState.droppedItems.push(dropData);
                    } else {
                        this.state.gameState.droppedItems = [dropData];
                    }
                    
                    // 計算新的總金額
                    const validItems = this.state.gameState.droppedItems.filter(item => item && item.value !== undefined);
                    const newTotal = validItems.reduce((sum, item) => sum + item.value, 0);
                    this.state.gameState.currentTotal = newTotal;
                    
                    console.log(`💰 [C4點擊除錯] 點擊放置後總金額: ${newTotal}元 (有效項目: ${validItems.length}/${this.state.gameState.droppedItems.length})`);
                }
                
                // 移除源物品
                sourceItem.remove();
                
                // 重新渲染當前問題以反映更新
                const currentQuestion = this.state.quiz.questions[this.state.quiz.currentQuestion - 1];
                if (currentQuestion) {
                    if (difficulty === 'easy') {
                        this.renderEasyMode(currentQuestion);
                        this.setupEasyModeEventListeners(currentQuestion);
                        // 簡單模式播放總額語音，完成後檢查答案
                        const currentTotal = this.state.gameState.currentTotal || 0;
                        this.speech.speak(`總共${currentTotal}元`, {
                            callback: () => {
                                // 語音播放完畢後才檢查答案
                                this.checkEasyModeAutoAnswer(currentQuestion);
                            }
                        });
                    } else if (difficulty === 'normal') {
                        this.renderNormalMode(currentQuestion);
                        this.setupNormalModeEventListeners(currentQuestion);
                        // 普通模式播放總額語音 - 與拖放一致
                        const currentTotal = this.state.gameState.currentTotal || 0;
                        this.speech.speak(`現在總共是${currentTotal}元`);
                    } else if (difficulty === 'hard') {
                        this.renderHardMode(currentQuestion);
                        this.setupHardModeEventListeners(currentQuestion);
                        // 困難模式不播放語音提示
                    }
                }
                
                // 播放音效
                this.audio.playDropSound();
                
            } catch (error) {
                console.error(`❌ [C4點擊除錯] ${difficulty}模式放置處理錯誤:`, error);
            }
        },

        // 直接呼叫金錢取回邏輯 - 不再模擬事件
        simulateCoinReturn(placedItem, difficulty) {
            console.log('🔙 [C4點擊除錯] 直接呼叫取回邏輯', {
                difficulty,
                placedItemId: placedItem.id,
                placedItemValue: placedItem.dataset?.value
            });
            
            try {
                const value = parseInt(placedItem.dataset.value);
                const returnData = {
                    value: value,
                    id: placedItem.id,
                    fromZone: 'drop'
                };
                
                console.log(`📍 [C4點擊除錯] ${difficulty}模式：直接處理取回`);
                
                let itemFound = false;
                
                if (difficulty === 'easy') {
                    // 簡單模式：使用與 handleDropBack 相同的位置清空邏輯
                    if (this.state.gameState.droppedItems) {
                        for (let i = 0; i < this.state.gameState.droppedItems.length; i++) {
                            const item = this.state.gameState.droppedItems[i];
                            if (item && item.value === value) {
                                this.state.gameState.droppedItems[i] = null;
                                itemFound = true;
                                console.log(`🔙 [C4點擊除錯] 簡單模式取回成功：位置 ${i} 清空 (${value}元)`);
                                break;
                            }
                        }
                    }
                } else {
                    // 普通/困難模式：使用 filter 移除項目
                    if (this.state.gameState.droppedItems) {
                        const originalLength = this.state.gameState.droppedItems.length;
                        this.state.gameState.droppedItems = this.state.gameState.droppedItems.filter(item => 
                            !(item.id === returnData.id || (item.value === returnData.value && !item.id))
                        );
                        itemFound = this.state.gameState.droppedItems.length < originalLength;
                        if (itemFound) {
                            console.log(`🔙 [C4點擊除錯] ${difficulty}模式取回成功：移除 ${value}元`);
                        }
                    }
                }
                
                if (itemFound) {
                    // 更新總金額
                    this.state.gameState.currentTotal = (this.state.gameState.currentTotal || 0) - value;
                    
                    console.log(`💰 [C4點擊除錯] 點擊取回後總金額: ${this.state.gameState.currentTotal}元`);
                    
                    // 重新渲染
                    const currentQuestion = this.state.quiz.questions[this.state.quiz.currentQuestion - 1];
                    if (currentQuestion) {
                        if (difficulty === 'easy') {
                            this.renderEasyMode(currentQuestion);
                            this.setupEasyModeEventListeners(currentQuestion);
                            // 簡單模式播放總額語音（取回時不需要檢查答案）
                            const currentTotal = this.state.gameState.currentTotal || 0;
                            this.speech.speak(`總共${currentTotal}元`);
                        } else if (difficulty === 'normal') {
                            this.renderNormalMode(currentQuestion);
                            this.setupNormalModeEventListeners(currentQuestion);
                            // 普通模式播放總額語音 - 與拖放一致
                            const currentTotal = this.state.gameState.currentTotal || 0;
                            this.speech.speak(`現在總共是${currentTotal}元`, { interrupt: true });
                        } else if (difficulty === 'hard') {
                            this.renderHardMode(currentQuestion);
                            this.setupHardModeEventListeners(currentQuestion);
                            // 困難模式不播放語音提示
                        }
                    }
                    
                    // 播放音效
                    this.audio.playDropSound();
                    
                    console.log('✅ [C4點擊除錯] 取回邏輯執行完成');
                } else {
                    console.log('⚠️ [C4點擊除錯] 未找到要取回的項目');
                }
                
            } catch (error) {
                console.error(`❌ [C4點擊除錯] ${difficulty}模式取回處理錯誤:`, error);
            }
        }
    };

    Game.init();
});