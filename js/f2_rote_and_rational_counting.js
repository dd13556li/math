// =================================================================
// FILE: js/f2_rote_and_rational_counting.js
// DESC: F2 唱數與點數 - 配置驅動版本
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
            logPrefix: '[F2-唱數與點數]',
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
                triggerType: 'manual',         // 手動點擊觸發
                audioFeedback: true,           // 有音效
                speechFeedback: true,          // 有語音反饋
                showNumbers: true,             // 顯示數字覆蓋層
                autoShowTotal: true,           // 自動顯示總數
                requireAnswer: false,          // 不需要回答選擇題
                allowRetry: false,             // 簡單模式不適用重試
                label: '簡單',
                description: '點擊圖示播放語音和數字，完成後顯示總數',
                
                // 語音模板配置
                speechTemplates: {
                    initialInstruction: "請數一數，總共有幾個",
                    instruction: "請鼠鼠看有幾個",
                    itemCount: "{count}",
                    totalComplete: "數完了，總共有 {total} 個",
                    encouragement: "你真棒！",
                    addCustomItem: "已新增自訂圖示：{itemName}",
                    removeCustomItem: "已移除圖示：{itemName}"
                },
                
                // 文字模板配置
                textTemplates: {
                    progressText: "第 {current} / {total} 題",
                    scoreText: "分數: {score} 分",
                    correctFeedback: "數完了，總共有 {answer} 個",
                    incorrectFeedback: "答錯了，再試一次！",
                    incorrectWithAnswer: "答錯了，正確答案是 {answer}",
                    gameComplete: "🎉 測驗結束 🎉",
                    excellentPerformance: "表現優異！",
                    goodPerformance: "表現良好！",
                    needImprovement: "要多加練習喔！"
                },
                
                // CSS 類名配置
                cssClasses: {
                    item: "item counting-item-easy",
                    itemChecked: "checked",
                    itemOverlay: "item-number-overlay",
                    feedbackCorrect: "feedback-bubble correct",
                    feedbackIncorrect: "feedback-bubble incorrect",
                    optionsGrid: "products-grid horizontal-layout",
                    optionButton: "payment-btn easy-mode-btn"
                },
                
                // 時間配置
                timing: {
                    speechDelay: 300,
                    nextQuestionDelay: 2000,
                    numberDisplayDelay: 100
                },
                
                // UI配置
                uiElements: {
                    showOptionsArea: false,
                    itemNumberOverlay: true,
                    totalDialog: true
                },
                
                // 動畫配置
                animations: {
                    fadeInDuration: 300,
                    numberPopDuration: 200
                },
                
                // 🔧 [新增] 跨平台拖曳配置
                touchDragConfig: {
                    enabled: true,
                    enableClickToDrag: true,
                    enableSorting: true,
                    touchSensitivity: 10,
                    crossPlatformSupport: true
                }
            },
            
            normal: {
                triggerType: 'manual',         // 手動點擊觸發
                audioFeedback: true,           // 有音效
                speechFeedback: true,          // 有語音反饋
                showNumbers: true,             // 顯示數字覆蓋層
                autoShowTotal: false,          // 不自動顯示總數
                requireAnswer: true,           // 需要回答選擇題
                allowRetry: true,              // 允許重試(根據testMode設定)
                optionsCount: 3,               // 3個選項
                label: '普通',
                description: '同簡單模式，但最後需要選擇正確答案',
                
                // 語音模板配置
                speechTemplates: {
                    initialInstruction: "請數一數，總共有幾個",
                    instruction: "請點擊圖案開始數數",
                    itemCount: "{count}",
                    chooseAnswer: "請選擇正確的答案",
                    correct: "答對了！正確答案是 {answer}",
                    incorrect: "答錯了，再試一次！",
                    incorrectWithAnswer: "答錯了，正確答案是 {answer}，進入下一題",
                    addCustomItem: "已新增自訂圖示：{itemName}",
                    removeCustomItem: "已移除圖示：{itemName}"
                },
                
                // 文字模板配置
                textTemplates: {
                    progressText: "第 {current} / {total} 題",
                    scoreText: "分數: {score} 分",
                    correctFeedback: "答對了！正確答案是 {answer}",
                    incorrectFeedback: "答錯了，再試一次！",
                    incorrectWithAnswer: "答錯了，正確答案是 {answer}，進入下一題",
                    gameComplete: "🎉 測驗結束 🎉",
                    excellentPerformance: "表現優異！",
                    goodPerformance: "表現良好！",
                    needImprovement: "要多加練習喔！"
                },
                
                // CSS 類名配置
                cssClasses: {
                    item: "item counting-item-normal",
                    itemChecked: "checked",
                    itemOverlay: "item-number-overlay",
                    feedbackCorrect: "feedback-bubble correct",
                    feedbackIncorrect: "feedback-bubble incorrect",
                    optionsGrid: "products-grid horizontal-layout",
                    optionButton: "payment-btn normal-mode-btn"
                },
                
                // 時間配置
                timing: {
                    speechDelay: 300,
                    nextQuestionDelay: 2000,
                    retryDelay: 1500,
                    numberDisplayDelay: 100
                },
                
                // UI配置
                uiElements: {
                    showOptionsArea: true,
                    itemNumberOverlay: true,
                    totalDialog: false
                },
                
                // 動畫配置
                animations: {
                    fadeInDuration: 300,
                    numberPopDuration: 200,
                    incorrectShake: 300
                },
                
                // 🔧 [新增] 跨平台拖曳配置
                touchDragConfig: {
                    enabled: true,
                    enableClickToDrag: true,
                    enableSorting: true,
                    touchSensitivity: 10,
                    crossPlatformSupport: true
                }
            },
            
            hard: {
                triggerType: 'manual',         // 手動點擊觸發
                audioFeedback: true,           // 有音效反饋
                speechFeedback: false,         // 無數數語音反饋，但保留結果語音
                showNumbers: false,            // 不顯示數字覆蓋層
                autoShowTotal: false,          // 不自動顯示總數
                requireAnswer: true,           // 需要手動輸入答案
                allowRetry: true,              // 允許重試(根據testMode設定)
                useNumberInput: true,          // 使用數字輸入
                label: '困難',
                description: '無語音及數字提示，需要自行輸入數字',
                
                // 語音模板配置
                speechTemplates: {
                    initialInstruction: "請數一數，總共有幾個",
                    instruction: "請點擊圖案開始數數",
                    inputPrompt: "請輸入正確的數量",
                    correct: "答對了！正確答案是 {answer}",
                    incorrect: "答錯了，再試一次！",
                    incorrectWithAnswer: "答錯了，正確答案是 {answer}，進入下一題",
                    addCustomItem: "已新增自訂圖示：{itemName}",
                    removeCustomItem: "已移除圖示：{itemName}"
                },
                
                // 文字模板配置
                textTemplates: {
                    progressText: "第 {current} / {total} 題",
                    scoreText: "分數: {score} 分",
                    correctFeedback: "答對了！正確答案是 {answer}",
                    incorrectFeedback: "答錯了，再試一次！",
                    incorrectWithAnswer: "答錯了，正確答案是 {answer}，進入下一題",
                    gameComplete: "🎉 測驗結束 🎉",
                    excellentPerformance: "表現優異！",
                    goodPerformance: "表現良好！",
                    needImprovement: "要多加練習喔！",
                    inputPrompt: "請輸入正確的數量"
                },
                
                // CSS 類名配置
                cssClasses: {
                    item: "item counting-item-hard fade-enabled",
                    itemChecked: "checked",
                    itemFaded: "faded",
                    feedbackCorrect: "feedback-bubble correct",
                    feedbackIncorrect: "feedback-bubble incorrect",
                    numberInput: "number-input-popup",
                    numberDisplay: "number-display-hard"
                },
                
                // 時間配置
                timing: {
                    speechDelay: 300,
                    nextQuestionDelay: 2000,
                    retryDelay: 1500,
                    fadeDelay: 200
                },
                
                // UI配置
                uiElements: {
                    showOptionsArea: false,
                    itemNumberOverlay: false,
                    fadeSelectedItems: true,
                    showCheckmark: true
                },
                
                // 動畫配置
                animations: {
                    fadeInDuration: 300,
                    itemFadeDuration: 400,
                    checkmarkScale: 1.2
                },
                
                // 🔧 [新增] 跨平台拖曳配置
                touchDragConfig: {
                    enabled: true,
                    enableClickToDrag: true,
                    enableSorting: true,
                    touchSensitivity: 10,
                    crossPlatformSupport: true
                }
            }
        },

        // =====================================================
        // 🎨 StyleConfig - CSS配置驅動系統
        // =====================================================
        StyleConfig: {
            // 基礎樣式配置
            base: {
                itemArea: {
                    background: '#f8f9fa',
                    border: '3px dashed #dee2e6',
                    borderRadius: '15px',
                    padding: '30px',
                    minHeight: '250px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px',
                    cursor: 'pointer'
                },
                item: {
                    fontSize: '3.5rem',
                    padding: '10px',
                    borderRadius: '10px',
                    transition: 'all 0.3s ease',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                },
                itemNumberOverlay: {
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#ffc107',
                    color: 'black',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    border: '2px solid white',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                },
                feedbackBubble: {
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    margin: '10px 0'
                }
            },
            
            // 模式特定樣式
            easy: {
                item: {
                    border: '2px solid #28a745',
                    backgroundColor: '#d4edda'
                },
                itemHover: {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                }
            },
            
            normal: {
                item: {
                    border: '2px solid #007bff',
                    backgroundColor: '#d1ecf1'
                },
                itemHover: {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)'
                },
                optionButton: {
                    fontSize: '1.8rem',
                    padding: '15px 25px',
                    minWidth: '80px',
                    height: '70px',
                    border: '3px solid #007bff',
                    borderRadius: '15px',
                    background: '#ffffff',
                    color: '#007bff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 123, 255, 0.2)'
                }
            },
            
            hard: {
                item: {
                    border: '2px solid #dc3545',
                    backgroundColor: '#f8d7da'
                },
                itemFaded: {
                    opacity: '0.5'
                },
                itemChecked: {
                    '::after': {
                        content: '"✔"',
                        color: '#28a745',
                        fontSize: '40px',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textShadow: '0 0 5px white'
                    }
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
            title: "單元F2：唱數與點數",
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
                    #item-area {
                        ${this.objectToCSS(baseStyles.itemArea)}
                    }
                    .item {
                        ${this.objectToCSS(baseStyles.item)}
                    }
                    .item-number-overlay {
                        ${this.objectToCSS(baseStyles.itemNumberOverlay)}
                    }
                    .feedback-bubble {
                        ${this.objectToCSS(baseStyles.feedbackBubble)}
                    }
                    
                    /* 自訂主題上傳介面樣式 */
                    .custom-theme-setup {
                        border: 2px dashed #ddd;
                        border-radius: 10px;
                        padding: 20px;
                        margin-top: 20px;
                        background-color: #f9f9f9;
                    }
                    .custom-theme-setup h4 {
                        margin-top: 0;
                        color: #333;
                        font-size: 18px;
                    }
                    .custom-items-list {
                        min-height: 60px;
                        border: 1px solid #e0e0e0;
                        border-radius: 5px;
                        padding: 10px;
                        margin: 10px 0;
                        background: white;
                    }
                    .custom-item-row {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 5px 0;
                        border-bottom: 1px solid #f0f0f0;
                    }
                    .custom-item-row:last-child {
                        border-bottom: none;
                    }
                    .custom-item-row span {
                        flex: 1;
                        font-weight: bold;
                        color: #333;
                    }
                    .upload-btn, .remove-btn {
                        padding: 8px 15px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    }
                    .upload-btn {
                        background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
                        color: white;
                        font-weight: bold;
                    }
                    .upload-btn:hover {
                        background: linear-gradient(45deg, #FF5252, #26C6DA);
                        transform: translateY(-2px);
                    }
                    .remove-btn {
                        background: #ff4444;
                        color: white;
                        font-size: 12px;
                        padding: 4px 8px;
                    }
                    .remove-btn:hover {
                        background: #cc0000;
                    }
                    
                    /* 圖片預覽模態視窗樣式 */
                    .image-preview-modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.5);
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
                        max-height: 90vh;
                        overflow-y: auto;
                        position: relative;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    }
                    .modal-header {
                        background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
                        color: white;
                        padding: 15px 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .modal-header h3 {
                        margin: 0;
                        font-size: 18px;
                    }
                    .close-btn {
                        background: none;
                        border: none;
                        color: white;
                        font-size: 20px;
                        cursor: pointer;
                        padding: 0;
                        width: 25px;
                        height: 25px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .close-btn:hover {
                        background: rgba(255, 255, 255, 0.2);
                    }
                    .modal-body {
                        padding: 20px;
                    }
                    .image-preview-container {
                        text-align: center;
                        margin-bottom: 15px;
                        width: 100%;
                    }
                    .image-preview-container img {
                        max-width: 350px;
                        max-height: 300px;
                        width: auto;
                        height: auto;
                        object-fit: contain;
                        border-radius: 10px;
                        border: 2px solid #ddd;
                        display: block;
                        margin: 0 auto 10px auto;
                    }
                    .item-form .form-group {
                        margin-bottom: 15px;
                    }
                    .item-form label {
                        display: block;
                        margin-bottom: 8px;
                        font-weight: bold;
                        color: #333;
                    }
                    .modal-body input {
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #ddd;
                        border-radius: 8px;
                        font-size: 16px;
                        text-align: center;
                        box-sizing: border-box;
                    }
                    .modal-body input:focus {
                        outline: none;
                        border-color: #4ECDC4;
                    }
                    .modal-footer {
                        padding: 15px 20px;
                        background: #f8f9fa;
                        display: flex;
                        gap: 10px;
                        justify-content: flex-end;
                    }
                    .cancel-btn, .confirm-btn {
                        padding: 10px 20px;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                        transition: all 0.3s ease;
                    }
                    .cancel-btn {
                        background: #6c757d;
                        color: white;
                    }
                    .cancel-btn:hover {
                        background: #545b62;
                    }
                    .confirm-btn {
                        background: linear-gradient(45deg, #28a745, #20c997);
                        color: white;
                    }
                    .confirm-btn:hover {
                        background: linear-gradient(45deg, #218838, #1da086);
                        transform: translateY(-1px);
                    }
                `;
            },
            
            generateModeSpecificCSS(difficulty, modeStyles) {
                let css = '';
                
                if (modeStyles.item) {
                    css += `.item.counting-item-${difficulty} { ${this.objectToCSS(modeStyles.item)} }`;
                }
                
                if (modeStyles.itemHover) {
                    css += `.item.counting-item-${difficulty}:hover { ${this.objectToCSS(modeStyles.itemHover)} }`;
                }
                
                if (modeStyles.optionButton) {
                    css += `#options-area .payment-btn { ${this.objectToCSS(modeStyles.optionButton)} }`;
                    css += `#options-area .payment-btn:hover { 
                        background: #007bff !important;
                        color: white !important;
                        transform: translateY(-3px) !important;
                        box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4) !important;
                    }`;
                }
                
                if (difficulty === 'hard') {
                    css += `.item.fade-enabled.checked.faded { ${this.objectToCSS(modeStyles.itemFaded)} }`;
                    css += `.item.fade-enabled.checked.faded::after { 
                        content: '✔'; color: #28a745; font-size: 40px; 
                        position: absolute; top: 50%; left: 50%; 
                        transform: translate(-50%, -50%); 
                        text-shadow: 0 0 5px white; 
                    }`;
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
            audioUnlocked: false, // 手機音頻解鎖狀態

            // 🔧 [新增] 手機端音頻解鎖機制 (解決iOS/Android語音限制)
            unlockAudio() {
                if (this.audioUnlocked) return;
                
                Game.Debug.logAudio('嘗試解鎖手機音頻', 'unlock', { 
                    audioUnlocked: this.audioUnlocked 
                });
                
                try {
                    // 創建AudioContext並播放無聲音頻來解鎖
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    gainNode.gain.value = 0; // 無聲
                    oscillator.frequency.value = 440;
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.01);
                    
                    this.audioUnlocked = true;
                    Game.Debug.logAudio('手機音頻解鎖成功', 'unlock', { 
                        audioUnlocked: this.audioUnlocked 
                    });
                } catch (error) {
                    Game.Debug.logError(error, '手機音頻解鎖失敗');
                }
            },

            playSound(soundType, difficulty, config, callback) {
                Game.Debug.logAudio('嘗試播放音效', soundType, { 
                    difficulty, 
                    audioFeedback: config?.audioFeedback 
                });
                
                const soundMap = {
                    select: 'menu-select-sound',
                    correct: 'correct-sound', 
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
                        audio.play()
                            .then(() => {
                                Game.Debug.logAudio('音效播放成功', soundType);
                            })
                            .catch(e => {
                                Game.Debug.logError(e, '音效播放失敗');
                            });
                    } catch (error) {
                        Game.Debug.logError(error, '音效播放異常');
                    }
                } else {
                    Game.Debug.logAudio('音效被配置關閉', soundType, { audioFeedback: config?.audioFeedback });
                }
                
                if (callback) {
                    const delay = config?.timing?.speechDelay || 300;
                    Game.Debug.logAudio('設定音效回調', soundType, { delay });
                    setTimeout(callback, delay);
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
                    audioUnlocked: Game.Audio.audioUnlocked,
                    replacements
                });
                
                // 停止所有正在播放的語音，防止重疊和多重回調
                if (this.synth.speaking) {
                    Game.Debug.logSpeech('停止之前的語音播放', templateKey, difficulty);
                    this.synth.cancel();
                }
                
                // 🔧 [新增] 檢查手機音頻是否已解鎖
                if (!Game.Audio.audioUnlocked) {
                    Game.Debug.logSpeech('語音被跳過', templateKey, difficulty, { reason: 'audio not unlocked' });
                    if (callback) setTimeout(callback, config?.timing?.speechDelay || 300);
                    return;
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
        // 🎯 跨平台拖曳管理器 - 使用SortableJS（支援桌面和移動端）
        // =====================================================
        CrossPlatformDragManager: {
            isInitialized: false,
            currentConfig: null,
            sortableInstances: [], // 存儲SortableJS實例
            retryCount: 0, // 重試計數器

            /**
             * 🔧 [新版] 初始化跨平台拖曳功能 - 使用SortableJS
             * @param {string} difficulty - 難度等級  
             * @param {Object} config - ModeConfig配置
             */
            init(difficulty, config) {
                Game.Debug.logUI('🚀 初始化跨平台拖曳管理器 (SortableJS)', difficulty);

                if (!config.touchDragConfig?.enabled) {
                    Game.Debug.logUI('拖曳功能在配置中被禁用', difficulty);
                    return;
                }

                // 檢查SortableJS是否已載入，如果未載入則延遲重試
                if (typeof Sortable === 'undefined') {
                    if (this.retryCount < 10) { // 最多重試10次
                        this.retryCount++;
                        Game.Debug.logUI(`⏰ SortableJS 尚未載入，延遲重試... (${this.retryCount}/10)`, difficulty);
                        setTimeout(() => {
                            this.init(difficulty, config);
                        }, 100);
                        return;
                    } else {
                        Game.Debug.logError('SortableJS 載入超時，已達最大重試次數', 'CrossPlatformDragManager.init');
                        return;
                    }
                }

                // 重置重試計數器
                this.retryCount = 0;

                this.currentConfig = config.touchDragConfig;
                
                try {
                    this.setupSortableInstances(difficulty, config);
                    this.isInitialized = true;
                    Game.Debug.logUI('✅ 跨平台拖曳功能初始化完成', difficulty);
                } catch (error) {
                    Game.Debug.logError(error, '跨平台拖曳初始化失敗');
                    this.isInitialized = false;
                }
            },

            setupSortableInstances(difficulty, config) {
                Game.Debug.logUI('⚙️ 設置SortableJS實例', difficulty);
                
                // F2遊戲的拖曳區域是item-area
                const itemArea = document.getElementById('item-area');
                if (!itemArea) {
                    Game.Debug.logUI('找不到 item-area 元素，跳過拖曳設置', difficulty);
                    return;
                }

                // 創建SortableJS實例
                const sortableInstance = Sortable.create(itemArea, {
                    group: 'counting-items',
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    chosenClass: 'sortable-chosen',
                    fallbackClass: 'sortable-fallback',
                    delayOnTouchStart: true,
                    delay: 50,
                    
                    // 拖曳開始事件
                    onStart: (evt) => {
                        Game.Debug.logUI('🎯 SortableJS 拖曳開始', {
                            element: evt.item.className,
                            index: evt.oldIndex
                        });
                        Game.Audio.unlockAudio(); // 解鎖手機音頻
                    },
                    
                    // 拖曳結束事件
                    onEnd: (evt) => {
                        Game.Debug.logUI('🎯 SortableJS 拖曳結束', {
                            from: evt.from.id,
                            to: evt.to.id,
                            oldIndex: evt.oldIndex,
                            newIndex: evt.newIndex
                        });
                        
                        // F2遊戲主要是點擊計數，拖曳主要用於重排序
                        // 如果需要拖曳觸發計數邏輯，可以在這裡調用handleItemClick
                        const draggedItem = evt.item;
                        if (draggedItem && !draggedItem.classList.contains('checked')) {
                            // 模擬點擊事件來觸發計數邏輯
                            const mockEvent = { 
                                target: draggedItem,
                                type: 'drag-click'
                            };
                            Game.handleItemClick(mockEvent);
                        }
                    },

                    // 過濾函數 - 只允許未被選中的項目拖曳
                    filter: '.checked',
                    preventOnFilter: false
                });

                this.sortableInstances.push(sortableInstance);
                Game.Debug.logUI('✅ SortableJS實例創建完成', { difficulty, instanceCount: this.sortableInstances.length });
            },

            cleanup() {
                Game.Debug.logUI('🧹 清理跨平台拖曳實例');
                
                this.sortableInstances.forEach(instance => {
                    if (instance && instance.destroy) {
                        instance.destroy();
                    }
                });
                
                this.sortableInstances = [];
                this.isInitialized = false;
                this.retryCount = 0;
                
                Game.Debug.logUI('✅ 跨平台拖曳清理完成');
            }
        },

        // =====================================================
        // HTML Templates - 統一管理
        // =====================================================
        HTMLTemplates: {
            settingsScreen(difficulty, theme, questionCount, testMode, countingRange) {
                console.log('🎨 [F2 調試] 渲染設定畫面，主題:', theme, '自訂主題條件:', theme === 'custom' && difficulty !== 'hard');
                
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
                                            <button class="selection-btn ${theme === key ? 'active' : ''}" 
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
                                                    <button type="button" class="close-btn" onclick="Game.closeImagePreview()">✕</button>
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
                                                    <button type="button" class="cancel-btn" onclick="Game.closeImagePreview()">取消</button>
                                                    <button type="button" class="confirm-btn" onclick="Game.confirmAddCustomItem()">確認新增</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ` : ''}
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
                    <div class="store-layout">
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
                        <div class="unified-task-frame" style="padding-top: 20px; position: relative;">
                            <div id="item-area"></div>
                            ${config.requireAnswer ? '<div id="options-area" class="product-selection-area" style="justify-content: center; margin-top: 20px;"></div>' : ''}
                            ${difficulty === 'hard' ? '<div id="hint-area" style="position: absolute; right: 20px; pointer-events: none; z-index: 1000;"></div>' : ''}
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

            

            countingItem(icon, index, difficulty) {
                const config = Game.ModeConfig[difficulty];
                const cssConfig = config.cssClasses || {};
                const itemClass = cssConfig.item || `item counting-item-${difficulty}`;
                const additionalClasses = config.uiElements.fadeSelectedItems ? ' fade-enabled' : '';
                
                // 檢測是否為自訂圖片（base64格式）
                const isCustomImage = icon.startsWith('data:image/');
                const iconDisplay = isCustomImage ? 
                    `<img src="${icon}" alt="自訂圖示" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; pointer-events: none; user-select: none;">` : 
                    icon;
                
                Game.Debug.logTemplate('countingItem', { 
                    icon: isCustomImage ? '[自訂圖片]' : icon, 
                    index, 
                    difficulty, 
                    itemClass: itemClass + additionalClasses,
                    isCustomImage
                });
                
                return `<div class="${itemClass}${additionalClasses}" data-index="${index}">${iconDisplay}</div>`;
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
                        padding: 12px 15px;
                        margin: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: space-between;
                        box-shadow: 0 6px 20px rgba(225, 112, 85, 0.3);
                        cursor: pointer;
                        transition: all 0.3s ease;
                        animation: hintPulse 3s infinite;
                        text-align: center;
                        line-height: 1.2;
                        height: 100%;
                    ">
                        <div style="
                            font-size: 1.1em;
                            color: #2d3436;
                            font-weight: bold;
                            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                            flex: 0 0 auto;
                        ">需要提示</div>
                        <div style="
                            font-size: 0.85em;
                            color: #636e72;
                            flex: 0 0 auto;
                        ">點我看答案</div>
                        <div style="
                            font-size: 1.5em;
                            flex: 0 0 auto;
                        ">💡</div>
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

            // 困難模式數數確認框（置中顯示）
            inputPromptBox(promptText) {
                return `
                    <div class="input-prompt-container" style="
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin: 20px auto;
                        max-width: 1000px;
                        padding: 0 20px;
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
                            #input-prompt-box {
                                max-width: 300px !important;
                                font-size: 0.9em;
                            }
                        }
                    </style>
                `;
            },

            // 困難模式獨立提示框容器（右下角對齊）
            hintBoxContainer() {
                return `
                    <div class="standalone-hint-container">
                        ${this.hintBox()}
                    </div>
                    <style>
                        .standalone-hint-container {
                            display: flex;
                            justify-content: flex-end;
                            align-items: flex-end;
                            pointer-events: auto;
                        }
                        
                        @media (max-width: 800px) {
                            .standalone-hint-container {
                                justify-content: center;
                                padding: 0 10px;
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
        // Initialization
        // =====================================================
        init() {
            Game.Debug.logGameFlow('遊戲初始化開始');
            
            try {
                // 🔧 [新增] 清理跨平台拖曳管理器（返回設定時）
                this.CrossPlatformDragManager.cleanup();
                
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
            console.log('🔧 [F2 調試] showSettings 執行，主題:', this.state.settings.theme, '難度:', this.state.settings.difficulty);
            
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
            
            // 不再需要動態 DOM 操作，模板已經直接渲染所有內容
            console.log('✅ [F2 調試] 設定畫面模板渲染完成');
            
            Game.Debug.logGameFlow('設定畫面載入完成', settings);
        },

        handleSelection(event) {
            console.log('🔧 [F2 調試] handleSelection 觸發');
            const btn = event.target.closest('.selection-btn');
            if (!btn) {
                console.log('❌ [F2 調試] 找不到 selection-btn 元素');
                return;
            }

            const { type, value } = btn.dataset;
            console.log('🔧 [F2 調試] 選擇事件:', { type, value, btn: btn.textContent });
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
            
            // 如果選擇的是主題，需要特殊處理以顯示/隱藏自訂主題設定區域
            if (type === 'theme') {
                console.log('🎨 [F2 調試] 主題選擇特殊處理:', { 
                    oldTheme: this.state.settings.theme, 
                    newTheme: value 
                });
                
                this.Debug.logUserAction('主題變更，重新載入設定畫面', { theme: value });
                
                // 先更新狀態
                this.state.settings[type] = value;
                console.log('🎨 [F2 調試] 狀態已更新:', this.state.settings);
                
                // 立即重新載入設定畫面
                console.log('🎨 [F2 調試] 準備重新載入設定畫面');
                this.showSettings();
                return;
            }

            this.state.settings[type] = (type === 'questionCount') ? parseInt(value) : value;
            if (type === 'questionCount') this.state.totalTurns = parseInt(value);

            const buttonGroup = btn.closest('.button-group');
            buttonGroup.querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            this.updateStartButton();
        },

        updateStartButton() {
            console.log('🎮 [F2 調試] updateStartButton 開始檢查');
            const { difficulty, theme, questionCount, testMode, countingRange } = this.state.settings;
            const startBtn = document.getElementById('start-game-btn');
            
            // 檢查自訂主題是否有足夠的圖示
            const isCustomThemeValid = theme !== 'custom' || this.state.customItems.length >= 1;
            console.log('🎮 [F2 調試] 按鈕狀態檢查:', {
                difficulty, theme, questionCount, testMode, countingRange,
                isCustomThemeValid,
                customItemsCount: this.state.customItems.length
            });
            
            // 簡單模式不需要測驗模式設定
            if (difficulty === 'easy' && theme && questionCount && countingRange && isCustomThemeValid) {
                startBtn.disabled = false;
                startBtn.textContent = '開始遊戲！';
            } else if (difficulty !== 'easy' && difficulty && theme && questionCount && testMode && countingRange && isCustomThemeValid) {
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
        start() {
            Game.Debug.group('遊戲開始', () => {
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
                this.startNewTurn();
                
                Game.Debug.logPerformance('遊戲開始', startTime);
            });
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
                itemArea: document.getElementById('item-area'),
                optionsArea: document.getElementById('options-area'),
                progressInfo: document.getElementById('progress-info'),
                scoreInfo: document.getElementById('score-info'),
                gameTitle: document.getElementById('game-title')
            });
            
            // 檢查重要元素是否存在
            if (!this.elements.itemArea) {
                Game.Debug.logError('找不到item-area元素', 'UI設置');
            }
            
            Game.Debug.logUI('綁定遊戲事件', 'item-area click');
            // 儲存綁定的函數引用以便後續使用
            this.boundHandleItemClick = this.handleItemClick.bind(this);
            this.boundHandleAnswerClick = this.handleAnswerClick.bind(this);
            
            this.elements.itemArea.addEventListener('click', this.boundHandleItemClick);
            
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
            
            // 🔧 [新增] 初始化跨平台拖曳功能
            const config = this.ModeConfig[difficulty];
            if (config.touchDragConfig?.enabled) {
                // 清理舊的拖曳註冊（如果有的話）
                this.CrossPlatformDragManager.cleanup();
                // 初始化新的拖曳功能
                this.CrossPlatformDragManager.init(difficulty, config);
            }
            
            Game.Debug.logGameFlow('遊戲UI設置完成');
        },

        startNewTurn() {
            // 防止重複調用的保護機制
            if (this.state.isStartingNewTurn) {
                Game.Debug.logGameFlow('阻止重複開始新回合', { 
                    currentTurn: this.state.currentTurn,
                    isStartingNewTurn: this.state.isStartingNewTurn 
                });
                return;
            }
            this.state.isStartingNewTurn = true;
            
            Game.Debug.group('開始新回合', () => {
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
                this.state.userCountProgress = 0;
                
                Game.Debug.logState('新回合狀態', 
                    { currentTurn: oldTurn, isAnswering: true, userCountProgress: this.state.userCountProgress },
                    { currentTurn: this.state.currentTurn, isAnswering: false, userCountProgress: 0 }
                );
                
                this.updateProgress();

                // 清空區域
                Game.Debug.logUI('清空遊戲區域');
                if (this.elements.itemArea) this.elements.itemArea.innerHTML = '';
                if (this.elements.optionsArea) this.elements.optionsArea.innerHTML = '';
                
                // 清空困難模式提示區域
                const hardModePromptArea = document.getElementById('hard-mode-prompt-area');
                if (hardModePromptArea) {
                    hardModePromptArea.remove();
                }
                
                // 清空困難模式獨立提示框區域
                const hintArea = document.getElementById('hint-area');
                if (hintArea) {
                    hintArea.innerHTML = '';
                }
                
                // 生成題目
                const { difficulty, theme, countingRange } = this.state.settings;
                const config = this.ModeConfig[difficulty];
                const rangeConfig = this.gameData.countingRanges[countingRange];
                
                this.state.correctAnswer = this.getRandomInt(rangeConfig.minItems, rangeConfig.maxItems);
                const randomIcon = this.gameData.themes[theme].slice().sort(() => 0.5 - Math.random())[0];

                Game.Debug.logGameFlow('生成新題目', {
                    turn: this.state.currentTurn,
                    difficulty,
                    theme,
                    countingRange,
                    correctAnswer: this.state.correctAnswer,
                    icon: randomIcon,
                    range: `${rangeConfig.minItems}-${rangeConfig.maxItems}`
                });

                // 渲染圖示
                Game.Debug.logTemplate('countingItem', { 
                    count: this.state.correctAnswer, 
                    icon: randomIcon, 
                    difficulty 
                });
                
                for (let i = 0; i < this.state.correctAnswer; i++) {
                    this.elements.itemArea.insertAdjacentHTML('beforeend', 
                        this.HTMLTemplates.countingItem(randomIcon, i, difficulty)
                    );
                }

                // 播放初始指導語音
                this.Speech.speak('initialInstruction', difficulty, config);
                
                Game.Debug.logGameFlow('新回合準備完成', {
                    turn: this.state.currentTurn,
                    correctAnswer: this.state.correctAnswer
                });
                
                // 重設保護標記，允許下次調用
                this.state.isStartingNewTurn = false;
            });
        },

        handleItemClick(event) {
            // 🔧 [新增] 解鎖手機音頻（用戶首次互動時）
            this.Audio.unlockAudio();
            
            if (this.state.isAnswering) {
                Game.Debug.logUserAction('點擊被忽略（正在回答中）');
                return;
            }
            
            const clickedItem = event.target.closest('.item:not(.checked)');
            if (!clickedItem) {
                Game.Debug.logUserAction('點擊無效項目或已選項目');
                return;
            }

            const { difficulty } = this.state.settings;
            const config = this.ModeConfig[difficulty];
            
            this.state.userCountProgress++;
            const count = this.state.userCountProgress;
            clickedItem.classList.add('checked');

            Game.Debug.logUserAction('點擊數數項目', {
                count,
                progress: `${count}/${this.state.correctAnswer}`,
                difficulty,
                itemIndex: clickedItem.dataset.index
            });

            // 播放音效
            this.Audio.playSound('select', difficulty, config);

            // 根據模式處理
            if (config.showNumbers) {
                Game.Debug.logGameFlow('顯示數字模式', { count, difficulty });
                
                const numberOverlay = document.createElement('div');
                numberOverlay.className = 'item-number-overlay';
                numberOverlay.textContent = count;
                clickedItem.appendChild(numberOverlay);
                
                // 檢查是否完成計數
                if (count === this.state.correctAnswer) {
                    Game.Debug.logGameFlow('計數完成，最後一個數字', {
                        userCount: count,
                        correctAnswer: this.state.correctAnswer,
                        difficulty
                    });
                    
                    this.state.isAnswering = true;
                    
                    // 簡單和普通模式：先播放最後數字的語音，完成後立即進入答題階段
                    this.Speech.speak('itemCount', difficulty, config, { count: count }, () => {
                        Game.Debug.logGameFlow('最後數字語音播放完成，立即進入答題階段');
                        this.finishCountingPhase();
                    });
                } else {
                    // 不是最後一個數字，正常播放數數語音
                    this.Speech.speak('itemCount', difficulty, config, { count: count });
                }
            } else {
                Game.Debug.logGameFlow('困難模式淡化效果', { count });
                // 困難模式：淡化並顯示勾勾
                clickedItem.classList.add('faded');
                
                // 檢查是否完成計數
                if (count === this.state.correctAnswer) {
                    Game.Debug.logGameFlow('計數完成，準備進入答題階段', {
                        userCount: count,
                        correctAnswer: this.state.correctAnswer
                    });
                    
                    this.state.isAnswering = true;
                    const delay = (config.timing.numberDisplayDelay || 100) + 500;
                    
                    Game.Debug.logGameFlow('設定計數完成延遲', { delay });
                    setTimeout(() => this.finishCountingPhase(), delay);
                }
            }
        },

        finishCountingPhase() {
            const { difficulty } = this.state.settings;
            const config = this.ModeConfig[difficulty];
            
            if (config.autoShowTotal) {
                // 簡單模式：先播放音效，然後彈跳視窗和語音
                Game.Debug.logGameFlow('簡單模式：播放音效並顯示反饋彈跳視窗', {
                    correctAnswer: this.state.correctAnswer
                });
                
                // 播放音效
                this.Audio.playSound('correct', difficulty, config);
                this.triggerConfetti();
                
                // 顯示反饋彈跳視窗
                this.showFeedbackPopup(true);
                
                // 播放「數完了，總共有X個」語音，播放完成後自動進入下一題
                this.Speech.speak('totalComplete', difficulty, config, 
                    { total: this.state.correctAnswer }, () => {
                        Game.Debug.logGameFlow('簡單模式語音播放完成，自動進入下一題', { delay: config.timing.nextQuestionDelay });
                        
                        // 關閉反饋彈跳視窗
                        if (this.closeFeedbackPopup) {
                            this.closeFeedbackPopup();
                            this.closeFeedbackPopup = null;
                        }
                        
                        // 自動進入下一題
                        setTimeout(() => this.startNewTurn(), config.timing.nextQuestionDelay);
                    }
                );
            } else if (config.requireAnswer && config.useNumberInput) {
                // 困難模式：先顯示輸入提示框，第一次出現時播放語音
                this.showInputPromptBox(difficulty, config, true);
            } else if (config.requireAnswer) {
                // 普通模式：選擇題
                this.Speech.speak('chooseAnswer', difficulty, config, {}, () => {
                    this.renderOptions();
                });
            }
        },

        renderOptions() {
            const { difficulty, countingRange } = this.state.settings;
            const config = this.ModeConfig[difficulty];
            const rangeConfig = this.gameData.countingRanges[countingRange];
            const options = [this.state.correctAnswer];
            
            // 重設 isAnswering 狀態，允許用戶點擊選項
            Game.Debug.logState('重設答題狀態', 
                { isAnswering: this.state.isAnswering }, 
                { isAnswering: false }
            );
            this.state.isAnswering = false;
            
            Game.Debug.logGameFlow('生成選項', {
                correctAnswer: this.state.correctAnswer,
                optionsCount: config.optionsCount,
                range: `${rangeConfig.minItems}-${rangeConfig.maxItems}`
            });
            
            while (options.length < config.optionsCount) {
                const wrongOption = this.getRandomInt(rangeConfig.minItems, rangeConfig.maxItems);
                if (!options.includes(wrongOption)) options.push(wrongOption);
            }
            this.shuffleArray(options);

            Game.Debug.logGameFlow('選項生成完成', { options });

            // 將選項顯示在 options-area
            if (this.elements.optionsArea) {
                Game.Debug.logTemplate('optionsButtons', { options });
                const optionsHTML = this.HTMLTemplates.optionsButtons(options);
                Game.Debug.logUI('生成的選項HTML', 'options-area', { 
                    html: optionsHTML,
                    options 
                });
                
                this.elements.optionsArea.innerHTML = optionsHTML;
                
                // 驗證HTML是否正確插入
                const insertedButtons = this.elements.optionsArea.querySelectorAll('.payment-btn');
                Game.Debug.logUI('選項按鈕已插入', 'options-area', { 
                    buttonCount: insertedButtons.length,
                    buttons: Array.from(insertedButtons).map(btn => ({
                        text: btn.textContent,
                        value: btn.dataset.value,
                        className: btn.className
                    }))
                });
                
                // 測試事件綁定
                if (insertedButtons.length > 0) {
                    Game.Debug.logUI('選項按鈕存在，事件應該可以觸發');
                } else {
                    Game.Debug.logError('選項按鈕未找到', 'renderOptions');
                }
                
            } else {
                Game.Debug.logError('找不到options-area元素', 'renderOptions');
            }
        },

        handleAnswerClick(event) {
            Game.Debug.logUserAction('選項點擊事件觸發', {
                target: event.target.tagName,
                targetClass: event.target.className,
                isAnswering: this.state.isAnswering
            });
            
            const selectedBtn = event.target.closest('.payment-btn');
            if (!selectedBtn) {
                Game.Debug.logUserAction('未找到payment-btn元素', {
                    target: event.target,
                    closest: event.target.closest('.payment-btn')
                });
                return;
            }
            
            if (this.state.isAnswering) {
                Game.Debug.logUserAction('目前正在答題中，忽略點擊');
                return;
            }
            
            const selectedValue = parseInt(selectedBtn.dataset.value);
            Game.Debug.logUserAction('選項已選擇', {
                selectedValue,
                buttonText: selectedBtn.textContent,
                correctAnswer: this.state.correctAnswer
            });
            
            this.checkAnswer(selectedValue);
        },

        checkAnswer(selectedValue) {
            const { difficulty, testMode } = this.state.settings;
            const config = this.ModeConfig[difficulty];
            const isCorrect = selectedValue === this.state.correctAnswer;

            Game.Debug.group('檢查答案', () => {
                Game.Debug.logUserAction('提交答案', {
                    selectedValue,
                    correctAnswer: this.state.correctAnswer,
                    isCorrect,
                    difficulty,
                    testMode
                });

                this.state.isAnswering = true;

                if (isCorrect) {
                    Game.Debug.logGameFlow('答案正確', { selectedValue, correctAnswer: this.state.correctAnswer });
                    
                    // 答對處理
                    if (difficulty !== 'easy') {
                        const oldScore = this.state.score;
                        this.state.score += 10;
                        Game.Debug.logState('分數更新', { score: oldScore }, { score: this.state.score });
                        this.updateProgress();
                    }
                    
                    this.Audio.playSound('correct', difficulty, config);
                    this.triggerConfetti();
                    
                    // 顯示可愛的正確反饋彈跳視窗
                    this.showFeedbackPopup(true);
                    
                    // 播放語音，語音結束後直接進入下一題
                    this.Speech.speak('correct', difficulty, config, { answer: this.state.correctAnswer }, () => {
                        Game.Debug.logGameFlow('語音播放完成，關閉彈跳視窗並準備進入下一題', { delay: config.timing.nextQuestionDelay });
                        
                        // 關閉反饋彈跳視窗
                        if (this.closeFeedbackPopup) {
                            this.closeFeedbackPopup();
                            this.closeFeedbackPopup = null;
                        }
                        
                        // 直接進入下一題，不回到數數畫面
                        setTimeout(() => this.startNewTurn(), config.timing.nextQuestionDelay);
                    });
                } else {
                    Game.Debug.logGameFlow('答案錯誤', { 
                        selectedValue, 
                        correctAnswer: this.state.correctAnswer,
                        testMode,
                        allowRetry: config.allowRetry
                    });
                    
                    // 答錯處理
                    const shouldRetry = testMode === 'retry' && config.allowRetry;
                
                    if (shouldRetry) {
                        Game.Debug.logGameFlow('允許重試', { testMode, allowRetry: config.allowRetry });
                        
                        this.Audio.playSound('error', difficulty, config);
                        
                        // 顯示可愛的錯誤反饋彈跳視窗（可重試），同時播放語音
                        this.showFeedbackPopup(false, () => {
                            Game.Debug.logState('允許重新回答', { isAnswering: true }, { isAnswering: false });
                            this.state.isAnswering = false; // 允許重新回答
                            
                            if (config.useNumberInput) {
                                Game.Debug.logUI('重新顯示輸入提示框', 'input-prompt-box');
                                // 困難模式重新顯示輸入提示框（重試時不播放語音）
                                this.showInputPromptBox(difficulty, config, false);
                            }
                        });
                        
                        // 同時播放語音（不等待彈跳視窗callback）
                        this.Speech.speak('incorrect', difficulty, config, {});
                    } else {
                        Game.Debug.logGameFlow('不允許重試，顯示正確答案', { 
                            testMode, 
                            allowRetry: config.allowRetry,
                            correctAnswer: this.state.correctAnswer 
                        });
                        
                        this.Audio.playSound('error', difficulty, config);
                        
                        // 顯示可愛的錯誤反饋彈跳視窗（含正確答案），同時播放語音
                        this.showFeedbackPopup(false, () => {
                            const delay = config.timing.nextQuestionDelay + 500;
                            Game.Debug.logGameFlow('準備進入下一題（答錯）', { delay });
                            setTimeout(() => this.startNewTurn(), delay);
                        });
                        
                        // 同時播放語音（不等待彈跳視窗callback）
                        this.Speech.speak('incorrectWithAnswer', difficulty, config, 
                            { answer: this.state.correctAnswer });
                    }
                }
            });
        },

        endGame() {
            Game.Debug.group('遊戲結束', () => {
                const score = this.state.score;
            const correctCount = score / 10;
            const total = this.state.totalTurns;
            const percentage = Math.round((correctCount / total) * 100);
            
            let message = percentage >= 80 ? '表現優異！' : percentage >= 60 ? '表現良好！' : '要多加練習喔！';
            let icon = percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : '💪';
            
            const { difficulty } = this.state.settings;
            const showScore = difficulty !== 'easy';
            
            document.getElementById('app').innerHTML = `
                <div class="game-complete">
                    <div class="result-card">
                        <div class="results-header">
                            <div class="trophy-icon">${icon}</div>
                            <h1>🎉 測驗結束 🎉</h1>
                            <p><strong>${message}</strong></p>
                        </div>
                        <div class="final-stats">
                            ${showScore ? `
                                <div class="stat-item"><span>答對題數</span><span>${correctCount} / ${total}</span></div>
                                <div class="stat-item"><span>總分</span><span>${score} 分</span></div>
                                <div class="stat-item"><span>正確率</span><span>${percentage}%</span></div>
                            ` : `
                                <div class="stat-item"><span>完成題數</span><span>${total} 題</span></div>
                                <div class="stat-item"><span>狀態</span><span>全部完成</span></div>
                            `}
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
                this.Speech.speak('encouragement', difficulty, this.ModeConfig[difficulty] || {}, {});
                
                Game.Debug.logGameFlow('遊戲結束處理完成');
            });
        },

        // =====================================================
        // Utility Functions
        // =====================================================
        showInputPromptBox(difficulty, config, playInitialSpeech = false) {
            Game.Debug.logGameFlow('顯示困難模式輸入提示框', { difficulty, playInitialSpeech });
            
            // 重設 isAnswering 狀態，允許用戶點擊提示框
            this.state.isAnswering = false;
            
            // 先顯示獨立的提示框（靠右對齊）
            this.showHintBox();
            
            // 檢查是否已經存在數數確認框
            let existingPromptBox = document.getElementById('input-prompt-box');
            if (existingPromptBox) {
                // 如果已存在，需要重新顯示其父容器
                const container = existingPromptBox.closest('.input-prompt-container');
                if (container) {
                    container.style.display = 'flex';
                    Game.Debug.logUI('重新顯示輸入提示框容器', '.input-prompt-container');
                } else {
                    existingPromptBox.style.display = 'block';
                    Game.Debug.logUI('重新顯示現有輸入提示框', 'input-prompt-box');
                }
                // 重新對齊提示框
                setTimeout(() => this.alignHintBoxWithPromptBox(), 50);
                return;
            }
            
            // 在options-area或者新建一個區域顯示數數確認框
            let targetArea = this.elements.optionsArea;
            if (!targetArea) {
                // 如果沒有options-area，在item-area下方創建一個
                targetArea = document.createElement('div');
                targetArea.id = 'hard-mode-prompt-area';
                targetArea.style.cssText = 'margin-top: 20px; padding: 0 20px;';
                this.elements.itemArea.parentNode.insertBefore(targetArea, this.elements.itemArea.nextSibling);
            }
            
            // 顯示數數確認框（置中顯示）
            const promptHTML = this.HTMLTemplates.inputPromptBox(config.textTemplates.inputPrompt);
            targetArea.innerHTML = promptHTML;
            
            // 第一次出現時播放語音
            if (playInitialSpeech) {
                this.Speech.speak('inputPrompt', difficulty, config, {});
            }
            
            // 綁定數數確認框點擊事件
            const promptBox = document.getElementById('input-prompt-box');
            if (promptBox) {
                promptBox.addEventListener('click', () => {
                    Game.Debug.logUserAction('點擊數數確認框', { difficulty });
                    
                    // 隱藏整個容器（但不刪除）
                    const container = promptBox.closest('.input-prompt-container');
                    if (container) {
                        container.style.display = 'none';
                    }
                    
                    // 顯示數字輸入器，添加取消回調
                    this.showNumberInput(config.textTemplates.inputPrompt, (num) => {
                        this.checkAnswer(parseInt(num));
                        return true;
                    }, () => {
                        // 取消回調：重新顯示數數確認框容器
                        Game.Debug.logUserAction('取消數字輸入，重新顯示數數確認框');
                        if (container) {
                            container.style.display = 'flex';
                        }
                    });
                });
            }
        },

        showHintBox() {
            Game.Debug.logGameFlow('顯示困難模式獨立提示框');
            
            // 檢查是否已經存在提示框
            let existingHintBox = document.getElementById('hint-box');
            if (existingHintBox) {
                Game.Debug.logUI('提示框已存在', 'hint-box');
                this.alignHintBoxWithPromptBox(); // 重新對齊
                return;
            }
            
            // 找到獨立的提示框容器區域
            const hintArea = document.getElementById('hint-area');
            if (hintArea) {
                // 顯示獨立提示框容器
                const hintHTML = this.HTMLTemplates.hintBoxContainer();
                hintArea.innerHTML = hintHTML;
                
                // 綁定提示框點擊事件
                const hintBox = document.getElementById('hint-box');
                if (hintBox) {
                    hintBox.addEventListener('click', () => {
                        Game.Debug.logUserAction('點擊獨立提示框', { 
                            correctAnswer: this.state.correctAnswer 
                        });
                        
                        // 顯示正確答案彈窗
                        this.showAnswerReveal(this.state.correctAnswer);
                    });
                }
                
                // 延遲一下讓DOM渲染完成，然後對齊
                setTimeout(() => {
                    this.alignHintBoxWithPromptBox();
                }, 50);
            } else {
                Game.Debug.logError('找不到hint-area元素', 'showHintBox');
            }
        },
        
        alignHintBoxWithPromptBox() {
            const promptBox = document.getElementById('input-prompt-box');
            const hintArea = document.getElementById('hint-area');
            const hintBox = document.getElementById('hint-box');
            
            if (promptBox && hintArea && hintBox) {
                // 獲取確認框的位置和尺寸
                const promptRect = promptBox.getBoundingClientRect();
                const promptContainer = promptBox.closest('.input-prompt-container');
                
                if (promptContainer) {
                    const containerRect = promptContainer.getBoundingClientRect();
                    const frameRect = hintArea.parentElement.getBoundingClientRect();
                    
                    // 計算提示框相對於unified-task-frame的位置
                    const topOffset = containerRect.top - frameRect.top;
                    const height = promptRect.height;
                    
                    // 設置提示框位置和高度
                    hintArea.style.top = topOffset + 'px';
                    hintArea.style.height = (containerRect.height) + 'px';
                    hintBox.style.height = height + 'px';
                    hintBox.style.display = 'flex';
                    hintBox.style.alignItems = 'center';
                    
                    Game.Debug.logUI('提示框已對齊', 'hint-box-alignment', {
                        topOffset: topOffset,
                        height: height,
                        containerHeight: containerRect.height
                    });
                }
            }
        },

        showAnswerReveal(correctAnswer) {
            Game.Debug.logUI('顯示答案提示彈窗', 'answer-reveal', { correctAnswer });
            
            // 移除現有的答案彈窗
            const existingPopup = document.getElementById('answer-reveal-popup');
            const existingBackdrop = document.getElementById('answer-reveal-backdrop');
            if (existingPopup) existingPopup.remove();
            if (existingBackdrop) existingBackdrop.remove();
            
            // 創建新的答案彈窗
            const popupHTML = this.HTMLTemplates.answerRevealPopup(correctAnswer);
            document.body.insertAdjacentHTML('beforeend', popupHTML);
            
            // 直接播放語音「正確的數量是X」
            const speechText = `正確的數量是${correctAnswer}`;
            const utterance = new SpeechSynthesisUtterance(speechText);
            if (this.Speech.voice) {
                utterance.voice = this.Speech.voice;
            }
            utterance.lang = 'zh-TW';
            utterance.rate = 1.2;
            
            Game.Debug.logSpeech('播放答案提示語音', 'answerReveal', 'hard', { 
                text: speechText,
                voiceName: this.Speech.voice?.name 
            });
            
            if (this.Speech.synth && this.Speech.isReady) {
                this.Speech.synth.speak(utterance);
            }
            
            // 3秒後自動隱藏
            setTimeout(() => {
                const popup = document.getElementById('answer-reveal-popup');
                const backdrop = document.getElementById('answer-reveal-backdrop');
                if (popup) {
                    popup.style.animation = 'revealBounceOut 0.3s ease-in forwards';
                    setTimeout(() => {
                        if (popup) popup.remove();
                        if (backdrop) backdrop.remove();
                    }, 300);
                } else {
                    if (backdrop) backdrop.remove();
                }
                
                Game.Debug.logUI('答案提示彈窗自動隱藏', 'answer-reveal');
            }, 3000);
            
            // 添加點擊事件立即關閉
            const popup = document.getElementById('answer-reveal-popup');
            const backdrop = document.getElementById('answer-reveal-backdrop');
            
            if (popup) {
                popup.addEventListener('click', () => {
                    popup.remove();
                    if (backdrop) backdrop.remove();
                });
            }
            
            if (backdrop) {
                backdrop.addEventListener('click', () => {
                    if (popup) popup.remove();
                    backdrop.remove();
                });
            }
        },

        updateProgress() {
            const { currentTurn, totalTurns, score, settings } = this.state;
            const config = this.ModeConfig[settings.difficulty];
            
            Game.Debug.logState('更新進度顯示', {
                currentTurn,
                totalTurns,
                score,
                difficulty: settings.difficulty
            });
            
            if (this.elements.progressInfo && config?.textTemplates?.progressText) {
                const progressText = config.textTemplates.progressText
                    .replace('{current}', currentTurn)
                    .replace('{total}', totalTurns);
                this.elements.progressInfo.textContent = progressText;
            }
            
            if (this.elements.scoreInfo && settings.difficulty !== 'easy' && config?.textTemplates?.scoreText) {
                const scoreText = config.textTemplates.scoreText.replace('{score}', score);
                this.elements.scoreInfo.textContent = scoreText;
            }
            
            if (this.elements.gameTitle) {
                this.elements.gameTitle.textContent = this.gameData.title;
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
            
            // 關閉按鈕事件
            closeBtn.onclick = () => {
                document.getElementById('number-input-popup').remove();
                // 執行取消回調
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

        showEasyModeResult(totalCount) {
            if (document.getElementById('easy-result-popup')) return;
            
            const popupHTML = `
                <div id="easy-result-popup" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:1000; animation: fadeIn 0.3s ease;">
                    <div id="result-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 25px; text-align: center; color: white; box-shadow: 0 20px 40px rgba(0,0,0,0.3); animation: popIn 0.5s ease; max-width: 400px; position: relative;">
                        <!-- 裝飾性星星 -->
                        <div style="position: absolute; top: -10px; left: 20px; font-size: 2em; animation: sparkle 2s infinite;">⭐</div>
                        <div style="position: absolute; top: 10px; right: 30px; font-size: 1.5em; animation: sparkle 2s infinite 0.5s;">✨</div>
                        <div style="position: absolute; bottom: 20px; left: 30px; font-size: 1.8em; animation: sparkle 2s infinite 1s;">🌟</div>
                        
                        <!-- 主要內容 -->
                        <div style="font-size: 4em; margin-bottom: 20px; animation: bounce 1s ease infinite alternate;">🎉</div>
                        <h2 style="margin: 0 0 20px 0; font-size: 2.2em; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">太棒了！</h2>
                        <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 15px; margin: 20px 0;">
                            <p style="font-size: 1.8em; margin: 0; font-weight: bold;">總共有</p>
                            <div style="font-size: 3.5em; margin: 10px 0; color: #ffd700; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); animation: pulse 1.5s ease infinite;">${totalCount}</div>
                            <p style="font-size: 1.8em; margin: 0; font-weight: bold;">個</p>
                        </div>
                        <!-- 語音播放完成後自動進入下一題，無需按鈕 -->
                    </div>
                </div>
                <style>
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes popIn {
                        0% { transform: scale(0.5); opacity: 0; }
                        80% { transform: scale(1.1); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes bounce {
                        0% { transform: translateY(0); }
                        100% { transform: translateY(-10px); }
                    }
                    @keyframes sparkle {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(1.2); }
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                </style>
            `;
            
            document.body.insertAdjacentHTML('beforeend', popupHTML);
            
            // 移除了按鈕點擊事件，改為語音播放完成後自動進入下一題
        },

        showRangeInput(title, callback) {
            if (document.getElementById('range-input-popup')) return;
            
            const popupHTML = `
                <div id="range-input-popup" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:1000;">
                    <div style="background:white; padding:20px; border-radius:15px; width:400px; text-align:center;">
                        <h3>${title}</h3>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <label>最小值:</label>
                            <input type="text" id="min-display" readonly style="width:80px; font-size:1.5em; text-align:center; padding: 5px;">
                            <label>最大值:</label>
                            <input type="text" id="max-display" readonly style="width:80px; font-size:1.5em; text-align:center; padding: 5px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label>當前輸入:</label>
                            <select id="input-target" style="padding: 5px; margin-left: 10px;">
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
            
            // 取消按鈕
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
                        if (minVal && maxVal && minVal < maxVal && minVal > 0 && maxVal <= 50) {
                            if (callback(minVal, maxVal)) {
                                document.getElementById('range-input-popup').remove();
                            }
                        } else {
                            alert('請輸入有效範圍 (最小值 > 0, 最大值 <= 50, 且最小值 < 最大值)');
                        }
                    } else {
                        if (currentDisplay.value.length < 2) currentDisplay.value += key;
                    }
                };
                pad.appendChild(btn);
            });
        },

        getRandomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        
        shuffleArray(array) { 
            for (let i = array.length - 1; i > 0; i--) { 
                const j = Math.floor(Math.random() * (i + 1)); 
                [array[i], array[j]] = [array[j], array[i]]; 
            } 
        },

        showFeedbackPopup(isCorrect, callback = null) {
            const { difficulty } = this.state.settings;
            const config = this.ModeConfig[difficulty];
            
            // 配置驅動的反饋訊息和表情符號
            let message, emoji;
            if (isCorrect) {
                // 答對時：所有模式都顯示正確答案
                message = config.textTemplates.correctFeedback.replace('{answer}', this.state.correctAnswer);
                emoji = '🎉';
            } else {
                // 根據是否允許重試來選擇訊息
                const { testMode } = this.state.settings;
                const shouldRetry = testMode === 'retry' && config.allowRetry;
                if (shouldRetry) {
                    // 反複作答：只顯示「答錯了，再試一次！」，不顯示正確答案
                    message = config.textTemplates.incorrectFeedback;
                    emoji = '😅';
                } else {
                    // 單次作答：顯示正確答案和「進入下一題」
                    message = config.textTemplates.incorrectWithAnswer.replace('{answer}', this.state.correctAnswer);
                    emoji = '🤔';
                }
            }
            
            Game.Debug.logUI('顯示可愛反饋彈跳視窗', 'feedback-popup', { 
                isCorrect, 
                message, 
                emoji 
            });
            
            // 移除舊的反饋視窗
            const existingPopup = document.getElementById('feedback-popup');
            const existingBackdrop = document.getElementById('feedback-backdrop');
            if (existingPopup) existingPopup.remove();
            if (existingBackdrop) existingBackdrop.remove();
            
            // 創建新的可愛彈跳視窗
            const popupHTML = this.HTMLTemplates.feedbackPopup(isCorrect, message, emoji);
            document.body.insertAdjacentHTML('beforeend', popupHTML);
            
            // 綁定點擊事件來關閉視窗
            const popup = document.getElementById('feedback-popup');
            const backdrop = document.getElementById('feedback-backdrop');
            
            const closePopup = () => {
                Game.Debug.logUI('關閉反饋彈跳視窗', 'feedback-popup');
                if (popup) popup.remove();
                if (backdrop) backdrop.remove();
                if (callback) callback();
            };
            
            // 點擊任意處關閉
            if (popup) popup.addEventListener('click', closePopup);
            if (backdrop) backdrop.addEventListener('click', closePopup);
            
            // 自動關閉邏輯：答對時不自動關閉（由語音回調控制），答錯時3秒後自動關閉
            if (!isCorrect) {
                setTimeout(closePopup, 3000);
            } else {
                // 答對時，設置一個全局方法供語音回調調用
                this.closeFeedbackPopup = closePopup;
            }
        },

        triggerConfetti() {
            if (typeof confetti !== 'function') return;
            const duration = 2 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1001 };
            const randomInRange = (min, max) => Math.random() * (max - min) + min;
            
            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti({ 
                    ...defaults, 
                    particleCount, 
                    origin: { x: randomInRange(0.2, 0.8), y: Math.random() - 0.2 } 
                });
            }, 250);
        },

        endGame() {
            const score = this.state.score;
            const correctCount = score / 10;
            const total = this.state.totalTurns;
            const percentage = Math.round((correctCount / total) * 100);
            
            let message = percentage >= 80 ? '表現優異！' : percentage >= 60 ? '表現良好！' : '要多加練習喔！';
            let icon = percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : '💪';
            
            const { difficulty } = this.state.settings;
            const showScore = difficulty !== 'easy';
            
            document.getElementById('app').innerHTML = `
                <div class="game-complete">
                    <div class="result-card">
                        <div class="results-header">
                            <div class="trophy-icon">${icon}</div>
                            <h1>🎉 測驗結束 🎉</h1>
                            <p><strong>${message}</strong></p>
                        </div>
                        <div class="final-stats">
                            ${showScore ? `
                                <div class="stat-item"><span>答對題數</span><span>${correctCount} / ${total}</span></div>
                                <div class="stat-item"><span>總分</span><span>${score} 分</span></div>
                                <div class="stat-item"><span>正確率</span><span>${percentage}%</span></div>
                            ` : `
                                <div class="stat-item"><span>完成題數</span><span>${total} 題</span></div>
                                <div class="stat-item"><span>狀態</span><span>全部完成</span></div>
                            `}
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
            this.Speech.speak('encouragement', difficulty, this.ModeConfig[difficulty] || {}, {});
        },

        // =====================================================
        // 🎨 自訂主題圖片上傳功能 - 配置驅動 (仿a1_simulated_shopping)
        // =====================================================
        triggerImageUpload() {
            console.log('📸 [F2 調試] triggerImageUpload 被調用');
            this.Debug.logUserAction('觸發圖片上傳');
            
            const modal = document.getElementById('image-preview-modal');
            console.log('📸 [F2 調試] modal 元素:', modal);
            if (modal) {
                modal.classList.remove('show');
            }
            
            const fileInput = document.getElementById('custom-image');
            console.log('📸 [F2 調試] fileInput 元素:', fileInput);
            if (fileInput) {
                console.log('✅ [F2 調試] 準備觸發檔案選擇對話框');
                fileInput.click();
            } else {
                console.error('❌ [F2 調試] 找不到檔案輸入元素');
            }
        },

        handleImageUpload(event) {
            this.Debug.logUserAction('處理圖片上傳');
            
            const file = event.target.files[0];
            if (!file) {
                this.Debug.logError('沒有選擇檔案');
                return;
            }

            // 檢查檔案類型
            if (!file.type.startsWith('image/')) {
                alert('請選擇圖片檔案！');
                event.target.value = '';
                return;
            }

            // 檢查檔案大小（限制5MB）
            if (file.size > 5 * 1024 * 1024) {
                alert('圖片檔案過大，請選擇小於5MB的圖片！');
                event.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                this.tempImageData = e.target.result;
                this.tempFileSize = file.size;
                this.showImagePreview(this.tempImageData, file);
            };
            reader.readAsDataURL(file);

            // 清空input以允許重複選擇同一檔案
            event.target.value = '';
        },

        showImagePreview(imageData, file = null) {
            this.Debug.logUserAction('顯示圖片預覽', { imageSize: imageData.length });
            
            const modal = document.getElementById('image-preview-modal');
            const previewImage = document.getElementById('preview-image');
            const nameInput = document.getElementById('modal-custom-name');
            
            if (modal && previewImage && nameInput) {
                previewImage.src = imageData;
                nameInput.value = '';
                
                
                // 使用 show 類別替代 style.display
                modal.classList.add('show');
                nameInput.focus();
                
                // 綁定Enter鍵確認
                nameInput.onkeydown = (e) => {
                    if (e.key === 'Enter') {
                        this.confirmAddCustomItem();
                    } else if (e.key === 'Escape') {
                        this.closeImagePreview();
                    }
                };
            }
        },

        confirmAddCustomItem() {
            const nameInput = document.getElementById('modal-custom-name');
            const name = nameInput?.value.trim();
            
            if (!name) {
                alert('請輸入圖示名稱！');
                nameInput?.focus();
                return;
            }
            
            if (name.length > 10) {
                alert('圖示名稱不能超過10個字元！');
                return;
            }
            
            // 檢查名稱是否重複
            const isDuplicate = this.state.customItems.some(item => item.name === name);
            if (isDuplicate) {
                alert('圖示名稱已存在，請使用不同的名稱！');
                return;
            }
            
            this.Debug.logUserAction('確認新增自訂圖示', { name, imageSize: this.tempImageData?.length });
            
            // 新增到狀態
            const customItem = {
                name: name,
                imageData: this.tempImageData,
                id: Date.now() // 使用時間戳作為唯一ID
            };
            
            this.state.customItems.push(customItem);
            
            // 更新自訂主題的圖示陣列
            this.gameData.themes.custom.push(this.tempImageData);
            
            this.Debug.logState('新增自訂圖示', null, { 
                customItems: this.state.customItems.length,
                customTheme: this.gameData.themes.custom.length 
            });
            
            // 播放語音回饋
            const { difficulty } = this.state.settings;
            const config = this.ModeConfig[difficulty] || this.ModeConfig.normal;
            const speechTemplate = config.speechTemplates?.addCustomItem || "已新增自訂圖示：{itemName}";
            const speechText = speechTemplate.replace('{itemName}', name);
            this.Speech.speak('addCustomItem', difficulty, config, { itemName: name });
            
            // 關閉模態視窗
            this.closeImagePreview();
            
            // 重新載入設定畫面以顯示新圖示
            this.showSettings();
        },

        removeCustomItem(index) {
            const item = this.state.customItems[index];
            if (!item) return;
            
            if (confirm(`確定要刪除圖示「${item.name}」嗎？`)) {
                this.Debug.logUserAction('刪除自訂圖示', { name: item.name, index });
                
                // 從狀態中移除
                this.state.customItems.splice(index, 1);
                
                // 從主題陣列中移除對應的圖片資料
                const imageIndex = this.gameData.themes.custom.indexOf(item.imageData);
                if (imageIndex > -1) {
                    this.gameData.themes.custom.splice(imageIndex, 1);
                }
                
                this.Debug.logState('刪除自訂圖示', null, { 
                    customItems: this.state.customItems.length,
                    customTheme: this.gameData.themes.custom.length 
                });
                
                // 播放語音回饋
                const { difficulty } = this.state.settings;
                const config = this.ModeConfig[difficulty] || this.ModeConfig.normal;
                const speechTemplate = config.speechTemplates?.removeCustomItem || "已移除圖示：{itemName}";
                const speechText = speechTemplate.replace('{itemName}', item.name);
                this.Speech.speak('removeCustomItem', difficulty, config, { itemName: item.name });
                
                // 重新載入設定畫面
                this.showSettings();
            }
        },

        closeImagePreview() {
            this.Debug.logUserAction('關閉圖片預覽');
            
            const modal = document.getElementById('image-preview-modal');
            if (modal) {
                modal.classList.remove('show');
            }
            
            // 清空臨時圖片資料
            this.tempImageData = null;
            this.tempFileSize = null;
        }
    };

    // 自動初始化遊戲
    Game.init();
});