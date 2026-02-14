<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div v-if="modelValue" class="popup-overlay" @click.self="handleOverlayClick">
        <div class="popup-container" :class="size">
          <div class="popup-content">
            <button class="popup-close" @click="close">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </button>
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'large',
    validator: (value) => ['small', 'medium', 'large', 'full', 'cinema'].includes(value)
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true
  },
  closeOnEscape: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

const handleOverlayClick = () => {
  if (props.closeOnClickOutside) {
    close();
  }
};

const handleEscape = (e) => {
  if (props.closeOnEscape && e.key === 'Escape' && props.modelValue) {
    close();
  }
};

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
});
</script>

<style scoped lang="scss">
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 0;
}

.popup-container {
  max-height: 100vh;
  width: 100%;
  background: transparent;
  position: relative;
  
  &.large {
    max-width: 1400px;
    width: 95%;
  }
  
  &.medium {
    max-width: 1000px;
    width: 90%;
  }
  
  &.small {
    max-width: 600px;
    width: 85%;
  }
  
  &.full {
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    padding: 0;
    
    .popup-content {
      height: 100%;
      padding: 0;
    }
  }
  
  &.cinema {
    max-width: 90%;
    width: 90%;
    height: 90vh;
    
    .popup-content {
      height: 100%;
      padding: 0;
      
      :deep(video) {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }
}

.popup-content {
  background: transparent;
  border-radius: 16px;
  overflow: hidden;
  height: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  
  :deep(.vidfast-player) {
    width: 100%;
    height: 100%;
    
    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    // تكبير عناصر التحكم
    .player-controls {
      transform: scale(1.1);
      transform-origin: bottom center;
      
      button {
        padding: 12px;
        
        svg {
          width: 24px;
          height: 24px;
        }
      }
      
      .progress-bar {
        height: 8px;
        
        .progress-handle {
          width: 16px;
          height: 16px;
        }
      }
      
      .time-display {
        font-size: 15px;
      }
      
      .volume-control {
        .volume-slider {
          width: 100px;
          height: 6px;
        }
      }
    }
    
    // تكبير قوائم الجودة والترجمة
    .quality-menu, .subtitle-menu {
      font-size: 15px;
      
      button {
        padding: 10px 20px;
      }
    }
  }
}

.popup-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10000;
  backdrop-filter: blur(4px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.8);
    transform: scale(1.1);
  }
  
  svg {
    width: 28px;
    height: 28px;
  }
}

/* Transitions */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  .popup-container {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
  
  .popup-container {
    transform: scale(0.9);
  }
}

@media (max-width: 768px) {
  .popup-overlay {
    padding: 0;
  }
  
  .popup-container {
    &.cinema {
      width: 100%;
      height: 100vh;
    }
  }
  
  .popup-close {
    top: 15px;
    right: 15px;
    width: 42px;
    height: 42px;
    background: rgba(0, 0, 0, 0.8);
  }
}
</style>
