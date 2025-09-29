// =================================================================
/**
 * @file a2_atm_simulator.js
 * @description A2 提款機模擬學習單元 - 配置驅動版本
 * @unit A2 - 提款機模擬學習
 * @version 1.0.0 - 基於A1架構開發
 * @lastModified 2025.08.31
 */
// 🚨🚨🚨 【重開機後修改前必讀】🚨🚨🚨
// =====================================================
// 
// 📋 修改前強制檢查清單：
// 1. 先閱讀 CLAUDE.md 文件了解配置驅動原則
// 2. 禁止任何硬編碼：語音文字、延遲時間、if-else業務邏輯
// 3. 必須使用：ModeConfig、Audio.playSound()、Speech.speak()
// 4. 所有修改必須是100%配置驅動！
//
// =====================================================
// 基於A1架構的ATM模擬器開發
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const ATM = {
        // =====================================================
        // 狀態管理系統（基於A1架構）
        // =====================================================
        state: {
            settings: {
                difficulty: null,           // easy, normal, hard
                sessionType: null,      // withdraw(提款), deposit(存款), inquiry(查詢)
                accountType: null,       // savings(儲蓄), checking(支票)
                testMode: null,          // repeat(重複測驗), single(單次測驗)
                questionCount: null,           // 測驗題數
                language: null,         // chinese, english
                customPassword: '1234',      // 自訂密碼
                customBalance: 50000         // 自訂帳戶金額
            },
            audioUnlocked: false,            // 手機端音頻解鎖狀態
            gameState: {
                currentScene: 'settings',    // settings, card-insert, pin-entry, menu, processing, complete
                currentStep: 0,              // 當前操作步驟
                totalSteps: 0,               // 總步驟數
                accountBalance: 50000,       // 帳戶餘額
                cardInserted: false,         // 卡片是否插入
                pinAttempts: 0,             // PIN嘗試次數
                currentPin: '',             // 當前輸入的PIN
                correctPin: '1234',         // 正確的PIN（將從設定中同步）
                transactionAmount: 0,       // 交易金額
                isProcessing: false,        // 是否正在處理
                showingModal: false,        // 是否顯示模態視窗
                currentTransaction: {
                    type: 'withdraw',        // 交易類型
                    amount: 0,               // 金額
                    account: 'savings',      // 帳戶類型
                    completed: false         // 是否完成
                },
                // 遊戲化元素
                experience: 0,               // 經驗值
                level: 1,                   // 等級
                badges: [],                 // 獲得的徽章
                achievements: []            // 成就
            },
            quiz: {
                currentQuestion: 0,
                score: 0,
                questions: [],
                startTime: null,
                attempts: 0,
                completedTransactions: []
            }
        },

        // =====================================================
        // 音效和語音系統（基於A1）
        // =====================================================
        audio: {
            beepSound: null,
            errorSound: null,
            successSound: null,
            cashSound: null,
            countMoneySound: null,
            menuSelectSound: null,
            
            init() {
                try {
                    this.beepSound = new Audio('../audio/click.mp3');
                    this.beepSound.preload = 'auto';
                    this.beepSound.volume = 0.6;

                    this.errorSound = new Audio('../audio/error.mp3');
                    this.errorSound.preload = 'auto';
                    this.errorSound.volume = 0.5;

                    this.successSound = new Audio('../audio/correct02.mp3');
                    this.successSound.preload = 'auto';

                    this.cashSound = new Audio('../audio/correct02.mp3');
                    this.cashSound.preload = 'auto';
                    this.cashSound.volume = 0.7;

                    this.countMoneySound = new Audio('../audio/countmoney.mp3');
                    this.countMoneySound.preload = 'auto';
                    this.countMoneySound.volume = 0.8;

                    this.menuSelectSound = new Audio('../audio/menu-select.mp3');
                    this.menuSelectSound.preload = 'auto';
                    this.menuSelectSound.volume = 0.5;
                } catch (error) {
                    console.log('ATM音效檔案載入失敗:', error);
                }
            },

            playBeep() {
                if (this.beepSound) {
                    this.beepSound.currentTime = 0;
                    this.beepSound.play().catch(error => console.log('播放按鍵音失敗:', error));
                }
            },

            playError() {
                if (this.errorSound) {
                    this.errorSound.currentTime = 0;
                    this.errorSound.play().catch(error => console.log('播放錯誤音失敗:', error));
                }
            },

            playSuccess() {
                if (this.successSound) {
                    this.successSound.currentTime = 0;
                    this.successSound.play().catch(error => console.log('播放成功音失敗:', error));
                }
            },

            playCash() {
                if (this.cashSound) {
                    this.cashSound.currentTime = 0;
                    this.cashSound.play().catch(error => console.log('播放出鈔音失敗:', error));
                }
            },

            playCountMoney() {
                return new Promise((resolve) => {
                    if (this.countMoneySound) {
                        this.countMoneySound.currentTime = 0;
                        
                        // 設定音效播放完成後的回調
                        const onEnded = () => {
                            this.countMoneySound.removeEventListener('ended', onEnded);
                            resolve();
                        };
                        
                        this.countMoneySound.addEventListener('ended', onEnded);
                        this.countMoneySound.play().catch(error => {
                            console.log('播放點鈔音失敗:', error);
                            this.countMoneySound.removeEventListener('ended', onEnded);
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            },

            playMenuSelect() {
                if (this.menuSelectSound) {
                    this.menuSelectSound.currentTime = 0;
                    this.menuSelectSound.play().catch(error => console.log('播放選單選擇音失敗:', error));
                }
            }
        },

        // =====================================================
        // 語音系統（基於A1的高品質語音配置）
        // =====================================================
        speech: {
            synth: null,
            voice: null,
            isReady: false,

            init() {
                this.synth = window.speechSynthesis;
                this.initializeVoice();
            },

            initializeVoice() {
                const maxAttempts = 3;
                let voiceInitAttempts = 0;

                const setVoice = () => {
                    voiceInitAttempts++;
                    const voices = this.synth.getVoices();
                    
                    console.log('🎙️ [A2-ATM語音] 取得語音列表', {
                        voiceCount: voices.length,
                        attempt: voiceInitAttempts,
                        allVoices: voices.map(v => ({name: v.name, lang: v.lang}))
                    });

                    if (voices.length === 0) {
                        if (voiceInitAttempts < maxAttempts) {
                            console.log('🎙️ [A2-ATM語音] 語音列表為空，將重試');
                            setTimeout(setVoice, 500);
                        } else {
                            console.log('🎙️ [A2-ATM語音] 手機端無語音，啟用靜音模式');
                            this.voice = null;
                            this.isReady = true;
                        }
                        return;
                    }

                    // 與A1相同的語音選擇策略
                    const preferredVoices = [
                        'Microsoft HsiaoChen Online', 
                        'Google 國語 (臺灣)'
                    ];
                    
                    this.voice = voices.find(v => preferredVoices.includes(v.name));
                    
                    if (!this.voice) {
                        const taiwanVoices = voices.filter(v => 
                            (v.lang === 'zh-TW' || 
                             v.lang === 'zh_TW_#Hant' || 
                             v.name.includes('台灣') || 
                             v.name.includes('Taiwan')) &&
                            !v.name.includes('Hanhan')
                        );
                        if (taiwanVoices.length > 0) { 
                            this.voice = taiwanVoices[0]; 
                        }
                    }
                    
                    if (!this.voice) {
                        const traditionalChineseVoices = voices.filter(v => 
                            v.lang.includes('zh') && 
                            (v.lang.includes('Hant') || v.lang.includes('TW') || 
                             v.name.includes('繁體') || v.name.includes('台灣'))
                        );
                        if (traditionalChineseVoices.length > 0) {
                            this.voice = traditionalChineseVoices[0];
                        }
                    }
                    
                    if (!this.voice) {
                        console.log('🚫 [A2-ATM語音] 拒絕使用簡體中文或非台灣語音');
                        this.voice = null;
                    }
                                 
                    if (this.voice) {
                        this.isReady = true;
                        console.log('🎙️ [A2-ATM語音] 語音準備就緒', {
                            voiceName: this.voice.name,
                            lang: this.voice.lang,
                            attempt: voiceInitAttempts 
                        });
                    } else {
                        console.log('🎙️ [A2-ATM語音] 未找到任何中文語音，進入靜音模式');
                        this.voice = null;
                        this.isReady = true;
                    }
                };
                
                setVoice();
                
                if (this.synth.onvoiceschanged !== undefined) {
                    this.synth.onvoiceschanged = setVoice;
                }
                
                setTimeout(() => {
                    if (!this.isReady && voiceInitAttempts < maxAttempts) {
                        console.log('🎙️ [A2-ATM語音] 延遲重試語音初始化');
                        setVoice();
                    }
                }, 1000);
            },

            speak(text, options = {}) {
                const { interrupt = true, callback = null } = options;

                console.log('🎙️ [A2-ATM語音] 嘗試播放語音', {
                    text,
                    interrupt,
                    isReady: this.isReady,
                    audioUnlocked: ATM.state.audioUnlocked,
                    voiceName: this.voice?.name
                });
                
                if (!ATM.state.audioUnlocked) {
                    console.log('🎙️ [A2-ATM語音] ⚠️ 音頻權限未解鎖，跳過語音播放');
                    if (callback) setTimeout(callback, 100);
                    return;
                }
                
                // 改善語音中斷處理，添加延遲避免頻繁取消
                if (this.synth.speaking && interrupt) {
                    console.log('🎙️ [A2-ATM語音] 停止之前的語音播放');
                    this.synth.cancel();
                    // 等待語音完全停止後再繼續
                    setTimeout(() => this.performSpeech(text, callback), 200);
                    return;
                }
                
                if (!this.isReady || !text) {
                    console.log('🎙️ [A2-ATM語音] 語音系統未就緒或文字為空', { isReady: this.isReady, hasText: !!text });
                    if (callback) setTimeout(callback, 300);
                    return;
                }

                if (!this.voice) {
                    console.log('🎙️ [A2-ATM語音] 靜音模式，跳過語音播放');
                    if (callback) setTimeout(callback, 100);
                    return;
                }

                this.performSpeech(text, callback);
            },

            performSpeech(text, callback) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = this.voice;
                utterance.rate = 1.0;
                utterance.lang = this.voice.lang;

                console.log('🎙️ [A2-ATM語音] 開始播放語音', {
                    text: text,
                    voiceName: this.voice.name
                });

                // 改善的安全回調機制
                if (callback) {
                    let callbackExecuted = false;
                    const safeCallback = () => {
                        if (!callbackExecuted) {
                            callbackExecuted = true;
                            callback();
                        }
                    };
                    
                    utterance.onend = () => {
                        console.log('🎙️ [A2-ATM語音] 語音播放完成');
                        safeCallback();
                    };
                    
                    utterance.onerror = (event) => {
                        console.log('🎙️ [A2-ATM語音] 語音播放錯誤', event.error);
                        // 即使出錯也要執行回調以免卡住流程
                        safeCallback();
                    };
                    
                    // 縮短超時時間，避免長時間等待
                    setTimeout(safeCallback, 5000); // 5秒超時保護
                }

                try {
                    console.log('🎙️ [A2-ATM語音] 語音已提交播放');
                    this.synth.speak(utterance);
                } catch (error) {
                    console.log('🎙️ [A2-ATM語音] 語音播放異常', error);
                    if (callback) callback();
                }
            }
        },

        // =====================================================
        // 音頻解鎖系統（基於A1）
        // =====================================================
        unlockAudio() {
            if (this.state.audioUnlocked) return;

            console.log('🔓 [A2-ATM] 嘗試解鎖音頻播放權限...');

            try {
                // 嘗試創建和播放空的音頻來解鎖
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                gainNode.gain.value = 0;
                oscillator.frequency.value = 440;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);

                this.state.audioUnlocked = true;
                console.log('✅ [A2-ATM] 音頻解鎖成功');

                // 初始化音效系統
                this.audio.init();
            } catch (error) {
                console.log('⚠️ [A2-ATM] 音頻解鎖失敗，但繼續執行', error);
                this.state.audioUnlocked = true; // 仍然設為true以允許程序繼續
            }
        },

        // =====================================================
        // ATM界面生成系統
        // =====================================================
        generateATMInterface() {
            return `
                <!-- 🔧 [新增] ATM 標題列 - 參考 a1 設計 -->
                <div class="atm-title-bar">
                    <div class="atm-title-bar-left">
                        <span class="atm-icon-large">🏧</span>
                        <span>ATM提款機模擬</span>
                    </div>
                    <div class="atm-title-bar-center" id="atm-step-title">準備開始...</div>
                    <div class="atm-title-bar-right">
                        <span id="atm-progress-info">步驟 1 / 5</span>
                        <button class="back-to-menu-btn" onclick="location.reload()">返回設定</button>
                    </div>
                </div>
                
                <div class="atm-container">
                    <!-- ATM機器外殼 - 新的三欄佈局 -->
                    <div class="atm-body">
                        <!-- 🔧 [修正] ATM統一功能面板 - 包含所有主要功能區域 -->
                        <div class="atm-main-frame">
                            <div class="atm-functions-container">
                                <!-- 上排：卡片插入區和螢幕區域 -->
                                <div class="atm-upper-section">
                                    <!-- 左側：卡片插入區 -->
                                    <div class="card-section">
                                        <div class="card-slot-area">
                                            <div class="card-slot" id="card-slot">
                                                <div class="card-slot-light" id="card-light"></div>
                                                <div class="card-slot-opening">請插入卡片</div>
                                                <div class="card-insertion-slit" id="card-slit">
                                                    <div class="slit-interior"></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- 金融卡展示區 -->
                                        <div class="atm-card-area">
                                            <img src="../images/card.PNG" alt="金融卡" class="atm-card" id="atm-card">
                                        </div>
                                    </div>
                                    
                                    <!-- 中央：螢幕區域 -->
                                    <div class="screen-section">
                                        <div class="atm-screen-area">
                                            <div class="atm-screen" id="atm-screen">
                                                <div class="screen-content" id="screen-content">
                                                    <!-- 動態內容將在這裡生成 -->
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- 右側：收據區域（包含出口和交易收據） -->
                                    <div class="receipt-section">
                                        <!-- 收據出口 -->
                                        <div class="receipt-printer">
                                            <div class="receipt-slot" id="receipt-slot">
                                                <div class="receipt-slot-light" id="receipt-light"></div>
                                                <div class="receipt-opening">收據出口</div>
                                                <div class="receipt-insertion-slit">
                                                    <div class="slit-interior"></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- 交易收據顯示區域 - 在收據出口下方 -->
                                        <div class="receipt-display-area" id="receipt-display-area">
                                            <h4>📄 交易收據</h4>
                                            <div class="receipt-display-content" id="receipt-display-content">
                                                <p class="no-receipt-message">尚未列印收據</p>
                                            </div>
                                            <button class="take-receipt-btn" id="take-receipt-btn" style="display: none;" onclick="ATM.takeReceipt()">取走收據</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- 下排：現金出口 -->
                                <div class="atm-lower-section">
                                    <div class="cash-dispenser-area">
                                        <div class="cash-dispenser" id="cash-dispenser">
                                            <div class="cash-slot">
                                                <div class="cash-slot-cover">
                                                    <div class="cash-slot-label">現金出口</div>
                                                </div>
                                                <div class="cash-display-area-container">
                                                    <div class="cash-display-background" id="cash-display-background">
                                                    </div>
                                                    <div class="cash-display-cover" id="cash-display-cover">
                                                        <div class="cash-placeholder">請提領現金</div>
                                                    </div>
                                                    <!-- 現金滾動拉桿 -->
                                                    <div class="amount-slider-container" id="amount-slider-container">
                                                        <div class="slider-track" id="slider-track"></div>
                                                        <div class="slider-handle" id="slider-handle">
                                                            <div class="handle-grip">⋮</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            `;
        },

        // =====================================================
        // 設定畫面生成（基於A1模式）
        // =====================================================
        showSettings() {
            const { difficulty, sessionType, testMode, questionCount } = this.state.settings;
            const app = document.getElementById('app');
            
            app.innerHTML = `
                <div class="atm-settings-container">
                    <div class="settings-header" style="text-align: center;">
                        <h1>A2: ATM提款機模擬學習</h1>
                        <p class="subtitle">學習如何安全、正確地使用提款機</p>
                    </div>
                    
                    <div class="settings-content">
                        <div class="setting-group">
                            <label>🎚️ 難度等級：</label>
                            <div class="button-group">
                                <button class="selection-btn ${difficulty === 'easy' ? 'active' : ''}" 
                                        data-type="difficulty" data-value="easy">
                                    簡單模式
                                    <small>有詳細指導和提示</small>
                                </button>
                                <button class="selection-btn ${difficulty === 'normal' ? 'active' : ''}" 
                                        data-type="difficulty" data-value="normal">
                                    普通模式
                                    <small>基本提示和指導</small>
                                </button>
                                <button class="selection-btn ${difficulty === 'hard' ? 'active' : ''}" 
                                        data-type="difficulty" data-value="hard">
                                    困難模式
                                    <small>最少提示，接近真實體驗</small>
                                </button>
                            </div>
                        </div>
                        
                        <div class="setting-group">
                            <label>🏧 學習功能：</label>
                            <div class="button-group">
                                <button class="selection-btn ${sessionType === 'withdraw' ? 'active' : ''}" 
                                        data-type="sessionType" data-value="withdraw">
                                    💰 提款功能
                                    <small>學習提款操作流程</small>
                                </button>
                                <button class="selection-btn ${sessionType === 'deposit' ? 'active' : ''}" 
                                        data-type="sessionType" data-value="deposit">
                                    💳 存款功能
                                    <small>學習存款操作流程</small>
                                </button>
                                <button class="selection-btn ${sessionType === 'inquiry' ? 'active' : ''}" 
                                        data-type="sessionType" data-value="inquiry">
                                    📊 餘額查詢
                                    <small>學習查詢帳戶資訊</small>
                                </button>
                            </div>
                        </div>
                        
                        <div class="setting-group">
                            <label>👤 帳戶設定：</label>
                            <div class="button-group">
                                <button class="selection-btn account-setting-btn" 
                                        onclick="ATM.showPasswordInput()">
                                    🔐 自訂密碼
                                    <small>目前密碼：${this.state.settings.customPassword}</small>
                                </button>
                                <button class="selection-btn account-setting-btn" 
                                        onclick="ATM.showBalanceInput()">
                                    💰 自訂帳戶金額
                                    <small>目前金額：$${this.state.settings.customBalance.toLocaleString()}</small>
                                </button>
                            </div>
                        </div>
                        
                        <div class="setting-group">
                            <label>📋 題目數量：</label>
                            <div class="button-group">
                                ${[3, 5, 10].map(num => `
                                    <button class="selection-btn ${questionCount === num ? 'active' : ''}" 
                                            data-type="questionCount" data-value="${num}">${num}題</button>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="setting-group">
                            <label>📝 測驗模式：</label>
                            <div class="button-group">
                                <button class="selection-btn ${testMode === 'repeat' ? 'active' : ''}" 
                                        data-type="testMode" data-value="repeat">
                                    反複作答
                                    <small>錯誤時可重新嘗試</small>
                                </button>
                                <button class="selection-btn ${testMode === 'single' ? 'active' : ''}" 
                                        data-type="testMode" data-value="single">
                                    單次作答
                                    <small>每題只有一次機會</small>
                                </button>
                            </div>
                        </div>
                        
                        <div class="settings-footer">
                            <button class="back-btn" onclick="ATM.backToMainMenu()">
                                返回主選單
                            </button>
                            <button class="start-btn" id="start-atm-btn" onclick="ATM.startLearning()">
                                開始ATM學習
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // 綁定設定選擇事件
            this.bindSettingEvents();
        },

        // =====================================================
        // 事件綁定系統
        // =====================================================
        bindSettingEvents() {
            const gameSettings = document.querySelector('.settings-content');
            if (gameSettings) {
                gameSettings.addEventListener('click', this.handleSettingSelection.bind(this));
            }
            
            // A2 ATM 模擬器的開始按鈕無需驗證設定，始終可用
        },

        // =====================================================
        // 帳戶設定方法
        // =====================================================
        showPasswordInput() {
            this.showNumericInput('password', '設定密碼', '請輸入4-12位數密碼', this.state.settings.customPassword, 12);
        },

        showBalanceInput() {
            this.showNumericInput('balance', '設定帳戶金額', '請輸入帳戶金額', this.state.settings.customBalance.toString(), 8);
        },

        showNumericInput(type, title, instruction, currentValue, maxLength) {
            const app = document.getElementById('app');
            const modalHtml = `
                <div class="numeric-input-modal" id="numeric-modal">
                    <div class="modal-overlay" onclick="ATM.closeNumericInput()"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${title}</h3>
                            <button class="close-btn" onclick="ATM.closeNumericInput()">✕</button>
                        </div>
                        <div class="modal-body">
                            <p class="instruction">${instruction}</p>
                            <div class="display-area">
                                <input type="text" class="numeric-display" id="numeric-input" 
                                       value="${currentValue}" maxlength="${maxLength}" readonly>
                            </div>
                            <div class="numeric-keypad">
                                ${this.generateNumericKeypad()}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="cancel-btn" onclick="ATM.closeNumericInput()">取消</button>
                            <button class="confirm-btn" onclick="ATM.confirmNumericInput('${type}')">確認</button>
                        </div>
                    </div>
                </div>
            `;
            
            // 添加模態視窗到現有內容之上
            const modalDiv = document.createElement('div');
            modalDiv.innerHTML = modalHtml;
            document.body.appendChild(modalDiv.firstElementChild);
            
            // 綁定數字鍵盤事件
            this.bindNumericKeypadEvents();
            
            // 調整初始字體大小
            setTimeout(() => {
                const input = document.getElementById('numeric-input');
                if (input) {
                    this.adjustDisplayFontSize(input);
                }
            }, 100);
        },

        generateNumericKeypad() {
            const keys = [
                ['1', '2', '3'],
                ['4', '5', '6'], 
                ['7', '8', '9'],
                ['Clear', '0', 'Del']
            ];
            
            return keys.map(row => 
                `<div class="keypad-row">
                    ${row.map(key => 
                        `<button class="keypad-btn" data-key="${key}">${key}</button>`
                    ).join('')}
                </div>`
            ).join('');
        },

        bindNumericKeypadEvents() {
            const keypad = document.querySelector('.numeric-keypad');
            if (keypad) {
                keypad.addEventListener('click', (e) => {
                    if (e.target.classList.contains('keypad-btn')) {
                        const key = e.target.dataset.key;
                        this.handleNumericInput(key);
                    }
                });
            }
        },

        handleNumericInput(key) {
            const input = document.getElementById('numeric-input');
            if (!input) return;

            let currentValue = input.value;
            
            switch(key) {
                case 'Clear':
                    input.value = '';
                    break;
                case 'Del':
                    input.value = currentValue.slice(0, -1);
                    break;
                default:
                    if (currentValue.length < parseInt(input.maxLength)) {
                        input.value = currentValue + key;
                    }
                    break;
            }
            
            // 動態調整字體大小以適應長密碼
            this.adjustDisplayFontSize(input);
            
            // 播放按鍵音效
            if (this.audio) {
                this.audio.playBeep();
            }
        },

        adjustDisplayFontSize(input) {
            const length = input.value.length;
            if (length <= 6) {
                input.style.fontSize = '24px';
                input.style.letterSpacing = '2px';
            } else if (length <= 9) {
                input.style.fontSize = '20px';
                input.style.letterSpacing = '1.5px';
            } else {
                input.style.fontSize = '18px';
                input.style.letterSpacing = '1px';
            }
        },

        confirmNumericInput(type) {
            const input = document.getElementById('numeric-input');
            const value = input.value.trim();
            
            if (type === 'password') {
                if (value.length < 4 || value.length > 12 || !/^\d{4,12}$/.test(value)) {
                    alert('密碼必須是4-12位數字！');
                    return;
                }
                this.state.settings.customPassword = value;
                this.state.gameState.correctPin = value;
            } else if (type === 'balance') {
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue < 0 || numValue > 99999999) {
                    alert('請輸入有效的金額（0-99,999,999）！');
                    return;
                }
                this.state.settings.customBalance = numValue;
                this.state.gameState.accountBalance = numValue;
            }
            
            this.closeNumericInput();
            // 🔧 [優化] 只更新顯示值，避免整頁重新渲染造成閃爍
            this.updateAccountDisplayValues(type, value);
            
            // 播放確認音效
            if (this.audio) {
                this.audio.playSuccess();
            }
        },

        closeNumericInput() {
            const modal = document.getElementById('numeric-modal');
            if (modal) {
                modal.remove();
            }
        },

        handleSettingSelection(event) {
            const btn = event.target.closest('.selection-btn');
            if (!btn) return;

            const type = btn.dataset.type;
            const value = btn.dataset.value;
            const buttonText = btn.textContent.trim();

            // 播放按鈕文字語音
            this.speech.speak(buttonText);

            // 更新設定狀態
            if (type && this.state.settings.hasOwnProperty(type)) {
                this.state.settings[type] = isNaN(value) ? value : parseInt(value);
            }

            // 🔧 [優化] 只更新按鈕狀態，避免整頁重新渲染造成閃爍
            this.updateActiveStates(type, btn);
            
            // 播放選擇音效
            this.playMenuSelectSound();
        },

        // 🔧 [新增] 局部更新按鈕活動狀態（避免整頁重新渲染）
        updateActiveStates(type, selectedBtn) {
            // 移除同組所有按鈕的active狀態
            const group = selectedBtn.closest('.setting-group');
            const buttons = group.querySelectorAll('.selection-btn');
            buttons.forEach(btn => btn.classList.remove('active'));

            // 為選中的按鈕添加active狀態
            selectedBtn.classList.add('active');
        },

        // 🔧 [新增] 局部更新帳戶顯示值（避免整頁重新渲染）
        updateAccountDisplayValues(type, value) {
            if (type === 'password') {
                const passwordBtn = document.querySelector('[onclick="ATM.showPasswordInput()"]');
                if (passwordBtn) {
                    const small = passwordBtn.querySelector('small');
                    if (small) {
                        small.textContent = `目前密碼：${value}`;
                    }
                }
            } else if (type === 'balance') {
                const balanceBtn = document.querySelector('[onclick="ATM.showBalanceInput()"]');
                if (balanceBtn) {
                    const small = balanceBtn.querySelector('small');
                    if (small) {
                        small.textContent = `目前金額：$${parseInt(value).toLocaleString()}`;
                    }
                }
            }
        },

        playMenuSelectSound() {
            this.audio.playMenuSelect();
        },

        // =====================================================
        // 學習流程控制
        // =====================================================
        startLearning() {
            console.log('🎯 [A2-ATM] 開始ATM學習，解鎖音頻並播放歡迎語音');
            
            // 解鎖音頻
            this.unlockAudio();
            
            // 同步自訂設定到遊戲狀態
            this.state.gameState.correctPin = this.state.settings.customPassword;
            this.state.gameState.accountBalance = this.state.settings.customBalance;
            
            // 初始化測驗狀態
            this.state.quiz.currentQuestion = 0;
            this.state.quiz.score = 0;
            this.state.quiz.startTime = Date.now();
            
            // 進入ATM界面
            this.state.gameState.currentScene = 'atm-interface';
            this.showATMInterface();
            
            // 播放歡迎語音
            const { difficulty, sessionType } = this.state.settings;
            let welcomeText = '';
            
            const sessionNames = {
                withdraw: '提款',
                deposit: '存款', 
                inquiry: '查詢'
            };
            
            const sessionName = sessionNames[sessionType] || 'ATM';
            
            if (difficulty === 'easy') {
                welcomeText = `歡迎使用ATM學習系統！您將學習${sessionName}功能，系統會提供詳細的操作指導`;
            } else if (difficulty === 'normal') {
                welcomeText = `歡迎使用ATM學習系統！您將學習${sessionName}功能，請根據提示完成操作`;
            } else if (difficulty === 'hard') {
                welcomeText = `歡迎使用ATM學習系統！困難模式，請根據您的經驗完成${sessionName}操作`;
            }
            
            console.log('🎙️ [A2-ATM] 播放歡迎語音:', welcomeText);
            
            this.speech.speak(welcomeText, {
                interrupt: true,
                callback: () => {
                    console.log('🎙️ [A2-ATM] 歡迎語音完成，開始第一個場景');
                    this.startFirstScenario();
                }
            });
        },

        // =====================================================
        // ATM界面顯示
        // =====================================================
        showATMInterface() {
            const app = document.getElementById('app');
            app.innerHTML = this.generateATMInterface();
            
            // 綁定ATM界面事件
            this.bindATMEvents();
            
            // 初始化螢幕內容
            this.updateScreen('welcome');
        },

        bindATMEvents() {
            // 數字鍵盤已移至螢幕內，事件綁定在各畫面生成時處理
            
            // 綁定卡片插槽事件
            document.getElementById('card-slot').addEventListener('click', this.handleCardSlotClick.bind(this));
            
            // 綁定金融卡點擊事件
            document.getElementById('atm-card').addEventListener('click', this.handleCardClick.bind(this));
        },

        // =====================================================
        // 🔧 [新增] 標題列更新功能
        // =====================================================
        updateTitleBar(step, stepTitle) {
            const stepTitleElement = document.getElementById('atm-step-title');
            const progressInfoElement = document.getElementById('atm-progress-info');
            
            if (stepTitleElement) {
                stepTitleElement.textContent = stepTitle;
            }
            
            if (progressInfoElement) {
                progressInfoElement.textContent = `步驟 ${step} / 5`;
            }
        },

        // =====================================================
        // ATM螢幕內容更新
        // =====================================================
        updateScreen(screenType, data = {}) {
            const screenContent = document.getElementById('screen-content');
            
            // 檢查DOM元素是否存在
            if (!screenContent) {
                console.error('[A2-ATM錯誤] screen-content元素不存在，可能DOM未完全載入');
                // 嘗試延遲執行
                setTimeout(() => this.updateScreen(screenType, data), 100);
                return;
            }
            
            switch (screenType) {
                case 'welcome':
                    screenContent.innerHTML = this.generateWelcomeScreen();
                    this.updateTitleBar(1, '選擇語言');
                    this.bindLanguageSelectionEvents();
                    break;
                case 'insert-card':
                    screenContent.innerHTML = this.generateInsertCardScreen();
                    this.updateTitleBar(1, '插入金融卡');
                    break;
                case 'card-reading':
                    screenContent.innerHTML = this.generateCardReadingScreen();
                    this.updateTitleBar(1, '讀取卡片資料');
                    break;
                case 'pin-entry':
                    screenContent.innerHTML = this.generatePinEntryScreen(data);
                    this.updateTitleBar(2, '輸入密碼');
                    this.bindScreenKeypadEvents();
                    break;
                case 'menu':
                    screenContent.innerHTML = this.generateMenuScreen();
                    this.updateTitleBar(3, '選擇功能');
                    this.bindSideLabelEvents();
                    this.speech.speak('請選擇服務項目');
                    break;
                case 'amount-entry':
                    screenContent.innerHTML = this.generateAmountEntryScreen(data);
                    this.updateTitleBar(4, '輸入金額');
                    if (data.showKeypad) {
                        this.bindScreenKeypadEvents();
                    } else {
                        this.bindAmountOptionEvents();
                    }
                    break;
                case 'processing':
                    screenContent.innerHTML = this.generateProcessingScreen();
                    this.updateTitleBar(5, '處理交易');
                    break;
                case 'cash-dispensing':
                    screenContent.innerHTML = this.generateCashDispensingScreen();
                    this.updateTitleBar(5, '發鈔中');
                    break;
                case 'complete':
                    screenContent.innerHTML = this.generateCompleteScreen(data);
                    this.updateTitleBar(5, '交易完成');
                    break;
                case 'continue-transaction':
                    screenContent.innerHTML = this.generateContinueTransactionScreen();
                    this.updateTitleBar(5, '繼續交易？');
                    this.bindContinueTransactionEvents();
                    break;
                case 'continue-transaction-question':
                    screenContent.innerHTML = this.generateContinueTransactionQuestionScreen();
                    this.updateTitleBar(5, '繼續交易');
                    this.bindContinueTransactionQuestionEvents();
                    break;
                case 'card-eject':
                    screenContent.innerHTML = this.generateCardEjectScreen();
                    this.updateTitleBar(5, '取回卡片');
                    break;
                case 'card-eject-end':
                    screenContent.innerHTML = this.generateCardEjectEndScreen();
                    this.updateTitleBar(5, '交易結束');
                    // 播放交易結束語音
                    this.speech.speak('交易結束，請取回金融卡');
                    break;
                case 'take-cash':
                    screenContent.innerHTML = this.generateTakeCashScreen();
                    this.updateTitleBar(5, '收取現金');
                    break;
                case 'take-cash-with-message':
                    screenContent.innerHTML = this.generateTakeCashScreenWithMessage();
                    this.updateTitleBar(5, '收取現金');
                    break;
                case 'printing':
                    screenContent.innerHTML = this.generatePrintingScreen();
                    this.updateTitleBar(5, '列印中');
                    break;
                case 'final-complete':
                    screenContent.innerHTML = this.generateFinalCompleteScreen();
                    this.updateTitleBar(5, '交易完成');
                    break;
                case 'thank-you':
                    screenContent.innerHTML = this.generateThankYouScreen();
                    this.updateTitleBar(5, '謝謝惠顧');
                    break;
                case 'receipt-options':
                    screenContent.innerHTML = this.generateReceiptOptionsScreen();
                    this.updateTitleBar(5, '列印明細表');
                    // 播放列印明細表選項語音
                    this.speech.speak('請選擇是否需要列印交易明細表');
                    this.bindReceiptOptionEvents();
                    break;
                case 'receipt-important-notice':
                    screenContent.innerHTML = this.generateReceiptImportantNotice();
                    this.updateTitleBar(5, '重要憑證提醒');
                    break;
                case 'screen-receipt-display':
                    screenContent.innerHTML = this.generateScreenReceiptDisplay();
                    this.updateTitleBar(5, '交易明細表');
                    break;
                case 'deposit-cash':
                    screenContent.innerHTML = this.generateDepositCashScreen();
                    this.updateTitleBar(4, '存入現鈔');
                    this.bindDepositCashEvents();
                    break;
                case 'deposit-counting':
                    screenContent.innerHTML = this.generateDepositCountingScreen();
                    this.updateTitleBar(5, '數鈔辨識中');
                    break;
                case 'deposit-confirm':
                    screenContent.innerHTML = this.generateDepositConfirmScreen();
                    this.updateTitleBar(5, '確認存入現鈔');
                    this.bindDepositConfirmEvents();
                    break;
                case 'error':
                    screenContent.innerHTML = this.generateErrorScreen(data);
                    this.updateTitleBar(0, '操作錯誤');
                    break;
            }
        },
        
        
        // 綁定螢幕內側邊標籤事件
        bindSideLabelEvents() {
            document.querySelectorAll('.side-label').forEach(label => {
                label.addEventListener('click', (event) => {
                    const action = event.target.dataset.action;
                    this.audio.playBeep();
                    
                    // 播放項目語音
                    switch (action) {
                        case 'right-1':
                            this.speech.speak('提款');
                            this.selectMenuOption('withdraw');
                            break;
                        case 'right-2':
                            this.speech.speak('存款');
                            this.selectMenuOption('deposit');
                            break;
                        case 'right-3':
                            this.speech.speak('查詢');
                            this.selectMenuOption('inquiry');
                            break;
                        case 'right-4':
                            this.speech.speak('結束');
                            this.selectMenuOption('exit');
                            break;
                    }
                });
            });
        },
        
        // 綁定螢幕內數字鍵盤事件
        bindScreenKeypadEvents() {
            // 🔧 [修正] 只綁定未綁定過事件的按鈕，避免重複綁定
            document.querySelectorAll('.screen-key-btn:not([data-bound])').forEach(btn => {
                // 標記按鈕已綁定事件
                btn.setAttribute('data-bound', 'true');
                
                btn.addEventListener('click', (event) => {
                    const key = event.target.dataset.key;
                    
                    // 播放按鍵語音 - 只會播放一次
                    if (key >= '0' && key <= '9') {
                        this.speech.speak(key);
                    } else if (key === 'clear') {
                        this.speech.speak('清除');
                    } else if (key === 'enter') {
                        this.speech.speak('確認');
                    } else if (key === 'cancel') {
                        this.speech.speak('取消');
                    }
                    
                    this.handleKeyPress({ target: { dataset: { key } } });
                });
            });
        },
        
        // 綁定金額選項按鈕事件
        bindAmountOptionEvents() {
            document.querySelectorAll('.amount-option-btn').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    this.audio.playBeep();
                    
                    const action = event.target.dataset.action;
                    const amount = event.target.dataset.amount;
                    
                    if (action === 'custom') {
                        this.speech.speak('其他金額');
                        // 選擇其他金額，顯示數字鍵盤
                        this.state.gameState.transactionAmount = 0;
                        this.updateScreen('amount-entry', { 
                            showKeypad: true, 
                            currentAmount: 0 
                        });
                    } else if (amount) {
                        // 播放金額語音，完成後再進入處理流程
                        const amountValue = parseInt(amount);
                        const amountText = this.convertAmountToSpeech(amountValue);
                        this.state.gameState.transactionAmount = amountValue;

                        this.speech.speak(amountText, {
                            callback: () => {
                                // 金額語音播放完畢後，進入處理流程，標記已播放過金額語音
                                this.processTransaction(true); // 傳入參數表示已播放過金額語音
                            }
                        });
                    }
                });
            });
        },

        // 綁定繼續交易選項事件
        bindContinueTransactionEvents() {
            document.querySelectorAll('.option-btn').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    this.audio.playBeep();
                    
                    const action = event.target.dataset.action;
                    const buttonText = event.target.textContent.trim();
                    
                    // 播放按鈕文字語音
                    if (buttonText.includes('繼續')) {
                        this.speech.speak('繼續');
                    } else if (buttonText.includes('結束')) {
                        this.speech.speak('結束交易');
                    }
                    
                    switch (action) {
                        case 'continue':
                            this.handleContinueTransaction();
                            break;
                        case 'finish':
                            this.handleFinishTransaction();
                            break;
                    }
                });
            });
        },

        // 綁定列印明細表選項事件
        bindReceiptOptionEvents() {
            document.querySelectorAll('.option-btn').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    this.audio.playBeep();
                    
                    const action = event.target.dataset.action;
                    const buttonText = event.target.textContent.trim();
                    
                    // 播放按鈕文字語音
                    if (buttonText.includes('列印')) {
                        this.speech.speak('列印明細表');
                    } else if (buttonText.includes('不列印') || buttonText.includes('不要')) {
                        this.speech.speak('不列印');
                    }
                    
                    switch (action) {
                        case 'print':
                            this.handlePrintReceipt();
                            break;
                        case 'no-print':
                            this.handleNoPrintReceipt();
                            break;
                    }
                });
            });
        },

        // 綁定語言選擇事件
        bindLanguageSelectionEvents() {
            document.querySelectorAll('.language-btn').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    this.audio.playBeep();
                    
                    const lang = event.target.dataset.lang;
                    const buttonText = event.target.textContent.trim();
                    
                    // 先播放按鈕文字語音
                    this.speech.speak(buttonText);
                    
                    this.state.settings.language = lang;
                    
                    // 更新按鈕狀態
                    document.querySelectorAll('.language-btn').forEach(b => b.classList.remove('active'));
                    event.target.classList.add('active');
                    
                    // 再播放選擇確認語音
                    setTimeout(() => {
                        const message = lang === 'chinese' ? '已選擇中文' : 'Chinese language selected';
                        this.speech.speak(message);
                    }, 1000);
                });
            });
        },

        generateWelcomeScreen() {
            return `
                <div class="screen-welcome">
                    <div class="atm-logo">🏦</div>
                    <h2>歡迎使用ATM</h2>
                    <div class="language-selection">
                        <h3>請選擇語言 / Please Select Language</h3>
                        <div class="language-buttons">
                            <button class="language-btn active" data-lang="chinese">🇹🇼 中文</button>
                            <button class="language-btn" data-lang="english">🇺🇸 English</button>
                        </div>
                    </div>
                    <p class="welcome-message">請插入您的金融卡</p>
                    <div class="blinking-arrow">👇</div>
                    <div class="service-hours">
                        <small>24小時服務</small>
                    </div>
                </div>
            `;
        },

        generateInsertCardScreen() {
            return `
                <div class="screen-insert-card">
                    <div class="instruction-icon">💳</div>
                    <h2 style="color: white;">請插入金融卡</h2>
                    <div class="card-animation">
                        <div class="card-graphic"></div>
                        <div class="insertion-arrow">→</div>
                    </div>
                    <p class="instruction-text">請將金融卡插入左方卡槽</p>
                </div>
            `;
        },

        // 🔧 [新增] 卡片資料讀取畫面
        generateCardReadingScreen() {
            return `
                <div class="screen-card-reading">
                    <div class="reading-icon">📖</div>
                    <h2 style="color: white;">卡片資料讀取中，請稍候</h2>
                    <div class="reading-animation">
                        <div class="reading-spinner"></div>
                        <div class="reading-progress">
                            <div class="reading-bar"></div>
                        </div>
                    </div>
                    <div class="reading-dots">
                        <span class="dot">●</span>
                        <span class="dot">●</span>
                        <span class="dot">●</span>
                    </div>
                </div>
            `;
        },

        generatePinEntryScreen(data = {}) {
            const pinDisplay = data.currentPin ? '*'.repeat(data.currentPin.length) : '';
            const maxPinLength = 4;
            
            return `
                <div class="screen-pin-entry">
                    <div class="pin-header">
                        <h2 style="color: white;">🔐 請輸入密碼</h2>
                        <div class="pin-input-area">
                            <div class="pin-display">
                                ${Array.from({length: maxPinLength}, (_, i) => `
                                    <div class="pin-dot ${i < pinDisplay.length ? 'filled' : ''}">
                                        ${i < pinDisplay.length ? '●' : '○'}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ${data.error ? `<p class="error-message">❌ ${data.error}</p>` : ''}
                        <div class="attempts-remaining">
                            ${data.attemptsLeft ? `剩餘嘗試次數: ${data.attemptsLeft}` : ''}
                        </div>
                    </div>
                    
                    <div class="screen-keypad">
                        <div class="screen-keypad-grid">
                            <button class="screen-key-btn number-key" data-key="1">1</button>
                            <button class="screen-key-btn number-key" data-key="2">2</button>
                            <button class="screen-key-btn number-key" data-key="3">3</button>
                            
                            <button class="screen-key-btn number-key" data-key="4">4</button>
                            <button class="screen-key-btn number-key" data-key="5">5</button>
                            <button class="screen-key-btn number-key" data-key="6">6</button>
                            
                            <button class="screen-key-btn number-key" data-key="7">7</button>
                            <button class="screen-key-btn number-key" data-key="8">8</button>
                            <button class="screen-key-btn number-key" data-key="9">9</button>
                            
                            <button class="screen-key-btn action-key cancel-key" data-key="cancel">取消</button>
                            <button class="screen-key-btn number-key" data-key="0">0</button>
                            <button class="screen-key-btn action-key" data-key="clear">清除</button>
                            
                            <button class="screen-key-btn action-key enter-key" data-key="enter">確認</button>
                        </div>
                    </div>
                </div>
            `;
        },

        generateMenuScreen() {
            const { sessionType } = this.state.settings;
            const balance = this.state.gameState.accountBalance.toLocaleString();
            
            return `
                <div class="screen-menu">
                    <div class="menu-header">
                        <h2 style="color: white;">主選單</h2>
                        <div class="account-info">請選擇服務項目</div>
                    </div>
                    <div class="menu-layout-grid">
                        <div class="menu-options-grid">
                            <div class="side-label" data-action="right-1">💰 提款 ►</div>
                            <div class="side-label" data-action="right-2">💳 存款 ►</div>
                            <div class="side-label" data-action="right-3">📊 查詢 ►</div>
                            <div class="side-label" data-action="right-4">🚪 結束 ►</div>
                        </div>
                    </div>
                    <p class="instruction-text">請使用右側按鈕選擇功能</p>
                </div>
            `;
        },

        generateAmountEntryScreen(data = {}) {
            const { sessionType } = this.state.settings;
            const showKeypad = data.showKeypad || false;
            const currentAmount = data.currentAmount || '';
            
            const actionText = {
                withdraw: '提領',
                deposit: '存入'
            }[sessionType] || '金額';
            
            // 如果顯示數字鍵盤（選擇了其他金額）
            if (showKeypad) {
                return `
                    <div class="screen-amount-entry">
                        <div class="amount-header">
                            <div class="amount-icon">${sessionType === 'withdraw' ? '💰' : '💳'}</div>
                            <h2 style="color: white;">請輸入${actionText}金額</h2>
                            <div class="amount-input-area">
                                <div class="currency-symbol">NT$</div>
                                <div class="amount-display">${currentAmount.toLocaleString()}</div>
                            </div>
                            ${data.error ? `<p class="error-message">❌ ${data.error}</p>` : ''}
                        </div>
                        
                        <div class="screen-keypad">
                            <div class="screen-keypad-grid">
                                <button class="screen-key-btn number-key" data-key="1">1</button>
                                <button class="screen-key-btn number-key" data-key="2">2</button>
                                <button class="screen-key-btn number-key" data-key="3">3</button>
                                
                                <button class="screen-key-btn number-key" data-key="4">4</button>
                                <button class="screen-key-btn number-key" data-key="5">5</button>
                                <button class="screen-key-btn number-key" data-key="6">6</button>
                                
                                <button class="screen-key-btn number-key" data-key="7">7</button>
                                <button class="screen-key-btn number-key" data-key="8">8</button>
                                <button class="screen-key-btn number-key" data-key="9">9</button>
                                
                                <button class="screen-key-btn action-key cancel-key" data-key="cancel">取消</button>
                                <button class="screen-key-btn number-key" data-key="0">0</button>
                                <button class="screen-key-btn action-key" data-key="clear">清除</button>
                                
                                <button class="screen-key-btn action-key enter-key" data-key="enter">確認</button>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // 預設顯示快速金額選擇
            return `
                <div class="screen-amount-selection">
                    <div class="amount-header">
                        <div class="amount-icon">${sessionType === 'withdraw' ? '💰' : '💳'}</div>
                        <h2 style="color: white;">請選擇${actionText}金額</h2>
                        ${data.error ? `<p class="error-message">❌ ${data.error}</p>` : ''}
                    </div>
                    
                    <div class="amount-options-grid">
                        <div class="amount-option-btn" data-action="custom">1. 其他金額</div>
                        <div class="amount-option-btn" data-amount="1000">2. NT$1,000</div>
                        <div class="amount-option-btn" data-amount="3000">3. NT$3,000</div>
                        <div class="amount-option-btn" data-amount="5000">4. NT$5,000</div>
                        <div class="amount-option-btn" data-amount="10000">5. NT$10,000</div>
                        <div class="amount-option-btn" data-amount="20000">6. NT$20,000</div>
                        <div class="amount-option-btn" data-amount="40000">7. NT$40,000</div>
                        <div class="amount-option-btn" data-amount="60000">8. NT$60,000</div>
                    </div>
                    
                    <p class="instruction-text" style="color: white;">請選擇金額或點選其他金額自行輸入</p>
                </div>
            `;
        },

        generateProcessingScreen() {
            return `
                <div class="screen-processing">
                    <div class="processing-animation">
                        <div class="spinner"></div>
                    </div>
                    <h2 style="color: white;">交易處理中，請稍候</h2>
                    <p class="processing-text">系統正在處理您的交易請求</p>
                    <div class="processing-dots">
                        <span class="dot">●</span>
                        <span class="dot">●</span>
                        <span class="dot">●</span>
                    </div>
                </div>
            `;
        },

        generateCashDispensingScreen() {
            return `
                <div class="screen-cash-dispensing">
                    <div class="dispensing-animation">
                        <div class="cash-icon">💰</div>
                        <div class="spinner"></div>
                    </div>
                    <h2 style="color: white;">發鈔中，請稍候</h2>
                    <p class="dispensing-text">系統正在為您準備現金</p>
                    <div class="processing-dots">
                        <span class="dot">●</span>
                        <span class="dot">●</span>
                        <span class="dot">●</span>
                    </div>
                </div>
            `;
        },

        // 步驟 4：存入現鈔畫面
        generateDepositCashScreen() {
            return `
                <div class="screen-deposit-cash">
                    <div class="deposit-header">
                        <h2 style="color: white;">請存入現鈔</h2>
                        <div class="deposit-instructions">
                            <p>請點擊下方現金出口放入鈔票</p>
                        </div>
                    </div>

                    <div class="deposit-limits">
                        <div class="limit-item">
                            <span class="limit-label">每次存入鈔票張數最多</span>
                            <span class="limit-value">100張</span>
                        </div>
                        <div class="limit-item">
                            <span class="limit-label">每次存入金額最高</span>
                            <span class="limit-value">6萬元</span>
                        </div>
                    </div>

                    <div class="deposit-guidelines">
                        <h3>存款注意事項：</h3>
                        <ul>
                            <li>請於存款前確認存款金額，並將鈔票排列整齊</li>
                            <li>依圖示放入現金。請勿將貼紙、橡皮筋或迴紋針等異物一同放入，以免造成機器故障</li>
                        </ul>
                    </div>

                    <div class="deposit-actions">
                        <div class="side-label-left cancel-action" data-action="cancel">◄ 取消</div>
                        <div class="side-label-right confirm-action" data-action="confirm">確認 ►</div>
                    </div>

                    <p class="cancel-instruction">取消請按"取消鍵"</p>
                </div>
            `;
        },

        // 步驟 7：機器數鈔辨識中畫面
        generateDepositCountingScreen() {
            return `
                <div class="screen-deposit-counting">
                    <div class="counting-animation">
                        <div class="money-icon">💴</div>
                        <div class="spinner"></div>
                    </div>
                    <h2 style="color: white;">機器數鈔辨識中，請稍候</h2>
                    <p class="counting-text">系統正在辨識您的鈔票</p>

                    <div class="rejection-notice">
                        <h3>如有不接受之鈔票</h3>
                        <ol>
                            <li>請先取回不接受之鈔票</li>
                            <li>接受之鈔票存入請按"確認"鍵，取消請按"取消"鍵</li>
                        </ol>
                    </div>

                    <div class="processing-dots">
                        <span class="dot">●</span>
                        <span class="dot">●</span>
                        <span class="dot">●</span>
                    </div>
                </div>
            `;
        },

        // 步驟 8：確認存入現鈔畫面
        generateDepositConfirmScreen() {
            const bills = this.state.gameState.depositBills;
            const totalAmount = this.getTotalDepositAmount();
            const totalCount = this.getTotalBillCount();

            return `
                <div class="screen-deposit-confirm">
                    <div class="confirm-header">
                        <h2 style="color: white;">請確認存入現鈔</h2>
                    </div>

                    <div class="deposit-summary-table">
                        <div class="summary-row amount-row">
                            <span class="label">實際存款金額</span>
                            <span class="value">${totalAmount.toLocaleString()}元</span>
                        </div>
                        ${bills[2000] > 0 ? `
                            <div class="summary-row">
                                <span class="label">NT$ 2000</span>
                                <span class="value">${bills[2000]}張</span>
                            </div>` : ''}
                        ${bills[1000] > 0 ? `
                            <div class="summary-row">
                                <span class="label">NT$ 1000</span>
                                <span class="value">${bills[1000]}張</span>
                            </div>` : ''}
                        ${bills[500] > 0 ? `
                            <div class="summary-row">
                                <span class="label">NT$ 500</span>
                                <span class="value">${bills[500]}張</span>
                            </div>` : ''}
                        ${bills[100] > 0 ? `
                            <div class="summary-row">
                                <span class="label">NT$ 100</span>
                                <span class="value">${bills[100]}張</span>
                            </div>` : ''}
                        <div class="summary-row total-row">
                            <span class="label">合計</span>
                            <span class="value">${totalCount}張</span>
                        </div>
                    </div>

                    <div class="confirm-actions">
                        <div class="side-label-left cancel-action" data-action="cancel">◄ 取消</div>
                        <div class="side-label-right confirm-action" data-action="confirm">確認 ►</div>
                    </div>

                    <p class="confirm-instruction">依實際金額存入請按"確認"鍵；取消請按"取消"鍵</p>
                </div>
            `;
        },

        generateContinueTransactionQuestionScreen() {
            return `
                <div class="screen-continue-transaction-question">
                    <div class="question-header">
                        <div class="success-icon">✅</div>
                        <h2 style="color: white;">交易完成</h2>
                        <p class="question-message">本交易完成後是否繼續其他交易？</p>
                    </div>
                    
                    <div class="transaction-options">
                        <button class="option-btn continue-btn" data-action="continue">
                            <span class="btn-icon">🔄</span>
                            <span class="btn-text">繼續交易</span>
                        </button>
                        <button class="option-btn end-btn" data-action="end">
                            <span class="btn-icon">🚪</span>
                            <span class="btn-text">結束交易</span>
                        </button>
                    </div>
                </div>
            `;
        },

        generateCardEjectScreen() {
            return `
                <div class="screen-card-eject">
                    <div class="eject-header">
                        <div class="card-icon">💳</div>
                        <h2>晶片金融卡已退出，請取回</h2>
                        <p class="eject-message">請點擊金融卡取回您的卡片</p>
                    </div>
                    
                    <div class="eject-animation">
                        <div class="card-slot-visual">
                            <div class="slot-opening"></div>
                            <div class="arrow-indicator">👆</div>
                        </div>
                    </div>
                </div>
            `;
        },

        generateCardEjectEndScreen() {
            return `
                <div class="screen-card-eject-end">
                    <div class="eject-header">
                        <div class="card-icon">💳</div>
                        <h2 style="color: white;">交易結束，請取回金融卡</h2>
                        <p class="eject-message">感謝您的使用，請點擊金融卡取回</p>
                    </div>
                    
                    <div class="eject-animation">
                        <div class="card-slot-visual">
                            <div class="slot-opening"></div>
                            <div class="arrow-indicator">👆</div>
                        </div>
                    </div>
                    
                    <div class="thank-you-message">
                        <p>謝謝使用ATM服務</p>
                    </div>
                </div>
            `;
        },

        generateTakeCashScreen() {
            return `
                <div class="screen-take-cash">
                    <div class="cash-header">
                        <div class="cash-icon">💰</div>
                        <h2 style="color: white;">請收取現金</h2>
                        <p class="cash-message">您的現金已準備完畢，請從現金出口收取</p>
                    </div>
                    
                    <div class="cash-animation">
                        <div class="cash-slot-visual">
                            <div class="money-bills">💵💵💵</div>
                            <div class="arrow-indicator">👇</div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        generateTakeCashScreenWithMessage() {
            return `
                <div class="screen-take-cash">
                    <div class="cash-header">
                        <div class="cash-icon">💰</div>
                        <h2 style="color: white;">請收取現金，並妥善保存</h2>
                        <p class="cash-message">您的現金已準備完畢，請從現金出口收取並妥善保存</p>
                    </div>
                    
                    <div class="cash-animation">
                        <div class="cash-slot-visual">
                            <div class="money-bills">💵💵💵</div>
                            <div class="arrow-indicator">👇</div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        // 階段1：重要憑證提醒畫面
        generateReceiptImportantNotice() {
            return `
                <div class="screen-receipt-notice">
                    <div class="receipt-notice-header">
                        <div class="receipt-notice-icon">📄</div>
                        <h2 style="color: white;">交易明細表為重要入帳憑證</h2>
                        <h3 style="color: white;">請務必妥善收存</h3>
                    </div>

                    <div class="printing-animation">
                        <div class="printer-icon">🖨️</div>
                        <div class="printing-dots">
                            <span class="dot">●</span>
                            <span class="dot">●</span>
                            <span class="dot">●</span>
                        </div>
                    </div>

                    <div class="notice-message">
                        <p class="main-message">系統正在準備您的交易明細表</p>
                        <p class="sub-message">請稍候，即將完成</p>
                    </div>
                </div>
            `;
        },

        generateThankYouScreen() {
            return `
                <div class="screen-thank-you">
                    <div class="thank-you-header">
                        <div class="thank-you-icon">🙏</div>
                        <h2 style="color: white;">謝謝您的惠顧</h2>
                        <h3 style="color: white;">歡迎再次光臨</h3>
                        <h4 style="color: white;">請稍候插卡</h4>
                    </div>

                    <div class="thank-you-message">
                        <p class="main-message">感謝您使用本ATM服務</p>
                        <p class="sub-message">期待您的再次光臨</p>
                    </div>

                    <div class="waiting-animation">
                        <div class="card-icon">💳</div>
                        <div class="waiting-dots">
                            <span class="dot">●</span>
                            <span class="dot">●</span>
                            <span class="dot">●</span>
                        </div>
                    </div>
                </div>
            `;
        },

        generatePrintingScreen() {
            return `
                <div class="screen-printing">
                    <div class="printing-animation">
                        <div class="printer-icon">🖨️</div>
                        <div class="spinner"></div>
                    </div>
                    <h2 style="color: white;">交易明細表列印中，請稍候</h2>
                    <p class="printing-text">系統正在為您列印交易明細表</p>
                    <div class="processing-dots">
                        <span class="dot">●</span>
                        <span class="dot">●</span>
                        <span class="dot">●</span>
                    </div>
                </div>
            `;
        },

        generateFinalCompleteScreen() {
            return `
                <div class="screen-final-complete">
                    <div class="complete-header">
                        <div class="complete-icon">✅</div>
                        <h2 style="color: white;">交易完成</h2>
                        <p class="complete-message">請取回交易明細表，謝謝您的惠顧</p>
                    </div>
                    
                    <div class="receipt-animation">
                        <div class="receipt-slot-visual">
                            <div class="receipt-paper">🧾</div>
                            <div class="arrow-indicator">👆</div>
                        </div>
                    </div>
                    
                </div>
            `;
        },

        generateCompleteScreen(data = {}) {
            const { sessionType } = this.state.settings;
            const amount = data.amount || 0;
            const newBalance = this.state.gameState.accountBalance;
            
            const actionText = {
                withdraw: '提款',
                deposit: '存款',
                inquiry: '查詢'
            }[sessionType] || '交易';
            
            return `
                <div class="screen-complete">
                    <div class="success-icon">✅</div>
                    <h2>${actionText}完成</h2>
                    <div class="transaction-details">
                        ${amount > 0 ? `
                            <div class="detail-row">
                                <span>${actionText}金額:</span>
                                <span>NT$ ${amount.toLocaleString()}</span>
                            </div>
                        ` : ''}
                        <div class="detail-row">
                            <span>帳戶餘額:</span>
                            <span>NT$ ${newBalance.toLocaleString()}</span>
                        </div>
                        <div class="detail-row">
                            <span>交易時間:</span>
                            <span>${new Date().toLocaleString()}</span>
                        </div>
                    </div>
                    <p class="instruction-text">請取走您的卡片和現金</p>
                    <div class="completion-message">
                        <p>🎉 恭喜完成ATM操作！</p>
                        <p>經驗值 +${data.experience || 100}</p>
                    </div>
                </div>
            `;
        },

        generateContinueTransactionScreen() {
            return `
                <div class="screen-continue-transaction">
                    <div class="options-header">
                        <div class="success-icon">✅</div>
                        <h2 style="color: white;">交易完成</h2>
                        <p class="completion-message">您的提款已完成，請取走現金</p>
                    </div>
                    
                    <div class="continue-question">
                        <h3>是否繼續交易？</h3>
                        <div class="option-buttons">
                            <button class="option-btn continue-btn" data-action="continue">
                                ✅ 繼續交易
                            </button>
                            <button class="option-btn finish-btn" data-action="finish">
                                🚪 結束交易
                            </button>
                        </div>
                    </div>
                    
                    <p class="instruction-text">請選擇您要進行的操作</p>
                </div>
            `;
        },

        generateReceiptOptionsScreen() {
            return `
                <div class="screen-receipt-options">
                    <div class="options-header">
                        <div class="receipt-icon">🧾</div>
                        <h2 style="color: white;">明細表列印</h2>
                        <p class="completion-message">請選擇是否需要列印交易明細表</p>
                    </div>
                    
                    <div class="receipt-question">
                        <h3 style="color: white;">是否列印明細表？</h3>
                        <div class="option-buttons">
                            <button class="option-btn print-btn" data-action="print">
                                🖨️ 列印明細表
                            </button>
                            <button class="option-btn no-print-btn" data-action="no-print">
                                ❌ 不需要明細表
                            </button>
                        </div>
                    </div>
                    
                    <p class="instruction-text">請選擇您要進行的操作</p>
                </div>
            `;
        },

        generateErrorScreen(data = {}) {
            return `
                <div class="screen-error">
                    <div class="error-icon">⚠️</div>
                    <h2>操作錯誤</h2>
                    <p class="error-message">${data.message || '請重新操作'}</p>
                    <div class="error-suggestions">
                        ${data.suggestions ? data.suggestions.map(suggestion => 
                            `<p class="suggestion">• ${suggestion}</p>`
                        ).join('') : ''}
                    </div>
                    <p class="instruction-text">請按取消鍵重新開始</p>
                </div>
            `;
        },

        // =====================================================
        // 按鍵處理系統
        // =====================================================
        handleKeyPress(event) {
            const key = event.target.dataset.key;
            if (!key) return;

            this.audio.playBeep();
            
            // 🔧 [修正] 移除重複的語音播放，語音已在bindScreenKeypadEvents中處理
            switch (key) {
                case '0': case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                    // 語音已在按鈕點擊事件中播放，這裡不重複播放
                    this.handleNumberInput(key);
                    break;
                case 'enter':
                    // 語音已在按鈕點擊事件中播放，這裡不重複播放
                    this.handleEnterKey();
                    break;
                case 'clear':
                    // 語音已在按鈕點擊事件中播放，這裡不重複播放
                    this.handleClearKey();
                    break;
                case 'cancel':
                    // 語音已在按鈕點擊事件中播放，這裡不重複播放
                    this.handleCancelKey();
                    break;
                case 'correction':
                    this.speech.speak('更正');
                    this.handleCorrectionKey();
                    break;
                case 'receipt':
                    this.speech.speak('明細');
                    this.handleReceiptKey();
                    break;
            }
            
            console.log('🔢 [A2-ATM] 按鍵按下:', key);
        },

        handleNumberInput(digit) {
            const currentScene = this.state.gameState.currentScene;
            
            if (currentScene === 'pin-entry') {
                if (this.state.gameState.currentPin.length < 4) {
                    this.state.gameState.currentPin += digit;
                    this.updateScreen('pin-entry', {
                        currentPin: this.state.gameState.currentPin,
                        attemptsLeft: 3 - this.state.gameState.pinAttempts
                    });
                }
            } else if (currentScene === 'amount-entry') {
                const currentAmount = this.state.gameState.transactionAmount || 0;
                const newAmount = currentAmount * 10 + parseInt(digit);
                
                // 限制最大金額
                if (newAmount <= 100000) {
                    this.state.gameState.transactionAmount = newAmount;
                    this.updateScreen('amount-entry', {
                        showKeypad: true,
                        currentAmount: newAmount
                    });
                }
            }
        },

        handleEnterKey() {
            const currentScene = this.state.gameState.currentScene;
            
            if (currentScene === 'pin-entry') {
                this.validatePin();
            } else if (currentScene === 'amount-entry') {
                this.processTransaction();
            }
        },

        handleClearKey() {
            const currentScene = this.state.gameState.currentScene;
            
            if (currentScene === 'pin-entry') {
                this.state.gameState.currentPin = '';
                this.updateScreen('pin-entry', {
                    currentPin: '',
                    attemptsLeft: 3 - this.state.gameState.pinAttempts
                });
            } else if (currentScene === 'amount-entry') {
                this.state.gameState.transactionAmount = 0;
                this.updateScreen('amount-entry', {
                    showKeypad: true,
                    currentAmount: 0
                });
            }
        },

        handleCancelKey() {
            const currentScene = this.state.gameState.currentScene;
            
            if (currentScene === 'amount-entry') {
                // 檢查是否在數字鍵盤模式，如果是，返回金額選擇頁面
                const currentScreenContent = document.getElementById('screen-content').innerHTML;
                if (currentScreenContent.includes('screen-keypad')) {
                    this.audio.playBeep();
                    this.state.gameState.transactionAmount = 0;
                    this.updateScreen('amount-entry', { showKeypad: false });
                    return;
                }
            }
            
            // 其他情況：取消當前操作，返回主選單
            this.speech.speak('交易已取消', {
                callback: () => {
                    this.resetTransaction();
                    this.updateScreen('menu');
                    this.state.gameState.currentScene = 'menu';
                }
            });
        },

        handleCorrectionKey() {
            const currentScene = this.state.gameState.currentScene;
            
            if (currentScene === 'pin-entry' && this.state.gameState.currentPin.length > 0) {
                this.state.gameState.currentPin = this.state.gameState.currentPin.slice(0, -1);
                this.updateScreen('pin-entry', {
                    currentPin: this.state.gameState.currentPin,
                    attemptsLeft: 3 - this.state.gameState.pinAttempts
                });
            } else if (currentScene === 'amount-entry' && this.state.gameState.transactionAmount > 0) {
                this.state.gameState.transactionAmount = Math.floor(this.state.gameState.transactionAmount / 10);
                this.updateScreen('amount-entry', {
                    currentAmount: this.state.gameState.transactionAmount
                });
            }
        },

        handleReceiptKey() {
            this.printReceipt();
        },


        // =====================================================
        // 業務邏輯處理
        // =====================================================
        handleCardSlotClick() {
            if (!this.state.gameState.cardInserted) {
                this.insertCard();
            }
        },

        // 處理金融卡點擊事件
        handleCardClick() {
            if (!this.state.gameState.cardInserted && this.state.gameState.currentScene === 'insert-card') {
                this.performCardInsertAnimation();
            }
        },

        // 執行卡片插入動畫效果
        performCardInsertAnimation() {
            const cardElement = document.getElementById('atm-card');
            const cardSlot = document.getElementById('card-slot');
            const cardLight = document.getElementById('card-light');
            const cardSlit = document.getElementById('card-slit');
            
            if (cardElement && cardSlot) {
                // 播放音效
                this.audio.playBeep();
                
                // 添加插入動畫類
                cardElement.classList.add('card-inserting');
                
                // 動畫進行中時點亮插槽燈光和細縫
                setTimeout(() => {
                    if (cardLight) {
                        cardLight.classList.add('active');
                    }
                    if (cardSlit) {
                        cardSlit.classList.add('active');
                    }
                }, 1000); // 在動畫中後段點亮燈光
                
                // 動畫完成後觸發讀取流程
                setTimeout(() => {
                    cardElement.classList.remove('card-inserting');
                    cardElement.classList.add('card-inserted');
                    
                    // 🔧 [強化] 確保卡片完全隱藏
                    cardElement.style.display = 'none';
                    
                    // 🔧 [新增] 動畫完成後顯示讀取畫面並播放語音
                    this.updateScreen('card-reading');
                    this.state.gameState.currentScene = 'card-reading';
                    
                    // 🔧 [新增] 在動畫完成後播放語音提示
                    this.speech.speak('卡片資料讀取中，請稍候', {
                        callback: () => {
                            // 讀取完成後進入密碼輸入
                            setTimeout(() => {
                                // 🔧 [修正] 先切換到密碼輸入畫面，然後播放語音
                                this.insertCard();
                                
                                // 稍微延遲，確保畫面切換完成後播放語音
                                setTimeout(() => {
                                    this.speech.speak('請輸入晶片金融卡密碼，輸入完成後，請按確認鍵');
                                }, 200);
                            }, 1500); // 模擬讀取時間
                        }
                    });
                }, 1800); // 確保動畫完整播放
            }
        },

        insertCard() {
            this.state.gameState.cardInserted = true;
            
            // 燈光效果已經在動畫中處理，這裡直接進入下一步
            this.updateScreen('pin-entry', {
                currentPin: '',
                attemptsLeft: 3 - this.state.gameState.pinAttempts
            });
            this.state.gameState.currentScene = 'pin-entry';
            
        },

        validatePin() {
            const enteredPin = this.state.gameState.currentPin;
            const correctPin = this.state.gameState.correctPin;

            if (enteredPin.length !== correctPin.length) {
                this.updateScreen('pin-entry', {
                    currentPin: enteredPin,
                    error: `請輸入${correctPin.length}位數密碼`,
                    attemptsLeft: 3 - this.state.gameState.pinAttempts
                });
                return;
            }
            
            if (enteredPin === correctPin) {
                this.speech.speak('密碼正確', {
                    callback: () => {
                        this.updateScreen('menu');
                        this.state.gameState.currentScene = 'menu';
                    }
                });
            } else {
                this.state.gameState.pinAttempts++;
                this.audio.playError();
                
                if (this.state.gameState.pinAttempts >= 3) {
                    // 立即顯示錯誤訊息
                    this.updateScreen('pin-entry', {
                        currentPin: '',
                        error: '密碼錯誤次數過多，卡片已被保留',
                        attemptsLeft: 0
                    });
                    
                    this.speech.speak('密碼錯誤次數過多，卡片已被保留', {
                        callback: () => {
                            this.endTransaction('密碼錯誤次數過多');
                        }
                    });
                } else {
                    this.state.gameState.currentPin = '';
                    
                    // 立即顯示錯誤訊息
                    this.updateScreen('pin-entry', {
                        currentPin: '',
                        error: '密碼錯誤，請重新輸入',
                        attemptsLeft: 3 - this.state.gameState.pinAttempts
                    });
                    
                    this.speech.speak('密碼錯誤，請重新輸入');
                }
            }
        },

        selectMenuOption(option) {
            switch (option) {
                case 'withdraw':
                    this.startWithdrawProcess();
                    break;
                case 'deposit':
                    this.startDepositProcess();
                    break;
                case 'inquiry':
                    this.startInquiryProcess();
                    break;
                case 'exit':
                    this.startEndTransactionWithCash();
                    break;
            }
        },

        getSessionTypeName(sessionType) {
            const names = {
                withdraw: '提款',
                deposit: '存款',
                inquiry: '餘額查詢'
            };
            return names[sessionType] || '提款';
        },

        startWithdrawProcess() {
            this.state.gameState.currentTransaction.type = 'withdraw';
            
            // 🔧 [修正] 先切換到金額輸入畫面，然後同時播放語音
            this.updateScreen('amount-entry', { currentAmount: 0 });
            this.state.gameState.currentScene = 'amount-entry';
            
            // 稍微延遲確保畫面切換完成後播放語音
            setTimeout(() => {
                this.speech.speak('請輸入提領金額');
            }, 200);
        },

        startDepositProcess() {
            this.state.gameState.currentTransaction.type = 'deposit';

            // 步驟 3：顯示「處理中請稍候」
            this.updateScreen('processing', { message: '處理中，請稍候...' });
            this.state.gameState.currentScene = 'deposit-processing';

            // 2秒後進入步驟 4：存入現鈔畫面
            setTimeout(() => {
                this.showDepositCashScreen();
            }, 2000);
        },

        // 步驟 4：顯示存入現鈔畫面
        showDepositCashScreen() {
            this.updateScreen('deposit-cash');
            this.state.gameState.currentScene = 'deposit-cash';

            // 打開現金出口動畫
            this.openCashSlotForDeposit();

            this.speech.speak('請存入現鈔');
        },

        // 打開現金出口（存款用）
        openCashSlotForDeposit() {
            console.log('🏧 [A2-ATM] 嘗試打開現金出口...');

            // 隱藏金額拉桿（清理舊狀態）
            this.hideAmountSlider();

            // 清空現金出口中的舊金錢顯示
            const cashDisplay = document.querySelector('.cash-display-background');
            if (cashDisplay) {
                cashDisplay.innerHTML = '';
                cashDisplay.style.display = 'none';
                console.log('🏧 [A2-ATM] 清空現金出口舊內容');
            }

            const cashCover = document.getElementById('cash-display-cover');
            if (cashCover) {
                console.log('🏧 [A2-ATM] 找到現金出口蓋板，執行開啟動畫');
                cashCover.classList.add('opening');

                // 添加現金出口閃爍提示
                const cashDispenserArea = document.querySelector('.cash-dispenser-area');
                if (cashDispenserArea) {
                    console.log('🏧 [A2-ATM] 添加現金出口閃爍提示');
                    cashDispenserArea.classList.add('blinking');
                }

                // 在現金出口添加點擊事件
                const cashSlotArea = document.querySelector('.cash-display-area-container');
                if (cashSlotArea) {
                    console.log('🏧 [A2-ATM] 現金出口點擊事件已綁定');
                    cashSlotArea.style.cursor = 'pointer';
                    cashSlotArea.onclick = () => {
                        console.log('🏧 [A2-ATM] 現金出口被點擊，打開鈔票選擇窗');

                        // 移除閃爍效果
                        if (cashDispenserArea) {
                            cashDispenserArea.classList.remove('blinking');
                        }

                        this.showBillSelectionModal();
                    };
                } else {
                    console.error('🏧 [A2-ATM] 找不到現金出口區域');
                }
            } else {
                console.error('🏧 [A2-ATM] 找不到現金出口蓋板');
            }
        },

        // 步驟 5：顯示鈔票選擇彈跳窗
        showBillSelectionModal() {
            const modal = document.createElement('div');
            modal.id = 'bill-selection-modal';
            modal.className = 'bill-selection-modal';
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>💰 選擇存入鈔票</h3>
                        <button class="close-btn" onclick="ATM.closeBillSelectionModal()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="bill-options">
                            <div class="bill-option" data-value="2000">
                                <img src="../images/2000_yuan_front.png" alt="2000元鈔票">
                                <span>2000元</span>
                                <div class="count">0 張</div>
                            </div>
                            <div class="bill-option" data-value="1000">
                                <img src="../images/1000_yuan_front.png" alt="1000元鈔票">
                                <span>1000元</span>
                                <div class="count">0 張</div>
                            </div>
                            <div class="bill-option" data-value="500">
                                <img src="../images/500_yuan_front.png" alt="500元鈔票">
                                <span>500元</span>
                                <div class="count">0 張</div>
                            </div>
                            <div class="bill-option" data-value="100">
                                <img src="../images/100_yuan_front.png" alt="100元鈔票">
                                <span>100元</span>
                                <div class="count">0 張</div>
                            </div>
                        </div>
                        <div class="deposit-summary">
                            <p>總金額：<span id="total-amount">0</span> 元</p>
                            <p>總張數：<span id="total-count">0</span> 張</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-btn" onclick="ATM.closeBillSelectionModal()">取消</button>
                        <button class="confirm-btn" onclick="ATM.confirmBillSelection()">確認放入</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            this.bindBillSelectionEvents();
            this.initializeDepositState();
        },

        // 初始化存款狀態
        initializeDepositState() {
            if (!this.state.gameState.depositBills) {
                this.state.gameState.depositBills = {
                    2000: 0,
                    1000: 0,
                    500: 0,
                    100: 0
                };
            }
        },

        // 綁定鈔票選擇事件
        bindBillSelectionEvents() {
            const billOptions = document.querySelectorAll('.bill-option');
            billOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const value = parseInt(option.dataset.value);
                    this.addBill(value);
                });
            });
        },

        // 增加鈔票
        addBill(value) {
            const maxCount = 100;
            const maxAmount = 60000;

            const currentCount = this.state.gameState.depositBills[value];
            const totalCount = this.getTotalBillCount();
            const totalAmount = this.getTotalDepositAmount();

            // 檢查限制
            if (totalCount >= maxCount) {
                this.speech.speak('超過最大張數限制100張');
                return;
            }

            if (totalAmount + value > maxAmount) {
                this.speech.speak('超過最大金額限制6萬元');
                return;
            }

            // 增加鈔票
            this.state.gameState.depositBills[value]++;
            this.updateBillDisplay();
            this.audio.playBeep();

            // 播放語音：鈔票面額和張數（使用防抖動）
            this.speakBillCount(value);
        },

        // 防抖動語音播放
        speakBillCount(value) {
            // 清除之前的計時器
            if (this.billSpeechTimeout) {
                clearTimeout(this.billSpeechTimeout);
            }

            // 設置新的計時器，300ms後播放語音
            this.billSpeechTimeout = setTimeout(() => {
                const count = this.state.gameState.depositBills[value];
                const billName = this.getBillName(value);
                this.speech.speak(`${billName}，${count}張`);
            }, 300);
        },

        // 獲取鈔票中文名稱
        getBillName(value) {
            const billNames = {
                2000: '兩千元',
                1000: '一千元',
                500: '五百元',
                100: '一百元'
            };
            return billNames[value] || `${value}元`;
        },

        // 更新鈔票顯示
        updateBillDisplay() {
            const billOptions = document.querySelectorAll('.bill-option');
            billOptions.forEach(option => {
                const value = parseInt(option.dataset.value);
                const count = this.state.gameState.depositBills[value];
                option.querySelector('.count').textContent = `${count} 張`;
            });

            // 更新總計
            document.getElementById('total-amount').textContent = this.getTotalDepositAmount().toLocaleString();
            document.getElementById('total-count').textContent = this.getTotalBillCount();
        },

        // 計算總金額
        getTotalDepositAmount() {
            let total = 0;
            for (const [value, count] of Object.entries(this.state.gameState.depositBills)) {
                total += parseInt(value) * count;
            }
            return total;
        },

        // 計算總張數
        getTotalBillCount() {
            let total = 0;
            for (const count of Object.values(this.state.gameState.depositBills)) {
                total += count;
            }
            return total;
        },

        // 關閉鈔票選擇彈跳窗
        closeBillSelectionModal() {
            const modal = document.getElementById('bill-selection-modal');
            if (modal) {
                modal.remove();
            }
        },

        // 確認鈔票選擇
        confirmBillSelection() {
            const totalCount = this.getTotalBillCount();
            if (totalCount === 0) {
                this.speech.speak('請先選擇要存入的鈔票');
                return;
            }

            // 關閉彈跳窗
            this.closeBillSelectionModal();

            // 在現金出口顯示存入的金錢圖示
            this.displayDepositedMoney();

            // 播放語音並等待用戶按確認
            this.speech.speak('鈔票放妥後，請按確認鍵', {
                callback: () => {
                    // 語音播放完畢後不做任何動作，等待用戶按確認鍵
                }
            });
        },

        // 在現金出口顯示存入的金錢圖示
        displayDepositedMoney() {
            console.log('🏧 [A2-ATM] 嘗試在現金出口顯示金錢...');
            console.log('🏧 [A2-ATM] 目前鈔票狀態:', this.state.gameState.depositBills);

            const cashDisplay = document.querySelector('.cash-display-background');
            if (!cashDisplay) {
                console.error('🏧 [A2-ATM] 找不到現金顯示區域 .cash-display-background');
                return;
            }

            console.log('🏧 [A2-ATM] 找到現金顯示區域，開始顯示金錢');

            // 顯示現金背景區域
            cashDisplay.style.display = 'flex';

            // 清空現有內容
            cashDisplay.innerHTML = '';

            // 創建金錢顯示容器
            const moneyContainer = document.createElement('div');
            moneyContainer.className = 'deposited-money-container';

            let hasAnyBills = false;
            let totalBillsToShow = 0;

            // 顯示各種鈔票
            Object.entries(this.state.gameState.depositBills).forEach(([value, count]) => {
                if (count > 0) {
                    hasAnyBills = true;
                    totalBillsToShow += count;
                    console.log(`🏧 [A2-ATM] 顯示 ${value}元鈔票 ${count}張`);

                    for (let i = 0; i < Math.min(count, 5); i++) { // 最多顯示5張
                        const billElement = document.createElement('div');
                        billElement.className = 'deposited-bill';
                        billElement.innerHTML = `
                            <img src="../images/${value}_yuan_front.png" alt="${value}元鈔票">
                        `;
                        moneyContainer.appendChild(billElement);
                    }

                    // 如果超過5張，顯示數量提示
                    if (count > 5) {
                        const countIndicator = document.createElement('div');
                        countIndicator.className = 'bill-count-indicator';
                        countIndicator.textContent = `+${count - 5}張`;
                        moneyContainer.appendChild(countIndicator);
                    }
                }
            });

            if (hasAnyBills) {
                cashDisplay.appendChild(moneyContainer);
                console.log(`🏧 [A2-ATM] 成功顯示 ${totalBillsToShow}張鈔票在現金出口`);

                // 延遲檢查滾動拉桿需求（等待渲染完成）
                setTimeout(() => {
                    this.showAmountSlider();
                }, 300);
            } else {
                console.warn('🏧 [A2-ATM] 沒有鈔票需要顯示');
            }
        },

        // 檢查並顯示滾動拉桿
        showAmountSlider() {
            const cashBackground = document.getElementById('cash-display-background');
            const cashContainer = cashBackground?.querySelector('.cash-bills-container');
            const sliderContainer = document.getElementById('amount-slider-container');

            if (!cashBackground || !cashContainer || !sliderContainer) {
                console.error('🏧 [A2-ATM] 找不到現金容器或拉桿元素');
                return;
            }

            // 檢查內容是否超出容器高度
            const containerHeight = cashBackground.clientHeight;
            const contentHeight = cashContainer.scrollHeight;

            console.log('🏧 [A2-ATM] 容器高度:', containerHeight, '內容高度:', contentHeight);

            if (contentHeight > containerHeight) {
                // 內容超出，顯示滾動拉桿
                sliderContainer.classList.add('visible');

                // 等待拉桿容器完全顯示後再初始化
                setTimeout(() => {
                    this.initScrollSlider(containerHeight, contentHeight);
                    console.log('🏧 [A2-ATM] 內容超出範圍，顯示滾動拉桿');
                }, 50);
            } else {
                // 內容未超出，隱藏拉桿
                sliderContainer.classList.remove('visible');
                console.log('🏧 [A2-ATM] 內容未超出，隱藏拉桿');
            }
        },

        // 隱藏滾動拉桿
        hideAmountSlider() {
            const sliderContainer = document.getElementById('amount-slider-container');
            if (sliderContainer) {
                sliderContainer.classList.remove('visible');
                console.log('🏧 [A2-ATM] 隱藏滾動拉桿');
            }
        },

        // 初始化滾動拉桿
        initScrollSlider(containerHeight, contentHeight) {
            const sliderHandle = document.getElementById('slider-handle');
            const sliderContainer = document.getElementById('amount-slider-container');
            const cashContainer = document.querySelector('.cash-bills-container');

            if (!sliderHandle || !sliderContainer || !cashContainer) return;

            // 計算滾動參數
            const sliderTrackHeight = sliderContainer.clientHeight;
            const handleHeight = 40; // 拉桿把手高度
            const padding = 10; // 上下各5px的邊距
            const extraBuffer = 30; // 額外緩衝空間，確保底部完全可見
            const maxScroll = contentHeight - containerHeight + extraBuffer;
            const maxHandleTop = sliderTrackHeight - handleHeight - 5;

            this.scrollData = {
                containerHeight: containerHeight,
                contentHeight: contentHeight,
                maxScroll: maxScroll,
                trackHeight: sliderTrackHeight,
                handleHeight: handleHeight,
                maxHandleTop: maxHandleTop,
                currentScroll: 0
            };

            console.log('🏧 [A2-ATM] 滾動參數:', {
                containerHeight: containerHeight,
                contentHeight: contentHeight,
                trackHeight: sliderTrackHeight,
                handleHeight: handleHeight,
                maxHandleTop: maxHandleTop,
                maxScroll: maxScroll,
                extraBuffer: extraBuffer
            });

            // 設置拉桿初始位置
            sliderHandle.style.top = '5px';

            // 綁定滾動事件
            this.bindScrollSliderEvents(sliderHandle, cashContainer);
        },

        // 綁定滾動拉桿事件
        bindScrollSliderEvents(sliderHandle, cashContainer) {
            let isDragging = false;
            let startY = 0;
            let startTop = 0;

            const handleMouseDown = (e) => {
                e.preventDefault();
                isDragging = true;
                startY = e.clientY;
                startTop = parseInt(sliderHandle.style.top || '5px');
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            };

            const handleTouchStart = (e) => {
                e.preventDefault();
                isDragging = true;
                startY = e.touches[0].clientY;
                startTop = parseInt(sliderHandle.style.top || '5px');
                document.addEventListener('touchmove', handleTouchMove);
                document.addEventListener('touchend', handleTouchEnd);
            };

            const handleMouseMove = (e) => {
                if (!isDragging) return;
                this.updateScrollPosition(e.clientY - startY, startTop, sliderHandle, cashContainer);
            };

            const handleTouchMove = (e) => {
                if (!isDragging) return;
                this.updateScrollPosition(e.touches[0].clientY - startY, startTop, sliderHandle, cashContainer);
            };

            const handleMouseUp = () => {
                isDragging = false;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            const handleTouchEnd = () => {
                isDragging = false;
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            };

            // 清除舊的事件監聽器
            sliderHandle.removeEventListener('mousedown', handleMouseDown);
            sliderHandle.removeEventListener('touchstart', handleTouchStart);

            // 添加新的事件監聽器
            sliderHandle.addEventListener('mousedown', handleMouseDown);
            sliderHandle.addEventListener('touchstart', handleTouchStart);
        },

        // 更新滾動位置
        updateScrollPosition(deltaY, startTop, sliderHandle, cashContainer) {
            if (!this.scrollData) return;

            // 計算新的拉桿位置，限制在有效範圍內
            const minTop = 5; // 最小位置（頂部邊距）
            const maxTop = this.scrollData.maxHandleTop; // 最大位置
            const newTop = Math.max(minTop, Math.min(maxTop, startTop + deltaY));

            sliderHandle.style.top = newTop + 'px';

            // 計算滾動比例 (0到1)
            const scrollRatio = (newTop - minTop) / (maxTop - minTop);
            const scrollOffset = scrollRatio * this.scrollData.maxScroll;

            // 應用滾動
            cashContainer.style.transform = `translateY(-${scrollOffset}px)`;
            this.scrollData.currentScroll = scrollOffset;

            console.log('🏧 [A2-ATM] 拉桿位置:', newTop + 'px, 滾動位置:', scrollOffset.toFixed(1) + 'px, 比例:', scrollRatio.toFixed(2));
        },

        // 關閉現金出口（存款完成後）
        closeCashSlotAfterDeposit() {
            console.log('🏧 [A2-ATM] 嘗試關閉現金出口...');
            const cashCover = document.getElementById('cash-display-cover');
            if (cashCover) {
                console.log('🏧 [A2-ATM] 找到現金出口蓋板，執行關閉動畫');
                // 移除開啟狀態，添加關閉狀態
                cashCover.classList.remove('opening');
                cashCover.classList.add('closing');

                // 隱藏金額拉桿
                this.hideAmountSlider();

                // 清空現金顯示內容
                setTimeout(() => {
                    const cashDisplay = document.querySelector('.cash-display-background');
                    if (cashDisplay) {
                        cashDisplay.innerHTML = '';
                        cashDisplay.style.display = 'none'; // 隱藏現金背景區域
                    }
                    // 移除關閉狀態類，回到初始狀態
                    cashCover.classList.remove('closing');
                    console.log('🏧 [A2-ATM] 現金出口關閉動畫完成');
                }, 800); // 等待關閉動畫完成

                // 移除點擊事件和游標樣式
                const cashSlotArea = document.querySelector('.cash-display-area-container');
                if (cashSlotArea) {
                    cashSlotArea.style.cursor = 'default';
                    cashSlotArea.onclick = null;
                    console.log('🏧 [A2-ATM] 現金出口點擊事件已移除');
                }

                // 移除閃爍效果
                const cashDispenserArea = document.querySelector('.cash-dispenser-area');
                if (cashDispenserArea) {
                    cashDispenserArea.classList.remove('blinking');
                    console.log('🏧 [A2-ATM] 移除現金出口閃爍效果');
                }
            } else {
                console.error('🏧 [A2-ATM] 找不到現金出口蓋板');
            }
        },

        // 綁定存入現鈔畫面事件
        bindDepositCashEvents() {
            // 綁定取消和確認按鈕
            document.querySelectorAll('.cancel-action, .confirm-action').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    const action = event.target.dataset.action;
                    this.audio.playBeep();

                    if (action === 'cancel') {
                        this.speech.speak('交易已取消', {
                            callback: () => {
                                this.cancelDeposit();
                            }
                        });
                    } else if (action === 'confirm') {
                        // 檢查是否已選擇鈔票
                        if (!this.state.gameState.depositBills || this.getTotalBillCount() === 0) {
                            this.speech.speak('請先點擊現金出口放入鈔票');
                            return;
                        }

                        // 關閉現金出口
                        this.closeCashSlotAfterDeposit();

                        // 等待關閉動畫完成後進入下一步驟
                        setTimeout(() => {
                            this.startDepositCounting();
                        }, 900); // 稍微多等一點確保動畫完成
                    }
                });
            });
        },

        // 綁定確認存入現鈔畫面事件
        bindDepositConfirmEvents() {
            document.querySelectorAll('.cancel-action, .confirm-action').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    const action = event.target.dataset.action;
                    this.audio.playBeep();

                    if (action === 'cancel') {
                        this.speech.speak('交易已取消', {
                            callback: () => {
                                this.cancelDeposit();
                            }
                        });
                    } else if (action === 'confirm') {
                        // 步驟 9：確認存款，進入交易處理
                        this.confirmDeposit();
                    }
                });
            });
        },

        // 步驟 6：開始數鈔辨識
        startDepositCounting() {
            this.updateScreen('deposit-counting');
            this.state.gameState.currentScene = 'deposit-counting';

            // 關閉現金出口
            this.closeCashSlotAfterDeposit();

            // 播放數鈔音效
            console.log('🏧 [A2-ATM] 機器數鈔辨識中，播放數錢音效...');
            this.audio.playCountMoney().then(() => {
                console.log('🏧 [A2-ATM] 數錢音效播放完成');
            }).catch(error => {
                console.error('🏧 [A2-ATM] 數錢音效播放失敗:', error);
            });

            // 模擬數鈔過程 3 秒後進入確認畫面
            setTimeout(() => {
                this.showDepositConfirmScreen();
            }, 3000);
        },

        // 關閉現金出口（存款後）
        closeCashSlotAfterDeposit() {
            const cashCover = document.getElementById('cash-display-cover');
            if (cashCover) {
                cashCover.classList.remove('opening');
            }

            // 移除點擊事件
            const cashSlotArea = document.querySelector('.cash-display-area-container');
            if (cashSlotArea) {
                cashSlotArea.style.cursor = 'default';
                cashSlotArea.onclick = null;
            }
        },

        // 步驟 8：顯示確認存入現鈔畫面
        showDepositConfirmScreen() {
            this.updateScreen('deposit-confirm');
            this.state.gameState.currentScene = 'deposit-confirm';

            // 計算總金額
            const totalAmount = this.getTotalDepositAmount();

            // 播放語音：請確認存入現鈔 + 實際存款金額
            this.speech.speak(`請確認存入現鈔，實際存款金額${totalAmount.toLocaleString()}元`);
        },

        // 步驟 9：確認存款
        confirmDeposit() {
            const amount = this.getTotalDepositAmount();
            this.state.gameState.transactionAmount = amount;

            // 步驟 9：顯示交易處理中
            this.updateScreen('processing', { message: '交易處理中，請稍候' });
            this.state.gameState.currentScene = 'deposit-processing-final';

            this.speech.speak('交易處理中，請稍候', {
                callback: () => {
                    // 播放數錢音效
                    console.log('🏧 [A2-ATM] 播放數錢音效...');
                    this.audio.playCountMoney().then(() => {
                        console.log('🏧 [A2-ATM] 數錢音效播放完成，進入交易完成');

                        // 更新帳戶餘額
                        this.state.gameState.accountBalance += amount;

                        // 步驟 10：顯示是否繼續交易
                        this.showContinueTransactionQuestion();
                    }).catch(error => {
                        console.error('🏧 [A2-ATM] 數錢音效播放失敗:', error);

                        // 即使音效播放失敗也要繼續流程
                        setTimeout(() => {
                            this.state.gameState.accountBalance += amount;
                            this.showContinueTransactionQuestion();
                        }, 1000);
                    });
                }
            });
        },

        // 取消存款
        cancelDeposit() {
            // 重置存款狀態
            this.state.gameState.depositBills = {
                2000: 0,
                1000: 0,
                500: 0,
                100: 0
            };

            // 關閉現金出口
            this.closeCashSlotAfterDeposit();

            // 返回主選單
            this.resetTransaction();
            this.updateScreen('menu');
            this.state.gameState.currentScene = 'menu';
        },

        startInquiryProcess() {
            const balance = this.state.gameState.accountBalance;
            this.speech.speak(`您的帳戶餘額為 ${balance.toLocaleString()} 元`, {
                callback: () => {
                    this.updateScreen('complete', { 
                        experience: 50 
                    });
                    this.completeTransaction(50);
                }
            });
        },

        processTransaction(amountAlreadySpoken = false) {
            const amount = this.state.gameState.transactionAmount;
            const transactionType = this.state.gameState.currentTransaction.type;

            if (amount <= 0) {
                this.updateScreen('amount-entry', {
                    currentAmount: amount,
                    error: '請輸入有效金額'
                });
                return;
            }

            if (transactionType === 'withdraw' && amount > this.state.gameState.accountBalance) {
                this.speech.speak('餘額不足，請重新輸入金額', {
                    callback: () => {
                        this.updateScreen('amount-entry', {
                            currentAmount: amount,
                            error: '餘額不足，請重新輸入金額'
                        });
                    }
                });
                return;
            }

            // 決定是否播放確認金額的語音
            const proceedToProcessing = () => {
                // 步驟1: 顯示「交易處理中，請稍候」並播放語音
                this.updateScreen('processing');
                this.state.gameState.currentScene = 'processing';

                this.speech.speak('交易處理中，請稍候', {
                    callback: () => {
                        // 等待語音播放完成後，等待2秒再進入下一步
                        setTimeout(() => {
                            this.showCashDispensingScreen(amount, transactionType);
                        }, 2000);
                    }
                });
            };

            if (amountAlreadySpoken) {
                // 如果金額語音已播放過，直接進入處理流程
                proceedToProcessing();
            } else {
                // 先播放確認金額的語音（僅適用於其他金額輸入）
                const amountText = this.convertAmountToSpeech(amount);
                this.speech.speak(amountText, {
                    callback: proceedToProcessing
                });
            }
        },

        // 步驟2: 顯示「發鈔中，請稍候」螢幕
        showCashDispensingScreen(amount, transactionType) {
            this.updateScreen('cash-dispensing');
            this.state.gameState.currentScene = 'cash-dispensing';
            
            this.speech.speak('發鈔中，請稍候', {
                callback: () => {
                    // 播放點鈔音效，等待播放完成後再進入下一步
                    this.audio.playCountMoney().then(() => {
                        this.completeTransactionProcess(amount, transactionType);
                    });
                }
            });
        },

        completeTransactionProcess(amount, transactionType) {
            // 更新帳戶餘額
            if (transactionType === 'withdraw') {
                this.state.gameState.accountBalance -= amount;
                this.audio.playCash(); // 播放出鈔音效

                // 步驟3: 先顯示「請收取現金」畫面，用戶取走現金後才詢問繼續交易
                this.showTakeCashScreen();
            } else if (transactionType === 'deposit') {
                this.state.gameState.accountBalance += amount;
                this.speech.speak(`存款 ${amount.toLocaleString()} 元完成`, {
                    callback: () => {
                        this.showContinueTransactionQuestion();
                    }
                });
            }
        },

        // 步驟3: 顯示「本交易完成後是否繼續其他交易」
        showContinueTransactionQuestion() {
            this.updateScreen('continue-transaction-question');
            this.state.gameState.currentScene = 'continue-transaction-question';
            
            this.speech.speak('本交易完成後是否繼續其他交易', {
                callback: () => {
                    // 語音播放完成，等待用戶選擇
                }
            });
        },

        // 綁定繼續交易問題選項事件
        bindContinueTransactionQuestionEvents() {
            document.querySelectorAll('.option-btn').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    this.audio.playBeep();
                    const action = event.currentTarget.getAttribute('data-action');
                    
                    if (action === 'continue') {
                        // 直接返回主選單繼續交易（現金已在之前取走）
                        this.speech.speak('繼續進行新的交易', {
                            callback: () => {
                                // 完全重置交易狀態
                                this.state.gameState.transactionAmount = 0;
                                this.state.gameState.currentTransaction = {
                                    type: 'withdraw',
                                    amount: 0,
                                    account: 'savings',
                                    completed: true
                                };
                                this.updateScreen('menu');
                                this.state.gameState.currentScene = 'menu';
                            }
                        });
                    } else if (action === 'end') {
                        // 步驟4: 顯示「晶片金融卡已退出」（結束交易流程）
                        this.speech.speak('結束交易，請取出您的金融卡', {
                            callback: () => {
                                // 完全重置交易狀態
                                this.state.gameState.transactionAmount = 0;
                                this.state.gameState.currentTransaction = {
                                    type: 'withdraw',
                                    amount: 0,
                                    account: 'savings',
                                    completed: true
                                };
                                this.showCardEjectScreenForEndTransaction();
                            }
                        });
                    }
                });
            });
        },

        // 步驟4: 顯示「晶片金融卡已退出」螢幕和卡片退出動畫
        showCardEjectScreen() {
            this.updateScreen('card-eject');
            this.state.gameState.currentScene = 'card-eject';
            
            // 顯示卡片退出動畫
            this.showCardEjectAnimation();
        },

        // 結束交易專用的卡片退出螢幕
        showCardEjectScreenForEndTransaction() {
            this.updateScreen('card-eject-end');
            this.state.gameState.currentScene = 'card-eject-end';
            
            // 顯示卡片退出動畫
            this.showCardEjectAnimation();
        },

        // 結束交易並顯示現金的流程
        startEndTransactionWithCash() {
            this.updateScreen('card-eject-end');
            this.state.gameState.currentScene = 'card-eject-end-with-cash';
            
            this.speech.speak('結束交易，請取出您的金融卡', {
                callback: () => {
                    // 顯示卡片退出動畫
                    this.showCardEjectAnimation();
                }
            });
        },

        showCardEjectAnimation() {
            // 使用原本的卡片元素播放倒轉動畫
            const originalCard = document.getElementById('atm-card');
            if (originalCard) {
                // 確保卡片可見並重置狀態
                originalCard.style.display = 'block';
                originalCard.classList.remove('card-inserted', 'card-inserting');

                // 播放退出動畫（插入動畫的倒轉版本）
                originalCard.classList.add('card-returning');

                // 動畫完成後添加點擊事件
                setTimeout(() => {
                    originalCard.addEventListener('click', () => {
                        this.handleCardTaken();
                    }, { once: true }); // 只監聽一次
                }, 1800); // 等動畫完成
            }
        },

        // 步驟5: 點擊金融卡後處理
        handleCardTaken() {
            // 播放「已取走金融卡」語音
            this.speech.speak('已取走金融卡', {
                callback: () => {
                    // 語音播放完成後再執行後續動作
                    this.processCardTakenActions();
                }
            });

            // 隱藏卡片（因為用戶已取走）
            const originalCard = document.getElementById('atm-card');
            if (originalCard) {
                originalCard.style.display = 'none';
            }
        },

        // 處理取走金融卡後的動作
        processCardTakenActions() {
            // 根據當前場景決定下一步動作
            if (this.state.gameState.currentScene === 'card-eject') {
                // 如果是正常提款流程，顯示「請收取現金」
                this.showTakeCashScreen();
            } else if (this.state.gameState.currentScene === 'card-eject-end') {
                // 檢查是否有提款金額且交易未完成，如果有則顯示現金
                if (this.state.gameState.transactionAmount > 0 &&
                    this.state.gameState.currentTransaction.type === 'withdraw' &&
                    !this.state.gameState.currentTransaction.completed) {
                    this.showTakeCashScreenWithMessage();
                } else {
                    // 如果沒有提款或交易已完成，直接完成交易
                    this.speech.speak('卡片已取回，感謝使用', {
                        callback: () => {
                            this.endTransaction('用戶已取回卡片');
                        }
                    });
                }
            } else if (this.state.gameState.currentScene === 'card-eject-end-with-cash') {
                // 如果是結束交易但要顯示現金的流程
                this.showEndTransactionCash();
            }
        },

        // 恢復金融卡到原本位置和大小
        restoreCardToOriginalPosition() {
            const cardElement = document.getElementById('atm-card');
            if (cardElement) {
                // 移除所有卡片狀態的 CSS 類
                cardElement.classList.remove('card-inserting', 'card-inserted', 'card-returning');
                
                // 重設卡片狀態
                this.state.gameState.cardInserted = false;
                
                // 確保卡片顯示（移除 display: none）
                cardElement.style.display = 'block';
            }
            
            // 關閉卡片插槽的燈光效果
            const cardLight = document.getElementById('card-light');
            const cardSlit = document.getElementById('card-slit');
            if (cardLight) cardLight.classList.remove('active');
            if (cardSlit) cardSlit.classList.remove('active');
        },

        showTakeCashScreen() {
            console.log('🏧 [A2-ATM] showTakeCashScreen 調用，當前交易金額:', this.state.gameState.transactionAmount);
            this.updateScreen('take-cash');
            this.state.gameState.currentScene = 'take-cash';

            // 在取卡時才顯示現金
            this.showCashDispense();

            this.speech.speak('請收取現金', {
                callback: () => {
                    // 語音播放完成，等待用戶點擊「取走現金」按鈕
                }
            });
        },
        
        showTakeCashScreenWithMessage() {
            this.updateScreen('take-cash-with-message');
            this.state.gameState.currentScene = 'take-cash-with-message';
            
            // 在取卡時才顯示現金
            this.showCashDispense();
            
            this.speech.speak('請收取現金，並妥善保存', {
                callback: () => {
                    // 語音播放完成，等待用戶點擊「取走現金」按鈕
                }
            });
        },

        // 結束交易時顯示現金
        showEndTransactionCash() {
            // 設置一個模擬的交易金額（用於顯示現金）
            this.state.gameState.transactionAmount = 1000; // 模擬金額
            
            this.updateScreen('take-cash');
            this.state.gameState.currentScene = 'take-cash-end';
            
            // 顯示現金
            this.showCashDispense();
            
            this.speech.speak('請收取現金', {
                callback: () => {
                    // 語音播放完成，等待用戶點擊「取走現金」按鈕
                }
            });
        },

        showCashDispense() {
            // 1. 獲取封面和背景的元素
            const cashCover = document.getElementById('cash-display-cover');
            const cashBackground = document.getElementById('cash-display-background');
            const amount = this.state.gameState.transactionAmount;

            console.log('🏧 [A2-ATM] showCashDispense 檢查:', { amount, currentScene: this.state.gameState.currentScene });

            if (amount > 0 && cashCover && cashBackground) {
                // 2. 先播放封面 "沉沒" 動畫來打開出口
                cashCover.classList.add('opening');

                // 3. 準備現金內容並放入固定的背景中
                cashBackground.innerHTML = ''; // 清空舊內容
                cashBackground.style.display = 'flex'; // 確保背景可見

                const cashContainer = document.createElement('div');
                cashContainer.className = 'cash-bills-container';

                const bills = this.calculateBillCombination(amount);
                bills.forEach((bill, index) => {
                    const billImg = document.createElement('img');
                    billImg.className = 'cash-bill-img';
                    billImg.src = `../images/${bill.value}_yuan_front.png`;
                    billImg.alt = `${bill.value}元鈔票`;
                    billImg.style.animationDelay = `${index * 0.2}s`;
                    cashContainer.appendChild(billImg);
                });

                const takeCashBtn = document.createElement('button');
                takeCashBtn.className = 'take-cash-btn';
                takeCashBtn.innerHTML = '💰 取走現金';
                takeCashBtn.onclick = () => {
                    const amount = this.state.gameState.transactionAmount;
                    this.speech.speak(`取走現金${amount}元`, {
                        callback: () => {
                            this.takeCash();
                        }
                    });
                };
                takeCashBtn.style.position = 'absolute';
                takeCashBtn.style.top = '50%';
                takeCashBtn.style.left = '50%';
                takeCashBtn.style.transform = 'translate(-50%, -50%)';
                takeCashBtn.style.zIndex = '1000';

                cashBackground.appendChild(cashContainer);
                cashBackground.appendChild(takeCashBtn);

                const cashDispenser = document.getElementById('cash-dispenser');
                if (cashDispenser) {
                    cashDispenser.classList.add('dispensing');
                    setTimeout(() => {
                        cashDispenser.classList.remove('dispensing');
                    }, 2000);
                }

                // 延遲檢查滾動拉桿需求（提款）
                setTimeout(() => {
                    this.showAmountSlider();
                    console.log('🏧 [A2-ATM] 提款現金顯示完成，檢查拉桿需求');
                }, 300);
            }
        },

        // 🔧 [步驟6] 取走現金方法 - 顯示「是否列印明細表」
        takeCash() {
            // 播放音效
            this.audio.playSuccess();

            // 保存當前交易金額，避免在繼續交易時丟失
            const currentAmount = this.state.gameState.transactionAmount;

            // 隱藏金額拉桿
            this.hideAmountSlider();

            // 先讓現金消失
            const cashBackground = document.getElementById('cash-display-background');
            if (cashBackground) {
                // 隱藏現金內容但保持框體顯示
                const cashContainer = cashBackground.querySelector('.cash-bills-container');
                const takeCashBtn = cashBackground.querySelector('.take-cash-btn');

                if (cashContainer) cashContainer.style.opacity = '0';
                if (takeCashBtn) takeCashBtn.style.opacity = '0';

                // 延遲一點後播放關閉動畫
                setTimeout(() => {
                    this.clearCashDisplay();
                }, 300);
            }

            // 延遲後繼續下一步動作
            setTimeout(() => {
                // 根據場景決定下一步動作
                if (this.state.gameState.currentScene === 'take-cash-end') {
                    // 如果是結束交易的現金，直接完成交易
                    this.speech.speak('現金已取出，感謝使用', {
                        callback: () => {
                            this.endTransaction('結束交易完成');
                        }
                    });
                } else if (this.state.gameState.currentScene === 'take-cash-with-message') {
                    // 如果是帶有特殊訊息的取現金場景，也先顯示處理中再到明細表
                    this.showProcessingBeforeReceipt();
                } else {
                    // 如果是正常提款流程，現金取走後顯示繼續交易選項
                    console.log('🏧 [A2-ATM] 現金已取走，準備顯示繼續交易選項，當前金額:', currentAmount);
                    this.showContinueTransactionQuestion();
                }
            }, 1100); // 等現金消失和關閉動畫完成
        },
        
        // 取現金後的處理中畫面
        showProcessingBeforeReceipt() {
            this.updateScreen('processing');
            this.speech.speak('處理中，請稍候', {
                callback: () => {
                    // 處理完畢後，顯示明細表選項
                    setTimeout(() => {
                        this.showReceiptOptionsScreen();
                    }, 1000); // 短暫延遲後進入明細表選項
                }
            });
        },

        // 步驟6: 顯示「是否列印明細表」螢幕
        showReceiptOptionsScreen() {
            this.updateScreen('receipt-options');
            this.state.gameState.currentScene = 'receipt-options';
            
            this.speech.speak('是否列印明細表', {
                callback: () => {
                    // 語音播放完成，等待用戶選擇
                }
            });
        },
        
        // 清除現金顯示（供下一題使用）
        clearCashDisplay() {
            const cashCover = document.getElementById('cash-display-cover');
            const cashBackground = document.getElementById('cash-display-background');

            // 隱藏金額拉桿
            this.hideAmountSlider();

            if (cashCover && cashBackground) {
                // 播放封面 "升起" 動畫來關閉出口
                cashCover.classList.remove('opening');

                // 在動畫播放的同時，就可以準備清空背景內容
                setTimeout(() => {
                    cashBackground.innerHTML = '';
                    cashBackground.style.display = 'none';
                }, 800); // 等待動畫時間 (0.8s)
            }
        },
        
        // 計算鈔票組合（只使用1000元和100元）
        calculateBillCombination(amount) {
            const bills = [];
            let remaining = amount;
            
            // 先用1000元鈔票
            const thousandCount = Math.floor(remaining / 1000);
            for (let i = 0; i < thousandCount; i++) {
                bills.push({ value: 1000 });
                remaining -= 1000;
            }
            
            // 再用100元鈔票補足
            const hundredCount = Math.floor(remaining / 100);
            for (let i = 0; i < hundredCount; i++) {
                bills.push({ value: 100 });
                remaining -= 100;
            }
            
            // 如果有無法整除的餘額，用100元補足（模擬ATM只能出整百金額）
            if (remaining > 0) {
                bills.push({ value: 100 });
            }
            
            return bills;
        },

        // 按照正確ATM流程：現金取走後詢問是否繼續交易
        showCashTakenAndCardReturn() {
            // 延遲一下模擬用戶取走現金的時間
            setTimeout(() => {
                this.speech.speak('現金已取出', {
                    callback: () => {
                        // 先顯示是否繼續交易畫面
                        this.showContinueTransactionScreen();
                    }
                });
            }, 2000);
        },

        // 金融卡歸還動畫
        performCardReturnAnimation() {
            const cardElement = document.getElementById('atm-card');
            const cardLight = document.getElementById('card-light');
            const cardSlit = document.getElementById('card-slit');
            
            if (cardElement) {
                cardElement.classList.remove('card-inserted');
                cardElement.classList.add('card-returning');
                
                // 關閉燈光和細縫
                if (cardLight) cardLight.classList.remove('active');
                if (cardSlit) cardSlit.classList.remove('active');
                
                // 動畫完成後重置
                setTimeout(() => {
                    cardElement.classList.remove('card-returning');
                    this.state.gameState.cardInserted = false;
                }, 1500);
            }
        },

        // 顯示繼續交易選項畫面
        showContinueTransactionScreen() {
            this.updateScreen('continue-transaction');
            this.state.gameState.currentScene = 'continue-transaction';
        },

        // 顯示列印明細表選項畫面
        showReceiptOptionsScreen() {
            this.updateScreen('receipt-options');
            this.state.gameState.currentScene = 'receipt-options';
        },

        // 處理繼續交易選擇 - 直接跳回到金額選擇
        handleContinueTransaction() {
            this.speech.speak('繼續進行新的交易', {
                callback: () => {
                    // 清除現金顯示但保持交易金額記錄用於後續操作
                    this.clearCashDisplay();

                    // 重置交易金額，但保持已插卡和已驗證PIN的狀態
                    this.state.gameState.transactionAmount = 0;

                    // 直接跳回到金額選擇畫面（步驟3）
                    this.updateScreen('amount-entry', { currentAmount: 0 });
                    this.state.gameState.currentScene = 'amount-entry';
                    this.speech.speak('請選擇提款金額');
                }
            });
        },

        // 處理結束交易選擇 - 先歸還金融卡，再詢問列印明細表
        handleFinishTransaction() {
            this.speech.speak('結束交易，請取出您的金融卡', {
                callback: () => {
                    // 執行金融卡歸還動畫
                    this.performCardReturnAnimation();
                    
                    // 延遲一點時間讓用戶"取出"金融卡，然後顯示列印明細表選項
                    setTimeout(() => {
                        this.showReceiptOptionsScreen();
                    }, 2000);
                }
            });
        },

        // 處理列印明細表選擇
        // 步驟7: 處理列印明細表流程
        handlePrintReceipt() {
            // 7a. 顯示「交易明細表列印中，請稍候」
            this.showPrintingScreen();
        },

        showPrintingScreen() {
            this.updateScreen('printing');
            this.state.gameState.currentScene = 'printing';
            
            this.speech.speak('交易明細表列印中，請稍候', {
                callback: () => {
                    // 7b. 語音播放完成後，開始收據動畫
                    setTimeout(() => {
                        this.showReceiptAnimation();
                    }, 2000);
                }
            });
        },

        showReceiptAnimation() {
            // 7c. 收據從出口出現動畫
            this.printReceipt();
            
            // 7d. 顯示最終完成螢幕
            setTimeout(() => {
                this.showFinalCompleteScreen();
            }, 3000);
        },

        showFinalCompleteScreen() {
            this.updateScreen('final-complete');
            this.state.gameState.currentScene = 'final-complete';
            
            this.speech.speak('請取回交易明細表，謝謝您的惠顧', {
                callback: () => {
                    // 完成整個交易流程，可進入下一題
                    setTimeout(() => {
                        this.completeTransaction(150);
                    }, 2000);
                }
            });
        },

        // 處理不列印明細表選擇
        handleNoPrintReceipt() {
            // 顯示螢幕上的明細表
            this.showReceiptOnScreen();
        },

        // 在螢幕上顯示明細表
        showReceiptOnScreen() {
            console.log('🏧 [A2-ATM] 在螢幕上顯示明細表');

            // 直接顯示螢幕明細表
            this.updateScreen('screen-receipt-display');
            this.state.gameState.currentScene = 'screen-receipt-display';

            // 播放語音並設置自動返回
            this.speech.speak('明細表顯示完成，將於5秒後自動返回', {
                callback: () => {
                    // 5秒後自動完成交易
                    setTimeout(() => {
                        this.completeTransaction();
                    }, 5000);
                }
            });
        },

        // 三階段交易明細表流程
        startReceiptStageFlow() {
            // 階段1：交易明細表為重要入帳憑證，請務必妥善收存
            this.showReceiptImportantNotice();
        },

        // 階段1：顯示重要憑證提醒
        showReceiptImportantNotice() {
            console.log('🏧 [A2-ATM] 階段1：顯示重要憑證提醒');

            // 更新螢幕顯示
            this.updateScreen('receipt-important-notice');
            this.state.gameState.currentScene = 'receipt-important-notice';

            // 播放語音
            this.speech.speak('交易明細表列印中，請稍候，交易明細表為重要入帳憑證，請務必妥善收存', {
                callback: () => {
                    // 3秒後進入階段2
                    setTimeout(() => {
                        this.showTakeReceiptScreen();
                    }, 3000);
                }
            });
        },

        // 階段2：請取回交易明細表
        showTakeReceiptScreen() {
            console.log('🏧 [A2-ATM] 階段2：請取回交易明細表');

            // 更新螢幕顯示明細表
            this.updateScreen('screen-receipt-display');
            this.state.gameState.currentScene = 'take-receipt';

            // 播放語音
            this.speech.speak('請取回交易明細表', {
                callback: () => {
                    // 3秒後進入階段3
                    setTimeout(() => {
                        this.showThankYouScreen();
                    }, 3000);
                }
            });
        },

        // 階段3：謝謝惠顧
        showThankYouScreen() {
            console.log('🏧 [A2-ATM] 階段3：謝謝惠顧');

            // 更新螢幕顯示
            this.updateScreen('thank-you');
            this.state.gameState.currentScene = 'thank-you';

            // 播放語音
            this.speech.speak('謝謝您的惠顧，歡迎再次光臨，請稍候插卡', {
                callback: () => {
                    // 5秒後回到初始畫面
                    setTimeout(() => {
                        console.log('🏧 [A2-ATM] 5秒後回到初始畫面');
                        this.resetToWelcome();
                    }, 5000);
                }
            });
        },

        // 回到初始歡迎畫面
        resetToWelcome() {
            // 重置ATM狀態
            this.resetATMState();
            
            // 顯示插入金融卡畫面（這是金融卡可以點擊的畫面）
            this.updateScreen('insert-card');
            
            console.log('🏧 [A2-ATM] 已回到插入金融卡畫面，金融卡可以點擊');
        },

        // =====================================================
        // 交易完成和重置
        // =====================================================
        completeTransaction(experienceGained = 100) {
            // 更新遊戲狀態
            this.state.gameState.experience += experienceGained;
            
            // 播放成功音效
            this.audio.playSuccess();
            
            
            // 檢查升級
            this.checkLevelUp();
            
            // 記錄完成的交易
            this.state.quiz.completedTransactions.push({
                type: this.state.gameState.currentTransaction.type,
                amount: this.state.gameState.transactionAmount,
                timestamp: Date.now()
            });
            
            // 延遲後進行下一題或結束
            setTimeout(() => {
                this.proceedToNext();
            }, 3000);
        },

        proceedToNext() {
            this.state.quiz.currentQuestion++;
            
            if (this.state.quiz.currentQuestion < this.state.settings.questionCount) {
                // 繼續下一題
                this.resetTransaction();
                this.startNextScenario();
            } else {
                // 完成所有題目
                this.showFinalResults();
            }
        },

        startNextScenario() {
            this.speech.speak('準備進行下一個練習', {
                callback: () => {
                    this.updateScreen('welcome');
                    this.state.gameState.currentScene = 'welcome';
                    this.resetTransactionState();
                }
            });
        },

        startFirstScenario() {
            // 第一個場景：插入卡片
            this.updateScreen('insert-card');
            this.state.gameState.currentScene = 'insert-card';
            
            this.speech.speak('請點擊卡片插入您的金融卡');
        },

        resetTransaction() {
            this.resetTransactionState();
        },

        // 將金額數字轉換為語音文字 (採用c4的傳統中文貨幣轉換)
        convertAmountToSpeech(amount) {
            // 數字轉換對照表
            const numberMap = {
                '0': '零', '1': '壹', '2': '貳', '3': '參', '4': '肆',
                '5': '伍', '6': '六', '7': '七', '8': '八', '9': '九'
            };
            
            // 🔧 [修正] 「兩」的特殊使用規則：僅用於千位以上
            const getTwoCharacter = (position) => {
                return position >= 3 ? '兩' : '貳'; // position 3是千位
            };
            
            // 單位轉換對照表
            const unitMap = {
                '10': '拾', '100': '佰', '1000': '仟', '10000': '萬'
            };
            
            // 特殊情況處理 - 包含常見金額組合
            const specialCases = {
                1: '壹元',
                2: '兩元',             // 🔧 [修正] 確保2元讀作兩元
                5: '伍元', 
                10: '拾元',
                20: '貳拾元',          // 🔧 [新增] 確保20元讀作貳拾元
                21: '貳拾壹元',        // 🔧 [新增] 確保21元讀作貳拾壹元
                50: '伍拾元',
                100: '壹佰元',
                101: '壹佰零壹元',      // 🔧 [新增] 101元讀法
                102: '壹佰零貳元',      // 🔧 [新增] 102元讀法
                103: '壹佰零參元',      // 🔧 [新增] 103元讀法
                104: '壹佰零肆元',      // 🔧 [新增] 104元讀法
                105: '壹佰零伍元',      // 🔧 [新增] 105元讀法：壹佰零伍元
                106: '壹佰零六元',      // 🔧 [新增] 106元讀法
                107: '壹佰零七元',      // 🔧 [新增] 107元讀法
                108: '壹佰零八元',      // 🔧 [新增] 108元讀法
                109: '壹佰零九元',      // 🔧 [新增] 109元讀法
                110: '壹佰壹拾元',      // 🔧 [新增] 110元讀法
                115: '壹佰壹拾伍元',    // 🔧 [新增] 115元讀法
                120: '壹佰貳拾元',      // 🔧 [新增] 120元讀法
                125: '壹佰貳拾伍元',    // 🔧 [新增] 125元讀法
                150: '壹佰伍拾元',      // 🔧 [新增] 150元讀法
                200: '兩佰元',          // 🔧 [新增] 200元讀法
                201: '兩佰零壹元',      // 🔧 [新增] 201元讀法
                205: '兩佰零伍元',      // 🔧 [新增] 205元讀法
                210: '兩佰壹拾元',      // 🔧 [新增] 210元讀法
                250: '兩佰伍拾元',      // 🔧 [新增] 250元讀法
                300: '參佰元',          // 🔧 [新增] 300元讀法
                305: '參佰零伍元',      // 🔧 [新增] 305元讀法
                500: '伍佰元',
                505: '伍佰零伍元',      // 🔧 [新增] 505元讀法
                510: '伍佰壹拾元',      // 🔧 [新增] 510元讀法
                550: '伍佰伍拾元',      // 🔧 [新增] 550元讀法
                600: '六佰元',          // 🔧 [新增] 600元讀法
                650: '六佰伍拾元',      // 🔧 [新增] 650元讀法
                700: '七佰元',          // 🔧 [新增] 700元讀法
                750: '七佰伍拾元',      // 🔧 [新增] 750元讀法
                800: '八佰元',          // 🔧 [新增] 800元讀法
                850: '八佰伍拾元',      // 🔧 [新增] 850元讀法
                900: '九佰元',          // 🔧 [新增] 900元讀法
                950: '九佰伍拾元',      // 🔧 [新增] 950元讀法
                1000: '壹仟元',
                1001: '壹仟零壹元',     // 🔧 [新增] 1001元讀法
                1005: '壹仟零伍元',     // 🔧 [新增] 1005元讀法
                1010: '壹仟零壹拾元',   // 🔧 [新增] 1010元讀法
                1050: '壹仟零伍拾元',   // 🔧 [新增] 1050元讀法
                1100: '壹仟壹佰元',     // 🔧 [新增] 1100元讀法
                1105: '壹仟壹佰零伍元', // 🔧 [新增] 1105元讀法
                1500: '壹仟伍佰元',     // 1000 + 500
                2000: '兩仟元',         // 🔧 [修正] 修改為符合需求的讀音
                2005: '兩仟零伍元',     // 🔧 [新增] 2005元讀法
                2105: '兩仟壹佰零伍元', // 🔧 [新增] 2105元讀法  
                3005: '參仟零伍元',     // 🔧 [新增] 3005元讀法
                2050: '兩仟零伍拾元',   // 🔧 [新增] 2050元讀法
                2100: '兩仟壹佰元',     // 🔧 [新增] 2100元讀法
                2500: '兩仟伍佰元',     // 🔧 [修正] 修改為符合需求的讀音
                3000: '參仟元',         // 3 × 1000
                5000: '伍仟元',         // 5 × 1000
                10000: '壹萬元',        // 10000
                20000: '兩萬元',        // 20000
                40000: '肆萬元',        // 40000
                60000: '六萬元'         // 60000
            };
            
            // 如果有特殊情況的直接對應，使用它
            if (specialCases[amount]) {
                return specialCases[amount];
            }
            
            // 通用轉換算法處理複雜數字
            const amountStr = amount.toString();
            let result = '';
            const length = amountStr.length;
            let needZero = false;  // 是否需要加「零」
            
            for (let i = 0; i < length; i++) {
                const digit = amountStr[i];
                const position = length - i - 1; // 從右邊開始的位置
                
                if (digit === '0') {
                    // 處理零的邏輯：百位以上遇到0且後面還有非零數字時需要標記
                    if (position > 0 && !needZero) {
                        // 檢查後面是否還有非零數字
                        const hasNonZeroAfter = amountStr.slice(i + 1).includes('1') || 
                                              amountStr.slice(i + 1).includes('2') || 
                                              amountStr.slice(i + 1).includes('3') || 
                                              amountStr.slice(i + 1).includes('4') || 
                                              amountStr.slice(i + 1).includes('5') || 
                                              amountStr.slice(i + 1).includes('6') || 
                                              amountStr.slice(i + 1).includes('7') || 
                                              amountStr.slice(i + 1).includes('8') || 
                                              amountStr.slice(i + 1).includes('9');
                        
                        if (hasNonZeroAfter && result.length > 0) {
                            needZero = true;
                        }
                    }
                } else {
                    // 非零數字處理
                    if (needZero) {
                        result += '零';
                        needZero = false;
                    }
                    
                    // 數字2的特殊處理規則
                    if (digit === '2') {
                        if (position >= 3) { // 千位以上用「兩」
                            result += '兩';
                        } else if (position === 2) { // 百位用「兩」
                            result += '兩';
                        } else { // 十位和個位用「貳」
                            result += '貳';
                        }
                    } else {
                        result += numberMap[digit] || digit;
                    }
                    
                    // 添加單位
                    if (position === 4) result += '萬';
                    else if (position === 3) result += '仟';
                    else if (position === 2) result += '佰';
                    else if (position === 1) result += '拾';
                }
            }
            
            return result + '元';
        },

        resetTransactionState() {
            this.state.gameState.cardInserted = false;
            this.state.gameState.currentPin = '';
            this.state.gameState.pinAttempts = 0;
            this.state.gameState.transactionAmount = 0;
            this.state.gameState.isProcessing = false;
            this.state.gameState.currentTransaction = {
                type: this.state.settings.sessionType,
                amount: 0,
                account: 'savings',
                completed: false
            };

            // 重置存款狀態
            this.state.gameState.depositBills = {
                2000: 0,
                1000: 0,
                500: 0,
                100: 0
            };
            
            // 重置視覺狀態
            const cardLight = document.getElementById('card-light');
            if (cardLight) {
                cardLight.classList.remove('active');
            }
            
            // 重置細縫狀態
            const cardSlit = document.getElementById('card-slit');
            if (cardSlit) {
                cardSlit.classList.remove('active');
            }
            
            // 重置卡片狀態
            const cardElement = document.getElementById('atm-card');
            if (cardElement) {
                cardElement.classList.remove('card-inserting', 'card-inserted');
            }
            
            // 清除現金顯示
            this.clearCashDisplay();
        },

        endTransaction(reason = '') {
            console.log('🔚 [A2-ATM] 交易結束:', reason);
            this.resetTransaction();
            this.showSettings();
        },

        // =====================================================
        // 進度和遊戲化系統
        // =====================================================

        checkLevelUp() {
            const currentExp = this.state.gameState.experience;
            const currentLevel = this.state.gameState.level;
            
            // 簡單的升級公式：每1000經驗值升一級
            const newLevel = Math.floor(currentExp / 1000) + 1;
            
            if (newLevel > currentLevel) {
                this.state.gameState.level = newLevel;
                this.showLevelUpNotification(newLevel);
            }
        },

        showLevelUpNotification(level) {
            // 創建升級通知
            const notification = document.createElement('div');
            notification.className = 'level-up-notification';
            notification.innerHTML = `
                <div class="level-up-content">
                    <h3>🎉 升級了！</h3>
                    <p>您現在是等級 ${level}</p>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
            
            this.speech.speak(`恭喜升級到等級 ${level}`);
        },

        // =====================================================
        // 收據打印
        // =====================================================
        printReceipt() {
            // 在收據出口顯示列印動畫
            const receiptSlot = document.getElementById('receipt-slot');
            if (receiptSlot) {
                const printingAnimation = document.createElement('div');
                printingAnimation.className = 'printing-animation';
                printingAnimation.innerHTML = '📄 列印中...';
                receiptSlot.appendChild(printingAnimation);
                
                setTimeout(() => {
                    printingAnimation.remove();
                }, 1500);
            }
            
            // 在專用顯示區域顯示收據內容
            setTimeout(() => {
                const receiptDisplayContent = document.getElementById('receipt-display-content');
                const takeReceiptBtn = document.getElementById('take-receipt-btn');
                
                if (receiptDisplayContent) {
                    receiptDisplayContent.innerHTML = this.generateReceiptContent();
                    receiptDisplayContent.classList.add('receipt-printed');
                }
                
                if (takeReceiptBtn) {
                    takeReceiptBtn.style.display = 'block';
                }
                
                this.speech.speak('收據已列印完成，請取走收據');
            }, 1500);
        },

        // 取走收據功能
        takeReceipt() {
            const receiptDisplayContent = document.getElementById('receipt-display-content');
            const takeReceiptBtn = document.getElementById('take-receipt-btn');
            
            if (receiptDisplayContent) {
                receiptDisplayContent.innerHTML = '<p class="no-receipt-message">尚未列印收據</p>';
                receiptDisplayContent.classList.remove('receipt-printed');
            }
            
            if (takeReceiptBtn) {
                takeReceiptBtn.style.display = 'none';
            }
            
            // 播放音效
            if (this.audio) {
                this.audio.playSuccess();
            }
            
            // 顯示感謝畫面
            this.showThankYouScreen();
        },
        
        // 顯示感謝畫面
        showThankYouScreen() {
            this.updateScreen('thank-you');
            this.speech.speak('請取回交易明細表，謝謝您的惠顧', {
                callback: () => {
                    // 語音播放完畢後，返回插入卡片畫面
                    setTimeout(() => {
                        this.returnToCardInsertScreen();
                    }, 2000); // 2秒後自動返回
                }
            });
        },
        
        // 返回插入卡片畫面
        returnToCardInsertScreen() {
            // 重置遊戲狀態
            this.resetATMState();
            // 顯示插入卡片畫面
            this.updateScreen('insert-card');
            this.state.gameState.currentScene = 'insert-card';
        },
        
        // 重置ATM狀態
        resetATMState() {
            this.state.gameState = {
                ...this.state.gameState,
                cardInserted: false,
                currentPin: '',
                transactionAmount: 0,
                currentScene: 'insert-card',  // 重要：設置為插卡場景，讓金融卡可以點擊
                currentTransaction: {
                    type: null,
                    amount: 0,
                    completed: false
                },
                // 重置存款狀態
                depositBills: {
                    2000: 0,
                    1000: 0,
                    500: 0,
                    100: 0
                }
            };
            
            // 恢復卡片顯示
            const originalCard = document.getElementById('atm-card');
            if (originalCard) {
                // 🔧 [強化] 清除所有inline樣式和動畫類名
                originalCard.style.display = '';
                originalCard.style.opacity = '';
                originalCard.style.transform = '';
                originalCard.classList.remove('card-inserting', 'card-inserted', 'card-returning');
                console.log('🏧 [A2-ATM] 金融卡狀態已重置，可重新點擊');
            }
        },

        generateReceiptContent() {
            const transaction = this.state.gameState.currentTransaction;
            const amount = this.state.gameState.transactionAmount;
            const balance = this.state.gameState.accountBalance;

            return `
                <div class="receipt-content">
                    <table class="receipt-table">
                        <tr class="receipt-row">
                            <td class="receipt-label">交易類型:</td>
                            <td class="receipt-value">${this.getSessionTypeName(transaction.type)}</td>
                        </tr>
                        <tr class="receipt-row">
                            <td class="receipt-label">金額:</td>
                            <td class="receipt-value">NT$ ${amount.toLocaleString()}</td>
                        </tr>
                        <tr class="receipt-row">
                            <td class="receipt-label">餘額:</td>
                            <td class="receipt-value">NT$ ${balance.toLocaleString()}</td>
                        </tr>
                        <tr class="receipt-row">
                            <td class="receipt-label">時間:</td>
                            <td class="receipt-value">${new Date().toLocaleString()}</td>
                        </tr>
                    </table>
                </div>
            `;
        },

        // 生成螢幕明細表顯示
        generateScreenReceiptDisplay() {
            const transaction = this.state.gameState.currentTransaction;
            const amount = this.state.gameState.transactionAmount;
            const balance = this.state.gameState.accountBalance;

            return `
                <div class="screen-receipt-display">
                    <div class="receipt-header">
                        <div class="receipt-icon">🧾</div>
                        <h2 style="color: white;">交易明細表</h2>
                        <p class="display-message">明細表顯示完成，將於5秒後自動返回</p>
                    </div>

                    <div class="screen-receipt-content">
                        <table class="screen-receipt-table">
                            <tr class="screen-receipt-row">
                                <td class="screen-receipt-label">交易類型:</td>
                                <td class="screen-receipt-value">${this.getSessionTypeName(transaction.type)}</td>
                            </tr>
                            <tr class="screen-receipt-row">
                                <td class="screen-receipt-label">金額:</td>
                                <td class="screen-receipt-value">NT$ ${amount.toLocaleString()}</td>
                            </tr>
                            <tr class="screen-receipt-row">
                                <td class="screen-receipt-label">餘額:</td>
                                <td class="screen-receipt-value">NT$ ${balance.toLocaleString()}</td>
                            </tr>
                            <tr class="screen-receipt-row">
                                <td class="screen-receipt-label">時間:</td>
                                <td class="screen-receipt-value">${new Date().toLocaleString()}</td>
                            </tr>
                        </table>
                    </div>

                    <div class="auto-return-notice">
                        <p class="countdown-text">5秒後自動返回主畫面...</p>
                    </div>
                </div>
            `;
        },

        // =====================================================
        // 最終結果顯示
        // =====================================================
        showFinalResults() {
            const { completedTransactions } = this.state.quiz;
            const totalExp = this.state.gameState.experience;
            const level = this.state.gameState.level;
            const completionTime = Date.now() - this.state.quiz.startTime;
            
            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="atm-results-container">
                    <div class="results-header">
                        <h1>🎉 ATM學習完成！</h1>
                        <div class="final-stats">
                            <div class="stat-item">
                                <div class="stat-value">${completedTransactions.length}</div>
                                <div class="stat-label">完成交易</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${totalExp}</div>
                                <div class="stat-label">總經驗值</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${level}</div>
                                <div class="stat-label">等級</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${Math.round(completionTime / 1000)}s</div>
                                <div class="stat-label">完成時間</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="results-content">
                        <div class="achievements-section">
                            <h3>🏆 學習成果</h3>
                            <div class="achievement-list">
                                <div class="achievement-item">
                                    <span class="achievement-icon">🎯</span>
                                    <span class="achievement-text">完成ATM操作流程學習</span>
                                </div>
                                <div class="achievement-item">
                                    <span class="achievement-icon">🔐</span>
                                    <span class="achievement-text">掌握密碼輸入安全操作</span>
                                </div>
                                <div class="achievement-item">
                                    <span class="achievement-icon">💰</span>
                                    <span class="achievement-text">學會金額輸入和確認</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="performance-feedback">
                            <h3>📊 表現評價</h3>
                            <div class="feedback-text">
                                ${this.generatePerformanceFeedback(completedTransactions.length, completionTime)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="results-footer">
                        <button class="restart-btn" onclick="ATM.restartLearning()">
                            🔄 重新開始
                        </button>
                        <button class="settings-btn" onclick="ATM.showSettings()">
                            ⚙️ 調整設定
                        </button>
                        <button class="back-btn" onclick="ATM.backToMainMenu()">
                            返回主頁
                        </button>
                    </div>
                </div>
            `;
            
            this.speech.speak(`恭喜完成ATM學習！您共完成了 ${completedTransactions.length} 個交易，獲得 ${totalExp} 經驗值`);
        },

        generatePerformanceFeedback(completedTransactions, completionTime) {
            const avgTimePerTransaction = completionTime / completedTransactions / 1000; // 秒
            
            if (avgTimePerTransaction < 30) {
                return "🌟 優秀！您的操作非常熟練，已經掌握ATM的使用技巧。";
            } else if (avgTimePerTransaction < 60) {
                return "👍 良好！您已經能夠順利完成ATM操作，繼續練習會更熟練。";
            } else {
                return "💪 加油！多練習幾次就能更快速地完成ATM操作了。";
            }
        },

        // =====================================================
        // 重新開始和導航
        // =====================================================
        restartLearning() {
            // 重置所有狀態
            this.state.quiz.currentQuestion = 0;
            this.state.quiz.score = 0;
            this.state.quiz.completedTransactions = [];
            this.state.gameState.experience = 0;
            this.state.gameState.level = 1;
            this.resetTransaction();
            
            // 重新開始學習
            this.startLearning();
        },

        backToMainMenu() {
            // 返回到單元選擇畫面或主選單
            window.location.href = '../index.html';
        },

        // =====================================================
        // 初始化
        // =====================================================
        init() {
            this.speech.init();
            this.audio.init();
            this.showSettings();
            
            console.log('🏧 [A2-ATM] ATM學習系統初始化完成');
        }
    };

    // 全域變數設定，讓HTML可以呼叫
    window.ATM = ATM;
    
    // 初始化系統
    ATM.init();
});