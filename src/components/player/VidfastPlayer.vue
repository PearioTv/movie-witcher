<template>
  <div class="vidfast-player-container">
    <div class="vidfast-player-aspect-ratio">
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
  // إضافة بارامترات لضمان عمل المشغل بشكل صحيح
  return `${url}?autoPlay=true&nextButton=true`;
} );
</script>

<style lang="scss" scoped>
.vidfast-player-container {
  width: 100%;
  max-width: 100%;
  background: #000;
  margin: 0 auto;
}

.vidfast-player-aspect-ratio {
  position: relative;
  width: 100%;
  // هذه النسبة (56.25%) هي التي تضمن ظهور شريط التحكم والترجمة
  padding-bottom: 56.25%; 
  height: 0;
  overflow: hidden;
  background: #000;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }

  .no-source {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-family: 'Montserrat-Bold';
  }
}

// تحسينات خاصة للهواتف
@media (max-width: 768px) {
  .vidfast-player-container {
    // التأكد من أن المشغل يأخذ العرض الكامل للهاتف
    width: 100vw;
    margin-left: calc(-50vw + 50%);
  }
}

// عند تدوير الهاتف للوضع الأفقي (Landscape)
@media (orientation: landscape) {
  .vidfast-player-aspect-ratio {
    // في الوضع الأفقي، نفضل أن يملأ المشغل الارتفاع أيضاً
    padding-bottom: 0;
    height: 100vh;
  }
}
</style>
