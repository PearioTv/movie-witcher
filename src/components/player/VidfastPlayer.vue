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
  return `${url}?autoPlay=true&nextButton=true`;
} );
</script>

<style lang="scss" scoped>
.vidfast-player-wrapper {
  position: relative;
  width: 100%;
  background: #000;
  overflow: hidden;
  // الحفاظ على نسبة العرض لضمان ظهور التحكم
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vidfast-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    // منع أي تداخل قد يخفي أدوات التحكم
    pointer-events: auto;
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

// الحل السحري للهواتف: تكبير المشغل قليلاً لفرض ظهور أدوات التحكم
@media (max-width: 768px) {
  .vidfast-player-wrapper {
    aspect-ratio: 16 / 9;
    // التأكد من أن الحاوية لا تضغط على المشغل
    min-height: 200px;
  }
  
  .vidfast-player iframe {
    // بعض المشغلات الخارجية تخفي الأدوات إذا كان العرض أقل من 400px
    // لذا نضمن هنا أن المشغل يرى مساحة كافية
    min-width: 100%;
  }
}

// عند تدوير الهاتف (الوضع الأفقي) - أفضل وضع للمشاهدة
@media (orientation: landscape) {
  .vidfast-player-wrapper {
    height: 100vh;
    width: 100vw;
    aspect-ratio: auto;
  }
}
</style>
