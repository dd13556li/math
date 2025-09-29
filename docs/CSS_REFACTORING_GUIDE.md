# CSS 重構指南：模組獨立性架構

## 📋 目標與原則

### 🎯 核心目標
- **模組獨立性**：各單元不相互影響，可獨立運行
- **樣式隔離**：避免CSS衝突和樣式洩漏
- **漸進增強**：基礎功能獨立，進階功能可選
- **維護性**：清晰的檔案組織和命名規範
- **效能優化**：按需載入，減少不必要的CSS

### 📐 設計原則
1. **命名空間隔離**：每個模組使用獨立的CSS命名空間
2. **變數作用域**：CSS變數限定在模組容器內
3. **最小依賴**：模組間依賴最小化
4. **可選增強**：主題和高級功能可選擇性載入
5. **向後相容**：重構過程中確保功能不受影響

---

## 🏗️ 目標架構

### 📁 新的檔案結構

```
css/
├── 🌐 shared/                    # 可選共用資源
│   ├── design-tokens.css         # 設計規範庫 (可選)
│   ├── css-reset-minimal.css     # 最小化重置
│   └── common-animations.css     # 通用動畫庫 (可選)
│
├── 📦 modules/                   # 完全獨立的模組
│   ├── index-page/
│   │   ├── index-core.css        # 主頁核心樣式
│   │   ├── index-theme.css       # 主題支援 (可選)
│   │   └── index-mobile.css      # 響應式 (可選)
│   │
│   ├── c1-money-types/
│   │   ├── c1-core.css          # C1核心功能樣式
│   │   ├── c1-theme.css         # 主題變數 (可選)
│   │   └── c1-mobile.css        # 手機適配 (可選)
│   │
│   ├── c3-money-exchange/
│   │   ├── c3-core.css          # C3核心樣式
│   │   ├── c3-theme.css         # 主題支援 (可選)
│   │   └── c3-mobile.css        # 響應式 (可選)
│   │
│   ├── theme-switcher/
│   │   ├── theme-switcher-core.css    # 切換器核心
│   │   ├── theme-calculator.css       # 計算機功能 (可選)
│   │   └── theme-colorpicker.css      # 顏色吸管 (可選)
│   │
│   └── [其他單元模組...]
│
└── 🗂️ legacy/                    # 過渡期保留舊檔案
    ├── ai-theme.css              # 原有檔案備份
    ├── dark-theme.css
    └── unit6.css
```

### 📏 每個模組的標準結構

**簡單單元** (F1-F3)：
```
modules/f1-object-correspondence/
├── f1-core.css          # 核心樣式 (~3-5KB)
├── f1-theme.css         # 主題變數 (~1KB) [可選]
└── f1-mobile.css        # 響應式 (~1KB) [可選]
```

**複雜單元** (C1-C5)：
```
modules/c3-money-exchange/
├── c3-core.css          # 核心樣式 (~8-12KB)
├── c3-theme.css         # 主題支援 (~2KB) [可選]
└── c3-mobile.css        # 響應式適配 (~2KB) [可選]
```

---

## 🚀 詳細實施步驟

### 階段一：準備與備份 (預估時間：1-2小時)

⚠️ **重要安全提醒**：重構前務必完成完整備份，建議使用版本控制系統

#### Step 1.1：環境檢查與準備

##### Step 1.1.1：檢查當前項目狀態
```bash
# 檢查當前目錄結構
ls -la css/

# 預期看到的現有檔案：
# ai-theme.css
# dark-theme.css
# unit6.css
# f4-number-sorting.css
# f5-quantity-comparison.css
# （可能還有其他單元CSS檔案）
```

##### Step 1.1.2：創建完整目錄結構
```bash
# Windows 環境 (使用 cmd 或 PowerShell)
md css\shared
md css\modules\index-page
md css\modules\c1-money-types
md css\modules\c2-money-counting
md css\modules\c3-money-exchange
md css\modules\c4-correct-amount
md css\modules\c5-sufficient-payment
md css\modules\f1-object-correspondence
md css\modules\f2-rote-rational-counting
md css\modules\f3-number-recognition
md css\modules\f4-number-sorting
md css\modules\f5-quantity-comparison
md css\modules\a1-simulated-shopping
md css\modules\a2-atm-simulator
md css\modules\theme-switcher
md css\legacy
md css\temp-backup

# Unix/Linux/macOS 環境
mkdir -p css/shared
mkdir -p css/modules/{index-page,c1-money-types,c2-money-counting,c3-money-exchange,c4-correct-amount,c5-sufficient-payment,f1-object-correspondence,f2-rote-rational-counting,f3-number-recognition,f4-number-sorting,f5-quantity-comparison,a1-simulated-shopping,a2-atm-simulator,theme-switcher}
mkdir -p css/{legacy,temp-backup}
```

##### Step 1.1.3：驗證目錄創建成功
```bash
# 檢查新目錄結構
dir css\modules\  # Windows
ls css/modules/   # Unix/Linux/macOS

# 應該看到所有模組目錄已創建
# 如果有缺失，手動補充創建
```

#### Step 1.2：完整備份現有檔案

##### Step 1.2.1：備份所有CSS檔案
```bash
# Windows 環境
copy css\*.css css\legacy\
copy css\*.css css\temp-backup\

# Unix/Linux/macOS 環境
cp css/*.css css/legacy/
cp css/*.css css/temp-backup/

# 備份HTML檔案（包含內嵌CSS）
copy index.html index.html.backup
copy html\*.html html\backup\  # Windows
cp index.html index.html.backup
cp -r html/ html_backup/       # Unix/Linux/macOS
```

##### Step 1.2.2：備份JavaScript檔案（包含內嵌CSS）
```bash
# 備份包含內嵌CSS的JS檔案
copy js\theme-system.js js\theme-system.js.backup
cp js/theme-system.js js/theme-system.js.backup

# 檢查其他可能包含內嵌CSS的JS檔案
findstr /i "style" js\*.js     # Windows
grep -r "style" js/           # Unix/Linux/macOS
```

##### Step 1.2.3：創建備份清單
```bash
# 創建備份清單文件
echo "CSS重構備份 - $(date)" > backup_list.txt
echo "===================" >> backup_list.txt
echo "" >> backup_list.txt
echo "備份檔案：" >> backup_list.txt
dir css\legacy\*.css >> backup_list.txt  # Windows
ls -la css/legacy/*.css >> backup_list.txt  # Unix/Linux/macOS
```

#### Step 1.3：版本控制檢查點

##### Step 1.3.1：初始化版本控制（如果尚未使用）
```bash
# 如果項目尚未使用Git
git init
echo "node_modules/" > .gitignore
echo "*.log" >> .gitignore
echo "css/temp-backup/" >> .gitignore
```

##### Step 1.3.2：創建重構前檢查點
```bash
# 添加所有現有檔案到版本控制
git add .
git commit -m "CSS重構前狀態：備份所有現有檔案

- 備份所有CSS檔案到 css/legacy/
- 備份HTML檔案
- 備份包含內嵌CSS的JS檔案
- 創建新的模組目錄結構
- 創建備份清單

準備開始模組化重構"
```

##### Step 1.3.3：創建重構分支（推薦）
```bash
# 創建專用的重構分支
git checkout -b css-refactoring
echo "當前在重構分支：css-refactoring"
echo "如有問題可隨時回到主分支：git checkout main"
```

##### Step 1.3.4：建立回滾腳本
```bash
# Windows 批次檔 (rollback.bat)
echo @echo off > rollback.bat
echo echo 正在回滾CSS重構... >> rollback.bat
echo copy css\temp-backup\*.css css\ >> rollback.bat
echo copy index.html.backup index.html >> rollback.bat
echo copy js\theme-system.js.backup js\theme-system.js >> rollback.bat
echo echo 回滾完成！ >> rollback.bat

# Unix/Linux/macOS 腳本 (rollback.sh)
cat > rollback.sh << 'EOF'
#!/bin/bash
echo "正在回滾CSS重構..."
cp css/temp-backup/*.css css/
cp index.html.backup index.html
cp js/theme-system.js.backup js/theme-system.js
echo "回滾完成！"
EOF
chmod +x rollback.sh
```

### 階段二：建立基礎共用檔案 (預估時間：2小時)

#### Step 2.1：創建最小化重置檔案
**檔案：`css/shared/css-reset-minimal.css`**

⚠️ **創建前檢查**：確認 `css/shared/` 目錄存在

**創建步驟：**
1. 使用文字編輯器創建新檔案：`css/shared/css-reset-minimal.css`
2. 複製以下完整內容（包含註解）
3. 儲存檔案並檢查無語法錯誤

```css
/* =================================================================
   最小化CSS重置 - 避免瀏覽器預設樣式衝突
   版本：1.0.0
   創建日期：[當前日期]
   用途：作為所有模組的基礎重置，避免瀏覽器差異
   ================================================================= */

/* 🎯 全域盒模型重置 */
*,
*::before,
*::after {
    box-sizing: border-box;
    /* 確保所有元素使用border-box計算方式 */
}

/* 🧹 移除預設邊距和內距 */
body, h1, h2, h3, h4, h5, h6, p, ul, ol, li, 
figure, blockquote, dl, dd, fieldset, legend {
    margin: 0;
    padding: 0;
}

/* 📝 基礎字體和文字渲染優化 */
body {
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeSpeed;
    word-wrap: break-word;
    
    /* 防止橫向滾動 */
    overflow-x: hidden;
    
    /* 基礎字體棧 - 適合中文顯示 */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                 'Microsoft JhengHei', '微軟正黑體', 'PingFang TC', 
                 'Helvetica Neue', Arial, sans-serif;
}

/* 🖼️ 圖片和媒體元素優化 */
img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
    height: auto;
    
    /* 改善圖片載入體驗 */
    image-rendering: -webkit-optimize-contrast;
}

/* 📋 表單元素統一 */
input, button, textarea, select {
    font: inherit;
    color: inherit;
    background: transparent;
    border: none;
    outline: none;
    
    /* 移除iOS樣式 */
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}

/* 🖱️ 按鈕基礎樣式重置 */
button {
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
    
    /* 防止選取文字 */
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    
    /* 觸控設備優化 */
    touch-action: manipulation;
}

/* 🎯 改善焦點可訪問性 */
:focus-visible {
    outline: 2px solid #007bff;
    outline-offset: 2px;
    border-radius: 2px;
}

/* 隱藏所有元素的預設焦點樣式 */
:focus:not(:focus-visible) {
    outline: none;
}

/* 📱 觸控設備優化 */
a, button, [role="button"], [tabindex] {
    /* 增大觸控目標 */
    min-width: 44px;
    min-height: 44px;
    
    /* 改善觸控體驗 */
    touch-action: manipulation;
}

/* 🔗 連結樣式重置 */
a {
    color: inherit;
    text-decoration: none;
}

/* 📄 列表樣式重置 */
ul, ol {
    list-style: none;
}

/* 📊 表格樣式重置 */
table {
    border-collapse: collapse;
    border-spacing: 0;
}

/* 🎨 選取文字顏色優化 */
::selection {
    background-color: rgba(0, 123, 255, 0.2);
}

::-moz-selection {
    background-color: rgba(0, 123, 255, 0.2);
}

/* 📱 行動裝置滾動優化 */
html {
    scroll-behavior: smooth;
    /* 防止彈性滾動 */
    overscroll-behavior-y: contain;
}

/* 🔄 動畫性能優化 */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
    
    html {
        scroll-behavior: auto;
    }
}

/* 🖥️ 高對比模式支援 */
@media (prefers-contrast: high) {
    :focus-visible {
        outline: 3px solid;
        outline-offset: 2px;
    }
}

/* 🌙 深色模式基礎準備 */
@media (prefers-color-scheme: dark) {
    /* 這裡保持空白，由各模組自行處理深色模式 */
}

/* ✨ 防止FOUC（Flash of Unstyled Content） */
[data-theme] {
    opacity: 1;
    transition: opacity 0.1s ease;
}

/* 🎬 載入狀態 */
[data-loading="true"] {
    opacity: 0.7;
    pointer-events: none;
}
```

**檔案創建後驗證：**
1. 開啟瀏覽器開發者工具
2. 檢查網路面板確認CSS檔案載入成功
3. 確認無CSS語法錯誤
4. 檢查檔案大小約 2-3KB

#### Step 2.2：創建設計規範庫（可選共用資源）
**檔案：`css/shared/design-tokens.css`**

```css
/* =================================================================
   設計規範庫 - 可選的共用設計變數
   模組可以選擇性使用，並提供fallback值
   ================================================================= */

:root {
    /* 🎨 色彩系統 */
    --design-primary-blue: #00aeff;
    --design-robot-green: #3CB371;
    --design-cute-pink: #FF69B4;
    --design-success-green: #32CD32;
    --design-error-red: #FF6347;
    --design-warning-yellow: #FFD700;
    
    /* 🌈 背景色彩 */
    --design-sky-gradient: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%);
    --design-dark-gradient: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    
    /* 📝 文字色彩 */
    --design-text-dark: #2F4F4F;
    --design-text-medium: #696969;
    --design-text-light: #A9A9A9;
    --design-text-white: #FFFFFF;
    
    /* 🔵 尺寸系統 */
    --design-radius-small: 8px;
    --design-radius-medium: 12px;
    --design-radius-large: 16px;
    --design-radius-xl: 20px;
    
    /* 🌈 陰影系統 */
    --design-shadow-small: 0 2px 4px rgba(0,0,0,0.1);
    --design-shadow-medium: 0 4px 8px rgba(0,0,0,0.15);
    --design-shadow-large: 0 8px 16px rgba(0,0,0,0.2);
    
    /* ⏱️ 動畫系統 */
    --design-transition-fast: 0.15s ease;
    --design-transition-normal: 0.3s ease;
    --design-transition-slow: 0.5s ease;
    
    /* 📐 間距系統 */
    --design-space-xs: 4px;
    --design-space-sm: 8px;
    --design-space-md: 16px;
    --design-space-lg: 24px;
    --design-space-xl: 32px;
    
    /* 🔤 字體系統 */
    --design-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft JhengHei', sans-serif;
    --design-font-size-sm: 14px;
    --design-font-size-base: 16px;
    --design-font-size-lg: 18px;
    --design-font-size-xl: 20px;
    --design-font-size-2xl: 24px;
}
```

### 階段三：逐一重構模組 (每個模組預估時間：30-60分鐘)

> ⚠️ **重要提醒**：一次只重構一個模組，完成測試後再進行下一個

#### Step 3.1：重構 index.html (主頁)

##### Step 3.1.1：創建主頁核心樣式
**檔案：`css/modules/index-page/index-core.css`**

```css
/* =================================================================
   主頁核心樣式 - 完全獨立運行
   ================================================================= */

.index-container {
    /* 🎨 模組內部變數系統 */
    --index-primary: #007bff;
    --index-secondary: #ffc107;
    --index-accent: #28a745;
    --index-bg-primary: #f0f7ff;
    --index-text-primary: #334e68;
    --index-card-bg: #ffffff;
    --index-card-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    --index-card-hover-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    --index-radius: 12px;
    --index-transition: all 0.3s ease-in-out;
    
    /* 🌐 可選：使用共用設計規範 (有fallback) */
    --index-primary: var(--design-primary-blue, #007bff);
    --index-success: var(--design-success-green, #28a745);
    --index-font-family: var(--design-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    
    /* 📦 容器基礎樣式 */
    background: var(--index-bg-primary);
    color: var(--index-text-primary);
    font-family: var(--index-font-family);
    min-height: 100vh;
    margin: 0;
    padding: 0;
    transition: var(--index-transition);
}

/* 🏠 主頁專用樣式 - 所有樣式都在命名空間內 */
.index-container .container {
    padding: 30px 20px;
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.index-container h1 {
    color: var(--index-primary);
    text-align: center;
    margin-bottom: 30px;
    font-size: 3em;
    font-weight: 700;
    text-shadow: 2px 2px 5px rgba(0, 123, 255, 0.1);
}

.index-container .page-header {
    margin-bottom: 40px;
    text-align: center;
}

.index-container .ai-assistant-intro {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
}

.index-container .ai-avatar {
    font-size: 3em;
    animation: index-bounce 2s infinite;
}

@keyframes index-bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
}

.index-container .ai-speech-bubble {
    background: var(--index-card-bg);
    padding: 15px 20px;
    border-radius: 20px 20px 20px 5px;
    box-shadow: var(--index-card-shadow);
    position: relative;
    max-width: 400px;
}

.index-container .ai-speech-bubble::before {
    content: '';
    position: absolute;
    left: -10px;
    bottom: 10px;
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-right-color: var(--index-card-bg);
}

.index-container .ai-speech-bubble p {
    margin: 0;
    color: var(--index-text-primary);
    font-size: 0.95em;
    line-height: 1.4;
}

/* 頁籤導覽列 */
.index-container .tabs {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 30px;
    background-color: var(--index-card-bg);
    padding: 10px;
    border-radius: 50px;
    box-shadow: var(--index-card-shadow);
}

.index-container .tab-btn {
    background: transparent;
    color: var(--index-text-primary);
    border: none;
    padding: 12px 25px;
    border-radius: 30px;
    font-size: 1.1em;
    font-weight: 600;
    cursor: pointer;
    transition: var(--index-transition);
}

.index-container .tab-btn:hover {
    color: var(--index-primary);
}

.index-container .tab-btn.active {
    background: var(--index-primary);
    color: white;
    box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
}

/* 單元網格 */
.index-container .tab-content {
    display: none;
}

.index-container .tab-content.active {
    display: block;
}

.index-container .unit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
    width: 100%;
    max-width: 900px;
}

.index-container .unit-btn {
    background: var(--index-card-bg);
    padding: 25px 20px;
    border-radius: var(--index-radius);
    box-shadow: var(--index-card-shadow);
    text-decoration: none;
    color: inherit;
    display: flex;
    align-items: center;
    gap: 20px;
    transition: var(--index-transition);
    border: 2px solid transparent;
    min-height: 120px;
}

.index-container .unit-btn:hover {
    transform: translateY(-5px);
    box-shadow: var(--index-card-hover-shadow);
    border-color: var(--index-primary);
}

.index-container .unit-btn:active {
    transform: translateY(-2px);
}

.index-container .unit-icon {
    font-size: 3em;
    flex-shrink: 0;
}

.index-container .unit-text {
    flex: 1;
}

.index-container .unit-text .code {
    font-size: 0.9em;
    font-weight: bold;
    color: var(--index-primary);
    margin-bottom: 5px;
}

.index-container .unit-text .title {
    font-size: 1.2em;
    font-weight: 600;
    color: var(--index-text-primary);
    margin-bottom: 5px;
}

.index-container .unit-text .ai-feature {
    font-size: 0.85em;
    color: var(--index-secondary);
    font-weight: 500;
}

/* 禁用狀態 */
.index-container .unit-btn.disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.6;
    pointer-events: none;
}

.index-container .unit-btn.disabled:hover {
    transform: none;
    box-shadow: var(--index-card-shadow);
    border-color: #e0e0e0;
}

/* 主題過渡效果 */
.index-container.theme-transitioning * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* 顏色拾取器高亮效果 */
.index-container .color-picker-highlight {
    box-shadow: 0 0 10px 2px rgba(102, 126, 234, 0.6) !important;
    position: relative;
    z-index: 1000;
}
```

##### Step 3.1.2：創建主頁主題支援
**檔案：`css/modules/index-page/index-theme.css`**

```css
/* =================================================================
   主頁主題支援 - 可選載入
   ================================================================= */

/* AI機器人主題 (預設) */
.index-container[data-theme="ai-robot"] {
    --index-primary: #00aeff;
    --index-secondary: #3CB371;
    --index-accent: #FF69B4;
    --index-bg-primary: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%);
    --index-text-primary: #2F4F4F;
}

/* 深色護眼主題 */
.index-container[data-theme="dark"] {
    --index-primary: #4f8cff;
    --index-secondary: #6c5ce7;
    --index-accent: #fd79a8;
    --index-bg-primary: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    --index-text-primary: #ecf0f1;
    --index-card-bg: #34495e;
    --index-card-shadow: 0 4px 15px rgba(0,0,0,0.3);
    --index-card-hover-shadow: 0 8px 25px rgba(0,0,0,0.4);
}

/* 經典主題 */
.index-container[data-theme="classic"] {
    --index-primary: #007bff;
    --index-secondary: #ffc107;
    --index-accent: #28a745;
    --index-bg-primary: #ffffff;
    --index-text-primary: #333333;
    --index-card-bg: #f8f9fa;
}
```

##### Step 3.1.3：創建主頁響應式支援
**檔案：`css/modules/index-page/index-mobile.css`**

```css
/* =================================================================
   主頁響應式支援 - 可選載入
   ================================================================= */

/* 平板端適配 */
@media (max-width: 768px) {
    .index-container h1 { 
        font-size: 2.5em; 
    }
    
    .index-container .tabs { 
        flex-direction: column; 
        border-radius: var(--index-radius); 
        gap: 5px; 
    }
    
    .index-container .tab-btn { 
        width: 100%; 
        text-align: center; 
    }
    
    .index-container .unit-grid { 
        grid-template-columns: 1fr; 
    }
    
    .index-container .ai-assistant-intro {
        flex-direction: column;
        text-align: center;
        gap: 15px;
    }
}

/* 手機端適配 */
@media (max-width: 480px) {
    .index-container .container {
        padding: 20px 15px;
    }
    
    .index-container h1 {
        font-size: 2em;
    }
    
    .index-container .unit-btn {
        flex-direction: column;
        text-align: center;
        gap: 15px;
        padding: 20px 15px;
    }
    
    .index-container .unit-icon {
        font-size: 2.5em;
    }
    
    .index-container .ai-speech-bubble {
        max-width: 280px;
        padding: 12px 16px;
    }
}
```

##### Step 3.1.4：修改 index.html

⚠️ **重要**：這是關鍵步驟，操作前請確保已備份！

**Step 3.1.4.1：再次備份當前 index.html**
```bash
# Windows
copy index.html index.html.step3.backup

# Unix/Linux/macOS
cp index.html index.html.step3.backup
```

**Step 3.1.4.2：檢查原始 index.html 結構**
首先開啟 `index.html`，找到以下關鍵部分：

1. **原有的CSS引用**（通常在 `<head>` 中）
2. **內嵌 `<style>` 標籤**（需要提取的CSS內容）
3. **`<body>` 中的主要內容結構**

**Step 3.1.4.3：逐步修改 HTML 結構**

**修改前原始結構範例：**
```html
<!-- 修改前的結構 -->
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>生活數學王</title>
    
    <!-- 原有可能存在的CSS引用 -->
    <link rel="stylesheet" href="css/ai-theme.css">
    <link rel="stylesheet" href="css/dark-theme.css">
    
    <!-- 原有的內嵌樣式 -->
    <style>
        body { /* 原有樣式 */ }
        .container { /* 原有樣式 */ }
        /* ... 其他內嵌CSS ... */
    </style>
</head>
<body>
    <div class="container">
        <!-- 原有內容 -->
    </div>
    <!-- 腳本檔案 -->
    <script src="js/theme-system.js"></script>
</body>
</html>
```

**修改後的完整結構：**
```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>生活數學王</title>
    
    <!-- ✅ 新的模組化CSS載入順序 -->
    <!-- 🔧 基礎重置 (可選 - 建議載入) -->
    <link rel="stylesheet" href="css/shared/css-reset-minimal.css">
    
    <!-- 🌐 共用設計規範 (可選) -->
    <link rel="stylesheet" href="css/shared/design-tokens.css">
    
    <!-- 📦 模組核心樣式 (必需) -->
    <link rel="stylesheet" href="css/modules/index-page/index-core.css">
    
    <!-- 🎨 主題支援 (可選 - 建議載入) -->
    <link rel="stylesheet" href="css/modules/index-page/index-theme.css">
    
    <!-- 📱 響應式支援 (可選 - 建議載入) -->
    <link rel="stylesheet" href="css/modules/index-page/index-mobile.css">
    
    <!-- 🎚️ 主題切換器樣式 (自動載入 - 可選手動載入) -->
    <link rel="stylesheet" href="css/modules/theme-switcher/theme-switcher-core.css">
    <link rel="stylesheet" href="css/modules/theme-switcher/theme-calculator.css">
    <link rel="stylesheet" href="css/modules/theme-switcher/theme-colorpicker.css">
    
    <!-- ❌ 註釋掉原有的CSS引用 - 保留以便回滾 -->
    <!-- 
    <link rel="stylesheet" href="css/ai-theme.css">
    <link rel="stylesheet" href="css/dark-theme.css">
    -->
    
    <!-- ❌ 移除或註釋原有的內嵌樣式 -->
    <!-- 
    <style>
        /* 
        原有的內嵌CSS已移動到對應的模組CSS檔案中
        如需回滾，請還原這些樣式並移除上方的模組CSS引用
        */
        body { /* 移動到 index-core.css */ }
        .container { /* 移動到 index-core.css */ }
        /* ... 其他內嵌CSS已移動 ... */
    </style>
    -->
    
    <!-- 🐛 臨時除錯樣式 - 完成重構後可移除 -->
    <style>
        /* 用於確認模組容器正確載入 */
        .index-container:not([data-theme]) {
            border: 2px dashed red;
        }
        .index-container[data-theme] {
            border: none;
        }
        
        /* 檢查CSS載入 */
        .index-container::before {
            content: "主頁模組CSS已載入";
            position: fixed;
            top: 0;
            left: 0;
            background: green;
            color: white;
            padding: 5px;
            font-size: 12px;
            z-index: 9999;
        }
    </style>
</head>
<body>
    <!-- 🏠 添加模組容器包裝 - 關鍵修改 -->
    <div class="index-container" data-module="index-page">
        <!-- 保持原有的HTML結構，只是添加了外層容器 -->
        <div class="container">
            <!-- 📄 原有的頁面標題 -->
            <div class="page-header">
                <h1>🎓 生活數學王</h1>
                <div class="ai-assistant-intro">
                    <div class="ai-avatar">🤖</div>
                    <div class="ai-speech-bubble">
                        <p>嗨！我是你的AI數學助手。準備好學習生活中的數學了嗎？</p>
                    </div>
                </div>
            </div>
            
            <!-- 📋 原有的頁籤導覽 -->
            <div class="tabs">
                <button class="tab-btn active" data-tab="basic">基礎金錢</button>
                <button class="tab-btn" data-tab="advanced">進階應用</button>
                <button class="tab-btn" data-tab="fun">趣味練習</button>
            </div>
            
            <!-- 📦 原有的內容區域 -->
            <div class="tab-content active" id="basic-content">
                <div class="unit-grid">
                    <!-- 原有的單元按鈕保持不變 -->
                    <!-- ... -->
                </div>
            </div>
            
            <!-- 其他原有內容保持完全相同 -->
            <!-- ... -->
        </div>
    </div>

    <!-- ✅ JavaScript檔案載入順序保持不變 -->
    <script src="js/audio-unlocker.js"></script>
    <script src="js/theme-system.js"></script>
    
    <!-- 🐛 臨時測試腳本 - 完成重構後可移除 -->
    <script>
        // 檢查模組容器是否正確設置
        document.addEventListener('DOMContentLoaded', function() {
            const container = document.querySelector('.index-container');
            if (container) {
                console.log('✅ 主頁模組容器載入成功');
                console.log('容器屬性:', container.dataset);
            } else {
                console.error('❌ 主頁模組容器未找到');
            }
            
            // 檢查CSS變數是否生效
            const computedStyle = getComputedStyle(container);
            const primaryColor = computedStyle.getPropertyValue('--index-primary');
            console.log('主頁主色調:', primaryColor || '未設定');
        });
    </script>
</body>
</html>
```

**Step 3.1.4.4：分段應用修改（降低風險）**

**第一階段：只添加容器**
```html
<!-- 只修改body部分，先添加容器包裝 -->
<body>
    <div class="index-container">
        <!-- 原有所有內容保持不變 -->
    </div>
    <!-- 腳本保持不變 -->
</body>
```

**第二階段：載入核心CSS**
```html
<!-- 在head中添加核心CSS -->
<link rel="stylesheet" href="css/modules/index-page/index-core.css">
```

**第三階段：載入其他CSS**
```html
<!-- 逐一添加其他CSS檔案 -->
<link rel="stylesheet" href="css/modules/index-page/index-theme.css">
<link rel="stylesheet" href="css/modules/index-page/index-mobile.css">
```

**第四階段：移除原有CSS**
```html
<!-- 註釋掉原有CSS引用 -->
<!-- <link rel="stylesheet" href="css/ai-theme.css"> -->
```

##### Step 3.1.5：全面測試主頁重構

⚠️ **關鍵測試階段**：必須確保所有功能正常才能繼續

**Step 3.1.5.1：基礎功能測試**

**測試清單 1：頁面載入**
- [ ] 頁面能正常開啟，無白畫面
- [ ] 控制台無CSS載入錯誤
- [ ] 所有圖片正常顯示
- [ ] 文字顯示正常，無亂碼

**檢查方法：**
```javascript
// 在瀏覽器控制台執行
console.log('=== 基礎載入檢查 ===');
console.log('頁面標題:', document.title);
console.log('模組容器:', document.querySelector('.index-container') ? '✅存在' : '❌缺失');
console.log('原始容器:', document.querySelector('.container') ? '✅存在' : '❌缺失');

// 檢查CSS檔案載入
const stylesheets = Array.from(document.styleSheets);
console.log('已載入CSS檔案數:', stylesheets.length);
stylesheets.forEach((sheet, index) => {
    try {
        console.log(`CSS ${index + 1}:`, sheet.href ? sheet.href.split('/').pop() : '內嵌樣式');
    } catch(e) {
        console.log(`CSS ${index + 1}: 無法訪問（可能是跨域）`);
    }
});
```

**Step 3.1.5.2：樣式檢測**

**測試清單 2：視覺樣式**
- [ ] 背景顏色/漸層正常顯示
- [ ] 按鈕樣式正確
- [ ] 文字顏色和字體正確
- [ ] 間距和佈局正確
- [ ] 陰影和圓角效果正確

**檢查方法：**
```javascript
// 檢查CSS變數
const container = document.querySelector('.index-container');
if (container) {
    const styles = getComputedStyle(container);
    console.log('=== CSS變數檢查 ===');
    console.log('主色調:', styles.getPropertyValue('--index-primary'));
    console.log('背景:', styles.getPropertyValue('--index-bg-primary'));
    console.log('文字顏色:', styles.getPropertyValue('--index-text-primary'));
    console.log('卡片背景:', styles.getPropertyValue('--index-card-bg'));
    
    // 檢查計算後的實際樣式
    console.log('=== 計算樣式檢查 ===');
    console.log('實際背景:', styles.background);
    console.log('實際字體:', styles.fontFamily);
    console.log('實際顏色:', styles.color);
} else {
    console.error('❌ 找不到主頁容器');
}
```

**Step 3.1.5.3：交互功能測試**

**測試清單 3：用戶交互**
- [ ] 頁籤切換功能正常
- [ ] 按鈕點擊響應正常
- [ ] 鼠標懸停效果正常
- [ ] 主題切換器正常顯示和工作
- [ ] 連結跳轉正常

**詳細測試步驟：**

1. **頁籤切換測試**
   ```javascript
   // 測試頁籤功能
   const tabs = document.querySelectorAll('.tab-btn');
   const contents = document.querySelectorAll('.tab-content');
   
   console.log('頁籤數量:', tabs.length);
   console.log('內容區域數量:', contents.length);
   
   // 模擬點擊每個頁籤
   tabs.forEach((tab, index) => {
       console.log(`測試頁籤 ${index + 1}:`, tab.textContent);
       tab.click();
       setTimeout(() => {
           const activeTab = document.querySelector('.tab-btn.active');
           const activeContent = document.querySelector('.tab-content.active');
           console.log('當前活動頁籤:', activeTab ? activeTab.textContent : '無');
           console.log('當前顯示內容:', activeContent ? '正常' : '異常');
       }, 100);
   });
   ```

2. **按鈕響應測試**
   ```javascript
   // 測試單元按鈕
   const unitBtns = document.querySelectorAll('.unit-btn');
   console.log('單元按鈕數量:', unitBtns.length);
   
   unitBtns.forEach((btn, index) => {
       const title = btn.querySelector('.title')?.textContent || '無標題';
       const href = btn.href || '無連結';
       console.log(`按鈕 ${index + 1}: ${title} -> ${href}`);
   });
   ```

3. **主題切換器測試**
   ```javascript
   // 檢查主題切換器
   const themeSwitcher = document.querySelector('.theme-switcher-container');
   if (themeSwitcher) {
       console.log('✅ 主題切換器存在');
       const themeToggle = themeSwitcher.querySelector('.theme-toggle');
       if (themeToggle) {
           console.log('✅ 主題切換按鈕存在');
           // 測試主題切換
           themeToggle.click();
           setTimeout(() => {
               const currentTheme = document.documentElement.getAttribute('data-theme');
               console.log('當前主題:', currentTheme || '預設');
           }, 500);
       }
   } else {
       console.log('⚠️ 主題切換器不存在（可能稍後載入）');
   }
   ```

**Step 3.1.5.4：響應式測試**

**測試清單 4：響應式佈局**
- [ ] 桌面版 (1200px+) 佈局正確
- [ ] 平板版 (768px-1199px) 佈局正確
- [ ] 手機版 (768px以下) 佈局正確
- [ ] 橫屏/豎屏切換正常

**測試方法：**
1. **手動調整瀏覽器視窗大小**
2. **使用開發者工具裝置模擬**
3. **實機測試（如果可能）**

**響應式檢查腳本：**
```javascript
// 響應式測試輔助
function testResponsive() {
    const widths = [320, 480, 768, 1024, 1200, 1440];
    const container = document.querySelector('.index-container');
    
    widths.forEach(width => {
        // 模擬不同寬度
        document.body.style.width = width + 'px';
        const styles = getComputedStyle(container);
        
        console.log(`寬度 ${width}px:`);
        console.log('  - 容器寬度:', styles.width);
        console.log('  - 內邊距:', styles.padding);
        console.log('  - 字體大小:', styles.fontSize);
    });
    
    // 恢復原狀
    document.body.style.width = '';
}

// 執行測試
testResponsive();
```

**Step 3.1.5.5：效能檢測**

**測試清單 5：效能指標**
- [ ] 頁面載入時間 < 3秒
- [ ] CSS檔案大小合理
- [ ] 無重複CSS載入
- [ ] 無未使用的大型資源

**檢查方法：**
```javascript
// 效能檢測
console.log('=== 效能檢測 ===');

// 檢查載入時間
if (performance.timing) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log('頁面載入時間:', loadTime + 'ms');
}

// 檢查資源大小
if (performance.getEntriesByType) {
    const resources = performance.getEntriesByType('resource');
    const cssResources = resources.filter(r => r.name.includes('.css'));
    console.log('CSS資源:');
    cssResources.forEach(css => {
        console.log(`  ${css.name.split('/').pop()}: ${Math.round(css.transferSize/1024)}KB`);
    });
}
```

**Step 3.1.5.6：錯誤處理測試**

**測試清單 6：錯誤恢復**
- [ ] CSS檔案載入失敗時頁面仍可用
- [ ] JavaScript錯誤不影響基本功能
- [ ] 主題切換失敗有回退方案

**模擬測試：**
```javascript
// 模擬CSS載入失敗
const testLink = document.createElement('link');
testLink.rel = 'stylesheet';
testLink.href = 'css/non-existent.css';
testLink.onerror = () => console.log('✅ CSS載入失敗處理正常');
document.head.appendChild(testLink);

// 檢查降級方案
if (!document.querySelector('.index-container')) {
    console.log('⚠️ 需要實施降級方案');
}
```

**Step 3.1.5.7：瀏覽器相容性測試**

**測試瀏覽器清單：**
- [ ] Chrome (最新版)
- [ ] Firefox (最新版)
- [ ] Safari (如果使用Mac)
- [ ] Edge (最新版)
- [ ] 行動瀏覽器 (如果可能)

**記錄測試結果：**
```javascript
// 瀏覽器資訊記錄
console.log('=== 瀏覽器環境 ===');
console.log('User Agent:', navigator.userAgent);
console.log('螢幕解析度:', screen.width + 'x' + screen.height);
console.log('視窗大小:', window.innerWidth + 'x' + window.innerHeight);
console.log('像素比:', window.devicePixelRatio || 1);
```

**完成檢查點：**

✅ **通過條件（必須全部滿足）：**
- 所有基礎功能測試通過
- 樣式顯示完全正常
- 交互功能完全正常
- 響應式佈局正確
- 效能指標在可接受範圍
- 至少2個主流瀏覽器測試通過

❌ **如果任何測試失敗：**
1. 記錄具體錯誤訊息
2. 檢查對應的CSS檔案
3. 使用回滾腳本恢復
4. 重新檢查步驟並修復問題
5. 再次進行完整測試

> 🎯 **重要提醒**：只有主頁重構100%成功才能繼續下一個模組！

#### Step 3.2：重構 C1 單元 (金錢的種類與幣值)

##### Step 3.2.1：創建 C1 核心樣式

⚠️ **創建前檢查**：確認 `css/modules/c1-money-types/` 目錄存在

**建議操作步驟：**
1. **先檢查原始 C1 檔案**：開啟 `html/c1_money_types.html` 查看現有樣式
2. **提取關鍵資訊**：記錄下現有的類名、變數、布局結構
3. **分段創建**：先創建基礎框架，再逐步添加功能
4. **立即測試**：每次添加部分後都要測試

**檔案：`css/modules/c1-money-types/c1-core.css`**

**分段創建步驟：**

**第一步：建立基本框架**
```css
/* =================================================================
   C1 金錢的種類與幣值 - 核心樣式
   版本：1.0.0
   創建日期：[當前日期]
   相依：css/shared/css-reset-minimal.css (可選)
           css/shared/design-tokens.css (可選)
   ================================================================= */

/* 📦 C1模組基本容器 */
.c1-container {
    /* 🃏 模組標識 */
    --module-name: 'c1-money-types';
    --module-version: '1.0.0';
    
    /* ℹ️ 測試信息（後續可移除） */
    border: 1px dashed blue; /* 確認容器正確載入 */
}

/* 🖥️ 檢查容器是否正確載入 */
.c1-container::before {
    content: "C1模組核心CSS已載入";
    position: fixed;
    top: 0;
    left: 0;
    background: green;
    color: white;
    padding: 5px;
    font-size: 12px;
    z-index: 9999;
    pointer-events: none;
}

/* 基礎容器樣式（最小可用版本） */
.c1-container {
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f0f0f0; /* 臨時背景色 */
    color: #333; /* 臨時文字色 */
}
```

**立即測試第一步：**
1. 儲存檔案
2. 在 c1_money_types.html 中添加：`<link rel="stylesheet" href="../css/modules/c1-money-types/c1-core.css">`
3. 在 body 中添加：`<div class="c1-container">原有內容</div>`
4. 開啟頁面檢查是否有藍色線框和綠色測試信息

**第二步：添加CSS變數系統**
```css
.c1-container {
    /* 🎨 C1 模組內部變數系統 */
    --c1-primary: #00aeff;
    --c1-secondary: #3CB371;
    --c1-accent: #FF69B4;
    --c1-success: #32CD32;
    --c1-error: #FF6347;
    --c1-warning: #FFD700;
    
    /* 🌈 背景色彩 */
    --c1-bg-primary: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%);
    --c1-bg-card: #FFFFFF;
    --c1-bg-light: #E6F3FF;
    
    /* 📝 文字色彩 */
    --c1-text-primary: #2F4F4F;
    --c1-text-secondary: #696969;
    --c1-text-light: #A9A9A9;
    --c1-text-white: #FFFFFF;
    
    /* 🔵 尺寸和效果 */
    --c1-radius-small: 12px;
    --c1-radius-medium: 16px;
    --c1-radius-large: 20px;
    --c1-shadow-light: 0 2px 8px rgba(135, 206, 235, 0.2);
    --c1-shadow-medium: 0 4px 12px rgba(135, 206, 235, 0.25);
    --c1-shadow-heavy: 0 8px 20px rgba(135, 206, 235, 0.3);
    
    /* ⏱️ 動畫 */
    --c1-transition-fast: 0.2s ease;
    --c1-transition-normal: 0.3s ease;
    --c1-transition-slow: 0.5s ease;
    
    /* 🔤 字體 */
    --c1-font-family: 'Helvetica', 'Arial', 'Microsoft JhengHei', '微軟正黑體', sans-serif;
    
    /* 🌐 可選：使用共用設計規範 (fallback保護) */
    --c1-primary: var(--design-primary-blue, #00aeff);
    --c1-secondary: var(--design-robot-green, #3CB371);
    --c1-success: var(--design-success-green, #32CD32);
    --c1-error: var(--design-error-red, #FF6347);
    --c1-font-family: var(--design-font-family, 'Helvetica', 'Arial', 'Microsoft JhengHei', sans-serif);
    
    /* 📦 更新容器基礎樣式 */
    min-height: 100vh;
    background: var(--c1-bg-primary);
    color: var(--c1-text-primary);
    font-family: var(--c1-font-family);
    transition: var(--c1-transition-normal);
    
    /* 📱 行動裝置優化 */
    overscroll-behavior-y: contain;
}

/* 測試CSS變數是否生效 */
.c1-container .test-variables {
    background: var(--c1-primary);
    color: var(--c1-text-white);
    padding: 10px;
    border-radius: var(--c1-radius-small);
    box-shadow: var(--c1-shadow-medium);
}
```

**測試第二步：**
```html
<!-- 在 c1_money_types.html 中加入測試元素 -->
<div class="test-variables">測試CSS變數</div>
```

**第三步：添加主要佈局結構**
```css
/* 🎮 遊戲主要佈局 */
.c1-container .game-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.c1-container .game-header {
    text-align: center;
    margin-bottom: 30px;
}

.c1-container .game-title {
    font-size: 2.5em;
    color: var(--c1-primary);
    margin-bottom: 10px;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 174, 255, 0.2);
}

.c1-container .game-subtitle {
    font-size: 1.2em;
    color: var(--c1-text-secondary);
    margin-bottom: 20px;
}

/* 🎚️ 設定面板 */
.c1-container .settings-panel {
    background: var(--c1-bg-card);
    border-radius: var(--c1-radius-large);
    padding: 25px;
    margin-bottom: 30px;
    box-shadow: var(--c1-shadow-medium);
    border: 2px solid var(--c1-primary);
}

.c1-container .setting-group {
    margin-bottom: 25px;
}

.c1-container .setting-group:last-child {
    margin-bottom: 0;
}

.c1-container .setting-group h4 {
    font-size: 1.3em;
    color: var(--c1-primary);
    margin-bottom: 15px;
    font-weight: 600;
}
```

**第四步：加入按鈕和交互元素**
```css
/* 🔘 設定選項按鈕 */
.c1-container .setting-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.c1-container .option-btn {
    background: var(--c1-bg-light);
    color: var(--c1-text-primary);
    border: 2px solid var(--c1-primary);
    padding: 12px 20px;
    border-radius: var(--c1-radius-medium);
    font-size: 1em;
    font-weight: 500;
    cursor: pointer;
    transition: var(--c1-transition-normal);
    touch-action: manipulation;
    user-select: none;
}

.c1-container .option-btn:hover {
    background: var(--c1-primary);
    color: var(--c1-text-white);
    transform: translateY(-2px);
    box-shadow: var(--c1-shadow-medium);
}

.c1-container .option-btn:active {
    transform: translateY(0);
}

.c1-container .option-btn.selected {
    background: var(--c1-primary);
    color: var(--c1-text-white);
    box-shadow: var(--c1-shadow-medium);
}
```

**逐步測試每個部分**，確認正常後繼續添加後續內容：

```css
/* 🎮 遊戲區域 */
.c1-container .game-area {
    background: var(--c1-bg-card);
    border-radius: var(--c1-radius-large);
    padding: 30px;
    box-shadow: var(--c1-shadow-medium);
    border: 2px solid var(--c1-primary);
    min-height: 400px;
}

.c1-container .question-section {
    text-align: center;
    margin-bottom: 30px;
}

.c1-container .question-text {
    font-size: 1.4em;
    color: var(--c1-text-primary);
    margin-bottom: 20px;
    font-weight: 600;
}

/* 💰 金錢顯示區域 */
.c1-container .money-display {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
    padding: 20px;
    background: var(--c1-bg-light);
    border-radius: var(--c1-radius-medium);
    border: 2px dashed var(--c1-primary);
}

.c1-container .money-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 15px;
    background: var(--c1-bg-card);
    border-radius: var(--c1-radius-small);
    box-shadow: var(--c1-shadow-light);
    transition: var(--c1-transition-normal);
    cursor: pointer;
    user-select: none;
}

.c1-container .money-item:hover {
    transform: scale(1.05);
    box-shadow: var(--c1-shadow-medium);
}

.c1-container .money-item img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    border-radius: var(--c1-radius-small);
}

.c1-container .money-value {
    font-size: 1.1em;
    font-weight: bold;
    color: var(--c1-primary);
}

/* 🎯 答案選項區域 */
.c1-container .answer-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
}

.c1-container .answer-option {
    background: var(--c1-bg-light);
    border: 2px solid var(--c1-primary);
    border-radius: var(--c1-radius-medium);
    padding: 20px 15px;
    text-align: center;
    cursor: pointer;
    transition: var(--c1-transition-normal);
    font-size: 1.2em;
    font-weight: 600;
    color: var(--c1-text-primary);
    user-select: none;
}

.c1-container .answer-option:hover {
    background: var(--c1-primary);
    color: var(--c1-text-white);
    transform: translateY(-3px);
    box-shadow: var(--c1-shadow-medium);
}

.c1-container .answer-option.selected {
    background: var(--c1-secondary);
    color: var(--c1-text-white);
    border-color: var(--c1-secondary);
}

.c1-container .answer-option.correct {
    background: var(--c1-success);
    color: var(--c1-text-white);
    border-color: var(--c1-success);
    animation: c1-success-pulse 0.5s ease;
}

.c1-container .answer-option.incorrect {
    background: var(--c1-error);
    color: var(--c1-text-white);
    border-color: var(--c1-error);
    animation: c1-error-shake 0.5s ease;
}

/* 🎯 按鈕區域 */
.c1-container .button-area {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
}

.c1-container .game-button {
    padding: 15px 30px;
    font-size: 1.1em;
    font-weight: 600;
    border-radius: var(--c1-radius-medium);
    border: none;
    cursor: pointer;
    transition: var(--c1-transition-normal);
    user-select: none;
    box-shadow: var(--c1-shadow-light);
}

.c1-container .primary-button {
    background: var(--c1-primary);
    color: var(--c1-text-white);
}

.c1-container .primary-button:hover {
    background: var(--c1-secondary);
    transform: translateY(-2px);
    box-shadow: var(--c1-shadow-medium);
}

.c1-container .secondary-button {
    background: var(--c1-bg-light);
    color: var(--c1-text-primary);
    border: 2px solid var(--c1-primary);
}

.c1-container .secondary-button:hover {
    background: var(--c1-primary);
    color: var(--c1-text-white);
}

/* 📊 結果面板 */
.c1-container .result-panel {
    background: var(--c1-bg-card);
    border-radius: var(--c1-radius-large);
    padding: 25px;
    margin-top: 20px;
    box-shadow: var(--c1-shadow-medium);
    text-align: center;
}

.c1-container .result-panel.success {
    border: 3px solid var(--c1-success);
}

.c1-container .result-panel.error {
    border: 3px solid var(--c1-error);
}

.c1-container .result-title {
    font-size: 1.5em;
    font-weight: bold;
    margin-bottom: 15px;
}

.c1-container .result-panel.success .result-title {
    color: var(--c1-success);
}

.c1-container .result-panel.error .result-title {
    color: var(--c1-error);
}

.c1-container .result-message {
    font-size: 1.1em;
    color: var(--c1-text-primary);
    margin-bottom: 20px;
    line-height: 1.5;
}

/* 🎭 動畫效果 */
@keyframes c1-success-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes c1-error-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

/* 🔄 載入動畫 */
.c1-container .loading-spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid var(--c1-bg-light);
    border-radius: 50%;
    border-top-color: var(--c1-primary);
    animation: c1-spin 1s ease-in-out infinite;
}

@keyframes c1-spin {
    to { transform: rotate(360deg); }
}

/* 👻 隱藏元素 */
.c1-container .hidden {
    display: none !important;
}

/* 🎨 禁用狀態 */
.c1-container .disabled {
    opacity: 0.6;
    pointer-events: none;
    cursor: not-allowed;
}

/* 🌈 主題過渡效果 */
.c1-container.theme-transitioning * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
}
```

**最終測試檢查清單：**
- [ ] 所有變數正確設置且生效
- [ ] 佈局結構正確顯示
- [ ] 按鈕交互正常
- [ ] 鼠標懸停效果正常
- [ ] 動畫效果正常
- [ ] 響應式特性在下一步驟中測試

**完成後清理：**
```css
/* 移除測試相關樣式 */
.c1-container {
    /* 移除 border: 1px dashed blue; */
}

.c1-container::before {
    /* 移除或註釋測試信息 */
    display: none;
}
```
    /* 🎨 C1 模組內部變數系統 */
    --c1-primary: #00aeff;
    --c1-secondary: #3CB371;
    --c1-accent: #FF69B4;
    --c1-success: #32CD32;
    --c1-error: #FF6347;
    --c1-warning: #FFD700;
    
    /* 🌈 背景色彩 */
    --c1-bg-primary: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%);
    --c1-bg-card: #FFFFFF;
    --c1-bg-light: #E6F3FF;
    
    /* 📝 文字色彩 */
    --c1-text-primary: #2F4F4F;
    --c1-text-secondary: #696969;
    --c1-text-light: #A9A9A9;
    --c1-text-white: #FFFFFF;
    
    /* 🔵 尺寸和效果 */
    --c1-radius-small: 12px;
    --c1-radius-medium: 16px;
    --c1-radius-large: 20px;
    --c1-shadow-light: 0 2px 8px rgba(135, 206, 235, 0.2);
    --c1-shadow-medium: 0 4px 12px rgba(135, 206, 235, 0.25);
    --c1-shadow-heavy: 0 8px 20px rgba(135, 206, 235, 0.3);
    
    /* ⏱️ 動畫 */
    --c1-transition-fast: 0.2s ease;
    --c1-transition-normal: 0.3s ease;
    --c1-transition-slow: 0.5s ease;
    
    /* 🔤 字體 */
    --c1-font-family: 'Helvetica', 'Arial', 'Microsoft JhengHei', '微軟正黑體', sans-serif;
    
    /* 🌐 可選：使用共用設計規範 (有fallback) */
    --c1-primary: var(--design-primary-blue, #00aeff);
    --c1-secondary: var(--design-robot-green, #3CB371);
    --c1-success: var(--design-success-green, #32CD32);
    --c1-error: var(--design-error-red, #FF6347);
    --c1-font-family: var(--design-font-family, 'Helvetica', 'Arial', 'Microsoft JhengHei', sans-serif);
    
    /* 📦 容器基礎樣式 */
    min-height: 100vh;
    background: var(--c1-bg-primary);
    color: var(--c1-text-primary);
    font-family: var(--c1-font-family);
    transition: var(--c1-transition-normal);
}

/* 📱 禁用行動裝置下拉重新整理 */
.c1-container,
.c1-container body,
.c1-container #app {
    overscroll-behavior-y: contain;
}

/* 🎮 遊戲主要佈局 */
.c1-container .game-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.c1-container .game-header {
    text-align: center;
    margin-bottom: 30px;
}

.c1-container .game-title {
    font-size: 2.5em;
    color: var(--c1-primary);
    margin-bottom: 10px;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 174, 255, 0.2);
}

.c1-container .game-subtitle {
    font-size: 1.2em;
    color: var(--c1-text-secondary);
    margin-bottom: 20px;
}

/* 🎚️ 設定面板 */
.c1-container .settings-panel {
    background: var(--c1-bg-card);
    border-radius: var(--c1-radius-large);
    padding: 25px;
    margin-bottom: 30px;
    box-shadow: var(--c1-shadow-medium);
    border: 2px solid var(--c1-primary);
}

.c1-container .setting-group {
    margin-bottom: 25px;
}

.c1-container .setting-group:last-child {
    margin-bottom: 0;
}

.c1-container .setting-group h4 {
    font-size: 1.3em;
    color: var(--c1-primary);
    margin-bottom: 15px;
    font-weight: 600;
}

.c1-container .setting-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.c1-container .option-btn {
    background: var(--c1-bg-light);
    color: var(--c1-text-primary);
    border: 2px solid var(--c1-primary);
    padding: 12px 20px;
    border-radius: var(--c1-radius-medium);
    font-size: 1em;
    font-weight: 500;
    cursor: pointer;
    transition: var(--c1-transition-normal);
    touch-action: manipulation;
    user-select: none;
}

.c1-container .option-btn:hover {
    background: var(--c1-primary);
    color: var(--c1-text-white);
    transform: translateY(-2px);
    box-shadow: var(--c1-shadow-medium);
}

.c1-container .option-btn:active {
    transform: translateY(0);
}

.c1-container .option-btn.selected {
    background: var(--c1-primary);
    color: var(--c1-text-white);
    box-shadow: var(--c1-shadow-medium);
}

/* 🎮 遊戲區域 */
.c1-container .game-area {
    background: var(--c1-bg-card);
    border-radius: var(--c1-radius-large);
    padding: 30px;
    box-shadow: var(--c1-shadow-medium);
    border: 2px solid var(--c1-primary);
    min-height: 400px;
}

.c1-container .question-section {
    text-align: center;
    margin-bottom: 30px;
}

.c1-container .question-text {
    font-size: 1.4em;
    color: var(--c1-text-primary);
    margin-bottom: 20px;
    font-weight: 600;
}

/* 💰 金錢顯示區域 */
.c1-container .money-display {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
    padding: 20px;
    background: var(--c1-bg-light);
    border-radius: var(--c1-radius-medium);
    border: 2px dashed var(--c1-primary);
}

.c1-container .money-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 15px;
    background: var(--c1-bg-card);
    border-radius: var(--c1-radius-small);
    box-shadow: var(--c1-shadow-light);
    transition: var(--c1-transition-normal);
    cursor: pointer;
    user-select: none;
}

.c1-container .money-item:hover {
    transform: scale(1.05);
    box-shadow: var(--c1-shadow-medium);
}

.c1-container .money-item img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    border-radius: var(--c1-radius-small);
}

.c1-container .money-value {
    font-size: 1.1em;
    font-weight: bold;
    color: var(--c1-primary);
}

/* 🎯 答案選項區域 */
.c1-container .answer-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
}

.c1-container .answer-option {
    background: var(--c1-bg-light);
    border: 2px solid var(--c1-primary);
    border-radius: var(--c1-radius-medium);
    padding: 20px 15px;
    text-align: center;
    cursor: pointer;
    transition: var(--c1-transition-normal);
    font-size: 1.2em;
    font-weight: 600;
    color: var(--c1-text-primary);
    user-select: none;
}

.c1-container .answer-option:hover {
    background: var(--c1-primary);
    color: var(--c1-text-white);
    transform: translateY(-3px);
    box-shadow: var(--c1-shadow-medium);
}

.c1-container .answer-option.selected {
    background: var(--c1-secondary);
    color: var(--c1-text-white);
    border-color: var(--c1-secondary);
}

.c1-container .answer-option.correct {
    background: var(--c1-success);
    color: var(--c1-text-white);
    border-color: var(--c1-success);
    animation: c1-success-pulse 0.5s ease;
}

.c1-container .answer-option.incorrect {
    background: var(--c1-error);
    color: var(--c1-text-white);
    border-color: var(--c1-error);
    animation: c1-error-shake 0.5s ease;
}

/* 🎯 按鈕區域 */
.c1-container .button-area {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
}

.c1-container .game-button {
    padding: 15px 30px;
    font-size: 1.1em;
    font-weight: 600;
    border-radius: var(--c1-radius-medium);
    border: none;
    cursor: pointer;
    transition: var(--c1-transition-normal);
    user-select: none;
    box-shadow: var(--c1-shadow-light);
}

.c1-container .primary-button {
    background: var(--c1-primary);
    color: var(--c1-text-white);
}

.c1-container .primary-button:hover {
    background: var(--c1-secondary);
    transform: translateY(-2px);
    box-shadow: var(--c1-shadow-medium);
}

.c1-container .secondary-button {
    background: var(--c1-bg-light);
    color: var(--c1-text-primary);
    border: 2px solid var(--c1-primary);
}

.c1-container .secondary-button:hover {
    background: var(--c1-primary);
    color: var(--c1-text-white);
}

/* 📊 結果面板 */
.c1-container .result-panel {
    background: var(--c1-bg-card);
    border-radius: var(--c1-radius-large);
    padding: 25px;
    margin-top: 20px;
    box-shadow: var(--c1-shadow-medium);
    text-align: center;
}

.c1-container .result-panel.success {
    border: 3px solid var(--c1-success);
}

.c1-container .result-panel.error {
    border: 3px solid var(--c1-error);
}

.c1-container .result-title {
    font-size: 1.5em;
    font-weight: bold;
    margin-bottom: 15px;
}

.c1-container .result-panel.success .result-title {
    color: var(--c1-success);
}

.c1-container .result-panel.error .result-title {
    color: var(--c1-error);
}

.c1-container .result-message {
    font-size: 1.1em;
    color: var(--c1-text-primary);
    margin-bottom: 20px;
    line-height: 1.5;
}

/* 🎭 動畫效果 */
@keyframes c1-success-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes c1-error-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

/* 🔄 載入動畫 */
.c1-container .loading-spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid var(--c1-bg-light);
    border-radius: 50%;
    border-top-color: var(--c1-primary);
    animation: c1-spin 1s ease-in-out infinite;
}

@keyframes c1-spin {
    to { transform: rotate(360deg); }
}

/* 👻 隱藏元素 */
.c1-container .hidden {
    display: none !important;
}

/* 🎨 禁用狀態 */
.c1-container .disabled {
    opacity: 0.6;
    pointer-events: none;
    cursor: not-allowed;
}

/* 🌈 主題過渡效果 */
.c1-container.theme-transitioning * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
}
```

##### Step 3.2.2：創建 C1 主題支援
**檔案：`css/modules/c1-money-types/c1-theme.css`**

```css
/* =================================================================
   C1 金錢的種類與幣值 - 主題支援
   ================================================================= */

/* AI機器人主題 (預設) */
.c1-container[data-theme="ai-robot"] {
    --c1-primary: #00aeff;
    --c1-secondary: #3CB371;
    --c1-accent: #FF69B4;
    --c1-bg-primary: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%);
    --c1-text-primary: #2F4F4F;
}

/* 深色護眼主題 */
.c1-container[data-theme="dark"] {
    --c1-primary: #4f8cff;
    --c1-secondary: #6c5ce7;
    --c1-accent: #fd79a8;
    --c1-success: #00e676;
    --c1-error: #ef5350;
    --c1-warning: #ffc107;
    
    --c1-bg-primary: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    --c1-bg-card: #34495e;
    --c1-bg-light: #455a64;
    
    --c1-text-primary: #ecf0f1;
    --c1-text-secondary: #bdc3c7;
    --c1-text-light: #95a5a6;
    --c1-text-white: #2c3e50;
    
    --c1-shadow-light: 0 2px 8px rgba(0,0,0,0.3);
    --c1-shadow-medium: 0 5px 15px rgba(0,0,0,0.4);
    --c1-shadow-heavy: 0 15px 35px rgba(0,0,0,0.6);
}

/* 經典主題 */
.c1-container[data-theme="classic"] {
    --c1-primary: #007bff;
    --c1-secondary: #28a745;
    --c1-accent: #ffc107;
    --c1-bg-primary: #ffffff;
    --c1-bg-card: #f8f9fa;
    --c1-bg-light: #e9ecef;
    --c1-text-primary: #333333;
    --c1-text-secondary: #666666;
    --c1-text-light: #999999;
}

/* 🌈 高對比模式支援 */
@media (prefers-contrast: high) {
    .c1-container {
        --c1-primary: #000000;
        --c1-text-primary: #000000;
        --c1-text-secondary: #333333;
        --c1-bg-card: #ffffff;
        --c1-shadow-light: 0 2px 8px rgba(0,0,0,0.5);
        --c1-shadow-medium: 0 4px 12px rgba(0,0,0,0.6);
    }
}

/* 🔅 減少動畫模式 */
@media (prefers-reduced-motion: reduce) {
    .c1-container *,
    .c1-container *::before,
    .c1-container *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}

/* 🌙 深色模式系統偏好 */
@media (prefers-color-scheme: dark) {
    .c1-container:not([data-theme]) {
        --c1-primary: #4f8cff;
        --c1-bg-primary: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        --c1-bg-card: #34495e;
        --c1-text-primary: #ecf0f1;
    }
}
```

##### Step 3.2.3：創建 C1 響應式支援
**檔案：`css/modules/c1-money-types/c1-mobile.css`**

```css
/* =================================================================
   C1 金錢的種類與幣值 - 響應式支援
   ================================================================= */

/* 📱 平板端適配 (768px以下) */
@media (max-width: 768px) {
    .c1-container .game-container {
        padding: 15px;
    }
    
    .c1-container .game-title {
        font-size: 2em;
    }
    
    .c1-container .game-subtitle {
        font-size: 1em;
    }
    
    .c1-container .settings-panel {
        padding: 20px;
    }
    
    .c1-container .setting-options {
        justify-content: center;
    }
    
    .c1-container .option-btn {
        flex: 1 1 auto;
        min-width: 120px;
    }
    
    .c1-container .game-area {
        padding: 20px;
    }
    
    .c1-container .money-display {
        flex-direction: column;
        gap: 15px;
    }
    
    .c1-container .answer-options {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }
    
    .c1-container .button-area {
        flex-direction: column;
        align-items: center;
    }
    
    .c1-container .game-button {
        width: 100%;
        max-width: 250px;
    }
}

/* 📱 手機端適配 (480px以下) */
@media (max-width: 480px) {
    .c1-container .game-container {
        padding: 10px;
    }
    
    .c1-container .game-title {
        font-size: 1.8em;
    }
    
    .c1-container .settings-panel,
    .c1-container .game-area,
    .c1-container .result-panel {
        padding: 15px;
    }
    
    .c1-container .setting-group h4 {
        font-size: 1.1em;
    }
    
    .c1-container .option-btn {
        padding: 10px 15px;
        font-size: 0.9em;
    }
    
    .c1-container .question-text {
        font-size: 1.2em;
    }
    
    .c1-container .money-item {
        padding: 10px;
    }
    
    .c1-container .money-item img {
        width: 60px;
        height: 60px;
    }
    
    .c1-container .money-value {
        font-size: 1em;
    }
    
    .c1-container .answer-options {
        grid-template-columns: 1fr;
    }
    
    .c1-container .answer-option {
        padding: 15px 10px;
        font-size: 1.1em;
    }
    
    .c1-container .game-button {
        padding: 12px 20px;
        font-size: 1em;
    }
}

/* 🖥️ 大螢幕適配 (1200px以上) */
@media (min-width: 1200px) {
    .c1-container .game-container {
        padding: 30px;
    }
    
    .c1-container .settings-panel,
    .c1-container .game-area {
        padding: 40px;
    }
    
    .c1-container .money-display {
        gap: 30px;
    }
    
    .c1-container .answer-options {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
    }
}

/* 🌐 橫向螢幕適配 */
@media (orientation: landscape) and (max-height: 600px) {
    .c1-container .game-title {
        font-size: 1.8em;
        margin-bottom: 5px;
    }
    
    .c1-container .game-subtitle {
        font-size: 0.9em;
        margin-bottom: 15px;
    }
    
    .c1-container .settings-panel {
        padding: 15px;
        margin-bottom: 20px;
    }
    
    .c1-container .game-area {
        padding: 20px;
    }
    
    .c1-container .question-section {
        margin-bottom: 20px;
    }
    
    .c1-container .money-display {
        flex-direction: row;
        gap: 15px;
        margin-bottom: 20px;
        padding: 15px;
    }
    
    .c1-container .button-area {
        margin-top: 20px;
    }
}

/* 👆 觸控優化 */
@media (hover: none) and (pointer: coarse) {
    .c1-container .option-btn,
    .c1-container .answer-option,
    .c1-container .game-button,
    .c1-container .money-item {
        /* 增大觸控目標 */
        min-height: 48px;
        min-width: 48px;
    }
    
    .c1-container .option-btn:hover,
    .c1-container .answer-option:hover,
    .c1-container .game-button:hover,
    .c1-container .money-item:hover {
        /* 移除hover效果，改用:active */
        transform: none;
    }
    
    .c1-container .option-btn:active,
    .c1-container .answer-option:active,
    .c1-container .game-button:active,
    .c1-container .money-item:active {
        transform: scale(0.95);
        opacity: 0.8;
    }
}

/* 🎯 焦點指示器增強 */
@media (any-hover: hover) and (any-pointer: fine) {
    .c1-container .option-btn:focus-visible,
    .c1-container .answer-option:focus-visible,
    .c1-container .game-button:focus-visible {
        outline: 3px solid var(--c1-primary);
        outline-offset: 2px;
    }
}
```

##### Step 3.2.4：修改 C1 HTML檔案
**備份原有檔案**
```bash
cp html/c1_money_types.html html/c1_money_types.html.backup
```

**修改 `html/c1_money_types.html` 的CSS引用：**

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>單元一：認識錢幣和紙鈔</title>
    
    <!-- 🔧 基礎重置 (可選) -->
    <link rel="stylesheet" href="../css/shared/css-reset-minimal.css">
    
    <!-- 📦 C1模組核心樣式 (必需) -->
    <link rel="stylesheet" href="../css/modules/c1-money-types/c1-core.css">
    
    <!-- 🎨 主題支援 (可選) -->
    <link rel="stylesheet" href="../css/modules/c1-money-types/c1-theme.css">
    
    <!-- 📱 響應式支援 (可選) -->
    <link rel="stylesheet" href="../css/modules/c1-money-types/c1-mobile.css">
    
    <!-- ❌ 移除原有的多重CSS引用 -->
    <!-- 
    <link rel="stylesheet" href="../css/ai-theme.css">
    <link rel="stylesheet" href="../css/dark-theme.css">
    <link rel="stylesheet" href="../css/unit6.css">
    -->
    
    <!-- 原有的內嵌樣式保持不變，或可移動到c1-core.css -->
    <style>
        /* 確保 script 標籤不會顯示 */
        script {
            display: none !important;
        }
        
        /* 其他必要的內嵌樣式可保留，或移動到c1-core.css */
    </style>
</head>
<body>
    <!-- 🏠 添加C1模組容器包裝 -->
    <div class="c1-container">
        <div id="app">
            <!-- 原有的HTML內容結構保持不變 -->
            <!-- ... -->
        </div>
    </div>

    <!-- JS檔案保持不變 -->
    <script src="../js/touch-drag-utility.js"></script>
    <script src="../js/c1_money_types.js"></script>
    <script src="../js/theme-system.js"></script>
</body>
</html>
```

##### Step 3.2.5：測試 C1 重構
1. **開啟 C1 頁面測試**
2. **檢查所有功能**：
   - 頁面載入正常
   - 設定面板功能
   - 遊戲交互正常
   - 主題切換工作
   - 響應式佈局
3. **檢查控制台無錯誤**
4. **多螢幕尺寸測試**

> ✅ **檢查點**：C1功能完全正常後，再進行下一個模組

---

### 階段四：主題切換器系統重構 (預估時間：2小時)

#### Step 4.1：提取主題切換器CSS

##### Step 4.1.1：創建主題切換器核心樣式
**檔案：`css/modules/theme-switcher/theme-switcher-core.css`**

```css
/* =================================================================
   主題切換器核心樣式 - 從 theme-system.js 提取
   ================================================================= */

.theme-switcher-container {
    /* 🎨 主題切換器變數 */
    --switcher-primary: var(--primary-color, #00aeff);
    --switcher-bg: var(--background-card, #ffffff);
    --switcher-text: var(--text-primary, #2F4F4F);
    --switcher-text-inverse: var(--text-inverse, #ffffff);
    --switcher-shadow: var(--shadow-medium, 0 4px 12px rgba(0,0,0,0.15));
    --switcher-radius: var(--radius-large, 16px);
    --switcher-transition: var(--transition-normal, 0.3s ease);
    
    /* 📱 定位和層級 */
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    
    /* 🎨 外觀 */
    background: var(--switcher-bg);
    border-radius: var(--switcher-radius);
    padding: 8px;
    box-shadow: var(--switcher-shadow);
    border: 2px solid var(--switcher-primary);
    transition: var(--switcher-transition);
    
    /* 📐 佈局 */
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 140px;
    
    /* 🎯 用戶交互 */
    user-select: none;
}

.theme-switcher-container:hover {
    box-shadow: var(--shadow-heavy, 0 8px 20px rgba(0,0,0,0.2));
    transform: translateY(-2px);
}

/* 🎯 標題列 */
.theme-switcher-header {
    display: flex;
    align-items: center;
    background: rgba(0,0,0,0.1);
    border-radius: 4px 4px 0 0;
}

.theme-switcher-drag-handle {
    cursor: move;
    padding: 4px;
    text-align: center;
    background: rgba(0,0,0,0.1);
    border-radius: 4px 4px 0 0;
    user-select: none;
    flex: 1;
}

.theme-switcher-drag-handle span {
    font-size: 12px;
    opacity: 0.7;
}

.theme-switcher-minimize-btn {
    cursor: pointer;
    padding: 4px 8px;
    background: rgba(0,0,0,0.1);
    border-radius: 0 4px 0 0;
    user-select: none;
    font-size: 12px;
}

.theme-switcher-minimize-btn span {
    opacity: 0.7;
}

/* 📦 內容區域 */
.theme-switcher-content {
    transition: all 0.3s ease;
    overflow: hidden;
}

.theme-switcher-container.minimized .theme-switcher-content {
    height: 0;
    opacity: 0;
}

.theme-switcher-container.minimized .theme-switcher-minimize-btn span {
    transform: rotate(180deg);
    display: inline-block;
}

/* 🎚️ 主題切換區域 */
.theme-toggle {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 140px;
    height: 48px;
    padding: 4px;
    margin: 0 auto 8px auto;
    background: var(--switcher-primary);
    border-radius: var(--switcher-radius);
    position: relative;
    cursor: pointer;
    transition: var(--switcher-transition);
    gap: 0;
}

/* 🎨 滑動背景 */
.theme-toggle::before {
    content: '';
    position: absolute;
    width: 66px;
    height: 40px;
    background: var(--switcher-bg);
    border-radius: 12px;
    transition: var(--switcher-transition);
    box-shadow: var(--shadow-light, 0 2px 8px rgba(0,0,0,0.1));
    left: 4px;
    top: 4px;
    z-index: 0;
    transform: none;
    right: auto;
}

/* AI機器人主題時的背景位置 */
.theme-switcher-container[data-current-theme="ai-robot"] .theme-toggle::before {
    left: 4px !important;
}

/* 深色主題時的背景位置 */
.theme-switcher-container[data-current-theme="dark"] .theme-toggle::before {
    left: 70px !important;
}

[data-theme="dark"] .theme-switcher-container .theme-toggle::before {
    left: 70px !important;
}

html .theme-switcher-container[data-current-theme="dark"] .theme-toggle::before {
    left: 70px !important;
}

/* 🎯 主題選項 */
.theme-option {
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
    color: var(--switcher-text-inverse);
    transition: var(--switcher-transition);
    border-radius: 12px;
    cursor: pointer;
    margin: 0;
    padding: 0;
    top: 4px;
}

.theme-option:first-of-type {
    left: 4px;
}

.theme-option:last-of-type {
    left: 70px;
}

.theme-option.active {
    color: var(--switcher-primary);
}

.theme-option-icon {
    font-size: 18px;
    margin-bottom: 1px;
    display: block;
    line-height: 1;
}

.theme-option-text {
    font-size: 9px;
    font-weight: bold;
    display: block;
    white-space: nowrap;
    line-height: 1;
}

/* 🎨 顏色吸管工具 */
.color-picker-tool {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
    padding: 8px;
    border-top: 1px solid rgba(0,0,0,0.1);
    cursor: pointer;
    transition: var(--switcher-transition);
    border-radius: 6px;
}

.color-picker-tool:hover {
    background: rgba(0,0,0,0.1);
}

.color-picker-tool.active {
    background: var(--switcher-primary);
    color: var(--switcher-text-inverse);
}

.picker-icon {
    font-size: 16px;
}

.picker-text {
    font-size: 12px;
    font-weight: 500;
}

/* 🎨 顏色資訊顯示 */
.color-info-display {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-top: 1px solid rgba(0,0,0,0.1);
    background: rgba(0,0,0,0.05);
    border-radius: 6px;
    margin-top: 4px;
}

.color-code {
    font-family: 'Courier New', monospace;
    font-size: 11px;
    font-weight: bold;
    flex: 1;
}

.color-sample {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid rgba(0,0,0,0.2);
    flex-shrink: 0;
}

.copy-color-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    font-size: 12px;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.copy-color-btn:hover {
    opacity: 1;
}

/* 🧮 計算機按鈕 */
.calculator-section {
    padding: 8px;
    border-top: 1px solid rgba(0,0,0,0.1);
    text-align: center;
}

.calculator-btn {
    background: var(--switcher-primary);
    color: var(--switcher-text-inverse);
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: var(--switcher-transition);
    box-shadow: var(--shadow-light, 0 2px 4px rgba(0,0,0,0.1));
    width: 100%;
}

.calculator-btn:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-medium, 0 4px 8px rgba(0,0,0,0.2));
}

.calculator-btn:active {
    transform: translateY(0);
    box-shadow: var(--shadow-light, 0 2px 4px rgba(0,0,0,0.1));
}

/* 💬 工具提示 */
.theme-switcher-tooltip {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 1001;
}

.theme-switcher-container:hover .theme-switcher-tooltip {
    opacity: 1;
}

/* 🎭 切換動畫 */
.theme-switching {
    animation: theme-switch-pulse 0.3s ease;
}

@keyframes theme-switch-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}
```

##### Step 4.1.2：創建計算機樣式
**檔案：`css/modules/theme-switcher/theme-calculator.css`**

```css
/* =================================================================
   主題切換器 - 計算機功能樣式
   ================================================================= */

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

/* 📱 手機端適配 */
@media (max-width: 768px) {
    .mini-calculator {
        right: 10px;
        width: 200px;
    }
    
    .calculator-buttons button {
        padding: 12px;
        font-size: 14px;
        min-height: 44px;
    }
    
    #calc-display {
        font-size: 16px;
        padding: 10px;
    }
}
```

##### Step 4.1.3：創建顏色吸管樣式
**檔案：`css/modules/theme-switcher/theme-colorpicker.css`**

```css
/* =================================================================
   主題切換器 - 顏色吸管功能樣式
   ================================================================= */

/* 🎨 顏色高亮效果 */
.color-picker-highlight {
    box-shadow: 0 0 10px 2px rgba(102, 126, 234, 0.6) !important;
    position: relative;
    z-index: 1000;
    animation: color-picker-pulse 1s ease-in-out infinite alternate;
}

@keyframes color-picker-pulse {
    from { box-shadow: 0 0 10px 2px rgba(102, 126, 234, 0.6); }
    to { box-shadow: 0 0 15px 4px rgba(102, 126, 234, 0.8); }
}

/* 🎯 吸管模式光標 */
.color-picker-active {
    cursor: crosshair !important;
}

.color-picker-active * {
    cursor: crosshair !important;
}

/* 💬 顏色資訊提示 */
.color-info-tooltip {
    position: fixed;
    background: rgba(0,0,0,0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-family: 'Courier New', monospace;
    z-index: 10000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.color-info-tooltip.visible {
    opacity: 1;
}

/* 🍞 成功提示 Toast */
#color-picker-toast {
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
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

#color-picker-toast.show {
    opacity: 1;
}

/* 📋 複製按鈕動畫 */
.copy-color-btn.copying {
    animation: copy-success 0.3s ease;
}

@keyframes copy-success {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

/* 🎨 色彩樣本動畫 */
.color-sample {
    transition: all 0.3s ease;
}

.color-sample:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

/* 📱 觸控設備優化 */
@media (hover: none) and (pointer: coarse) {
    .color-picker-highlight {
        animation: none;
        box-shadow: 0 0 8px 2px rgba(102, 126, 234, 0.8) !important;
    }
    
    .copy-color-btn {
        min-width: 32px;
        min-height: 32px;
        padding: 6px;
    }
}

/* 🔍 高對比模式 */
@media (prefers-contrast: high) {
    .color-picker-highlight {
        box-shadow: 0 0 10px 2px #000000 !important;
    }
    
    #color-picker-toast {
        background: #000000;
        border: 2px solid #ffffff;
    }
}

/* 🌙 深色主題適配 */
[data-theme="dark"] .color-info-display {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.2);
}

[data-theme="dark"] .color-code {
    color: #ecf0f1;
}

[data-theme="dark"] .copy-color-btn {
    color: #ecf0f1;
}

[data-theme="dark"] .copy-color-btn:hover {
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
}
```

##### Step 4.1.4：修改 theme-system.js
**修改 `js/theme-system.js`，移除內嵌CSS，改為載入外部CSS：**

⚠️ **重要**：這是高風險操作，建議逐步進行

**步驟 4.1.4.1：備份原始檔案**
```bash
# 再次備份 theme-system.js
cp js/theme-system.js js/theme-system.js.step4.backup
```

**步驟 4.1.4.2：先了解原始結構**

開啟 `js/theme-system.js` 找到以下關鍵部分：

1. **`createThemeSwitcher()` 方法**
2. **`switcherStyles` 變數**（包含大量內嵌CSS）
3. **`showCalculator()` 方法**
4. **`calculatorStyles` 變數**（如果存在）

**步驟 4.1.4.3：逐步修改 createThemeSwitcher 方法**

**原始結構範例：**
```javascript
// 修改前的結構（簡化版）
createThemeSwitcher() {
    // ...前面的檢查邏輯...
    
    const switcherStyles = `
        .theme-switcher {
            /* 大量內嵌CSS代碼 */
        }
        // 繼續更多CSS...
    `;
    
    // 插入樣式
    const styleElement = document.createElement('style');
    styleElement.textContent = switcherStyles;
    document.head.appendChild(styleElement);
    
    // 其他功能...
}
```

**修改後的結構：**
```javascript
// js/theme-system.js 中的修改

createThemeSwitcher() {
    try {
        // ✅ 保留原有的基礎檢查
        if (window.location.pathname.includes('color-palette-manager.html')) {
            console.log('在主題設定頁面，跳過建立主題切換器');
            return;
        }

        // ✅ 保留原有的存在性檢查
        if (document.querySelector('.theme-switcher-container')) {
            console.log('主題切換器已存在，跳過建立');
            return;
        }

        // ✅ 保留原有的body檢查
        if (!document.body) {
            console.warn('document.body 不存在，延遲建立主題切換器');
            setTimeout(() => this.createThemeSwitcher(), 100);
            return;
        }

        // ✨ 新增：確保主題切換器CSS已載入
        this.ensureThemeSwitcherCSS();

        // ✅ 保留原有的HTML結構（移除內嵌樣式）
        const switcherHTML = `
            <div class="theme-switcher-container" role="region" aria-label="主題切換">
                <div class="theme-switcher-header">
                    <div class="theme-switcher-drag-handle" 
                         title="拖拽移動主題切換器">
                        <span>⋮⋮</span>
                    </div>
                    <div class="theme-switcher-minimize-btn" 
                         title="點擊縮小視窗">
                        <span>−</span>
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

        // ✅ 保留原有的HTML插入邏輯
        document.body.insertAdjacentHTML('beforeend', switcherHTML);
        
        // ❌ 移除內嵌樣式載入（這部分要移除）
        // const switcherStyles = `...` // 這部分已移動到外部CSS檔案
        // const styleElement = document.createElement('style');
        // styleElement.textContent = switcherStyles;
        // document.head.appendChild(styleElement);
        
        // ✅ 保留原有的後續邏輯
        this.switcher = document.querySelector('.theme-switcher-container');
        if (!this.switcher) {
            throw new Error('無法找到新建立的主題切換器');
        }

        const toggle = this.switcher.querySelector('.theme-toggle');
        if (!toggle) {
            throw new Error('無法找到主題切換按鈕');
        }

        // ✅ 保留原有的事件繫定
        this.bindSwitcherEvents(toggle);
        this.bindMinimizeEvents();
        this.initializeDragFunctionality();
        this.initializeColorPicker();
        this.initializeCalculator();

        // ✅ 保留原有的初始化
        this.updateSwitcherState();
        this.loadMinimizedState();

    } catch (error) {
        console.error('建立主題切換器時發生錯誤:', error);
        this.createFallbackSwitcher();
    }
}

// ✨ 新增方法：確保主題切換器CSS已載入
ensureThemeSwitcherCSS() {
    console.log('🔍 檢查主題切換器CSS狀態...');
    
    const cssFiles = [
        {
            id: 'theme-switcher-core',
            href: this.getAbsolutePath('../css/modules/theme-switcher/theme-switcher-core.css')
        },
        {
            id: 'theme-switcher-calculator', 
            href: this.getAbsolutePath('../css/modules/theme-switcher/theme-calculator.css')
        },
        {
            id: 'theme-switcher-colorpicker',
            href: this.getAbsolutePath('../css/modules/theme-switcher/theme-colorpicker.css')
        }
    ];
    
    cssFiles.forEach(({ id, href }) => {
        const existingLink = document.querySelector(`link[data-theme-css="${id}"]`);
        if (!existingLink) {
            console.log(`🔗 載入CSS: ${id}`);
            this.loadCSS(href, id);
        } else {
            console.log(`✅ CSS已存在: ${id}`);
        }
    });
}

// ✨ 新增方法：動態載入CSS
loadCSS(href, id) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute('data-theme-css', id);
        
        link.onload = () => {
            console.log(`✅ CSS載入成功: ${id}`);
            resolve();
        };
        
        link.onerror = () => {
            console.warn(`⚠️ CSS載入失敗: ${id} (${href})`);
            reject(new Error(`CSS載入失敗: ${href}`));
        };
        
        document.head.appendChild(link);
    });
}

// ✨ 新增方法：獲取絕對路徑
getAbsolutePath(relativePath) {
    // 根據當前頁面路徑調整相對路徑
    const currentPath = window.location.pathname;
    if (currentPath.includes('/html/')) {
        return relativePath; // 已經是正確的相對路徑
    } else {
        // 如果在根目錄，去除 ../ 前綴
        return relativePath.replace('../', '');
    }
}

// ✨ 新增方法：降級切換器（當CSS載入失敗時）
createFallbackSwitcher() {
    console.warn('🚑 建立降級主題切換器...');
    
    // 簡化版本的主題切換器
    const fallbackHTML = `
        <div style="
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: white; 
            border: 2px solid #007bff; 
            border-radius: 10px; 
            padding: 10px; 
            z-index: 1000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        ">
            <button onclick="this.toggleBasicTheme()"
                    style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 5px;
                        cursor: pointer;
                    ">
                切換主題
            </button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', fallbackHTML);
    
    // 簡化版主題切換功能
    window.toggleBasicTheme = () => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'ai-robot' : 'dark';
        html.setAttribute('data-theme', newTheme);
        console.log('降級主題切換:', newTheme);
    };
}
```

**步驟 4.1.4.4：測試中間狀態**

在完成上述修改後，立即測試：

1. **儲存檔案**
2. **重新載入頁面**
3. **檢查主題切換器是否正常顯示**
4. **檢查控制台是否有CSS載入訊息**

**測試腳本：**
```javascript
// 在瀏覽器控制台執行
console.log('=== 主題切換器測試 ===');

// 檢查切換器存在性
const switcher = document.querySelector('.theme-switcher-container');
console.log('切換器存在:', switcher ? '✅' : '❌');

// 檢查CSS載入
const themeCSS = document.querySelectorAll('[data-theme-css]');
console.log('主題相關 CSS 數量:', themeCSS.length);
themeCSS.forEach(link => {
    console.log('  -', link.getAttribute('data-theme-css'), link.href);
});

// 檢查功能性
if (switcher) {
    const toggle = switcher.querySelector('.theme-toggle');
    const colorPicker = switcher.querySelector('.color-picker-tool');
    const calculator = switcher.querySelector('.calculator-btn');
    
    console.log('主題切換按鈕:', toggle ? '✅' : '❌');
    console.log('顏色吸管:', colorPicker ? '✅' : '❌');
    console.log('計算機按鈕:', calculator ? '✅' : '❌');
}
```

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

        // ✅ 新增：確保CSS已載入
        this.ensureThemeSwitcherCSS();

        // 建立主題切換器 HTML（移除內嵌樣式）
        const switcherHTML = `
            <div class="theme-switcher-container" role="region" aria-label="主題切換">
                <div class="theme-switcher-header">
                    <div class="theme-switcher-drag-handle" 
                         title="拖拽移動主題切換器">
                        <span>⋮⋮</span>
                    </div>
                    <div class="theme-switcher-minimize-btn" 
                         title="點擊縮小視窗">
                        <span>−</span>
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
        
        // ❌ 移除內嵌樣式載入
        // const switcherStyles = `...` // 這部分已移動到外部CSS
        
        // 獲取切換器元素
        this.switcher = document.querySelector('.theme-switcher-container'); // 注意類名變更
        if (!this.switcher) {
            throw new Error('無法找到新建立的主題切換器');
        }

        const toggle = this.switcher.querySelector('.theme-toggle');
        if (!toggle) {
            throw new Error('無法找到主題切換按鈕');
        }

        // 綁定事件（保持不變）
        this.bindSwitcherEvents(toggle);
        this.bindMinimizeEvents();
        this.initializeDragFunctionality();
        this.initializeColorPicker();
        this.initializeCalculator();

        // 初始化狀態
        this.updateSwitcherState();
        this.loadMinimizedState();

    } catch (error) {
        console.error('建立主題切換器時發生錯誤:', error);
        this.createFallbackSwitcher();
    }
}

// ✅ 新增方法：確保主題切換器CSS已載入
ensureThemeSwitcherCSS() {
    const cssFiles = [
        '../css/modules/theme-switcher/theme-switcher-core.css',
        '../css/modules/theme-switcher/theme-calculator.css',
        '../css/modules/theme-switcher/theme-colorpicker.css'
    ];
    
    cssFiles.forEach(href => {
        if (!document.querySelector(`link[href*="${href.split('/').pop()}"]`)) {
            this.loadCSS(href);
        }
    });
}

// ✅ 新增方法：動態載入CSS
loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    console.log(`已載入CSS: ${href}`);
}
```

#### Step 4.2：更新計算機樣式載入

在 `showCalculator()` 方法中，移除內嵌的計算機樣式，改為：

```javascript
// 修改 showCalculator 方法
showCalculator() {
    // 檢查是否已存在計算機
    if (document.getElementById('mini-calculator')) {
        document.getElementById('mini-calculator').remove();
        return;
    }

    // ✅ 確保計算機CSS已載入（已在ensureThemeSwitcherCSS中處理）
    
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

    // ❌ 移除內嵌樣式載入
    // const calculatorStyles = `...` // 已移動到外部CSS檔案
    
    // 添加計算機到頁面
    document.body.insertAdjacentHTML('beforeend', calculatorHTML);
    
    // 使計算機可拖拽（保持不變）
    this.makeCalculatorDraggable();
}
```

#### Step 4.3：測試主題切換器重構

1. **測試所有使用主題切換器的頁面**：
   - index.html
   - 所有C系列頁面
   - 所有F系列頁面
   - 所有A系列頁面

2. **檢查主題切換器功能**：
   - 主題切換正常
   - 顏色吸管工具正常
   - 計算機功能正常
   - 拖拽功能正常
   - 最小化功能正常

3. **檢查CSS載入**：
   - 開發者工具網路面板確認CSS檔案載入
   - 檢查控制台無CSS載入錯誤
   - 確認視覺樣式正確

---

### 階段五：其他模組重構模板 (按需進行)

⚠️ **重要提醒**：只有前面階段完全成功後才能進行這一階段！

#### 重構前的必要檢查

**必須確認的狀態：**
- [ ] index.html 重構完成且功能100%正常
- [ ] C1 模組重構完成且功能100%正常
- [ ] 主題切換器重構完成且功能100%正常
- [ ] 所有原有功能都保持完整
- [ ] 效能無明顯降低
- [ ] 未出現新的錯誤或問題

**如果上述任何項目未滿足，請先修復再繼續！**

> 💡 **提示**：以下步驟可以根據需要逐一進行，每完成一個模組都進行測試

#### C3 金錢兌換模組重構模板

**目錄結構：**
```
css/modules/c3-money-exchange/
├── c3-core.css          # 核心拖拽和兌換邏輯樣式
├── c3-theme.css         # 主題支援
└── c3-mobile.css        # 響應式適配
```

**HTML 修改：**
```html
<!-- html/c3_money_exchange.html -->
<link rel="stylesheet" href="../css/shared/css-reset-minimal.css">
<link rel="stylesheet" href="../css/modules/c3-money-exchange/c3-core.css">
<link rel="stylesheet" href="../css/modules/c3-money-exchange/c3-theme.css">
<link rel="stylesheet" href="../css/modules/c3-money-exchange/c3-mobile.css">

<body>
    <div class="c3-container">
        <!-- 原有內容 -->
    </div>
</body>
```

#### F4/F5 模組重構模板

**處理內嵌樣式：**
1. **提取模板JS中的內嵌樣式**
2. **移動到對應的CSS檔案**
3. **使用CSS類名替代內嵌style**

**範例：**
```javascript
// templates/f4-number-sorting-templates.js 修改前
`<button style="padding: 8px 12px; border: 2px solid #007bff;">播放</button>`

// 修改後
`<button class="f4-play-button">播放</button>`
```

```css
/* css/modules/f4-number-sorting/f4-core.css 新增 */
.f4-container .f4-play-button {
    padding: 8px 12px;
    border: 2px solid var(--f4-primary, #007bff);
    /* 其他樣式... */
}
```

---

## 🧪 測試與驗證

### 全面測試檢查清單

#### 功能測試
- [ ] 所有頁面正常載入
- [ ] 主題切換功能正常
- [ ] 響應式佈局正確
- [ ] 拖拽交互正常
- [ ] 語音功能正常
- [ ] 計算機功能正常
- [ ] 顏色吸管正常

#### 效能測試
- [ ] 頁面載入速度無明顯降低
- [ ] CSS檔案大小合理
- [ ] 瀏覽器快取生效
- [ ] 無重複的CSS載入

#### 相容性測試
- [ ] Chrome/Safari/Firefox正常
- [ ] 手機/平板/桌面正常
- [ ] 不同螢幕尺寸正常
- [ ] 觸控/滑鼠操作正常

### 🔧 進階除錯工具

#### 全面CSS變數檢測器

**功能完整版本：**
```javascript
/**
 * 全面CSS變數檢測器
 * 用於檢查模組獨立性和變數衝突
 */
function debugCSSVariables(containerSelector = 'body') {
    console.log(`=== CSS變數檢測: ${containerSelector} ===`);
    
    const element = document.querySelector(containerSelector);
    if (!element) {
        console.error(`❌ 找不到元素: ${containerSelector}`);
        return;
    }
    
    const styles = getComputedStyle(element);
    const cssVars = {};
    const fallbackVars = {};
    const unusedVars = {};
    
    // 收集所有CSS變數
    for (let prop of Array.from(styles)) {
        if (prop.startsWith('--')) {
            const value = styles.getPropertyValue(prop).trim();
            
            // 檢查是否使用var()
            if (value.includes('var(')) {
                fallbackVars[prop] = value;
            } else {
                cssVars[prop] = value;
            }
            
            // 檢查是否為空值
            if (!value || value === 'initial' || value === 'unset') {
                unusedVars[prop] = value;
            }
        }
    }
    
    console.log('📋 基礎變數 (' + Object.keys(cssVars).length + '個):');
    console.table(cssVars);
    
    console.log('🔗 Fallback變數 (' + Object.keys(fallbackVars).length + '個):');
    console.table(fallbackVars);
    
    if (Object.keys(unusedVars).length > 0) {
        console.log('⚠️ 可能未使用的變數:');
        console.table(unusedVars);
    }
    
    // 檢查變數命名規範
    const namingIssues = [];
    Object.keys(cssVars).forEach(varName => {
        if (!varName.includes('-') || varName.length < 10) {
            namingIssues.push(varName);
        }
    });
    
    if (namingIssues.length > 0) {
        console.log('🔍 命名規範建議:');
        namingIssues.forEach(varName => {
            console.log(`  ${varName} -> 建議使用更具描述性的命名`);
        });
    }
    
    return { cssVars, fallbackVars, unusedVars, namingIssues };
}

// 快速檢查所有模組
function checkAllModules() {
    const modules = [
        '.index-container',
        '.c1-container', 
        '.c2-container',
        '.c3-container',
        '.f4-container',
        '.f5-container',
        '.theme-switcher-container'
    ];
    
    modules.forEach(moduleSelector => {
        if (document.querySelector(moduleSelector)) {
            debugCSSVariables(moduleSelector);
        }
    });
}
```

#### 詳細CSS載入分析器

```javascript
/**
 * CSS載入狀態分析器
 * 檢查檔案載入狀態、大小、重複等
 */
function analyzeCSSFiles() {
    console.log('=== CSS檔案載入分析 ===');
    
    const stylesheets = Array.from(document.styleSheets);
    const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    console.log(`總共 ${stylesheets.length} 個CSS謄表，${linkElements.length} 個外部連結`);
    
    // 分析外部CSS檔案
    const fileAnalysis = [];
    const duplicates = {};
    
    linkElements.forEach((link, index) => {
        const href = link.href;
        const fileName = href ? href.split('/').pop() : '內嵌CSS';
        const isModular = href.includes('/modules/');
        const isShared = href.includes('/shared/');
        const isTheme = href.includes('theme');
        
        // 檢查重複
        if (duplicates[fileName]) {
            duplicates[fileName].count++;
            duplicates[fileName].elements.push(link);
        } else {
            duplicates[fileName] = { count: 1, elements: [link] };
        }
        
        fileAnalysis.push({
            '索引': index + 1,
            '檔名': fileName,
            '類型': isModular ? '模組' : isShared ? '共用' : isTheme ? '主題' : '傳統',
            '路徑': href.replace(window.location.origin, ''),
            '禁用': link.disabled ? '是' : '否',
            '媒體': link.media || '全部'
        });
    });
    
    console.table(fileAnalysis);
    
    // 檢查重複載入
    const duplicateFiles = Object.entries(duplicates).filter(([name, info]) => info.count > 1);
    if (duplicateFiles.length > 0) {
        console.log('⚠️ 檢測到重複載入:');
        duplicateFiles.forEach(([name, info]) => {
            console.log(`  ${name}: 載入${info.count}次`);
        });
    }
    
    // 檢查載入失敗
    checkCSSLoadErrors();
    
    return { fileAnalysis, duplicates };
}

// CSS載入錯誤檢查
function checkCSSLoadErrors() {
    console.log('🔍 檢查CSS載入錯誤...');
    
    // 監聽新的CSS載入錯誤
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
                    node.onerror = function() {
                        console.error(`❌ CSS載入失敗: ${node.href}`);
                    };
                    node.onload = function() {
                        console.log(`✅ CSS載入成功: ${node.href.split('/').pop()}`);
                    };
                }
            });
        });
    });
    
    observer.observe(document.head, { childList: true });
    
    // 檢查現有CSS狀態
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        // 嘗試訪問樣式表
        try {
            const rules = link.sheet ? link.sheet.cssRules : null;
            if (rules === null && !link.disabled) {
                console.warn(`⚠️ 無法訪問CSS規則: ${link.href}`);
            }
        } catch (e) {
            if (e.name === 'SecurityError') {
                console.info(`🔒 跨域 CSS 限制: ${link.href}`);
            } else {
                console.error(`❌ CSS錯誤: ${link.href}`, e);
            }
        }
    });
}
```

#### 響應式設計測試器

```javascript
/**
 * 響應式設計測試器
 * 模擬不同設備尺寸並檢查佈局
 */
function testResponsiveDesign() {
    console.log('=== 響應式設計測試 ===');
    
    const testSizes = [
        { name: '手機端 (小)', width: 320, height: 568 },
        { name: '手機端 (中)', width: 375, height: 667 },
        { name: '手機端 (大)', width: 414, height: 896 },
        { name: '平板端', width: 768, height: 1024 },
        { name: '桌面端 (小)', width: 1024, height: 768 },
        { name: '桌面端 (大)', width: 1440, height: 900 },
        { name: '4K顯展', width: 2560, height: 1440 }
    ];
    
    const originalSize = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    const results = [];
    
    testSizes.forEach(size => {
        // 模擬視窗大小變更
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: size.width
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: size.height
        });
        
        // 觸發resize事件
        window.dispatchEvent(new Event('resize'));
        
        // 等待一小段時間讓樣式更新
        setTimeout(() => {
            const container = document.querySelector('.index-container, .c1-container, .c3-container');
            if (container) {
                const styles = getComputedStyle(container);
                results.push({
                    '設備': size.name,
                    '尺寸': `${size.width}x${size.height}`,
                    '字體': styles.fontSize,
                    '內邊距': styles.padding,
                    '寬度': styles.width,
                    '最大寬度': styles.maxWidth,
                    'Flexbox方向': styles.flexDirection || 'N/A'
                });
            }
        }, 100);
    });
    
    // 還原原始尺寸
    setTimeout(() => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalSize.width
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: originalSize.height
        });
        window.dispatchEvent(new Event('resize'));
        
        console.table(results);
        console.log('🔄 已還原原始視窗尺寸');
    }, testSizes.length * 150);
}
```

#### 模組獨立性驗證器

```javascript
/**
 * 模組獨立性驗證器
 * 檢查模組間是否相互影響
 */
function validateModuleIndependence() {
    console.log('=== 模組獨立性驗證 ===');
    
    const modules = [
        { name: '主頁', selector: '.index-container', prefix: '--index-' },
        { name: 'C1金錢種類', selector: '.c1-container', prefix: '--c1-' },
        { name: 'C2金錢計數', selector: '.c2-container', prefix: '--c2-' },
        { name: 'C3金錢兌換', selector: '.c3-container', prefix: '--c3-' },
        { name: '主題切換器', selector: '.theme-switcher-container', prefix: '--switcher-' }
    ];
    
    const conflicts = [];
    const allVariables = new Map();
    
    modules.forEach(moduleA => {
        const elementA = document.querySelector(moduleA.selector);
        if (!elementA) return;
        
        const stylesA = getComputedStyle(elementA);
        const varsA = [];
        
        for (let prop of Array.from(stylesA)) {
            if (prop.startsWith('--')) {
                varsA.push(prop);
                
                // 檢查變數是否符合模組命名規範
                if (!prop.startsWith(moduleA.prefix) && !prop.startsWith('--design-')) {
                    conflicts.push({
                        '模組': moduleA.name,
                        '問題': '變數命名不符合規範',
                        '變數': prop,
                        '期望前綴': moduleA.prefix
                    });
                }
                
                // 檢查全域變數衝突
                if (allVariables.has(prop)) {
                    const existingModule = allVariables.get(prop);
                    if (existingModule !== moduleA.name) {
                        conflicts.push({
                            '模組': `${existingModule} vs ${moduleA.name}`,
                            '問題': '變數名稱衝突',
                            '變數': prop,
                            '建議': '使用模組獨有前綴'
                        });
                    }
                } else {
                    allVariables.set(prop, moduleA.name);
                }
            }
        }
        
        console.log(`${moduleA.name}: ${varsA.length}個變數`);
    });
    
    if (conflicts.length > 0) {
        console.log('⚠️ 發現模組獨立性問題:');
        console.table(conflicts);
    } else {
        console.log('✅ 模組獨立性驗證通過');
    }
    
    return conflicts;
}
```

#### 性能監控工具

```javascript
/**
 * 性能監控工具
 * 監控CSS載入時間、繪染性能等
 */
function monitorPerformance() {
    console.log('=== CSS性能監控 ===');
    
    // CSS載入時間分析
    if (performance.getEntriesByType) {
        const resources = performance.getEntriesByType('resource');
        const cssResources = resources.filter(r => r.name.includes('.css'));
        
        const cssAnalysis = cssResources.map(css => ({
            '檔名': css.name.split('/').pop(),
            '大小(KB)': Math.round(css.transferSize / 1024),
            '載入時間(ms)': Math.round(css.loadEnd - css.loadStart),
            'DNS查詢(ms)': Math.round(css.domainLookupEnd - css.domainLookupStart),
            '連線時間(ms)': Math.round(css.connectEnd - css.connectStart),
            '狀態': css.transferSize > 0 ? '成功' : '可能失敗'
        }));
        
        console.table(cssAnalysis);
        
        // 總結
        const totalSize = cssAnalysis.reduce((sum, css) => sum + css['大小(KB)'], 0);
        const totalLoadTime = cssAnalysis.reduce((sum, css) => sum + css['載入時間(ms)'], 0);
        
        console.log(`📊 CSS總結: ${cssAnalysis.length}個檔案，總大小 ${totalSize}KB，總載入時間 ${totalLoadTime}ms`);
        
        // 性能建議
        const largeCSSFiles = cssAnalysis.filter(css => css['大小(KB)'] > 50);
        const slowCSSFiles = cssAnalysis.filter(css => css['載入時間(ms)'] > 200);
        
        if (largeCSSFiles.length > 0) {
            console.log('⚠️ 猶似偏大的CSS檔案:');
            largeCSSFiles.forEach(css => {
                console.log(`  ${css['檔名']}: ${css['大小(KB)']}KB`);
            });
        }
        
        if (slowCSSFiles.length > 0) {
            console.log('⚠️ 載入較慢的CSS檔案:');
            slowCSSFiles.forEach(css => {
                console.log(`  ${css['檔名']}: ${css['載入時間(ms)']}ms`);
            });
        }
    }
    
    // 繪染性能監控
    monitorRenderPerformance();
}

// 繪染性能監控
function monitorRenderPerformance() {
    let renderCount = 0;
    let lastRenderTime = performance.now();
    
    const observer = new MutationObserver(function(mutations) {
        renderCount++;
        const currentTime = performance.now();
        const renderDelta = currentTime - lastRenderTime;
        
        if (renderDelta < 16.67) { // 60fps = 16.67ms
            console.log(`✅ 渲染性能良好: ${renderDelta.toFixed(2)}ms`);
        } else if (renderDelta < 33.33) { // 30fps
            console.log(`⚠️ 渲染較慢: ${renderDelta.toFixed(2)}ms`);
        } else {
            console.log(`❌ 渲染停頓: ${renderDelta.toFixed(2)}ms`);
        }
        
        lastRenderTime = currentTime;
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });
    
    console.log('🔍 開始監控渲染性能...');
}
```

#### 一鍵診斷工具

```javascript
/**
 * CSS重構一鍵診斷工具
 * 綜合執行上述所有檢查
 */
function runFullDiagnostics() {
    console.clear();
    console.log('🚀 開始全面CSS診斷...');
    console.log('='.repeat(50));
    
    try {
        // 1. 基礎資訊
        console.log('📝 基礎資訊:');
        console.log(`瀏覽器: ${navigator.userAgent.split(' ').pop()}`);
        console.log(`視窗尺寸: ${window.innerWidth}x${window.innerHeight}`);
        console.log(`像素比: ${window.devicePixelRatio}`);
        console.log(`當前主題: ${document.documentElement.getAttribute('data-theme') || '預設'}`);
        console.log('');
        
        // 2. CSS檔案分析
        analyzeCSSFiles();
        console.log('');
        
        // 3. 模組獨立性檢查
        validateModuleIndependence();
        console.log('');
        
        // 4. CSS變數檢查
        checkAllModules();
        console.log('');
        
        // 5. 性能分析
        monitorPerformance();
        console.log('');
        
        // 6. 總結建議
        console.log('🎆 診斷完成！');
        console.log('🔍 建議檢查上方的所有警告和錯誤');
        console.log('🔧 如遇問題，可使用回滾腳本恢復');
        
    } catch (error) {
        console.error('❌ 診斷過程中發生錯誤:', error);
    }
}

// 快捷指令
console.log('🎉 CSS診斷工具已載入！');
console.log('🚀 使用 runFullDiagnostics() 開始全面檢查');
console.log('🔧 或使用個別功能:');
console.log('  - analyzeCSSFiles() - CSS檔案分析');
console.log('  - checkAllModules() - 所有模組變數檢查');
console.log('  - validateModuleIndependence() - 模組獨立性驗證');
console.log('  - testResponsiveDesign() - 響應式設計測試');
console.log('  - monitorPerformance() - 性能監控');
```

---

## 🔧 維護指南

### 新增模組步驟

1. **創建模組目錄**
   ```bash
   mkdir -p css/modules/new-module
   ```

2. **創建標準檔案**
   ```bash
   touch css/modules/new-module/new-module-core.css
   touch css/modules/new-module/new-module-theme.css
   touch css/modules/new-module/new-module-mobile.css
   ```

3. **使用模組樣板**
   ```css
   /* new-module-core.css */
   .new-module-container {
       --module-primary: var(--design-primary-blue, #00aeff);
       /* 模組變數定義 */
   }
   
   .new-module-container .component {
       /* 模組專用樣式 */
   }
   ```

### 修改現有模組步驟

1. **修改前備份**
2. **在對應的模組CSS檔案中修改**
3. **測試功能正常**
4. **檢查無樣式洩漏**

### 全域變數管理

- **新增全域變數**：在 `css/shared/design-tokens.css` 中新增
- **模組專用變數**：在模組的 `-core.css` 檔案中定義
- **避免衝突**：使用模組前綴命名

---

## 📋 重構完成檢查清單

### 階段完成標記

- [ ] **階段一**：準備與備份完成
- [ ] **階段二**：基礎共用檔案建立完成  
- [ ] **階段三**：主頁(index.html)重構完成並測試通過
- [ ] **階段三**：C1模組重構完成並測試通過
- [ ] **階段四**：主題切換器重構完成並測試通過
- [ ] **階段五**：其他模組按需重構完成

### 最終驗證

- [ ] 所有原有功能正常運行
- [ ] 視覺樣式保持一致
- [ ] 效能無明顯降低  
- [ ] 程式碼組織清晰
- [ ] 維護成本降低

---

## 📞 問題解決

### 常見問題

**Q: 重構後頁面樣式跑掉了怎麼辦？**

A: 
1. 檢查CSS檔案路徑是否正確
2. 檢查模組容器類名是否正確添加
3. 檢查瀏覽器控制台CSS載入錯誤
4. 使用備份檔案回滾並重新操作

**Q: CSS變數不生效怎麼辦？**

A:
1. 檢查變數定義的作用域
2. 確認變數名稱拼寫正確
3. 檢查CSS載入順序
4. 使用開發者工具檢查計算樣式

**Q: 主題切換器不顯示怎麼辦？**

A:
1. 檢查theme-system.js是否正確載入
2. 檢查主題切換器CSS是否載入
3. 檢查控制台JavaScript錯誤
4. 確認模組容器添加正確

**Q: 手機端樣式異常怎麼辦？**

A:
1. 檢查響應式CSS是否載入
2. 測試不同螢幕尺寸
3. 檢查觸控事件是否正常
4. 確認媒體查詢語法正確

### 🚨 緊急回滾步驟

⚠️ **緊急情況使用**：當重構導致嚴重錯誤或頁面無法正常運作時

#### 第一時間回滾（全自動）

**Windows 環境：**
```batch
@echo off
echo 🚨 緊急回滾 CSS 重構...
echo.

echo 🔁 步驟 1: 恢復 HTML 檔案...
if exist "index.html.backup" (
    copy /Y "index.html.backup" "index.html"
    echo    ✅ index.html 已恢復
) else (
    echo    ⚠️ index.html 備份不存在
)

if exist "html\c1_money_types.html.backup" (
    copy /Y "html\c1_money_types.html.backup" "html\c1_money_types.html"
    echo    ✅ c1_money_types.html 已恢復
) else (
    echo    ⚠️ c1_money_types.html 備份不存在
)

echo.
echo 🔁 步驟 2: 恢復 JavaScript 檔案...
if exist "js\theme-system.js.backup" (
    copy /Y "js\theme-system.js.backup" "js\theme-system.js"
    echo    ✅ theme-system.js 已恢復
) else (
    echo    ⚠️ theme-system.js 備份不存在
)

echo.
echo 🔁 步驟 3: 恢復原始 CSS 檔案...
for %%f in (css\temp-backup\*.css) do (
    copy /Y "%%f" "css\"
    echo    ✅ 已恢復 %%~nxf
)

echo.
echo 🔁 步驟 4: 清理新建的模組檔案...
if exist "css\modules" (
    echo    移除新建的模組目錄...
    rmdir /S /Q "css\modules"
    echo    ✅ 模組目錄已移除
)

if exist "css\shared" (
    echo    移除新建的共用目錄...
    rmdir /S /Q "css\shared"
    echo    ✅ 共用目錄已移除
)

echo.
echo 🎆 緊急回滾完成！
echo 🔍 請重新載入瀏覽器測試功能是否正常
echo 📝 建議檢查錯誤日誌後再次嘗試重構
echo.
pause
```

**Unix/Linux/macOS 環境：**
```bash
#!/bin/bash
echo "🚨 緊急回滾 CSS 重構..."
echo

echo "🔁 步驟 1: 恢復 HTML 檔案..."
if [[ -f "index.html.backup" ]]; then
    cp "index.html.backup" "index.html"
    echo "    ✅ index.html 已恢復"
else
    echo "    ⚠️ index.html 備份不存在"
fi

if [[ -f "html/c1_money_types.html.backup" ]]; then
    cp "html/c1_money_types.html.backup" "html/c1_money_types.html"
    echo "    ✅ c1_money_types.html 已恢復"
else
    echo "    ⚠️ c1_money_types.html 備份不存在"
fi

echo
echo "🔁 步驟 2: 恢復 JavaScript 檔案..."
if [[ -f "js/theme-system.js.backup" ]]; then
    cp "js/theme-system.js.backup" "js/theme-system.js"
    echo "    ✅ theme-system.js 已恢復"
else
    echo "    ⚠️ theme-system.js 備份不存在"
fi

echo
echo "🔁 步驟 3: 恢復原始 CSS 檔案..."
if [[ -d "css/temp-backup" ]]; then
    for file in css/temp-backup/*.css; do
        if [[ -f "$file" ]]; then
            filename=$(basename "$file")
            cp "$file" "css/$filename"
            echo "    ✅ 已恢復 $filename"
        fi
    done
else
    echo "    ⚠️ 備份目錄不存在"
fi

echo
echo "🔁 步驟 4: 清理新建的模組檔案..."
if [[ -d "css/modules" ]]; then
    echo "    移除新建的模組目錄..."
    rm -rf "css/modules"
    echo "    ✅ 模組目錄已移除"
fi

if [[ -d "css/shared" ]]; then
    echo "    移除新建的共用目錄..."
    rm -rf "css/shared"
    echo "    ✅ 共用目錄已移除"
fi

echo
echo "🎆 緊急回滾完成！"
echo "🔍 請重新載入瀏覽器測試功能是否正常"
echo "📝 建議檢查錯誤日誌後再次嘗試重構"
echo
```

#### 手動分步回滾（如果自動腳本失效）

**步驟 1：立即停止當前操作**
```bash
# 關閉所有文字編輯器
# 不要儲存任何正在編輯的檔案
```

**步驟 2：確認備份檔案存在**
```bash
# Windows
dir *.backup
dir html\*.backup  
dir js\*.backup
dir css\temp-backup\*.css

# Unix/Linux/macOS
ls -la *.backup
ls -la html/*.backup
ls -la js/*.backup
ls -la css/temp-backup/*.css
```

**步驟 3：逐一恢復關鍵檔案**
```bash
# 3.1 恢復 index.html
cp index.html.backup index.html

# 3.2 恢復 C1 檔案
cp html/c1_money_types.html.backup html/c1_money_types.html

# 3.3 恢復 theme-system.js
cp js/theme-system.js.backup js/theme-system.js

# 3.4 恢復原始 CSS 檔案
cp css/temp-backup/*.css css/
```

**步驟 4：清理新建檔案（可選）**
```bash
# 移除模組目錄
rm -rf css/modules
rm -rf css/shared

# 或者重命名保留
md css/modules-failed  # Windows
mkdir css/modules-failed  # Unix
mv css/modules css/modules-failed
mv css/shared css/shared-failed
```

**步驟 5：驗證回滾成功**
```bash
# 開啟瀏覽器測試：
# 1. index.html - 主頁正常載入
# 2. html/c1_money_types.html - C1正常運作
# 3. 主題切換器正常顯示
# 4. 所有功能正常使用
```

#### 版本控制回滾（如果使用Git）

**安全回滾（保留修改）：**
```bash
# 儲存當前狀態為備份
git stash push -m "重構過程中的修改備份"

# 回到重構前狀態
git checkout HEAD~1  # 或指定的commit hash

# 檢查狀態
git status
git log --oneline -5
```

**強制回滾（捨棄修改）：**
```bash
# 警告：這將永久失去所有未提交的修改
git reset --hard HEAD~1

# 清理未追蹤的檔案
git clean -fd
```

#### 回滾後的設定清單

**必做項目：**
- [ ] 重新載入所有瀏覽器頁面
- [ ] 清除瀏覽器快取 (Ctrl+F5 或 Cmd+Shift+R)
- [ ] 測試主要功能是否正常
- [ ] 檢查控制台無錯誤訊息
- [ ] 驗證主題切換功能

**建議項目：**
- [ ] 檢查所有備份檔案是否完整
- [ ] 更新重構計劃，轉為更小的步驟
- [ ] 記錄失敗原因和經驗教訓
- [ ] 考慮專業支持或建議

#### 防止重複問題的措施

**未來重構建議：**
1. **更小的增量步驟**：每次只修改一個檔案
2. **更頻繁的測試**：每步修改後都要測試
3. **更多的備份點**：每個步驟都創建備份
4. **更好的測試工具**：使用上方的診斷工具
5. **專業諮詢**：複雜改動前先諮詢經驗豐富的開發者

**緊急聯絡資訊：**
- 專案文件：`CSS_REFACTORING_GUIDE.md`
- 備份位置：`css/temp-backup/`, `*.backup` 檔案
- 日誌檔案：瀏覽器開發者工具 > Console
- 問題回報：[項目 GitHub Issues]

🔥 **特別提醒**：如果與此同時還在進行其他重要修改，請先停止並備份，然後再執行回滾！

---

## 🎯 總結

這個重構指南提供了：

- **階段性方案**：可以逐步實施，降低風險
- **模組獨立**：保證各模組不相互影響
- **詳細步驟**：每個步驟都有具體的程式碼範例
- **測試驗證**：確保功能完整性
- **問題解決**：提供常見問題的解決方案
- **維護指南**：後續開發的規範和模版

通過這個架構，你可以實現：
- ✅ **樣式一致性**：統一的視覺體驗
- ✅ **模組獨立性**：各模組互不影響
- ✅ **維護性**：清晰的檔案組織
- ✅ **擴展性**：易於新增功能
- ✅ **效能優化**：按需載入，減少冗餘

**建議實施順序：**
1. 先完成準備工作和基礎檔案
2. 重構主頁(index.html)並測試
3. 重構一個核心模組(如C1)並測試
4. 重構主題切換器並測試
5. 其他模組按優先級逐一重構

記住：**一次只做一個模組，完成測試後再進行下一個！**

---

## 📚 附錄：完整實施檢查清單

### 📅 日報表格

**這個表格可以列印或用於記錄進度：**

| 階段 | 任務 | 預估時間 | 實際時間 | 狀態 | 測試結果 | 備註 |
|------|------|----------|----------|------|----------|---------|
| 1.1 | 環境檢查與準備 | 30min | _____ | ☐ | ☐ | |
| 1.2 | 完整備份現有檔案 | 30min | _____ | ☐ | ☐ | |
| 1.3 | 版本控制檢查點 | 20min | _____ | ☐ | ☐ | |
| 2.1 | 創建最小化重置檔案 | 30min | _____ | ☐ | ☐ | |
| 2.2 | 創建設計規範庫 | 60min | _____ | ☐ | ☐ | |
| 3.1.1 | 主頁核心樣式 | 90min | _____ | ☐ | ☐ | |
| 3.1.2 | 主頁主題支援 | 45min | _____ | ☐ | ☐ | |
| 3.1.3 | 主頁響應式支援 | 45min | _____ | ☐ | ☐ | |
| 3.1.4 | 修改 index.html | 60min | _____ | ☐ | ☐ | |
| 3.1.5 | 全面測試主頁重構 | 90min | _____ | ☐ | ☐ | |
| 3.2.1 | C1 核心樣式 | 120min | _____ | ☐ | ☐ | |
| 3.2.2 | C1 主題支援 | 45min | _____ | ☐ | ☐ | |
| 3.2.3 | C1 響應式支援 | 60min | _____ | ☐ | ☐ | |
| 3.2.4 | 修改 C1 HTML檔案 | 45min | _____ | ☐ | ☐ | |
| 3.2.5 | 測試 C1 重構 | 60min | _____ | ☐ | ☐ | |
| 4.1.1 | 主題切換器核心樣式 | 90min | _____ | ☐ | ☐ | |
| 4.1.2 | 計算機樣式 | 45min | _____ | ☐ | ☐ | |
| 4.1.3 | 顏色吸管樣式 | 45min | _____ | ☐ | ☐ | |
| 4.1.4 | 修改 theme-system.js | 120min | _____ | ☐ | ☐ | |
| 4.3 | 測試主題切換器重構 | 90min | _____ | ☐ | ☐ | |

**總計預估時間：16.5小時**

### 🎨 CSS檔案大小追蹤表

**用於監控檔案大小和效能：**

| 檔案名稱 | 重構前 | 重構後 | 差異 | 狀態 |
|------------|-------|-------|------|------|
| 總 CSS 大小 | ___KB | ___KB | ___KB | ☐ |
| index-core.css | N/A | ___KB | +___KB | ☐ |
| index-theme.css | N/A | ___KB | +___KB | ☐ |
| index-mobile.css | N/A | ___KB | +___KB | ☐ |
| c1-core.css | N/A | ___KB | +___KB | ☐ |
| c1-theme.css | N/A | ___KB | +___KB | ☐ |
| c1-mobile.css | N/A | ___KB | +___KB | ☐ |
| theme-switcher-core.css | N/A | ___KB | +___KB | ☐ |
| theme-calculator.css | N/A | ___KB | +___KB | ☐ |
| theme-colorpicker.css | N/A | ___KB | +___KB | ☐ |
| 載入時間 | ___ms | ___ms | ___ms | ☐ |

### 🧩 問題追蹤與解決表

**遇到問題時用於記錄和追蹤：**

| 日期/時間 | 問題描述 | 影響範圍 | 解決方案 | 狀態 | 費時 |
|------------|----------|----------|----------|------|------|
| __/__ __:__ | | | | ☐ | ___min |
| __/__ __:__ | | | | ☐ | ___min |
| __/__ __:__ | | | | ☐ | ___min |
| __/__ __:__ | | | | ☐ | ___min |
| __/__ __:__ | | | | ☐ | ___min |

**常見問題快速參考：**
- 樣式不生效 → 檢查CSS路徑、容器類名、變數名稱
- 頁面空白 → 檢查JavaScript錯誤、HTML結構、CSS載入
- 主題切換器不顯示 → 檢查設置方法、CSS載入、JavaScript錯誤
- 響應式異常 → 檢查媒體查詢、視窗大小、CSS解析度

### 🔮 測試用例表

**每個模組完成後執行以下測試：**

#### 主頁 (index.html) 測試清單
- [ ] 頁面正常載入，無錯誤訊息
- [ ] 所有頁籤可以正常切換
- [ ] 單元按鈕的hover效果正常
- [ ] 所有連結都可以正常點擊跳轉
- [ ] AI機器人動畫正常運作
- [ ] 響應式設計在手機和平板上正常顯示
- [ ] 主題切換器正常顯示和工作

#### C1 單元測試清單
- [ ] 頁面正常載入，無錯誤訊息
- [ ] 難度、題數、主題選項切換正常
- [ ] 「開始遊戲」按鈕功能正常
- [ ] 金錢圖片正常顯示，可以點擊選擇
- [ ] 答案選項的鼠標懸停和點擊效果正常
- [ ] 正確和錯誤答案的視覺回饋正常
- [ ] 響應式設計在不同設備上正常
- [ ] 主題切換器在C1中正常工作

#### 主題切換器測試清單  
- [ ] 在所有頁面中都正常顯示
- [ ] AI機器人和護眼主題可以正常切換
- [ ] 顏色吸管工具能夠正常啟動和使用
- [ ] 計算機可以正常開啟和使用
- [ ] 可以正常拖拽移動位置
- [ ] 最小化/最大化功能正常
- [ ] 在手機設備上交互正常

### 📈 效能基準表

**使用這些指標來評估重構成果：**

| 指標 | 目標值 | 現在值 | 達成狀態 |
|------|--------|--------|----------|
| 首次載入時間 | < 3秒 | ____秒 | ☐ |
| CSS 總大小 | < 100KB | ____KB | ☐ |
| 頁面切換時間 | < 500ms | ____ms | ☐ |
| 主題切換時間 | < 300ms | ____ms | ☐ |
| 手機端響應時間 | < 1秒 | ____ms | ☐ |
| 內存使用 | < 50MB | ____MB | ☐ |
| CSS變數衝突 | 0個 | ____個 | ☐ |
| CSS檔案重複 | 0個 | ____個 | ☐ |

### 📄 交付清單

**在宣告重構完成前，確保以下所有項目都已完成：**

#### 技術交付
- [ ] 所有新CSS檔案已創建且結構正確
- [ ] 所有HTML檔案已更新且引用正確
- [ ] theme-system.js 已正確修改且功能正常
- [ ] 所有備份檔案都完整且可用
- [ ] Git 提交記錄清楚且有意義
- [ ] 版本標籤已正確設定

#### 功能驗證
- [ ] 所有原有功能都能正常使用
- [ ] 新的模組化結構工作正常
- [ ] 主題切換器在所有頁面正常工作
- [ ] 響應式設計在所有設備正常顯示
- [ ] 語音功能不受影響
- [ ] 擁拽功能不受影響

#### 品質保證
- [ ] 程式碼符合既有風格和標準
- [ ] 文件更新且準確
- [ ] 無未使用的檔案或代碼
- [ ] CSS變數命名符合規範
- [ ] 所有內嵌CSS已提取到專用檔案
- [ ] 沒有硬編碼的樣式或數值

#### 效能測試
- [ ] 頁面載入時間符合標準
- [ ] CSS檔案大小在可接受範圍
- [ ] 無CSS變數衝突或重複定義
- [ ] 無未使用的CSS規則
- [ ] 手機端性能符合預期

#### 用戶體驗
- [ ] 所有交互反饋正常
- [ ] 視覺效果符合設計規範
- [ ] 無明顯的效能或體驗降級
- [ ] 輔助功能（焦點指示、鍵盤導航）正常
- [ ] 在不同瀏覽器中顯示一致

### 📧 交付文件

**重構完成後需要提供的文件：**

1. **📝 本文件**：`CSS_REFACTORING_GUIDE.md` (已更新)
2. **📈 結構圖表**：新的CSS檔案組織架構
3. **🧩 測試報告**：所有測試結果和截圖
4. **🔄 回滾腳本**：`rollback.bat` / `rollback.sh` (已更新)
5. **📊 性能報告**：重構前後的性能比對
6. **🔧 維護手冊**：新模組的開發和維護指南

---

## 🎆 結語

這份詳細的CSS重構指南提供了從規劃到實施、從測試到維護的完整流程。通過遵循這個指南，您將能夠：

✅ **建立穩固的模組化架構**：每個單元都是獨立的，不會相互影響  
✅ **確保高品質的用戶體驗**：統一的視覺風格和流暢的交互  
✅ **實現長期的可維護性**：清晰的檔案組織和命名規範  
✅ **優化系統性能**：按需載入和模組化設計  
✅ **降低技術债務**：減少重複代碼和維護成本  

### 💭 最後的建議

1. **耐心和細心**：重構是一個精細的過程，不要急於求成
2. **頻繁測試**：每一個小改動後都要立即測試
3. **備份是生命線**：永遠保持多個版本的備份
4. **文件化過程**：記錄每一步的改動和原因
5. **團隊溝通**：確保所有成員都理解新架構

### 🚀 下一步

完成重構後，建議考慮以下進階優化：

- **CSS-in-JS 的可能性**：評估是否適用於您的項目
- **設計系統整合**：建立更系統化的設計規範
- **自動化測試**：引入CSS回歸測試和視覺測試
- **性能監控**：持繼追蹤和優化性能指標
- **用戶回饋**：收集用戶對新架構的使用體驗

🎉 **祝您重構順利！**

---

## 📢 版本更新記錄

### v2.0.0 - 詳細增強版 (2024/09/09)

**新增內容：**
- ✨ 新增了超過 50+ 個詳細的實施步驟
- ✨ 新增了完整的緊急回滾方案和腳本
- ✨ 新增了全面的CSS診斷和除錯工具
- ✨ 新增了詳細的測試清單和檢查點
- ✨ 新增了完整的進度追蹤和問題記錄表格
- ✨ 新增了效能監控和模組獨立性驗證工具
- ✨ 新增了詳細的交付清單和品質保證清單

**重要改進：**
- 🔧 所有步驟現在都有具體的時間估計和測試指導
- 🔧 增加了分階段實施策略，降低風險
- 🔧 提供了多層次的備份和回滾方案
- 🔧 增強了錯誤處理和問題解決指導
- 🔧 添加了實用的消除錯誤工具和診斷程式

**文件統計：**
- 總字數：超過 25,000 字
- 代碼示例：100+ 個
- 測試用例：50+ 個
- 檢查點：200+ 個

---

## 📝 使用說明

**這份指南適用於：**
- 👥 前端開發人員和CSS專家
- 👥 項目管理者和技術主管
- 👥 需要重構複雜CSS架構的開發團隊
- 👥 希望學習CSS模組化最佳實踐的開發者

**不適用於：**
- ✖️ 小型項目或單頁應用
- ✖️ 沒有多模組或主題系統的簡單網站
- ✖️ 使用 CSS-in-JS 或 Styled Components 的現代框架項目
- ✖️ 時間非常緊迫的緊急項目

**使用建議：**
1. **初次使用**：先閱讀「核心原則」和「目標架構」章節
2. **計劃階段**：使用「日報表格」估算時間和資源
3. **實施階段**：嚴格按照步驟執行，不要跳過測試
4. **問題解決**：使用「問題追蹤表」記錄所有問題
5. **交付檢查**：使用「交付清單」確保品質

**技術要求：**
- 💻 **作業系統**：Windows 10+, macOS 10.15+, 或 Linux
- 💻 **瀏覽器**：Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- 💻 **編輯器**：VSCode, WebStorm, 或任何支援CSS和HTML的編輯器
- 💻 **版本控制**：Git 2.20+ (強烈建議)
- 💻 **基礎技能**：HTML5, CSS3, JavaScript ES6+, 命令列基礎操作

---

## ❗ 免責聲明

本文件僅作為技術指導之用，作者不對以下情況承擔責任：
- ✖️ 在實施過程中造成的任何數據遺失或系統損壞
- ✖️ 由於不當操作或理解錯誤導致的問題
- ✖️ 生產環境中的任何意外故障或損失
- ✖️ 第三方工具或服務的問題

**強烈建議：**
- 💪 在正式環境中實施之前，先在測試環境中完整驗證
- 💪 始終保持多個備份版本，並確保可以快速回滾
- 💪 在不確定的情況下，尋求專業建議或支援

---

**本文件由 Claude (Anthropic) 協助生成，旨在提供實用的CSS重構指導。**  
**最後更新：2024年9月9日 | 版本：v2.0.0**