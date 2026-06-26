<template>
  <div class="vidfast-wrapper">
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
.vidfast-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
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

  .no-source {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #fff;
    font-family: 'Montserrat-Bold';
  }
}

/* وضع landscape على الهاتف: المشغل يملأ الشاشة كاملاً */
@media (orientation: landscape) and (max-width: 1024px) {
  .vidfast-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    aspect-ratio: auto;
    z-index: 9999;
  }
}
</style>
