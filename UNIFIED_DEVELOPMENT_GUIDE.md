# 🏆 金錢教學遊戲統一開發指南
## 📋 專案概覽與完整開發規範

---

## 🎯 核心架構原則

### ❌ 絕對禁止事項
1. **硬編碼任何邏輯**：if-else、switch語句用於業務邏輯
2. **硬編碼字串**：語音文字、提示訊息、錯誤訊息
3. **硬編碼數值**：延遲時間、動畫參數、尺寸
4. **重複代碼**：相似功能必須抽取為配置項
5. **分散HTML操作**：所有HTML字串必須統一管理

### ✅ 強制使用
1. **ModeConfig 配置對象**：所有模式特定行為
2. **策略模式**：UI.generateXXXConfig(), RenderStrategy
3. **配置驅動系統**：Audio.playSound(), Speech.speak()
4. **統一事件處理**：RenderStrategy.bindEvents()
5. **HTMLTemplates 系統**：統一HTML模板管理

---

## 🏗️ 專案結構總覽

### 📂 完整專案架構
```
money_tutor/
├── 📁 html/          # 遊戲頁面HTML檔案
├── 📁 js/            # JavaScript核心邏輯
├── 📁 css/           # 樣式檔案與主題
├── 📁 templates/     # HTML模板與配置
├── 📁 docs/          # 開發文件與規範
├── 📁 images/        # 圖片資源
└── 📄 CLAUDE.md      # 配置驅動開發原則
```

### 🎮 遊戲單元分類

#### F系列：基礎認知訓練 (Foundation)
- **F1**: 物件對應 (f1_object_correspondence)
- **F2**: 唱數與理性計數 (f2_rote_and_rational_counting)
- **F3**: 數字認識 (f3_number_recognition)
- **F4**: 數字排序 (f4_number_sorting)
- **F5**: 數量比較 (f5_quantity_comparison)

#### C系列：金錢概念與運算 (Currency)
- **C1**: 金錢種類認識 (c1_money_types)
- **C2**: 金錢計數 (c2_money_counting)
- **C3**: 金錢兌換 (c3_money_exchange)
- **C4**: 正確金額支付 (c4_correct_amount)
- **C5**: 足夠金錢判斷 (c5_sufficient_payment)

#### A系列：應用情境模擬 (Application)
- **A1**: 模擬購物 (a1_simulated_shopping)
- **A2**: ATM提款機 (a2_atm_simulator)
- **A3**: 理髮店售票機 (a3_barber_shop_kiosk)

---

## 🎨 配置驅動架構詳解

### 1. ModeConfig 完整結構模板
```javascript
const ModeConfig = {
  [difficulty]: {
    // 基本行為配置
    triggerType: 'auto' | 'manual' | 'button',
    audioFeedback: boolean,
    speechFeedback: boolean,
    showHints: boolean,

    // 語音模板配置
    speechTemplates: {
      exchangeComplete: {
        smallToBig: '答對了，{sourceCount}個{sourceName}換到1個{targetName}',
        bigToSmall: '答對了，1個{sourceName}換到{targetCount}個{targetName}'
      },
      allRoundsComplete: {
        smallToBig: '恭喜你，{totalSource}個{sourceName}，共換到{totalTarget}個{targetName}'
      },
      addCustomItem: "已新增自訂圖示：{itemName}",
      removeCustomItem: "已移除圖示：{itemName}",
      error: "操作錯誤，請重試"
    },

    // UI配置
    uiElements: {
      dropZone: { /* 放置區配置 */ },
      resultDisplay: { /* 結果顯示配置 */ }
    },

    // 時間配置
    timing: {
      speechDelay: 500,
      nextQuestionDelay: 3000,
      allRoundsCompleteDelay: 4000,
      animationDuration: 800
    },

    // 語音品質配置
    speechSettings: {
      preferredVoices: [
        'Microsoft HsiaoChen Online',    // 首選：微軟小陳
        'Google 國語 (臺灣)'             // 次選：Google台灣國語
      ],
      rate: 1.0,           // 標準語速
      lang: 'zh-TW',       // 動態語言設定
      voiceSelection: 'auto'  // 語音篩選策略
    },

    // 動畫配置
    animations: {
      fadeIn: { duration: 500, ease: 'ease-in-out' },
      slideUp: { duration: 300, ease: 'ease-out' }
    },

    // 拖放佈局配置
    layoutSettings: {
      gridCols: 3,
      itemSpacing: 10,
      containerPadding: 15
    }
  }
};
```

### 2. 統一系統API使用規範

#### 音效系統
```javascript
// ✅ 正確：配置驅動
Audio.playSound('success', difficulty, config);
Audio.playSuccessSound(difficulty, config);

// ❌ 錯誤：硬編碼
this.audio.playSuccessSound();
```

#### 語音系統
```javascript
// ✅ 正確：模板驅動語音
const replacements = {
  sourceCount: count,
  sourceName: name,
  targetName: target
};
Speech.speak('exchangeComplete', difficulty, config, replacements, callback);

// ❌ 錯誤：硬編碼語音文字
speechText = `答對了，${count}個${name}`;
```

#### UI生成系統
```javascript
// ✅ 正確：配置驅動UI生成
const uiConfig = UI.generateDropZoneConfig(mode, question);
const html = HTMLTemplates.gameLayout(difficulty, totalQuestions, description);

// ❌ 錯誤：硬編碼HTML
html = `<div class="drop-zone">...`;
container.innerHTML = `<div class="layout">...`;
```

---

## 🏆 HTMLTemplates 統一模板系統

### 核心模板類型
```javascript
const HTMLTemplates = {
  // 遊戲主要佈局模板
  gameLayout: (difficulty, totalQuestions, exchangeDescription) => {
    return `<div class="game-container ${difficulty}">...</div>`;
  },

  // 金錢項目模板
  moneyItem: (src, alt, value, coinId) => {
    const isCustomImage = src.startsWith('data:image/');
    const iconDisplay = isCustomImage ?
      `<img src="${src}" alt="${alt}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; pointer-events: none; user-select: none;">` :
      src;
    return `<div class="money-item" data-id="${coinId}">${iconDisplay}</div>`;
  },

  // 兌換結果模板
  exchangeResult: (isSmallToBig, images, name, rate) => {
    return `<div class="exchange-result">...</div>`;
  },

  // 拖放區域模板
  dropZone: (config) => {
    return `<div class="drop-zone ${config.className}">...</div>`;
  }
};
```

### 使用原則
- 所有HTML字串必須透過HTMLTemplates生成
- 避免直接使用innerHTML賦值
- 模板參數化，支援動態內容
- 保持模板的可重用性和一致性

---

## 🎙️ 語音品質標準配置

### 統一語音配置原則
所有應用程式必須使用相同的語音配置，確保一致的用戶體驗：

```javascript
// ✅ 標準語音選擇策略
const preferredVoices = [
  'Microsoft HsiaoChen Online',    // 首選：微軟小陳
  'Google 國語 (臺灣)'             // 次選：Google台灣國語
];

// ✅ 備選語音篩選（排除品質較差的語音）
const otherTWVoices = voices.filter(v =>
  v.lang === 'zh-TW' && !v.name.includes('Hanhan')
);

// ✅ 統一語音參數
utterance.rate = 1.0;           // 標準語速
utterance.lang = this.voice.lang;  // 動態語言
```

### 語音品質檢查清單
- [ ] 使用標準首選語音列表？
- [ ] 排除 Hanhan 語音？
- [ ] 語音速度設為 1.0？
- [ ] 使用動態語言設定？

---

## 🏗️ 拖放佈局架構解決方案

### ❌ 核心問題：多層嵌套Flexbox衝突
- **「由外而內」vs.「由內而外」尺寸衝突**：外層容器決定寬度 vs. 內層內容決定高度
- **display: flex 的繼承干擾**：父容器 flex-direction: column 干擾子元素 flex-wrap: wrap
- **佈局不穩定**：dragover 時寬度閃爍、初始變寬問題

### 🏆 最佳解決方案：外層Grid + 內層標準塊級元素

#### 1. 外層容器 - Grid 系統精確控制寬度
```css
.drop-zone-area {
  display: grid;
  grid-template-columns: 1fr;
  align-items: stretch;
  width: 100%;
  min-height: 0;
}

.flexible-zone {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 120px;
  overflow: visible;
}
```

#### 2. 中層容器 - 標準塊級元素高度傳遞
```css
.easy-drop-zone, .normal-drop-zone, .hard-drop-zone {
  /* 移除 display: flex - 使用標準塊級元素 */
  /* 高度由內部內容決定，寬度由Grid控制 */
  position: relative;
  border: 2px dashed var(--border-color);
  padding: 10px;
}
```

#### 3. 內層容器 - Flexbox 處理錢幣排列
```css
.placed-coins-container {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px;
  min-height: 0; /* 避免Flexbox默認高度限制 */
  height: auto; /* 高度完全由內容決定 */
  align-content: flex-start; /* 多行內容從頂部開始 */
}
```

### 🛡️ 佈局穩定性保證
```css
/* 拖曳狀態下保持佈局穩定 */
.placed-coins-container.dragover {
  transform: none; /* 不改變尺寸 */
}

/* 子元素防壓縮 */
.placed-coins-container > * {
  flex-shrink: 0;
}
```

---

## 📱 跨平台相容性解決方案

### 🎯 手機端拖拽問題解決方案

#### 問題分析
- 桌機：HTML5 Drag and Drop API
- 手機：觸控事件，原生API幾乎不支援

#### 統一解決方案：跨平台拖拽函式庫
```javascript
// ❌ 移除：原生拖拽API
// draggable="true", ondragstart 等屬性

// ✅ 採用：SortableJS 或類似函式庫
// 同時支援滑鼠和觸控的專業解決方案
```

### 🎵 手機端語音播放解決方案

#### 問題分析
手機瀏覽器禁止非用戶主動觸發的音訊播放

#### 解決方案：音訊解鎖機制
```javascript
// ✅ 在用戶首次互動時解鎖音訊
handleSelection() {
  // 音訊解鎖必須在用戶交互的開始就執行
  this.Audio.unlockAudio();
  // ... 其他邏輯
}

// ✅ 多重觸發點確保解鎖
handleItemClick() {
  if (!this.Audio.isUnlocked) {
    this.Audio.unlockAudio();
  }
  // ... 其他邏輯
}
```

### 🐛 手機端除錯系統

#### 視覺化除錯面板
```javascript
// ✅ 自製除錯系統，解決手機端console問題
function createMobileDebugPanel() {
  // 左上角🐛按鈕 + 右上角除錯面板
  // 實時顯示console訊息
  // 彩色分類顯示（錯誤紅色、警告黃色）
}
```

---

## 🎨 自訂主題開發架構

### 🎯 自訂主題核心概念
允許用戶上傳自己的圖片作為遊戲圖示，類似a1_simulated_shopping的魔法商店功能。

### 📋 狀態管理結構
```javascript
// ✅ 必須在 Game.state 中新增
state: {
  customItems: [], // 自訂主題圖示和名稱
  // ... 其他狀態
}

// ✅ 必須在 gameData.themes 中新增
themes: {
  // ... 標準主題
  custom: [] // 自訂主題（動態載入自訂圖示）
}
```

### 🖼️ 圖片處理關鍵技術

#### Base64圖片檢測與處理
```javascript
// ✅ 正確：檢測base64圖片並用img標籤顯示
const isCustomImage = icon.startsWith('data:image/');
const iconDisplay = isCustomImage ?
  `<img src="${icon}" alt="自訂圖示" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; pointer-events: none; user-select: none;">` :
  icon;

// ❌ 錯誤：直接插入base64資料會顯示亂碼
return `<div>${icon}</div>`; // 這會顯示 data:image/png;base64,iVBORw0K...
```

#### 必須的CSS樣式
```css
/* ✅ 防止事件干擾的關鍵樣式 */
.custom-image {
  pointer-events: none;  /* 防止img接收滑鼠事件 */
  user-select: none;     /* 防止圖片被選中 */
  object-fit: cover;     /* 保持圖片比例 */
  border-radius: 5px;    /* 統一圓角樣式 */
}
```

### 🔧 核心方法實現清單
必須實現的方法：
1. **`triggerImageUpload()`** - 觸發檔案選擇對話框
2. **`handleImageUpload(event)`** - 處理檔案上傳和驗證
3. **`showImagePreview(imageData)`** - 顯示預覽模態視窗
4. **`confirmAddCustomItem()`** - 確認新增自訂圖示
5. **`removeCustomItem(index)`** - 移除自訂圖示
6. **`closeImagePreview()`** - 關閉預覽視窗

---

## 📋 開發檢查清單

### ⚡ 每次修改代碼前必須檢查
- [ ] 是否有硬編碼的if-else邏輯？→ 改用策略模式
- [ ] 是否有硬編碼的字串？→ 移至ModeConfig
- [ ] 是否有硬編碼的數值？→ 移至ModeConfig
- [ ] 是否重複了現有功能？→ 使用現有配置系統
- [ ] 是否使用了統一的事件系統？→ RenderStrategy.bindEvents()
- [ ] 是否有分散的innerHTML操作？→ 移至HTMLTemplates統一管理
- [ ] 是否有硬編碼的語音參數？→ 移至ModeConfig.speechSettings
- [ ] 是否有佈局衝突問題？→ 使用Grid+標準塊級元素架構

### 🎯 配置驅動覆蓋率檢查
- [ ] 語音文字：0% 硬編碼（全部使用模板）
- [ ] 延遲時間：0% 硬編碼（全部來自配置）
- [ ] 音效播放：0% 硬編碼（全部配置驅動）
- [ ] UI生成：0% 硬編碼（全部配置驅動）

### 📱 跨平台相容性檢查
- [ ] 手機端拖拽功能正常？
- [ ] 手機端語音播放正常？
- [ ] 手機端除錯系統可用？
- [ ] 響應式設計適配？

### 🎨 自訂主題功能檢查（如適用）
- [ ] 狀態管理：customItems陣列已新增到state
- [ ] 主題配置：custom主題已新增到gameData.themes
- [ ] 圖片處理：正確檢測base64並用img標籤顯示
- [ ] 事件處理：拖放事件正確處理img元素冒泡
- [ ] UI介面：模態視窗和設定區域正確顯示
- [ ] 驗證邏輯：自訂主題驗證已更新

---

## 🚨 重開機後記憶提示系統

### 🎯 Claude指令模板
重開機後對Claude說：
**"請先閱讀 UNIFIED_DEVELOPMENT_GUIDE.md 文件，然後開始修改 [單元名稱].js"**

### 🔄 自動執行檢查清單
Claude會自動：
1. ✅ 讀取配置驅動原則
2. ✅ 了解ModeConfig結構
3. ✅ 避免硬編碼
4. ✅ 使用統一的配置系統
5. ✅ 遵循HTMLTemplates架構
6. ✅ 確保跨平台相容性

---

## 🚨 警告信號與解決方案

### ❌ 違反配置驅動原則的代碼模式

#### 硬編碼字串
```javascript
// ❌ 問題
speechText = '答對了，' + count + '個' + name;

// ✅ 解決
const template = config.speechTemplates.exchangeComplete;
speechText = template.replace('{sourceCount}', count).replace('{sourceName}', name);
```

#### 硬編碼延遲時間
```javascript
// ❌ 問題
setTimeout(callback, 3000);

// ✅ 解決
setTimeout(callback, config.timing.nextQuestionDelay);
```

#### 硬編碼邏輯判斷
```javascript
// ❌ 問題
if (difficulty === 'easy') {
  // 特定邏輯
}

// ✅ 解決
const strategy = ModeConfig[difficulty].strategy;
strategy.execute();
```

#### 分散的HTML操作
```javascript
// ❌ 問題
container.innerHTML = `<div class="layout">...`;
element.innerHTML = `<div class="item">...`;

// ✅ 解決
const html = HTMLTemplates.gameLayout(params);
container.innerHTML = html;
```

---

## 🏆 成功案例參考

### 🎯 已完成的標準實現

#### C1 金錢種類認識
- ✅ 配置驅動語音系統
- ✅ 統一時間管理
- ✅ HTMLTemplates模板系統
- ✅ 跨平台拖拽支援

#### F1 物件對應
- ✅ 自訂主題完整實現
- ✅ 手機端除錯系統
- ✅ 音訊解鎖機制
- ✅ 響應式佈局設計

#### A1 模擬購物
- ✅ 魔法商店自訂主題
- ✅ 手機端拖拽修復
- ✅ 跨頁面狀態管理
- ✅ 多步驟遊戲流程

---

## 📊 專案emoji使用規範

### 🎯 各單元emoji分配

#### F系列 - 基礎認知
- F1: 🔢 (數字/對應)
- F2: 🔢 (計數)
- F3: 🔢 (數字認識)
- F4: 📶 (排序)
- F5: ⚖️ (比較)

#### C系列 - 金錢概念
- C1: 💰 (金錢種類)
- C2: 💰 (計數)
- C3: 💱 (兌換)
- C4: 💳 (支付)
- C5: 💸 (足夠判斷)

#### A系列 - 情境應用
- A1: 🛒 (購物)
- A2: 🏧 (ATM)
- A3: ✂️ (理髮店)

### 🎨 功能性emoji
- 🎯 目標/重點
- ✅ 完成/正確
- ❌ 錯誤/禁止
- 🚨 警告/重要
- 🔧 工具/修復
- 📱 手機端
- 🖥️ 桌面版
- 🐛 除錯
- 🎙️ 語音
- 🎵 音效

---

## 🎓 開發最佳實踐總結

### 1. **配置驅動至上**
每一行代碼都應該是可配置的，沒有例外！

### 2. **統一系統架構**
使用Audio.playSound()、Speech.speak()、HTMLTemplates等統一API

### 3. **跨平台優先**
所有功能必須同時支援桌面和手機端

### 4. **模板化管理**
HTML字串統一使用HTMLTemplates系統管理

### 5. **語音品質標準**
統一使用高品質語音配置，確保用戶體驗一致

### 6. **佈局穩定性**
採用Grid+標準塊級元素架構解決拖放佈局問題

### 7. **自訂主題架構**
支援用戶上傳圖片的完整自訂主題系統

### 8. **除錯友善性**
手機端視覺化除錯系統，開發過程更加順暢

---

## 📚 相關文檔索引

- `CLAUDE.md` - 配置驅動開發原則
- `CONFIG_DRIVEN_CHECKLIST.md` - 開發檢查清單
- `QUICK_REMINDER.md` - 重開機提醒
- `docs/CSS_REFACTORING_GUIDE.md` - CSS重構指南
- `docs/emoji_list_by_unit.md` - emoji使用規範
- `docs/手機修.md` - 手機端修復指南

---

**🎯 記住：每一個修改都必須遵循配置驱動架構，確保代碼的可維護性、擴展性和一致性！**

**🚀 這份指南是您開發路上的最佳夥伴，請善加利用！**