// =================================================================
// FILE: templates/f4-number-sorting-templates.js - HTML模板系統
// =================================================================

const NumberSortingTemplates = {
    /**
     * 設定頁面模板（匹配歡迎畫面樣式）
     */
    settingsScreen(config) {
        return `
            <div class="unit-welcome">
                <div class="welcome-content">
                    <h1>${config.gameTitle}</h1>
                    <div class="welcome-description">
                        <p>選擇遊戲設定後開始測驗</p>
                    </div>
                    
                    <div class="game-settings">
                        ${this.generateSettingGroup('difficulty', '🎯 難度選擇', config.difficultyOptions)}
                        ${this.generateSettingGroup('numberRange', '📊 數字範圍', config.numberRangeOptions)}
                        ${this.generateSettingGroup('questionCount', '📋 題目數量', config.questionCountOptions)}
                        ${this.generateSettingGroup('time', '⏰ 時間限制', config.timeOptions)}
                        ${this.generateSettingGroup('sound', '🔊 音效設定', config.soundOptions)}
                    </div>
                    
                    <div class="game-buttons">
                        <button class="back-btn" onclick="window.location.href='../index.html'">返回主選單</button>
                        <button id="start-game-btn" class="start-btn" disabled>
                            請完成所有設定
                        </button>
                    </div>
                </div>
                
                ${this.customRangeModal()}
            </div>
        `;
    },

    /**
     * 遊戲頁面模板（匹配原版結構）
     */
    gameScreen(config) {
        return `
            <div class="number-sorting-container difficulty-${config.difficulty}">
                <!-- 標題欄（匹配原版title-bar樣式） -->
                <div class="header-section">
                    <div class="title-bar-left">
                        <button class="back-to-menu-btn" onclick="Game.init()">返回設定</button>
                    </div>
                    <div class="title-bar-center">
                        <h1 class="game-title">${config.levelTitle}</h1>
                    </div>
                    <div class="title-bar-right">
                        <div class="game-info">
                            <div class="info-item">
                                <div class="info-label">進度</div>
                                <div class="info-value" id="progress-info">${config.currentLevel}/${config.totalLevels}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">分數</div>
                                <div class="info-value" id="score-info">${config.score}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">時間</div>
                                <div class="info-value" id="timer-info">${config.timeDisplay}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 遊戲區域（匹配統一任務框架） -->
                <div class="game-section">
                    <h3 class="section-title" id="instruction-title">🎯 請將數字由小到大排序</h3>
                    
                    <div id="number-container" class="number-container"></div>
                    <div id="answer-container" class="answer-container"></div>
                    
                    <div class="control-section">
                        <div id="message-area" class="message-area"></div>
                        <div id="confirm-container" class="confirm-container"></div>
                    </div>
                </div>
                
                <div class="fireworks-container" id="fireworks-container"></div>
                
                ${this.pauseOverlay()}
            </div>
        `;
    },

    /**
     * 困難模式遊戲頁面模板（輸入模式）
     */
    hardModeGameScreen(config) {
        return `
            <div class="number-sorting-container difficulty-${config.difficulty}">
                <!-- 標題欄（匹配原版title-bar樣式） -->
                <div class="header-section">
                    <div class="title-bar-left">
                        <button class="back-to-menu-btn" onclick="Game.init()">返回設定</button>
                    </div>
                    <div class="title-bar-center">
                        <h1 class="game-title">${config.levelTitle}</h1>
                    </div>
                    <div class="title-bar-right">
                        <div class="game-info">
                            <div class="info-item">
                                <div class="info-label">進度</div>
                                <div class="info-value" id="progress-info">${config.currentLevel}/${config.totalLevels}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">分數</div>
                                <div class="info-value" id="score-info">${config.score}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">時間</div>
                                <div class="info-value" id="timer-info">${config.timeDisplay}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 困難模式專用遊戲區域 -->
                <div class="game-section">
                    <h3 class="section-title" id="instruction-title">🎯 請將數字由小到大排序</h3>
                    
                    <div id="instruction-area" class="instruction-area">
                        <div class="instruction-content" style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 20px 40px; min-height: 60px;">
                            <div id="instruction-text" class="instruction-text" style="flex: 1; text-align: center; font-weight: bold; font-size: 1.2em;"></div>
                            <div class="instruction-actions" style="display: flex; gap: 15px;">
                                <button id="play-numbers-btn" class="action-button-group" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 2px solid #007bff; border-radius: 25px; background-color: #f8f9fa; cursor: pointer; font-size: 14px; font-weight: 600; color: #007bff;">
                                    <span>唸出題目數字</span>
                                    <span style="font-size: 18px;">🔊</span>
                                </button>
                                <button id="show-answer-btn" class="action-button-group" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 2px solid #ffc107; border-radius: 25px; background-color: #f8f9fa; cursor: pointer; font-size: 14px; font-weight: 600; color: #ffc107;">
                                    <span>提示</span>
                                    <span style="font-size: 18px;">💡</span>
                                </button>
                            </div>
                        </div>
                        
                        <style>
                        .action-button-group:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        }
                        
                        .modal-close-btn:hover {
                            background-color: #c0392b !important;
                            transform: scale(1.1);
                        }
                        
                        @media (max-width: 768px) {
                            .instruction-content {
                                flex-direction: column !important;
                                padding: 15px 10px !important;
                                min-height: auto !important;
                                gap: 15px;
                            }
                            
                            .instruction-actions {
                                flex-wrap: wrap;
                                justify-content: center;
                            }
                            
                            .action-button-group {
                                font-size: 12px !important;
                                padding: 6px 10px !important;
                            }
                            
                            .action-button-group span:last-child {
                                font-size: 16px !important;
                            }
                            
                            #instruction-text {
                                font-size: 1em !important;
                            }
                        }
                        
                        @media (max-width: 480px) {
                            .instruction-content {
                                padding: 10px 5px !important;
                                gap: 10px;
                            }
                            
                            .instruction-actions {
                                flex-direction: column;
                                align-items: center;
                                gap: 10px;
                            }
                            
                            .action-button-group {
                                width: 100%;
                                max-width: 200px;
                                justify-content: center;
                                font-size: 11px !important;
                                padding: 8px 12px !important;
                            }
                            
                            #instruction-text {
                                font-size: 0.9em !important;
                            }
                        }
                        </style>
                    </div>
                    
                    <div id="input-container" class="input-container">
                        <h3 class="section-title">✏️ 請點擊空白框輸入數字</h3>
                        <div id="input-slots" class="input-slots"></div>
                    </div>
                    
                    <div class="control-section">
                        <div id="message-area" class="message-area"></div>
                        <div id="submit-container" class="submit-container"></div>
                    </div>
                </div>
                
                <div class="fireworks-container" id="fireworks-container"></div>
                
                ${this.numberSelectorModal()}
                ${this.pauseOverlay()}
            </div>
        `;
    },

    /**
     * 結果頁面模板（匹配原版樣式）
     */
    resultsScreen(config) {
        return `
            <div class="game-complete">
                <div class="result-card">
                    <div class="results-header">
                        <div class="trophy-icon">${config.trophy}</div>
                        <h1>${config.title}</h1>
                    </div>
                    
                    <div class="achievement-message">
                        <p>${config.message}</p>
                    </div>
                    
                    <div class="final-stats">
                        <div class="stat-item">
                            <div class="stat-label">最終分數</div>
                            <div class="stat-value">${config.score}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">完成時間</div>
                            <div class="stat-value">${config.timeUsed}</div>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="start-btn" onclick="Game.startGame()">🔄 再玩一次</button>
                        <button class="back-to-main-btn" onclick="Game.init()">🏠 返回設定</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 設定選項群組模板
     */
    generateSettingGroup(type, label, options) {
        return `
            <div class="setting-group">
                <label class="setting-label">${label}</label>
                <div class="button-group" data-setting-type="${type}">
                    ${options.map(option => `
                        <button class="selection-btn" 
                                data-type="${type}" 
                                data-value="${option.value}"
                                ${option.active ? 'class="selection-btn active"' : ''}>
                            ${option.label}
                        </button>
                    `).join('')}
                </div>
                ${type === 'numberRange' ? '<div id="custom-range-display" class="custom-display"></div>' : ''}
            </div>
        `;
    },

    /**
     * 數字方塊模板
     */
    numberBox(number) {
        return `
            <div class="number-box" data-value="${number}" draggable="true">
                ${number}
                <div class="check-mark">✓</div>
            </div>
        `;
    },

    /**
     * 插槽模板
     */
    slot(position, showHint = false, hintNumber = '') {
        return `
            <div class="slot" data-position="${position}">
                ${showHint ? `<span class="slot-hint">${hintNumber}</span>` : ''}
            </div>
        `;
    },

    /**
     * 確認按鈕模板
     */
    confirmButton() {
        return `<button id="confirm-btn" class="confirm-btn">確認答案</button>`;
    },

    /**
     * 自訂範圍模態框模板
     */
    customRangeModal() {
        return `
            <div class="modal-overlay" id="custom-range-modal">
                <div class="modal-content">
                    <div class="modal-title">🔢 自訂數字範圍</div>
                    
                    <div class="input-group">
                        <label for="start-number">起始數字：</label>
                        <input type="number" id="start-number" min="1" max="999" value="1" 
                               placeholder="請輸入起始數字">
                    </div>
                    
                    <div class="input-group">
                        <label for="end-number">結束數字：</label>
                        <input type="number" id="end-number" min="1" max="999" value="20" 
                               placeholder="請輸入結束數字">
                    </div>
                    
                    <div class="input-group">
                        <label for="numbers-per-level">每題數字數量：</label>
                        <input type="number" id="numbers-per-level" min="3" max="15" value="7" 
                               placeholder="每題要排序的數字數量">
                    </div>
                    
                    <div class="input-group">
                        <label>數列類型：</label>
                        <div class="radio-group">
                            <label class="radio-option">
                                <input type="radio" name="sequence-type" value="consecutive" checked>
                                <span>連續數列</span>
                                <small>數字連續排列（如：1,2,3,4,5）</small>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="sequence-type" value="nonConsecutive">
                                <span>非連續數列</span>
                                <small>數字隨機選取（如：1,3,6,8,9）</small>
                            </label>
                        </div>
                    </div>
                    
                    <div class="modal-buttons">
                        <button class="modal-btn secondary" onclick="Game.closeCustomRangeModal()">取消</button>
                        <button class="modal-btn primary" onclick="Game.confirmCustomRange()">確認</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 數字選擇器模態框模板
     */
    numberSelectorModal() {
        return `
            <div class="modal-overlay" id="number-selector-modal">
                <div class="modal-content number-selector-content">
                    <div class="position-header">
                        <div class="position-info" id="position-info">請輸入第 1 個位置的數字</div>
                        <button class="close-btn" onclick="Game.closeNumberSelector()">×</button>
                    </div>
                    
                    <div class="current-input-display" id="current-input-display"></div>
                    
                    <div class="number-keypad">
                        <button class="keypad-btn" data-number="1">1</button>
                        <button class="keypad-btn" data-number="2">2</button>
                        <button class="keypad-btn" data-number="3">3</button>
                        <button class="keypad-btn clear-btn" data-action="clear">清除</button>
                        
                        <button class="keypad-btn" data-number="4">4</button>
                        <button class="keypad-btn" data-number="5">5</button>
                        <button class="keypad-btn" data-number="6">6</button>
                        <button class="keypad-btn backspace-btn" data-action="backspace">⌫</button>
                        
                        <button class="keypad-btn" data-number="7">7</button>
                        <button class="keypad-btn" data-number="8">8</button>
                        <button class="keypad-btn" data-number="9">9</button>
                        <button class="keypad-btn confirm-btn" data-action="confirm">確認</button>
                        
                        <button class="keypad-btn zero-btn" data-number="0">0</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 數字序列語音播放模態框
     */
    numberSequenceModal(numbersToRead, instructionText) {
        // 判斷是否為答案提示
        const isHint = instructionText.includes('💡 答案提示');
        const modalIcon = isHint ? '💡' : '🔢';
        const modalTitle = isHint ? '答案提示' : '聽取數字序列';
        
        return `
            <div class="modal-overlay voice-playback-modal" id="voice-playback-modal">
                <div class="modal-content voice-playback-content ${isHint ? 'hint-modal' : ''}" style="position: relative;">
                    <button id="close-modal-btn" class="modal-close-btn" style="position: absolute; top: 10px; left: 10px; width: 30px; height: 30px; border: none; border-radius: 50%; background-color: #e74c3c; color: white; font-size: 20px; font-weight: bold; cursor: pointer; z-index: 1000;">&times;</button>
                    <div class="voice-modal-header" style="padding-top: 20px;">
                        <div class="voice-icon">${modalIcon}</div>
                        <h3 class="voice-modal-title">${modalTitle}</h3>
                    </div>
                    
                    <div class="voice-modal-body">
                        <div class="instruction-display">
                            <p class="instruction-text">${instructionText}</p>
                        </div>
                        
                        <div class="numbers-display">
                            <div class="numbers-container" id="voice-numbers-container">
                                ${numbersToRead.split('，').map((num, index) => 
                                    `<span class="number-item" data-index="${index}">${num}</span>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="voice-status">
                            <div class="voice-animation">
                                <div class="sound-wave">
                                    <div class="wave-bar"></div>
                                    <div class="wave-bar"></div>
                                    <div class="wave-bar"></div>
                                    <div class="wave-bar"></div>
                                    <div class="wave-bar"></div>
                                </div>
                            </div>
                            <p class="voice-status-text">🔊 正在播放數字序列...</p>
                        </div>
                    </div>
                    
                    <div class="voice-modal-footer">
                        <div class="progress-indicator">
                            <div class="progress-bar" id="voice-progress-bar"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 暫停覆蓋層模板
     */
    pauseOverlay() {
        return `
            <div class="pause-overlay" id="pause-overlay">
                <div class="pause-menu">
                    <h2>遊戲暫停</h2>
                    <div class="pause-buttons">
                        <button onclick="Game.resumeGame()">繼續遊戲</button>
                        <button onclick="Game.resetGame()">重新開始</button>
                    </div>
                </div>
            </div>
        `;
    }
};

// 導出模板系統
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NumberSortingTemplates;
} else {
    window.NumberSortingTemplates = NumberSortingTemplates;
}