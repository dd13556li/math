// =================================================================
// FILE: templates/f5-quantity-comparison-templates.js - HTML模板系統
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
                        ${this.generateSettingGroup('sound', '🔊 音效設定', config.soundOptions)}
                    </div>
                    
                    <div class="game-buttons">
                        <button class="back-btn" onclick="window.location.href='../index.html'">返回主選單</button>
                        <button id="start-game-btn" class="start-btn" disabled>
                            請完成所有設定
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 遊戲頁面模板（匹配原版結構）
     */
    gameScreen(config) {
        return `
            <div class="quantity-comparison-container difficulty-${config.difficulty}">
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
                
                <!-- 遊戲區域 -->
                <div class="game-section">
                    <h3 class="section-title" id="instruction-title">⚖️ 請比較兩邊的數量，選擇正確答案</h3>
                    
                    <div class="comparison-area" id="comparison-area">
                        <div class="quantity-group left-group" id="left-group">
                            <div class="group-label">A組</div>
                            <div class="objects-container" id="left-objects"></div>
                            <div class="quantity-display" id="left-quantity"></div>
                        </div>
                        
                        <div class="comparison-symbol" id="comparison-symbol">
                            VS
                        </div>
                        
                        <div class="quantity-group right-group" id="right-group">
                            <div class="group-label">B組</div>
                            <div class="objects-container" id="right-objects"></div>
                            <div class="quantity-display" id="right-quantity"></div>
                        </div>
                    </div>
                    
                    <div class="answer-section" id="answer-section">
                        <h4 class="answer-title">請選擇A組與B組的數量關係：</h4>
                        <div class="answer-buttons" id="answer-buttons">
                            ${this.comparisonButtons()}
                        </div>
                    </div>
                    
                    <div class="control-section">
                        <div id="message-area" class="message-area"></div>
                        <div id="next-container" class="next-container"></div>
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
                <div class="btn-text">A組較多</div>
                <div class="btn-symbol">&gt;</div>
            </button>
            <button class="comparison-btn same-btn" data-comparison="same">
                <div class="btn-icon">⚖️</div>
                <div class="btn-text">一樣多</div>
                <div class="btn-symbol">=</div>
            </button>
            <button class="comparison-btn less-btn" data-comparison="less">
                <div class="btn-icon">📉</div>
                <div class="btn-text">A組較少</div>
                <div class="btn-symbol">&lt;</div>
            </button>
        `;
    },

    /**
     * 物件項目模板
     */
    objectItem(type, content, index, position) {
        return `
            <div class="object-item ${type}" 
                 data-index="${index}" 
                 style="animation-delay: ${index * 0.1}s; ${position ? `left: ${position.x}px; top: ${position.y}px;` : ''}">
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
        const objectSize = 40; // 預設物件大小
        const margin = 10;
        
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
        const objectSize = 40;
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
        const objectSize = 40;
        const spacing = Math.min(containerWidth / objects.length, 50);
        const startX = (containerWidth - (objects.length - 1) * spacing) / 2;
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
        const minDistance = objectSize + 5; // 5px 間距
        
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

// 導出模板系統
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuantityComparisonTemplates;
} else {
    window.QuantityComparisonTemplates = QuantityComparisonTemplates;
}