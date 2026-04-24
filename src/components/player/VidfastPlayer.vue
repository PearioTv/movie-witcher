<template>
  <div class="vidfast-player-container">
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
  type: {
    type: String,
    required: true // 'movie' or 'series'
  },
  id: {
    type: String,
    required: true // IMDB or TMDB ID
  },
  season: {
    type: [Number, String],
    default: 1
  },
  episode: {
    type: [Number, String],
    default: 1
  }
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
.vidfast-player-container {
  position: relative;
  width: 100%;
  background: #000;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vidfast-player {
  position: relative;
  width: 100%;
  // نسبة 16:9 هي المفتاح لإظهار أدوات التحكم في المشغل الخارجي
  aspect-ratio: 16 / 9;
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
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #fff;
    font-family: 'Montserrat-Bold';
  }
}

// تحسينات خاصة للهواتف لضمان ظهور شريط التحكم بالكامل
@media (max-width: 768px) {
  .vidfast-player-container {
    // في الوضع العمودي، نضمن أن المشغل يأخذ العرض الكامل مع ارتفاع مناسب
    height: auto;
    min-height: 210px; 
  }

  .vidfast-player {
    width: 100%;
    aspect-ratio: 16 / 9;
    
    iframe {
      // التأكد من أن الـ iframe لا يتم قصه
      width: 100%;
      height: 100%;
    }
  }
}

// عند تدوير الهاتف للوضع الأفقي (Landscape)
@media (max-height: 500px) or (orientation: landscape) {
  .vidfast-player-container {
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
  }

  .vidfast-player {
    height: 100%;
    width: 100%;
    aspect-ratio: auto;
    
    iframe {
      height: 100%;
      width: 100%;
    }
  }
}
</style>
