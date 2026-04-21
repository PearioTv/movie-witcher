<template>
  <div class="stream">
    <div class="background">
      <div class="blur"></div>
      <div class="image" :style="`background-image: url(${meta.background})`" v-if="meta && meta.background"></div>
    </div>

    <div class="content-container">
      <div class="meta" v-if="meta">
        <img class="logo" :src="meta.logo" alt="" v-if="meta.logo">
        <div class="title" v-else>{{ meta.name }}</div>

        <div class="details">
          <div class="year">{{ meta.year }}</div>
          <div class="runtime">{{ meta.runtime }}</div>
          <div class="rating" v-if="meta.imdbRating">⭐ {{ meta.imdbRating }}</div>
        </div>

        <div class="description">{{ meta.description }}</div>

        <div class="tags">
          <div class="tag" v-for="genre in meta.genres" :key="genre">
            {{ genre }}
          </div>
        </div>

        <!-- الأزرار المعدلة - مصغرة -->
        <div class="actions">
          <Button @click="openPlayer" icon="play-circle-outline">
            {{ t('views.stream.watch') }}
          </Button>
          <Button v-if="meta.trailers && meta.trailers.length" type="secondary" @click="openTrailerInPopup" icon="videocam-outline">
            {{ t('views.stream.trailer') }}
          </Button>
        </div>
      </div>

      <!-- Popup للاعب الفيديو (للمشغل الرئيسي أو التريلر) -->
      <Popup 
        v-model="showPlayer" 
        size="cinema"
        @close="handlePlayerClose"
      >
        <!-- عرض التريلر إذا كان موجوداً -->
        <div v-if="isTrailerMode" class="trailer-container">
          <iframe
            v-if="trailerUrl"
            :src="trailerUrl"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="trailer-iframe"
          ></iframe>
          <div v-else class="trailer-error">
            <p>عذراً، لا يمكن تشغيل التريلر</p>
          </div>
        </div>
        
        <!-- عرض المشغل الرئيسي -->
        <VidfastPlayer 
          v-else
          :type="meta.type" 
          :id="meta.imdb_id" 
          :season="selectedSeason" 
          :episode="selectedEpisodeNumber"
          :config="playerConfig"
          @ready="handlePlayerReady"
          @error="handlePlayerError"
        />
      </Popup>

      <!-- قسم المسلسل المعدل - بدون عناوين إضافية -->
      <div class="series-navigation" v-if="isSeries">
        <!-- أزرار المواسم فقط بدون عنوان Seasons -->
        <Segments :segments="seasons" v-model="selectedSeason">
          <template #segment="{ segment }">
            <span>{{ t('views.stream.season') || 'Season' }} {{ segment }}</span>
          </template>
        </Segments>

        <!-- عنوان الحلقات المبسط - فقط Episodes -->
        <div class="episodes-header">
          <h4>{{ t('') || 'Episodes' }}</h4>
        </div>

        <!-- شبكة الحلقات -->
        <div class="episodes-grid">
          <div 
            v-for="ep in episodes" 
            :key="ep.id" 
            class="episode-card"
            :class="{ active: selectedEpisode && selectedEpisode.id === ep.id }"
            @click="selectEpisode(ep)"
          >
            <div class="ep-thumbnail" :style="ep.thumbnail ? `background-image: url(${ep.thumbnail})` : ''">
              <div class="ep-number">{{ ep.episode }}</div>
            </div>
            
            <div class="ep-info">
              <div class="ep-name">
                <span class="ep-number-title">{{ ep.episode }}. {{ ep.name || `${t('views.stream.episode') || 'Episode'} ${ep.episode}` }}</span>
              </div>
              
              <div class="ep-meta">
                <span class="ep-aired" v-if="ep.released">{{ formatDate(ep.released) }}</span>
                <span class="ep-runtime" v-if="ep.runtime">{{ formatRuntime(ep.runtime) }}</span>
              </div>
              
              <div class="ep-description" v-if="ep.description">
                {{ ep.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import StremioService from "@/services/stremio.service";
import Button from '@/components/ui/Button.vue';
import Segments from '@/components/ui/Segments.vue';
import VidfastPlayer from '@/components/player/VidfastPlayer.vue';
import Popup from '@/components/ui/Popup.vue';

const { t } = useI18n();

const meta = ref({});
const seasons = ref([]);
const selectedSeason = ref(1);
const selectedEpisode = ref(null);
const showPlayer = ref(false);
const playerReady = ref(false);
const isTrailerMode = ref(false);
const trailerUrl = ref('');

const isSeries = computed(() => meta.value && meta.value.type === 'series');
const episodes = computed(() => {
  if (!meta.value || !meta.value.videos) return [];
  return meta.value.videos
    .filter((video) => video.season === selectedSeason.value)
    .sort((a, b) => a.episode - b.episode);
});

const selectedEpisodeNumber = computed(() => {
  return selectedEpisode.value ? selectedEpisode.value.episode : 1;
});

// تهيئة إعدادات المشغل
const playerConfig = computed(() => ({
  controls: true,
  autoplay: true,
  qualitySelector: true,
  subtitleSelector: true,
  playbackRate: true,
  theaterMode: true,
  // إعدادات إضافية لتحسين التجربة
  responsive: true,
  fluid: true,
  aspectRatio: '16:9',
  // إعدادات الترجمة
  subtitles: {
    enabled: true,
    language: 'ar',
    languages: ['ar', 'en', 'fr']
  },
  // إعدادات الجودة
  quality: {
    default: '1080p',
    options: ['2160p', '1080p', '720p', '480p', '360p']
  }
}));

// دالة تنسيق التاريخ
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// دالة تنسيق مدة العرض
const formatRuntime = (minutes) => {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

// دالة استخراج معرف YouTube من الرابط
const extractYouTubeId = (url) => {
  if (!url) return null;
  
  // أنماط مختلفة لروابط YouTube
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/v\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  // إذا كان النص نفسه هو المعرف
  if (url.length === 11 && !url.includes('/') && !url.includes('.')) {
    return url;
  }
  
  return null;
};

// فتح التريلر في البوب أب
const openTrailerInPopup = () => {
  if (meta.value.trailers && meta.value.trailers.length) {
    const trailer = meta.value.trailers[0];
    console.log('Trailer source:', trailer.source); // للتأكد من قيمة المصدر
    
    let videoId = null;
    
    // التحقق من نوع المصدر
    if (typeof trailer.source === 'string') {
      videoId = extractYouTubeId(trailer.source);
    } else if (trailer.source && typeof trailer.source === 'object') {
      // إذا كان المصدر object
      videoId = trailer.source.id || trailer.source.youtube_id || trailer.source.videoId;
    }
    
    if (videoId) {
      // إنشاء رابط التضمين
      trailerUrl.value = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`;
      console.log('Trailer URL:', trailerUrl.value); // للتأكد من الرابط النهائي
      
      isTrailerMode.value = true;
      showPlayer.value = true;
    } else {
      console.error('Could not extract YouTube ID from:', trailer.source);
      // محاولة استخدام الرابط مباشرة إذا كان من YouTube
      if (trailer.source && trailer.source.includes('youtube')) {
        trailerUrl.value = trailer.source.replace('watch?v=', 'embed/') + '?autoplay=1&rel=0';
        isTrailerMode.value = true;
        showPlayer.value = true;
      }
    }
  }
};

const openPlayer = () => {
  isTrailerMode.value = false;
  trailerUrl.value = '';
  showPlayer.value = true;
};

const handlePlayerClose = () => {
  showPlayer.value = false;
  isTrailerMode.value = false;
  trailerUrl.value = '';
  playerReady.value = false;
};

const handlePlayerReady = () => {
  playerReady.value = true;
  console.log('Player is ready');
};

const handlePlayerError = (error) => {
  console.error('Player error:', error);
};

const selectEpisode = (ep) => {
  selectedEpisode.value = ep;
  openPlayer(); // فتح البوب أب عند اختيار حلقة
  router.replace({ params: { ...router.currentRoute.value.params, id: ep.id } });
};

// مراقبة تغيير الموسم لإعادة تعيين الحلقة المختارة
watch(selectedSeason, () => {
  if (episodes.value.length > 0) {
    selectedEpisode.value = episodes.value[0];
  }
});

onMounted(async () => {
  const { type, id } = router.currentRoute.value.params;

  if (id && type) {
    const [metaId] = id.split(':');
    meta.value = type === 'movie' ? await StremioService.getMetaMovie(metaId) : await StremioService.getMetaSeries(metaId);

    if (meta.value && meta.value.videos && meta.value.videos.length) {
      const episode = meta.value.videos.find(({ id: imdb_id }) => imdb_id === id) || meta.value.videos[0];
      selectedSeason.value = episode.season || 1;
      selectedEpisode.value = episode;

      seasons.value = [...new Set(meta.value.videos.map(({ season }) => season))]
        .filter(s => s > 0)
        .sort((a, b) => a - b);
    }
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.stream {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px 5%;
  gap: 30px;

  .background {
    z-index: -1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    .blur, .image {
      position: absolute;
      height: 100%;
      width: 100%;
    }

    .blur {
      z-index: 1;
      backdrop-filter: blur(60px);
      background-color: rgba(0, 0, 0, 0.7);
    }

    .image {
      background-size: cover;
      background-position: center;
    }
  }

  .content-container {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 15px;
    color: white;
    max-width: 100%;

    .logo {
      display: block;
      width: 100%;
      max-width: 280px;
      height: auto;
    }

    .title {
      font-family: 'Montserrat-Bold';
      font-size: clamp(24px, 6vw, 56px);
      line-height: 1.1;
      margin: 0;
    }

    .details {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      font-family: 'Montserrat-Medium';
      font-size: clamp(12px, 3vw, 16px);
      opacity: 0.8;
    }

    .description {
      font-family: 'Montserrat-Regular';
      font-size: clamp(14px, 3vw, 18px);
      line-height: 1.6;
      opacity: 0.9;
      max-width: 100%;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .tag {
        background: rgba(255, 255, 255, 0.1);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: clamp(11px, 2vw, 14px);
      }
    }

    // الأزرار المعدلة - مصغرة
    .actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
      flex-wrap: wrap;
      
      :deep(button) {
        padding: 8px 16px;
        font-size: clamp(12px, 2vw, 14px);
        min-width: auto;
        
        .icon {
          font-size: clamp(14px, 3vw, 18px);
          margin-right: 6px;
        }
      }
    }
  }

  // قسم المسلسل المعدل
  .series-navigation {
    display: flex;
    flex-direction: column;
    gap: 20px;
    
    // تنسيق أزرار المواسم
    :deep(.segments) {
      margin-top: 0;
      
      .segment-button {
        padding: 6px 12px;
        font-size: clamp(12px, 2vw, 14px);
      }
    }
    
    // عنوان الحلقات المبسط
    .episodes-header {
      margin-top: 0;
      
      h4 {
        font-family: 'Montserrat-Bold';
        font-size: clamp(14px, 3vw, 18px);
        color: white;
        margin: 0 0 12px 0;
        opacity: 0.9;
      }
    }

    .episodes-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .episode-card {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        gap: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s, background 0.2s;
        border: 1px solid transparent;
        padding: 8px;

        &:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.1);
        }

        &.active {
          border-color: #4a9eff;
          background: rgba(74, 158, 255, 0.1);
        }

        .ep-thumbnail {
          width: 120px;
          height: 70px;
          flex-shrink: 0;
          background-size: cover;
          background-position: center;
          background-color: rgba(255, 255, 255, 0.1);
          position: relative;
          border-radius: 6px;

          .ep-number {
            position: absolute;
            bottom: 4px;
            right: 4px;
            background: rgba(0, 0, 0, 0.8);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        }

        .ep-info {
          flex-grow: 1;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          color: white;
          min-width: 0;

          .ep-name {
            font-family: 'Montserrat-SemiBold';
            font-size: clamp(12px, 2vw, 16px);
            margin: 0;
            white-space: normal;
            line-height: 1.3;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            
            .ep-number-title {
              color: #fff;
            }
          }

          .ep-meta {
            display: flex;
            gap: 12px;
            font-size: clamp(10px, 2vw, 13px);
            color: #aaa;
            flex-wrap: wrap;
            
            .ep-aired, .ep-runtime {
              display: flex;
              align-items: center;
              
              &:before {
                content: '';
                display: inline-block;
                width: 3px;
                height: 3px;
                background: #4a9eff;
                border-radius: 50%;
                margin-right: 6px;
              }
            }
          }

          .ep-description {
            font-size: clamp(11px, 2vw, 14px);
            line-height: 1.4;
            color: rgba(255, 255, 255, 0.6);
            margin: 0;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}

// تنسيق حاوية التريلر
.trailer-container {
  width: 100%;
  height: 100%;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .trailer-iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  
  .trailer-error {
    color: white;
    text-align: center;
    font-size: 16px;
    padding: 20px;
  }
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

// للشاشات الصغيرة جداً (320px - 479px)
@media (max-width: 479px) {
  .stream {
    padding: 15px 8%;
    gap: 20px;

    .meta {
      gap: 12px;

      .logo {
        max-width: 200px;
      }

      .actions {
        gap: 8px;

        :deep(button) {
          padding: 6px 12px;
          font-size: 11px;

          .icon {
            font-size: 13px;
          }
        }
      }
    }

    .series-navigation {
      gap: 15px;

      .episodes-grid {
        gap: 10px;

        .episode-card {
          gap: 10px;
          padding: 6px;

          .ep-thumbnail {
            width: 100px;
            height: 60px;
          }

          .ep-info {
            gap: 3px;
          }
        }
      }
    }
  }
}

// للشاشات الصغيرة (480px - 767px)
@media (min-width: 480px) and (max-width: 767px) {
  .stream {
    padding: 18px 5%;
    gap: 25px;

    .meta {
      gap: 14px;

      .logo {
        max-width: 250px;
      }

      .actions {
        gap: 10px;

        :deep(button) {
          padding: 7px 14px;
          font-size: 12px;

          .icon {
            font-size: 15px;
          }
        }
      }
    }

    .series-navigation {
      gap: 18px;

      .episodes-grid {
        gap: 11px;

        .episode-card {
          gap: 11px;
          padding: 7px;

          .ep-thumbnail {
            width: 110px;
            height: 65px;
          }
        }
      }
    }
  }
}

// للأجهزة اللوحية والحواسيب (768px وما فوق)
@media (min-width: 768px) {
  .stream {
    padding: 30px 5%;
    gap: 40px;

    .meta {
      gap: 20px;
      max-width: 800px;

      .logo {
        max-width: 300px;
      }

      .actions {
        gap: 12px;

        :deep(button) {
          padding: 8px 20px;
          font-size: 14px;

          .icon {
            font-size: 18px;
          }
        }
      }
    }

    .series-navigation {
      gap: 30px;

      .episodes-grid {
        gap: 15px;

        .episode-card {
          gap: 20px;
          padding: 12px;

          .ep-thumbnail {
            width: 180px;
            height: 100px;
          }

          .ep-info {
            gap: 8px;

            .ep-description {
              -webkit-line-clamp: 2;
            }
          }
        }
      }
    }
  }
}

// للحواسيب الكبيرة (1024px وما فوق)
@media (min-width: 1024px) {
  .stream {
    padding: 40px 5%;
    gap: 50px;

    .content-container {
      gap: 50px;
    }

    .series-navigation {
      gap: 40px;

      .episodes-grid {
        gap: 18px;

        .episode-card {
          gap: 25px;
          padding: 15px;

          .ep-thumbnail {
            width: 200px;
            height: 115px;
          }
        }
      }
    }
  }
}
</style>
