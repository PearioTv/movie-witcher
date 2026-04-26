<template>
  <div class="vidfast-outer-wrapper">
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
});
</script>

<style lang="scss" scoped>
.vidfast-outer-wrapper {
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
  width: 1280px; 
  height: 720px;
  transform-origin: center center;
  
  /* للهواتف: نقوم بتصغير المشغل ليتناسب مع عرض الشاشة */
  transform: scale(calc(100vw / 1280));

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  .no-source {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #fff;
    font-family: 'Montserrat-Bold';
  }
}

@media (min-width: 1280px) {
  .vidfast-scaler {
    transform: scale(1);
    width: 100%;
    height: 100%;
  }
}

@media (max-width: 1279px) and (min-width: 769px) {
  .vidfast-scaler {
    transform: scale(calc(90vw / 1280));
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .vidfast-outer-wrapper {
    height: 100vh;
    aspect-ratio: auto;
  }
  .vidfast-scaler {
    transform: scale(calc(100vh / 720));
  }
}
</style>
