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

        <div class="actions">
          <Button @click="showPlayer = true" icon="play-circle-outline">
            {{ t('views.stream.watch') }}
          </Button>
          <Button v-if="meta.trailers && meta.trailers.length" type="secondary" @click="openTrailer" icon="videocam-outline">
            {{ t('views.stream.trailer') }}
          </Button>
        </div>
      </div>

      <!-- ⚠️ نحذف عرض البلاير العادي -->
      <!-- <div class="player-section" v-if="showPlayer"> ... </div> -->

      <!-- قسم المسلسل -->
      <div class="series-navigation" v-if="isSeries">
        <Segments :segments="seasons" v-model="selectedSeason">
          <template #segment="{ segment }">
            <span>{{ t('views.stream.season') || 'Season' }} {{ segment }}</span>
          </template>
        </Segments>

        <div class="episodes-header">
          <h4>Episodes</h4>
        </div>

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
                <span class="ep-number-title">
                  {{ ep.episode }}. {{ ep.name || `Episode ${ep.episode}` }}
                </span>
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

    <!-- 🎬 POPUP PLAYER -->
    <transition name="popup">
      <div
        v-if="showPlayer"
        class="player-overlay"
        @click.self="closePlayer"
      >
        <div class="player-modal">
          <span class="close-btn" @click="closePlayer">✕</span>

          <VidfastPlayer 
            :type="meta.type" 
            :id="meta.imdb_id" 
            :season="selectedSeason" 
            :episode="selectedEpisodeNumber"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import StremioService from "@/services/stremio.service";
import Button from '@/components/ui/Button.vue';
import Segments from '@/components/ui/Segments.vue';
import VidfastPlayer from '@/components/player/VidfastPlayer.vue';

const { t } = useI18n();

const meta = ref({});
const seasons = ref([]);
const selectedSeason = ref(1);
const selectedEpisode = ref(null);
const showPlayer = ref(false);

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

const closePlayer = () => {
  showPlayer.value = false;
};

const handleEsc = (e) => {
  if (e.key === 'Escape') closePlayer();
};

onMounted(async () => {
  window.addEventListener('keydown', handleEsc);

  const { type, id } = router.currentRoute.value.params;

  if (id && type) {
    const [metaId] = id.split(':');
    meta.value = type === 'movie'
      ? await StremioService.getMetaMovie(metaId)
      : await StremioService.getMetaSeries(metaId);

    if (meta.value?.videos?.length) {
      const episode = meta.value.videos.find(({ id: imdb_id }) => imdb_id === id) || meta.value.videos[0];
      selectedSeason.value = episode.season || 1;
      selectedEpisode.value = episode;

      seasons.value = [...new Set(meta.value.videos.map(({ season }) => season))]
        .filter(s => s > 0)
        .sort((a, b) => a - b);
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc);
});
</script>

<style scoped>
.player-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.player-modal {
  width: 95%;
  max-width: 1200px;
  aspect-ratio: 16 / 9;
  background: black;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 18px;
  font-size: 26px;
  color: white;
  cursor: pointer;
  z-index: 10;
}

.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.3s ease;
}
.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}
</style>
