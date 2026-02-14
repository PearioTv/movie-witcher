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
          <Button @click="openPlayer" icon="play-circle-outline">
            {{ t('views.stream.watch') }}
          </Button>
          <Button v-if="meta.trailers && meta.trailers.length" type="secondary" @click="openTrailer" icon="videocam-outline">
            {{ t('views.stream.trailer') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- 🎬 POPUP PLAYER -->
    <transition name="popup">
      <div v-if="showPlayer" class="player-overlay" @click.self="closePlayer">
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import StremioService from "@/services/stremio.service";
import Button from '@/components/ui/Button.vue';
import VidfastPlayer from '@/components/player/VidfastPlayer.vue';

const { t } = useI18n();

const meta = ref({});
const selectedSeason = ref(1);
const selectedEpisode = ref(null);
const showPlayer = ref(false);

const isSeries = computed(() => meta.value && meta.value.type === 'series');

const selectedEpisodeNumber = computed(() => {
  return selectedEpisode.value ? selectedEpisode.value.episode : 1;
});

const openPlayer = () => {
  showPlayer.value = true;
  document.body.style.overflow = "hidden";
};

const closePlayer = () => {
  showPlayer.value = false;
  document.body.style.overflow = "auto";
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
      selectedEpisode.value = meta.value.videos[0];
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc);
});
</script>

<style lang="scss" scoped>
.stream {
  min-height: 100vh;
  padding: 40px 5%;
  color: white;
}

.player-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.93);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 40px;
}

.player-modal {
  position: relative;
  width: 95%;
  max-width: 1300px;
  aspect-ratio: 16 / 9;
  background: black;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 0 70px rgba(0, 0, 0, 0.9);
  animation: popupIn 0.35s ease;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 28px;
  color: white;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.2s ease;
}

.close-btn:hover {
  transform: scale(1.2);
}

.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.3s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}

@keyframes popupIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
