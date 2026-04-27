<template>
  <div class="vidfast-player-wrapper">
    <iframe
      v-if="embedUrl"
      :src="embedUrl"
      frameborder="0"
      allowfullscreen
      scrolling="no"
      allow="autoplay; fullscreen; chromecast; encrypted-media"
      class="vidfast-iframe"
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
  // إضافة البارامترات التي تجبر المشغل على إظهار الواجهة الكاملة
  return `${url}?autoPlay=true`;
} );
</script>

<style lang="scss" scoped>
.vidfast-player-wrapper {
  position: relative;
  width: 100%;
  /* استخدام نسبة 16:9 بدقة متناهية لضمان ظهور شريط الأدوات السفلي */
  aspect-ratio: 16 / 9;
  background: #000;
  overflow: hidden;
}

.vidfast-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  /* ضمان أن اللمس يعمل على كافة أجزاء المشغل */
  pointer-events: auto;
}

/* تحسينات خاصة للهواتف لضمان عدم اختفاء الأزرار */
@media (max-width: 768px) {
  .vidfast-player-wrapper {
    /* زيادة الارتفاع قليلاً في الهواتف ليعطي مساحة للأزرار السفلية */
    aspect-ratio: 16 / 10; 
    width: 100vw;
    margin-left: calc(-50vw + 50%);
  }
}

/* الوضع الأفقي (Landscape) وهو الأهم للمشاهدة */
@media (orientation: landscape) {
  .vidfast-player-wrapper {
    height: 100vh;
    width: 100vw;
    aspect-ratio: auto;
  }
}
</style>
