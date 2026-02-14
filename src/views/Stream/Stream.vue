<template>
  <div class="stream">
    <div class="background">
      <div class="blur"></div>
      <div
        class="image"
        :style="`background-image: url(${meta.background})`"
        v-if="meta && meta.background"
      ></div>
    </div>

    <div class="content-container">
      <!-- META -->
      <div class="meta" v-if="meta">
        <div class="meta-center-wrapper">
          <img class="logo" :src="meta.logo" v-if="meta.logo" />
          <div class="title" v-else>{{ meta.name }}</div>

          <div class="details">
            <div>{{ meta.year }}</div>
            <div>{{ meta.runtime }}</div>
            <div v-if="meta.imdbRating">⭐ {{ meta.imdbRating }}</div>
          </div>

          <div class="description">
            {{ meta.description }}
          </div>

          <div class="tags">
            <div class="tag" v-for="genre in meta.genres" :key="genre">
              {{ genre }}
            </div>
          </div>

          <div class="actions">
            <Button
              large
              @click="showPlayer = true"
              icon="play-circle-outline"
              class="action-btn"
            >
              {{ t('views.stream.watch') }}
            </Button>

            <Button
              v-if="meta.trailers && meta.trailers.length"
              large
              type="secondary"
              @click="openTrailer"
              icon="videocam-outline"
              class="action-btn"
            >
              TRAILER
            </Button>
          </div>
        </div>
      </div>

      <!-- PLAYER -->
      <div class="player-section" v-if="showPlayer">
        <VidfastPlayer
          :type="meta.type"
          :id="meta.imdb_id"
          :season="selectedSeason"
          :episode="selectedEpisodeNumber"
        />
      </div>

      <!-- SERIES SECTION -->
      <div class="series-navigation" v-if="isSeries">
        <h2 class="season-title">Seasons</h2>

        <!-- SEASON TABS -->
        <div class="season-tabs">
          <button
            v-for="season in seasons"
            :key="season"
            :class="['season-tab', { active: selectedSeason === season }]"
            @click="selectedSeason = season"
          >
            Season {{ season }}
          </button>
        </div>

        <h3 class="episodes-title">Episodes</h3>

        <!-- EPISODES GRID -->
        <div class="episodes-grid">
          <div
            v-for="ep in episodes"
            :key="ep.id"
            class="episode-card"
            @click="selectEpisode(ep)"
          >
            <div
              class="episode-image"
              :style="ep.thumbnail ? `background-image: url(${ep.thumbnail})` : ''"
            ></div>

            <div class="episode-content">
              <h4 class="episode-name">
                {{ ep.episode }}. {{ ep.name }}
              </h4>

              <div class="episode-meta">
                <span v-if="ep.released">
                  {{ new Date(ep.released).toLocaleDateString() }}
                </span>
                <span v-if="ep.runtime"> • {{ ep.runtime }}</span>
              </div>

              <p class="episode-description">
                {{ ep.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import router from "@/router";
import StremioService from "@/services/stremio.service";
import Button from "@/components/ui/Button.vue";
import VidfastPlayer from "@/components/player/VidfastPlayer.vue";

const { t } = useI18n();

const meta = ref({});
const seasons = ref([]);
const selectedSeason = ref(1);
const selectedEpisode = ref(null);
const showPlayer = ref(false);

const isSeries = computed(() => meta.value?.type === "series");

const episodes = computed(() => {
  if (!meta.value?.videos) return [];
  return meta.value.videos
    .filter(v => v.season === selectedSeason.value)
    .sort((a, b) => a.episode - b.episode);
});

const selectedEpisodeNumber = computed(() =>
  selectedEpisode.value ? selectedEpisode.value.episode : 1
);

const openTrailer = () => {
  if (meta.value?.trailers?.length) {
    const trailer = meta.value.trailers[0];
    window.open(
      `https://www.youtube.com/watch?v=${trailer.source}`,
      "_blank"
    );
  }
};

const selectEpisode = (ep) => {
  selectedEpisode.value = ep;
  showPlayer.value = true;
};

onMounted(async () => {
  const { type, id } = router.currentRoute.value.params;

  if (id && type) {
    const [metaId] = id.split(":");

    meta.value =
      type === "movie"
        ? await StremioService.getMetaMovie(metaId)
        : await StremioService.getMetaSeries(metaId);

    if (meta.value?.videos?.length) {
      seasons.value = [
        ...new Set(meta.value.videos.map(v => v.season))
      ].filter(Boolean);

      selectedEpisode.value = meta.value.videos[0];
    }
  }
});
</script>

<style lang="scss" scoped>
.stream {
  padding: 40px 5%;
  color: white;

  .background {
    position: fixed;
    inset: 0;
    z-index: -1;

    .blur {
      position: absolute;
      inset: 0;
      backdrop-filter: blur(60px);
      background: rgba(0, 0, 0, 0.85);
    }

    .image {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
    }
  }

  .content-container {
    max-width: 1200px;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: 50px;
  }

  .season-title {
    font-size: 22px;
    font-weight: 600;
  }

  .season-tabs {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }

  .season-tab {
    background: #1c2333;
    border: none;
    padding: 10px 18px;
    border-radius: 12px;
    color: white;
    cursor: pointer;
    transition: 0.2s;
  }

  .season-tab.active {
    background: #4f8cff;
  }

  .episodes-title {
    margin-top: 30px;
    font-size: 20px;
    font-weight: 600;
  }

  .episodes-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 25px;
  }

  .episode-card {
    background: #111827;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: 0.2s;
  }

  .episode-card:hover {
    transform: translateY(-5px);
  }

  .episode-image {
    height: 180px;
    background-size: cover;
    background-position: center;
  }

  .episode-content {
    padding: 15px;
  }

  .episode-name {
    font-size: 16px;
    font-weight: 600;
  }

  .episode-meta {
    font-size: 13px;
    opacity: 0.7;
    margin: 5px 0 10px;
  }

  .episode-description {
    font-size: 14px;
    opacity: 0.85;
  }
}

@media (max-width: 1024px) {
  .episodes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .episodes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
