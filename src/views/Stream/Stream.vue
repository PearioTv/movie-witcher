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
            <div class="year">{{ meta.year }}</div>
            <div class="runtime">{{ meta.runtime }}</div>
            <div class="rating" v-if="meta.imdbRating">
              ⭐ {{ meta.imdbRating }}
            </div>
          </div>

          <div class="description">{{ meta.description }}</div>

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
              {{ t('views.stream.trailer') }}
            </Button>
          </div>
        </div>
      </div>

      <div class="player-section" v-if="showPlayer">
        <VidfastPlayer
          :type="meta.type"
          :id="meta.imdb_id"
          :season="selectedSeason"
          :episode="selectedEpisodeNumber"
        />
      </div>

      <div class="series-navigation" v-if="isSeries">
        <div class="section-header">
          <h3>{{ t('views.stream.season') }}</h3>
          <Segments :segments="seasons" v-model="selectedSeason">
            <template #segment="{ segment }">
              <span>{{ t('views.stream.season') }} {{ segment }}</span>
            </template>
          </Segments>
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
              <div class="ep-number">{{ ep.episode }}</div>
            </div>

            <div class="ep-info">
              <div class="ep-name">
                {{ ep.name || `${t('views.stream.episode')} ${ep.episode}` }}
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

const isSeries = computed(() => meta.value && meta.value.type === "series");

const episodes = computed(() => {
  if (!meta.value || !meta.value.videos) return [];
  return meta.value.videos
    .filter((video) => video.season === selectedSeason.value)
    .sort((a, b) => a.episode - b.episode);
});

const selectedEpisodeNumber = computed(() =>
  selectedEpisode.value ? selectedEpisode.value.episode : 1
);

const openTrailer = () => {
  if (meta.value.trailers && meta.value.trailers.length) {
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
  router.replace({
    params: { ...router.currentRoute.value.params, id: ep.id },
  });
};

onMounted(async () => {
  const { type, id } = router.currentRoute.value.params;

  if (id && type) {
    const [metaId] = id.split(":");

    meta.value =
      type === "movie"
        ? await StremioService.getMetaMovie(metaId)
        : await StremioService.getMetaSeries(metaId);

    if (meta.value && meta.value.videos && meta.value.videos.length) {
      const episode =
        meta.value.videos.find(({ id: imdb_id }) => imdb_id === id) ||
        meta.value.videos[0];

      selectedSeason.value = episode.season || 1;
      selectedEpisode.value = episode;

      seasons.value = [...new Set(meta.value.videos.map(({ season }) => season))]
        .filter((s) => s > 0)
        .sort((a, b) => a - b);
    }
  }
});
</script>
