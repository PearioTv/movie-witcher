<template>
  <div class="stream">
    <div class="background">
      <div class="blur"></div>
      <div class="image" :style="`background-image: url(${meta.background})`" v-if="meta && meta.background"></div>
    </div>

    <div class="content-container">

      <!-- المشغل -->
      <div class="player-section" v-if="meta && meta.id">
        <VidfastPlayer
          :type="meta.type"
          :id="meta.imdb_id || meta.id"
          :season="selectedSeason"
          :episode="selectedEpisodeNumber"
        />
      </div>

      <!-- معلومات الحلقة الحالية أسفل المشغل مباشرة -->
      <div class="now-playing" v-if="isSeries && selectedEpisode">
        <div class="now-playing-label">{{ t('views.stream.nowPlaying') || 'Now Playing' }}</div>
        <div class="now-playing-title">
          S{{ selectedSeason }}E{{ selectedEpisode.episode }} — {{ selectedEpisode.name || `Episode ${selectedEpisode.episode}` }}
        </div>
        <div class="now-playing-meta">
          <span v-if="selectedEpisode.released">{{ formatDate(selectedEpisode.released) }}</span>
          <span v-if="selectedEpisode.runtime">· {{ formatRuntime(selectedEpisode.runtime) }}</span>
        </div>
        <div class="now-playing-overview" v-if="selectedEpisode.overview">
          {{ selectedEpisode.overview }}
        </div>
      </div>

      <!-- معلومات الفيلم/المسلسل -->
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
          <div class="tag" v-for="genre in meta.genres" :key="genre">{{ genre }}</div>
        </div>
      </div>

      <!-- قائمة الحلقات -->
      <div class="series-navigation" v-if="isSeries">
        <Segments :segments="seasons" v-model="selectedSeason">
          <template #segment="{ segment }">
            <span>{{ t('views.stream.season') || 'Season' }} {{ segment }}</span>
          </template>
        </Segments>

        <div class="episodes-header">
          <h4>{{ t('views.stream.episodes') || 'Episodes' }}</h4>
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
                <span class="ep-number-title">{{ ep.episode }}. {{ ep.name || `${t('views.stream.episode') || 'Episode'} ${ep.episode}` }}</span>
              </div>
              <div class="ep-meta">
                <span class="ep-aired" v-if="ep.released">{{ formatDate(ep.released) }}</span>
                <span class="ep-runtime" v-if="ep.runtime">{{ formatRuntime(ep.runtime) }}</span>
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
import Segments from '@/components/ui/Segments.vue';
import VidfastPlayer from '@/components/player/VidfastPlayer.vue';

const { t } = useI18n();

const meta = ref({});
const seasons = ref([]);
const selectedSeason = ref(1);
const selectedEpisode = ref(null);

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

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatRuntime = (minutes) => {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const selectEpisode = (ep) => {
  selectedEpisode.value = ep;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

watch(selectedSeason, () => {
  if (episodes.value.length > 0) {
    selectedEpisode.value = episodes.value[0];
  }
});

onMounted(async () => {
  const { type, id } = router.currentRoute.value.params;
  if (id && type) {
    const [metaId] = id.split(':');
    meta.value = type === 'movie'
      ? await StremioService.getMetaMovie(metaId)
      : await StremioService.getMetaSeries(metaId);

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
.stream {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;

  .background {
    z-index: -1;
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    .blur {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(20px);
    }
    .image {
      width: 100%; height: 100%;
      background-size: cover; background-position: center; opacity: 0.3;
    }
  }

  .content-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    gap: 0;
  }

  /* المشغل بدون padding على الهاتف */
  .player-section {
    width: 100%;
    background: #000;
  }

  /* معلومات الحلقة الحالية */
  .now-playing {
    padding: 14px 16px 16px;
    background: rgba(255,255,255,0.04);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    display: flex;
    flex-direction: column;
    gap: 5px;

    .now-playing-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #4a9eff;
      font-family: 'Montserrat-SemiBold';
    }

    .now-playing-title {
      font-size: 15px;
      font-family: 'Montserrat-SemiBold';
      color: #fff;
      line-height: 1.4;
    }

    .now-playing-meta {
      font-size: 12px;
      color: #aaa;
      display: flex;
      gap: 6px;
    }

    .now-playing-overview {
      font-size: 13px;
      color: #ccc;
      line-height: 1.6;
      margin-top: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  /* معلومات الفيلم/المسلسل */
  .meta {
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .logo { max-width: 180px; height: auto; }
    .title { font-size: 24px; font-family: 'Montserrat-Bold'; }
    .details { display: flex; gap: 12px; font-size: 13px; color: #ccc; flex-wrap: wrap; }
    .description { font-size: 14px; line-height: 1.6; color: #ddd; }
    .tags {
      display: flex; flex-wrap: wrap; gap: 8px;
      .tag {
        background: rgba(255,255,255,0.1);
        padding: 4px 12px; border-radius: 20px; font-size: 12px;
      }
    }
  }

  /* قائمة الحلقات */
  .series-navigation {
    padding: 0 16px 40px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    h4 { margin: 0; font-size: 14px; color: #ccc; }

    .episodes-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .episode-card {
        display: flex;
        gap: 12px;
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
        padding: 8px;
        cursor: pointer;
        border: 1px solid transparent;
        transition: background 0.2s, border-color 0.2s;

        &:active { background: rgba(255,255,255,0.1); }
        &.active {
          border-color: #4a9eff;
          background: rgba(74,158,255,0.1);
        }

        .ep-thumbnail {
          width: 100px;
          min-width: 100px;
          height: 60px;
          background-size: cover;
          background-position: center;
          background-color: rgba(255,255,255,0.05);
          border-radius: 4px;
          position: relative;

          .ep-number {
            position: absolute; bottom: 4px; right: 4px;
            background: rgba(0,0,0,0.8); padding: 2px 5px;
            border-radius: 3px; font-size: 10px; color: #fff;
          }
        }

        .ep-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
          justify-content: center;

          .ep-name {
            font-size: 13px;
            font-family: 'Montserrat-SemiBold';
            color: #fff;
            line-height: 1.4;
          }

          .ep-meta {
            font-size: 11px;
            color: #aaa;
            display: flex;
            gap: 8px;
          }
        }
      }
    }
  }
}

/* Desktop */
@media (min-width: 768px) {
  .stream {
    padding: 20px 5%;

    .player-section {
      border-radius: 12px;
      overflow: hidden;
    }

    .now-playing {
      border-radius: 0 0 8px 8px;
      padding: 16px 20px;
    }

    .meta { padding: 20px 4px; }

    .series-navigation {
      padding: 0 4px 40px;
    }
  }
}
</style>
