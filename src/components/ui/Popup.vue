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
  modelValue: { type: Boolean, default: false },
  size: {
    type: String,
    default: 'large',
    validator: (value ) => ['small', 'medium', 'large', 'full', 'cinema'].includes(value)
  },
  closeOnClickOutside: { type: Boolean, default: true },
  closeOnEscape: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'close']);

const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

const handleOverlayClick = () => {
  if (props.closeOnClickOutside) close();
};

const handleEscape = (e) => {
  if (props.closeOnEscape && e.key === 'Escape' && props.modelValue) close();
};

watch(() => props.modelValue, (newValue) => {
  document.body.style.overflow = newValue ? 'hidden' : '';
});

onMounted(() => document.addEventListener('keydown', handleEscape));
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
});
</script>

<style scoped lang="scss">
.popup-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.popup-container {
  max-height: 100vh;
  width: 100%;
  position: relative;
  
  &.large { max-width: 1400px; width: 95%; }
  &.medium { max-width: 1000px; width: 90%; }
  &.small { max-width: 600px; width: 85%; }
  &.full {
    max-width: 100%; height: 100vh;
    .popup-content { height: 100%; border-radius: 0; }
  }
  
  &.cinema {
    max-width: 95%;
    width: 95%;
    height: auto;
    
    .popup-content {
      height: auto;
      background: #000;
      :deep(iframe) { width: 100%; height: 100%; display: block; }
    }
  }
}

.popup-content {
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.popup-close {
  position: absolute;
  top: -50px;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

@media (max-width: 768px) {
  .popup-container.cinema {
    width: 100%;
    padding: 0 10px;
    .popup-close { top: -45px; right: 10px; }
  }
}

@media (max-width: 932px) and (orientation: landscape) {
  .popup-container.cinema {
    max-width: 100%; width: 100%; height: 100vh; padding: 0;
    .popup-content { height: 100vh; border-radius: 0; }
    .popup-close { top: 15px; right: 15px; background: rgba(0, 0, 0, 0.4); }
  }
}

.popup-fade-enter-active, .popup-fade-leave-active {
  transition: opacity 0.4s ease;
  .popup-container { transition: transform 0.4s ease; }
}
.popup-fade-enter-from, .popup-fade-leave-to {
  opacity: 0;
  .popup-container { transform: scale(0.9); }
}
</style>
