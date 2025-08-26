// =================================================================
// FILE: js/f4_number_sorting.js - F4數字排序完整程式（完整合併版）
// =================================================================
//
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

// =====================================================
// 🎯 配置驅動系統
// =====================================================

/**
 * 遊戲配置中心 - 所有設定都通過配置驅動
 */
const NumberSortingConfig = {
    // =====================================================
    // 🎯 遊戲基本配置
    // =====================================================
    game: {
        title: "🔢 數字排序",
        version: "2.0.0",
        author: "配置驅動版本"
    },

    // =====================================================
    // 🎨 難度配置
    // =====================================================
    difficulties: {
        easy: {
            id: 'easy',
            label: '簡單 (提示與鎖定)',
            description: '顯示數字提示，正確答案會自動鎖定',
            showHints: true,
            autoLock: true,
            instantFeedback: true,
            speechFeedback: true,
            shuffleNumbers: true, // 【新增】簡單模式也要打亂數字
            colors: {
                primary: '#28a745',
                secondary: '#20c997',
                slot: '#28a745',
                slotBackground: 'rgba(40, 167, 69, 0.1)'
            },
            timing: {
                feedbackDelay: 100,
                nextQuestionDelay: 1000,
                speechDelay: 300
            },
            scoring: {
                correctAnswer: 10,
                perfectLevel: 50
            },
            // 語音模板配置
            speechTemplates: {
                levelComplete: '太棒了，你答對了！',
                complete: '恭喜完成所有題目！'
            }
        },
        normal: {
            id: 'normal',
            label: '普通 (手動確認)',
            description: '需要手動確認答案，提供即時回饋',
            showHints: false,
            autoLock: false,
            instantFeedback: false,
            requireConfirmation: true,
            speechFeedback: true,
            shuffleNumbers: true, // 【新增】普通模式也要打亂數字
            colors: {
                primary: '#007bff',
                secondary: '#0056b3',
                slot: '#007bff',
                slotBackground: 'rgba(0, 123, 255, 0.1)'
            },
            timing: {
                feedbackDelay: 500,
                nextQuestionDelay: 2000,
                wrongAnswerDelay: 2000,
                speechDelay: 300
            },
            scoring: {
                correctAnswer: 15,
                perfectLevel: 75
            },
            // 語音模板配置
            speechTemplates: {
                correct: '太棒了，你答對了！',
                incorrect: '對不起，有錯誤喔，請再試一次。',
                incorrectSingle: '對不起有錯誤，進入下一題。', // 單次作答錯誤語音
                complete: '恭喜完成所有題目！'
            }
        },
        hard: {
            id: 'hard',
            label: '困難 (輸入模式)',
            description: '無拖拽提示，需點擊輸入數字排序',
            showHints: false,
            autoLock: false,
            instantFeedback: false,
            requireConfirmation: true,
            inputMode: true,
            speechFeedback: true,
            colors: {
                primary: '#dc3545',
                secondary: '#c82333',
                slot: '#dc3545',
                slotBackground: 'rgba(220, 53, 69, 0.1)'
            },
            timing: {
                feedbackDelay: 1000,
                nextQuestionDelay: 3000,
                wrongAnswerDelay: 3000,
                speechDelay: 300
            },
            scoring: {
                correctAnswer: 20,
                perfectLevel: 100
            },
            // 語音模板配置
            speechTemplates: {
                instruction: '{instruction}', // 動態指令內容
                correct: '太棒了，你答對了！',
                incorrect: '對不起，有錯誤喔，請再試一次。',
                incorrectSingle: '對不起有錯誤，進入下一題。', // 單次作答錯誤語音
                complete: '恭喜完成所有題目！'
            }
        }
    },

    // =====================================================
    // 📊 數字範圍配置
    // =====================================================
    numberRanges: {
        '1-10': {
            id: '1-10',
            label: '1-10',
            description: '基礎數字認知',
            startNumber: 1,
            endNumber: 10,
            levels: 1,
            numbersPerLevel: 10
        },
        '1-20': {
            id: '1-20',
            label: '1-20',
            description: '進階數字順序',
            startNumber: 1,
            endNumber: 20,
            levels: 2,
            numbersPerLevel: 10
        },
        '1-50': {
            id: '1-50',
            label: '1-50',
            description: '中等範圍挑戰',
            startNumber: 1,
            endNumber: 50,
            levels: 5,
            numbersPerLevel: 10
        },
        '1-100': {
            id: '1-100',
            label: '1-100',
            description: '完整百數表',
            startNumber: 1,
            endNumber: 100,
            levels: 10,
            numbersPerLevel: 10
        },
        custom: {
            id: 'custom',
            label: '自訂範圍',
            description: '自由設定數字範圍',
            customizable: true,
            defaultConfig: {
                startNumber: 1,
                endNumber: 20,
                numbersPerLevel: 10
            }
        }
    },

    // =====================================================
    // 📋 排序數量配置
    // =====================================================
    sortingCounts: {
        5: {
            id: '5',
            label: '5個數字',
            description: '每題排序5個數字',
            value: 5
        },
        10: {
            id: '10',
            label: '10個數字',
            description: '每題排序10個數字',
            value: 10
        },
        15: {
            id: '15',
            label: '15個數字',
            description: '每題排序15個數字',
            value: 15
        },
        20: {
            id: '20',
            label: '20個數字',
            description: '每題排序20個數字',
            value: 20
        },
        custom: {
            id: 'custom',
            label: '自訂',
            description: '自由設定排序數量',
            customizable: true,
            defaultValue: 10
        }
    },

    // =====================================================
    // ⏰ 時間限制配置
    // =====================================================
    timeLimits: {
        none: {
            id: 'none',
            label: '無限制',
            description: '不限制完成時間',
            value: null,
            showTimer: false,
            order: 1
        },
        300: {
            id: '300',
            label: '300秒',
            description: '寬鬆時間限制',
            value: 300,
            showTimer: true,
            warningTime: 60,
            order: 2
        },
        120: {
            id: '120',
            label: '120秒',
            description: '標準時間限制',
            value: 120,
            showTimer: true,
            warningTime: 30,
            order: 3
        },
        60: {
            id: '60',
            label: '60秒',
            description: '快速挑戰模式',
            value: 60,
            showTimer: true,
            warningTime: 10,
            order: 4
        }
    },

    // =====================================================
    // 📝 測驗模式配置
    // =====================================================
    testModes: {
        retry: {
            id: 'retry',
            label: '反複練習',
            description: '答錯時可以重新作答，適合學習模式',
            allowRetry: true,
            showCorrectAnswer: false
        },
        single: {
            id: 'single',
            label: '單次作答',
            description: '每題只能作答一次，答錯會顯示正確答案',
            allowRetry: false,
            showCorrectAnswer: true
        }
    },

    // =====================================================
    // 🔊 音效配置
    // =====================================================
    soundSettings: {
        on: {
            id: 'on',
            label: '開啟音效',
            description: '播放遊戲音效和語音提示',
            enabled: true,
            sounds: {
                select: 'audio/select.mp3',
                correct: 'audio/correct.mp3',
                incorrect: 'audio/error.mp3',
                success: 'audio/success.mp3',
                click: 'audio/click.mp3'
            }
        },
        off: {
            id: 'off',
            label: '關閉音效',
            description: '靜音模式',
            enabled: false,
            sounds: {}
        }
    },

    // =====================================================
    // 🔧 輔助方法
    // =====================================================
    
    /**
     * 獲取難度配置
     */
    getDifficultyConfig(difficultyId) {
        return this.difficulties[difficultyId] || this.difficulties.normal;
    },

    /**
     * 獲取數字範圍配置
     */
    getNumberRangeConfig(rangeId) {
        return this.numberRanges[rangeId] || this.numberRanges['1-10'];
    },

    /**
     * 獲取時間限制配置
     */
    getTimeLimitConfig(timeId) {
        return this.timeLimits[timeId] || this.timeLimits.none;
    },

    /**
     * 獲取排序數量配置
     */
    getSortingCountConfig(countId) {
        return this.sortingCounts[countId] || this.sortingCounts[10];
    },

    /**
     * 獲取音效配置
     */
    getSoundConfig(soundId) {
        return this.soundSettings[soundId] || this.soundSettings.on;
    },

    /**
     * 獲取完整遊戲配置
     */
    getGameConfig(settings) {
        return {
            difficulty: this.getDifficultyConfig(settings.difficulty),
            numberRange: this.getNumberRangeConfig(settings.numberRange),
            sortingCount: this.getSortingCountConfig(settings.sortingCount),
            timeLimit: this.getTimeLimitConfig(settings.time),
            sound: this.getSoundConfig(settings.sound)
        };
    },

    /**
     * 驗證設定完整性
     */
    validateSettings(settings) {
        const required = ['difficulty', 'numberRange', 'sortingCount', 'time', 'testMode', 'sound'];
        return required.every(key => settings[key] !== null && settings[key] !== undefined);
    },

    /**
     * 獲取設定選項列表
     */
    getSettingOptions(category) {
        const configs = {
            difficulty: this.difficulties,
            numberRange: this.numberRanges,
            sortingCount: this.sortingCounts,
            time: this.timeLimits,
            testMode: this.testModes,
            sound: this.soundSettings
        };
        
        const categoryConfig = configs[category];
        if (!categoryConfig) return [];
        
        let options = Object.values(categoryConfig).map(config => ({
            value: config.id,
            label: config.label,
            description: config.description,
            order: config.order || 0
        }));
        
        // 如果有order屬性，則按order排序
        if (options.some(option => option.order > 0)) {
            options.sort((a, b) => a.order - b.order);
        }
        
        return options;
    }
};

// =====================================================
// 🎨 HTML模板系統
// =====================================================

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
                        ${this.generateSettingGroup('sortingCount', '📋 排序數量', config.sortingCountOptions)}
                        ${this.generateSettingGroup('time', '⏰ 時間限制', config.timeOptions)}
                        ${this.generateSettingGroup('testMode', '📝 測驗模式', config.testModeOptions)}
                        ${this.generateSettingGroup('sound', '🔊 音效設定', config.soundOptions)}
                    </div>
                    
                    <div class="game-buttons">
                        <button class="back-btn" onclick="window.location.href='index.html'">返回主選單</button>
                        <button id="start-game-btn" class="start-btn" disabled>
                            請完成所有設定
                        </button>
                    </div>
                </div>
                
                ${this.customRangeModal()}
                ${this.customSortingCountModal()}
            </div>
        `;
    },

    /**
     * 困難模式遊戲頁面模板（輸入模式）
     */
    hardModeGameScreen(config) {
        return `
            <div class="number-sorting-container difficulty-${config.difficulty}">
                <!-- 標題欄（修正布局：左側題號、中間指示、右側返回） -->
                <div class="header-section">
                    <div class="title-bar-left">
                        <h1 class="game-title">${config.levelTitle}</h1>
                    </div>
                    <div class="title-bar-center">
                        <h3 class="section-title" id="instruction-title" style="margin: 0; color: #333;">🎯 請將數字由小到大排序</h3>
                    </div>
                    <div class="title-bar-right">
                        <button class="back-to-menu-btn" onclick="Game.init()">返回設定</button>
                    </div>
                </div>
                
                <!-- 困難模式專用遊戲區域 -->
                <div class="game-section">
                    
                    <div id="instruction-area" class="instruction-area">
                        <div class="instruction-content" style="position: relative; display: flex; justify-content: center; align-items: center; width: 100%; padding: 10px 25px; min-height: 60px; background-color: #f8f9fa; border-radius: 50px; box-sizing: border-box;">
                            
                            <div style="position: relative; display: flex; justify-content: center; align-items: center;">
                                
                                <div style="position: absolute; right: 100%; margin-right: 15px; white-space: nowrap;">
                                    <button id="play-numbers-btn" class="action-button-group" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 2px solid #007bff; border-radius: 25px; background-color: #ffffff; cursor: pointer; font-size: 14px; font-weight: 600; color: #007bff;">
                                        <span>唸出題目數字</span>
                                        <span style="font-size: 18px;">🔊</span>
                                    </button>
                                </div>

                                <div id="instruction-text" class="instruction-text" style="font-weight: bold; font-size: 1.2em;"></div>

                            </div>
                            
                            <div class="instruction-actions" style="position: absolute; right: 25px; top: 50%; transform: translateY(-50%);">
                                <button id="show-answer-btn" class="action-button-group" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 2px solid #ffc107; border-radius: 25px; background-color: #ffffff; cursor: pointer; font-size: 14px; font-weight: 600; color: #ffc107;">
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
                            /* 在小螢幕上簡化佈局，改為垂直排列 */
                            .instruction-content {
                                flex-direction: column !important;
                                padding: 15px 10px !important;
                                min-height: auto !important;
                                gap: 15px;
                                border-radius: 20px !important;
                            }

                            .instruction-content > div {
                                position: static !important;
                                transform: none !important;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                gap: 10px;
                            }
                            
                            .instruction-content > div > div {
                                position: static !important;
                                margin: 0 !important;
                            }
                            
                            .instruction-actions {
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
                                text-align: center;
                            }
                        }
                        
                        @media (max-width: 480px) {
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
     * 遊戲頁面模板（匹配原版結構）
     */
    gameScreen(config) {
        return `
            <div class="number-sorting-container difficulty-${config.difficulty}">
                <!-- 標題欄（修正布局：左側題號、中間指示、右側返回） -->
                <div class="header-section">
                    <div class="title-bar-left">
                        <h1 class="game-title">${config.levelTitle}</h1>
                    </div>
                    <div class="title-bar-center">
                        <h3 class="section-title" id="instruction-title" style="margin: 0; color: #333;">🎯 請將數字由小到大排序</h3>
                    </div>
                    <div class="title-bar-right">
                        <div class="game-info" style="display: flex; align-items: center; gap: 15px; margin-right: 15px;">
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
                        <button class="back-to-menu-btn" onclick="Game.init()">返回設定</button>
                    </div>
                </div>
                
                <!-- 遊戲區域（匹配統一任務框架） -->
                <div class="game-section">
                    
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
        // 簡化版本 - 現在使用數字輸入器代替表單輸入
        return `
            <!-- 自訂範圍現在使用數字輸入器，不再需要這個模態框 -->
        `;
    },

    /**
     * 自訂排序數量數字輸入器模態框模板
     */
    customSortingCountModal() {
        return `
            <div class="modal-overlay" id="custom-sorting-count-modal">
                <div class="modal-content number-selector-content">
                    <div class="position-header">
                        <div class="position-info" id="sorting-count-info">📋 請設定排序數量 (3-20)</div>
                        <button class="close-btn" onclick="Game.closeSortingCountSelector()">&times;</button>
                    </div>
                    
                    <div class="current-input-display" id="sorting-count-display"></div>
                    
                    <div class="number-keypad">
                        <button class="keypad-btn" data-number="1">1</button>
                        <button class="keypad-btn" data-number="2">2</button>
                        <button class="keypad-btn" data-number="3">3</button>
                        <button class="keypad-btn clear-btn" data-action="clear">清除</button>
                        
                        <button class="keypad-btn" data-number="4">4</button>
                        <button class="keypad-btn" data-number="5">5</button>
                        <button class="keypad-btn" data-number="6">6</button>
                        <button class="keypad-btn backspace-btn" data-action="backspace">後退</button>
                        
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
     * 數字選擇器模態框模板
     */
    numberSelectorModal() {
        return `
            <div class="modal-overlay" id="number-selector-modal">
                <div class="modal-content number-selector-content">
                    <div class="position-header">
                        <div class="position-info" id="position-info">請輸入第 1 個位置的數字</div>
                        <button class="close-btn" onclick="Game.closeNumberSelector()">&times;</button>
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

        // 處理提示文字的多行顯示
        const hintTitle = '💡 答案提示：';
        const hintNumbers = isHint ? instructionText.replace(hintTitle, '').trim() : '';
        
        return `
            <div class="modal-overlay voice-playback-modal" id="voice-playback-modal">
                <div class="modal-content voice-playback-content ${isHint ? 'hint-modal' : ''}" style="position: relative;">
                    <button id="close-modal-btn" class="modal-close-btn" style="position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border: none; border-radius: 50%; background-color: #e74c3c; color: white; font-size: 20px; font-weight: bold; cursor: pointer; z-index: 1000;">&times;</button>
                    <div class="voice-modal-header" style="padding-top: 20px;">
                        <div class="voice-icon">${modalIcon}</div>
                        <h3 class="voice-modal-title">${modalTitle}</h3>
                    </div>
                    
                    <div class="voice-modal-body">
                        <div class="instruction-display">
                            ${isHint ? `
                                <p class="instruction-text" style="margin-bottom: 0; text-align: center;">${hintTitle}</p>
                                <p class="instruction-text" style="margin-top: 8px; font-weight: normal; text-align: center;">${hintNumbers}</p>
                            ` : `
                                <p class="instruction-text">${instructionText}</p>
                            `}
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

// 全域遊戲物件
let Game;

document.addEventListener('DOMContentLoaded', () => {
    Game = {
        // =====================================================
        // 🐛 Debug System - 配置驅動除錯系統
        // =====================================================
        Debug: {
            enabled: true, // 設為 false 可關閉所有 debug 訊息
            logPrefix: '[F4-數字排序]',
            
            log(category, message, data = null) {
                if (!this.enabled) return;
                const timestamp = new Date().toLocaleTimeString();
                console.log(`${this.logPrefix}[${category}] ${timestamp}: ${message}`, data || '');
            },
            
            logGameFlow(action, data = null) { this.log('遊戲流程', action, data); },
            logSpeech(action, text) { this.log('語音系統', action, { text }); },
            logUserAction(action, data = null) { this.log('使用者行為', action, data); },
            logDragDrop(message, data) { this.log('拖拽系統', message, data); },
            logAudio(message, data) { this.log('音效系統', message, data); },
            logConfig(message, data) { this.log('配置系統', message, data); }
        },

        // =====================================================
        // 🎮 遊戲狀態管理
        // =====================================================
        state: {
            currentLevel: 1,
            totalLevels: 1,
            score: 0,
            timeRemaining: null,
            isPaused: false,
            isChecking: false,
            startTime: null,
            timerInterval: null,
            currentNumbers: [],
            correctOrder: [],
            draggedElement: null,
            
            // 設定狀態
            settings: {
                difficulty: null,
                numberRange: null,
                sortingCount: null,
                time: null,
                testMode: null,
                sound: null
            },
            
            // 遊戲模式設定（預設連續數列）
            gameMode: {
                isConsecutive: true // 預設為連續數列
            },
            
            // 自訂範圍設定
            customRange: {
                startNumber: 1,
                endNumber: 20,
                numbersPerLevel: 10,
                totalLevels: 1
            },
            
            // 自訂排序數量設定
            customSortingCount: 10
        },

        // =====================================================
        // 🎨 UI元素管理
        // =====================================================
        elements: {
            app: null,
            gameTitle: null,
            numberContainer: null,
            answerContainer: null,
            confirmContainer: null,
            messageArea: null,
            progressInfo: null,
            scoreInfo: null,
            timerInfo: null,
            pauseOverlay: null,
            fireworksContainer: null
        },

        // =====================================================
        // 🚀 初始化系統
        // =====================================================
        init() {
            this.Debug.logGameFlow('遊戲系統初始化開始');
            this.initElements();
            this.Speech.init();
            this.showSettings();
            this.Debug.logGameFlow('遊戲系統初始化完成');
        },

        initElements() {
            this.elements.app = document.getElementById('app');
            if (!this.elements.app) {
                console.error('找不到 #app 元素');
                return;
            }
        },

        // =====================================================
        // ⚙️ 設定頁面系統
        // =====================================================
        showSettings() {
            this.Debug.logGameFlow('顯示設定頁面');
            
            const config = {
                gameTitle: NumberSortingConfig.game.title,
                difficultyOptions: this.getOptionsWithState('difficulty'),
                numberRangeOptions: this.getOptionsWithState('numberRange'),
                sortingCountOptions: this.getOptionsWithState('sortingCount'),
                timeOptions: this.getOptionsWithState('time'),
                testModeOptions: this.getOptionsWithState('testMode'),
                soundOptions: this.getOptionsWithState('sound')
            };
            
            this.elements.app.innerHTML = NumberSortingTemplates.settingsScreen(config);
            this.bindSettingsEvents();
            this.updateStartButton();
        },

        getOptionsWithState(category) {
            const options = NumberSortingConfig.getSettingOptions(category);
            const currentValue = this.state.settings[category];
            
            return options.map(option => ({
                ...option,
                active: option.value === currentValue
            }));
        },

        bindSettingsEvents() {
            // 設定選擇事件（修復選擇器）
            const settingsForm = this.elements.app.querySelector('.game-settings');
            if (settingsForm) {
                settingsForm.addEventListener('click', this.handleSettingSelection.bind(this));
            }

            // 開始遊戲按鈕
            const startButton = document.getElementById('start-game-btn');
            if (startButton) {
                startButton.addEventListener('click', this.startGame.bind(this));
            }
        },

        handleSettingSelection(event) {
            const button = event.target.closest('.selection-btn');
            if (!button) return;

            const { type, value } = button.dataset;
            this.Debug.logUserAction(`選擇設定: ${type} = ${value}`);

            // 播放選擇音效
            this.playSelectSound();

            // 特殊處理自訂範圍
            if (type === 'numberRange' && value === 'custom') {
                this.showCustomRangeModal();
                return;
            }

            // 特殊處理自訂排序數量
            if (type === 'sortingCount' && value === 'custom') {
                this.showCustomSortingCountModal();
                return;
            }

            // 更新設定
            this.updateSetting(type, value);
            
            // 更新UI狀態
            this.updateSettingButtons(type, value);
            this.updateStartButton();
        },

        updateSetting(type, value) {
            this.state.settings[type] = value;
            this.Debug.logConfig(`設定更新: ${type} = ${value}`, this.state.settings);
        },

        updateSettingButtons(type, selectedValue) {
            const buttonGroup = this.elements.app.querySelector(`[data-setting-type="${type}"]`);
            if (!buttonGroup) return;

            buttonGroup.querySelectorAll('.selection-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.value === selectedValue);
            });
        },

        updateStartButton() {
            const startButton = document.getElementById('start-game-btn');
            if (!startButton) return;

            const allSettingsComplete = NumberSortingConfig.validateSettings(this.state.settings);
            
            startButton.disabled = !allSettingsComplete;
            startButton.textContent = allSettingsComplete ? '開始遊戲' : '請完成所有設定';
            startButton.className = allSettingsComplete ? 'start-btn' : 'start-btn disabled';
        },

        // =====================================================
        // 🎯 自訂範圍系統
        // =====================================================
        showCustomRangeModal() {
            this.Debug.logGameFlow('顯示自訂範圍設定（數字輸入器模式）');
            
            // 步驟1：輸入起始數字
            this.showStartNumberInput();
        },
        
        /**
         * 顯示起始數字輸入器
         */
        showStartNumberInput() {
            this.Debug.logGameFlow('顯示起始數字輸入器');
            
            this.showNumberInput(
                '🔢 輸入起始數字 (1-999)',
                (startNumber) => {
                    this.Debug.logUserAction(`起始數字輸入: ${startNumber}`);
                    
                    // 驗證起始數字
                    if (startNumber < 1 || startNumber > 999) {
                        alert('起始數字必須在 1-999 之間！');
                        this.showStartNumberInput(); // 重新輸入
                        return;
                    }
                    
                    // 儲存起始數字
                    this.state.tempCustomRange = {
                        startNumber: startNumber
                    };
                    
                    // 進入結束數字輸入
                    this.showEndNumberInput();
                },
                () => {
                    // 取消回調
                    this.Debug.logUserAction('取消起始數字輸入');
                }
            );
        },
        
        /**
         * 顯示結束數字輸入器
         */
        showEndNumberInput() {
            const startNumber = this.state.tempCustomRange.startNumber;
            this.Debug.logGameFlow(`顯示結束數字輸入器（起始: ${startNumber}）`);
            
            this.showNumberInput(
                `🔢 輸入結束數字 (>${startNumber})`,
                (endNumber) => {
                    this.Debug.logUserAction(`結束數字輸入: ${endNumber}`);
                    
                    // 驗證結束數字
                    if (endNumber <= startNumber) {
                        alert(`結束數字必須大於起始數字 ${startNumber}！`);
                        this.showEndNumberInput(); // 重新輸入
                        return;
                    }
                    
                    if (endNumber > 999) {
                        alert('結束數字不能超過 999！');
                        this.showEndNumberInput(); // 重新輸入
                        return;
                    }
                    
                    // 完成範圍設定
                    this.confirmCustomRange(startNumber, endNumber);
                },
                () => {
                    // 取消回調 - 返回起始數字輸入
                    this.Debug.logUserAction('取消結束數字輸入，返回起始數字輸入');
                    this.showStartNumberInput();
                }
            );
        },
        
        /**
         * 確認自訂範圍設定
         */
        confirmCustomRange(startNumber, endNumber) {
            this.Debug.logConfig('確認自訂範圍設定', { startNumber, endNumber });
            
            // 計算範圍大小和預設每題數字數量
            const totalNumbers = endNumber - startNumber + 1;
            const defaultNumbersPerLevel = Math.min(10, totalNumbers); // 預設10個，但不超過範圍
            
            // 更新自訂範圍狀態
            this.state.customRange = {
                startNumber: startNumber,
                endNumber: endNumber,
                numbersPerLevel: defaultNumbersPerLevel,
                isConsecutive: true // 預設為連續數列
            };
            
            // 更新設定
            this.updateSetting('numberRange', 'custom');
            this.updateSettingButtons('numberRange', 'custom');
            this.updateCustomRangeDisplay();
            this.updateStartButton();
            
            this.Debug.logConfig('自訂範圍設定完成', this.state.customRange);
        },

        closeCustomRangeModal() {
            // 簡化版本 - 現在使用數字輸入器，不再需要這個函數
            this.Debug.logGameFlow('關閉自訂範圍設定 (已簡化)');
        },

        confirmCustomRange() {
            const startNumber = parseInt(document.getElementById('start-number').value);
            const endNumber = parseInt(document.getElementById('end-number').value);
            const numbersPerLevel = parseInt(document.getElementById('numbers-per-level').value);
            
            // 獲取數列類型
            const sequenceTypeRadio = document.querySelector('input[name="sequence-type"]:checked');
            const isConsecutive = sequenceTypeRadio ? sequenceTypeRadio.value === 'consecutive' : true;

            // 驗證輸入
            if (!this.validateCustomRange(startNumber, endNumber, numbersPerLevel)) {
                return;
            }

            // 更新狀態
            this.state.customRange = {
                startNumber,
                endNumber,
                numbersPerLevel,
                isConsecutive
            };
            
            // 更新遊戲模式設定
            this.state.gameMode.isConsecutive = isConsecutive;

            this.Debug.logConfig('自訂範圍設定完成', this.state.customRange);

            // 選擇自訂範圍並關閉模態框
            this.updateSetting('numberRange', 'custom');
            this.updateSettingButtons('numberRange', 'custom');
            this.updateCustomRangeDisplay();
            this.closeCustomRangeModal();
            this.updateStartButton();
        },

        validateCustomRange(start, end, perLevel) {
            if (start < 1 || end > 999) {
                alert('數字範圍必須在 1-999 之間！');
                return false;
            }
            if (start >= end) {
                alert('結束數字必須大於起始數字！');
                return false;
            }
            if (perLevel < 3 || perLevel > 15) {
                alert('每題數字數量必須在 3-15 之間！');
                return false;
            }
            if ((end - start + 1) < perLevel) {
                alert('數字範圍必須大於或等於每題數字數量！');
                return false;
            }
            return true;
        },

        updateCustomRangeDisplay() {
            const display = document.getElementById('custom-range-display');
            if (display && this.state.settings.numberRange === 'custom') {
                const { startNumber, endNumber, numbersPerLevel, isConsecutive } = this.state.customRange;
                const sequenceType = isConsecutive ? '連續數列' : '非連續數列';
                display.innerHTML = `
                    <div class="custom-info">
                        範圍：${startNumber}-${endNumber} | 每題：${numbersPerLevel}個數字 | ${sequenceType}
                    </div>
                `;
                display.style.display = 'block';
            } else if (display) {
                display.style.display = 'none';
            }
        },

        /**
         * 顯示數字輸入器 (適配自f2風格)
         */
        showNumberInput(title, callback, cancelCallback) {
            if (document.getElementById('number-input-popup')) return;
            
            const popupHTML = `
                <div id="number-input-popup" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:1000;">
                    <div style="background:white; padding:20px; border-radius:15px; width:320px; text-align:center; position:relative;">
                        <button id="close-number-input" style="
                            position: absolute;
                            top: 10px;
                            right: 15px;
                            background: #ff4757;
                            color: white;
                            border: none;
                            border-radius: 50%;
                            width: 30px;
                            height: 30px;
                            font-size: 1.2em;
                            font-weight: bold;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
                            transition: all 0.2s ease;
                        " onmouseover="this.style.background='#ff3742'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#ff4757'; this.style.transform='scale(1)'">&times;</button>
                        <h3 style="margin-top: 10px; color: #333;">${title}</h3>
                        <input type="text" id="number-display" readonly style="width:90%; font-size:2em; text-align:center; margin-bottom:15px; padding: 8px; border: 2px solid #ddd; border-radius: 8px;">
                        <div id="number-pad" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;"></div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', popupHTML);
            const pad = document.getElementById('number-pad');
            const display = document.getElementById('number-display');
            const closeBtn = document.getElementById('close-number-input');
            
            // 關閉按鈕事件
            closeBtn.onclick = () => {
                document.getElementById('number-input-popup').remove();
                if (cancelCallback) {
                    cancelCallback();
                }
            };
            
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0', '確認'].forEach(key => {
                const btn = document.createElement('button');
                btn.textContent = key;
                
                // 根據按鈕類型設定不同樣式
                let btnStyle = 'padding: 15px; font-size: 1.2em; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;';
                if (key === '確認') {
                    btnStyle += 'background: #28a745; color: white; font-weight: bold;';
                    btn.onmouseover = () => btn.style.background = '#218838';
                    btn.onmouseout = () => btn.style.background = '#28a745';
                } else if (key === '清除') {
                    btnStyle += 'background: #ffc107; color: #333; font-weight: bold;';
                    btn.onmouseover = () => btn.style.background = '#e0a800';
                    btn.onmouseout = () => btn.style.background = '#ffc107';
                } else {
                    btnStyle += 'background: #f8f9fa; color: #333;';
                    btn.onmouseover = () => btn.style.background = '#e9ecef';
                    btn.onmouseout = () => btn.style.background = '#f8f9fa';
                }
                
                btn.style.cssText = btnStyle;
                btn.onclick = () => {
                    if (key === '清除') {
                        display.value = '';
                    } else if (key === '確認') {
                        const value = parseInt(display.value);
                        if (display.value && !isNaN(value) && value > 0) {
                            document.getElementById('number-input-popup').remove();
                            if (callback) {
                                callback(value);
                            }
                        } else {
                            alert('請輸入有效的數字！');
                        }
                    } else {
                        // 數字輸入，限制最多3位數
                        if (display.value.length < 3) {
                            display.value += key;
                        }
                    }
                };
                
                pad.appendChild(btn);
            });
        },

        // =====================================================
        // 🎯 自訂排序數量系統
        // =====================================================
        showCustomSortingCountModal() {
            this.Debug.logGameFlow('顯示自訂排序數量數字輸入器');
            
            // 初始化自訂排序數量狀態（空白開始）
            this.state.tempSortingCount = '';
            
            // 顯示模態框
            const modal = document.getElementById('custom-sorting-count-modal');
            if (modal) {
                modal.classList.add('show');
                this.updateSortingCountDisplay();
                this.bindSortingCountKeypadEvents();
            }
        },

        validateCustomSortingCount(count) {
            if (isNaN(count) || count < 3 || count > 20) {
                return false;
            }
            return true;
        },
        
        /**
         * 關閉自訂排序數量選擇器
         */
        closeSortingCountSelector() {
            this.Debug.logUserAction('關閉排序數量選擇器');
            const modal = document.getElementById('custom-sorting-count-modal');
            if (modal) {
                modal.classList.remove('show');
            }
            this.state.tempSortingCount = '';
        },
        
        /**
         * 更新排序數量顯示
         */
        updateSortingCountDisplay() {
            const display = document.getElementById('sorting-count-display');
            if (display) {
                const value = this.state.tempSortingCount || '';
                const isValid = value && this.validateCustomSortingCount(parseInt(value));
                const isInvalid = value && !isValid;
                
                // 當輸入超出範圍時，不顯示數字，只顯示警告文字
                const displayValue = isInvalid ? '' : (value || '');
                
                display.innerHTML = `
                    <div class="input-display ${isValid ? 'valid' : value ? 'invalid' : ''}">
                        <span class="display-value">${displayValue}</span>
                        <span class="display-hint" style="color: #ff4444; font-weight: bold;">${isInvalid ? '⚠ 需 3-20 之間' : ''}</span>
                    </div>
                `;
            }
        },
        
        /**
         * 綁定排序數量键盤事件
         */
        bindSortingCountKeypadEvents() {
            const modal = document.getElementById('custom-sorting-count-modal');
            if (!modal) return;
            
            // 移除舊的事件監聽器
            const oldHandler = modal.querySelector('.number-keypad');
            if (oldHandler && oldHandler.cloneNode) {
                const newHandler = oldHandler.cloneNode(true);
                oldHandler.parentNode.replaceChild(newHandler, oldHandler);
            }
            
            // 添加新的事件監聽器
            const keypad = modal.querySelector('.number-keypad');
            if (keypad) {
                keypad.addEventListener('click', this.handleSortingCountKeypadClick.bind(this));
            }
        },
        
        /**
         * 處理排序數量键盤點擊
         */
        handleSortingCountKeypadClick(event) {
            const button = event.target.closest('.keypad-btn');
            if (!button) return;
            
            const number = button.dataset.number;
            const action = button.dataset.action;
            
            this.playSelectSound();
            
            if (number) {
                // 數字輸入
                if (this.state.tempSortingCount.length < 2) { // 最多2位數
                    this.state.tempSortingCount += number;
                    this.Debug.logUserAction(`排序數量輸入: ${number}, 總値: ${this.state.tempSortingCount}`);
                    this.updateSortingCountDisplay();
                }
            } else if (action === 'backspace') {
                // 後退
                this.state.tempSortingCount = this.state.tempSortingCount.slice(0, -1);
                this.updateSortingCountDisplay();
            } else if (action === 'clear') {
                // 清除
                this.state.tempSortingCount = '';
                this.updateSortingCountDisplay();
            } else if (action === 'confirm') {
                // 確認輸入
                this.confirmSortingCountInput();
            }
        },
        
        /**
         * 確認排序數量輸入
         */
        confirmSortingCountInput() {
            const count = parseInt(this.state.tempSortingCount);
            
            if (this.state.tempSortingCount && this.validateCustomSortingCount(count)) {
                this.Debug.logUserAction(`確認排序數量輸入: ${count}`);
                
                // 設定排序數量
                this.state.customSortingCount = count;
                
                // 更新設定
                this.updateSetting('sortingCount', 'custom');
                this.updateSettingButtons('sortingCount', 'custom');
                this.updateStartButton();
                
                // 關閉選擇器
                this.closeSortingCountSelector();
                
                this.Debug.logConfig('自訂排序數量設定完成', { count });
            } else {
                // 這裡不用alert，只是更新顯示狀態
                this.updateSortingCountDisplay();
            }
        },

        // =====================================================
        // 🎮 遊戲主邏輯
        // =====================================================
        startGame() {
            this.Debug.logGameFlow('開始遊戲');
            
            // 播放點擊音效
            this.playClickSound();
            
            // 初始化遊戲狀態
            this.initGameState();
            
            // 顯示遊戲畫面
            this.showGameScreen();
            
            // 開始第一關
            this.startLevel();
        },

        initGameState() {
            const gameConfig = NumberSortingConfig.getGameConfig(this.state.settings);
            
            // 重置遊戲狀態
            this.state.currentLevel = 1;
            this.state.score = 0;
            this.state.isPaused = false;
            this.state.isChecking = false;
            this.state.startTime = Date.now();
            
            // 設定關卡數（使用排序數量設定）
            const sortingCount = this.state.settings.sortingCount === 'custom' 
                ? this.state.customSortingCount 
                : gameConfig.sortingCount.value;
            
            // 根據數字範圍計算總題數
            const rangeConfig = gameConfig.numberRange;
            const totalNumbers = rangeConfig.endNumber - rangeConfig.startNumber + 1;
            this.state.totalLevels = Math.ceil(totalNumbers / sortingCount);
            this.state.numbersPerLevel = sortingCount;
            
            // 設定計時器
            if (gameConfig.timeLimit.value) {
                this.state.timeRemaining = gameConfig.timeLimit.value;
                this.startTimer();
            }
            
            this.Debug.logConfig('遊戲狀態初始化完成', {
                totalLevels: this.state.totalLevels,
                sortingCount: gameConfig.sortingCount.value || this.state.customSortingCount,
                timeLimit: gameConfig.timeLimit.value,
                difficulty: gameConfig.difficulty.id
            });
        },

        showGameScreen() {
            const gameConfig = NumberSortingConfig.getGameConfig(this.state.settings);
            const config = {
                difficulty: gameConfig.difficulty.id,
                levelTitle: this.getLevelTitle(),
                currentLevel: this.state.currentLevel,
                totalLevels: this.state.totalLevels,
                score: this.state.score,
                timeDisplay: this.getTimeDisplay()
            };
            
            // 根據難度模式選擇不同的畫面模板
            if (gameConfig.difficulty.inputMode) {
                this.elements.app.innerHTML = NumberSortingTemplates.hardModeGameScreen(config);
            } else {
                this.elements.app.innerHTML = NumberSortingTemplates.gameScreen(config);
            }
            
            this.initGameElements();
            this.bindGameEvents();
            
            // 重新註冊觸控拖拽區域
            this.registerTouchDropZones();
        },

        initGameElements() {
            // 通用元素
            this.elements.gameTitle = document.querySelector('.game-title');
            this.elements.messageArea = document.getElementById('message-area');
            this.elements.progressInfo = document.getElementById('progress-info');
            this.elements.scoreInfo = document.getElementById('score-info');
            this.elements.timerInfo = document.getElementById('timer-info');
            this.elements.pauseOverlay = document.getElementById('pause-overlay');
            this.elements.fireworksContainer = document.getElementById('fireworks-container');
            
            // 一般模式元素
            this.elements.numberContainer = document.getElementById('number-container');
            this.elements.answerContainer = document.getElementById('answer-container');
            this.elements.confirmContainer = document.getElementById('confirm-container');
            
            // 困難模式元素
            this.elements.instructionArea = document.getElementById('instruction-area');
            this.elements.instructionText = document.getElementById('instruction-text');
            this.elements.inputSlots = document.getElementById('input-slots');
            this.elements.submitContainer = document.getElementById('submit-container');
        },

        bindGameEvents() {
            const gameConfig = NumberSortingConfig.getGameConfig(this.state.settings);
            
            if (gameConfig.difficulty.inputMode) {
                // 困難模式：綁定點擊輸入事件
                this.bindInputEvents();
            } else {
                // 一般模式：拖放事件
                this.bindDragDropEvents();
            }
        },

        bindInputEvents() {
            // 輸入框點擊事件已在 renderInputSlots 中綁定
            // 這裡綁定鍵盤事件
            document.addEventListener('keydown', this.handleKeydown.bind(this));
        },

        handleInputSlotClick(event) {
            const index = parseInt(event.target.dataset.index);
            this.Debug.logUserAction(`點擊輸入框 ${index}`);
            
            // 設為當前輸入框
            this.setActiveInputSlot(index);
            
            // 彈出數字輸入對話框
            this.showNumberInputDialog(index);
        },

        setActiveInputSlot(index) {
            // 移除所有active狀態
            document.querySelectorAll('.input-slot').forEach(slot => {
                slot.classList.remove('active');
            });
            
            this.state.currentInputIndex = index;
            
            // 如果有有效索引，設為active
            if (index >= 0) {
                const targetSlot = document.querySelector(`[data-index="${index}"]`);
                if (targetSlot) {
                    targetSlot.classList.add('active');
                }
            }
        },

        showNumberInputDialog(index) {
            this.Debug.logUserAction(`顯示數字輸入器: 位置${index + 1}`);
            
            // 儲存當前輸入框索引和臨時輸入值
            this.state.currentInputIndex = index;
            this.state.tempInputValue = this.state.inputValues[index]?.toString() || '';
            
            // 更新位置資訊
            const positionInfo = document.getElementById('position-info');
            if (positionInfo) {
                positionInfo.textContent = `請輸入第 ${index + 1} 個位置的數字`;
            }
            
            // 初始化按鍵輸入器
            this.initializeKeypad();
            
            // 顯示當前輸入值
            this.updateInputDisplay();
            
            // 顯示數字選擇器
            const modal = document.getElementById('number-selector-modal');
            if (modal) {
                modal.classList.add('show');
            }
        },

        initializeKeypad() {
            // 先移除舊的事件監聽器，避免重複綁定
            const keypadBtns = document.querySelectorAll('.keypad-btn');
            keypadBtns.forEach(btn => {
                // 使用 cloneNode 方式移除所有事件監聽器
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
            });
            
            // 重新綁定按鍵事件
            const newKeypadBtns = document.querySelectorAll('.keypad-btn');
            newKeypadBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const number = e.target.dataset.number;
                    const action = e.target.dataset.action;
                    
                    if (number !== undefined) {
                        this.handleKeypadNumber(number);
                    } else if (action) {
                        this.handleKeypadAction(action);
                    }
                });
            });
        },

        handleKeypadNumber(digit) {
            this.Debug.logUserAction(`按鍵輸入: ${digit}`);
            
            // 限制最多輸入3位數字
            if (this.state.tempInputValue.length < 3) {
                this.state.tempInputValue += digit;
                this.updateInputDisplay();
            }
        },

        handleKeypadAction(action) {
            this.Debug.logUserAction(`按鍵操作: ${action}`);
            
            switch (action) {
                case 'backspace':
                    if (this.state.tempInputValue.length > 0) {
                        this.state.tempInputValue = this.state.tempInputValue.slice(0, -1);
                        this.updateInputDisplay();
                    }
                    break;
                case 'clear':
                    this.state.tempInputValue = '';
                    this.updateInputDisplay();
                    break;
                case 'confirm':
                    this.confirmKeypadInput();
                    break;
            }
        },

        updateInputDisplay() {
            const display = document.getElementById('current-input-display');
            if (display) {
                display.textContent = this.state.tempInputValue || '請輸入數字';
                display.className = `current-input-display ${this.state.tempInputValue ? 'has-value' : 'empty'}`;
            }
        },

        confirmKeypadInput() {
            const number = parseInt(this.state.tempInputValue);
            
            if (this.state.tempInputValue && !isNaN(number) && number >= 0) {
                this.Debug.logUserAction(`確認輸入: ${number} for 位置${this.state.currentInputIndex + 1}`);
                
                // 設定輸入值
                this.setInputValue(this.state.currentInputIndex, number);
                
                // 關閉輸入器
                this.closeNumberSelector();
            } else {
                // 如果輸入為空或無效，提示用戶
                alert('請輸入有效的數字！');
            }
        },

        closeNumberSelector() {
            const modal = document.getElementById('number-selector-modal');
            if (modal) {
                modal.classList.remove('show');
            }
            
            // 移除active狀態
            this.setActiveInputSlot(-1);
        },

        setInputValue(index, value) {
            this.state.inputValues[index] = value;
            
            // 更新顯示
            const slot = document.querySelector(`[data-index="${index}"]`);
            if (slot) {
                slot.textContent = value;
                if (value !== '') {
                    slot.classList.add('filled');
                } else {
                    slot.classList.remove('filled');
                }
            }
            
            this.Debug.logUserAction(`設定輸入值: 位置${index} = ${value}`);
            
            // 檢查是否全部填完
            this.checkAllInputsFilled();
        },

        checkAllInputsFilled() {
            const allFilled = this.state.inputValues.every(value => value !== '');
            
            if (allFilled) {
                this.showSubmitButton();
            } else {
                this.hideSubmitButton();
            }
        },

        showSubmitButton() {
            if (!this.elements.submitContainer) return;
            
            this.elements.submitContainer.innerHTML = `
                <button class="submit-btn show" id="submit-answer-btn">
                    送出答案
                </button>
            `;
            
            const submitBtn = document.getElementById('submit-answer-btn');
            if (submitBtn) {
                submitBtn.addEventListener('click', this.submitHardModeAnswer.bind(this));
            }
            
            this.Debug.logGameFlow('顯示送出按鈕');
        },

        hideSubmitButton() {
            if (this.elements.submitContainer) {
                this.elements.submitContainer.innerHTML = '';
            }
        },

        submitHardModeAnswer() {
            this.Debug.logGameFlow('困難模式：送出答案', this.state.inputValues);
            
            // 檢查答案是否正確
            const isCorrect = this.validateHardModeAnswer();
            
            if (isCorrect) {
                this.handleCorrectAnswer();
            } else {
                this.handleIncorrectHardModeAnswer();
            }
        },

        validateHardModeAnswer() {
            for (let i = 0; i < this.state.correctOrder.length; i++) {
                if (this.state.inputValues[i] !== this.state.correctOrder[i]) {
                    return false;
                }
            }
            return true;
        },

        handleIncorrectHardModeAnswer() {
            this.Debug.logGameFlow('困難模式：答案錯誤');
            this.playSound('incorrect');
            
            const testMode = this.state.settings.testMode;
            
            // 根據測驗模式決定行為
            if (testMode === 'single') {
                // 單次作答模式：先播放錯誤音效，延遲後播放語音
                this.showMessage('對不起有錯誤，進入下一題。', 'error');
                setTimeout(() => {
                    this.Speech.speakTemplate('incorrectSingle', () => {
                        this.Debug.logGameFlow('困難模式單次作答錯誤語音播放完成，進入下一題');
                        setTimeout(() => {
                            this.nextLevel();
                        }, 500);
                    });
                }, 300);
            } else {
                // 反複練習模式：先播放錯誤音效，延遲後播放語音
                this.showMessage('對不起，有錯誤喔，請再試一次。', 'error');
                setTimeout(() => {
                    this.Speech.speakTemplate('incorrect', () => {
                        // 清空所有輸入，重新顯示輸入介面
                        setTimeout(() => {
                            this.clearAllInputs();
                            this.showMessage('');
                            // 完全重新渲染困難模式界面而不是嘗試恢復
                            this.renderHardModeLevel();
                        }, 1000);
                    });
                }, 300);
            }
        },

        clearAllInputs() {
            this.state.inputValues.fill('');
            
            document.querySelectorAll('.input-slot').forEach(slot => {
                slot.textContent = '';
                slot.classList.remove('filled', 'active');
            });
            
            this.hideSubmitButton();
        },

        resetHardModeInterface() {
            this.Debug.logGameFlow('重置困難模式介面開始');
            
            // 檢查元素存在性
            this.Debug.logGameFlow('檢查元素存在性', {
                instructionArea: !!this.elements.instructionArea,
                inputSlots: !!this.elements.inputSlots,
                submitContainer: !!this.elements.submitContainer
            });
            
            // 重新顯示指令區域
            if (this.elements.instructionArea) {
                this.elements.instructionArea.style.display = 'block';
                this.Debug.logGameFlow('重新顯示指令區域');
            } else {
                this.Debug.logGameFlow('找不到instructionArea元素');
            }
            
            // 重新顯示輸入框區域
            if (this.elements.inputSlots) {
                this.elements.inputSlots.style.display = 'block';
                this.Debug.logGameFlow('重新顯示輸入框區域，當前內容:', this.elements.inputSlots.innerHTML);
            } else {
                this.Debug.logGameFlow('找不到inputSlots元素');
            }
            
            // 重新顯示所有提示
            const hints = document.querySelectorAll('.slot-hint');
            this.Debug.logGameFlow('找到提示框數量:', hints.length);
            hints.forEach((hint, index) => {
                hint.style.display = 'block';
                this.Debug.logGameFlow(`重新顯示提示框 ${index}`);
            });
            
            // 重新顯示送出按鈕容器（如果存在）
            if (this.elements.submitContainer) {
                this.elements.submitContainer.style.display = 'block';
                this.Debug.logGameFlow('重新顯示送出按鈕容器');
            } else {
                this.Debug.logGameFlow('找不到submitContainer元素');
            }
            
            // 重置輸入狀態
            this.state.currentInputIndex = -1;
            
            // 重新渲染輸入框（包含事件綁定）
            this.Debug.logGameFlow('重新渲染輸入框');
            this.renderInputSlots();
            
            // 重新生成並顯示送出按鈕
            this.Debug.logGameFlow('重新生成送出按鈕');
            this.showSubmitButton();
            
            this.Debug.logGameFlow('困難模式介面重置完成');
        },

        handleKeydown(event) {
            // 可以在這裡添加鍵盤快捷鍵支援
            if (event.key === 'Escape') {
                this.setActiveInputSlot(-1);
            }
        },

        // =====================================================
        // 📱 響應式與工具方法
        // =====================================================
        getLevelTitle() {
            return `第 ${this.state.currentLevel} 題`;
        },

        getTimeDisplay() {
            if (this.state.timeRemaining === null) {
                return '無限制';
            }
            const minutes = Math.floor(this.state.timeRemaining / 60);
            const seconds = this.state.timeRemaining % 60;
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        },

        // =====================================================
        // 🎯 關卡管理
        // =====================================================
        startLevel() {
            this.Debug.logGameFlow(`開始第 ${this.state.currentLevel} 關`);
            
            // 生成關卡數字
            this.generateLevelNumbers();
            
            const gameConfig = NumberSortingConfig.getGameConfig(this.state.settings);
            
            if (gameConfig.difficulty.inputMode) {
                // 困難模式：顯示指令和輸入框
                this.renderHardModeLevel();
            } else {
                // 一般模式：渲染數字和插槽
                this.renderNumbers();
                this.renderSlots();
                
                // 清空確認容器和訊息
                this.elements.confirmContainer.innerHTML = '';
                
                // 播放簡單/普通模式的開始語音
                this.playEasyNormalModeInstruction();
            }
            
            this.showMessage('');
        },

        playEasyNormalModeInstruction() {
            // 只在第一題時播放指令語音
            if (this.state.currentLevel === 1) {
                const instructionText = "請將數字由小到大排序";
                this.Speech.speak(instructionText);
                this.Debug.logGameFlow('播放簡單/普通模式指令語音', { text: instructionText });
            }
        },

        renderHardModeLevel() {
            this.Debug.logGameFlow('渲染困難模式關卡');
            
            // 生成指令文字和語音
            const instructionData = this.generateInstruction();
            
            // 顯示指令
            if (this.elements.instructionText) {
                this.elements.instructionText.textContent = instructionData.text;
            }
            
            // 綁定喇叭按鈕事件
            this.bindPlayNumbersButton(instructionData.numbersToRead);
            
            // 綁定提示按鈕事件
            this.bindShowAnswerButton();
            
            // 生成輸入框
            this.renderInputSlots();
            
            // 初始化困難模式狀態
            this.state.inputValues = new Array(this.state.currentNumbers.length).fill('');
            this.state.currentInputIndex = -1;
            
            // 顯示語音播放模態框並播放數字序列
            this.showVoicePlaybackModal(instructionData);
        },

        bindPlayNumbersButton(numbersToRead) {
            const playBtn = document.getElementById('play-numbers-btn');
            if (playBtn) {
                // 移除之前的事件監聽器
                playBtn.replaceWith(playBtn.cloneNode(true));
                const newBtn = document.getElementById('play-numbers-btn');
                
                newBtn.addEventListener('click', () => {
                    this.Debug.logUserAction('點擊播放數字按鈕');
                    this.Speech.speak(numbersToRead);
                });
            }
        },

        bindShowAnswerButton() {
            const showBtn = document.getElementById('show-answer-btn');
            if (showBtn) {
                // 移除之前的事件監聽器
                showBtn.replaceWith(showBtn.cloneNode(true));
                const newBtn = document.getElementById('show-answer-btn');
                
                newBtn.addEventListener('click', () => {
                    this.Debug.logUserAction('點擊顯示答案提示按鈕');
                    this.showAnswerHint();
                });
            }
        },

        showAnswerHint() {
            // 生成答案提示文字和語音
            const answerText = this.state.correctOrder.join('、');
            const answerSpeech = `答案是：${this.state.correctOrder.join('，')}`;
            
            // 創建答案提示的指令數據，使用與開始時相同的格式
            const hintInstructionData = {
                text: `💡 答案提示：${answerText}`,
                speech: answerSpeech,
                numbersToRead: this.state.correctOrder.join('，'),
                isConsecutive: true
            };
            
            // 使用語音播放模態框顯示答案提示
            this.showVoicePlaybackModal(hintInstructionData);
            
            this.Debug.logGameFlow('顯示答案提示', { 
                text: answerText,
                speech: answerSpeech 
            });
        },

        generateInstruction() {
            const isConsecutive = this.state.settings.numberRange === 'custom' 
                ? this.state.customRange.isConsecutive 
                : this.state.gameMode.isConsecutive;
            
            let instructionText, speechText, numbersToRead;
            
            if (isConsecutive) {
                // 連續數列：顯示範圍
                const start = this.state.correctOrder[0];
                const end = this.state.correctOrder[this.state.correctOrder.length - 1];
                instructionText = `${start} 至 ${end} 的數字，由小到大排序`;
                speechText = `請將 ${start} 至 ${end} 的數字，由小到大排序`;
                numbersToRead = this.state.correctOrder.join('，');
            } else {
                // 非連續數列：顯示最小到最大範圍
                const start = Math.min(...this.state.correctOrder);
                const end = Math.max(...this.state.correctOrder);
                instructionText = `${start} 至 ${end} 的數字，由小到大排序`;
                speechText = `請將 ${start} 至 ${end} 的數字，由小到大排序`;
                numbersToRead = this.state.correctOrder.join('，');
            }
            
            this.Debug.logGameFlow('生成困難模式指令', { 
                isConsecutive, 
                text: instructionText,
                numbers: this.state.correctOrder 
            });
            
            return {
                text: instructionText,
                speech: speechText,
                numbersToRead: numbersToRead,
                isConsecutive: isConsecutive
            };
        },

        renderInputSlots() {
            if (!this.elements.inputSlots) return;
            
            this.elements.inputSlots.innerHTML = '';
            
            this.state.correctOrder.forEach((_, index) => {
                const slot = document.createElement('div');
                slot.className = 'input-slot';
                slot.dataset.index = index;
                slot.addEventListener('click', this.handleInputSlotClick.bind(this));
                
                this.elements.inputSlots.appendChild(slot);
            });
        },

        generateLevelNumbers() {
            const gameConfig = NumberSortingConfig.getGameConfig(this.state.settings);
            
            if (this.state.settings.numberRange === 'custom') {
                this.generateCustomRangeNumbers();
            } else {
                this.generateStandardRangeNumbers();
            }
            
            // 根據模式決定是否打亂數字
            if (gameConfig.difficulty.shuffleNumbers || 
                (gameConfig.gameMode && gameConfig.gameMode.shuffleNumbers) ||
                gameConfig.difficulty.id === 'hard') {
                this.shuffleArray(this.state.currentNumbers);
                this.Debug.logGameFlow(`${gameConfig.difficulty.label}：數字已隨機打亂`);
            }
        },

        generateCustomRangeNumbers() {
            const { startNumber, endNumber } = this.state.customRange;
            const numbersPerLevel = this.state.numbersPerLevel;
            
            // 使用新的順序分組邏輯
            const rangeConfig = { startNumber, endNumber };
            this.generateSequentialNumbers(rangeConfig, numbersPerLevel);
        },

        /**
         * 新的順序分組數字生成邏輯
         * 從数字範围的起始到結束，按照排序數量分組
         */
        generateSequentialNumbers(rangeConfig, numbersPerLevel) {
            const { startNumber, endNumber } = rangeConfig;
            const currentLevel = this.state.currentLevel;
            
            // 計算當前關卡的起始數字
            const groupStartNumber = startNumber + (currentLevel - 1) * numbersPerLevel;
            const groupEndNumber = Math.min(groupStartNumber + numbersPerLevel - 1, endNumber);
            
            // 生成當前組的數字
            const selectedNumbers = [];
            for (let i = groupStartNumber; i <= groupEndNumber; i++) {
                selectedNumbers.push(i);
            }
            
            this.state.currentNumbers = [...selectedNumbers];
            this.state.correctOrder = [...selectedNumbers];
            
            this.Debug.logGameFlow(`第 ${currentLevel} 題生成順序數字組`, {
                numbers: selectedNumbers,
                range: `${groupStartNumber}-${groupEndNumber}`,
                totalRange: `${startNumber}-${endNumber}`,
                numbersPerLevel: numbersPerLevel
            });
        },

        generateCustomConsecutiveNumbers(startNumber, endNumber, numbersCount) {
            // 確保有足夠的連續數字空間
            const availableStart = startNumber;
            const availableEnd = endNumber - numbersCount + 1;
            
            if (availableEnd < availableStart) {
                // 如果範圍不夠，使用最小範圍
                const selectedNumbers = [];
                for (let i = 0; i < Math.min(numbersCount, endNumber - startNumber + 1); i++) {
                    selectedNumbers.push(startNumber + i);
                }
                this.state.currentNumbers = [...selectedNumbers];
                this.state.correctOrder = [...selectedNumbers];
            } else {
                // 隨機選擇起始點，生成連續數字
                const randomStart = Math.floor(Math.random() * (availableEnd - availableStart + 1)) + availableStart;
                const selectedNumbers = [];
                for (let i = 0; i < numbersCount; i++) {
                    selectedNumbers.push(randomStart + i);
                }
                this.state.currentNumbers = [...selectedNumbers];
                this.state.correctOrder = [...selectedNumbers];
            }
            
            this.Debug.logGameFlow(`第 ${this.state.currentLevel} 題生成自訂連續數字`, {
                numbers: this.state.currentNumbers,
                range: `${startNumber}-${endNumber}`
            });
        },

        generateCustomNonConsecutiveNumbers(startNumber, endNumber, numbersCount) {
            // 從自訂範圍中隨機選取數字
            const availableNumbers = [];
            for (let i = startNumber; i <= endNumber; i++) {
                availableNumbers.push(i);
            }
            
            // 隨機選取指定數量的數字
            this.shuffleArray(availableNumbers);
            const selectedNumbers = availableNumbers.slice(0, Math.min(numbersCount, availableNumbers.length));
            
            // 排序作為正確答案
            selectedNumbers.sort((a, b) => a - b);
            
            this.state.currentNumbers = [...selectedNumbers];
            this.state.correctOrder = [...selectedNumbers];
            
            this.Debug.logGameFlow(`第 ${this.state.currentLevel} 題生成自訂非連續數字`, {
                numbers: selectedNumbers,
                count: selectedNumbers.length,
                range: `${startNumber}-${endNumber}`
            });
        },

        generateStandardRangeNumbers() {
            const rangeConfig = NumberSortingConfig.getNumberRangeConfig(this.state.settings.numberRange);
            const numbersPerLevel = this.state.numbersPerLevel;
            
            // 新的順序分組邏輯：從起始到結束連續分組
            this.generateSequentialNumbers(rangeConfig, numbersPerLevel);
        },

        generateConsecutiveNumbers(rangeConfig) {
            const numbersCount = 10; // 固定10個數字
            
            // 確保有足夠的連續數字空間
            const availableStart = rangeConfig.startNumber;
            const availableEnd = rangeConfig.endNumber - numbersCount + 1;
            
            if (availableEnd < availableStart) {
                // 如果範圍不夠，使用最小範圍
                const startNumber = rangeConfig.startNumber;
                const selectedNumbers = [];
                for (let i = 0; i < numbersCount; i++) {
                    selectedNumbers.push(startNumber + i);
                }
                this.state.currentNumbers = [...selectedNumbers];
                this.state.correctOrder = [...selectedNumbers];
            } else {
                // 隨機選擇起始點，生成連續數字
                const startNumber = Math.floor(Math.random() * (availableEnd - availableStart + 1)) + availableStart;
                const selectedNumbers = [];
                for (let i = 0; i < numbersCount; i++) {
                    selectedNumbers.push(startNumber + i);
                }
                this.state.currentNumbers = [...selectedNumbers];
                this.state.correctOrder = [...selectedNumbers];
            }
            
            this.Debug.logGameFlow(`第 ${this.state.currentLevel} 題生成連續數字`, {
                numbers: this.state.currentNumbers,
                range: `${this.state.currentNumbers[0]}-${this.state.currentNumbers[numbersCount-1]}`
            });
        },

        generateNonConsecutiveNumbers(rangeConfig) {
            const numbersCount = 10; // 固定10個數字
            
            // 從數字範圍中隨機選取不連續的數字
            const availableNumbers = [];
            for (let i = rangeConfig.startNumber; i <= rangeConfig.endNumber; i++) {
                availableNumbers.push(i);
            }
            
            // 隨機選取指定數量的數字
            this.shuffleArray(availableNumbers);
            const selectedNumbers = availableNumbers.slice(0, Math.min(numbersCount, availableNumbers.length));
            
            // 排序作為正確答案
            selectedNumbers.sort((a, b) => a - b);
            
            this.state.currentNumbers = [...selectedNumbers];
            this.state.correctOrder = [...selectedNumbers];
            
            this.Debug.logGameFlow(`第 ${this.state.currentLevel} 題生成非連續數字`, {
                numbers: selectedNumbers,
                count: selectedNumbers.length
            });
        },

        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        },

        renderNumbers() {
            if (!this.elements.numberContainer) return;
            
            this.elements.numberContainer.innerHTML = '';
            
            this.state.currentNumbers.forEach(number => {
                const numberElement = document.createElement('div');
                numberElement.className = 'number-box';
                numberElement.setAttribute('data-value', number);
                numberElement.setAttribute('draggable', 'true');
                numberElement.textContent = number;
                
                const checkMark = document.createElement('div');
                checkMark.className = 'check-mark';
                checkMark.textContent = '✓';
                numberElement.appendChild(checkMark);
                
                this.elements.numberContainer.appendChild(numberElement);
            });
            
            // 重新註冊觸控拖拽區域（因為新增了numbers）
            this.registerTouchDropZones();
        },

        renderSlots() {
            if (!this.elements.answerContainer) return;
            
            const gameConfig = NumberSortingConfig.getGameConfig(this.state.settings);
            const showHints = gameConfig.difficulty.showHints;
            
            this.elements.answerContainer.innerHTML = '';
            
            this.state.correctOrder.forEach((number, index) => {
                const slot = document.createElement('div');
                slot.className = 'slot';
                slot.setAttribute('data-position', index);
                
                if (showHints) {
                    const hint = document.createElement('span');
                    hint.className = 'slot-hint';
                    hint.textContent = number;
                    slot.appendChild(hint);
                }
                
                this.elements.answerContainer.appendChild(slot);
            });
            
            // 重新註冊觸控拖拽區域（因為新增了slots）
            this.registerTouchDropZones();
        },

        // =====================================================
        // 🖱️ 拖放系統
        // =====================================================
        bindDragDropEvents() {
            if (!this.elements.app) return;

            // Traditional mouse drag events
            this.elements.app.addEventListener('dragstart', this.handleDragStart.bind(this));
            this.elements.app.addEventListener('dragend', this.handleDragEnd.bind(this));
            this.elements.app.addEventListener('dragover', this.handleDragOver.bind(this));
            this.elements.app.addEventListener('dragenter', this.handleDragEnter.bind(this));
            this.elements.app.addEventListener('dragleave', this.handleDragLeave.bind(this));
            this.elements.app.addEventListener('drop', this.handleDrop.bind(this));
            
            // Touch drag support
            this.setupTouchDrag();
        },

        setupTouchDrag() {
            console.log('🎯 setupTouchDrag 被調用，當前 TouchDragUtility 狀態:', !!window.TouchDragUtility);
            console.log('🎯 window 對象包含的屬性:', Object.keys(window).filter(key => key.includes('TouchDrag')));
            
            this.waitForTouchDragUtility(() => {
                this.setupTouchDragActual();
            });
        },

        waitForTouchDragUtility(callback, attempts = 0) {
            console.log(`🎯 等待 TouchDragUtility，嘗試 ${attempts + 1}/20，狀態:`, !!window.TouchDragUtility);
            
            if (window.TouchDragUtility) {
                console.log('🎯 TouchDragUtility 已可用，執行回調');
                callback();
            } else if (attempts < 20) {
                setTimeout(() => {
                    this.waitForTouchDragUtility(callback, attempts + 1);
                }, 50);
            } else {
                console.error('🎯 TouchDragUtility 載入超時，檢查腳本載入順序');
                console.log('🎯 所有可用的 window 屬性:', Object.keys(window).filter(key => key.toLowerCase().includes('touch')));
            }
        },

        setupTouchDragActual() {
            
            console.log('🎯 開始設置觸控拖拽功能...');
            console.log('🎯 App元素:', this.elements.app);
            
            // Check if draggable elements exist
            const draggableElements = this.elements.app.querySelectorAll('.number-box:not(.correct)');
            console.log('🎯 找到可拖拽元素:', draggableElements.length, draggableElements);
            
            // Add simple touch test to first element
            if (draggableElements.length > 0) {
                const testElement = draggableElements[0];
                console.log('🎯 添加測試觸控事件到:', testElement);
                testElement.addEventListener('touchstart', (e) => {
                    console.log('🎯 測試觸控開始事件觸發!', e);
                }, { passive: false });
            }
            
            // Register draggable elements
            window.TouchDragUtility.registerDraggable(
                this.elements.app,
                '.number-box:not(.correct)',
                {
                    onDragStart: (element, event) => {
                        console.log('🎯 觸控拖拽開始:', element, event);
                        
                        // Check if drag should be allowed
                        if (element.classList.contains('correct')) {
                            console.log('🎯 元素已正確，阻止拖拽');
                            return false;
                        }
                        
                        this.state.draggedElement = element;
                        const number = element.dataset.value;
                        
                        console.log('🎯 設置拖拽元素:', number);
                        this.Debug.logDragDrop(`開始觸控拖拽數字: ${number}`);
                        
                        // 播放數字語音
                        this.Speech.speak(number);
                        
                        return true;
                    },
                    onDrop: (draggedElement, dropZone, event) => {
                        // Ensure draggedElement is set
                        this.state.draggedElement = draggedElement;
                        
                        // Handle touch drop with proper zone detection
                        const slot = dropZone.closest('.slot');
                        const numberContainer = dropZone.closest('.number-container');
                        
                        this.Debug.logDragDrop(`觸控放置檢測: slot=${!!slot}, numberContainer=${!!numberContainer}, dropZone=${dropZone.className}`);
                        
                        if (slot && this.state.draggedElement) {
                            this.Debug.logDragDrop(`觸控放置到slot: position=${slot.dataset.position}`);
                            this.handleSlotDrop(slot);
                        } else if (numberContainer && this.state.draggedElement) {
                            this.Debug.logDragDrop(`觸控放置到數字容器`);
                            this.handleNumberContainerDrop();
                        } else {
                            this.Debug.logDragDrop(`觸控放置失敗: 找不到有效的放置目標`);
                        }
                    },
                    onDragEnd: (element, event) => {
                        // Reset dragged element state
                        if (this.state.draggedElement) {
                            this.state.draggedElement = null;
                        }
                        
                        // 清除所有拖拽樣式
                        document.querySelectorAll('.slot.drag-over').forEach(slot => {
                            slot.classList.remove('drag-over');
                        });
                    }
                }
            );
            
            // Register drop zones
            this.registerTouchDropZones();
        },

        registerTouchDropZones() {
            this.waitForTouchDragUtility(() => {
                this.registerTouchDropZonesActual();
            });
        },

        registerTouchDropZonesActual() {
            
            console.log('🎯 開始註冊觸控放置區域...');
            
            // Register slots as drop zones
            const slots = this.elements.app.querySelectorAll('.slot');
            console.log('🎯 找到slots:', slots.length, slots);
            this.Debug.logDragDrop(`註冊觸控放置區域: 找到 ${slots.length} 個 slots`);
            
            slots.forEach((slot, index) => {
                window.TouchDragUtility.registerDropZone(slot, (draggedElement, dropZone) => {
                    // Allow drop only if slot doesn't have a correct number
                    const hasCorrectNumber = dropZone.querySelector('.number-box.correct');
                    this.Debug.logDragDrop(`檢查slot ${index} 是否可放置: hasCorrectNumber=${!!hasCorrectNumber}`);
                    return !hasCorrectNumber;
                });
            });
            
            // Register number container as drop zone
            const numberContainer = this.elements.app.querySelector('.number-container');
            if (numberContainer) {
                this.Debug.logDragDrop('註冊數字容器為放置區域');
                window.TouchDragUtility.registerDropZone(numberContainer, () => true);
            } else {
                this.Debug.logDragDrop('找不到數字容器');
            }
        },

        handleDragStart(event) {
            if (!event.target.classList.contains('number-box') || 
                event.target.classList.contains('correct')) {
                event.preventDefault();
                return;
            }
            
            this.state.draggedElement = event.target;
            const number = event.target.dataset.value;
            
            this.Debug.logDragDrop(`開始拖拽數字: ${number}`);
            
            // 播放數字語音
            this.Speech.speak(number);
            
            event.dataTransfer.setData('text/plain', number);
            event.dataTransfer.effectAllowed = 'move';
            
            setTimeout(() => {
                event.target.style.opacity = '0.5';
            }, 0);
        },

        handleDragEnd(event) {
            if (this.state.draggedElement) {
                this.state.draggedElement.style.opacity = '1';
                this.state.draggedElement = null;
            }
            
            // 清除所有拖拽樣式
            document.querySelectorAll('.slot.drag-over').forEach(slot => {
                slot.classList.remove('drag-over');
            });
        },

        handleDragOver(event) {
            event.preventDefault();
        },

        handleDragEnter(event) {
            event.preventDefault();
            const slot = event.target.closest('.slot');
            if (slot && !slot.querySelector('.number-box.correct')) {
                slot.classList.add('drag-over');
            }
        },

        handleDragLeave(event) {
            const slot = event.target.closest('.slot');
            if (slot) {
                slot.classList.remove('drag-over');
            }
        },

        handleDrop(event) {
            event.preventDefault();
            const slot = event.target.closest('.slot');
            const numberContainer = event.target.closest('.number-container');
            
            if (slot && this.state.draggedElement) {
                this.handleSlotDrop(slot);
            } else if (numberContainer && this.state.draggedElement) {
                this.handleNumberContainerDrop();
            }
        },

        handleSlotDrop(slot) {
            const position = parseInt(slot.dataset.position);
            const draggedNumber = parseInt(this.state.draggedElement.dataset.value);
            
            this.Debug.logDragDrop(`放置數字 ${draggedNumber} 到位置 ${position}`);
            
            // 移除現有數字
            const existingBox = slot.querySelector('.number-box');
            if (existingBox && existingBox !== this.state.draggedElement) {
                this.elements.numberContainer.appendChild(existingBox);
                existingBox.classList.remove('correct', 'incorrect');
            }
            
            // 放入新數字
            slot.appendChild(this.state.draggedElement);
            this.state.draggedElement.classList.remove('correct', 'incorrect');
            
            // 處理答案檢查
            this.processAnswer(slot, position, draggedNumber);
        },

        handleNumberContainerDrop() {
            if (this.state.draggedElement.parentNode !== this.elements.numberContainer) {
                this.elements.numberContainer.appendChild(this.state.draggedElement);
                this.state.draggedElement.classList.remove('correct', 'incorrect');
            }
        },

        processAnswer(slot, position, number) {
            const gameConfig = NumberSortingConfig.getGameConfig(this.state.settings);
            const correctNumber = this.state.correctOrder[position];
            const isCorrect = number === correctNumber;
            
            if (gameConfig.difficulty.instantFeedback) {
                // 簡單模式：立即反饋
                this.handleInstantFeedback(slot, isCorrect);
            } else {
                // 普通/困難模式：等待確認
                this.checkAllSlotsFilled();
            }
        },

        handleInstantFeedback(slot, isCorrect) {
            const numberBox = slot.querySelector('.number-box');
            if (!numberBox) return;
            
            if (isCorrect) {
                numberBox.classList.add('correct');
                numberBox.draggable = false;
                
                // 隱藏提示
                const hint = slot.querySelector('.slot-hint');
                if (hint) hint.style.display = 'none';
                
                // 只播放音效，不播放語音（語音在整題完成時播放）
                this.playSound('correct');
                
                // 不在這裡計分，等整題完成時再計分
            } else {
                numberBox.classList.add('incorrect');
                this.playSound('incorrect');
            }
            
            this.checkLevelCompletion();
        },

        checkAllSlotsFilled() {
            const allSlots = this.elements.answerContainer.querySelectorAll('.slot');
            const allFilled = Array.from(allSlots).every(slot => slot.querySelector('.number-box'));
            
            if (allFilled) {
                this.showConfirmButton();
            }
        },

        showConfirmButton() {
            this.Debug.logGameFlow('顯示確認按鈕');
            this.elements.confirmContainer.innerHTML = NumberSortingTemplates.confirmButton();
            
            const confirmBtn = document.getElementById('confirm-btn');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', this.confirmAnswers.bind(this));
            }
        },

        confirmAnswers() {
            this.Debug.logGameFlow('確認答案');
            this.elements.confirmContainer.innerHTML = '';
            
            let allCorrect = true;
            const incorrectBoxes = [];
            
            const slots = this.elements.answerContainer.querySelectorAll('.slot');
            slots.forEach((slot, index) => {
                const numberBox = slot.querySelector('.number-box');
                if (!numberBox) return;
                
                const number = parseInt(numberBox.dataset.value);
                const correctNumber = this.state.correctOrder[index];
                const isCorrect = number === correctNumber;
                
                numberBox.classList.remove('correct', 'incorrect');
                
                if (isCorrect) {
                    numberBox.classList.add('correct');
                    // 不在這裡計分，等所有答案確認後在handleCorrectAnswer中計分
                } else {
                    numberBox.classList.add('incorrect');
                    incorrectBoxes.push(numberBox);
                    allCorrect = false;
                }
            });
            
            if (allCorrect) {
                this.handleCorrectAnswer();
            } else {
                this.handleIncorrectAnswer(incorrectBoxes);
            }
        },

        handleCorrectAnswer() {
            this.Debug.logGameFlow('答案全部正確');
            this.playSound('correct');
            this.showMessage('太棒了，你答對了！', 'success');
            
            // 答對一題給10分
            this.updateScore(10);
            
            // 重置檢查狀態
            this.state.isChecking = false;
            
            // 播放語音，語音播放完成後才進入下一題
            this.Speech.speakTemplate('correct', () => {
                this.Debug.logGameFlow('正確答案語音播放完成，準備進入下一題');
                
                setTimeout(() => {
                    if (this.state.currentLevel < this.state.totalLevels) {
                        this.nextLevel();
                    } else {
                        this.completeGame();
                    }
                }, 500); // 語音後稍微延遲
            });
        },

        handleIncorrectAnswer(incorrectBoxes) {
            this.Debug.logGameFlow(`答案有錯誤，錯誤數量: ${incorrectBoxes.length}`);
            this.playSound('incorrect');
            
            const gameConfig = NumberSortingConfig.getGameConfig(this.state.settings);
            const testMode = this.state.settings.testMode;
            
            // 根據測驗模式決定行為
            if (testMode === 'single' && (gameConfig.difficulty.id === 'normal' || gameConfig.difficulty.id === 'hard')) {
                // 單次作答模式：先播放錯誤音效，延遲後播放語音
                this.showMessage('對不起有錯誤，進入下一題。', 'error');
                setTimeout(() => {
                    this.Speech.speakTemplate('incorrectSingle', () => {
                        this.Debug.logGameFlow('單次作答模式錯誤語音播放完成，進入下一題');
                        setTimeout(() => {
                            this.nextLevel();
                        }, 500);
                    });
                }, 300);
            } else {
                // 反複練習模式：先播放錯誤音效，延遲後播放語音
                this.showMessage('對不起，有錯誤喔，請再試一次。', 'error');
                setTimeout(() => {
                    this.Speech.speakTemplate('incorrect', () => {
                        this.Debug.logGameFlow('錯誤答案語音播放完成，恢復錯誤數字');
                        
                        setTimeout(() => {
                            incorrectBoxes.forEach(box => {
                                box.classList.remove('incorrect');
                                this.elements.numberContainer.appendChild(box);
                            });
                            
                            this.showMessage('');
                            this.checkAllSlotsFilled();
                        }, 300);
                    });
                }, 300);
            }
        },

        // =====================================================
        // 🎮 遊戲控制
        // =====================================================
        nextLevel() {
            this.state.currentLevel++;
            this.Debug.logGameFlow(`進入第 ${this.state.currentLevel} 關`);
            
            this.updateGameInfo();
            this.startLevel();
        },

        completeGame() {
            this.Debug.logGameFlow('遊戲完成');
            
            // 播放完成語音
            this.Speech.speakTemplate('complete', () => {
                this.Debug.logGameFlow('遊戲完成語音播放完成');
            });
            
            this.showResults('恭喜完成所有題目！', '🏆');
        },

        updateGameInfo() {
            if (this.elements.gameTitle) {
                this.elements.gameTitle.textContent = this.getLevelTitle();
            }
            if (this.elements.progressInfo) {
                this.elements.progressInfo.textContent = `${this.state.currentLevel}/${this.state.totalLevels}`;
            }
            if (this.elements.scoreInfo) {
                this.elements.scoreInfo.textContent = this.state.score;
            }
        },

        updateScore(points) {
            this.state.score += points;
            this.updateGameInfo();
        },

        showMessage(text, type = 'info') {
            if (!this.elements.messageArea) return;
            
            this.elements.messageArea.textContent = text;
            this.elements.messageArea.className = `message-area ${type}`;
            
            if (text) {
                this.elements.messageArea.style.display = 'block';
            } else {
                this.elements.messageArea.style.display = 'none';
            }
        },

        // =====================================================
        // 🎤 語音播放模態框系統
        // =====================================================
        showVoicePlaybackModal(instructionData) {
            this.Debug.logGameFlow('顯示語音播放模態框', instructionData);
            
            // 創建模態框HTML
            const modalHTML = NumberSortingTemplates.numberSequenceModal(
                instructionData.numbersToRead, 
                instructionData.text
            );
            
            // 添加到頁面
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // 顯示模態框
            const modal = document.getElementById('voice-playback-modal');
            if (modal) {
                // 為關閉按鈕綁定事件
                const closeBtn = document.getElementById('close-modal-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        this.Debug.logUserAction('點擊關閉提示視窗按鈕');
                        this.closeVoicePlaybackModal();
                    });
                }
                
                // 添加顯示類別以觸發動畫
                requestAnimationFrame(() => {
                    modal.classList.add('show');
                });
                
                // 開始語音播放和動畫
                this.startVoicePlayback(instructionData.numbersToRead, instructionData.speech);
            }
        },

        /**
         * [已修改-加速版] 開始語音播放和同步動畫 (使用 async/await)
         */
        async startVoicePlayback(numbersToRead, speechText) {
            const numbersArray = numbersToRead.split('，');
            const progressBar = document.getElementById('voice-progress-bar');
            const numbersContainer = document.getElementById('voice-numbers-container');
            const modal = document.getElementById('voice-playback-modal');

            if (!progressBar || !numbersContainer || !modal) {
                this.Debug.logGameFlow('語音播放模態框缺少必要元素，提前終止');
                return;
            }

            const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

            const introSpeech = speechText.includes('：') ? speechText.split('：')[0] + '：' : '';
            if (introSpeech) {
                await this.Speech.speakAndWait(introSpeech);
            } else {
                await sleep(100); // [修改] 縮短初始延遲
            }

            for (let i = 0; i < numbersArray.length; i++) {
                if (!document.body.contains(modal)) {
                    this.Debug.logGameFlow('偵測到模態框已關閉，中斷語音播放序列');
                    return;
                }

                const number = numbersArray[i];

                const prevItem = numbersContainer.querySelector('.number-item.highlighting');
                if (prevItem) {
                    prevItem.classList.remove('highlighting');
                }

                const currentItem = numbersContainer.querySelector(`[data-index="${i}"]`);
                if (currentItem) {
                    currentItem.classList.add('highlighting');
                }

                const progress = ((i + 1) / numbersArray.length) * 100;
                progressBar.style.width = `${progress}%`;
                progressBar.style.transition = 'width 0.1s linear'; // 加快進度條動畫

                // 唸出數字並「等待」它唸完
                await this.Speech.speakAndWait(number);
                
                // [修改] 大幅縮短數字間的停頓，製造連續播放的效果
                await sleep(50);
            }

            this.Debug.logGameFlow('語音與動畫序列播放完成，準備關閉模態框');
            await sleep(500); // [修改] 縮短結束前的延遲

            if (document.body.contains(modal)) {
                this.closeVoicePlaybackModal();
            }
        },

        closeVoicePlaybackModal() {
            // 停止任何正在播放的語音
            if (this.Speech && this.Speech.synth) {
                this.Speech.synth.cancel();
                this.Debug.logAudio('關閉提示視窗，語音已停止');
            }

            const modal = document.getElementById('voice-playback-modal');
            if (modal) {
                // 防止重複觸發關閉
                if (modal.isClosing) return;
                modal.isClosing = true;
                
                // 添加退出動畫
                modal.style.animation = 'modalFadeOut 0.3s ease-in-out forwards';
                
                // 動畫完成後移除元素
                setTimeout(() => {
                    modal.remove();
                    this.Debug.logGameFlow('語音播放模態框已關閉');
                }, 300);
            }
        },

        // =====================================================
        // 🎙️ 語音系統
        // =====================================================
        Speech: {
            synth: window.speechSynthesis,
            voice: null,
            
            init() {
                Game.Debug.logAudio('初始化語音系統');
                
                const loadVoices = () => {
                    const voices = this.synth.getVoices();
                    Game.Debug.logAudio('取得語音列表', { count: voices.length });
                    
                    // 與 f3_number_recognition 相同的語音選擇策略
                    const preferredVoices = [
                        'Microsoft HsiaoChen Online',    // 首選：微軟小陳
                        'Google 國語 (臺灣)'             // 次選：Google台灣國語
                    ];
                    
                    // 尋找首選語音
                    this.voice = voices.find(v => preferredVoices.includes(v.name));
                    
                    // 如果找不到首選，尋找其他台灣中文語音（排除Hanhan）
                    if (!this.voice) {
                        this.voice = voices.find(v => 
                            v.lang === 'zh-TW' && !v.name.includes('Hanhan')
                        );
                    }
                    
                    // 最後備選：任何中文語音
                    if (!this.voice) {
                        this.voice = voices.find(v => v.lang.startsWith('zh'));
                    }
                    
                    if (this.voice) {
                        Game.Debug.logAudio('語音準備就緒', { 
                            name: this.voice.name, 
                            lang: this.voice.lang 
                        });
                    } else {
                        Game.Debug.logAudio('未找到中文語音', '語音初始化');
                    }
                };
                
                // 語音載入可能需要時間
                if (this.synth.getVoices().length === 0) {
                    this.synth.addEventListener('voiceschanged', loadVoices);
                } else {
                    loadVoices();
                }
            },
            
            speak(text, callback) {
                Game.Debug.logAudio('開始播放語音', { text });
                
                // 檢查音效設定
                const soundConfig = NumberSortingConfig.getSoundConfig(Game.state.settings.sound);
                if (!soundConfig.enabled) {
                    Game.Debug.logAudio('語音被設定關閉', { text });
                    if (callback) callback();
                    return;
                }
                
                // 停止所有正在播放的語音
                if (this.synth.speaking) {
                    this.synth.cancel();
                }
                
                if (!text) {
                    if (callback) callback();
                    return;
                }
                
                try {
                    const utterance = new SpeechSynthesisUtterance(text);
                    
                    if (this.voice) {
                        utterance.voice = this.voice;
                        utterance.lang = this.voice.lang;
                    }
                    
                    // [修改] 將語速從 1.0 提升到 1.5，使其更快
                    utterance.rate = 1.5;
                    
                    utterance.onend = () => {
                        Game.Debug.logAudio('語音播放完成', { text });
                        if (callback) callback();
                    };
                    
                    utterance.onerror = (error) => {
                        Game.Debug.logAudio('語音播放錯誤', error);
                        if (callback) callback();
                    };
                    
                    this.synth.speak(utterance);
                } catch (error) {
                    Game.Debug.logAudio('語音播放異常', error);
                    if (callback) callback();
                }
            },

            /**
             * [新增] Promise 版本的語音播放，用於 async/await
             * @param {string} text - 要播放的文字
             * @returns {Promise<void>}
             */
            speakAndWait(text) {
                return new Promise((resolve) => {
                    this.speak(text, resolve); // speak 方法本身的回調會 resolve 這個 Promise
                });
            },

            // 配置驅動的語音播放方法
            speakTemplate(templateKey, callback) {
                const gameConfig = NumberSortingConfig.getGameConfig(Game.state.settings);
                const difficulty = gameConfig.difficulty;
                
                Game.Debug.logAudio('播放語音模板', { 
                    templateKey, 
                    difficulty: difficulty.id,
                    speechFeedback: difficulty.speechFeedback 
                });
                
                // 檢查是否啟用語音反饋
                if (!difficulty.speechFeedback) {
                    Game.Debug.logAudio('語音反饋被關閉', { templateKey });
                    if (callback) callback();
                    return;
                }
                
                // 獲取語音模板
                const speechTemplate = difficulty.speechTemplates && difficulty.speechTemplates[templateKey];
                if (!speechTemplate) {
                    Game.Debug.logAudio(`找不到語音模板: ${templateKey}`, { difficulty: difficulty.id });
                    if (callback) callback();
                    return;
                }
                
                // 播放語音
                this.speak(speechTemplate, callback);
            }
        },

        // =====================================================
        // 🎵 音效系統
        // =====================================================
        playSound(soundType) {
            const soundConfig = NumberSortingConfig.getSoundConfig(this.state.settings.sound);
            if (!soundConfig.enabled) return;
            
            const soundFile = soundConfig.sounds[soundType];
            if (!soundFile) return;
            
            this.Debug.logAudio(`播放音效: ${soundType}`);
            
            try {
                const audio = new Audio(soundFile);
                audio.play().catch(error => {
                    this.Debug.logAudio(`音效播放失敗: ${soundType}`, error);
                });
            } catch (error) {
                this.Debug.logAudio(`音效系統錯誤: ${soundType}`, error);
            }
        },

        // 播放選擇音效（設定頁面專用）
        playSelectSound() {
            this.Debug.logAudio('播放選擇音效');
            
            try {
                const audio = document.getElementById('menu-select-sound');
                if (audio) {
                    audio.currentTime = 0;
                    audio.play().catch(error => {
                        this.Debug.logAudio('選擇音效播放失敗', error);
                    });
                }
            } catch (error) {
                this.Debug.logAudio('選擇音效系統錯誤', error);
            }
        },

        // 播放點擊音效（按鈕專用）
        playClickSound() {
            this.Debug.logAudio('播放點擊音效');
            
            try {
                const audio = document.getElementById('click-sound');
                if (audio) {
                    audio.currentTime = 0;
                    audio.play().catch(error => {
                        this.Debug.logAudio('點擊音效播放失敗', error);
                    });
                }
            } catch (error) {
                this.Debug.logAudio('點擊音效系統錯誤', error);
            }
        },

        // =====================================================
        // 🏁 遊戲結束
        // =====================================================
        showResults(message, trophy) {
            const timeUsed = this.calculateTimeUsed();
            
            const config = {
                title: '測驗完成！',
                message,
                trophy,
                score: `${this.state.score}分`,
                timeUsed
            };
            
            this.elements.app.innerHTML = NumberSortingTemplates.resultsScreen(config);
        },

        calculateTimeUsed() {
            if (!this.state.startTime) return '未知';
            
            const totalTime = Math.floor((Date.now() - this.state.startTime) / 1000);
            const minutes = Math.floor(totalTime / 60);
            const seconds = totalTime % 60;
            
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        },

        // =====================================================
        // 🎮 遊戲控制方法
        // =====================================================
        pauseGame() {
            this.Debug.logGameFlow('暫停遊戲');
            this.state.isPaused = true;
            if (this.elements.pauseOverlay) {
                this.elements.pauseOverlay.style.display = 'grid';
            }
        },

        resumeGame() {
            this.Debug.logGameFlow('繼續遊戲');
            this.state.isPaused = false;
            if (this.elements.pauseOverlay) {
                this.elements.pauseOverlay.style.display = 'none';
            }
        },

        resetGame() {
            this.Debug.logGameFlow('重置遊戲');
            this.playSound('click');
            
            // 清除計時器
            if (this.state.timerInterval) {
                clearInterval(this.state.timerInterval);
            }
            
            this.startGame();
        },

        // =====================================================
        // ⏰ 計時器系統
        // =====================================================
        startTimer() {
            if (this.state.timerInterval) {
                clearInterval(this.state.timerInterval);
            }
            
            this.state.timerInterval = setInterval(() => {
                if (this.state.isPaused) return;
                
                this.state.timeRemaining--;
                
                if (this.state.timeRemaining <= 0) {
                    this.handleTimeUp();
                } else {
                    this.updateTimerDisplay();
                }
            }, 1000);
        },

        updateTimerDisplay() {
            if (this.elements.timerInfo) {
                this.elements.timerInfo.textContent = this.getTimeDisplay();
                
                const gameConfig = NumberSortingConfig.getGameConfig(this.state.settings);
                const warningTime = gameConfig.timeLimit.warningTime || 30;
                
                if (this.state.timeRemaining <= warningTime) {
                    this.elements.timerInfo.classList.add('warning');
                } else {
                    this.elements.timerInfo.classList.remove('warning');
                }
            }
        },

        handleTimeUp() {
            clearInterval(this.state.timerInterval);
            this.showResults('時間到！', '⏰');
        },

        // =====================================================
        // 🎯 關卡完成檢查
        // =====================================================
        checkLevelCompletion() {
            if (this.state.isChecking) return;
            
            const correctBoxes = this.elements.answerContainer.querySelectorAll('.number-box.correct');
            if (correctBoxes.length === this.state.correctOrder.length) {
                this.state.isChecking = true;
                
                // 簡單模式需要特別處理：播放整題完成語音後再進入下一題
                const gameConfig = NumberSortingConfig.getGameConfig(this.state.settings);
                if (gameConfig.difficulty.instantFeedback) {
                    this.handleEasyModeCompletion();
                } else {
                    this.handleCorrectAnswer();
                }
            }
        },

        handleEasyModeCompletion() {
            this.Debug.logGameFlow('簡單模式：整題完成');
            
            // 顯示訊息和播放音效
            this.showMessage('太棒了，你答對了！', 'success');
            this.playSound('correct');
            
            // 答對一題給10分
            this.updateScore(10);
            
            // 播放整題完成語音，語音播放完成後才進入下一題
            this.Speech.speakTemplate('levelComplete', () => {
                this.Debug.logGameFlow('簡單模式：整題完成語音播放完畢');
                
                // 重置檢查狀態
                this.state.isChecking = false;
                
                setTimeout(() => {
                    if (this.state.currentLevel < this.state.totalLevels) {
                        this.nextLevel();
                    } else {
                        this.completeGame();
                    }
                }, 500);
            });
        }
    };

    // 全域函數供 HTML 調用
    window.Game = Game;
    
    // 初始化遊戲
    Game.init();
});