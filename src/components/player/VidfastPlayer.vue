<template>
  <div class="vidfast-wrapper" ref="wrapperRef">
    <iframe
      v-if="embedUrl"
      ref="iframeRef"
      :src="embedUrl"
      frameborder="0"
      allowfullscreen
      scrolling="no"
      allow="autoplay; fullscreen; chromecast; encrypted-media; picture-in-picture"
    ></iframe>
    <div v-else class="no-source">No source available</div>

    <!-- زر تكبير مخصص للهاتف -->
    <button class="mobile-fullscreen-btn" @click="enterFullscreen" aria-label="Fullscreen">
      <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  type: { type: String, required: true },
  id: { type: String, required: true },
  season: { type: [Number, String], default: 1 },
  episode: { type: [Number, String], default: 1 }
});

const wrapperRef = ref(null);
const iframeRef = ref(null);

const embedUrl = computed(() => {
  if (!props.id) return '';
  const url = props.type === 'movie'
    ? `https://vidfast.pro/movie/${props.id}`
    : `https://vidfast.pro/tv/${props.id}/${props.season}/${props.episode}`;
  return `${url}?autoPlay=true&nextButton=true`;
});

const enterFullscreen = async () => {
  const el = wrapperRef.value;
  if (!el) return;

  try {
    // قفل الاتجاه أفقي على الهاتف
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape');
    }
  } catch (e) {
    // بعض المتصفحات لا تدعم lock، نكمل بدونه
  }

  // طلب fullscreen على العنصر
  if (el.requestFullscreen) {
    await el.requestFullscreen();
  } else if (el.webkitRequestFullscreen) {
    await el.webkitRequestFullscreen();
  } else if (el.mozRequestFullScreen) {
    await el.mozRequestFullScreen();
  }
};
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
  }

  /* زر التكبير المخصص - يظهر فقط على الهاتف */
  .mobile-fullscreen-btn {
    display: none;
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.6);
    border: none;
    border-radius: 6px;
    padding: 8px;
    cursor: pointer;
    z-index: 10;
    align-items: center;
    justify-content: center;

    &:active {
      background: rgba(0, 0, 0, 0.9);
    }
  }
}

/* على الهاتف: إظهار زر التكبير */
@media (max-width: 768px) {
  .vidfast-wrapper {
    .mobile-fullscreen-btn {
      display: flex;
    }
  }
}

/* وضع fullscreen: المشغل يملأ الشاشة كاملاً */
:fullscreen .vidfast-wrapper,
:-webkit-full-screen .vidfast-wrapper {
  width: 100vw;
  height: 100vh;
  aspect-ratio: auto;
}

.vidfast-wrapper:fullscreen,
.vidfast-wrapper:-webkit-full-screen {
  width: 100vw;
  height: 100vh;
  aspect-ratio: auto;
}
</style>
