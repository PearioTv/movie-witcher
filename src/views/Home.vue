<template>
  <div class="home">

    <!-- ══════════════════════ HERO SPOTLIGHT ══════════════════════ -->
    <section class="hero" :class="{ 'hero--loaded': heroLoaded }">
      <!-- Backdrop image -->
      <div class="hero__bg" v-if="heroItem">
        <img
          class="hero__bg-img"
          :src="heroItem.background || heroItem.poster"
          :alt="heroItem.name"
          @load="heroLoaded = true"
        />
        <div class="hero__bg-overlay"></div>
        <div class="hero__bg-vignette"></div>
      </div>
      <div class="hero__bg hero__bg--skeleton" v-else></div>

      <!-- Content -->
      <div class="hero__content" v-if="heroItem">
        <div class="hero__meta">
          <span class="hero__rating" v-if="heroItem.imdbRating">
            <ion-icon name="star"></ion-icon>
            {{ heroItem.imdbRating }}
          </span>
          <span class="hero__year" v-if="heroItem.year">{{ heroItem.year }}</span>
          <span
            v-for="g in (heroItem.genres || []).slice(0, 3)"
            :key="g"
            class="hero__genre-tag"
          >{{ g }}</span>
        </div>

        <h1 class="hero__title">{{ heroItem.name }}</h1>

        <p class="hero__desc" v-if="heroItem.description">
          {{ heroItem.description.slice(0, 180) }}{{ heroItem.description.length > 180 ? '...' : '' }}
        </p>

        <div class="hero__actions">
          <button class="hero__btn hero__btn--play" @click="goToStream(heroItem)">
            <ion-icon name="play"></ion-icon>
            {{ $t('views.stream.watch') }}
          </button>
          <button class="hero__btn hero__btn--more" @click="goToStream(heroItem)">
            <ion-icon name="information-circle-outline"></ion-icon>
            {{ $t('views.stream.trailer') }}
          </button>
        </div>
      </div>

      <!-- Hero skeleton -->
      <div class="hero__content" v-else>
        <div class="skeleton skeleton--line" style="width:120px;height:20px;margin-bottom:16px"></div>
        <div class="skeleton skeleton--line" style="width:340px;height:52px;margin-bottom:12px"></div>
        <div class="skeleton skeleton--line" style="width:280px;height:16px;margin-bottom:8px"></div>
        <div class="skeleton skeleton--line" style="width:240px;height:16px;margin-bottom:28px"></div>
        <div style="display:flex;gap:12px">
          <div class="skeleton skeleton--line" style="width:120px;height:44px;border-radius:8px"></div>
          <div class="skeleton skeleton--line" style="width:120px;height:44px;border-radius:8px"></div>
        </div>
      </div>

      <!-- Hero thumbnails strip (TOP 10) -->
      <div class="hero__strip" v-if="sections[0]?.items?.length">
        <span class="hero__strip-label">
          <span class="hero__strip-label-num">TOP</span>10
        </span>
        <div class="hero__strip-items">
          <div
            v-for="(item, i) in sections[0].items.slice(0, 8)"
            :key="item.id"
            class="strip-thumb"
            :class="{ 'strip-thumb--active': heroItem?.id === item.id }"
            @click="heroItem = item"
          >
            <span class="strip-thumb__rank">{{ i + 1 }}</span>
            <img
              v-if="item.poster"
              :src="item.poster"
              :alt="item.name"
              class="strip-thumb__img"
            />
            <div class="strip-thumb__fallback" v-else>
              <ion-icon name="film-outline"></ion-icon>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════ MAIN CONTENT ══════════════════════ -->
    <div class="main">

      <div v-for="section in sections" :key="section.id" class="section">

        <!-- Section header -->
        <div class="section__head">
          <div class="section__head-left">
            <span class="section__sup">{{ section.sup }}</span>
            <h2 class="section__title">{{ section.title }}</h2>
          </div>
          <div class="section__tabs" v-if="section.tabs">
            <button
              v-for="tab in section.tabs"
              :key="tab.key"
              class="section__tab"
              :class="{ 'section__tab--active': section.activeTab === tab.key }"
              @click="section.activeTab = tab.key; loadSectionTab(section)"
            >{{ tab.label }}</button>
          </div>
        </div>

        <!-- Cards row -->
        <div class="cards-wrap" v-if="!section.loading && section.items?.length">
          <button class="cards-nav cards-nav--prev" @click="scroll(section.id, -1)">
            <ion-icon name="chevron-back-outline"></ion-icon>
          </button>
          <div class="cards" :id="`row-${section.id}`">
            <div
              v-for="item in section.items"
              :key="item.id"
              class="card"
              @click="goToStream(item)"
            >
              <div class="card__poster-wrap">
                <img
                  v-if="item.poster"
                  :src="item.poster"
                  :alt="item.name"
                  class="card__poster"
                  loading="lazy"
                />
                <div class="card__poster card__poster--empty" v-else>
                  <ion-icon name="film-outline"></ion-icon>
                </div>
                <div class="card__overlay">
                  <ion-icon name="play-circle" class="card__play-icon"></ion-icon>
                </div>
                <span class="card__rating" v-if="item.imdbRating">
                  <ion-icon name="star"></ion-icon>
                  {{ item.imdbRating }}
                </span>
                <span class="card__type-badge">{{ item.type === 'series' ? $t('views.search.segments.series') : $t('views.search.segments.movies') }}</span>
              </div>
              <div class="card__info">
                <span class="card__name">{{ item.name }}</span>
                <span class="card__year">{{ item.year || item.releaseInfo }}</span>
              </div>
            </div>
          </div>
          <button class="cards-nav cards-nav--next" @click="scroll(section.id, 1)">
            <ion-icon name="chevron-forward-outline"></ion-icon>
          </button>
        </div>

        <!-- Loading skeletons -->
        <div class="cards-wrap" v-else-if="section.loading">
          <div class="cards">
            <div v-for="n in 8" :key="n" class="card">
              <div class="card__poster-wrap">
                <div class="skeleton skeleton--poster"></div>
              </div>
              <div class="card__info">
                <div class="skeleton skeleton--line" style="width:80%;height:13px;margin-bottom:6px;border-radius:4px"></div>
                <div class="skeleton skeleton--line" style="width:50%;height:11px;border-radius:4px"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';
import router from '@/router';

const CINEMETA = 'https://v3-cinemeta.strem.io';

// ── State ────────────────────────────────────────────────────────────────────
const heroItem   = ref(null);
const heroLoaded = ref(false);

const sections = reactive([
  {
    id: 'top10',
    sup: 'TOP 10',
    title: "What's popular today",
    type: 'movie',
    catalog: 'top',
    loading: true,
    items: [],
  },
  {
    id: 'trending',
    sup: 'RIGHT NOW',
    title: 'Trending Today',
    tabs: [
      { key: 'movie',  label: 'Movies' },
      { key: 'series', label: 'Series' },
    ],
    activeTab: 'movie',
    type: 'movie',
    catalog: 'top',
    loading: true,
    items: [],
  },
  {
    id: 'toprated',
    sup: 'HIGHLY RATED',
    title: 'Top Rated',
    tabs: [
      { key: 'movie',  label: 'Movies' },
      { key: 'series', label: 'Series' },
    ],
    activeTab: 'movie',
    type: 'movie',
    catalog: 'top',
    loading: true,
    items: [],
  },
  {
    id: 'series',
    sup: 'BINGE-WORTHY',
    title: 'Popular Series',
    type: 'series',
    catalog: 'top',
    loading: true,
    items: [],
  },
]);

// ── Fetch ────────────────────────────────────────────────────────────────────
async function fetchCatalog(type, catalog = 'top', limit = 20) {
  try {
    const { data } = await axios.get(`${CINEMETA}/catalog/${type}/${catalog}.json`);
    return (data.metas || []).slice(0, limit);
  } catch {
    return [];
  }
}

async function loadSectionTab(section) {
  section.loading = true;
  const type = section.activeTab || section.type;
  section.items = await fetchCatalog(type, section.catalog);
  section.loading = false;
}

onMounted(async () => {
  // Load all sections in parallel
  const [movies, trending, topRated, series] = await Promise.all([
    fetchCatalog('movie', 'top', 20),
    fetchCatalog('movie', 'top', 20),
    fetchCatalog('movie', 'top', 20),
    fetchCatalog('series', 'top', 20),
  ]);

  sections[0].items   = movies;
  sections[0].loading = false;
  sections[1].items   = trending;
  sections[1].loading = false;
  sections[2].items   = topRated;
  sections[2].loading = false;
  sections[3].items   = series;
  sections[3].loading = false;

  // Pick a random hero item from top movies with a background image
  const withBg = movies.filter(m => m.background || m.poster);
  heroItem.value = withBg[Math.floor(Math.random() * Math.min(5, withBg.length))] || movies[0];
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function goToStream(item) {
  if (!item) return;
  const type = item.type === 'series' ? 'series' : 'movie';
  const id   = item.imdb_id || item.id;
  router.push({ name: 'stream', params: { type, id } });
}

function scroll(sectionId, dir) {
  const el = document.getElementById(`row-${sectionId}`);
  if (el) el.scrollBy({ left: dir * 320, behavior: 'smooth' });
}
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

// ── Tokens ───────────────────────────────────────────────────────────────────
$bg:       #0d0d0d;
$surface:  #161616;
$border:   rgba(255,255,255,0.07);
$red:      #e53935;
$red-glow: rgba(229,57,53,0.4);
$muted:    rgba(255,255,255,0.45);
$card-w:   148px;
$card-r:   8px;

// ── Root ─────────────────────────────────────────────────────────────────────
.home {
  background: $bg;
  color: #fff;
  min-height: 100vh;
  overflow-x: hidden;
  font-family: 'Montserrat-Regular', sans-serif;
}

// ══════════════════════════════════ HERO ═════════════════════════════════════
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;

  // ── Background ──
  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;

    &--skeleton {
      background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
    }
  }

  &__bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    filter: grayscale(20%);
    transition: opacity 0.6s ease;
    opacity: 0;

    .hero--loaded & { opacity: 1; }
  }

  &__bg-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to right,  rgba(13,13,13,0.95) 0%, rgba(13,13,13,0.5) 55%, transparent 100%),
      linear-gradient(to top,    rgba(13,13,13,1)    0%, rgba(13,13,13,0.2) 50%, transparent 100%);
  }

  &__bg-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 70% 50%, transparent 40%, rgba(13,13,13,0.6) 100%);
  }

  // ── Content ──
  &__content {
    position: relative;
    z-index: 10;
    padding: 100px 48px 40px;
    max-width: 560px;

    @media (max-width: 768px) {
      padding: 100px 20px 32px;
      max-width: 100%;
    }
  }

  &__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  &__rating {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #f5c518;
    font-family: 'Montserrat-Bold', sans-serif;
    font-size: 14px;

    ion-icon { font-size: 13px; }
  }

  &__year {
    font-size: 14px;
    color: $muted;
  }

  &__genre-tag {
    font-size: 12px;
    color: rgba(255,255,255,0.65);
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 4px;
    padding: 2px 9px;
  }

  &__title {
    font-family: 'Bebas Neue', 'Montserrat-Bold', sans-serif;
    font-size: clamp(40px, 6vw, 72px);
    line-height: 1;
    letter-spacing: 2px;
    margin: 0 0 14px;
    color: #fff;
    text-shadow: 0 2px 20px rgba(0,0,0,0.5);
  }

  &__desc {
    font-size: 14px;
    line-height: 1.65;
    color: rgba(255,255,255,0.6);
    margin: 0 0 28px;
    max-width: 440px;
  }

  &__actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 46px;
    padding: 0 24px;
    border-radius: 8px;
    font-family: 'Montserrat-Bold', sans-serif;
    font-size: 14px;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    ion-icon { font-size: 18px; }

    &--play {
      background: #fff;
      color: #111;
      &:hover { background: rgba(255,255,255,0.88); transform: scale(1.03); }
    }

    &--more {
      background: rgba(255,255,255,0.15);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.2);
      backdrop-filter: blur(8px);
      &:hover { background: rgba(255,255,255,0.22); }
    }
  }

  // ── Thumbnails strip ──
  &__strip {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 48px 28px;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }

    @media (max-width: 768px) { padding: 12px 20px 20px; }
  }

  &__strip-label {
    flex-shrink: 0;
    font-size: 11px;
    letter-spacing: 1px;
    color: $muted;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    line-height: 1;
    font-family: 'Montserrat-Bold', sans-serif;
    margin-right: 4px;
  }

  &__strip-label-num {
    font-size: 9px;
    color: $red;
    letter-spacing: 2px;
  }

  &__strip-items {
    display: flex;
    gap: 8px;
  }
}

// ── Strip thumbnail ───────────────────────────────────────────────────────────
.strip-thumb {
  position: relative;
  width: 64px;
  height: 90px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s, transform 0.2s;

  &:hover { transform: scale(1.06); }

  &--active {
    border-color: $red;
    box-shadow: 0 0 12px $red-glow;
  }

  &__rank {
    position: absolute;
    bottom: 4px;
    left: 5px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    line-height: 1;
    color: rgba(255,255,255,0.9);
    text-shadow: 0 1px 4px rgba(0,0,0,0.8);
    z-index: 2;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__fallback {
    width: 100%;
    height: 100%;
    background: $surface;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $muted;
    font-size: 22px;
  }
}

// ══════════════════════════════ MAIN CONTENT ══════════════════════════════════
.main {
  padding: 0 48px 80px;
  display: flex;
  flex-direction: column;
  gap: 52px;
  max-width: 1440px;
  margin: 0 auto;

  @media (max-width: 768px) { padding: 0 16px 60px; }
}

// ── Section ───────────────────────────────────────────────────────────────────
.section {

  &__head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 18px;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__head-left { display: flex; flex-direction: column; gap: 2px; }

  &__sup {
    font-size: 10px;
    letter-spacing: 3px;
    color: $red;
    font-family: 'Montserrat-Bold', sans-serif;
    text-transform: uppercase;
  }

  &__title {
    font-family: 'Bebas Neue', 'Montserrat-Bold', sans-serif;
    font-size: clamp(22px, 3vw, 32px);
    letter-spacing: 1px;
    color: #fff;
    margin: 0;
    line-height: 1;
  }

  &__tabs {
    display: flex;
    gap: 0;
    border-bottom: 2px solid rgba(255,255,255,0.08);
  }

  &__tab {
    font-size: 13px;
    font-family: 'Montserrat-Bold', sans-serif;
    color: $muted;
    background: none;
    border: none;
    padding: 6px 16px 10px;
    cursor: pointer;
    position: relative;
    transition: color 0.2s;
    margin-bottom: -2px;

    &::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 2px;
      background: $red;
      transform: scaleX(0);
      transition: transform 0.2s;
    }

    &:hover { color: rgba(255,255,255,0.8); }

    &--active {
      color: #fff;
      &::after { transform: scaleX(1); }
    }
  }
}

// ── Cards row ─────────────────────────────────────────────────────────────────
.cards-wrap {
  position: relative;
}

.cards-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-60%);
  z-index: 20;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(20,20,20,0.9);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5);

  &:hover { background: $red; transform: translateY(-60%) scale(1.1); }
  &--prev { left: -18px; }
  &--next { right: -18px; }

  @media (max-width: 768px) { display: none; }
}

.cards {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 2px 14px;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
  &::-webkit-scrollbar { display: none; }
}

// ── Card ──────────────────────────────────────────────────────────────────────
.card {
  flex-shrink: 0;
  width: $card-w;
  cursor: pointer;
  scroll-snap-align: start;
  transition: transform 0.25s;

  &:hover {
    transform: scale(1.05);
    .card__overlay { opacity: 1; }
    .card__poster { filter: brightness(0.65); }
  }

  &__poster-wrap {
    position: relative;
    width: $card-w;
    height: 220px;
    border-radius: $card-r;
    overflow: hidden;
    background: $surface;
    margin-bottom: 8px;
  }

  &__poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: filter 0.25s;

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
      background: $surface;
      color: rgba(255,255,255,0.2);
      font-size: 32px;
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.25s;
  }

  &__play-icon {
    font-size: 48px;
    color: rgba(255,255,255,0.9);
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6));
  }

  &__rating {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0,0,0,0.7);
    border-radius: 4px;
    padding: 3px 7px;
    font-size: 11px;
    font-family: 'Montserrat-Bold', sans-serif;
    color: #f5c518;
    display: flex;
    align-items: center;
    gap: 3px;
    ion-icon { font-size: 10px; }
  }

  &__type-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(229,57,53,0.85);
    border-radius: 4px;
    padding: 2px 7px;
    font-size: 10px;
    font-family: 'Montserrat-Bold', sans-serif;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 0 2px;
  }

  &__name {
    font-size: 13px;
    font-family: 'Montserrat-Bold', sans-serif;
    color: rgba(255,255,255,0.9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }

  &__year {
    font-size: 11px;
    color: $muted;
  }
}

// ── Skeletons ──────────────────────────────────────────────────────────────────
.skeleton {
  background: linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;

  &--poster {
    width: $card-w;
    height: 220px;
    border-radius: $card-r;
  }

  &--line { display: block; }
}

@keyframes shimmer {
  from { background-position: 200% center; }
  to   { background-position: -200% center; }
}
</style>
