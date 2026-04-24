<template>
  <div class="vidfast-player-wrapper">
    <div class="vidfast-player">
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
  const baseUrl = props.type === 'movie' 
    ? `https://vidfast.pro/movie/${props.id}` 
    : `https://vidfast.pro/tv/${props.id}/${props.season}/${props.episode}`;
  return `${baseUrl}?autoPlay=true&nextButton=true`;
} );
</script>

<style lang="scss" scoped>
.vidfast-player-wrapper {
  width: 100%;
  background: #000;
  position: relative;
  overflow: hidden;
}

.vidfast-player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  
  iframe {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    border: none;
  }
}

// إجبار المشغل على الظهور بالعرض (Landscape) على الهواتف لضمان ظهور التحكم
@media (max-width: 768px) and (orientation: portrait) {
  .vidfast-player-wrapper {
    height: 56.25vw; // الحفاظ على نسبة 16:9
  }
  
  .vidfast-player {
    width: 100%;
    height: 100%;
  }
}

// تحسين العرض في الوضع الأفقي الحقيقي
@media (orientation: landscape) {
  .vidfast-player-wrapper {
    height: 100vh;
  }
  .vidfast-player {
    height: 100%;
    aspect-ratio: auto;
  }
}
</style>
