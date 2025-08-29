// =================================================================
// FILE: js/unit5.js - 單元五：給足夠的錢 (修正版)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const Game = {
        // =====================================================
        // 狀態管理系統（參考unit4架構）
        // =====================================================
        state: {
            settings: {
                digits: 1,           // 物品價格位數（1-4位 或 'custom'）
                customAmount: 0,     // 🆕 自訂金額，預設0元（當digits='custom'時使用）
                denominations: [],   // 可用的錢幣面額
                difficulty: 'easy',  // 難度：easy, normal, hard
                mode: 'repeated',    // 模式：repeated, single
                itemTypes: [],       // 物品類型：toys, food, stationery
                questionCount: 10    // 題目數量：5, 10, 15, 20, or custom number
            },
            gameState: {},
            quiz: {
                currentQuestion: 0,
                totalQuestions: 10,
                score: 0,
                questions: [],
                startTime: null,
                attempts: 0
            },
            loadingQuestion: false,
            // 🚀 新增：相容性檢查緩存系統，減少重複計算
            compatibilityCache: {}
        },

        // 計時器管理
        totalAmountSpeechTimer: null,

        // 🔧 [新增] 點擊放置功能狀態管理
        clickState: {
            selectedItem: null,        // 當前選中的物品
            lastClickTime: 0,          // 最後點擊時間
            lastClickedElement: null,  // 最後點擊的元素
            doubleClickDelay: 500      // 雙擊檢測時間間隔(ms)
        },

        // =====================================================
        // 音效和語音系統（繼承unit4）
        // =====================================================
        audio: {
            dropSound: null,
            errorSound: null,
            correctSound: null,
            successSound: null,
            clickSound: null,
            selectSound: null,
            init() {
                try {
                    this.dropSound = new Audio('audio/drop-sound.mp3');
                    this.dropSound.preload = 'auto';
                    this.dropSound.volume = 0.5;

                    this.errorSound = new Audio('audio/error.mp3');
                    this.errorSound.preload = 'auto';
                    
                    this.error02Sound = new Audio('audio/error02.mp3');
                    this.error02Sound.preload = 'auto';

                    this.correctSound = new Audio('audio/correct02.mp3');
                    this.correctSound.preload = 'auto';

                    this.successSound = new Audio('audio/success.mp3');
                    this.successSound.preload = 'auto';

                    this.clickSound = new Audio('audio/click.mp3');
                    this.clickSound.preload = 'auto';

                    this.selectSound = new Audio('audio/select.mp3');
                    this.selectSound.preload = 'auto';
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
            playError02Sound() {
                if (this.error02Sound) {
                    this.error02Sound.currentTime = 0;
                    this.error02Sound.play().catch(error => console.log('播放音效失敗:', error));
                }
            },
            playCorrectSound() {
                if (this.correctSound) {
                    this.correctSound.currentTime = 0;
                    this.correctSound.play().catch(error => console.log('播放音效失敗:', error));
                }
            },
            playSuccessSound() {
                if (this.successSound) {
                    this.successSound.currentTime = 0;
                    this.successSound.play().catch(error => console.log('播放音效失敗:', error));
                }
            },
            playClickSound() {
                if (this.clickSound) {
                    this.clickSound.currentTime = 0;
                    this.clickSound.play().catch(error => console.log('播放音效失敗:', error));
                }
            },
            playSelectSound() {
                if (this.selectSound) {
                    this.selectSound.currentTime = 0;
                    this.selectSound.play().catch(error => console.log('播放音效失敗:', error));
                }
            }
        },
        speech: {
            synth: window.speechSynthesis,
            voice: null,
            isReady: false,
            init() {
                console.log('開始初始化語音系統...');
                const setVoice = () => {
                    const voices = this.synth.getVoices();
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
                        // 備用方案：使用任何可用的語音
                        this.voice = voices[0];
                        console.log('未找到中文語音，使用備用語音:', this.voice.name);
                    }
                    
                    if (this.voice) {
                        this.isReady = true;
                        console.log(`語音已就緒: ${this.voice.name} (${this.voice.lang})`);
                        this.synth.onvoiceschanged = null;
                    }
                };
                this.synth.onvoiceschanged = setVoice;
                setVoice();
                
                // 如果立即沒有語音，設定超時重試
                setTimeout(() => {
                    if (!this.isReady) {
                        console.log('語音初始化超時，嘗試再次設定');
                        setVoice();
                    }
                }, 1000);
            },
            speak(text, options = {}) {
                const { interrupt = true, callback = null } = options;

                console.log(`speech.speak 被調用，文本: "${text}", interrupt: ${interrupt}`);
                console.log(`語音狀態檢查: isReady=${this.isReady}, voice=${this.voice ? this.voice.name : 'null'}, isSpeaking=${this.synth.speaking}`);
                
                // 如果不應該中斷，且有語音正在播放，則直接返回，不打斷重要語音
                if (!interrupt && this.synth.speaking) {
                    console.log(`語音 "${text}" 被忽略，因為已有語音正在播報且不應中斷。`);
                    return;
                }

                if (!this.isReady || !this.voice) {
                    console.log(`語音系統未就緒，嘗試重新初始化並延遲播報`);
                    // 嘗試重新初始化
                    this.init();
                    // 延遲100ms後重試
                    setTimeout(() => {
                        if (this.isReady && this.voice) {
                            console.log(`重新初始化後播報: "${text}"`);
                            this.synth.cancel(); // 重新初始化後總是中斷
                            const utterance = new SpeechSynthesisUtterance(text);
                            utterance.voice = this.voice;
                            utterance.rate = 1.0; // 標準語速（與F1統一）
                            utterance.pitch = 1;
                            if (callback) {
                                utterance.onend = callback;
                            }
                            this.synth.speak(utterance);
                        } else {
                            console.log(`重新初始化後仍無法播報語音: "${text}"`);
                            if (callback) callback(); // 失敗時也要執行回呼，避免流程卡住
                        }
                    }, 100);
                    return;
                }
                
                if (interrupt) {
                    this.synth.cancel(); // 根據 interrupt 標誌決定是否停止之前的語音
                }
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = this.voice;
                utterance.rate = 1.0; // 標準語速（與F1統一）
                utterance.pitch = 1;
                if (callback) {
                    utterance.onend = callback;
                }
                this.synth.speak(utterance);
                console.log(`語音播報已提交到系統`);
            }
        },

        // =====================================================
        // 遊戲資料庫
        // =====================================================
        gameData: {
            // 金錢資料（繼承unit4）
            allItems: [
                { value: 1, name: '1元', images: { front: 'images/1_yuan_front.png', back: 'images/1_yuan_back.png' } },
                { value: 5, name: '5元', images: { front: 'images/5_yuan_front.png', back: 'images/5_yuan_back.png' } },
                { value: 10, name: '10元', images: { front: 'images/10_yuan_front.png', back: 'images/10_yuan_back.png' } },
                { value: 50, name: '50元', images: { front: 'images/50_yuan_front.png', back: 'images/50_yuan_back.png' } },
                { value: 100, name: '100元', images: { front: 'images/100_yuan_front.png', back: 'images/100_yuan_back.png' } },
                { value: 500, name: '500元', images: { front: 'images/500_yuan_front.png', back: 'images/500_yuan_back.png' } },
                { value: 1000, name: '1000元', images: { front: 'images/1000_yuan_front.png', back: 'images/1000_yuan_back.png' } }
            ],

            // 新增：可購買物品資料庫
            purchaseItems: {
                // 1位數 (1-9元) 物品
                candy: [
                    { id: 'candy_lollipop', name: '棒棒糖', image: 'images/items/candy_lollipop.png', emoji: '🍭', priceRange: [2, 8] },
                    { id: 'candy_gum', name: '口香糖', image: 'images/items/candy_gum.png', emoji: '🍬', priceRange: [3, 9] },
                    { id: 'candy_chocolate', name: '巧克力', image: 'images/items/candy_chocolate.png', emoji: '🍫', priceRange: [4, 9] }
                ],
                sticker: [
                    { id: 'sticker_star', name: 'star貼紙', image: 'images/items/sticker_star.png', emoji: '⭐', priceRange: [1, 6] },
                    { id: 'sticker_heart', name: '愛心貼紙', image: 'images/items/sticker_heart.png', emoji: '💖', priceRange: [2, 8] },
                    { id: 'sticker_animal', name: '動物貼紙', image: 'images/items/sticker_animal.png', emoji: '🐱', priceRange: [3, 9] }
                ],
                eraser: [
                    { id: 'eraser_small', name: '小橡皮擦', image: 'images/items/eraser_small.png', emoji: '🟦', priceRange: [2, 7] },
                    { id: 'eraser_cute', name: '可愛橡皮擦', image: 'images/items/eraser_cute.png', emoji: '🧽', priceRange: [4, 9] },
                    { id: 'eraser_colored', name: '彩色橡皮擦', image: 'images/items/eraser_colored.png', emoji: '🌈', priceRange: [3, 9] }
                ],
                
                // 2位數 (10-99元) 物品
                snack: [
                    { id: 'snack_cookie', name: '餅乾', image: 'images/items/snack_cookie.png', emoji: '🍪', priceRange: [15, 85] },
                    { id: 'snack_chips', name: '洋芋片', image: 'images/items/snack_chips.png', emoji: '🥔', priceRange: [20, 90] },
                    { id: 'snack_crackers', name: '蘇打餅', image: 'images/items/snack_crackers.png', emoji: '🫓', priceRange: [12, 75] }
                ],
                pen: [
                    { id: 'pen_ballpoint', name: '原子筆', image: 'images/items/pen_ballpoint.png', emoji: '✏️', priceRange: [10, 60] },
                    { id: 'pen_marker', name: '麥克筆', image: 'images/items/pen_marker.png', emoji: '🖊️', priceRange: [25, 95] },
                    { id: 'pen_colored', name: '彩色筆', image: 'images/items/pen_colored.png', emoji: '🎨', priceRange: [30, 85] }
                ],
                notebook: [
                    { id: 'notebook_small', name: '小筆記本', image: 'images/items/notebook_small.png', emoji: '📓', priceRange: [15, 70] },
                    { id: 'notebook_spiral', name: '線圈筆記本', image: 'images/items/notebook_spiral.png', emoji: '🗒️', priceRange: [20, 85] },
                    { id: 'notebook_diary', name: '日記本', image: 'images/items/notebook_diary.png', emoji: '📔', priceRange: [25, 95] }
                ],
                fruit: [
                    { id: 'fruit_apple', name: '蘋果', image: 'images/items/fruit_apple.png', emoji: '🍎', priceRange: [12, 45] },
                    { id: 'fruit_banana', name: '香蕉', image: 'images/items/fruit_banana.png', emoji: '🍌', priceRange: [10, 35] },
                    { id: 'fruit_orange', name: '橘子', image: 'images/items/fruit_orange.png', emoji: '🍊', priceRange: [15, 50] }
                ],
                
                // 3位數 (100-999元) 物品
                toy: [
                    { id: 'toy_car', name: '玩具車', image: 'images/items/toy_car.png', emoji: '🚗', priceRange: [120, 850] },
                    { id: 'toy_doll', name: '娃娃', image: 'images/items/toy_doll.png', emoji: '🪆', priceRange: [150, 600] },
                    { id: 'toy_robot', name: '機器人', image: 'images/items/toy_robot.png', emoji: '🤖', priceRange: [200, 900] }
                ],
                book: [
                    { id: 'book_story', name: '故事書', image: 'images/items/book_story.png', emoji: '📚', priceRange: [100, 400] },
                    { id: 'book_comic', name: '漫畫書', image: 'images/items/book_comic.png', emoji: '📖', priceRange: [150, 500] },
                    { id: 'book_textbook', name: '教科書', image: 'images/items/book_textbook.png', emoji: '📘', priceRange: [200, 800] }
                ],
                lunch: [
                    { id: 'lunch_bento', name: '便當', image: 'images/items/lunch_bento.png', emoji: '🍱', priceRange: [80, 300] },
                    { id: 'lunch_sandwich', name: '三明治', image: 'images/items/lunch_sandwich.png', emoji: '🥪', priceRange: [60, 200] },
                    { id: 'lunch_noodle', name: '麵條', image: 'images/items/lunch_noodle.png', emoji: '🍜', priceRange: [100, 350] }
                ],
                stationery_set: [
                    { id: 'stationery_pencil_case', name: '筆盒', image: 'images/items/stationery_pencil_case.png', emoji: '📝', priceRange: [120, 500] },
                    { id: 'stationery_art_set', name: '美術用品組', image: 'images/items/stationery_art_set.png', emoji: '🎨', priceRange: [200, 900] },
                    { id: 'stationery_calculator', name: '計算機', image: 'images/items/stationery_calculator.png', emoji: '🔢', priceRange: [150, 600] }
                ],
                
                // 4位數 (1000-9999元) 物品
                electronics: [
                    { id: 'electronics_phone', name: '手機', image: 'images/items/electronics_phone.png', emoji: '📱', priceRange: [3000, 9000] },
                    { id: 'electronics_tablet', name: '平板', image: 'images/items/electronics_tablet.png', emoji: '📲', priceRange: [2500, 8000] },
                    { id: 'electronics_headphones', name: '耳機', image: 'images/items/electronics_headphones.png', emoji: '🎧', priceRange: [1000, 5000] }
                ],
                clothing: [
                    { id: 'clothing_shirt', name: '上衣', image: 'images/items/clothing_shirt.png', emoji: '👕', priceRange: [1000, 3000] },
                    { id: 'clothing_pants', name: '褲子', image: 'images/items/clothing_pants.png', emoji: '👖', priceRange: [1000, 4000] },
                    { id: 'clothing_jacket', name: '外套', image: 'images/items/clothing_jacket.png', emoji: '🧥', priceRange: [1500, 6000] }
                ],
                sports: [
                    { id: 'sports_ball', name: '運動球', image: 'images/items/sports_ball.png', emoji: '⚽', priceRange: [1000, 2000] },
                    { id: 'sports_racket', name: '球拍', image: 'images/items/sports_racket.png', emoji: '🏸', priceRange: [1000, 5000] },
                    { id: 'sports_shoes', name: '運動鞋', image: 'images/items/sports_shoes.png', emoji: '👟', priceRange: [2000, 8000] }
                ],
                game: [
                    { id: 'game_console', name: '遊戲機', image: 'images/items/game_console.png', emoji: '🎮', priceRange: [3000, 9000] },
                    { id: 'game_board', name: '桌遊', image: 'images/items/game_board.png', emoji: '🎲', priceRange: [1000, 3000] },
                    { id: 'game_puzzle', name: '拼圖', image: 'images/items/game_puzzle.png', emoji: '🧩', priceRange: [1000, 2000] }
                ],
                
                // 自訂金額物品
                custom_item: [
                    { id: 'custom_gift', name: '神秘禮物', image: 'images/items/custom_gift.png', emoji: '🎁', priceRange: [1, 9999] },
                    { id: 'custom_treasure', name: '寶物', image: 'images/items/custom_treasure.png', emoji: '💎', priceRange: [1, 9999] },
                    { id: 'custom_magic', name: '魔法物品', image: 'images/items/custom_magic.png', emoji: '✨', priceRange: [1, 9999] }
                ]
            }
        },

        // =====================================================
        // 初始化系統
        // =====================================================
        init() {
            console.log('🚀 Game.init() 開始初始化遊戲系統');
            console.log('📱 瀏覽器環境檢查:', {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine
            });
            
            try {
                console.log('🔊 初始化音效系統...');
                this.audio.init();
                console.log('✅ 音效系統初始化完成');
                
                console.log('🗣️ 初始化語音系統...');
                this.speech.init();
                console.log('✅ 語音系統初始化完成');
                
                console.log('📊 初始化遊戲數據...');
                this.initGameData();
                console.log('✅ 遊戲數據初始化完成');
                
                console.log('⚙️ 顯示設定頁面...');
                this.showSettings();
                console.log('✅ 設定頁面顯示完成');
                
                console.log('🎉 遊戲系統初始化成功');
                
                // 監控系統狀態
                this.startSystemMonitoring();
                
            } catch (error) {
                console.error('❌ 遊戲系統初始化失敗:', error);
                console.error('堆疊追蹤:', error.stack);
                
                // 嘗試恢復
                setTimeout(() => {
                    console.log('🔄 嘗試重新初始化...');
                    this.init();
                }, 2000);
            }
        },

        // 初始化遊戲數據
        initGameData() {
            console.log('📊 initGameData() 初始化遊戲數據');
            
            this.gameData = {
                // 物品數據庫
                purchaseItems: {
                    // 1位數 (1-9元) 物品
                    candy: [
                        { id: 'candy_lollipop', name: '棒棒糖', image: 'images/items/candy_lollipop.png', emoji: '🍭', priceRange: [2, 8] },
                        { id: 'candy_gum', name: '口香糖', image: 'images/items/candy_gum.png', emoji: '🍬', priceRange: [3, 9] },
                        { id: 'candy_chocolate', name: '巧克力', image: 'images/items/candy_chocolate.png', emoji: '🍫', priceRange: [4, 9] }
                    ],
                    sticker: [
                        { id: 'sticker_star', name: 'star貼紙', image: 'images/items/sticker_star.png', emoji: '⭐', priceRange: [1, 6] },
                        { id: 'sticker_heart', name: '愛心貼紙', image: 'images/items/sticker_heart.png', emoji: '💖', priceRange: [2, 8] },
                        { id: 'sticker_animal', name: '動物貼紙', image: 'images/items/sticker_animal.png', emoji: '🐱', priceRange: [3, 9] }
                    ],
                    eraser: [
                        { id: 'eraser_small', name: '小橡皮擦', image: 'images/items/eraser_small.png', emoji: '🟦', priceRange: [2, 7] },
                        { id: 'eraser_cute', name: '可愛橡皮擦', image: 'images/items/eraser_cute.png', emoji: '🧽', priceRange: [4, 9] },
                        { id: 'eraser_colored', name: '彩色橡皮擦', image: 'images/items/eraser_colored.png', emoji: '🌈', priceRange: [3, 9] }
                    ],
                    
                    // 2位數 (10-99元) 物品
                    snack: [
                        { id: 'snack_cookie', name: '餅乾', image: 'images/items/snack_cookie.png', emoji: '🍪', priceRange: [15, 85] },
                        { id: 'snack_chips', name: '洋芋片', image: 'images/items/snack_chips.png', emoji: '🥔', priceRange: [20, 90] },
                        { id: 'snack_crackers', name: '蘇打餅', image: 'images/items/snack_crackers.png', emoji: '🫓', priceRange: [12, 75] }
                    ],
                    pen: [
                        { id: 'pen_ballpoint', name: '原子筆', image: 'images/items/pen_ballpoint.png', emoji: '✏️', priceRange: [10, 60] },
                        { id: 'pen_marker', name: '麥克筆', image: 'images/items/pen_marker.png', emoji: '🖊️', priceRange: [25, 95] },
                        { id: 'pen_colored', name: '彩色筆', image: 'images/items/pen_colored.png', emoji: '🎨', priceRange: [30, 85] }
                    ],
                    notebook: [
                        { id: 'notebook_small', name: '小筆記本', image: 'images/items/notebook_small.png', emoji: '📓', priceRange: [15, 70] },
                        { id: 'notebook_spiral', name: '線圈筆記本', image: 'images/items/notebook_spiral.png', emoji: '🗒️', priceRange: [20, 85] },
                        { id: 'notebook_diary', name: '日記本', image: 'images/items/notebook_diary.png', emoji: '📔', priceRange: [25, 95] }
                    ],
                    fruit: [
                        { id: 'fruit_apple', name: '蘋果', image: 'images/items/fruit_apple.png', emoji: '🍎', priceRange: [12, 45] },
                        { id: 'fruit_banana', name: '香蕉', image: 'images/items/fruit_banana.png', emoji: '🍌', priceRange: [10, 35] },
                        { id: 'fruit_orange', name: '橘子', image: 'images/items/fruit_orange.png', emoji: '🍊', priceRange: [15, 50] }
                    ],
                    
                    // 3位數 (100-999元) 物品
                    toy: [
                        { id: 'toy_car', name: '玩具車', image: 'images/items/toy_car.png', emoji: '🚗', priceRange: [120, 850] },
                        { id: 'toy_doll', name: '娃娃', image: 'images/items/toy_doll.png', emoji: '🪆', priceRange: [150, 600] },
                        { id: 'toy_robot', name: '機器人', image: 'images/items/toy_robot.png', emoji: '🤖', priceRange: [200, 900] }
                    ],
                    book: [
                        { id: 'book_story', name: '故事書', image: 'images/items/book_story.png', emoji: '📚', priceRange: [100, 400] },
                        { id: 'book_comic', name: '漫畫書', image: 'images/items/book_comic.png', emoji: '📖', priceRange: [150, 500] },
                        { id: 'book_textbook', name: '教科書', image: 'images/items/book_textbook.png', emoji: '📘', priceRange: [200, 800] }
                    ],
                    lunch: [
                        { id: 'lunch_bento', name: '便當', image: 'images/items/lunch_bento.png', emoji: '🍱', priceRange: [80, 300] },
                        { id: 'lunch_sandwich', name: '三明治', image: 'images/items/lunch_sandwich.png', emoji: '🥪', priceRange: [60, 200] },
                        { id: 'lunch_noodle', name: '麵條', image: 'images/items/lunch_noodle.png', emoji: '🍜', priceRange: [100, 350] }
                    ],
                    stationery_set: [
                        { id: 'stationery_pencil_case', name: '筆盒', image: 'images/items/stationery_pencil_case.png', emoji: '📝', priceRange: [120, 500] },
                        { id: 'stationery_art_set', name: '美術用品組', image: 'images/items/stationery_art_set.png', emoji: '🎨', priceRange: [200, 900] },
                        { id: 'stationery_calculator', name: '計算機', image: 'images/items/stationery_calculator.png', emoji: '🔢', priceRange: [150, 600] }
                    ],
                    
                    // 4位數 (1000-9999元) 物品
                    electronics: [
                        { id: 'electronics_phone', name: '手機', image: 'images/items/electronics_phone.png', emoji: '📱', priceRange: [3000, 9000] },
                        { id: 'electronics_tablet', name: '平板', image: 'images/items/electronics_tablet.png', emoji: '📲', priceRange: [2500, 8000] },
                        { id: 'electronics_headphones', name: '耳機', image: 'images/items/electronics_headphones.png', emoji: '🎧', priceRange: [1000, 5000] }
                    ],
                    clothing: [
                        { id: 'clothing_shirt', name: '上衣', image: 'images/items/clothing_shirt.png', emoji: '👕', priceRange: [1000, 3000] },
                        { id: 'clothing_pants', name: '褲子', image: 'images/items/clothing_pants.png', emoji: '👖', priceRange: [1000, 4000] },
                        { id: 'clothing_jacket', name: '外套', image: 'images/items/clothing_jacket.png', emoji: '🧥', priceRange: [1500, 6000] }
                    ],
                    sports: [
                        { id: 'sports_ball', name: '運動球', image: 'images/items/sports_ball.png', emoji: '⚽', priceRange: [1000, 2000] },
                        { id: 'sports_racket', name: '球拍', image: 'images/items/sports_racket.png', emoji: '🏸', priceRange: [1000, 5000] },
                        { id: 'sports_shoes', name: '運動鞋', image: 'images/items/sports_shoes.png', emoji: '👟', priceRange: [2000, 8000] }
                    ],
                    game: [
                        { id: 'game_console', name: '遊戲機', image: 'images/items/game_console.png', emoji: '🎮', priceRange: [3000, 9000] },
                        { id: 'game_board', name: '桌遊', image: 'images/items/game_board.png', emoji: '🎲', priceRange: [1000, 3000] },
                        { id: 'game_puzzle', name: '拼圖', image: 'images/items/game_puzzle.png', emoji: '🧩', priceRange: [1000, 2000] }
                    ],
                    
                    // 自訂金額物品
                    custom_item: [
                        { id: 'custom_gift', name: '神秘禮物', image: 'images/items/custom_gift.png', emoji: '🎁', priceRange: [1, 9999] },
                        { id: 'custom_treasure', name: '寶物', image: 'images/items/custom_treasure.png', emoji: '💎', priceRange: [1, 9999] },
                        { id: 'custom_magic', name: '魔法物品', image: 'images/items/custom_magic.png', emoji: '✨', priceRange: [1, 9999] }
                    ]
                },
                // 錢幣數據
                allItems: [
                    { value: 1, images: { front: 'images/1_yuan_front.png', back: 'images/1_yuan_back.png' }},
                    { value: 5, images: { front: 'images/5_yuan_front.png', back: 'images/5_yuan_back.png' }},
                    { value: 10, images: { front: 'images/10_yuan_front.png', back: 'images/10_yuan_back.png' }},
                    { value: 50, images: { front: 'images/50_yuan_front.png', back: 'images/50_yuan_back.png' }},
                    { value: 100, images: { front: 'images/100_yuan_front.png', back: 'images/100_yuan_back.png' }},
                    { value: 500, images: { front: 'images/500_yuan_front.png', back: 'images/500_yuan_back.png' }},
                    { value: 1000, images: { front: 'images/1000_yuan_front.png', back: 'images/1000_yuan_back.png' }}
                ]
            };
            
            console.log('✅ 遊戲數據初始化完成');
            console.log('🔍 可用物品類型:', Object.keys(this.gameData.purchaseItems));
        },
        
        // 系統監控
        startSystemMonitoring() {
            console.log('📊 啟動系統監控');
            
            // 監控內存使用
            if (performance && performance.memory) {
                const logMemoryUsage = () => {
                    const memory = performance.memory;
                    console.log('💾 內存使用情況:', {
                        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
                        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
                        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
                    });
                };
                
                // 每30秒記錄一次內存使用
                setInterval(logMemoryUsage, 30000);
                logMemoryUsage(); // 立即記錄一次
            }
            
            // 監控錯誤
            window.addEventListener('error', (event) => {
                console.error('🚨 全域錯誤捕獲:', {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error
                });
            });
            
            // 監控未處理的 Promise 拒絕
            window.addEventListener('unhandledrejection', (event) => {
                console.error('🚨 未處理的 Promise 拒絕:', event.reason);
            });
            
            console.log('✅ 系統監控已啟用');
        },

        // =====================================================
        // 設定畫面（參考unit6樣式和版面）
        // =====================================================
        showSettings() {
            console.log('🎯 showSettings() 顯示設定頁面');
            
            const app = document.getElementById('app');
            const settings = this.state.settings;

            // 定義錢幣與紙鈔
            const coins = [
                { value: 1, name: '1元' },
                { value: 5, name: '5元' },
                { value: 10, name: '10元' },
                { value: 50, name: '50元' }
            ];
            const bills = [
                { value: 100, name: '100元' },
                { value: 500, name: '500元' },
                { value: 1000, name: '1000元' }
            ];

            // 物品類型選項
            // 使用類別方法來生成物品類型
            const itemTypes = this.getAvailableItemTypes(settings.digits);

            const createDenominationButtonsHTML = (items) => items.map(item => `
                <button class="selection-btn ${settings.denominations.includes(item.value) ? 'active' : ''}" 
                        data-type="denomination" data-value="${item.value}">
                    ${item.name}
                </button>`).join('');

            const createItemTypeButtonsHTML = (types) => types.map(type => `
                <button class="selection-btn ${settings.itemTypes.includes(type.type) ? 'active' : ''}" 
                        data-type="itemType" data-value="${type.type}">
                    ${type.emoji} ${type.name}
                </button>`).join('');

            app.innerHTML = `
                <div class="unit-welcome">
                    <div class="welcome-content" style="text-align: center;">
                        <h1>單元五：給足夠的錢</h1>
                        
                        <div class="game-settings">
                            <style>
                                /* 使用與 unit6 完全相同的樣式 */
                                .game-settings {
                                    text-align: center;
                                }
                                .game-settings .setting-group {
                                    text-align: left;
                                    margin-bottom: 20px;
                                }
                                .game-settings .selection-btn {
                                    text-align: center;
                                }
                                
                                /* 不相容物品樣式 */
                                .selection-btn.incompatible {
                                    background-color: #ffe6e6 !important;
                                    border-color: #ff4444 !important;
                                    color: #cc0000 !important;
                                    opacity: 0.8;
                                    cursor: help;
                                }
                                
                                .selection-btn.incompatible:hover {
                                    background-color: #ffcccc !important;
                                    transform: none !important;
                                    box-shadow: 0 2px 8px rgba(255, 68, 68, 0.3) !important;
                                }
                                
                                .selection-btn.incompatible.active {
                                    background-color: #ff9999 !important;
                                    border-color: #ff0000 !important;
                                }
                                
                                /* 相容性提示樣式 */
                                .compatibility-hint {
                                    margin-top: 10px;
                                    padding: 8px 12px;
                                    background-color: #fff3cd;
                                    border: 1px solid #ffeaa7;
                                    border-radius: 4px;
                                    color: #856404;
                                    font-size: 0.9em;
                                    line-height: 1.4;
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
                                
                                /* 物品類型分組樣式 */
                                .item-type-group {
                                    margin-bottom: 15px;
                                }
                                
                                .item-type-group-title {
                                    font-size: 14px;
                                    font-weight: bold;
                                    color: #666;
                                    margin-bottom: 8px;
                                    padding-bottom: 4px;
                                    border-bottom: 1px solid #ddd;
                                }
                                
                                .item-type-buttons {
                                    display: flex;
                                    justify-content: flex-start;
                                    gap: 10px;
                                    flex-wrap: wrap;
                                }
                                .denomination-selection {
                                    display: flex;
                                    justify-content: space-around;
                                    gap: 20px;
                                    flex-wrap: wrap;
                                }
                                .denomination-group {
                                    flex: 1;
                                    min-width: 250px;
                                }
                                .denomination-group h3, .denomination-group h4 {
                                    margin-top: 0;
                                    text-align: left;
                                    color: #495057;
                                }
                                .denomination-items {
                                    display: flex;
                                    flex-wrap: wrap;
                                    justify-content: center;
                                    gap: 10px;
                                    margin-top: 15px;
                                }
                                .setting-description {
                                    margin-top: 10px;
                                    color: #6c757d;
                                    font-size: 14px;
                                }
                            </style>
                        
                            <!-- 所有設定選項放在同一個框內 -->
                            <div class="setting-group">
                                <label>🎯 難度選擇：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${settings.difficulty === 'easy' ? 'active' : ''}" 
                                            data-type="difficulty" data-value="easy">
                                        簡單 (提示模式)
                                    </button>
                                    <button class="selection-btn ${settings.difficulty === 'normal' ? 'active' : ''}" 
                                            data-type="difficulty" data-value="normal">
                                        普通 (判斷模式)
                                    </button>
                                    <button class="selection-btn ${settings.difficulty === 'hard' ? 'active' : ''}" 
                                            data-type="difficulty" data-value="hard">
                                        困難 (純判斷)
                                    </button>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>🔢 目標金額位數：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${settings.digits === 1 ? 'active' : ''}" 
                                            data-type="digits" data-value="1">
                                        1位數
                                    </button>
                                    <button class="selection-btn ${settings.digits === 2 ? 'active' : ''}" 
                                            data-type="digits" data-value="2">
                                        2位數
                                    </button>
                                    <button class="selection-btn ${settings.digits === 3 ? 'active' : ''}" 
                                            data-type="digits" data-value="3">
                                        3位數
                                    </button>
                                    <button class="selection-btn ${settings.digits === 4 ? 'active' : ''}" 
                                            data-type="digits" data-value="4">
                                        4位數
                                    </button>
                                    <button class="selection-btn ${settings.digits === 'custom' ? 'active' : ''}" 
                                            data-type="digits" data-value="custom">
                                        自訂金額
                                    </button>
                                </div>
                                <div id="custom-amount-input" style="display: ${settings.digits === 'custom' ? 'block' : 'none'}; margin-top: 15px;">
                                    <button id="set-custom-amount-btn" 
                                            style="padding: 8px 15px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                        設定自訂金額
                                    </button>
                                    <span id="custom-amount-display" style="margin-left: 10px; font-weight: bold; color: #667eea;">
                                        目前：${settings.customAmount || 0} 元
                                    </span>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>💰 幣值選擇 (可多選)：</label>
                                <div class="denomination-selection">
                                    <div class="denomination-group">
                                        <h4 style="margin: 0 0 10px 0; color: #000;">錢幣</h4>
                                        <div class="button-group">${createDenominationButtonsHTML(coins)}</div>
                                    </div>
                                    <div class="denomination-group" style="margin-top: 15px;">
                                        <h4 style="margin: 0 0 10px 0; color: #000;">紙鈔</h4>
                                        <div class="button-group">${createDenominationButtonsHTML(bills)}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>🛍️ 物品類型選擇 (可多選)：</label>
                                <div class="button-group" id="item-type-buttons">
                                    ${createItemTypeButtonsHTML(itemTypes)}
                                </div>
                                <div id="compatibility-hint" class="compatibility-hint" style="display: none;">
                                    💡 提示：標記❌的物品與當前面額設定不相容，建議添加更小面額（如1元）
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>🎲 題目設定：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${settings.questionCount === 5 ? 'active' : ''}" 
                                            data-type="questions" data-value="5">
                                        5題
                                    </button>
                                    <button class="selection-btn ${settings.questionCount === 10 ? 'active' : ''}" 
                                            data-type="questions" data-value="10">
                                        10題
                                    </button>
                                    <button class="selection-btn ${settings.questionCount === 15 ? 'active' : ''}" 
                                            data-type="questions" data-value="15">
                                        15題
                                    </button>
                                    <button class="selection-btn ${settings.questionCount === 20 ? 'active' : ''}" 
                                            data-type="questions" data-value="20">
                                        20題
                                    </button>
                                    <button class="selection-btn ${settings.questionCount === 'custom' ? 'active' : ''}" 
                                            data-type="questions" data-value="custom">
                                        自訂
                                    </button>
                                </div>
                            </div>
                            
                            <div class="setting-group">
                                <label>🎮 模式選擇：</label>
                                <div class="button-group">
                                    <button class="selection-btn ${settings.mode === 'repeated' ? 'active' : ''}" 
                                            data-type="mode" data-value="repeated">
                                        反複作答
                                    </button>
                                    <button class="selection-btn ${settings.mode === 'single' ? 'active' : ''}" 
                                            data-type="mode" data-value="single">
                                        單次作答
                                    </button>
                                </div>
                            </div>
                            
                            <button class="secondary-btn" onclick="location.href='index.html'">
                                返回主選單
                            </button>
                            <button class="primary-btn" id="start-quiz-btn" disabled>
                                開始遊戲
                            </button>
                    </div>
                </div>
            `;
            
            console.log('✅ 設定頁面HTML已生成');
            
            // 綁定事件監聽器
            this.bindSettingEvents();
            
            // 初始化物品類型UI為分組顯示格式
            console.log('🔧 初始化物品類型分組顯示');
            this.updateItemTypeUI();
            
            const startBtn = app.querySelector('#start-quiz-btn');
            if (startBtn) {
                const isComplete = this.isSettingsComplete();
                startBtn.disabled = !isComplete;
                startBtn.textContent = isComplete ? '開始遊戲' : '請完成所有選擇';
                startBtn.addEventListener('click', this.startQuiz.bind(this));
                console.log(`🎮 開始按鈕狀態: ${isComplete ? '啟用' : '停用'}`);
            }
            
            // 綁定自訂金額按鈕事件
            const setCustomAmountBtn = app.querySelector('#set-custom-amount-btn');
            if (setCustomAmountBtn) {
                setCustomAmountBtn.addEventListener('click', () => {
                    this.showNumberInput('請輸入目標金額', (value) => {
                        const amount = parseInt(value);
                        if (isNaN(amount) || amount < 1 || amount > 9999) {
                            alert('請輸入 1-9999 之間的有效金額');
                            return false;
                        }
                        
                        // Unit5不需要檢查與幣值的衝突，因為不需要「包含所有幣值」
                        this.state.settings.customAmount = amount;
                        
                        // 更新顯示
                        const displaySpan = app.querySelector('#custom-amount-display');
                        if (displaySpan) {
                            displaySpan.textContent = `目前：${amount} 元`;
                        }
                        
                        // 更新物品類型UI（因為自訂金額可能會影響可用物品）
                        this.clearCompatibilityCache(); // 清理緩存
                        this.updateItemTypeUI();
                        
                        // 檢查是否可以開始遊戲
                        this.checkStartState();
                        
                        alert(`已設定目標金額為 ${amount} 元`);
                        
                        return true;
                    });
                });
            }
            
            console.log('📱 事件監聽器已綁定');
        },
        
        // 綁定設定事件
        bindSettingEvents() {
            console.log('🔗 bindSettingEvents() 綁定設定事件');
            
            // 使用事件委派來處理所有設定選項點擊
            const gameSettings = document.querySelector('.game-settings');
            if (gameSettings) {
                gameSettings.addEventListener('click', this.handleSelection.bind(this));
                console.log('✅ 事件委派已設定');
            } else {
                console.error('❌ 找不到 .game-settings 元素');
            }
        },
        
        // 播放選單選擇音效（參考unit6）
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

        // =====================================================
        // 通用系統功能
        // =====================================================
        
        // 檢查設定是否完整
        isSettingsComplete() {
            const { digits, customAmount, denominations, itemTypes, difficulty, mode, questionCount } = this.state.settings;
            
            // 基本檢查
            const basicComplete = digits && denominations.length > 0 && itemTypes.length > 0 && difficulty && mode && questionCount;
            
            if (!basicComplete) return false;
            
            // 🆕 自訂金額模式額外檢查
            if (digits === 'custom') {
                // 檢查自訂金額是否有效
                if (!customAmount || customAmount <= 0) {
                    return false;
                }
                
                // 檢查自訂金額與幣值組合相容性
                if (!this.checkCustomAmountCompatibility(customAmount, denominations)) {
                    return false;
                }
            }
            
            return true;
        },

        // 選擇處理（擴展unit4）
        handleSelection(event) {
            console.log('🎯 handleSelection() 被調用', { event: event.type, target: event.target });
            
            const btn = event.target.closest('.selection-btn');
            if (!btn) {
                console.log('❌ 未找到選擇按鈕，忽略點擊');
                return;
            }

            const { type, value } = btn.dataset;
            const settings = this.state.settings;
            
            // 播放選單選擇音效
            this.playMenuSelectSound();
            
            console.log('📝 處理選擇', { 
                type, 
                value, 
                buttonText: btn.textContent.trim(),
                currentSettings: {...settings}
            });

            if (type === 'denomination' || type === 'itemType') {
                // 多選處理
                const targetArray = type === 'denomination' ? 'denominations' : 'itemTypes';
                const targetValue = type === 'denomination' ? parseInt(value, 10) : value;
                
                const index = settings[targetArray].indexOf(targetValue);
                
                if (index > -1) {
                    // 移除處理
                    btn.classList.remove('active');
                    settings[targetArray].splice(index, 1);
                    console.log(`➖ 移除${type}: ${targetValue}，目前陣列: [${settings[targetArray].join(', ')}]`);
                    
                    // 如果是面額變更，需要重新檢查物品相容性
                    if (type === 'denomination') {
                        console.log('🔄 面額移除，觸發物品類型相容性更新');
                        this.clearCompatibilityCache(); // 清理緩存
                        this.updateItemTypeUI();
                    }
                } else {
                    // 添加前檢查衝突（僅對denomination類型）
                    if (type === 'denomination') {
                        const testDenominations = [...settings.denominations, targetValue];
                        if (!this.isValidCombination(settings.digits, testDenominations)) {
                            this.showInvalidCombinationWarning(settings.digits, targetValue);
                            return; // 拒絕添加
                        }
                        
                        // 自訂金額模式：檢查是否已設定自訂金額
                        if (settings.digits === 'custom') {
                            const { customAmount } = settings;
                            if (!customAmount || customAmount <= 0) {
                                this.showInvalidCombinationWarning('custom');
                                return; // 拒絕添加
                            }
                        }
                    }
                    
                    // 檢查通過，添加項目
                    btn.classList.add('active');
                    settings[targetArray].push(targetValue);
                    console.log(`➕ 添加${type}: ${targetValue}，目前陣列: [${settings[targetArray].join(', ')}]`);
                    
                    // 如果是面額變更，需要重新檢查物品相容性
                    if (type === 'denomination') {
                        console.log('🔄 面額變更，觸發物品類型相容性更新');
                        this.clearCompatibilityCache(); // 清理緩存
                        this.updateItemTypeUI();
                    }
                }
            } else if (type === 'questions') {
                // 題目數量處理
                if (value === 'custom') {
                    // 自訂題目數量
                    this.showNumberInput('請輸入題目數量', (inputValue) => {
                        const questionCount = parseInt(inputValue);
                        if (isNaN(questionCount) || questionCount < 1 || questionCount > 100) {
                            alert('請輸入 1-100 之間的有效數字');
                            return false;
                        }
                        
                        settings.questionCount = questionCount;
                        console.log(`🎲 自訂題目數量: ${questionCount}`);
                        
                        // 更新active狀態
                        const customBtn = document.querySelector('[data-value="custom"]');
                        if (customBtn) {
                            const buttonGroup = customBtn.closest('.button-group');
                            buttonGroup.querySelectorAll('.selection-btn')
                                .forEach(b => b.classList.remove('active'));
                            customBtn.classList.add('active');
                        }
                        
                        this.checkStartState();
                        alert(`已設定測驗題數為 ${questionCount} 題`);
                        return true;
                    });
                } else {
                    // 預設題目數量
                    const questionCount = parseInt(value, 10);
                    settings.questionCount = questionCount;
                    btn.parentElement.querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    console.log(`🎲 選擇題目數量: ${questionCount}`);
                }
            } else {
                // 其他單選處理
                const oldValue = settings[type];
                if (type === 'digits') {
                    settings[type] = (value === 'custom') ? 'custom' : parseInt(value, 10);
                } else {
                    settings[type] = value;
                }
                btn.parentElement.querySelectorAll('.selection-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                console.log(`🔄 單選更新 ${type}: ${oldValue} → ${settings[type]}`);
                
                if (type === 'digits') {
                    // 檢查位數變更是否會造成幣值衝突
                    const newDigits = value === 'custom' ? 'custom' : parseInt(value, 10);
                    if (newDigits !== 'custom') {
                        const maxDenomination = Math.pow(10, newDigits);
                        const invalidDenominations = settings.denominations.filter(d => d >= maxDenomination);
                        if (invalidDenominations.length > 0) {
                            // 自動移除無效幣值，並顯示警告
                            settings.denominations = settings.denominations.filter(d => d < maxDenomination);
                            this.showInvalidCombinationWarning(newDigits, invalidDenominations);
                        }
                    }
                    
                    console.log('🔧 觸發面額UI更新');
                    this.updateDenominationUI();
                    
                    // 觸發物品類型UI更新
                    console.log('🔧 觸發物品類型UI更新');
                    this.clearCompatibilityCache(); // 清理緩存
                    this.updateItemTypeUI();
                    
                    // 處理自訂金額顯示/隱藏
                    const customInputDiv = document.getElementById('custom-amount-input');
                    if (customInputDiv) {
                        customInputDiv.style.display = (value === 'custom') ? 'block' : 'none';
                    }
                }
            }
            
            console.log('📊 更新後的完整設定:', {...settings});
            this.checkStartState();
        },

        // 檢查開始狀態
        checkStartState() {
            console.log('🔍 checkStartState() 檢查遊戲開始條件');
            
            const { digits, denominations, itemTypes, difficulty, mode, questionCount } = this.state.settings;
            const startBtn = document.getElementById('start-quiz-btn');
            
            const conditions = {
                digits: !!digits,
                denominations: denominations.length > 0,
                itemTypes: itemTypes.length > 0,
                difficulty: !!difficulty,
                mode: !!mode,
                questionCount: !!questionCount
            };
            
            const isReady = Object.values(conditions).every(condition => condition);
            
            console.log('✅ 條件檢查結果:', {
                conditions,
                isReady,
                currentSettings: { digits, denominations, itemTypes, difficulty, mode, questionCount }
            });
            
            if (startBtn) {
                startBtn.disabled = !isReady;
                startBtn.textContent = isReady ? '開始測驗！' : '請完成所有選擇';
                console.log(`🎮 開始按鈕狀態: ${isReady ? '啟用' : '停用'} - "${startBtn.textContent}"`);
            } else {
                console.error('❌ 找不到開始按鈕元素');
            }
        },

        // 更新面額UI（限制規則）
        updateDenominationUI() {
            const { digits } = this.state.settings;
            
            if (digits === 'custom') {
                // 自訂金額模式：無面額限制，但檢查是否有衝突
                return;
            }
            
            const maxDenomination = Math.pow(10, digits);
            
            const denominationButtons = document.querySelectorAll('.selection-btn[data-type="denomination"]');
            denominationButtons.forEach(btn => {
                const value = parseInt(btn.dataset.value, 10);
                btn.disabled = value >= maxDenomination;
                if (btn.disabled) {
                    btn.classList.remove('active');
                    const index = this.state.settings.denominations.indexOf(value);
                    if (index > -1) {
                        this.state.settings.denominations.splice(index, 1);
                    }
                }
            });
        },

        // 新增：檢查位數和幣值組合是否有效（簡化版，適用unit5）
        isValidCombination(digits, denominations) {
            if (!denominations.length) return true;
            
            if (digits === 'custom') {
                // 自訂金額模式：只需要檢查是否有自訂金額設定
                const { customAmount } = this.state.settings;
                return customAmount && customAmount > 0;
            }
            
            // 位數模式：檢查基本的面額限制
            const maxDenomination = Math.pow(10, digits);
            const invalidDenominations = denominations.filter(d => d >= maxDenomination);
            
            return invalidDenominations.length === 0;
        },

        // 新增：顯示無效組合警告（簡化版，適用unit5）
        showInvalidCombinationWarning(digits, invalidItems, customData = null) {
            let message;
            
            if (digits === 'custom') {
                // 自訂金額模式的警告
                message = '請先設定自訂金額才能選擇幣值';
            } else {
                // 位數模式警告
                const digitNames = { 1: '1位數', 2: '2位數', 3: '3位數', 4: '4位數' };
                const digitName = digitNames[digits] || digits;
                
                if (Array.isArray(invalidItems)) {
                    const itemNames = invalidItems.map(v => `${v}元`).join('、');
                    message = `選擇${digitName}後，${itemNames}將無法使用，已自動移除`;
                } else {
                    message = `${invalidItems}元無法與${digitName}組合使用，請選擇其他幣值`;
                }
            }
            
            // 創建警告彈窗
            const modalOverlay = document.createElement('div');
            modalOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0, 0, 0, 0.75);
                display: flex; align-items: center; justify-content: center;
                z-index: 2000; opacity: 0; transition: opacity 0.3s;
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                padding: 30px 40px; border-radius: 15px; text-align: center;
                color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                transform: scale(0.8); transition: transform 0.3s;
                border: 2px solid #f39c12; max-width: 450px;
            `;

            modalContent.innerHTML = `
                <h2 style="font-size: 1.8em; margin: 0 0 15px 0; color: #f1c40f;">⚠️ 設定衝突</h2>
                <p style="font-size: 1.1em; margin: 0; line-height: 1.4;">${message}</p>
            `;

            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);

            // 語音提示
            this.speech.speak(message);

            // 點擊關閉
            const closeModal = () => {
                modalOverlay.style.opacity = '0';
                modalContent.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    if (document.body.contains(modalOverlay)) {
                        document.body.removeChild(modalOverlay);
                    }
                }, 300);
            };

            modalOverlay.addEventListener('click', closeModal);

            // 動畫效果
            setTimeout(() => {
                modalOverlay.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }, 10);

            // 4秒後自動關閉
            setTimeout(closeModal, 4000);
        },

        // 根據目標金額位數嚴格對應物品類型（移除向下相容）
        getAvailableItemTypes(digits) {
            // 定義每個位數層級對應的物品（嚴格對應）
            const itemsByDigits = {
                1: [  // 1位數 (1-9元)
                    { type: 'candy', name: '糖果', emoji: '🍬' },
                    { type: 'sticker', name: '貼紙', emoji: '✨' },
                    { type: 'eraser', name: '橡皮擦', emoji: '🧽' }
                ],
                2: [  // 2位數 (10-99元)
                    { type: 'snack', name: '零食', emoji: '🍪' },
                    { type: 'pen', name: '筆', emoji: '✏️' },
                    { type: 'notebook', name: '筆記本', emoji: '📓' },
                    { type: 'fruit', name: '水果', emoji: '🍎' }
                ],
                3: [  // 3位數 (100-999元)
                    { type: 'toy', name: '玩具', emoji: '🧸' },
                    { type: 'book', name: '書籍', emoji: '📚' },
                    { type: 'lunch', name: '便當', emoji: '🍱' },
                    { type: 'stationery_set', name: '文具組', emoji: '📝' }
                ],
                4: [  // 4位數 (1000-9999元)
                    { type: 'electronics', name: '電子產品', emoji: '📱' },
                    { type: 'clothing', name: '衣物', emoji: '👕' },
                    { type: 'sports', name: '運動用品', emoji: '⚽' },
                    { type: 'game', name: '遊戲', emoji: '🎮' }
                ]
            };
            
            // 嚴格對應：只返回當前位數的物品
            if (digits === 'custom') {
                // 🆕 自訂金額模式：根據金額大小判定位數範圍
                return this.getAvailableItemTypesForCustomAmount(this.state.settings.customAmount);
            } else {
                // 嚴格位數對應
                return itemsByDigits[digits] || [];
            }
        },

        // 🆕 根據自訂金額判定可用的物品類型
        getAvailableItemTypesForCustomAmount(amount) {
            console.log(`🎯 自訂金額 ${amount}元，判定可用物品類型`);
            
            if (!amount || amount <= 0) {
                console.log('⚠️ 自訂金額無效，返回空陣列');
                return [];
            }

            // 根據金額大小判定位數範圍，然後返回對應的物品類型
            if (amount >= 1 && amount <= 9) {
                console.log('📋 1位數物品 (1-9元)');
                return [
                    { type: 'candy', name: '糖果', emoji: '🍬' },
                    { type: 'sticker', name: '貼紙', emoji: '✨' },
                    { type: 'eraser', name: '橡皮擦', emoji: '🧽' }
                ];
            } else if (amount >= 10 && amount <= 99) {
                console.log('📋 2位數物品 (10-99元)');
                return [
                    { type: 'snack', name: '零食', emoji: '🍪' },
                    { type: 'pen', name: '筆', emoji: '✏️' },
                    { type: 'notebook', name: '筆記本', emoji: '📓' },
                    { type: 'fruit', name: '水果', emoji: '🍎' }
                ];
            } else if (amount >= 100 && amount <= 999) {
                console.log('📋 3位數物品 (100-999元)');
                return [
                    { type: 'toy', name: '玩具', emoji: '🧸' },
                    { type: 'book', name: '書籍', emoji: '📚' },
                    { type: 'lunch', name: '便當', emoji: '🍱' },
                    { type: 'stationery_set', name: '文具組', emoji: '📝' }
                ];
            } else if (amount >= 1000 && amount <= 9999) {
                console.log('📋 4位數物品 (1000-9999元)');
                return [
                    { type: 'electronics', name: '電子產品', emoji: '📱' },
                    { type: 'clothing', name: '衣物', emoji: '👕' },
                    { type: 'sports', name: '運動用品', emoji: '⚽' },
                    { type: 'game', name: '遊戲', emoji: '🎮' }
                ];
            } else {
                console.log('⚠️ 金額超出範圍 (1-9999元)');
                return [];
            }
        },

        // 🆕 檢查自訂金額與幣值組合的相容性
        checkCustomAmountCompatibility(amount, denominations) {
            console.log(`🔍 檢查自訂金額 ${amount}元 與面額 [${denominations.join(', ')}] 的相容性`);
            
            if (!amount || amount <= 0) {
                console.log('❌ 自訂金額無效');
                return false;
            }
            
            if (!denominations || denominations.length === 0) {
                console.log('❌ 沒有選擇面額');
                return false;
            }
            
            // 使用動態規劃檢查是否能組合出目標金額
            const dp = new Array(amount + 1).fill(false);
            dp[0] = true; // 金額0可以用0個硬幣組成
            
            for (let coin of denominations) {
                for (let i = coin; i <= amount; i++) {
                    if (dp[i - coin]) {
                        dp[i] = true;
                    }
                }
            }
            
            const canMake = dp[amount];
            console.log(`${canMake ? '✅' : '❌'} 自訂金額 ${amount}元 ${canMake ? '可以' : '無法'} 用面額 [${denominations.join(', ')}] 組合`);
            
            return canMake;
        },

        // 根據面額和位數計算所有可能的金額組合
        generatePossibleAmounts(denominations, digits) {
            console.log(`🧮 計算面額 [${denominations.join(', ')}] 在 ${digits} 位數下的可能金額`);
            
            if (!denominations || denominations.length === 0) {
                console.error('❌ 面額陣列為空');
                return [];
            }
            
            // 計算位數的最大金額
            const maxAmount = digits === 'custom' ? 9999 : Math.pow(10, digits) - 1;
            console.log(`📊 最大金額限制: ${maxAmount}元`);
            
            const possibleAmounts = new Set(); // 使用 Set 避免重複
            
            // 對每個面額計算倍數組合
            denominations.forEach(denomination => {
                console.log(`💰 計算面額 ${denomination}元 的倍數`);
                
                // 計算這個面額可以組成的金額
                for (let count = 1; count * denomination <= maxAmount; count++) {
                    const amount = count * denomination;
                    possibleAmounts.add(amount);
                    
                    if (count <= 5) { // 只記錄前5個倍數用於日誌
                        console.log(`  ${count}張 × ${denomination}元 = ${amount}元`);
                    }
                }
            });
            
            // 如果有多個面額，計算組合
            if (denominations.length > 1) {
                console.log('🔄 計算多面額組合...');
                const maxCoins = 10; // 限制最大硬幣數量避免計算爆炸
                
                // 用動態規劃計算所有可能組合
                for (let amount = 1; amount <= Math.min(maxAmount, 200); amount++) {
                    if (this.canMakeAmount(amount, denominations, maxCoins)) {
                        possibleAmounts.add(amount);
                    }
                }
            }
            
            const sortedAmounts = Array.from(possibleAmounts).sort((a, b) => a - b);
            console.log(`✅ 共計算出 ${sortedAmounts.length} 個可能金額: [${sortedAmounts.slice(0, 10).join(', ')}${sortedAmounts.length > 10 ? '...' : ''}]`);
            
            return sortedAmounts;
        },

        // 檢查是否能用給定面額組成指定金額（限制硬幣數量）
        canMakeAmount(targetAmount, denominations, maxCoins) {
            const dp = Array(targetAmount + 1).fill(Infinity);
            dp[0] = 0;
            
            for (let amount = 1; amount <= targetAmount; amount++) {
                for (const denomination of denominations) {
                    if (denomination <= amount && dp[amount - denomination] < maxCoins) {
                        dp[amount] = Math.min(dp[amount], dp[amount - denomination] + 1);
                    }
                }
            }
            
            return dp[targetAmount] <= maxCoins;
        },

        // =====================================================
        // 價格策略系統 - 新增面額優先的物品價格生成
        // =====================================================
        generateItemPrice(possibleAmounts, strategy, digits, availableItemTypes) {
            console.log(`🎯 使用策略 "${strategy}" 生成物品價格，可用金額數量: ${possibleAmounts.length}`);
            
            if (!possibleAmounts || possibleAmounts.length === 0) {
                console.error('❌ 沒有可用的金額來生成價格');
                return null;
            }
            
            const maxPrice = digits === 'custom' ? 9999 : Math.pow(10, digits) - 1;
            
            // 🔧 關鍵修復：篩選可用金額，只保留在物品價格範圍內的金額
            const validAmounts = this.filterAmountsByItemPriceRanges(possibleAmounts, availableItemTypes, digits);
            if (!validAmounts || validAmounts.length === 0) {
                console.error('❌ 沒有金額落在任何物品的價格範圍內');
                return null;
            }
            
            console.log(`📋 篩選後有效金額數量: ${validAmounts.length} (從${possibleAmounts.length}個中篩選)`);
            
            switch (strategy) {
                case 'insufficient':
                    // 價格高於所有可能金額，確保錢不夠
                    return this.generateInsufficientPrice(validAmounts, maxPrice, availableItemTypes, digits);
                    
                case 'sufficient':
                    // 價格等於某個可能金額，確保錢剛好夠
                    return this.generateSufficientPrice(validAmounts);
                    
                case 'exact':
                    // 價格等於某個可能金額（與sufficient相同）
                    return this.generateSufficientPrice(validAmounts);
                    
                default:
                    console.error(`❌ 未知的價格策略: ${strategy}`);
                    return null;
            }
        },

        generateInsufficientPrice(possibleAmounts, maxPrice, availableItemTypes, digits) {
            const maxPossibleAmount = Math.max(...possibleAmounts);
            console.log(`📈 最大可能金額: ${maxPossibleAmount}元`);
            
            // 🔧 獲取所有物品的最大價格範圍，確保不足價格在合理範圍內
            let maxItemPrice = 0;
            availableItemTypes.forEach(typeKey => {
                const items = this.gameData.purchaseItems[typeKey];
                if (items && items.length > 0) {
                    items.forEach(item => {
                        const itemMaxPrice = Math.min(maxPrice, item.priceRange[1]);
                        maxItemPrice = Math.max(maxItemPrice, itemMaxPrice);
                    });
                }
            });
            
            console.log(`🏷️ 物品最大價格: ${maxItemPrice}元`);
            
            // 🔧 智能生成insufficient價格：必須在物品價格範圍內且不可購買
            let insufficientPrice = null;
            
            // 🔍 獲取所有物品的最低價格
            let minItemPrice = Number.MAX_SAFE_INTEGER;
            availableItemTypes.forEach(typeKey => {
                const items = this.gameData.purchaseItems[typeKey];
                if (items && items.length > 0) {
                    items.forEach(item => {
                        const itemMinPrice = Math.max(1, item.priceRange[0]);
                        minItemPrice = Math.min(minItemPrice, itemMinPrice);
                    });
                }
            });
            
            console.log(`🏷️ 物品最低價格: ${minItemPrice}元`);
            
            // 策略1: 在物品價格範圍內尋找不在可能金額中的價格 (從高到低)
            for (let price = maxItemPrice; price >= minItemPrice; price--) {
                if (!possibleAmounts.includes(price)) {
                    insufficientPrice = price;
                    console.log(`💡 找到範圍內的不足價格: ${price}元 (範圍: ${minItemPrice}-${maxItemPrice}元)`);
                    break;
                }
            }
            
            // 策略2: 如果找不到，尋找比最大可能金額稍高但在物品範圍內的價格
            if (!insufficientPrice && maxPossibleAmount < maxItemPrice && maxPossibleAmount + 1 >= minItemPrice) {
                insufficientPrice = maxPossibleAmount + 1;
                console.log(`💡 使用稍高價格: ${insufficientPrice}元`);
            }
            
            // 策略3: 如果還找不到，回退到sufficient策略
            if (!insufficientPrice || insufficientPrice > maxItemPrice || insufficientPrice < minItemPrice) {
                console.log(`⚠️ 無法生成合適的不足價格 (金額範圍: ${maxPossibleAmount}, 物品範圍: ${minItemPrice}-${maxItemPrice}元)，改用sufficient策略`);
                return this.generateSufficientPrice(possibleAmounts);
            }
            
            console.log(`💸 生成不足價格: ${insufficientPrice}元`);
            return insufficientPrice;
        },

        generateSufficientPrice(possibleAmounts) {
            // 隨機選擇一個可能的金額作為價格
            const randomIndex = Math.floor(Math.random() * possibleAmounts.length);
            const sufficientPrice = possibleAmounts[randomIndex];
            console.log(`💰 生成足夠價格: ${sufficientPrice}元`);
            return sufficientPrice;
        },

        // 🔧 新增：篩選金額，只保留在物品價格範圍內的金額
        filterAmountsByItemPriceRanges(possibleAmounts, itemTypes, digits) {
            console.log(`🔍 篩選金額：檢查 ${possibleAmounts.length} 個金額是否落在物品價格範圍內`);
            
            const maxPrice = digits === 'custom' ? 9999 : Math.pow(10, digits) - 1;
            const validAmounts = [];
            
            // 收集所有選定物品類型的價格範圍
            const allPriceRanges = [];
            itemTypes.forEach(typeKey => {
                const items = this.gameData.purchaseItems[typeKey];
                if (items && items.length > 0) {
                    items.forEach(item => {
                        const itemMinPrice = Math.max(1, item.priceRange[0]);
                        const itemMaxPrice = Math.min(maxPrice, item.priceRange[1]);
                        allPriceRanges.push([itemMinPrice, itemMaxPrice]);
                    });
                }
            });
            
            console.log(`📊 找到 ${allPriceRanges.length} 個物品價格範圍`);
            
            // 檢查每個金額是否落在任何物品的價格範圍內
            possibleAmounts.forEach(amount => {
                for (const [minPrice, maxPrice] of allPriceRanges) {
                    if (amount >= minPrice && amount <= maxPrice) {
                        if (!validAmounts.includes(amount)) {
                            validAmounts.push(amount);
                        }
                        break; // 找到一個符合的範圍就足夠了
                    }
                }
            });
            
            console.log(`✅ 篩選完成：${validAmounts.length} 個有效金額 (從 ${possibleAmounts.length} 個中篩選)`);
            if (validAmounts.length > 0) {
                console.log(`📋 有效金額範圍: ${Math.min(...validAmounts)}-${Math.max(...validAmounts)}元`);
            }
            
            return validAmounts;
        },

        // =====================================================
        // 緩存管理系統 - 優化重複計算
        // =====================================================
        clearCompatibilityCache() {
            this.state.compatibilityCache = {};
            console.log('🗑️ 相容性緩存已清理');
        },
        
        generateCacheKey(itemType, denominations, digits) {
            return `${itemType}_${JSON.stringify(denominations)}_${digits}`;
        },

        // =====================================================
        // 簡化的相容性檢查 - 配合新版面額優先邏輯 + 金錢數量合理性檢查 + 緩存優化
        // =====================================================
        checkItemCompatibility(itemType, denominations, digits) {
            // 🚀 檢查緩存
            const cacheKey = this.generateCacheKey(itemType, denominations, digits);
            if (this.state.compatibilityCache.hasOwnProperty(cacheKey)) {
                console.log(`💾 使用緩存結果: ${itemType} = ${this.state.compatibilityCache[cacheKey]}`);
                return this.state.compatibilityCache[cacheKey];
            }
            console.log(`🔍 檢查物品類型 "${itemType}" 與面額 [${denominations?.join(', ')}] 的相容性`);
            
            if (!denominations || denominations.length === 0) {
                console.log('⚠️ 沒有面額，默認相容');
                return true;
            }
            if (!itemType) {
                console.log('⚠️ 沒有物品類型，默認相容');
                return true;
            }

            // 1. 檢查物品類型是否存在且符合位數要求
            const availableItemTypes = this.getAvailableItemTypes(digits);
            const availableTypeNames = availableItemTypes.map(item => item.type);
            if (!availableTypeNames.includes(itemType)) {
                console.log(`❌ 物品類型 "${itemType}" 不符合位數 ${digits} 要求`);
                console.log(`📋 可用的物品類型: [${availableTypeNames.join(', ')}]`);
                return false;
            }

            // 2. 檢查是否有該類型的物品
            const items = this.gameData.purchaseItems[itemType];
            if (!items || items.length === 0) {
                console.log(`❌ 物品類型 "${itemType}" 沒有可用物品`);
                return false;
            }

            // 3. 計算面額可生成的金額範圍
            const possibleAmounts = this.generatePossibleAmounts(denominations, digits);
            if (possibleAmounts.length === 0) {
                console.log(`❌ 面額 [${denominations.join(', ')}] 無法生成任何有效金額`);
                return false;
            }

            const minPossibleAmount = Math.min(...possibleAmounts);
            const maxPossibleAmount = Math.max(...possibleAmounts);
            console.log(`💰 面額可生成金額範圍: ${minPossibleAmount}-${maxPossibleAmount}元`);

            // 4. 檢查硬幣數量合理性 - 檢查在30張硬幣限制下能否購買該位數物品
            if (digits !== 'custom') {
                const maxDenomination = Math.max(...denominations);
                const maxPurchasePower = 30 * maxDenomination; // 30張硬幣的最大購買力
                
                // 獲取該位數的最小價格（物品起始價格）
                let digitRangeMin;
                if (digits === 1) {
                    digitRangeMin = 1;   // 1位數物品: 1-9元
                } else if (digits === 2) {
                    digitRangeMin = 10;  // 2位數物品: 10-99元
                } else if (digits === 3) {
                    digitRangeMin = 100; // 3位數物品: 100-999元
                } else if (digits === 4) {
                    digitRangeMin = 1000; // 4位數物品: 1000-9999元
                }
                
                console.log(`🔍 硬幣購買力檢查: 30張${maxDenomination}元 = ${maxPurchasePower}元購買力 vs ${digits}位數起始價格${digitRangeMin}元`);
                
                if (maxPurchasePower < digitRangeMin) {
                    console.log(`💡 會產生超過30錢幣，請選擇合理的位數與幣值組合`);
                    console.log(`   詳細說明：30張${maxDenomination}元硬幣最多只能買${maxPurchasePower}元，無法購買${digits}位數物品(${digitRangeMin}元起)`);
                    return false;
                } else {
                    console.log(`✅ 硬幣數量合理：30張${maxDenomination}元足夠購買${digits}位數物品`);
                }
            }

            // 5. 檢查是否有物品的價格範圍與可能金額重疊
            // 定義該位數的最大價格
            let maxPrice;
            if (digits === 1) {
                maxPrice = 9;    // 1位數物品: 1-9元
            } else if (digits === 2) {
                maxPrice = 99;   // 2位數物品: 10-99元
            } else if (digits === 3) {
                maxPrice = 999;  // 3位數物品: 100-999元
            } else if (digits === 4) {
                maxPrice = 9999; // 4位數物品: 1000-9999元
            } else if (digits === 'custom') {
                maxPrice = Number.MAX_SAFE_INTEGER; // 自訂金額無上限
            }
            
            const hasValidItem = items.some(item => {
                const itemMinPrice = Math.max(1, item.priceRange[0]);
                const itemMaxPrice = Math.min(maxPrice, item.priceRange[1]);
                
                // 檢查價格範圍是否與可能金額有重疊
                const hasOverlap = itemMinPrice <= maxPossibleAmount && itemMaxPrice >= minPossibleAmount;
                
                if (hasOverlap) {
                    console.log(`✅ 物品 "${item.name}" 價格範圍 ${itemMinPrice}-${itemMaxPrice}元 與面額金額有重疊`);
                } else {
                    console.log(`⚠️ 物品 "${item.name}" 價格範圍 ${itemMinPrice}-${itemMaxPrice}元 與面額金額 ${minPossibleAmount}-${maxPossibleAmount}元 無重疊`);
                }
                
                return hasOverlap;
            });

            console.log(`${hasValidItem ? '✅' : '❌'} 物品類型 "${itemType}" 相容性檢查結果: ${hasValidItem}`);
            
            // 🚀 存入緩存
            this.state.compatibilityCache[cacheKey] = hasValidItem;
            
            return hasValidItem;
        },

        // 檢測是否能用給定面額組成目標金額
        canGenerateMoneyAmount(targetAmount, denominations) {
            if (targetAmount <= 0) return true;
            
            // 使用動態規劃檢查是否可能組成目標金額
            const dp = new Array(targetAmount + 1).fill(false);
            dp[0] = true;
            
            for (let denomination of denominations) {
                for (let amount = denomination; amount <= targetAmount; amount++) {
                    if (dp[amount - denomination]) {
                        dp[amount] = true;
                    }
                }
            }
            
            return dp[targetAmount];
        },

        // 更新物品類型按鈕
        updateItemTypeUI() {
            console.log('🔧 updateItemTypeUI() 更新物品類型UI');
            
            const { digits } = this.state.settings;
            
            // 找到物品類型按鈕容器
            const itemTypeButtonGroup = document.getElementById('item-type-buttons');
            if (!itemTypeButtonGroup) {
                console.error('❌ 找不到物品類型按鈕容器');
                return;
            }
            
            const availableItemTypes = this.getAvailableItemTypes(digits);
            const settings = this.state.settings;
            
            // 記錄清理前的狀態
            const beforeCleanup = [...settings.itemTypes];
            console.log('🔍 清理前的物品類型選擇:', beforeCleanup);
            console.log('🔍 當前位數模式可用的物品類型:', availableItemTypes.map(t => t.type));
            
            // 清理已選擇但不再可用的物品類型
            settings.itemTypes = settings.itemTypes.filter(selectedType => 
                availableItemTypes.some(availableType => availableType.type === selectedType)
            );
            
            // 記錄清理後的狀態
            const afterCleanup = [...settings.itemTypes];
            const removedTypes = beforeCleanup.filter(type => !afterCleanup.includes(type));
            if (removedTypes.length > 0) {
                console.log('🧹 已清理不相容的物品類型:', removedTypes);
                console.log('✅ 清理後的物品類型選擇:', afterCleanup);
            } else {
                console.log('ℹ️ 無需清理，物品類型選擇未變更');
            }
            
            // 生成按位數分組的按鈕HTML
            const createGroupedItemTypeButtonsHTML = (digits) => {
                // 定義位數分組
                const itemsByDigits = {
                    1: { title: '1位數 (1-9元)', items: [] },
                    2: { title: '2位數 (10-99元)', items: [] },
                    3: { title: '3位數 (100-999元)', items: [] },
                    4: { title: '4位數 (1000-9999元)', items: [] }
                };
                
                // 原始物品分組定義 (與getAvailableItemTypes保持一致)
                const originalItemGroups = {
                    'candy': 1, 'sticker': 1, 'eraser': 1,
                    'snack': 2, 'pen': 2, 'notebook': 2, 'fruit': 2,
                    'toy': 3, 'book': 3, 'lunch': 3, 'stationery_set': 3,
                    'electronics': 4, 'clothing': 4, 'sports': 4, 'game': 4
                };
                
                // 將可用物品分組
                availableItemTypes.forEach(item => {
                    const digitGroup = originalItemGroups[item.type] || 1;
                    if (itemsByDigits[digitGroup]) {
                        itemsByDigits[digitGroup].items.push(item);
                    }
                });
                
                // 生成分組HTML
                let groupedHTML = '';
                for (let d = 1; d <= digits; d++) {
                    if (itemsByDigits[d] && itemsByDigits[d].items.length > 0) {
                        groupedHTML += `
                            <div class="item-type-group">
                                <div class="item-type-group-title">${itemsByDigits[d].title}</div>
                                <div class="item-type-buttons">
                                    ${itemsByDigits[d].items.map(type => {
                                        const isCompatible = this.checkItemCompatibility(type.type, settings.denominations, digits);
                                        const compatibilityClass = isCompatible ? '' : 'incompatible';
                                        const compatibilityIcon = isCompatible ? '' : '❌ ';
                                        const tooltip = isCompatible ? '' : '此物品與當前面額設定不相容，建議添加更小面額';
                                        
                                        return `
                                            <button class="selection-btn ${settings.itemTypes.includes(type.type) ? 'active' : ''} ${compatibilityClass}" 
                                                    data-type="itemType" data-value="${type.type}"
                                                    title="${tooltip}">
                                                ${compatibilityIcon}${type.emoji} ${type.name}
                                            </button>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }
                }
                
                return groupedHTML;
            };
            
            // 更新按鈕容器內容為分組顯示
            if (digits === 'custom') {
                // 自訂模式使用原來的顯示方式
                const createItemTypeButtonsHTML = (types) => types.map(type => {
                    const isCompatible = this.checkItemCompatibility(type.type, settings.denominations, digits);
                    const compatibilityClass = isCompatible ? '' : 'incompatible';
                    const compatibilityIcon = isCompatible ? '' : '❌ ';
                    const tooltip = isCompatible ? '' : '此物品與當前面額設定不相容，建議添加更小面額';
                    
                    return `
                        <button class="selection-btn ${settings.itemTypes.includes(type.type) ? 'active' : ''} ${compatibilityClass}" 
                                data-type="itemType" data-value="${type.type}"
                                title="${tooltip}">
                            ${compatibilityIcon}${type.emoji} ${type.name}
                        </button>
                    `;
                }).join('');
                itemTypeButtonGroup.innerHTML = createItemTypeButtonsHTML(availableItemTypes);
            } else {
                // 一般模式使用分組顯示
                itemTypeButtonGroup.innerHTML = createGroupedItemTypeButtonsHTML(digits);
            }
            
            // 如果有物品類型被清理，需要重新檢查遊戲開始條件
            if (removedTypes.length > 0) {
                console.log('🔄 因物品類型清理，重新檢查遊戲開始條件');
                this.checkStartState();
            }
            
            // 檢查是否有不相容的物品並顯示提示
            this.updateCompatibilityHint();
            
            console.log(`✅ 物品類型UI已更新，可用物品: ${availableItemTypes.length} 種`);
        },

        // 更新相容性提示
        updateCompatibilityHint() {
            const { digits, denominations } = this.state.settings;
            const hintElement = document.getElementById('compatibility-hint');
            
            if (!hintElement || !denominations || denominations.length === 0) {
                if (hintElement) hintElement.style.display = 'none';
                return;
            }

            // 檢查所有物品類型的相容性
            const allItemTypes = ['candy', 'sticker', 'eraser', 'snack', 'pen', 'notebook', 'fruit', 
                                  'toy', 'book', 'lunch', 'stationery_set', 'electronics', 'clothing', 'sports', 'game'];
            
            const incompatibleItems = allItemTypes.filter(itemType => {
                return !this.checkItemCompatibility(itemType, denominations, digits);
            });

            if (incompatibleItems.length > 0) {
                // 顯示提示
                hintElement.style.display = 'block';
                
                // 🔧 區分位數模式和自訂金額模式的提示邏輯
                if (digits === 'custom') {
                    // 自訂金額模式：檢查金額與幣值組合相容性
                    const { customAmount } = this.state.settings;
                    if (!this.checkCustomAmountCompatibility(customAmount, denominations)) {
                        hintElement.textContent = `💡 設定的金額與幣值組合無法產生`;
                    } else {
                        hintElement.style.display = 'none';
                    }
                } else {
                    // 位數模式：檢查硬幣購買力
                    const maxDenomination = Math.max(...denominations);
                    const maxPurchasePower = 30 * maxDenomination;
                    
                    let digitRangeMin;
                    if (digits === 1) {
                        digitRangeMin = 1;
                    } else if (digits === 2) {
                        digitRangeMin = 10;
                    } else if (digits === 3) {
                        digitRangeMin = 100;
                    } else if (digits === 4) {
                        digitRangeMin = 1000;
                    }
                    
                    if (maxPurchasePower < digitRangeMin) {
                        hintElement.textContent = `💡 會產生超過30錢幣，請選擇合理的位數與幣值組合`;
                    } else {
                        hintElement.style.display = 'none';
                    }
                }
            } else {
                // 隱藏提示
                hintElement.style.display = 'none';
            }
        },

        // 開始測驗
        // 題目生成系統
        // =====================================================
        // 重構的面額優先題目生成系統
        // =====================================================
        generateQuestion() {
            console.log('🎲 generateQuestion() - 新版面額優先邏輯開始');
            
            try {
                const { digits, denominations, itemTypes, difficulty, customAmount } = this.state.settings;
                
                // 參數驗證
                console.log('🔍 驗證生成參數:', { digits, denominations, itemTypes, difficulty, customAmount });
                
                if (!denominations || denominations.length === 0) {
                    console.error('❌ 面額陣列為空或未定義');
                    return null;
                }
                
                if (!itemTypes || itemTypes.length === 0) {
                    console.error('❌ 物品類型陣列為空或未定義');
                    return null;
                }

                // 🆕 特殊處理：自訂金額模式
                if (digits === 'custom' && customAmount > 0) {
                    console.log(`🎯 自訂金額模式: 固定金錢 ${customAmount}元，變化幣值組合`);
                    return this.generateCustomAmountQuestion(customAmount, denominations, itemTypes, difficulty);
                }

                // 新邏輯流程：位數篩選物品 → 面額生成金額 → 策略決定價格
                console.log('🔄 執行新版面額優先邏輯...');

                // 1. 位數篩選：獲取嚴格對應的物品
                console.log(`📐 步驟1: 位數 ${digits} 篩選物品`);
                const availableItems = this.getAvailableItemTypes(digits);
                const availableItemTypeNames = availableItems.map(item => item.type);
                console.log(`✅ 可用物品類型: [${availableItemTypeNames.join(', ')}]`);
                
                // 過濾出用戶選擇的物品類型
                const selectedItemTypes = availableItemTypeNames.filter(itemType => itemTypes.includes(itemType));
                if (selectedItemTypes.length === 0) {
                    console.error(`❌ 沒有符合位數 ${digits} 且被選中的物品類型`);
                    return null;
                }
                console.log(`🎯 最終選中的物品類型: [${selectedItemTypes.join(', ')}]`);

                // 2. 面額生成：計算所有可能的金額
                console.log(`💰 步驟2: 面額 [${denominations.join(', ')}] 生成可能金額`);
                const possibleAmounts = this.generatePossibleAmounts(denominations, digits);
                if (possibleAmounts.length === 0) {
                    console.error('❌ 無法從選定面額生成任何有效金額');
                    return null;
                }
                console.log(`✅ 共生成 ${possibleAmounts.length} 個可能金額`);

                // 3. 策略決定：根據難度決定價格策略
                console.log(`🎮 步驟3: 難度 ${difficulty} 決定價格策略`);
                const strategy = this.getQuestionStrategy(difficulty);
                console.log(`📋 使用策略: ${strategy}`);

                // 4. 價格生成：使用策略生成物品價格（傳入物品類型以篩選有效金額）
                const itemPrice = this.generateItemPrice(possibleAmounts, strategy, digits, selectedItemTypes);
                if (!itemPrice) {
                    console.error('❌ 無法生成有效的物品價格');
                    return null;
                }
                console.log(`💰 生成物品價格: ${itemPrice}元`);

                // 5. 物品選擇：隨機選擇符合條件的物品
                console.log(`🛍️ 步驟4: 選擇物品和設定價格`);
                const selectedItem = this.selectRandomItem(selectedItemTypes, itemPrice, digits);
                if (!selectedItem) {
                    console.error('❌ 無法選擇符合價格的物品');
                    return null;
                }
                console.log(`✅ 選擇物品: ${selectedItem.name} (${selectedItem.emoji})`);

                // 6. 金錢生成：根據價格生成對應的金錢
                console.log(`💳 步驟5: 生成我的金錢`);
                const myMoney = this.generateMoneyForStrategy(itemPrice, denominations, strategy);
                if (!myMoney) {
                    console.error('❌ 無法生成我的金錢');
                    return null;
                }

                // 7. 結果計算
                const totalMoney = myMoney.reduce((sum, money) => sum + money.value, 0);
                const isAffordable = totalMoney >= itemPrice;
                
                console.log('📊 題目生成完成:', {
                    strategy,
                    itemPrice,
                    totalMoney,
                    isAffordable,
                    moneyPieces: myMoney.length,
                    denominations: denominations.join(',')
                });

                // 8. 返回題目物件
                const question = {
                    item: selectedItem,
                    itemPrice,
                    myMoney,
                    totalMoney,
                    isAffordable
                };
                
                console.log('✅ 面額優先題目生成成功');
                return question;
                
            } catch (error) {
                console.error('❌ 面額優先題目生成錯誤:', error);
                console.error('堆疊追蹤:', error.stack);
                return null;
            }
        },

        // =====================================================
        // 🆕 自訂金額模式專用函數
        // =====================================================
        generateCustomAmountQuestion(customAmount, denominations, itemTypes, difficulty) {
            console.log(`🎯 自訂金額模式題目生成: ${customAmount}元`);
            
            try {
                // 1. 物品選擇：根據自訂金額選擇可用物品類型
                console.log(`📐 步驟1: 根據金額 ${customAmount}元 選擇物品類型`);
                const availableItems = this.getAvailableItemTypesForCustomAmount(customAmount);
                const availableItemTypeNames = availableItems.map(item => item.type);
                console.log(`✅ 可用物品類型: [${availableItemTypeNames.join(', ')}]`);
                
                // 過濾出用戶選擇的物品類型
                const selectedItemTypes = availableItemTypeNames.filter(itemType => itemTypes.includes(itemType));
                if (selectedItemTypes.length === 0) {
                    console.error(`❌ 沒有符合自訂金額 ${customAmount}元 且被選中的物品類型`);
                    return null;
                }
                console.log(`🎯 最終選中的物品類型: [${selectedItemTypes.join(', ')}]`);

                // 2. 金錢固定：我的金錢固定為自訂金額，只變化幣值組合
                console.log(`💳 步驟2: 生成固定金額 ${customAmount}元 的幣值組合`);
                const myMoney = this.generateMoneyForCustomAmount(customAmount, denominations);
                if (!myMoney || myMoney.length === 0) {
                    console.error('❌ 無法為自訂金額生成幣值組合');
                    return null;
                }
                console.log(`✅ 生成 ${myMoney.length} 個硬幣，總額 ${customAmount}元`);

                // 3. 物品價格：獨立生成，可以高於、等於或低於自訂金額
                console.log(`🎮 步驟3: 生成獨立的物品價格（可高於、等於或低於 ${customAmount}元）`);
                const strategy = this.getQuestionStrategy(difficulty);
                const itemPrice = this.generateItemPriceForCustomAmount(customAmount, strategy, selectedItemTypes);
                if (!itemPrice) {
                    console.error('❌ 無法生成物品價格');
                    return null;
                }
                console.log(`💰 生成物品價格: ${itemPrice}元 (策略: ${strategy})`);

                // 4. 物品選擇：選擇符合價格的物品
                console.log(`🛍️ 步驟4: 選擇符合價格的物品`);
                const selectedItem = this.selectRandomItem(selectedItemTypes, itemPrice, 'custom');
                if (!selectedItem) {
                    console.error('❌ 無法選擇符合價格的物品');
                    return null;
                }
                console.log(`✅ 選擇物品: ${selectedItem.name} (${selectedItem.emoji})`);

                // 5. 結果計算
                const totalMoney = customAmount; // 固定為自訂金額
                const isAffordable = totalMoney >= itemPrice;
                
                console.log('📊 自訂金額題目生成完成:', {
                    strategy,
                    customAmount,
                    itemPrice,
                    totalMoney,
                    isAffordable,
                    moneyPieces: myMoney.length,
                    denominations: denominations.join(',')
                });

                // 6. 返回題目物件
                const question = {
                    item: selectedItem,
                    itemPrice,
                    myMoney,
                    totalMoney,
                    isAffordable
                };
                
                console.log('✅ 自訂金額題目生成成功');
                return question;
                
            } catch (error) {
                console.error('❌ 自訂金額題目生成錯誤:', error);
                console.error('堆疊追蹤:', error.stack);
                return null;
            }
        },

        // =====================================================
        // 新版面額優先邏輯的輔助函數
        // =====================================================
        
        // 根據難度決定題目策略
        getQuestionStrategy(difficulty) {
            switch (difficulty) {
                case 'easy':
                    // 簡單模式：50% 足夠，50% 不足
                    return Math.random() < 0.5 ? 'sufficient' : 'insufficient';
                case 'normal':
                    // 普通模式：50% 足夠，50% 不足
                    return Math.random() < 0.5 ? 'sufficient' : 'insufficient';
                case 'hard':
                    // 困難模式：70% 足夠，30% 不足（更多挑戰）
                    return Math.random() < 0.7 ? 'sufficient' : 'insufficient';
                default:
                    return 'sufficient';
            }
        },

        // 隨機選擇符合價格的物品
        selectRandomItem(itemTypes, targetPrice, digits) {
            console.log(`🎯 從物品類型 [${itemTypes.join(', ')}] 中選擇符合價格 ${targetPrice}元 的物品`);
            
            const maxPrice = digits === 'custom' ? 9999 : Math.pow(10, digits) - 1;
            const allValidItems = [];
            
            // 收集所有符合條件的物品
            itemTypes.forEach(typeKey => {
                const items = this.gameData.purchaseItems[typeKey];
                if (items && items.length > 0) {
                    items.forEach(item => {
                        // 檢查物品的價格範圍是否包含目標價格
                        const itemMinPrice = Math.max(1, item.priceRange[0]);
                        const itemMaxPrice = Math.min(maxPrice, item.priceRange[1]);
                        
                        if (targetPrice >= itemMinPrice && targetPrice <= itemMaxPrice) {
                            console.log(`✅ 找到符合物品: ${item.name} (範圍: ${itemMinPrice}-${itemMaxPrice}元)`);
                            allValidItems.push(item);
                        }
                    });
                }
            });
            
            if (allValidItems.length === 0) {
                console.error(`❌ 沒有物品的價格範圍包含 ${targetPrice}元`);
                return null;
            }
            
            // 隨機選擇一個符合的物品
            const randomIndex = Math.floor(Math.random() * allValidItems.length);
            const selectedItem = allValidItems[randomIndex];
            console.log(`🛍️ 最終選擇: ${selectedItem.name} (${selectedItem.emoji})`);
            
            return selectedItem;
        },

        // 根據策略生成對應的金錢
        generateMoneyForStrategy(itemPrice, denominations, strategy) {
            console.log(`💳 為策略 "${strategy}" 和價格 ${itemPrice}元 生成金錢`);
            
            switch (strategy) {
                case 'sufficient':
                case 'exact':
                    // 生成剛好足夠的金錢
                    return this.generateMoneyByAmount(itemPrice, denominations);
                    
                case 'insufficient':
                    // 生成不足的金錢（價格-1到價格的85%之間）
                    const maxInsufficient = Math.max(1, itemPrice - 1);
                    const minInsufficient = Math.max(0, Math.floor(itemPrice * 0.85));
                    const insufficientAmount = Math.floor(Math.random() * (maxInsufficient - minInsufficient + 1)) + minInsufficient;
                    console.log(`💸 生成不足金額: ${insufficientAmount}元 (價格: ${itemPrice}元)`);
                    
                    if (insufficientAmount <= 0) {
                        // 如果金額為0，返回空陣列表示沒錢
                        return [];
                    }
                    
                    return this.generateMoneyByAmount(insufficientAmount, denominations);
                    
                default:
                    console.error(`❌ 未知策略: ${strategy}`);
                    return null;
            }
        },

        // 新的面額優先金錢生成系統：根據確定金額生成對應面額組合
        // 🆕 修復：確保所有選定面額都會出現在題目中
        generateMoneyByAmount(targetAmount, denominations) {
            console.log(`💰 生成金額: ${targetAmount}元，使用面額: [${denominations.join(', ')}]`);
            console.log(`🎯 原則：所有選定面額必須出現在題目中`);
            
            if (targetAmount <= 0) {
                console.error('❌ 目標金額必須大於0');
                return [];
            }
            
            const result = [];
            let remainingAmount = targetAmount;
            
            // 🆕 步驟1：強制分配 - 每個面額至少使用一次
            const sortedDenominations = [...denominations].sort((a, b) => a - b); // 從小到大，避免大面額耗盡金額
            
            console.log(`🔗 步驟1: 強制每個面額至少使用一次`);
            for (const denomination of sortedDenominations) {
                if (remainingAmount >= denomination) {
                    const itemData = this.getItemData(denomination);
                    if (itemData) {
                        result.push({
                            id: `money-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            value: denomination,
                            image: this.getRandomImage(itemData)
                        });
                        remainingAmount -= denomination;
                        console.log(`✅ 強制分配 ${denomination}元，剩餘: ${remainingAmount}元`);
                    } else {
                        console.error(`❌ 找不到面額 ${denomination} 的資料`);
                        return [];
                    }
                } else {
                    console.error(`❌ 金額不足以包含所有面額，無法分配 ${denomination}元`);
                    return [];
                }
            }
            
            // 🆕 步驟2：貪婪分配剩餘金額（優先使用大面額）
            if (remainingAmount > 0) {
                console.log(`💰 步驟2: 貪婪分配剩餘 ${remainingAmount}元`);
                const reversedDenominations = [...denominations].sort((a, b) => b - a); // 從大到小
                
                for (const denomination of reversedDenominations) {
                    while (remainingAmount >= denomination) {
                        const itemData = this.getItemData(denomination);
                        if (itemData) {
                            result.push({
                                id: `money-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                value: denomination,
                                image: this.getRandomImage(itemData)
                            });
                            remainingAmount -= denomination;
                            console.log(`➕ 貪婪添加 ${denomination}元，剩餘: ${remainingAmount}元`);
                        } else {
                            console.error(`❌ 找不到面額 ${denomination} 的資料`);
                            break;
                        }
                    }
                }
            }
            
            if (remainingAmount > 0) {
                console.warn(`⚠️ 無法完全組成目標金額，剩餘 ${remainingAmount}元`);
            }
            
            const actualTotal = result.reduce((sum, money) => sum + money.value, 0);
            
            // 驗證所有面額都被使用
            const usedDenominations = [...new Set(result.map(money => money.value))].sort((a, b) => a - b);
            const expectedDenominations = [...denominations].sort((a, b) => a - b);
            const allUsed = expectedDenominations.every(denom => usedDenominations.includes(denom));
            
            console.log(`✅ 金錢生成完成:`);
            console.log(`   目標: ${targetAmount}元，實際: ${actualTotal}元，共 ${result.length} 個硬幣`);
            console.log(`   預期面額: [${expectedDenominations.join(', ')}]`);
            console.log(`   實際面額: [${usedDenominations.join(', ')}]`);
            console.log(`   全部使用: ${allUsed ? '✅ 是' : '❌ 否'}`);
            
            return result;
        },

        // =====================================================
        // 🆕 自訂金額模式專用金錢生成函數
        // =====================================================
        generateMoneyForCustomAmount(customAmount, denominations) {
            console.log(`💳 為自訂金額 ${customAmount}元 生成隨機幣值組合`);
            console.log(`🪙 可用面額: [${denominations.join(', ')}]`);
            
            // 使用動態規劃找出所有可能的組合方式
            const combinations = this.findAllCombinations(customAmount, denominations);
            
            if (combinations.length === 0) {
                console.error(`❌ 無法用面額 [${denominations.join(', ')}] 組成 ${customAmount}元`);
                return null;
            }
            
            // 隨機選擇一種組合方式
            const selectedCombination = combinations[Math.floor(Math.random() * combinations.length)];
            console.log(`🎲 選擇組合方式: ${JSON.stringify(selectedCombination)}`);
            
            // 根據選擇的組合生成實際的金錢物件
            const result = [];
            for (const [denomination, count] of Object.entries(selectedCombination)) {
                const denominationValue = parseInt(denomination);
                const itemData = this.getItemData(denominationValue);
                
                if (itemData) {
                    for (let i = 0; i < count; i++) {
                        result.push({
                            id: `money-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            value: denominationValue,
                            image: this.getRandomImage(itemData)
                        });
                    }
                    console.log(`➕ 添加 ${count} 個 ${denominationValue}元`);
                } else {
                    console.error(`❌ 找不到面額 ${denominationValue} 的資料`);
                }
            }
            
            const actualTotal = result.reduce((sum, money) => sum + money.value, 0);
            console.log(`✅ 自訂金額幣值組合生成完成: 目標 ${customAmount}元，實際 ${actualTotal}元，共 ${result.length} 個硬幣`);
            
            return result;
        },

        // 找出所有可能的硬幣組合方式（動態規劃）
        // 🆕 修復：確保所有選定面額都會出現在組合中
        findAllCombinations(amount, denominations) {
            console.log(`🧮 計算 ${amount}元 的所有可能組合方式`);
            console.log(`🎯 原則：所有面額 [${denominations.join(', ')}] 必須都被使用`);
            
            // 🆕 預檢查：確保總金額足夠包含所有面額
            const minRequired = denominations.reduce((sum, denom) => sum + denom, 0);
            if (amount < minRequired) {
                console.error(`❌ 金額 ${amount}元 不足以包含所有面額，最少需要 ${minRequired}元`);
                return [];
            }
            
            const allCombinations = [];
            
            // 🆕 修改的回溯算法：強制包含所有面額
            const backtrack = (remaining, currentCombination, startIndex) => {
                if (remaining === 0) {
                    // 檢查是否使用了所有面額
                    const usedDenominations = Object.keys(currentCombination).map(d => parseInt(d));
                    const allDenomationsUsed = denominations.every(denom => usedDenominations.includes(denom));
                    
                    if (allDenomationsUsed) {
                        // 檢查硬幣總數不超過30
                        const totalCoins = Object.values(currentCombination).reduce((sum, count) => sum + count, 0);
                        if (totalCoins <= 30) {
                            allCombinations.push({ ...currentCombination });
                            console.log(`✅ 找到有效組合: ${JSON.stringify(currentCombination)} (${totalCoins}個硬幣)`);
                        } else {
                            console.log(`⚠️ 組合超過30硬幣限制: ${totalCoins}個`);
                        }
                    } else {
                        const missingDenoms = denominations.filter(denom => !usedDenominations.includes(denom));
                        console.log(`❌ 組合缺少面額: [${missingDenoms.join(', ')}]`);
                    }
                    return;
                }
                
                if (remaining < 0) {
                    return;
                }
                
                for (let i = startIndex; i < denominations.length; i++) {
                    const denomination = denominations[i];
                    if (remaining >= denomination) {
                        // 選擇使用這個面額
                        currentCombination[denomination] = (currentCombination[denomination] || 0) + 1;
                        
                        // 繼續搜索
                        backtrack(remaining - denomination, currentCombination, i);
                        
                        // 回溯
                        currentCombination[denomination]--;
                        if (currentCombination[denomination] === 0) {
                            delete currentCombination[denomination];
                        }
                    }
                }
            };
            
            // 🆕 初始化：強制每個面額至少使用一次
            console.log(`🔗 初始化：強制分配每個面額至少一次`);
            const initialCombination = {};
            let initialRemaining = amount;
            
            // 從小到大分配，避免大面額耗盡金額
            const sortedDenoms = [...denominations].sort((a, b) => a - b);
            for (const denom of sortedDenoms) {
                initialCombination[denom] = 1;
                initialRemaining -= denom;
                console.log(`🔗 分配 1 個 ${denom}元，剩餘 ${initialRemaining}元`);
            }
            
            if (initialRemaining < 0) {
                console.error(`❌ 無法為所有面額分配至少一個硬幣`);
                return [];
            }
            
            // 從初始化狀態開始回溯搜索更多組合
            backtrack(initialRemaining, initialCombination, 0);
            
            console.log(`✅ 找到 ${allCombinations.length} 種包含所有面額的組合方式`);
            
            if (allCombinations.length <= 5) {
                console.log('所有組合詳細:', allCombinations);
            } else {
                console.log('組合範例:', allCombinations.slice(0, 3));
                console.log(`... 還有 ${allCombinations.length - 3} 種組合`);
            }
            
            // 🆕 驗證：確保每個組合都包含所有面額
            const invalidCombinations = allCombinations.filter(combo => {
                const usedDenoms = Object.keys(combo).map(d => parseInt(d));
                return !denominations.every(denom => usedDenoms.includes(denom));
            });
            
            if (invalidCombinations.length > 0) {
                console.error(`❌ 發現 ${invalidCombinations.length} 個無效組合（未包含所有面額）`);
            }
            
            return allCombinations;
        },

        // =====================================================
        // 🆕 自訂金額模式專用價格生成函數
        // =====================================================
        generateItemPriceForCustomAmount(customAmount, strategy, selectedItemTypes) {
            console.log(`💰 為自訂金額 ${customAmount}元 生成物品價格 (策略: ${strategy})`);
            
            // 獲取選定物品類型的價格範圍
            const allValidPrices = [];
            
            selectedItemTypes.forEach(typeKey => {
                const items = this.gameData.purchaseItems[typeKey];
                if (items && items.length > 0) {
                    items.forEach(item => {
                        const minPrice = Math.max(1, item.priceRange[0]);
                        const maxPrice = Math.min(9999, item.priceRange[1]);
                        
                        // 根據策略添加價格範圍
                        for (let price = minPrice; price <= maxPrice; price++) {
                            allValidPrices.push(price);
                        }
                    });
                }
            });
            
            if (allValidPrices.length === 0) {
                console.error('❌ 沒有可用的物品價格');
                return null;
            }
            
            // 移除重複價格並排序
            const uniquePrices = [...new Set(allValidPrices)].sort((a, b) => a - b);
            console.log(`📊 可用價格範圍: ${uniquePrices[0]}-${uniquePrices[uniquePrices.length - 1]}元 (共${uniquePrices.length}個價格)`);
            
            let candidatePrices = [];
            
            switch (strategy) {
                case 'sufficient':
                    // 足夠策略：價格等於或小於自訂金額
                    candidatePrices = uniquePrices.filter(price => price <= customAmount);
                    console.log(`💰 足夠策略：選擇 ≤${customAmount}元 的價格`);
                    break;
                    
                case 'insufficient':
                    // 不足策略：價格大於自訂金額
                    candidatePrices = uniquePrices.filter(price => price > customAmount);
                    console.log(`💸 不足策略：選擇 >${customAmount}元 的價格`);
                    break;
                    
                case 'exact':
                    // 精確策略：價格等於自訂金額（如果可能）
                    candidatePrices = uniquePrices.filter(price => price === customAmount);
                    if (candidatePrices.length === 0) {
                        // 沒有精確價格，退而選擇接近的價格
                        candidatePrices = uniquePrices.filter(price => Math.abs(price - customAmount) <= 2);
                        console.log(`💰 精確策略：無精確價格，選擇接近 ${customAmount}元 的價格`);
                    } else {
                        console.log(`💰 精確策略：選擇等於 ${customAmount}元 的價格`);
                    }
                    break;
                    
                default:
                    candidatePrices = uniquePrices;
                    console.log(`💰 預設策略：選擇所有可用價格`);
                    break;
            }
            
            if (candidatePrices.length === 0) {
                console.warn(`⚠️ 策略 ${strategy} 沒有合適的價格，使用隨機價格`);
                candidatePrices = uniquePrices;
            }
            
            const selectedPrice = candidatePrices[Math.floor(Math.random() * candidatePrices.length)];
            console.log(`✅ 生成物品價格: ${selectedPrice}元 (從 ${candidatePrices.length} 個候選價格中選擇)`);
            
            return selectedPrice;
        },

        // 廢棄的舊函數（保留以防止錯誤，但不再使用）
        generateSufficientMoney(targetPrice, denominations, minMultiplier = 1.0, maxMultiplier = 2.0) {
            console.warn('⚠️ generateSufficientMoney 已廢棄，請使用新的面額優先邏輯');
            // 臨時兼容，實際應該在新邏輯中處理
            const actualTotal = Math.floor(targetPrice * (minMultiplier + Math.random() * (maxMultiplier - minMultiplier)));
            return this.generateMoneyByAmount(actualTotal, denominations);
        },

        generateInsufficientMoney(targetPrice, denominations) {
            console.warn('⚠️ generateInsufficientMoney 已廢棄，請使用新的面額優先邏輯');
            // 臨時兼容，實際應該在新邏輯中處理  
            const insufficientTotal = Math.floor(targetPrice * (0.3 + Math.random() * 0.6));
            return this.generateMoneyByAmount(insufficientTotal, denominations);
        },

        // 生成指定金額的錢幣組合
        generateMoneyToAmount(totalAmount, denominations) {
            console.log(`💰 generateMoneyToAmount 目標金額: ${totalAmount}, 可用面額: [${denominations.join(', ')}]`);
            
            const availableDenominations = [...denominations].sort((a, b) => b - a);
            let remainingAmount = totalAmount;
            let result = [];
            let attempts = 0;
            const maxAttempts = 100;

            // greedy algorithm to generate money combination
            while (remainingAmount > 0 && availableDenominations.length > 0 && attempts < maxAttempts) {
                attempts++;
                
                // 找到所有可用的面額
                const usableDenominations = availableDenominations.filter(d => d <= remainingAmount);
                
                if (usableDenominations.length === 0) {
                    console.log(`⚠️ 無法完全匹配目標金額 ${totalAmount}，剩餘 ${remainingAmount}`);
                    
                    // 如果是生成不足金額的情況，且結果為空，返回空陣列是合理的（代表沒給錢）
                    if (result.length === 0 && totalAmount < Math.min(...denominations)) {
                        console.log(`💸 目標金額 ${totalAmount} 小於最小面額，返回空陣列（沒給錢）`);
                        return []; // 這是合法的不足場景
                    }
                    
                    // 其他情況返回部分結果
                    console.log(`📝 返回部分結果`);
                    break;
                }
                
                const denomination = usableDenominations[Math.floor(Math.random() * usableDenominations.length)];
                const itemData = this.getItemData(denomination);
                
                if (itemData) {
                    result.push({
                        id: `money-${Date.now()}-${Math.random()}-${attempts}`,
                        value: denomination,
                        image: this.getRandomImage(itemData)
                    });
                    remainingAmount -= denomination;
                    console.log(`➕ 添加面額 ${denomination}，剩餘金額: ${remainingAmount}`);
                } else {
                    console.error(`❌ 找不到面額 ${denomination} 的資料`);
                }
                
                // 防止無限循環
                if (result.length > 20) {
                    console.log('⚠️ 達到最大錢幣數量限制，停止生成');
                    break;
                }
            }

            const actualTotal = result.reduce((sum, money) => sum + money.value, 0);
            console.log(`✅ 生成完成: 目標 ${totalAmount}，實際 ${actualTotal}，錢幣數量 ${result.length}`);
            
            return result;
        },

        startQuiz() {
            console.log('🎮 startQuiz() 開始測驗');
            console.log('📋 當前遊戲設定:', JSON.stringify(this.state.settings, null, 2));
            
            // 驗證設定完整性
            const { digits, denominations, itemTypes, difficulty, mode } = this.state.settings;
            const validationChecks = {
                digits: { 
                    value: digits, 
                    valid: !!digits && (
                        (digits >= 1 && digits <= 4) || 
                        (digits === 'custom' && this.state.settings.customAmount > 0)
                    ) 
                },
                denominations: { value: denominations, valid: Array.isArray(denominations) && denominations.length > 0 },
                itemTypes: { value: itemTypes, valid: Array.isArray(itemTypes) && itemTypes.length > 0 },
                difficulty: { value: difficulty, valid: ['easy', 'normal', 'hard'].includes(difficulty) },
                mode: { value: mode, valid: ['repeated', 'single'].includes(mode) }
            };
            
            console.log('🔍 設定驗證檢查:', validationChecks);
            
            const validationFailed = Object.entries(validationChecks).find(([key, check]) => !check.valid);
            if (validationFailed) {
                console.error(`❌ 設定驗證失敗: ${validationFailed[0]}`, validationFailed[1]);
                this.showGenerationErrorMessage();
                this.showSettings();
                return;
            }
            
            this.state.quiz = {
                currentQuestion: 1,
                totalQuestions: this.state.settings.questionCount,
                score: 0,
                questions: [],
                startTime: Date.now(),
                attempts: 0
            };
            
            console.log('🎯 測驗狀態初始化:', this.state.quiz);

            console.log('📝 開始生成題目...');
            const generationStart = performance.now();
            
            // 生成所有題目
            for (let i = 0; i < this.state.quiz.totalQuestions; i++) {
                console.log(`🔄 正在生成第 ${i+1} 題...`);
                const questionStart = performance.now();
                
                const question = this.generateQuestion();
                const questionTime = performance.now() - questionStart;
                
                if (question) {
                    this.state.quiz.questions.push(question);
                    console.log(`✅ 第 ${i+1} 題生成成功 (耗時: ${questionTime.toFixed(2)}ms):`, {
                        item: question.item.name,
                        price: question.itemPrice,
                        totalMoney: question.totalMoney,
                        affordable: question.isAffordable,
                        moneyCount: question.myMoney.length
                    });
                } else {
                    console.error(`❌ 第 ${i+1} 題生成失敗`);
                    this.showGenerationErrorMessage();
                    this.showSettings();
                    return;
                }
            }
            
            const totalGenerationTime = performance.now() - generationStart;
            console.log(`📊 題目生成完成統計:`, {
                totalQuestions: this.state.quiz.questions.length,
                totalTime: `${totalGenerationTime.toFixed(2)}ms`,
                averageTime: `${(totalGenerationTime / this.state.quiz.totalQuestions).toFixed(2)}ms`,
                difficulty: difficulty,
                settings: { digits, denominations: denominations.length, itemTypes: itemTypes.length }
            });

            console.log('🚀 準備載入第一題...');
            this.loadQuestion(0);
        },

        // 載入題目
        loadQuestion(questionIndex) {
            console.log(`📖 loadQuestion(${questionIndex}) 開始載入題目`);
            console.log(`📊 載入進度: ${questionIndex + 1}/${this.state.quiz.questions.length}`);
            
            if (questionIndex >= this.state.quiz.questions.length) {
                console.log('🏁 所有題目已完成，準備顯示結果');
                console.log(`📈 最終統計: 總題數 ${this.state.quiz.questions.length}, 當前分數 ${this.state.quiz.score}`);
                this.showResults();
                return;
            }

            this.state.loadingQuestion = true;
            this.state.quiz.currentQuestion = questionIndex + 1;

            const question = this.state.quiz.questions[questionIndex];
            const { difficulty } = this.state.settings;
            
            console.log(`🎯 載入第 ${questionIndex + 1} 題, 難度: ${difficulty}`);
            console.log(`📝 題目詳情:`, {
                questionIndex: questionIndex + 1,
                item: question.item.name,
                emoji: question.item.emoji,
                price: question.itemPrice,
                myTotalMoney: question.totalMoney,
                moneyPieces: question.myMoney.length,
                isAffordable: question.isAffordable,
                difficulty: difficulty
            });

            // 先根據難度渲染對應模式
            const renderStart = performance.now();
            try {
                switch (difficulty) {
                    case 'easy':
                        console.log('🟢 開始渲染簡單模式');
                        this.renderEasyMode(question);
                        break;
                    case 'normal':
                        console.log('🟡 開始渲染普通模式');
                        this.renderNormalMode(question);
                        break;
                    case 'hard':
                        console.log('🔴 開始渲染困難模式');
                        this.renderHardMode(question);
                        break;
                    default:
                        console.error(`❌ 未知的難度模式: ${difficulty}`);
                        return;
                }
                
                const renderTime = performance.now() - renderStart;
                console.log(`✅ 渲染完成 (耗時: ${renderTime.toFixed(2)}ms)`);
                
                // 驗證DOM元素是否正確創建
                const verification = this.verifyDOMElements();
                console.log('🔍 DOM元素驗證結果:', verification);
                
            } catch (error) {
                console.error('❌ 渲染失敗:', error);
                console.error('堆疊追蹤:', error.stack);
                return;
            }
            
            this.state.loadingQuestion = false;
            console.log('📱 載入狀態已更新為 false');

            // 然後顯示題目指令彈窗
            setTimeout(() => {
                console.log('💬 準備顯示指令彈窗');
                this.showInstructionModal(question);
            }, 100);
        },

        // =====================================================
        // 遊戲模式渲染系統（分離架構）
        // =====================================================
        
        // 簡單模式：錢一定夠，引導學生拿出正確金額
        renderEasyMode(question) {
            const gameContainer = document.getElementById('app');
            const { item, itemPrice, myMoney, totalMoney } = question;

            // 生成我的錢區域HTML
            const myMoneyHTML = myMoney.map(money => {
                const isBanknote = money.value >= 100;
                const itemClass = isBanknote ? 'money-item banknote source-money unit5-easy-source-item' : 'money-item coin source-money unit5-easy-source-item';
                return `
                    <div class="${itemClass}" draggable="true" 
                         data-value="${money.value}" id="${money.id}">
                        <img src="${money.image}" alt="${money.value}元" draggable="false" />
                        <div class="money-value">${money.value}元</div>
                    </div>
                `;
            }).join('');

            this.state.gameState = {
                question: question,
                currentTotal: 0,
                questionAnswered: false,
                selectedMoney: []
            };

            gameContainer.innerHTML = `
                <style>${this.getCommonCSS()}${this.getEasyModeCSS()}</style>
                <div class="unit5-easy-layout">
                    <div class="title-bar">
                        <div class="title-bar-left">第 ${this.state.quiz.currentQuestion} / ${this.state.quiz.totalQuestions} 題</div>
                        <div class="title-bar-center"><h2 style="margin: 0; color: inherit;">${item.name} <span class="large-emoji">${item.emoji}</span> 價格: ${itemPrice} 元</h2></div>
                        <div class="title-bar-right">
                            分數: ${this.state.quiz.score} 分
                            <button id="back-to-menu-btn" class="back-to-menu-btn">返回主選單</button>
                        </div>
                    </div>
                    
                    <div class="my-money-section unit5-easy-money-section">
                        <h2 class="section-title unit5-easy-section-title">我的金錢區</h2>
                        <div id="money-source-area" class="money-source-container unit5-easy-money-source">
                            ${myMoneyHTML}
                        </div>
                    </div>
                    
                    <div class="exchange-section unit5-easy-exchange-section">
                        <h2 class="section-title unit5-easy-section-title">🛒 兌換區</h2>
                        <div id="payment-zone-area" class="drop-zone-container unit5-easy-drop-zone">
                            <div class="payment-hint">把錢拖到這裡來兌換</div>
                        </div>
                        <div class="current-total-display unit5-easy-total-display">
                            目前總額: <span id="current-payment">0</span> 元
                        </div>
                    </div>
                </div>
            `;

            this.setupEasyModeEventListeners(question);
        },

        // 普通模式：需要判斷錢夠不夠，然後執行對應動作
        renderNormalMode(question) {
            const gameContainer = document.getElementById('app');
            const { item, itemPrice, myMoney, totalMoney, isAffordable } = question;

            const myMoneyHTML = myMoney.map(money => {
                const isBanknote = money.value >= 100;
                const itemClass = isBanknote ? 'money-item banknote source-money unit5-normal-source-item' : 'money-item coin source-money unit5-normal-source-item';
                return `
                    <div class="${itemClass}" draggable="true" 
                         data-value="${money.value}" id="${money.id}">
                        <img src="${money.image}" alt="${money.value}元" draggable="false" />
                        <div class="money-value">${money.value}元</div>
                    </div>
                `;
            }).join('');

            this.state.gameState = {
                question: question,
                currentTotal: 0,
                questionAnswered: false,
                correctAnswer: isAffordable
            };

            gameContainer.innerHTML = `
                <style>${this.getCommonCSS()}${this.getNormalModeCSS()}</style>
                <div class="unit5-normal-layout">
                    <div class="title-bar">
                        <div class="title-bar-left">第 ${this.state.quiz.currentQuestion} / ${this.state.quiz.totalQuestions} 題</div>
                        <div class="title-bar-center"><h2 style="margin: 0; color: inherit;">${item.name} <span class="large-emoji">${item.emoji}</span> 價格: ${itemPrice} 元</h2></div>
                        <div class="title-bar-right">
                            分數: ${this.state.quiz.score} 分
                            <button id="back-to-menu-btn" class="back-to-menu-btn">返回主選單</button>
                        </div>
                    </div>
                    
                    <div class="my-money-section unit5-normal-money-section">
                        <h2 class="section-title unit5-normal-section-title">我的金錢區</h2>
                        <div id="money-source-area" class="money-source-container unit5-normal-money-source">
                            ${myMoneyHTML}
                        </div>
                    </div>
                    
                    <div class="exchange-section unit5-normal-exchange-section">
                        <h2 class="section-title unit5-normal-section-title">
                            🛒 兌換區 
                            <span class="current-total-display-inline unit5-normal-total-display-inline">
                                目前總額: <span id="current-payment">0</span> 元
                            </span>
                        </h2>
                        <div id="payment-zone-area" class="drop-zone-container unit5-normal-drop-zone">
                            <div class="payment-hint">把錢拖到這裡來兌換</div>
                        </div>
                        <div class="judgment-buttons">
                            <button id="enough-btn" class="judgment-btn enough-btn">💰 錢夠，可以買</button>
                            <button id="not-enough-btn" class="judgment-btn not-enough-btn">❌錢不夠，不能買</button>
                        </div>
                        <div class="unit5-normal-hint">💡 算一算，你的錢夠不夠買</div>
                    </div>
                </div>
            `;

            this.setupNormalModeEventListeners(question);
        },

        // 困難模式：判斷錢夠不夠，無拖拽提示
        renderHardMode(question) {
            const gameContainer = document.getElementById('app');
            const { item, itemPrice, myMoney, totalMoney, isAffordable } = question;

            const myMoneyHTML = myMoney.map(money => {
                const isBanknote = money.value >= 100;
                const itemClass = isBanknote ? 'money-item banknote source-money unit5-hard-source-item' : 'money-item coin source-money unit5-hard-source-item';
                return `
                    <div class="${itemClass}" draggable="true"
                         data-value="${money.value}" id="${money.id}">
                        <img src="${money.image}" alt="${money.value}元" />
                        <div class="money-value">${money.value}元</div>
                    </div>
                `;
            }).join('');

            this.state.gameState = {
                question: question,
                currentTotal: totalMoney,
                questionAnswered: false,
                correctAnswer: isAffordable
            };

            gameContainer.innerHTML = `
                <style>${this.getCommonCSS()}${this.getHardModeCSS()}</style>
                <div class="unit5-hard-layout">
                    <div class="title-bar">
                        <div class="title-bar-left">第 ${this.state.quiz.currentQuestion} / ${this.state.quiz.totalQuestions} 題</div>
                        <div class="title-bar-center"><h2 style="margin: 0; color: inherit;">${item.name} <span class="large-emoji">${item.emoji}</span> 價格: ${itemPrice} 元</h2></div>
                        <div class="title-bar-right">
                            分數: ${this.state.quiz.score} 分
                            <button id="back-to-menu-btn" class="back-to-menu-btn">返回主選單</button>
                        </div>
                    </div>
                    
                    <div class="my-money-section unit5-hard-money-section">
                        <h2 class="section-title unit5-hard-section-title">我的金錢區</h2>
                        <div id="money-source-area" class="money-source-container unit5-hard-money-source">
                            ${myMoneyHTML}
                        </div>
                    </div>
                    
                    <div class="exchange-section unit5-hard-exchange-section">
                        <h2 class="section-title unit5-hard-section-title">
                            🛒 兌換區 
                            <span class="current-total-display-inline unit5-hard-total-display-inline" id="total-hint-toggle">
                                <span id="hint-text">💡 提示</span>
                                <span id="total-amount-text" style="display: none;">目前總額: <span id="current-payment">0</span> 元</span>
                            </span>
                        </h2>
                        <div id="payment-zone-area" class="drop-zone-container unit5-hard-drop-zone">
                            <div class="payment-hint">把錢拖到這裡來兌換</div>
                        </div>
                        <div class="judgment-buttons">
                            <button id="enough-btn" class="judgment-btn enough-btn">💰 錢夠，可以買</button>
                            <button id="not-enough-btn" class="judgment-btn not-enough-btn">❌ 錢不夠，不能買</button>
                        </div>
                        <div class="unit5-hard-challenge-hint">💪 挑戰模式：沒有提示，靠實力取勝！</div>
                    </div>
                </div>
            `;

            this.setupHardModeEventListeners(question);
        },

        // 指令彈窗
        showInstructionModal(question) {
            const { item, itemPrice } = question;
            const { difficulty } = this.state.settings;
            
            let instructionText = '';
            switch (difficulty) {
                case 'easy':
                    instructionText = `算一算，你的錢夠不夠買${item.name}`;
                    break;
                case 'normal':
                case 'hard':
                    instructionText = `想一想，你的錢夠不夠買${item.name}，它要${itemPrice}元`;
                    break;
            }

            // 創建彈窗（參考unit4）
            const modalOverlay = document.createElement('div');
            modalOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0, 0, 0, 0.75);
                display: flex; align-items: center; justify-content: center;
                z-index: 2000; opacity: 0; transition: opacity 0.3s;
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: linear-gradient(135deg, #34495e, #2c3e50);
                padding: 40px 50px; border-radius: 15px; text-align: center;
                color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                transform: scale(0.8); transition: transform 0.3s;
            `;

            modalContent.innerHTML = `
                <h2 style="font-size: 2.2em; margin: 0 0 20px 0; color: #f1c40f;">購買的物品</h2>
                <div style="font-size: 1.5em; margin: 20px 0; display: flex; flex-direction: column; align-items: center;">
                    ${this.getSmallItemDisplay(item)}
                    <div style="font-weight: bold;">${item.name} - ${itemPrice}元</div>
                </div>
            `;

            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);

            // 語音播報並關閉彈窗
            this.speech.speak(instructionText, {
                callback: () => {
                    setTimeout(() => {
                        modalOverlay.style.opacity = '0';
                        setTimeout(() => {
                            if (document.body.contains(modalOverlay)) {
                                document.body.removeChild(modalOverlay);
                            }
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

        // 下一題
        nextQuestion() {
            console.log('➡️ nextQuestion() 準備載入下一題');
            
            if (this.state.loadingQuestion) {
                console.log('⏳ 題目載入中，忽略下一題請求');
                return;
            }
            
            const currentIndex = this.state.quiz.currentQuestion - 1;
            const nextIndex = this.state.quiz.currentQuestion;
            
            console.log('📋 下一題準備:', {
                currentQuestionNumber: this.state.quiz.currentQuestion,
                currentIndex,
                nextIndex,
                totalQuestions: this.state.quiz.totalQuestions,
                score: this.state.quiz.score,
                attempts: this.state.quiz.attempts
            });
            
            // 檢查是否還有更多題目
            if (nextIndex >= this.state.quiz.questions.length) {
                console.log('🏁 已到達最後一題，準備顯示結果');
                this.showResults();
                return;
            }
            
            console.log(`🔄 載入第 ${nextIndex + 1} 題...`);
            this.loadQuestion(nextIndex);
        },

        // 顯示訊息
        showMessage(text, type, callback = null) {
            const message = document.createElement('div');
            
            // 添加emoji圖標
            const emoji = type === 'success' ? '✅' : '❌';
            const messageContent = document.createElement('div');
            messageContent.innerHTML = `
                <div style="font-size: 2em; margin-bottom: 10px;">${emoji}</div>
                <div>${text}</div>
            `;
            
            message.appendChild(messageContent);
            message.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: ${type === 'success' ? 
                    'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)' : 
                    'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'};
                color: white; 
                padding: 30px; 
                border-radius: 20px;
                font-size: 1.3em; 
                z-index: 1000; 
                box-shadow: 0 8px 25px rgba(0,0,0,0.4);
                text-align: center;
                font-weight: bold;
                min-width: 300px;
                border: 3px solid ${type === 'success' ? '#27ae60' : '#c0392b'};
                animation: messageSlideIn 0.3s ease-out;
            `;
            
            // 添加動畫樣式
            if (!document.querySelector('#message-animation-styles')) {
                const style = document.createElement('style');
                style.id = 'message-animation-styles';
                style.textContent = `
                    @keyframes messageSlideIn {
                        from {
                            opacity: 0;
                            transform: translate(-50%, -50%) scale(0.8);
                        }
                        to {
                            opacity: 1;
                            transform: translate(-50%, -50%) scale(1);
                        }
                    }
                    @keyframes messageSlideOut {
                        from {
                            opacity: 1;
                            transform: translate(-50%, -50%) scale(1);
                        }
                        to {
                            opacity: 0;
                            transform: translate(-50%, -50%) scale(0.8);
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(message);
            
            // 如果有callback，使用callback來控制消失時機，否則使用默認2秒
            if (callback) {
                callback(() => {
                    message.style.animation = 'messageSlideOut 0.3s ease-in';
                    setTimeout(() => {
                        if (message.parentNode) {
                            document.body.removeChild(message);
                        }
                    }, 300);
                });
            } else {
                setTimeout(() => {
                    message.style.animation = 'messageSlideOut 0.3s ease-in';
                    setTimeout(() => {
                        if (message.parentNode) {
                            document.body.removeChild(message);
                        }
                    }, 300);
                }, 2000);
            }
        },

        // 顯示結果（參考unit4）
        showResults() {
            const { score, totalQuestions } = this.state.quiz;
            const percentage = Math.round((score / 10 / totalQuestions) * 100);
            
            // 全屏煙火 + 結果視窗 + 語音播報
            this.startFullscreenFireworks(() => {
                this.displayResultsWindow();
                setTimeout(() => {
                    this.speakResults(score, totalQuestions, percentage);
                }, 1000);
            });
        },

        // 全屏煙火動畫（繼承unit4）
        startFullscreenFireworks(callback) {
            console.log('開始全屏煙火動畫');
            
            const gameContainer = document.getElementById('app');
            gameContainer.innerHTML = '';
            
            const canvas = document.createElement('canvas');
            canvas.id = 'fullscreen-fireworks-canvas';
            canvas.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                z-index: 9999; background: linear-gradient(135deg, #1e3c72, #2a5298, #1a1a2e);
                pointer-events: none;
            `;
            document.body.appendChild(canvas);
            
            this.audio.playSuccessSound();
            
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const fireworks = [];
            let animationId;
            
            class Firework {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                    this.particles = [];
                    this.hue = Math.random() * 360;
                    this.createParticles();
                }
                
                createParticles() {
                    for (let i = 0; i < 50; i++) {
                        this.particles.push(new Particle(this.x, this.y, this.hue));
                    }
                }
                
                update() {
                    this.particles.forEach((particle, index) => {
                        particle.update();
                        if (particle.alpha <= 0) {
                            this.particles.splice(index, 1);
                        }
                    });
                }
                
                draw(ctx) {
                    this.particles.forEach(particle => particle.draw(ctx));
                }
            }
            
            class Particle {
                constructor(x, y, hue) {
                    this.x = x;
                    this.y = y;
                    this.vx = (Math.random() - 0.5) * 8;
                    this.vy = (Math.random() - 0.5) * 8;
                    this.alpha = 1;
                    this.decay = Math.random() * 0.03 + 0.01;
                    this.hue = hue + (Math.random() - 0.5) * 30;
                    this.size = Math.random() * 3 + 1;
                }
                
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.vy += 0.1;
                    this.alpha -= this.decay;
                }
                
                draw(ctx) {
                    ctx.save();
                    ctx.globalAlpha = this.alpha;
                    ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
            
            function animate() {
                ctx.fillStyle = 'rgba(30, 60, 114, 0.1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                if (Math.random() < 0.3) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height * 0.6;
                    fireworks.push(new Firework(x, y));
                }
                
                fireworks.forEach((firework, index) => {
                    firework.update();
                    firework.draw(ctx);
                    
                    if (firework.particles.length === 0) {
                        fireworks.splice(index, 1);
                    }
                });
                
                animationId = requestAnimationFrame(animate);
            }
            
            animate();
            
            setTimeout(() => {
                canvas.style.transition = 'opacity 1s';
                canvas.style.opacity = '0';
                
                setTimeout(() => {
                    cancelAnimationFrame(animationId);
                    document.body.removeChild(canvas);
                    if (callback) callback();
                }, 1000);
            }, 3000);
        },

        // 顯示結果視窗
        displayResultsWindow() {
            const gameContainer = document.getElementById('app');
            const { score, totalQuestions, startTime } = this.state.quiz;
            const endTime = Date.now();
            const totalTime = Math.round((endTime - startTime) / 1000);
            const minutes = Math.floor(totalTime / 60);
            const seconds = totalTime % 60;
            
            const correctAnswers = score / 10;
            const percentage = Math.round((correctAnswers / totalQuestions) * 100);
            
            let performanceMessage = '';
            let performanceIcon = '';
            if (percentage >= 90) {
                performanceMessage = '表現優異！';
                performanceIcon = '🏆';
            } else if (percentage >= 70) {
                performanceMessage = '表現良好！';
                performanceIcon = '👍';
            } else if (percentage >= 50) {
                performanceMessage = '還需努力！';
                performanceIcon = '💪';
            } else {
                performanceMessage = '多加練習！';
                performanceIcon = '📚';
            }

            gameContainer.innerHTML = `
                <div class="results-screen">
                    <div class="results-header">
                        <div class="trophy-icon">${performanceIcon}</div>
                        <h1 class="results-title">🎉 測驗結束 🎉</h1>
                        <div class="performance-badge">${performanceMessage}</div>
                    </div>
                    
                    <div class="results-container">
                        <div class="results-grid">
                            <div class="result-card">
                                <div class="result-icon">✅</div>
                                <div class="result-label">答對題數</div>
                                <div class="result-value">${correctAnswers} / ${totalQuestions}</div>
                            </div>
                            <div class="result-card">
                                <div class="result-icon">⭐</div>
                                <div class="result-label">總分</div>
                                <div class="result-value">${score} 分</div>
                            </div>
                            <div class="result-card">
                                <div class="result-icon">⏰</div>
                                <div class="result-label">花費時間</div>
                                <div class="result-value">${minutes}分${seconds}秒</div>
                            </div>
                        </div>
                        
                        <div class="result-buttons">
                            <button class="play-again-btn" onclick="location.reload()">
                                <span class="btn-icon">🔄</span>
                                <span class="btn-text">再玩一次</span>
                            </button>
                            <button class="main-menu-btn" onclick="window.location.href='index.html'">
                                <span class="btn-icon">🏠</span>
                                <span class="btn-text">返回主選單</span>
                            </button>
                        </div>
                    </div>
                </div>
                <style>
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes celebrate { 0% { transform: scale(0.8) rotate(-10deg); opacity: 0; } 50% { transform: scale(1.1) rotate(5deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
                    @keyframes bounce { 0%, 20%, 60%, 100% { transform: translateY(0); } 40% { transform: translateY(-20px); } 80% { transform: translateY(-10px); } }
                    @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(52, 152, 219, 0.4); } 50% { box-shadow: 0 0 30px rgba(52, 152, 219, 0.8); } }
                    
                    .results-screen { position: relative; text-align: center; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; margin: 20px auto; max-width: 700px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); animation: celebrate 1s ease-out, fadeIn 1s ease-out; overflow: hidden; }
                    .results-screen::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="stars" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.3)"/></pattern></defs><rect width="100" height="100" fill="url(%23stars)"/></svg>'); opacity: 0.3; pointer-events: none; }
                    .results-header { position: relative; z-index: 2; margin-bottom: 30px; }
                    .trophy-icon { font-size: 4em; margin-bottom: 10px; animation: bounce 2s infinite; }
                    .results-title { font-size: 2.5em; color: #fff; margin: 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); font-weight: bold; }
                    .performance-badge { display: inline-block; background: linear-gradient(45deg, #f39c12, #e67e22); color: white; padding: 12px 30px; border-radius: 25px; font-size: 1.3em; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); box-shadow: 0 4px 15px rgba(0,0,0,0.2); animation: glow 2s ease-in-out infinite; }
                    .results-container { position: relative; z-index: 2; background: rgba(255,255,255,0.95); padding: 30px; border-radius: 15px; margin-top: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
                    .results-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                    .result-card { background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.3s ease, box-shadow 0.3s ease; border: 2px solid transparent; }
                    .result-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); border-color: #3498db; }
                    .result-icon { font-size: 2em; margin-bottom: 10px; }
                    .result-label { font-size: 1em; color: #6c757d; margin-bottom: 8px; font-weight: 500; }
                    .result-value { font-size: 1.6em; font-weight: bold; color: #2c3e50; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
                    .result-buttons { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
                    .play-again-btn, .main-menu-btn { display: flex; align-items: center; gap: 10px; padding: 15px 30px; border: none; border-radius: 25px; font-size: 1.1em; font-weight: bold; cursor: pointer; transition: all 0.3s ease; text-decoration: none; min-width: 160px; justify-content: center; }
                    .play-again-btn { background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4); }
                    .play-again-btn:hover { background: linear-gradient(135deg, #2ecc71, #27ae60); box-shadow: 0 6px 20px rgba(46, 204, 113, 0.6); transform: translateY(-2px); }
                    .main-menu-btn { background: linear-gradient(135deg, #3498db, #2980b9); color: white; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4); }
                    .main-menu-btn:hover { background: linear-gradient(135deg, #2980b9, #3498db); box-shadow: 0 6px 20px rgba(52, 152, 219, 0.6); transform: translateY(-2px); }
                    .btn-icon { font-size: 1.2em; }
                    .btn-text { font-family: inherit; }
                    
                    @media (max-width: 600px) {
                        .results-screen { margin: 10px; padding: 20px; }
                        .results-title { font-size: 2em; }
                        .results-grid { grid-template-columns: 1fr; gap: 15px; }
                        .result-buttons { flex-direction: column; align-items: center; }
                        .play-again-btn, .main-menu-btn { width: 100%; max-width: 250px; }
                    }
                </style>
            `;
        },

        // 語音播報結果
        speakResults(score, totalQuestions, percentage) {
            const correctAnswers = score / 10;
            let performanceText = '';
            
            if (percentage >= 90) {
                performanceText = '你的表現優異';
            } else if (percentage >= 70) {
                performanceText = '你的表現良好';
            } else if (percentage >= 50) {
                performanceText = '你還需努力';
            } else {
                performanceText = '請你多加練習';
            }
            
            const speechText = `恭喜你完成全部測驗，總共答對${correctAnswers}題，獲得${score}分，${performanceText}`;
            this.speech.speak(speechText, { interrupt: true });
        },

        // =====================================================
        // 錯誤處理和工具函數
        // =====================================================
        
        showGenerationErrorMessage() {
            const modalOverlay = document.createElement('div');
            modalOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0, 0, 0, 0.75);
                display: flex; align-items: center; justify-content: center;
                z-index: 2000; opacity: 0; transition: opacity 0.3s;
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                padding: 40px 50px; border-radius: 15px; text-align: center;
                color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                transform: scale(0.8); transition: transform 0.3s;
                border: 2px solid #ff6b6b; max-width: 500px;
            `;

            modalContent.innerHTML = `
                <h2 style="font-size: 2.2em; margin: 0 0 20px 0; color: #fff;">⚠️ 設定有問題</h2>
                <p style="font-size: 1.3em; margin: 0 0 20px 0; line-height: 1.5;">無法生成足夠的題目！<br>請嘗試以下調整：</p>
                <ul style="text-align: left; font-size: 1.1em; line-height: 1.6; margin: 0 0 20px 0;">
                    <li>選擇更多的錢幣面額</li>
                    <li>選擇更多的物品類型</li>
                    <li>調整價格位數設定</li>
                </ul>
                <p style="font-size: 1.1em; margin: 0; opacity: 0.9;">點擊任何地方重新設定</p>
            `;

            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);

            this.speech.speak('設定有問題，無法生成足夠的題目，請重新調整設定');

            const closeModal = () => {
                modalOverlay.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(modalOverlay)) {
                        document.body.removeChild(modalOverlay);
                    }
                }, 300);
            };

            modalOverlay.addEventListener('click', closeModal);
            setTimeout(() => {
                modalOverlay.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }, 10);

            setTimeout(closeModal, 5000);
        },


        // 工具函數（繼承unit4）
        getRandomImage(itemData) {
            return Math.random() < 0.5 ? itemData.images.front : itemData.images.back;
        },

        getItemData(value) {
            return this.gameData.allItems.find(item => item.value === value);
        },

        // 獲取物品圖片或emoji替代方案
        getItemDisplay(item) {
            return `
                <div class="item-display" 
                     style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; 
                            background: rgba(255,255,255,0.1); border-radius: 8px; font-size: 3em;">
                    <div class="item-emoji" title="${item.name}">${item.emoji}</div>
                </div>
            `;
        },

        // 獲取小尺寸物品圖片或emoji替代方案（用於指令彈窗）
        getSmallItemDisplay(item) {
            return `
                <div class="small-item-display" 
                     style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; 
                            background: rgba(255,255,255,0.1); border-radius: 8px; font-size: 2.5em; margin-bottom: 15px;">
                    <div class="small-item-emoji" title="${item.name}">${item.emoji}</div>
                </div>
            `;
        },




        // 事件監聽器設定
        setupEasyModeEventListeners(question) {
            // 簡單模式事件監聽器
            const backBtn = document.getElementById('back-to-menu-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => this.showSettings());
            }
            
            // 設置拖放功能
            this.setupDragAndDrop();
        },

        setupNormalModeEventListeners(question) {
            // 普通模式事件監聽器
            const backBtn = document.getElementById('back-to-menu-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => this.showSettings());
            }
            
            const enoughBtn = document.getElementById('enough-btn');
            const notEnoughBtn = document.getElementById('not-enough-btn');
            
            if (enoughBtn) {
                enoughBtn.addEventListener('click', () => this.handleJudgment(true, question));
            }
            if (notEnoughBtn) {
                notEnoughBtn.addEventListener('click', () => this.handleJudgment(false, question));
            }
            
            // 設置拖放功能
            this.setupDragAndDrop();
        },

        setupHardModeEventListeners(question) {
            // 困難模式事件監聽器
            const backBtn = document.getElementById('back-to-menu-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => this.showSettings());
            }
            
            const enoughBtn = document.getElementById('enough-btn');
            const notEnoughBtn = document.getElementById('not-enough-btn');
            
            if (enoughBtn) {
                enoughBtn.addEventListener('click', () => this.handleJudgment(true, question));
            }
            if (notEnoughBtn) {
                notEnoughBtn.addEventListener('click', () => this.handleJudgment(false, question));
            }
            
            // 🆕 困難模式總額提示按鈕事件
            const totalHintToggle = document.getElementById('total-hint-toggle');
            if (totalHintToggle) {
                let isShowingTotal = false;
                let hideTimer = null; // 用於存儲隱藏計時器
                
                totalHintToggle.addEventListener('click', () => {
                    const hintText = document.getElementById('hint-text');
                    const totalAmountText = document.getElementById('total-amount-text');
                    
                    if (hintText && totalAmountText) {
                        if (isShowingTotal) {
                            // 手動點擊切換回提示
                            this.hideTotal(hintText, totalAmountText);
                            isShowingTotal = false;
                            console.log('🔒 困難模式：手動隱藏總額，顯示提示');
                            
                            // 清除自動隱藏計時器
                            if (hideTimer) {
                                clearTimeout(hideTimer);
                                hideTimer = null;
                            }
                        } else {
                            // 顯示總額
                            hintText.style.display = 'none';
                            totalAmountText.style.display = 'inline';
                            isShowingTotal = true;
                            console.log('👁️ 困難模式：顯示總額，3秒後自動隱藏');
                            
                            // 🆕 設置3秒自動隱藏計時器
                            hideTimer = setTimeout(() => {
                                this.hideTotal(hintText, totalAmountText);
                                isShowingTotal = false;
                                hideTimer = null;
                                console.log('⏰ 困難模式：3秒時間到，自動隱藏總額');
                            }, 3000);
                        }
                        
                        // 播放點擊音效
                        this.audio.playClickSound();
                    }
                });
                
                console.log('✅ 困難模式總額提示按鈕事件已設置');
            }
            
            // 困難模式也支援拖放功能
            this.setupDragAndDrop();
        },

        // 🆕 困難模式隱藏總額的輔助函數
        hideTotal(hintText, totalAmountText) {
            if (hintText && totalAmountText) {
                hintText.style.display = 'inline';
                totalAmountText.style.display = 'none';
            }
        },

        // 設置拖放功能
        setupDragAndDrop() {
            // 使用 setTimeout 確保 DOM 元素已完全渲染
            setTimeout(() => {
                console.log('🔧 開始設置拖放功能...');
                
                // 🔧 [新增] 設置點擊事件處理
                this.setupClickEventListeners();
                
                // 設置觸控拖拽支援
                this.setupTouchDragSupport();
                
                // 設置金錢拖曳事件
                const moneyItems = document.querySelectorAll('.money-item[draggable="true"]');
                console.log(`💰 找到 ${moneyItems.length} 個可拖曳的金錢項目`);
                
                moneyItems.forEach((item, index) => {
                    console.log(`🎯 設置第 ${index + 1} 個金錢項目拖曳事件:`, item.dataset.value);
                    
                    item.addEventListener('dragstart', (e) => {
                        // 確保獲取到正確的金錢項目元素
                        const moneyItem = e.target.closest('.money-item');
                        if (moneyItem) {
                            console.log('🎯 開始拖曳金錢:', moneyItem.dataset.value);
                            e.dataTransfer.setData('text/plain', moneyItem.id);
                            e.dataTransfer.effectAllowed = 'move';
                            moneyItem.style.opacity = '0.5';
                        } else {
                            console.error('❌ 找不到金錢項目元素');
                            e.preventDefault();
                        }
                    });
                    
                    item.addEventListener('dragend', (e) => {
                        const moneyItem = e.target.closest('.money-item');
                        if (moneyItem) {
                            moneyItem.style.opacity = '1';
                        }
                    });
                });
                
                // 設置兌換區放置事件
                const dropZone = document.getElementById('payment-zone-area');
                console.log('🛒 兌換區元素:', dropZone ? '找到' : '未找到');
                
                if (dropZone) {
                    console.log('🔧 設置兌換區拖放事件...');
                    
                    dropZone.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        dropZone.style.backgroundColor = '#e8f5e8';
                        dropZone.style.borderColor = '#4CAF50';
                        console.log('🎯 金錢正在兌換區上方');
                    });
                    
                    dropZone.addEventListener('dragleave', (e) => {
                        if (!dropZone.contains(e.relatedTarget)) {
                            dropZone.style.backgroundColor = '';
                            dropZone.style.borderColor = '';
                            console.log('🎯 金錢離開兌換區');
                        }
                    });
                    
                    dropZone.addEventListener('drop', (e) => {
                        e.preventDefault();
                        const moneyId = e.dataTransfer.getData('text/plain');
                        const moneyElement = document.getElementById(moneyId);
                        
                        console.log('🎯 嘗試放置金錢:', moneyId);
                        
                        if (moneyElement) {
                            const value = parseInt(moneyElement.dataset.value);
                            console.log('💰 成功放置金錢到兌換區:', value);
                            
                            // 移動金錢到兌換區
                            dropZone.appendChild(moneyElement);
                            
                            // 更新總金額
                            this.updatePaymentTotal();
                            
                            // 播放音效
                            this.audio.playDropSound();
                            
                            // 重置視覺效果
                            dropZone.style.backgroundColor = '';
                            dropZone.style.borderColor = '';
                        } else {
                            console.error('❌ 找不到被拖曳的金錢元素:', moneyId);
                        }
                    });
                } else {
                    console.error('❌ 找不到兌換區元素');
                }
                
                console.log('✅ 拖放功能設置完成');
            }, 100); // 100ms 延遲確保 DOM 準備就緒
        },

        // 更新付款總額
        updatePaymentTotal() {
            const paymentZone = document.getElementById('payment-zone-area');
            const currentPaymentElement = document.getElementById('current-payment');
            const paymentHint = document.querySelector('.payment-hint');
            
            if (paymentZone && currentPaymentElement) {
                const moneyInZone = paymentZone.querySelectorAll('.money-item');
                let total = 0;
                
                moneyInZone.forEach(money => {
                    total += parseInt(money.dataset.value);
                });
                
                currentPaymentElement.textContent = total;
                console.log('💰 更新付款總額:', total);
                
                // 控制提示文字顯示/隱藏
                if (paymentHint) {
                    if (moneyInZone.length > 0) {
                        // 有金錢時隱藏提示
                        paymentHint.style.display = 'none';
                        console.log('💡 隱藏兌換區提示文字');
                    } else {
                        // 沒有金錢時顯示提示
                        paymentHint.style.display = 'block';
                        console.log('💡 顯示兌換區提示文字');
                    }
                }
                
                // 更新遊戲狀態
                if (this.state.gameState) {
                    this.state.gameState.currentTotal = total;
                }
                
                // 🆕 音效/語音播放邏輯
                const { difficulty } = this.state.settings;
                if (difficulty === 'easy') {
                    // 簡單模式：取消之前的語音計時器，設置新的計時器
                    if (this.totalAmountSpeechTimer) {
                        clearTimeout(this.totalAmountSpeechTimer);
                    }
                    
                    this.totalAmountSpeechTimer = setTimeout(() => {
                        const voiceText = `目前總額${total}元`;
                        this.speech.speak(voiceText, { interrupt: false });
                        console.log('🗣️ 播放總額語音:', voiceText);
                        
                        // 檢查是否是最後一個金錢（在語音播放時檢查，而不是提前檢查）
                        const moneySourceArea = document.getElementById('money-source-area');
                        const remainingMoney = moneySourceArea ? moneySourceArea.querySelectorAll('.money-item') : [];
                        const isLastMoney = remainingMoney.length === 0;
                        
                        // 如果是最後一個金錢，設置自動判斷
                        if (isLastMoney) {
                            console.log('🗣️ 檢測到最後一個金錢，將在語音後執行自動判斷');
                            setTimeout(() => {
                                this.checkEasyModeAutoJudgment();
                            }, 2000); // 給語音足夠時間播放完畢
                        }
                    }, 300); // 300ms延遲，如果快速拖拽會被取消並重新設置
                    
                } else if (difficulty === 'normal') {
                    // 普通模式：播放總額語音
                    const voiceText = `目前總額${total}元`;
                    this.speech.speak(voiceText, { interrupt: true });
                    console.log('🗣️ 普通模式播放總額語音:', voiceText);
                    
                    // 普通模式直接執行自動判斷檢查
                    this.checkEasyModeAutoJudgment();
                    
                } else if (difficulty === 'hard') {
                    // 🆕 困難模式：播放選擇音效而不是語音，讓使用者自行計算
                    this.audio.playSelectSound();
                    console.log('🔊 困難模式播放選擇音效 (不提供語音提示)');
                    
                    // 困難模式不執行自動判斷，用戶需要手動計算
                }
            }
        },

        // 簡單模式自動判斷功能
        checkEasyModeAutoJudgment() {
            const { difficulty } = this.state.settings;
            
            // 只在簡單模式執行自動判斷
            if (difficulty !== 'easy') return;
            
            const moneySourceArea = document.getElementById('money-source-area');
            const paymentZone = document.getElementById('payment-zone-area');
            
            if (!moneySourceArea || !paymentZone) return;
            
            // 檢查是否所有金錢都已放置到兌換區
            const remainingMoney = moneySourceArea.querySelectorAll('.money-item');
            if (remainingMoney.length > 0) return; // 還有錢未放置，不執行自動判斷
            
            const { question } = this.state.gameState;
            if (!question) return;
            
            const { itemPrice, item } = question;
            const currentTotal = this.state.gameState.currentTotal || 0;
            
            const isAffordable = currentTotal >= itemPrice;
            const itemName = item.name;
            
            console.log('🤖 簡單模式自動判斷:', {
                currentTotal,
                itemPrice,
                isAffordable,
                itemName
            });
            
            // 直接執行自動判斷（不需要額外延遲，因為已經通過語音回調控制時機）
            if (isAffordable) {
                // 足夠時：播放正確音效
                console.log('✅ 錢足夠，播放成功音效');
                this.audio.playCorrectSound();
                
                setTimeout(() => {
                    this.handleJudgment(isAffordable, question, {
                        currentTotal,
                        itemPrice,
                        itemName
                    });
                }, 500); // 等待音效播放
                
            } else {
                // 不足時：播放錯誤音效
                console.log('❌ 錢不足，播放錯誤音效');
                this.audio.playError02Sound();
                
                setTimeout(() => {
                    this.handleJudgment(isAffordable, question, {
                        currentTotal,
                        itemPrice,
                        itemName
                    });
                }, 500); // 等待音效播放
            }
        },

        // DOM元素驗證函數
        verifyDOMElements() {
            const elements = {
                app: document.getElementById('app'),
                titleBar: document.querySelector('.title-bar'),
                backBtn: document.getElementById('back-to-menu-btn'),
                moneySourceArea: document.getElementById('money-source-area'),
                paymentZoneArea: document.getElementById('payment-zone-area'),
                currentPayment: document.getElementById('current-payment'),
                enoughBtn: document.getElementById('enough-btn'),
                notEnoughBtn: document.getElementById('not-enough-btn')
            };
            
            const verification = {};
            Object.entries(elements).forEach(([key, element]) => {
                verification[key] = {
                    exists: !!element,
                    visible: element ? element.offsetWidth > 0 && element.offsetHeight > 0 : false,
                    classList: element ? Array.from(element.classList) : []
                };
            });
            
            return verification;
        },

        // 判斷處理
        handleJudgment(userSaysEnough, question, autoJudgmentData = null) {
            console.log('🎯 handleJudgment() 被調用');
            console.log('📝 判斷參數:', {
                userSaysEnough,
                questionAnswered: this.state.gameState.questionAnswered,
                currentQuestion: this.state.quiz.currentQuestion
            });
            
            // 🆕 在普通模式和困難模式下，檢查是否所有金錢都已放置到兌換區
            const difficulty = this.state.settings.difficulty;
            if (difficulty === 'normal' || difficulty === 'hard') {
                const moneySourceArea = document.getElementById('money-source-area');
                const paymentZone = document.getElementById('payment-zone-area');
                const remainingMoney = moneySourceArea ? moneySourceArea.querySelectorAll('.money-item') : [];
                const moneyInZone = paymentZone ? paymentZone.querySelectorAll('.money-item') : [];
                
                console.log(`🔍 ${difficulty === 'normal' ? '普通' : '困難'}模式金錢檢查:`, {
                    remainingInSource: remainingMoney.length,
                    inExchangeZone: moneyInZone.length
                });
                
                // 檢查我的金錢區是否還有剩餘金錢
                if (remainingMoney.length > 0) {
                    console.log(`⚠️ ${difficulty === 'normal' ? '普通' : '困難'}模式：我的金錢區還有 ${remainingMoney.length} 個金錢未放置`);
                    const warningMessage = '請將我的金錢區的金錢全部放到兌換區，再按下按鈕';
                    
                    this.showMessage(warningMessage, 'warning', (hideMessage) => {
                        this.speech.speak(warningMessage, {
                            callback: () => {
                                hideMessage();
                            }
                        });
                    });
                    return; // 阻止繼續執行判斷邏輯
                }
                
                // 檢查兌換區是否有金錢（雙重保險）
                if (moneyInZone.length === 0) {
                    console.log(`⚠️ ${difficulty === 'normal' ? '普通' : '困難'}模式：兌換區沒有金錢`);
                    const warningMessage = '請先將你的金錢放到兌換區，再按下按鈕';
                    
                    this.showMessage(warningMessage, 'warning', (hideMessage) => {
                        this.speech.speak(warningMessage, {
                            callback: () => {
                                hideMessage();
                            }
                        });
                    });
                    return; // 阻止繼續執行判斷邏輯
                }
                
                console.log(`✅ ${difficulty === 'normal' ? '普通' : '困難'}模式：所有金錢都已正確放置到兌換區`);
            }
            
            if (this.state.gameState.questionAnswered) {
                console.log('❌ 題目已回答，忽略重複點擊');
                return;
            }
            
            const { itemPrice, isAffordable, totalMoney } = question;
            const isCorrect = userSaysEnough === isAffordable;
            
            console.log('🔍 判斷邏輯分析:', {
                itemPrice,
                totalMoney,
                isAffordable,
                userSaysEnough,
                isCorrect,
                difference: totalMoney - itemPrice
            });

            if (isCorrect) {
                // 判斷正確
                console.log('✅ 判斷正確！');
                this.state.gameState.questionAnswered = true;
                
                // 如果不是自動判斷，播放正確音效
                if (!autoJudgmentData) {
                    this.audio.playCorrectSound();
                }
                
                const oldScore = this.state.quiz.score;
                this.state.quiz.score += 10;
                console.log(`📈 分數更新: ${oldScore} → ${this.state.quiz.score}`);

                let message;
                if (autoJudgmentData) {
                    // 自動判斷使用新格式訊息
                    const { currentTotal, itemPrice, itemName } = autoJudgmentData;
                    if (userSaysEnough) {
                        // 錢夠的情況
                        message = `恭喜你！你的錢總共${currentTotal}元，可以買${itemPrice}元的${itemName}！`;
                    } else {
                        // 錢不夠的情況
                        message = `不好意思，你的錢總共${currentTotal}元，不能購買${itemPrice}元的${itemName}`;
                    }
                } else {
                    // 手動判斷使用原始格式訊息
                    message = userSaysEnough ? 
                        `正確！你的錢夠買${itemPrice}元的物品！` : 
                        `正確！你的錢不夠買${itemPrice}元的物品！`;
                }
                    
                const messageType = autoJudgmentData ? 
                    (userSaysEnough ? 'success' : 'error') : 'success';
                
                console.log(`💬 顯示${messageType === 'success' ? '成功' : '失敗'}訊息:`, message);
                
                // 使用回調系統同步消息視窗和語音
                this.showMessage(message, messageType, (hideMessage) => {
                    this.speech.speak(message, {
                        callback: () => {
                            // 語音播放完成後隱藏消息並前往下一題
                            hideMessage();
                            setTimeout(() => {
                                console.log('➡️ 準備前往下一題');
                                this.nextQuestion();
                            }, 1000);
                        }
                    });
                });

            } else {
                // 判斷錯誤
                console.log('❌ 判斷錯誤！');
                
                // 如果不是自動判斷，播放錯誤音效
                if (!autoJudgmentData) {
                    this.audio.playErrorSound();
                }
                
                const oldAttempts = this.state.quiz.attempts;
                this.state.quiz.attempts += 1;
                console.log(`📉 錯誤次數更新: ${oldAttempts} → ${this.state.quiz.attempts}`);

                let message;
                if (autoJudgmentData) {
                    // 自動判斷使用新格式訊息
                    const { currentTotal, itemPrice, itemName } = autoJudgmentData;
                    message = userSaysEnough ? 
                        `不好意思，你的錢總共${currentTotal}元，不能購買${itemPrice}元的${itemName}！請再試一次` :
                        `恭喜你！你的錢總共${currentTotal}元，可以買${itemPrice}元的${itemName}！請再試一次`;
                } else {
                    // 手動判斷使用原始格式訊息
                    message = userSaysEnough ? 
                        `錯誤！你的錢不夠買${itemPrice}元的物品！請再試一次` : 
                        `錯誤！你的錢夠買${itemPrice}元的物品！請再試一次`;
                }
                    
                console.log('💬 顯示錯誤訊息:', message);
                
                // 使用回調系統同步消息視窗和語音（錯誤情況不自動前往下一題）
                this.showMessage(message, 'error', (hideMessage) => {
                    this.speech.speak(message, {
                        callback: () => {
                            // 語音播放完成後隱藏消息
                            hideMessage();
                        }
                    });
                });
                
                console.log('⏳ 等待用戶重新選擇...');
            }
            
            console.log('📊 當前測驗狀態:', {
                currentQuestion: this.state.quiz.currentQuestion,
                totalQuestions: this.state.quiz.totalQuestions,
                score: this.state.quiz.score,
                attempts: this.state.quiz.attempts,
                questionAnswered: this.state.gameState.questionAnswered
            });
        },

        // =====================================================
        // 自訂題目數量功能（參考其他單元）
        // =====================================================
        showCustomQuestionInput() {
            this.showNumberInput('請輸入題目數量', (value) => {
                const questionCount = parseInt(value);
                if (isNaN(questionCount) || questionCount < 1 || questionCount > 100) {
                    alert('請輸入 1-100 之間的有效數字');
                    return false;
                }
                
                this.state.settings.questionCount = questionCount;
                
                // 更新active狀態
                const customBtn = document.querySelector('[data-value="custom"]');
                if (customBtn) {
                    const buttonGroup = customBtn.closest('.button-group');
                    buttonGroup.querySelectorAll('.selection-btn')
                        .forEach(b => b.classList.remove('active'));
                    customBtn.classList.add('active');
                }
                
                // 檢查是否可以開始遊戲
                this.checkStartState();
                
                alert(`已設定測驗題數為 ${questionCount} 題`);
                return true;
            });
        },

        // 數字選擇器系統（採用unit2樣式）
        showNumberInput(title = '請輸入金額數字', callback = null) {
            // 檢查是否已存在數字輸入器
            if (document.getElementById('number-input-popup')) {
                return;
            }

            // 儲存回調函數
            this.numberInputCallback = callback;
            
            const inputPopupHTML = `
                <div id="number-input-popup" class="number-input-popup">
                    <div class="number-input-container">
                        <div class="number-input-header">
                            <h3>${title}</h3>
                            <button class="close-btn" data-action="close">×</button>
                        </div>
                        <div class="number-input-display">
                            <input type="text" id="number-display" readonly value="">
                        </div>
                        <div class="number-input-buttons">
                            <button data-action="append" data-digit="1">1</button>
                            <button data-action="append" data-digit="2">2</button>
                            <button data-action="append" data-digit="3">3</button>
                            <button data-action="clear" class="clear-btn">清除</button>
                            
                            <button data-action="append" data-digit="4">4</button>
                            <button data-action="append" data-digit="5">5</button>
                            <button data-action="append" data-digit="6">6</button>
                            <button data-action="backspace" class="backspace-btn">⌫</button>
                            
                            <button data-action="append" data-digit="7">7</button>
                            <button data-action="append" data-digit="8">8</button>
                            <button data-action="append" data-digit="9">9</button>
                            <button data-action="confirm" class="confirm-btn">確認</button>
                            
                            <button data-action="append" data-digit="0" class="zero-btn">0</button>
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
                        align-items: flex-start;
                        padding-top: 200px;
                        z-index: 10000;
                        animation: fadeIn 0.3s ease-out;
                    }

                    .number-input-container {
                        background: white;
                        border-radius: 15px;
                        padding: 20px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                        width: 320px;
                        max-width: 95vw;
                        animation: bounceIn 0.3s ease-out;
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
                        box-sizing: border-box;
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

                    .number-input-buttons button.zero-btn {
                        grid-column: span 3;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes bounceIn {
                        from {
                            opacity: 0;
                            transform: scale(0.3) translateY(-50px);
                        }
                        50% {
                            opacity: 1;
                            transform: scale(1.05) translateY(10px);
                        }
                        70% {
                            transform: scale(0.95) translateY(-5px);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }
                </style>
            `;

            // 添加樣式和彈窗到頁面
            document.head.insertAdjacentHTML('beforeend', inputStyles);
            document.body.insertAdjacentHTML('beforeend', inputPopupHTML);
            
            // 添加事件監聽器
            const popup = document.getElementById('number-input-popup');
            if (popup) {
                console.log('🎯 數字輸入器事件監聽器已綁定');
                popup.addEventListener('click', (event) => {
                    const btn = event.target.closest('button');
                    if (!btn) return;
                    
                    const action = btn.dataset.action;
                    const digit = btn.dataset.digit;
                    
                    console.log('🔢 數字輸入器按鈕點擊:', { action, digit });
                    
                    switch (action) {
                        case 'append':
                            if (digit) {
                                this.appendNumber(digit);
                            }
                            break;
                        case 'clear':
                            this.clearNumber();
                            break;
                        case 'backspace':
                            this.backspaceNumber();
                            break;
                        case 'confirm':
                            this.confirmNumber();
                            break;
                        case 'close':
                            this.closeNumberInput();
                            break;
                    }
                });
            } else {
                console.error('❌ 找不到數字輸入器彈窗元素');
            }
        },

        // 數字輸入器相關函數
        appendNumber(digit) {
            console.log('🔢 appendNumber 被調用:', digit);
            const display = document.getElementById('number-display');
            if (display) {
                const currentValue = display.value;
                console.log('📺 當前顯示值:', currentValue);
                if (currentValue.length < 6) { // 限制最大6位數
                    display.value = currentValue + digit;
                    console.log('✅ 更新後的值:', display.value);
                    
                    // 播放點擊音效
                    this.audio.playClickSound();
                } else {
                    console.log('⚠️ 已達到最大位數限制 (6位)');
                }
            } else {
                console.error('❌ 找不到 number-display 元素');
            }
        },

        clearNumber() {
            const display = document.getElementById('number-display');
            if (display) {
                display.value = '';
                
                // 播放點擊音效
                this.audio.playClickSound();
            }
        },

        backspaceNumber() {
            const display = document.getElementById('number-display');
            if (display) {
                display.value = display.value.slice(0, -1);
                
                // 播放點擊音效
                this.audio.playClickSound();
            }
        },

        confirmNumber() {
            const display = document.getElementById('number-display');
            if (display && this.numberInputCallback) {
                const value = display.value;
                if (value && value.trim() !== '') {
                    // 播放點擊音效
                    this.audio.playClickSound();
                    
                    const success = this.numberInputCallback(value);
                    if (success !== false) {
                        this.closeNumberInput();
                    }
                } else {
                    alert('請先輸入數字');
                }
            }
        },

        closeNumberInput() {
            console.log('🔒 closeNumberInput 被調用');
            
            // 播放點擊音效
            this.audio.playClickSound();
            
            const popup = document.getElementById('number-input-popup');
            const styles = document.getElementById('number-input-styles');
            
            if (popup) {
                popup.remove();
                console.log('✅ 彈窗已移除');
            } else {
                console.log('⚠️ 找不到彈窗元素');
            }
            if (styles) {
                styles.remove();
                console.log('✅ 樣式已移除');
            } else {
                console.log('⚠️ 找不到樣式元素');
            }
            
            this.numberInputCallback = null;
            console.log('✅ 回調函數已清空');
        },

        // =====================================================
        // CSS樣式函數（參照unit6）
        // =====================================================
        getCommonCSS() {
            return `
                /* 基礎樣式 - 參照unit6 */
                body { 
                    background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%) !important; 
                    margin: 0; 
                    padding: 0; 
                    font-family: 'Microsoft JhengHei', sans-serif;
                }
                
                /* 標題列樣式 - 參照unit6 */
                .title-bar {
                    background: linear-gradient(135deg, #00aeff 0%, #3CB371 100%);
                    color: white;
                    padding: 15px 25px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                    box-shadow: 0 2px 8px rgba(135, 206, 235, 0.2);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    transition: 0.3s ease;
                }
                
                .title-bar::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #4CAF50, #8BC34A, #4CAF50);
                }
                
                /* 區域樣式 */
                .my-money-section, .exchange-section {
                    background: #FFFFFF;
                    margin: 10px;
                    padding: 20px;
                    border-radius: 10px;
                    border: 2px solid #4CAF50;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                
                /* 兌換區內部樣式 */
                .drop-zone-container {
                    background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%) !important;
                    border: 3px dashed #4CAF50 !important;
                    border-radius: 15px !important;
                    padding: 20px !important;
                    text-align: center !important;
                    min-height: 120px !important;
                    display: flex !important;
                    flex-wrap: wrap !important;
                    align-items: flex-start !important;
                    justify-content: center !important;
                    gap: 10px !important;
                    align-content: flex-start !important;
                }
                
                
                .section-title {
                    color: #333;
                    font-size: 1.4em;
                    margin-bottom: 15px;
                    text-align: center;
                }
                
                /* 金錢樣式 - 參照unit6 */
                .money-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 10px;
                    border: 2px solid #4CAF50;
                    border-radius: 12px;
                    background: white;
                    cursor: grab;
                    transition: all 0.3s ease;
                    margin: 5px;
                }
                
                .money-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                }
                
                .money-item img {
                    object-fit: contain;
                    margin-bottom: 8px;
                }
                
                /* 硬幣樣式 */
                .money-item.coin {
                    min-height: 120px;
                    min-width: 80px;
                }
                
                .money-item.coin img {
                    width: 50px !important;
                    height: 50px !important;
                    border-radius: 50% !important;
                }
                
                /* 紙鈔樣式 */
                .money-item.banknote {
                    min-height: 140px;
                    min-width: 120px;
                }
                
                .money-item.banknote img {
                    width: 100px !important;
                    height: auto !important;
                    max-height: 60px !important;
                    object-fit: contain !important;
                }
                
                /* 金額顯示 */
                .money-value {
                    font-weight: bold;
                    color: #2E7D32;
                    font-size: 12px;
                    text-align: center;
                }
                
                /* 錢幣容器 */
                .money-source-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: center;
                    padding: 20px;
                    background: linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%);
                    border-radius: 10px;
                    min-height: 150px;
                }
                
                /* 返回主選單按鈕 */
                .back-to-menu-btn {
                    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 0.9em;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }
                
                .back-to-menu-btn:hover {
                    background: linear-gradient(135deg, #ee5a24, #ff6b6b);
                    transform: translateY(-1px);
                }
                
                /* 判斷按鈕樣式 - 供普通模式和困難模式使用 */
                .judgment-buttons {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                    margin-top: 20px;
                }
                
                .judgment-btn {
                    padding: 15px 30px;
                    font-size: 1.2em;
                    font-weight: bold;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .enough-btn {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                }
                
                .enough-btn:hover {
                    background: linear-gradient(135deg, #45a049, #4CAF50);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
                }
                
                .not-enough-btn {
                    background: linear-gradient(135deg, #f44336, #da190b);
                    color: white;
                }
                
                .not-enough-btn:hover {
                    background: linear-gradient(135deg, #da190b, #f44336);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
                }
            `;
        },

        getEasyModeCSS() {
            return `
                /* 簡單模式特有樣式 */
                .unit5-easy-layout {
                    background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%);
                    min-height: 100vh;
                    padding: 10px;
                }
                
                .drop-zone-container {
                    background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%);
                    border: 3px dashed #4CAF50;
                    border-radius: 15px;
                    padding: 30px;
                    text-align: center;
                    min-height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .payment-hint {
                    font-size: 1.2em;
                    color: #666;
                    font-weight: bold;
                    width: 100%;
                    order: -1;
                }
                
                .current-total-display {
                    background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%);
                    padding: 20px 30px;
                    border-radius: 15px;
                    margin: 20px auto;
                    text-align: center;
                    font-size: 1.8em;
                    font-weight: bold;
                    color: #333;
                    border: 3px solid #4CAF50;
                    box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
                    max-width: 400px;
                    letter-spacing: 1px;
                }
                
                .current-total-display #current-payment {
                    color: #FF0000;
                    font-weight: bold;
                }
                
                
            `;
        },

        getNormalModeCSS() {
            return `
                /* 普通模式特有樣式 */
                .unit5-normal-layout {
                    background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%);
                    min-height: 100vh;
                    padding: 10px;
                }
                
                /* 🆕 普通模式內聯總額顯示 */
                .unit5-normal-total-display-inline {
                    background: linear-gradient(45deg, #ff6b6b, #ffa500);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 25px;
                    font-size: 1.1em;
                    font-weight: bold;
                    margin-left: 15px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                    border: 3px solid #fff;
                    display: inline-block;
                    animation: totalAmountGlow 2s ease-in-out infinite alternate;
                }
                
                /* 總額數字特殊樣式 */
                .unit5-normal-total-display-inline #current-payment {
                    font-size: 1.3em;
                    font-weight: 900;
                    color: #ffff00;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
                }
                
                /* 動畫效果：輕微發光 */
                @keyframes totalAmountGlow {
                    0% {
                        box-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.5);
                    }
                    100% {
                        box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.8);
                    }
                }
                
                /* 響應式設計：小螢幕時縮小 */
                @media (max-width: 768px) {
                    .unit5-normal-total-display-inline {
                        font-size: 0.9em;
                        padding: 6px 12px;
                        margin-left: 10px;
                    }
                    
                    .unit5-normal-total-display-inline #current-payment {
                        font-size: 1.1em;
                    }
                }
                
                .unit5-normal-hint {
                    text-align: center;
                    color: #ff9800;
                    font-size: 1.2em;
                    margin-top: 15px;
                    font-weight: bold;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                }
            `;
        },

        getHardModeCSS() {
            return `
                /* 困難模式特有樣式 */
                .unit5-hard-layout {
                    background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%);
                    min-height: 100vh;
                    padding: 10px;
                }
                
                /* 🆕 困難模式內聯總額顯示 - 與普通模式相同樣式 */
                .unit5-hard-total-display-inline {
                    background: linear-gradient(45deg, #ff6b6b, #ffa500);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 25px;
                    font-size: 1.1em;
                    font-weight: bold;
                    margin-left: 15px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                    border: 3px solid #fff;
                    display: inline-block;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    animation: totalAmountGlow 2s ease-in-out infinite alternate;
                }
                
                /* 困難模式提示按鈕互動效果 */
                .unit5-hard-total-display-inline:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.4);
                }
                
                /* 總額數字特殊樣式 */
                .unit5-hard-total-display-inline #current-payment {
                    font-size: 1.3em;
                    font-weight: 900;
                    color: #ffff00;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
                }
                
                /* 提示文字樣式 */
                .unit5-hard-total-display-inline #hint-text {
                    font-size: 1.0em;
                    font-weight: bold;
                    color: #ffffff;
                }
                
                /* 動畫效果：輕微發光 */
                @keyframes totalAmountGlow {
                    0% {
                        box-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.5);
                    }
                    100% {
                        box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.8);
                    }
                }
                
                /* 響應式設計：小螢幕時縮小 */
                @media (max-width: 768px) {
                    .unit5-hard-total-display-inline {
                        font-size: 0.9em;
                        padding: 6px 12px;
                        margin-left: 10px;
                    }
                    
                    .unit5-hard-total-display-inline #current-payment {
                        font-size: 1.1em;
                    }
                }
                
                .unit5-hard-challenge-hint {
                    text-align: center;
                    color: #ff9800;
                    font-size: 1.2em;
                    margin-top: 15px;
                    font-weight: bold;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                }
                
                /* 困難模式下的金錢可拖拽 */
                .unit5-hard-source-item {
                    cursor: grab;
                }
                
                .unit5-hard-source-item:active {
                    cursor: grabbing;
                }
                
                .unit5-hard-source-item:hover {
                    transform: none;
                    box-shadow: none;
                }
            `;
        },

        // 設置觸控拖拽支援
        setupTouchDragSupport() {
            console.log('🎯 [C5-足夠支付] 檢查 TouchDragUtility 狀態', {
                touchUtilityExists: !!window.TouchDragUtility,
                touchUtilityType: typeof window.TouchDragUtility
            });
            
            if (!window.TouchDragUtility) {
                console.error('❌ [C5-足夠支付] TouchDragUtility 未載入，觸控拖曳功能無法使用');
                return;
            }
            
            const gameArea = document.getElementById('app');
            if (!gameArea) return;
            
            console.log('✅ [C5-足夠支付] TouchDragUtility 已載入，開始註冊觸控拖曳');

            // 註冊可拖拽元素
            window.TouchDragUtility.registerDraggable(
                gameArea,
                '.money-item[draggable="true"]',
                {
                    onDragStart: (element, event) => {
                        const moneyItem = element.closest('.money-item');
                        if (!moneyItem) return false;
                        
                        console.log('🎯 開始觸控拖曳金錢:', moneyItem.dataset.value);
                        
                        // 設置視覺反饋
                        moneyItem.style.opacity = '0.5';
                        
                        return true;
                    },
                    onDrop: (draggedElement, dropZone, event) => {
                        // 創建合成的放置事件
                        const syntheticDropEvent = {
                            target: dropZone,
                            preventDefault: () => {},
                            stopPropagation: () => {},
                            dataTransfer: {
                                getData: () => draggedElement.id
                            }
                        };
                        
                        // 處理放置到兌換區
                        if (dropZone.closest('#payment-zone-area')) {
                            console.log('🎯 觸控放置到兌換區');
                            this.handleMoneyDrop(syntheticDropEvent, draggedElement);
                        }
                    },
                    onDragEnd: (element, event) => {
                        const moneyItem = element.closest('.money-item');
                        if (moneyItem) {
                            moneyItem.style.opacity = '1';
                        }
                    }
                }
            );

            // 註冊放置區域
            const dropZone = document.getElementById('payment-zone-area');
            if (dropZone) {
                window.TouchDragUtility.registerDropZone(dropZone, () => true);
            }
        },

        // 處理金錢放置
        handleMoneyDrop(event, draggedElement) {
            const moneyId = event.dataTransfer.getData('text/plain') || draggedElement.id;
            const moneyElement = document.getElementById(moneyId);
            
            if (!moneyElement) {
                console.error('找不到被拖曳的金錢元素:', moneyId);
                return;
            }

            const value = parseInt(moneyElement.dataset.value);
            if (isNaN(value)) {
                console.error('金錢值無效:', moneyElement.dataset.value);
                return;
            }

            console.log('💰 處理金錢放置:', value, '元');

            // 移動金錢到付款區域
            const paymentZone = document.getElementById('payment-zone-area');
            if (paymentZone && moneyElement) {
                paymentZone.appendChild(moneyElement);
                console.log('💰 成功放置金錢到兌換區:', value);
            }
            
            // 更新總額並檢查是否完成
            this.updatePaymentTotal();
            this.checkPaymentCompletion();
        },

        // 添加金錢到付款區域的方法
        addMoneyToPaymentZone(moneyElement, value) {
            const paymentZone = document.getElementById('payment-zone-area');
            if (paymentZone && moneyElement) {
                paymentZone.appendChild(moneyElement);
                console.log('💰 成功放置金錢到兌換區:', value);
                
                // 更新總額並檢查是否完成
                this.updatePaymentTotal();
                this.checkPaymentCompletion();
            }
        },

        // 檢查付款完成狀態
        checkPaymentCompletion() {
            console.log('🔍 [C5點擊除錯] 檢查付款完成狀態');
            const { difficulty } = this.state.settings;
            
            // 簡單模式：自動判斷
            if (difficulty === 'easy') {
                this.checkEasyModeAutoJudgment();
                return;
            }
            
            // 普通和困難模式：只更新狀態，不自動判斷
            const moneySourceArea = document.getElementById('money-source-area');
            const paymentZone = document.getElementById('payment-zone-area');
            
            if (!moneySourceArea || !paymentZone) return;
            
            const remainingMoney = moneySourceArea.querySelectorAll('.money-item');
            const placedMoney = paymentZone.querySelectorAll('.money-item');
            
            console.log(`🔍 [${difficulty}模式] 金錢狀態:`, {
                剩餘: remainingMoney.length,
                已放置: placedMoney.length
            });
            
            // 普通和困難模式不執行自動判斷，等待用戶手動選擇
        },

        // 🔧 [新增] 點擊事件處理系統
        // =====================================================
        
        // 設置點擊事件監聽器
        setupClickEventListeners() {
            console.log('🎯 [C5點擊除錯] 設置點擊事件監聽器');
            
            const gameContainer = document.getElementById('app');
            if (!gameContainer) {
                console.error('❌ 找不到遊戲容器 #app');
                return;
            }

            // 創建點擊事件處理器
            this._clickEventHandler = (event) => {
                console.log('🖱️ [C5點擊除錯] 容器點擊事件觸發', {
                    target: event.target.id || event.target.className,
                });

                // 查找金錢物品元素
                const moneyItem = event.target.closest('.money-item');
                if (moneyItem) {
                    console.log('✅ [C5點擊除錯] 發現金錢物品點擊，處理點擊邏輯');
                    event.stopPropagation();
                    event.preventDefault();
                    this.handleMoneyClick(moneyItem, event);
                }
            };

            // 綁定點擊事件
            gameContainer.addEventListener('click', this._clickEventHandler, { capture: true });
            console.log('✅ [C5點擊除錯] 點擊事件已成功綁定到 #app');
        },

        // 處理金錢物品點擊
        handleMoneyClick(moneyItem, event) {
            console.log('🎯 [C5點擊除錯] handleMoneyClick 被呼叫', {
                moneyItem: moneyItem,
                value: moneyItem.dataset.value
            });

            // 檢查是否在源區域（可以點擊移動）
            const isInSourceArea = moneyItem.closest('#my-money-area, .my-money-area, [id*="money-source"]');
            const isInPaymentArea = moneyItem.closest('#payment-zone-area');

            console.log('🔍 [C5點擊除錯] 物品位置檢查', {
                isInSourceArea: !!isInSourceArea,
                isInPaymentArea: !!isInPaymentArea
            });

            if (isInSourceArea) {
                // 在源區域：處理點擊放置
                this.handleClickToPlace(moneyItem);
            } else if (isInPaymentArea) {
                // 在付款區域：處理點擊取回
                this.handleClickToReturn(moneyItem);
            } else {
                console.log('ℹ️ [C5點擊除錯] 物品不在可操作區域');
            }
        },

        // 處理點擊放置到付款區域
        handleClickToPlace(sourceItem) {
            const currentTime = Date.now();
            const { lastClickTime, lastClickedElement, doubleClickDelay } = this.clickState;

            const isSameElement = lastClickedElement === sourceItem;
            const isWithinDoubleClickTime = (currentTime - lastClickTime) < doubleClickDelay;

            console.log('🔍 [C5點擊除錯] 雙擊檢測狀態', {
                currentTime,
                lastClickTime,
                timeDiff: currentTime - lastClickTime,
                doubleClickDelay,
                isSameElement,
                isWithinDoubleClickTime
            });

            if (isSameElement && isWithinDoubleClickTime) {
                // 雙擊：執行放置
                console.log('✅ [C5點擊除錯] 偵測到雙擊，執行放置');
                this.executeClickPlacement(sourceItem);
                
                // 重置點擊狀態
                this.resetClickState();
            } else {
                // 單擊：選擇物品
                console.log('🔵 [C5點擊除錯] 第一次點擊，選擇物品');
                this.selectItem(sourceItem);
                
                // 更新點擊狀態
                this.clickState.lastClickTime = currentTime;
                this.clickState.lastClickedElement = sourceItem;
                
                // 播放選擇音效
                this.audio.playSelectSound();
            }
        },

        // 處理點擊取回
        handleClickToReturn(placedItem) {
            console.log('🔙 [C5點擊除錯] 處理點擊取回', { placedItem });
            
            // 找到原始的源區域
            const sourceArea = document.querySelector('#my-money-area, .my-money-area, [id*="money-source"]');
            if (sourceArea && placedItem) {
                // 🔧 修正：保持原始位置順序，使用insertBefore來維持位置
                this.insertMoneyInOriginalPosition(sourceArea, placedItem);
                console.log('✅ [C5點擊除錯] 金錢已取回到源區域並維持位置');
                
                // 更新總額
                this.updatePaymentTotal();
                
                // 播放音效
                this.audio.playSelectSound();
            } else {
                console.error('❌ 找不到源區域或物品元素');
            }
        },

        // 🔧 新增：將金錢插入到原始位置，維持順序
        insertMoneyInOriginalPosition(container, moneyItem) {
            const itemValue = parseInt(moneyItem.dataset.value);
            const existingItems = Array.from(container.querySelectorAll('.money-item'));
            
            console.log('🔍 [C5位置修復] 嘗試維持金錢位置', {
                返回金錢面額: itemValue,
                容器內現有金錢數: existingItems.length
            });
            
            // 找到合適的插入位置（按面額排序：1, 5, 10, 50, 100...）
            let insertBeforeElement = null;
            for (let i = 0; i < existingItems.length; i++) {
                const existingValue = parseInt(existingItems[i].dataset.value);
                if (existingValue > itemValue) {
                    insertBeforeElement = existingItems[i];
                    console.log(`📍 [C5位置修復] 插入${itemValue}元到${existingValue}元之前`);
                    break;
                }
            }
            
            if (insertBeforeElement) {
                // 插入到指定位置之前
                container.insertBefore(moneyItem, insertBeforeElement);
            } else {
                // 插入到最後位置
                container.appendChild(moneyItem);
                console.log(`📍 [C5位置修復] ${itemValue}元插入到最後位置`);
            }
        },

        // 執行點擊放置
        executeClickPlacement(sourceItem) {
            console.log('🎯 [C5點擊除錯] 執行點擊放置', { 
                sourceItem: sourceItem,
                value: sourceItem.dataset.value 
            });

            // 創建一個模擬的拖放事件
            const mockEvent = {
                dataTransfer: {
                    getData: () => sourceItem.id
                }
            };

            // 調用現有的金錢放置處理邏輯
            this.handleMoneyDrop(mockEvent, sourceItem);
            
            console.log('✅ [C5點擊除錯] 點擊放置執行完成');
        },

        // 選擇物品（視覺反饋）
        selectItem(item) {
            // 清除之前的選擇
            this.clearSelection();
            
            // 選擇當前物品
            item.classList.add('selected-item');
            this.clickState.selectedItem = item;
            
            console.log('✅ [C5點擊除錯] 物品已選擇');
        },

        // 清除選擇狀態
        clearSelection() {
            if (this.clickState.selectedItem) {
                this.clickState.selectedItem.classList.remove('selected-item');
                this.clickState.selectedItem = null;
                console.log('🧹 [C5點擊除錯] 選擇狀態已清除');
            }
        },

        // 重置點擊狀態
        resetClickState() {
            this.clickState.lastClickTime = 0;
            this.clickState.lastClickedElement = null;
            this.clearSelection();
        }
    };

    // 啟動遊戲
    Game.init();
});