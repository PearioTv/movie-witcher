<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div v-if="modelValue" class="popup-overlay" @click.self="handleOverlayClick">
        <div class="popup-container" :class="size">
          <div class="popup-content">
            <button class="popup-close" @click="close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  size: { type: String, default: 'cinema' },
  closeOnClickOutside: { type: Boolean, default: true },
  closeOnEscape: { type: Boolean, default: true }
} );

const emit = defineEmits(['update:modelValue', 'close']);
const close = () => { emit('update:modelValue', false); emit('close'); };
const handleOverlayClick = () => { if (props.closeOnClickOutside) close(); };
const handleEscape = (e) => { if (props.closeOnEscape && e.key === 'Escape' && props.modelValue) close(); };

watch(() => props.modelValue, (val) => { document.body.style.overflow = val ? 'hidden' : ''; });
onMounted(() => document.addEventListener('keydown', handleEscape));
onUnmounted(() => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = ''; });
</script>

<style scoped lang="scss">
.popup-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.98);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.popup-container {
  width: 100%;
  position: relative;
  
  &.cinema {
    max-width: 90%;
    .popup-content {
      background: #000;
      border-radius: 12px;
      overflow: hidden;
      :deep(iframe) { width: 100%; display: block; }
    }
  }
}

.popup-close {
  position: absolute;
  top: -45px;
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
  z-index: 10001;
}

@media (max-width: 768px) {
  .popup-container.cinema {
    max-width: 100%;
    padding: 0; // إزالة الحواف الجانبية ليملأ العرض بالكامل مثل المثال
    
    .popup-content {
      border-radius: 0; // جعل الزوايا حادة ليناسب ملء الشاشة
    }

    .popup-close {
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }
  }
}

.popup-fade-enter-active, .popup-fade-leave-active {
  transition: opacity 0.3s ease;
}
.popup-fade-enter-from, .popup-fade-leave-to {
  opacity: 0;
}
</style>
