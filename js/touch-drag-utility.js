// =================================================================
// FILE: js/touch-drag-utility.js
// PURPOSE: Universal touch screen drag support for all units
// =================================================================

/**
 * TouchDragUtility - Universal touch screen drag and drop support
 * 
 * This utility provides consistent touch screen support across all units
 * while maintaining compatibility with existing mouse drag implementations.
 * 
 * Features:
 * - Touch to drag conversion
 * - Visual feedback during drag
 * - Drop zone detection
 * - Event delegation for dynamic elements
 * - Compatible with existing drag handlers
 */
class TouchDragUtility {
    constructor() {
        this.currentDrag = null;
        this.dropZones = new Map();
        this.dragStartHandlers = new Map();
        this.dropHandlers = new Map();
        this.dragEndHandlers = new Map();
        
        // Touch drag state
        this.touchState = {
            isDragging: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            element: null,
            clone: null,
            startContainer: null
        };
        
        this.init();
    }
    
    init() {
        // Add global touch event listeners
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // Add global style for drag clone
        this.addDragStyles();
    }
    
    addDragStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .touch-drag-clone {
                position: fixed;
                z-index: 1000;
                pointer-events: none;
                opacity: 0.8;
                transform: scale(1.1);
                transition: none;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            }
            
            .touch-dragging {
                opacity: 0.5;
            }
            
            .touch-drop-zone-hover {
                background-color: rgba(0, 255, 0, 0.1);
                border-color: #00ff00 !important;
                transform: scale(1.02);
                transition: all 0.2s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Register a draggable element or container
     * @param {HTMLElement} container - Container element for event delegation
     * @param {string} draggableSelector - CSS selector for draggable elements
     * @param {Object} handlers - Event handlers
     * @param {Function} handlers.onDragStart - Called when drag starts
     * @param {Function} handlers.onDrop - Called when dropped on valid zone
     * @param {Function} handlers.onDragEnd - Called when drag ends
     */
    registerDraggable(container, draggableSelector, handlers) {
        const containerId = this.getElementId(container);
        
        this.dragStartHandlers.set(containerId, {
            container,
            selector: draggableSelector,
            handler: handlers.onDragStart || (() => {})
        });
        
        this.dropHandlers.set(containerId, handlers.onDrop || (() => {}));
        this.dragEndHandlers.set(containerId, handlers.onDragEnd || (() => {}));
    }
    
    /**
     * Register a drop zone
     * @param {HTMLElement} element - Drop zone element
     * @param {Function} validator - Function to validate if drop is allowed
     */
    registerDropZone(element, validator = () => true) {
        const id = this.getElementId(element);
        this.dropZones.set(id, { element, validator });
    }
    
    /**
     * Unregister all handlers for a container
     * @param {HTMLElement} container 
     */
    unregisterDraggable(container) {
        const containerId = this.getElementId(container);
        this.dragStartHandlers.delete(containerId);
        this.dropHandlers.delete(containerId);
        this.dragEndHandlers.delete(containerId);
    }
    
    /**
     * Unregister a drop zone
     * @param {HTMLElement} element 
     */
    unregisterDropZone(element) {
        const id = this.getElementId(element);
        this.dropZones.delete(id);
    }
    
    getElementId(element) {
        if (!element.dataset.touchDragId) {
            element.dataset.touchDragId = 'td_' + Math.random().toString(36).substr(2, 9);
        }
        return element.dataset.touchDragId;
    }
    
    handleTouchStart(event) {
        // Check if touch started on a draggable element
        const draggableInfo = this.findDraggableElement(event.target);
        if (!draggableInfo) return;
        
        const { element, containerId } = draggableInfo;
        const dragStartInfo = this.dragStartHandlers.get(containerId);
        
        // Prevent default touch behavior
        event.preventDefault();
        
        // Call original drag start handler
        const result = dragStartInfo.handler(element, event);
        if (result === false) return; // Handler cancelled drag
        
        // Initialize touch drag state
        const touch = event.touches[0];
        const rect = element.getBoundingClientRect();
        
        this.touchState = {
            isDragging: true,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
            element: element,
            clone: null,
            startContainer: element.parentElement,
            containerId: containerId,
            offsetX: touch.clientX - rect.left,
            offsetY: touch.clientY - rect.top
        };
        
        // Add dragging class to original element
        element.classList.add('touch-dragging');
        
        // Create visual clone after a small delay to avoid interfering with touch
        setTimeout(() => {
            if (this.touchState.isDragging) {
                this.createDragClone();
            }
        }, 50);
    }
    
    handleTouchMove(event) {
        if (!this.touchState.isDragging) return;
        
        event.preventDefault();
        
        const touch = event.touches[0];
        this.touchState.currentX = touch.clientX;
        this.touchState.currentY = touch.clientY;
        
        // Update clone position
        if (this.touchState.clone) {
            this.touchState.clone.style.left = (touch.clientX - this.touchState.offsetX) + 'px';
            this.touchState.clone.style.top = (touch.clientY - this.touchState.offsetY) + 'px';
        }
        
        // Check drop zones
        this.updateDropZoneHover(touch.clientX, touch.clientY);
    }
    
    handleTouchEnd(event) {
        if (!this.touchState.isDragging) return;
        
        event.preventDefault();
        
        const touch = event.changedTouches[0];
        const dropZone = this.findDropZoneAt(touch.clientX, touch.clientY);
        
        // Call drop handler if valid drop zone found
        if (dropZone && this.touchState.containerId) {
            const dropHandler = this.dropHandlers.get(this.touchState.containerId);
            if (dropHandler) {
                // Create a synthetic drop event
                const syntheticEvent = this.createSyntheticDropEvent(event, dropZone);
                dropHandler(this.touchState.element, dropZone, syntheticEvent);
            }
        }
        
        // Call drag end handler
        if (this.touchState.containerId) {
            const dragEndHandler = this.dragEndHandlers.get(this.touchState.containerId);
            if (dragEndHandler) {
                dragEndHandler(this.touchState.element, event);
            }
        }
        
        // Clean up
        this.cleanupDrag();
    }
    
    createDragClone() {
        const element = this.touchState.element;
        const clone = element.cloneNode(true);
        
        // Style the clone
        clone.classList.add('touch-drag-clone');
        const rect = element.getBoundingClientRect();
        
        clone.style.position = 'fixed';
        clone.style.left = (rect.left) + 'px';
        clone.style.top = (rect.top) + 'px';
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        clone.style.zIndex = '1000';
        clone.style.pointerEvents = 'none';
        
        document.body.appendChild(clone);
        this.touchState.clone = clone;
    }
    
    findDraggableElement(target) {
        // 🔧 [手機端修復] 如果沒有註冊的拖拽容器，安靜地返回null
        if (this.dragStartHandlers.size === 0) {
            return null;
        }
        
        console.log('🔍 查找可拖拽元素，目標:', target, target.className);
        
        // Check all registered draggable containers
        for (const [containerId, info] of this.dragStartHandlers) {
            const { container, selector } = info;
            console.log('🔍 檢查容器:', containerId, '選擇器:', selector);
            
            // Check if target matches the draggable selector within this container
            if (container.contains(target)) {
                console.log('🔍 目標在容器內');
                
                // First try: target itself matches
                if (target.matches && target.matches(selector)) {
                    console.log('🔍 目標本身匹配選擇器:', target);
                    return { element: target, containerId };
                }
                
                // Second try: find closest matching ancestor
                const draggableElement = target.closest(selector);
                console.log('🔍 找到的拖拽元素:', draggableElement);
                if (draggableElement && container.contains(draggableElement)) {
                    console.log('🔍 返回拖拽元素:', draggableElement, containerId);
                    return { element: draggableElement, containerId };
                }
                
                // Third try: check if target is inside a draggable element
                const parentDraggable = target.parentElement?.closest(selector);
                console.log('🔍 檢查父層拖拽元素:', parentDraggable);
                if (parentDraggable && container.contains(parentDraggable)) {
                    console.log('🔍 返回父層拖拽元素:', parentDraggable, containerId);
                    return { element: parentDraggable, containerId };
                }
            }
        }
        
        // 只在有註冊容器但找不到元素時才記錄
        if (this.dragStartHandlers.size > 0) {
            console.log('🔍 未找到可拖拽元素');
        }
        return null;
    }
    
    findDropZoneAt(x, y) {
        // Temporarily hide the clone to check elements underneath
        const originalDisplay = this.touchState.clone ? this.touchState.clone.style.display : null;
        if (this.touchState.clone) {
            this.touchState.clone.style.display = 'none';
        }
        
        const elementAtPoint = document.elementFromPoint(x, y);
        
        // Restore clone display
        if (this.touchState.clone && originalDisplay !== null) {
            this.touchState.clone.style.display = originalDisplay;
        }
        
        if (!elementAtPoint) return null;
        
        // Check if element is in a registered drop zone
        for (const [id, info] of this.dropZones) {
            const { element, validator } = info;
            if (element.contains(elementAtPoint) || element === elementAtPoint) {
                if (validator(this.touchState.element, element)) {
                    return element;
                }
            }
        }
        
        return null;
    }
    
    updateDropZoneHover(x, y) {
        // Remove previous hover states
        document.querySelectorAll('.touch-drop-zone-hover').forEach(el => {
            el.classList.remove('touch-drop-zone-hover');
        });
        
        // Add hover state to current drop zone
        const dropZone = this.findDropZoneAt(x, y);
        if (dropZone) {
            dropZone.classList.add('touch-drop-zone-hover');
        }
    }
    
    createSyntheticDropEvent(originalEvent, dropZone) {
        // Create a synthetic event that mimics a drop event
        return {
            target: dropZone,
            preventDefault: () => {},
            stopPropagation: () => {},
            dataTransfer: {
                getData: () => this.touchState.element.dataset.value || '',
                setData: () => {}
            },
            originalEvent: originalEvent,
            syntheticTouchDrop: true
        };
    }
    
    cleanupDrag() {
        // Remove classes
        if (this.touchState.element) {
            this.touchState.element.classList.remove('touch-dragging');
        }
        
        // Remove clone
        if (this.touchState.clone) {
            this.touchState.clone.remove();
        }
        
        // Remove hover states
        document.querySelectorAll('.touch-drop-zone-hover').forEach(el => {
            el.classList.remove('touch-drop-zone-hover');
        });
        
        // Reset state
        this.touchState = {
            isDragging: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            element: null,
            clone: null,
            startContainer: null,
            containerId: null,
            offsetX: 0,
            offsetY: 0
        };
    }
}

// Create global instance
try {
    window.TouchDragUtility = window.TouchDragUtility || new TouchDragUtility();
    
    // Log successful loading
    console.log('🎯 TouchDragUtility 已載入並實例化');
    console.log('🎯 TouchDragUtility 實例方法:', Object.getOwnPropertyNames(window.TouchDragUtility));
    console.log('🎯 TouchDragUtility 可用方法:', Object.getOwnPropertyNames(TouchDragUtility.prototype));
} catch (error) {
    console.error('❌ TouchDragUtility 初始化失敗:', error);
    window.TouchDragUtility = null;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TouchDragUtility;
}