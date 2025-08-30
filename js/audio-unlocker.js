// =================================================================
// FILE: js/audio-unlocker.js
// DESC: 通用音訊播放權限解鎖模組 - 解決iOS/Android音頻限制
// =================================================================
//
// 🎯 功能說明：
// 此模組解決行動裝置瀏覽器的「自動播放政策」限制問題
// 在使用者首次互動後解鎖音頻播放權限，適用於所有單元
//
// 🚀 使用方式：
// 1. 在HTML中引入此檔案：<script src="js/audio-unlocker.js"></script>
// 2. 在JavaScript中呼叫：AudioUnlocker.unlock()
// 3. 播放前檢查：AudioUnlocker.isUnlocked
//
// =================================================================

window.AudioUnlocker = {
    // 音頻是否已解鎖的狀態旗標
    isUnlocked: false,
    
    // Debug 系統
    Debug: {
        enabled: true,
        logPrefix: '[AudioUnlocker]',
        
        log(message, data = null) {
            if (!this.enabled) return;
            const timestamp = new Date().toLocaleTimeString();
            console.log(`${this.logPrefix} ${timestamp}: ${message}`, data || '');
        }
    },

    /**
     * 🔓 解鎖音頻播放權限
     * 必須在使用者首次互動時呼叫
     * @returns {Promise<boolean>} 是否成功解鎖
     */
    async unlock() {
        // 如果已經解鎖，直接返回
        if (this.isUnlocked) {
            this.Debug.log('✅ 音頻已解鎖，跳過重複操作');
            return true;
        }

        this.Debug.log('🔓 嘗試解鎖音頻播放權限...');
        
        try {
            // 方法一：使用 Web Audio API 播放無聲音頻
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const buffer = audioContext.createBuffer(1, 1, 22050); // 創建極短的無聲音頻緩衝區
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0); // 播放無聲音頻
            
            // 方法二：使用 HTML Audio 元素播放無聲音頻（備用方案）
            const testAudio = new Audio();
            testAudio.volume = 0; // 設為靜音
            // 使用極短的base64編碼無聲音頻
            testAudio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAACAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
            
            // 播放並立即停止
            await testAudio.play();
            testAudio.pause();
            testAudio.currentTime = 0;
            
            // 標記為已解鎖
            this.isUnlocked = true;
            this.Debug.log('🎉 音頻權限解鎖成功！');
            
            return true;
            
        } catch (error) {
            // 即使失敗也設為已解鎖，避免重複嘗試
            this.Debug.log('⚠️ 音頻解鎖失敗，但繼續執行', error.message);
            this.isUnlocked = true;
            return false;
        }
    },

    /**
     * 🎵 安全播放音頻
     * 在播放前自動檢查權限狀態
     * @param {HTMLAudioElement} audioElement - 要播放的音頻元素
     * @param {Function} callback - 播放完成的回調函數
     */
    async safePlay(audioElement, callback) {
        if (!this.isUnlocked) {
            this.Debug.log('⚠️ 音頻權限未解鎖，跳過播放');
            if (callback) setTimeout(callback, 100);
            return;
        }

        if (!audioElement) {
            this.Debug.log('❌ 音頻元素不存在');
            if (callback) setTimeout(callback, 100);
            return;
        }

        try {
            audioElement.currentTime = 0;
            await audioElement.play();
            
            if (callback) {
                // 設置播放完成的事件監聽器
                const onEnded = () => {
                    audioElement.removeEventListener('ended', onEnded);
                    callback();
                };
                audioElement.addEventListener('ended', onEnded);
            }
            
            this.Debug.log('🎵 音頻播放成功');
            
        } catch (error) {
            this.Debug.log('❌ 音頻播放失敗', error.message);
            if (callback) setTimeout(callback, 100);
        }
    },

    /**
     * 🎙️ 安全語音播放
     * 在語音播放前自動檢查權限狀態
     * @param {string} text - 要朗讀的文字
     * @param {Object} options - 語音選項（語言、語速等）
     * @param {Function} callback - 播放完成的回調函數
     */
    async safeSpeak(text, options = {}, callback) {
        if (!this.isUnlocked) {
            this.Debug.log('⚠️ 音頻權限未解鎖，跳過語音播放');
            if (callback) setTimeout(callback, 100);
            return;
        }

        if (!window.speechSynthesis) {
            this.Debug.log('❌ 瀏覽器不支援語音合成');
            if (callback) setTimeout(callback, 100);
            return;
        }

        try {
            const utterance = new SpeechSynthesisUtterance(text);
            
            // 設置語音選項
            if (options.lang) utterance.lang = options.lang;
            if (options.rate) utterance.rate = options.rate;
            if (options.voice) utterance.voice = options.voice;
            
            // 設置回調
            if (callback) {
                utterance.onend = callback;
                utterance.onerror = () => {
                    this.Debug.log('❌ 語音播放出錯');
                    callback();
                };
            }
            
            window.speechSynthesis.speak(utterance);
            this.Debug.log('🎙️ 語音播放開始', { text: text.substring(0, 50) });
            
        } catch (error) {
            this.Debug.log('❌ 語音播放失敗', error.message);
            if (callback) setTimeout(callback, 100);
        }
    },

    /**
     * 🔧 初始化自動解鎖
     * 自動綁定事件監聽器，在使用者首次互動時解鎖
     */
    initAutoUnlock() {
        if (this.isUnlocked) return;

        this.Debug.log('🎯 初始化自動音頻解鎖監聽器');

        const unlockHandler = (event) => {
            this.Debug.log(`🖱️ 偵測到使用者互動: ${event.type}`);
            this.unlock();
            
            // 解鎖後移除監聽器，避免重複執行
            document.removeEventListener('click', unlockHandler);
            document.removeEventListener('touchend', unlockHandler);
            document.removeEventListener('keydown', unlockHandler);
        };

        // 綁定多種互動事件
        document.addEventListener('click', unlockHandler);
        document.addEventListener('touchend', unlockHandler);
        document.addEventListener('keydown', unlockHandler);
    }
};

// 🚀 自動初始化
// 頁面載入完成後自動設置解鎖監聽器
document.addEventListener('DOMContentLoaded', () => {
    AudioUnlocker.Debug.log('📱 AudioUnlocker 模組已載入');
    AudioUnlocker.initAutoUnlock();
});