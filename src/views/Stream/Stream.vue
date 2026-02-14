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
      <div class="meta" v-if="meta">
        <div class="meta-center-wrapper">
          <img class="logo" :src="meta.logo" alt="" v-if="meta.logo" />
          <div class="title" v-else>{{ meta.name }}</div>

          <div class="details">
            <div>{{ meta.year }}</div>
            <div>{{ meta.runtime }}</div>
            <div v-if="meta.imdbRating">⭐ {{ meta.imdbRating }}</div>
          </div>

          <div class="description">{{ meta.description }}</div>

          <div class="tags">
            <div class="tag" v-for="genre in meta.genres" :key="genre">
              {{ genre }}
            </div>
          </div>

          <!-- ACTION BUTTONS -->
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

      <!-- SERIES -->
      <div class="series-navigation" v-if="isSeries">
        <div class="section-header">
          <h3>{{ t('views.stream.season') }}</h3>
          <Segments :segments="seasons" v-model="selectedSeason" />
        </div>

        <div class="episodes-grid">
          <div
            v-for="ep in episodes"
            :key="ep.id"
            class="episode-card"
            :class="{ active: selectedEpisode && selectedEpisode.id === ep.id }"
            @click="selectEpisode(ep)"
          >
            <div
              class="ep-thumbnail"
              :style="ep.thumbnail ? `background-image: url(${ep.thumbnail})` : ''"
            >
              <div class="ep-number">Ep {{ ep.episode }}</div>
            </div>

            <div class="ep-info">
              <div class="ep-name">
                {{ ep.name || `Episode ${ep.episode}` }}
              </div>
              <div class="ep-aired" v-if="ep.released">
                {{ new Date(ep.released).toLocaleDateString() }}
              </div>
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
import Segments from "@/components/ui/Segments.vue";
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
    window.open(`https://www.youtube.com/watch?v=${trailer.source}`, "_blank");
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
  min-height: 100vh;
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
    max-width: 1100px;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: 50px;
  }

  .meta {
    text-align: center;

    .title {
      font-size: 48px;
      font-weight: bold;
    }

    .details {
      display: flex;
      justify-content: center;
      gap: 20px;
      opacity: 0.8;
    }

    .description {
      max-width: 700px;
      margin: auto;
      opacity: 0.9;
    }

    .tags {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;

      .tag {
        background: rgba(255, 255, 255, 0.1);
        padding: 6px 14px;
        border-radius: 20px;
      }
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 25px;
      flex-wrap: wrap;

      .action-btn {
        min-width: 180px;
        max-width: 260px;
        padding: 14px 20px;
        text-transform: uppercase;
        transition: 0.2s ease;
      }

      .action-btn:hover {
        transform: translateY(-3px);
      }
    }
  }

  /* 🔥 Episodes Design */
  .series-navigation {
    display: flex;
    flex-direction: column;
    gap: 35px;

    .episodes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 25px;
    }

    .episode-card {
      background: rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      overflow: hidden;
      cursor: pointer;
      transition: 0.25s ease;
      border: 1px solid rgba(255, 255, 255, 0.08);

      &:hover {
        transform: translateY(-6px);
        background: rgba(255, 255, 255, 0.12);
      }

      &.active {
        border-color: #16c784;
        background: rgba(22, 199, 132, 0.12);
      }

      .ep-thumbnail {
        aspect-ratio: 16/9;
        background-size: cover;
        background-position: center;
        position: relative;

        .ep-number {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.7);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 13px;
        }
      }

      .ep-info {
        padding: 16px;

        .ep-name {
          font-weight: 600;
          margin-bottom: 6px;
        }

        .ep-aired {
          font-size: 13px;
          opacity: 0.6;
        }
      }
    }
  }
}
</style>
