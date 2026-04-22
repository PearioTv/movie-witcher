<template>
  <div class="vidfast-player">
    <iframe
      v-if="embedUrl"
      :src="embedUrl"
      frameborder="0"
      allowfullscreen
      scrolling="no"
      allow="autoplay; fullscreen; chromecast; encrypted-media"
    ></iframe>
    <div v-else class="no-source">
      No source available
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
  if (props.type === 'movie') {
    return `https://vidfast.pro/movie/${props.id}?autoPlay=true`;
  } else if (props.type === 'series' ) {
    return `https://vidfast.pro/tv/${props.id}/${props.season}/${props.episode}?autoPlay=true&nextButton=true&autoNext=true`;
  }
  return '';
} );
</script>

<style lang="scss" scoped>
.vidfast-player {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
}

@media (max-width: 768px) {
  .vidfast-player {
    // فرض نسبة العرض السينمائية لضمان ظهور شريط التحكم بالكامل
    aspect-ratio: 16 / 9;
    height: auto;
    max-height: 100vh;
  }
}
</style>
