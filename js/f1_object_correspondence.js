// =================================================================
// FILE: js/f1_object_correspondence.js
// DESC: F1 物件對應 - 配置驅動版本
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

// Define Game as a global variable to support onclick events in dynamic HTML
let Game;

document.addEventListener('DOMContentLoaded', () => {
    Game = {
        // =====================================================
        // 🐛 Debug System - 配置驅動除錯系統
        // =====================================================
        Debug: {
            enabled: true, // 設為 false 可關閉所有 debug 訊息
            logPrefix: '[F1-物件對應]',
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
                    const start = performance.now();
                    this.performanceStart[action] = start;
                    this.log('效能監控', `${action} 開始`);
                    return start;
                }
            },
            
            logUI(action, element, data = null) {
                this.log('UI系統', `${action} - 元素: ${element}`, data);
            },
            
            logState(action, stateBefore = null, stateAfter = null) {
                this.log('狀態管理', action, {
                    before: stateBefore,
                    after: stateAfter
                });
            },
            
            logTemplate(templateName, params = null) {
                this.log('模板系統', `渲染模板: ${templateName}`, params);
            },
            
            group(groupName, callback) {
                if (!this.enabled) {
                    callback && callback();
                    return;
                }
                console.group(`${this.logPrefix}[${groupName}]`);
                callback && callback();
                console.groupEnd();
            }
        },
        // =====================================================
        // 🎯 配置驅動核心：ModeConfig
        // =====================================================
        ModeConfig: {
            easy: {
                modeType: 'one-to-one-correspondence', // 模式類型：一對一對應
                sourceHasDistractors: false,      // 來源區沒有干擾項
                targetGuides: true,               // 目標區有明確的放置提示框
                audioFeedback: true,
                speechFeedback: true,
                label: '簡單',
                description: '觀察上方的範例，將下方的物件拖曳到對應的位置，一個一個排好',
                
                // 語音模板配置
                speechTemplates: {
                    demonstration: "現在我來示範怎麼做。我們需要 {itemCount} 個 {itemName}，看我怎麼把它們一個一個放到對應的位置。",
                    initialInstruction: "請拖曳放置一樣的物品數量",
                    correctPlacement: "排對了！",
                    turnComplete: "全部都排好了，你真棒！",
                    encouragement: "做得很好！",
                    addCustomItem: "已新增自訂圖示：{itemName}",
                    removeCustomItem: "已移除圖示：{itemName}"
                },
                
                // 文字模板配置
                textTemplates: {
                    progressText: "第 {current} / {total} 題",
                    scoreText: "分數: {score} 分",
                    correctFeedback: "放對了！",
                    gameComplete: "🎉 測驗結束 🎉",
                    excellentPerformance: "表現優異！",
                    goodPerformance: "表現良好！",
                    needImprovement: "要多加練習喔！"
                },
                
                // CSS 類名配置
                cssClasses: {
                    targetArea: "target-area easy-target",
                    sourceArea: "source-area easy-source",
                    draggableItem: "draggable-item easy-draggable",
                    dropZone: "drop-zone easy-drop-zone",
                    draggedOver: "drag-over",
                    placed: "placed"
                },
                
                // 時間配置
                timing: {
                    speechDelay: 300,
                    nextQuestionDelay: 2000,
                    placementFeedbackDelay: 500
                },
                
                // UI配置
                uiElements: {
                    showTargetGuides: true,
                    showSourceContainer: true,
                    allowReposition: true
                },
                
                // 動畫配置
                animations: {
                    fadeInDuration: 300,
                    placementSnapDuration: 200,
                    successCelebration: true
                },
                
                // 觸控拖曳配置
                touchDragConfig: {
                    enabled: true,                 // 啟用觸控拖曳
                    sensitivity: 'high',           // 觸控靈敏度：high, medium, low
                    createCloneDelay: 50,          // 建立拖曳複製的延遲時間(ms)
                    visualFeedback: {
                        dragOpacity: 0.5,          // 拖曳時原物件透明度
                        cloneScale: 1.1,           // 拖曳複製縮放比例
                        hoverEffect: true          // 放置區懸停效果
                    },
                    selectors: {
                        draggable: '.draggable-item:not(.static-item)',
                        dropZone: '.drop-zone, .placement-zone, .source-container'
                    }
                }
            },
            
            normal: {
                modeType: 'quantity-to-numeral',    // 模式類型：具體物件對應抽象數字
                sourceHasDistractors: true,         // 來源區有干擾項 (例如需要4個，但提供6個)
                targetGuides: false,                // 目標區沒有提示框 (例如一個大容器)
                audioFeedback: true,
                speechFeedback: true,
                optionsCount: 3,                    // 用於顯示數字選項
                label: '普通',
                description: '將正確數量的物件拖曳到指定的區域中',
                
                // 語音模板配置
                speechTemplates: {
                    initialInstruction: "請將 {targetCount} 個物品拖曳到對應框的放置區，然後按下完成按鈕",
                    correctPlacement: "已放置",            // 每放一個的回饋
                    turnComplete: "答對了！正確答案是 {targetCount} 個",
                    chooseAnswer: "請檢查您的放置是否正確，然後按下完成按鈕",
                    correct: "答對了！正確答案是 {targetCount} 個",
                    incorrect: "數量不正確，您放置了 {targetCount} 個，正確答案是 {correctAnswer} 個",
                    addCustomItem: "已新增自訂圖示：{itemName}",
                    removeCustomItem: "已移除圖示：{itemName}"
                },
                
                // 文字模板配置
                textTemplates: {
                    progressText: "第 {current} / {total} 題",
                    scoreText: "分數: {score} 分",
                    correctFeedback: "答對了！正確答案是 {answer}",
                    incorrectFeedback: "答錯了，再試一次！",
                    gameComplete: "🎉 測驗結束 🎉",
                    excellentPerformance: "表現優異！",
                    goodPerformance: "表現良好！",
                    needImprovement: "要多加練習喔！"
                },
                
                // CSS 類名配置
                cssClasses: {
                    targetArea: "target-area normal-target",
                    sourceArea: "source-area normal-source",
                    draggableItem: "draggable-item normal-draggable",
                    dropZone: "drop-zone normal-drop-zone",
                    container: "quantity-container",
                    optionsGrid: "products-grid horizontal-layout",
                    optionButton: "payment-btn normal-mode-btn"
                },
                
                // 時間配置
                timing: {
                    speechDelay: 300,
                    nextQuestionDelay: 2000,
                    retryDelay: 1500,
                    placementFeedbackDelay: 300
                },
                
                // UI配置
                uiElements: {
                    showTargetGuides: false,
                    showQuantityContainer: true,
                    showOptionsArea: true,
                    allowReposition: false
                },
                
                // 動畫配置
                animations: {
                    fadeInDuration: 300,
                    placementSnapDuration: 200,
                    incorrectShake: 300
                },
                
                // 觸控拖曳配置
                touchDragConfig: {
                    enabled: true,                 // 啟用觸控拖曳
                    sensitivity: 'high',           // 觸控靈敏度：high, medium, low
                    createCloneDelay: 50,          // 建立拖曳複製的延遲時間(ms)
                    visualFeedback: {
                        dragOpacity: 0.5,          // 拖曳時原物件透明度
                        cloneScale: 1.1,           // 拖曳複製縮放比例
                        hoverEffect: true          // 放置區懸停效果
                    },
                    selectors: {
                        draggable: '.draggable-item:not(.static-item)',
                        dropZone: '.drop-zone, .placement-zone, .source-container, .quantity-container'
                    }
                }
            },
            
            hard: {
                modeType: 'multi-item-correspondence', // 模式類型：多物件對應
                sourceHasDistractors: true,        // 來源區有干擾項
                targetGuides: false,               // 目標區為統一放置區
                audioFeedback: true,               
                speechFeedback: true,              
                useHintButton: true,               // 使用提示按鈕
                label: '困難',
                description: '請將物品區的圖示，拖曳到對應框中指定的數量',
                
                // 語音模板配置
                speechTemplates: {
                    initialInstruction: "請觀察對應框中的目標，將物品拖曳到放置區。",
                    correct: "答對了，太棒了！",
                    incorrect: "不對喔，請檢查目標和您放置的物品，再試一次！",
                    turnComplete: "全部都對了，真厲害！",
                    hintUsed: "提示來了！看看哪些東西是我們需要的吧！",
                    invalidDrop: "這個不是我們需要的東西喔。",
                    addCustomItem: "已新增自訂圖示：{itemName}",
                    removeCustomItem: "已移除圖示：{itemName}"
                },
                
                // 文字模板配置
                textTemplates: {
                    progressText: "第 {current} / {total} 題",
                    scoreText: "分數: {score} 分",
                    correctFeedback: "答對了！",
                    incorrectFeedback: "答錯了，再試一次！",
                    gameComplete: "🎉 測驗結束 🎉",
                    excellentPerformance: "表現優異！",
                    goodPerformance: "表現良好！",
                    needImprovement: "要多加練習喔！"
                },
                
                // CSS 類名配置
                cssClasses: {
                    targetArea: "target-area hard-target",
                    sourceArea: "source-area hard-source",
                    draggableItem: "draggable-item hard-draggable",
                    placementZone: "placement-zone hard-placement-zone"
                },
                
                // 時間配置
                timing: {
                    speechDelay: 300,
                    nextQuestionDelay: 2500,
                    hintAnimationDuration: 1500,
                    invalidDropReturnDuration: 300
                },
                
                // UI配置
                uiElements: {
                    showPlacementZone: true,
                    showReferenceItems: true,
                    showCompletionButton: true,
                    showHintButton: true
                },
                
                // 動畫配置
                animations: {
                    fadeInDuration: 300,
                    successBounce: true,
                    errorShake: true,
                    hintGlow: true
                },
                
                // 觸控拖曳配置
                touchDragConfig: {
                    enabled: true,                 // 啟用觸控拖曳
                    sensitivity: 'high',           // 觸控靈敏度：high, medium, low
                    createCloneDelay: 50,          // 建立拖曳複製的延遲時間(ms)
                    visualFeedback: {
                        dragOpacity: 0.5,          // 拖曳時原物件透明度
                        cloneScale: 1.1,           // 拖曳複製縮放比例
                        hoverEffect: true          // 放置區懸停效果
                    },
                    selectors: {
                        draggable: '.draggable-item:not(.static-item)',
                        dropZone: '.drop-zone, .placement-zone, .source-container'
                    }
                }
            }
        },

        // =====================================================
        // 🎨 StyleConfig - CSS配置驅動系統
        // =====================================================
        StyleConfig: {
            // 基礎樣式配置 - F1 拖拽介面
            base: {
                correspondenceLayout: {
                    width: '100%',
                    minHeight: '600px',
                    background: '#f8f9fa',
                    borderRadius: '15px',
                    padding: '20px'
                },
                targetArea: {
                    background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                    border: '3px solid #2196f3',
                    borderRadius: '15px',
                    padding: '20px',
                    marginBottom: '20px',
                    minHeight: '200px'
                },
                sourceArea: {
                    background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                    border: '3px solid #ff9800',
                    borderRadius: '15px',
                    padding: '20px',
                    minHeight: '150px'
                },
                draggableItem: {
                    fontSize: '3rem',
                    padding: '10px', // 稍微減少內邊距以適應固定大小
                    borderRadius: '12px',
                    border: '2px solid #4caf50',
                    background: '#e8f5e8',
                    cursor: 'grab',
                    transition: 'all 0.3s ease',
                    userSelect: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '5px',
                    // --- 【關鍵修正】 ---
                    // 將彈性的 min-width/height 改為與 drop-zone 相同的固定 width/height
                    width: '80px',
                    height: '80px',
                    // 添加 box-sizing 確保 padding 和 border 不會撐大方框
                    boxSizing: 'border-box'
                },
                dropZone: {
                    width: '80px',
                    height: '80px',
                    border: '3px dashed #9e9e9e',
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '5px',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255,255,255,0.8)'
                },
                quantityContainer: {
                    minHeight: '120px',
                    border: '3px dashed #9c27b0',
                    borderRadius: '15px',
                    background: 'linear-gradient(135deg, #fce4ec, #f8bbd9)',
                    padding: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    gap: '10px',
                    transition: 'all 0.3s ease'
                }
            },
            
            // F1 模式特定樣式
            easy: {
                draggableItem: {
                    border: '2px solid #4caf50',
                    background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                    boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)'
                },
                dropZone: {
                    border: '3px dashed #4caf50',
                    background: 'rgba(232, 245, 232, 0.5)'
                },
                dropZoneHover: {
                    borderColor: '#2e7d32',
                    background: 'rgba(232, 245, 232, 0.8)',
                    transform: 'scale(1.05)'
                },
                guideText: {
                    fontSize: '0.8rem',
                    color: '#2e7d32',
                    fontWeight: 'bold'
                }
            },
            
            normal: {
                draggableItem: {
                    border: '2px solid #ff9800',
                    background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                    boxShadow: '0 4px 8px rgba(255, 152, 0, 0.3)'
                },
                quantityContainer: {
                    border: '3px dashed #9c27b0',
                    background: 'linear-gradient(135deg, #fce4ec, #f8bbd9)'
                },
                quantityContainerHover: {
                    borderColor: '#7b1fa2',
                    background: 'linear-gradient(135deg, #f8bbd9, #f48fb1)',
                    transform: 'scale(1.02)'
                },
                optionButton: {
                    fontSize: '1.8rem',
                    padding: '15px 25px',
                    minWidth: '80px',
                    height: '70px',
                    border: '3px solid #9c27b0',
                    borderRadius: '15px',
                    background: '#ffffff',
                    color: '#9c27b0',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(156, 39, 176, 0.2)'
                }
            },
            
            hard: {
                connectionCard: {
                    padding: '15px',
                    border: '2px solid #f44336',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    margin: '5px 0',
                    fontSize: '2rem',
                    textAlign: 'center',
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                connectionNumber: {
                    padding: '15px 25px',
                    border: '2px solid #3f51b5',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #e8eaf6, #c5cae9)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    margin: '5px 0',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    minWidth: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                selectedCard: {
                    borderColor: '#d32f2f',
                    background: 'linear-gradient(135deg, #ffcdd2, #ef9a9a)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)'
                },
                connectedCard: {
                    borderColor: '#4caf50',
                    background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
                    opacity: '0.8'
                }
            },
            
            // 回饋樣式
            feedback: {
                correct: {
                    background: '#d4edda',
                    color: '#155724',
                    border: '1px solid #c3e6cb'
                },
                incorrect: {
                    background: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb'
                }
            }
        },

        // =====================================================
        // Game Data and Configuration
        // =====================================================
        gameData: {
            title: "單元F1：物件對應",
            themes: {
                fruits:  ['🍎', '🍌', '🍇', '🍓', '🍊', '🥝', '🍍', '🍉', '🍑', '🍒'],
                animals: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁'],
                vehicles:['🚗', '🚕', '🚌', '🚓', '🚑', '🚒', '🚚', '🚲', '🚀', '✈️'],
                custom: [] // 自訂主題（動態載入自訂圖示）
            },
            difficultySettings: {
                easy:   { minItems: 1,  maxItems: 5,  label: '簡單' },
                normal: { minItems: 1,  maxItems: 10, label: '普通' },
                hard:   { minItems: 5,  maxItems: 15, label: '困難' }
            },
            countingRanges: {
                'range1-5':   { minItems: 1,  maxItems: 5,  label: '1-5' },
                'range1-10':  { minItems: 1,  maxItems: 10, label: '1-10' },
                'range15-20': { minItems: 15, maxItems: 20, label: '15-20' },
                'range20-30': { minItems: 20, maxItems: 30, label: '20-30' },
                'custom':     { minItems: 1,  maxItems: 50, label: '自訂數量' }
            }
        },

        // =====================================================
        // Game State
        // =====================================================
        state: {
            score: 0,
            currentTurn: 0,
            totalTurns: 10,
            correctAnswer: 0,
            userCountProgress: 0,
            isAnswering: false,
            customItems: [], // 自訂主題圖示和名稱
            settings: {
                difficulty: null,
                theme: null,
                questionCount: 10,
                testMode: null, // 'retry' or 'single'
                countingRange: null // 數數範圍設定
            }
        },

        // =====================================================
        // DOM Elements
        // =====================================================
        elements: {},

        // =====================================================
        // 🎨 CSS Generator - 配置驅動CSS生成器
        // =====================================================
        CSSGenerator: {
            generateCSS(difficulty) {
                Game.Debug.logConfig(`生成${difficulty}模式CSS`, Game.StyleConfig);
                
                const baseStyles = Game.StyleConfig.base;
                const modeStyles = Game.StyleConfig[difficulty] || {};
                const feedbackStyles = Game.StyleConfig.feedback;
                
                return `
                    <style>
                        ${this.generateBaseCSS(baseStyles)}
                        ${this.generateModeSpecificCSS(difficulty, modeStyles)}
                        ${this.generateFeedbackCSS(feedbackStyles)}
                    </style>
                `;
            },
            
            generateBaseCSS(baseStyles) {
                return `
                    .correspondence-layout {
                        ${this.objectToCSS(baseStyles.correspondenceLayout || {})}
                    }
                    .target-area {
                        ${this.objectToCSS(baseStyles.targetArea || {})}
                    }
                    .source-area {
                        ${this.objectToCSS(baseStyles.sourceArea || {})}
                    }
                    .draggable-item {
                        ${this.objectToCSS(baseStyles.draggableItem || {})}
                    }
                    .drop-zone {
                        ${this.objectToCSS(baseStyles.dropZone || {})}
                    }
                    .quantity-container {
                        ${this.objectToCSS(baseStyles.quantityContainer || {})}
                    }
                    .draggable-item:hover {
                        transform: scale(1.05);
                        cursor: grab;
                    }
                    .dragging {
                        opacity: 0.5;
                        transform: rotate(5deg);
                    }
                    .drag-over {
                        border-color: #4caf50 !important;
                        background-color: rgba(76, 175, 80, 0.1) !important;
                        transform: scale(1.02);
                    }
                    .connection-area {
                        display: flex;
                        gap: 40px;
                        padding: 20px;
                        justify-content: center;
                    }
                    .connection-panels {
                        display: flex;
                        gap: 40px;
                        width: 100%;
                        max-width: 800px;
                    }
                    .connection-left-panel, .connection-right-panel {
                        flex: 1;
                        padding: 20px;
                        border: 2px solid #ddd;
                        border-radius: 12px;
                        background: #f8f9fa;
                    }
                    .target-container, .source-container, .cards-container, .numbers-container {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                        justify-content: center;
                        align-items: flex-start;
                        padding: 10px;
                    }
                    
                    /* 自訂主題上傳介面樣式 */
                    .custom-theme-setup {
                        border: 2px dashed #ddd;
                        border-radius: 10px;
                        padding: 20px;
                        margin: 15px 0;
                        background: #f9f9f9;
                    }
                    .custom-items-list {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 15px;
                        margin: 15px 0;
                    }
                    .custom-item-row {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        background: white;
                    }
                    .upload-btn, .remove-btn {
                        padding: 8px 16px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                    }
                    .upload-btn {
                        background: #4caf50;
                        color: white;
                    }
                    .remove-btn {
                        background: #f44336;
                        color: white;
                        font-size: 16px;
                        padding: 5px 10px;
                    }
                    
                    /* 圖片預覽模態視窗樣式 */
                    .image-preview-modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.7);
                        display: none;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                    }
                    .image-preview-modal.show {
                        display: flex;
                    }
                    .modal-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                    }
                    .modal-content {
                        background: white;
                        border-radius: 15px;
                        padding: 0;
                        width: 90%;
                        max-width: 500px;
                        position: relative;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    }
                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 20px;
                        border-bottom: 1px solid #eee;
                    }
                    .modal-body {
                        padding: 20px;
                    }
                    .modal-footer {
                        display: flex;
                        justify-content: flex-end;
                        gap: 10px;
                        padding: 20px;
                        border-top: 1px solid #eee;
                    }
                    .close-btn {
                        background: #f44336;
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 30px;
                        height: 30px;
                        cursor: pointer;
                        font-size: 18px;
                    }
                    .cancel-btn, .confirm-btn {
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                    }
                    .cancel-btn {
                        background: #6c757d;
                        color: white;
                    }
                    .confirm-btn {
                        background: #28a745;
                        color: white;
                    }
                    .form-group {
                        margin: 15px 0;
                    }
                    .form-group label {
                        display: block;
                        margin-bottom: 5px;
                        font-weight: bold;
                    }
                    .form-group input {
                        width: 100%;
                        padding: 10px;
                        border: 2px solid #ddd;
                        border-radius: 5px;
                        font-size: 16px;
                        box-sizing: border-box;
                    }
                `;
            },
            
            generateModeSpecificCSS(difficulty, modeStyles) {
                let css = '';
                
                // F1 拖拽物件樣式
                if (modeStyles.draggableItem) {
                    css += `.draggable-item.${difficulty}-draggable { ${this.objectToCSS(modeStyles.draggableItem)} }`;
                }
                
                // F1 放置區域樣式
                if (modeStyles.dropZone) {
                    css += `.drop-zone.${difficulty}-drop-zone { ${this.objectToCSS(modeStyles.dropZone)} }`;
                }
                
                if (modeStyles.dropZoneHover) {
                    css += `.drop-zone.${difficulty}-drop-zone.drag-over { ${this.objectToCSS(modeStyles.dropZoneHover)} }`;
                }
                
                // F1 數量容器樣式
                if (modeStyles.quantityContainer) {
                    css += `.quantity-container { ${this.objectToCSS(modeStyles.quantityContainer)} }`;
                }
                
                if (modeStyles.quantityContainerHover) {
                    css += `.quantity-container.drag-over { ${this.objectToCSS(modeStyles.quantityContainerHover)} }`;
                }
                
                // F1 選項按鈕樣式
                if (modeStyles.optionButton) {
                    css += `#options-area .payment-btn { ${this.objectToCSS(modeStyles.optionButton)} }`;
                    css += `#options-area .payment-btn:hover { 
                        background: #9c27b0 !important;
                        color: white !important;
                        transform: translateY(-3px) !important;
                        box-shadow: 0 6px 20px rgba(156, 39, 176, 0.4) !important;
                    }`;
                }
                
                // F1 困難模式連線樣式
                if (difficulty === 'hard') {
                    if (modeStyles.connectionCard) {
                        css += `.connection-card { ${this.objectToCSS(modeStyles.connectionCard)} }`;
                    }
                    
                    if (modeStyles.connectionNumber) {
                        css += `.connection-number { ${this.objectToCSS(modeStyles.connectionNumber)} }`;
                    }
                    
                    if (modeStyles.selectedCard) {
                        css += `.selected-card { ${this.objectToCSS(modeStyles.selectedCard)} }`;
                    }
                    
                    if (modeStyles.connectedCard) {
                        css += `.connected-card { ${this.objectToCSS(modeStyles.connectedCard)} }`;
                        css += `.connected-number { ${this.objectToCSS(modeStyles.connectedCard)} }`;
                    }
                }
                
                // 指引文字樣式
                if (modeStyles.guideText) {
                    css += `.guide-text { ${this.objectToCSS(modeStyles.guideText)} }`;
                }
                
                return css;
            },
            
            generateFeedbackCSS(feedbackStyles) {
                return `
                    .feedback-bubble.correct {
                        ${this.objectToCSS(feedbackStyles.correct)}
                    }
                    .feedback-bubble.incorrect {
                        ${this.objectToCSS(feedbackStyles.incorrect)}
                    }
                    #options-area .products-grid {
                        display: flex !important;
                        gap: 20px !important;
                        justify-content: center !important;
                        margin-top: 10px !important;
                    }
                `;
            },
            
            objectToCSS(obj) {
                return Object.entries(obj).map(([key, value]) => {
                    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                    return `${cssKey}: ${value};`;
                }).join(' ');
            }
        },

        // =====================================================
        // Audio System - 配置驅動
        // =====================================================
        Audio: {
            playSound(soundType, difficulty, config, callback) {
                Game.Debug.logAudio('嘗試播放音效', soundType, { 
                    difficulty, 
                    audioFeedback: config?.audioFeedback 
                });
                
                const soundMap = {
                    select: 'menu-select-sound',
                    correct: 'correct-sound',
                    correct02: 'correct02-sound',
                    error: 'error-sound',
                    success: 'success-sound'
                };
                
                const audioId = soundMap[soundType];
                if (!audioId) {
                    Game.Debug.logAudio('找不到音效映射', soundType);
                    if (callback) callback();
                    return;
                }
                
                const audio = document.getElementById(audioId);
                if (!audio) {
                    Game.Debug.logError('找不到音效元素', `audio ID: ${audioId}`);
                    if (callback) callback();
                    return;
                }
                
                if (config && config.audioFeedback) {
                    try {
                        audio.currentTime = 0;
                        
                        // 設置回調事件監聽器
                        if (callback) {
                            let callbackExecuted = false;
                            const safeCallback = () => {
                                if (!callbackExecuted) {
                                    callbackExecuted = true;
                                    Game.Debug.logAudio('音效播放完成回調', soundType);
                                    callback();
                                }
                            };
                            
                            // 監聽音效播放結束事件
                            audio.addEventListener('ended', safeCallback, { once: true });
                            audio.addEventListener('error', safeCallback, { once: true });
                            
                            // 安全措施：最多等待10秒
                            setTimeout(safeCallback, 10000);
                        }
                        
                        audio.play()
                            .then(() => {
                                Game.Debug.logAudio('音效播放成功', soundType);
                            })
                            .catch(e => {
                                Game.Debug.logError(e, '音效播放失敗');
                                if (callback) callback();
                            });
                    } catch (error) {
                        Game.Debug.logError(error, '音效播放異常');
                        if (callback) callback();
                    }
                } else {
                    Game.Debug.logAudio('音效被配置關閉', soundType, { audioFeedback: config?.audioFeedback });
                    if (callback) callback();
                }
            }
        },

        // =====================================================
        // Speech System - 配置驅動
        // =====================================================
        Speech: {
            synth: window.speechSynthesis,
            voice: null,
            isReady: false,

            init() {
                Game.Debug.logSpeech('初始化語音系統', 'init', 'system');
                
                const setVoice = () => {
                    const voices = this.synth.getVoices();
                    Game.Debug.logSpeech('取得語音列表', 'voices', 'system', { 
                        voiceCount: voices.length 
                    });
                    
                    if (voices.length === 0) return;
                    
                    // 與 c1_money_types 相同的語音選擇策略
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
                        Game.Debug.logSpeech('語音準備就緒', 'ready', 'system', { 
                            voiceName: this.voice.name,
                            lang: this.voice.lang 
                        });
                    } else {
                        Game.Debug.logError('未找到中文語音', '語音初始化');
                    }
                };
                
                if (this.synth.onvoiceschanged !== undefined) {
                    this.synth.onvoiceschanged = setVoice;
                }
                setVoice();
            },

            speak(templateKey, difficulty, config, replacements = {}, callback) {
                Game.Debug.logSpeech('嘗試播放語音', templateKey, difficulty, {
                    speechFeedback: config?.speechFeedback,
                    isReady: this.isReady,
                    replacements
                });
                
                // 停止所有正在播放的語音，防止重疊和多重回調
                if (this.synth.speaking) {
                    Game.Debug.logSpeech('停止之前的語音播放', templateKey, difficulty);
                    this.synth.cancel();
                }
                
                // 困難模式下，只允許結果反饋語音、輸入提示語音和初始指導語音
                const hardModeAllowedTemplates = ['correct', 'incorrect', 'incorrectWithAnswer', 'inputPrompt', 'initialInstruction'];
                const shouldSpeak = config && 
                    (config.speechFeedback || 
                     (difficulty === 'hard' && hardModeAllowedTemplates.includes(templateKey))) && 
                    this.isReady;
                
                if (!shouldSpeak) {
                    Game.Debug.logSpeech('語音被跳過', templateKey, difficulty, {
                        reason: !config ? 'no config' : 
                               !this.isReady ? 'not ready' :
                               difficulty === 'hard' && !hardModeAllowedTemplates.includes(templateKey) ? 'hard mode restricted' :
                               'speechFeedback disabled'
                    });
                    if (callback) setTimeout(callback, config?.timing?.speechDelay || 300);
                    return;
                }

                const template = config.speechTemplates[templateKey];
                if (!template) {
                    Game.Debug.logError(`找不到語音模板: ${templateKey}`, '語音系統');
                    if (callback) setTimeout(callback, config?.timing?.speechDelay || 300);
                    return;
                }

                let speechText = template;
                Object.keys(replacements).forEach(key => {
                    speechText = speechText.replace(`{${key}}`, replacements[key]);
                });

                Game.Debug.logSpeech('開始播放語音', templateKey, difficulty, { 
                    text: speechText,
                    voiceName: this.voice?.name 
                });

                try {
                    this.synth.cancel();
                    const utterance = new SpeechSynthesisUtterance(speechText);
                    utterance.voice = this.voice;
                    utterance.lang = this.voice.lang;
                    utterance.rate = 1.0;
                    
                    if (callback) {
                        // 安全措施：如果語音播放時間過長，強制執行callback
                        let callbackExecuted = false;
                        const safeCallback = () => {
                            if (!callbackExecuted) {
                                callbackExecuted = true;
                                callback();
                            }
                        };
                        
                        utterance.onend = () => {
                            Game.Debug.logSpeech('語音播放完成', templateKey, difficulty);
                            safeCallback();
                        };
                        
                        utterance.onerror = (error) => {
                            Game.Debug.logError(error, '語音播放錯誤');
                            safeCallback();
                        };
                        
                        setTimeout(() => {
                            Game.Debug.logSpeech('語音播放超時，強制執行回調', templateKey, difficulty);
                            safeCallback();
                        }, 5000);
                    }
                    
                    this.synth.speak(utterance);
                } catch (error) {
                    Game.Debug.logError(error, '語音播放異常');
                    if (callback) callback();
                }
            }
        },

        // =====================================================
        // HTML Templates - 統一管理
        // =====================================================
        HTMLTemplates: {
            settingsScreen(difficulty, theme, questionCount, testMode, countingRange) {
                return `
                    <div class="unit-welcome">
                        <div class="welcome-content">
                            <h1>${Game.gameData.title}</h1>
                            <div class="game-settings">
                                <div class="setting-group">
                                    <label>🎯 難度選擇：</label>
                                    <div class="button-group">
                                        ${Object.entries(Game.gameData.difficultySettings).map(([key, value]) => `
                                            <button class="selection-btn ${difficulty === key ? 'active' : ''}" data-type="difficulty" data-value="${key}">${value.label}</button>
                                        `).join('')}
                                    </div>
                                </div>
                                <div class="setting-group">
                                    <label>🔢 數數範圍：</label>
                                    <div class="button-group">
                                        ${Object.entries(Game.gameData.countingRanges).map(([key, value]) => `
                                            <button class="selection-btn ${countingRange === key ? 'active' : ''}" data-type="countingRange" data-value="${key}">${value.label}</button>
                                        `).join('')}
                                    </div>
                                </div>
                                <div class="setting-group">
                                    <label>🎨 主題選擇：</label>
                                    <div class="button-group">
                                        ${Object.keys(Game.gameData.themes).filter(key => key !== 'custom').map(key => `
                                            <button class="selection-btn ${theme === key ? 'active' : ''} ${difficulty === 'hard' ? 'disabled' : ''}" 
                                                    data-type="theme" data-value="${key}"
                                                    ${difficulty === 'hard' ? 'disabled' : ''}>
                                                ${difficulty === 'hard' ? '❌ ' : ''}${key === 'fruits' ? '水果' : key === 'animals' ? '動物' : '交通工具'} ${Game.gameData.themes[key][0]}
                                            </button>
                                        `).join('')}
                                        ${difficulty !== 'hard' ? `
                                            <button class="selection-btn ${theme === 'custom' ? 'active' : ''}" 
                                                    data-type="theme" data-value="custom">
                                                🎨 自訂主題
                                            </button>
                                        ` : ''}
                                    </div>
                                    ${difficulty === 'hard' ? `
                                        <p style="color: #666; font-style: italic; text-align: center; padding: 10px; margin-top: 10px;">
                                            困難模式使用多種圖示主題，無需選擇單一主題
                                        </p>
                                    ` : ''}
                                </div>
                                
                                ${theme === 'custom' && difficulty !== 'hard' ? `
                                    <div class="setting-group custom-theme-setup">
                                        <h4>🎨 自訂主題設定</h4>
                                        <p>上傳你的圖示並設定名稱：</p>
                                        <div class="custom-items-list">
                                            ${Game.state.customItems.map((item, index) => `
                                                <div class="custom-item-row">
                                                    <img src="${item.imageData}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                                                    <span>${item.name}</span>
                                                    <button type="button" onclick="Game.removeCustomItem(${index})" class="remove-btn">🗑️</button>
                                                </div>
                                            `).join('')}
                                        </div>
                                        <div class="upload-section">
                                            <input type="file" id="custom-image" accept="image/*" style="display: none;" onchange="Game.handleImageUpload(event)">
                                            <button type="button" onclick="Game.triggerImageUpload()" class="upload-btn">📸 上傳圖片</button>
                                        </div>
                                        
                                        <!-- 圖片預覽模態視窗 -->
                                        <div id="image-preview-modal" class="image-preview-modal">
                                            <div class="modal-overlay" onclick="Game.closeImagePreview()"></div>
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h3>🎁 新增自訂圖示</h3>
                                                    <button onclick="Game.closeImagePreview()" class="close-btn">✕</button>
                                                </div>
                                                <div class="modal-body">
                                                    <div class="image-preview-container">
                                                        <img id="preview-image" src="" alt="圖示預覽" style="max-width: 350px; max-height: 300px; object-fit: contain; border-radius: 10px; border: 2px solid #ddd;">
                                                    </div>
                                                    <div class="item-form">
                                                        <div class="form-group">
                                                            <label>圖示名稱：</label>
                                                            <input type="text" id="modal-custom-name" placeholder="請輸入圖示名稱" maxlength="10">
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="modal-footer">
                                                    <button onclick="Game.closeImagePreview()" class="cancel-btn">取消</button>
                                                    <button onclick="Game.confirmAddCustomItem()" class="confirm-btn">確認新增</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <div class="setting-group">
                                    <label>📋 題目數量：</label>
                                    <div class="button-group">
                                        ${[5, 10, 15, 20].map(num => `
                                            <button class="selection-btn ${questionCount === num ? 'active' : ''}" data-type="questionCount" data-value="${num}">${num}題</button>
                                        `).join('')}
                                        <button class="selection-btn ${questionCount === 'custom' ? 'active' : ''}" data-type="questionCount" data-value="custom">自訂</button>
                                    </div>
                                </div>
                                <div class="setting-group">
                                    <label>📝 測驗模式：</label>
                                    <div class="button-group">
                                        <button class="selection-btn ${testMode === 'retry' ? 'active' : ''}" data-type="testMode" data-value="retry">反複作答</button>
                                        <button class="selection-btn ${testMode === 'single' ? 'active' : ''}" data-type="testMode" data-value="single">單次作答</button>
                                    </div>
                                </div>
                            </div>
                            <div class="game-buttons">
                                <button class="back-btn" onclick="window.location.href='index.html'">返回主選單</button>
                                <button id="start-game-btn" class="start-btn" disabled>請完成所有選擇</button>
                            </div>
                        </div>
                    </div>
                `;
            },

            gameLayout(currentTurn, totalTurns, difficulty) {
                const config = Game.ModeConfig[difficulty];
                return `
                    <div class="correspondence-layout">
                        <div class="title-bar">
                            <div class="title-bar-left">
                                <div id="progress-info" class="progress-info">第 ${currentTurn} / ${totalTurns} 題</div>
                            </div>
                            <div class="title-bar-center">
                                <div id="game-title" class="target-amount">${Game.gameData.title}</div>
                            </div>
                            <div class="title-bar-right">
                                <div id="score-info" class="score-info">${difficulty !== 'easy' ? `分數: 0 分` : ''}</div>
                                <button class="back-to-menu-btn" onclick="Game.init()">返回設定</button>
                            </div>
                        </div>
                        <div class="correspondence-frame" style="padding: 20px;">
                            <div id="source-area" class="source-area"></div>
                            <div id="target-area" class="target-area"></div>
                            ${config.uiElements.showOptionsArea ? '<div id="options-area" class="product-selection-area" style="justify-content: center; margin-top: 20px;"></div>' : ''}
                        </div>
                    </div>
                `;
            },
            
            // *** REFACTORED *** 配置驅動遊戲樣式生成器
            gameStyles() {
                const difficulty = Game.state.settings.difficulty || 'normal';
                Game.Debug.logTemplate('配置驅動樣式生成', { difficulty });
                return Game.CSSGenerator.generateCSS(difficulty);
            },

            

            // F1 拖曳物件項目
            draggableItem(icon, index, difficulty) {
                const config = Game.ModeConfig[difficulty];
                const cssConfig = config.cssClasses || {};
                const itemClass = cssConfig.draggableItem || `draggable-item ${difficulty}-draggable`;
                
                Game.Debug.logTemplate('draggableItem', { 
                    icon, 
                    index, 
                    difficulty, 
                    itemClass 
                });
                
                // 檢查是否為base64圖片資料（自訂主題）
                const isCustomImage = icon.startsWith('data:image/');
                const iconDisplay = isCustomImage ? 
                    `<img src="${icon}" alt="自訂圖示" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; pointer-events: none; user-select: none;">` : 
                    icon;
                
                return `<div class="${itemClass}" 
                    data-id="${index}"
                    data-icon="${icon}"
                    draggable="true"
                    ondragstart="Game.handleDragStart(event)"
                    ondragend="Game.handleDragEnd(event)"
                    >${iconDisplay}</div>`;
            },

            // F1 靜態範例物件 (老師的物件)
            staticItem(icon, difficulty) {
                const config = Game.ModeConfig[difficulty];
                const cssConfig = config.cssClasses || {};
                const itemClass = cssConfig.draggableItem || `draggable-item ${difficulty}-draggable`;
                
                Game.Debug.logTemplate('staticItem', { 
                    icon,
                    difficulty, 
                    itemClass: `${itemClass} static-item`
                });
                
                // 檢查是否為base64圖片資料（自訂主題）
                const isCustomImage = icon.startsWith('data:image/');
                const iconDisplay = isCustomImage ? 
                    `<img src="${icon}" alt="自訂圖示" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; pointer-events: none; user-select: none;">` : 
                    icon;
                
                // 移除了 draggable 和 ondragstart 等事件屬性
                return `<div class="${itemClass} static-item">${iconDisplay}</div>`;
            },

            // F1 目標放置區域
            dropZone(index, difficulty, hasGuide = true) {
                const config = Game.ModeConfig[difficulty];
                const cssConfig = config.cssClasses || {};
                const zoneClass = cssConfig.dropZone || `drop-zone ${difficulty}-drop-zone`;
                const guideClass = hasGuide ? 'with-guide' : 'no-guide';
                
                Game.Debug.logTemplate('dropZone', { 
                    index, 
                    difficulty, 
                    hasGuide,
                    zoneClass: `${zoneClass} ${guideClass}`
                });
                
                return `<div class="${zoneClass} ${guideClass}" 
                    data-drop-index="${index}"
                    ondrop="Game.handleDrop(event)"
                    ondragover="Game.handleDragOver(event)"
                    ondragenter="Game.handleDragEnter(event)"
                    ondragleave="Game.handleDragLeave(event)"
                    >${hasGuide ? '<span class="guide-text">放這裡</span>' : ''}</div>`;
            },

            // F1 連線卡片（困難模式）
            connectionCard(icon, count, index, difficulty) {
                const config = Game.ModeConfig[difficulty];
                const cssConfig = config.cssClasses || {};
                const cardClass = cssConfig.cardItem || 'connection-card';
                
                Game.Debug.logTemplate('connectionCard', { 
                    icon, 
                    count,
                    index, 
                    difficulty, 
                    cardClass 
                });
                
                return `<div class="${cardClass}" 
                    data-card-index="${index}"
                    data-count="${count}"
                    onclick="Game.handleCardClick(event)"
                    >${icon.repeat(count)}</div>`;
            },

            // F1 數字選項（困難模式）
            numberOption(number, index, difficulty) {
                const config = Game.ModeConfig[difficulty];
                const cssConfig = config.cssClasses || {};
                const numberClass = cssConfig.numberOption || 'connection-number';
                
                Game.Debug.logTemplate('numberOption', { 
                    number, 
                    index, 
                    difficulty, 
                    numberClass 
                });
                
                return `<div class="${numberClass}" 
                    data-number-index="${index}"
                    data-number="${number}"
                    onclick="Game.handleNumberClick(event)"
                    >${number}</div>`;
            },

            optionsButtons(options) {
                return `
                    <div class="products-grid horizontal-layout">
                        ${options.map(option => 
                            `<button class="payment-btn" data-value="${option}">${option}</button>`
                        ).join('')}
                    </div>
                `;
            },
            
            // 困難模式提示框（答案提示）
            hintBox() {
                return `
                    <div id="hint-box" style="
                        background: linear-gradient(135deg, #ffeaa7, #fab1a0);
                        border: 3px solid #e17055;
                        border-radius: 20px;
                        padding: 15px;
                        margin: 0;
                        text-align: center;
                        max-width: 160px;
                        width: 160px;
                        box-shadow: 0 6px 20px rgba(225, 112, 85, 0.3);
                        cursor: pointer;
                        transition: all 0.3s ease;
                        animation: hintPulse 3s infinite;
                    ">
                        <div style="
                            font-size: 2em;
                            margin-bottom: 8px;
                        ">💡</div>
                        <div style="
                            font-size: 1.2em;
                            color: #2d3436;
                            font-weight: bold;
                            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                        ">需要提示？</div>
                        <div style="
                            font-size: 0.9em;
                            color: #636e72;
                            margin-top: 5px;
                        ">點我看答案</div>
                    </div>
                    <style>
                        @keyframes hintPulse {
                            0%, 100% { 
                                box-shadow: 0 6px 20px rgba(225, 112, 85, 0.3);
                                transform: scale(1);
                            }
                            50% { 
                                box-shadow: 0 8px 25px rgba(225, 112, 85, 0.5);
                                transform: scale(1.02);
                            }
                        }
                        
                        #hint-box:hover {
                            transform: scale(1.05) !important;
                            box-shadow: 0 10px 30px rgba(225, 112, 85, 0.6) !important;
                            background: linear-gradient(135deg, #fdcb6e, #e84393) !important;
                        }
                    </style>
                `;
            },

            // 答案顯示彈窗
            answerRevealPopup(correctAnswer) {
                return `
                    <div id="answer-reveal-popup" style="
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) scale(0);
                        background: linear-gradient(135deg, #74b9ff, #0984e3);
                        border: 3px solid #0984e3;
                        border-radius: 25px;
                        padding: 30px;
                        text-align: center;
                        z-index: 2500;
                        box-shadow: 0 15px 40px rgba(9, 132, 227, 0.4);
                        min-width: 300px;
                        animation: revealBounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
                    ">
                        <div style="font-size: 3em; margin-bottom: 15px;">🎯</div>
                        <div style="
                            font-size: 1.8em;
                            color: white;
                            font-weight: bold;
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                            margin-bottom: 10px;
                        ">正確的數量是</div>
                        <div style="
                            font-size: 4em;
                            color: #ffeaa7;
                            font-weight: bold;
                            text-shadow: 3px 3px 6px rgba(0,0,0,0.4);
                            margin: 15px 0;
                            animation: numberGlow 1.5s ease infinite alternate;
                        ">${correctAnswer}</div>
                    </div>
                    <div id="answer-reveal-backdrop" style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.6);
                        z-index: 2499;
                        animation: fadeIn 0.3s ease-out forwards;
                    "></div>
                    <style>
                        @keyframes revealBounceIn {
                            0% {
                                transform: translate(-50%, -50%) scale(0);
                                opacity: 0;
                            }
                            60% {
                                transform: translate(-50%, -50%) scale(1.1);
                                opacity: 1;
                            }
                            100% {
                                transform: translate(-50%, -50%) scale(1);
                                opacity: 1;
                            }
                        }
                        
                        @keyframes numberGlow {
                            0% { text-shadow: 3px 3px 6px rgba(0,0,0,0.4); }
                            100% { text-shadow: 3px 3px 6px rgba(0,0,0,0.4), 0 0 20px #ffeaa7; }
                        }
                        
                        @keyframes revealBounceOut {
                            0% {
                                transform: translate(-50%, -50%) scale(1);
                                opacity: 1;
                            }
                            100% {
                                transform: translate(-50%, -50%) scale(0.3);
                                opacity: 0;
                            }
                        }
                    </style>
                `;
            },

            // 困難模式輸入提示框和提示框的容器
            inputPromptContainer(promptText) {
                return `
                    <div class="input-prompt-container" style="
                        display: grid;
                        grid-template-columns: 1fr 350px 1fr;
                        grid-template-areas: 'left center right';
                        align-items: start;
                        margin: 20px auto;
                        max-width: 1000px;
                        padding: 0 20px;
                        gap: 20px;
                    ">
                        <!-- 左側空白區域 -->
                        <div style="grid-area: left;"></div>
                        
                        <!-- 置中的輸入提示框 -->
                        <div style="
                            grid-area: center;
                            display: flex;
                            justify-content: center;
                        ">
                            <div id="input-prompt-box" style="
                                background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
                                border: 3px solid #ff4757;
                                border-radius: 20px;
                                padding: 20px;
                                text-align: center;
                                width: 100%;
                                max-width: 350px;
                                box-shadow: 0 8px 25px rgba(255, 71, 87, 0.3);
                                cursor: pointer;
                                transition: all 0.3s ease;
                                animation: pulseGlow 2s infinite;
                            ">
                                <div style="
                                    font-size: 1.8em;
                                    color: white;
                                    font-weight: bold;
                                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                                    margin-bottom: 10px;
                                ">${promptText}</div>
                                <div style="
                                    font-size: 1.2em;
                                    color: #ffe6e6;
                                    opacity: 0.9;
                                ">點擊此處輸入答案</div>
                                <div style="
                                    margin-top: 10px;
                                    font-size: 2em;
                                ">👆</div>
                            </div>
                        </div>
                        
                        <!-- 靠右對齊的提示框 -->
                        <div style="
                            grid-area: right;
                            display: flex;
                            justify-content: flex-start;
                        ">
                            ${this.hintBox()}
                        </div>
                    </div>
                    <style>
                        @keyframes pulseGlow {
                            0%, 100% { 
                                box-shadow: 0 8px 25px rgba(255, 71, 87, 0.3);
                                transform: scale(1);
                            }
                            50% { 
                                box-shadow: 0 12px 35px rgba(255, 71, 87, 0.5);
                                transform: scale(1.02);
                            }
                        }
                        
                        #input-prompt-box:hover {
                            transform: scale(1.05) !important;
                            box-shadow: 0 15px 40px rgba(255, 71, 87, 0.6) !important;
                            background: linear-gradient(135deg, #ff5252, #ff7979) !important;
                        }
                        
                        @media (max-width: 800px) {
                            .input-prompt-container {
                                grid-template-columns: 1fr !important;
                                grid-template-areas: 
                                    'center'
                                    'right' !important;
                                gap: 15px !important;
                                text-align: center !important;
                            }
                            
                            .input-prompt-container > div:first-child {
                                display: none !important;
                            }
                            
                            .input-prompt-container > div:last-child {
                                justify-content: center !important;
                            }
                            
                            #input-prompt-box {
                                max-width: 300px !important;
                                font-size: 0.9em;
                            }
                        }
                    </style>
                `;
            },

            // 可愛的反饋彈跳視窗
            feedbackPopup(isCorrect, message, emoji = '') {
                const popupClass = isCorrect ? 'feedback-popup correct' : 'feedback-popup incorrect';
                const bgColor = isCorrect ? '#e8f5e8' : '#ffe8e8';
                const textColor = isCorrect ? '#2d5a2d' : '#7a2d2d';
                const borderColor = isCorrect ? '#4caf50' : '#f44336';
                
                return `
                    <div id="feedback-popup" class="${popupClass}" style="
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) scale(0);
                        background: ${bgColor};
                        border: 3px solid ${borderColor};
                        border-radius: 20px;
                        padding: 30px;
                        text-align: center;
                        z-index: 2000;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                        min-width: 300px;
                        animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
                    ">
                        <div style="font-size: 4em; margin-bottom: 15px;">${emoji}</div>
                        <div style="
                            font-size: 1.8em;
                            color: ${textColor};
                            font-weight: bold;
                            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                        ">${message}</div>
                        <div style="
                            margin-top: 20px;
                            font-size: 1em;
                            color: ${textColor};
                            opacity: 0.8;
                        ">點擊任意處繼續</div>
                    </div>
                    <div id="feedback-backdrop" style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.5);
                        z-index: 1999;
                        animation: fadeIn 0.3s ease-out forwards;
                    "></div>
                    <style>
                        @keyframes bounceIn {
                            0% {
                                transform: translate(-50%, -50%) scale(0);
                                opacity: 0;
                            }
                            50% {
                                transform: translate(-50%, -50%) scale(1.1);
                                opacity: 1;
                            }
                            100% {
                                transform: translate(-50%, -50%) scale(1);
                                opacity: 1;
                            }
                        }
                        
                        @keyframes fadeIn {
                            0% { opacity: 0; }
                            100% { opacity: 1; }
                        }
                        
                        .feedback-popup {
                            cursor: pointer;
                            user-select: none;
                        }
                        
                        .feedback-popup:hover {
                            transform: translate(-50%, -50%) scale(1.05) !important;
                            transition: transform 0.2s ease;
                        }
                    </style>
                `;
            }
        },

        // =====================================================
        // 🎯 觸控拖曳管理器 - 配置驅動
        // =====================================================
        TouchDragManager: {
            isInitialized: false,
            currentConfig: null,

            /**
             * 【修改後】初始化觸控拖曳功能 (增加等待機制)
             * @param {string} difficulty - 難度等級
             * @param {Object} config - ModeConfig配置
             */
            init(difficulty, config) {
                Game.Debug.logUI('請求初始化觸控拖曳管理器', difficulty, config.touchDragConfig);

                if (!config.touchDragConfig?.enabled) {
                    Game.Debug.logUI('觸控拖曳在配置中被禁用', difficulty);
                    return;
                }

                let attempts = 0;
                const maxAttempts = 30; // 最多等待 3 秒 (30 * 100ms)

                const checkUtilityReady = () => {
                    attempts++;
                    // 檢查 TouchDragUtility 是否已成功載入並掛載到 window 物件上
                    if (typeof window.TouchDragUtility !== 'undefined') {
                        Game.Debug.logUI('TouchDragUtility 已準備就緒，開始初始化', `嘗試次數: ${attempts}`);
                        
                        this.currentConfig = config.touchDragConfig;
                        
                        const initDelay = this.currentConfig.createCloneDelay || 50;
                        
                        setTimeout(() => {
                            this.registerDraggableElements(difficulty, config);
                            this.registerDropZones(difficulty, config);
                            this.isInitialized = true;
                            Game.Debug.logUI('觸控拖曳核心功能初始化完成', difficulty);
                        }, initDelay);

                    } else if (attempts < maxAttempts) {
                        // 如果還沒準備好，且未超過最大嘗試次數，則 100 毫秒後再試一次
                        Game.Debug.logUI('等待 TouchDragUtility 載入...', `第 ${attempts} 次嘗試`);
                        setTimeout(checkUtilityReady, 100);
                    } else {
                        // 如果超過最大嘗試次數後仍然找不到，則記錄錯誤
                        Game.Debug.logError('TouchDragUtility 載入超時或失敗', 'TouchDragManager.init');
                    }
                };

                // 開始第一次檢查
                checkUtilityReady();
            },

            /**
             * 註冊可拖曳元素
             */
            registerDraggableElements(difficulty, config) {
                const app = document.getElementById('app');
                const draggableSelector = this.currentConfig.selectors.draggable;
                
                Game.Debug.logUI('註冊可拖曳元素', `選擇器: ${draggableSelector}`);

                // 註冊拖曳處理器
                window.TouchDragUtility.registerDraggable(app, draggableSelector, {
                    onDragStart: (element, event) => {
                        Game.Debug.logUserAction('觸控拖曳開始', element.dataset);
                        // 呼叫現有的handleDragStart邏輯
                        return Game.handleDragStart({ target: element });
                    },
                    onDrop: (draggedElement, dropZone, syntheticEvent) => {
                        Game.Debug.logUserAction('觸控放置', {
                            draggedElement: draggedElement.dataset,
                            dropZone: dropZone.className
                        });
                        // 建立合成的drop事件並呼叫現有的handleDrop邏輯
                        const mockDropEvent = this.createMockDropEvent(draggedElement, dropZone, syntheticEvent);
                        Game.handleDrop(mockDropEvent);
                    },
                    onDragEnd: (element, event) => {
                        Game.Debug.logUserAction('觸控拖曳結束', element.dataset);
                        // 呼叫現有的handleDragEnd邏輯
                        Game.handleDragEnd({ target: element });
                    }
                });
            },

            /**
             * 註冊放置區
             */
            registerDropZones(difficulty, config) {
                const dropZoneSelector = this.currentConfig.selectors.dropZone;
                const dropZones = document.querySelectorAll(dropZoneSelector);
                
                Game.Debug.logUI('註冊放置區', `找到 ${dropZones.length} 個放置區`);

                dropZones.forEach(zone => {
                    window.TouchDragUtility.registerDropZone(zone, (draggedElement, dropZone) => {
                        // 使用配置驅動的驗證邏輯
                        return this.validateDrop(draggedElement, dropZone, difficulty, config);
                    });
                });
            },

            /**
             * 建立模擬的drop事件
             */
            createMockDropEvent(draggedElement, dropZone, syntheticEvent) {
                return {
                    preventDefault: () => {},
                    target: dropZone,
                    dataTransfer: {
                        getData: (type) => {
                            if (type === 'text/plain') {
                                return draggedElement.dataset.id || draggedElement.dataset.index || '';
                            }
                            if (type === 'icon') {
                                return draggedElement.dataset.icon || '';
                            }
                            return '';
                        }
                    },
                    syntheticTouchDrop: true,
                    originalTouchEvent: syntheticEvent
                };
            },

            /**
             * 配置驅動的放置驗證
             */
            validateDrop(draggedElement, dropZone, difficulty, config) {
                // 基本驗證：確保不是靜態元素
                if (draggedElement.classList.contains('static-item')) {
                    Game.Debug.logUserAction('拒絕拖曳靜態元素', draggedElement.className);
                    return false;
                }

                // 基本驗證：確保放置區是有效的
                const validDropZones = config.touchDragConfig.selectors.dropZone.split(',').map(s => s.trim());
                const isValidDropZone = validDropZones.some(selector => {
                    const className = selector.replace('.', '');
                    return dropZone.classList.contains(className);
                });

                if (!isValidDropZone) {
                    Game.Debug.logUserAction('無效的放置區', dropZone.className);
                    return false;
                }

                return true;
            },

            /**
             * 清理觸控拖曳註冊
             */
            cleanup() {
                if (this.isInitialized && typeof window.TouchDragUtility !== 'undefined') {
                    // 清理所有註冊的處理器
                    const app = document.getElementById('app');
                    if (app) {
                        window.TouchDragUtility.unregisterDraggable(app);
                    }
                    
                    const dropZones = document.querySelectorAll(this.currentConfig?.selectors?.dropZone || '');
                    dropZones.forEach(zone => {
                        window.TouchDragUtility.unregisterDropZone(zone);
                    });

                    this.isInitialized = false;
                    this.currentConfig = null;
                    Game.Debug.logUI('觸控拖曳清理完成');
                }
            }
        },

        // =====================================================
        // Initialization
        // =====================================================
        init() {
            Game.Debug.logGameFlow('遊戲初始化開始');
            
            try {
                // 【配置驅動】清理觸控拖曳管理器（返回設定時）
                this.TouchDragManager.cleanup();
                
                this.Speech.init();
                Game.Debug.logGameFlow('語音系統初始化完成');
                
                this.showSettings();
                Game.Debug.logGameFlow('設定畫面載入完成');
            } catch (error) {
                Game.Debug.logError(error, '遊戲初始化失敗');
            }
        },

        // =====================================================
        // Settings Screen
        // =====================================================
        showSettings() {
            Game.Debug.logGameFlow('載入設定畫面');
            Game.Debug.logTemplate('settingsScreen', this.state.settings);
            
            const app = document.getElementById('app');
            const { settings } = this.state;
            
            app.innerHTML = this.HTMLTemplates.settingsScreen(
                settings.difficulty, 
                settings.theme, 
                settings.questionCount, 
                settings.testMode,
                settings.countingRange
            );

            Game.Debug.logUI('綁定設定選擇事件', 'game-settings');
            app.querySelector('.game-settings').addEventListener('click', this.handleSelection.bind(this));
            
            Game.Debug.logUI('綁定開始遊戲事件', 'start-game-btn');
            app.querySelector('#start-game-btn').addEventListener('click', this.start.bind(this));
            
            Game.Debug.logGameFlow('設定畫面載入完成', settings);
        },

        handleSelection(event) {
            const btn = event.target.closest('.selection-btn');
            if (!btn) return;

            // 檢查按鈕是否被禁用
            if (btn.disabled || btn.classList.contains('disabled')) {
                return; // 禁用的按鈕不執行任何操作
            }

            const { type, value } = btn.dataset;
            Game.Debug.logUserAction('設定選擇', { type, value });
            
            this.Audio.playSound('select', null, { audioFeedback: true });

            // 處理自訂題目數量
            if (type === 'questionCount' && value === 'custom') {
                this.showNumberInput('請輸入題目數量 (1-50)', (num) => {
                    const count = parseInt(num);
                    if (count > 0 && count <= 50) {
                        this.state.settings.questionCount = count;
                        this.state.totalTurns = count;
                        btn.closest('.button-group').querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        this.updateStartButton();
                        return true;
                    }
                    return false;
                });
                return;
            }

            // 處理自訂數數範圍
            if (type === 'countingRange' && value === 'custom') {
                this.showRangeInput('請輸入數數範圍', (minVal, maxVal) => {
                    if (minVal > 0 && maxVal > minVal && maxVal <= 50) {
                        // 建立自訂範圍配置
                        this.gameData.countingRanges.custom = {
                            minItems: minVal,
                            maxItems: maxVal,
                            label: `${minVal}-${maxVal}`
                        };
                        this.state.settings.countingRange = 'custom';
                        btn.closest('.button-group').querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        btn.textContent = `${minVal}-${maxVal}`; // 更新按鈕文字
                        this.updateStartButton();
                        return true;
                    }
                    return false;
                });
                return;
            }

            // 處理自訂主題選擇
            if (type === 'theme' && value === 'custom') {
                this.state.settings.theme = 'custom';
                btn.closest('.button-group').querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 重新渲染設定頁面以顯示自訂主題設定區
                this.showSettings();
                this.updateStartButton();
                return;
            }
            
            this.state.settings[type] = (type === 'questionCount') ? parseInt(value) : value;
            if (type === 'questionCount') this.state.totalTurns = parseInt(value);

            // 如果是難度選擇變更，需要重新渲染整個設定頁面以更新主題選擇的禁用狀態
            if (type === 'difficulty') {
                this.showSettings();
                return;
            }

            const buttonGroup = btn.closest('.button-group');
            buttonGroup.querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            this.updateStartButton();
        },

        updateStartButton() {
            const { difficulty, theme, questionCount, testMode, countingRange } = this.state.settings;
            const startBtn = document.getElementById('start-game-btn');
            
            // 檢查自訂主題是否有足夠的圖示
            const isCustomThemeValid = theme !== 'custom' || this.state.customItems.length >= 1;
            
            // 簡單模式不需要測驗模式設定
            if (difficulty === 'easy' && theme && questionCount && countingRange && isCustomThemeValid) {
                startBtn.disabled = false;
                startBtn.textContent = '開始遊戲！';
            } else if (difficulty === 'normal' && difficulty && theme && questionCount && testMode && countingRange && isCustomThemeValid) {
                startBtn.disabled = false;
                startBtn.textContent = '開始遊戲！';
            } else if (difficulty === 'hard' && difficulty && questionCount && testMode && countingRange) {
                // 困難模式不需要選擇主題，因為使用多種主題
                startBtn.disabled = false;
                startBtn.textContent = '開始遊戲！';
            } else {
                startBtn.disabled = true;
                if (theme === 'custom' && this.state.customItems.length < 1) {
                    startBtn.textContent = '自訂主題需要至少1個圖示';
                } else {
                    startBtn.textContent = '請完成所有選擇';
                }
            }
        },

        // =====================================================
        // Game Flow
        // =====================================================
        async start() {
            console.group(`${Game.Debug.logPrefix}[遊戲開始]`);
            const startTime = Game.Debug.logPerformance('遊戲開始');
            
            Game.Debug.logState('重置遊戲狀態', 
                { score: this.state.score, currentTurn: this.state.currentTurn },
                { score: 0, currentTurn: 0 }
            );
            
            this.state.score = 0;
            this.state.currentTurn = 0;
            this.state.isStartingNewTurn = false;
            
            Game.Debug.logConfig(this.state.settings.difficulty, this.ModeConfig[this.state.settings.difficulty]);
            
            this.setupGameUI();
            await this.startNewTurn();
            
            Game.Debug.logPerformance('遊戲開始', startTime);
            console.groupEnd();
        },

        setupGameUI() {
            Game.Debug.logGameFlow('設置遊戲UI');
            const app = document.getElementById('app');
            const { difficulty } = this.state.settings;
            
            Game.Debug.logTemplate('gameLayout', { 
                currentTurn: this.state.currentTurn + 1, 
                totalTurns: this.state.totalTurns, 
                difficulty 
            });
            
            // 渲染遊戲主要佈局
            app.innerHTML = this.HTMLTemplates.gameLayout(
                this.state.currentTurn + 1, 
                this.state.totalTurns, 
                difficulty
            );
            
            Game.Debug.logTemplate('gameStyles');
            // *** MODIFIED ***: 注入遊戲畫面專用樣式
            app.insertAdjacentHTML('beforeend', this.HTMLTemplates.gameStyles());

            Game.Debug.logUI('取得DOM元素');
            Object.assign(this.elements, {
                targetArea: document.getElementById('target-area'),
                sourceArea: document.getElementById('source-area'),
                optionsArea: document.getElementById('options-area'),
                progressInfo: document.getElementById('progress-info'),
                scoreInfo: document.getElementById('score-info'),
                gameTitle: document.getElementById('game-title')
            });
            
            // F1 不需要點擊事件監聽器，使用拖拽系統
            Game.Debug.logUI('F1使用拖拽系統，跳過點擊事件綁定');
            
            // 【配置驅動】初始化觸控拖曳管理器
            const config = this.ModeConfig[difficulty];
            if (config.touchDragConfig?.enabled) {
                // 清理舊的觸控拖曳註冊（如果有的話）
                this.TouchDragManager.cleanup();
                // 初始化新的觸控拖曳功能
                this.TouchDragManager.init(difficulty, config);
            }
            
            // 使用事件委託綁定到整個app區域，以處理動態創建的選項按鈕
            Game.Debug.logUI('使用事件委託綁定選項事件', 'app delegated click');
            app.addEventListener('click', (event) => {
                // 檢查是否點擊的是選項按鈕
                const selectedBtn = event.target.closest('.payment-btn');
                if (selectedBtn && selectedBtn.closest('#options-area')) {
                    Game.Debug.logUserAction('事件委託捕獲選項點擊', {
                        buttonText: selectedBtn.textContent,
                        buttonValue: selectedBtn.dataset.value,
                        targetElement: event.target.tagName,
                        targetClass: event.target.className
                    });
                    this.boundHandleAnswerClick(event);
                }
            });
            
            // 記錄options-area的狀態但不依賴它進行事件綁定
            if (this.elements.optionsArea) {
                Game.Debug.logUI('options-area已存在', 'options-area', {
                    innerHTML: this.elements.optionsArea.innerHTML
                });
            } else {
                Game.Debug.logUI('options-area不存在，將使用事件委託處理', 'UI設置');
            }
            
            Game.Debug.logGameFlow('遊戲UI設置完成');
        },

        async startNewTurn() {
            // 防止重複調用的保護機制
            if (this.state.isStartingNewTurn) {
                Game.Debug.logGameFlow('阻止重複開始新回合', { 
                    currentTurn: this.state.currentTurn,
                    isStartingNewTurn: this.state.isStartingNewTurn 
                });
                return;
            }
            this.state.isStartingNewTurn = true;
            
            console.group(`${Game.Debug.logPrefix}[開始新回合]`);
                if (this.state.currentTurn >= this.state.totalTurns) {
                    Game.Debug.logGameFlow('遊戲結束', { 
                        currentTurn: this.state.currentTurn, 
                        totalTurns: this.state.totalTurns 
                    });
                    this.state.isStartingNewTurn = false;
                    this.endGame();
                    return;
                }
                
                const oldTurn = this.state.currentTurn;
                this.state.currentTurn++;
                this.state.isAnswering = false;
                this.state.correctPlacements = 0; // F1: 正確放置數量
                this.state.draggedItems = [];    // F1: 已拖曳物件狀態
                
                // 清理模式特定狀態
                if (this.state.normalMode) {
                    this.state.normalMode = null;
                }
                if (this.state.easyMode) {
                    this.state.easyMode = null;
                }
                if (this.state.hardMode) {
                    this.state.hardMode = null;
                }
                
                Game.Debug.logState('新回合狀態', 
                    { currentTurn: oldTurn, isAnswering: true },
                    { currentTurn: this.state.currentTurn, isAnswering: false, correctPlacements: 0 }
                );
                
                this.updateProgress();

                // 清空區域
                Game.Debug.logUI('清空遊戲區域');
                const targetArea = document.getElementById('target-area');
                const sourceArea = document.getElementById('source-area');
                if (targetArea) targetArea.innerHTML = '';
                if (sourceArea) sourceArea.innerHTML = '';
                if (this.elements.optionsArea) this.elements.optionsArea.innerHTML = '';
                
                // 清理模式特定的CSS樣式，避免模式間樣式干擾
                const styleIdsToRemove = ['dynamic-turn-styles', 'normal-mode-styles', 'hard-mode-styles'];
                styleIdsToRemove.forEach(styleId => {
                    const styleElement = document.head.querySelector(`#${styleId}`);
                    if (styleElement) {
                        styleElement.remove();
                        Game.Debug.logUI('清理樣式', { styleId });
                    }
                });
                
                // 生成題目
                const { difficulty, theme, countingRange } = this.state.settings;
                const config = this.ModeConfig[difficulty];
                const rangeConfig = this.gameData.countingRanges[countingRange];
                
                this.state.correctAnswer = this.getRandomInt(rangeConfig.minItems, rangeConfig.maxItems);
                
                // 困難模式不需要單一主題圖示，使用佔位符
                let randomIcon;
                if (difficulty === 'hard') {
                    // 困難模式會在renderHardMode中處理多個主題的圖示選擇
                    randomIcon = '🎯'; // 佔位符，實際圖示由renderHardMode決定
                } else {
                    // 簡單模式和普通模式使用選定的主題
                    randomIcon = this.gameData.themes[theme].slice().sort(() => 0.5 - Math.random())[0];
                }

                Game.Debug.logGameFlow('生成新題目', {
                    turn: this.state.currentTurn,
                    difficulty,
                    modeType: config.modeType,
                    correctAnswer: this.state.correctAnswer,
                    icon: randomIcon
                });

                // 根據模式類型渲染不同UI
                await this.renderModeSpecificUI(config, difficulty, randomIcon);

                // 播放初始指導語音
                this.Speech.speak('initialInstruction', difficulty, config, {
                    targetCount: this.state.correctAnswer,
                    itemName: this.getItemName(randomIcon),
                    containerName: '容器'
                });
                
                Game.Debug.logGameFlow('新回合準備完成', {
                    turn: this.state.currentTurn,
                    correctAnswer: this.state.correctAnswer,
                    modeType: config.modeType
                });
                
                this.state.isStartingNewTurn = false;
            console.groupEnd();
        },

        async renderModeSpecificUI(config, difficulty, randomIcon) {
            try {
                Game.Debug.logGameFlow('開始renderModeSpecificUI', { 
                    modeType: config.modeType, 
                    difficulty,
                    randomIcon
                });
                
                Game.Debug.logGameFlow('使用傳入的隨機圖示', { 
                    randomIcon,
                    difficulty
                });
                
                switch(config.modeType) {
                    case 'one-to-one-correspondence':
                        Game.Debug.logGameFlow('執行簡單模式渲染');
                        await this.renderEasyMode(randomIcon, difficulty);
                        break;
                    case 'quantity-to-numeral':
                        Game.Debug.logGameFlow('執行普通模式渲染');
                        this.renderNormalMode(randomIcon, difficulty);
                        break;
                    case 'multi-item-correspondence':
                        Game.Debug.logGameFlow('執行困難模式渲染');
                        this.renderHardMode(randomIcon, difficulty);
                        break;
                    default:
                        Game.Debug.logError('未知的模式類型', config.modeType);
                }
                
                Game.Debug.logGameFlow('renderModeSpecificUI完成');
            } catch (error) {
                Game.Debug.logError(error, 'renderModeSpecificUI執行失敗');
            }
        },

        async renderEasyMode(icon, difficulty) {
            const config = this.ModeConfig[difficulty];
            Game.Debug.logGameFlow('簡單模式開始渲染 - 包含演示動畫');
            const sourceArea = document.getElementById('source-area');
            const targetArea = document.getElementById('target-area');

            // --- 階段1：設置初始界面 ---
            sourceArea.innerHTML = '<h3>物品</h3><div class="source-container"></div>';
            targetArea.innerHTML = '<h3>對應</h3><div class="target-container correspondence-pairs-container"></div>';
            
            // 注入本次回合需要的 CSS 樣式
            const styleTag = document.createElement('style');
            styleTag.id = 'dynamic-turn-styles';
            styleTag.innerHTML = `
                .correspondence-frame { position: relative; } /* 設定相對定位，作為動畫的座標基準 */
                .correspondence-pairs-container { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; padding: 10px; border: 2px dashed #a0a0a0; border-radius: 10px; background-color: rgba(255, 255, 255, 0.5); min-height: 120px; }
                .correspondence-pair { display: flex; flex-direction: column; align-items: center; gap: 10px; }
                .correspondence-pair .static-item { opacity: 0.8; cursor: default; border-style: solid; border-color: #666; }
                @keyframes pair-success-anim { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); filter: drop-shadow(0 0 8px #4caf50); } }
                .pair-success { animation: pair-success-anim 0.5s ease-in-out; }
                .source-container { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-start; }
                .source-container .draggable-item { flex-shrink: 0; }
            `;
            document.head.querySelector('#dynamic-turn-styles')?.remove();
            document.head.appendChild(styleTag);

            const sourceContainer = sourceArea.querySelector('.source-container');
            const targetContainer = targetArea.querySelector('.target-container');

            // --- 階段2：準備演示動畫的物件 ---
            // 先創建演示物品和目標區的放置框
            for (let i = 0; i < this.state.correctAnswer; i++) {
                // 創建演示物品
                sourceContainer.insertAdjacentHTML('beforeend', 
                    `<div class="demo-item" data-demo="${i}" style="width: 90px; height: 90px; display: inline-flex; align-items: center; justify-content: center; margin: 5px;">
                        ${this.HTMLTemplates.staticItem(icon, difficulty)}
                    </div>`
                );
                
                // 創建對應區，此時只有放置框，沒有老師的範例
                targetContainer.insertAdjacentHTML('beforeend', `
                    <div class="correspondence-pair" data-pair-index="${i}">
                        ${this.HTMLTemplates.dropZone(i, difficulty, true)}
                    </div>
                `);
            }
            
            // 執行演示動畫，此函式會負責將老師的範例物件移動並放置好
            await this.playDemonstrationAnimation(icon, difficulty, sourceContainer, targetContainer);

            // --- 階段3：設置學生操作環境 ---
            // 動畫已將目標區設置完畢，我們只需清空來源區，並填入可拖曳的學生物件
            sourceContainer.innerHTML = ''; 

            for (let i = 0; i < this.state.correctAnswer; i++) {
                // 為每個物品創建固定的佔位容器
                sourceContainer.insertAdjacentHTML('beforeend', 
                    `<div class="item-slot" data-slot="${i}" style="width: 90px; height: 90px; display: inline-flex; align-items: center; justify-content: center; margin: 5px;">
                        ${this.HTMLTemplates.draggableItem(icon, i, difficulty)}
                    </div>`
                );
            }
            
            // 目標區 (targetContainer) 維持動畫結束後的狀態，不再做任何更動
            Game.Debug.logGameFlow('簡單模式操作環境準備完成');
            
            // 【配置驅動】重新初始化觸控拖曳功能
            if (config.touchDragConfig?.enabled) {
                setTimeout(() => {
                    this.TouchDragManager.cleanup();
                    this.TouchDragManager.init(difficulty, config);
                    Game.Debug.logUI('簡單模式觸控拖曳重新初始化完成');
                }, 200);
            }
        },

        async playDemonstrationAnimation(icon, difficulty, sourceContainer, targetContainer) {
            const config = this.ModeConfig[difficulty];
            Game.Debug.logGameFlow('開始播放新版演示動畫');

            // 等待初始說明語音完整播放完畢
            await new Promise(resolve => {
                this.Speech.speak('demonstration', difficulty, config, {
                    itemCount: this.state.correctAnswer,
                    itemName: this.getItemName(icon)
                }, resolve); // 語音播放完畢後執行回調
            });

            // 語音播放完後短暫停頓
            await new Promise(resolve => setTimeout(resolve, 300));

            const animationContainer = document.querySelector('.correspondence-frame');

            // 改為依序移動，一個完成後再移動下一個
            for (let i = 0; i < this.state.correctAnswer; i++) {
                const demoItemContainer = sourceContainer.querySelector(`[data-demo="${i}"]`);
                const demoItem = demoItemContainer?.firstElementChild;
                const targetDropZone = targetContainer.querySelector(`[data-pair-index="${i}"] .drop-zone`);

                if (!demoItem || !targetDropZone) continue;

                // 等待單個物品的動畫完成
                await new Promise(resolve => {
                    const startRect = demoItem.getBoundingClientRect();
                    const endRect = targetDropZone.getBoundingClientRect();
                    const containerRect = animationContainer.getBoundingClientRect();

                    // 1. 計算移動距離
                    const deltaX = (endRect.left + endRect.width / 2) - (startRect.left + startRect.width / 2);
                    const deltaY = (endRect.top + endRect.height / 2) - (startRect.top + startRect.height / 2);

                    // 2. 將原物品從文檔流中抽離，準備動畫
                    demoItem.style.position = 'absolute';
                    demoItem.style.zIndex = '1000';
                    demoItem.style.top = `${startRect.top - containerRect.top}px`;
                    demoItem.style.left = `${startRect.left - containerRect.left}px`;
                    demoItem.style.margin = '0';
                    animationContainer.appendChild(demoItem);
                    demoItemContainer.style.opacity = '0';

                    // 3. 設置線性的 CSS Transition
                    const animationDuration = 1000; // 恆定 1 秒移動時間
                    demoItem.style.transition = `transform ${animationDuration}ms linear`;
                    
                    // 播放移動音效，並等待播放完畢
                    this.Audio.playSound('select', difficulty, config, () => {
                        // 4. 觸發移動動畫
                        requestAnimationFrame(() => {
                            demoItem.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                        });

                        // 5. 動畫結束後，將物件無縫轉換為最終的靜態範例
                        setTimeout(() => {
                            // 播放成功音效，並等待播放完畢
                            this.Audio.playSound('correct', difficulty, config, () => {
                                const pairContainer = targetDropZone.closest('.correspondence-pair');
                                
                                if (pairContainer) {
                                    // 在對應容器中加入老師的最終範例
                                    pairContainer.insertAdjacentHTML('beforeend', this.HTMLTemplates.staticItem(icon, difficulty));
                                    
                                    // 為新範例加上成功動畫
                                    const teacherItem = pairContainer.querySelector('.static-item');
                                    if (teacherItem) {
                                        teacherItem.classList.add('pair-success');
                                        setTimeout(() => teacherItem.classList.remove('pair-success'), 500);
                                    }
                                }

                                // 移除已完成動畫的移動物件
                                demoItem.remove();
                                resolve(); // 這個物品的動畫已完成
                            });
                        }, animationDuration);
                    });
                });

                // 每個物品完成後短暫停頓再進行下一個
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            await new Promise(resolve => setTimeout(resolve, 800)); // 所有動畫結束後等待一會兒
            Game.Debug.logGameFlow('演示動畫播放完成');
        },

        renderNormalMode(icon, difficulty) {
            const targetArea = document.getElementById('target-area');
            const sourceArea = document.getElementById('source-area');
            
            // 注入普通模式專用CSS樣式
            const styleTag = document.createElement('style');
            styleTag.id = 'normal-mode-styles';
            // 【修改後】 styleTag.innerHTML 
            styleTag.innerHTML = `
                .normal-mode-layout { display: flex; flex-direction: column; gap: 15px; }

                /* 讓放置區和目標區的父容器都具備置中能力 */
                .placement-zone, .target-container-bottom { 
                    text-align: center; /* 關鍵：讓內部的 inline-flex 置中 */
                }

                /* 放置區樣式 (風格同困難模式) */
                .placement-zone { 
                    min-height: 100px;
                    padding: 10px;
                    border-radius: 12px;
                    background: #fdfdfd;
                    border: 3px dashed #8e44ad; /* 採用困難模式的邊框 */
                    transition: all 0.3s ease;
                    margin-top: 10px; /* 與困難模式保持一致 */
                }
                
                /* 普通模式的放置網格 - 改為 inline-grid 與困難模式一致 */
                .placement-grid-normal {
                    display: inline-grid;
                    gap: 10px;
                    align-items: center;
                    justify-items: center;
                    justify-content: center; /* 確保換行後的最後一列也能置中 */
                    grid-template-columns: repeat(auto-fit, 90px); /* 使用固定寬度與困難模式一致 */
                    max-width: 100%;
                }
                
                /* 普通模式的放置格子樣式 */
                .placement-grid-normal .normal-grid-item {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 80px;
                    min-width: 80px;
                    padding: 8px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.5);
                    border: 2px dashed #ccc;
                    box-sizing: border-box;
                    position: relative;
                    transition: all 0.3s ease;
                }
                
                /* 普通模式拖曳懸停效果 */
                .placement-grid-normal .normal-grid-item.drag-over {
                    border-color: #4caf50;
                    background: rgba(76, 175, 80, 0.1);
                }
                
                /* 普通模式位置編號和已填充樣式 */
                .placement-grid-normal .position-hint { font-size: 0.9em; color: #999; }
                .placement-grid-normal .normal-grid-item.filled .position-hint { display: none; }
                .placement-grid-normal .normal-grid-item.filled { 
                    border: 2px solid #ff9800; 
                    background: white; /* 外層方框白色背景 */
                }
                .placement-grid-normal .normal-grid-item.filled .draggable-item { 
                    background: #e8f5e8; /* 內層方框綠色背景 */
                    border: 1px solid #4caf50;
                }
                .placement-zone.dragover { /* 拖曳懸停效果 */
                    border-color: #4caf50 !important;
                    background: rgba(76, 175, 80, 0.1) !important;
                }
                .zone-hint { /* 提示文字樣式 */
                    color: #888; 
                    font-style: italic; 
                    pointer-events: none; 
                    font-size: 1.1em;
                    align-self: center; /* 垂直置中 */
                    padding: 20px;
                }
                .zone-hint.has-items { display: none; }

                /* 【新增此段】目標區外層容器樣式 - 綠色背景深綠色邊框 */
                .target-container-bottom {
                    min-height: 100px;
                    padding: 10px;
                    border-radius: 12px;
                    background: #e8f5e8; /* 背景改為綠色 */
                    border: 3px dashed #2e7d32; /* 深綠色虛線邊框 */
                    transition: all 0.3s ease;
                    margin-top: 10px;
                    text-align: center; /* 確保內容置中 */
                }
                
                /* 目標區內層網格樣式 - 與對應框的 placement-grid-normal 一致 */
                .target-item-container {
                    display: inline-grid;
                    gap: 10px;
                    align-items: center;
                    justify-items: center;
                    justify-content: center;
                    grid-template-columns: repeat(auto-fit, 90px);
                    max-width: 100%;
                    background: transparent; /* 內層背景透明，讓外層白色背景顯示 */
                    border: none; /* 移除內層邊框，只保留外層邊框 */
                    padding: 0; /* 移除內層內邊距，由外層提供 */
                }
                
                /* 目標區標題樣式調整 */
                .target-container-bottom h3 {
                    margin: 0 0 10px 0;
                    color: #333;
                }
                
                /* 目標區物品圖示樣式 - 綠色內層方框 */
                .target-item-container .static-item {
                    background: #e8f5e8; /* 內層方框綠色背景 */
                    border: 1px solid #4caf50;
                    padding: 8px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                /* 完成按鈕樣式 (維持不變) */
                .completion-area { text-align: center; }
                .complete-btn { background: linear-gradient(135deg, #4caf50, #45a049); color: white; border: none; padding: 15px 30px; font-size: 1.2em; font-weight: 600; border-radius: 25px; cursor: pointer; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3); transition: all 0.3s ease; }
                .complete-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4); }
                .complete-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }
                
                /* 錯誤動畫 (維持不變) */
                .error-shake { animation: error-shake-anim 0.6s ease-in-out; border-color: #f44336 !important; }
                @keyframes error-shake-anim { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }
            `;
            document.head.querySelector('#normal-mode-styles')?.remove();
            document.head.appendChild(styleTag);
            
            // 來源區：只有物品框，移除「我的選擇」放置框
            sourceArea.innerHTML = `
                <div class="normal-mode-layout">
                    <h3>物品框</h3>
                    <div class="source-container" 
                         style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; padding: 15px; border: 2px solid #ff9800; border-radius: 15px; background: linear-gradient(135deg, #fff3e0, #ffe0b2); min-height: 100px;"
                         ondrop="Game.handleDrop(event)"
                         ondragover="Game.handleDragOver(event)"
                         ondragenter="Game.handleDragEnter(event)"
                         ondragleave="Game.handleDragLeave(event)"></div>
                </div>
            `;
            
            // 【修改後】 targetArea.innerHTML 
            // 目標區：放置框在頂部，然後是對應框和完成按鈕
            targetArea.innerHTML = `
                <div class="normal-mode-layout">
                    <h3>對應框</h3>
                    <div class="placement-zone" id="target-placement-zone"
                         ondrop="Game.handleDrop(event)"
                         ondragover="Game.handleDragOver(event)"
                         ondragenter="Game.handleDragEnter(event)"
                         ondragleave="Game.handleDragLeave(event)">
                        <div class="placement-grid-normal"></div>
                    </div>

                    <div class="target-container-bottom">
                        <h3>目標區 (應有 ${this.state.correctAnswer} 個)</h3>
                        <div class="target-item-container"></div>
                    </div>

                    <div class="completion-area">
                        <button class="complete-btn" id="complete-btn" onclick="Game.handleNormalComplete()">
                            完成
                        </button>
                    </div>
                </div>
            `;
            
            // 生成物品和參考物件
            const sourceContainer = sourceArea.querySelector('.source-container');
            const targetItemContainer = targetArea.querySelector('.target-item-container');
            const placementGrid = targetArea.querySelector('.placement-grid-normal');
            
            // 來源區：提供隨機數量的干擾物件 (1-5個額外物品)
            const distractorCount = this.getRandomInt(1, 5);
            const totalItems = this.state.correctAnswer + distractorCount;

            // --- 【關鍵修正】 ---
            // 為物品的 data-id 添加前綴 "normal-item-"，避免與格子的 data-index 產生衝突
            for (let i = 0; i < totalItems; i++) {
                sourceContainer.insertAdjacentHTML('beforeend', 
                    this.HTMLTemplates.draggableItem(icon, `normal-item-${i}`, difficulty)
                );
            }
            
            // 對應框：創建空白的虛線格子 (與困難模式類似)
            for (let i = 0; i < this.state.correctAnswer; i++) {
                const emptyItem = document.createElement('div');
                emptyItem.className = 'normal-grid-item';
                emptyItem.dataset.index = i;
                
                // 添加位置編號作為提示
                emptyItem.innerHTML = `<span class="position-hint">${i + 1}</span>`;
                
                placementGrid.appendChild(emptyItem);
            }
            
            // 目標區：將正確數量的參考物件放入新的單一容器中
            for (let i = 0; i < this.state.correctAnswer; i++) {
                targetItemContainer.insertAdjacentHTML('beforeend', 
                    this.HTMLTemplates.staticItem(icon, difficulty)
                );
            }
            
            // 初始化狀態
            this.state.normalMode = {}; // 狀態將通過讀取DOM來管理
            
            Game.Debug.logGameFlow('普通模式UI渲染完成', { 
                targetCount: this.state.correctAnswer, 
                totalAvailable: totalItems 
            });
            
            // 【配置驅動】重新初始化觸控拖曳功能
            const touchConfig = this.ModeConfig[difficulty];
            if (touchConfig.touchDragConfig?.enabled) {
                setTimeout(() => {
                    this.TouchDragManager.cleanup();
                    this.TouchDragManager.init(difficulty, touchConfig);
                    Game.Debug.logUI('普通模式觸控拖曳重新初始化完成');
                }, 200);
            }
        },

        renderHardMode(primaryIcon, difficulty) {
            try {
                Game.Debug.logGameFlow('困難模式渲染開始', { 
                    primaryIcon, 
                    difficulty 
                });
                
                const config = this.ModeConfig[difficulty];
                const { theme, countingRange } = this.state.settings;
                const rangeConfig = this.gameData.countingRanges[countingRange];
                
                Game.Debug.logGameFlow('困難模式配置檢查', { 
                    config: !!config,
                    theme,
                    countingRange,
                    rangeConfig: !!rangeConfig
                });

            // --- 【關鍵修正】---
            // 1. 根據數數範圍，決定本回合的「物品總數」
            const totalItemsToPlace = this.getRandomInt(rangeConfig.minItems, rangeConfig.maxItems);

            // 2. 決定要使用幾種圖示 (1到5種，且不超過總數)
            const numTargetTypes = this.getRandomInt(1, Math.min(5, totalItemsToPlace));
            
            // 困難模式使用所有主題的圖示
            const allAvailableIcons = [];
            Object.values(this.gameData.themes).forEach(themeIcons => {
                allAvailableIcons.push(...themeIcons);
            });
            const availableIcons = allAvailableIcons.sort(() => 0.5 - Math.random());
            
            // 3. 將「物品總數」分配到這幾種圖示上
            const targetIcons = availableIcons.slice(0, numTargetTypes);
            const counts = new Array(numTargetTypes).fill(1); // 每種至少一個
            let remainingItems = totalItemsToPlace - numTargetTypes;
            while (remainingItems > 0) {
                counts[this.getRandomInt(0, numTargetTypes - 1)]++;
                remainingItems--;
            }

            // 4. 建立最終的答案對照表 (correctAnswerSet)
            const correctAnswerSet = new Map();
            targetIcons.forEach((icon, index) => {
                correctAnswerSet.set(icon, counts[index]);
            });
            // --- 修正結束 ---

            // 2. 生成干擾項：1-3種完全無關的圖示，數量可以不受範圍限制
            const numDistractorTypes = this.getRandomInt(1, 3);
            const distractorItems = [];
            for(let i = 0; i < numDistractorTypes; i++) {
                const icon = availableIcons.pop();
                // 干擾項數量保持較小，不干擾主要學習目標
                const count = this.getRandomInt(1, 5);
                for (let j = 0; j < count; j++) {
                    distractorItems.push({ icon, type: 'distractor' });
                }
            }

            // 3. 組合所有來源區物品
            const sourceItems = [];
            correctAnswerSet.forEach((count, icon) => {
                // 【修正】來源區提供的正確物品數量應與答案一致
                for (let i = 0; i < count; i++) {
                    sourceItems.push({ icon, type: 'target' });
                }
            });
            sourceItems.push(...distractorItems);
            sourceItems.sort(() => 0.5 - Math.random()); // 打亂順序
            
            // 調試信息：顯示目標物品數量分佈
            Game.Debug.logGameFlow('困難模式物品生成完成', {
                totalItemsToPlace,
                targetTypes: Array.from(correctAnswerSet.entries()),
                distractorCount: distractorItems.length,
                totalSourceItems: sourceItems.length,
                rangeConfig: `${rangeConfig.minItems}-${rangeConfig.maxItems}`
            });

            // 4. 渲染UI
            const targetArea = document.getElementById('target-area');
            const sourceArea = document.getElementById('source-area');
            
            // 添加困難模式專用CSS (使用Grid對齊)
            const styleTag = document.createElement('style');
            styleTag.id = 'dynamic-turn-styles';
            styleTag.innerHTML = `
                /* 讓放置區和目標區的父容器都具備置中能力 */
                .placement-zone, .target-container-bottom { 
                    text-align: center; /* 關鍵：讓內部的 inline-grid 置中 */
                }

                /* 放置區容器樣式 - 讓它變回一個可見的、帶虛線邊框的容器 */
                .placement-zone { 
                    min-height: 100px;
                    padding: 10px;
                    border-radius: 12px;
                    background: #fdfdfd;
                    border: 3px dashed #8e44ad; /* 給放置區一個明顯的邊框 */
                    transition: all 0.3s ease;
                    margin-top: 10px;
                }

                /* 目標區外層容器樣式 - 與放置區相同的容器樣式 */
                .target-container-bottom {
                    min-height: 100px;
                    padding: 10px;
                    border-radius: 12px;
                    background: #f0f8ff; /* 淺藍色背景，與放置區區分 */
                    border: 3px dashed #2980b9; /* 藍色虛線邊框 */
                    transition: all 0.3s ease;
                    margin-top: 10px;
                }

                /* 目標區容器的 h3 標題樣式 */
                .target-container-bottom h3 {
                    margin: 0 0 10px 0;
                    color: #333;
                }

                /* 讓放置區和目標區的 Grid 共享完全相同的置中樣式 */
                .target-grid, .placement-grid {
                    display: inline-grid; /* 關鍵：兩者都使用 inline-grid */
                    gap: 10px;
                    align-items: center;
                    justify-items: center;
                    
                    /* --- 修改以下兩行 --- */
                    justify-content: center; /* 新增：確保換行後的最後一列也能置中 */
                    grid-template-columns: repeat(auto-fit, 90px); /* 修改：使用固定寬度取代彈性寬度 */
                    
                    /* 確保網格不會超出其容器的寬度 */
                    max-width: 100%;
                }
                
                /* 目標區 Grid 的特定樣式 */
                .target-grid {
                    border: 2px solid #2980b9; 
                    background: #ecf5f9; 
                    border-radius: 10px; 
                    padding: 10px;
                }

                /* 目標區項目樣式 */
                .target-grid .target-grid-item {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 80px;
                    min-width: 80px;
                    padding: 8px;
                    border-radius: 8px;
                    background: white;
                    border: 2px solid #ddd;
                    box-sizing: border-box;
                }

                /* 放置區項目樣式 - 顯示虛線框架 */
                .placement-grid .target-grid-item {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 80px;
                    min-width: 80px;
                    padding: 8px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.5);
                    border: 2px dashed #ccc;
                    box-sizing: border-box;
                    position: relative;
                    transition: all 0.3s ease;
                }
                
                /* 拖曳懸停效果 */
                .placement-grid .target-grid-item.drag-over {
                    border-color: #4caf50;
                    background: rgba(76, 175, 80, 0.1);
                }

                /* 位置編號和已填充樣式 */
                .placement-grid .position-hint { font-size: 0.9em; color: #999; }
                .placement-grid .target-grid-item.filled .position-hint { display: none; }
                .placement-grid .target-grid-item.filled { 
                    border: 2px solid #4caf50; 
                    background: white; /* 外層方框白色背景 */
                }
                .placement-grid .target-grid-item.filled .draggable-item { 
                    background: #e8f5e8; /* 內層方框綠色背景 */
                    border: 1px solid #4caf50;
                }

                /* 其他按鈕和標題樣式 (維持不變) */
                .header-with-hint { display: flex; justify-content: space-between; align-items: center; }
                .header-with-hint h3 { margin: 0; font-size: 1.5em; color: #333; }
                .complete-btn { background: #27ae60; color: white; border: none; padding: 15px 30px; font-size: 1.2em; border-radius: 25px; cursor: pointer; }
                .hint-btn { background: #f39c12; color: white; border: none; padding: 8px 15px; font-size: 0.9em; border-radius: 20px; cursor: pointer; }
                
                /* 提示動畫效果 */
                @keyframes hint-glow-anim {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 10px #f39c12; }
                    50% { transform: scale(1.15); box-shadow: 0 0 25px #f39c12; }
                }
                .hint-glow { animation: hint-glow-anim 0.75s ease-in-out 2; }
                
                /* 錯誤動畫效果 */
                .error-shake { animation: error-shake-anim 0.82s both; }
                @keyframes error-shake-anim { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
            `;
            document.head.querySelector('#dynamic-turn-styles')?.remove();
            document.head.appendChild(styleTag);

            // 渲染來源區
            sourceArea.innerHTML = `
                <h3>物品區</h3>
                <div class="source-container" 
                     ondrop="Game.handleDrop(event)"
                     ondragover="Game.handleDragOver(event)"
                     ondragenter="Game.handleDragEnter(event)"
                     ondragleave="Game.handleDragLeave(event)"></div>`;
            
            // 渲染目標區 (正常上下分離版面)
            targetArea.innerHTML = `
                <div class="header-with-hint">
                    <h3>對應框</h3>
                    ${config.uiElements.showHintButton ? `<button class="hint-btn" onclick="Game.handleHintClick()">💡 提示</button>` : ''}
                </div>

                <div class="placement-zone hard-placement-zone" id="placement-zone"
                     ondrop="Game.handleDrop(event)"
                     ondragover="Game.handleDragOver(event)"
                     ondragenter="Game.handleDragEnter(event)"
                     ondragleave="Game.handleDragLeave(event)">
                </div>

                <div class="target-container-bottom">
                    <h3>目標區</h3>
                </div>

                <div class="completion-area" style="text-align: center; margin-top: 15px;">
                    <button class="complete-btn" id="complete-btn" onclick="Game.handleHardComplete()">完成</button>
                </div>`;

            const sourceContainer = sourceArea.querySelector('.source-container');
            // 將 targetContainer 改為指向新的底層容器
            const targetContainer = targetArea.querySelector('.target-container-bottom');
            const placementZone = targetArea.querySelector('.placement-zone');
            
            // 渲染來源區物品（包含正確項目和干擾項）
            sourceItems.forEach((item, index) => {
                sourceContainer.insertAdjacentHTML('beforeend', this.HTMLTemplates.draggableItem(item.icon, `item-${index}`, difficulty));
            });

            // 第1步：創建目標區
            let totalItems = 0;
            correctAnswerSet.forEach(count => totalItems += count);
            
            Game.Debug.logGameFlow('創建目標區', { 
                totalItems, 
                targetContainer: !!targetContainer,
                containerClass: targetContainer?.className 
            });
            
            // 創建目標區Grid容器
            const targetGrid = document.createElement('div');
            targetGrid.className = 'target-grid';
            targetContainer.appendChild(targetGrid); // 使用 appendChild 而不是 innerHTML
            
            Game.Debug.logGameFlow('目標區Grid創建', { 
                targetGrid: !!targetGrid,
                gridColumns: targetGrid?.style.gridTemplateColumns
            });
            
            // 填充目標區圖示
            let itemIndex = 0;
            correctAnswerSet.forEach((count, icon) => {
                for (let i = 0; i < count; i++) {
                    targetGrid.insertAdjacentHTML('beforeend', `
                        <div class="target-grid-item" data-index="${itemIndex}" data-icon="${icon}">
                            ${this.HTMLTemplates.staticItem(icon, difficulty, 1)}
                        </div>
                    `);
                    itemIndex++;
                }
            });
            
            // 第2步：手動創建空的放置區Grid（不使用複製）
            const placementGridHTML = `<div class="placement-grid"></div>`;
            placementZone.innerHTML = placementGridHTML;
            const placementGrid = placementZone.querySelector('.placement-grid');
            
            // 手動創建空的放置項目，顯示位置編號
            let placementIndex = 0;
            correctAnswerSet.forEach((count, icon) => {
                for (let i = 0; i < count; i++) {
                    const emptyItem = document.createElement('div');
                    emptyItem.className = 'target-grid-item';
                    emptyItem.dataset.index = placementIndex;
                    emptyItem.dataset.icon = icon;
                    
                    // 添加位置編號作為提示
                    emptyItem.innerHTML = `<span class="position-hint">${placementIndex + 1}</span>`;
                    
                    placementGrid.appendChild(emptyItem);
                    
                    Game.Debug.logGameFlow(`創建空放置項目 ${placementIndex}`, { 
                        icon,
                        hasPositionHint: !!emptyItem.querySelector('.position-hint')
                    });
                    
                    placementIndex++;
                }
            });
            
            // 初始化困難模式狀態
            this.state.hardMode = {
                correctAnswerSet,
                placedItems: new Map() // { "🍎": [element1, element2], "🍌": [element3] }
            };
            
            Game.Debug.logGameFlow('困難模式UI渲染完成', { 
                correctAnswerSet, 
                sourceItemsCount: sourceItems.length,
                numTargetTypes,
                numDistractorTypes
            });
            
            // 【配置驅動】重新初始化觸控拖曳功能
            const touchConfig = this.ModeConfig[difficulty];
            if (touchConfig.touchDragConfig?.enabled) {
                setTimeout(() => {
                    this.TouchDragManager.cleanup();
                    this.TouchDragManager.init(difficulty, touchConfig);
                    Game.Debug.logUI('困難模式觸控拖曳重新初始化完成');
                }, 200);
            }
            
            } catch (error) {
                Game.Debug.logError(error, '困難模式渲染失敗');
            }
        },

        // =====================================================
        // F1 拖拽處理函數
        // =====================================================
        
        handleDragStart(event) {
            const difficulty = this.state.settings.difficulty;
            const config = this.ModeConfig[difficulty];
            
            // 確保獲取正確的拖曳元素 - 可能是img內部元素，需要找到父層div
            let element = event.target;
            if (!element.dataset.id && !element.dataset.index) {
                element = event.target.closest('[data-id], [data-index]');
            }
            
            if (!element) {
                Game.Debug.logError('無法找到有效的拖曳元素');
                return;
            }
            
            // 支援不同模式的ID格式
            const draggedId = element.dataset.id || element.dataset.index;
            const icon = element.dataset.icon;
            
            Game.Debug.logUserAction('開始拖曳', {
                draggedItemId: draggedId,
                icon: icon,
                difficulty: difficulty
            });
            
            event.dataTransfer.setData('text/plain', draggedId);
            event.dataTransfer.setData('icon', icon || '');
            element.classList.add('dragging');
            
            this.Audio.playSound('select', difficulty, config);
        },

        handleDragEnd(event) {
            // 確保獲取正確的拖曳元素
            let element = event.target;
            if (!element.classList.contains('dragging')) {
                element = event.target.closest('.dragging') || event.target.closest('[data-id], [data-index]');
            }
            
            if (element) {
                element.classList.remove('dragging');
            }
            Game.Debug.logUserAction('結束拖曳');
            
            // --- 【修正】只在拖曳真正失敗時才恢復顯示 ---
            const itemSlot = event.target.closest('.item-slot');
            if (itemSlot) {
                // 延遲檢查，如果物件仍在原始容器中且被隱藏，表示拖曳失敗了
                setTimeout(() => {
                    // 檢查物件是否仍在原始的item-slot容器中
                    const currentSlot = event.target.closest('.item-slot');
                    if (currentSlot === itemSlot && event.target.style.visibility === 'hidden') {
                        // 拖曳失敗，恢復顯示
                        event.target.style.visibility = 'visible';
                        event.target.style.pointerEvents = 'auto';
                        Game.Debug.logUserAction('拖曳失敗，恢復顯示圖示');
                    }
                }, 100);
            }
            // --- 修正結束 ---
        },

        handleDragOver(event) {
            event.preventDefault(); // 允許放置
        },

        handleDragEnter(event) {
            event.preventDefault();
            const target = event.target.closest('.drop-zone, .quantity-container, .placement-zone, .source-container');
            if (target) {
                target.classList.add('drag-over');
                if (target.classList.contains('placement-zone')) {
                    target.classList.add('dragover');
                }
            }
        },

        handleDragLeave(event) {
            const target = event.target.closest('.drop-zone, .quantity-container, .placement-zone, .source-container');
            if (target) {
                target.classList.remove('drag-over');
                if (target.classList.contains('placement-zone')) {
                    target.classList.remove('dragover');
                }
            }
        },

        handleDrop(event) {
            event.preventDefault();
            const difficulty = this.state.settings.difficulty;
            const config = this.ModeConfig[difficulty];
            
            const draggedId = event.dataTransfer.getData('text/plain');
            const draggedElement = document.querySelector(`[data-id="${draggedId}"], [data-index="${draggedId}"]`);
            
            Game.Debug.logUserAction('處理拖放', { 
                draggedId, 
                elementFound: !!draggedElement,
                elementType: draggedElement?.tagName,
                elementClass: draggedElement?.className 
            });
            
            if (!draggedElement) {
                Game.Debug.logError('找不到拖曳的元素', { 
                    draggedId,
                    allElementsWithDataId: Array.from(document.querySelectorAll('[data-id]')).map(el => el.dataset.id),
                    allElementsWithDataIndex: Array.from(document.querySelectorAll('[data-index]')).map(el => el.dataset.index)
                });
                return;
            }
            
            const dropTarget = event.target.closest('.drop-zone, .placement-zone, .source-container, .placement-slot');
            if(dropTarget) {
                dropTarget.classList.remove('drag-over');
            } else {
                 Game.Debug.logUserAction('放置到非有效區域');
                 return;
            }
            
            switch(config.modeType) {
                case 'one-to-one-correspondence':
                    this.handleEasyDrop(event, draggedElement, difficulty, config);
                    break;
                case 'quantity-to-numeral':
                    this.handleNormalDrop(event, draggedElement, difficulty, config);
                    break;
                case 'multi-item-correspondence':
                    this.handleHardDrop(event, draggedElement, difficulty, config);
                    break;
            }
        },

        handleEasyDrop(event, draggedElement, difficulty, config) {
            const dropZone = event.target.closest('.drop-zone');
            if (!dropZone) {
                Game.Debug.logUserAction('放置到非有效區域');
                return;
            }
            
            // 檢查目標區域是否已有物件
            if (dropZone.querySelector('.draggable-item')) {
                Game.Debug.logUserAction('目標區域已被佔用');
                return;
            }
            
            // 取得拖曳元素的索引
            const draggedIndex = draggedElement.dataset.id;

            // --- 【關鍵修正】 ---
            // 在複製HTML前，先移除拖曳過程中的 'dragging' 樣式
            draggedElement.classList.remove('dragging');
            
            // 1. 執行放置操作，現在會複製一個外觀正常的圖示
            // 先複製HTML，再隱藏原始元素，避免複製隱藏樣式
            dropZone.innerHTML = draggedElement.outerHTML;
            dropZone.classList.add('filled');
            
            // 2. 成功放置後，完全移除原始元素，避免重複顯示
            draggedElement.remove();
            
            // 3. 確保放置區中的圖示是可見的
            const placedItem = dropZone.querySelector('.draggable-item');
            if (placedItem) {
                placedItem.style.visibility = 'visible';
                placedItem.style.pointerEvents = 'none'; // 放置後不可再拖曳
            }
            
            // --- 【修改後的動畫邏輯】 ---
            
            // 4. 取得對應的老師物件，準備配對成功動畫
            const pairContainer = dropZone.closest('.correspondence-pair');
            
            if (placedItem && pairContainer) {
                const teacherItem = pairContainer.querySelector('.static-item');

                if (teacherItem) {
                    // 3. 同時為這兩個對應的物件加上動畫 class
                    teacherItem.classList.add('pair-success');
                    placedItem.classList.add('pair-success');
                    
                    // 4. 動畫結束後移除 class，以便下次觸發
                    setTimeout(() => {
                        teacherItem.classList.remove('pair-success');
                        placedItem.classList.remove('pair-success');
                    }, 500); // 動畫時長為 0.5s
                }
            }
            // --- 動畫修改結束 ---

            this.state.correctPlacements++;
            
            Game.Debug.logUserAction('成功放置', {
                draggedIndex,
                correctPlacements: this.state.correctPlacements,
                totalNeeded: this.state.correctAnswer
            });
            
            this.Audio.playSound('correct', difficulty, config);
            this.Speech.speak('correctPlacement', difficulty, config);
            
            // 檢查是否完成
            if (this.state.correctPlacements >= this.state.correctAnswer) {
                this.handleTurnComplete(difficulty, config);
            }
        },

        handleNormalDrop(event, draggedElement, difficulty, config) {
            Game.Debug.group('handleNormalDrop 執行'); // 將日誌分組以便查看

            const dropTarget = event.target.closest('.placement-zone, .source-container, .normal-grid-item');
            if (!dropTarget) {
                Game.Debug.log('偵錯', '無效的放置目標，提前返回');
                Game.Debug.groupEnd();
                return;
            }
        
            const originalParent = draggedElement.parentElement;
            Game.Debug.log('偵錯', '初始狀態', {
                draggedElement: draggedElement.outerHTML,
                originalParent: originalParent ? originalParent.outerHTML : 'null',
                isParentConnected: originalParent ? originalParent.isConnected : 'N/A'
            });
        
            // --- 邏輯 A: 將圖示從「對應框」拖曳回「物品區」 ---
            if (dropTarget.classList.contains('source-container')) {
                Game.Debug.log('偵錯', '執行分支 A：返回物品區');
                if (originalParent.closest('.placement-zone')) {
                    if (originalParent.classList.contains('normal-grid-item')) {
                        Game.Debug.log('偵錯', '準備恢復原始格子', { slotHTMLBefore: originalParent.outerHTML });
                        originalParent.classList.remove('filled');
                        originalParent.innerHTML = `<span class="position-hint">${parseInt(originalParent.dataset.index) + 1}</span>`;
                        Game.Debug.log('偵錯', '格子已恢復', { slotHTMLAfter: originalParent.innerHTML, isConnected: originalParent.isConnected });
                    }
                    dropTarget.appendChild(draggedElement);
                    this.Audio.playSound('select', difficulty, config);
                }
                Game.Debug.groupEnd();
                return; // 結束處理
            }
            
            // --- 邏輯 B: 在「對應框」內部放置或移動圖示 ---
            Game.Debug.log('偵錯', '執行分支 B：放置/移動到對應框');
            let targetSlot;
            if (dropTarget.classList.contains('normal-grid-item')) {
                targetSlot = dropTarget;
            } else if (dropTarget.classList.contains('placement-zone')) {
                targetSlot = dropTarget.querySelector('.normal-grid-item:not(.filled)');
            }
            
            if (!targetSlot) {
                this.Audio.playSound('error', difficulty, config);
                Game.Debug.log('偵錯', '找不到可用的目標格子');
                Game.Debug.groupEnd();
                return;
            }
            
            Game.Debug.log('偵錯', '找到目標格子', { targetSlot: targetSlot.outerHTML });
            const itemAlreadyInSlot = targetSlot.querySelector('.draggable-item');
        
            if (itemAlreadyInSlot === draggedElement) {
                Game.Debug.log('偵錯', '物品被放置在自己的原始位置，操作取消');
                Game.Debug.groupEnd();
                return;
            }
        
            targetSlot.appendChild(draggedElement);
            targetSlot.classList.add('filled');
            
            const originalParentIsSlot = originalParent.classList.contains('normal-grid-item');
        
            if (itemAlreadyInSlot) {
                Game.Debug.log('偵錯', '執行 "交換" 邏輯');
                if (originalParentIsSlot) {
                    originalParent.appendChild(itemAlreadyInSlot);
                } else {
                    document.querySelector('.source-container').appendChild(itemAlreadyInSlot);
                }
            } else {
                if (originalParentIsSlot) {
                    Game.Debug.log('偵錯', '執行 "移動" 邏輯，準備恢復原始格子', {
                        originalParent: originalParent.outerHTML,
                        isParentConnected: originalParent.isConnected
                    });
                    originalParent.classList.remove('filled');
                    originalParent.innerHTML = `<span class="position-hint">${parseInt(originalParent.dataset.index) + 1}</span>`;
                    Game.Debug.log('偵錯', '原始格子已恢復', {
                        finalHTML: originalParent.innerHTML,
                        isParentStillConnected: originalParent.isConnected
                    });
                }
            }
            
            this.Audio.playSound('correct', difficulty, config);
            Game.Debug.groupEnd(); // 結束日誌分組
        },

        handleSourceDrop(event) {
            event.preventDefault();
            
            const draggedData = event.dataTransfer.getData('text/plain');
            const draggedIndex = parseInt(draggedData);
            const draggedElement = document.querySelector(`.draggable-item[data-index="${draggedIndex}"]`);
            
            if (!draggedElement) {
                Game.Debug.logUserAction('找不到拖曳元素');
                return;
            }
            
            // 只允許從放置區拖回源區域
            const wasInPlacementZone = draggedElement.closest('.placement-zone');
            if (!wasInPlacementZone) {
                Game.Debug.logUserAction('只能從放置區拖回源區域');
                return;
            }
            
            const difficulty = this.state.settings.difficulty;
            const config = this.ModeConfig[difficulty];
            const sourceContainer = event.target.closest('.source-container');
            
            // 移除拖曳樣式
            draggedElement.classList.remove('dragging');
            
            // 從放置區移除並更新狀態
            this.state.normalMode.targetItems = this.state.normalMode.targetItems.filter(
                item => item.element !== draggedElement
            );
            
            // 從DOM中移除
            draggedElement.remove();
            
            // 在源區域中找到對應的空槽位並重新放置
            const itemSlots = sourceContainer.querySelectorAll('.item-slot');
            let targetSlot = null;
            
            // 找到對應index的槽位
            for (let slot of itemSlots) {
                if (slot.dataset.slot == draggedIndex && !slot.querySelector('.draggable-item')) {
                    targetSlot = slot;
                    break;
                }
            }
            
            if (targetSlot) {
                // 重新創建拖曳元素並放回槽位
                const newItem = document.createElement('div');
                newItem.innerHTML = draggedElement.outerHTML;
                const itemElement = newItem.firstChild;
                itemElement.style.visibility = 'visible';
                itemElement.style.pointerEvents = 'auto';
                itemElement.classList.remove('placed-item');
                targetSlot.appendChild(itemElement);
                
                this.Audio.playSound('select', difficulty, config);
                
                // 更新放置區視覺狀態
                const targetPlacementZone = document.getElementById('target-placement-zone');
                if (targetPlacementZone) {
                    this.updatePlacementZoneVisuals(targetPlacementZone);
                }
                
                Game.Debug.logUserAction('物品返回源區域', {
                    draggedIndex,
                    targetCount: this.state.normalMode.targetItems.length
                });
            }
        },

        updatePlacementZoneVisuals(placementZone) {
            const zoneHint = placementZone.querySelector('.zone-hint');
            const placedItems = placementZone.querySelectorAll('.placed-item');
            
            if (placedItems.length > 0) {
                // 有物品時隱藏提示
                if (zoneHint) zoneHint.classList.add('has-items');
                placementZone.classList.add('has-items');
            } else {
                // 沒有物品時顯示提示
                if (zoneHint) zoneHint.classList.remove('has-items');
                placementZone.classList.remove('has-items');
            }
        },

        handleNormalComplete() {
            const difficulty = this.state.settings.difficulty;
            const config = this.ModeConfig[difficulty];
            
            // 直接從DOM讀取放置數量，確保準確性
            const placementGrid = document.querySelector('.placement-grid-normal');
            const placedCount = placementGrid ? placementGrid.querySelectorAll('.draggable-item').length : 0;
            const isCorrect = placedCount === this.state.correctAnswer;
            
            Game.Debug.logUserAction('點擊完成按鈕 (普通)', { placedCount, correct: this.state.correctAnswer, isCorrect });
            
            // 禁用完成按鈕，避免重複點擊
            const completeBtn = document.getElementById('complete-btn');
            if (completeBtn) {
                completeBtn.disabled = true;
                completeBtn.textContent = '判斷中...';
            }
            
            setTimeout(() => {
                if (isCorrect) {
                    this.Audio.playSound('correct02', difficulty, config);
                    this.showNormalSuccess(); // 顯示成功動畫
                    
                    Game.Debug.logUserAction('普通模式回答正確', {
                        placedCount,
                        correctAnswer: this.state.correctAnswer
                    });
                    
                    // 延遲後進入下一回合
                    setTimeout(() => {
                        this.handleTurnComplete(difficulty, config);
                    }, 1000);
                    
                } else {
                    // 錯誤答案
                    this.Audio.playSound('error', difficulty, config);
                    
                    this.Speech.speak('incorrect', difficulty, config, {
                        targetCount: placedCount, // 修正模板變數
                        correctAnswer: this.state.correctAnswer
                    }, () => {
                        // 語音播放完畢後再返回物品
                        setTimeout(() => {
                            this.returnItemsToSource();
                        }, 500);
                    });
                    
                    this.showNormalError(placedCount, false);
                    
                    Game.Debug.logUserAction('普通模式回答錯誤', {
                        placedCount,
                        correctAnswer: this.state.correctAnswer
                    });
                    
                    setTimeout(() => {
                        if (completeBtn) {
                            completeBtn.disabled = false;
                            completeBtn.textContent = '完成';
                        }
                    }, 2500);
                }
            }, 500);
        },

        returnItemsToSource() {
            const placementGrid = document.querySelector('.placement-grid-normal');
            const sourceContainer = document.querySelector('.source-container');
            
            if (!placementGrid || !sourceContainer) return;
            
            // 獲取所有放置在格子中的物品
            const placedItems = placementGrid.querySelectorAll('.draggable-item');
            
            placedItems.forEach(item => {
                const parentSlot = item.closest('.normal-grid-item');
                
                // 將物品移回物品區
                sourceContainer.appendChild(item);
                
                // 將其原本所在的格子恢復為空格狀態
                if (parentSlot) {
                    parentSlot.classList.remove('filled');
                    // 【關鍵修正】恢復為與困難模式完全一致的 innerHTML 寫法
                    parentSlot.innerHTML = `<span class="position-hint">${parseInt(parentSlot.dataset.index) + 1}</span>`;
                }
            });
            
            Game.Debug.logUserAction('所有物品已返回源區域', {
                returnedCount: placedItems.length
            });
        },

        showNormalSuccess() {
            // 為普通模式放置區的所有物品同時添加配對成功動畫
            const placementGrid = document.querySelector('.placement-grid-normal');
            if (placementGrid) {
                const placedItems = placementGrid.querySelectorAll('.draggable-item');
                placedItems.forEach((item) => {
                    item.classList.add('pair-success');
                    // 動畫結束後移除 class，以便下次觸發
                    setTimeout(() => {
                        item.classList.remove('pair-success');
                    }, 500);
                });
            }
            
            // 為目標區的範例物品同時添加配對成功動畫
            const targetItemContainer = document.querySelector('.target-item-container');
            if (targetItemContainer) {
                const referenceItems = targetItemContainer.querySelectorAll('.static-item');
                referenceItems.forEach((item) => {
                    item.classList.add('pair-success');
                    // 動畫結束後移除 class，以便下次觸發
                    setTimeout(() => {
                        item.classList.remove('pair-success');
                    }, 500);
                });
            }
            
            // 添加配對成功動畫CSS（與簡單模式相同）
            if (!document.querySelector('#pair-success-animation-styles')) {
                const animationCSS = `
                    @keyframes pair-success-anim { 
                        0%, 100% { transform: scale(1); } 
                        50% { transform: scale(1.2); filter: drop-shadow(0 0 8px #4caf50); } 
                    }
                    .pair-success { 
                        animation: pair-success-anim 0.5s ease-in-out; 
                    }
                `;
                
                const styleTag = document.createElement('style');
                styleTag.id = 'pair-success-animation-styles';
                styleTag.innerHTML = animationCSS;
                document.head.appendChild(styleTag);
            }
        },

        showHardSuccess() {
            // 為困難模式放置區的所有物品同時添加配對成功動畫
            const placementZone = document.getElementById('placement-zone');
            if (placementZone) {
                const placedItems = placementZone.querySelectorAll('.draggable-item');
                placedItems.forEach((item) => {
                    item.classList.add('pair-success');
                    // 動畫結束後移除 class，以便下次觸發
                    setTimeout(() => {
                        item.classList.remove('pair-success');
                    }, 500);
                });
            }
            
            // 為困難模式目標區的所有圖示同時添加配對成功動畫
            const targetGrid = document.querySelector('.target-grid');
            if (targetGrid) {
                const targetItems = targetGrid.querySelectorAll('.static-item');
                targetItems.forEach((item) => {
                    item.classList.add('pair-success');
                    // 動畫結束後移除 class，以便下次觸發
                    setTimeout(() => {
                        item.classList.remove('pair-success');
                    }, 500);
                });
            }
            
            // 確保配對成功動畫CSS已存在（與普通模式共用）
            if (!document.querySelector('#pair-success-animation-styles')) {
                const animationCSS = `
                    @keyframes pair-success-anim { 
                        0%, 100% { transform: scale(1); } 
                        50% { transform: scale(1.2); filter: drop-shadow(0 0 8px #4caf50); } 
                    }
                    .pair-success { 
                        animation: pair-success-anim 0.5s ease-in-out; 
                    }
                `;
                
                const styleTag = document.createElement('style');
                styleTag.id = 'pair-success-animation-styles';
                styleTag.innerHTML = animationCSS;
                document.head.appendChild(styleTag);
            }
        },

        showNormalError(actualCount, changeButtonState = true) {
            const completeBtn = document.getElementById('complete-btn');
            const errorMessage = actualCount === 0 
                ? '請先將物品拖曳到放置區！' 
                : `數量不正確！您放置了 ${actualCount} 個，正確答案是 ${this.state.correctAnswer} 個`;
                
            // 顯示錯誤訊息（可選擇是否改變按鈕狀態）
            if (completeBtn && changeButtonState) {
                const originalText = completeBtn.textContent;
                completeBtn.textContent = errorMessage;
                completeBtn.style.background = '#f44336';
                
                setTimeout(() => {
                    completeBtn.textContent = '完成對應';
                    completeBtn.style.background = '';
                    completeBtn.disabled = false;
                }, 2000);
            }
            
            // 為錯誤的放置區添加搖晃動畫
            const targetZone = document.getElementById('target-placement-zone');
            if (targetZone) {
                targetZone.classList.add('error-shake');
                setTimeout(() => {
                    targetZone.classList.remove('error-shake');
                }, 600);
            }
            
            // 添加錯誤動畫CSS
            const errorCSS = `
                @keyframes error-shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .error-shake {
                    animation: error-shake 0.6s ease-in-out;
                    border-color: #f44336 !important;
                }
            `;
            
            const styleTag = document.createElement('style');
            styleTag.innerHTML = errorCSS;
            document.head.appendChild(styleTag);
        },

        showQuantityOptions(difficulty, config) {
            const optionsArea = this.elements.optionsArea;
            if (!optionsArea) return;
            
            // 生成選項（正確答案 + 錯誤選項）
            const options = [this.state.correctAnswer];
            while(options.length < config.optionsCount) {
                const wrongAnswer = this.getRandomInt(1, this.state.correctAnswer + 3);
                if (!options.includes(wrongAnswer)) {
                    options.push(wrongAnswer);
                }
            }
            
            // 打亂選項順序
            options.sort(() => 0.5 - Math.random());
            
            optionsArea.innerHTML = this.HTMLTemplates.optionsButtons(options);
            
            // 綁定選項點擊事件
            optionsArea.querySelectorAll('.payment-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.handleAnswerClick(e, difficulty, config));
            });
            
            this.Speech.speak('chooseAnswer', difficulty, config);
        },

        handleAnswerClick(event, difficulty, config) {
            if (this.state.isAnswering) return;
            
            this.state.isAnswering = true;
            const selectedAnswer = parseInt(event.target.dataset.value);
            const isCorrect = selectedAnswer === this.state.correctAnswer;
            
            Game.Debug.logUserAction('選擇答案', {
                selected: selectedAnswer,
                correct: this.state.correctAnswer,
                isCorrect
            });
            
            if (isCorrect) {
                this.state.score += 10;
                this.updateScore();
                this.Audio.playSound('success', difficulty, config);
                this.Speech.speak('correct', difficulty, config, { answer: this.state.correctAnswer }, () => {
                    setTimeout(async () => await this.startNewTurn(), config.timing.nextQuestionDelay);
                });
            } else {
                this.Audio.playSound('error', difficulty, config);
                this.Speech.speak('incorrect', difficulty, config, {}, () => {
                    if (config.allowRetry && this.state.settings.testMode === 'retry') {
                        this.state.isAnswering = false;
                    } else {
                        this.Speech.speak('incorrectWithAnswer', difficulty, config, { answer: this.state.correctAnswer }, () => {
                            setTimeout(async () => await this.startNewTurn(), config.timing.nextQuestionDelay);
                        });
                    }
                });
            }
        },

        // =====================================================
        // F1 困難模式連線處理函數
        // =====================================================
        
        handleCardClick(event) {
            const difficulty = this.state.settings.difficulty;
            const config = this.ModeConfig[difficulty];
            
            if (this.state.selectedCard) {
                this.state.selectedCard.classList.remove('selected-card');
            }
            
            this.state.selectedCard = event.target;
            event.target.classList.add('selected-card');
            
            const cardIndex = parseInt(event.target.dataset.cardIndex);
            const cardCount = parseInt(event.target.dataset.count);
            
            Game.Debug.logUserAction('選擇卡片', { cardIndex, cardCount });
        },

        handleNumberClick(event) {
            const difficulty = this.state.settings.difficulty;
            const config = this.ModeConfig[difficulty];
            
            if (!this.state.selectedCard) {
                Game.Debug.logUserAction('未選擇卡片');
                return;
            }
            
            const numberValue = parseInt(event.target.dataset.number);
            const cardCount = parseInt(this.state.selectedCard.dataset.count);
            const cardIndex = parseInt(this.state.selectedCard.dataset.cardIndex);
            
            const isCorrect = numberValue === cardCount;
            
            Game.Debug.logUserAction('連線嘗試', {
                cardCount,
                selectedNumber: numberValue,
                isCorrect
            });
            
            if (isCorrect) {
                // 標記為已連接
                this.state.selectedCard.classList.add('connected-card');
                event.target.classList.add('connected-number');
                this.state.connections.push({ cardIndex, numberValue });
                
                this.Audio.playSound('correct', difficulty, config);
                this.Speech.speak('correct', difficulty, config);
                
                // 檢查是否全部連完
                if (this.state.connections.length >= this.state.cardCounts.length) {
                    this.handleTurnComplete(difficulty, config);
                }
            } else {
                this.Audio.playSound('error', difficulty, config);
                this.Speech.speak('incorrect', difficulty, config);
            }
            
            this.state.selectedCard.classList.remove('selected-card');
            this.state.selectedCard = null;
        },

        handleTurnComplete(difficulty, config) {
            Game.Debug.logGameFlow('回合完成', {
                difficulty,
                correctAnswer: this.state.correctAnswer,
                modeType: config.modeType
            });
            
            // 修正：簡單模式也應該更新分數和進度
            this.state.score += 10;
            this.updateScore();
            
            // 移除重複的success音效播放，由handleNormalComplete統一處理
            this.Speech.speak('turnComplete', difficulty, config, { 
                targetCount: this.state.correctAnswer 
            }, () => {
                setTimeout(async () => await this.startNewTurn(), config.timing.nextQuestionDelay);
            });
        },

        getItemName(icon) {
            // 根據圖示返回中文名稱
            const itemNames = {
                '🍎': '蘋果', '🍌': '香蕉', '🍇': '葡萄', '🍓': '草莓', '🍊': '橘子',
                '🐶': '小狗', '🐱': '小貓', '🐭': '老鼠', '🐰': '兔子', '🦊': '狐狸',
                '🚗': '汽車', '🚕': '計程車', '🚌': '公車', '🚓': '警車', '🚑': '救護車'
            };
            return itemNames[icon] || '物件';
        },

        handleItemClick(event) {
            // F1 不使用點擊模式，保留空函數以避免錯誤
            Game.Debug.logUserAction('F1模式不支援點擊操作');
            return;
        },

        // =====================================================
        // 必要的輔助函數
        // =====================================================
        
        updateProgress() {
            const { currentTurn, totalTurns, score, settings } = this.state;
            const config = this.ModeConfig[settings.difficulty];
            
            if (this.elements.progressInfo && config?.textTemplates?.progressText) {
                const progressText = config.textTemplates.progressText
                    .replace('{current}', currentTurn)
                    .replace('{total}', totalTurns);
                this.elements.progressInfo.textContent = progressText;
            }
            
            if (this.elements.scoreInfo && config?.textTemplates?.scoreText) {
                const scoreText = config.textTemplates.scoreText.replace('{score}', score);
                this.elements.scoreInfo.textContent = scoreText;
            }
            
            if (this.elements.gameTitle) {
                this.elements.gameTitle.textContent = this.gameData.title;
            }
        },

        updateScore() {
            if (this.elements.scoreInfo) {
                const config = this.ModeConfig[this.state.settings.difficulty];
                if (config?.textTemplates?.scoreText) {
                    const scoreText = config.textTemplates.scoreText.replace('{score}', this.state.score);
                    this.elements.scoreInfo.textContent = scoreText;
                }
            }
        },

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
                        " onmouseover="this.style.background='#ff3742'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#ff4757'; this.style.transform='scale(1)'">×</button>
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
            
            closeBtn.onclick = () => {
                document.getElementById('number-input-popup').remove();
                if (cancelCallback) cancelCallback();
            };
            
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0', '確認'].forEach(key => {
                const btn = document.createElement('button');
                btn.textContent = key;
                let btnStyle = 'padding: 15px; font-size: 1.2em; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;';
                if (key === '確認') {
                    btnStyle += 'background: #28a745; color: white; font-weight: bold;';
                } else if (key === '清除') {
                    btnStyle += 'background: #ffc107; color: #333; font-weight: bold;';
                } else {
                    btnStyle += 'background: #f8f9fa; color: #333;';
                }
                btn.style.cssText = btnStyle;
                btn.onclick = () => {
                    if (key === '清除') {
                        display.value = '';
                    } else if (key === '確認') {
                        if (display.value && callback(display.value)) {
                            document.getElementById('number-input-popup').remove();
                        }
                    } else {
                        if (display.value.length < 3) display.value += key;
                    }
                };
                pad.appendChild(btn);
            });
        },

        showRangeInput(title, callback) {
            if (document.getElementById('range-input-popup')) return;
            
            const popupHTML = `
                <div id="range-input-popup" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:1000;">
                    <div style="background:white; padding:20px; border-radius:15px; width:400px; text-align:center;">
                        <h3>${title}</h3>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 15px;">
                            <label>最小值:</label>
                            <input type="text" id="min-display" readonly style="width:80px; font-size:1.5em; text-align:center; padding: 5px; border: 2px solid #ddd; border-radius: 5px;">
                            <label>最大值:</label>
                            <input type="text" id="max-display" readonly style="width:80px; font-size:1.5em; text-align:center; padding: 5px; border: 2px solid #ddd; border-radius: 5px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="font-weight: bold;">目前輸入:</label>
                            <select id="input-target" style="padding: 5px; margin-left: 10px; border-radius: 5px;">
                                <option value="min">最小值</option>
                                <option value="max">最大值</option>
                            </select>
                        </div>
                        <div id="range-number-pad" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;"></div>
                        <div style="margin-top: 15px;">
                            <button id="range-cancel-btn" style="padding: 10px 20px; margin-right: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">取消</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', popupHTML);
            const pad = document.getElementById('range-number-pad');
            const minDisplay = document.getElementById('min-display');
            const maxDisplay = document.getElementById('max-display');
            const targetSelect = document.getElementById('input-target');
            const cancelBtn = document.getElementById('range-cancel-btn');
            
            cancelBtn.onclick = () => {
                document.getElementById('range-input-popup').remove();
            };
            
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0', '確認'].forEach(key => {
                const btn = document.createElement('button');
                btn.textContent = key;
                btn.style.cssText = 'padding: 15px; font-size: 1.2em; border: 1px solid #ccc; border-radius: 5px; cursor: pointer;';
                btn.onclick = () => {
                    const isMin = targetSelect.value === 'min';
                    const currentDisplay = isMin ? minDisplay : maxDisplay;
                    
                    if (key === '清除') {
                        currentDisplay.value = '';
                    } else if (key === '確認') {
                        const minVal = parseInt(minDisplay.value) || 0;
                        const maxVal = parseInt(maxDisplay.value) || 0;
                        if (callback(minVal, maxVal)) {
                           document.getElementById('range-input-popup').remove();
                        }
                    } else {
                        if (currentDisplay.value.length < 2) currentDisplay.value += key;
                    }
                };
                pad.appendChild(btn);
            });
        },

        getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        endGame() {
            const difficulty = this.state.settings.difficulty;
            const totalQuestions = this.state.totalTurns;
            const score = this.state.score;
            const percentage = Math.round((score / (totalQuestions * 10)) * 100);
            
            let performance = '';
            if (percentage >= 80) {
                performance = '表現優異！';
            } else if (percentage >= 60) {
                performance = '表現良好！';
            } else {
                performance = '要多加練習喔！';
            }

            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="game-end-screen">
                    <div class="end-content">
                        <h1>🎉 遊戲結束 🎉</h1>
                        <div class="final-stats">
                            <div class="stat-item"><span>總題數</span><span>${totalQuestions}</span></div>
                            <div class="stat-item"><span>得分</span><span>${score}</span></div>
                            <div class="stat-item"><span>正確率</span><span>${percentage}%</span></div>
                            <div class="stat-item"><span>評價</span><span>${performance}</span></div>
                        </div>
                        <div class="action-buttons">
                            <button class="primary-btn" onclick="Game.start()">🔄 再玩一次</button>
                            <button class="secondary-btn" onclick="Game.init()">🏠 返回設定</button>
                        </div>
                    </div>
                </div>
            `;
            
            this.Audio.playSound('success', null, { audioFeedback: true });
            this.triggerConfetti();
        },

        triggerConfetti() {
            if (typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        },

        // =====================================================
        // 困難模式專用處理函數
        // =====================================================

        // 【修改後】 handleHardDrop 
        handleHardDrop(event, draggedElement, difficulty, config) {
            const dropTarget = event.target.closest('.placement-zone, .source-container, .target-grid-item');
            if (!dropTarget) return; // 忽略無效的放置點

            const originalParent = draggedElement.parentElement;

            // --- 邏輯 A: 將圖示從「對應框」拖曳回「物品區」 ---
            if (dropTarget.classList.contains('source-container')) {
                // 必須是從對應框內拖出的圖示才有效
                if (originalParent.closest('.placement-zone')) {
                    // 如果原來的格子是放置格，將其恢復為空格狀態
                    if (originalParent.classList.contains('target-grid-item')) {
                        originalParent.classList.remove('filled');
                        originalParent.innerHTML = `<span class="position-hint">${parseInt(originalParent.dataset.index) + 1}</span>`;
                    }
                    // 將圖示移回物品區
                    dropTarget.appendChild(draggedElement);
                    this.Audio.playSound('select', difficulty, config);
                }
                return; // 結束處理
            }
            
            // --- 邏輯 B: 在「對應框」內部放置或移動圖示 ---
            let targetSlot;
            // 情況 B-1: 直接拖曳到某個格子上
            if (dropTarget.classList.contains('target-grid-item')) {
                targetSlot = dropTarget;
            } 
            // 情況 B-2: 拖曳到對應框的背景區域，自動尋找第一個空格
            else if (dropTarget.classList.contains('placement-zone')) {
                targetSlot = dropTarget.querySelector('.target-grid-item:not(.filled)');
            }
            
            // 如果找不到可放置的格子 (例如所有格子都滿了)
            if (!targetSlot) {
                this.Audio.playSound('error', difficulty, config);
                return;
            }
            
            const itemAlreadyInSlot = targetSlot.querySelector('.draggable-item');

            // 避免將圖示拖放到自己身上
            if (itemAlreadyInSlot === draggedElement) return;

            // **執行移動或交換的核心邏輯**
            
            // 1. 將正在拖曳的圖示放入目標格子
            targetSlot.appendChild(draggedElement);
            targetSlot.classList.add('filled');
            
            const originalParentIsSlot = originalParent.classList.contains('target-grid-item');

            // 2. 處理目標格子中原有的圖示 (如果有的話)
            if (itemAlreadyInSlot) {
                // 目標格有圖示，進行「交換」
                if (originalParentIsSlot) {
                    // 如果是從另一個格子拖曳來的，則將被交換的圖示放回原來的格子
                    originalParent.appendChild(itemAlreadyInSlot);
                } else {
                    // 如果是從「物品區」拖曳來的，則將被交換的圖示送回「物品區」
                    document.querySelector('.source-container').appendChild(itemAlreadyInSlot);
                }
            } else {
                // 目標格是空的，代表是「移動」
                // 如果是從另一個格子移動來的，則將原來的格子恢復為空格
                if (originalParentIsSlot) {
                    originalParent.classList.remove('filled');
                    originalParent.innerHTML = `<span class="position-hint">${parseInt(originalParent.dataset.index) + 1}</span>`;
                }
            }
            
            // 為任何成功的放置或移動提供正面音效回饋
            this.Audio.playSound('correct', difficulty, config);
        },



        // 【修改後】 handleHardComplete 
        handleHardComplete() {
            const difficulty = this.state.settings.difficulty;
            const config = this.ModeConfig[difficulty];
            const { correctAnswerSet } = this.state.hardMode;

            // 直接從畫面(DOM)上讀取使用者放置的最終結果，確保準確性
            const placementGrid = document.querySelector('.placement-grid');
            const placedDraggableItems = placementGrid.querySelectorAll('.draggable-item');
            const placedCounts = new Map(); // 用來統計每種圖示的放置數量
            placedDraggableItems.forEach(item => {
                const icon = item.dataset.icon;
                placedCounts.set(icon, (placedCounts.get(icon) || 0) + 1);
            });

            let isCorrect = true;

            // 判斷條件 1: 使用者是否放置了任何不正確的圖示 (干擾項)
            for (const placedIcon of placedCounts.keys()) {
                if (!correctAnswerSet.has(placedIcon)) {
                    isCorrect = false;
                    break;
                }
            }

            // 判斷條件 2: 每種正確圖示的數量是否都符合要求
            if (isCorrect) {
                // 檢查放置的圖示種類數量是否與答案一致
                if (placedCounts.size !== correctAnswerSet.size) {
                    isCorrect = false;
                } else {
                    // 逐一比對每種圖示的數量
                    for (const [correctIcon, requiredCount] of correctAnswerSet.entries()) {
                        if (placedCounts.get(correctIcon) !== requiredCount) {
                            isCorrect = false;
                            break;
                        }
                    }
                }
            }

            Game.Debug.logUserAction('點擊完成按鈕 (困難)', { isCorrect, placedCounts, correctAnswerSet });

            const completeBtn = document.getElementById('complete-btn');
            if (completeBtn) {
                completeBtn.disabled = true;
                completeBtn.textContent = '判斷中...';
            }
            
            setTimeout(() => {
                if (isCorrect) {
                    this.Audio.playSound('correct02', difficulty, config);
                    this.showHardSuccess(); // 顯示困難模式成功動畫
                    this.Speech.speak('correct', difficulty, config, {}, () => {
                        setTimeout(() => {
                            this.handleTurnComplete(difficulty, config);
                        }, 1000);
                    });
                } else {
                    this.Audio.playSound('error', difficulty, config);
                    this.Speech.speak('incorrect', difficulty, config);
                    
                    document.getElementById('placement-zone').classList.add('error-shake');
                    setTimeout(() => {
                        document.getElementById('placement-zone').classList.remove('error-shake');
                        if (completeBtn) {
                            completeBtn.disabled = false;
                            completeBtn.textContent = '完成';
                        }
                    }, 2000);
                }
            }, 500);
        },

        handleHintClick() {
            const difficulty = this.state.settings.difficulty;
            const config = this.ModeConfig[difficulty];
            
            Game.Debug.logUserAction('點擊提示按鈕', { 
                difficulty, 
                hasConfig: !!config,
                hasHardMode: !!this.state.hardMode 
            });
            
            this.Audio.playSound('select', difficulty, config);
            this.Speech.speak('hintUsed', difficulty, config);

            const { correctAnswerSet, placedItems } = this.state.hardMode;
            const neededIcons = new Map();

            // 找出還需要哪些圖示
            correctAnswerSet.forEach((requiredCount, icon) => {
                const placedCount = placedItems.has(icon) ? placedItems.get(icon).length : 0;
                if (placedCount < requiredCount) {
                    neededIcons.set(icon, requiredCount - placedCount);
                }
            });

            Game.Debug.logGameFlow('需要提示的圖示', { 
                neededIcons: Array.from(neededIcons.entries()),
                neededIconsSize: neededIcons.size 
            });

            // 在來源區找到這些圖示並加上提示動畫
            const sourceContainer = document.querySelector('.source-container');
            let totalGlowItems = 0;
            
            neededIcons.forEach((count, icon) => {
                const itemsInSource = Array.from(sourceContainer.querySelectorAll(`[data-icon="${icon}"]`));
                Game.Debug.logGameFlow(`尋找圖示 ${icon}`, { 
                    needCount: count,
                    foundInSource: itemsInSource.length 
                });
                
                for(let i = 0; i < Math.min(count, itemsInSource.length); i++) {
                    itemsInSource[i].classList.add('hint-glow');
                    totalGlowItems++;
                    Game.Debug.logGameFlow(`添加提示動畫`, { 
                        icon,
                        elementClass: itemsInSource[i].className 
                    });
                }
            });

            Game.Debug.logGameFlow('提示動畫添加完成', { 
                totalGlowItems,
                animationDuration: config.timing.hintAnimationDuration 
            });

            // 動畫結束後移除 class
            setTimeout(() => {
                const glowElements = document.querySelectorAll('.hint-glow');
                Game.Debug.logGameFlow('移除提示動畫', { glowElementsCount: glowElements.length });
                glowElements.forEach(el => el.classList.remove('hint-glow'));
            }, config.timing.hintAnimationDuration || 1500);
        },

        updatePlacementZoneHint(zoneId) {
            const placementZone = document.getElementById(zoneId);
            if (!placementZone) {
                Game.Debug.logUI('找不到放置區', zoneId);
                return;
            }
            
            const hint = placementZone.querySelector('.zone-hint');
            const hasItems = placementZone.querySelector('.draggable-item');

            Game.Debug.logUI('更新提示文字', zoneId, {
                hintFound: !!hint,
                hasItems: !!hasItems,
                itemCount: placementZone.querySelectorAll('.draggable-item').length
            });

            if (hint) {
                hint.classList.toggle('has-items', !!hasItems);
            }
        },

        // =====================================================
        // 🎨 自訂主題圖片上傳功能 - 配置驅動 (仿a1_simulated_shopping)
        // =====================================================
        triggerImageUpload() {
            this.Debug.logUserAction('觸發圖片上傳');
            
            const modal = document.getElementById('image-preview-modal');
            if (modal) {
                modal.classList.remove('show');
            }
            
            const fileInput = document.getElementById('custom-image');
            if (fileInput) {
                fileInput.value = '';
                try {
                    fileInput.click();
                } catch (error) {
                    this.Debug.logError('觸發檔案選擇器錯誤', error);
                }
            } else {
                this.Debug.logError('找不到檔案輸入元素');
            }
        },

        handleImageUpload(event) {
            this.Debug.logUserAction('處理圖片上傳', event.target.files);
            const file = event.target.files[0];
            
            if (!file) {
                this.Debug.logUserAction('沒有選擇檔案');
                return;
            }
            
            // 檢查文件類型
            if (!file.type.startsWith('image/')) {
                alert('請選擇圖片檔案！');
                return;
            }
            
            // 檢查文件大小 (限制5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('圖片檔案太大，請選擇小於5MB的圖片！');
                return;
            }
            
            // 讀取圖片並顯示預覽視窗
            const reader = new FileReader();
            reader.onload = (e) => {
                this.showImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        },

        showImagePreview(imageDataUrl) {
            this.Debug.logUserAction('顯示圖片預覽');
            const modal = document.getElementById('image-preview-modal');
            const previewImg = document.getElementById('preview-image');
            
            if (!modal || !previewImg) {
                this.Debug.logError('找不到預覽元素');
                return;
            }
            
            previewImg.src = imageDataUrl;
            modal.classList.add('show');
            
            // 儲存圖片資料供後續使用
            this.tempImageData = imageDataUrl;
            
            // 清空並聚焦到名稱輸入框
            const nameInput = document.getElementById('modal-custom-name');
            if (nameInput) {
                nameInput.value = '';
                setTimeout(() => nameInput.focus(), 100);
            }
        },

        closeImagePreview() {
            this.Debug.logUserAction('關閉圖片預覽');
            const modal = document.getElementById('image-preview-modal');
            if (modal) {
                modal.classList.remove('show');
            }
            
            // 清除文件選擇和臨時資料
            const fileInput = document.getElementById('custom-image');
            if (fileInput) {
                fileInput.value = '';
            }
            this.tempImageData = null;
        },

        confirmAddCustomItem() {
            const name = document.getElementById('modal-custom-name').value.trim();
            
            if (!name) {
                alert('請輸入圖示名稱！');
                return;
            }
            
            if (!this.tempImageData) {
                alert('圖片資料遺失，請重新上傳！');
                return;
            }
            
            // 檢查名稱是否重複
            const isDuplicate = this.state.customItems.some(item => item.name === name);
            if (isDuplicate) {
                alert('圖示名稱已存在，請使用不同的名稱！');
                return;
            }
            
            // 新增自訂圖示到狀態
            const customItem = {
                imageData: this.tempImageData,
                name: name,
                id: Date.now() // 使用時間戳作為唯一ID
            };
            
            this.state.customItems.push(customItem);
            
            // 更新自訂主題的圖示陣列
            this.gameData.themes.custom.push(this.tempImageData);
            
            this.Debug.logUserAction('新增自訂圖示', { name, id: customItem.id });
            
            // 關閉預覽視窗
            this.closeImagePreview();
            
            // 重新渲染設定頁面以顯示新圖示
            this.showSettings();
            
            // 語音回饋
            this.Speech.speak('addCustomItem', this.state.settings.difficulty, this.ModeConfig[this.state.settings.difficulty], {
                itemName: name
            });
        },

        removeCustomItem(index) {
            const item = this.state.customItems[index];
            if (!item) return;
            
            if (confirm(`確定要刪除圖示「${item.name}」嗎？`)) {
                // 從狀態中移除
                this.state.customItems.splice(index, 1);
                
                // 從主題陣列中移除對應的圖片資料
                const imageIndex = this.gameData.themes.custom.indexOf(item.imageData);
                if (imageIndex > -1) {
                    this.gameData.themes.custom.splice(imageIndex, 1);
                }
                
                this.Debug.logUserAction('移除自訂圖示', { name: item.name, index });
                
                // 重新渲染設定頁面
                this.showSettings();
                
                // 語音回饋
                this.Speech.speak('removeCustomItem', this.state.settings.difficulty, this.ModeConfig[this.state.settings.difficulty], {
                    itemName: item.name
                });
            }
        }
    };

    // Initialize the game
    Game.init();
});
