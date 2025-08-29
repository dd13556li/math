// =================================================================
// FILE: js/f3_number_recognition.js
// DESC: F3 認識數字與數量 - 配置驅動版本
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
            logPrefix: '[F3-認識數字與數量]',
            
            log(category, message, data = null) {
                if (!this.enabled) return;
                const timestamp = new Date().toLocaleTimeString();
                console.log(`${this.logPrefix}[${category}] ${timestamp}: ${message}`, data || '');
            },
            
            logGameFlow(action, data = null) { this.log('遊戲流程', action, data); },
            logSpeech(action, text) { this.log('語音系統', action, { text }); },
            logUserAction(action, data = null) { this.log('使用者行為', action, data); },
        },

        // =====================================================
        // 🎯 配置驅動核心：ModeConfig
        // =====================================================
        ModeConfig: {
            easy: {
                modeLabel: '簡單',
                turnTypes: ['numeral-to-object-drop'],
                speechTemplates: {
                    initialInstruction: "請把和數字 {answer} 一樣多的{itemName}，放到下面的框框裡。您可以拖拽或雙擊物品放置。",
                    correct: "答對了！你真棒！",
                    incorrect: "不對喔，再試一次吧！",
                    gameComplete: "恭喜你完成了所有題目！你得到了 {score} 分！",
                    itemSelected: "已選擇 {itemName}，再點擊一次物品來放置",
                    itemPlacedByClick: "雙擊放置成功！",
                    clickToPlace: "雙擊物品來放置",
                    addCustomItem: "已新增自訂圖示：{itemName}",
                    removeCustomItem: "已移除圖示：{itemName}"
                },
                timing: { nextQuestionDelay: 2000 },
                uiElements: { showCompletionButton: false },
                // 點擊操作配置
                clickToMoveConfig: {
                    enabled: true,                    // 啟用點擊移動功能
                    allowClickToPlace: true,          // 允許點擊放置
                    allowClickToReturn: false,        // 簡單模式不允許點擊取回
                    audioFeedback: true,              // 點擊時播放音效
                    speechFeedback: true,             // 點擊時語音回饋
                    visualSelection: true,            // 顯示選擇的視覺效果
                    selectionTimeout: 0               // 選擇狀態持續時間，0表示需要點擊確認
                },
                audioFeedback: true, 
                speechFeedback: true,
                countingVoice: true, // 簡單模式：播放數量語音（自動判斷時）
            },
            normal: {
                modeLabel: '普通',
                turnTypes: ['numeral-to-object-drop'], // 使用新的拖放題型
                speechTemplates: {
                    initialInstruction: "請把和數字 {answer} 一樣多的{itemName}，放到中間的框框裡。您可以拖拽或雙擊物品放置。",
                    correct: "答對了！正確答案是 {answer}。",
                    incorrect: "不對喔，再試一次吧！",
                    incorrectWithAnswer: "答錯了，正確答案是 {answer} ，進入下一題。",
                    gameComplete: "太棒了！你完成了所有題目，得到 {score} 分！",
                    itemSelected: "已選擇 {itemName}，再點擊一次物品來放置",
                    itemPlacedByClick: "雙擊放置成功！",
                    itemReturnedByClick: "物品已移回",
                    clickToPlace: "雙擊物品來放置",
                    clickToReturn: "點擊已放置的物品可以移回",
                    addCustomItem: "已新增自訂圖示：{itemName}",
                    removeCustomItem: "已移除圖示：{itemName}"
                },
                timing: { nextQuestionDelay: 2000 },
                uiElements: { showCompletionButton: true }, // 需要完成按鈕
                // 點擊操作配置
                clickToMoveConfig: {
                    enabled: true,                    // 啟用點擊移動功能
                    allowClickToPlace: true,          // 允許點擊放置
                    allowClickToReturn: true,         // 普通模式允許點擊取回
                    audioFeedback: true,              // 點擊時播放音效
                    speechFeedback: true,             // 點擊時語音回饋
                    visualSelection: true,            // 顯示選擇的視覺效果
                    selectionTimeout: 0               // 選擇狀態持續時間，0表示需要點擊確認
                },
                audioFeedback: true, 
                speechFeedback: true,
                countingVoice: true, // 普通模式：播放數量語音
            },
            hard: {
                modeLabel: '困難',
                turnTypes: ['numeral-to-object-drop'], // 改為使用拖放題型，與普通模式相同
                speechTemplates: {
                    initialInstruction: "請把和數字 {answer} 一樣多的{itemName}，放到中間的框框裡。您可以拖拽或雙擊物品放置。",
                    correct: "答對了！正確答案是 {answer}。",
                    incorrect: "不對喔，再試一次吧！",
                    incorrectWithAnswer: "答錯了，正確答案是 {answer}。",
                    gameComplete: "恭喜你完成挑戰！最終得分：{score} 分！",
                    itemSelected: "已選擇 {itemName}，再點擊一次物品來放置",
                    itemPlacedByClick: "雙擊放置成功！",
                    itemReturnedByClick: "物品已移回",
                    clickToPlace: "雙擊物品來放置",
                    clickToReturn: "點擊已放置的物品可以移回",
                    addCustomItem: "已新增自訂圖示：{itemName}",
                    removeCustomItem: "已移除圖示：{itemName}"
                },
                timing: { nextQuestionDelay: 1500 },
                uiElements: { showCompletionButton: true }, // 需要完成按鈕
                // 點擊操作配置
                clickToMoveConfig: {
                    enabled: true,                    // 啟用點擊移動功能
                    allowClickToPlace: true,          // 允許點擊放置
                    allowClickToReturn: true,         // 困難模式允許點擊取回
                    audioFeedback: true,              // 點擊時播放音效
                    speechFeedback: true,             // 點擊時語音回饋
                    visualSelection: true,            // 顯示選擇的視覺效果
                    selectionTimeout: 0               // 選擇狀態持續時間，0表示需要點擊確認
                },
                audioFeedback: true, 
                speechFeedback: true,
                countingVoice: false, // 困難模式：不播放數量語音
            }
        },

        // =====================================================
        // 🎮 遊戲資料配置
        // =====================================================
        gameData: {
            title: "單元F3：認識數字與數量",
            themes: {
                fruits: ['🍎', '🍌', '🍇', '🍓', '🍊', '🥝', '🍍', '🍉', '🍑', '🍒'],
                animals: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁'],
                vehicles: ['🚗', '🚕', '🚌', '🚓', '🚑', '🚒', '🚚', '🚲', '🚀', '✈️'],
                custom: [] // 自訂主題（動態載入自訂圖示）
            },
            difficultySettings: {
                easy: { minItems: 1, maxItems: 5, label: '簡單' },
                normal: { minItems: 1, maxItems: 10, label: '普通' },
                hard: { minItems: 5, maxItems: 15, label: '困難' }
            },
            countingRanges: {
                'range1-5': { minItems: 1, maxItems: 5, label: '1-5' },
                'range1-10': { minItems: 1, maxItems: 10, label: '1-10' },
                'range5-15': { minItems: 5, maxItems: 15, label: '5-15' }
            },
            itemNames: { 
                '🍎': '蘋果', '🍌': '香蕉', '🍇': '葡萄', '🍓': '草莓', '🍊': '橘子', 
                '🥝': '奇異果', '🍍': '鳳梨', '🍉': '西瓜', '🍑': '水蜜桃', '🍒': '櫻桃', 
                '🐶': '小狗', '🐱': '小貓', '🐭': '老鼠', '🐰': '兔子', '🦊': '狐狸', 
                '🐻': '熊', '🐼': '熊貓', '🐨': '無尾熊', '🐯': '老虎', '🦁': '獅子', 
                '🚗': '汽車', '🚕': '計程車', '🚌': '公車', '🚓': '警車', '🚑': '救護車', 
                '🚒': '消防車', '🚚': '卡車', '🚲': '腳踏車', '🚀': '火箭', '✈️': '飛機' 
            }
        },
        
        // =====================================================
        // 🎵 音效系統 - 配置驅動
        // =====================================================
        Audio: {
            soundMap: {
                correct: 'correct02-sound',
                error: 'error-sound', 
                success: 'success-sound',
                select: 'menu-select-sound',
                click: 'click-sound'
            },
            
            playSound(soundType, difficulty, config, callback = null) {
                if (!config || !config.audioFeedback) {
                    if (callback) setTimeout(callback, 100);
                    return;
                }
                
                const audioId = this.soundMap[soundType];
                if (!audioId) {
                    if (callback) setTimeout(callback, 100);
                    return;
                }
                
                const audioElement = document.getElementById(audioId);
                if (audioElement) {
                    audioElement.currentTime = 0;
                    audioElement.play().catch(e => Game.Debug.log('錯誤', '音效播放失敗', e));
                    if (callback) setTimeout(callback, 300);
                } else {
                    if (callback) setTimeout(callback, 100);
                }
            }
        },

        // =====================================================
        // 🎤 語音系統 - 配置驅動
        // =====================================================
        Speech: {
            synth: window.speechSynthesis,
            voice: null,
            isReady: false,
            
            init() {
                const setVoice = () => {
                    const voices = this.synth.getVoices();
                    if (voices.length === 0) return;
                    
                    const preferredVoices = ['Microsoft HsiaoChen Online', 'Google 國語 (臺灣)'];
                    this.voice = voices.find(v => preferredVoices.includes(v.name));
                    
                    if (!this.voice) {
                        const twVoices = voices.filter(v => v.lang === 'zh-TW' && !v.name.includes('Hanhan'));
                        this.voice = twVoices[0];
                    }
                    
                    if (!this.voice) {
                        this.voice = voices.find(v => v.lang.includes('zh'));
                    }
                    
                    if (this.voice) {
                        this.isReady = true;
                    }
                };
                
                if (this.synth.onvoiceschanged !== undefined) {
                    this.synth.onvoiceschanged = setVoice;
                }
                setVoice();
            },
            
            speak(templateKey, difficulty, config, replacements = {}, callback = null) {
                if (!config || !config.speechFeedback || !this.isReady) {
                    if (callback) setTimeout(callback, 100);
                    return;
                }
                
                const template = config.speechTemplates[templateKey];
                if (!template) {
                    if (callback) setTimeout(callback, 100);
                    return;
                }
                
                let speechText = template;
                Object.keys(replacements).forEach(key => {
                    speechText = speechText.replace(`{${key}}`, replacements[key]);
                });
                
                this.synth.cancel();
                const utterance = new SpeechSynthesisUtterance(speechText);
                utterance.voice = this.voice;
                utterance.rate = 1.0;
                utterance.lang = this.voice?.lang || 'zh-TW';
                
                if (callback) {
                    utterance.onend = () => {
                        callback();
                    };
                }
                
                this.synth.speak(utterance);
            }
        },

        // =====================================================
        // 🎨 HTML Templates - 配置驅動模板系統
        // =====================================================
        HTMLTemplates: {
            settingsScreen(difficulty, theme, questionCount, testMode, countingRange) {
                return `
                <div class="unit-welcome">
                    <div class="welcome-content">
                        <h1>${Game.gameData.title}</h1>
                        <p class="unit-description">將抽象的數字符號與具體數量進行連結，理解數字的真實意義</p>
                        
                        <div class="game-settings">
                            <div class="setting-group">
                                <label>🎯 難度選擇：</label>
                                <div class="button-group">
                                    ${Object.entries(Game.gameData.difficultySettings).map(([key, value]) => `
                                        <button class="selection-btn ${difficulty === key ? 'active' : ''}" 
                                                data-type="difficulty" data-value="${key}">
                                            ${value.label}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>🔢 數字範圍：</label>
                                <div class="button-group">
                                    ${Object.entries(Game.gameData.countingRanges).map(([key, value]) => `
                                        <button class="selection-btn ${countingRange === key ? 'active' : ''}" 
                                                data-type="countingRange" data-value="${key}">
                                            ${value.label}
                                        </button>
                                    `).join('')}
                                    <button class="selection-btn ${countingRange && !Game.gameData.countingRanges[countingRange] ? 'active' : ''}" 
                                            data-type="countingRange" data-value="custom">
                                        自訂
                                    </button>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>🎨 主題選擇：</label>
                                <div class="button-group">
                                    ${Object.entries(Game.gameData.themes).filter(([key]) => key !== 'custom').map(([key, icons]) => {
                                        const themeNames = { fruits: '水果', animals: '動物', vehicles: '交通工具' };
                                        return `
                                            <button class="selection-btn ${theme === key ? 'active' : ''}" 
                                                    data-type="theme" data-value="${key}">
                                                ${themeNames[key]} ${icons[0]}
                                            </button>
                                        `;
                                    }).join('')}
                                    <button class="selection-btn ${theme === 'custom' ? 'active' : ''}" 
                                            data-type="theme" data-value="custom">
                                        🎨 自訂主題
                                    </button>
                                </div>
                                
                                ${theme === 'custom' ? `
                                    <div class="setting-group custom-theme-setup">
                                        <h4>🎨 自訂主題設定</h4>
                                        <p>上傳你的圖示並設定名稱：</p>
                                        <div class="custom-items-list">
                                            ${Game.state.customItems.map((item, index) => `
                                                <div class="custom-item-row">
                                                    <img src="${item.icon}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
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
                            
                            <div class="setting-group">
                                <label>📊 題目數量：</label>
                                <div class="button-group">
                                    ${[5, 10, 15, 20].map(count => `
                                        <button class="selection-btn ${questionCount === count ? 'active' : ''}" 
                                                data-type="questionCount" data-value="${count}">
                                            ${count} 題
                                        </button>
                                    `).join('')}
                                    <button class="selection-btn ${typeof questionCount === 'number' && ![5, 10, 15, 20].includes(questionCount) ? 'active' : ''}" 
                                            data-type="questionCount" data-value="custom">
                                        自訂
                                    </button>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>📝 測驗模式：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${testMode === 'retry' ? 'active' : ''}" 
                                            data-type="testMode" data-value="retry">
                                        反複練習
                                    </button>
                                    <button class="selection-btn ${testMode === 'single' ? 'active' : ''}" 
                                            data-type="testMode" data-value="single">
                                        單次作答
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="game-buttons">
                            <button class="back-btn" onclick="window.location.href='index.html'">返回主選單</button>
                            <button id="start-game-btn" class="start-btn" disabled>請完成所有選擇</button>
                        </div>
                    </div>
                </div>`;
            },

            gameLayout(currentTurn, totalTurns, difficulty) {
                const config = Game.ModeConfig[difficulty];
                let layoutHTML = '';

                // 簡單和普通模式使用三框佈局
                if (config.turnTypes.includes('numeral-to-object-drop')) {
                    layoutHTML = `
                        <div id="item-source-area" class="item-source-area"></div>
                        ${difficulty === 'easy' ? '<div class="placement-wrapper"><div id="count-display" class="count-display">0</div>' : ''}
                        <div id="placement-area" class="placement-area"></div>
                        ${difficulty === 'easy' ? '</div>' : ''}
                        <div id="prompt-area" class="prompt-area"></div>
                        <div id="completion-area" class="completion-area"></div>
                    `;
                } else { // 困難模式使用傳統選擇題佈局
                    layoutHTML = `
                        <div id="prompt-area" class="prompt-area"></div>
                        <div id="selection-area" class="selection-area"></div>
                        <div id="completion-area" class="completion-area"></div>
                    `;
                }
                
                return `
                <div class="game-container">
                    <div class="title-bar">
                        <div id="progress-info">第 ${currentTurn}/${totalTurns} 題</div>
                        <div>${Game.gameData.title}</div>
                        <div class="title-bar-right">
                            <div id="score-info">分數: 0</div>
                            <button class="back-to-menu-btn" onclick="Game.showSettings()">返回</button>
                        </div>
                    </div>
                    <div class="game-content">${layoutHTML}</div>
                </div>`;
            },

            gameStyles(difficulty) {
                return `
                <style>
                    .game-container { display: flex; flex-direction: column; height: 100vh; }
                    .game-content { display: flex; flex-direction: column; flex: 1; padding: 20px; gap: 15px; }
                    
                    /* --- 三框佈局通用樣式 (for Easy & Normal) --- */
                    .item-source-area, .placement-area, .prompt-area {
                        width: 100%;
                        border-radius: 15px;
                        padding: 20px;
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        align-items: center;
                        gap: 15px;
                        box-sizing: border-box;
                    }
                    .item-source-area { 
                        background: #e8f5e9; 
                        border: 3px solid #a5d6a7; 
                        min-height: 150px; 
                        align-content: center; 
                    }
                    .placement-area { 
                        background: #f3e5f5; 
                        border: 3px dashed #ce93d8; 
                        min-height: 150px;
                        align-content: flex-start;
                        position: relative;
                    }
                    .prompt-area { 
                        background: #e3f2fd; 
                        border: 3px solid #90caf9; 
                        min-height: 150px; 
                    }
                    .completion-area { 
                        padding-top: 5px; 
                        text-align: center;
                    }

                    /* --- 簡單模式 (Easy) --- */
                    .placement-wrapper {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 15px;
                    }
                    .count-display {
                        font-size: 4rem;
                        font-weight: bold;
                        color: #9c27b0;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                        background: white;
                        border: 3px solid #ce93d8;
                        border-radius: 50%;
                        width: 80px;
                        height: 80px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        transition: all 0.3s ease;
                    }
                    .count-display.updated {
                        transform: scale(1.2);
                        background: #f3e5f5;
                    }
                    .placement-slot { 
                        width: 80px; 
                        height: 80px; 
                        border: 3px dashed #aaa; 
                        border-radius: 10px; 
                        font-size: 3.5rem; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                    }
                    .placement-slot.filled { 
                        border-style: solid; 
                        border-color: #81c784; 
                        background-color: #e8f5e9; 
                        cursor: pointer; 
                    }
                    
                    /* --- 普通模式 (Normal) --- */
                    .placement-area.drag-over { 
                        border-color: #4caf50 !important; 
                        background-color: #e8f5e8 !important; 
                    }
                    .item-source-area.drag-over { 
                        border-color: #ff9800 !important; 
                        background-color: #fff3e0 !important; 
                    }
                    .placement-area::before {
                        content: '拖拽物品到這裡';
                        position: absolute;
                        font-size: 1.2rem;
                        color: #999;
                        pointer-events: none;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        opacity: 0.7;
                    }
                    .placement-area:not(:empty)::before {
                        display: none;
                    }
                    .placed-item { 
                        font-size: 3.5rem; 
                        cursor: pointer;
                        border: 2px solid #81c784;
                        border-radius: 10px;
                        padding: 5px;
                        background: white;
                        transition: transform 0.2s;
                    }
                    .placed-item:hover {
                        transform: scale(1.1);
                    }
                    
                    /* --- 困難模式 (Hard) --- */
                    .selection-area { 
                        background: #fff3e0; 
                        border: 3px dashed #ffcc80; 
                        min-height: 200px;
                        border-radius: 15px;
                        padding: 30px;
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        align-items: center;
                        gap: 15px;
                    }
                    .selection-object {
                        font-size: 3rem; width: 80px; height: 80px;
                        display: flex; align-items: center; justify-content: center;
                        background: white; border: 2px solid #ccc;
                        border-radius: 10px; cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .selection-object:hover {
                        transform: scale(1.1);
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    }
                    .selection-object.selected {
                        border-color: #28a745; background-color: #d4edda;
                        transform: scale(1.05);
                    }
                    .selection-numeral {
                        font-size: 4rem; font-weight: bold;
                        width: 120px; height: 120px;
                        display: flex; align-items: center; justify-content: center;
                        background: #ffffff; color: #333;
                        border: 3px solid #007bff; border-radius: 15px;
                        cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                        transition: all 0.3s ease;
                    }
                    .selection-numeral:hover {
                        transform: scale(1.1);
                        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
                        border-color: #0056b3;
                    }

                    /* --- 通用元件 --- */
                    .source-item { 
                        font-size: 3.5rem; 
                        cursor: grab; 
                        transition: opacity 0.2s; 
                        user-select: none; 
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                    }
                    .source-item:hover {
                        transform: scale(1.15);
                    }
                    .source-item:active { 
                        cursor: grabbing; 
                    }
                    .source-item.used { 
                        opacity: 0.2; 
                        pointer-events: none; 
                    }
                    .selected-item {
                        border: 3px solid #2196f3 !important;
                        background: linear-gradient(135deg, #e3f2fd, #bbdefb) !important;
                        transform: scale(1.05) !important;
                        box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4) !important;
                        z-index: 10;
                        position: relative;
                    }
                    .source-item.clickable-item {
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    .source-item.clickable-item:hover {
                        background-color: rgba(33, 150, 243, 0.1) !important;
                        border: 2px solid #2196f3 !important;
                    }
                    .placement-slot.clickable-zone {
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    .placement-slot.clickable-zone:hover {
                        background-color: rgba(33, 150, 243, 0.05) !important;
                        border-color: #2196f3 !important;
                    }
                    .prompt-numeral { 
                        font-size: 8rem; 
                        font-weight: bold; 
                        color: #0d47a1;
                        text-shadow: 3px 3px 5px rgba(0,0,0,0.2);
                        animation: pulse 2s infinite;
                    }
                    .prompt-objects {
                        display: flex; flex-wrap: wrap;
                        gap: 10px; justify-content: center;
                    }
                    .prompt-object {
                        font-size: 3.5rem;
                        animation: bounce 1s infinite alternate;
                    }
                    .complete-button { 
                        background: #28a745; 
                        color: white; 
                        border: none;
                        padding: 15px 30px; 
                        font-size: 1.2em; 
                        font-weight: 600;
                        border-radius: 25px; 
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
                        transition: all 0.3s ease;
                    }
                    .complete-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
                    }
                    
                    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
                    @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }
                    
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
                </style>`;
            },

            sourceItem: (icon, index) => `<div class="source-item clickable-item" data-type="source-item" data-index="${index}" data-icon="${icon}" draggable="true">${Game.renderIcon(icon)}</div>`,
            placedItem: (icon, sourceIndex) => `<div class="placed-item" data-type="placed-item" data-source-index="${sourceIndex}" data-icon="${icon}" draggable="true">${Game.renderIcon(icon)}</div>`,
            placementSlot: (index) => `<div class="placement-slot clickable-zone" data-type="placement-slot" data-index="${index}"></div>`,
            promptNumeral: (number) => `<div class="prompt-numeral">${number}</div>`,
            promptObjects: (icon, count) => {
                let html = '<div class="prompt-objects">';
                for (let i = 0; i < count; i++) {
                    html += `<div class="prompt-object" style="animation-delay: ${i * 0.1}s">${Game.renderIcon(icon)}</div>`;
                }
                html += '</div>';
                return html;
            },
            selectionObject: (icon, index) => `<div class="selection-object" data-type="object" data-index="${index}" data-icon="${icon}">${Game.renderIcon(icon)}</div>`,
            selectionNumeral: (number) => `<button class="selection-numeral" data-type="numeral" data-value="${number}">${number}</button>`,
            completeButton: () => `<button id="complete-btn" class="complete-button">完成</button>`,
        },

        // =====================================================
        // 🎮 遊戲狀態管理
        // =====================================================
        state: {
            score: 0,
            currentTurn: 0,
            totalTurns: 10,
            correctAnswer: 0,
            currentTurnType: null,
            selectedItems: [],
            isAnswering: false,
            customItems: [], // 自訂主題圖示和名稱
            selectedClickItem: null, // 點擊選中的物品
            // 雙擊檢測變數
            lastClickTime: 0,
            lastClickedElement: null,
            clickCount: 0,
            doubleClickDelay: 500, // 雙擊檢測時間間隔(ms)
            
            settings: {
                difficulty: 'easy',  // 改回預設為easy，避免直接從hard開始
                theme: 'fruits',
                questionCount: 10,
                testMode: 'retry',
                countingRange: 'range1-10'
            }
        },

        // =====================================================
        // 🎮 遊戲流程控制
        // =====================================================
        init() { 
            this.Debug.logGameFlow('遊戲初始化');
            this.Speech.init(); 
            this.showSettings(); 
        },
        
        showSettings() {
            this.Debug.logGameFlow('顯示設定畫面');
            const app = document.getElementById('app');
            const { difficulty, theme, questionCount, testMode, countingRange } = this.state.settings;
            
            app.innerHTML = this.HTMLTemplates.settingsScreen(difficulty, theme, questionCount, testMode, countingRange);
            
            // 綁定事件
            const settingsContainer = app.querySelector('.game-settings');
            settingsContainer.addEventListener('click', this.handleSettingSelection.bind(this));
            
            const startBtn = app.querySelector('#start-game-btn');
            startBtn.addEventListener('click', this.startGame.bind(this));
            
            this.updateStartButton();
        },

        // =====================================================
        // 🔢 自訂數字輸入器 - 配置驅動 (仿f1_object_correspondence)
        // =====================================================
        showCustomQuestionCountInput() {
            this.showNumberInput('請輸入題目數量 (1-50)', (num) => {
                const count = parseInt(num);
                if (count >= 1 && count <= 50) {
                    this.state.settings.questionCount = count;
                    this.state.totalTurns = count;
                    
                    // 刷新設定頁面以更新UI
                    this.renderSettingsScreen();
                    this.updateStartButton();
                    
                    this.Debug.logUserAction('自訂題目數量', { count });
                    return true;
                } else {
                    alert('請輸入1-50之間的數字');
                    return false;
                }
            });
        },

        showCustomRangeInput() {
            this.showRangeInput('請輸入數字範圍', (min, max) => {
                const minNum = parseInt(min);
                const maxNum = parseInt(max);
                
                if (minNum >= 1 && maxNum <= 50 && minNum < maxNum) {
                    const customKey = `custom-${minNum}-${maxNum}`;
                    this.gameData.countingRanges[customKey] = {
                        minItems: minNum,
                        maxItems: maxNum,
                        label: `${minNum}-${maxNum}`
                    };
                    
                    this.state.settings.countingRange = customKey;
                    
                    // 刷新設定頁面以更新UI
                    this.renderSettingsScreen();
                    this.updateStartButton();
                    
                    this.Debug.logUserAction('自訂數字範圍', { min: minNum, max: maxNum });
                    return true;
                } else {
                    alert('請確認：最小值≥1，最大值≤50，且最小值<最大值');
                    return false;
                }
            });
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
                    <div style="background:white; padding:20px; border-radius:15px; width:400px; text-align:center; position:relative;">
                        <button id="close-range-input" style="
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
                        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 15px;">
                            <label>最小值:</label>
                            <input type="text" id="min-display" readonly style="width:80px; font-size:1.5em; text-align:center; padding: 5px; border: 2px solid #ddd; border-radius: 5px;">
                            <label>最大值:</label>
                            <input type="text" id="max-display" readonly style="width:80px; font-size:1.5em; text-align:center; padding: 5px; border: 2px solid #ddd; border-radius: 5px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="font-weight: bold;">目前輸入:</label>
                            <div id="current-input-type" style="font-size: 1.1em; color: #666; margin-top: 5px;">請輸入最小值</div>
                        </div>
                        <div id="range-pad" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;"></div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', popupHTML);
            const pad = document.getElementById('range-pad');
            const minDisplay = document.getElementById('min-display');
            const maxDisplay = document.getElementById('max-display');
            const currentInputType = document.getElementById('current-input-type');
            const closeBtn = document.getElementById('close-range-input');
            
            let isInputingMax = false;
            
            closeBtn.onclick = () => {
                document.getElementById('range-input-popup').remove();
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
                    const currentDisplay = isInputingMax ? maxDisplay : minDisplay;
                    
                    if (key === '清除') {
                        currentDisplay.value = '';
                    } else if (key === '確認') {
                        if (!isInputingMax && minDisplay.value) {
                            isInputingMax = true;
                            currentInputType.textContent = '請輸入最大值';
                        } else if (isInputingMax && maxDisplay.value && minDisplay.value) {
                            if (callback(minDisplay.value, maxDisplay.value)) {
                                document.getElementById('range-input-popup').remove();
                            }
                        }
                    } else {
                        if (currentDisplay.value.length < 2) currentDisplay.value += key;
                    }
                };
                pad.appendChild(btn);
            });
        },

        handleSettingSelection(event) {
            const btn = event.target.closest('.selection-btn');
            if (!btn) return;

            const { type, value } = btn.dataset;
            this.Debug.logUserAction('設定選擇', { type, value });

            // 處理自訂選項
            if (value === 'custom') {
                if (type === 'questionCount') {
                    this.showCustomQuestionCountInput();
                    return;
                } else if (type === 'countingRange') {
                    this.showCustomRangeInput();
                    return;
                } else if (type === 'theme') {
                    // 選擇自訂主題時，確保自訂主題資料同步
                    this.gameData.themes.custom = this.state.customItems.map(item => item.icon);
                }
            }

            // 更新狀態
            if (type === 'questionCount') {
                this.state.settings[type] = parseInt(value);
                this.state.totalTurns = parseInt(value);
            } else {
                this.state.settings[type] = value;
            }

            // 更新UI
            btn.parentElement.querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 如果選擇了自訂主題，重新渲染設定頁面以顯示自訂主題設定區域
            if (type === 'theme') {
                setTimeout(() => this.showSettings(), 100);
                return;
            }
            
            this.Audio.playSound('select', null, { audioFeedback: true });
            this.updateStartButton();
        },

        updateStartButton() {
            const { difficulty, theme, testMode, countingRange, questionCount } = this.state.settings;
            const startBtn = document.getElementById('start-game-btn');
            
            // 檢查自訂主題是否有足夠的圖示
            const isCustomThemeValid = theme !== 'custom' || this.state.customItems.length >= 1;
            
            if (difficulty && theme && testMode && countingRange && questionCount && isCustomThemeValid) {
                startBtn.disabled = false;
                startBtn.textContent = '開始遊戲！';
                startBtn.classList.add('ready');
            } else {
                startBtn.disabled = true;
                if (theme === 'custom' && this.state.customItems.length < 1) {
                    startBtn.textContent = '自訂主題需要至少1個圖示';
                } else {
                    startBtn.textContent = '請完成所有選擇';
                }
                startBtn.classList.remove('ready');
            }
        },
        
        startGame() {
            this.Debug.logGameFlow('遊戲開始', this.state.settings);
            this.state.score = 0; 
            this.state.currentTurn = 0; 
            this.state.selectedItems = [];
            this.state.isAnswering = false;
            this.setupGameUI(); 
            this.startNewTurn();
        },
        
        setupGameUI() {
            const app = document.getElementById('app');
            app.innerHTML = this.HTMLTemplates.gameLayout(this.state.currentTurn + 1, this.state.totalTurns, this.state.settings.difficulty);
            app.insertAdjacentHTML('beforeend', this.HTMLTemplates.gameStyles(this.state.settings.difficulty));
            
            this.elements = ['itemSourceArea', 'placementArea', 'promptArea', 'completionArea', 'selectionArea', 'countDisplay'].reduce((acc, id) => {
                const element = document.getElementById(id.replace(/([A-Z])/g, '-$1').toLowerCase());
                acc[id] = element;
                return acc;
            }, {});

            const gameContent = document.querySelector('.game-content');
            gameContent.addEventListener('click', this.handleActionClick.bind(this));

            if (this.ModeConfig[this.state.settings.difficulty].turnTypes.includes('numeral-to-object-drop')) {
                this.setupDragAndDrop();
            }
        },
        
        startNewTurn() {
            if (this.state.currentTurn >= this.state.totalTurns) { 
                this.endGame(); 
                return; 
            }
            this.state.currentTurn++; 
            this.state.selectedItems = [];
            this.state.isAnswering = false;
            
            this.Debug.logGameFlow('開始新回合', { 
                turn: this.state.currentTurn, 
                total: this.state.totalTurns 
            });
            
            this.updateUI(); 
            this.generateQuestion();
        },
        
        generateQuestion() {
            const { difficulty, countingRange } = this.state.settings;
            const config = this.ModeConfig[difficulty];
            const range = this.gameData.countingRanges[countingRange];
            this.state.correctAnswer = this.getRandomInt(range.minItems, range.maxItems);
            
            const turnType = config.turnTypes.includes('random')
                ? (Math.random() < 0.5 ? 'numeral-to-object' : 'object-to-numeral')
                : config.turnTypes[0];
            
            this.state.currentTurnType = turnType;
            
            this.Debug.logGameFlow('生成題目', { 
                turnType, 
                answer: this.state.correctAnswer 
            });
            
            if (turnType === 'numeral-to-object-drop') {
                this.renderDropTurn();
            } else if (turnType === 'numeral-to-object') {
                this.renderNumeralToObjectTurn();
            } else {
                this.renderObjectToNumeralTurn();
            }
        },

        // ==========================================
        //  <<< 渲染邏輯 (Rendering Logic) >>>
        // ==========================================
        renderDropTurn() {
            const { difficulty, theme } = this.state.settings;
            const config = this.ModeConfig[difficulty];
            const correctAnswer = this.state.correctAnswer;

            // 清空所有區域
            Object.values(this.elements).forEach(el => el && (el.innerHTML = ''));
            
            // 簡單模式：重置數字顯示
            if (difficulty === 'easy') {
                this.updateCountDisplay(0);
            }

            const itemIcon = this.getRandomItem(theme);
            const itemName = this.getItemName(itemIcon);
            
            // 渲染數字提示 (下方)
            this.elements.promptArea.innerHTML = this.HTMLTemplates.promptNumeral(correctAnswer);

            // 渲染物品來源 (上方)
            let sourceItemCount;
            if (difficulty === 'hard') {
                // 困難模式：提供更多干擾項（增加挑戰性）
                sourceItemCount = correctAnswer + this.getRandomInt(7, 10);
            } else {
                // 簡單和普通模式
                sourceItemCount = correctAnswer + this.getRandomInt(3, 5);
            }
            
            this.elements.itemSourceArea.innerHTML = Array.from({ length: sourceItemCount }, (_, i) => 
                this.HTMLTemplates.sourceItem(itemIcon, i)
            ).join('');

            // 依難度渲染放置區 (中間)
            if (difficulty === 'easy') {
                this.elements.placementArea.innerHTML = Array.from({ length: correctAnswer }, (_, i) => 
                    this.HTMLTemplates.placementSlot(i)
                ).join('');
            }

            // 渲染完成按鈕 (如果需要)
            if (config.uiElements.showCompletionButton) {
                this.elements.completionArea.innerHTML = this.HTMLTemplates.completeButton();
            }
            
            // 設置觸控拖拽支援（在內容生成後）
            if (difficulty === 'easy') {
                setTimeout(() => {
                    this.setupTouchDragSupport();
                }, 100); // 短暫延遲確保DOM更新完成
            }
            
            // 播放語音提示
            setTimeout(() => {
                this.Speech.speak('initialInstruction', difficulty, config, { 
                    answer: correctAnswer, 
                    itemName 
                });
            }, 500);
        },

        renderNumeralToObjectTurn() {
            const { theme, difficulty } = this.state.settings;
            const config = this.ModeConfig[difficulty];
            const correctAnswer = this.state.correctAnswer;
            
            // 清空區域
            this.elements.promptArea.innerHTML = '';
            this.elements.selectionArea.innerHTML = '';
            this.elements.completionArea.innerHTML = '';
            
            const availableIcons = [...this.gameData.themes[theme]];
            const correctIcon = availableIcons[this.getRandomInt(0, availableIcons.length - 1)];
            
            // 渲染提示數字
            this.elements.promptArea.innerHTML = this.HTMLTemplates.promptNumeral(correctAnswer);
            
            // 生成選項物品
            const items = [];
            for (let i = 0; i < correctAnswer; i++) {
                items.push({ icon: correctIcon, isCorrect: true });
            }
            
            // 添加干擾項
            const distractorCount = this.getRandomInt(3, 8);
            const otherIcons = availableIcons.filter(icon => icon !== correctIcon);
            for (let i = 0; i < distractorCount; i++) {
                const distractorIcon = otherIcons[this.getRandomInt(0, otherIcons.length - 1)];
                items.push({ icon: distractorIcon, isCorrect: false });
            }
            
            this.shuffleArray(items);
            
            this.elements.selectionArea.innerHTML = items.map((item, index) => 
                this.HTMLTemplates.selectionObject(item.icon, index)
            ).join('');
            
            this.elements.completionArea.innerHTML = this.HTMLTemplates.completeButton();
            
            setTimeout(() => {
                this.Speech.speak('initialInstruction_numeral', difficulty, config, { 
                    answer: correctAnswer 
                });
            }, 500);
        },

        renderObjectToNumeralTurn() {
            const { theme, difficulty } = this.state.settings;
            const config = this.ModeConfig[difficulty];
            const correctAnswer = this.state.correctAnswer;
            
            // 清空區域
            this.elements.promptArea.innerHTML = '';
            this.elements.selectionArea.innerHTML = '';
            this.elements.completionArea.innerHTML = '';
            
            const availableIcons = [...this.gameData.themes[theme]];
            const correctIcon = availableIcons[this.getRandomInt(0, availableIcons.length - 1)];
            const itemName = this.getItemName(correctIcon);
            
            this.elements.promptArea.innerHTML = this.HTMLTemplates.promptObjects(correctIcon, correctAnswer);
            
            const rangeConfig = this.gameData.countingRanges[this.state.settings.countingRange];
            const options = [correctAnswer];
            
            while (options.length < config.optionsCount) {
                const wrongOption = this.getRandomInt(rangeConfig.minItems, rangeConfig.maxItems);
                if (!options.includes(wrongOption)) {
                    options.push(wrongOption);
                }
            }
            
            this.shuffleArray(options);
            
            this.elements.selectionArea.innerHTML = options.map(num => 
                this.HTMLTemplates.selectionNumeral(num)
            ).join('');
            
            setTimeout(() => {
                this.Speech.speak('initialInstruction_object', difficulty, config, { 
                    itemName 
                });
            }, 500);
        },
        
        // ============================================
        //  <<< 互動邏輯 (Interaction Logic) >>>
        // ============================================
        handleActionClick(event) {
            console.log('🚨 [雙擊除錯] handleActionClick 被呼叫', { target: event.target, type: event.target.dataset?.type });
            
            if (this.state.isAnswering) {
                console.log('⏸️ [雙擊除錯] 遊戲正在回答中，忽略點擊');
                return;
            }
            
            const target = event.target;
            const type = target.dataset.type;

            // 檢查是否啟用點擊移動功能，如果是則優先使用新的點擊邏輯
            const difficulty = this.state.settings?.difficulty;
            const config = this.ModeConfig[difficulty];
            const useClickToMove = config?.clickToMoveConfig?.enabled;
            
            console.log('🔧 [雙擊除錯] handleActionClick 路由檢查', {
                difficulty: difficulty,
                hasConfig: !!config,
                clickToMoveConfig: config?.clickToMoveConfig,
                useClickToMove: useClickToMove,
                targetType: type
            });

            if (target.id === 'complete-btn') {
                const count = this.elements.placementArea ? this.elements.placementArea.children.length : this.state.selectedItems.length;
                this.checkAnswer(count);
            } else if (type === 'source-item') {
                console.log('🎯 [雙擊除錯] 處理 source-item 點擊', { useClickToMove: useClickToMove });
                if (useClickToMove) {
                    console.log('➡️ [雙擊除錯] 路由到新的點擊移動邏輯 (handleItemClick)');
                    // 使用新的點擊移動邏輯：點擊選擇而非直接放置
                    this.handleItemClick(event);
                } else {
                    console.log('➡️ [雙擊除錯] 路由到傳統邏輯 (handleItemPlacement)');
                    // 傳統邏輯：直接放置
                    this.handleItemPlacement(target);
                }
            } else if (type === 'placed-item') {
                if (useClickToMove) {
                    // 使用新的點擊移動邏輯：點擊取回
                    this.handleItemClick(event);
                } else {
                    // 傳統邏輯：直接取回
                    this.handleItemReturn(target);
                }
            } else if (type === 'placement-slot') {
                if (useClickToMove) {
                    // 使用新的點擊移動邏輯：點擊放置選中物品
                    this.handleItemClick(event);
                } else if (target.classList.contains('filled')) {
                    // 傳統邏輯：只有填充的槽才能取回
                    this.handleItemReturn(target);
                }
            } else if (type === 'object') {
                target.classList.toggle('selected');
                this.Audio.playSound('select', this.state.settings.difficulty, this.ModeConfig[this.state.settings.difficulty]);
                this.state.selectedItems = Array.from(
                    this.elements.selectionArea.querySelectorAll('.selection-object.selected')
                ).map(el => el.dataset.icon);
            } else if (type === 'numeral') {
                const selectedValue = parseInt(target.dataset.value);
                this.checkAnswer(selectedValue);
            } else {
                // 🔧 [修復] 處理點擊到子元素的情況，向上查找父元素
                console.log('🔍 [雙擊除錯] 目標元素沒有直接的 data-type，嘗試查找父元素');
                const parentSourceItem = target.closest('.source-item');
                const parentPlacedItem = target.closest('.placed-item');
                const parentPlacementSlot = target.closest('.placement-slot');
                
                console.log('🔍 [雙擊除錯] 父元素查找結果', {
                    parentSourceItem: !!parentSourceItem,
                    parentPlacedItem: !!parentPlacedItem,
                    parentPlacementSlot: !!parentPlacementSlot
                });
                
                if (parentSourceItem && useClickToMove) {
                    console.log('✅ [雙擊除錯] 找到父層 source-item，路由到點擊移動邏輯');
                    // 創建一個模擬事件，目標設為父元素
                    const mockEvent = { ...event, target: parentSourceItem };
                    this.handleItemClick(mockEvent);
                } else if (parentSourceItem) {
                    console.log('✅ [雙擊除錯] 找到父層 source-item，路由到傳統邏輯');
                    this.handleItemPlacement(parentSourceItem);
                } else if (parentPlacedItem && useClickToMove) {
                    console.log('✅ [雙擊除錯] 找到父層 placed-item，路由到點擊移動邏輯');
                    const mockEvent = { ...event, target: parentPlacedItem };
                    this.handleItemClick(mockEvent);
                } else if (parentPlacedItem) {
                    console.log('✅ [雙擊除錯] 找到父層 placed-item，路由到傳統邏輯');
                    this.handleItemReturn(parentPlacedItem);
                } else if (parentPlacementSlot && useClickToMove) {
                    console.log('✅ [雙擊除錯] 找到父層 placement-slot，路由到點擊移動邏輯');
                    const mockEvent = { ...event, target: parentPlacementSlot };
                    this.handleItemClick(mockEvent);
                } else {
                    console.log('❌ [雙擊除錯] 未找到任何有效的父元素');
                }
            }
        },

        handleItemPlacement(sourceItem) {
            console.log('🚀 [雙擊除錯] handleItemPlacement 開始執行', {
                sourceItem: sourceItem,
                display: sourceItem.style.display,
                difficulty: this.state.settings.difficulty
            });
            
            if (sourceItem.style.display === 'none') {
                console.log('❌ [雙擊除錯] 來源物品已隱藏，跳過放置');
                return;
            }
            
            const { difficulty } = this.state.settings;
            const config = this.ModeConfig[difficulty];
            
            console.log('🔊 [雙擊除錯] 播放放置音效', { difficulty, config: !!config });
            this.Audio.playSound('select', difficulty, config);

            if (difficulty === 'easy') {
                console.log('🟢 [雙擊除錯] 簡單模式放置邏輯');
                const emptySlot = this.elements.placementArea.querySelector('.placement-slot:not(.filled)');
                console.log('🔍 [雙擊除錯] 查找空槽位', { emptySlot: !!emptySlot });
                
                if (emptySlot) {
                    console.log('✅ [雙擊除錯] 找到空槽位，開始放置物品');
                    // 簡單模式：讓物品從來源區完全消失
                    sourceItem.style.display = 'none';
                    console.log('👻 [雙擊除錯] 隱藏來源物品');
                    
                    emptySlot.classList.add('filled');
                    emptySlot.innerHTML = this.renderIcon(sourceItem.dataset.icon);
                    emptySlot.dataset.sourceIndex = sourceItem.dataset.index;
                    console.log('🎯 [雙擊除錯] 槽位填充完成', {
                        icon: sourceItem.dataset.icon,
                        sourceIndex: sourceItem.dataset.index
                    });
                    const count = this.elements.placementArea.querySelectorAll('.filled').length;
                    
                    // 更新數字顯示
                    this.updateCountDisplay(count);
                    
                    this.playCountingVoice(count, config, () => {
                        if (count === this.state.correctAnswer) this.checkAnswer(count);
                    });
                }
            } else if (difficulty === 'normal' || difficulty === 'hard') {
                // 普通模式和困難模式：讓物品完全消失
                sourceItem.style.display = 'none';
                this.elements.placementArea.insertAdjacentHTML('beforeend', 
                    this.HTMLTemplates.placedItem(sourceItem.dataset.icon, sourceItem.dataset.index));
                const count = this.elements.placementArea.children.length;
                
                // 根據配置決定是否播放數量語音
                if (config.countingVoice) {
                    this.playCountingVoice(count, config); // 普通模式播放語音
                }
                // 困難模式 (countingVoice: false) 不播放語音
            }
        },

        handleItemReturn(placedItem) {
            const sourceIndex = placedItem.dataset.sourceIndex;
            const sourceItem = this.elements.itemSourceArea.querySelector(`.source-item[data-index="${sourceIndex}"]`);
            if (sourceItem) {
                this.Audio.playSound('click', this.state.settings.difficulty, this.ModeConfig[this.state.settings.difficulty]);
                
                if (this.state.settings.difficulty === 'easy') {
                    // 簡單模式：讓物品重新顯示在來源區
                    sourceItem.style.display = '';
                    placedItem.classList.remove('filled');
                    placedItem.innerHTML = '';
                    delete placedItem.dataset.sourceIndex;
                } else if (this.state.settings.difficulty === 'normal' || this.state.settings.difficulty === 'hard') {
                    // 普通模式和困難模式：讓物品重新顯示在來源區
                    sourceItem.style.display = '';
                    placedItem.remove(); // 從放置區移除
                }
            }
        },
        
        // 帶語音的物品返回處理
        handleItemReturnWithVoice(placedItem) {
            const sourceIndex = placedItem.dataset.sourceIndex;
            const sourceItem = this.elements.itemSourceArea.querySelector(`.source-item[data-index="${sourceIndex}"]`);
            if (sourceItem) {
                const { difficulty } = this.state.settings;
                const config = this.ModeConfig[difficulty];
                
                this.Audio.playSound('click', difficulty, config);
                
                if (difficulty === 'easy') {
                    // 簡單模式：讓物品重新顯示在來源區
                    sourceItem.style.display = '';
                    placedItem.classList.remove('filled');
                    placedItem.innerHTML = '';
                    delete placedItem.dataset.sourceIndex;
                    
                    // 計算剩餘數量並更新顯示
                    const remainingCount = this.elements.placementArea.querySelectorAll('.filled').length;
                    this.updateCountDisplay(remainingCount);
                    
                    if (remainingCount > 0) {
                        this.playCountingVoice(remainingCount, config);
                    }
                } else if (difficulty === 'normal' || difficulty === 'hard') {
                    // 普通模式和困難模式：讓物品重新顯示在來源區
                    sourceItem.style.display = '';
                    placedItem.remove(); // 從放置區移除
                    
                    // 計算剩餘數量，根據配置決定是否播放語音
                    const remainingCount = this.elements.placementArea.children.length;
                    if (remainingCount > 0 && config.countingVoice) {
                        this.playCountingVoice(remainingCount, config); // 只有普通模式播放語音
                    }
                }
            }
        },

        // =====================================================
        // 點擊操作處理方法
        // =====================================================
        
        handleItemClick(event) {
            console.log('🎯 [雙擊除錯] handleItemClick 被呼叫', { event: event.type, target: event.target });
            
            const difficulty = this.state.settings?.difficulty;
            if (!difficulty) {
                console.log('❌ [雙擊除錯] 無法獲取難度設定');
                this.Debug.logUserAction('無法獲取難度設定，跳過點擊處理');
                return;
            }
            
            console.log('🔧 [雙擊除錯] 取得難度配置', { difficulty });
            const config = this.ModeConfig[difficulty];
            if (!config) {
                console.log('❌ [雙擊除錯] 無法獲取模式配置', { difficulty });
                this.Debug.logUserAction('無法獲取模式配置，跳過點擊處理', { difficulty });
                return;
            }
            
            // 檢查是否啟用點擊移動功能
            console.log('🔍 [雙擊除錯] 檢查點擊移動功能狀態', { 
                enabled: config.clickToMoveConfig?.enabled,
                config: config.clickToMoveConfig 
            });
            if (!config.clickToMoveConfig?.enabled) {
                console.log('⚠️ [雙擊除錯] 點擊移動功能未啟用');
                this.Debug.logUserAction('點擊移動功能未啟用', { difficulty });
                return;
            }
            
            this.Debug.logUserAction('處理物品點擊事件', { target: event.target });
            
            // 找到實際的可操作元素
            console.log('🔍 [雙擊除錯] 尋找可操作元素', { originalTarget: event.target });
            let clickedElement = event.target.closest('.source-item, .placed-item, .placement-slot');
            
            if (!clickedElement) {
                console.log('❌ [雙擊除錯] 未找到有效的操作元素');
                this.Debug.logUserAction('點擊位置不是有效的操作元素');
                return;
            }
            
            console.log('✅ [雙擊除錯] 找到可點擊元素', { 
                element: clickedElement, 
                classes: clickedElement.className,
                dataIndex: clickedElement.dataset.index,
                dataIcon: clickedElement.dataset.icon
            });
            this.Debug.logUserAction('找到可點擊元素', { 
                element: clickedElement, 
                classes: clickedElement.className 
            });
            
            // 判斷點擊的是什麼類型的元素
            if (clickedElement.classList.contains('placed-item')) {
                console.log('🔙 [雙擊除錯] 處理已放置物品點擊');
                // 點擊已放置的物品 - 嘗試取回
                this.handleClickToReturn(clickedElement, event);
            } else if (clickedElement.classList.contains('source-item')) {
                console.log('🎯 [雙擊除錯] 處理源區域物品點擊 - 路由到 handleClickToPlace');
                // 點擊源區域的物品 - 嘗試選擇
                this.handleClickToPlace(clickedElement, event);
            } else if (clickedElement.classList.contains('placement-slot')) {
                console.log('📍 [雙擊除錯] 處理放置槽點擊');
                // 點擊放置槽 - 嘗試放置選中的物品
                this.handleSlotClick(clickedElement, event);
            }
        },

        handleClickToPlace(sourceItem, event) {
            const difficulty = this.state.settings?.difficulty;
            const config = this.ModeConfig[difficulty];
            
            console.log('🎯 [雙擊除錯] handleClickToPlace 被呼叫', {
                sourceItem: sourceItem,
                difficulty: difficulty,
                config: config?.clickToMoveConfig
            });
            
            if (!config) {
                this.Debug.logUserAction('無法獲取配置，跳過點擊放置');
                console.error('❌ [雙擊除錯] 無法獲取配置', { difficulty });
                return;
            }
            
            if (!config.clickToMoveConfig?.allowClickToPlace) {
                this.Debug.logUserAction('此模式不允許點擊放置');
                console.error('❌ [雙擊除錯] 此模式不允許點擊放置', { config: config.clickToMoveConfig });
                return;
            }
            
            // 雙擊檢測邏輯
            const currentTime = Date.now();
            const isSameElement = this.state.lastClickedElement === sourceItem;
            const isWithinDoubleClickTime = (currentTime - this.state.lastClickTime) < this.state.doubleClickDelay;
            const timeDiff = currentTime - this.state.lastClickTime;
            
            console.log('🔍 [雙擊除錯] 雙擊檢測狀態', {
                currentTime: currentTime,
                lastClickTime: this.state.lastClickTime,
                timeDiff: timeDiff,
                doubleClickDelay: this.state.doubleClickDelay,
                isSameElement: isSameElement,
                isWithinDoubleClickTime: isWithinDoubleClickTime,
                lastClickedElement: this.state.lastClickedElement,
                currentElement: sourceItem
            });
            
            if (isSameElement && isWithinDoubleClickTime) {
                // 這是第二次點擊（雙擊），執行放置
                console.log('✅ [雙擊除錯] 偵測到雙擊，準備執行放置');
                
                this.state.clickCount = 0;
                this.state.lastClickTime = 0;
                this.state.lastClickedElement = null;
                
                this.Debug.logUserAction('偵測到雙擊，執行放置', {
                    element: sourceItem,
                    index: sourceItem.dataset.index,
                    icon: sourceItem.dataset.icon
                });
                
                // 清除選擇狀態（如果有的話）
                this.clearItemSelection();
                
                console.log('🔄 [雙擊除錯] 呼叫 handleItemPlacement', { sourceItem });
                
                // 執行放置邏輯
                this.handleItemPlacement(sourceItem);
                
                console.log('✅ [雙擊除錯] handleItemPlacement 已執行完成');
                
                // 🔧 [修改] 雙擊放置後播放數量語音（與拖曳放置相同）
                // 不需要額外的語音回饋，因為 handleItemPlacement 內部已經處理了數量語音
            } else {
                // 這是第一次點擊，僅選擇物品
                console.log('🔵 [雙擊除錯] 第一次點擊，選擇物品');
                
                this.state.clickCount = 1;
                this.state.lastClickTime = currentTime;
                this.state.lastClickedElement = sourceItem;
                
                console.log('🔄 [雙擊除錯] 更新狀態', {
                    clickCount: this.state.clickCount,
                    lastClickTime: this.state.lastClickTime,
                    lastClickedElement: this.state.lastClickedElement
                });
                
                // 清除之前的選擇
                console.log('🧹 [雙擊除錯] 清除之前的選擇');
                this.clearItemSelection();
                
                // 標記為選中
                console.log('🎯 [雙擊除錯] 標記物品為選中', { 
                    element: sourceItem,
                    icon: sourceItem.dataset.icon,
                    index: sourceItem.dataset.index 
                });
                sourceItem.classList.add('selected-item');
                this.state.selectedClickItem = {
                    element: sourceItem,
                    index: sourceItem.dataset.index,
                    icon: sourceItem.dataset.icon,
                    type: 'source-item'
                };
                
                this.Debug.logUserAction('第一次點擊，物品已選擇', {
                    element: sourceItem,
                    index: sourceItem.dataset.index,
                    icon: sourceItem.dataset.icon
                });
                
                // 音效和語音回饋
                console.log('🔊 [雙擊除錯] 檢查音效回饋', { audioFeedback: config.clickToMoveConfig.audioFeedback });
                if (config.clickToMoveConfig.audioFeedback) {
                    console.log('🎵 [雙擊除錯] 播放選擇音效');
                    this.Audio.playSound('select', difficulty, config);
                }
                
                // 🔧 [修改] 移除第一次點擊的語音提示，只保留音效
                console.log('🎙️ [雙擊除錯] 第一次點擊：不播放語音提示');
                // 移除語音回饋，使用者體驗更流暢
            }
        },

        handleClickToReturn(placedItem, event) {
            const difficulty = this.state.settings?.difficulty;
            const config = this.ModeConfig[difficulty];
            
            if (!config) {
                this.Debug.logUserAction('無法獲取配置，跳過點擊取回');
                return;
            }
            
            if (!config.clickToMoveConfig?.allowClickToReturn) {
                this.Debug.logUserAction('此模式不允許點擊取回');
                return;
            }
            
            this.Debug.logUserAction('嘗試點擊取回物品', { element: placedItem });
            
            // 🔧 [修改] 呼叫取回邏輯，會自動播放數量語音（與拖曳取回相同）
            this.handleItemReturnWithVoice(placedItem);
            
            // 移除額外的語音回饋，因為 handleItemReturnWithVoice 已經處理了數量語音
        },

        handleSlotClick(slot, event) {
            const difficulty = this.state.settings?.difficulty;
            const config = this.ModeConfig[difficulty];
            
            if (!config) {
                this.Debug.logUserAction('無法獲取配置，跳過槽點擊');
                return;
            }
            
            this.Debug.logUserAction('點擊空槽，但需要先選擇物品', { slot });
            
            // 檢查是否為簡單模式且槽已填滿
            if (difficulty === 'easy' && slot.classList.contains('filled')) {
                this.Debug.logUserAction('簡單模式槽已填滿，無法放置');
                return;
            }
            
            // 點擊空槽時，可以提供提示
            if (config.clickToMoveConfig.speechFeedback) {
                this.Speech.speak('clickToPlace', difficulty, config);
            }
        },

        clearItemSelection() {
            console.log('🧹 [雙擊除錯] clearItemSelection 被呼叫', {
                hasSelectedItem: !!this.state.selectedClickItem,
                selectedItem: this.state.selectedClickItem
            });
            
            if (this.state.selectedClickItem) {
                console.log('🔄 [雙擊除錯] 移除選中樣式', {
                    element: this.state.selectedClickItem.element,
                    hasSelectedClass: this.state.selectedClickItem.element.classList.contains('selected-item')
                });
                this.state.selectedClickItem.element.classList.remove('selected-item');
                this.state.selectedClickItem = null;
                console.log('✅ [雙擊除錯] 選擇狀態已清除');
                this.Debug.logUserAction('清除物品選擇狀態');
            } else {
                console.log('ℹ️ [雙擊除錯] 沒有選中的物品需要清除');
            }
        },

        getItemName(icon) {
            // 簡化版本的物品名稱對應
            const itemNames = {
                '🍎': '蘋果', '🍌': '香蕉', '🍇': '葡萄', '🍓': '草莓', '🍊': '橘子',
                '🐶': '小狗', '🐱': '小貓', '🐭': '老鼠', '🐰': '兔子', '🦊': '狐狸',
                '🚗': '汽車', '🚕': '計程車', '🚌': '公車', '🚓': '警車', '🚑': '救護車'
            };
            return itemNames[icon] || '物品';
        },
        
        checkAnswer(userAnswer) {
            this.state.isAnswering = true;
            const isCorrect = userAnswer === this.state.correctAnswer;
            
            this.Debug.logUserAction('檢查答案', { 
                userAnswer, 
                correctAnswer: this.state.correctAnswer, 
                isCorrect 
            });

            const { difficulty, testMode } = this.state.settings;
            const config = this.ModeConfig[difficulty];

            if (isCorrect) {
                this.state.score += 10;
                this.updateUI();
                
                // 先播放答對音效和動畫
                this.Audio.playSound('correct', difficulty, config);
                this.triggerConfetti();
                
                // 稍等一下讓音效和動畫播放，然後播放語音
                setTimeout(() => {
                    this.Speech.speak('correct', difficulty, config, { 
                        answer: this.state.correctAnswer 
                    }, () => {
                        // 語音播放完畢後進入下一題
                        setTimeout(() => this.startNewTurn(), config.timing.nextQuestionDelay);
                    });
                }, 500);
                
            } else {
                this.Audio.playSound('error', difficulty, config);
                
                if (testMode === 'retry') {
                    this.Speech.speak('incorrect', difficulty, config, {}, () => {
                        setTimeout(() => this.clearDropBoard(), 500);
                    });
                } else {
                    this.Speech.speak('incorrectWithAnswer', difficulty, config, { 
                        answer: this.state.correctAnswer 
                    }, () => {
                        setTimeout(() => this.startNewTurn(), config.timing.nextQuestionDelay);
                    });
                }
            }
        },

        clearDropBoard() {
            if (this.elements.itemSourceArea) {
                // 所有模式：讓所有隱藏的物品重新顯示
                this.elements.itemSourceArea.querySelectorAll('.source-item').forEach(el => {
                    el.style.display = '';
                    el.classList.remove('used'); // 移除舊的used類別（如果有的話）
                });
            }
            if (this.elements.placementArea) {
                this.elements.placementArea.innerHTML = '';
                if (this.state.settings.difficulty === 'easy') {
                    this.elements.placementArea.innerHTML = Array.from({ length: this.state.correctAnswer }, (_, i) => 
                        this.HTMLTemplates.placementSlot(i)
                    ).join('');
                    
                    // 重新設置觸控拖拽支援
                    setTimeout(() => {
                        this.setupTouchDragSupport();
                    }, 100);
                    
                    // 重置數字顯示
                    this.updateCountDisplay(0);
                }
            }
            this.state.isAnswering = false;
        },

        // ============================================
        //  <<< 拖放邏輯 (Drag & Drop Logic) >>>
        // ============================================
        setupDragAndDrop() {
            // 觸控拖拽支援會在問題生成後設置
            
            if (this.elements.itemSourceArea) {
                this.elements.itemSourceArea.addEventListener('dragstart', e => {
                    const item = e.target.closest('.source-item');
                    if (item && item.style.display !== 'none') {
                        e.dataTransfer.setData('text/plain', item.dataset.index);
                        e.dataTransfer.setData('source', 'item-source');
                        item.style.opacity = '0.5';
                    } else {
                        e.preventDefault();
                    }
                });
            }

            if (this.elements.placementArea) {
                // 為放置區域添加拖放事件處理
                this.elements.placementArea.addEventListener('dragstart', e => {
                    const placedItem = e.target.closest('.placed-item');
                    if (placedItem) {
                        e.dataTransfer.setData('text/plain', placedItem.dataset.sourceIndex);
                        e.dataTransfer.setData('source', 'placement-area');
                        placedItem.style.opacity = '0.5';
                    }
                });
                
                this.elements.placementArea.addEventListener('dragover', e => e.preventDefault());
                this.elements.placementArea.addEventListener('dragenter', e => {
                    if (e.target.classList.contains('placement-area') || e.target.classList.contains('placement-slot')) {
                        e.target.classList.add('drag-over');
                    }
                });
                this.elements.placementArea.addEventListener('dragleave', e => {
                    if (e.target.classList.contains('placement-area') || e.target.classList.contains('placement-slot')) {
                        e.target.classList.remove('drag-over');
                    }
                });
                this.elements.placementArea.addEventListener('drop', e => {
                    e.preventDefault();
                    e.target.classList.remove('drag-over');
                    const sourceIndex = e.dataTransfer.getData('text/plain');
                    const dragSource = e.dataTransfer.getData('source');
                    
                    if (dragSource === 'item-source') {
                        // 從物品來源區拖拽
                        const sourceItem = this.elements.itemSourceArea.querySelector(`.source-item[data-index="${sourceIndex}"]`);
                        if (sourceItem) {
                            sourceItem.style.opacity = '1';
                            
                            if (this.state.settings.difficulty === 'easy') {
                                const slot = e.target.closest('.placement-slot');
                                if (slot && !slot.classList.contains('filled')) {
                                    this.handleItemPlacement(sourceItem);
                                }
                            } else {
                                this.handleItemPlacement(sourceItem);
                            }
                        }
                    }
                });
            }
            
            // 為物品來源區添加接收拖拽的功能
            if (this.elements.itemSourceArea) {
                this.elements.itemSourceArea.addEventListener('dragover', e => e.preventDefault());
                this.elements.itemSourceArea.addEventListener('dragenter', e => {
                    if (e.target.classList.contains('item-source-area')) {
                        e.target.classList.add('drag-over');
                    }
                });
                this.elements.itemSourceArea.addEventListener('dragleave', e => {
                    if (e.target.classList.contains('item-source-area')) {
                        e.target.classList.remove('drag-over');
                    }
                });
                this.elements.itemSourceArea.addEventListener('drop', e => {
                    e.preventDefault();
                    e.target.classList.remove('drag-over');
                    const sourceIndex = e.dataTransfer.getData('text/plain');
                    const dragSource = e.dataTransfer.getData('source');
                    
                    if (dragSource === 'placement-area') {
                        // 從放置區拖拽回來
                        const placedItem = this.elements.placementArea.querySelector(`.placed-item[data-source-index="${sourceIndex}"]`);
                        if (placedItem) {
                            placedItem.style.opacity = '1';
                            this.handleItemReturnWithVoice(placedItem);
                        }
                    }
                });
            }
        },
        
        // =====================================================
        // 🔧 工具函數 & 遊戲結束
        // =====================================================
        playCountingVoice(count, config, callback) {
            this.Debug.logSpeech('播放計數語音', count);
            if (!config.speechFeedback) { 
                if (callback) callback(); 
                return; 
            }
            
            this.Speech.synth.cancel();
            const utterance = new SpeechSynthesisUtterance(count.toString());
            utterance.voice = this.Speech.voice;
            utterance.rate = 1.0;
            utterance.lang = this.Speech.voice?.lang || 'zh-TW';
            
            if (callback) utterance.onend = callback;
            this.Speech.synth.speak(utterance);
        },
        
        // 更新數字顯示
        updateCountDisplay(count) {
            if (this.elements.countDisplay) {
                this.elements.countDisplay.textContent = count;
                
                // 添加更新動畫
                this.elements.countDisplay.classList.add('updated');
                setTimeout(() => {
                    this.elements.countDisplay.classList.remove('updated');
                }, 300);
            }
        },
        
        triggerConfetti() {
            if (typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7']
                });
            }
        },
        
        endGame() {
            this.Debug.logGameFlow('遊戲結束', { score: this.state.score });
            
            const { difficulty } = this.state.settings;
            const config = this.ModeConfig[difficulty];
            
            this.triggerConfetti();
            setTimeout(() => this.triggerConfetti(), 500);
            
            this.Speech.speak('gameComplete', difficulty, config, { 
                score: this.state.score 
            });

            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="unit-welcome">
                    <div class="welcome-content">
                        <h1>🎉 遊戲完成！</h1>
                        <div class="final-score">
                            <h2>最終得分：${this.state.score} 分</h2>
                            <p>答對率：${Math.round((this.state.score / (this.state.totalTurns * 10)) * 100)}%</p>
                        </div>
                        <div class="game-buttons">
                            <button class="start-btn" onclick="Game.showSettings()">重新開始</button>
                            <button class="back-btn" onclick="window.location.href='index.html'">返回主選單</button>
                        </div>
                    </div>
                </div>
                <style>
                    .final-score { 
                        text-align: center; margin: 30px 0; padding: 20px; 
                        background: #e8f5e8; border-radius: 15px; 
                        border: 2px solid #28a745;
                    }
                    .final-score h2 { 
                        font-size: 2.5em; color: #28a745; margin-bottom: 10px;
                    }
                </style>
            `;
        },
        
        updateUI() {
            const progressInfo = document.getElementById('progress-info');
            const scoreInfo = document.getElementById('score-info');
            
            if (progressInfo) {
                progressInfo.textContent = `第 ${this.state.currentTurn}/${this.state.totalTurns} 題`;
            }
            if (scoreInfo) {
                scoreInfo.textContent = `分數: ${this.state.score}`;
            }
        },
        
        getRandomInt(min, max) { 
            return Math.floor(Math.random() * (max - min + 1)) + min; 
        },
        
        getRandomItem(theme) { 
            const items = this.gameData.themes[theme];
            return items[this.getRandomInt(0, items.length - 1)];
        },
        
        // 檢測是否為自訂圖片（base64格式）
        isCustomImage(icon) {
            return typeof icon === 'string' && icon.startsWith('data:image/');
        },
        
        // 渲染圖示（支援自訂圖片）
        renderIcon(icon, className = '', style = '') {
            const isCustom = this.isCustomImage(icon);
            if (isCustom) {
                return `<img src="${icon}" class="custom-icon ${className}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; pointer-events: none; user-select: none; ${style}" alt="自訂圖示">`;
            } else {
                return `<span class="emoji-icon ${className}" style="${style}">${icon}</span>`;
            }
        },
        
        // 獲取物品名稱（支援自訂主題）
        getItemName(icon) {
            // 先檢查是否為自訂圖片
            if (this.isCustomImage(icon)) {
                const customItem = this.state.customItems.find(item => item.icon === icon);
                return customItem ? customItem.name : '自訂物品';
            }
            // 使用預設物品名稱
            return this.gameData.itemNames[icon] || '物品';
        },
        
        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        },

        // =====================================================
        // 🎨 自訂主題圖片上傳功能 - 配置驅動 (仿f1_object_correspondence)
        // =====================================================
        triggerImageUpload() {
            this.Debug.logUserAction('觸發圖片上傳');
            
            const modal = document.getElementById('image-preview-modal');
            if (modal) {
                modal.classList.remove('show');
            }
            
            const fileInput = document.getElementById('custom-image');
            if (fileInput) {
                fileInput.click();
            }
        },

        handleImageUpload(event) {
            this.Debug.logUserAction('處理圖片上傳');
            const file = event.target.files[0];
            
            if (!file) {
                this.Debug.logUserAction('沒有選擇檔案');
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
                this.showImagePreview(e.target.result, file);
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
                icon: this.tempImageData,
                id: Date.now()
            };
            
            this.state.customItems.push(customItem);
            
            // 更新自訂主題的圖示陣列
            this.gameData.themes.custom.push(this.tempImageData);
            
            // 不再使用itemNames，改用getItemName方法
            
            // 播放語音回饋
            const { difficulty } = this.state.settings;
            const config = this.ModeConfig[difficulty] || this.ModeConfig.easy;
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
                const imageIndex = this.gameData.themes.custom.indexOf(item.icon);
                if (imageIndex > -1) {
                    this.gameData.themes.custom.splice(imageIndex, 1);
                }
                
                // 播放語音回饋
                const { difficulty } = this.state.settings;
                const config = this.ModeConfig[difficulty] || this.ModeConfig.easy;
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
        },

        // 設置觸控拖拽支援
        setupTouchDragSupport() {
            console.log('🎯 [F3-數字辨識] 檢查 TouchDragUtility 狀態', {
                touchUtilityExists: !!window.TouchDragUtility,
                touchUtilityType: typeof window.TouchDragUtility
            });
            
            if (!window.TouchDragUtility) {
                console.error('❌ [F3-數字辨識] TouchDragUtility 未載入，觸控拖曳功能無法使用');
                return;
            }
            
            const gameArea = document.getElementById('app');
            if (!gameArea) return;
            
            console.log('✅ [F3-數字辨識] TouchDragUtility 已載入，開始註冊觸控拖曳');

            // 註冊可拖拽元素
            window.TouchDragUtility.registerDraggable(
                gameArea,
                '.source-item:not([style*="display: none"]), .placed-item',
                {
                    onDragStart: (element, event) => {
                        const sourceItem = element.closest('.source-item');
                        const placedItem = element.closest('.placed-item');
                        
                        // 檢查是否為有效的拖拽元素
                        if (sourceItem && sourceItem.style.display === 'none') {
                            return false;
                        }
                        
                        // 設置視覺反饋
                        element.style.opacity = '0.5';
                        
                        console.log('🎯 開始觸控拖拽:', sourceItem ? '來源項目' : '已放置項目');
                        return true;
                    },
                    onDrop: (draggedElement, dropZone, event) => {
                        const sourceItem = draggedElement.closest('.source-item');
                        const placedItem = draggedElement.closest('.placed-item');
                        
                        // 創建合成的放置事件
                        const syntheticDropEvent = {
                            target: dropZone,
                            preventDefault: () => {},
                            stopPropagation: () => {},
                            dataTransfer: {
                                getData: (type) => {
                                    if (type === 'text/plain') {
                                        return sourceItem ? sourceItem.dataset.index : placedItem?.dataset.sourceIndex;
                                    }
                                    if (type === 'source') {
                                        return sourceItem ? 'item-source' : 'placement-area';
                                    }
                                    return '';
                                }
                            }
                        };
                        
                        // 處理放置到不同區域，優先檢查精確槽位
                        const placementSlot = dropZone.closest('.placement-slot');
                        const placementArea = dropZone.closest('.placement-area');
                        const itemSourceArea = dropZone.closest('.item-source-area');
                        
                        if (placementSlot && !placementSlot.classList.contains('filled')) {
                            console.log('🎯 觸控放置到空白槽位');
                            this.handlePlacementSlotDrop(syntheticDropEvent, placementSlot);
                        } else if (placementArea) {
                            console.log('🎯 觸控放置到放置區域');
                            this.handlePlacementAreaDrop(syntheticDropEvent);
                        } else if (itemSourceArea) {
                            console.log('🎯 觸控放置到來源區域');
                            this.handleItemSourceAreaDrop(syntheticDropEvent);
                        }
                    },
                    onDragEnd: (element, event) => {
                        // 重置視覺效果
                        element.style.opacity = '1';
                        
                        // 清除所有 drag-over 樣式
                        document.querySelectorAll('.placement-area.drag-over, .item-source-area.drag-over').forEach(el => {
                            el.classList.remove('drag-over');
                        });
                    }
                }
            );

            // 註冊精確放置槽位
            this.registerPlacementSlots();
            if (this.elements.itemSourceArea) {
                window.TouchDragUtility.registerDropZone(this.elements.itemSourceArea, () => true);
            }
        },

        // 註冊精確的放置槽位作為觸控放置區域
        registerPlacementSlots() {
            // 使用 document 來搜尋放置槽位
            const placementSlots = document.querySelectorAll('.placement-slot:not(.filled)');
            console.log(`🎯 註冊 ${placementSlots.length} 個空白放置槽位`);
            
            placementSlots.forEach((slot, index) => {
                window.TouchDragUtility.registerDropZone(slot, (draggedElement, dropZone) => {
                    // 只允許放置到空白槽位
                    const isFilled = dropZone.classList.contains('filled');
                    console.log(`🎯 檢查槽位 ${index}: 已填充=${isFilled}`);
                    return !isFilled;
                });
            });
            
            // 也註冊整個放置區域作為備用
            if (this.elements.placementArea) {
                window.TouchDragUtility.registerDropZone(this.elements.placementArea, () => true);
            }
        },

        // 檢查放置區域完成度
        checkPlacementCompletion() {
            const placedItems = this.elements.placementArea.querySelectorAll('.placed-item');
            const targetCount = this.state.correctAnswer;
            
            console.log(`🎯 檢查完成度: 已放置=${placedItems.length}, 目標=${targetCount}`);
            
            if (placedItems.length === targetCount) {
                // 自動提交答案
                this.checkAnswer(placedItems.length);
            }
        },

        // 處理放置到特定槽位
        handlePlacementSlotDrop(event, targetSlot) {
            const sourceIndex = parseInt(event.dataTransfer.getData('text/plain'));
            const source = event.dataTransfer.getData('source');
            
            if (source === 'item-source' && !targetSlot.classList.contains('filled')) {
                console.log(`🎯 放置項目到特定槽位: index=${sourceIndex}`);
                // 直接放置到指定槽位
                this.moveItemToSpecificSlot(sourceIndex, targetSlot);
            }
            
            // 清除樣式
            targetSlot.classList.remove('drag-over');
            this.elements.placementArea.classList.remove('drag-over');
        },

        // 處理放置到放置區域
        handlePlacementAreaDrop(event) {
            const sourceIndex = parseInt(event.dataTransfer.getData('text/plain'));
            const source = event.dataTransfer.getData('source');
            
            if (source === 'item-source') {
                // 從來源區域拖拽到放置區域
                this.moveItemFromSourceToPlacement(sourceIndex);
            }
            
            // 清除樣式
            this.elements.placementArea.classList.remove('drag-over');
        },

        // 處理放置到來源區域
        handleItemSourceAreaDrop(event) {
            const sourceIndex = parseInt(event.dataTransfer.getData('text/plain'));
            const source = event.dataTransfer.getData('source');
            
            if (source === 'placement-area') {
                // 從放置區域拖拽回來源區域
                this.moveItemFromPlacementToSource(sourceIndex);
            }
            
            // 清除樣式
            this.elements.itemSourceArea.classList.remove('drag-over');
        },

        // 將項目從來源區域移動到放置區域
        moveItemFromSourceToPlacement(sourceIndex) {
            const sourceItems = this.elements.itemSourceArea.querySelectorAll('.source-item');
            const targetItem = Array.from(sourceItems).find(item => 
                parseInt(item.dataset.index) === sourceIndex && item.style.display !== 'none'
            );
            
            if (!targetItem) {
                console.error('找不到要移動的來源項目:', sourceIndex);
                return;
            }

            // 隱藏來源項目
            targetItem.style.display = 'none';

            // 在放置區域創建項目
            this.createPlacedItem(sourceIndex, targetItem.innerHTML);
            
            // 播放放置音效
            this.Audio.playSound('select', this.state.settings.difficulty, this.ModeConfig[this.state.settings.difficulty]);

            // 檢查是否完成
            this.checkPlacementCompletion();
        },

        // 將項目移動到特定槽位（精確放置）
        moveItemToSpecificSlot(sourceIndex, targetSlot) {
            const targetItem = this.elements.itemSourceArea.children[sourceIndex];
            if (!targetItem || targetSlot.classList.contains('filled')) return;

            console.log(`🎯 精確放置: 項目${sourceIndex} -> 指定槽位`);

            // 標記槽位為已填充
            targetSlot.classList.add('filled');
            
            // 創建放置項目並添加到指定槽位
            const placedItem = document.createElement('div');
            placedItem.className = 'placed-item';
            placedItem.innerHTML = targetItem.innerHTML;
            placedItem.setAttribute('data-source-index', sourceIndex);
            
            // 清空槽位並添加新項目
            targetSlot.innerHTML = '';
            targetSlot.appendChild(placedItem);

            // 隱藏來源項目
            targetItem.style.visibility = 'hidden';
            
            // 播放放置音效
            this.Audio.playSound('select', this.state.settings.difficulty, this.ModeConfig[this.state.settings.difficulty]);

            // 檢查是否完成
            this.checkPlacementCompletion();
        },

        // 將項目從放置區域移動回來源區域
        moveItemFromPlacementToSource(sourceIndex) {
            // 移除放置區域的項目
            const placedItems = this.elements.placementArea.querySelectorAll('.placed-item');
            const targetPlacedItem = Array.from(placedItems).find(item => 
                parseInt(item.dataset.sourceIndex) === sourceIndex
            );
            
            if (targetPlacedItem) {
                targetPlacedItem.remove();
            }

            // 顯示來源區域的項目
            const sourceItems = this.elements.itemSourceArea.querySelectorAll('.source-item');
            const targetSourceItem = Array.from(sourceItems).find(item => 
                parseInt(item.dataset.index) === sourceIndex
            );
            
            if (targetSourceItem) {
                targetSourceItem.style.display = '';
            }
        },

        // 創建已放置的項目
        createPlacedItem(sourceIndex, innerHTML) {
            const placedItem = document.createElement('div');
            placedItem.className = 'placed-item';
            placedItem.dataset.sourceIndex = sourceIndex;
            placedItem.draggable = true;
            placedItem.innerHTML = innerHTML;
            
            this.elements.placementArea.appendChild(placedItem);
        }
    };

    Game.init();
});