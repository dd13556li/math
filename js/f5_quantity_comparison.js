/**
 * @file F5 數量大小比較 - 完整合併版本
 * @description 數量比較概念教學遊戲 - 配置驅動架構
 * @unit F5 - 數量大小的比較
 * @version 2.2.0 - 配置驅動 + 詳細Debug系統
 */

// =================================================================
// 🐛 Debug 系統 - 詳細的 Console 訊息記錄
// =================================================================

const GameDebug = {
    // Debug 配置
    config: {
        enabled: true,
        categories: {
            init: true,          // 初始化相關
            config: true,        // 配置相關
            gameFlow: true,      // 遊戲流程
            ui: true,           // UI 操作
            audio: true,        // 音效系統
            speech: true,       // 語音系統
            events: true,       // 事件處理
            scoring: true,      // 計分系統
            timer: true,        // 計時器
            generation: true,   // 題目生成
            rendering: true,    // 渲染相關
            animation: true,    // 動畫相關
            errors: true        // 錯誤處理
        },
        colors: {
            init: '#4CAF50',      // 綠色
            config: '#2196F3',    // 藍色
            gameFlow: '#FF9800',  // 橙色
            ui: '#9C27B0',        // 紫色
            audio: '#795548',     // 棕色
            speech: '#607D8B',    // 藍灰色
            events: '#E91E63',    // 粉紅色
            scoring: '#FFC107',   // 黃色
            timer: '#00BCD4',     // 青色
            generation: '#8BC34A', // 淺綠色
            rendering: '#FF5722', // 深橙色
            animation: '#E040FB', // 紫紅色
            errors: '#F44336'     // 紅色
        }
    },

    /**
     * 統一的 Debug 訊息輸出
     */
    log(category, message, data = null) {
        if (!this.config.enabled || !this.config.categories[category]) return;
        
        const color = this.config.colors[category] || '#000000';
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] 🎮 F5 ${category.toUpperCase()}:`;
        
        console.groupCollapsed(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold;`);
        
        if (data) {
            if (typeof data === 'object') {
                console.table(data);
            } else {
                console.log('📊 資料:', data);
            }
        }
        
        console.trace('📍 呼叫堆疊');
        console.groupEnd();
    },

    // 便捷方法
    logInit: (message, data) => GameDebug.log('init', message, data),
    logConfig: (message, data) => GameDebug.log('config', message, data),
    logGameFlow: (message, data) => GameDebug.log('gameFlow', message, data),
    logUI: (message, data) => GameDebug.log('ui', message, data),
    logAudio: (message, data) => GameDebug.log('audio', message, data),
    logSpeech: (message, data) => GameDebug.log('speech', message, data),
    logEvents: (message, data) => GameDebug.log('events', message, data),
    logScoring: (message, data) => GameDebug.log('scoring', message, data),
    logTimer: (message, data) => GameDebug.log('timer', message, data),
    logGeneration: (message, data) => GameDebug.log('generation', message, data),
    logRendering: (message, data) => GameDebug.log('rendering', message, data),
    logAnimation: (message, data) => GameDebug.log('animation', message, data),
    logError: (message, data) => GameDebug.log('errors', message, data),

    /**
     * 效能監控
     */
    performance: {
        timers: {},
        start(label) {
            GameDebug.performance.timers[label] = performance.now();
            GameDebug.log('init', `⏱️ 效能計時開始: ${label}`);
        },
        end(label) {
            if (!GameDebug.performance.timers[label]) return;
            const duration = performance.now() - GameDebug.performance.timers[label];
            GameDebug.log('init', `⏱️ 效能計時結束: ${label}`, `${duration.toFixed(2)}ms`);
            delete GameDebug.performance.timers[label];
        }
    }
};

// =================================================================
// 配置驅動系統 - F5 數量大小比較遊戲配置中心
// =================================================================

const QuantityComparisonConfig = {
    // =====================================================
    // 🎯 遊戲基本配置
    // =====================================================
    game: {
        title: "⚖️ 數量大小的比較",
        version: "2.0.0",
        author: "配置驅動版本"
    },

    // =====================================================
    // 🎨 難度配置
    // =====================================================
    difficulties: {
        easy: {
            id: 'easy',
            label: '簡單 (圖形數量比較)',
            description: '直接看圖形數量，選擇較多、較少或相同',
            visualMode: 'direct',
            showNumbers: true, // 簡單模式顯示數字
            maxQuantity: 10,
            minQuantity: 1,
            objectTypes: ['dots', 'shapes', 'icons'],
            speechFeedback: true,
            autoProgress: true,
            colors: {
                primary: '#28a745',
                secondary: '#20c997',
                correct: '#28a745',
                incorrect: '#dc3545',
                background: 'rgba(40, 167, 69, 0.1)'
            },
            timing: {
                feedbackDelay: 500,
                nextQuestionDelay: 2000,
                speechDelay: 300,
                animationInterval: 1000 // 圖示顯示間隔時間 (1秒)
            },
            scoring: {
                correctAnswer: 10,
                perfectLevel: 50
            },
            // 語音模板配置
            speechTemplates: {
                instruction: '請比較兩邊的數量，選擇正確的關係',
                correct: '太棒了，答對了！',
                incorrect: '再試試看，仔細觀察兩邊的數量',
                correctAnswer: '正確答案已顯示，請觀察兩邊的數量關係',
                complete: '恭喜完成所有題目！'
            }
        },
        normal: {
            id: 'normal',
            label: '普通 (數數驗證)',
            description: '先數出數量，再進行比較判斷',
            visualMode: 'counting',
            showNumbers: true,
            maxQuantity: 20,
            minQuantity: 5,
            objectTypes: ['mixed_shapes', 'animals', 'toys'],
            speechFeedback: true,
            requireConfirmation: true,
            colors: {
                primary: '#007bff',
                secondary: '#0056b3',
                correct: '#28a745',
                incorrect: '#dc3545',
                background: 'rgba(0, 123, 255, 0.1)'
            },
            timing: {
                feedbackDelay: 800,
                nextQuestionDelay: 3000,
                speechDelay: 300
            },
            scoring: {
                correctAnswer: 15,
                perfectLevel: 75
            },
            // 語音模板配置
            speechTemplates: {
                instruction: '請先數出兩邊的數量，再選擇正確的比較關係',
                counting: '左邊有{leftCount}個，右邊有{rightCount}個',
                correct: '太棒了，你數對了也比較對了！',
                incorrect: '再仔細數數看，然後比較大小',
                correctAnswer: '正確答案已顯示，請注意兩邊數量的比較關係',
                complete: '恭喜完成所有題目！'
            }
        },
        hard: {
            id: 'hard',
            label: '困難 (相同數量判斷)',
            description: '重點學習「一樣多」的概念，包含複雜排列',
            visualMode: 'same_quantity_focus',
            showNumbers: false,
            maxQuantity: 15,
            minQuantity: 8,
            objectTypes: ['complex_arrangements', 'patterns', 'groups'],
            speechFeedback: true,
            requireConfirmation: true,
            sameQuantityRatio: 0.4, // 40%機率出現相同數量的題目
            colors: {
                primary: '#dc3545',
                secondary: '#c82333',
                correct: '#28a745',
                incorrect: '#dc3545',
                background: 'rgba(220, 53, 69, 0.1)'
            },
            timing: {
                feedbackDelay: 1000,
                nextQuestionDelay: 4000,
                speechDelay: 300
            },
            scoring: {
                correctAnswer: 20,
                perfectLevel: 100
            },
            // 語音模板配置
            speechTemplates: {
                instruction: '仔細觀察兩邊的數量排列，選擇正確的比較關係',
                sameQuantity: '兩邊的數量是一樣多的！',
                different: '兩邊的數量不一樣',
                correct: '太棒了，你的觀察很仔細！',
                incorrect: '再仔細看看，有時候排列方式會讓數量看起來不同',
                correctAnswer: '正確答案已顯示，請仔細觀察數量關係',
                complete: '恭喜完成所有題目！'
            }
        }
    },

    // =====================================================
    // 🔢 數量範圍配置
    // =====================================================
    quantityRanges: {
        '1-5': {
            id: '1-5',
            label: '1-5',
            description: '基礎數量認知',
            minQuantity: 1,
            maxQuantity: 5
        },
        '1-10': {
            id: '1-10',
            label: '1-10',
            description: '進階數量比較',
            minQuantity: 1,
            maxQuantity: 10
        },
        '5-15': {
            id: '5-15',
            label: '5-15',
            description: '中等範圍挑戰',
            minQuantity: 5,
            maxQuantity: 15
        },
        '10-20': {
            id: '10-20',
            label: '10-20',
            description: '高級數量比較',
            minQuantity: 10,
            maxQuantity: 20
        }
    },

    // =====================================================
    // 🎯 比較類型配置
    // =====================================================
    comparisonTypes: {
        more: {
            id: 'more',
            label: '較多',
            symbol: '>',
            description: '左邊比右邊多',
            icon: '📈',
            color: '#28a745'
        },
        less: {
            id: 'less',
            label: '較少',
            symbol: '<',
            description: '左邊比右邊少',
            icon: '📉',
            color: '#dc3545'
        },
        same: {
            id: 'same',
            label: '一樣多',
            symbol: '=',
            description: '兩邊數量相同',
            icon: '⚖️',
            color: '#007bff'
        }
    },

    // =====================================================
    // 🎨 物件類型配置
    // =====================================================
    objectTypes: {
        dots: {
            id: 'dots',
            label: '圓點',
            emoji: '●',
            colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'],
            arrangement: 'random'
        },
        shapes: {
            id: 'shapes',
            label: '幾何圖形',
            shapes: ['⚫', '🔴', '🔵', '🟡', '🟢', '🟣', '🟠'],
            arrangement: 'grid'
        },
        icons: {
            id: 'icons',
            label: '圖示',
            icons: ['⭐', '🌟', '✨', '💎', '🔥', '⚡', '🌈'],
            arrangement: 'scattered'
        },
        animals: {
            id: 'animals',
            label: '動物',
            icons: ['🐶', '🐱', '🐰', '🐸', '🐻', '🐼', '🦊'],
            arrangement: 'line'
        },
        toys: {
            id: 'toys',
            label: '玩具',
            icons: ['🧸', '🚂', '⚽', '🎈', '🎯', '🎪', '🎭'],
            arrangement: 'cluster'
        },
        fruits: {
            id: 'fruits',
            label: '水果',
            icons: ['🍎', '🍌', '🍊', '🍇', '🍓', '🥝', '🍑'],
            arrangement: 'mixed'
        }
    },

    // =====================================================
    // 📋 題目數量配置
    // =====================================================
    questionCounts: {
        5: {
            id: '5',
            label: '5題',
            description: '快速練習',
            value: 5
        },
        10: {
            id: '10',
            label: '10題',
            description: '標準練習',
            value: 10
        },
        15: {
            id: '15',
            label: '15題',
            description: '加強練習',
            value: 15
        },
        20: {
            id: '20',
            label: '20題',
            description: '完整練習',
            value: 20
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
        180: {
            id: '180',
            label: '180秒',
            description: '寬鬆時間限制',
            value: 180,
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
            warningTime: 15,
            order: 4
        }
    },

    // =====================================================
    // 📝 測驗模式配置
    // =====================================================
    testModes: {
        retry: {
            id: 'retry',
            label: '反複作答',
            description: '答錯時可重複作答直到答對',
            allowRetry: true,
            showCorrectAnswer: false,
            autoNext: false,
            order: 1
        },
        single: {
            id: 'single',
            label: '單次作答',
            description: '每題只能作答一次，答錯後顯示正確答案並進入下一題',
            allowRetry: false,
            showCorrectAnswer: true,
            autoNext: true,
            order: 2
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
    // 🎨 視覺排列配置
    // =====================================================
    arrangements: {
        random: {
            id: 'random',
            name: '隨機散布',
            generator: 'randomScatter'
        },
        grid: {
            id: 'grid',
            name: '網格排列',
            generator: 'gridLayout'
        },
        line: {
            id: 'line',
            name: '直線排列',
            generator: 'lineLayout'
        },
        cluster: {
            id: 'cluster',
            name: '群組排列',
            generator: 'clusterLayout'
        },
        circle: {
            id: 'circle',
            name: '圓形排列',
            generator: 'circleLayout'
        }
    },

    // =====================================================
    // 🎲 難度差異配置
    // =====================================================
    difficultyDifferences: {
        easy: {
            minDifference: 2, // 最小數量差異
            maxDifference: 5, // 最大數量差異
            sameQuantityRate: 0.2 // 20%機率出現相同數量
        },
        normal: {
            minDifference: 1,
            maxDifference: 8,
            sameQuantityRate: 0.3 // 30%機率出現相同數量
        },
        hard: {
            minDifference: 1,
            maxDifference: 3, // 較小的差異增加難度
            sameQuantityRate: 0.4 // 40%機率出現相同數量，重點訓練
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
     * 獲取數量範圍配置
     */
    getQuantityRangeConfig(rangeId) {
        return this.quantityRanges[rangeId] || this.quantityRanges['1-10'];
    },

    /**
     * 獲取時間限制配置
     */
    getTimeLimitConfig(timeId) {
        return this.timeLimits[timeId] || this.timeLimits.none;
    },

    /**
     * 獲取題目數量配置
     */
    getQuestionCountConfig(countId) {
        return this.questionCounts[countId] || this.questionCounts[10];
    },

    /**
     * 獲取音效配置
     */
    getSoundConfig(soundId) {
        return this.soundSettings[soundId] || this.soundSettings.on;
    },

    /**
     * 獲取測驗模式配置
     */
    getTestModeConfig(testModeId) {
        return this.testModes[testModeId] || this.testModes.retry;
    },

    /**
     * 獲取物件類型配置
     */
    getObjectTypeConfig(typeId) {
        return this.objectTypes[typeId] || this.objectTypes.dots;
    },

    /**
     * 獲取比較類型配置
     */
    getComparisonTypeConfig(typeId) {
        return this.comparisonTypes[typeId] || this.comparisonTypes.more;
    },

    /**
     * 獲取完整遊戲配置
     */
    getGameConfig(settings) {
        return {
            difficulty: this.getDifficultyConfig(settings.difficulty),
            quantityRange: this.getQuantityRangeConfig(settings.quantityRange),
            questionCount: this.getQuestionCountConfig(settings.questionCount),
            timeLimit: this.getTimeLimitConfig(settings.time),
            sound: this.getSoundConfig(settings.sound),
            testMode: this.getTestModeConfig(settings.testMode)
        };
    },

    /**
     * 驗證設定完整性
     */
    validateSettings(settings) {
        const required = ['difficulty', 'quantityRange', 'questionCount', 'time', 'sound', 'testMode'];
        return required.every(key => settings[key] !== null && settings[key] !== undefined);
    },

    /**
     * 獲取設定選項列表
     */
    getSettingOptions(category) {
        const configs = {
            difficulty: this.difficulties,
            quantityRange: this.quantityRanges,
            questionCount: this.questionCounts,
            time: this.timeLimits,
            sound: this.soundSettings,
            testMode: this.testModes
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

// =================================================================
// HTML模板系統 - F5 數量大小比較模板
// =================================================================

const QuantityComparisonTemplates = {
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
                        <p class="game-objective">學習目標：比較兩組物品的數量大小</p>
                    </div>
                    
                    <div class="game-settings">
                        ${this.generateSettingGroup('difficulty', '🎯 難度選擇', config.difficultyOptions)}
                        ${this.generateSettingGroup('quantityRange', '🔢 數量範圍', config.quantityRangeOptions)}
                        ${this.generateSettingGroup('questionCount', '📋 題目數量', config.questionCountOptions)}
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
            </div>
        `;
    },

    /**
     * 遊戲頁面模板（採用F3風格）
     */
    gameScreen(config) {
        return `
            <div class="game-container">
                <div class="title-bar">
                    <div id="progress-info">第 ${config.currentLevel}/${config.totalLevels} 題</div>
                    <div>${config.levelTitle}</div>
                    <div class="title-bar-right">
                        <div id="timer-info">時間: ${config.timeDisplay}</div>
                        <div id="score-info">分數: ${config.score}</div>
                        <button class="back-to-menu-btn" onclick="Game.init()">返回</button>
                    </div>
                </div>
                <div class="game-content">
                    <div id="comparison-area" class="comparison-area">
                        <div class="quantity-group left-group" id="left-group">
                            <div class="quantity-counter" id="left-counter">0</div>
                            <div class="group-label">A組</div>
                            <div class="quantity-display" id="left-quantity"></div>
                            <div class="objects-container" id="left-objects"></div>
                        </div>
                        
                        <div class="comparison-symbol" id="comparison-symbol">
                            VS
                        </div>
                        
                        <div class="quantity-group right-group" id="right-group">
                            <div class="quantity-counter" id="right-counter">0</div>
                            <div class="group-label">B組</div>
                            <div class="quantity-display" id="right-quantity"></div>
                            <div class="objects-container" id="right-objects"></div>
                        </div>
                    </div>

                    <div id="answer-area" class="answer-area">
                        <div id="answer-buttons" class="answer-buttons">
                            ${this.comparisonButtons()}
                        </div>
                    </div>

                    </div>
                <div class="fireworks-container" id="fireworks-container"></div>
                ${this.pauseOverlay()}
            </div>
        `;
    },
    
    /**
     * 遊戲版面樣式 (參考F3)
     */
    gameStyles(config) {
        return `
        <style>
            /* 【版面修正】確保容器填滿畫面 */
            html, body {
                height: 100%;
                margin: 0;
                overflow: hidden;
            }

            .game-container { 
                display: flex; 
                flex-direction: column; 
                height: 100vh; 
            }
            .game-content {
                display: flex;
                flex-direction: column;
                flex: 1;
                padding: 20px;
                gap: 15px;
                justify-content: center;
                /* 【**版面核心修正**】改為 center，讓所有內容塊水平居中 */
                align-items: center; 
            }

            .comparison-area, .answer-area, .feedback-area {
                width: 100%;
                /* 限制最大寬度，在大螢幕上不會過寬，更美觀 */
                max-width: 1200px; 
                border-radius: 15px;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 15px;
                box-sizing: border-box;
            }

            .comparison-area {
                background: #e3f2fd;
                border: 3px solid #90caf9;
                flex: 1;
                max-height: 60vh;
                min-height: 300px;
                justify-content: space-evenly;
            }
            
            .answer-area {
                background: #e8f5e9; 
                border: 3px dashed #a5d6a7; 
                flex-shrink: 0; /* 確保作答區不被壓縮 */
                min-height: 120px;
            }

            /* 【**修正**】直接隱藏 feedback-area 以防萬一 */
            .feedback-area {
                display: none;
            }
            
            .quantity-group {
                flex-basis: 45%;
                max-width: 45%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.7);
                border-radius: 10px;
            }

            .group-label {
                font-size: 1.5rem;
                font-weight: bold;
                color: #0d47a1;
            }

            /* 隱藏舊的計數器，因為數字改在上方顯示 */
            .quantity-counter {
                display: none;
            }

            .objects-container {
                width: 100%;
                flex: 1; /* 讓此容器填滿剩餘空間 */
                min-height: 150px;
                position: relative;
                display: flex; 
                flex-wrap: wrap; 
                gap: 15px;
                justify-content: center;
                align-content: center; /* 使用 align-content 處理多行對齊 */
            }

            .quantity-display {
                font-size: 2.5rem;
                font-weight: bold;
                color: #1e88e5;
                min-height: 40px;
                text-align: center; /* 確保數字置中 */
            }
            
            .comparison-symbol {
                font-size: 3rem;
                font-weight: bold;
                color: #f57c00;
            }
            
            .answer-buttons {
                display: flex;
                gap: 20px;
                width: 100%; /* 【按鈕修正】讓按鈕容器佔滿寬度 */
            }

            .comparison-btn {
                flex: 1;
                max-width: 300px; /* 稍微限制寬度，避免在大螢幕上過長 */
                margin: 0 auto; /* 讓按鈕在flex容器中居中 */
                padding: 15px;
                font-size: 1.5rem;
                border-radius: 10px;
                cursor: pointer;
                border: 3px solid transparent;
                background-color: #fff;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                transition: all 0.2s ease;
            }
            
            .comparison-btn:hover {
                transform: translateY(-5px);
                box-shadow: 0 6px 15px rgba(0,0,0,0.15);
            }

            .comparison-btn.selected {
                border-color: #007bff;
            }

            .comparison-btn.correct {
                background-color: #d4edda;
                border-color: #28a745;
                /* 【**動畫強化**】應用新的答對動畫 */
                animation: lively-correct 0.8s ease-out;
            }

            .comparison-btn.incorrect {
                background-color: #f8d7da;
                border-color: #dc3545;
                /* 【**動畫強化**】應用新的答錯動畫 */
                animation: frantic-incorrect 0.7s ease-in-out;
            }

            .object-item {
                font-size: 5rem;
                position: relative;
                left: auto;
                top: auto;
                /* 【動畫修正】新增 forwards，讓動畫結束後停在最終狀態 */
                animation: bounce-in 0.5s ease-out forwards;
            }
            
            .next-container button {
                padding: 10px 25px;
                font-size: 1.2rem;
                border-radius: 20px;
            }

            /* 【**動畫強化**】新的答對動畫 */
            @keyframes lively-correct {
                0% { transform: scale(1); }
                30% { transform: scale(1.15) rotate(-5deg); }
                50% { transform: scale(0.95) rotate(5deg); }
                70% { transform: scale(1.1) rotate(-2deg); }
                100% { transform: scale(1) rotate(0); }
            }

            /* 【**動畫強化**】新的答錯動畫 */
            @keyframes frantic-incorrect {
                0% { transform: translateX(0) rotate(0); }
                15% { transform: translateX(-12px) rotate(-5deg); }
                30% { transform: translateX(12px) rotate(5deg); }
                45% { transform: translateX(-12px) rotate(-5deg); }
                60% { transform: translateX(12px) rotate(5deg); }
                75% { transform: translateX(-6px) rotate(-2deg); }
                90% { transform: translateX(6px) rotate(2deg); }
                100% { transform: translateX(0) rotate(0); }
            }

            @keyframes pulse-correct {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            @keyframes shake-incorrect {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            @keyframes bounce-in {
                0% { opacity: 0; transform: scale(0.5); }
                100% { opacity: 1; transform: scale(1); }
            }
        </style>
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
                            <div class="stat-label">正確率</div>
                            <div class="stat-value">${config.accuracy}</div>
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
            </div>
        `;
    },

    /**
     * 比較按鈕組模板
     */
    comparisonButtons() {
        return `
            <button class="comparison-btn more-btn" data-comparison="more">
                <div class="btn-icon">📈</div>
                <div class="btn-text">A組較多 (&gt;)</div>
            </button>
            <button class="comparison-btn same-btn" data-comparison="same">
                <div class="btn-icon">⚖️</div>
                <div class="btn-text">一樣多 (=)</div>
            </button>
            <button class="comparison-btn less-btn" data-comparison="less">
                <div class="btn-icon">📉</div>
                <div class="btn-text">A組較少 (&lt;)</div>
            </button>
        `;
    },

    /**
     * 物件項目模板
     */
    objectItem(type, content, index, position) {
        // 調整物件大小和邊界，以適應容器
        const objectSize = 35; 
        const containerPadding = 10;
        const adjustedX = containerPadding + (position ? position.x * (1 - (containerPadding * 2 + objectSize) / 300) : 0);
        const adjustedY = containerPadding + (position ? position.y * (1 - (containerPadding * 2 + objectSize) / 200) : 0);
        
        return `
            <div class="object-item ${type}" 
                 data-index="${index}" 
                 style="animation-delay: ${index * 0.05}s; left: ${adjustedX}px; top: ${adjustedY}px;">
                ${content}
            </div>
        `;
    },

    /**
     * 數量顯示模板
     */
    quantityDisplay(quantity, showNumber = false) {
        return showNumber ? `
            <div class="quantity-number">${quantity}</div>
        ` : '';
    },

    /**
     * 下一題按鈕模板
     */
    nextButton() {
        return `<button id="next-btn" class="next-btn">下一題</button>`;
    },

    /**
     * 完成按鈕模板
     */
    completeButton() {
        return `<button id="complete-btn" class="complete-btn">完成測驗</button>`;
    },

    /**
     * 訊息顯示模板
     */
    messageDisplay(type, content) {
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        return `
            <div class="message ${type}">
                <span class="message-icon">${icons[type] || 'ℹ️'}</span>
                <span class="message-text">${content}</span>
            </div>
        `;
    },

    /**
     * 物件排列生成器 - 隨機散布
     */
    generateRandomArrangement(objects, containerWidth = 300, containerHeight = 200) {
        const positions = [];
        const objectSize = 35; // 預設物件大小
        const margin = 5;
        
        for (let i = 0; i < objects.length; i++) {
            let attempts = 0;
            let position;
            
            do {
                position = {
                    x: Math.random() * (containerWidth - objectSize - margin * 2) + margin,
                    y: Math.random() * (containerHeight - objectSize - margin * 2) + margin
                };
                attempts++;
            } while (attempts < 50 && this.checkOverlap(position, positions, objectSize));
            
            positions.push(position);
        }
        
        return positions;
    },

    /**
     * 物件排列生成器 - 網格排列
     */
    generateGridArrangement(objects, containerWidth = 300, containerHeight = 200) {
        const positions = [];
        const objectSize = 35;
        const cols = Math.ceil(Math.sqrt(objects.length));
        const rows = Math.ceil(objects.length / cols);
        
        const cellWidth = containerWidth / cols;
        const cellHeight = containerHeight / rows;
        
        for (let i = 0; i < objects.length; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            
            positions.push({
                x: col * cellWidth + (cellWidth - objectSize) / 2,
                y: row * cellHeight + (cellHeight - objectSize) / 2
            });
        }
        
        return positions;
    },

    /**
     * 物件排列生成器 - 直線排列
     */
    generateLineArrangement(objects, containerWidth = 300, containerHeight = 200) {
        const positions = [];
        const objectSize = 35;
        const spacing = Math.min((containerWidth - objectSize) / (objects.length -1 || 1), 45);
        const totalWidth = (objects.length - 1) * spacing;
        const startX = (containerWidth - totalWidth - objectSize) / 2;
        const y = (containerHeight - objectSize) / 2;
        
        for (let i = 0; i < objects.length; i++) {
            positions.push({
                x: startX + i * spacing,
                y: y
            });
        }
        
        return positions;
    },

    /**
     * 檢查物件重疊
     */
    checkOverlap(newPosition, existingPositions, objectSize) {
        const minDistance = objectSize;
        
        return existingPositions.some(pos => {
            const dx = newPosition.x - pos.x;
            const dy = newPosition.y - pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < minDistance;
        });
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
    },

    /**
     * 載入中模板
     */
    loadingScreen() {
        return `
            <div class="loading-screen">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h3>載入中...</h3>
                    <p>正在準備數量比較遊戲</p>
                </div>
            </div>
        `;
    }
};

// =================================================================
// 主遊戲邏輯 - F5 數量大小比較遊戲控制器
// =================================================================

/**
 * F5 數量大小比較遊戲主控制器
 * 基於 F4 架構，專注於比較概念教學
 */
class QuantityComparisonGame {
    constructor() {
        GameDebug.performance.start('game-constructor');
        GameDebug.logInit('🚀 遊戲建構子開始執行', { version: '2.2.0' });
        
        // 核心系統初始化
        this.Debug = GameDebug; // 整合 Debug 系統
        this.config = QuantityComparisonConfig;
        this.templates = QuantityComparisonTemplates;
        
        GameDebug.logConfig('📋 配置系統載入完成', {
            difficulties: Object.keys(this.config.difficulties),
            quantityRanges: Object.keys(this.config.quantityRanges),
            timeLimits: Object.keys(this.config.timeLimits)
        });
        
        // 遊戲狀態初始化
        this.gameState = 'menu'; // menu, playing, paused, finished
        this.currentLevel = 1;
        this.totalLevels = 10;
        this.score = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        
        GameDebug.logInit('🎮 遊戲狀態初始化完成', {
            gameState: this.gameState,
            currentLevel: this.currentLevel,
            totalLevels: this.totalLevels,
            score: this.score
        });
        
        // 遊戲設定初始化
        this.gameSettings = {
            difficulty: null,
            quantityRange: null,
            questionCount: null,
            time: null,
            sound: null,
            testMode: null
        };
        
        GameDebug.logConfig('⚙️ 遊戲設定初始化', this.gameSettings);
        
        // 當前題目資料
        this.currentQuestion = null;
        this.timer = null;
        this.timeRemaining = null;
        
        // 音效系統初始化
        this.sounds = {
            correct: document.getElementById('correct-sound'),
            success: document.getElementById('success-sound'),
            error: document.getElementById('error-sound'),
            select: document.getElementById('menu-select-sound'),
            click: document.getElementById('click-sound')
        };
        
        // 檢查音效元素載入狀況
        const soundStatus = {};
        Object.keys(this.sounds).forEach(key => {
            soundStatus[key] = this.sounds[key] ? '✅ 已載入' : '❌ 缺失';
        });
        GameDebug.logAudio('🔊 音效系統初始化', soundStatus);
        
        // 語音系統初始化
        this.speechSynth = window.speechSynthesis;
        this.currentVoice = null;
        
        GameDebug.logSpeech('🎤 語音合成系統初始化', {
            speechSynth: this.speechSynth ? '✅ 可用' : '❌ 不可用',
            voicesLoaded: this.speechSynth ? this.speechSynth.getVoices().length : 0
        });
        
        // 啟動遊戲
        this.init();
        
        GameDebug.performance.end('game-constructor');
        GameDebug.logInit('✅ 遊戲建構完成');
    }
    
    /**
     * 初始化遊戲
     */
    init() {
        this.Debug.performance.start('game-init');
        this.Debug.logGameFlow('🎲 遊戲初始化開始');
        
        this.gameState = 'menu';
        this.Debug.logGameFlow('📋 遊戲狀態設為: menu');
        
        this.setupSpeechSynthesis();
        this.showSettingsScreen();
        this.bindEvents();
        
        this.Debug.performance.end('game-init');
        this.Debug.logGameFlow('✅ 遊戲初始化完成');
    }
    
    /**
     * 設置語音合成
     */
    setupSpeechSynthesis() {
        this.Debug.logSpeech('🎤 開始設置語音合成系統');
        
        if (!this.speechSynth) {
            this.Debug.logError('❌ 語音合成不可用', 'speechSynthesis 未定義');
            return;
        }
        
        const setVoice = () => {
            const voices = this.speechSynth.getVoices();
            this.Debug.logSpeech('🔍 檢測到語音', `共 ${voices.length} 個語音`);
            
            if (voices.length === 0) {
                this.Debug.logSpeech('⚠️ 暫無語音可用，等待載入');
                return;
            }
            
            // 按照 CLAUDE.md 建議使用配置驅動的首選語音
            const preferredVoices = ['Microsoft HsiaoChen Online', 'Google 國語 (臺灣)'];
            this.currentVoice = voices.find(v => preferredVoices.includes(v.name));
            
            if (this.currentVoice) {
                this.Debug.logSpeech('✅ 找到首選語音', {
                    name: this.currentVoice.name,
                    lang: this.currentVoice.lang,
                    voiceURI: this.currentVoice.voiceURI
                });
            } else {
                // 備選方案：尋找其他繁體中文語音（排除 Hanhan）
                const twVoices = voices.filter(v => v.lang === 'zh-TW' && !v.name.includes('Hanhan'));
                this.currentVoice = twVoices[0];
                
                if (this.currentVoice) {
                    this.Debug.logSpeech('⚠️ 使用備選繁中語音', {
                        name: this.currentVoice.name,
                        lang: this.currentVoice.lang
                    });
                } else {
                    // 最終備選：任何中文語音
                    this.currentVoice = voices.find(v => v.lang.includes('zh'));
                    if (this.currentVoice) {
                        this.Debug.logSpeech('⚠️ 使用最終備選中文語音', {
                            name: this.currentVoice.name,
                            lang: this.currentVoice.lang
                        });
                    } else {
                        this.Debug.logError('❌ 找不到任何中文語音');
                    }
                }
            }
        };

        if (this.speechSynth.onvoiceschanged !== undefined) {
            this.speechSynth.onvoiceschanged = setVoice;
            this.Debug.logSpeech('📡 設置語音變更監聽器');
        }
        
        setVoice();
    }
    
    /**
     * 顯示設定畫面
     */
    showSettingsScreen() {
        this.Debug.logUI('📋 顯示設定畫面');
        
        const appContainer = document.getElementById('app');
        if (!appContainer) {
            this.Debug.logError('❌ 找不到 app 容器元素');
            return;
        }
        
        // 配置驅動的 UI 生成 (按照 CLAUDE.md 原則)
        const config = {
            gameTitle: this.config.game.title,
            difficultyOptions: this.config.getSettingOptions('difficulty'),
            quantityRangeOptions: this.config.getSettingOptions('quantityRange'),
            questionCountOptions: this.config.getSettingOptions('questionCount'),
            timeOptions: this.config.getSettingOptions('time'),
            testModeOptions: this.config.getSettingOptions('testMode'),
            soundOptions: this.config.getSettingOptions('sound')
        };
        
        this.Debug.logConfig('⚙️ 設定畫面配置生成完成', {
            gameTitle: config.gameTitle,
            optionsCount: {
                difficulty: config.difficultyOptions.length,
                quantityRange: config.quantityRangeOptions.length,
                questionCount: config.questionCountOptions.length,
                time: config.timeOptions.length,
                sound: config.soundOptions.length
            }
        });
        
        appContainer.innerHTML = this.templates.settingsScreen(config);
        this.updateStartButton();
        
        this.Debug.logUI('✅ 設定畫面渲染完成');
    }
    
    /**
     * 綁定事件監聽器
     */
    bindEvents() {
        // 使用事件委託處理所有按鈕點擊
        document.body.addEventListener('click', async (event) => {
            const target = event.target;
            if (target.classList.contains('selection-btn')) {
                this.handleSettingSelection(event);
            } else if (target.id === 'start-game-btn') {
                await this.startGame();
            } else if (target.closest('.comparison-btn')) {
                this.handleComparisonAnswer(event);
            } else if (target.id === 'next-btn') {
                await this.nextQuestion();
            } else if (target.id === 'complete-btn') {
                this.completeGame();
            }
        });
        
        // 鍵盤快捷鍵
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });
        
        // 語音載入完成事件
        if (this.speechSynth && this.speechSynth.onvoiceschanged !== undefined) {
            this.speechSynth.onvoiceschanged = () => this.setupSpeechSynthesis();
        }
    }
    
    /**
     * 處理設定選擇
     */
    handleSettingSelection(event) {
        const button = event.target;
        const type = button.dataset.type;
        const value = button.dataset.value;
        
        this.Debug.logEvents('🎯 處理設定選擇', { type, value });
        
        // 配置驅動的音效播放 (按照 CLAUDE.md 原則)
        this.playSound('select');
        
        // UI 狀態更新
        const buttonGroup = button.parentElement;
        buttonGroup.querySelectorAll('.selection-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // 儲存設定
        const previousValue = this.gameSettings[type];
        this.gameSettings[type] = value;
        
        this.Debug.logConfig('⚙️ 設定已更新', {
            type,
            previousValue,
            newValue: value,
            allSettings: { ...this.gameSettings }
        });
        
        // 更新開始按鈕狀態
        this.updateStartButton();
    }
    
    /**
     * 更新開始按鈕狀態
     */
    updateStartButton() {
        const startBtn = document.getElementById('start-game-btn');
        if (!startBtn) return;
        
        const allSettingsComplete = this.config.validateSettings(this.gameSettings);
        
        if (allSettingsComplete) {
            startBtn.disabled = false;
            startBtn.textContent = '開始遊戲';
            startBtn.classList.add('ready');
        } else {
            startBtn.disabled = true;
            startBtn.textContent = '請完成所有設定';
            startBtn.classList.remove('ready');
        }
    }
    
    /**
     * 開始遊戲
     */
    async startGame() {
        this.Debug.performance.start('start-game');
        this.Debug.logGameFlow('🚀 開始遊戲');
        
        // 驗證設定完整性
        if (!this.config.validateSettings(this.gameSettings)) {
            this.Debug.logError('❌ 設定不完整，無法開始遊戲', this.gameSettings);
            return;
        }
        
        this.Debug.logConfig('✅ 設定驗證通過', this.gameSettings);
        
        // 配置驅動的音效播放
        this.playSound('click');
        this.gameState = 'playing';
        
        // 獲取遊戲配置 (按照 CLAUDE.md 配置驅動原則)
        const gameConfig = this.config.getGameConfig(this.gameSettings);
        this.Debug.logConfig('🎮 遊戲配置生成完成', {
            difficulty: gameConfig.difficulty.label,
            quantityRange: `${gameConfig.quantityRange.minQuantity}-${gameConfig.quantityRange.maxQuantity}`,
            questionCount: gameConfig.questionCount.value,
            timeLimit: gameConfig.timeLimit.value,
            soundEnabled: gameConfig.sound.enabled
        });
        
        // 初始化遊戲狀態
        this.currentLevel = 1;
        this.totalLevels = gameConfig.questionCount.value;
        this.score = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        
        // 設置計時器
        if (gameConfig.timeLimit.value) {
            this.timeRemaining = gameConfig.timeLimit.value;
        }
        
        this.Debug.logGameFlow('🎯 遊戲狀態重置完成', {
            currentLevel: this.currentLevel,
            totalLevels: this.totalLevels,
            timeRemaining: this.timeRemaining
        });
        
        this.showGameScreen();
        await this.generateQuestion();
        
        if (this.timeRemaining) {
            this.startTimer();
        }
        
        this.Debug.performance.end('start-game');
        this.Debug.logGameFlow('✅ 遊戲啟動完成');
    }
    
    /**
     * 顯示遊戲畫面
     */
    showGameScreen() {
        const appContainer = document.getElementById('app');
        const gameConfig = this.config.getGameConfig(this.gameSettings);
        
        const config = {
            difficulty: gameConfig.difficulty.id,
            levelTitle: `${this.config.game.title}`,
            currentLevel: this.currentLevel,
            totalLevels: this.totalLevels,
            score: this.score,
            timeDisplay: this.timeRemaining ? this.formatTime(this.timeRemaining) : '--'
        };
        
        appContainer.innerHTML = this.templates.gameScreen(config);
        appContainer.insertAdjacentHTML('beforeend', this.templates.gameStyles(config));
    }
    
    
    /**
     * 生成題目
     */
    async generateQuestion() {
        this.Debug.performance.start('generate-question');
        this.Debug.logGeneration('🎲 開始生成題目', { level: this.currentLevel });
        
        const gameConfig = this.config.getGameConfig(this.gameSettings);
        const difficulty = gameConfig.difficulty;
        const quantityRange = gameConfig.quantityRange;
        
        this.Debug.logGeneration('📊 使用配置生成題目', {
            difficulty: difficulty.label,
            quantityRange: `${quantityRange.minQuantity}-${quantityRange.maxQuantity}`,
            objectTypes: difficulty.objectTypes
        });
        
        // 生成兩組物件的數量 (配置驅動)
        const quantities = this.generateQuantities(difficulty, quantityRange);
        const leftQuantity = quantities.left;
        const rightQuantity = quantities.right;
        
        this.Debug.logGeneration('🔢 數量生成完成', { leftQuantity, rightQuantity });
        
        // 確定正確答案
        let correctAnswer;
        if (leftQuantity > rightQuantity) {
            correctAnswer = 'more';
        } else if (leftQuantity < rightQuantity) {
            correctAnswer = 'less';
        } else {
            correctAnswer = 'same';
        }
        
        this.Debug.logGeneration('✅ 正確答案確定', { correctAnswer });
        
        // 選擇物件類型 (配置驅動)
        const objectTypes = difficulty.objectTypes;
        const selectedType = objectTypes[Math.floor(Math.random() * objectTypes.length)];
        const objectConfig = this.config.getObjectTypeConfig(selectedType);
        
        this.Debug.logGeneration('🎨 物件類型選定', {
            selectedType,
            objectConfig: objectConfig.label,
            arrangement: objectConfig.arrangement
        });
        
        // 創建題目物件
        this.currentQuestion = {
            leftQuantity,
            rightQuantity,
            correctAnswer,
            objectType: selectedType,
            objectConfig,
            answered: false
        };
        
        this.Debug.logGeneration('📝 題目生成完成', this.currentQuestion);
        
        await this.renderQuestion();
        this.speakInstruction(difficulty);
        
        this.Debug.performance.end('generate-question');
    }
    
    /**
     * 生成數量組合
     */
    generateQuantities(difficulty, quantityRange) {
        const min = quantityRange.minQuantity;
        const max = quantityRange.maxQuantity;
        const diffConfig = this.config.difficultyDifferences[difficulty.id];
        
        let leftQuantity, rightQuantity;
        
        // 決定是否生成相同數量
        const shouldGenerateSame = Math.random() < diffConfig.sameQuantityRate;
        
        if (shouldGenerateSame) {
            // 生成相同數量
            leftQuantity = rightQuantity = min + Math.floor(Math.random() * (max - min + 1));
        } else {
            // 生成不同數量
            leftQuantity = min + Math.floor(Math.random() * (max - min + 1));
            
            let attempts = 0;
            do {
                rightQuantity = min + Math.floor(Math.random() * (max - min + 1));
                attempts++;
            } while (
                attempts < 50 && 
                (Math.abs(leftQuantity - rightQuantity) < diffConfig.minDifference ||
                 Math.abs(leftQuantity - rightQuantity) > diffConfig.maxDifference)
            );
        }
        
        return { left: leftQuantity, right: rightQuantity };
    }
    
    /**
     * 渲染題目
     */
    async renderQuestion() {
        const { leftQuantity, rightQuantity, objectConfig } = this.currentQuestion;
        const gameConfig = this.config.getGameConfig(this.gameSettings);
        
        // 清空容器和數字
        document.getElementById('left-objects').innerHTML = '';
        document.getElementById('right-objects').innerHTML = '';
        document.getElementById('left-quantity').innerHTML = '';
        document.getElementById('right-quantity').innerHTML = '';

        // 根據難度選擇渲染方式
        if (gameConfig.difficulty.id === 'easy') {
            // 簡單模式：使用同步動畫渲染
            await this.renderObjectsAnimated(leftQuantity, rightQuantity, objectConfig);
        } else {
            // 一般和困難模式：使用標準渲染
            this.renderObjects('left-objects', leftQuantity, objectConfig);
            this.renderObjects('right-objects', rightQuantity, objectConfig);
            
            // 是否顯示數量
            if (gameConfig.difficulty.showNumbers) {
                document.getElementById('left-quantity').innerHTML = 
                    this.templates.quantityDisplay(leftQuantity, true);
                document.getElementById('right-quantity').innerHTML = 
                    this.templates.quantityDisplay(rightQuantity, true);
            }
        }
        
        // 重置答案按鈕狀態
        document.querySelectorAll('.comparison-btn').forEach(btn => {
            btn.classList.remove('selected', 'correct', 'incorrect');
            btn.disabled = false;
        });
        
        // 清除訊息和下一題按鈕
        document.getElementById('message-area').innerHTML = '';
        document.getElementById('next-container').innerHTML = '';
    }
    
    /**
     * 渲染物件
     */
    renderObjects(containerId, quantity, objectConfig) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // 生成物件內容
        const objects = [];
        for (let i = 0; i < quantity; i++) {
            let content;
            if (objectConfig.emoji) {
                content = objectConfig.emoji;
            } else if (objectConfig.shapes) {
                content = objectConfig.shapes[i % objectConfig.shapes.length];
            } else if (objectConfig.icons) {
                content = objectConfig.icons[i % objectConfig.icons.length];
            } else {
                content = '●';
            }
            objects.push(content);
        }
        
        // 生成排列位置
        const arrangement = objectConfig.arrangement || 'random';
        const containerWidth = container.offsetWidth || 300;
        const containerHeight = container.offsetHeight || 200;
        let positions;
        
        switch (arrangement) {
            case 'grid':
                positions = this.templates.generateGridArrangement(objects, containerWidth, containerHeight);
                break;
            case 'line':
                positions = this.templates.generateLineArrangement(objects, containerWidth, containerHeight);
                break;
            default:
                positions = this.templates.generateRandomArrangement(objects, containerWidth, containerHeight);
        }
        
        // 生成 HTML
        container.innerHTML = objects.map((content, index) => 
            this.templates.objectItem(
                objectConfig.id,
                content,
                index,
                positions[index]
            )
        ).join('');
        
        // 設置容器為相對定位
        container.style.position = 'relative';
        container.style.height = '200px';
    }

    /**
     * 同步動畫渲染物件（用於簡單模式）
     */
    async renderObjectsAnimated(leftQuantity, rightQuantity, objectConfig) {
        this.Debug.logAnimation('🎬 開始同步動畫渲染', {
            leftQuantity,
            rightQuantity,
            objectConfig: objectConfig.id
        });

        // 獲取相關 DOM 元素
        const leftContainer = document.getElementById('left-objects');
        const rightContainer = document.getElementById('right-objects');
        const leftQuantityDisplay = document.getElementById('left-quantity');
        const rightQuantityDisplay = document.getElementById('right-quantity');

        // 清空容器和數字顯示
        leftContainer.innerHTML = '';
        rightContainer.innerHTML = '';
        leftQuantityDisplay.innerHTML = this.templates.quantityDisplay(0, true);
        rightQuantityDisplay.innerHTML = this.templates.quantityDisplay(0, true);

        const maxQuantity = Math.max(leftQuantity, rightQuantity);
        const gameConfig = this.config.getGameConfig(this.gameSettings);
        const animationInterval = gameConfig.difficulty.timing?.animationInterval || 400;
        
        // 異步迴圈，逐一顯示圖示
        for (let i = 0; i < maxQuantity; i++) {
            const showLeft = i < leftQuantity;
            const showRight = i < rightQuantity;
            
            if (showLeft || showRight) {
                // 【音效修正】移除 this.playSound('click');
                // 【語音修正】改為唸出當前的數字 (i 從 0 開始，所以要 +1)
                this.speak(String(i + 1));
            }

            // 顯示左側物件和更新數字
            if (showLeft) {
                const content = objectConfig.shapes ? objectConfig.shapes[i % objectConfig.shapes.length] : '●';
                // 【版面修正】最後一個參數設為 null，讓 CSS flexbox 控制位置
                const leftItemHTML = this.templates.objectItem(objectConfig.id, content, i, null);
                leftContainer.insertAdjacentHTML('beforeend', leftItemHTML);
                
                // 【數字同步】更新上方數字
                leftQuantityDisplay.innerHTML = this.templates.quantityDisplay(i + 1, true);
            }

            // 顯示右側物件和更新數字
            if (showRight) {
                const content = objectConfig.shapes ? objectConfig.shapes[i % objectConfig.shapes.length] : '●';
                const rightItemHTML = this.templates.objectItem(objectConfig.id, content, i, null);
                rightContainer.insertAdjacentHTML('beforeend', rightItemHTML);

                // 【數字同步】更新上方數字
                rightQuantityDisplay.innerHTML = this.templates.quantityDisplay(i + 1, true);
            }

            // 等待間隔時間
            if (i < maxQuantity - 1) {
                await new Promise(resolve => setTimeout(resolve, animationInterval));
            }
        }

        this.Debug.logAnimation('✅ 同步動畫渲染完成', {
            leftQuantity,
            rightQuantity,
            totalTime: maxQuantity * animationInterval
        });
    }
    
    /**
     * 處理比較答案
     */
    handleComparisonAnswer(event) {
        // 配置驅動的重複答題檢查 (按照 CLAUDE.md 原則)
        const gameConfig = this.config.getGameConfig(this.gameSettings);
        const testMode = gameConfig.testMode;
        
        if (this.currentQuestion.answered && !testMode.allowRetry) {
            this.Debug.logEvents('⚠️ 重複答題，忽略', { testMode: testMode.id });
            return;
        }
        
        const button = event.target.closest('.comparison-btn');
        if (!button) {
            this.Debug.logError('❌ 無效的比較按鈕');
            return;
        }
        
        const selectedAnswer = button.dataset.comparison;
        
        this.Debug.logEvents('🎯 處理比較答案', {
            selectedAnswer,
            correctAnswer: this.currentQuestion.correctAnswer,
            leftQuantity: this.currentQuestion.leftQuantity,
            rightQuantity: this.currentQuestion.rightQuantity
        });
        
        // 配置驅動的音效播放
        this.playSound('select');
        
        // 標記按鈕為已選擇
        document.querySelectorAll('.comparison-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        button.classList.add('selected');
        
        // 檢查答案
        const isCorrect = selectedAnswer === this.currentQuestion.correctAnswer;
        
        this.Debug.logScoring('📊 答題統計更新', {
            isCorrect,
            selectedAnswer,
            correctAnswer: this.currentQuestion.correctAnswer,
            testMode: testMode.id,
            currentLevel: this.currentLevel
        });
        
        if (isCorrect) {
            // 正確答案：所有模式都標記為已答題並計分
            this.currentQuestion.answered = true;
            this.totalAnswers++;
            this.handleCorrectAnswer(button);
            
            // 禁用所有按鈕
            document.querySelectorAll('.comparison-btn').forEach(btn => {
                btn.disabled = true;
            });
            
            // 延遲後進入下一題
            const delay = gameConfig.difficulty.timing.nextQuestionDelay;
            this.Debug.logGameFlow('⏳ 正確答案延遲進入下一題', { delay });
            
            setTimeout(() => {
                this.showNextButton();
            }, delay);
            
        } else {
            // 錯誤答案：根據測驗模式處理
            if (testMode.allowRetry) {
                // 反複作答模式：不標記為已答題，允許重新回答
                this.handleIncorrectAnswer(button);
                
                // 重置按鈕選擇狀態，允許重新選擇
                setTimeout(() => {
                    document.querySelectorAll('.comparison-btn').forEach(btn => {
                        btn.classList.remove('selected', 'correct', 'incorrect');
                        btn.disabled = false;
                    });
                }, 1500);
                
                this.Debug.logGameFlow('🔄 反複作答模式：允許重新回答');
                
            } else {
                // 單次作答模式：標記為已答題，顯示正確答案
                this.currentQuestion.answered = true;
                this.totalAnswers++;
                this.handleIncorrectAnswer(button);
                
                // 顯示正確答案
                if (testMode.showCorrectAnswer) {
                    setTimeout(() => {
                        this.showCorrectAnswer();
                    }, 1000);
                }
                
                // 禁用所有按鈕
                document.querySelectorAll('.comparison-btn').forEach(btn => {
                    btn.disabled = true;
                });
                
                // 延遲後自動進入下一題
                const delay = gameConfig.difficulty.timing.nextQuestionDelay + 2000;
                this.Debug.logGameFlow('⏳ 單次作答模式延遲進入下一題', { delay });
                
                setTimeout(() => {
                    this.showNextButton();
                }, delay);
            }
        }
    }
    
    /**
     * 處理正確答案
     */
    handleCorrectAnswer(button) {
        this.Debug.logScoring('✅ 處理正確答案');
        
        button.classList.add('correct');
        
        this.correctAnswers++;
        const gameConfig = this.config.getGameConfig(this.gameSettings);
        const points = gameConfig.difficulty.scoring.correctAnswer;
        this.score += points;
        
        this.Debug.logScoring('📈 分數更新', {
            pointsEarned: points,
            totalScore: this.score,
            correctAnswers: this.correctAnswers,
            accuracy: Math.round((this.correctAnswers / this.totalAnswers) * 100)
        });
        
        this.updateGameInfo();
        
        // 配置驅動的音效和語音 (按照 CLAUDE.md 原則)
        this.playSound('correct');
        
        // 顯示成功訊息
        const messageArea = document.getElementById('message-area');
        if (messageArea) {
            messageArea.innerHTML = this.templates.messageDisplay(
                'success', 
                gameConfig.difficulty.speechTemplates.correct
            );
        }
        
        // 使用配置驅動的語音模板
        this.speak(gameConfig.difficulty.speechTemplates.correct);
    }
    
    /**
     * 處理錯誤答案
     */
    handleIncorrectAnswer(button) {
        button.classList.add('incorrect');
        
        // 標示正確答案
        const correctBtn = document.querySelector(`[data-comparison="${this.currentQuestion.correctAnswer}"]`);
        if (correctBtn) {
            correctBtn.classList.add('correct');
        }
        
        this.playSound('error');
        
        // 顯示錯誤訊息
        const gameConfig = this.config.getGameConfig(this.gameSettings);
        const messageArea = document.getElementById('message-area');
        messageArea.innerHTML = this.templates.messageDisplay(
            'error', 
            gameConfig.difficulty.speechTemplates.incorrect
        );
        
        // 語音回饋
        this.speak(gameConfig.difficulty.speechTemplates.incorrect);
    }
    
    /**
     * 顯示正確答案 (用於單次作答模式)
     */
    showCorrectAnswer() {
        const correctBtn = document.querySelector(`[data-comparison="${this.currentQuestion.correctAnswer}"]`);
        if (correctBtn) {
            correctBtn.classList.add('correct');
        }
        
        // 顯示正確答案訊息
        const gameConfig = this.config.getGameConfig(this.gameSettings);
        const messageArea = document.getElementById('message-area');
        const correctAnswerMessage = gameConfig.difficulty.speechTemplates.correctAnswer || '正確答案已顯示';
        
        messageArea.innerHTML = this.templates.messageDisplay(
            'info',
            correctAnswerMessage
        );
        
        this.Debug.logGameFlow('✅ 顯示正確答案', {
            correctAnswer: this.currentQuestion.correctAnswer,
            testMode: gameConfig.testMode.id
        });
    }
    
    /**
     * 顯示下一題按鈕
     */
    showNextButton() {
        const nextContainer = document.getElementById('next-container');
        if (this.currentLevel < this.totalLevels) {
            nextContainer.innerHTML = this.templates.nextButton();
        } else {
            nextContainer.innerHTML = this.templates.completeButton();
        }
    }
    
    /**
     * 下一題
     */
    async nextQuestion() {
        this.currentLevel++;
        this.updateGameInfo();
        await this.generateQuestion();
    }
    
    /**
     * 完成遊戲
     */
    completeGame() {
        this.gameState = 'finished';
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.playSound('success');
        this.showResultsScreen();
    }
    
    /**
     * 顯示結果畫面
     */
    showResultsScreen() {
        const appContainer = document.getElementById('app');
        const accuracy = Math.round((this.correctAnswers / this.totalAnswers) * 100);
        
        let trophy, title, message;
        if (accuracy >= 90) {
            trophy = '🏆';
            title = '完美表現！';
            message = '你對數量比較的掌握非常優秀！';
        } else if (accuracy >= 70) {
            trophy = '🥉';
            title = '表現良好！';
            message = '繼續練習，你會越來越棒！';
        } else {
            trophy = '🎯';
            title = '持續努力！';
            message = '多練習數量比較，加油！';
        }
        
        const config = {
            trophy,
            title,
            message,
            score: this.score,
            accuracy: `${accuracy}%`,
            timeUsed: this.timeRemaining ? 
                this.formatTime(this.config.getGameConfig(this.gameSettings).timeLimit.value - this.timeRemaining) :
                '無時間限制'
        };
        
        appContainer.innerHTML = this.templates.resultsScreen(config);
        
        // 語音回饋
        const gameConfig = this.config.getGameConfig(this.gameSettings);
        this.speak(gameConfig.difficulty.speechTemplates.complete);
    }
    
    /**
     * 更新遊戲資訊顯示
     */
    updateGameInfo() {
        const progressInfo = document.getElementById('progress-info');
        if (progressInfo) progressInfo.textContent = `第 ${this.currentLevel}/${this.totalLevels} 題`;
        
        const scoreInfo = document.getElementById('score-info');
        if (scoreInfo) scoreInfo.textContent = `分數: ${this.score}`;
    }
    
    /**
     * 開始計時器
     */
    startTimer() {
        this.Debug.logTimer('⏰ 開始計時器', { timeRemaining: this.timeRemaining });
        
        if (this.timer) {
            clearInterval(this.timer);
            this.Debug.logTimer('🔄 清除舊計時器');
        }
        
        this.timer = setInterval(() => {
            if (this.gameState !== 'playing') {
                clearInterval(this.timer);
                this.Debug.logTimer('⏹️ 遊戲狀態變化，停止計時器', { gameState: this.gameState });
                return;
            }

            this.timeRemaining--;
            
            this.Debug.logTimer('⏳ 時間減少', { 
                timeRemaining: this.timeRemaining,
                formattedTime: this.formatTime(this.timeRemaining)
            });
            
            const timerInfo = document.getElementById('timer-info');
            if (timerInfo) {
                timerInfo.textContent = `時間: ${this.formatTime(this.timeRemaining)}`;
            }
            
            // 配置驅動的時間警告 (按照 CLAUDE.md 原則)
            const gameConfig = this.config.getGameConfig(this.gameSettings);
            if (this.timeRemaining === gameConfig.timeLimit.warningTime) {
                this.Debug.logTimer('⚠️ 時間警告觸發', { warningTime: gameConfig.timeLimit.warningTime });
                this.playSound('error');
            }
            
            // 時間到
            if (this.timeRemaining <= 0) {
                clearInterval(this.timer);
                this.Debug.logTimer('⌛ 時間到，結束遊戲');
                this.completeGame();
            }
        }, 1000);
    }
    
    /**
     * 格式化時間顯示
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * 語音合成
     */
    speak(text, callback = null) {
        const gameConfig = this.config.getGameConfig(this.gameSettings);
        
        this.Debug.logSpeech('🎤 嘗試語音播放', {
            text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
            soundEnabled: gameConfig.sound.enabled,
            speechSynth: !!this.speechSynth,
            currentVoice: this.currentVoice ? this.currentVoice.name : null,
            hasCallback: !!callback
        });
        
        if (!gameConfig.sound.enabled) {
            this.Debug.logSpeech('🔇 音效已關閉，跳過語音');
            if (callback) callback();
            return;
        }
        
        if (!this.speechSynth) {
            this.Debug.logError('❌ 語音合成不可用');
            if (callback) callback();
            return;
        }
        
        if (!this.currentVoice) {
            this.Debug.logError('❌ 未設置語音');
            if (callback) callback();
            return;
        }
        
        // 停止當前語音
        this.speechSynth.cancel();
        this.Debug.logSpeech('🛑 停止當前語音');
        
        // 配置驅動的語音設置 (按照 CLAUDE.md 原則)
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.currentVoice;
        utterance.rate = 1.0; // 標準語速 (配置化)
        utterance.lang = this.currentVoice.lang; // 動態語言設定
        
        if (callback) {
            utterance.onend = () => {
                this.Debug.logSpeech('✅ 語音播放完成');
                callback();
            };
        }
        
        utterance.onerror = (event) => {
            this.Debug.logError('❌ 語音播放錯誤', { error: event.error });
            if (callback) callback();
        };
        
        // 使用配置的延遲時間
        const delay = gameConfig.difficulty.timing.speechDelay;
        this.Debug.logSpeech('⏳ 延遲語音播放', { delay });
        
        setTimeout(() => {
            this.Debug.logSpeech('▶️ 開始語音播放', {
                voice: this.currentVoice.name,
                rate: utterance.rate,
                lang: utterance.lang
            });
            this.speechSynth.speak(utterance);
        }, delay);
    }
    
    /**
     * 語音指令
     */
    speakInstruction(difficulty) {
        this.speak(difficulty.speechTemplates.instruction);
    }
    
    /**
     * 播放音效
     */
    playSound(soundName) {
        const gameConfig = this.config.getGameConfig(this.gameSettings);
        
        this.Debug.logAudio('🔊 嘗試播放音效', {
            soundName,
            soundEnabled: gameConfig.sound.enabled
        });
        
        if (!gameConfig.sound.enabled) {
            this.Debug.logAudio('🔇 音效已關閉，跳過播放');
            return;
        }
        
        const sound = this.sounds[soundName];
        if (!sound) {
            this.Debug.logError('❌ 音效檔案不存在', { soundName });
            return;
        }
        
        try {
            sound.currentTime = 0;
            sound.play()
                .then(() => {
                    this.Debug.logAudio('✅ 音效播放成功', { soundName });
                })
                .catch(e => {
                    this.Debug.logError('❌ 音效播放失敗', { soundName, error: e.message });
                });
        } catch (error) {
            this.Debug.logError('❌ 音效播放異常', { soundName, error: error.message });
        }
    }
    
    /**
     * 處理鍵盤按鍵
     */
    handleKeyPress(event) {
        if (this.gameState !== 'playing') return;
        
        switch (event.key) {
            case '1':
                // A組較多
                document.querySelector('[data-comparison="more"]')?.click();
                break;
            case '2':
                // 一樣多
                document.querySelector('[data-comparison="same"]')?.click();
                break;
            case '3':
                // A組較少
                document.querySelector('[data-comparison="less"]')?.click();
                break;
            case 'Enter':
                // 下一題
                document.getElementById('next-btn')?.click() || 
                document.getElementById('complete-btn')?.click();
                break;
            case 'Escape':
                // 暫停
                this.pauseGame();
                break;
        }
    }
    
    /**
     * 暫停遊戲
     */
    pauseGame() {
        if(this.gameState !== 'playing') return;
        this.gameState = 'paused';
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) pauseOverlay.style.display = 'flex';
    }
    
    /**
     * 繼續遊戲
     */
    resumeGame() {
        if(this.gameState !== 'paused') return;
        this.gameState = 'playing';
        if (this.timeRemaining) this.startTimer();
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) pauseOverlay.style.display = 'none';
    }
    
    /**
     * 重置遊戲
     */
    resetGame() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.init();
    }
}

// =================================================================
// 全局遊戲初始化和導出
// =================================================================

// 全局遊戲實例
let Game;

// DOM 載入完成後初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    GameDebug.logInit('🌟 DOM 內容載入完成，開始初始化遊戲');
    GameDebug.performance.start('total-initialization');
    
    try {
        Game = new QuantityComparisonGame();
        GameDebug.performance.end('total-initialization');
        GameDebug.logInit('🎉 F5 數量大小比較遊戲初始化完成！');
        
        // 輸出配置驅動開發總結
        GameDebug.log('init', '📋 配置驅動開發檢查清單', {
            '✅ 配置驅動音效系統': 'Audio.playSound() 使用配置',
            '✅ 配置驅動語音系統': 'Speech.speak() 使用模板和配置',
            '✅ 配置驅動UI生成': 'Templates 系統統一管理',
            '✅ 配置驅動時間管理': 'timing 參數來自配置',
            '✅ 配置驅動計分系統': 'scoring 參數來自配置',
            '✅ 詳細Debug系統': 'GameDebug 全面監控',
            '✅ 效能監控系統': 'Performance timing 追蹤'
        });
        
    } catch (error) {
        GameDebug.logError('💥 遊戲初始化失敗', {
            error: error.message,
            stack: error.stack
        });
        console.error('F5 遊戲初始化錯誤:', error);
    }
});

// 導出配置和模板（如果需要）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        QuantityComparisonGame,
        QuantityComparisonConfig,
        QuantityComparisonTemplates
    };
} else {
    window.QuantityComparisonGame = QuantityComparisonGame;
    window.QuantityComparisonConfig = QuantityComparisonConfig;
    window.QuantityComparisonTemplates = QuantityComparisonTemplates;
}