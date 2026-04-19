<template>
  <div class="home">

    <!-- ═══════════════════════════════ HERO ═══════════════════════════════ -->
    <section class="hero">
      <div class="hero__backdrop">
        <div class="hero__gradient"></div>
        <div class="hero__grid"></div>
        <div class="hero__posters" aria-hidden="true">
          <div v-for="col in 6" :key="col" class="poster-col">
            <div v-for="n in 8" :key="n" class="poster-block" :class="`poster-block--${(n + col) % 4}`"></div>
          </div>
        </div>
      </div>

      <div class="hero__content">
        <div class="hero__badge">
          <span class="hero__badge-dot"></span>
          <span>{{ $t('views.home.badge') }}</span>
        </div>

        <h1 class="hero__title">
          <span class="hero__title-main">Movie</span>
          <span class="hero__title-accent">Witcher</span>
        </h1>

        <p class="hero__sub">{{ $t('views.home.sub') }}</p>

        <div class="hero__actions">
          <button class="btn btn--primary" @click="goToSearch()">
            <ion-icon name="search-outline"></ion-icon>
            {{ $t('views.search.title') }}
          </button>
          <button class="btn btn--ghost" @click="scrollToContent()">
            <ion-icon name="compass-outline"></ion-icon>
            {{ $t('views.home.browse') }}
          </button>
        </div>

        <div class="hero__stats">
          <div class="hero__stat">
            <span class="hero__stat-num">500K+</span>
            <span class="hero__stat-label">{{ $t('views.home.stats.movies') }}</span>
          </div>
          <div class="hero__stat-divider"></div>
          <div class="hero__stat">
            <span class="hero__stat-num">120K+</span>
            <span class="hero__stat-label">{{ $t('views.home.stats.series') }}</span>
          </div>
          <div class="hero__stat-divider"></div>
          <div class="hero__stat">
            <span class="hero__stat-num">50+</span>
            <span class="hero__stat-label">{{ $t('views.home.stats.genres') }}</span>
          </div>
        </div>
      </div>

      <div class="hero__scroll-hint" @click="scrollToContent()">
        <div class="scroll-mouse">
          <div class="scroll-mouse__dot"></div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════ CONTENT SECTION ═══════════════════════ -->
    <section class="content-section" ref="contentSection">

      <div class="genres-bar">
        <button
          v-for="genre in genres"
          :key="genre.key"
          class="genre-pill"
          :class="{ 'genre-pill--active': activeGenre === genre.key }"
          @click="activeGenre = genre.key"
        >
          <ion-icon :name="genre.icon"></ion-icon>
          {{ $t(genre.label) }}
        </button>
      </div>

      <div class="feature-grid">
        <div class="feature-card feature-card--search" @click="goToSearch()">
          <div class="feature-card__icon">
            <ion-icon name="search-outline"></ion-icon>
          </div>
          <div class="feature-card__body">
            <h3 class="feature-card__title">{{ $t('views.search.title') }}</h3>
            <p class="feature-card__desc">{{ $t('views.home.features.search') }}</p>
          </div>
          <ion-icon name="arrow-forward-outline" class="feature-card__arrow"></ion-icon>
          <div class="feature-card__glow feature-card__glow--red"></div>
        </div>

        <div class="feature-card feature-card--movies" @click="goToSearch('movie')">
          <div class="feature-card__icon">
            <ion-icon name="film-outline"></ion-icon>
          </div>
          <div class="feature-card__body">
            <h3 class="feature-card__title">{{ $t('views.home.features.movies') }}</h3>
            <p class="feature-card__desc">{{ $t('views.home.features.moviesDesc') }}</p>
          </div>
          <ion-icon name="arrow-forward-outline" class="feature-card__arrow"></ion-icon>
          <div class="feature-card__glow feature-card__glow--blue"></div>
        </div>

        <div class="feature-card feature-card--series" @click="goToSearch('series')">
          <div class="feature-card__icon">
            <ion-icon name="tv-outline"></ion-icon>
          </div>
          <div class="feature-card__body">
            <h3 class="feature-card__title">{{ $t('views.home.features.series') }}</h3>
            <p class="feature-card__desc">{{ $t('views.home.features.seriesDesc') }}</p>
          </div>
          <ion-icon name="arrow-forward-outline" class="feature-card__arrow"></ion-icon>
          <div class="feature-card__glow feature-card__glow--purple"></div>
        </div>
      </div>

      <div class="how-it-works">
        <p class="section-label">{{ $t('views.home.how.label') }}</p>
        <h2 class="section-title">{{ $t('views.home.how.title') }}</h2>

        <div class="steps">
          <div class="step" v-for="(step, i) in steps" :key="i">
            <div class="step__num">{{ i + 1 }}</div>
            <ion-icon :name="step.icon" class="step__icon"></ion-icon>
            <h4 class="step__title">{{ $t(step.title) }}</h4>
            <p class="step__desc">{{ $t(step.desc) }}</p>
          </div>
        </div>
      </div>

    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import router from '@/router';

const contentSection = ref(null);
const activeGenre = ref('all');

const genres = [
  { key: 'all',      icon: 'apps-outline',    label: 'views.home.genres.all'      },
  { key: 'action',   icon: 'flash-outline',   label: 'views.home.genres.action'   },
  { key: 'drama',    icon: 'heart-outline',   label: 'views.home.genres.drama'    },
  { key: 'comedy',   icon: 'happy-outline',   label: 'views.home.genres.comedy'   },
  { key: 'horror',   icon: 'skull-outline',   label: 'views.home.genres.horror'   },
  { key: 'scifi',    icon: 'planet-outline',  label: 'views.home.genres.scifi'    },
  { key: 'thriller', icon: 'eye-outline',     label: 'views.home.genres.thriller' },
  { key: 'romance',  icon: 'rose-outline',    label: 'views.home.genres.romance'  },
];

const steps = [
  { icon: 'search-outline',      title: 'views.home.steps.0.title', desc: 'views.home.steps.0.desc' },
  { icon: 'play-circle-outline', title: 'views.home.steps.1.title', desc: 'views.home.steps.1.desc' },
  { icon: 'people-outline',      title: 'views.home.steps.2.title', desc: 'views.home.steps.2.desc' },
];

const goToSearch = (type) => {
  router.push({ name: 'search', query: type ? { type } : {} });
};

const scrollToContent = () => {
  contentSection.value?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

$red:    #e53935;
$red-dk: #b71c1c;
$bg:     #0a0a0f;
$card:   rgba(255,255,255,0.04);
$border: rgba(255,255,255,0.08);
$muted:  rgba(255,255,255,0.4);

.home {
  min-height: 100vh;
  background: $bg;
  color: #fff;
  overflow-x: hidden;
}

// ── HERO ─────────────────────────────────────────────────────────────────────
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;

  &__backdrop { position: absolute; inset: 0; z-index: 0; }

  &__gradient {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 90% 55% at 50% -5%, rgba(229,57,53,0.22) 0%, transparent 55%),
      radial-gradient(ellipse 50% 40% at 90% 90%, rgba(106,27,154,0.15) 0%, transparent 55%),
      $bg;
  }

  &__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
    background-size: 55px 55px;
  }

  &__posters {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    opacity: 0.10;
    transform: rotate(-5deg) scale(1.25);
    overflow: hidden;
    pointer-events: none;
  }

  &__content {
    position: relative;
    z-index: 10;
    padding: 120px 20px 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: fadeUp 0.9s ease both;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(229,57,53,0.14);
    border: 1px solid rgba(229,57,53,0.3);
    border-radius: 20px;
    padding: 6px 18px;
    font-size: 11px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #ef5350;
    margin-bottom: 28px;
  }

  &__badge-dot {
    display: inline-block;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #ef5350;
    animation: pulse 1.6s ease infinite;
  }

  &__title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(64px, 14vw, 120px);
    line-height: 0.88;
    letter-spacing: 3px;
    margin: 0 0 10px;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }

  &__title-main {
    background: linear-gradient(160deg, #fff 40%, rgba(255,255,255,0.45));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &__title-accent {
    background: linear-gradient(160deg, #ef5350, #c62828);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &__sub {
    font-size: 16px;
    color: $muted;
    letter-spacing: 1px;
    margin: 0 0 44px;
    max-width: 440px;
    line-height: 1.6;
  }

  &__actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 52px;
  }

  &__stats {
    display: flex;
    align-items: center;
    gap: 28px;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }

  &__stat-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 34px;
    color: #fff;
    line-height: 1;
  }

  &__stat-label {
    font-size: 10px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  &__stat-divider {
    width: 1px; height: 36px;
    background: rgba(255,255,255,0.1);
  }

  &__scroll-hint {
    position: absolute;
    bottom: 36px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    cursor: pointer;
    opacity: 0.45;
    transition: opacity 0.2s;
    animation: fadeUp 1s ease 0.5s both;
    &:hover { opacity: 0.85; }
  }
}

// ── Poster columns ────────────────────────────────────────────────────────────
.poster-col {
  display: flex;
  flex-direction: column;
  gap: 7px;
  animation: scrollUp 22s linear infinite;

  &:nth-child(even) {
    animation: scrollDown 28s linear infinite;
    margin-top: -60px;
  }
  &:nth-child(3n) { animation-duration: 19s; }
}

.poster-block {
  width: 78px; height: 116px;
  border-radius: 7px;
  flex-shrink: 0;
  background: linear-gradient(140deg, #1a1a2e, #16213e, #0f3460);

  &--1 { background: linear-gradient(140deg, #2d1b1b, #4a1942, #1a0a2e); }
  &--2 { background: linear-gradient(140deg, #0d2137, #0a3d62, #1565c0); }
  &--3 { background: linear-gradient(140deg, #1b2a1b, #1a3a2a, #0b4a2a); }
}

// ── Scroll mouse ──────────────────────────────────────────────────────────────
.scroll-mouse {
  width: 24px; height: 40px;
  border: 1.5px solid rgba(255,255,255,0.3);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  padding-top: 7px;

  &__dot {
    width: 4px; height: 8px;
    background: rgba(255,255,255,0.6);
    border-radius: 2px;
    animation: scrollDot 1.8s ease infinite;
  }
}

// ── Buttons ───────────────────────────────────────────────────────────────────
.btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  border-radius: 8px;
  padding: 0 28px;
  height: 50px;
  font-family: 'Montserrat-Bold', sans-serif;
  font-size: 14px;
  letter-spacing: 0.5px;
  cursor: pointer;
  border: none;
  transition: transform 0.2s, background 0.2s, box-shadow 0.2s;

  ion-icon { font-size: 18px; }

  &--primary {
    background: $red;
    color: #fff;
    box-shadow: 0 4px 24px rgba(229,57,53,0.35);
    &:hover {
      background: $red-dk;
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(229,57,53,0.5);
    }
  }

  &--ghost {
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.85);
    border: 1px solid $border;
    &:hover {
      background: rgba(255,255,255,0.12);
      transform: translateY(-2px);
    }
  }
}

// ── Content section ───────────────────────────────────────────────────────────
.content-section {
  position: relative;
  z-index: 10;
  padding: 0 20px 80px;
  max-width: 960px;
  margin: 0 auto;
}

// ── Genre bar ─────────────────────────────────────────────────────────────────
.genres-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 48px;
  padding-top: 8px;
}

.genre-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: $card;
  border: 1px solid $border;
  border-radius: 24px;
  padding: 8px 16px;
  font-size: 13px;
  color: $muted;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Montserrat-Regular', sans-serif;

  ion-icon { font-size: 14px; }

  &:hover {
    color: #fff;
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.18);
  }

  &--active {
    background: rgba(229,57,53,0.18) !important;
    border-color: rgba(229,57,53,0.4) !important;
    color: #ef5350 !important;
  }
}

// ── Feature grid ──────────────────────────────────────────────────────────────
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 72px;
}

.feature-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  background: $card;
  border: 1px solid $border;
  border-radius: 14px;
  padding: 22px 20px;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s, border-color 0.2s;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(255,255,255,0.16);
    .feature-card__glow { opacity: 1; }
    .feature-card__arrow { transform: translateX(4px); }
  }

  &__icon {
    flex-shrink: 0;
    width: 48px; height: 48px;
    border-radius: 12px;
    background: rgba(255,255,255,0.07);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: #fff;
  }

  &__body { flex: 1; }

  &__title {
    font-family: 'Montserrat-Bold', sans-serif;
    font-size: 15px;
    color: #fff;
    margin: 0 0 4px;
  }

  &__desc {
    font-size: 13px;
    color: $muted;
    margin: 0;
    line-height: 1.4;
  }

  &__arrow {
    color: $muted;
    font-size: 18px;
    transition: transform 0.2s;
    flex-shrink: 0;
  }

  &__glow {
    position: absolute;
    bottom: -30px; right: -30px;
    width: 120px; height: 120px;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.35;
    transition: opacity 0.3s;
    pointer-events: none;

    &--red    { background: rgba(229,57,53,0.6); }
    &--blue   { background: rgba(21,101,192,0.6); }
    &--purple { background: rgba(106,27,154,0.6); }
  }

  &--search .feature-card__icon { background: rgba(229,57,53,0.2); color: #ef5350; }
  &--movies .feature-card__icon { background: rgba(21,101,192,0.2); color: #42a5f5; }
  &--series .feature-card__icon { background: rgba(106,27,154,0.2); color: #ce93d8; }
}

// ── How it works ──────────────────────────────────────────────────────────────
.how-it-works { text-align: center; }

.section-label {
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: $red;
  margin: 0 0 10px;
}

.section-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(32px, 6vw, 52px);
  letter-spacing: 2px;
  color: #fff;
  margin: 0 0 52px;
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;

  &__num {
    font-size: 12px;
    font-family: 'Montserrat-Bold', sans-serif;
    color: $red;
    background: rgba(229,57,53,0.12);
    border: 1px solid rgba(229,57,53,0.25);
    width: 28px; height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    font-size: 34px;
    color: rgba(255,255,255,0.7);
    margin: 4px 0;
  }

  &__title {
    font-family: 'Montserrat-Bold', sans-serif;
    font-size: 15px;
    color: #fff;
    margin: 0;
  }

  &__desc {
    font-size: 13px;
    color: $muted;
    margin: 0;
    line-height: 1.5;
  }
}

// ── Keyframes ──────────────────────────────────────────────────────────────────
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.65); }
}
@keyframes scrollUp {
  from { transform: translateY(0); }
  to   { transform: translateY(-50%); }
}
@keyframes scrollDown {
  from { transform: translateY(-50%); }
  to   { transform: translateY(0); }
}
@keyframes scrollDot {
  0%   { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(14px); }
}

@media (max-width: 600px) {
  .hero__title { font-size: clamp(52px, 18vw, 80px); }
  .hero__stats { gap: 18px; }
  .feature-grid { grid-template-columns: 1fr; }
  .steps { grid-template-columns: 1fr; }
}
</style>
