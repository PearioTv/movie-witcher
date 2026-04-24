<template>
  <div class="vidfast-wrapper">
    <div class="vidfast-scaler">
      <iframe
        v-if="embedUrl"
        :src="embedUrl"
        frameborder="0"
        allowfullscreen
        scrolling="no"
        allow="autoplay; fullscreen; chromecast; encrypted-media"
      ></iframe>
      <div v-else class="no-source">No source available</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  type: { type: String, required: true },
  id: { type: String, required: true },
  season: { type: [Number, String], default: 1 },
  episode: { type: [Number, String], default: 1 }
});

const embedUrl = computed(() => {
  if (!props.id) return '';
  const url = props.type === 'movie' 
    ? `https://vidfast.pro/movie/${props.id}` 
    : `https://vidfast.pro/tv/${props.id}/${props.season}/${props.episode}`;
  return `${url}?autoPlay=true&nextButton=true`;
} );
</script>

<style lang="scss" scoped>
.vidfast-wrapper {
  position: relative;
  width: 100%;
  background: #000;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vidfast-scaler {
  position: absolute;
  // إجبار المشغل على رؤية مساحة عرض 1280px على الأقل لإظهار التحكم
  width: 1280px; 
  height: 720px;
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
}

// للهواتف: نقوم بتصغير المشغل ليتناسب مع الشاشة مع الحفاظ على أدوات التحكم
@media (max-width: 768px) {
  .vidfast-wrapper {
    height: auto;
    aspect-ratio: 16 / 9;
  }
  
  .vidfast-scaler {
    // تصغير المشغل بصرياً ليتناسب مع عرض الهاتف
    transform: scale(calc(100vw / 1280));
    transform-origin: center center;
  }
}

// عند تدوير الهاتف (الوضع الأفقي)
@media (orientation: landscape) {
  .vidfast-wrapper {
    height: 100vh;
    aspect-ratio: auto;
  }
  .vidfast-scaler {
    transform: scale(calc(100vh / 720));
  }
}
</style>
