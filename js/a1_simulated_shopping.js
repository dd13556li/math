// =================================================================
// FILE: js/unit6.js - 單元六：上街買東西 (完整版)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const Game = {
        // =====================================================
        // 狀態管理系統（整合 unit5 架構）
        // =====================================================
        state: {
            settings: {
                difficulty: 'easy',      // easy, normal, hard
                walletAmount: 100,       // 100, 500, 1000
                taskType: 'assigned',    // assigned(指定商品), freeChoice(自選商品)
                storeType: 'convenience', // convenience, market, breakfast, mcdonalds, pxmart, magic
                testMode: 'repeat',      // repeat(重複測驗), single(單次測驗)
                questionCount: 10        // 測驗題數
            },
            gameState: {
                currentScene: 'settings',    // settings, shopping, paying, checking
                selectedItem: null,
                cart: [],
                playerWallet: [],
                walletTotal: 0,
                isProcessingPayment: false, // 用於控制支付語音播放
                isProcessingChange: false, // 用於控制找零語音播放
                isProcessingSpeech: false, // 用於控制一般語音播放
                isShowingModal: false, // 用於控制模態視窗期間的語音
                isTransitioning: false, // 用於防止重複轉換到下一題
                currentTransaction: {
                    targetItem: null,        // 指定購買的商品
                    totalCost: 0,
                    amountPaid: 0,
                    changeExpected: 0,
                    changeReceived: []
                },
                customItems: [],  // 魔法商店自訂商品
                previousTargetItemId: null,  // 記錄上一題的商品ID，避免重複
                
                // 🔧 [新增] 點擊放置功能狀態管理
                clickState: {
                    selectedItem: null,
                    lastClickTime: 0,
                    lastClickedElement: null,
                    doubleClickDelay: 800  // 🔧 增加到800ms，讓用戶更容易觸發雙擊
                }
            },
            quiz: {
                currentQuestion: 0,
                score: 0,
                questions: [],
                startTime: null,
                attempts: 0
            },
            loadingQuestion: false
        },

        // =====================================================
        // 音效和語音系統（繼承 unit5）
        // =====================================================
        audio: {
            dropSound: null,
            errorSound: null,
            successSound: null,
            checkoutSound: null,
            init() {
                try {
                    this.dropSound = new Audio('audio/drop-sound.mp3');
                    this.dropSound.preload = 'auto';
                    this.dropSound.volume = 0.5;

                    this.errorSound = new Audio('audio/error.mp3');
                    this.errorSound.preload = 'auto';

                    this.successSound = new Audio('audio/correct02.mp3');
                    this.successSound.preload = 'auto';

                    this.checkoutSound = new Audio('audio/checkout.mp3');
                    this.checkoutSound.preload = 'auto';
                    this.checkoutSound.volume = 0.5;
                } catch (error) {
                    console.log('音效檔案載入失敗:', error);
                }
            },
            playDropSound() {
                if (this.dropSound) {
                    this.dropSound.currentTime = 0;
                    this.dropSound.play().catch(error => console.log('播放音效失敗:', error));
                }
            },
            playErrorSound() {
                if (this.errorSound) {
                    this.errorSound.currentTime = 0;
                    this.errorSound.play().catch(error => console.log('播放音效失敗:', error));
                }
            },
            playSuccessSound(callback = null) {
                if (this.successSound) {
                    this.successSound.currentTime = 0;
                    if (callback) {
                        this.successSound.onended = callback;
                    }
                    this.successSound.play().catch(error => console.log('播放音效失敗:', error));
                } else if (callback) {
                    // 如果音效無法播放，仍然執行回調
                    callback();
                }
            },
            playCorrect02Sound(callback = null) {
                // correct02.mp3 已經在 successSound 中使用，所以直接調用 playSuccessSound
                this.playSuccessSound(callback);
            },
            playCheckoutSound(callback = null) {
                if (this.checkoutSound) {
                    this.checkoutSound.currentTime = 0;
                    if (callback) {
                        this.checkoutSound.onended = callback;
                    }
                    this.checkoutSound.play().catch(error => console.log('播放音效失敗:', error));
                } else if (callback) {
                    // 如果音效無法播放，仍然執行回調
                    callback();
                }
            }
        },
        
        speech: {
            synth: window.speechSynthesis,
            voice: null,
            isReady: false,
            init() {
                console.log('開始初始化語音系統...');
                const speechSynth = this.synth || window.speechSynthesis;
                const setVoice = () => {
                    const voices = speechSynth.getVoices();
                    console.log(`找到 ${voices.length} 個語音`);
                    if (voices.length === 0) {
                        console.log('沒有找到語音，稍後重試');
                        return;
                    }
                    
                    const preferredVoices = ['Microsoft HsiaoChen Online', 'Google 國語 (臺灣)'];
                    this.voice = voices.find(v => preferredVoices.includes(v.name));
                    if (!this.voice) {
                        const otherTWVoices = voices.filter(v => v.lang === 'zh-TW' && !v.name.includes('Hanhan'));
                        if (otherTWVoices.length > 0) { this.voice = otherTWVoices[0]; }
                    }
                    if (!this.voice) { this.voice = voices.find(v => v.lang === 'zh-TW'); }
                    if (!this.voice) { 
                        this.voice = voices[0];
                        console.log('未找到中文語音，使用備用語音:', this.voice.name);
                    }
                    
                    if (this.voice) {
                        this.isReady = true;
                        console.log(`語音已就緒: ${this.voice.name} (${this.voice.lang})`);
                        speechSynth.onvoiceschanged = null;
                    }
                };
                speechSynth.onvoiceschanged = setVoice;
                setVoice();
                
                setTimeout(() => {
                    if (!this.isReady) {
                        console.log('語音初始化超時，嘗試再次設定');
                        setVoice();
                    }
                }, 1000);
            },
            
            speak(text, options = {}) {
                const { interrupt = true, callback = null } = options;
                const speechSynth = this.synth || window.speechSynthesis;

                console.log(`speech.speak 被調用，文本: "${text}", interrupt: ${interrupt}`);
                
                if (!interrupt && speechSynth.speaking) {
                    console.log(`語音 "${text}" 被忽略，因為已有語音正在播報且不應中斷。`);
                    return;
                }

                if (!this.isReady || !this.voice) {
                    console.log(`語音系統未就緒，嘗試重新初始化並延遲播報`);
                    this.init();
                    setTimeout(() => {
                        if (this.isReady && this.voice) {
                            console.log(`重新初始化後播報: "${text}"`);
                            speechSynth.cancel();
                            const utterance = new SpeechSynthesisUtterance(text);
                            utterance.voice = this.voice;
                            utterance.rate = 1.0; // 標準語速（與F1統一）
                            utterance.pitch = 1;
                            if (callback) {
                                let callbackExecuted = false;
                                const executeCallback = () => {
                                    if (!callbackExecuted) {
                                        callbackExecuted = true;
                                        callback();
                                    }
                                };
                                
                                utterance.onend = executeCallback;
                                utterance.onerror = executeCallback; // 確保錯誤時也調用callback
                                utterance.onboundary = null; // 清除可能的邊界事件
                                
                                // 設置安全超時，防止callback永遠不被調用
                                setTimeout(() => {
                                    if (!callbackExecuted) {
                                        console.log('延遲語音callback超時，強制執行');
                                        executeCallback();
                                    }
                                }, 3000);
                            }
                            speechSynth.speak(utterance);
                        } else {
                            console.log(`重新初始化後仍無法播報語音: "${text}"`);
                            if (callback) callback();
                        }
                    }, 100);
                    return;
                }
                
                if (interrupt) {
                    speechSynth.cancel();
                }
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = this.voice;
                utterance.rate = 1.0; // 標準語速（與F1統一）
                utterance.pitch = 1;
                if (callback) {
                    let callbackExecuted = false;
                    const executeCallback = () => {
                        if (!callbackExecuted) {
                            callbackExecuted = true;
                            callback();
                        }
                    };
                    
                    utterance.onend = executeCallback;
                    utterance.onerror = executeCallback; // 確保錯誤時也調用callback
                    utterance.onboundary = null; // 清除可能的邊界事件
                    
                    // 設置安全超時，防止callback永遠不被調用
                    setTimeout(() => {
                        if (!callbackExecuted) {
                            console.log('語音callback超時，強制執行');
                            executeCallback();
                        }
                    }, 3000);
                }
                speechSynth.speak(utterance);
                console.log(`語音播報已提交到系統`);
            }
        },

        // =====================================================
        // 商品資料系統（完整版）
        // =====================================================
        storeData: {
            // 金錢資料（繼承 unit5）
            moneyItems: [
                { value: 1, name: '1元', images: { front: 'images/1_yuan_front.png', back: 'images/1_yuan_back.png' } },
                { value: 5, name: '5元', images: { front: 'images/5_yuan_front.png', back: 'images/5_yuan_back.png' } },
                { value: 10, name: '10元', images: { front: 'images/10_yuan_front.png', back: 'images/10_yuan_back.png' } },
                { value: 50, name: '50元', images: { front: 'images/50_yuan_front.png', back: 'images/50_yuan_back.png' } },
                { value: 100, name: '100元', images: { front: 'images/100_yuan_front.png', back: 'images/100_yuan_back.png' } },
                { value: 500, name: '500元', images: { front: 'images/500_yuan_front.png', back: 'images/500_yuan_back.png' } },
                { value: 1000, name: '1000元', images: { front: 'images/1000_yuan_front.png', back: 'images/1000_yuan_back.png' } }
            ],

            // 不同商店的商品資料
            storeProducts: {
                convenience: [  // 便利商店
                    { id: 1, name: '蘋果', price: 15, category: 'food', emoji: '🍎', description: '新鮮紅蘋果' },
                    { id: 2, name: '餅乾', price: 25, category: 'food', emoji: '🍪', description: '巧克力餅乾' },
                    { id: 3, name: '飲料', price: 20, category: 'food', emoji: '🥤', description: '汽水' },
                    { id: 4, name: '零食', price: 30, category: 'food', emoji: '🍟', description: '洋芋片' },
                    { id: 5, name: '麵包', price: 35, category: 'food', emoji: '🍞', description: '吐司' },
                    { id: 101, name: '泡麵', price: 18, category: 'food', emoji: '🍜', description: '杯麵' },
                    { id: 102, name: '口香糖', price: 12, category: 'food', emoji: '🍬', description: '薄荷口香糖' },
                    { id: 103, name: '咖啡', price: 45, category: 'food', emoji: '☕', description: '黑咖啡' },
                    { id: 104, name: '巧克力', price: 28, category: 'food', emoji: '🍫', description: '牛奶巧克力' },
                    { id: 105, name: '衛生紙', price: 25, category: 'daily', emoji: '🧻', description: '面紙' }
                ],
                market: [  // 菜市場
                    { id: 6, name: '香蕉', price: 12, category: 'food', emoji: '🍌', description: '新鮮香蕉' },
                    { id: 7, name: '胡蘿蔔', price: 8, category: 'food', emoji: '🥕', description: '橘色胡蘿蔔' },
                    { id: 8, name: '蔥', price: 5, category: 'food', emoji: '🧅', description: '新鮮蔥' },
                    { id: 9, name: '蛋', price: 45, category: 'food', emoji: '🥚', description: '雞蛋' },
                    { id: 10, name: '魚', price: 80, category: 'food', emoji: '🐟', description: '新鮮魚' },
                    { id: 106, name: '蘋果', price: 10, category: 'food', emoji: '🍎', description: '紅蘋果' },
                    { id: 107, name: '白菜', price: 15, category: 'food', emoji: '🥬', description: '新鮮白菜' },
                    { id: 108, name: '蕃茄', price: 25, category: 'food', emoji: '🍅', description: '牛蕃茄' },
                    { id: 109, name: '豬肉', price: 120, category: 'food', emoji: '🥩', description: '溫體豬肉' },
                    { id: 110, name: '雞肉', price: 90, category: 'food', emoji: '🍗', description: '土雞肉' }
                ],
                breakfast: [  // 早餐店
                    { id: 11, name: '三明治', price: 40, category: 'food', emoji: '🥪', description: '火腿三明治' },
                    { id: 12, name: '豆漿', price: 15, category: 'food', emoji: '🥛', description: '熱豆漿' },
                    { id: 13, name: '蛋餅', price: 35, category: 'food', emoji: '🥞', description: '蔥蛋餅' },
                    { id: 14, name: '吐司', price: 25, category: 'food', emoji: '🍞', description: '奶油吐司' },
                    { id: 15, name: '紅茶', price: 20, category: 'food', emoji: '🧋', description: '冰紅茶' },
                    { id: 111, name: '漢堡', price: 55, category: 'food', emoji: '🍔', description: '豬肉漢堡' },
                    { id: 112, name: '奶茶', price: 25, category: 'food', emoji: '🥤', description: '珍珠奶茶' },
                    { id: 113, name: '蘿蔔糕', price: 30, category: 'food', emoji: '🥘', description: '煎蘿蔔糕' },
                    { id: 114, name: '飯糰', price: 45, category: 'food', emoji: '🍙', description: '鮪魚飯糰' },
                    { id: 115, name: '咖啡', price: 35, category: 'food', emoji: '☕', description: '美式咖啡' }
                ],
                mcdonalds: [  // 麥當勞
                    { id: 16, name: '漢堡', price: 65, category: 'food', emoji: '🍔', description: '大麥克' },
                    { id: 17, name: '薯條', price: 45, category: 'food', emoji: '🍟', description: '中薯條' },
                    { id: 18, name: '可樂', price: 35, category: 'food', emoji: '🥤', description: '中可樂' },
                    { id: 19, name: '雞塊', price: 55, category: 'food', emoji: '🍗', description: '6塊雞塊' },
                    { id: 20, name: '派', price: 30, category: 'food', emoji: '🥧', description: '蘋果派' },
                    { id: 116, name: '冰炫風', price: 50, category: 'food', emoji: '🍦', description: 'M&M冰炫風' },
                    { id: 117, name: '魚堡', price: 70, category: 'food', emoji: '🐟', description: '麥香魚' },
                    { id: 118, name: '沙拉', price: 85, category: 'food', emoji: '🥗', description: '凱薩沙拉' },
                    { id: 119, name: '咖啡', price: 40, category: 'food', emoji: '☕', description: 'McCafé咖啡' },
                    { id: 120, name: '蛋堡', price: 60, category: 'food', emoji: '🥪', description: '滿福堡' }
                ],
                pxmart: [  // 全聯
                    { id: 21, name: '洗髮精', price: 120, category: 'daily', emoji: '🧴', description: '洗髮精' },
                    { id: 22, name: '牙膏', price: 80, category: 'daily', emoji: '🦷', description: '牙膏' },
                    { id: 23, name: '衛生紙', price: 95, category: 'daily', emoji: '🧻', description: '衛生紙' },
                    { id: 24, name: '洗衣粉', price: 150, category: 'daily', emoji: '🧽', description: '洗衣粉' },
                    { id: 25, name: '餅乾', price: 60, category: 'food', emoji: '🍪', description: '餅乾' },
                    { id: 121, name: '牛奶', price: 75, category: 'food', emoji: '🥛', description: '鮮奶' },
                    { id: 122, name: '麵包', price: 45, category: 'food', emoji: '🍞', description: '吐司麵包' },
                    { id: 123, name: '沐浴乳', price: 180, category: 'daily', emoji: '🧴', description: '沐浴乳' },
                    { id: 124, name: '洗碗精', price: 65, category: 'daily', emoji: '🧽', description: '洗碗精' },
                    { id: 125, name: '泡麵', price: 22, category: 'food', emoji: '🍜', description: '泡麵' }
                ],
                clothing: [  // 服飾店
                    { id: 126, name: 'T恤', price: 280, category: 'clothing', emoji: '👕', description: '純棉T恤' },
                    { id: 127, name: '牛仔褲', price: 890, category: 'clothing', emoji: '👖', description: '牛仔長褲' },
                    { id: 128, name: '運動鞋', price: 1200, category: 'clothing', emoji: '👟', description: '運動休閒鞋' },
                    { id: 129, name: '帽子', price: 350, category: 'clothing', emoji: '🧢', description: '棒球帽' },
                    { id: 130, name: '襪子', price: 120, category: 'clothing', emoji: '🧦', description: '棉質襪子' },
                    { id: 131, name: '外套', price: 1500, category: 'clothing', emoji: '🧥', description: '防風外套' },
                    { id: 132, name: '裙子', price: 680, category: 'clothing', emoji: '👗', description: '休閒洋裝' },
                    { id: 133, name: '圍巾', price: 450, category: 'clothing', emoji: '🧣', description: '保暖圍巾' },
                    { id: 134, name: '手套', price: 250, category: 'clothing', emoji: '🧤', description: '防寒手套' },
                    { id: 135, name: '內衣', price: 380, category: 'clothing', emoji: '👙', description: '棉質內衣' }
                ],
                electronics: [  // 3C用品店
                    { id: 136, name: '手機', price: 8000, category: 'electronics', emoji: '📱', description: '智慧型手機' },
                    { id: 137, name: '耳機', price: 1200, category: 'electronics', emoji: '🎧', description: '無線耳機' },
                    { id: 138, name: '充電器', price: 450, category: 'electronics', emoji: '🔌', description: '快速充電器' },
                    { id: 139, name: '滑鼠', price: 680, category: 'electronics', emoji: '🖱️', description: '無線滑鼠' },
                    { id: 140, name: '鍵盤', price: 1500, category: 'electronics', emoji: '⌨️', description: '機械鍵盤' },
                    { id: 141, name: '隨身碟', price: 320, category: 'electronics', emoji: '💾', description: 'USB隨身碟' },
                    { id: 142, name: '平板', price: 5500, category: 'electronics', emoji: '📱', description: '平板電腦' },
                    { id: 143, name: '喇叭', price: 2200, category: 'electronics', emoji: '🔊', description: '藍牙喇叭' },
                    { id: 144, name: '電池', price: 180, category: 'electronics', emoji: '🔋', description: '3號電池' },
                    { id: 145, name: '記憶卡', price: 850, category: 'electronics', emoji: '💳', description: 'microSD卡' }
                ],
                bookstore: [  // 書局
                    { id: 146, name: '小說', price: 280, category: 'books', emoji: '📚', description: '暢銷小說' },
                    { id: 147, name: '字典', price: 420, category: 'books', emoji: '📖', description: '英漢字典' },
                    { id: 148, name: '筆記本', price: 85, category: 'stationery', emoji: '📓', description: 'A4筆記本' },
                    { id: 149, name: '原子筆', price: 25, category: 'stationery', emoji: '🖊️', description: '藍色原子筆' },
                    { id: 150, name: '橡皮擦', price: 15, category: 'stationery', emoji: '🧽', description: '白色橡皮擦' },
                    { id: 151, name: '漫画', price: 120, category: 'books', emoji: '📘', description: '日本漫畫' },
                    { id: 152, name: '文具盒', price: 180, category: 'stationery', emoji: '📦', description: '鉛筆盒' },
                    { id: 153, name: '尺', price: 30, category: 'stationery', emoji: '📏', description: '30公分直尺' },
                    { id: 154, name: '膠水', price: 40, category: 'stationery', emoji: '🧴', description: '白膠' },
                    { id: 155, name: '雜誌', price: 150, category: 'books', emoji: '📰', description: '時尚雜誌' }
                ],
                toystore: [  // 玩具店
                    { id: 156, name: '玩具車', price: 180, category: 'toys', emoji: '🚗', description: '遙控小車' },
                    { id: 157, name: '娃娃', price: 350, category: 'toys', emoji: '🧸', description: '泰迪熊' },
                    { id: 158, name: '積木', price: 450, category: 'toys', emoji: '🧱', description: 'LEGO積木' },
                    { id: 159, name: '拼圖', price: 120, category: 'toys', emoji: '🧩', description: '1000片拼圖' },
                    { id: 160, name: '球', price: 85, category: 'toys', emoji: '⚽', description: '足球' },
                    { id: 161, name: '飛機', price: 220, category: 'toys', emoji: '✈️', description: '玩具飛機' },
                    { id: 162, name: '機器人', price: 380, category: 'toys', emoji: '🤖', description: '變形機器人' },
                    { id: 163, name: '玩具槍', price: 150, category: 'toys', emoji: '🔫', description: '水槍' },
                    { id: 164, name: '彈珠', price: 45, category: 'toys', emoji: '🔮', description: '玻璃彈珠' },
                    { id: 165, name: '溜溜球', price: 95, category: 'toys', emoji: '🪀', description: '專業溜溜球' }
                ],
                stationery: [  // 文具店
                    { id: 166, name: '鉛筆', price: 12, category: 'stationery', emoji: '✏️', description: '2B鉛筆' },
                    { id: 167, name: '原子筆', price: 18, category: 'stationery', emoji: '🖊️', description: '黑色原子筆' },
                    { id: 168, name: '橡皮擦', price: 8, category: 'stationery', emoji: '🧽', description: '粉色橡皮擦' },
                    { id: 169, name: '尺', price: 25, category: 'stationery', emoji: '📏', description: '直尺' },
                    { id: 170, name: '筆記本', price: 45, category: 'stationery', emoji: '📓', description: '方格筆記本' },
                    { id: 171, name: '膠水', price: 30, category: 'stationery', emoji: '🧴', description: '口紅膠' },
                    { id: 172, name: '剪刀', price: 35, category: 'stationery', emoji: '✂️', description: '安全剪刀' },
                    { id: 173, name: '彩色筆', price: 65, category: 'stationery', emoji: '🖍️', description: '12色彩色筆' },
                    { id: 174, name: '計算機', price: 120, category: 'stationery', emoji: '🧮', description: '科學計算機' },
                    { id: 175, name: '資料夾', price: 28, category: 'stationery', emoji: '📁', description: 'A4資料夾' }
                ],
                cosmetics: [  // 美妝店
                    { id: 176, name: '口紅', price: 350, category: 'cosmetics', emoji: '💄', description: '啞光口紅' },
                    { id: 177, name: '粉底液', price: 480, category: 'cosmetics', emoji: '🧴', description: '持久粉底液' },
                    { id: 178, name: '睫毛膏', price: 280, category: 'cosmetics', emoji: '👁️', description: '濃密睫毛膏' },
                    { id: 179, name: '眼影', price: 420, category: 'cosmetics', emoji: '🎨', description: '12色眼影盤' },
                    { id: 180, name: '面膜', price: 150, category: 'cosmetics', emoji: '😷', description: '保濕面膜' },
                    { id: 181, name: '洗面乳', price: 180, category: 'cosmetics', emoji: '🧴', description: '溫和洗面乳' },
                    { id: 182, name: '乳液', price: 320, category: 'cosmetics', emoji: '🧴', description: '保濕乳液' },
                    { id: 183, name: '香水', price: 1200, category: 'cosmetics', emoji: '🌸', description: '淡香水' },
                    { id: 184, name: '指甲油', price: 120, category: 'cosmetics', emoji: '💅', description: '亮彩指甲油' },
                    { id: 185, name: '化妝棉', price: 45, category: 'cosmetics', emoji: '🤍', description: 'organic化妝棉' }
                ],
                sports: [  // 運動用品店
                    { id: 186, name: '籃球', price: 450, category: 'sports', emoji: '🏀', description: '標準籃球' },
                    { id: 187, name: '足球', price: 380, category: 'sports', emoji: '⚽', description: '5號足球' },
                    { id: 188, name: '羽毛球拍', price: 680, category: 'sports', emoji: '🏸', description: '碳纖維球拍' },
                    { id: 189, name: '網球', price: 120, category: 'sports', emoji: '🎾', description: '比賽用網球' },
                    { id: 190, name: '游泳鏡', price: 250, category: 'sports', emoji: '🥽', description: '防霧泳鏡' },
                    { id: 191, name: '跑步鞋', price: 1800, category: 'sports', emoji: '👟', description: '專業跑鞋' },
                    { id: 192, name: '瑜珈墊', price: 350, category: 'sports', emoji: '🧘', description: 'TPE瑜珈墊' },
                    { id: 193, name: '啞鈴', price: 280, category: 'sports', emoji: '🏋️', description: '3公斤啞鈴' },
                    { id: 194, name: '護膝', price: 180, category: 'sports', emoji: '🦵', description: '運動護膝' },
                    { id: 195, name: '水壺', price: 150, category: 'sports', emoji: '🥤', description: '運動水壺' }
                ],
                magic: []  // 魔法商店（動態載入自訂商品）
            },

            // 依難度設定的價格範圍
            priceRanges: {
                easy: [5, 50],      // 簡單：5-50元
                normal: [10, 200],  // 普通：10-200元  
                hard: [20, 500]     // 困難：20-500元
            },

            // 舊的商品資料（保持相容性）
            items: [
                { 
                    id: 1, 
                    name: '蘋果', 
                    price: 15, 
                    category: 'food',
                    emoji: '🍎',
                    description: '新鮮紅蘋果',
                    audioName: 'ㄆㄧㄥˊ ㄍㄨㄛˇ'
                },
                { 
                    id: 2, 
                    name: '餅乾', 
                    price: 25, 
                    category: 'food',
                    emoji: '🍪',
                    description: '巧克力餅乾',
                    audioName: 'ㄅㄧㄥˇ ㄍㄢ'
                },
                { 
                    id: 3, 
                    name: '鉛筆', 
                    price: 10, 
                    category: 'stationery',
                    emoji: '✏️',
                    description: '2B鉛筆',
                    audioName: 'ㄑㄧㄢ ㄅㄧˇ'
                },
                { 
                    id: 4, 
                    name: '橡皮擦', 
                    price: 5, 
                    category: 'stationery',
                    emoji: '🧽',
                    description: '白色橡皮擦',
                    audioName: 'ㄒㄧㄤˋ ㄆㄧˊ ㄘㄞ'
                },
                { 
                    id: 5, 
                    name: '玩具車', 
                    price: 35, 
                    category: 'toys',
                    emoji: '🚗',
                    description: '紅色小汽車',
                    audioName: 'ㄨㄢˊ ㄐㄩˋ ㄔㄜ'
                },
                { 
                    id: 6, 
                    name: '果汁', 
                    price: 20, 
                    category: 'food',
                    emoji: '🧃',
                    description: '柳橙汁',
                    audioName: 'ㄍㄨㄛˇ ㄓ'
                }
            ],

            // 可用的錢幣面額（延續前面單元）
            denominations: [
                { value: 1, name: '1元', type: 'coin', image: 'images/1_yuan_front.png' },
                { value: 5, name: '5元', type: 'coin', image: 'images/5_yuan_front.png' },
                { value: 10, name: '10元', type: 'coin', image: 'images/10_yuan_front.png' },
                { value: 50, name: '50元', type: 'coin', image: 'images/50_yuan_front.png' },
                { value: 100, name: '100元', type: 'note', image: 'images/100_yuan_front.png' }
            ]
        },


        // =====================================================
        // 三層式鷹架提示系統
        // =====================================================
        scaffolding: {
            currentLevel: 0,    // 0: 開放式, 1: 引導式, 2: 示範式
            maxLevel: 2,
            
            // 不同類型的錯誤提示
            hints: {
                wrongTotal: [
                    "嗯，總金額好像不太對喔，要不要再算一次看看？",
                    "你買了 {item}，價格是 {price} 元，我們來看看這樣對不對？",
                    "讓我來幫你算算看：{item} 是 {price} 元，所以總金額是 {price} 元喔！"
                ],
                insufficientPayment: [
                    "錢好像不夠喔，再檢查一下你的錢包吧！",
                    "你需要付 {total} 元，但只給了 {paid} 元，還需要 {needed} 元喔！",
                    "不夠的金額是 {needed} 元，你可以再拿 {suggestion} 來付錢。"
                ],
                wrongChange: [
                    "找錢的金額好像不對，要不要再算一次？",
                    "你付了 {paid} 元，買了 {total} 元的東西，找錢應該是 {paid} - {total} = {change} 元",
                    "正確的找錢是 {change} 元。讓我演示給你看：{demonstration}"
                ]
            },

            getHint(errorType, data = {}) {
                const hintArray = this.hints[errorType];
                if (!hintArray || this.currentLevel > this.maxLevel) return null;
                
                let hint = hintArray[this.currentLevel];
                
                // 替換模板變數
                Object.keys(data).forEach(key => {
                    hint = hint.replace(`{${key}}`, data[key]);
                });
                
                this.currentLevel++;
                return hint;
            },

            reset() {
                this.currentLevel = 0;
            }
        },

        // =====================================================
        // 初始化系統
        // =====================================================
        init() {
            console.log('單元六：上街買東西 - 初始化開始');
            
            try {
                // 初始化音效系統
                if (this.audio && typeof this.audio.init === 'function') {
                    this.audio.init();
                } else {
                    console.warn('音效系統初始化失敗');
                }
                
                // 初始化語音系統
                if (this.speech && typeof this.speech.init === 'function') {
                    this.speech.init();
                } else {
                    console.warn('語音系統初始化失敗');
                }
                
                // 顯示設定畫面
                this.showSettings();
                
                // 設置無障礙功能
                this.setupAccessibility();
                
            } catch (error) {
                console.error('遊戲初始化失敗:', error);
                // 即使初始化失敗，也要顯示設定畫面
                this.showSettings();
            }
        },

        // =====================================================
        // 遊戲設定畫面（全新設計）
        // =====================================================
        showSettings() {
            // 重置上一題的商品ID（重新開始遊戲時）
            this.state.gameState.previousTargetItemId = null;
            // 重置選中商品狀態
            this.state.gameState.selectedItems = [];
            
            const app = document.getElementById('app');
            const settings = this.state.settings;
            
            // 確保設定狀態正確初始化
            console.log('顯示設定畫面時的狀態:', settings);
            
            app.innerHTML = `
                <div class="unit-welcome">
                    <div class="welcome-content" style="text-align: center;">
                        <h1>單元六：上街買東西</h1>
                        
                        <div class="game-settings">
                            <style>
                                .game-settings {
                                    text-align: left;
                                }
                                .game-settings .setting-group {
                                    text-align: left;
                                    margin-bottom: 20px;
                                }
                                .game-settings .selection-btn {
                                    text-align: center;
                                }
                                .game-settings label {
                                    display: block;
                                    text-align: left;
                                    margin-bottom: 10px;
                                }
                                .button-group {
                                    display: flex;
                                    justify-content: flex-start;
                                    gap: 10px;
                                    flex-wrap: wrap;
                                }
                                /* 保持標題置中 */
                                h1 {
                                    text-align: center;
                                }
                                /* 保持按鈕置中 */
                                .game-buttons {
                                    display: flex;
                                    justify-content: center;
                                    gap: 15px;
                                    margin-top: 30px;
                                }
                            </style>
                            <div class="setting-group">
                                <label>🎯 難度選擇：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${settings.difficulty === 'easy' ? 'active' : ''}" 
                                            data-type="difficulty" data-value="easy">
                                        簡單
                                    </button>
                                    <button class="selection-btn ${settings.difficulty === 'normal' ? 'active' : ''}" 
                                            data-type="difficulty" data-value="normal">
                                        普通
                                    </button>
                                    <button class="selection-btn ${settings.difficulty === 'hard' ? 'active' : ''}" 
                                            data-type="difficulty" data-value="hard">
                                        困難
                                    </button>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>💰 錢包金額：</label>
                                <div class="button-group">
                                   <button class="selection-btn ${settings.walletAmount === 'custom' ? 'active' : ''}" 
                                            data-type="wallet" data-value="custom" onclick="Game.showCustomWalletModal()">
                                        自訂金額
                                    </button>
                                    <p>
                                    <button class="selection-btn ${settings.walletAmount === 100 ? 'active' : ''}" 
                                            data-type="wallet" data-value="100">
                                        100元以內
                                    </button>
                                    <button class="selection-btn ${settings.walletAmount === 500 ? 'active' : ''}" 
                                            data-type="wallet" data-value="500">
                                        500元以內
                                    </button>
                                    <button class="selection-btn ${settings.walletAmount === 1000 ? 'active' : ''}" 
                                            data-type="wallet" data-value="1000">
                                        1000元以內
                                    </button>
                                    <button class="selection-btn ${settings.walletAmount === 5000 ? 'active' : ''}" 
                                            data-type="wallet" data-value="5000">
                                        5000元以內
                                    </button>
                                   
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>📋 任務類型：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${settings.taskType === 'assigned' ? 'active' : ''}" 
                                            data-type="task" data-value="assigned">
                                        購買指定商品
                                    </button>
                                    <button class="selection-btn ${settings.taskType === 'freeChoice' ? 'active' : ''}" 
                                            data-type="task" data-value="freeChoice">
                                        自選購買商品
                                    </button>
                                </div>
                                <div class="setting-description">
                                    <small id="task-desc">${settings.taskType === 'assigned' ? '系統會隨機指定要購買的商品' : '你可以在錢包金額內自由選擇商品'}</small>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>🏪 購物場所：</label>
                                <div class="button-group">
                                    ${this.generateStoreButtons()}
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>📝 測驗模式：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${settings.testMode === 'repeat' ? 'active' : ''}" 
                                            data-type="testMode" data-value="repeat">
                                        重複測驗
                                    </button>
                                    <button class="selection-btn ${settings.testMode === 'single' ? 'active' : ''}" 
                                            data-type="testMode" data-value="single">
                                        單次測驗
                                    </button>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>📊 測驗題數：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${settings.questionCount === 5 ? 'active' : ''}" 
                                            data-type="questionCount" data-value="5">
                                        5題
                                    </button>
                                    <button class="selection-btn ${settings.questionCount === 10 ? 'active' : ''}" 
                                            data-type="questionCount" data-value="10">
                                        10題
                                    </button>
                                    <button class="selection-btn ${settings.questionCount === 15 ? 'active' : ''}" 
                                            data-type="questionCount" data-value="15">
                                        15題
                                    </button>
                                    <button class="selection-btn ${settings.questionCount === 20 ? 'active' : ''}" 
                                            data-type="questionCount" data-value="20">
                                        20題
                                    </button>
                                    <button class="selection-btn custom-btn ${![5,10,15,20].includes(settings.questionCount) ? 'active' : ''}" 
                                            data-type="questionCount" data-value="custom">
                                        自訂
                                    </button>
                                </div>
                                <div class="custom-input-group" style="display: ${![5,10,15,20].includes(settings.questionCount) ? 'block' : 'none'}; margin-top: 10px;">
                                    <input type="number" id="custom-question-count" min="1" max="100" 
                                           value="${![5,10,15,20].includes(settings.questionCount) ? settings.questionCount : 10}" 
                                           placeholder="輸入題數 (1-100)" style="padding: 8px; border-radius: 5px; border: 1px solid #ddd; text-align: center;">
                                    <button onclick="Game.setCustomQuestionCount()" style="margin-left: 10px; padding: 8px 15px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">確認</button>
                                </div>
                            </div>
                            
                            ${settings.storeType === 'magic' ? this.getMagicStoreSettings() : ''}
                        </div>
                        
                        <div class="game-buttons">
                            <button class="back-to-main-btn" onclick="Game.backToMainMenu()" aria-label="返回主畫面">
                                返回主畫面
                            </button>
                            <button class="start-btn" onclick="Game.startGame()" aria-label="開始遊戲">
                                開始遊戲
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // 綁定設定選項事件
            this.bindSettingEvents();
            
            // 確保預設簡單模式狀態正確初始化
            if (settings.difficulty === 'easy') {
                console.log('初始化時檢測到預設簡單模式，確保狀態正確設定');
                // 不需要調用 updateSetting，但要確保狀態一致性
                setTimeout(() => {
                    console.log('延遲檢查設定狀態:', this.state.settings.difficulty);
                }, 100);
            }
        },
        
        // 魔法商店設定區域
        getMagicStoreSettings() {
            return `
                <div class="magic-store-settings">
                    <h4>🎪 魔法商店設定</h4>
                    <p>上傳你的商品圖片並設定價格：</p>
                    <div class="custom-items-list" id="custom-items-list">
                        ${this.state.gameState.customItems.map((item, index) => `
                            <div class="custom-item">
                                <img src="${item.imageUrl}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #ddd;">
                                <div class="item-info">
                                    <div class="item-name">${item.name}</div>
                                    <div class="item-price">${item.price}元</div>
                                </div>
                                <button onclick="Game.removeCustomItem(${index})" class="remove-btn">❌ 移除</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="add-custom-item">
                        <input type="file" id="custom-image" accept="image/*" style="display: none;" onchange="window.Game.handleImageUpload(event)">
                        <button type="button" onclick="window.Game.triggerImageUpload()" class="upload-btn">📸 上傳圖片</button>
                        <div class="upload-hint">請先選擇圖片，系統會開啟預覽視窗讓您設定商品資訊</div>
                    </div>
                </div>
                
                <!-- 圖片預覽小視窗 -->
                <div id="image-preview-modal" class="image-preview-modal">
                    <div class="modal-overlay" onclick="window.Game.closeImagePreview()"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>🎁 新增魔法商品</h3>
                            <button onclick="window.Game.closeImagePreview()" class="close-btn">✕</button>
                        </div>
                        <div class="modal-body">
                            <div class="image-preview-container">
                                <img id="preview-image" src="" alt="商品預覽" style="max-width: 350px; max-height: 300px; object-fit: contain; border-radius: 10px; border: 2px solid #ddd;">
                            </div>
                            <div class="item-form">
                                <div class="form-group">
                                    <label>商品名稱：</label>
                                    <input type="text" id="modal-custom-name" placeholder="請輸入商品名稱" maxlength="10">
                                </div>
                                <div class="form-group">
                                    <label>商品價格：</label>
                                    <input type="number" id="modal-custom-price" placeholder="請輸入價格" min="1" max="1000">
                                    <span class="price-unit">元</span>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button onclick="window.Game.closeImagePreview()" class="cancel-btn">取消</button>
                            <button onclick="window.Game.confirmAddCustomItem()" class="confirm-btn">確認新增</button>
                        </div>
                    </div>
                </div>
            `;
        },
        
        // 綁定設定事件
        bindSettingEvents() {
            // 設定選項點擊事件（避免重複綁定）
            document.querySelectorAll('.selection-btn').forEach(btn => {
                // 移除已存在的事件監聽器（如果有的話）
                if (btn.hasAttribute('data-event-bound')) {
                    return; // 已綁定過事件，跳過
                }
                
                btn.setAttribute('data-event-bound', 'true');
                btn.addEventListener('click', (e) => {
                    const type = e.target.dataset.type;
                    const value = e.target.dataset.value;
                    
                    if (type && value) {
                        // 播放選單選擇音效
                        this.playMenuSelectSound();
                        
                        // 特殊處理測驗題數的自訂選項
                        if (type === 'questionCount' && value === 'custom') {
                            // 顯示自訂輸入框
                            const customInputGroup = document.querySelector('.custom-input-group');
                            if (customInputGroup) {
                                customInputGroup.style.display = 'block';
                            }
                        } else if (type === 'questionCount' && value !== 'custom') {
                            // 隱藏自訂輸入框並設定預設值
                            const customInputGroup = document.querySelector('.custom-input-group');
                            if (customInputGroup) {
                                customInputGroup.style.display = 'none';
                            }
                            this.updateSetting(type, parseInt(value));
                        } else {
                            this.updateSetting(type, value);
                        }
                        
                        // 更新按鈕狀態
                        const group = e.target.closest('.button-group');
                        group.querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        
                        // 如果是任務類型，更新描述
                        if (type === 'task') {
                            const desc = document.getElementById('task-desc');
                            if (desc) {
                                desc.textContent = value === 'assigned' ? 
                                    '系統會隨機指定要購買的商品' : 
                                    '你可以在錢包金額內自由選擇商品';
                            }
                        }
                    }
                });
            });
        },
        
        // 設定自訂測驗題數
        setCustomQuestionCount() {
            const input = document.getElementById('custom-question-count');
            const value = parseInt(input.value);
            
            if (isNaN(value) || value < 1 || value > 100) {
                alert('請輸入 1-100 之間的有效數字');
                return;
            }
            
            this.updateSetting('questionCount', value);
            alert(`已設定測驗題數為 ${value} 題`);
        },
        
        // 更新設定
        updateSetting(type, value) {
            switch(type) {
                case 'difficulty':
                    this.state.settings.difficulty = value;
                    console.log('難度設定已更新為:', value);
                    break;
                case 'wallet':
                    this.state.settings.walletAmount = value === 'custom' ? 'custom' : parseInt(value);
                    // 當錢包金額改變時，重新生成購物場所按鈕
                    this.updateStoreButtons();
                    break;
                case 'task':
                    this.state.settings.taskType = value;
                    break;
                case 'store':
                    this.state.settings.storeType = value;
                    // 當商店類型改變時，重新渲染設定頁面以顯示/隱藏魔法商店設定
                    this.showSettings();
                    return; // 早期返回，避免重複處理
                case 'testMode':
                    this.state.settings.testMode = value;
                    break;
                case 'questionCount':
                    this.state.settings.questionCount = parseInt(value);
                    break;
            }
            console.log('設定已更新:', this.state.settings);
        },
        
        // 更新購物場所按鈕
        updateStoreButtons() {
            // 找到包含購物場所標籤的設定組
            const settingGroups = document.querySelectorAll('.setting-group');
            let storeButtonGroup = null;
            
            settingGroups.forEach(group => {
                const label = group.querySelector('label');
                if (label && label.textContent.includes('🏪 購物場所')) {
                    storeButtonGroup = group.querySelector('.button-group');
                }
            });
            
            if (storeButtonGroup) {
                storeButtonGroup.innerHTML = this.generateStoreButtons();
                // 只為新生成的商店按鈕綁定事件
                this.bindStoreButtonEvents(storeButtonGroup);
            }
        },
        
        // 為商店按鈕綁定事件（避免重複綁定所有設定事件）
        bindStoreButtonEvents(storeButtonGroup) {
            const storeButtons = storeButtonGroup.querySelectorAll('.selection-btn');
            storeButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const type = e.target.dataset.type;
                    const value = e.target.dataset.value;
                    
                    if (type && value) {
                        // 播放選單選擇音效
                        this.playMenuSelectSound();
                        this.updateSetting(type, value);
                        
                        // 更新按鈕狀態
                        const group = e.target.closest('.button-group');
                        group.querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                    }
                });
            });
        },
        
        // 觸發圖片上傳
        triggerImageUpload() {
            console.log('=== 上傳按鈕被點擊了！ ===');
            console.log('觸發圖片上傳');
            
            // 確保預覽視窗是隱藏的
            const modal = document.getElementById('image-preview-modal');
            if (modal) {
                modal.classList.remove('show');
                console.log('確保預覽視窗隱藏');
            }
            
            const fileInput = document.getElementById('custom-image');
            if (fileInput) {
                // 重置檔案輸入，確保可以重新選擇同一個檔案
                fileInput.value = '';
                console.log('檔案輸入已重置');
                
                // 直接觸發檔案選擇器，不使用延遲
                try {
                    fileInput.click();
                    console.log('檔案選擇器已觸發');
                    
                    // 檢查是否成功觸發
                    setTimeout(() => {
                        if (!fileInput.files || fileInput.files.length === 0) {
                            console.log('檔案選擇器已關閉，沒有選擇檔案');
                        }
                    }, 1000);
                    
                    // 備用檢查：如果瀏覽器不支援程式觸發檔案選擇器
                    setTimeout(() => {
                        const isFileDialogOpen = document.hasFocus();
                        if (isFileDialogOpen) {
                            console.log('檔案選擇對話框正常開啟');
                        } else {
                            console.warn('檔案選擇對話框可能未開啟，請檢查瀏覽器設定');            
                        }
                    }, 100);
                } catch (error) {
                    console.error('觸發檔案選擇器時發生錯誤:', error);
                }
            } else {
                console.error('找不到檔案輸入元素');
            }
        },
        
        // 處理圖片上傳
        // 根據金額生成購物場所按鈕
        generateStoreButtons() {
            const walletAmount = this.state.settings.walletAmount;
            const settings = this.state.settings;
            
            // 定義每個金額層級對應的商店
            const storesByAmount = {
                100: ['convenience', 'breakfast', 'market', 'stationery'],  // 100元以內：便利商店、早餐店、菜市場、文具店
                500: ['pxmart', 'mcdonalds', 'bookstore', 'toystore', 'cosmetics'],      // 500元以內：全聯、麥當勞、書局、玩具店、美妝店
                1000: ['clothing', 'sports'],                               // 1000元以內：服飾店、運動用品店
                5000: ['electronics'],                                      // 5000元以內：3C賣場
                custom: 'all'                                               // 自訂金額：所有商店都可用
            };
            
            // 商店資訊
            const storeInfo = {
                convenience: { name: '便利商店', emoji: '🏪' },
                market: { name: '菜市場', emoji: '🥬' },
                breakfast: { name: '早餐店', emoji: '🍳' },
                mcdonalds: { name: '麥當勞', emoji: '🍟' },
                pxmart: { name: '全聯', emoji: '🛒' },
                clothing: { name: '服飾店', emoji: '👕' },
                electronics: { name: '3C用品店', emoji: '📱' },
                bookstore: { name: '書局', emoji: '📚' },
                toystore: { name: '玩具店', emoji: '🧸' },
                stationery: { name: '文具店', emoji: '✏️' },
                cosmetics: { name: '美妝店', emoji: '💄' },
                sports: { name: '運動用品店', emoji: '⚽' },
                magic: { name: '魔法商店', emoji: '🎪' }
            };
            
            // 獲取可用的商店列表
            let availableStores = [];
            let actualAmount = walletAmount;
            
            // 如果是自訂金額，取得實際金額數值
            if (walletAmount === 'custom') {
                actualAmount = this.state.settings.customWalletAmount || 100;
            }
            
            // 根據實際金額層級決定可用商店
            for (const [amount, stores] of Object.entries(storesByAmount)) {
                if (amount !== 'custom' && parseInt(amount) <= actualAmount) {
                    availableStores = availableStores.concat(stores);
                }
            }
            
            // 魔法商店總是可用
            availableStores.push('magic');
            // 移除重複項目
            availableStores = [...new Set(availableStores)];
            
            // 生成所有商店按鈕
            const allStores = Object.keys(storeInfo);
            
            return allStores.map(storeKey => {
                const store = storeInfo[storeKey];
                const isAvailable = availableStores.includes(storeKey);
                const isActive = settings.storeType === storeKey;
                
                // 如果商店不可用且當前選中，則重置選擇
                if (!isAvailable && isActive) {
                    this.state.settings.storeType = availableStores[0] || 'convenience';
                }
                
                const buttonClass = `selection-btn ${isActive ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`;
                const disabledAttr = !isAvailable ? 'disabled' : '';
                const clickHandler = isAvailable ? `data-type="store" data-value="${storeKey}"` : '';
                
                return `
                    <button class="${buttonClass}" ${clickHandler} ${disabledAttr}>
                        ${!isAvailable ? '❌ ' : ''}${store.name}
                    </button>
                `;
            }).join('');
        },

        handleImageUpload(event) {
            console.log('handleImageUpload 被調用', event);
            const file = event.target.files[0];
            console.log('選擇的檔案:', file);
            if (!file) {
                console.log('沒有選擇檔案');
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
            console.log('開始讀取圖片檔案');
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log('圖片讀取完成，顯示預覽');
                this.showImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        },
        
        // 顯示圖片預覽視窗
        showImagePreview(imageDataUrl) {
            console.log('showImagePreview 被調用');
            const modal = document.getElementById('image-preview-modal');
            const previewImg = document.getElementById('preview-image');
            
            console.log('模態視窗元素:', modal);
            console.log('預覽圖片元素:', previewImg);
            
            if (!modal) {
                console.error('找不到預覽模態視窗元素');
                return;
            }
            
            if (!previewImg) {
                console.error('找不到預覽圖片元素');
                return;
            }
            
            previewImg.src = imageDataUrl;
            modal.classList.add('show');
            console.log('模態視窗已顯示');
            
            // 儲存圖片資料供後續使用
            this.tempImageData = imageDataUrl;
            
            // 清空輸入框
            document.getElementById('modal-custom-name').value = '';
            document.getElementById('modal-custom-price').value = '';
            
            // 聚焦到名稱輸入框
            setTimeout(() => {
                document.getElementById('modal-custom-name').focus();
            }, 100);
        },
        
        // 關閉圖片預覽視窗
        closeImagePreview() {
            console.log('嘗試關閉圖片預覽視窗');
            const modal = document.getElementById('image-preview-modal');
            if (modal) {
                modal.classList.remove('show');
                console.log('圖片預覽視窗已關閉');
            } else {
                console.error('找不到圖片預覽視窗元素');
            }
            
            // 清除文件選擇
            document.getElementById('custom-image').value = '';
            this.tempImageData = null;
        },
        
        // 確認新增自訂商品
        confirmAddCustomItem() {
            const name = document.getElementById('modal-custom-name').value.trim();
            const price = parseInt(document.getElementById('modal-custom-price').value);
            
            if (!name || !price || price <= 0) {
                alert('請填寫完整的商品資訊！');
                return;
            }
            
            if (price > this.state.settings.walletAmount) {
                alert(`商品價格不能超過錢包金額上限（${this.state.settings.walletAmount}元）！`);
                return;
            }
            
            if (!this.tempImageData) {
                alert('圖片資料遺失，請重新上傳！');
                return;
            }
            
            const customItem = {
                id: Date.now(), // 使用時間戳作為唯一ID
                name: name,
                price: price,
                category: 'custom',
                emoji: '🎁',
                description: `自訂商品：${name}`,
                imageUrl: this.tempImageData
            };
            
            this.state.gameState.customItems.push(customItem);
            
            // 關閉預覽視窗
            this.closeImagePreview();
            
            // 重新渲染設定頁面
            this.showSettings();
            
            this.speech.speak(`已新增自訂商品：${name}，價格${price}元`);
        },
        
        // 新增自訂商品
        addCustomItem() {
            const imageFile = document.getElementById('custom-image').files[0];
            const name = document.getElementById('custom-name').value.trim();
            const price = parseInt(document.getElementById('custom-price').value);
            
            if (!imageFile || !name || !price || price <= 0) {
                alert('請填寫完整的商品資訊並選擇圖片！');
                return;
            }
            
            if (price > this.state.settings.walletAmount) {
                alert(`商品價格不能超過錢包金額上限（${this.state.settings.walletAmount}元）！`);
                return;
            }
            
            // 讀取圖片並轉為 base64
            const reader = new FileReader();
            reader.onload = (e) => {
                const customItem = {
                    id: Date.now(), // 使用時間戳作為唯一ID
                    name: name,
                    price: price,
                    category: 'custom',
                    emoji: '🎁',
                    description: `自訂商品：${name}`,
                    imageUrl: e.target.result
                };
                
                this.state.gameState.customItems.push(customItem);
                
                // 清空輸入框
                document.getElementById('custom-name').value = '';
                document.getElementById('custom-price').value = '';
                document.getElementById('custom-image').value = '';
                
                // 重新渲染設定頁面
                this.showSettings();
                
                this.speech.speak(`已新增自訂商品：${name}，價格${price}元`);
            };
            reader.readAsDataURL(imageFile);
        },
        
        // 移除自訂商品
        removeCustomItem(index) {
            const item = this.state.gameState.customItems[index];
            this.state.gameState.customItems.splice(index, 1);
            this.showSettings();
            this.speech.speak(`已刪除商品：${item.name}`);
        },
        
        // 顯示自訂錢包金額模態視窗
        showCustomWalletModal() {
            const modalOverlay = document.createElement('div');
            modalOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 500px;
                width: 90%;
                text-align: center;
            `;
            
            modalContent.innerHTML = `
                <h2 style="color: #333; margin-bottom: 20px;">自訂錢包金額</h2>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: bold;">輸入金額：</label>
                    <input type="text" id="custom-wallet-amount" 
                           style="width: 120px; padding: 8px; border: 2px solid #ddd; border-radius: 5px; font-size: 16px; text-align: center; cursor: pointer;"
                           placeholder="請輸入金額" readonly onclick="Game.showWalletNumberInput()">
                    <span style="margin-left: 5px;">元</span>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: bold;">選擇幣值種類：</label>
                    <div id="money-type-selection" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                        ${this.storeData.moneyItems.map(money => {
                            const isBanknote = money.value >= 100;
                            const imageWidth = isBanknote ? '60px' : '40px';
                            const imageStyle = isBanknote ? 
                                `width: ${imageWidth}; height: auto; max-height: 36px; object-fit: contain; margin-bottom: 5px;` :
                                `width: ${imageWidth}; height: ${imageWidth}; margin-bottom: 5px;`;
                            const minWidth = isBanknote ? '120px' : '80px';
                            return `
                            <label style="display: flex; flex-direction: column; align-items: center; cursor: pointer; padding: 10px; border: 2px solid #ddd; border-radius: 8px; min-width: ${minWidth};">
                                <input type="checkbox" name="moneyType" value="${money.value}" style="margin-bottom: 5px;">
                                <img src="${money.images.front}" alt="${money.name}" style="${imageStyle}">
                                <span style="font-size: 12px;">${money.name}</span>
                            </label>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="Game.confirmCustomWallet()" 
                            style="background: #4CAF50; color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-size: 16px;">
                        確認
                    </button>
                    <button onclick="Game.closeCustomWalletModal()" 
                            style="background: #f44336; color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-size: 16px;">
                        取消
                    </button>
                </div>
            `;
            
            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);
            
            // 儲存模態視窗引用以便關閉
            this.customWalletModal = modalOverlay;
        },
        
        // 確認自訂錢包設定
        confirmCustomWallet() {
            const amountInput = document.getElementById('custom-wallet-amount').value;
            const amount = parseInt(amountInput.replace('元', ''));
            const selectedTypes = Array.from(document.querySelectorAll('input[name="moneyType"]:checked'))
                                       .map(input => parseInt(input.value));
            
            if (!amount || amount <= 0) {
                alert('請輸入有效的金額！');
                return;
            }
            
            if (selectedTypes.length === 0) {
                alert('請至少選擇一種幣值！');
                return;
            }
            
            // 檢查選擇是否合理
            const minSelectedValue = Math.min(...selectedTypes);
            if (minSelectedValue > amount) {
                alert(`選擇錯誤：最小面額${minSelectedValue}元大於目標金額${amount}元，請重新選擇！`);
                return;
            }
            
            // 檢查是否可能組成目標金額
            if (!this.canMakeAmountPreview(amount, selectedTypes)) {
                alert(`選擇錯誤：無法使用選定的幣值組合成${amount}元，請重新選擇！`);
                return;
            }
            
            // 儲存自訂錢包設定
            this.state.settings.customWalletAmount = amount;
            this.state.settings.customWalletTypes = selectedTypes;
            this.state.settings.walletAmount = 'custom';
            
            this.closeCustomWalletModal();
            this.showSettings(); // 重新顯示設定頁面
            this.speech.speak(`已設定自訂錢包金額為${amount}元`);
        },
        
        // 預覽檢查是否可以組成目標金額（用於模態視窗驗證）
        canMakeAmountPreview(amount, denominations) {
            // 使用動態規劃檢查是否可能
            const dp = new Array(amount + 1).fill(false);
            dp[0] = true;
            
            for (const denom of denominations) {
                for (let i = denom; i <= amount; i++) {
                    if (dp[i - denom]) {
                        dp[i] = true;
                    }
                }
            }
            console.log('DP結果：', dp);
            return dp[amount];
        },
        
        // 關閉自訂錢包模態視窗
        closeCustomWalletModal() {
            if (this.customWalletModal) {
                document.body.removeChild(this.customWalletModal);
                this.customWalletModal = null;
            }
        },
        
        // 返回主畫面
        backToMainMenu() {
            // 返回到單元選擇畫面
            window.location.href = 'index.html';
        },
        
        // 開始遊戲
        startGame() {
            // 檢查魔法商店是否有商品
            if (this.state.settings.storeType === 'magic' && this.state.gameState.customItems.length === 0) {
                alert('魔法商店需要至少一個自訂商品才能開始遊戲！');
                return;
            }
            
            // 初始化測驗狀態
            this.state.quiz.currentQuestion = 0;
            this.state.quiz.score = 0;
            
            // 直接進入購物場景
            this.state.gameState.currentScene = 'shopping';
            this.initializeWallet();
            this.showShoppingScene();
        },
        
        // 初始化錢包
        initializeWallet() {
            const walletMaxAmount = this.state.settings.walletAmount;
            const difficulty = this.state.settings.difficulty;
            const taskType = this.state.settings.taskType;
            this.state.gameState.playerWallet = [];
            this.state.gameState.walletTotal = 0;
            
            // 處理自訂錢包設定
            if (walletMaxAmount === 'custom') {
                this.initializeCustomWallet();
                return;
            }
            
            // 獲取當前商店的商品來計算合適的錢包金額
            const storeProducts = this.getCurrentStoreProducts();
            let actualWalletAmount;
            
            if (taskType === 'assigned') {
                // 指定商品模式：錢包金額要高於指定商品但低於上限
                const affordableItems = storeProducts.filter(item => item.price < walletMaxAmount);
                if (affordableItems.length > 0) {
                    const maxItemPrice = Math.max(...affordableItems.map(item => item.price));
                    // 隨機金額在最高商品價格+10元到上限之間
                    const minAmount = Math.min(maxItemPrice + 10, walletMaxAmount);
                    actualWalletAmount = Math.floor(Math.random() * (walletMaxAmount - minAmount + 1)) + minAmount;
                } else {
                    actualWalletAmount = walletMaxAmount;
                }
            } else {
                // 自選模式：確保能買到三種商品中的至少一種
                const affordableItems = storeProducts.filter(item => item.price <= walletMaxAmount);
                if (affordableItems.length > 0) {
                    const minItemPrice = Math.min(...affordableItems.map(item => item.price));
                    // 隨機金額在最低商品價格到上限之間
                    actualWalletAmount = Math.floor(Math.random() * (walletMaxAmount - minItemPrice + 1)) + minItemPrice;
                } else {
                    actualWalletAmount = walletMaxAmount;
                }
            }
            
            // 根據難度和實際錢包金額生成錢幣組合
            let remainingAmount = actualWalletAmount;
            const availableMoney = [...this.storeData.moneyItems].reverse(); // 從大面額開始
            
            // 確保有足夠的小面額錢幣用於找錢
            if (difficulty === 'easy') {
                console.log('簡單模式錢包生成 - 目標金額:', actualWalletAmount);
                // 簡單模式：主要使用小面額，方便計算
                while (remainingAmount > 0) {
                    for (const money of availableMoney.reverse()) { // 從小面額開始
                        if (money.value <= remainingAmount) {
                            this.addMoneyToWallet(money.value, 1);
                            remainingAmount -= money.value;
                            break;
                        }
                    }
                }
            } else if (difficulty === 'normal') {
                // 普通模式：混合面額
                while (remainingAmount > 0) {
                    for (const money of availableMoney) {
                        if (money.value <= remainingAmount) {
                            this.addMoneyToWallet(money.value, 1);
                            remainingAmount -= money.value;
                            break;
                        }
                    }
                }
            } else {
                // 困難模式：更多大面額，需要找錢
                while (remainingAmount > 0) {
                    for (const money of availableMoney) {
                        if (money.value <= remainingAmount) {
                            const count = Math.floor(remainingAmount / money.value);
                            if (count > 0) {
                                this.addMoneyToWallet(money.value, Math.min(count, 3));
                                remainingAmount -= money.value * Math.min(count, 3);
                            }
                            break;
                        }
                    }
                }
            }
            
            console.log('錢包初始化完成:', this.state.gameState.playerWallet);
            console.log('錢包總額:', this.state.gameState.walletTotal);
        },
        
        // 添加錢幣到錢包
        addMoneyToWallet(value, count) {
            const moneyData = this.storeData.moneyItems.find(m => m.value === value);
            if (moneyData && count > 0) {
                for (let i = 0; i < count; i++) {
                    // 隨機決定錢幣顯示正面或反面
                    const showFront = Math.random() < 0.5;
                    const currentFace = showFront ? 'front' : 'back';
                    const displayImage = moneyData.images[currentFace];
                    
                    this.state.gameState.playerWallet.push({
                        ...moneyData,
                        id: `money_${value}_${Date.now()}_${i}`,
                        currentFace: currentFace,
                        displayImage: displayImage
                    });
                    this.state.gameState.walletTotal += value;
                }
            }
        },
        
        // 初始化自訂錢包
        initializeCustomWallet() {
            const customAmount = this.state.settings.customWalletAmount || 100;
            const customTypes = this.state.settings.customWalletTypes || [1, 5, 10, 50, 100];
            
            // 檢查是否有不合理的選擇（所有選擇的面額都大於目標金額）
            const minSelectedValue = Math.min(...customTypes);
            if (minSelectedValue > customAmount) {
                alert(`選擇錯誤：最小面額${minSelectedValue}元大於目標金額${customAmount}元，請重新選擇幣值。`);
                return;
            }
            
            // 檢查是否可能組成目標金額（使用最小面額是否能整除或組合）
            const sortedTypes = customTypes.sort((a, b) => a - b);
            if (!this.canMakeAmount(customAmount, sortedTypes)) {
                alert(`選擇錯誤：無法使用選定的幣值組合成${customAmount}元，請重新選擇幣值。`);
                return;
            }
            
            // 使用貪心算法分配錢幣，確保所有選擇的面額都盡可能出現
            const coinDistribution = this.calculateOptimalDistribution(customAmount, customTypes);
            
            // 生成錢包
            for (const [value, count] of Object.entries(coinDistribution)) {
                if (count > 0) {
                    this.addMoneyToWallet(parseInt(value), count);
                }
            }
            
            console.log('自訂錢包初始化完成:', this.state.gameState.playerWallet);
            console.log('自訂錢包總額:', this.state.gameState.walletTotal);
            console.log('錢幣分布:', coinDistribution);
        },
        
        // 檢查是否可以用給定面額組成目標金額
        canMakeAmount(amount, denominations) {
            // 使用動態規劃檢查是否可能
            const dp = new Array(amount + 1).fill(false);
            dp[0] = true;
            
            for (const denom of denominations) {
                for (let i = denom; i <= amount; i++) {
                    if (dp[i - denom]) {
                        dp[i] = true;
                    }
                }
            }
            
            return dp[amount];
        },
        
        // 計算最優分配方案，盡量讓每種面額都出現
        calculateOptimalDistribution(amount, denominations) {
            const distribution = {};
            const sortedDenoms = [...denominations].sort((a, b) => b - a); // 從大到小
            
            // 初始化分布
            for (const denom of denominations) {
                distribution[denom] = 0;
            }
            
            let remainingAmount = amount;
            
            // 首先確保每種面額至少出現一次（如果可能）
            for (const denom of sortedDenoms) {
                if (remainingAmount >= denom) {
                    // 檢查如果使用這個面額，剩餘金額是否還能被其他面額組成
                    const tempRemaining = remainingAmount - denom;
                    const otherDenoms = sortedDenoms.filter(d => d !== denom);
                    
                    if (tempRemaining === 0 || this.canMakeAmount(tempRemaining, denominations)) {
                        distribution[denom] = 1;
                        remainingAmount -= denom;
                    }
                }
            }
            
            // 然後使用貪心算法分配剩餘金額
            while (remainingAmount > 0) {
                let allocated = false;
                for (const denom of sortedDenoms) {
                    if (denom <= remainingAmount) {
                        distribution[denom]++;
                        remainingAmount -= denom;
                        allocated = true;
                        break;
                    }
                }
                
                if (!allocated) {
                    console.warn(`剩餘金額 ${remainingAmount} 無法分配`);
                    break;
                }
            }
            
            return distribution;
        },
        
        // 顯示購物場景
        showShoppingScene() {
            const app = document.getElementById('app');
            const settings = this.state.settings;
            
            // 獲取當前商店的商品
            const storeProducts = this.getCurrentStoreProducts();
            
            // 根據任務類型生成任務
            let targetItem = null;
            let taskDescription = '';
            
            if (settings.taskType === 'assigned') {
                // 指定商品任務
                let affordableItems = storeProducts.filter(item => item.price <= this.state.gameState.walletTotal);
                if (affordableItems.length === 0) {
                    alert('錢包金額不足以購買任何商品，請調整設定！');
                    this.showSettings();
                    return;
                }
                
                // 排除上一題的商品（如果有足夠的商品可選擇）
                if (this.state.gameState.previousTargetItemId && affordableItems.length > 1) {
                    affordableItems = affordableItems.filter(item => item.id !== this.state.gameState.previousTargetItemId);
                }
                
                targetItem = affordableItems[Math.floor(Math.random() * affordableItems.length)];
                this.state.gameState.currentTransaction.targetItem = targetItem;
                const measureWord = this.getMeasureWord(targetItem.name);
                taskDescription = `請購買1${measureWord}${targetItem.name}`;
            } else {
                const budgetLimit = this.getBudgetLimit();
                taskDescription = `請在${budgetLimit}元內自由選擇商品購買`;
            }
            
            // 根據難度選擇商品顯示數量
            const itemCount = settings.difficulty === 'hard' ? 5 : 3;
            let displayItems = [];
            if (targetItem) {
                displayItems.push(targetItem);
                const otherItems = storeProducts.filter(item => item.id !== targetItem.id);
                // 隨機選擇其他商品（困難模式4個，其他模式2個）
                while (displayItems.length < itemCount && otherItems.length > 0) {
                    const randomIndex = Math.floor(Math.random() * otherItems.length);
                    displayItems.push(otherItems.splice(randomIndex, 1)[0]);
                }
            } else {
                // 自選模式，根據難度選擇商品數量（困難模式5個，其他模式3個）
                const affordableItems = storeProducts.filter(item => item.price <= this.state.gameState.walletTotal);
                while (displayItems.length < itemCount && affordableItems.length > 0) {
                    const randomIndex = Math.floor(Math.random() * affordableItems.length);
                    displayItems.push(affordableItems.splice(randomIndex, 1)[0]);
                }
            }
            
            // 打亂商品順序
            displayItems = this.shuffleArray(displayItems);
            
            app.innerHTML = `
                <div class="store-layout">
                    <div class="title-bar">
                        <div class="title-bar-left">
                            <span class="store-icon-large">${this.getCurrentStoreInfo().emoji}</span>
                            <span>${this.getCurrentStoreInfo().name}</span>
                        </div>
                        <div class="title-bar-center">第一步：選擇購買的商品</div>
                        <div class="title-bar-right">
                            <span>第 ${this.state.quiz.currentQuestion + 1} 題 / 共 ${this.state.settings.questionCount} 題</span>
                            <button class="back-to-menu-btn" onclick="location.reload()">返回設定</button>
                        </div>
                    </div>
                    
                    <!-- 錢包區域（頂部） -->
                    <div class="wallet-area-top">
                        <h3 class="section-title">我的錢包 總計：${this.state.gameState.walletTotal}元</h3>
                        <div class="wallet-content">
                            ${this.renderWalletContent()}
                        </div>
                    </div>
                    ${targetItem ? `
                    <!-- 指定商品任務框架 -->
                     <h3 class="section-title">購買物品</h3>
                    <div class="unified-task-frame">
                        <div class="target-item-display">
                           
                            <div class="item-content">
                            <div class="item-task-text">${taskDescription} ${targetItem.category === 'custom' ? `<div class="custom-item-preview"><img src="${targetItem.imageUrl}" alt="${targetItem.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; display: inline-block; vertical-align: middle; margin: 0 10px;"></div>` : `<span class="item-icon" style="font-size: 64px;">${targetItem.emoji}</span>`} 共${targetItem.price}元</div>

                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- 商品選購區域 -->
                    <h3 class="section-title">商品選購${!targetItem ? ` - ${taskDescription}` : ''}</h3>
                    <div class="product-selection-area">
                        <div class="products-grid">
                            ${displayItems.map(item => `
                                <div class="product-item ${targetItem ? '' : 'multi-select-mode'}" data-item-id="${item.id}" data-item-name="${item.name}" data-item-price="${item.price}" onclick="${targetItem ? `Game.selectProduct(${item.id})` : `Game.toggleProduct(${item.id})`}" onmouseenter="Game.handleProductHover(event)">
                                    ${!targetItem ? `<div class="selection-indicator">✓</div>` : ''}
                                    ${item.category === 'custom' ? `
                                        <div class="custom-product-image">
                                            <img src="${item.imageUrl}" alt="${item.name}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;">
                                        </div>
                                        <div class="product-info">
                                            <div class="product-name">${item.name}</div>
                                            <div class="product-price">${item.price}元</div>
                                        </div>
                                    ` : `
                                        <div class="product-icon" style="font-size: 64px;">${item.emoji}</div>
                                        <div class="product-info">
                                            <div class="product-name">${item.name}</div>
                                            <div class="product-price">${item.price}元</div>
                                            <div class="product-description">${item.description}</div>
                                        </div>
                                    `}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${!targetItem ? `
                    <!-- 自選模式購買控制區域 -->
                    <div class="purchase-control-area">
                        <div class="selected-summary">
                            <div class="selected-items-list" id="selected-items-list">
                                <p>尚未選擇商品</p>
                            </div>
                            <div class="total-display">
                                <span>總計：</span>
                                ${settings.difficulty === 'hard' ? 
                                    `
                                    <input type="text" id="selected-total-input" class="total-input" placeholder="請輸入總計金額" readonly onclick="Game.showNumberInput()">
                                    <button class="emoji-hint-btn" id="total-hint-btn" onclick="Game.showTotalHint()">
                                        <span class="hint-emoji">💡 提示</span>
                                    </button>
                                    ` :
                                    '<span id="selected-total">0</span>元'
                                }
                            </div>
                        </div>
                        <button id="confirm-purchase-btn" class="confirm-purchase-btn" onclick="Game.confirmMultiPurchase()" disabled>
                            確認購買
                        </button>
                    </div>
                    ` : ''}
                </div>
            `;
            
            // 立即設置模態狀態以阻止懸停語音（無論是否有指定任務）
            this.state.gameState.isShowingModal = true;
            console.log('設置模態狀態，準備顯示任務指示');
            
            // 顯示任務指示彈窗
            setTimeout(() => {
                if (settings.taskType === 'assigned' && targetItem) {
                    this.showTaskModal(targetItem);
                } else {
                    // 對於自選任務，播放錢包提示語音
                    const walletSpeech = `你的錢包總共${this.state.gameState.walletTotal}元，購物時請不要超過你的錢包金額`;
                    this.speech.speak(walletSpeech, { 
                        interrupt: false,
                        callback: () => {
                            // 語音播放完成後恢復懸停語音
                            this.state.gameState.isShowingModal = false;
                            console.log('錢包提示語音播放完成，恢復懸停語音');
                        }
                    });
                }
            }, 500);
            
            // 添加困難模式提示按鈕的樣式
            if (settings.difficulty === 'hard') {
                this.addEmojiHintStyles();
            }
        },
        
        // 顯示任務指示彈窗（支援主題切換）
        showTaskModal(targetItem) {
            // 模態狀態已經在showShoppingScene中設置，這裡確認一下
            this.state.gameState.isShowingModal = true;
            console.log('開始顯示任務模態視窗，確認阻止懸停語音');
            
            const measureWord = this.getMeasureWord(targetItem.name);
            const speechText = `請購買1${measureWord}${targetItem.name}，共${targetItem.price}元`;
            
            // 獲取當前主題
            const currentTheme = window.getCurrentTheme ? window.getCurrentTheme() : { name: 'ai-robot' };
            const isDarkTheme = currentTheme.name === 'dark';
            
            // 創建彈窗
            const modalOverlay = document.createElement('div');
            modalOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0, 0, 0, 0.75);
                display: flex; align-items: center; justify-content: center;
                z-index: 2000; opacity: 0; transition: opacity 0.3s;
            `;

            const modalContent = document.createElement('div');
            // 根據主題設定不同樣式
            if (isDarkTheme) {
                modalContent.style.cssText = `
                    background: linear-gradient(135deg, #34495e, #2c3e50);
                    padding: 40px 50px; border-radius: 15px; text-align: center;
                    color: #ecf0f1; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    transform: scale(0.8); transition: transform 0.3s;
                `;
            } else {
                modalContent.style.cssText = `
                    background: linear-gradient(135deg, var(--ai-cloud-white), var(--ai-light-blue));
                    padding: 40px 50px; border-radius: 15px; text-align: center;
                    color: var(--ai-text-primary, #333); box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    transform: scale(0.8); transition: transform 0.3s;
                    border: 3px solid var(--ai-vibrant-orange);
                `;
            }

            modalContent.innerHTML = `
                <h2 style="font-size: 2.2em; margin: 0 0 20px 0; color: ${isDarkTheme ? '#f1c40f' : 'var(--ai-vibrant-orange)'};">購買的物品</h2>
                <div style="font-size: 1.5em; margin: 20px 0; display: flex; flex-direction: column; align-items: center;">
                    ${this.getTaskItemDisplay(targetItem, isDarkTheme)}
                    <div style="font-weight: bold; color: ${isDarkTheme ? '#ecf0f1' : 'var(--ai-text-primary, #333)'};">${targetItem.name} 共${targetItem.price}元</div>
                </div>
            `;

            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);

            // 語音播報並關閉彈窗
            this.speech.speak(speechText, {
                callback: () => {
                    setTimeout(() => {
                        modalOverlay.style.opacity = '0';
                        setTimeout(() => {
                            document.body.removeChild(modalOverlay);
                            // 清除模態視窗狀態，允許懸停語音
                            this.state.gameState.isShowingModal = false;
                            console.log('任務模態視窗已關閉，恢復懸停語音');
                        }, 300);
                    }, 1500);
                }
            });

            // 淡入動畫
            setTimeout(() => {
                modalOverlay.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }, 10);
        },
        
        // 獲取任務物品顯示（用於彈窗，支援主題）
        getTaskItemDisplay(item, isDarkTheme = false) {
            const backgroundStyle = isDarkTheme 
                ? 'background: rgba(255,255,255,0.1);' 
                : 'background: white; border: 2px solid var(--ai-vibrant-orange);';
            
            return `
                <div class="task-item-display" 
                     style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; 
                            ${backgroundStyle} border-radius: 8px; font-size: 2.5em; margin-bottom: 15px;">
                    ${item.category === 'custom' ? 
                        `<img src="${item.imageUrl}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px;" title="${item.name}">` : 
                        `<div class="task-item-emoji" title="${item.name}">${item.emoji}</div>`
                    }
                </div>
            `;
        },
        
        // 獲取當前商店的商品
        getCurrentStoreProducts() {
            const storeType = this.state.settings.storeType;
            if (storeType === 'magic') {
                return this.state.gameState.customItems;
            }
            return this.storeData.storeProducts[storeType] || [];
        },
        
        // 獲取當前商店信息
        getCurrentStoreInfo() {
            const storeType = this.state.settings.storeType;
            const storeInfo = {
                convenience: { name: '便利商店', emoji: '🏪' },
                market: { name: '菜市場', emoji: '🥬' },
                breakfast: { name: '早餐店', emoji: '🍳' },
                mcdonalds: { name: '麥當勞', emoji: '🍟' },
                pxmart: { name: '全聯', emoji: '🛒' },
                clothing: { name: '服飾店', emoji: '👕' },
                electronics: { name: '3C用品店', emoji: '📱' },
                bookstore: { name: '書局', emoji: '📚' },
                toystore: { name: '玩具店', emoji: '🧸' },
                stationery: { name: '文具店', emoji: '✏️' },
                cosmetics: { name: '美妝店', emoji: '💄' },
                sports: { name: '運動用品店', emoji: '⚽' },
                magic: { name: '魔法商店', emoji: '🎪' }
            };
            return storeInfo[storeType] || { name: '便利商店', emoji: '🏪' };
        },

        // 獲取商店顯示名稱
        getStoreDisplayName(storeType) {
            const storeNames = {
                convenience: '🏪 便利商店',
                market: '🥬 菜市場', 
                breakfast: '🍳 早餐店',
                mcdonalds: '🍟 麥當勞',
                pxmart: '🛒 全聯',
                clothing: '👕 服飾店',
                electronics: '📱 3C用品店',
                bookstore: '📚 書局',
                toystore: '🧸 玩具店',
                stationery: '✏️ 文具店',
                cosmetics: '💄 美妝店',
                sports: '⚽ 運動用品店',
                magic: '🎪 魔法商店'
            };
            return storeNames[storeType] || '商店';
        },
        
        // 格式化商品顯示（統一處理單一商品和組合商品）
        formatItemDisplay(selectedItem, size = 'normal') {
            if (selectedItem.category === 'multi-selection') {
                // 組合商品顯示
                const icons = selectedItem.items.map(item => {
                    const iconSize = size === 'small' ? '20px' : '24px';
                    if (item.category === 'custom') {
                        return `<img src="${item.imageUrl}" alt="${item.name}" style="width: ${iconSize}; height: ${iconSize}; object-fit: cover; border-radius: 4px; display: inline-block; vertical-align: middle; margin-right: 3px;">`;
                    } else {
                        return item.emoji;
                    }
                }).join('');
                return `${icons} ${selectedItem.name}`;
            } else {
                // 單一商品顯示
                const iconSize = size === 'small' ? '20px' : '24px';
                if (selectedItem.category === 'custom') {
                    return `<img src="${selectedItem.imageUrl}" alt="${selectedItem.name}" style="width: ${iconSize}; height: ${iconSize}; object-fit: cover; border-radius: 4px; display: inline-block; vertical-align: middle; margin-right: 5px;"> ${selectedItem.name}`;
                } else {
                    return `${selectedItem.emoji} ${selectedItem.name}`;
                }
            }
        },
        
        // 獲取適當的量詞
        getMeasureWord(itemName) {
            const measureWords = {
                '蘋果': '個',
                '餅乾': '個', 
                '飲料': '瓶',
                '零食': '包',
                '麵包': '個',
                '香蕉': '根',
                '胡蘿蔔': '根',
                '蔥': '根',
                '蛋': '顆',
                '魚': '條',
                '三明治': '個',
                '豆漿': '杯',
                '蛋餅': '個',
                '吐司': '片',
                '紅茶': '杯',
                '漢堡': '個',
                '薯條': '份',
                '可樂': '杯',
                '雞塊': '份',
                '派': '個',
                '洗髮精': '瓶',
                '牙膏': '支',
                '衛生紙': '包',
                '洗衣粉': '盒',
                '鉛筆': '支',
                '橡皮擦': '個',
                '玩具車': '台',
                '果汁': '瓶'
            };
            return measureWords[itemName] || '個'; // 預設使用「個」
        },
        
        // 渲染錢包內容
        renderWalletContent() {
            return this.state.gameState.playerWallet.map(money => {
                const isBanknote = money.value >= 100;
                const itemClass = isBanknote ? 'money-item banknote' : 'money-item coin';
                return `
                <div class="${itemClass}" data-money-id="${money.id}" data-money-name="${money.name}" draggable="true" 
                     ondragstart="Game.handleMoneyDragStart(event)"
                     onclick="Game.handleMoneyClick(event)"
                     onmouseenter="Game.handleMoneyHover(event)">
                    <img src="${money.displayImage || money.images.front}" alt="${money.name}">
                    <div class="money-value">${money.name}</div>
                </div>
                `;
            }).join('');
        },
        
        // 渲染錢包內容（含提示）
        renderWalletContentWithHints(optimalPayment) {
            console.log('渲染錢包提示，最佳方案:', optimalPayment);
            
            const optimalValues = optimalPayment || [];
            const optimalCounts = {};
            
            // 計算最佳方案中各面額的數量
            optimalValues.forEach(value => {
                optimalCounts[value] = (optimalCounts[value] || 0) + 1;
            });
            
            console.log('最佳方案面額計數:', optimalCounts);
            
            return this.state.gameState.playerWallet.map((money, index) => {
                const isOptimal = optimalCounts[money.value] > 0;
                if (isOptimal) {
                    optimalCounts[money.value]--; // 減少計數
                }
                
                const isBanknote = money.value >= 100;
                const itemClass = isBanknote ? 'money-item banknote' : 'money-item coin';
                const opacity = isOptimal ? '0.5' : '1';
                const border = isOptimal ? '3px solid #4CAF50' : '1px solid #ddd';
                const backgroundColor = isOptimal ? '#e8f5e8' : 'white';
                
                console.log(`錢幣 ${money.name} (${money.value}元) - 是否最佳: ${isOptimal}`);
                
                return `
                    <div class="${itemClass} ${isOptimal ? 'optimal-hint' : ''}" 
                         data-money-id="${money.id}" 
                         data-money-name="${money.name}"
                         draggable="true" 
                         ondragstart="Game.handleMoneyDragStart(event)"
                         onclick="Game.handleMoneyClick(event)"
                         onmouseenter="Game.handleMoneyHover(event)" 
                         style="opacity: ${opacity}; 
                                border: ${border}; 
                                border-radius: 8px; 
                                background-color: ${backgroundColor};
                                box-shadow: ${isOptimal ? '0 0 10px rgba(76, 175, 80, 0.5)' : 'none'};
                                transition: all 0.3s ease;">
                        <img src="${money.displayImage || money.images.front}" alt="${money.name}">
                        <div class="money-value">${money.name}</div>
                        ${isOptimal ? '<div style="position: absolute; top: -5px; right: -5px; background: #4CAF50; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px;">✓</div>' : ''}
                    </div>
                `;
            }).join('');
        },
        
        // 洗牌函數
        shuffleArray(array) {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        },
        
        // 初始化選中商品狀態
        initializeSelectedItems() {
            if (!this.state.gameState.selectedItems) {
                this.state.gameState.selectedItems = [];
            }
        },
        
        // 切換商品選擇（自選模式）
        toggleProduct(itemId) {
            this.initializeSelectedItems();
            
            const storeProducts = this.getCurrentStoreProducts();
            const item = storeProducts.find(product => product.id === itemId);
            if (!item) return;
            
            const selectedIndex = this.state.gameState.selectedItems.findIndex(selected => selected.id === itemId);
            
            if (selectedIndex >= 0) {
                // 取消選擇
                this.state.gameState.selectedItems.splice(selectedIndex, 1);
                this.speech.speak(`取消選擇${item.name}`, { interrupt: true });
            } else {
                // 檢查是否會超過預算限制
                const currentTotal = this.state.gameState.selectedItems.reduce((sum, selected) => sum + selected.price, 0);
                const newTotal = currentTotal + item.price;
                
                // 取得適當的預算限制
                const budgetLimit = this.getBudgetLimit();
                
                if (newTotal > budgetLimit) {
                    this.speech.speak('超過金額，無法購買', { interrupt: true });
                    return;
                }
                
                // 添加選擇
                this.state.gameState.selectedItems.push(item);
                this.speech.speak(`選擇${item.name}，${item.price}元`, { interrupt: true });
            }
            
            // 更新視覺狀態
            this.updateProductSelection();
            this.updateSelectedSummary();
        },
        
        // 確認多選購買
        confirmMultiPurchase() {
            if (!this.state.gameState.selectedItems || this.state.gameState.selectedItems.length === 0) {
                this.speech.speak('請先選擇要購買的商品', { interrupt: true });
                return;
            }
            
            const difficulty = this.state.settings.difficulty;
            const totalPrice = this.state.gameState.selectedItems.reduce((sum, item) => sum + item.price, 0);
            const itemNames = this.state.gameState.selectedItems.map(item => item.name).join('、');
            
            // 困難模式需要驗證用戶輸入的總計
            if (difficulty === 'hard') {
                const totalInput = document.getElementById('selected-total-input');
                const confirmBtn = document.getElementById('confirm-purchase-btn');
                
                if (!totalInput || !totalInput.value || confirmBtn.disabled) {
                    this.speech.speak('請先輸入正確的總計金額', { interrupt: true });
                    return;
                }
                
                const inputValue = parseInt(totalInput.value.replace('元', '').replace(' (錯誤)', ''));
                
                if (inputValue === totalPrice) {
                    // 答對了
                    console.log('困難模式答對，開始播放音效和語音');
                    this.audio.playCorrect02Sound(() => {
                        console.log('音效播放完成，開始播放語音');
                        
                        let speechCompleted = false;
                        
                        // 設置安全超時，防止語音系統卡住
                        const safetyTimeout = setTimeout(() => {
                            if (!speechCompleted) {
                                console.log('語音播放超時，強制進入付款頁面');
                                speechCompleted = true;
                                this.proceedToPayment(totalPrice, itemNames);
                            }
                        }, 5000); // 5秒超時
                        
                        this.speech.speak(`答對，商品金額總共${totalPrice}元`, {
                            callback: () => {
                                if (!speechCompleted) {
                                    console.log('語音播放完成，準備進入付款頁面');
                                    speechCompleted = true;
                                    clearTimeout(safetyTimeout);
                                    // 使用 setTimeout 確保語音完全結束
                                    setTimeout(() => {
                                        this.proceedToPayment(totalPrice, itemNames);
                                    }, 100);
                                }
                            }
                        });
                    });
                } else {
                    // 答錯了
                    this.speech.speak('答錯了，請再計算一次', { interrupt: true });
                    // 重置輸入框
                    totalInput.value = '';
                    totalInput.style.color = 'inherit';
                    totalInput.style.borderColor = 'inherit';
                    totalInput.placeholder = '請重新輸入正確金額';
                    confirmBtn.disabled = true;
                    confirmBtn.textContent = '確認購買';
                    return;
                }
            } else {
                // 非困難模式直接進入付款流程
                this.proceedToPayment(totalPrice, itemNames);
            }
        },
        
        // 進入付款流程
        proceedToPayment(totalPrice, itemNames) {
            // 創建組合商品對象
            const combinedItem = {
                id: 'multi-' + Date.now(),
                name: itemNames,
                price: totalPrice,
                category: 'multi-selection',
                description: `組合商品：${itemNames}`,
                items: this.state.gameState.selectedItems
            };
            
            // 設置為選中商品並進入付款流程
            this.state.gameState.selectedItem = combinedItem;
            this.showPaymentScene();
        },
        
        // 更新商品選擇視覺狀態
        updateProductSelection() {
            this.initializeSelectedItems();
            
            const productItems = document.querySelectorAll('.product-item.multi-select-mode');
            productItems.forEach(item => {
                const itemId = parseInt(item.dataset.itemId);
                const isSelected = this.state.gameState.selectedItems.some(selected => selected.id === itemId);
                
                if (isSelected) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            });
        },
        
        // 更新選中商品摘要
        updateSelectedSummary() {
            this.initializeSelectedItems();
            
            const selectedItemsList = document.getElementById('selected-items-list');
            const selectedTotal = document.getElementById('selected-total');
            const selectedTotalInput = document.getElementById('selected-total-input');
            const confirmBtn = document.getElementById('confirm-purchase-btn');
            const difficulty = this.state.settings.difficulty;
            
            if (!selectedItemsList || (!selectedTotal && !selectedTotalInput) || !confirmBtn) return;
            
            if (this.state.gameState.selectedItems.length === 0) {
                selectedItemsList.innerHTML = '<p>尚未選擇商品</p>';
                if (selectedTotal) selectedTotal.textContent = '0';
                if (selectedTotalInput) selectedTotalInput.value = '';
                confirmBtn.disabled = true;
            } else {
                const itemsHtml = this.state.gameState.selectedItems.map(item => 
                    `<div class="selected-item">
                        <span>${item.name}</span>
                        <span>${item.price}元</span>
                    </div>`
                ).join('');
                
                selectedItemsList.innerHTML = itemsHtml;
                
                const total = this.state.gameState.selectedItems.reduce((sum, item) => sum + item.price, 0);
                
                // 儲存實際總計供驗證使用
                this.state.gameState.actualTotal = total;
                
                if (difficulty === 'hard') {
                    // 困難模式：不自動顯示總計，等用戶輸入
                    if (selectedTotalInput) {
                        selectedTotalInput.placeholder = '請輸入總計金額';
                    }
                    confirmBtn.disabled = true; // 需要用戶輸入正確金額後才能啟用
                } else {
                    // 普通/簡單模式：直接顯示總計
                    if (selectedTotal) selectedTotal.textContent = total;
                    confirmBtn.disabled = false;
                }
                
                // 檢查是否超過錢包金額並更新樣式
                if (total > this.state.gameState.walletTotal) {
                    if (selectedTotal) selectedTotal.style.color = 'red';
                    if (selectedTotalInput) selectedTotalInput.style.borderColor = 'red';
                } else {
                    if (selectedTotal) selectedTotal.style.color = 'green';
                    if (selectedTotalInput) selectedTotalInput.style.borderColor = 'inherit';
                }
            }
        },
        
        // 顯示錢包金額數字輸入器
        showWalletNumberInput() {
            this.showNumberInput('wallet');
        },
        
        // 顯示數字輸入器（通用版本）
        showNumberInput(type = 'total') {
            // 檢查是否已存在數字輸入器
            if (document.getElementById('number-input-popup')) {
                return;
            }

            const isWalletMode = type === 'wallet';
            const isPriceMode = type === 'price';
            let title = '請輸入總計金額';
            if (isWalletMode) title = '請輸入錢包金額';
            if (isPriceMode) title = '請輸入商品價格';
            
            const inputPopupHTML = `
                <div id="number-input-popup" class="number-input-popup" data-input-type="${type}">
                    <div class="number-input-container">
                        <div class="number-input-header">
                            <h3>${title}</h3>
                            <button class="close-btn" onclick="Game.closeNumberInput()">×</button>
                        </div>
                        <div class="number-input-display">
                            <input type="text" id="number-display" readonly value="">
                        </div>
                        <div class="number-input-buttons">
                            <button onclick="Game.appendNumber('1')">1</button>
                            <button onclick="Game.appendNumber('2')">2</button>
                            <button onclick="Game.appendNumber('3')">3</button>
                            <button onclick="Game.clearNumber()" class="clear-btn">清除</button>
                            
                            <button onclick="Game.appendNumber('4')">4</button>
                            <button onclick="Game.appendNumber('5')">5</button>
                            <button onclick="Game.appendNumber('6')">6</button>
                            <button onclick="Game.backspaceNumber()" class="backspace-btn">⌫</button>
                            
                            <button onclick="Game.appendNumber('7')">7</button>
                            <button onclick="Game.appendNumber('8')">8</button>
                            <button onclick="Game.appendNumber('9')">9</button>
                            <button onclick="Game.confirmNumber()" class="confirm-btn" rowspan="2">確認</button>
                            
                            <button onclick="Game.appendNumber('0')" class="zero-btn">0</button>
                        </div>
                    </div>
                </div>
            `;

            // 添加數字輸入器樣式
            const inputStyles = `
                <style id="number-input-styles">
                    .number-input-popup {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.7);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 10000;
                    }

                    .number-input-container {
                        background: white;
                        border-radius: 15px;
                        padding: 20px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                        width: 300px;
                        max-width: 90vw;
                    }

                    .number-input-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #f0f0f0;
                        padding-bottom: 10px;
                    }

                    .number-input-header h3 {
                        margin: 0;
                        color: #333;
                        font-size: 18px;
                    }

                    .close-btn {
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .close-btn:hover {
                        background: #f0f0f0;
                    }

                    .number-input-display {
                        margin-bottom: 20px;
                    }

                    #number-display {
                        width: 100%;
                        border: 2px solid #ddd;
                        padding: 15px;
                        font-size: 24px;
                        text-align: center;
                        border-radius: 8px;
                        background: #f9f9f9;
                        font-family: 'Courier New', monospace;
                    }

                    .number-input-buttons {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 10px;
                    }

                    .number-input-buttons button {
                        padding: 15px;
                        font-size: 18px;
                        font-weight: bold;
                        border: 2px solid #ddd;
                        border-radius: 8px;
                        background: white;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .number-input-buttons button:hover {
                        background: #f0f0f0;
                        transform: translateY(-1px);
                    }

                    .number-input-buttons button:active {
                        transform: translateY(0);
                        background: #e0e0e0;
                    }

                    .number-input-buttons button.clear-btn {
                        background: #ff6b6b !important;
                        color: white !important;
                        border-color: #ff6b6b !important;
                        padding: 15px 8px !important;
                        font-size: 14px !important;
                        width: auto !important;
                        min-width: 60px !important;
                        max-width: 80px !important;
                    }

                    .number-input-buttons button.clear-btn:hover {
                        background: #ff5252 !important;
                    }

                    .number-input-buttons button.backspace-btn {
                        background: #ffa726 !important;
                        color: white !important;
                        border-color: #ffa726 !important;
                        padding: 15px 8px !important;
                        font-size: 16px !important;
                        width: auto !important;
                        min-width: 60px !important;
                        max-width: 80px !important;
                    }

                    .number-input-buttons button.backspace-btn:hover {
                        background: #ff9800 !important;
                    }

                    .number-input-buttons button.confirm-btn {
                        background: #4caf50 !important;
                        color: white !important;
                        border-color: #4caf50 !important;
                        grid-row: span 2;
                        padding: 15px 8px !important;
                        font-size: 14px !important;
                        width: auto !important;
                        min-width: 60px !important;
                        max-width: 80px !important;
                    }

                    .number-input-buttons button.confirm-btn:hover {
                        background: #45a049 !important;
                    }

                    .number-input-buttons .zero-btn {
                        grid-column: span 3;
                    }
                </style>
            `;

            // 添加樣式到頁面
            if (!document.getElementById('number-input-styles')) {
                document.head.insertAdjacentHTML('beforeend', inputStyles);
            }

            // 添加數字輸入器到頁面
            document.body.insertAdjacentHTML('beforeend', inputPopupHTML);
        },

        // ▼▼▼ 【需求 #2 新增】 ▼▼▼
        // 顯示總計提示（困難模式專用）
        showTotalHint() {
            const hintBtn = document.getElementById('total-hint-btn');
            if (!hintBtn || hintBtn.classList.contains('showing-hint')) {
                // 如果按鈕不存在或正在顯示提示，則不執行任何操作
                return;
            }

            // 1. 計算當前選中商品的實際總金額
            const total = this.state.gameState.selectedItems.reduce((sum, item) => sum + item.price, 0);
            const hintText = `目前總計 ${total} 元`;

            // 2. 更改按鈕文字並播放語音
            hintBtn.innerHTML = `<span class="hint-text-reveal">${hintText}</span>`;
            hintBtn.classList.add('showing-hint'); // 添加一個狀態類別
            this.speech.speak(hintText, { interrupt: true });

            // 3. 設置 3 秒後恢復
            setTimeout(() => {
                hintBtn.innerHTML = `<span class="hint-emoji">💡 提示</span>`;
                hintBtn.classList.remove('showing-hint');
            }, 3000);
        },
        // ▲▲▲ 【需求 #2 新增結束】 ▲▲▲

        // 【新增】為 emoji 提示按鈕添加專用樣式
        addEmojiHintStyles() {
            if (document.getElementById('emoji-hint-styles')) return;

            const style = document.createElement('style');
            style.id = 'emoji-hint-styles';
            style.textContent = `
                .emoji-hint-btn {
                    background: #f0f0f0;
                    border: 1px solid #ccc;
                    border-radius: 20px;
                    padding: 5px 12px;
                    margin-left: 10px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                }
                .emoji-hint-btn:hover {
                    background: #e0e0e0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .emoji-hint-btn .hint-emoji {
                    margin-right: 5px;
                }
                .emoji-hint-btn .hint-text-reveal {
                    font-weight: bold;
                    color: #007bff;
                }
                .emoji-hint-btn.showing-hint {
                    background: #e3f2fd;
                    border-color: #007bff;
                }
            `;
            document.head.appendChild(style);
        },

        // 關閉數字輸入器
        closeNumberInput() {
            const popup = document.getElementById('number-input-popup');
            if (popup) {
                popup.remove();
            }
        },

        // 添加數字到輸入框
        appendNumber(digit) {
            const display = document.getElementById('number-display');
            if (!display) return;

            if (display.value === '' || display.value === '0') {
                display.value = digit;
            } else {
                display.value += digit;
            }
        },

        // 清除輸入
        clearNumber() {
            const display = document.getElementById('number-display');
            if (display) display.value = '';
        },

        // 退格
        backspaceNumber() {
            const display = document.getElementById('number-display');
            if (!display) return;

            if (display.value.length > 1) {
                display.value = display.value.slice(0, -1);
            } else {
                display.value = '';
            }
        },

        // 確認輸入的數字
        confirmNumber() {
            const display = document.getElementById('number-display');
            const popup = document.getElementById('number-input-popup');
            const inputType = popup ? popup.dataset.inputType : 'total';
            
            if (!display) return;

            const inputValue = parseInt(display.value);
            
            if (inputType === 'wallet') {
                // 錢包金額輸入
                const walletInput = document.getElementById('custom-wallet-amount');
                if (!walletInput) return;
                
                if (inputValue > 0 && inputValue <= 10000) {
                    walletInput.value = inputValue + '元';
                    this.closeNumberInput();
                } else {
                    alert('請輸入1-10000之間的有效金額！');
                }
            } else if (inputType === 'price') {
                // 價格輸入（困難模式）
                const priceInput = document.getElementById('price-input');
                const confirmBtn = document.getElementById('confirm-price-btn');
                
                if (!priceInput) return;

                priceInput.value = inputValue;
                confirmBtn.disabled = !inputValue || inputValue <= 0;
                this.closeNumberInput();
            } else {
                // 總計金額輸入（困難模式）
                const totalInput = document.getElementById('selected-total-input');
                const confirmBtn = document.getElementById('confirm-purchase-btn');
                
                if (!totalInput) return;

                const actualTotal = this.state.gameState.actualTotal;

                if (inputValue === actualTotal) {
                    // 輸入正確
                    totalInput.value = inputValue + '元';
                    totalInput.style.color = 'green';
                    totalInput.style.borderColor = 'green';
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = '確認購買';
                    this.closeNumberInput();
                } else {
                    // 輸入錯誤
                    totalInput.value = inputValue + '元 (錯誤)';
                    totalInput.style.color = 'red';
                    totalInput.style.borderColor = 'red';
                    confirmBtn.disabled = true;
                    confirmBtn.textContent = '金額錯誤';
                    
                    // 顯示錯誤提示
                    setTimeout(() => {
                        totalInput.value = '';
                        totalInput.style.color = 'inherit';
                        totalInput.style.borderColor = 'inherit';
                        totalInput.placeholder = '請重新輸入正確金額';
                    }, 2000);
                    
                    this.closeNumberInput();
                }
            }
        },
        
        // 取得預算限制
        getBudgetLimit() {
            const difficulty = this.state.settings.difficulty;
            const taskType = this.state.settings.taskType;
            
            // 困難模式自選商品時，預算限制為錢包總額的約78%（63/81約等於0.78）
            if (difficulty === 'hard' && taskType === 'freeChoice') {
                return Math.floor(this.state.gameState.walletTotal * 0.78);
            }
            
            // 其他情況使用完整錢包金額
            return this.state.gameState.walletTotal;
        },
        
        // 選擇商品（指定模式）
        selectProduct(itemId) {
            const storeProducts = this.getCurrentStoreProducts();
            const selectedItem = storeProducts.find(item => item.id === itemId);
            
            if (!selectedItem) {
                console.error('找不到商品:', itemId);
                return;
            }
            
            // 檢查是否為指定任務且選擇正確
            if (this.state.settings.taskType === 'assigned') {
                const targetItem = this.state.gameState.currentTransaction.targetItem;
                if (selectedItem.id !== targetItem.id) {
                    // 顯示錯誤視覺回饋
                    this.showErrorFeedback(itemId);
                    this.speech.speak(`請選擇指定的商品：${targetItem.name}`, { interrupt: true });
                    this.audio.playErrorSound();
                    return;
                }
            }
            
            // 檢查金額是否足夠
            if (selectedItem.price > this.state.gameState.walletTotal) {
                this.speech.speak(`錢包金額不足，無法購買${selectedItem.name}`, { interrupt: true });
                this.audio.playErrorSound();
                return;
            }
            
            // 選擇成功
            this.state.gameState.selectedItem = selectedItem;
            this.state.gameState.currentTransaction.totalCost = selectedItem.price;
            
            // 添加視覺回饋：綠色勾勾和其他商品變暗
            this.showSelectionFeedback(itemId);
            
            // 先播放音效和語音確認選擇
            this.audio.playSuccessSound(() => {
                const difficulty = this.state.settings.difficulty;
                
                if (difficulty === 'easy') {
                    // 簡單模式：直接顯示價格並跳轉
                    this.speech.speak(`你選擇了${selectedItem.name}，價格是${selectedItem.price}元`, {
                        callback: () => {
                            setTimeout(() => {
                                this.showPaymentScene();
                            }, 1000);
                        }
                    });
                } else {
                    // 普通和困難模式：需要用戶輸入價格
                    this.speech.speak(`你選擇了${selectedItem.name}，請輸入商品價格`, {
                        callback: () => {
                            setTimeout(() => {
                                this.showPriceInputScene(selectedItem);
                            }, 1000);
                        }
                    });
                }
            });
        },
        
        // 顯示價格輸入場景（指定商品模式）
        showPriceInputScene(selectedItem) {
            const app = document.getElementById('app');
            const settings = this.state.settings;
            const difficulty = settings.difficulty;
            
            // 根據商品類別生成顯示內容
            let itemDisplayText = selectedItem.name;
            let itemDisplayIcons = '';
            
            if (selectedItem.category === 'custom') {
                itemDisplayIcons = `<img src="${selectedItem.imageUrl}" alt="${selectedItem.name}" style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px; display: inline-block; vertical-align: middle; margin: 0 10px;">`;
            } else {
                itemDisplayIcons = `<span class="item-icon" style="font-size: 64px;">${selectedItem.emoji}</span>`;
            }
            
            app.innerHTML = `
                <div class="store-layout">
                    <div class="title-bar">
                        <div class="title-bar-left">
                            <span class="store-icon-large">${this.getCurrentStoreInfo().emoji}</span>
                            <span>${this.getCurrentStoreInfo().name}</span>
                        </div>
                        <div class="title-bar-center">第一步：選擇購買的商品 - 輸入價格</div>
                        <div class="title-bar-right">
                            <span>第 ${this.state.quiz.currentQuestion + 1} 題 / 共 ${this.state.settings.questionCount} 題</span>
                            <button class="back-to-menu-btn" onclick="location.reload()">返回設定</button>
                        </div>
                    </div>
                    
                    <!-- 錢包區域（頂部） -->
                    <div class="wallet-area-top">
                        <h3 class="section-title">我的錢包 總計：${this.state.gameState.walletTotal}元</h3>
                        <div class="wallet-content">
                            ${this.renderWalletContent()}
                        </div>
                    </div>
                    
                    <!-- 選中的商品顯示 -->
                    <div class="unified-task-frame">
                        <div class="task-header">
                            <h2>已選擇的商品</h2>
                        </div>
                        <div class="selected-item-display">
                            <div class="item-task-text">${itemDisplayText} ${itemDisplayIcons} 共${selectedItem.price}元</div>
                        </div>
                    </div>
                    
                    <!-- 價格輸入區域 -->
                    <div class="price-input-area">
                        <h3 class="section-title">請輸入商品價格</h3>
                        <div class="price-input-container">
                            <div class="price-display">
                                <span>價格：</span>
                                <input type="text" id="price-input" class="price-input-field" placeholder="請輸入價格" readonly onclick="Game.showPriceNumberInput()">
                                <span class="currency">元</span>
                            </div>
                            <button id="confirm-price-btn" class="confirm-btn" onclick="Game.confirmPrice()" disabled>
                                確認價格
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },
        
        // 顯示價格數字輸入器（困難模式）
        showPriceNumberInput() {
            this.showNumberInput('price');
        },
        
        // 確認價格輸入
        confirmPrice() {
            const priceInput = document.getElementById('price-input');
            const inputPrice = parseInt(priceInput.value);
            const selectedItem = this.state.gameState.selectedItem;
            const actualPrice = selectedItem.price;
            
            if (!inputPrice || inputPrice <= 0) {
                this.speech.speak('請輸入有效的價格', { interrupt: true });
                return;
            }
            
            if (inputPrice === actualPrice) {
                // 價格正確
                this.audio.playSuccessSound(() => {
                    this.speech.speak(`正確！${selectedItem.name}的價格是${actualPrice}元`, {
                        callback: () => {
                            setTimeout(() => {
                                this.showPaymentScene();
                            }, 1000);
                        }
                    });
                });
            } else {
                // 價格錯誤
                this.audio.playErrorSound();
                this.speech.speak(`錯誤！${selectedItem.name}的正確價格是${actualPrice}元，請重新輸入`, { interrupt: true });
                priceInput.value = '';
                document.getElementById('confirm-price-btn').disabled = true;
            }
        },
        
        // 顯示選擇回饋效果
        showSelectionFeedback(selectedItemId) {
            // 獲取所有商品項目
            const productItems = document.querySelectorAll('.product-item');
            
            productItems.forEach(item => {
                const itemId = parseInt(item.dataset.itemId);
                
                if (itemId === selectedItemId) {
                    // 正確選擇的商品：添加綠色勾勾
                    item.style.position = 'relative';
                    const checkMark = document.createElement('div');
                    checkMark.innerHTML = '✓';
                    checkMark.style.cssText = `
                        position: absolute;
                        top: -10px;
                        right: -10px;
                        background: #4CAF50;
                        color: white;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        font-weight: bold;
                        z-index: 10;
                        animation: checkAppear 0.3s ease-out;
                    `;
                    item.appendChild(checkMark);
                } else {
                    // 其他商品：變暗
                    item.style.opacity = '0.3';
                    item.style.pointerEvents = 'none';
                }
            });
            
            // 添加CSS動畫
            if (!document.getElementById('selection-feedback-styles')) {
                const style = document.createElement('style');
                style.id = 'selection-feedback-styles';
                style.textContent = `
                    @keyframes checkAppear {
                        0% { transform: scale(0); opacity: 0; }
                        50% { transform: scale(1.2); opacity: 1; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
        },
        
        // 顯示錯誤回饋效果
        showErrorFeedback(selectedItemId) {
            // 獲取選中的商品項目
            const selectedItem = document.querySelector(`[data-item-id="${selectedItemId}"]`);
            
            if (selectedItem) {
                // 錯誤選擇的商品：添加紅色叉叉
                selectedItem.style.position = 'relative';
                const errorMark = document.createElement('div');
                errorMark.innerHTML = '✗';
                errorMark.style.cssText = `
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    background: #f44336;
                    color: white;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: bold;
                    z-index: 10;
                    animation: errorAppear 0.3s ease-out;
                `;
                selectedItem.appendChild(errorMark);
                
                // 3秒後移除錯誤標記
                setTimeout(() => {
                    if (errorMark.parentNode) {
                        errorMark.parentNode.removeChild(errorMark);
                    }
                }, 3000);
            }
            
            // 添加CSS動畫（如果還沒有的話）
            if (!document.getElementById('error-feedback-styles')) {
                const style = document.createElement('style');
                style.id = 'error-feedback-styles';
                style.textContent = `
                    @keyframes errorAppear {
                        0% { transform: scale(0) rotate(0deg); opacity: 0; }
                        50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
                        100% { transform: scale(1) rotate(360deg); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
        },
        
        // 計算最佳付款方案（優先不找零，其次找零最小）
        calculateOptimalPayment(targetAmount, availableMoney) {
            console.log('計算最佳付款方案:', { targetAmount, availableMoney });
            
            // 計算每種面額的數量
            const coinCounts = {};
            availableMoney.forEach(money => {
                coinCounts[money.value] = (coinCounts[money.value] || 0) + 1;
            });
            
            console.log('可用錢幣統計:', coinCounts);
            
            const allCoins = Object.keys(coinCounts).map(Number).sort((a, b) => a - b); // 從小到大排序，便於動態規劃
            
            // 策略1: 尋找精確付款方案（不找零）
            function findExactPayment(target, coinsList, counts) {
                // 使用動態規劃找到所有可能的精確付款組合
                const dp = new Array(target + 1).fill(null);
                dp[0] = [];
                
                for (let amount = 1; amount <= target; amount++) {
                    for (const coin of coinsList) {
                        if (coin <= amount && counts[coin] > 0) {
                            const prevAmount = amount - coin;
                            if (dp[prevAmount] !== null) {
                                // 計算到目前為止使用的錢幣數量
                                const usedCoins = {};
                                dp[prevAmount].forEach(c => {
                                    usedCoins[c] = (usedCoins[c] || 0) + 1;
                                });
                                
                                // 檢查是否還有這種面額可用
                                if ((usedCoins[coin] || 0) < counts[coin]) {
                                    const newSolution = [...dp[prevAmount], coin];
                                    if (dp[amount] === null || newSolution.length < dp[amount].length) {
                                        dp[amount] = newSolution;
                                    }
                                }
                            }
                        }
                    }
                }
                
                return dp[target];
            }
            
            // 首先嘗試找精確付款方案
            let exactSolution = findExactPayment(targetAmount, allCoins, coinCounts);
            
            if (exactSolution) {
                console.log('找到精確付款方案:', exactSolution);
                return exactSolution;
            }
            
            // 策略2: 找零最小值方案
            console.log('找不到精確付款，尋找找零最小的方案');
            
            let bestSolution = null;
            let minChange = Infinity;
            
            // 生成所有可能的付款組合，找出找零最小的
            function generatePaymentCombinations(coinsList, counts) {
                const combinations = [];
                
                // 遞歸生成所有可能的組合
                function backtrack(index, currentCombination, currentSum) {
                    if (currentSum >= targetAmount) {
                        combinations.push({
                            coins: currentCombination.slice(),
                            sum: currentSum,
                            change: currentSum - targetAmount
                        });
                        return;
                    }
                    
                    if (index >= coinsList.length) {
                        return;
                    }
                    
                    const coin = coinsList[index];
                    const maxCount = counts[coin];
                    
                    // 嘗試使用0到maxCount個這種面額的錢幣
                    for (let count = 0; count <= maxCount; count++) {
                        // 添加count個當前面額的錢幣
                        for (let i = 0; i < count; i++) {
                            currentCombination.push(coin);
                        }
                        
                        backtrack(index + 1, currentCombination, currentSum + coin * count);
                        
                        // 回溯，移除添加的錢幣
                        for (let i = 0; i < count; i++) {
                            currentCombination.pop();
                        }
                    }
                }
                
                backtrack(0, [], 0);
                return combinations;
            }
            
            // 對於大數量的錢幣，使用簡化的貪心方法避免組合爆炸
            const totalCoins = Object.values(coinCounts).reduce((a, b) => a + b, 0);
            
            if (totalCoins > 20) {
                // 使用貪心算法：找到能支付且找零最小的單一錢幣
                const coinsLargeToSmall = allCoins.slice().sort((a, b) => b - a);
                for (const coin of coinsLargeToSmall) {
                    if (coinCounts[coin] > 0 && coin >= targetAmount) {
                        const change = coin - targetAmount;
                        if (change < minChange) {
                            minChange = change;
                            bestSolution = [coin];
                        }
                    }
                }
                
                // 如果沒有單一錢幣能支付，使用貪心組合
                if (!bestSolution) {
                    const backupCounts = { ...coinCounts };
                    bestSolution = [];
                    let remaining = targetAmount;
                    
                    for (const coin of coinsLargeToSmall) {
                        while (remaining > 0 && backupCounts[coin] > 0) {
                            bestSolution.push(coin);
                            remaining -= coin;
                            backupCounts[coin]--;
                        }
                        if (remaining <= 0) break;
                    }
                }
            } else {
                // 對於少量錢幣，使用完整的組合搜索
                const combinations = generatePaymentCombinations(allCoins, coinCounts);
                
                // 篩選出能夠支付的組合
                const validCombinations = combinations.filter(combo => combo.sum >= targetAmount);
                
                if (validCombinations.length > 0) {
                    // 找出找零最小的組合
                    validCombinations.sort((a, b) => {
                        if (a.change !== b.change) {
                            return a.change - b.change; // 找零最小優先
                        }
                        return a.coins.length - b.coins.length; // 錢幣數最少優先
                    });
                    
                    bestSolution = validCombinations[0].coins;
                    minChange = validCombinations[0].change;
                }
            }
            
            if (bestSolution) {
                console.log(`找到找零最小方案: ${bestSolution}, 找零: ${minChange}元`);
                return bestSolution;
            }
            
            // 策略3: 最後備用方案
            console.log('使用最終備用方案');
            const finalCounts = { ...coinCounts };
            const finalSolution = [];
            let remaining = targetAmount;
            
            const coinsLargeToSmall = allCoins.slice().sort((a, b) => b - a);
            for (const coin of coinsLargeToSmall) {
                while (remaining > 0 && finalCounts[coin] > 0) {
                    finalSolution.push(coin);
                    remaining -= coin;
                    finalCounts[coin]--;
                }
                if (remaining <= 0) break;
            }
            
            console.log('最終解決方案:', finalSolution);
            return finalSolution || [];
        },
        
        // 生成付款提示HTML（參考單元4簡單模式）
        generatePaymentHints(optimalPayment) {
            console.log('生成付款提示:', optimalPayment);
            
            // 檢查是否有有效的付款方案
            if (!optimalPayment || optimalPayment.length === 0) {
                console.log('沒有付款方案，返回空字符串');
                return '';
            }
            
            // 初始化droppedItems狀態
            if (!this.state.gameState.droppedItems || this.state.gameState.droppedItems.length !== optimalPayment.length) {
                this.state.gameState.droppedItems = new Array(optimalPayment.length).fill(null);
            }
            
            // 為每個提示位置分配具體的錢包錢幣
            if (!this.state.gameState.hintMoneyMapping) {
                this.state.gameState.hintMoneyMapping = new Array(optimalPayment.length).fill(null);
                const usedMoneyIds = new Set();
                
                optimalPayment.forEach((value, index) => {
                    // 找到錢包中尚未被分配的相同面額錢幣
                    const availableMoney = this.state.gameState.playerWallet.find(m => 
                        m.value === value && !usedMoneyIds.has(m.id)
                    );
                    if (availableMoney) {
                        this.state.gameState.hintMoneyMapping[index] = availableMoney;
                        usedMoneyIds.add(availableMoney.id);
                    }
                });
            }
            
            // 創建帶有原始索引的陣列，然後按面額排序（大到小）
            const paymentWithIndex = optimalPayment.map((value, originalIndex) => ({
                value,
                originalIndex
            }));
            
            // 按面額排序：大金額在左，小金額在右
            paymentWithIndex.sort((a, b) => b.value - a.value);
            
            let hintsHTML = '';
            paymentWithIndex.forEach(({ value, originalIndex }) => {
                const moneyData = this.storeData.moneyItems.find(m => m.value === value);
                if (moneyData) {
                    const droppedItem = this.state.gameState.droppedItems[originalIndex];
                    const isLitUp = droppedItem !== null;
                    
                    // 如果已經放置錢幣，使用放置的錢幣圖片；否則使用映射的錢包錢幣圖片
                    let imageSrc;
                    if (isLitUp) {
                        imageSrc = droppedItem.imageSrc;
                    } else {
                        const mappedMoney = this.state.gameState.hintMoneyMapping[originalIndex];
                        imageSrc = mappedMoney ? (mappedMoney.displayImage || mappedMoney.images.front) : moneyData.images.front;
                    }
                    const hintClass = isLitUp ? 'hint-item lit-up' : 'hint-item faded';
                    
                    hintsHTML += `<div class="${hintClass}" data-value="${value}" data-position="${originalIndex}">
                        <img src="${imageSrc}" alt="${moneyData.name}" style="width: 60px; height: 60px;">
                        <div class="hint-value">${moneyData.name}</div>
                    </div>`;
                }
            });
            
            return hintsHTML;
        },
        
        // 顯示付款場景
        showPaymentScene() {
            const app = document.getElementById('app');
            const selectedItem = this.state.gameState.selectedItem;
            const settings = this.state.settings;
            
            this.state.gameState.currentScene = 'paying';
            
            // 重置付款提示狀態（清除上一題的狀態）
            this.state.gameState.droppedItems = null;
            this.state.gameState.hintMoneyMapping = null;
            
            // 重置交易狀態
            this.state.gameState.currentTransaction.totalCost = selectedItem.price; // 設定商品總價
            this.state.gameState.currentTransaction.amountPaid = 0;
            this.state.gameState.currentTransaction.paidMoney = [];
            this.state.gameState.currentTransaction.changeExpected = 0;
            this.state.gameState.currentTransaction.changeReceived = [];
            this.state.gameState.changeCompleted = false; // 重置找零完成標誌
            this.state.gameState.isTransitioning = false; // 重置轉換標誌
            
            // 計算最佳付款方案
            const optimalPayment = this.calculateOptimalPayment(selectedItem.price, this.state.gameState.playerWallet);
            console.log('付款場景 - 商品價格:', selectedItem.price);
            console.log('付款場景 - 錢包內容:', this.state.gameState.playerWallet);
            console.log('付款場景 - 最佳付款方案:', optimalPayment);
            
            // 根據難度決定是否顯示提示
            const difficulty = settings.difficulty;
            const showVisualHints = difficulty === 'easy';  // 只有簡單模式顯示視覺提示
            const showVoiceHints = difficulty === 'easy' || difficulty === 'normal';  // 簡單和普通模式顯示語音提示
            
            // 處理商品顯示邏輯
            let itemDisplayText = '';
            let itemDisplayIcons = '';
            
            if (selectedItem.category === 'multi-selection') {
                // 組合商品顯示
                itemDisplayText = selectedItem.name; // 已經是「麵包、飲料」格式
                itemDisplayIcons = selectedItem.items.map(item => {
                    if (item.category === 'custom') {
                        return `<img src="${item.imageUrl}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; display: inline-block; vertical-align: middle; margin: 0 5px;">`;
                    } else {
                        return `<span class="item-icon" style="font-size: 48px; margin: 0 5px;">${item.emoji}</span>`;
                    }
                }).join('');
            } else {
                // 單一商品顯示
                const measureWord = this.getMeasureWord(selectedItem.name);
                itemDisplayText = `1${measureWord}${selectedItem.name}`;
                if (selectedItem.category === 'custom') {
                    itemDisplayIcons = `<img src="${selectedItem.imageUrl}" alt="${selectedItem.name}" style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px; display: inline-block; vertical-align: middle; margin: 0 10px;">`;
                } else {
                    itemDisplayIcons = `<span class="item-icon" style="font-size: 64px;">${selectedItem.emoji}</span>`;
                }
            }
            
            app.innerHTML = `
                <div class="store-layout">
                    <div class="title-bar">
                        <div class="title-bar-left">
                            <span class="store-icon-large">${this.getCurrentStoreInfo().emoji}</span>
                            <span>${this.getCurrentStoreInfo().name}</span>
                        </div>
                        <div class="title-bar-center">第二步：付錢</div>
                        <div class="title-bar-right">
                            <span>第 ${this.state.quiz.currentQuestion + 1} 題 / 共 ${this.state.settings.questionCount} 題</span>
                            <button class="back-to-menu-btn" onclick="location.reload()">返回設定</button>
                        </div>
                    </div>
                    
                    <!-- 購買目標物品框 -->
                    <div class="unified-task-frame">
                        <div class="task-header">
                            <h2>購買的物品</h2>
                        </div>
                        <div class="selected-item-display">
                            <div class="item-task-text">${itemDisplayText} ${itemDisplayIcons} 共${selectedItem.price}元</div>
                        </div>
                    </div>
                    
                    <!-- 錢包區域（頂部） -->
                    <div class="wallet-area-top">
                        <h3 class="section-title">我的錢包 總計：${this.state.gameState.walletTotal}元</h3>
                        <div class="wallet-content"
                             ${(difficulty === 'normal' || difficulty === 'hard') ? `
                             ondrop="Game.handleWalletDrop(event)"
                             ondragover="Game.handleWalletDragOver(event)"
                             ondragenter="Game.handleWalletDragEnter(event)"
                             ondragleave="Game.handleWalletDragLeave(event)"` : ''}>
                            ${this.renderWalletContent()}
                        </div>
                    </div>
                    
                    <!-- 付款區域 -->
                    <div class="payment-selection-area">
                        <div class="payment-area">
                            <h3>付款區域</h3>
                            <div class="payment-zone" 
                                 ondrop="Game.handleMoneyDrop(event)" 
                                 ondragover="Game.handleDragOver(event)"
                                 ondragenter="Game.handleDragEnter(event)"
                                 ondragleave="Game.handleDragLeave(event)">
                                <div class="payment-placeholder">
                                    將錢幣拖曳到這裡付款<br>
                                    需要付款：${selectedItem.price}元
                                </div>
                                <div class="payment-money" id="payment-money" style="display: none;"></div>
                                
                                <!-- 最佳付款提示區域 -->
                                ${optimalPayment && showVisualHints ? `
                                    <div class="payment-hints">
                                        <div class="visual-hints">
                                            ${this.generatePaymentHints(optimalPayment)}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="payment-summary" id="payment-summary" style="display: none;">
                                <div>商品價格：<span id="item-price">${selectedItem.price}元</span></div>
                                <div>已付金額：<span id="paid-amount">0元</span></div>
                                <div>找零：<span id="change-amount">0元</span></div>
                            </div>
                            
                            <button class="confirm-btn" id="confirm-payment" onclick="Game.confirmPayment()" disabled>
                                確認付款
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // 添加付款提示相關的CSS樣式
            this.addPaymentHintStyles();
            
            this.state.gameState.currentTransaction.amountPaid = 0;
            this.state.gameState.currentTransaction.paidMoney = [];
            
            // 初始化時，如果有提示區域，隱藏placeholder
            setTimeout(() => {
                const hasHints = document.querySelector('.payment-hints');
                const paymentPlaceholder = document.querySelector('.payment-placeholder');
                if (hasHints && paymentPlaceholder) {
                    paymentPlaceholder.style.display = 'none';
                    console.log('已隱藏付款提示文字，因為有淡化金錢圖示');
                }
            }, 100);
            
            // ▼▼▼ 【需求 #1 修正】 ▼▼▼
            // 在付款場景渲染完成後，延遲播放語音提示，確保流暢
            setTimeout(() => {
                let speechText = '';
                if (selectedItem.category === 'multi-selection') {
                    // 自選多樣商品
                    const itemNames = selectedItem.items.map(item => item.name).join('、');
                    speechText = `你購買的商品有：${itemNames}，總共${selectedItem.price}元，請付錢。`;
                } else {
                    // 指定單一商品
                    const measureWord = this.getMeasureWord(selectedItem.name);
                    speechText = `你購買了1${measureWord}${selectedItem.name}，共${selectedItem.price}元，請付錢。`;
                }
                
                console.log(`🗣️ 播放付款提示語音: "${speechText}"`);
                this.speech.speak(speechText);
            }, 500); // 延遲500毫秒以等待畫面穩定
            // ▲▲▲ 【需求 #1 修正結束】 ▲▲▲
        },
        
        // 添加付款提示樣式
        addPaymentHintStyles() {
            if (!document.getElementById('payment-hint-styles')) {
                const style = document.createElement('style');
                style.id = 'payment-hint-styles';
                style.textContent = `
                    .payment-hints {
                        margin-top: 15px;
                        padding: 10px;
                        background: #f8f9fa;
                        border-radius: 8px;
                        border: 1px solid #dee2e6;
                    }
                    
                    .hints-title {
                        font-size: 14px;
                        color: #6c757d;
                        margin-bottom: 10px;
                        text-align: center;
                    }
                    
                    .visual-hints {
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                        flex-wrap: wrap;
                    }
                    
                    .hint-item, .payment-money-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 8px;
                        border-radius: 6px;
                        position: relative;
                        transition: all 0.3s ease;
                    }
                    
                    /* 淡化狀態 */
                    .hint-item.faded {
                        opacity: 0.4;
                        filter: grayscale(70%);
                        border: 2px dashed #ccc;
                        background: #f5f5f5;
                    }
                    
                    /* 點亮狀態 */
                    .hint-item.lit-up, .payment-money-item.lit-up {
                        opacity: 1;
                        filter: none;
                        background: rgba(76, 175, 80, 0.2);
                        border: 2px solid #4CAF50;
                        box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 10px;
                        border-radius: 10px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        min-width: 80px;
                        min-height: 100px;
                    }
                    
                    .hint-value {
                        font-size: 12px;
                        margin-top: 4px;
                        color: #333;
                        text-align: center;
                    }
                    
                    /* 拖拽懸停狀態 */
                    .hint-item.drag-over-hint {
                        transform: scale(1.1);
                        border-color: #2196F3 !important;
                        box-shadow: 0 0 15px rgba(33, 150, 243, 0.6);
                        background-color: rgba(33, 150, 243, 0.1);
                    }
                    
                    /* 普通和困難模式：付款區域拖拽懸停狀態 */
                    .payment-zone.drag-over-payment {
                        background-color: rgba(76, 175, 80, 0.1);
                        border: 2px dashed #4CAF50;
                        transform: scale(1.02);
                        transition: all 0.2s ease;
                    }
                    
                    .payment-zone.drag-over-payment .payment-placeholder {
                        color: #4CAF50;
                        font-weight: bold;
                    }
                    
                    /* 普通和困難模式：錢包拖回樣式 */
                    .wallet-content.drag-over-wallet-return {
                        background-color: rgba(33, 150, 243, 0.1);
                        border: 2px dashed #2196F3;
                        border-radius: 8px;
                        transform: scale(1.02);
                        transition: all 0.2s ease;
                    }
                `;
                document.head.appendChild(style);
            }
        },
        
        // 處理金錢拖曳開始
        // 處理金錢懸停語音
        handleMoneyHover(event) {
            const moneyElement = event.target.closest('.money-item');
            if (!moneyElement) return;
            
            const moneyName = moneyElement.dataset.moneyName;
            
            console.log('handleMoneyHover被調用:', moneyName);
            console.log('付款處理狀態:', this.state.gameState.isProcessingPayment);
            console.log('語音處理狀態:', this.state.gameState.isProcessingSpeech);
            
            // 如果正在付款處理中、語音處理中或顯示模態視窗，不播放懸停語音
            if (this.state.gameState.isProcessingPayment || this.state.gameState.isProcessingSpeech || this.state.gameState.isShowingModal) {
                console.log('語音被阻止播放，原因:', {
                    isProcessingPayment: this.state.gameState.isProcessingPayment,
                    isProcessingSpeech: this.state.gameState.isProcessingSpeech,
                    isShowingModal: this.state.gameState.isShowingModal
                });
                return;
            }
            
            // 清除之前的語音播放和狀態
            if (this.speech.currentUtterance) {
                window.speechSynthesis.cancel();
            }
            
            // 確保先清除舊狀態，然後設置新狀態
            this.state.gameState.isProcessingSpeech = false;
            setTimeout(() => {
                this.state.gameState.isProcessingSpeech = true;
                
                // 播放當前金錢的語音
                console.log('準備播放金錢語音:', moneyName);
                this.speech.speak(moneyName, {
                    callback: () => {
                        console.log('金錢語音播放完成');
                        this.state.gameState.isProcessingSpeech = false;
                    }
                });
            }, 10);
            
            // 備用清除機制：2秒後強制清除語音處理狀態
            setTimeout(() => {
                if (this.state.gameState.isProcessingSpeech) {
                    console.log('強制清除金錢語音處理狀態');
                    this.state.gameState.isProcessingSpeech = false;
                }
            }, 2000);
        },

        // 處理商品懸停語音
        handleProductHover(event) {
            const productElement = event.target.closest('.product-item');
            if (!productElement) return;
            
            const productName = productElement.dataset.itemName;
            const productPrice = productElement.dataset.itemPrice;
            
            console.log('handleProductHover被調用:', productName, productPrice);
            console.log('付款處理狀態:', this.state.gameState.isProcessingPayment);
            console.log('語音處理狀態:', this.state.gameState.isProcessingSpeech);
            
            // 如果正在付款處理中、語音處理中或顯示模態視窗，不播放懸停語音
            if (this.state.gameState.isProcessingPayment || this.state.gameState.isProcessingSpeech || this.state.gameState.isShowingModal) {
                console.log('商品語音被阻止播放，原因:', {
                    isProcessingPayment: this.state.gameState.isProcessingPayment,
                    isProcessingSpeech: this.state.gameState.isProcessingSpeech,
                    isShowingModal: this.state.gameState.isShowingModal
                });
                return;
            }
            
            // 清除之前的語音播放和狀態
            if (this.speech.currentUtterance) {
                window.speechSynthesis.cancel();
            }
            
            // 確保先清除舊狀態，然後設置新狀態
            this.state.gameState.isProcessingSpeech = false;
            setTimeout(() => {
                this.state.gameState.isProcessingSpeech = true;
                
                // 只播放商品名稱和價格，不進行預算檢查
                const speechText = `${productName}，${productPrice}元`;
                console.log('準備播放商品語音:', speechText);
                this.speech.speak(speechText, {
                    callback: () => {
                        console.log('商品語音播放完成');
                        this.state.gameState.isProcessingSpeech = false;
                    }
                });
            }, 10);
            
            // 備用清除機制：2秒後強制清除語音處理狀態
            setTimeout(() => {
                if (this.state.gameState.isProcessingSpeech) {
                    console.log('強制清除商品語音處理狀態');
                    this.state.gameState.isProcessingSpeech = false;
                }
            }, 2000);
        },

        // 🔧 [新增] 點擊放置功能處理函數
        handleMoneyClick(event) {
            console.log('🎯 [A1點擊除錯] handleMoneyClick 被呼叫');
            
            // 找到金錢元素
            const moneyElement = event.target.closest('.money-item') || event.target.closest('.payment-money-item');
            if (!moneyElement || !moneyElement.dataset.moneyId) {
                console.log('❌ [A1點擊除錯] 未找到有效的金錢元素');
                return;
            }
            
            const moneyId = moneyElement.dataset.moneyId;
            const currentTime = Date.now();
            const clickState = this.state.gameState.clickState;
            const difficulty = this.state.settings.difficulty;
            
            console.log('🔍 [A1點擊除錯] 點擊狀態檢查', {
                moneyId: moneyId,
                lastClickedElementId: clickState.lastClickedElement?.dataset?.moneyId,
                timeDiff: currentTime - clickState.lastClickTime,
                isPaymentItem: moneyElement.classList.contains('payment-money-item'),
                doubleClickDelay: clickState.doubleClickDelay
            });
            
            // 判斷是錢包中的錢還是付款區的錢
            const isPaymentMoney = moneyElement.classList.contains('payment-money-item');
            
            if (isPaymentMoney && (difficulty === 'normal' || difficulty === 'hard')) {
                // 付款區的錢 - 點擊一次即取回
                console.log('🔙 [A1點擊除錯] 點擊付款區金錢，執行取回');
                this.handleMoneyReturn(moneyElement);
                this.clearMoneySelection();
                return;
            }
            
            // 錢包中的錢 - 需要雙擊放置
            const isSameElement = clickState.lastClickedElement && 
                                clickState.lastClickedElement.dataset.moneyId === moneyId;
            const isWithinDoubleClickTime = (currentTime - clickState.lastClickTime) < clickState.doubleClickDelay;
            
            if (isSameElement && isWithinDoubleClickTime) {
                // 雙擊 - 執行放置
                console.log('✅ [A1點擊除錯] 偵測到雙擊，執行放置');
                this.executeMoneyPlacement(moneyElement);
                this.clearMoneySelection();
            } else {
                // 單擊 - 選擇金錢
                console.log('🔵 [A1點擊除錯] 第一次點擊，選擇金錢');
                this.selectMoney(moneyElement);
                clickState.lastClickTime = currentTime;
                clickState.lastClickedElement = moneyElement;
            }
        },
        
        // 選擇金錢物品
        selectMoney(moneyElement) {
            // 清除之前的選擇
            this.clearMoneySelection();
            
            // 標記新的選擇
            moneyElement.classList.add('selected-item');
            this.state.gameState.clickState.selectedItem = moneyElement;
            
            // 播放選擇音效
            if (this.audio.selectSound) {
                this.audio.selectSound.play().catch(console.log);
            }
            
            console.log('🎵 [A1點擊除錯] 金錢已選擇', { moneyId: moneyElement.dataset.moneyId });
        },
        
        // 清除金錢選擇狀態
        clearMoneySelection() {
            const selectedItem = this.state.gameState.clickState.selectedItem;
            if (selectedItem) {
                selectedItem.classList.remove('selected-item');
                this.state.gameState.clickState.selectedItem = null;
                console.log('🧹 [A1點擊除錯] 清除選擇狀態');
            }
        },
        
        // 執行金錢放置（模擬拖放邏輯）
        executeMoneyPlacement(moneyElement) {
            const moneyId = moneyElement.dataset.moneyId;
            
            // 找到對應的金錢物品資料
            const moneyItem = this.state.gameState.playerWallet.find(item => item.id === moneyId);
            if (!moneyItem) {
                console.error('❌ [A1點擊除錯] 找不到對應的金錢物品');
                return;
            }
            
            console.log('🚀 [A1點擊除錯] 執行金錢放置', { moneyItem: moneyItem.name });
            
            // 根據當前難度決定放置邏輯
            const difficulty = this.state.settings.difficulty;
            
            if (difficulty === 'easy') {
                // 簡單模式：尋找對應的提示位置
                this.handleEasyModeClick(moneyItem, moneyElement);
            } else if (difficulty === 'normal' || difficulty === 'hard') {
                // 普通/困難模式：直接放置到付款區域
                this.handleDirectPaymentClick(moneyItem, moneyElement);
            }
        },
        
        // 簡單模式點擊處理
        handleEasyModeClick(moneyItem, moneyElement) {
            const hintItems = document.querySelectorAll('.hint-item[data-type="money"]');
            const targetHint = Array.from(hintItems).find(item => 
                parseInt(item.dataset.value) === moneyItem.value && !item.classList.contains('completed')
            );
            
            if (targetHint) {
                console.log('✅ [A1點擊除錯] 簡單模式 - 找到對應提示位置');
                
                // 模擬拖放到提示位置
                const mockEvent = {
                    target: targetHint,
                    preventDefault: () => {},
                    dataTransfer: {
                        getData: () => moneyItem.id
                    }
                };
                
                this.handleMoneyDrop(mockEvent);
            } else {
                console.log('❌ [A1點擊除錯] 簡單模式 - 沒有找到對應的提示位置');
                this.audio.playErrorSound();
            }
        },
        
        // 普通/困難模式直接付款處理
        handleDirectPaymentClick(moneyItem, moneyElement) {
            console.log('💰 [A1點擊除錯] 普通/困難模式 - 直接付款');
            
            // 從錢包移除錢幣
            const walletIndex = this.state.gameState.playerWallet.findIndex(m => m.id === moneyItem.id);
            if (walletIndex !== -1) {
                this.state.gameState.playerWallet.splice(walletIndex, 1);
                this.state.gameState.walletTotal -= moneyItem.value;
            }
            
            // 加入付款金額
            this.state.gameState.currentTransaction.amountPaid += moneyItem.value;
            this.state.gameState.currentTransaction.paidMoney.push(moneyItem);
            
            // 播放成功音效
            this.audio.playDropSound();
            
            // 更新UI
            this.updatePaymentDisplay();
            
            // 根據難度決定是否播放語音提示
            const difficulty = this.state.settings.difficulty;
            if (difficulty === 'normal') {
                this.state.gameState.isProcessingPayment = true;
                this.state.gameState.isProcessingSpeech = false;
                this.speech.speak(`已放入${moneyItem.name}，目前付款總額${this.state.gameState.currentTransaction.amountPaid}元`, { 
                    interrupt: true,
                    callback: () => {
                        this.state.gameState.isProcessingPayment = false;
                    }
                });
            }
            
            // 檢查付款是否完成
            this.checkPaymentCompletion();
        },
        
        // 點擊取回付款區金錢
        handleMoneyReturn(moneyElement) {
            const moneyId = moneyElement.dataset.moneyId;
            console.log('🔄 [A1點擊除錯] 處理金錢取回', { moneyId });
            
            // 找到對應的金錢物品
            const paidMoneyIndex = this.state.gameState.currentTransaction.paidMoney.findIndex(m => m.id === moneyId);
            if (paidMoneyIndex === -1) {
                console.error('❌ [A1點擊除錯] 找不到對應的已付款金錢');
                return;
            }
            
            const moneyItem = this.state.gameState.currentTransaction.paidMoney[paidMoneyIndex];
            
            // 從付款中移除
            this.state.gameState.currentTransaction.paidMoney.splice(paidMoneyIndex, 1);
            this.state.gameState.currentTransaction.amountPaid -= moneyItem.value;
            
            // 放回錢包
            this.state.gameState.playerWallet.push(moneyItem);
            this.state.gameState.walletTotal += moneyItem.value;
            
            // 播放音效
            if (this.audio.selectSound) {
                this.audio.selectSound.play().catch(console.log);
            }
            
            console.log('✅ [A1點擊除錯] 金錢已取回', { 
                moneyName: moneyItem.name,
                newAmountPaid: this.state.gameState.currentTransaction.amountPaid 
            });
            
            // 更新UI
            this.updatePaymentDisplay();
        },
        
        // 🔧 [新增] 檢查付款是否完成
        checkPaymentCompletion() {
            const transaction = this.state.gameState.currentTransaction;
            const isPaymentComplete = transaction.amountPaid >= transaction.totalCost;
            
            console.log('💰 [A1付款檢查] 檢查付款狀態', {
                amountPaid: transaction.amountPaid,
                totalCost: transaction.totalCost,
                isComplete: isPaymentComplete
            });
            
            if (isPaymentComplete) {
                console.log('✅ [A1付款檢查] 付款已完成');
                // 這裡可以添加付款完成後的邏輯，如顯示找錢或完成提示
                // 目前保持與原有邏輯一致，不自動觸發下一步
            }
        },

        handleMoneyDragStart(event) {
            // 尋找拖拽的金錢元素，可能是 .money-item 或 .payment-money-item
            const moneyElement = event.target.closest('.money-item') || event.target.closest('.payment-money-item');
            
            if (!moneyElement || !moneyElement.dataset.moneyId) {
                console.error('無法找到有效的金錢元素或金錢ID');
                event.preventDefault();
                return;
            }
            
            const moneyId = moneyElement.dataset.moneyId;
            event.dataTransfer.setData('text/plain', moneyId);
            event.dataTransfer.effectAllowed = 'move';
        },
        
        // 處理拖曳懸停
        handleDragOver(event) {
            const difficulty = this.state.settings.difficulty;
            const hintItem = event.target.closest('.hint-item');
            const paymentZone = event.target.closest('.payment-zone');
            
            if (difficulty === 'easy' && hintItem) {
                // 簡單模式：只允許拖曳到提示位置
                event.preventDefault(); 
                event.dataTransfer.dropEffect = 'move';
            } else if ((difficulty === 'normal' || difficulty === 'hard') && paymentZone) {
                // 普通和困難模式：允許拖曳到整個付款區域
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
            } else {
                event.dataTransfer.dropEffect = 'none';
            }
        },
        
        // 處理拖曳進入
        handleDragEnter(event) {
            event.preventDefault();
            const difficulty = this.state.settings.difficulty;
            const hintItem = event.target.closest('.hint-item');
            const paymentZone = event.target.closest('.payment-zone');
            
            if (difficulty === 'easy' && hintItem && hintItem.classList.contains('faded')) {
                // 簡單模式：為提示項目添加視覺反饋
                hintItem.classList.add('drag-over-hint');
            } else if ((difficulty === 'normal' || difficulty === 'hard') && paymentZone) {
                // 普通和困難模式：為付款區域添加視覺反饋
                paymentZone.classList.add('drag-over-payment');
            }
        },
        
        // 處理拖曳離開
        handleDragLeave(event) {
            const difficulty = this.state.settings.difficulty;
            const hintItem = event.target.closest('.hint-item');
            const paymentZone = event.target.closest('.payment-zone');
            
            if (difficulty === 'easy' && hintItem) {
                // 簡單模式：移除提示項目的視覺反饋
                hintItem.classList.remove('drag-over-hint');
            } else if ((difficulty === 'normal' || difficulty === 'hard') && paymentZone) {
                // 普通和困難模式：移除付款區域的視覺反饋
                paymentZone.classList.remove('drag-over-payment');
            }
        },
        
        // 處理金錢放置
        handleMoneyDrop(event) {
            event.preventDefault();
            
            // 清除所有拖拽樣式
            document.querySelectorAll('.hint-item').forEach(item => {
                item.classList.remove('drag-over-hint');
            });
            document.querySelectorAll('.payment-zone').forEach(zone => {
                zone.classList.remove('drag-over-payment');
            });
            
            const moneyId = event.dataTransfer.getData('text/plain');
            const moneyItem = this.state.gameState.playerWallet.find(m => m.id === moneyId);
            
            if (!moneyItem) {
                console.error('找不到拖曳的錢幣:', moneyId);
                return;
            }
            
            const difficulty = this.state.settings.difficulty;
            
            // 簡單模式：檢查是否拖曳到提示位置
            if (difficulty === 'easy') {
                const hintItem = event.target.closest('.hint-item');
                if (hintItem && this.state.gameState.droppedItems) {
                    const position = parseInt(hintItem.dataset.position);
                    const expectedValue = parseInt(hintItem.dataset.value);
                    
                    // 檢查面額是否匹配且位置未被佔用
                    if (moneyItem.value === expectedValue && this.state.gameState.droppedItems[position] === null) {
                        // 放置到提示位置成功
                        this.state.gameState.droppedItems[position] = {
                            moneyItem: moneyItem,
                            imageSrc: moneyItem.displayImage || moneyItem.images.front
                        };
                    
                    // 點亮該提示位置
                    hintItem.className = 'hint-item lit-up';
                    hintItem.querySelector('img').src = moneyItem.displayImage || moneyItem.images.front;
                    
                    // 從錢包移除
                    const walletIndex = this.state.gameState.playerWallet.findIndex(m => m.id === moneyId);
                    if (walletIndex !== -1) {
                        this.state.gameState.playerWallet.splice(walletIndex, 1);
                        this.state.gameState.walletTotal -= moneyItem.value;
                    }
                    
                    // 標記為提示位置付款
                    moneyItem.isHintPlacement = true;
                    this.state.gameState.currentTransaction.paidMoney.push(moneyItem);
                    this.state.gameState.currentTransaction.amountPaid += moneyItem.value;
                    
                    console.log(`錢幣 ${moneyItem.name} 已放置到提示位置 ${position}`);
                    
                    // 播放成功音效和語音
                    this.audio.playDropSound();
                    
                    // 根據難度決定是否播放語音提示
                    if (difficulty === 'easy' || difficulty === 'normal') {
                        // 設置付款處理標誌，防止懸停語音干擾
                        this.state.gameState.isProcessingPayment = true;
                        this.state.gameState.isProcessingSpeech = false; // 清除一般語音處理標誌
                        this.speech.speak(`已放入${moneyItem.name}，目前付款總額${this.state.gameState.currentTransaction.amountPaid}元`, { 
                            interrupt: true,
                            callback: () => {
                                // 語音完成後清除處理標誌
                                this.state.gameState.isProcessingPayment = false;
                            }
                        });
                    }
                    // 困難模式不播放語音提示
                    } else {
                        // 錯誤情況：面額不匹配或位置已被佔用
                        console.log('面額不匹配或位置已被佔用');
                        this.handleInvalidDrop(moneyItem);
                        return;
                    }
                } else {
                    // 簡單模式但沒有找到提示項目
                    console.log('簡單模式：沒有找到有效的提示位置');
                    this.handleInvalidDrop(moneyItem);
                    return;
                }
            } else if (difficulty === 'normal' || difficulty === 'hard') {
                // 普通和困難模式：直接付款處理
                const paymentZone = event.target.closest('.payment-zone');
                if (paymentZone) {
                    // 成功拖曳到付款區域，直接將錢幣加入付款
                    console.log(`${difficulty}模式 - 直接付款:`, moneyItem.name);
                    
                    // 從錢包移除錢幣
                    const walletIndex = this.state.gameState.playerWallet.findIndex(m => m.id === moneyId);
                    if (walletIndex !== -1) {
                        this.state.gameState.playerWallet.splice(walletIndex, 1);
                        this.state.gameState.walletTotal -= moneyItem.value;
                    }
                    
                    // 加入付款金額
                    this.state.gameState.currentTransaction.amountPaid += moneyItem.value;
                    this.state.gameState.currentTransaction.paidMoney.push(moneyItem);
                    
                    // 播放成功音效
                    this.audio.playDropSound();
                    
                    // 根據難度決定是否播放語音提示
                    if (difficulty === 'normal') {
                        // 設置付款處理標誌，防止懸停語音干擾
                        this.state.gameState.isProcessingPayment = true;
                        this.state.gameState.isProcessingSpeech = false;
                        this.speech.speak(`已放入${moneyItem.name}，目前付款總額${this.state.gameState.currentTransaction.amountPaid}元`, { 
                            interrupt: true,
                            callback: () => {
                                // 語音完成後清除處理標誌
                                this.state.gameState.isProcessingPayment = false;
                            }
                        });
                    }
                    // 困難模式不播放語音提示
                } else {
                    // 拖曳到付款區域外的其他地方
                    console.log('不能放置到付款區域外');
                    this.handleInvalidDrop(moneyItem);
                    return;
                }
            } else {
                // 簡單模式但拖曳到非提示位置的其他區域 - 這是不允許的
                console.log('不能放置到非提示位置');
                this.handleInvalidDrop(moneyItem);
                return;
            }
            
            // 更新顯示
            this.updatePaymentDisplay();
        },
        
        // 處理無效的拖拽放置
        handleInvalidDrop(moneyItem) {
            // 播放錯誤音效
            this.audio.playErrorSound();
            
            // 錢幣返回錢包（實際上不需要操作，因為錢幣從未被移除）
            // 但為了視覺效果，可以添加一個短暫的反饋
            
            // 根據難度決定是否播放語音提示
            const difficulty = this.state.settings.difficulty;
            if (difficulty === 'easy' || difficulty === 'normal') {
                const hintExists = this.state.gameState.droppedItems && this.state.gameState.droppedItems.length > 0;
                if (hintExists && difficulty === 'easy') {
                    // 簡單模式：提到淡化圖示
                    this.speech.speak('請將錢幣拖到對應面額的淡化圖示上', { interrupt: true });
                } else if (hintExists && difficulty === 'normal') {
                    // 普通模式：不提淡化圖示（因為沒有視覺提示）
                    this.speech.speak('請將錢幣拖到正確的付款位置', { interrupt: true });
                } else {
                    this.speech.speak('付款區域不接受此操作', { interrupt: true });
                }
            }
            // 困難模式不播放語音提示
            
            console.log(`無效拖拽：${moneyItem.name} 已返回錢包`);
        },
        
        // 更新付款顯示
        updatePaymentDisplay() {
            const transaction = this.state.gameState.currentTransaction;
            const paidAmount = transaction.amountPaid;
            const itemPrice = transaction.totalCost;
            const changeAmount = paidAmount - itemPrice;
            
            // 更新錢包顯示
            const walletContent = document.querySelector('.wallet-content');
            if (walletContent) {
                walletContent.innerHTML = this.renderWalletContent();
            }
            
            // Update wallet title with total (since we combined them)
            const walletTitle = document.querySelector('.wallet-area-top h3');
            if (walletTitle) {
                walletTitle.textContent = `我的錢包 總計：${this.state.gameState.walletTotal}元`;
            }
            
            // 顯示付款區域的錢幣（不顯示已放置在提示位置的錢幣）
            const paymentMoney = document.getElementById('payment-money');
            const paymentPlaceholder = document.querySelector('.payment-placeholder');
            
            // 過濾出只放置在一般區域的錢幣（排除提示位置的錢幣）
            const generalAreaMoney = transaction.paidMoney.filter(money => !money.isHintPlacement);
            
            if (generalAreaMoney.length > 0) {
                paymentPlaceholder.style.display = 'none';
                paymentMoney.style.display = 'flex';
                
                const difficulty = this.state.settings.difficulty;
                const isDraggable = difficulty === 'normal' || difficulty === 'hard';
                
                paymentMoney.innerHTML = generalAreaMoney.map(money => `
                    <div class="payment-money-item lit-up ${isDraggable ? 'draggable-back' : ''}"
                         ${isDraggable ? `draggable="true" ondragstart="Game.handleMoneyDragStart(event)"` : ''}
                         onclick="Game.handleMoneyClick(event)"
                         data-money-id="${money.id}">
                        <img src="${money.images.front}" alt="${money.name}" style="width: 60px; height: 60px;">
                        <div class="hint-value">${money.name}</div>
                    </div>
                `).join('');
            } else {
                // 如果沒有在一般區域的錢幣，隱藏payment-money
                paymentMoney.style.display = 'none';
                // 如果有提示區域且沒有一般付款，也隱藏placeholder
                const hasHints = document.querySelector('.payment-hints');
                if (hasHints) {
                    paymentPlaceholder.style.display = 'none';
                }
            }
            
            // 顯示付款摘要
            const paymentSummary = document.getElementById('payment-summary');
            const paidAmountSpan = document.getElementById('paid-amount');
            const changeAmountSpan = document.getElementById('change-amount');
            const difficulty = this.state.settings.difficulty;
            
            if (paidAmount > 0) {
                paymentSummary.style.display = 'block';
                
                // 困難模式：隱藏具體金額
                if (difficulty === 'hard') {
                    paidAmountSpan.textContent = '？？？元';
                    paidAmountSpan.className = 'hard-mode-amount'; // 添加特殊樣式
                    // 困難模式不顯示找零信息
                    changeAmountSpan.parentElement.style.display = 'none';
                } else {
                    paidAmountSpan.textContent = `${paidAmount}元`;
                    changeAmountSpan.textContent = `${changeAmount}元`;
                    changeAmountSpan.className = changeAmount >= 0 ? 'positive-change' : 'negative-change';
                    changeAmountSpan.parentElement.style.display = 'block';
                }
            }
            
            // 更新確認按鈕狀態
            const confirmBtn = document.getElementById('confirm-payment');
            if (paidAmount >= itemPrice) {
                confirmBtn.disabled = false;
                confirmBtn.classList.add('ready');
                confirmBtn.textContent = '確認付款';
            } else {
                confirmBtn.disabled = true;
                confirmBtn.classList.remove('ready');
                confirmBtn.textContent = `還需要${itemPrice - paidAmount}元`;
            }
        },
        
        // 檢查是否有多餘的金錢（普通模式專用）
        hasExcessMoney(paidMoney, targetAmount) {
            // 遍歷每個已付款的金錢，檢查移除任何一個後是否仍能滿足付款需求
            for (let i = 0; i < paidMoney.length; i++) {
                const moneyToRemove = paidMoney[i];
                const remainingAmount = paidMoney
                    .filter((_, index) => index !== i)
                    .reduce((sum, money) => sum + money.value, 0);
                
                // 如果移除這個金錢後仍然大於等於目標金額，說明這個金錢是多餘的
                if (remainingAmount >= targetAmount) {
                    console.log(`發現多餘金錢: ${moneyToRemove.name}，移除後剩餘金額: ${remainingAmount}元`);
                    return true;
                }
            }
            return false;
        },
        
        // 確認付款
        confirmPayment() {
            const transaction = this.state.gameState.currentTransaction;
            const paidAmount = transaction.amountPaid;
            const itemPrice = transaction.totalCost;
            const difficulty = this.state.settings.difficulty;
            
            if (paidAmount < itemPrice) {
                if (difficulty === 'easy' || difficulty === 'normal') {
                    this.speech.speak('付款金額不足，請繼續拖曳錢幣', { interrupt: true });
                }
                this.audio.playErrorSound();
                return;
            }
            
            // 普通模式專用：檢查是否有多餘的金錢
            if (difficulty === 'normal' && paidAmount > itemPrice) {
                const paidMoney = transaction.paidMoney.filter(money => !money.isHintPlacement);
                if (this.hasExcessMoney(paidMoney, itemPrice)) {
                    this.audio.playErrorSound();
                    this.speech.speak('你付了太多的錢，請收回多餘的錢', { interrupt: true });
                    return;
                }
            }
            
            const changeAmount = paidAmount - itemPrice;
            transaction.changeExpected = changeAmount;
            
            // 先播放 checkout.mp3 音效，再播放付款確認語音，然後進入找零頁面
            this.audio.playCheckoutSound(() => {
                this.speech.speak(`你總共付了${paidAmount}元`, {
                    callback: () => {
                        // 總是進入找零驗證頁面，不管是否需要找零
                        if (changeAmount > 0) {
                            // 需要找零，生成找零
                            this.generateChange();
                        }
                        
                        // 顯示找零驗證場景
                        this.showChangeVerification();
                        
                        // 困難模式不播放找零相關語音，其他模式正常播放
                        if (difficulty !== 'hard') {
                            setTimeout(() => {
                                if (changeAmount > 0) {
                                    this.speech.speak(`需要找你${changeAmount}元`);
                                } else {
                                    this.speech.speak(`不需要找零錢`);
                                }
                            }, 500);
                        }
                    }
                });
            });
        },
        
        // 生成找零
        generateChange() {
            let changeAmount = this.state.gameState.currentTransaction.changeExpected;
            const changeCoins = [];
            const availableMoney = [...this.storeData.moneyItems].reverse();
            
            // 貪心算法計算找零
            for (const money of availableMoney) {
                while (changeAmount >= money.value) {
                    changeCoins.push({
                        ...money,
                        id: `change_${money.value}_${Date.now()}_${Math.random()}`
                    });
                    changeAmount -= money.value;
                }
            }
            
            this.state.gameState.currentTransaction.changeReceived = changeCoins;
            console.log('系統找零:', changeCoins);
        },
        
        // 顯示找零驗證
        showChangeVerification() {
            const app = document.getElementById('app');
            const transaction = this.state.gameState.currentTransaction;
            const selectedItem = this.state.gameState.selectedItem;
            const settings = this.state.settings;
            const difficulty = settings.difficulty;
            
            console.log('找零驗證 - 難度:', difficulty);
            console.log('找零驗證 - 預期找零金額:', transaction.changeExpected);
            console.log('找零驗證 - 是否簡單模式且需找零:', difficulty === 'easy' && transaction.changeExpected > 0);
            
            this.state.gameState.currentScene = 'checking';
            
            // 簡單模式使用新的拖曳找零系統
            if (difficulty === 'easy' && transaction.changeExpected > 0) {
                console.log('使用簡單模式找零驗證');
                this.showEasyModeChangeVerification(app, transaction, selectedItem);
            } else {
                console.log('使用普通/困難模式找零驗證');
                // 普通和困難模式，或無需找零的情況，保持原有邏輯
                this.showNormalHardModeChangeVerification(app, transaction, selectedItem);
            }
        },
        
        // 簡單模式找零驗證（拖曳系統）
        showEasyModeChangeVerification(app, transaction, selectedItem) {
            // 計算剩餘錢包內容（扣除已付款的錢幣）
            const remainingWallet = this.calculateRemainingWallet();
            
            // 獲取當前難度設定
            const difficulty = this.state.settings.difficulty;
            
            // 初始化找零拖曳狀態
            this.state.gameState.changeDropTargets = transaction.changeReceived.map((money, index) => ({
                expectedMoney: money,
                isDropped: false,
                position: index
            }));
            
            
            app.innerHTML = `
                <div class="store-layout">
                    <div class="title-bar">
                        <div class="title-bar-left">
                            <span class="store-icon-large">${this.getCurrentStoreInfo().emoji}</span>
                            <span>${this.getCurrentStoreInfo().name}</span>
                        </div>
                        <div class="title-bar-center">第三步：確認有沒有需要找零錢</div>
                        <div class="title-bar-right">
                            <span>第 ${this.state.quiz.currentQuestion + 1} 題 / 共 ${this.state.settings.questionCount} 題</span>
                            <button class="back-to-menu-btn" onclick="location.reload()">返回設定</button>
                        </div>
                    </div>
                    
                    <div class="transaction-summary">
                        <h2>交易摘要</h2>
                        <div class="summary-details">
                            <div class="summary-item">
                                <span>購買商品：</span>
                                <span>${this.formatItemDisplay(selectedItem, 'small')}</span>
                            </div>
                            <div class="summary-item">
                                <span>商品價格：</span>
                                <span>${transaction.totalCost}元</span>
                            </div>
                            <div class="summary-total">
                                <span>已付金額：</span>
                                <span>${transaction.amountPaid}元</span>
                            </div>
                            <div class="summary-change">
                                <span>應找零額：</span>
                                <span class="change-amount ${difficulty === 'hard' ? 'hard-mode-amount' : ''}">${difficulty === 'hard' ? '？？？元' : transaction.changeExpected + '元'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="change-check-area">
                        <h3>店家找零</h3>
                        <div class="store-change">
                            ${transaction.changeReceived.map((money, index) => `
                                <div class="change-money draggable" 
                                     data-change-id="${index}"
                                     data-money-value="${money.value}"
                                     data-money-name="${money.name}"
                                     draggable="true"
                                     ondragstart="Game.handleChangeDragStart(event)"
                                     onclick="Game.handleChangeMoneyClick(event)"
                                     onmouseenter="Game.handleChangeMoneyHover(event)">
                                    <img src="${money.images.front}" alt="${money.name}" style="width: 50px; height: 50px; pointer-events: none;">
                                    <span style="pointer-events: none;">${money.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="wallet-area">
                        <h3>我的錢包</h3>
                        <div class="wallet-content"
                             ondrop="Game.handleChangeWalletDrop(event)"
                             ondragover="Game.handleChangeWalletDragOver(event)"
                             ondragenter="Game.handleChangeWalletDragEnter(event)"
                             ondragleave="Game.handleChangeWalletDragLeave(event)">
                            
                            <!-- 第1列：找回零錢區（淡化圖示） -->
                            <div class="change-targets-row">
                                <h4>第1列：找回零錢區</h4>
                                <div class="change-targets">
                                    ${transaction.changeExpected > 0 ? 
                                        transaction.changeReceived.map((money, index) => {
                                            const isBanknote = money.value >= 100;
                                            const itemClass = isBanknote ? 'money-item banknote' : 'money-item coin';
                                            return `
                                            <div class="${itemClass} change-target faded" 
                                                 data-target-index="${index}"
                                                 data-expected-value="${money.value}">
                                                <img src="${money.images.front}" alt="${money.name}">
                                                <div class="money-value">${money.name}</div>
                                            </div>
                                        `;
                                        }).join('') 
                                        : 
                                        `<!-- 無找零時為空白 -->`
                                    }
                                </div>
                            </div>
                            
                            <!-- 第2列：剩餘錢包內容 -->
                            <div class="remaining-wallet-row">
                                <h4>第2列：我的錢包</h4>
                                <div class="remaining-wallet">
                                    ${remainingWallet.map(money => {
                                        const isBanknote = money.value >= 100;
                                        const itemClass = isBanknote ? 'money-item banknote' : 'money-item coin';
                                        return `
                                        <div class="${itemClass}" 
                                             data-money-id="${money.id}" 
                                             data-money-name="${money.name}"
                                             onclick="Game.handleWalletChangeClick(event)">
                                            <img src="${money.displayImage || money.images.front}" alt="${money.name}">
                                            <div class="money-value">${money.name}</div>
                                        </div>
                                    `;
                                    }).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // 添加拖曳樣式
            this.addChangeDragStyles();
            
            // ▼▼▼ 【需求 #2 修正】 ▼▼▼ 
            // 簡單模式也添加找零語音提示
            setTimeout(() => {
                const itemNames = selectedItem.category === 'multi-selection' 
                                ? selectedItem.items.map(item => item.name).join('、')
                                : selectedItem.name;

                const speechText = `你購買的商品有：${itemNames}，共${transaction.totalCost}元。你付了${transaction.amountPaid}元，請問有沒有需要找零錢，要找多少錢？`;

                console.log(`🗣️ 播放找零提示語音 (簡單模式): "${speechText}"`);
                this.speech.speak(speechText);
            }, 500); // 延遲500毫秒
            // ▲▲▲ 【需求 #2 修正結束】 ▲▲▲
        },
        
        // 普通和困難模式找零驗證（拖曳系統）
        showNormalHardModeChangeVerification(app, transaction, selectedItem) {
            // 計算剩餘錢包內容（扣除已付款的錢幣）
            const remainingWallet = this.calculateRemainingWallet();
            
            // 初始化普通模式找零拖曳狀態
            this.state.gameState.normalChangeCollected = [];
            
            // 生成所有可能的找零金錢（500元、100元、50元、10元、5元、1元）
            const availableChangeMoney = [
                { value: 500, name: '500元', images: { front: 'images/500_yuan_front.png' } },
                { value: 100, name: '100元', images: { front: 'images/100_yuan_front.png' } },
                { value: 50, name: '50元', images: { front: 'images/50_yuan_front.png' } },
                { value: 10, name: '10元', images: { front: 'images/10_yuan_front.png' } },
                { value: 5, name: '5元', images: { front: 'images/5_yuan_front.png' } },
                { value: 1, name: '1元', images: { front: 'images/1_yuan_front.png' } }
            ];
            
            // 統一使用store-layout類別以確保標題欄充滿視窗寬度
            const difficulty = this.state.settings.difficulty;
            const isEasyModeNoChange = difficulty === 'easy' && transaction.changeExpected === 0;
            const containerClass = 'store-layout';
            
            app.innerHTML = `
                <div class="${containerClass}">
                    <div class="title-bar">
                        <div class="title-bar-left">
                            <span class="store-icon-large">${this.getCurrentStoreInfo().emoji}</span>
                            <span>${this.getCurrentStoreInfo().name}</span>
                        </div>
                        <div class="title-bar-center">第三步：確認有沒有需要找零錢</div>
                        <div class="title-bar-right">
                            <span>第 ${this.state.quiz.currentQuestion + 1} 題 / 共 ${this.state.settings.questionCount} 題</span>
                            <button class="back-to-menu-btn" onclick="location.reload()">返回設定</button>
                        </div>
                    </div>
                    
                    <div class="transaction-summary">
                        <h2>交易摘要</h2>
                        <div class="summary-details">
                            <div class="summary-item">
                                <span>購買商品：</span>
                                <span>${this.formatItemDisplay(selectedItem, 'small')}</span>
                            </div>
                            <div class="summary-item">
                                <span>商品價格：</span>
                                <span>${transaction.totalCost}元</span>
                            </div>
                            <div class="summary-total">
                                <span>已付金額：</span>
                                <span>${transaction.amountPaid}元</span>
                            </div>
                            <div class="summary-change">
                                <span>應找零額：</span>
                                <span class="change-amount ${difficulty === 'hard' ? 'hard-mode-amount' : ''}">${difficulty === 'hard' ? '？？？元' : transaction.changeExpected + '元'}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${isEasyModeNoChange ? `
                        <!-- 簡單模式無找零的2列結構 -->
                        <div class="wallet-area">
                            <h3>我的錢包</h3>
                            <div class="wallet-content">
                                <!-- 第1列：找回零錢區（無找零時空白） -->
                                <div class="change-targets-row">
                                    <h4>第1列：找回零錢區</h4>
                                    <div class="change-targets">
                                        <!-- 無找零時為空白 -->
                                    </div>
                                </div>
                                
                                <!-- 第2列：剩餘錢包內容 -->
                                <div class="remaining-wallet-row">
                                    <h4>第2列：我的錢包</h4>
                                    <div class="remaining-wallet">
                                        ${remainingWallet.map(money => {
                                            const isBanknote = money.value >= 100;
                                            const itemClass = isBanknote ? 'money-item banknote' : 'money-item coin';
                                            return `
                                            <div class="${itemClass}" 
                                                 data-money-id="${money.id}" 
                                                 data-money-name="${money.name}"
                                                 onclick="Game.handleWalletChangeClick(event)">
                                                <img src="${money.displayImage || money.images.front}" alt="${money.name}">
                                                <div class="money-value">${money.name}</div>
                                            </div>
                                        `;
                                        }).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <!-- 普通/困難模式的原有結構 -->
                        <div class="change-check-area">
                            <h3>店家找零:${difficulty === 'hard' ? '？？？元' : transaction.changeExpected + '元'}</h3>
                            <div class="store-change"
                                 ondrop="Game.handleStoreChangeDrop(event)"
                                 ondragover="Game.handleStoreChangeDragOver(event)"
                                 ondragenter="Game.handleStoreChangeDragEnter(event)"
                                 ondragleave="Game.handleStoreChangeDragLeave(event)">
                                ${availableChangeMoney.map((money, index) => `
                                    <div class="change-money draggable" 
                                         data-change-id="${index}"
                                         data-money-value="${money.value}"
                                         data-money-name="${money.name}"
                                         draggable="true"
                                         ondragstart="Game.handleNormalChangeDragStart(event)"
                                         onclick="Game.handleNormalChangeMoneyClick(event)"
                                         onmouseenter="Game.handleChangeMoneyHover(event)">
                                        <img src="${money.images.front}" alt="${money.name}" style="width: 50px; height: 50px; pointer-events: none;">
                                        <span style="pointer-events: none;">${money.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="wallet-area">
                            <h3>我的錢包</h3>
                            <div class="wallet-content"
                                 ondrop="Game.handleNormalChangeWalletDrop(event)"
                                 ondragover="Game.handleNormalChangeWalletDragOver(event)"
                                 ondragenter="Game.handleNormalChangeWalletDragEnter(event)"
                                 ondragleave="Game.handleNormalChangeWalletDragLeave(event)">
                                
                                <!-- 收集到的找零金錢顯示區域 -->
                                <div class="collected-change-area">
                                    <h4>找回的零錢</h4>
                                    <div class="collected-change" id="collected-change">
                                        <!-- 動態顯示收集到的找零金錢 -->
                                    </div>
                                </div>
                                
                                <!-- 找零控制按鈕區域 -->
                                ${!isEasyModeNoChange ? `
                                    <div class="change-action-area">
                                        ${difficulty === 'hard' ? `
                                            <button class="complete-change-btn" onclick="Game.completeNormalChange()">
                                                完成找零
                                            </button>
                                            <button class="no-change-btn" onclick="Game.completeNoChange()">
                                                不需找零
                                            </button>
                                        ` : `
                                            <button class="complete-change-btn" onclick="Game.completeNormalChange()">
                                                完成找零
                                            </button>
                                        `}
                                    </div>
                                ` : ''}
                                
                                <!-- 第2列：剩餘錢包內容 -->
                                <div class="remaining-wallet-row">
                                    <h4>第2列：我的錢包</h4>
                                    <div class="remaining-wallet">
                                        ${remainingWallet.map(money => {
                                            const isBanknote = money.value >= 100;
                                            const itemClass = isBanknote ? 'money-item banknote' : 'money-item coin';
                                            return `
                                            <div class="${itemClass}" 
                                                 data-money-id="${money.id}" 
                                                 data-money-name="${money.name}"
                                                 onclick="Game.handleWalletChangeClick(event)">
                                                <img src="${money.displayImage || money.images.front}" alt="${money.name}">
                                                <div class="money-value">${money.name}</div>
                                            </div>
                                        `;
                                        }).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `}
                    
                    ${isEasyModeNoChange ? `
                        <!-- 簡單模式無找零的確認按鈕 -->
                        <div class="action-buttons">
                            <button class="confirm-btn" onclick="Game.completeEasyModeNoChange()">
                                確認無需找零
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
            
            // 根據模式添加對應的樣式
            if (isEasyModeNoChange) {
                this.addChangeDragStyles(); // 使用簡單模式樣式
            } else {
                this.addNormalChangeDragStyles(); // 使用普通模式樣式
            }
            
            // ▼▼▼ 【需求 #2 修正】 ▼▼▼
            // 在找零驗證場景渲染完成後，延遲播放語音提示
            setTimeout(() => {
                const itemNames = selectedItem.category === 'multi-selection' 
                                ? selectedItem.items.map(item => item.name).join('、')
                                : selectedItem.name;

                const speechText = `你購買的商品有：${itemNames}，共${transaction.totalCost}元。你付了${transaction.amountPaid}元，請問有沒有需要找零錢，要找多少錢？`;

                console.log(`🗣️ 播放找零提示語音: "${speechText}"`);
                this.speech.speak(speechText);
            }, 500); // 延遲500毫秒
            // ▲▲▲ 【需求 #2 修正結束】 ▲▲▲
        },
        
        // 添加普通模式找零拖曳樣式
        addNormalChangeDragStyles() {
            if (!document.getElementById('normal-change-drag-styles')) {
                const style = document.createElement('style');
                style.id = 'normal-change-drag-styles';
                style.textContent = `
                    .store-layout .change-check-area {
                        background: white;
                        margin: 20px;
                        padding: 30px;
                        border-radius: 15px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    }
                    
                    .store-layout .wallet-area {
                        background: white;
                        margin: 20px;
                        padding: 30px;
                        border-radius: 15px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                        width: calc(100% - 40px);
                        box-sizing: border-box;
                    }
                    
                    .remaining-wallet-row, .change-targets-row, .collected-change-area {
                        margin-bottom: 20px;
                        padding: 15px;
                        border: 1px solid #ddd;
                        border-radius: 10px;
                        background: #f9f9f9;
                        width: 100%;
                        box-sizing: border-box;
                    }
                    
                    .remaining-wallet-row h4, .change-targets-row h4, .collected-change-area h4 {
                        margin: 0 0 15px 0;
                        color: #333;
                        font-size: 16px;
                        font-weight: bold;
                    }
                    
                    .collected-change {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                        min-height: 60px;
                        border: 2px dashed #ccc;
                        border-radius: 8px;
                        padding: 10px;
                        background: white;
                    }
                    
                    .collected-change.drag-over {
                        border-color: #4CAF50;
                        background-color: rgba(76, 175, 80, 0.1);
                    }
                    
                    .store-change.drag-over-store {
                        border: 2px solid #4CAF50;
                        background-color: rgba(76, 175, 80, 0.1);
                        border-radius: 10px;
                    }
                    
                    .remaining-wallet {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 15px;
                        margin-bottom: 20px;
                        min-height: 100px;
                        border: 2px solid #e8f5e8;
                        border-radius: 15px;
                        padding: 20px;
                        background: linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%);
                        justify-content: flex-start;
                    }
                    
                    .remaining-wallet .money-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 10px;
                        border: 2px solid #4CAF50;
                        border-radius: 12px;
                        background: white;
                        cursor: default;
                        transition: all 0.3s ease;
                    }
                    
                    .remaining-wallet .money-item img {
                        width: 50px;
                        height: 50px;
                        object-fit: contain;
                        margin-bottom: 8px;
                    }
                    
                    /* 紙鈔和硬幣的特殊樣式 */
                    .remaining-wallet .money-item.banknote {
                        min-height: 140px;
                        min-width: 120px;
                    }
                    
                    .remaining-wallet .money-item.coin {
                        min-height: 120px;
                        min-width: 80px;
                    }
                    
                    .remaining-wallet .money-item.banknote img {
                        width: 100px !important;
                        height: auto !important;
                        max-height: 60px !important;
                        object-fit: contain !important;
                    }
                    
                    .remaining-wallet .money-item.coin img {
                        width: 50px !important;
                        height: 50px !important;
                        border-radius: 50% !important;
                    }
                    
                    .remaining-wallet .money-item .money-value {
                        font-weight: bold;
                        color: #2E7D32;
                        font-size: 12px;
                    }
                    
                    .change-action-area {
                        text-align: center;
                        margin: 20px;
                    }
                    
                    .complete-change-btn {
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 25px;
                        font-size: 18px;
                        cursor: pointer;
                        transition: background 0.3s ease;
                    }
                    
                    .complete-change-btn:hover {
                        background: #45a049;
                    }
                    
                    .complete-change-btn:disabled {
                        background: #ccc;
                        cursor: not-allowed;
                    }
                `;
                document.head.appendChild(style);
            }
        },
        
        // 處理普通模式找零金錢拖曳開始
        handleNormalChangeDragStart(event) {
            const changeId = event.target.dataset.changeId;
            const moneyValue = event.target.dataset.moneyValue;
            const moneyName = event.target.dataset.moneyName;
            
            if (!changeId || !moneyValue) {
                console.error('無法取得普通模式找零拖曳數據');
                return;
            }
            
            event.dataTransfer.setData('text/plain', `normal-change-${changeId}-${moneyValue}-${moneyName}`);
            event.dataTransfer.effectAllowed = 'copy';
        },
        
        // 處理普通模式錢包區域拖曳懸停
        handleNormalChangeWalletDragOver(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        },
        
        // 處理普通模式錢包區域拖曳進入
        handleNormalChangeWalletDragEnter(event) {
            event.preventDefault();
            const collectedArea = event.target.closest('.collected-change');
            if (collectedArea) {
                collectedArea.classList.add('drag-over');
            }
        },
        
        // 處理普通模式錢包區域拖曳離開
        handleNormalChangeWalletDragLeave(event) {
            const collectedArea = event.target.closest('.collected-change');
            if (collectedArea) {
                collectedArea.classList.remove('drag-over');
            }
        },
        
        // 處理普通模式錢包區域拖曳放置
        handleNormalChangeWalletDrop(event) {
            event.preventDefault();
            
            // 清除拖曳樣式
            document.querySelectorAll('.drag-over').forEach(el => {
                el.classList.remove('drag-over');
            });
            
            const dragData = event.dataTransfer.getData('text/plain');
            if (!dragData.startsWith('normal-change-')) return;
            
            const [, , changeId, moneyValue, moneyName] = dragData.split('-');
            const value = parseInt(moneyValue);
            
            // 添加到收集區域
            if (!this.state.gameState.normalChangeCollected) {
                this.state.gameState.normalChangeCollected = [];
            }
            
            this.state.gameState.normalChangeCollected.push({
                value: value,
                name: moneyName,
                id: `collected-${Date.now()}-${Math.random()}`
            });
            
            // 播放成功音效
            this.audio.playDropSound();
            
            // 計算目前收集的找零總額
            const currentTotal = this.state.gameState.normalChangeCollected.reduce((sum, money) => sum + money.value, 0);
            
            // 設置找零處理標誌，防止懸停語音干擾
            this.state.gameState.isProcessingChange = true;
            this.state.gameState.isProcessingSpeech = false;
            
            // 播放找零收集語音 - 困難模式只播放找回×元，不播放總額
            const difficulty = this.state.settings.difficulty;
            if (difficulty === 'hard') {
                this.speech.speak(`找回${value}元`, {
                    interrupt: true,
                    callback: () => {
                        this.state.gameState.isProcessingChange = false;
                    }
                });
            } else {
                this.speech.speak(`已收集${moneyName}，目前找零總額${currentTotal}元`, {
                    interrupt: true,
                    callback: () => {
                        this.state.gameState.isProcessingChange = false;
                    }
                });
            }
            
            // 更新收集區域顯示
            this.updateCollectedChangeDisplay();
            
            // 備用機制：3秒後強制清除處理標誌
            setTimeout(() => {
                if (this.state.gameState.isProcessingChange) {
                    this.state.gameState.isProcessingChange = false;
                }
            }, 3000);
        },
        
        // 更新收集到的找零顯示
        updateCollectedChangeDisplay() {
            const collectedArea = document.getElementById('collected-change');
            if (!collectedArea || !this.state.gameState.normalChangeCollected) return;
            
            collectedArea.innerHTML = this.state.gameState.normalChangeCollected.map((money, index) => `
                <div class="payment-money-item lit-up draggable-back"
                     draggable="true" 
                     ondragstart="Game.handleCollectedChangeDragStart(event)"
                     data-money-id="${money.id}"
                     data-collected-index="${index}">
                    <img src="images/${money.value}_yuan_front.png" alt="${money.name}" style="width: 60px; height: 60px;">
                    <div class="hint-value">${money.name}</div>
                </div>
            `).join('');
        },
        
        // 處理收集到的找零拖曳開始
        handleCollectedChangeDragStart(event) {
            const collectedIndex = event.target.closest('.payment-money-item').dataset.collectedIndex;
            const moneyId = event.target.closest('.payment-money-item').dataset.moneyId;
            
            if (!collectedIndex || !moneyId) {
                console.error('無法取得收集找零的拖曳數據');
                return;
            }
            
            event.dataTransfer.setData('text/plain', `collected-change-${collectedIndex}-${moneyId}`);
            event.dataTransfer.effectAllowed = 'move';
            
            console.log('開始拖曳收集的找零:', { collectedIndex, moneyId });
        },
        
        // 處理店家找零區域拖曳懸停
        handleStoreChangeDragOver(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        },
        
        // 處理店家找零區域拖曳進入
        handleStoreChangeDragEnter(event) {
            event.preventDefault();
            const storeChange = event.target.closest('.store-change');
            if (storeChange) {
                storeChange.classList.add('drag-over-store');
            }
        },
        
        // 處理店家找零區域拖曳離開
        handleStoreChangeDragLeave(event) {
            const storeChange = event.target.closest('.store-change');
            if (storeChange) {
                storeChange.classList.remove('drag-over-store');
            }
        },
        
        // 處理店家找零區域拖曳放置
        handleStoreChangeDrop(event) {
            event.preventDefault();
            
            // 清除拖曳樣式
            document.querySelectorAll('.drag-over-store').forEach(el => {
                el.classList.remove('drag-over-store');
            });
            
            const dragData = event.dataTransfer.getData('text/plain');
            if (!dragData.startsWith('collected-change-')) return;
            
            const [, , collectedIndex, moneyId] = dragData.split('-');
            const index = parseInt(collectedIndex);
            
            if (this.state.gameState.normalChangeCollected && this.state.gameState.normalChangeCollected[index]) {
                // 從收集區域移除該金錢
                this.state.gameState.normalChangeCollected.splice(index, 1);
                
                // 播放成功音效
                this.audio.playDropSound();
                
                // 更新收集區域顯示
                this.updateCollectedChangeDisplay();
                
                console.log('找零金錢已退回店家找零區域');
            }
        },
        
        // 完成普通模式找零
        completeNormalChange() {
            const difficulty = this.state.settings.difficulty;
            
            // 只允許普通和困難模式調用此函數
            if (difficulty === 'easy') {
                console.log('簡單模式不應該調用 completeNormalChange()');
                return;
            }
            
            const transaction = this.state.gameState.currentTransaction;
            const expectedChange = transaction.changeExpected;
            const collectedChange = this.state.gameState.normalChangeCollected || [];
            const collectedTotal = collectedChange.reduce((sum, money) => sum + money.value, 0);
            
            if (collectedTotal === expectedChange) {
                // 找零正確
                this.audio.playSuccessSound(() => {
                    const changeAmount = this.state.gameState.currentTransaction.changeExpected;
                    
                    setTimeout(() => {
                        this.speech.speak(`找您${changeAmount}元，恭喜！答案正確`, {
                            callback: () => {
                                setTimeout(() => {
                                    this.showGameComplete(true);
                                }, 1000);
                            }
                        });
                    }, 500);
                });
            } else {
                // 找零錯誤
                this.audio.playErrorSound();
                this.speech.speak(`找零金額不正確，應該是${expectedChange}元，你收集了${collectedTotal}元，請重新收集`, { interrupt: true });
            }
        },
        
        // 簡單模式無找零確認
        completeEasyModeNoChange() {
            // 直接完成，因為確實無需找零
            this.audio.playSuccessSound(() => {
                setTimeout(() => {
                    this.speech.speak('正確！這次購物無需找零', {
                        callback: () => {
                            setTimeout(() => {
                                this.showGameComplete(true);
                            }, 1000);
                        }
                    });
                }, 500);
            });
        },
        
        // 困難模式不需找零確認
        completeNoChange() {
            const difficulty = this.state.settings.difficulty;
            
            // 只允許困難模式調用此函數
            if (difficulty !== 'hard') {
                console.log('只有困難模式可以調用 completeNoChange()');
                return;
            }
            
            const transaction = this.state.gameState.currentTransaction;
            const expectedChange = transaction.changeExpected;
            
            if (expectedChange === 0) {
                // 確實不需找零 - 正確
                this.audio.playSuccessSound(() => {
                    setTimeout(() => {
                        this.speech.speak('正確！這次購物不需找零', {
                            callback: () => {
                                setTimeout(() => {
                                    this.showGameComplete(true);
                                }, 1000);
                            }
                        });
                    }, 500);
                });
            } else {
                // 需要找零但選擇了不需找零 - 錯誤
                this.audio.playErrorSound();
                this.speech.speak(`錯誤！這次購物需要找零，應該找零元，請重新選擇`, { interrupt: true });
            }
        },
        
        // 計算剩餘錢包內容（扣除已付款的錢幣）
        calculateRemainingWallet() {
            const originalWallet = [...this.state.gameState.playerWallet];
            const paidMoney = this.state.gameState.currentTransaction.paidMoney;
            
            // 從原始錢包中移除已付款的錢幣
            const remainingWallet = [];
            const usedPaidMoney = [];
            
            originalWallet.forEach(money => {
                // 檢查這個錢幣是否已被用於付款
                const usedIndex = paidMoney.findIndex(paid => 
                    paid.value === money.value && !usedPaidMoney.includes(paid)
                );
                
                if (usedIndex === -1) {
                    // 沒有用於付款，保留在錢包中
                    remainingWallet.push(money);
                } else {
                    // 標記為已使用
                    usedPaidMoney.push(paidMoney[usedIndex]);
                }
            });
            
            return remainingWallet;
        },
        
        // 添加找零拖曳樣式（已移至CSS文件，此函數保留用於其他拖曳相關樣式）
        addChangeDragStyles() {
            if (!document.getElementById('change-drag-styles')) {
                const style = document.createElement('style');
                style.id = 'change-drag-styles';
                style.textContent = `
                    /* 確保父級元素不影響標題欄寬度 */
                    #app {
                        width: 100vw !important;
                        max-width: 100vw !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-sizing: border-box !important;
                    }
                    
                    .store-layout {
                        width: 100vw !important;
                        min-height: 100vh;
                        box-sizing: border-box;
                        margin: 0 !important;
                        padding: 0 !important;
                        position: relative !important;
                    }
                    
                    .store-layout .title-bar {
                        margin: 0 !important;
                        padding: 20px 30px !important;
                        width: 100vw !important;
                        max-width: 100vw !important;
                        box-sizing: border-box !important;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1) !important;
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        position: relative !important;
                        left: 0 !important;
                        right: 0 !important;
                        margin-left: 0 !important;
                        margin-right: 0 !important;
                    }
                    
                    .store-layout .transaction-summary {
                        background: white;
                        margin: 20px;
                        padding: 30px;
                        border-radius: 15px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                        width: calc(100% - 40px);
                        box-sizing: border-box;
                    }
                    
                    .store-layout .change-check-area {
                        background: white;
                        margin: 20px;
                        padding: 30px;
                        border-radius: 15px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                        width: calc(100% - 40px);
                        box-sizing: border-box;
                    }
                    
                    .store-layout .wallet-area {
                        background: white;
                        margin: 20px;
                        padding: 30px;
                        border-radius: 15px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                        width: calc(100% - 40px);
                        box-sizing: border-box;
                    }
                    
                    .store-layout .change-targets-row,
                    .store-layout .remaining-wallet-row {
                        margin-bottom: 20px;
                        padding: 15px;
                        border: 1px solid #ddd;
                        border-radius: 10px;
                        background: #f9f9f9;
                        width: 100%;
                        box-sizing: border-box;
                    }
                    
                    .store-layout .change-targets-row h4,
                    .store-layout .remaining-wallet-row h4 {
                        margin: 0 0 15px 0;
                        color: #333;
                        font-size: 16px;
                        font-weight: bold;
                    }
                    
                    .store-layout .change-targets {
                        min-height: 80px;
                        display: flex;
                        flex-wrap: wrap;
                        gap: 15px;
                        justify-content: center;
                        padding: 10px;
                    }
                    
                    
                    .change-money.draggable {
                        cursor: grab;
                        transition: transform 0.2s ease;
                    }
                    
                    .change-money.draggable:hover {
                        transform: scale(1.05);
                    }
                    
                    .change-money.draggable:active {
                        cursor: grabbing;
                    }
                    
                    .remaining-wallet {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 15px;
                        margin-bottom: 20px;
                        min-height: 100px;
                        border: 2px solid #e8f5e8;
                        border-radius: 15px;
                        padding: 20px;
                        background: linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%);
                        justify-content: flex-start;
                    }
                    
                    .remaining-wallet .money-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 10px;
                        border: 2px solid #4CAF50;
                        border-radius: 12px;
                        background: white;
                        cursor: default;
                        transition: all 0.3s ease;
                    }
                    
                    .remaining-wallet .money-item img {
                        width: 50px;
                        height: 50px;
                        object-fit: contain;
                        margin-bottom: 8px;
                    }
                    
                    /* 紙鈔和硬幣的特殊樣式 */
                    .remaining-wallet .money-item.banknote {
                        min-height: 140px;
                        min-width: 120px;
                    }
                    
                    .remaining-wallet .money-item.coin {
                        min-height: 120px;
                        min-width: 80px;
                    }
                    
                    .remaining-wallet .money-item.banknote img {
                        width: 100px !important;
                        height: auto !important;
                        max-height: 60px !important;
                        object-fit: contain !important;
                    }
                    
                    .remaining-wallet .money-item.coin img {
                        width: 50px !important;
                        height: 50px !important;
                        border-radius: 50% !important;
                    }
                    
                    .remaining-wallet .money-item .money-value {
                        font-weight: bold;
                        color: #2E7D32;
                        font-size: 12px;
                    }
                    
                    .change-targets {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 15px;
                        border-top: 1px solid #eee;
                        padding-top: 15px;
                        justify-content: center;
                    }
                    
                    .change-target {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 10px;
                        border: 2px dashed #ccc;
                        border-radius: 12px;
                        background: #f5f5f5;
                        transition: all 0.3s ease;
                        cursor: default;
                    }
                    
                    .change-target img {
                        width: 50px;
                        height: 50px;
                        object-fit: contain;
                        margin-bottom: 8px;
                    }
                    
                    /* 找零目標位置的紙鈔和硬幣樣式 */
                    .change-target.banknote {
                        min-height: 140px;
                        min-width: 120px;
                    }
                    
                    .change-target.coin {
                        min-height: 120px;
                        min-width: 80px;
                    }
                    
                    .change-target.banknote img {
                        width: 100px !important;
                        height: auto !important;
                        max-height: 60px !important;
                        object-fit: contain !important;
                    }
                    
                    .change-target.coin img {
                        width: 50px !important;
                        height: 50px !important;
                        border-radius: 50% !important;
                    }
                    
                    .change-target .money-value {
                        font-weight: bold;
                        color: #666;
                        font-size: 12px;
                    }
                    
                    .change-target.faded {
                        opacity: 0.4;
                        filter: grayscale(70%);
                    }
                    
                    .change-target.drag-over {
                        border-color: #4CAF50;
                        background-color: rgba(76, 175, 80, 0.1);
                        transform: scale(1.05);
                    }
                    
                    .change-target.filled {
                        opacity: 1;
                        filter: none;
                        border-color: #4CAF50;
                        background-color: rgba(76, 175, 80, 0.2);
                    }
                    
                    .wallet-content.drag-over-wallet {
                        border-color: #4CAF50;
                        background-color: rgba(76, 175, 80, 0.05);
                    }
                `;
                document.head.appendChild(style);
            }
        },
        
        // 處理找零金錢懸停語音
        handleChangeMoneyHover(event) {
            const changeElement = event.target.closest('.change-money');
            if (!changeElement) return;
            
            // 檢查難度設定 - 困難模式不提供語音提示
            const difficulty = this.state.settings.difficulty;
            if (difficulty === 'hard') {
                return;
            }
            
            const moneyName = changeElement.dataset.moneyName;
            
            console.log('handleChangeMoneyHover被調用:', moneyName);
            console.log('找零處理狀態:', this.state.gameState.isProcessingChange);
            console.log('語音處理狀態:', this.state.gameState.isProcessingSpeech);
            
            // 如果正在找零處理中、語音處理中或顯示模態視窗，不播放懸停語音
            if (this.state.gameState.isProcessingChange || this.state.gameState.isProcessingSpeech || this.state.gameState.isShowingModal) {
                console.log('語音被阻止播放，原因:', {
                    isProcessingChange: this.state.gameState.isProcessingChange,
                    isProcessingSpeech: this.state.gameState.isProcessingSpeech,
                    isShowingModal: this.state.gameState.isShowingModal
                });
                return;
            }
            
            // 清除之前的語音播放和狀態
            if (this.speech.currentUtterance) {
                window.speechSynthesis.cancel();
            }
            
            // 確保先清除舊狀態，然後設置新狀態
            this.state.gameState.isProcessingSpeech = false;
            setTimeout(() => {
                this.state.gameState.isProcessingSpeech = true;
                
                // 播放當前找零金錢的語音
                console.log('準備播放找零金錢語音:', moneyName);
                this.speech.speak(moneyName, {
                    callback: () => {
                        console.log('找零金錢語音播放完成');
                        this.state.gameState.isProcessingSpeech = false;
                    }
                });
            }, 10);
            
            // 備用清除機制：2秒後強制清除語音處理狀態
            setTimeout(() => {
                if (this.state.gameState.isProcessingSpeech) {
                    console.log('強制清除找零金錢語音處理狀態');
                    this.state.gameState.isProcessingSpeech = false;
                }
            }, 2000);
        },
        
        // 🔧 [新增] 處理店家找零區金錢點擊功能
        handleChangeMoneyClick(event) {
            console.log('🎯 [A1找零點擊] handleChangeMoneyClick 被呼叫');
            
            const changeElement = event.target.closest('.change-money');
            if (!changeElement) {
                console.log('❌ [A1找零點擊] 未找到找零金錢元素');
                return;
            }
            
            const changeId = changeElement.dataset.changeId;
            const moneyValue = parseInt(changeElement.dataset.moneyValue);
            const moneyName = changeElement.dataset.moneyName;
            
            console.log('🔍 [A1找零點擊] 點擊店家找零', {
                changeId: changeId,
                moneyValue: moneyValue,
                moneyName: moneyName
            });
            
            if (!changeId || !moneyValue) {
                console.error('❌ [A1找零點擊] 找零數據不完整');
                return;
            }
            
            // 檢查是否為雙擊（使用相同的雙擊檢測邏輯）
            const currentTime = Date.now();
            const clickState = this.state.gameState.clickState;
            
            const isSameElement = clickState.lastClickedElement && 
                                clickState.lastClickedElement.dataset.changeId === changeId;
            const isWithinDoubleClickTime = (currentTime - clickState.lastClickTime) < clickState.doubleClickDelay;
            
            console.log('🔍 [A1找零點擊] 雙擊檢測', {
                isSameElement: isSameElement,
                timeDiff: currentTime - clickState.lastClickTime,
                isWithinDoubleClickTime: isWithinDoubleClickTime
            });
            
            if (isSameElement && isWithinDoubleClickTime) {
                // 雙擊 - 執行將找零金錢放置到錢包
                console.log('✅ [A1找零點擊] 偵測到雙擊，執行找零放置');
                this.executeChangeMoneyPlacement(changeElement);
                this.clearMoneySelection();
            } else {
                // 單擊 - 選擇找零金錢
                console.log('🔵 [A1找零點擊] 第一次點擊，選擇找零金錢');
                this.selectChangeMoneyItem(changeElement);
                clickState.lastClickTime = currentTime;
                clickState.lastClickedElement = changeElement;
            }
        },
        
        // 選擇找零金錢物品
        selectChangeMoneyItem(changeElement) {
            // 清除之前的選擇
            this.clearMoneySelection();
            
            // 標記新的選擇
            changeElement.classList.add('selected-item');
            this.state.gameState.clickState.selectedItem = changeElement;
            
            // 播放選擇音效
            if (this.audio.selectSound) {
                this.audio.selectSound.play().catch(console.log);
            }
            
            console.log('🎵 [A1找零點擊] 找零金錢已選擇', { changeId: changeElement.dataset.changeId });
        },
        
        // 執行找零金錢放置（模擬拖放到錢包）
        executeChangeMoneyPlacement(changeElement) {
            const changeId = changeElement.dataset.changeId;
            const moneyValue = parseInt(changeElement.dataset.moneyValue);
            const moneyName = changeElement.dataset.moneyName;
            
            console.log('🚀 [A1找零點擊] 執行找零金錢放置', { 
                changeId: changeId,
                moneyValue: moneyValue,
                moneyName: moneyName
            });
            
            // 創建模擬的拖放事件
            const mockDropEvent = {
                preventDefault: () => {},
                target: document.querySelector('.wallet-content'),
                dataTransfer: {
                    getData: (type) => {
                        if (type === 'text/plain') {
                            return `change-${changeId}-${moneyValue}-${moneyName}`;
                        }
                        return '';
                    }
                },
                clickPlacement: true // 標記這是點擊放置
            };
            
            // 調用現有的錢包拖放處理邏輯
            this.handleChangeWalletDrop(mockDropEvent);
        },
        
        // 🔧 [新增] 普通/困難模式店家找零區金錢點擊功能
        handleNormalChangeMoneyClick(event) {
            console.log('🎯 [A1普通找零點擊] handleNormalChangeMoneyClick 被呼叫');
            
            const changeElement = event.target.closest('.change-money');
            if (!changeElement) {
                console.log('❌ [A1普通找零點擊] 未找到找零金錢元素');
                return;
            }
            
            const changeId = changeElement.dataset.changeId;
            const moneyValue = parseInt(changeElement.dataset.moneyValue);
            const moneyName = changeElement.dataset.moneyName;
            
            console.log('🔍 [A1普通找零點擊] 點擊店家找零', {
                changeId: changeId,
                moneyValue: moneyValue,
                moneyName: moneyName
            });
            
            // 檢查雙擊
            const currentTime = Date.now();
            const clickState = this.state.gameState.clickState;
            
            const isSameElement = clickState.lastClickedElement && 
                                clickState.lastClickedElement.dataset.changeId === changeId;
            const isWithinDoubleClickTime = (currentTime - clickState.lastClickTime) < clickState.doubleClickDelay;
            
            if (isSameElement && isWithinDoubleClickTime) {
                // 雙擊 - 執行找零放置
                console.log('✅ [A1普通找零點擊] 偵測到雙擊，執行找零放置');
                this.executeNormalChangeMoneyPlacement(changeElement);
                this.clearMoneySelection();
            } else {
                // 單擊 - 選擇找零金錢
                console.log('🔵 [A1普通找零點擊] 第一次點擊，選擇找零金錢');
                this.selectChangeMoneyItem(changeElement);
                clickState.lastClickTime = currentTime;
                clickState.lastClickedElement = changeElement;
            }
        },
        
        // 執行普通/困難模式找零金錢放置
        executeNormalChangeMoneyPlacement(changeElement) {
            const changeId = changeElement.dataset.changeId;
            const moneyValue = parseInt(changeElement.dataset.moneyValue);
            const moneyName = changeElement.dataset.moneyName;
            
            console.log('🚀 [A1普通找零點擊] 執行找零金錢放置', { 
                changeId: changeId,
                moneyValue: moneyValue,
                moneyName: moneyName
            });
            
            // 創建模擬的拖放事件
            const mockDropEvent = {
                preventDefault: () => {},
                target: document.querySelector('.wallet-content'),
                dataTransfer: {
                    getData: (type) => {
                        if (type === 'text/plain') {
                            return `normal-change-${changeId}-${moneyValue}-${moneyName}`;
                        }
                        return '';
                    }
                },
                clickPlacement: true
            };
            
            // 調用普通模式錢包拖放處理邏輯
            this.handleNormalChangeWalletDrop(mockDropEvent);
        },

        // 處理錢包中金錢在找零驗證頁面的點擊事件
        handleWalletChangeClick(event) {
            console.log('🎯 [A1錢包找零點擊] handleWalletChangeClick 被呼叫');
            
            // 找到金錢元素
            const moneyElement = event.target.closest('.money-item');
            if (!moneyElement || !moneyElement.dataset.moneyId) {
                console.log('❌ [A1錢包找零點擊] 未找到有效的金錢元素');
                return;
            }
            
            const moneyId = moneyElement.dataset.moneyId;
            const currentTime = Date.now();
            const clickState = this.state.gameState.clickState;
            const difficulty = this.state.settings.difficulty;
            
            console.log('🔍 [A1錢包找零點擊] 點擊狀態檢查', {
                moneyId: moneyId,
                lastClickedElementId: clickState.lastClickedElement?.dataset?.moneyId,
                timeDiff: currentTime - clickState.lastClickTime,
                doubleClickDelay: clickState.doubleClickDelay
            });
            
            // 判斷是否為雙擊
            const isSameElement = clickState.lastClickedElement && 
                                clickState.lastClickedElement.dataset.moneyId === moneyId;
            const isWithinDoubleClickTime = (currentTime - clickState.lastClickTime) < clickState.doubleClickDelay;
            
            if (isSameElement && isWithinDoubleClickTime) {
                // 雙擊 - 執行錢包金錢放回動作
                console.log('✅ [A1錢包找零點擊] 偵測到雙擊，執行錢包金錢放回');
                this.executeWalletChangeReturn(moneyElement);
                this.clearMoneySelection();
            } else {
                // 單擊 - 選擇錢包金錢
                console.log('🔵 [A1錢包找零點擊] 第一次點擊，選擇錢包金錢');
                this.selectMoney(moneyElement);
                clickState.lastClickTime = currentTime;
                clickState.lastClickedElement = moneyElement;
            }
        },

        // 執行錢包金錢放回動作（在找零驗證頁面）
        executeWalletChangeReturn(moneyElement) {
            const moneyId = moneyElement.dataset.moneyId;
            const difficulty = this.state.settings.difficulty;
            
            console.log('🚀 [A1錢包找零點擊] 執行錢包金錢放回', { 
                moneyId: moneyId,
                difficulty: difficulty
            });
            
            // 根據難度決定放回的目標區域
            if (difficulty === 'easy') {
                // 簡單模式：錢包金錢不能被點擊放回（通常沒有這個需求）
                console.log('⚠️ [A1錢包找零點擊] 簡單模式不支援錢包金錢放回');
                return;
            } else {
                // 普通/困難模式：錢包金錢點擊放回到店家找零區域
                this.executeWalletToChangeReturn(moneyElement);
            }
        },

        // 錢包金錢放回到店家找零區域
        executeWalletToChangeReturn(moneyElement) {
            const moneyId = moneyElement.dataset.moneyId;
            
            // 找到對應的錢幣數據
            const money = this.state.gameState.wallet.find(m => m.id === moneyId);
            if (!money) {
                console.error('❌ [A1錢包找零點擊] 在錢包中找不到對應的金錢:', moneyId);
                return;
            }
            
            // 從錢包中移除
            this.state.gameState.wallet = this.state.gameState.wallet.filter(m => m.id !== moneyId);
            this.updateWalletTotal();
            
            // 加回到店家找零區域
            // 找到店家找零區域並創建找零金錢元素
            const changeArea = document.querySelector('.change-money-display') || document.querySelector('.change-display');
            if (changeArea) {
                const changeId = `change-return-${Date.now()}`;
                const changeMoneyHTML = `
                    <div class="change-money" 
                         data-change-id="${changeId}" 
                         data-money-value="${money.value}"
                         onclick="Game.handleNormalChangeMoneyClick(event)"
                         draggable="true" 
                         ondragstart="Game.handleChangeDragStart(event)">
                        <img src="${money.displayImage || money.images.front}" alt="${money.name}">
                        <div class="money-value">${money.name}</div>
                    </div>
                `;
                changeArea.insertAdjacentHTML('beforeend', changeMoneyHTML);
                
                console.log('✅ [A1錢包找零點擊] 成功將錢包金錢放回店家找零區域');
            } else {
                console.error('❌ [A1錢包找零點擊] 找不到店家找零區域');
                // 如果找不到找零區域，將錢幣加回錢包
                this.state.gameState.wallet.push(money);
                this.updateWalletTotal();
                return;
            }
            
            // 重新渲染錢包內容
            const walletContent = document.querySelector('.remaining-wallet');
            if (walletContent) {
                // 重新渲染剩餘錢包內容
                const remainingWallet = this.state.gameState.wallet.filter(money => 
                    !this.state.transaction.collectedChange.some(collected => collected.id === money.id)
                );
                
                walletContent.innerHTML = remainingWallet.map(money => {
                    const isBanknote = money.value >= 100;
                    const itemClass = isBanknote ? 'money-item banknote' : 'money-item coin';
                    return `
                        <div class="${itemClass}" 
                             data-money-id="${money.id}" 
                             data-money-name="${money.name}"
                             onclick="Game.handleWalletChangeClick(event)">
                            <img src="${money.displayImage || money.images.front}" alt="${money.name}">
                            <div class="money-value">${money.name}</div>
                        </div>
                    `;
                }).join('');
            }
        },

        // 處理找零錢幣拖曳開始
        handleChangeDragStart(event) {
            // 由於子元素使用了 pointer-events: none，事件目標應該是 .change-money 元素
            const changeId = event.target.dataset.changeId;
            const moneyValue = event.target.dataset.moneyValue;
            
            console.log('拖曳開始 - changeId:', changeId, 'moneyValue:', moneyValue);
            
            if (!changeId || !moneyValue) {
                console.error('無法取得拖曳數據 - changeId或moneyValue為空');
                console.error('event.target.dataset:', event.target.dataset);
                return;
            }
            
            event.dataTransfer.setData('text/plain', `change-${changeId}-${moneyValue}`);
            event.dataTransfer.effectAllowed = 'move';
        },
        
        // 處理錢包區域拖曳懸停
        handleChangeWalletDragOver(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        },
        
        // 處理錢包區域拖曳進入
        handleChangeWalletDragEnter(event) {
            event.preventDefault();
            const walletArea = event.target.closest('.wallet-change-area');
            if (walletArea) {
                walletArea.classList.add('drag-over-wallet');
            }
            
            // 檢查是否懸停在目標位置上
            const target = event.target.closest('.change-target');
            if (target && target.classList.contains('faded')) {
                target.classList.add('drag-over');
            }
        },
        
        // 處理錢包區域拖曳離開
        handleChangeWalletDragLeave(event) {
            const walletArea = event.target.closest('.wallet-change-area');
            if (walletArea) {
                walletArea.classList.remove('drag-over-wallet');
            }
            
            const target = event.target.closest('.change-target');
            if (target) {
                target.classList.remove('drag-over');
            }
        },
        
        // 處理錢包區域拖曳放置
        handleChangeWalletDrop(event) {
            event.preventDefault();
            
            // 清除拖曳樣式
            document.querySelectorAll('.drag-over-wallet').forEach(el => {
                el.classList.remove('drag-over-wallet');
            });
            document.querySelectorAll('.drag-over').forEach(el => {
                el.classList.remove('drag-over');
            });
            
            const dragData = event.dataTransfer.getData('text/plain');
            if (!dragData.startsWith('change-')) return;
            
            const [, changeId, moneyValue] = dragData.split('-');
            const target = event.target.closest('.change-target');
            
            if (target && target.classList.contains('faded')) {
                const targetIndex = parseInt(target.dataset.targetIndex);
                const expectedValue = parseInt(target.dataset.expectedValue);
                
                // 檢查面額是否匹配
                if (parseInt(moneyValue) === expectedValue) {
                    // 成功放置
                    target.classList.remove('faded');
                    target.classList.add('filled');
                    
                    // 隱藏原始找零錢幣
                    const originalMoney = document.querySelector(`[data-change-id="${changeId}"]`);
                    if (originalMoney) {
                        originalMoney.style.display = 'none';
                    }
                    
                    // 更新狀態
                    this.state.gameState.changeDropTargets[targetIndex].isDropped = true;
                    
                    // 播放成功音效
                    this.audio.playDropSound();
                    
                    // 計算目前已放置的找零總額
                    const droppedTargets = this.state.gameState.changeDropTargets.filter(target => target.isDropped);
                    const currentChangeTotal = droppedTargets.reduce((sum, target) => sum + target.expectedMoney.value, 0);
                    
                    // 設置找零處理標誌，防止懸停語音干擾
                    this.state.gameState.isProcessingChange = true;
                    this.state.gameState.isProcessingSpeech = false; // 清除一般語音處理標誌
                    
                    // 檢查是否為最後一個金錢
                    const allDropped = this.state.gameState.changeDropTargets.every(target => target.isDropped);
                    const moneyItem = this.state.gameState.changeDropTargets[targetIndex].expectedMoney;
                    
                    // 將allDropped狀態暫存，供後續使用
                    this.state.gameState._lastDroppedAll = allDropped;
                    
                    if (allDropped) {
                        // 最後一個金錢，設置完成標誌並直接播放完成語音
                        this.state.gameState.changeCompleted = true;
                        
                        setTimeout(() => {
                            this.audio.playSuccessSound(() => {
                                this.speech.speak(`找您${currentChangeTotal}元，恭喜！答案正確`, {
                                    callback: () => {
                                        setTimeout(() => {
                                            this.proceedToNextQuestion();
                                        }, 1000);
                                    }
                                });
                            });
                        }, 300);
                    } else {
                        // 不是最後一個，播放放置語音
                        this.speech.speak(`已放入${moneyItem.name}`, { 
                            interrupt: true,
                            callback: () => {
                                // 語音完成後清除處理標誌
                                this.state.gameState.isProcessingChange = false;
                            }
                        });
                    }
                    
                    // 備用機制：3秒後強制清除處理標誌（僅在非最後一個金錢時檢查完成）
                    setTimeout(() => {
                        if (this.state.gameState.isProcessingChange) {
                            console.log('強制清除找零處理狀態');
                            this.state.gameState.isProcessingChange = false;
                            // 只有當不是全部完成時才檢查（避免重複完成邏輯）
                            if (!this.state.gameState._lastDroppedAll && !this.state.gameState.changeCompleted) {
                                this.checkChangeComplete();
                            }
                        }
                    }, 3000);
                } else {
                    // 面額不匹配
                    this.audio.playErrorSound();
                    this.speech.speak('面額不正確，請重新拖曳', { interrupt: true });
                }
            } else {
                // 沒有拖到正確位置
                this.audio.playErrorSound();
                this.speech.speak('請拖曳到對應的淡化圖示位置', { interrupt: true });
            }
        },
        
        // 檢查找零是否全部完成
        checkChangeComplete() {
            const allDropped = this.state.gameState.changeDropTargets.every(target => target.isDropped);
            
            if (allDropped && !this.state.gameState.changeCompleted) {
                // 設置完成標誌，避免重複播放
                this.state.gameState.changeCompleted = true;
                
                const changeAmount = this.state.gameState.currentTransaction.changeExpected;
                
                // 全部完成，播放成功音效和語音
                setTimeout(() => {
                    // 先播放 correct02.mp3
                    this.audio.playSuccessSound(() => {
                        // 然後播放合併的找零和恭喜語音
                        this.speech.speak(`找您${changeAmount}元，恭喜！答案正確`, {
                            callback: () => {
                                // 進入下一題或完成測驗
                                setTimeout(() => {
                                    this.proceedToNextQuestion();
                                }, 1000);
                            }
                        });
                    });
                }, 500);
            }
        },
        
        // 進入下一題或完成測驗
        proceedToNextQuestion() {
            // 直接使用 showGameComplete 函數處理下一題或完成測驗
            this.showGameComplete(true);
        },
        
        // 處理錢包拖曳懸停（普通和困難模式拖回功能）
        handleWalletDragOver(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        },
        
        // 處理錢包拖曳進入
        handleWalletDragEnter(event) {
            event.preventDefault();
            const walletContent = event.target.closest('.wallet-content');
            if (walletContent) {
                walletContent.classList.add('drag-over-wallet-return');
            }
        },
        
        // 處理錢包拖曳離開
        handleWalletDragLeave(event) {
            const walletContent = event.target.closest('.wallet-content');
            if (walletContent) {
                walletContent.classList.remove('drag-over-wallet-return');
            }
        },
        
        // 處理錢包拖曳放置（拖回功能）
        handleWalletDrop(event) {
            event.preventDefault();
            
            // 清除拖曳樣式
            document.querySelectorAll('.drag-over-wallet-return').forEach(el => {
                el.classList.remove('drag-over-wallet-return');
            });
            
            const moneyId = event.dataTransfer.getData('text/plain');
            const difficulty = this.state.settings.difficulty;
            
            // 只有普通和困難模式支援拖回
            if (difficulty !== 'normal' && difficulty !== 'hard') {
                return;
            }
            
            // 檢查是否是從付款區域拖回的錢幣
            const paidMoney = this.state.gameState.currentTransaction.paidMoney;
            const moneyToReturn = paidMoney.find(money => money.id === moneyId);
            
            if (moneyToReturn) {
                // 將錢幣從付款中移除
                const paidIndex = paidMoney.findIndex(money => money.id === moneyId);
                if (paidIndex !== -1) {
                    paidMoney.splice(paidIndex, 1);
                }
                
                // 從付款總額中扣除
                this.state.gameState.currentTransaction.amountPaid -= moneyToReturn.value;
                
                // 將錢幣加回錢包
                this.state.gameState.playerWallet.push(moneyToReturn);
                this.state.gameState.walletTotal += moneyToReturn.value;
                
                // 播放成功音效
                this.audio.playDropSound();
                
                // 根據難度播放語音提示
                if (difficulty === 'normal') {
                    this.speech.speak(`${moneyToReturn.name}已退回錢包，目前付款總額${this.state.gameState.currentTransaction.amountPaid}元`, { interrupt: true });
                }
                
                // 更新顯示
                this.updatePaymentDisplay();
                
                console.log(`錢幣 ${moneyToReturn.name} 已退回錢包`);
            } else {
                // 不是有效的拖回操作
                this.audio.playErrorSound();
                if (difficulty === 'normal') {
                    this.speech.speak('只能將已付款的錢幣拖回錢包', { interrupt: true });
                }
            }
        },
        
        // 驗證找零
        verifyChange(isCorrect) {
            const transaction = this.state.gameState.currentTransaction;
            const expectedChange = transaction.changeExpected;
            
            if (expectedChange === 0) {
                // 無需找零的情況，用戶點擊"正確"就是對的
                if (isCorrect) {
                    // 回答正確 - 播放成功音效和語音後進入下一題
                    this.audio.playSuccessSound(() => {
                        this.speech.speak('答對了，讓我們繼續下一題', {
                            callback: () => {
                                this.showGameComplete(true);
                            }
                        });
                    });
                }
            } else {
                // 需要找零的情況，檢查找零是否正確
                const actualChange = transaction.changeReceived.reduce((sum, money) => sum + money.value, 0);
                const isActuallyCorrect = actualChange === expectedChange;
                
                if (isCorrect === isActuallyCorrect) {
                    // 回答正確 - 播放成功音效和語音後進入下一題
                    this.audio.playSuccessSound(() => {
                        this.speech.speak('答對了，讓我們繼續下一題', {
                            callback: () => {
                                this.showGameComplete(true);
                            }
                        });
                    });
                } else {
                    // 回答錯誤 - 播放錯誤語音但不切換場景
                    this.audio.playErrorSound();
                    this.speech.speak(isActuallyCorrect ? '找零其實是正確的，再仔細檢查看看' : '找零確實有問題，要更仔細觀察', {
                        callback: () => {
                            setTimeout(() => {
                                this.speech.speak('請再次檢查找零金額');
                            }, 1500);
                        }
                    });
                }
            }
        },
        
        // 顯示遊戲完成
        showGameComplete(success = true) {
            // 防止重複調用
            if (this.state.gameState.isTransitioning) {
                console.log('正在轉換中，忽略重複的 showGameComplete 調用');
                return;
            }
            this.state.gameState.isTransitioning = true;
            
            // 更新測驗進度
            this.state.quiz.currentQuestion++;
            
            // 檢查是否還需要更多題目
            if (this.state.quiz.currentQuestion < this.state.settings.questionCount) {
                // 保存當前題目的商品ID，下一題時排除它
                if (this.state.gameState.selectedItem) {
                    this.state.gameState.previousTargetItemId = this.state.gameState.selectedItem.id;
                }
                
                // 繼續下一題 - 直接進入下一個購物場景（不播放額外語音，因為已在verifyChange中播放過）
                this.state.gameState.currentScene = 'shopping';
                this.initializeWallet();
                this.showShoppingScene();
                
                // 重置轉換標誌
                setTimeout(() => {
                    this.state.gameState.isTransitioning = false;
                }, 1000);
                return;
            }
            
            // 所有題目完成，顯示最終結果
            const app = document.getElementById('app');
            const selectedItem = this.state.gameState.selectedItem;
            const transaction = this.state.gameState.currentTransaction;
            
            app.innerHTML = `
                <div class="game-complete">
                    <div class="result-card">
                        <h1>${success ? '🎉 購物成功！' : '😅 再試一次'}</h1>
                        
                        <div class="final-stats">
                            <div class="stat-item">
                                <span class="stat-label">購買商品：</span>
                                <span class="stat-value">${this.formatItemDisplay(selectedItem, 'small')}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">商品價格：</span>
                                <span class="stat-value">${transaction.totalCost}元</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">付款金額：</span>
                                <span class="stat-value">${transaction.amountPaid}元</span>
                            </div>
                            ${transaction.changeExpected > 0 ? `
                                <div class="stat-item">
                                    <span class="stat-label">找零金額：</span>
                                    <span class="stat-value">${transaction.changeExpected}元</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="quiz-progress">
                            <p><strong>測驗完成！</strong></p>
                            <p>總共完成 ${this.state.settings.questionCount} 題購物練習</p>
                        </div>
                        
                        <div class="achievement-message">
                            <p><strong>恭喜完成購物體驗！</strong></p>
                            <p>你學會了選擇商品、付款和找零</p>
                            <p>這些都是日常生活中重要的金錢技能</p>
                        </div>
                        
                        <div class="action-buttons">
                            <button class="primary-btn" onclick="Game.showSettings()">
                                再玩一次
                            </button>
                            <button class="secondary-btn" onclick="location.href='index.html'">
                                返回主選單
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // 顯示完成場景後播放語音
            if (success) {
                setTimeout(() => {
                    this.speech.speak('購物體驗完成！你成功學會了如何購物付款和找零驗證');
                }, 500);
            }
        },
        
        // 播放選單選擇音效
        playMenuSelectSound() {
            try {
                // 如果已有音效在播放，先停止它
                if (this.menuSelectAudio) {
                    this.menuSelectAudio.pause();
                    this.menuSelectAudio.currentTime = 0;
                }
                
                // 創建或重用音效物件
                if (!this.menuSelectAudio) {
                    this.menuSelectAudio = new Audio('audio/menu-select.mp3');
                    this.menuSelectAudio.volume = 0.5;
                    this.menuSelectAudio.preload = 'auto';
                }
                
                this.menuSelectAudio.currentTime = 0;
                this.menuSelectAudio.play().catch(e => {
                    console.log('音效播放失敗:', e);
                });
            } catch (error) {
                console.log('無法載入選單音效:', error);
            }
        },

        // 設置無障礙功能
        setupAccessibility() {
            // 預留給無障礙功能的實作
            console.log('設置無障礙功能');
        }
    };
    
    // 將 Game 物件掛載到全域，供 HTML 事件使用
    window.Game = Game;
    
    // 初始化遊戲
    Game.init();
});
