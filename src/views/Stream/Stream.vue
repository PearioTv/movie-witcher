<template>
  <div class="stream">
    <!-- الخلفية -->
    <div class="background">
      <div class="blur"></div>
      <div
        v-if="meta?.background"
        class="image"
        :style="`background-image: url(${meta.background})`"
      ></div>
    </div>

    <div class="content-container">
      <div class="meta" v-if="meta">
        <img v-if="meta.logo" class="logo" :src="meta.logo" />
        <div v-else class="title">{{ meta.name }}</div>

        <div class="details">
          <div>{{ meta.year }}</div>
          <div>{{ meta.runtime }}</div>
          <div v-if="meta.imdbRating">⭐ {{ meta.imdbRating }}</div>
        </div>

        <div class="description">{{ meta.description }}</div>

        <div class="tags">
          <div v-for="g in meta.genres" :key="g" class="tag">
            {{ g }}
          </div>
        </div>

        <div class="actions">
          <Button @click="openPlayer" icon="play-circle-outline">
            {{ t('views.stream.watch') }}
          </Button>

          <Button
            v-if="meta.trailers?.length"
            type="secondary"
            @click="openTrailer"
            icon="videocam-outline"
          >
            {{ t('views.stream.trailer') }}
          </Button>
        </div>
      </div>

      <!-- مواسم -->
      <div v-if="isSeries" class="series-navigation">
        <Segments :segments="seasons" v-model="selectedSeason">
          <template #segment="{ segment }">
            Season {{ segment }}
          </template>
        </Segments>

        <div class="episodes-grid">
          <div
            v-for="ep in episodes"
            :key="ep.id"
            class="episode-card"
            :class="{ active: selectedEpisode?.id === ep.id }"
            @click="selectEpisode(ep)"
          >
            {{ ep.episode }}. {{ ep.name }}
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
            :episode="selectedEpisode?.episode || 1"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
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

const openPlayer = () => {
  showPlayer.value = true;
};

const closePlayer = () => {
  showPlayer.value = false;
};

const handleEsc = (e) => {
  if (e.key === "Escape") closePlayer();
};

const openTrailer = () => {
  if (meta.value?.trailers?.length) {
    const trailer = meta.value.trailers[0];
    window.open(
      `https://youtube.com/watch?v=${trailer.source}`,
      "_blank"
    );
  }
};

const selectEpisode = (ep) => {
  selectedEpisode.value = ep;
  showPlayer.value = true;
};

onMounted(async () => {
  window.addEventListener("keydown", handleEsc);

  const { type, id } = router.currentRoute.value.params;

  if (type && id) {
    const [metaId] = id.split(":");

    meta.value =
      type === "movie"
        ? await StremioService.getMetaMovie(metaId)
        : await StremioService.getMetaSeries(metaId);

    if (meta.value?.videos?.length) {
      selectedEpisode.value = meta.value.videos[0];

      seasons.value = [
        ...new Set(meta.value.videos.map(v => v.season))
      ].sort((a, b) => a - b);
    }
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleEsc);
});
</script>

<style scoped>
.stream {
  min-height: 100vh;
  padding: 40px 5%;
  color: white;
}

.player-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
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
