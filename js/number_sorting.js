// =================================================================
// FILE: js/number_sorting.js
// DESC: 數字排序 - F2風格配置驅動版本 (V2 with new features)
// =================================================================

// Define Game as a global variable to support onclick events in dynamic HTML
let Game;

document.addEventListener('DOMContentLoaded', () => {
    Game = {
        // =====================================================
        // 🐛 Debug System - 配置驅動除錯系統
        // =====================================================
        Debug: {
            enabled: true, // 設為 false 可關閉所有 debug 訊息
            logPrefix: '[數字排序]',
            performanceStart: {},
            
            log(category, message, data = null) {
                if (!this.enabled) return;
                const timestamp = new Date().toLocaleTimeString();
                const fullMessage = `${this.logPrefix}[${category}] ${timestamp}: ${message}`;
                console.log(fullMessage, data || '');
            },
            
            logGameFlow(action, data = null) {
                this.log('遊戲流程', action, data);
            },
            
            logAudio(action, soundType, config) {
                this.log('音效系統', `${action} - 音效類型: ${soundType}`, {
                    audioFeedback: config?.audioFeedback,
                    difficulty: config?.difficulty || 'unknown'
                });
            },
            
            logSpeech(action, templateKey, difficulty, data = null) {
                this.log('語音系統', `${action} - 模板: ${templateKey} - 難度: ${difficulty}`, data);
            },
            
            logConfig(difficulty, configData) {
                this.log('配置系統', `載入${difficulty}模式配置`, configData);
            },
            
            logUserAction(action, data = null) {
                this.log('使用者行為', action, data);
            },
            
            logError(error, context = '') {
                this.log('錯誤', `${context}: ${error.message || error}`, error);
                console.error('詳細錯誤資訊:', error);
            },
            
            logPerformance(action, startTime = null) {
                if (startTime) {
                    const duration = performance.now() - startTime;
                    this.log('效能監控', `${action} 完成，耗時: ${duration.toFixed(2)}ms`);
                } else {
                    this.performanceStart[action] = performance.now();
                    return this.performanceStart[action];
                }
            },
            
            logDragDrop(action, data = null) {
                this.log('拖放系統', action, data);
            },
            
            logModal(action, modalType, data = null) {
                this.log('視窗系統', `${action} - ${modalType}`, data);
            }
        },

        // =====================================================
        // Style Configuration - 配置驅動樣式系統
        // =====================================================
        StyleConfig: {
            base: {
                numberContainer: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '15px',
                    padding: '20px',
                    minHeight: '120px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '15px',
                    border: '2px solid #e9ecef'
                },
                answerContainer: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '20px',
                    minHeight: '140px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '15px',
                    border: '2px solid #ffeaa7',
                    marginTop: '20px'
                },
                numberBox: {
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8em',
                    fontWeight: 'bold',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '12px',
                    cursor: 'grab',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 123, 255, 0.2)',
                    border: '2px solid transparent'
                },
                slot: {
                    width: '70px',
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px dashed #ffc107',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                }
            },
            
            easy: {
                slot: {
                    border: '3px dashed #28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)'
                }
            },
            
            normal: {
                slot: {
                    border: '3px dashed #007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)'
                }
            },
            
            hard: {
                slot: {
                    border: '3px dashed #dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)'
                }
            }
        },

        // =====================================================
        // Game Data and Configuration
        // =====================================================
        gameData: {
            title: "🔢 數字排序",
            difficultySettings: {
                easy: { label: '簡單 (提示與鎖定)'},
                normal: { label: '普通 (手動確認)'},
                hard: { label: '困難 (無提示)' }
            },
            numberRangeSettings: { // New setting
                '1-10': { label: '1-10', levels: 1 },
                '1-20': { label: '1-20', levels: 2 },
                '1-50': { label: '1-50', levels: 5 },
                '1-100': { label: '1-100', levels: 10 },
                'custom': { label: '自訂範圍', levels: null }
            },
            timeSettings: {
                none: { label: '無限制', value: null },
                60: { label: '60秒', value: 60 },
                120: { label: '120秒', value: 120 },
                300: { label: '300秒', value: 300 }
            },
            modeSettings: {
                sequential: { label: '順序排列' },
                random: { label: '隨機數字' }
            },
            soundSettings: {
                on: { label: '開啟音效' },
                off: { label: '關閉音效' }
            }
        },

        // =====================================================
        // Game State
        // =====================================================
        state: {
            settings: {
                difficulty: null,
                numberRange: null, // New setting
                time: null,
                mode: null,
                sound: 'on'
            },
            customRange: {
                startNumber: 1,
                endNumber: 20,
                numbersPerLevel: 10,
                totalNumbers: 0,
                totalLevels: 0
            },
            currentLevel: 1,
            totalLevels: 0,
            correctOrder: [],
            draggedElement: null,
            isChecking: false,
            isPaused: false,
            startTime: null,
            timeElapsed: 0,
            timerInterval: null,
            score: 0
        },

        // =====================================================
        // DOM Elements
        // =====================================================
        elements: {},

        // =====================================================
        // Audio & Speech Systems
        // =====================================================
        Audio: {
            playSound(soundType) {
                if (Game.state.settings.sound === 'off') return;
                const soundMap = {
                    select: 'select-sound', click: 'click-sound', correct: 'correct-sound',
                    error: 'error-sound', success: 'success-sound'
                };
                const audio = document.getElementById(soundMap[soundType]);
                if (audio) { audio.currentTime = 0; audio.play().catch(e => console.warn(`Audio play failed: ${soundType}`, e)); }
            }
        },
        Speech: {
            speak(text, wait = false) {
                if (Game.state.settings.sound === 'off') return wait ? Promise.resolve() : undefined;
                speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'zh-TW';
                utterance.rate = 1;
                if (wait) {
                    return new Promise((resolve, reject) => {
                        utterance.onend = resolve; utterance.onerror = reject;
                        speechSynthesis.speak(utterance);
                    });
                } else {
                    speechSynthesis.speak(utterance);
                }
            }
        },

        // =====================================================
        // CSS Generator
        // =====================================================
        CSSGenerator: {
            generateCSS(difficulty) {
                const baseStyles = Game.StyleConfig.base;
                const modeStyles = Game.StyleConfig[difficulty] || {};
                
                return `
                    <style>
                        .number-container { ${this.objectToCSS(baseStyles.numberContainer)} }
                        .answer-container { ${this.objectToCSS(baseStyles.answerContainer)} }
                        .number-box {
                            ${this.objectToCSS(baseStyles.numberBox)}
                            background: linear-gradient(135deg, #007bff, #0056b3) !important;
                            box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3) !important;
                        }
                        .number-box.locked { cursor: not-allowed; }
                        .number-box:hover:not(.locked) { 
                            transform: translateY(-3px); 
                            box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4) !important; 
                        }
                        .number-box:active { cursor: grabbing; }
                        .number-box.correct { 
                            background: linear-gradient(135deg, #28a745, #20c997) !important; 
                            box-shadow: 0 4px 20px rgba(40, 167, 69, 0.5) !important; 
                            transform: scale(1.05); 
                        }
                        .number-box.incorrect { 
                            background: linear-gradient(135deg, #dc3545, #e83e8c) !important; 
                            box-shadow: 0 4px 20px rgba(220, 53, 69, 0.5) !important; 
                            animation: shake 0.5s ease-in-out; 
                        }
                        .slot { ${this.objectToCSS(baseStyles.slot)} ${modeStyles.slot ? this.objectToCSS(modeStyles.slot) : ''} }
                        .slot.drag-over { border-style: solid; background-color: rgba(255, 193, 7, 0.3); transform: scale(1.1); }
                        .slot .number-box { cursor: grab; }
                        .slot-hint { font-size: 1.5em; color: #000; opacity: 0.15; font-weight: bold; pointer-events: none; }
                        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
                        .message { text-align: center; font-size: 1.2em; font-weight: bold; margin: 20px 0; padding: 15px; border-radius: 10px; min-height: 50px; display: flex; align-items: center; justify-content: center; }
                        #confirm-btn { padding: 10px 30px; font-size: 1.2em; cursor: pointer; border-radius: 10px; border: none; color: white; background: #ffc107; margin-top: 15px; }
                        #confirm-btn:disabled { background: #6c757d; cursor: not-allowed; }
                        
                        /* Custom Range Modal */
                        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: none !important; justify-content: center; align-items: center; z-index: 1000; }
                        .modal-overlay.show { display: flex !important; }
                        .modal-content { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); max-width: 400px; width: 90%; }
                        .modal-title { font-size: 1.5em; font-weight: bold; margin-bottom: 20px; text-align: center; color: #495057; }
                        .input-group { margin-bottom: 20px; }
                        .input-group label { display: block; margin-bottom: 8px; font-weight: bold; color: #495057; }
                        .input-group input { width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1em; box-sizing: border-box; }
                        .input-group input:focus { border-color: #007bff; outline: none; }
                        .modal-buttons { display: flex; gap: 15px; justify-content: center; }
                        .modal-btn { padding: 10px 25px; border: none; border-radius: 8px; font-size: 1em; cursor: pointer; transition: all 0.3s ease; }
                        .modal-btn.primary { background: #007bff; color: white; }
                        .modal-btn.primary:hover { background: #0056b3; }
                        .modal-btn.secondary { background: #6c757d; color: white; }
                        .modal-btn.secondary:hover { background: #545b62; }
                    </style>
                `;
            },
            objectToCSS(obj) {
                return Object.entries(obj).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`).join(' ');
            }
        },

        // =====================================================
        // HTML Templates
        // =====================================================
        HTMLTemplates: {
            settingsScreen() {
                const { difficulty, numberRange, time, mode, sound } = Game.state.settings;
                const { gameData } = Game;
                return `
                    <div class="unit-welcome">
                        <div class="welcome-content">
                            <h1>${gameData.title}</h1>
                            <div class="game-settings">
                                <div class="setting-group">
                                    <label>🎯 難度選擇：</label>
                                    <div class="button-group">
                                        ${Object.entries(gameData.difficultySettings).map(([key, value]) => `
                                            <button class="selection-btn ${difficulty === key ? 'active' : ''}" data-type="difficulty" data-value="${key}">${value.label}</button>
                                        `).join('')}
                                    </div>
                                </div>
                                <div class="setting-group">
                                    <label>🔢 數字選項：</label>
                                    <div class="button-group">
                                        ${Object.entries(gameData.numberRangeSettings).map(([key, value]) => `
                                            <button class="selection-btn ${numberRange === key ? 'active' : ''}" data-type="numberRange" data-value="${key}">${value.label}</button>
                                        `).join('')}
                                    </div>
                                    ${numberRange === 'custom' ? `<div id="custom-range-display" style="margin-top: 10px; padding: 10px; background: #e9ecef; border-radius: 8px; text-align: center; color: #495057; font-size: 0.9em;">
                                        範圍：${Game.state.customRange.startNumber}-${Game.state.customRange.endNumber} | 每關：${Game.state.customRange.numbersPerLevel}個數字 | 共${Game.state.customRange.totalLevels}關
                                    </div>` : ''}
                                </div>
                                <div class="setting-group">
                                    <label>⏰ 時間限制：</label>
                                    <div class="button-group">
                                        ${Object.entries(gameData.timeSettings).map(([key, value]) => `
                                            <button class="selection-btn ${time === key ? 'active' : ''}" data-type="time" data-value="${key}">${value.label}</button>
                                        `).join('')}
                                    </div>
                                </div>
                                <div class="setting-group">
                                    <label>🎲 遊戲模式：</label>
                                    <div class="button-group">
                                        ${Object.entries(gameData.modeSettings).map(([key, value]) => `
                                            <button class="selection-btn ${mode === key ? 'active' : ''}" data-type="mode" data-value="${key}">${value.label}</button>
                                        `).join('')}
                                    </div>
                                </div>
                                <div class="setting-group">
                                    <label>🔊 音效設定：</label>
                                    <div class="button-group">
                                        ${Object.entries(gameData.soundSettings).map(([key, value]) => `
                                            <button class="selection-btn ${sound === key ? 'active' : ''}" data-type="sound" data-value="${key}">${value.label}</button>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                            <div class="game-buttons">
                                <button class="back-btn" onclick="window.location.href='index.html'">返回主選單</button>
                                <button id="start-game-btn" class="start-btn" disabled>請完成所有選擇</button>
                            </div>
                        </div>
                    </div>
                    ${Game.HTMLTemplates.customRangeModal()}
                `;
            },
            gameLayout() {
                const difficulty = Game.state.settings.difficulty;
                const difficultyName = Game.gameData.difficultySettings[difficulty].label;
                return `
                    ${Game.CSSGenerator.generateCSS(difficulty)}
                    <div class="store-layout">
                        <div class="title-bar">
                            <div class="title-bar-left">
                                <div id="progress-info" class="progress-info">進度: -/-</div>
                                <div id="difficulty-info" class="progress-info" style="margin-left: 15px;">難度: ${difficultyName}</div>
                            </div>
                            <div class="title-bar-center"><div id="game-title" class="target-amount"></div></div>
                            <div class="title-bar-right">
                                <div id="score-info" class="score-info">分數: 0</div>
                                <div id="timer-info" class="score-info" style="margin-left: 15px; min-width: 80px;">時間: -</div>
                                <button class="back-to-menu-btn" onclick="Game.init()">返回設定</button>
                            </div>
                        </div>
                        <div class="unified-task-frame" style="padding-top: 20px;">
                            <div style="margin-bottom: 20px; text-align: center;"><h3 style="margin: 0; color: #495057; font-size: 1.1em;">🎯 請將數字拖放到正確位置</h3></div>
                            <div id="number-container" class="number-container"></div>
                            <div id="answer-container" class="answer-container"></div>
                            <div id="confirm-container" style="text-align:center"></div>
                            <div id="message-area" class="message"></div>
                        </div>
                        <div class="fireworks-container" id="fireworks-container"></div>
                        <div class="pause-overlay" id="pause-overlay">
                            <div class="pause-menu">
                                <h2>遊戲暫停</h2>
                                <div class="pause-buttons" style="display: flex; justify-content: center; gap: 15px;">
                                    <button onclick="Game.resumeGame()">繼續遊戲</button>
                                    <button onclick="Game.resetGame()">重新開始</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            },
            resultsScreen(message, trophy) {
                const timeTaken = Math.floor((Date.now() - Game.state.startTime) / 1000);
                const minutes = Math.floor(timeTaken / 60);
                const seconds = timeTaken % 60;
                const timeString = `用時：${minutes}:${seconds.toString().padStart(2, '0')}`;
                return `
                 <div class="game-complete">
                    <div class="result-card">
                        <div class="results-header"><div class="trophy-icon">${trophy}</div><h1>🎉 ${message} 🎉</h1></div>
                        <div class="final-stats">
                            <div class="stat-item"><span>總分</span><span>${Game.state.score} 分</span></div>
                            <div class="stat-item"><span>時間</span><span>${timeString}</span></div>
                        </div>
                        <div class="action-buttons">
                            <button class="primary-btn" onclick="Game.start()">🔄 再玩一次</button>
                            <button class="secondary-btn" onclick="Game.init()">🏠 返回設定</button>
                        </div>
                    </div>
                </div>
                `;
            },

            customRangeModal() {
                return `
                    <div class="modal-overlay" id="custom-range-modal">
                        <div class="modal-content">
                            <div class="modal-title">🔢 自訂數字範圍</div>
                            <div class="input-group">
                                <label for="start-number">起始數字：</label>
                                <input type="number" id="start-number" min="1" max="999" value="1" placeholder="請輸入起始數字">
                            </div>
                            <div class="input-group">
                                <label for="end-number">結束數字：</label>
                                <input type="number" id="end-number" min="1" max="999" value="20" placeholder="請輸入結束數字">
                            </div>
                            <div class="input-group">
                                <label for="numbers-per-level">每關數字數量：</label>
                                <input type="number" id="numbers-per-level" min="5" max="50" value="10" placeholder="每關要排序的數字數量">
                            </div>
                            <div class="modal-buttons">
                                <button class="modal-btn secondary" onclick="Game.closeCustomRangeModal()">取消</button>
                                <button class="modal-btn primary" onclick="Game.confirmCustomRange()">確認</button>
                            </div>
                        </div>
                    </div>
                `;
            }
        },

        // =====================================================
        // Initialization & Settings
        // =====================================================
        init() { 
            this.Debug.logGameFlow('遊戲初始化開始');
            // 清理異常狀態
            this.resetGameState();
            this.showSettings(); 
            this.Debug.logGameFlow('遊戲初始化完成');
        },
        
        resetGameState() {
            this.Debug.logGameFlow('重置遊戲狀態');
            // 重置所有狀態到初始值
            this.state = {
                currentLevel: 1,
                totalLevels: 5,
                currentNumbers: [],
                placedNumbers: [],
                score: 0,
                isCompleted: false,
                settings: {
                    difficulty: null,
                    numberRange: null,
                    time: null,
                    mode: null,
                    sound: null
                },
                customRange: {
                    startNumber: 1,
                    endNumber: 20,
                    numbersPerLevel: 10,
                    totalLevels: 1
                }
            };
        },
        showSettings() {
            this.Debug.logGameFlow('顯示設定頁面');
            const app = document.getElementById('app');
            app.innerHTML = this.HTMLTemplates.settingsScreen();
            app.querySelector('.game-settings').addEventListener('click', this.handleSelection.bind(this));
            app.querySelector('#start-game-btn').addEventListener('click', this.start.bind(this));
            this.updateStartButton();
            
            // 確保自訂範圍視窗初始為隱藏狀態
            setTimeout(() => {
                const modal = document.getElementById('custom-range-modal');
                if (modal) {
                    modal.style.display = 'none';
                    this.Debug.logModal('初始隱藏', '自訂範圍視窗');
                }
            }, 100);
        },
        handleSelection(event) {
            const btn = event.target.closest('.selection-btn');
            if (!btn) return;
            const { type, value } = btn.dataset;
            this.Debug.logUserAction(`選擇設定: ${type} = ${value}`);
            this.Audio.playSound('select');
            // Custom Range Logic
            if (type === 'numberRange' && value === 'custom') {
                this.Debug.logModal('準備顯示', '自訂範圍視窗');
                this.showCustomRangeModal();
                return;
            }
            this.state.settings[type] = value;
            const buttonGroup = btn.closest('.button-group');
            buttonGroup.querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.updateStartButton();
        },
        updateStartButton() {
            const { difficulty, numberRange, time, mode, sound } = this.state.settings;
            const startBtn = document.getElementById('start-game-btn');
            if (difficulty && numberRange && time && mode && sound) {
                startBtn.disabled = false; startBtn.textContent = '開始遊戲！';
            } else {
                startBtn.disabled = true; startBtn.textContent = '請完成所有選擇';
            }
        },

        // =====================================================
        // Custom Range Modal Methods
        // =====================================================
        showCustomRangeModal() {
            this.Debug.logModal('顯示', '自訂範圍視窗', this.state.customRange);
            const modal = document.getElementById('custom-range-modal');
            if (modal) {
                // Pre-fill with current values
                document.getElementById('start-number').value = this.state.customRange.startNumber;
                document.getElementById('end-number').value = this.state.customRange.endNumber;
                document.getElementById('numbers-per-level').value = this.state.customRange.numbersPerLevel;
                modal.classList.add('show');
            }
        },

        closeCustomRangeModal() {
            this.Debug.logModal('隱藏', '自訂範圍視窗');
            const modal = document.getElementById('custom-range-modal');
            if (modal) {
                modal.classList.remove('show');
            }
        },

        confirmCustomRange() {
            const startNumber = parseInt(document.getElementById('start-number').value);
            const endNumber = parseInt(document.getElementById('end-number').value);
            const numbersPerLevel = parseInt(document.getElementById('numbers-per-level').value);

            // Validation
            if (!startNumber || !endNumber || !numbersPerLevel) {
                alert('請填寫所有欄位！');
                return;
            }
            if (startNumber >= endNumber) {
                alert('結束數字必須大於起始數字！');
                return;
            }
            if (endNumber - startNumber < numbersPerLevel) {
                alert('數字範圍必須大於或等於每關數字數量！');
                return;
            }
            if (numbersPerLevel < 5 || numbersPerLevel > 50) {
                alert('每關數字數量必須在5-50之間！');
                return;
            }

            // Calculate levels
            const totalNumbers = endNumber - startNumber + 1;
            const totalLevels = Math.ceil(totalNumbers / numbersPerLevel);

            // Update state
            this.state.customRange = {
                startNumber,
                endNumber,
                numbersPerLevel,
                totalNumbers,
                totalLevels
            };

            // Update gameData
            this.gameData.numberRangeSettings.custom.levels = totalLevels;

            // Select custom range and update UI
            this.state.settings.numberRange = 'custom';
            this.closeCustomRangeModal();
            this.showSettings(); // Refresh settings page to show the new values
            this.Audio.playSound('select');
        },

        // =====================================================
        // Game Flow
        // =====================================================
        start() {
            this.Audio.playSound('click');
            this.state.currentLevel = 1;
            this.state.score = 0;
            this.state.isPaused = false;
            this.state.isChecking = false;
            
            // Set total levels based on range type
            if (this.state.settings.numberRange === 'custom') {
                this.state.totalLevels = this.state.customRange.totalLevels;
            } else {
                this.state.totalLevels = this.gameData.numberRangeSettings[this.state.settings.numberRange].levels;
            }
            
            this.setupGameUI();
            this.startNewLevel();
            this.startTimer();
        },
        setupGameUI() {
            const app = document.getElementById('app');
            app.innerHTML = this.HTMLTemplates.gameLayout();
            this.elements = {
                app, gameTitle: document.getElementById('game-title'),
                numberContainer: document.getElementById('number-container'),
                answerContainer: document.getElementById('answer-container'),
                confirmContainer: document.getElementById('confirm-container'),
                messageArea: document.getElementById('message-area'),
                fireworksContainer: document.getElementById('fireworks-container'),
                pauseOverlay: document.getElementById('pause-overlay'),
                progressInfo: document.getElementById('progress-info'),
                scoreInfo: document.getElementById('score-info'),
                timerInfo: document.getElementById('timer-info'),
            };
            this.bindDragDropEvents();
        },
        startNewLevel() {
            this.state.isChecking = false;
            const level = this.state.currentLevel;
            let startNum, endNum, levelTitle;

            if (this.state.settings.numberRange === 'custom') {
                // Custom range logic
                const { startNumber, endNumber, numbersPerLevel } = this.state.customRange;
                const totalNumbers = endNumber - startNumber + 1;
                startNum = startNumber + (level - 1) * numbersPerLevel;
                endNum = Math.min(startNum + numbersPerLevel - 1, endNumber);
                levelTitle = `第 ${level} 關 (${startNum}~${endNum})`;
            } else {
                // Fixed range logic (original)
                startNum = (level - 1) * 10 + 1;
                endNum = level * 10;
                levelTitle = `第 ${level} 關 (${startNum}~${endNum})`;
            }

            this.state.correctOrder = Array.from({length: endNum - startNum + 1}, (_, i) => (startNum + i).toString());
            this.elements.gameTitle.textContent = levelTitle;
            this.updateProgress();
            this.elements.numberContainer.innerHTML = '';
            this.elements.answerContainer.innerHTML = '';
            this.elements.messageArea.textContent = '';
            this.elements.confirmContainer.innerHTML = '';
            const numbersToDisplay = [...this.state.correctOrder];
            if (this.state.settings.mode === 'random') this.shuffleArray(numbersToDisplay);
            numbersToDisplay.forEach(num => this.createNumberBox(num));
            this.state.correctOrder.forEach((_, index) => this.createAnswerSlot(index));
        },
        createNumberBox(num) {
            const numberBox = document.createElement('div');
            numberBox.className = 'number-box';
            numberBox.textContent = num;
            numberBox.dataset.value = num;
            numberBox.draggable = true;
            this.elements.numberContainer.appendChild(numberBox);
        },
        createAnswerSlot(index) {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.dataset.position = index;
            if (this.state.settings.difficulty === 'easy') {
                const hint = document.createElement('span');
                hint.className = 'slot-hint';
                hint.textContent = this.state.correctOrder[index];
                slot.appendChild(hint);
            }
            this.elements.answerContainer.appendChild(slot);
        },
        
        // =====================================================
        // Drag & Drop and Answer Checking
        // =====================================================
        bindDragDropEvents() {
            this.elements.app.addEventListener('dragstart', e => {
                if (e.target.classList.contains('number-box') && !e.target.classList.contains('locked')) {
                    this.state.draggedElement = e.target;
                    this.Speech.speak(e.target.dataset.value);
                    setTimeout(() => e.target.style.opacity = '0.5', 0);
                }
            });
            this.elements.app.addEventListener('dragend', e => {
                if (this.state.draggedElement) this.state.draggedElement.style.opacity = '1';
                this.state.draggedElement = null;
                document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            });
            this.elements.app.addEventListener('dragover', e => e.preventDefault());
            this.elements.app.addEventListener('dragenter', e => {
                const dropTarget = e.target.closest('.slot');
                if (dropTarget && !dropTarget.querySelector('.number-box.locked')) dropTarget.classList.add('drag-over');
            });
            this.elements.app.addEventListener('dragleave', e => {
                if (e.target.closest('.slot')) e.target.closest('.slot').classList.remove('drag-over');
            });
            this.elements.app.addEventListener('drop', e => {
                e.preventDefault();
                const slot = e.target.closest('.slot');
                const numberContainer = e.target.closest('.number-container');
                if (slot && this.state.draggedElement && !slot.querySelector('.number-box.locked')) {
                    this.handleDrop(slot);
                } else if (numberContainer && this.state.draggedElement) {
                     if (this.state.draggedElement.parentNode !== numberContainer) {
                        numberContainer.appendChild(this.state.draggedElement);
                        this.state.draggedElement.classList.remove('incorrect', 'correct');
                     }
                }
            });
        },
        handleDrop(slot) {
            const draggedValue = this.state.draggedElement.dataset.value;
            const slotPosition = slot.dataset.position;
            this.Debug.logDragDrop(`放置數字 ${draggedValue} 到位置 ${slotPosition}`);
            
            const existingBox = slot.querySelector('.number-box');
            if (existingBox) this.elements.numberContainer.appendChild(existingBox);
            slot.appendChild(this.state.draggedElement);
            this.state.draggedElement.classList.remove('incorrect', 'correct');

            if (this.state.settings.difficulty === 'easy') {
                this.checkAnswerEasy(slot);
                this.checkCompletion();
            } else { // Normal and Hard mode
                // 檢查是否所有插槽都有數字方塊
                const allSlots = this.elements.answerContainer.querySelectorAll('.slot');
                const allFilled = Array.from(allSlots).every(slot => slot.querySelector('.number-box'));
                this.Debug.logGameFlow(`所有插槽已填滿: ${allFilled}`);
                if (allFilled) this.showConfirmButton();
            }
        },
        checkAnswerEasy(slot) {
            const box = slot.querySelector('.number-box');
            const isCorrect = box.dataset.value === this.state.correctOrder[parseInt(slot.dataset.position)];
            if (isCorrect) {
                box.classList.add('correct', 'locked');
                box.draggable = false;
                if (slot.querySelector('.slot-hint')) slot.querySelector('.slot-hint').style.display = 'none';
                this.Audio.playSound('correct'); this.state.score += 10; this.updateProgress();
            } else {
                box.classList.add('incorrect'); this.Audio.playSound('error');
            }
        },
        showConfirmButton() {
            this.Debug.logGameFlow('顯示確認按鈕');
            this.elements.confirmContainer.innerHTML = `<button id="confirm-btn">確認答案</button>`;
            document.getElementById('confirm-btn').onclick = () => this.confirmNormalAnswers();
        },
        confirmNormalAnswers() {
            this.Debug.logGameFlow('開始確認答案');
            this.elements.confirmContainer.innerHTML = ''; // Hide button
            let allCorrect = true;
            const incorrectBoxes = [];
            
            this.elements.answerContainer.querySelectorAll('.slot').forEach(slot => {
                const box = slot.querySelector('.number-box');
                const isCorrect = box.dataset.value === this.state.correctOrder[parseInt(slot.dataset.position)];
                box.classList.remove('correct', 'incorrect');
                box.classList.add(isCorrect ? 'correct' : 'incorrect');
                if (isCorrect) { 
                    this.state.score += 10; 
                } else { 
                    allCorrect = false; 
                    incorrectBoxes.push(box);
                }
            });
            
            this.updateProgress();
            
            if (allCorrect) { 
                this.Debug.logGameFlow('答案全部正確！');
                this.Audio.playSound('correct'); 
                this.checkCompletion(); 
            } else { 
                this.Debug.logGameFlow(`答案有錯誤，錯誤數量: ${incorrectBoxes.length}`);
                this.Audio.playSound('error');
                // 延遲後將錯誤的數字放回上方容器，並重新顯示確認按鈕
                setTimeout(() => {
                    this.Debug.logGameFlow('將錯誤數字移回上方容器');
                    incorrectBoxes.forEach(box => {
                        box.classList.remove('incorrect');
                        this.elements.numberContainer.appendChild(box);
                    });
                    // 檢查是否仍然所有插槽都有數字
                    const allSlots = this.elements.answerContainer.querySelectorAll('.slot');
                    const stillAllFilled = Array.from(allSlots).every(slot => slot.querySelector('.number-box'));
                    if (stillAllFilled) this.showConfirmButton();
                }, 2000); // 2秒後移除錯誤的數字
            }
        },
        async checkCompletion() {
            if (this.state.isChecking) return;
            const correctSlots = this.elements.answerContainer.querySelectorAll('.slot .number-box.correct');
            if (correctSlots.length !== this.state.correctOrder.length) return;
            
            this.state.isChecking = true;
            this.elements.messageArea.textContent = '太棒了，你答對了！';
            this.elements.messageArea.style.color = '#2ecc71';
            this.Audio.playSound('success');
            this.createFireworks();
            await this.Speech.speak('太棒了，你答對了！', true);
            
            if (this.state.currentLevel < this.state.totalLevels) {
                this.state.currentLevel++; this.startNewLevel();
            } else {
                this.endGame('恭喜完成所有關卡！', '🏆');
            }
        },

        // =====================================================
        // Game Controls & Utilities
        // =====================================================
        pauseGame() { 
            this.Debug.logGameFlow('暫停遊戲');
            this.state.isPaused = true; 
            this.elements.pauseOverlay.style.display = 'flex';
        },
        resumeGame() { 
            this.Debug.logGameFlow('繼續遊戲');
            this.state.isPaused = false; 
            this.elements.pauseOverlay.style.display = 'none';
        },
        resetGame() { 
            this.Debug.logGameFlow('重置遊戲');
            this.Audio.playSound('click'); 
            clearInterval(this.state.timerInterval); 
            this.state.isPaused = false;
            this.elements.pauseOverlay.style.display = 'none';
            this.start(); 
        },
        endGame(message, trophy) {
            clearInterval(this.state.timerInterval);
            this.elements.app.innerHTML = this.HTMLTemplates.resultsScreen(message, trophy);
        },
        updateProgress() {
            this.elements.progressInfo.textContent = `進度: ${this.state.currentLevel}/${this.state.totalLevels}`;
            this.elements.scoreInfo.textContent = `分數: ${this.state.score}`;
        },
        startTimer() {
            this.state.startTime = Date.now();
            if (this.state.settings.time === 'none') { this.elements.timerInfo.textContent = '無限制'; return; }
            let timeLimit = parseInt(this.state.settings.time);
            this.state.timerInterval = setInterval(() => {
                if (this.state.isPaused) return;
                const remaining = timeLimit - Math.floor((Date.now() - this.state.startTime) / 1000);
                if (remaining <= 0) {
                    clearInterval(this.state.timerInterval);
                    this.endGame('時間到！', '⏰');
                    return;
                }
                const minutes = Math.floor(remaining / 60);
                const seconds = remaining % 60;
                this.elements.timerInfo.textContent = `時間: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                this.elements.timerInfo.classList.toggle('warning', remaining <= 30);
            }, 1000);
        },
        createFireworks() {
            const container = this.elements.fireworksContainer;
            if (!container) return; container.style.display = 'block'; container.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const x = Math.random() * window.innerWidth;
                    const y = Math.random() * (window.innerHeight * 0.5);
                    this.createFirework(x, y);
                }, i * 200);
            }
            setTimeout(() => { container.style.display = 'none'; }, 2000);
        },
        createFirework(x, y) {
            const colors = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'];
            for (let i = 0; i < 30; i++) {
                const p = document.createElement('div');
                p.className = 'firework'; p.style.left = `${x}px`; p.style.top = `${y}px`;
                p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                const angle = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 80;
                const dx = Math.cos(angle) * dist, dy = Math.sin(angle) * dist;
                p.style.setProperty('--dx', `${dx}px`); p.style.setProperty('--dy', `${dy}px`);
                this.elements.fireworksContainer.appendChild(p);
                p.addEventListener('animationend', () => p.remove(), { once: true });
            }
        },
        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        },
        
        // =====================================================
        // Audio System - 音效系統
        // =====================================================
        Audio: {
            playSound(soundType) {
                try {
                    Game.Debug.logAudio('播放音效', soundType, Game.state.settings);
                    const audio = document.getElementById(`${soundType}-sound`);
                    if (audio && Game.state.settings.sound !== 'off') {
                        audio.currentTime = 0;
                        audio.play().catch(e => {
                            Game.Debug.logError(e, `音效播放失敗: ${soundType}`);
                        });
                    }
                } catch (error) {
                    Game.Debug.logError(error, `音效系統錯誤: ${soundType}`);
                }
            }
        }
    };

    window.Game = Game;
    Game.init();
});