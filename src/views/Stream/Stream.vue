<template>
  <div class="stream">
    <div class="background">
      <div class="blur"></div>
      <div class="image" :style="`background-image: url(${meta.background})`" v-if="meta && meta.background"></div>
    </div>

    <div class="content-container">
      <!-- عرض المشغل مباشرة في أعلى الصفحة لضمان ظهور أدوات التحكم بالكامل -->
      <div class="player-section" v-if="meta && meta.id">
        <VidfastPlayer 
          :type="meta.type" 
          :id="meta.imdb_id || meta.id" 
          :season="selectedSeason" 
          :episode="selectedEpisodeNumber"
        />
      </div>

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
      </div>

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
    meta.value = type === 'movie' ? await StremioService.getMetaMovie(metaId) : await StremioService.getMetaSeries(metaId);
    if (meta.value && meta.value.videos && meta.value.videos.length) {
      const episode = meta.value.videos.find(({ id: imdb_id }) => imdb_id === id) || meta.value.videos[0];
      selectedSeason.value = episode.season || 1;
      selectedEpisode.value = episode;
      seasons.value = [...new Set(meta.value.videos.map(({ season }) => season))].filter(s => s > 0).sort((a, b) => a - b);
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
  gap: 20px;

  .background {
    z-index: -1;
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    .blur { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(20px); }
    .image { width: 100%; height: 100%; background-size: cover; background-position: center; opacity: 0.3; }
  }

  .content-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .player-section {
    width: 100%;
    background: #000;
  }

  .meta {
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    .logo { max-width: 200px; height: auto; }
    .title { font-size: 28px; font-weight: bold; }
    .details { display: flex; gap: 15px; font-size: 14px; color: #ccc; }
    .description { font-size: 15px; line-height: 1.6; color: #eee; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; .tag { background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px; font-size: 12px; } }
  }

  .series-navigation {
    padding: 0 20px 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    .episodes-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
      .episode-card {
        display: flex; gap: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 8px; cursor: pointer;
        &.active { border: 1px solid #4a9eff; background: rgba(74,158,255,0.1); }
        .ep-thumbnail { width: 100px; height: 60px; background-size: cover; border-radius: 4px; position: relative;
          .ep-number { position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.8); padding: 2px 6px; border-radius: 3px; font-size: 10px; }
        }
        .ep-info { flex: 1; display: flex; flex-direction: column; gap: 4px; .ep-name { font-size: 14px; font-weight: bold; } .ep-meta { font-size: 11px; color: #aaa; } }
      }
    }
  }
}

@media (min-width: 768px) {
  .stream {
    padding: 20px 5%;
    .player-section { border-radius: 12px; overflow: hidden; }
    .meta, .series-navigation { padding: 0; }
  }
}
</style>
