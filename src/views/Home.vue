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
          <span class="hero__sep">|</span>
          <span
            v-for="(g, gi) in (heroItem.genres || []).slice(0, 3)"
            :key="g"
            class="hero__genre-tag"
          >{{ g }}<span v-if="gi < Math.min((heroItem.genres||[]).length,3)-1" style="margin-left:8px;opacity:0.35">/</span></span>
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
        <div class="hero__strip-label">
          <span class="hero__strip-label-num">TOP</span>
          <span class="hero__strip-label-big">10</span>
        </div>
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

// ── Tokens
$bg:       #0d0d0d;
$surface:  #1a1a1a;
$border:   rgba(255,255,255,0.08);
$red:      #e53935;
$red-glow: rgba(229,57,53,0.4);
$muted:    rgba(255,255,255,0.45);
$card-w:   160px;
$card-h:   240px;
$card-r:   8px;

// ── Root
.home {
  background: $bg;
  color: #fff;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  font-family: 'Montserrat-Regular', sans-serif;
}

// ═══════════════════════════════ HERO ═══════════════════════════════
.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;

    &--skeleton {
      background: linear-gradient(135deg, #1a1a2e, #0f0f1a);
    }
  }

  &__bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    opacity: 0;
    transition: opacity 0.8s ease;

    .hero--loaded & { opacity: 1; }
  }

  &__bg-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to right, rgba(13,13,13,0.97) 0%, rgba(13,13,13,0.75) 40%, rgba(13,13,13,0.1) 70%, transparent 100%),
      linear-gradient(to top,   rgba(13,13,13,1) 0%, rgba(13,13,13,0.5) 35%, transparent 65%);
  }

  &__bg-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 75% 40%, transparent 30%, rgba(13,13,13,0.55) 100%);
  }

  &__content {
    position: relative;
    z-index: 10;
    padding: 0 56px 36px;
    max-width: 600px;

    @media (max-width: 900px)  { padding: 0 28px 28px; max-width: 100%; }
    @media (max-width: 560px)  { padding: 0 16px 20px; }
  }

  &__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 14px;
  }

  &__rating {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #f5c518;
    font-family: 'Montserrat-Bold', sans-serif;
    font-size: 15px;
    ion-icon { font-size: 14px; }
  }

  &__year {
    font-size: 14px;
    color: $muted;
  }

  &__sep {
    color: rgba(255,255,255,0.2);
    font-size: 12px;
  }

  &__genre-tag {
    font-size: 12px;
    color: rgba(255,255,255,0.7);
    padding: 2px 10px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 4px;
  }

  &__title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(44px, 7vw, 80px);
    line-height: 0.95;
    letter-spacing: 3px;
    margin: 0 0 16px;
    color: #fff;
    text-shadow: 0 4px 24px rgba(0,0,0,0.6);
  }

  &__desc {
    font-size: 14px;
    line-height: 1.7;
    color: rgba(255,255,255,0.58);
    margin: 0 0 28px;
    max-width: 460px;
  }

  &__actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    height: 48px;
    padding: 0 26px;
    border-radius: 8px;
    font-family: 'Montserrat-Bold', sans-serif;
    font-size: 14px;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    letter-spacing: 0.3px;
    ion-icon { font-size: 18px; }

    &--play {
      background: #fff;
      color: #111;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      &:hover { background: rgba(255,255,255,0.9); transform: translateY(-2px); }
      &:active { transform: scale(0.97); }
    }

    &--more {
      background: rgba(255,255,255,0.12);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.22);
      backdrop-filter: blur(6px);
      &:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }
    }
  }

  // ── TOP 10 strip
  &__strip {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 56px 32px;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }

    @media (max-width: 900px) { padding: 16px 28px 24px; }
    @media (max-width: 560px) { padding: 12px 16px 18px; }
  }

  &__strip-label {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
    gap: 1px;
    margin-right: 4px;
  }

  &__strip-label-num {
    font-size: 8px;
    font-family: 'Montserrat-Bold', sans-serif;
    letter-spacing: 3px;
    color: $red;
    text-transform: uppercase;
  }

  &__strip-label-big {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    color: rgba(255,255,255,0.5);
  }

  &__strip-items {
    display: flex;
    gap: 8px;
  }
}

// ── Strip thumb
.strip-thumb {
  position: relative;
  width: 60px;
  height: 88px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s, transform 0.2s;

  &:hover { transform: scale(1.07); }

  &--active {
    border-color: $red;
    box-shadow: 0 0 14px $red-glow;
  }

  &__rank {
    position: absolute;
    bottom: 3px;
    left: 5px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    line-height: 1;
    color: rgba(255,255,255,0.95);
    text-shadow: 0 1px 6px rgba(0,0,0,0.9);
    z-index: 2;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.8);
    transition: filter 0.2s;
    .strip-thumb--active &, .strip-thumb:hover & { filter: brightness(1); }
  }

  &__fallback {
    width: 100%; height: 100%;
    background: $surface;
    display: flex; align-items: center; justify-content: center;
    color: $muted; font-size: 20px;
  }
}

// ═══════════════════════════ MAIN CONTENT ═══════════════════════════
.main {
  padding: 48px 56px 100px;
  display: flex;
  flex-direction: column;
  gap: 56px;

  @media (max-width: 900px) { padding: 32px 28px 80px; }
  @media (max-width: 560px) { padding: 24px 16px 60px; gap: 40px; }
}

// ── Section
.section {
  &__head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__head-left { display: flex; flex-direction: column; gap: 3px; }

  &__sup {
    font-size: 10px;
    letter-spacing: 3.5px;
    color: $red;
    font-family: 'Montserrat-Bold', sans-serif;
    text-transform: uppercase;
  }

  &__title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(24px, 3.5vw, 36px);
    letter-spacing: 1.5px;
    color: #fff;
    margin: 0;
    line-height: 1;
  }

  &__tabs {
    display: flex;
    border-bottom: 2px solid rgba(255,255,255,0.08);
  }

  &__tab {
    font-size: 13px;
    font-family: 'Montserrat-Bold', sans-serif;
    color: $muted;
    background: none;
    border: none;
    padding: 6px 18px 10px;
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
      border-radius: 1px;
    }

    &:hover { color: rgba(255,255,255,0.8); }

    &--active {
      color: #fff;
      &::after { transform: scaleX(1); }
    }
  }
}

// ── Cards row
.cards-wrap {
  position: relative;
  // slight negative margin to align arrows outside
  margin: 0 -4px;
  padding: 0 4px;
}

.cards-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-60%);
  z-index: 20;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(15,15,15,0.92);
  border: 1px solid rgba(255,255,255,0.18);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 4px 20px rgba(0,0,0,0.6);

  &:hover {
    background: $red;
    border-color: $red;
    transform: translateY(-60%) scale(1.1);
  }

  &--prev { left: -20px; }
  &--next { right: -20px; }

  @media (max-width: 768px) { display: none; }
}

.cards {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 10px 2px 16px;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
  &::-webkit-scrollbar { display: none; }
}

// ── Card
.card {
  flex-shrink: 0;
  width: $card-w;
  cursor: pointer;
  scroll-snap-align: start;
  transition: transform 0.25s;

  &:hover {
    transform: scale(1.04) translateY(-4px);
    .card__overlay  { opacity: 1; }
    .card__poster   { filter: brightness(0.6); }
  }

  &__poster-wrap {
    position: relative;
    width: $card-w;
    height: $card-h;
    border-radius: $card-r;
    overflow: hidden;
    background: $surface;
    margin-bottom: 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.4);
    transition: box-shadow 0.25s;

    .card:hover & { box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
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
      font-size: 36px;
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.25s;
  }

  &__play-icon {
    font-size: 52px;
    color: #fff;
    filter: drop-shadow(0 2px 10px rgba(0,0,0,0.7));
  }

  &__rating {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0,0,0,0.75);
    border-radius: 5px;
    padding: 3px 8px;
    font-size: 11px;
    font-family: 'Montserrat-Bold', sans-serif;
    color: #f5c518;
    display: flex;
    align-items: center;
    gap: 3px;
    backdrop-filter: blur(4px);
    ion-icon { font-size: 10px; }
  }

  &__type-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(229,57,53,0.88);
    border-radius: 4px;
    padding: 2px 7px;
    font-size: 9px;
    font-family: 'Montserrat-Bold', sans-serif;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    backdrop-filter: blur(4px);
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 3px;
  }

  &__name {
    font-size: 13px;
    font-family: 'Montserrat-Bold', sans-serif;
    color: rgba(255,255,255,0.92);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
  }

  &__year {
    font-size: 11px;
    color: $muted;
  }
}

// ── Skeleton
.skeleton {
  background: linear-gradient(90deg, #1c1c1c 25%, #262626 50%, #1c1c1c 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
  border-radius: 4px;

  &--poster {
    width: $card-w;
    height: $card-h;
    border-radius: $card-r;
  }

  &--line { display: block; }
}

@keyframes shimmer {
  from { background-position: 200% center; }
  to   { background-position: -200% center; }
}
</style>
