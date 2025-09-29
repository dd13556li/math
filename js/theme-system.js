// =================================================================
// FILE: js/theme-system.js - 主題切換系統（修正版）
// =================================================================

/**
 * 主題管理系統
 * 支援生動活潑模式和深色護眼模式的切換
 * 包含本地儲存、跨頁面同步、無障礙支援等功能
 */

class ThemeSystem {
    constructor() {
        // 主題配置
        this.themes = {
            'ai-robot': {
                name: 'ai-robot',
                displayName: 'AI機器人',
                icon: '🤖',
                description: '溫暖友善的機器人助教，陪伴學習金錢知識'
            },
            dark: {
                name: 'dark',
                displayName: '深色護眼',
                icon: '🌙',
                description: '柔和深色調，減少眼部疲勞'
            }
        };

        // 預設主題
        this.defaultTheme = 'ai-robot';
        
        // 當前主題
        this.currentTheme = this.defaultTheme;
        
        // 主題切換器元素
        this.switcher = null;
        
        // 事件監聽器
        this.listeners = new Set();
        
        // 語音防重複機制
        this.lastSpeechTime = 0;
        this.speechDebounceDelay = 1000; // 1秒內不重複播放
        
        // 主題切換器最小化狀態
        this.isMinimized = false;
        
        // 初始化
        this.init();
    }

    /**
     * 初始化主題系統
     */
    init() {
        // console.log('開始初始化主題系統...');
        
        try {
            // 載入儲存的主題設定
            this.loadThemeFromStorage();
            
            // 檢測系統偏好設定
            this.detectSystemPreference();
            
            // 應用主題
            this.applyTheme(this.currentTheme);
            
            // 監聽系統主題變化
            this.watchSystemThemeChange();
            
            // 監聽存儲變化（跨頁面同步）
            this.watchStorageChange();
            
            // 延遲建立主題切換器，確保 DOM 完全載入
            if (document.readyState === 'complete') {
                // DOM 已完全載入
                this.createThemeSwitcher();
            } else {
                // 等待 DOM 完全載入
                window.addEventListener('load', () => {
                    this.createThemeSwitcher();
                });
                
                // 備用方案：延時建立
                setTimeout(() => {
                    if (!document.querySelector('.theme-switcher') && !document.getElementById('theme-fallback-btn')) {
                        this.createThemeSwitcher();
                    }
                }, 500);
            }
            
            // console.log('主題系統初始化完成，當前主題:', this.currentTheme);
            
        } catch (error) {
            console.error('主題系統初始化失敗:', error);
        }
    }

    /**
     * 從本地儲存載入主題設定
     */
    loadThemeFromStorage() {
        try {
            const savedTheme = localStorage.getItem('money-tutor-theme');
            if (savedTheme && this.themes[savedTheme]) {
                this.currentTheme = savedTheme;
            }
        } catch (error) {
            console.warn('無法載入主題設定:', error);
        }
    }

    /**
     * 檢測系統偏好設定
     */
    detectSystemPreference() {
        // 如果沒有儲存的偏好設定，則使用系統偏好
        if (!localStorage.getItem('money-tutor-theme')) {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.currentTheme = 'dark';
            }
        }
    }

    /**
     * 監聽系統主題變化
     */
    watchSystemThemeChange() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const handleChange = (e) => {
                // 只有在用戶沒有手動設定時才跟隨系統
                if (!localStorage.getItem('money-tutor-theme-manual')) {
                    const newTheme = e.matches ? 'dark' : 'vibrant';
                    this.setTheme(newTheme, false); // false 表示不是手動設定
                }
            };

            // 新版 API
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleChange);
            } 
            // 舊版 API 回退
            else if (mediaQuery.addListener) {
                mediaQuery.addListener(handleChange);
            }
        }
    }

    /**
     * 監聽儲存變化（跨頁面同步）
     */
    watchStorageChange() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'money-tutor-theme' && e.newValue !== this.currentTheme) {
                this.setTheme(e.newValue, false);
            }
        });
    }

    /**
     * 應用主題
     * @param {string} themeName 主題名稱
     */
    applyTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn('未知的主題:', themeName);
            return;
        }

        // 添加過渡動畫類別
        document.documentElement.classList.add('theme-transitioning');

        // 設定主題屬性
        if (themeName === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        // 更新當前主題
        this.currentTheme = themeName;

        // 更新主題切換器狀態
        this.updateSwitcherState();

        // 儲存到本地存儲
        this.saveThemeToStorage();

        // 觸發主題變化事件
        this.notifyThemeChange(themeName);

        // 移除過渡動畫類別
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
        }, 300);

        // console.log('主題已切換至:', this.themes[themeName].displayName);
    }

    /**
     * 設定主題
     * @param {string} themeName 主題名稱
     * @param {boolean} isManual 是否為手動設定
     */
    setTheme(themeName, isManual = true) {
        if (!this.themes[themeName] || themeName === this.currentTheme) {
            return;
        }

        // 記錄是否為手動設定
        if (isManual) {
            localStorage.setItem('money-tutor-theme-manual', 'true');
        }

        // 應用主題
        this.applyTheme(themeName);

        // 播放切換音效（如果有音效系統）
        this.playThemeSwitchSound();

        // 語音提示（如果啟用）
        this.announceThemeChange(themeName);
    }

    /**
     * 切換主題
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'ai-robot' ? 'dark' : 'ai-robot';
        this.setTheme(newTheme);
    }

    /**
     * 建立主題切換器組件
     */
    createThemeSwitcher() {
        try {
            // 檢查是否在主題設定頁面
            if (window.location.pathname.includes('color-palette-manager.html')) {
                console.log('在主題設定頁面，跳過建立主題切換器');
                return;
            }

            // 檢查是否已存在
            if (document.querySelector('.theme-switcher')) {
                console.log('主題切換器已存在，跳過建立');
                return;
            }

            // 檢查 body 是否存在
            if (!document.body) {
                console.warn('document.body 不存在，延遲建立主題切換器');
                setTimeout(() => this.createThemeSwitcher(), 100);
                return;
            }

            // console.log('正在建立主題切換器...');

            // 建立主題切換器 HTML（包含吸管工具和拖拽功能）
            const switcherHTML = `
                <div class="theme-switcher" role="region" aria-label="主題切換">
                    <div class="theme-switcher-header">
                        <div class="theme-switcher-drag-handle" 
                             title="拖拽移動主題切換器"
                             style="cursor: move; padding: 4px; text-align: center; background: rgba(0,0,0,0.1); border-radius: 4px 4px 0 0; user-select: none; flex: 1;">
                            <span style="font-size: 12px; opacity: 0.7;">⋮⋮</span>
                        </div>
                        <div class="theme-switcher-minimize-btn" 
                             title="點擊縮小視窗"
                             style="cursor: pointer; padding: 4px 8px; background: rgba(0,0,0,0.1); border-radius: 0 4px 0 0; user-select: none; font-size: 12px;">
                            <span style="opacity: 0.7;">−</span>
                        </div>
                    </div>
                    
                    <div class="theme-switcher-content">
                        <div class="theme-toggle" 
                             role="button" 
                             tabindex="0"
                             aria-label="切換主題模式"
                             aria-describedby="theme-tooltip">
                            
                            <div class="theme-option" data-theme="ai-robot">
                                <span class="theme-option-icon">🤖</span>
                                <span class="theme-option-text">AI機器人</span>
                            </div>
                            
                            <div class="theme-option" data-theme="dark">
                                <span class="theme-option-icon">🌙</span>
                                <span class="theme-option-text">護眼</span>
                            </div>
                        </div>
                        
                        <div class="color-picker-tool" 
                             role="button" 
                             tabindex="0"
                             aria-label="顏色吸管工具"
                             title="點擊啟用吸管工具，然後點擊頁面任何元素獲取顏色代碼">
                            <span class="picker-icon">🎨</span>
                            <span class="picker-text">吸管</span>
                        </div>
                        
                        <div class="color-info-display" id="color-info" style="display: none;">
                            <div class="color-code" id="color-code">#000000</div>
                            <div class="color-sample" id="color-sample"></div>
                            <button class="copy-color-btn" id="copy-color-btn" title="複製顏色代碼">📋</button>
                        </div>
                        
                        <div class="calculator-section">
                            <button class="calculator-btn" id="calculator-btn" title="開啟計算機">🧮</button>
                        </div>
                        
                        <div class="theme-switcher-tooltip" id="theme-tooltip" role="tooltip">
                            點擊切換主題模式、使用吸管工具或開啟計算機
                        </div>
                    </div>
                </div>
            `;

            // 添加到頁面
            document.body.insertAdjacentHTML('beforeend', switcherHTML);
            
            // 添加主題切換器的基本樣式
            const switcherStyles = `
                <style>
                .theme-switcher-header {
                    display: flex;
                    align-items: center;
                    background: rgba(0,0,0,0.1);
                    border-radius: 4px 4px 0 0;
                }
                
                .theme-switcher-content {
                    transition: all 0.3s ease;
                    overflow: hidden;
                }
                
                .theme-switcher.minimized .theme-switcher-content {
                    height: 0;
                    opacity: 0;
                }
                
                .theme-switcher.minimized .theme-switcher-minimize-btn span {
                    transform: rotate(180deg);
                    display: inline-block;
                }
                
                /* 主題切換區域整體布局 - 統一管理 */
                .theme-switcher .theme-toggle {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 140px;
                    height: 48px;
                    padding: 4px;
                    margin: 0 auto 8px auto;
                    background: var(--primary-color);
                    border-radius: var(--radius-large);
                    position: relative;
                    cursor: pointer;
                    transition: all var(--transition-normal);
                    gap: 0;
                }
                
                /* 滑動背景 - 默認AI機器人位置 */
                .theme-switcher .theme-toggle::before {
                    content: '';
                    position: absolute;
                    width: 66px;
                    height: 40px;
                    background: var(--background-card);
                    border-radius: var(--radius-medium);
                    transition: all var(--transition-normal);
                    box-shadow: var(--shadow-light);
                    left: 4px;
                    top: 4px;
                    z-index: 0;
                }
                
                /* 強制重置所有可能的定位衝突 */
                .theme-switcher .theme-toggle::before {
                    transform: none;
                    right: auto;
                }
                
                /* AI機器人主題時的背景位置 */
                .theme-switcher[data-current-theme="ai-robot"] .theme-toggle::before {
                    left: 4px !important;
                }
                
                /* 深色主題時的背景位置 - 多重選擇器確保生效 */
                .theme-switcher[data-current-theme="dark"] .theme-toggle::before {
                    left: 70px !important; /* 調整為正確的右側位置 */
                }
                
                [data-theme="dark"] .theme-switcher .theme-toggle::before {
                    left: 70px !important;
                }
                
                /* 更高權重的選擇器 */
                html .theme-switcher[data-current-theme="dark"] .theme-toggle::before {
                    left: 70px !important;
                }
                
                /* 主題選項設計 - 對稱分佈 */
                .theme-switcher .theme-option {
                    width: 66px;
                    height: 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    position: absolute;
                    z-index: 1;
                    font-weight: bold;
                    color: var(--text-inverse);
                    transition: all var(--transition-normal);
                    border-radius: var(--radius-medium);
                    cursor: pointer;
                    margin: 0;
                    padding: 0;
                    top: 4px;
                }
                
                /* AI機器人選項定位 */
                .theme-switcher .theme-option:first-of-type {
                    left: 4px;
                }
                
                /* 護眼模式選項定位 */
                .theme-switcher .theme-option:last-of-type {
                    left: 70px;
                }
                
                .theme-switcher .theme-option.active {
                    color: var(--primary-color);
                }
                
                .theme-switcher .theme-option-icon {
                    font-size: 18px;
                    margin-bottom: 1px;
                    display: block;
                    line-height: 1;
                }
                
                .theme-switcher .theme-option-text {
                    font-size: 9px;
                    font-weight: bold;
                    display: block;
                    white-space: nowrap;
                    line-height: 1;
                }
                
                /* 吸管工具與主題選項的間距 */
                .color-picker-tool {
                    margin-top: 12px;
                    padding: 8px;
                    border-top: 1px solid rgba(0,0,0,0.1);
                }
                
                /* 計算機按鈕樣式 */
                .calculator-section {
                    padding: 8px;
                    border-top: 1px solid rgba(0,0,0,0.1);
                    text-align: center;
                }
                
                .calculator-btn {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    width: 100%;
                }
                
                .calculator-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }
                
                .calculator-btn:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                </style>
            `;
            
            if (!document.getElementById('theme-switcher-styles')) {
                const styleElement = document.createElement('div');
                styleElement.id = 'theme-switcher-styles';
                styleElement.innerHTML = switcherStyles;
                document.head.appendChild(styleElement);
            }

            // 獲取切換器元素
            this.switcher = document.querySelector('.theme-switcher');
            if (!this.switcher) {
                throw new Error('無法找到新建立的主題切換器');
            }

            const toggle = this.switcher.querySelector('.theme-toggle');
            if (!toggle) {
                throw new Error('無法找到主題切換按鈕');
            }

            // 綁定事件
            this.bindSwitcherEvents(toggle);
            
            // 綁定最小化按鈕事件
            this.bindMinimizeEvents();
            
            // 初始化拖拽功能
            this.initializeDragFunctionality();
            
            // 初始化吸管工具
            this.initializeColorPicker();
            
            // 初始化計算機
            this.initializeCalculator();

            // 初始化狀態
            this.updateSwitcherState();
            
            // 恢復最小化狀態
            this.loadMinimizedState();

            // console.log('主題切換器建立成功');

        } catch (error) {
            console.error('建立主題切換器時發生錯誤:', error);
            
            // 備用方案：手動建立簡單的切換器
            this.createFallbackSwitcher();
        }
    }

    /**
     * 建立備用的簡單主題切換器
     */
    createFallbackSwitcher() {
        try {
            console.log('正在建立備用主題切換器...');
            
            const fallbackButton = document.createElement('button');
            fallbackButton.id = 'theme-fallback-btn';
            fallbackButton.textContent = '🌈/🌙';
            fallbackButton.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                font-size: 18px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            `;
            
            fallbackButton.onclick = () => this.toggleTheme();
            fallbackButton.setAttribute('aria-label', '切換主題');
            fallbackButton.setAttribute('title', '切換主題 (Ctrl+T)');
            
            document.body.appendChild(fallbackButton);
            
            console.log('備用主題切換器建立成功');
            
        } catch (error) {
            console.error('建立備用切換器也失敗:', error);
        }
    }

    /**
     * 綁定最小化按鈕事件
     */
    bindMinimizeEvents() {
        const minimizeBtn = this.switcher.querySelector('.theme-switcher-minimize-btn');
        if (!minimizeBtn) return;
        
        minimizeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMinimize();
        });
    }
    
    /**
     * 切換最小化狀態
     */
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        
        if (this.isMinimized) {
            this.switcher.classList.add('minimized');
        } else {
            this.switcher.classList.remove('minimized');
        }
        
        // 保存最小化狀態
        try {
            localStorage.setItem('theme-switcher-minimized', this.isMinimized.toString());
        } catch (error) {
            console.warn('無法保存最小化狀態:', error);
        }
    }
    
    /**
     * 從localStorage載入最小化狀態
     */
    loadMinimizedState() {
        try {
            const savedMinimizedState = localStorage.getItem('theme-switcher-minimized');
            if (savedMinimizedState === 'true') {
                this.isMinimized = true;
                this.switcher.classList.add('minimized');
            }
        } catch (error) {
            console.warn('無法載入最小化狀態:', error);
        }
    }
    
    /**
     * 綁定切換器事件
     * @param {HTMLElement} toggle 切換器元素
     */
    bindSwitcherEvents(toggle) {
        // 點擊事件
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleTheme();
            
            // 添加點擊動畫
            toggle.classList.add('theme-switching');
            setTimeout(() => {
                toggle.classList.remove('theme-switching');
            }, 300);
        });

        // 鍵盤事件
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // 全域鍵盤快捷鍵（僅在非主題設定頁面啟用）
        if (!window.location.pathname.includes('color-palette-manager.html')) {
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 't') {
                    e.preventDefault();
                    this.toggleTheme();
                    
                    // 聚焦到切換器
                    toggle.focus();
                }
            });
        }
    }

    /**
     * 初始化拖拽功能
     */
    initializeDragFunctionality() {
        if (!this.switcher) return;
        
        const dragHandle = this.switcher.querySelector('.theme-switcher-drag-handle');
        if (!dragHandle) return;
        
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        // 從localStorage恢復位置
        const savedPosition = this.getSavedPosition();
        if (savedPosition) {
            // 確保位置數值是有效的
            xOffset = parseFloat(savedPosition.x) || 0;
            yOffset = parseFloat(savedPosition.y) || 0;
            this.switcher.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
        }
        
        // 定義拖拽函數
        const dragStart = (e) => {
            if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
            
            if (e.target === dragHandle) {
                isDragging = true;
                // 添加拖拽樣式
                this.switcher.style.cursor = 'grabbing';
                this.switcher.style.zIndex = '10000';
            }
        };
        
        const drag = (e) => {
            if (isDragging) {
                e.preventDefault();
                
                if (e.type === 'touchmove') {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }
                
                // 限制拖拽範圍在視窗內
                // 獲取元素當前的尺寸（不包含 transform 的影響）
                const computedStyle = window.getComputedStyle(this.switcher);
                const switcherWidth = this.switcher.offsetWidth;
                const switcherHeight = this.switcher.offsetHeight;
                
                // 計算原始位置（CSS中的 right: 20px, top: 20px）
                // 原始left位置 = 視窗寬度 - 元素寬度 - right值(20px)
                const originalLeft = window.innerWidth - switcherWidth - 20;
                const originalTop = 20;
                
                // 計算目標位置
                const targetLeft = originalLeft + currentX;
                const targetTop = originalTop + currentY;
                
                // 邊界限制
                const minLeft = 0;  // 不能超出左邊界
                const maxLeft = window.innerWidth - switcherWidth;  // 不能超出右邊界
                const minTop = 0;   // 不能超出上邊界
                const maxTop = window.innerHeight - switcherHeight; // 不能超出下邊界
                
                // 應用邊界限制
                const clampedLeft = Math.max(minLeft, Math.min(maxLeft, targetLeft));
                const clampedTop = Math.max(minTop, Math.min(maxTop, targetTop));
                
                // 計算實際的偏移量
                xOffset = clampedLeft - originalLeft;
                yOffset = clampedTop - originalTop;
                
                // 立即應用變換
                this.switcher.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
                
                // 調試信息已關閉以提升性能
                // if (Math.abs(currentX) > 100 || Math.abs(currentY) > 100) {
                //     console.log('拖拽調試:', {
                //         windowWidth: window.innerWidth,
                //         switcherWidth,
                //         originalLeft,
                //         currentX,
                //         targetLeft,
                //         clampedLeft,
                //         xOffset
                //     });
                // }
            }
        };
        
        const dragEnd = (e) => {
            if (isDragging) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                
                // 恢復樣式
                this.switcher.style.cursor = '';
                this.switcher.style.zIndex = '9999';
                
                // 保存位置
                this.savePosition(xOffset, yOffset);
            }
        };
        
        // 綁定事件
        dragHandle.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        // 觸控事件
        dragHandle.addEventListener('touchstart', dragStart);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', dragEnd);
    }
    
    /**
     * 保存拖拽位置到localStorage
     */
    savePosition(x, y) {
        try {
            localStorage.setItem('theme-switcher-position', JSON.stringify({ x, y }));
        } catch (error) {
            console.warn('無法保存主題切換器位置:', error);
        }
    }
    
    /**
     * 從localStorage獲取保存的位置
     */
    getSavedPosition() {
        try {
            const saved = localStorage.getItem('theme-switcher-position');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.warn('無法載入主題切換器位置:', error);
            return null;
        }
    }

    /**
     * 更新切換器狀態
     */
    updateSwitcherState() {
        if (!this.switcher) return;

        // 更新主題切換器的 data-current-theme 屬性
        this.switcher.setAttribute('data-current-theme', this.currentTheme);
        // console.log('主題切換器狀態更新:', this.currentTheme, this.switcher.getAttribute('data-current-theme'));

        const options = this.switcher.querySelectorAll('.theme-option');
        options.forEach(option => {
            const themeName = option.dataset.theme;
            if (themeName === this.currentTheme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // 更新 ARIA 屬性
        const toggle = this.switcher.querySelector('.theme-toggle');
        const currentThemeInfo = this.themes[this.currentTheme];
        toggle.setAttribute('aria-label', 
            `當前主題: ${currentThemeInfo.displayName}，點擊切換`);
    }

    /**
     * 儲存主題到本地存儲
     */
    saveThemeToStorage() {
        try {
            localStorage.setItem('money-tutor-theme', this.currentTheme);
        } catch (error) {
            console.warn('無法儲存主題設定:', error);
        }
    }

    /**
     * 播放主題切換音效
     */
    playThemeSwitchSound() {
        try {
            // 檢查是否有全域音效系統
            if (window.Game && window.Game.audio && window.Game.audio.play) {
                // 使用遊戲音效系統
                window.Game.audio.play('dropSound');
            } else {
                // 建立簡單的音效
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            }
        } catch (error) {
            // 音效播放失敗，不影響功能
            console.log('主題切換音效播放失敗:', error);
        }
    }

    /**
     * 語音提示主題變化
     * @param {string} themeName 主題名稱
     */
    announceThemeChange(themeName) {
        try {
            // 防重複播放檢查
            const currentTime = Date.now();
            if (currentTime - this.lastSpeechTime < this.speechDebounceDelay) {
                console.log('語音提示被防重複機制跳過');
                return;
            }
            this.lastSpeechTime = currentTime;

            // 檢查是否有全域語音系統
            if (window.Game && window.Game.speech && window.Game.speech.speak) {
                const themeInfo = this.themes[themeName];
                window.Game.speech.speak(`已切換至${themeInfo.displayName}模式`);
            } else if (window.speechSynthesis) {
                // 停止所有正在進行的語音
                window.speechSynthesis.cancel();
                
                // 使用瀏覽器內建語音，優先使用自然語音
                const utterance = new SpeechSynthesisUtterance();
                utterance.text = `已切換至${this.themes[themeName].displayName}模式`;
                utterance.lang = 'zh-TW';
                utterance.rate = 1.0; // 標準語速（與F1統一）
                utterance.volume = 0.6;
                
                // 嘗試選擇最佳的中文語音
                const voices = window.speechSynthesis.getVoices();
                const chineseVoices = voices.filter(voice => 
                    voice.lang.includes('zh') || voice.lang.includes('TW') ||
                    voice.name.includes('Chinese') || 
                    voice.name.includes('Mandarin') ||
                    voice.name.includes('Yating') ||
                    voice.name.includes('Microsoft')
                );
                
                if (chineseVoices.length > 0) {
                    // 優先選擇Microsoft Yating或其他自然語音
                    const naturalVoice = chineseVoices.find(voice => 
                        voice.name.includes('Yating') ||
                        voice.name.includes('Microsoft') ||
                        voice.name.includes('Natural')
                    ) || chineseVoices[0];
                    
                    utterance.voice = naturalVoice;
                    console.log('使用語音:', naturalVoice.name);
                }
                
                window.speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.log('主題切換語音提示失敗:', error);
        }
    }

    /**
     * 註冊主題變化監聽器
     * @param {Function} callback 回調函數
     */
    onThemeChange(callback) {
        if (typeof callback === 'function') {
            this.listeners.add(callback);
        }
    }

    /**
     * 移除主題變化監聽器
     * @param {Function} callback 回調函數
     */
    offThemeChange(callback) {
        this.listeners.delete(callback);
    }

    /**
     * 通知主題變化
     * @param {string} themeName 新主題名稱
     */
    notifyThemeChange(themeName) {
        const themeInfo = this.themes[themeName];
        
        // 觸發自定義事件
        const event = new CustomEvent('themechange', {
            detail: {
                theme: themeName,
                themeInfo: themeInfo,
                previousTheme: this.previousTheme
            }
        });
        
        document.dispatchEvent(event);

        // 呼叫註冊的監聽器
        this.listeners.forEach(callback => {
            try {
                callback(themeName, themeInfo);
            } catch (error) {
                console.error('主題變化監聽器錯誤:', error);
            }
        });

        // 記錄前一個主題
        this.previousTheme = this.currentTheme;
    }

    /**
     * 獲取當前主題資訊
     * @returns {Object} 主題資訊
     */
    getCurrentTheme() {
        return {
            name: this.currentTheme,
            ...this.themes[this.currentTheme]
        };
    }

    /**
     * 獲取所有可用主題
     * @returns {Object} 主題列表
     */
    getAvailableThemes() {
        return { ...this.themes };
    }

    /**
     * 檢查是否為深色主題
     * @returns {boolean} 是否為深色主題
     */
    isDarkMode() {
        return this.currentTheme === 'dark';
    }

    /**
     * 重設為預設主題
     */
    resetToDefault() {
        this.setTheme(this.defaultTheme);
        localStorage.removeItem('money-tutor-theme-manual');
    }

    /**
     * 初始化顏色吸管工具
     */
    initializeColorPicker() {
        if (!this.switcher) return;

        const colorPickerTool = this.switcher.querySelector('.color-picker-tool');
        const colorInfo = this.switcher.querySelector('#color-info');
        const colorCode = this.switcher.querySelector('#color-code');
        const colorSample = this.switcher.querySelector('#color-sample');
        const copyBtn = this.switcher.querySelector('#copy-color-btn');

        if (!colorPickerTool) return;

        // 儲存原始狀態
        this.colorPickerState = {
            isActive: false,
            originalCursor: document.body.style.cursor,
            colorInfo: colorInfo,
            colorCode: colorCode,
            colorSample: colorSample,
            tool: colorPickerTool
        };

        // 點擊吸管工具按鈕
        colorPickerTool.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (!this.colorPickerState.isActive) {
                // 啟用吸管模式
                this.colorPickerState.isActive = true;
                colorPickerTool.classList.add('active');
                document.body.style.cursor = 'crosshair';
                colorInfo.style.display = 'none';
                
                // 創建並存儲綁定函數引用
                this.boundColorPickHandler = this.handleColorPick.bind(this);
                this.boundPreviewHandler = this.handleColorPreview.bind(this);
                this.boundKeyHandler = this.handleKeyPress.bind(this);
                
                // 添加全域監聽器
                document.addEventListener('click', this.boundColorPickHandler, true);
                document.addEventListener('mousemove', this.boundPreviewHandler);
                document.addEventListener('keydown', this.boundKeyHandler);
                
                console.log('吸管工具已啟用');
            } else {
                // 停用吸管模式
                this.deactivateColorPicker();
            }
        });

        // 複製顏色代碼按鈕
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const colorValue = colorCode.textContent;
                
                console.log('準備複製顏色代碼:', colorValue);
                
                // 優先使用現代 Clipboard API
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(colorValue).then(() => {
                        console.log('現代API複製成功');
                        this.showToast('顏色代碼已複製: ' + colorValue);
                    }).catch((err) => {
                        console.log('現代API複製失敗，使用後備方法:', err);
                        this.fallbackCopyToClipboard(colorValue);
                    });
                } else {
                    console.log('使用後備複製方法');
                    this.fallbackCopyToClipboard(colorValue);
                }
            });
        }
    }

    /**
     * 處理顏色拾取點擊事件
     */
    handleColorPick(e) {
        // 檢查是否點擊的是主題切換器或其子元素
        if (e.target.closest('.theme-switcher')) {
            // 如果點擊的是主題切換器，不處理顏色拾取
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const element = e.target;
        const computedStyle = window.getComputedStyle(element);
        
        // 嘗試獲取各種可能的顏色值
        let color = computedStyle.backgroundColor;
        
        // 如果背景色是透明的，嘗試獲取文字顏色
        if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
            color = computedStyle.color;
        }
        
        // 如果還是透明的，嘗試獲取邊框顏色
        if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
            color = computedStyle.borderColor;
        }

        const hexColor = this.rgbToHex(color);
        
        // 更新顏色顯示
        this.updateColorDisplay(hexColor, element);
        
        // 停用吸管模式
        this.deactivateColorPicker();
        
        console.log('拾取到顏色:', hexColor, '來自元素:', element.tagName, element.className);
    }

    /**
     * 處理滑鼠移動預覽
     */
    handleColorPreview(e) {
        if (!this.colorPickerState || !this.colorPickerState.isActive) return;
        
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (!element) return;

        // 不高亮主題切換器元素
        if (element.closest('.theme-switcher')) return;

        // 添加預覽高亮效果
        document.querySelectorAll('.color-picker-highlight').forEach(el => {
            el.classList.remove('color-picker-highlight');
        });
        
        element.classList.add('color-picker-highlight');
    }

    /**
     * 處理鍵盤按鍵
     */
    handleKeyPress(e) {
        if (!this.colorPickerState || !this.colorPickerState.isActive) return;
        
        // 按ESC鍵退出吸管模式
        if (e.key === 'Escape') {
            e.preventDefault();
            this.deactivateColorPicker();
            console.log('按ESC鍵退出吸管模式');
        }
    }

    /**
     * 停用顏色拾取器
     */
    deactivateColorPicker() {
        if (!this.colorPickerState) return;

        this.colorPickerState.isActive = false;
        this.colorPickerState.tool.classList.remove('active');
        document.body.style.cursor = this.colorPickerState.originalCursor;
        
        // 移除事件監聽器 - 使用存儲的綁定函數引用
        if (this.boundColorPickHandler) {
            document.removeEventListener('click', this.boundColorPickHandler, true);
            this.boundColorPickHandler = null;
        }
        
        if (this.boundPreviewHandler) {
            document.removeEventListener('mousemove', this.boundPreviewHandler);
            this.boundPreviewHandler = null;
        }
        
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
            this.boundKeyHandler = null;
        }
        
        // 移除高亮效果
        document.querySelectorAll('.color-picker-highlight').forEach(el => {
            el.classList.remove('color-picker-highlight');
        });
        
        console.log('吸管工具已停用');
    }

    /**
     * 更新顏色顯示
     */
    updateColorDisplay(hexColor, element) {
        if (!this.colorPickerState) return;

        const { colorInfo, colorCode, colorSample } = this.colorPickerState;
        
        colorCode.textContent = hexColor;
        colorSample.style.backgroundColor = hexColor;
        colorInfo.style.display = 'flex';
        
        // 添加元素資訊
        const elementInfo = `${element.tagName.toLowerCase()}${element.className ? '.' + element.className.split(' ').join('.') : ''}`;
        colorInfo.setAttribute('title', `顏色來源: ${elementInfo}`);
    }

    /**
     * RGB 轉 HEX
     */
    rgbToHex(rgb) {
        if (!rgb) return '#000000';
        
        // 處理 hex 顏色（已經是正確格式）
        if (rgb.startsWith('#')) return rgb;
        
        // 處理 rgb/rgba 格式
        const rgbMatch = rgb.match(/\d+/g);
        if (!rgbMatch) return '#000000';
        
        const r = parseInt(rgbMatch[0]);
        const g = parseInt(rgbMatch[1]);
        const b = parseInt(rgbMatch[2]);
        
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    }

    /**
     * 顯示提示訊息
     */
    showToast(message) {
        // 創建或更新 toast 元素
        let toast = document.getElementById('color-picker-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'color-picker-toast';
            toast.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: var(--success-color, #32CD32);
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: bold;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 2000);
    }

    /**
     * 後備複製方法
     */
    fallbackCopyToClipboard(text) {
        console.log('執行後備複製方法，文字:', text);
        
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 2em;
            height: 2em;
            padding: 0;
            border: none;
            outline: none;
            boxShadow: none;
            background: transparent;
            opacity: 0;
            z-index: -1;
        `;
        
        document.body.appendChild(textArea);
        
        // 確保元素可見和可選中
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999); // 兼容移動設備
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                console.log('後備複製成功');
                this.showToast('顏色代碼已複製: ' + text);
            } else {
                console.error('execCommand返回false');
                this.showToast('複製失敗，請手動複製: ' + text);
            }
        } catch (err) {
            console.error('複製失敗:', err);
            this.showToast('複製失敗，請手動複製: ' + text);
        }
        
        document.body.removeChild(textArea);
    }

    /**
     * 初始化計算機功能
     */
    initializeCalculator() {
        if (!this.switcher) return;

        const calculatorBtn = this.switcher.querySelector('#calculator-btn');
        if (!calculatorBtn) return;

        calculatorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showCalculator();
        });
    }

    /**
     * 顯示小計算機
     */
    showCalculator() {
        // 檢查是否已存在計算機
        if (document.getElementById('mini-calculator')) {
            document.getElementById('mini-calculator').remove();
            return;
        }

        const calculatorHTML = `
            <div id="mini-calculator" class="mini-calculator">
                <div class="calculator-header">
                    <span class="calculator-title">計算機</span>
                    <button class="calculator-close" onclick="document.getElementById('mini-calculator').remove()">×</button>
                </div>
                <div class="calculator-display">
                    <input type="text" id="calc-display" readonly value="0">
                </div>
                <div class="calculator-buttons">
                    <button onclick="window.themeSystem.clearCalculator()">C</button>
                    <button onclick="window.themeSystem.calculateResult()">=</button>
                    <button onclick="window.themeSystem.appendToCalculator('/')" class="operator">÷</button>
                    <button onclick="window.themeSystem.appendToCalculator('*')" class="operator">×</button>
                    
                    <button onclick="window.themeSystem.appendToCalculator('7')">7</button>
                    <button onclick="window.themeSystem.appendToCalculator('8')">8</button>
                    <button onclick="window.themeSystem.appendToCalculator('9')">9</button>
                    <button onclick="window.themeSystem.appendToCalculator('-')" class="operator">-</button>
                    
                    <button onclick="window.themeSystem.appendToCalculator('4')">4</button>
                    <button onclick="window.themeSystem.appendToCalculator('5')">5</button>
                    <button onclick="window.themeSystem.appendToCalculator('6')">6</button>
                    <button onclick="window.themeSystem.appendToCalculator('+')" class="operator">+</button>
                    
                    <button onclick="window.themeSystem.appendToCalculator('1')">1</button>
                    <button onclick="window.themeSystem.appendToCalculator('2')">2</button>
                    <button onclick="window.themeSystem.appendToCalculator('3')">3</button>
                    <button onclick="window.themeSystem.backspaceCalculator()" class="backspace">⌫</button>
                    
                    <button onclick="window.themeSystem.appendToCalculator('0')" class="zero">0</button>
                    <button onclick="window.themeSystem.appendToCalculator('.')">.</button>
                </div>
            </div>
        `;

        // 添加計算機樣式
        const calculatorStyles = `
            <style id="calculator-styles">
                .mini-calculator {
                    position: fixed;
                    top: 50%;
                    right: 20px;
                    transform: translateY(-50%);
                    width: 220px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    z-index: 10001;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    user-select: none;
                }

                .calculator-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 12px 12px 0 0;
                    cursor: move;
                }

                .calculator-title {
                    font-weight: bold;
                    font-size: 14px;
                }

                .calculator-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }

                .calculator-close:hover {
                    background: rgba(255,255,255,0.2);
                }

                .calculator-display {
                    padding: 16px;
                    background: #f8f9fa;
                }

                #calc-display {
                    width: 100%;
                    border: none;
                    background: white;
                    padding: 12px;
                    font-size: 18px;
                    text-align: right;
                    border-radius: 6px;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                    font-family: 'Courier New', monospace;
                }

                .calculator-buttons {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1px;
                    background: #e9ecef;
                    padding: 1px;
                    border-radius: 0 0 12px 12px;
                }

                .calculator-buttons button {
                    background: white;
                    border: none;
                    padding: 16px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-height: 48px;
                }

                .calculator-buttons button:hover {
                    background: #f8f9fa;
                    transform: scale(1.05);
                }

                .calculator-buttons button:active {
                    background: #e9ecef;
                    transform: scale(0.95);
                }

                .calculator-buttons button.operator {
                    background: #667eea;
                    color: white;
                }

                .calculator-buttons button.operator:hover {
                    background: #5a67d8;
                }

                .calculator-buttons button.zero {
                    grid-column: span 2;
                }

                .calculator-buttons button.backspace {
                    background: #ff6b6b;
                    color: white;
                }

                .calculator-buttons button.backspace:hover {
                    background: #ff5252;
                }

                @media (max-width: 768px) {
                    .mini-calculator {
                        right: 10px;
                        width: 200px;
                    }
                }
            </style>
        `;

        // 添加樣式到頁面
        if (!document.getElementById('calculator-styles')) {
            document.head.insertAdjacentHTML('beforeend', calculatorStyles);
        }

        // 添加計算機到頁面
        document.body.insertAdjacentHTML('beforeend', calculatorHTML);
        
        // 使計算機可拖拽
        this.makeCalculatorDraggable();
    }

    /**
     * 使計算機可拖拽
     */
    makeCalculatorDraggable() {
        const calculator = document.getElementById('mini-calculator');
        const header = calculator.querySelector('.calculator-header');
        
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        const dragStart = (e) => {
            if (e.target.classList.contains('calculator-close')) return;
            
            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - calculator.offsetLeft;
                initialY = e.touches[0].clientY - calculator.offsetTop;
            } else {
                initialX = e.clientX - calculator.offsetLeft;
                initialY = e.clientY - calculator.offsetTop;
            }

            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
                calculator.style.cursor = 'grabbing';
            }
        };

        const drag = (e) => {
            if (isDragging) {
                e.preventDefault();

                if (e.type === "touchmove") {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }

                calculator.style.left = currentX + "px";
                calculator.style.top = currentY + "px";
                calculator.style.right = 'auto';
                calculator.style.transform = 'none';
            }
        };

        const dragEnd = () => {
            isDragging = false;
            calculator.style.cursor = 'default';
        };

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        header.addEventListener('touchstart', dragStart);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', dragEnd);
    }

    /**
     * 計算機功能方法
     */
    appendToCalculator(value) {
        const display = document.getElementById('calc-display');
        if (!display) return;

        if (display.value === '0' && value !== '.') {
            display.value = value;
        } else {
            display.value += value;
        }
    }

    clearCalculator() {
        const display = document.getElementById('calc-display');
        if (display) display.value = '0';
    }

    backspaceCalculator() {
        const display = document.getElementById('calc-display');
        if (!display) return;

        if (display.value.length > 1) {
            display.value = display.value.slice(0, -1);
        } else {
            display.value = '0';
        }
    }

    calculateResult() {
        const display = document.getElementById('calc-display');
        if (!display) return;

        try {
            // 替換顯示符號為實際運算符號
            let expression = display.value.replace(/×/g, '*').replace(/÷/g, '/');
            
            // 安全計算（只允許數字和基本運算符）
            if (!/^[0-9+\-*/.() ]+$/.test(expression)) {
                throw new Error('無效表達式');
            }

            const result = Function('"use strict"; return (' + expression + ')')();
            display.value = Number.isFinite(result) ? result.toString() : 'Error';
        } catch (error) {
            display.value = 'Error';
        }
    }

    /**
     * 銷毀主題系統
     */
    destroy() {
        // 停用顏色拾取器
        if (this.colorPickerState && this.colorPickerState.isActive) {
            this.deactivateColorPicker();
        }

        // 移除主題切換器
        if (this.switcher) {
            this.switcher.remove();
            this.switcher = null;
        }

        // 清除監聽器
        this.listeners.clear();

        // 重設為預設主題
        document.documentElement.removeAttribute('data-theme');
        
        console.log('主題系統已銷毀');
    }
}

// =================================================================
// 主題系統工具類
// =================================================================

/**
 * 主題系統工具類
 */
class ThemeUtils {
    /**
     * 獲取當前主題的 CSS 變數值
     * @param {string} variableName CSS 變數名稱
     * @returns {string} 變數值
     */
    static getCSSVariable(variableName) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(variableName).trim();
    }

    /**
     * 設定 CSS 變數值
     * @param {string} variableName CSS 變數名稱
     * @param {string} value 變數值
     */
    static setCSSVariable(variableName, value) {
        document.documentElement.style.setProperty(variableName, value);
    }

    /**
     * 檢查瀏覽器是否支援 CSS 變數
     * @returns {boolean} 是否支援
     */
    static supportsCSSVariables() {
        return window.CSS && CSS.supports('color', 'var(--test)');
    }
}

// =================================================================
// 全域初始化
// =================================================================

// 自動初始化主題系統（如果在瀏覽器環境中）
if (typeof window !== 'undefined') {
    let themeSystem = null;

    function initializeThemeSystem() {
        try {
            // console.log('正在初始化主題系統...');
            themeSystem = new ThemeSystem();
            window.ThemeSystem = themeSystem;
            window.themeSystem = themeSystem; // 同時指派給小寫版本，供計算機使用
            window.ThemeUtils = ThemeUtils;
            // console.log('主題系統初始化完成');
        } catch (error) {
            console.error('主題系統初始化失敗:', error);
        }
    }

    // DOM 載入完成後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeThemeSystem);
    } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
        // DOM 已經載入完成，立即初始化
        initializeThemeSystem();
    } else {
        // 備用方案：延遲初始化
        setTimeout(initializeThemeSystem, 100);
    }
    
    // 提供簡單的全域函數
    window.toggleTheme = () => {
        if (window.ThemeSystem) {
            window.ThemeSystem.toggleTheme();
        }
    };

    window.setTheme = (themeName) => {
        if (window.ThemeSystem) {
            window.ThemeSystem.setTheme(themeName);
        }
    };

    window.getCurrentTheme = () => {
        if (window.ThemeSystem) {
            return window.ThemeSystem.getCurrentTheme();
        }
        return null;
    };
}

// 導出模組（支援 CommonJS 模組系統）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeSystem, ThemeUtils };
}