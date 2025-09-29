// =================================================================
/**
 * @file a3_barber_shop_kiosk.js
 * @description A3 理髮店售票機模擬學習單元 - 配置驅動版本
 * @unit A3 - 理髮店售票機操作學習
 * @version 1.0.0 - 基於A2架構開發
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
// 基於A2架構的理髮店售票機開發
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const BarberKiosk = {
        // =====================================================
        // 狀態管理系統（基於A2架構）
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
                currentScene: 'welcome',     // welcome, service-selection, payment, printing, complete
                currentStep: 0,              // 當前操作步驟
                totalSteps: 4,               // 總步驟數：歡迎→選擇服務→付款→取票
                selectedService: null,       // 選擇的服務項目
                requiredAmount: 0,           // 需要金額
                insertedAmount: 0,           // 已投入金額
                paymentComplete: false,      // 付款是否完成
                ticketPrinted: false,        // 票券是否已列印
                isProcessing: false,         // 是否正在處理
                showingModal: false,         // 是否顯示模態視窗
                queueNumber: 1,              // 等候號碼
                // 遊戲化元素
                experience: 0,               // 經驗值
                level: 1,                   // 等級
                completedOrders: 0          // 完成訂單數
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
        // 配置驅動系統 - 服務項目配置
        // =====================================================
        serviceConfig: {
            easy: {
                services: [
                    {
                        id: 'mens_cut',
                        name: '男士剪髮',
                        price: 150,
                        icon: '👨‍🦱✂️',
                        description: '基本剪髮服務',
                        keyShortcut: '1'
                    },
                    {
                        id: 'womens_cut',
                        name: '女士剪髮',
                        price: 200,
                        icon: '👩‍🦱✂️',
                        description: '女士剪髮造型',
                        keyShortcut: '2'
                    },
                    {
                        id: 'wash',
                        name: '洗髮',
                        price: 30,
                        icon: '🚿💧',
                        description: '洗髮護理',
                        keyShortcut: '3'
                    },
                    {
                        id: 'color',
                        name: '染髮',
                        price: 500,
                        icon: '🎨🖌️',
                        description: '專業染髮',
                        keyShortcut: '4'
                    },
                    {
                        id: 'scalp_isolation',
                        name: '頭皮隔離',
                        price: 250,
                        icon: '🛡️🧴',
                        description: '頭皮保護隔離',
                        keyShortcut: '5'
                    },
                    {
                        id: 'head_massage',
                        name: '頭皮按摩',
                        price: 150,
                        icon: '🧘‍♀️💆',
                        description: '放鬆頭皮按摩',
                        keyShortcut: '6'
                    }
                ],
                acceptedMoney: [100, 50, 10, 5, 1] // 接受的金額面額
            },
            normal: {
                services: [
                    {
                        id: 'mens_cut',
                        name: '男士剪髮',
                        price: 150,
                        icon: '👨‍🦱✂️',
                        description: '基本剪髮服務',
                        keyShortcut: '1'
                    },
                    {
                        id: 'womens_cut',
                        name: '女士剪髮',
                        price: 200,
                        icon: '👩‍🦱✂️',
                        description: '女士剪髮造型',
                        keyShortcut: '2'
                    },
                    {
                        id: 'wash',
                        name: '洗髮',
                        price: 30,
                        icon: '🚿💧',
                        description: '洗髮護理',
                        keyShortcut: '3'
                    },
                    {
                        id: 'color',
                        name: '染髮',
                        price: 500,
                        icon: '🎨🖌️',
                        description: '專業染髮',
                        keyShortcut: '4'
                    },
                    {
                        id: 'scalp_isolation',
                        name: '頭皮隔離',
                        price: 250,
                        icon: '🛡️🧴',
                        description: '頭皮保護隔離',
                        keyShortcut: '5'
                    },
                    {
                        id: 'head_massage',
                        name: '頭皮按摩',
                        price: 150,
                        icon: '🧘‍♀️💆',
                        description: '放鬆頭皮按摩',
                        keyShortcut: '6'
                    }
                ],
                acceptedMoney: [100, 50, 10, 5, 1]
            },
            hard: {
                services: [
                    {
                        id: 'mens_cut',
                        name: '男士剪髮',
                        price: 150,
                        icon: '👨‍🦱✂️',
                        description: '基本剪髮服務',
                        keyShortcut: '1'
                    },
                    {
                        id: 'womens_cut',
                        name: '女士剪髮',
                        price: 200,
                        icon: '👩‍🦱✂️',
                        description: '女士剪髮造型',
                        keyShortcut: '2'
                    },
                    {
                        id: 'wash',
                        name: '洗髮',
                        price: 30,
                        icon: '🚿💧',
                        description: '洗髮護理',
                        keyShortcut: '3'
                    },
                    {
                        id: 'color',
                        name: '染髮',
                        price: 500,
                        icon: '🎨🖌️',
                        description: '專業染髮',
                        keyShortcut: '4'
                    },
                    {
                        id: 'scalp_isolation',
                        name: '頭皮隔離',
                        price: 250,
                        icon: '🛡️🧴',
                        description: '頭皮保護隔離',
                        keyShortcut: '5'
                    },
                    {
                        id: 'head_massage',
                        name: '頭皮按摩',
                        price: 150,
                        icon: '🧘‍♀️💆',
                        description: '放鬆頭皮按摩',
                        keyShortcut: '6'
                    }
                ],
                acceptedMoney: [100, 50, 10, 5, 1]
            }
        },

        // =====================================================
        // 配置驅動系統 - 語音模板配置
        // =====================================================
        speechTemplates: {
            easy: {
                welcome: '歡迎光臨理髮店！請點選您需要的服務項目',
                serviceSelected: '您選擇了{serviceName}，費用是{price}元',
                paymentInstructions: '請投入{amount}元，本機只收百元紙鈔和硬幣',
                paymentReceived: '已收到{amount}元',
                paymentComplete: '付款完成！正在為您列印票據',
                ticketReady: '請取走您的號碼牌，號碼是{queueNumber}號',
                noChange: '本機不找零，請投入正確金額',
                insufficient: '金額不足，還需要{remaining}元',
                refund: '已退回{amount}元，感謝使用'
            },
            normal: {
                welcome: '歡迎光臨百元理髮店！請選擇您需要的服務項目',
                serviceSelected: '您選擇了{serviceName}，服務費用是{price}元，請準備付款',
                paymentInstructions: '請投入{amount}元，接受百元紙鈔和1、5、10、50元硬幣',
                paymentReceived: '已收到{amount}元，謝謝您的付款',
                paymentComplete: '付款完成！系統正在為您列印服務票據',
                ticketReady: '票據列印完成，請取走您的號碼牌。您的號碼是{queueNumber}號，請依序等候',
                noChange: '重要提醒：本機不找零，請投入正確金額',
                insufficient: '付款金額不足，還需要投入{remaining}元',
                refund: '系統已退回{amount}元，感謝您的使用'
            },
            hard: {
                welcome: '歡迎光臨百元理髮店自助服務機！請仔細選擇您需要的服務項目',
                serviceSelected: '您已選擇{serviceName}服務，服務費用為{price}元，請確認後進行付款',
                paymentInstructions: '請投入總金額{amount}元，本機接受百元紙鈔和1、5、10、50元硬幣，不提供找零服務',
                paymentReceived: '系統已收到{amount}元付款，感謝您的配合',
                paymentComplete: '付款程序完成！系統正在列印您的服務票據和排隊號碼',
                ticketReady: '服務票據列印完成，請務必取走您的號碼牌。您的排隊號碼是{queueNumber}號，請按照號碼順序等候服務，本券限當日使用',
                noChange: '重要警告：本機器不提供找零服務，請務必投入正確金額',
                insufficient: '付款金額不足，系統顯示還需要投入{remaining}元才能完成交易',
                refund: '系統正在退回您投入的{amount}元，請稍候並感謝您的使用'
            }
        },

        // =====================================================
        // 配置驅動系統 - 時間配置
        // =====================================================
        timingConfig: {
            easy: {
                speechDelay: 500,
                sceneTransition: 1000,
                paymentDelay: 1500,
                printingTime: 2000,
                animationDuration: 800
            },
            normal: {
                speechDelay: 300,
                sceneTransition: 800,
                paymentDelay: 1200,
                printingTime: 2500,
                animationDuration: 600
            },
            hard: {
                speechDelay: 200,
                sceneTransition: 600,
                paymentDelay: 1000,
                printingTime: 3000,
                animationDuration: 400
            }
        },

        // =====================================================
        // 音效和語音系統（基於A2）
        // =====================================================
        audio: {
            beepSound: null,
            errorSound: null,
            successSound: null,
            cashSound: null,
            printSound: null,

            init() {
                try {
                    this.beepSound = new Audio('../audio/click.mp3');
                    this.beepSound.preload = 'auto';
                    this.beepSound.volume = 0.6;

                    this.errorSound = new Audio('../audio/error.mp3');
                    this.errorSound.preload = 'auto';
                    this.errorSound.volume = 0.5;

                    this.successSound = new Audio('../audio/correct02.mp3');
                    this.successSound.preload = 'auto';
                    this.successSound.volume = 0.7;

                    this.cashSound = new Audio('../audio/correct02.mp3');
                    this.cashSound.preload = 'auto';
                    this.cashSound.volume = 0.7;

                    this.printSound = new Audio('../audio/click.mp3');
                    this.printSound.preload = 'auto';
                    this.printSound.volume = 0.8;

                    console.log('[A3-Kiosk] 音效系統初始化完成');
                } catch (error) {
                    console.error('[A3-Kiosk] 音效初始化錯誤:', error);
                }
            },

            playSound(soundType, callback = null) {
                if (!BarberKiosk.state.settings.audioEnabled || !BarberKiosk.state.audioUnlocked) {
                    if (callback) callback();
                    return;
                }

                try {
                    let sound = null;
                    switch (soundType) {
                        case 'beep': sound = this.beepSound; break;
                        case 'error': sound = this.errorSound; break;
                        case 'success': sound = this.successSound; break;
                        case 'cash': sound = this.cashSound; break;
                        case 'print': sound = this.printSound; break;
                        case 'click': sound = this.beepSound; break; // 使用beep聲音作為click
                        default:
                            console.warn('[A3-Kiosk] 未知音效類型:', soundType);
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
                                    console.warn('[A3-Kiosk] 音效播放失敗:', error);
                                    if (callback) callback();
                                });
                        } else if (callback) {
                            setTimeout(callback, 500);
                        }
                    } else if (callback) {
                        callback();
                    }
                } catch (error) {
                    console.error('[A3-Kiosk] 音效播放錯誤:', error);
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

            init() {
                if ('speechSynthesis' in window) {
                    this.synth = window.speechSynthesis;
                    this.setupVoice();
                    console.log('[A3-Kiosk] 語音系統初始化完成');
                } else {
                    console.warn('[A3-Kiosk] 瀏覽器不支援語音合成');
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
                    console.log('[A3-Kiosk] 使用語音:', this.voice.name);
                }
            },

            speak(templateKey, replacements = {}, callback = null) {
                if (!BarberKiosk.state.settings.speechEnabled || !this.synth || !this.voice) {
                    if (callback) callback();
                    return;
                }

                try {
                    const difficulty = BarberKiosk.state.settings.difficulty;
                    const template = BarberKiosk.speechTemplates[difficulty]?.[templateKey];

                    if (!template) {
                        console.warn('[A3-Kiosk] 找不到語音模板:', templateKey);
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
                    utterance.rate = 1.0;
                    utterance.lang = this.voice.lang;

                    utterance.onend = () => {
                        if (callback) callback();
                    };

                    utterance.onerror = (event) => {
                        console.error('[A3-Kiosk] 語音播放錯誤:', event);
                        if (callback) callback();
                    };

                    const delay = BarberKiosk.timingConfig[difficulty]?.speechDelay || 300;
                    setTimeout(() => {
                        this.synth.speak(utterance);
                    }, delay);

                } catch (error) {
                    console.error('[A3-Kiosk] 語音系統錯誤:', error);
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
                    <div class="kiosk-title-bar">
                        <h1>🏪 百元理髮店</h1>
                        <div class="kiosk-subtitle">自助售票機 | 請選擇服務項目</div>
                    </div>
                `;
            },

            kioskBody() {
                return `
                    <div class="kiosk-body">
                        <!-- 左側面板 -->
                        <div class="kiosk-left-panel">
                            ${this.amountDisplayArea()}
                            ${this.billSlotArea()}
                            ${this.coinSlotArea()}
                        </div>

                        <!-- 中央面板 -->
                        <div class="kiosk-center-panel">
                            ${this.kioskScreen()}
                        </div>

                        <!-- 右側面板 -->
                        <div class="kiosk-right-panel">
                            ${this.ticketDispenserArea()}
                        </div>
                    </div>
                `;
            },

            // 🎯 新增：獨立金額顯示區域（置頂）
            amountDisplayArea() {
                return `
                    <div class="amount-display-area">
                        <div class="money-display" id="money-display">
                            <div class="money-amount">NT$ <span id="inserted-amount">0</span></div>
                            <div class="money-needed">還需要: NT$ <span id="needed-amount">0</span></div>
                            <div class="money-status" id="money-status">請選擇服務項目</div>
                        </div>
                    </div>
                `;
            },

            billSlotArea() {
                return `
                    <div class="bill-slot-area">
                        <div class="bill-printer" onclick="BarberKiosk.showMoneySelection('bill')">
                            <div class="bill-slot-label">💸 紙鈔入口</div>
                            <div class="bill-slot">
                                <div class="bill-slot-label">點擊選擇紙鈔</div>
                                <div class="bill-opening"></div>
                            </div>
                        </div>
                    </div>
                `;
            },

            coinSlotArea() {
                return `
                    <div class="coin-slot-area">
                        <div class="coin-printer" onclick="BarberKiosk.showMoneySelection('coin')">
                            <div class="coin-slot-label">🪙 硬幣入口</div>
                            <div class="coin-slot">
                                <div class="coin-slot-label">點擊選擇硬幣</div>
                                <div class="coin-opening"></div>
                            </div>
                        </div>
                    </div>
                `;
            },

            ticketDispenserArea() {
                return `
                    <div class="ticket-dispenser-area">
                        <div class="ticket-printer">
                            <div class="ticket-slot-label">🎫 票券出口</div>
                            <div class="ticket-slot">
                                <div class="ticket-opening"></div>
                                <div class="ticket-output" id="ticket-output"></div>
                            </div>
                        </div>
                    </div>
                `;
            },

            kioskScreen() {
                return `
                    <div class="kiosk-screen">
                        <div class="screen-content" id="screen-content">
                            ${this.welcomeScreen()}
                        </div>
                    </div>
                `;
            },

            welcomeScreen() {
                return `
                    <div class="welcome-screen slide-in-bottom">
                        <h2>🏪 歡迎光臨百元理髮店</h2>
                        <p>請點選您需要的服務項目</p>
                        <div class="progress-indicator">
                            <div class="progress-step active"></div>
                            <div class="progress-step"></div>
                            <div class="progress-step"></div>
                            <div class="progress-step"></div>
                        </div>
                        <div class="action-buttons">
                            <button class="action-btn" onclick="BarberKiosk.showServiceSelection()">
                                開始選擇服務
                            </button>
                        </div>
                    </div>
                `;
            },

            serviceSelectionScreen(services) {
                return `
                    <div class="service-selection-screen slide-in-left">
                        <h2>請選擇服務項目</h2>
                        <div class="progress-indicator">
                            <div class="progress-step completed"></div>
                            <div class="progress-step active"></div>
                            <div class="progress-step"></div>
                            <div class="progress-step"></div>
                        </div>
                        <div class="service-grid">
                            ${services.map(service => `
                                <div class="service-item" onclick="BarberKiosk.selectService('${service.id}')"
                                     data-service-id="${service.id}">
                                    <div class="service-icon">${service.icon}</div>
                                    <div class="service-name">${service.name}</div>
                                    <div class="service-price">NT$ ${service.price}</div>
                                    <div class="service-description">${service.description}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="action-buttons">
                            <button class="action-btn secondary" onclick="BarberKiosk.goBack()">
                                返回
                            </button>
                        </div>
                    </div>
                `;
            },

            paymentScreen(service) {
                return `
                    <div class="payment-screen slide-in-right">
                        <h2>💰 請投入金額</h2>
                        <div class="progress-indicator">
                            <div class="progress-step completed"></div>
                            <div class="progress-step completed"></div>
                            <div class="progress-step active"></div>
                            <div class="progress-step"></div>
                        </div>
                        <div class="selected-service">
                            <div class="service-icon">${service.icon}</div>
                            <div class="service-name">${service.name}</div>
                            <div class="service-price">NT$ ${service.price}</div>
                        </div>
                        <div class="warning-message">
                            ⚠️ 本機不找零，請投入正確金額
                        </div>
                        <div class="info-message">
                            請使用左側投幣口投入 NT$ ${service.price}
                        </div>
                        <div class="action-buttons">
                            <button class="action-btn secondary" onclick="BarberKiosk.cancelPayment()">
                                取消付款
                            </button>
                        </div>
                    </div>
                `;
            },

            completionScreen(service, queueNumber) {
                return `
                    <div class="completion-screen slide-in-bottom">
                        <h2>✅ 付款完成</h2>
                        <div class="progress-indicator">
                            <div class="progress-step completed"></div>
                            <div class="progress-step completed"></div>
                            <div class="progress-step completed"></div>
                            <div class="progress-step completed"></div>
                        </div>
                        <div class="success-message">
                            感謝您的付款！正在列印票據...
                        </div>
                        <div class="queue-info">
                            <div class="queue-number">${queueNumber}</div>
                            <div class="queue-label">您的號碼</div>
                        </div>
                        <div class="action-buttons">
                            <button class="action-btn success" onclick="BarberKiosk.takeTicket()">
                                取走票據
                            </button>
                            <button class="action-btn secondary" onclick="BarberKiosk.startOver()">
                                重新開始
                            </button>
                        </div>
                    </div>
                `;
            },

            ticketTemplate(service, queueNumber) {
                const now = new Date();
                const dateStr = now.toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                const timeStr = now.toLocaleTimeString('zh-TW', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });

                // 生成簡單的一維條碼
                const barcode = this.generateBarcode(queueNumber);

                return `
                    <div class="ticket-header">
                        <h3>✂️ 百元理髮店</h3>
                        <div class="shop-logo">🏪</div>
                        <div class="shop-info">專業理髮 | 價格實在 | 服務到家</div>
                        <div class="shop-address">台灣理髮店聯盟認證店家</div>
                    </div>
                    <div class="ticket-body">
                        <div class="service-section">
                            <div class="service-title">📋 服務明細</div>
                            <div class="service-details">
                                <div class="detail-row">
                                    <span class="detail-label">服務項目：</span>
                                    <span class="detail-value">${service.name}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">服務圖示：</span>
                                    <span class="detail-value">${service.icon}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">服務金額：</span>
                                    <span class="detail-value price">NT$ ${service.price}</span>
                                </div>
                            </div>
                        </div>

                        <div class="queue-section">
                            <div class="queue-title">🎫 排隊資訊</div>
                            <div class="queue-number-display">
                                <div class="queue-label">您的號碼</div>
                                <div class="queue-number-big">${String(queueNumber).padStart(2, '0')}</div>
                            </div>
                        </div>

                        <div class="barcode-section">
                            <div class="ticket-barcode">
                                ${barcode}
                            </div>
                            <div class="barcode-number">
                                NO. ${String(queueNumber).padStart(4, '0')}
                            </div>
                        </div>

                        <div class="notes-section">
                            <div class="important-notes">
                                <div class="note-title">⚠️ 重要提醒</div>
                                <div class="note-list">
                                    • 請依號碼順序等候<br>
                                    • 本券限當日使用，隔日作廢<br>
                                    • 請保管好您的號碼牌<br>
                                    • 如有問題請洽櫃檯人員
                                </div>
                            </div>
                        </div>

                        <div class="ticket-footer">
                            <div class="print-info">
                                <div class="print-date">列印日期：${dateStr}</div>
                                <div class="print-time">列印時間：${timeStr}</div>
                            </div>
                            <div class="machine-info">
                                機器編號：K001 | 版本：A3-V1.0
                            </div>
                        </div>
                    </div>
                `;
            },

            moneySelectionModal(type) {
                const bills = [
                    { value: 100, icon: '../images/100_yuan_front.png', name: '100元紙鈔' },
                    { value: 500, icon: '../images/500_yuan_front.png', name: '500元紙鈔' },
                    { value: 1000, icon: '../images/1000_yuan_front.png', name: '1000元紙鈔' }
                ];

                const coins = [
                    { value: 1, icon: '../images/1_yuan_front.png', name: '1元硬幣' },
                    { value: 5, icon: '../images/5_yuan_front.png', name: '5元硬幣' },
                    { value: 10, icon: '../images/10_yuan_front.png', name: '10元硬幣' },
                    { value: 50, icon: '../images/50_yuan_front.png', name: '50元硬幣' }
                ];

                const items = type === 'bill' ? bills : coins;
                const title = type === 'bill' ? '選擇紙鈔' : '選擇硬幣';

                return `
                    <div id="money-selection-modal" class="money-selection-modal">
                        <div class="modal-overlay" onclick="BarberKiosk.closeMoneySelection()"></div>
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3>💰 ${title}</h3>
                                <button class="close-btn" onclick="BarberKiosk.closeMoneySelection()">✕</button>
                            </div>
                            <div class="modal-body">
                                <div class="money-grid">
                                    ${items.map(item => `
                                        <div class="money-option" onclick="BarberKiosk.selectMoney(${item.value})" data-value="${item.value}">
                                            <div class="money-icon">
                                                <img src="${item.icon}" alt="${item.name}" class="money-image"
                                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                                <div style="display:none; font-size:2em;">${type === 'bill' ? '💵' : '🪙'}</div>
                                            </div>
                                            <div class="money-name">${item.name}</div>
                                            <div class="money-value">NT$ ${item.value}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            },

            generateBarcode(number) {
                // 生成簡單的一維條碼樣式
                const patterns = ['|||', '||| ', '|| |', '| ||', ' |||', '| | |', '||  ', ' || ', '  ||'];
                let barcode = '';
                const numStr = String(number).padStart(3, '0');

                for (let i = 0; i < numStr.length; i++) {
                    const digit = parseInt(numStr[i]);
                    barcode += patterns[digit] + ' ';
                }

                return barcode.trim();
            }
        },

        // =====================================================
        // 初始化系統
        // =====================================================
        init() {
            console.log('[A3-Kiosk] 理髮店售票機系統啟動');

            // 音效解鎖處理
            this.unlockAudio();

            // 初始化各系統
            this.audio.init();
            this.speech.init();

            // 設定語音系統事件監聽
            if ('speechSynthesis' in window) {
                speechSynthesis.addEventListener('voiceschanged', () => {
                    this.speech.setupVoice();
                });
            }

            // 渲染初始界面
            this.render();

            // 綁定事件監聽器
            this.bindEvents();

            console.log('[A3-Kiosk] 系統初始化完成');
        },

        unlockAudio() {
            const unlockAudioContext = () => {
                this.state.audioUnlocked = true;
                console.log('[A3-Kiosk] 音頻已解鎖');

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
                console.error('[A3-Kiosk] 找不到app容器');
                return;
            }

            app.innerHTML = `
                ${this.HTMLTemplates.titleBar()}
                ${this.HTMLTemplates.kioskBody()}
            `;

            this.updateMoneyDisplay();
        },

        updateScreen(content) {
            const screenContent = document.getElementById('screen-content');
            if (screenContent) {
                screenContent.innerHTML = content;
            }
        },

        updateMoneyDisplay() {
            const insertedAmountEl = document.getElementById('inserted-amount');
            const neededAmountEl = document.getElementById('needed-amount');
            const moneyStatusEl = document.getElementById('money-status');

            if (insertedAmountEl) insertedAmountEl.textContent = this.state.gameState.insertedAmount;
            if (neededAmountEl) neededAmountEl.textContent = Math.max(0, this.state.gameState.requiredAmount - this.state.gameState.insertedAmount);

            if (moneyStatusEl) {
                if (this.state.gameState.selectedService) {
                    if (this.state.gameState.insertedAmount >= this.state.gameState.requiredAmount) {
                        moneyStatusEl.textContent = '付款完成，請取票';
                        moneyStatusEl.style.color = '#4caf50';
                    } else {
                        moneyStatusEl.textContent = '請繼續投幣';
                        moneyStatusEl.style.color = '#f44336';
                    }
                } else {
                    moneyStatusEl.textContent = '請選擇服務項目';
                    moneyStatusEl.style.color = '#fff';
                }
            }
        },

        // =====================================================
        // 主要操作流程
        // =====================================================
        showServiceSelection() {
            this.audio.playSound('beep');
            this.state.gameState.currentScene = 'service-selection';
            this.state.gameState.currentStep = 1;

            const difficulty = this.state.settings.difficulty;
            const services = this.serviceConfig[difficulty].services;

            this.updateScreen(this.HTMLTemplates.serviceSelectionScreen(services));
            this.speech.speak('welcome');
        },

        selectService(serviceId) {
            this.audio.playSound('beep');

            const difficulty = this.state.settings.difficulty;
            const service = this.serviceConfig[difficulty].services.find(s => s.id === serviceId);

            if (!service) {
                console.error('[A3-Kiosk] 找不到服務:', serviceId);
                return;
            }

            this.state.gameState.selectedService = service;
            this.state.gameState.requiredAmount = service.price;
            this.state.gameState.currentScene = 'payment';
            this.state.gameState.currentStep = 2;

            // 高亮選中的服務
            document.querySelectorAll('.service-item').forEach(item => {
                item.classList.remove('selected');
            });
            document.querySelector(`[data-service-id="${serviceId}"]`)?.classList.add('selected');

            // 延遲切換到付款畫面
            setTimeout(() => {
                this.updateScreen(this.HTMLTemplates.paymentScreen(service));
                this.updateMoneyDisplay();
                // 票據預覽功能已移除

                this.speech.speak('serviceSelected', {
                    serviceName: service.name,
                    price: service.price
                });

                setTimeout(() => {
                    this.speech.speak('paymentInstructions', {
                        amount: service.price
                    });
                }, 2000);

            }, this.timingConfig[difficulty]?.sceneTransition || 800);
        },

        // 顯示金錢選擇模態窗口
        showMoneySelection(type) {
            if (this.state.gameState.currentScene !== 'payment' || !this.state.gameState.selectedService) {
                this.audio.playSound('error');
                this.showPaymentError('請先選擇服務項目');
                return;
            }

            const modalHTML = this.HTMLTemplates.moneySelectionModal(type);
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHTML;
            document.body.appendChild(modalContainer.firstElementChild);

            // 添加顯示動畫
            const modal = document.getElementById('money-selection-modal');
            if (modal) {
                modal.classList.add('show');
            }

            this.audio.playSound('click');
        },

        // 關閉金錢選擇模態窗口
        closeMoneySelection() {
            const modal = document.getElementById('money-selection-modal');
            if (modal) {
                modal.remove();
            }
        },

        // 選擇金錢並投入
        selectMoney(amount) {
            this.insertMoney(amount);
            this.closeMoneySelection();
        },

        insertMoney(amount) {
            if (this.state.gameState.currentScene !== 'payment' || !this.state.gameState.selectedService) {
                this.audio.playSound('error');
                this.showPaymentError('請先選擇服務項目');
                return;
            }

            // 檢查是否接受此面額
            const difficulty = this.state.settings.difficulty;
            const acceptedMoney = this.serviceConfig[difficulty].acceptedMoney;

            if (!acceptedMoney.includes(amount)) {
                this.audio.playSound('error');
                this.showPaymentError(`不接受 ${amount} 元面額`);
                this.speech.speak('noChange');
                return;
            }

            // 檢查是否會超額付款
            const newAmount = this.state.gameState.insertedAmount + amount;
            if (newAmount > this.state.gameState.requiredAmount) {
                this.audio.playSound('error');
                this.showPaymentError('投入金額超過所需，本機不找零');
                this.speech.speak('noChange');
                return;
            }

            // 播放投幣音效和動畫
            this.audio.playSound('cash');
            this.playMoneyAnimation(amount);
            this.state.gameState.insertedAmount = newAmount;

            console.log(`[A3-Kiosk] 投入 ${amount} 元，累計 ${this.state.gameState.insertedAmount} 元`);

            this.updateMoneyDisplay();
            this.speech.speak('paymentReceived', { amount: this.state.gameState.insertedAmount });

            // 檢查是否付款完成
            if (this.state.gameState.insertedAmount >= this.state.gameState.requiredAmount) {
                setTimeout(() => {
                    this.completePayment();
                }, this.timingConfig[difficulty]?.paymentDelay || 1200);
            } else {
                const remaining = this.state.gameState.requiredAmount - this.state.gameState.insertedAmount;
                setTimeout(() => {
                    this.speech.speak('insufficient', { remaining });
                }, 1000);
            }
        },

        playMoneyAnimation(amount) {
            if (amount === 100) {
                // 紙鈔動畫
                const billAnimation = document.getElementById('bill-animation');
                if (billAnimation) {
                    billAnimation.classList.remove('inserting');
                    setTimeout(() => {
                        billAnimation.classList.add('inserting');
                        setTimeout(() => {
                            billAnimation.classList.remove('inserting');
                        }, 800);
                    }, 100);
                }
            } else {
                // 硬幣動畫
                const coinItem = document.querySelector(`[data-value="${amount}"]`);
                if (coinItem) {
                    coinItem.style.transform = 'scale(1.5) rotate(360deg)';
                    coinItem.style.boxShadow = '0 0 20px rgba(255, 193, 7, 0.8)';
                    setTimeout(() => {
                        coinItem.style.transform = '';
                        coinItem.style.boxShadow = '';
                    }, 600);
                }
            }
        },

        showPaymentError(message) {
            // 暫時顯示錯誤訊息
            const screenContent = document.getElementById('screen-content');
            if (!screenContent) return;

            const originalContent = screenContent.innerHTML;
            screenContent.innerHTML = `
                <div class="error-screen slide-in-bottom">
                    <h2>❌ 操作錯誤</h2>
                    <div class="warning-message">
                        ${message}
                    </div>
                    <div class="info-message">
                        請重新操作
                    </div>
                </div>
            `;

            setTimeout(() => {
                screenContent.innerHTML = originalContent;
            }, 2000);
        },

        completePayment() {
            this.state.gameState.paymentComplete = true;
            this.state.gameState.currentScene = 'printing';
            this.state.gameState.currentStep = 3;
            this.state.gameState.queueNumber = Math.floor(Math.random() * 99) + 1;

            this.audio.playSound('success');
            this.speech.speak('paymentComplete');

            // 顯示完成畫面
            this.updateScreen(this.HTMLTemplates.completionScreen(
                this.state.gameState.selectedService,
                this.state.gameState.queueNumber
            ));

            // 模擬票據列印
            setTimeout(() => {
                this.printTicket();
            }, this.timingConfig[this.state.settings.difficulty]?.printingTime || 2500);
        },

        printTicket() {
            this.audio.playSound('print');
            this.state.gameState.ticketPrinted = true;
            this.state.gameState.currentStep = 4;

            // 模擬票據列印動畫
            this.animateTicketPrinting();

            // 顯示票券在出口
            const ticketOutput = document.getElementById('ticket-output');
            if (ticketOutput) {
                ticketOutput.innerHTML = `
                    <div class="printed-ticket">
                        <div class="ticket-mini-header">
                            <div class="shop-name">✂️ 百元理髮店</div>
                            <div class="queue-number-large">${String(this.state.gameState.queueNumber).padStart(2, '0')}</div>
                        </div>
                        <div class="ticket-mini-body">
                            <div class="service-info">
                                <span class="service-name">${this.state.gameState.selectedService.name}</span>
                                <span class="service-price">NT$ ${this.state.gameState.selectedService.price}</span>
                            </div>
                        </div>
                    </div>
                `;

                // 添加出現動畫
                setTimeout(() => {
                    const ticket = ticketOutput.querySelector('.printed-ticket');
                    if (ticket) {
                        ticket.classList.add('ticket-emerge');
                    }
                }, 500);
            }

            this.speech.speak('ticketReady', {
                queueNumber: this.state.gameState.queueNumber
            });
        },

        animateTicketPrinting() {
            const ticketSlot = document.querySelector('.ticket-slot');
            if (ticketSlot) {
                // 添加列印動畫效果
                ticketSlot.style.background = '#0d47a1';
                ticketSlot.style.transform = 'scale(1.05)';

                // 模擬列印聲音
                let printCount = 0;
                const printInterval = setInterval(() => {
                    this.audio.playSound('print');
                    printCount++;
                    if (printCount >= 3) {
                        clearInterval(printInterval);
                        // 恢復原狀
                        setTimeout(() => {
                            ticketSlot.style.background = '';
                            ticketSlot.style.transform = '';
                        }, 500);
                    }
                }, 800);
            }

            // 票據出現動畫已在printTicket中處理
        },

        // updateTicketPreview方法已刪除，不再需要票據預覽功能

        // =====================================================
        // 操作控制方法
        // =====================================================
        takeTicket() {
            this.audio.playSound('beep');
            this.state.gameState.completedOrders++;

            // 顯示成功訊息
            this.updateScreen(`
                <div class="success-screen slide-in-bottom">
                    <h2>🎉 交易完成</h2>
                    <p>感謝您的使用！</p>
                    <div class="success-message">
                        您的號碼是 ${this.state.gameState.queueNumber} 號<br>
                        請至櫃檯依序等候服務
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="BarberKiosk.startOver()">
                            再次使用
                        </button>
                        <button class="action-btn secondary" onclick="window.history.back()">
                            返回主選單
                        </button>
                    </div>
                </div>
            `);

            // 清空票券出口
            const ticketOutput = document.getElementById('ticket-output');
            if (ticketOutput) {
                ticketOutput.innerHTML = '';
            }
        },

        startOver() {
            this.audio.playSound('beep');

            // 重置狀態
            this.state.gameState = {
                ...this.state.gameState,
                currentScene: 'welcome',
                currentStep: 0,
                selectedService: null,
                requiredAmount: 0,
                insertedAmount: 0,
                paymentComplete: false,
                ticketPrinted: false,
                queueNumber: 1
            };

            // 回到歡迎畫面
            this.updateScreen(this.HTMLTemplates.welcomeScreen());
            this.updateMoneyDisplay();

            // 清空票券出口
            const ticketOutput = document.getElementById('ticket-output');
            if (ticketOutput) {
                ticketOutput.innerHTML = '';
            }
        },

        goBack() {
            this.audio.playSound('beep');

            if (this.state.gameState.currentScene === 'service-selection') {
                this.state.gameState.currentScene = 'welcome';
                this.state.gameState.currentStep = 0;
                this.updateScreen(this.HTMLTemplates.welcomeScreen());
            }
        },

        cancelPayment() {
            this.audio.playSound('beep');

            // 退回已投入的金額（模擬）
            if (this.state.gameState.insertedAmount > 0) {
                this.speech.speak('refund', { amount: this.state.gameState.insertedAmount });
            }

            // 重置付款狀態
            this.state.gameState.insertedAmount = 0;
            this.state.gameState.selectedService = null;
            this.state.gameState.requiredAmount = 0;

            // 返回服務選擇
            this.showServiceSelection();
        },

        // =====================================================
        // 事件處理系統
        // =====================================================
        bindEvents() {
            // 綁定投幣事件 - 現在改為彈窗選擇模式，移除直接投幣
            const handleMoneyInput = (event) => {
                // 移除舊的直接投幣邏輯，現在通過點擊事件觸發模態窗口
                // 保留結構以防其他地方需要
            };

            // 同時綁定點擊和觸控事件
            document.addEventListener('click', handleMoneyInput);
            document.addEventListener('touchend', handleMoneyInput);

            // 防止觸控時的雙重觸發
            let touchHandled = false;
            document.addEventListener('touchstart', () => {
                touchHandled = true;
                setTimeout(() => touchHandled = false, 300);
            });

            document.addEventListener('click', (event) => {
                if (touchHandled) {
                    event.preventDefault();
                    return;
                }
            });

            // 改善觸控回饋
            this.addTouchFeedback();

            console.log('[A3-Kiosk] 事件監聽器綁定完成（包含觸控支援）');
        },

        addTouchFeedback() {
            // 為可觸控元素添加觸控回饋
            const touchableElements = document.querySelectorAll('.bill-slot, .coin-item, .action-btn, .service-item');

            touchableElements.forEach(element => {
                element.addEventListener('touchstart', (e) => {
                    element.style.transform = 'scale(0.95)';
                    element.style.transition = 'transform 0.1s ease';
                });

                element.addEventListener('touchend', (e) => {
                    setTimeout(() => {
                        element.style.transform = '';
                    }, 100);
                });

                // 防止觸控時選中文字
                element.style.webkitUserSelect = 'none';
                element.style.userSelect = 'none';
                element.style.webkitTouchCallout = 'none';
            });
        },

        // =====================================================
        // 鍵盤快捷鍵處理
        // =====================================================
        handleServiceSelect(serviceNumber) {
            const difficulty = this.state.settings.difficulty;
            const services = this.serviceConfig[difficulty].services;

            if (serviceNumber >= 1 && serviceNumber <= services.length) {
                const service = services[serviceNumber - 1];
                this.selectService(service.id);
            }
        },

        handleEnterKey() {
            // 根據當前場景執行相應操作
            switch (this.state.gameState.currentScene) {
                case 'welcome':
                    this.showServiceSelection();
                    break;
                case 'printing':
                case 'complete':
                    this.takeTicket();
                    break;
                default:
                    break;
            }
        },

        handleCancelKey() {
            if (this.state.gameState.currentScene === 'payment') {
                this.cancelPayment();
            } else {
                this.goBack();
            }
        }
    };

    // =====================================================
    // 將 BarberKiosk 對象暴露到全域作用域
    // =====================================================
    window.BarberKiosk = BarberKiosk;

    // 立即初始化系統
    BarberKiosk.init();
});

console.log('[A3-Kiosk] 理髮店售票機腳本載入完成');