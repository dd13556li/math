// =================================================================
/**
 * @file a4_mcdonalds_order.js
 * @description A4 麥當勞自助點餐系統 - 配置驅動版本
 * @unit A4 - 麥當勞自助點餐學習
 * @version 1.0.0 - 基於專案標準架構開發
 * @lastModified 2025.09.22
 */
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
// 基於專案標準架構的麥當勞點餐系統
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const McDonald = {
        // =====================================================
        // 狀態管理系統（基於專案標準）
        // =====================================================
        state: {
            settings: {
                difficulty: 'easy',           // easy, normal, hard
                language: 'chinese',         // chinese, english
                audioEnabled: true,          // 音效開關
                speechEnabled: true,         // 語音開關
                animationSpeed: 'normal'     // slow, normal, fast
            },
            audioUnlocked: false,            // 手機端音頻解鎖狀態
            gameState: {
                currentCategory: 'burgers',  // 當前分類
                cart: [],                    // 購物車內容
                totalAmount: 0,              // 總金額
                orderNumber: 1,              // 訂單號碼
                isProcessing: false,         // 是否正在處理
                showingModal: false,         // 是否顯示模態視窗
                completedOrders: 0           // 完成訂單數
            },
            quiz: {
                currentQuestion: 0,
                score: 0,
                questions: [],
                startTime: null,
                attempts: 0
            }
        },

        // =====================================================
        // 配置驅動系統 - 菜單配置
        // =====================================================
        menuConfig: {
            categories: [
                { id: 'burgers', name: '🍔 經典漢堡', keyShortcut: '1' },
                { id: 'sides', name: '🍟 美味配餐', keyShortcut: '2' },
                { id: 'drinks', name: '🥤 清涼飲品', keyShortcut: '3' },
                { id: 'desserts', name: '🍦 繽紛甜點', keyShortcut: '4' }
            ],
            items: {
                burgers: [
                    {
                        id: 'big-mac',
                        name: '大麥克',
                        description: '雙層純牛肉，搭配秘製大麥克醬、生菜、洋蔥、酸黃瓜、吉事，多層次的美味。',
                        price: 75,
                        emoji: '🍔',
                        popular: true
                    },
                    {
                        id: 'mc-double',
                        name: '雙層牛肉吉事堡',
                        description: '兩片純牛肉，搭配融化的吉事、洋蔥、酸黃瓜、番茄醬和芥末醬。',
                        price: 55,
                        emoji: '🍔'
                    },
                    {
                        id: 'mc-chicken',
                        name: '麥香雞',
                        description: '鮮嫩多汁的雞腿排，搭配爽脆的生菜和獨特的麥香醬。',
                        price: 65,
                        emoji: '🐔'
                    },
                    {
                        id: 'filet-o-fish',
                        name: '麥香魚',
                        description: '來自純淨海域的鱈魚，外酥內嫩，搭配濃郁的塔塔醬。',
                        price: 52,
                        emoji: '🐟'
                    }
                ],
                sides: [
                    {
                        id: 'french-fries-large',
                        name: '薯條 (大)',
                        description: '金黃酥脆的馬鈴薯條，外酥內軟，是麥當勞的經典配餐。',
                        price: 35,
                        emoji: '🍟'
                    },
                    {
                        id: 'french-fries-medium',
                        name: '薯條 (中)',
                        description: '適中分量的薯條，完美搭配主餐。',
                        price: 30,
                        emoji: '🍟'
                    },
                    {
                        id: 'mcnuggets-6',
                        name: '麥克雞塊 (6塊)',
                        description: '鮮嫩雞胸肉製成，外酥內嫩，搭配多種醬料享用。',
                        price: 45,
                        emoji: '🍗'
                    },
                    {
                        id: 'hash-brown',
                        name: '薯餅',
                        description: '酥脆的馬鈴薯餅，早餐時光的最佳選擇。',
                        price: 25,
                        emoji: '🥔'
                    }
                ],
                drinks: [
                    {
                        id: 'coke-large',
                        name: '可口可樂 (大杯)',
                        description: '經典的可口可樂，清爽解膩。',
                        price: 30,
                        emoji: '🥤'
                    },
                    {
                        id: 'coke-medium',
                        name: '可口可樂 (中杯)',
                        description: '適中分量的可口可樂。',
                        price: 25,
                        emoji: '🥤'
                    },
                    {
                        id: 'orange-juice',
                        name: '柳橙汁',
                        description: '新鮮柳橙榨取，富含維他命C。',
                        price: 35,
                        emoji: '🍊'
                    },
                    {
                        id: 'milk',
                        name: '鮮奶',
                        description: '純淨鮮奶，營養豐富。',
                        price: 20,
                        emoji: '🥛'
                    }
                ],
                desserts: [
                    {
                        id: 'apple-pie',
                        name: '蘋果派',
                        description: '酥脆外皮包裹著香甜蘋果餡，溫熱享用最美味。',
                        price: 25,
                        emoji: '🥧'
                    },
                    {
                        id: 'ice-cream-cone',
                        name: '蛋捲冰淇淋',
                        description: '香草口味的軟式冰淇淋，清爽解膩。',
                        price: 15,
                        emoji: '🍦'
                    },
                    {
                        id: 'cookies',
                        name: '巧克力餅乾',
                        description: '香濃巧克力餅乾，甜蜜滋味。',
                        price: 20,
                        emoji: '🍪'
                    },
                    {
                        id: 'shake-chocolate',
                        name: '巧克力奶昔',
                        description: '濃郁巧克力奶昔，香甜順滑。',
                        price: 40,
                        emoji: '🥤'
                    }
                ]
            }
        },

        // =====================================================
        // 配置驅動系統 - 語音模板配置
        // =====================================================
        speechTemplates: {
            easy: {
                welcome: '歡迎來到麥當勞！請選擇您想要的餐點',
                categorySelected: '您正在瀏覽{categoryName}',
                itemAdded: '已將{itemName}加入購物車，價格{price}元',
                itemRemoved: '已從購物車移除{itemName}',
                cartUpdated: '購物車總金額：{total}元',
                checkout: '準備結帳，總共{total}元',
                orderComplete: '訂單完成！您的訂單號碼是{orderNumber}',
                cartEmpty: '購物車是空的，請先選擇商品'
            },
            normal: {
                welcome: '歡迎光臨麥當勞自助點餐系統！請選擇您喜愛的餐點',
                categorySelected: '正在瀏覽{categoryName}分類商品',
                itemAdded: '成功將{itemName}加入購物車，單價{price}元',
                itemRemoved: '已將{itemName}從購物車中移除',
                cartUpdated: '目前購物車總金額為{total}元',
                checkout: '即將進行結帳，訂單總金額{total}元',
                orderComplete: '感謝您的訂購！您的訂單號碼是{orderNumber}號，請至櫃檯取餐',
                cartEmpty: '您的購物車目前沒有商品，請先選擇您要的餐點'
            },
            hard: {
                welcome: '歡迎使用麥當勞數位自助點餐服務系統！請仔細選擇您需要的餐點項目',
                categorySelected: '系統正在顯示{categoryName}分類的所有商品選項',
                itemAdded: '商品{itemName}已成功加入您的購物車，商品單價為新台幣{price}元',
                itemRemoved: '系統已將商品{itemName}從您的購物車中移除',
                cartUpdated: '您的購物車已更新，目前訂單總金額為新台幣{total}元',
                checkout: '系統準備執行結帳程序，本次訂單總金額為新台幣{total}元',
                orderComplete: '非常感謝您選擇麥當勞！您的訂單編號是{orderNumber}，請持此編號至櫃檯領取餐點，祝您用餐愉快',
                cartEmpty: '系統提示：您的數位購物車目前沒有任何商品，請先從菜單中選擇您需要的餐點項目'
            }
        },

        // =====================================================
        // 配置驅動系統 - 時間配置
        // =====================================================
        timingConfig: {
            easy: {
                speechDelay: 500,
                animationDuration: 1000,
                cartUpdateDelay: 300,
                checkoutDelay: 2000
            },
            normal: {
                speechDelay: 300,
                animationDuration: 800,
                cartUpdateDelay: 200,
                checkoutDelay: 1500
            },
            hard: {
                speechDelay: 200,
                animationDuration: 600,
                cartUpdateDelay: 100,
                checkoutDelay: 1000
            }
        },

        // =====================================================
        // 音效和語音系統（基於專案標準）
        // =====================================================
        audio: {
            beepSound: null,
            successSound: null,
            errorSound: null,
            addToCartSound: null,
            parent: null, // 引用父對象

            init() {
                // 父對象引用將在調用時動態設置
                try {
                    this.beepSound = new Audio('../audio/click.mp3');
                    this.beepSound.preload = 'auto';
                    this.beepSound.volume = 0.6;

                    this.successSound = new Audio('../audio/correct02.mp3');
                    this.successSound.preload = 'auto';
                    this.successSound.volume = 0.7;

                    this.errorSound = new Audio('../audio/error.mp3');
                    this.errorSound.preload = 'auto';
                    this.errorSound.volume = 0.5;

                    this.addToCartSound = new Audio('../audio/correct02.mp3');
                    this.addToCartSound.preload = 'auto';
                    this.addToCartSound.volume = 0.8;

                    console.log('[A4-McDonald] 音效系統初始化完成');
                } catch (error) {
                    console.error('[A4-McDonald] 音效初始化錯誤:', error);
                }
            },

            playSound(soundType, callback = null) {
                if (!this.parent || !this.parent.state.settings.audioEnabled || !this.parent.state.audioUnlocked) {
                    if (callback) callback();
                    return;
                }

                try {
                    let sound = null;
                    switch (soundType) {
                        case 'beep': sound = this.beepSound; break;
                        case 'success': sound = this.successSound; break;
                        case 'error': sound = this.errorSound; break;
                        case 'addToCart': sound = this.addToCartSound; break;
                        default:
                            console.warn('[A4-McDonald] 未知音效類型:', soundType);
                            if (callback) callback();
                            return;
                    }

                    if (sound) {
                        sound.currentTime = 0;
                        const playPromise = sound.play();
                        if (playPromise !== undefined) {
                            playPromise
                                .then(() => {
                                    if (callback) {
                                        setTimeout(callback, sound.duration * 1000 || 500);
                                    }
                                })
                                .catch(error => {
                                    console.warn('[A4-McDonald] 音效播放失敗:', error);
                                    if (callback) callback();
                                });
                        } else if (callback) {
                            setTimeout(callback, 500);
                        }
                    } else if (callback) {
                        callback();
                    }
                } catch (error) {
                    console.error('[A4-McDonald] 音效播放錯誤:', error);
                    if (callback) callback();
                }
            }
        },

        // =====================================================
        // 語音系統（基於配置驱动）
        // =====================================================
        speech: {
            synth: null,
            voice: null,
            parent: null, // 引用父對象

            init() {
                // 父對象引用將在調用時動態設置
                if ('speechSynthesis' in window) {
                    this.synth = window.speechSynthesis;
                    this.setupVoice();
                    console.log('[A4-McDonald] 語音系統初始化完成');
                } else {
                    console.warn('[A4-McDonald] 瀏覽器不支援語音合成');
                }
            },

            setupVoice() {
                const voices = this.synth.getVoices();
                const preferredVoices = [
                    'Microsoft HsiaoChen Online',
                    'Google 國語 (臺灣)'
                ];

                this.voice = voices.find(v => preferredVoices.includes(v.name)) ||
                            voices.find(v => v.lang === 'zh-TW' && !v.name.includes('Hanhan')) ||
                            voices.find(v => v.lang.startsWith('zh')) ||
                            voices[0];

                if (this.voice) {
                    console.log('[A4-McDonald] 使用語音:', this.voice.name);
                }
            },

            speak(templateKey, replacements = {}, callback = null) {
                if (!this.parent || !this.parent.state.settings.speechEnabled || !this.synth || !this.voice) {
                    if (callback) callback();
                    return;
                }

                try {
                    const difficulty = this.parent.state.settings.difficulty;
                    const template = this.parent.speechTemplates[difficulty]?.[templateKey];

                    if (!template) {
                        console.warn('[A4-McDonald] 找不到語音模板:', templateKey);
                        if (callback) callback();
                        return;
                    }

                    let speechText = template;
                    Object.keys(replacements).forEach(key => {
                        speechText = speechText.replace(new RegExp(`{${key}}`, 'g'), replacements[key]);
                    });

                    this.synth.cancel();
                    const utterance = new SpeechSynthesisUtterance(speechText);
                    utterance.voice = this.voice;
                    utterance.rate = 1.2;
                    utterance.lang = this.voice.lang;

                    utterance.onend = () => {
                        if (callback) callback();
                    };

                    utterance.onerror = (event) => {
                        console.error('[A4-McDonald] 語音播放錯誤:', event);
                        if (callback) callback();
                    };

                    const delay = this.parent.timingConfig[difficulty]?.speechDelay || 300;
                    setTimeout(() => {
                        this.synth.speak(utterance);
                    }, delay);

                } catch (error) {
                    console.error('[A4-McDonald] 語音系統錯誤:', error);
                    if (callback) callback();
                }
            }
        },

        // =====================================================
        // HTML模板系統
        // =====================================================
        HTMLTemplates: {
            titleBar() {
                return `
                    <div class="mcdonalds-title-bar">
                        <h1>🍔 麥當勞自助點餐</h1>
                        <div class="mcdonalds-subtitle">歡迎使用數位點餐系統</div>
                    </div>
                `;
            },

            mainContent() {
                return `
                    <div class="mcdonalds-body">
                        <div class="mcdonalds-left-panel">
                            ${this.headerSection()}
                            ${this.menuSection()}
                        </div>
                        <div class="mcdonalds-right-panel">
                            ${this.cartSection()}
                        </div>
                    </div>
                `;
            },

            headerSection() {
                return `
                    <header class="main-header">
                        <div class="logo">
                            <div style="font-size: 80px;">🍔</div>
                            <h1>麥當勞</h1>
                        </div>
                        <div class="header-message">
                            <p>您好！請選擇您喜歡的餐點</p>
                        </div>
                    </header>
                `;
            },

            menuSection() {
                return `
                    <main class="main-content">
                        <div class="menu-container">
                            <nav id="category-nav" class="category-nav">
                                ${this.categoryButtons()}
                            </nav>
                            <div id="item-grid" class="item-grid">
                                ${this.menuItems('burgers')}
                            </div>
                        </div>
                    </main>
                `;
            },

            categoryButtons() {
                return McDonald.menuConfig.categories.map(category => `
                    <button class="category-btn ${category.id === 'burgers' ? 'active' : ''}"
                            onclick="McDonald.selectCategory('${category.id}')"
                            data-category="${category.id}">
                        ${category.name}
                    </button>
                `).join('');
            },

            menuItems(categoryId) {
                const items = McDonald.menuConfig.items[categoryId] || [];
                return items.map(item => `
                    <div class="menu-item fade-in" data-item-id="${item.id}">
                        <div class="item-image">
                            ${item.emoji}
                        </div>
                        <div class="item-info">
                            <h3>${item.name}</h3>
                            <p class="item-description">${item.description}</p>
                            <div class="item-price">NT$ ${item.price}</div>
                            <button class="add-to-cart-btn" onclick="McDonald.addToCart('${item.id}', '${categoryId}')">
                                加入購物車
                            </button>
                        </div>
                    </div>
                `).join('');
            },

            cartSection() {
                return `
                    <aside class="sidebar">
                        <div id="cart" class="cart">
                            <h2>🛒 我的訂單</h2>
                            <div id="cart-items" class="cart-items">
                                <p class="empty-cart-message">您的購物車是空的</p>
                            </div>
                            <div class="cart-summary">
                                <div class="total">
                                    <span>總計：</span>
                                    <span id="cart-total">NT$ 0</span>
                                </div>
                                <button id="checkout-btn" class="checkout-btn" disabled onclick="McDonald.checkout()">
                                    前往結帳
                                </button>
                            </div>
                        </div>
                    </aside>
                `;
            },

            cartItem(item, quantity) {
                return `
                    <div class="cart-item" data-item-id="${item.id}">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.emoji} ${item.name}</div>
                            <div class="cart-item-price">NT$ ${item.price}</div>
                        </div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" onclick="McDonald.decreaseQuantity('${item.id}')">-</button>
                            <span class="quantity-display">${quantity}</span>
                            <button class="quantity-btn" onclick="McDonald.increaseQuantity('${item.id}')">+</button>
                            <button class="remove-btn" onclick="McDonald.removeFromCart('${item.id}')" title="移除商品">🗑️</button>
                        </div>
                    </div>
                `;
            }
        },

        // =====================================================
        // 初始化系統
        // =====================================================
        init() {
            console.log('[A4-McDonald] 麥當勞點餐系統啟動');

            // 音效解鎖處理
            this.unlockAudio();

            // 初始化各系統
            this.audio.init();
            this.speech.init();

            // 設置父對象引用
            this.audio.parent = this;
            this.speech.parent = this;

            // 設定語音系統事件監聽
            if ('speechSynthesis' in window) {
                speechSynthesis.addEventListener('voiceschanged', () => {
                    this.speech.setupVoice();
                });
            }

            // 渲染初始界面
            this.render();

            // 綁定觸控事件
            this.bindTouchEvents();

            // 初始語音歡迎
            setTimeout(() => {
                this.speech.speak('welcome');
            }, 1000);

            console.log('[A4-McDonald] 系統初始化完成');
        },

        unlockAudio() {
            const unlockAudioContext = () => {
                this.state.audioUnlocked = true;
                console.log('[A4-McDonald] 音頻已解鎖');

                document.removeEventListener('touchstart', unlockAudioContext);
                document.removeEventListener('touchend', unlockAudioContext);
                document.removeEventListener('mousedown', unlockAudioContext);
                document.removeEventListener('keydown', unlockAudioContext);
            };

            document.addEventListener('touchstart', unlockAudioContext, { once: true });
            document.addEventListener('touchend', unlockAudioContext, { once: true });
            document.addEventListener('mousedown', unlockAudioContext, { once: true });
            document.addEventListener('keydown', unlockAudioContext, { once: true });
        },

        // =====================================================
        // 渲染系統
        // =====================================================
        render() {
            const app = document.getElementById('app');
            if (!app) {
                console.error('[A4-McDonald] 找不到app容器');
                return;
            }

            app.innerHTML = `
                ${this.HTMLTemplates.titleBar()}
                ${this.HTMLTemplates.mainContent()}
            `;

            this.updateCartDisplay();
        },

        // =====================================================
        // 主要功能方法
        // =====================================================
        selectCategory(categoryId) {
            this.audio.playSound('beep');
            this.state.gameState.currentCategory = categoryId;

            // 更新分類按鈕狀態
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-category="${categoryId}"]`).classList.add('active');

            // 更新商品顯示
            const itemGrid = document.getElementById('item-grid');
            if (itemGrid) {
                itemGrid.innerHTML = this.HTMLTemplates.menuItems(categoryId);
            }

            // 語音提示
            const categoryName = this.menuConfig.categories.find(c => c.id === categoryId)?.name || categoryId;
            this.speech.speak('categorySelected', { categoryName });

            console.log(`[A4-McDonald] 切換到分類: ${categoryId}`);
        },

        addToCart(itemId, categoryId) {
            const item = this.menuConfig.items[categoryId]?.find(i => i.id === itemId);
            if (!item) {
                console.error('[A4-McDonald] 找不到商品:', itemId);
                return;
            }

            this.audio.playSound('addToCart');

            // 檢查購物車中是否已有此商品
            const existingItem = this.state.gameState.cart.find(cartItem => cartItem.id === itemId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                this.state.gameState.cart.push({
                    ...item,
                    quantity: 1
                });
            }

            // 更新總金額
            this.updateTotalAmount();

            // 更新購物車顯示
            this.updateCartDisplay();

            // 播放動畫
            const itemElement = document.querySelector(`[data-item-id="${itemId}"] .add-to-cart-btn`);
            if (itemElement) {
                itemElement.classList.add('add-to-cart-animation');
                setTimeout(() => {
                    itemElement.classList.remove('add-to-cart-animation');
                }, 600);
            }

            // 語音提示
            this.speech.speak('itemAdded', {
                itemName: item.name,
                price: item.price
            });

            console.log(`[A4-McDonald] 商品加入購物車:`, item.name);
        },

        removeFromCart(itemId) {
            this.audio.playSound('beep');

            const itemIndex = this.state.gameState.cart.findIndex(item => item.id === itemId);
            if (itemIndex > -1) {
                const removedItem = this.state.gameState.cart[itemIndex];
                this.state.gameState.cart.splice(itemIndex, 1);

                this.updateTotalAmount();
                this.updateCartDisplay();

                this.speech.speak('itemRemoved', { itemName: removedItem.name });
                console.log(`[A4-McDonald] 商品從購物車移除:`, removedItem.name);
            }
        },

        increaseQuantity(itemId) {
            this.audio.playSound('beep');

            const item = this.state.gameState.cart.find(cartItem => cartItem.id === itemId);
            if (item) {
                item.quantity++;
                this.updateTotalAmount();
                this.updateCartDisplay();
                this.speech.speak('cartUpdated', { total: this.state.gameState.totalAmount });
            }
        },

        decreaseQuantity(itemId) {
            this.audio.playSound('beep');

            const item = this.state.gameState.cart.find(cartItem => cartItem.id === itemId);
            if (item) {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    this.removeFromCart(itemId);
                    return;
                }
                this.updateTotalAmount();
                this.updateCartDisplay();
                this.speech.speak('cartUpdated', { total: this.state.gameState.totalAmount });
            }
        },

        updateTotalAmount() {
            this.state.gameState.totalAmount = this.state.gameState.cart.reduce(
                (total, item) => total + (item.price * item.quantity), 0
            );
        },

        updateCartDisplay() {
            const cartItemsContainer = document.getElementById('cart-items');
            const cartTotalSpan = document.getElementById('cart-total');
            const checkoutBtn = document.getElementById('checkout-btn');

            if (!cartItemsContainer || !cartTotalSpan || !checkoutBtn) return;

            if (this.state.gameState.cart.length === 0) {
                cartItemsContainer.innerHTML = '<p class="empty-cart-message">您的購物車是空的</p>';
                checkoutBtn.disabled = true;
            } else {
                cartItemsContainer.innerHTML = this.state.gameState.cart
                    .map(item => this.HTMLTemplates.cartItem(item, item.quantity))
                    .join('');
                checkoutBtn.disabled = false;
            }

            cartTotalSpan.textContent = `NT$ ${this.state.gameState.totalAmount}`;
        },

        checkout() {
            if (this.state.gameState.cart.length === 0) {
                this.audio.playSound('error');
                this.speech.speak('cartEmpty');
                return;
            }

            this.audio.playSound('success');
            this.state.gameState.orderNumber++;
            this.state.gameState.completedOrders++;

            this.speech.speak('checkout', { total: this.state.gameState.totalAmount });

            // 模擬結帳處理時間
            setTimeout(() => {
                this.completeOrder();
            }, this.timingConfig[this.state.settings.difficulty]?.checkoutDelay || 1500);
        },

        completeOrder() {
            const orderNumber = this.state.gameState.orderNumber;
            const orderItems = this.state.gameState.cart.slice(); // 複製購物車內容用於收據

            // 顯示訂單完成訊息
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = `
                    <div class="mcdonalds-title-bar">
                        <h1>✅ 訂單完成</h1>
                    </div>
                    <div style="display: flex; justify-content: center; align-items: center; min-height: 70vh; background: linear-gradient(135deg, #ffcc02, #ff8f00); padding: 20px;">
                        <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.2); max-width: 600px; width: 100%;">
                            <h2 style="color: #c62d42; font-size: 2.5em; margin-bottom: 20px; animation: bounce 1s ease;">🎉 感謝您的訂購！</h2>

                            <!-- 訂單號碼 -->
                            <div style="background: linear-gradient(135deg, #ffcc02, #ff8f00); padding: 20px; border-radius: 15px; margin: 20px 0;">
                                <div style="font-size: 4em; margin: 10px 0; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${String(orderNumber).padStart(3, '0')}</div>
                                <div style="font-size: 1.5em; margin-bottom: 10px; color: white; font-weight: 600;">您的訂單號碼</div>
                            </div>

                            <!-- 訂單摘要 -->
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
                                <h3 style="color: #333; margin: 0 0 15px 0; text-align: center;">📋 訂單摘要</h3>
                                ${this.generateOrderSummary(orderItems)}
                                <div style="border-top: 2px solid #ffcc02; padding-top: 15px; margin-top: 15px; text-align: center;">
                                    <strong style="font-size: 1.3em; color: #c62d42;">總計：NT$ ${this.state.gameState.totalAmount}</strong>
                                </div>
                            </div>

                            <div style="font-size: 1.2em; margin-bottom: 30px; color: #666;">請持此號碼至櫃檯取餐</div>
                            <div style="font-size: 1em; margin-bottom: 30px; color: #999;">預計準備時間：5-10分鐘</div>

                            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                                <button onclick="McDonald.printReceipt()" style="background: #4caf50; color: white; border: none; padding: 15px 30px; border-radius: 25px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                                    📄 列印收據
                                </button>
                                <button onclick="McDonald.startOver()" style="background: #ffcc02; color: #333; border: none; padding: 15px 30px; border-radius: 25px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                                    🍔 再次點餐
                                </button>
                                <button onclick="window.history.back()" style="background: #f5f5f5; color: #333; border: 2px solid #ccc; padding: 15px 30px; border-radius: 25px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                                    🏠 返回主選單
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }

            this.speech.speak('orderComplete', { orderNumber });
            console.log(`[A4-McDonald] 訂單完成，訂單號碼: ${orderNumber}`);
        },

        generateOrderSummary(orderItems) {
            return orderItems.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2em;">${item.emoji}</span>
                        <span style="font-weight: 600;">${item.name}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="color: #666;">x${item.quantity}</span>
                        <span style="font-weight: 600; color: #c62d42;">NT$ ${item.price * item.quantity}</span>
                    </div>
                </div>
            `).join('');
        },

        printReceipt() {
            this.audio.playSound('beep');

            // 模擬列印收據
            const printWindow = window.open('', '_blank', 'width=400,height=600');
            const orderNumber = this.state.gameState.orderNumber;
            const now = new Date();

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>麥當勞收據 - ${orderNumber}</title>
                    <style>
                        body {
                            font-family: 'Courier New', monospace;
                            max-width: 350px;
                            margin: 0 auto;
                            padding: 20px;
                            font-size: 12px;
                            line-height: 1.4;
                        }
                        .header {
                            text-align: center;
                            border-bottom: 2px dashed #333;
                            padding-bottom: 15px;
                            margin-bottom: 15px;
                        }
                        .logo {
                            font-size: 24px;
                            margin-bottom: 5px;
                        }
                        .item {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 8px;
                        }
                        .total {
                            border-top: 2px solid #333;
                            padding-top: 10px;
                            margin-top: 15px;
                            font-weight: bold;
                            font-size: 14px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            border-top: 1px dashed #333;
                            padding-top: 15px;
                            font-size: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">🍔 麥當勞 McDonald's</div>
                        <div>歡迎光臨</div>
                        <div>Self-Service Kiosk</div>
                    </div>

                    <div>訂單編號: ${String(orderNumber).padStart(3, '0')}</div>
                    <div>日期: ${now.toLocaleDateString('zh-TW')}</div>
                    <div>時間: ${now.toLocaleTimeString('zh-TW')}</div>
                    <br>

                    ${this.state.gameState.cart.map(item => `
                        <div class="item">
                            <div>${item.emoji} ${item.name} x${item.quantity}</div>
                            <div>$${item.price * item.quantity}</div>
                        </div>
                    `).join('')}

                    <div class="total">
                        <div class="item">
                            <div>總計 Total</div>
                            <div>NT$ ${this.state.gameState.totalAmount}</div>
                        </div>
                    </div>

                    <div class="footer">
                        <div>謝謝您的光臨！</div>
                        <div>Thank you for your visit!</div>
                        <div>請至櫃檯取餐</div>
                        <div>預計準備時間: 5-10分鐘</div>
                        <br>
                        <div>|||| |||| ||||</div>
                        <div>條碼: ${orderNumber}${Date.now().toString().slice(-4)}</div>
                    </div>
                </body>
                </html>
            `);

            printWindow.document.close();

            setTimeout(() => {
                printWindow.print();
            }, 500);

            this.speech.speak('orderComplete', { orderNumber: `收據已準備，訂單號碼${orderNumber}` });
            console.log(`[A4-McDonald] 收據已列印，訂單號碼: ${orderNumber}`);
        },

        startOver() {
            this.audio.playSound('beep');

            // 重置狀態
            this.state.gameState.cart = [];
            this.state.gameState.totalAmount = 0;
            this.state.gameState.currentCategory = 'burgers';

            // 重新渲染
            this.render();

            // 語音歡迎
            setTimeout(() => {
                this.speech.speak('welcome');
            }, 500);

            console.log('[A4-McDonald] 系統重新開始');
        },

        // =====================================================
        // 鍵盤快捷鍵處理
        // =====================================================
        handleQuickAdd(number) {
            const currentItems = this.menuConfig.items[this.state.gameState.currentCategory] || [];
            if (number >= 1 && number <= currentItems.length) {
                const item = currentItems[number - 1];
                this.addToCart(item.id, this.state.gameState.currentCategory);
            }
        },

        handleCheckout() {
            this.checkout();
        },

        handleCancelKey() {
            // 清空購物車或返回上一步
            if (this.state.gameState.cart.length > 0) {
                this.state.gameState.cart = [];
                this.state.gameState.totalAmount = 0;
                this.updateCartDisplay();
                this.audio.playSound('beep');
                this.speech.speak('cartEmpty');
            }
        },

        // =====================================================
        // 觸控事件處理系統
        // =====================================================
        bindTouchEvents() {
            // 防止觸控時的雙重觸發
            let touchHandled = false;
            let touchStartTime = 0;

            document.addEventListener('touchstart', (e) => {
                touchHandled = true;
                touchStartTime = Date.now();

                // 為觸控元素添加視覺回饋
                if (e.target.classList.contains('menu-item') ||
                    e.target.classList.contains('add-to-cart-btn') ||
                    e.target.classList.contains('category-btn') ||
                    e.target.classList.contains('quantity-btn') ||
                    e.target.classList.contains('checkout-btn')) {
                    e.target.style.transform = 'scale(0.95)';
                    e.target.style.transition = 'transform 0.1s ease';
                }

                setTimeout(() => touchHandled = false, 300);
            }, { passive: false });

            document.addEventListener('touchend', (e) => {
                const touchDuration = Date.now() - touchStartTime;

                // 恢復元素原狀
                if (e.target.classList.contains('menu-item') ||
                    e.target.classList.contains('add-to-cart-btn') ||
                    e.target.classList.contains('category-btn') ||
                    e.target.classList.contains('quantity-btn') ||
                    e.target.classList.contains('checkout-btn')) {
                    setTimeout(() => {
                        e.target.style.transform = '';
                    }, 100);
                }

                // 如果是有效的點擊（不是滑動）
                if (touchDuration < 500) {
                    this.handleTouchTap(e);
                }
            }, { passive: false });

            // 防止點擊事件在觸控後重複觸發
            document.addEventListener('click', (e) => {
                if (touchHandled) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }, { capture: true });

            // 改善滾動體驗
            this.optimizeScrolling();

            console.log('[A4-McDonald] 觸控事件已綁定');
        },

        handleTouchTap(event) {
            event.preventDefault();

            const target = event.target;
            const closest = target.closest.bind(target);

            // 處理分類按鈕
            if (target.classList.contains('category-btn')) {
                const categoryId = target.dataset.category;
                if (categoryId) {
                    this.selectCategory(categoryId);
                }
                return;
            }

            // 處理加入購物車按鈕
            if (target.classList.contains('add-to-cart-btn')) {
                const menuItem = closest('.menu-item');
                if (menuItem) {
                    const itemId = menuItem.dataset.itemId;
                    if (itemId) {
                        this.addToCart(itemId, this.state.gameState.currentCategory);
                    }
                }
                return;
            }

            // 處理數量調整按鈕
            if (target.classList.contains('quantity-btn')) {
                const cartItem = closest('.cart-item');
                if (cartItem) {
                    const itemId = cartItem.dataset.itemId;
                    if (target.textContent.includes('+')) {
                        this.increaseQuantity(itemId);
                    } else if (target.textContent.includes('-')) {
                        this.decreaseQuantity(itemId);
                    }
                }
                return;
            }

            // 處理移除按鈕
            if (target.classList.contains('remove-btn')) {
                const cartItem = closest('.cart-item');
                if (cartItem) {
                    const itemId = cartItem.dataset.itemId;
                    this.removeFromCart(itemId);
                }
                return;
            }

            // 處理結帳按鈕
            if (target.classList.contains('checkout-btn') && !target.disabled) {
                this.checkout();
                return;
            }
        },

        optimizeScrolling() {
            // 為可滾動區域添加動量滾動
            const scrollableElements = document.querySelectorAll('.item-grid, .cart-items');

            scrollableElements.forEach(element => {
                element.style.webkitOverflowScrolling = 'touch';
                element.style.overflowScrolling = 'touch';
            });

            // 防止整頁滾動
            document.body.style.overscroll = 'none';
            document.body.style.overscrollBehavior = 'none';

            // 禁用選中和長按選單
            document.body.style.webkitUserSelect = 'none';
            document.body.style.userSelect = 'none';
            document.body.style.webkitTouchCallout = 'none';
        }
    };

    // =====================================================
    // 將 McDonald 對象暴露到全域作用域
    // =====================================================
    window.McDonald = McDonald;

    // 立即初始化系統
    McDonald.init();
});

console.log('[A4-McDonald] 麥當勞點餐系統腳本載入完成');