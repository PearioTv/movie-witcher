<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div v-if="modelValue" class="popup-overlay" @click.self="handleOverlayClick">
        <div class="popup-container" :class="size">
          <div class="popup-content">
            <button class="popup-close" @click="close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
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
    validator: (value) => ['small', 'medium', 'large', 'full'].includes(value)
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
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.popup-container {
  max-height: 90vh;
  width: 100%;
  background: transparent;
  position: relative;
  
  &.large {
    max-width: 1200px;
  }
  
  &.medium {
    max-width: 800px;
  }
  
  &.small {
    max-width: 500px;
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
}

.popup-content {
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
}

.popup-close {
  position: absolute;
  top: -40px;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10000;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
}

/* Transitions */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.3s ease;
  
  .popup-container {
    transition: transform 0.3s ease;
  }
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
  
  .popup-container {
    transform: scale(0.95);
  }
}

@media (max-width: 768px) {
  .popup-overlay {
    padding: 10px;
  }
  
  .popup-container.full {
    padding: 0;
  }
  
  .popup-close {
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.5);
  }
}
</style>
