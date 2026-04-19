<template>
    <div class="home">
        <!-- Hero Section -->
        <div class="hero" v-if="featuredMovie">
            <div class="hero-background" :style="`background-image: url(${featuredMovie.poster})`"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <div class="hero-text">
                    <h1 class="hero-title">{{ featuredMovie.name }}</h1>
                    <p class="hero-subtitle">{{ featuredMovie.releaseInfo }}</p>
                    <p class="hero-description">{{ $t('views.home.sub') }}</p>
                    <div class="hero-actions">
                        <AButton large icon="play-outline" @click="goToStream(featuredMovie)">
                            {{ $t('views.stream.watch') }}
                        </AButton>
                        <AButton large icon="search-outline" clear @click="goToSearch()">
                            {{ $t('views.search.title') }}
                        </AButton>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search Bar Section -->
        <div class="search-section">
            <TextInput 
                v-model="quickSearch" 
                large 
                placeholder="ابحث عن فيلمك المفضل..."
                @keyup.enter="goToSearchWithQuery"
            />
        </div>

        <!-- Trending Movies Section -->
        <div class="content-section" v-if="!loadingTrending">
            <div class="section-header">
                <h2 class="section-title">الأفلام الرائجة</h2>
                <AButton small clear icon="arrow-forward-outline" @click="goToSearch()">
                    عرض الكل
                </AButton>
            </div>
            <div class="carousel">
                <div 
                    class="movie-card" 
                    v-for="movie in trendingMovies.slice(0, 6)" 
                    :key="movie.id"
                    @click="goToStream(movie)"
                >
                    <div class="card-poster" :style="`background-image: url(${movie.poster})`">
                        <ion-icon name="image-outline" v-if="!movie.poster"></ion-icon>
                        <div class="card-overlay">
                            <ion-icon name="play-circle-outline" class="play-icon"></ion-icon>
                        </div>
                    </div>
                    <div class="card-info">
                        <p class="card-title">{{ movie.name }}</p>
                        <p class="card-year">{{ movie.releaseInfo }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Trending Series Section -->
        <div class="content-section" v-if="!loadingTrending">
            <div class="section-header">
                <h2 class="section-title">المسلسلات الموصى بها</h2>
                <AButton small clear icon="arrow-forward-outline" @click="goToSearch()">
                    عرض الكل
                </AButton>
            </div>
            <div class="carousel">
                <div 
                    class="movie-card" 
                    v-for="series in trendingSeries.slice(0, 6)" 
                    :key="series.id"
                    @click="goToStream(series)"
                >
                    <div class="card-poster" :style="`background-image: url(${series.poster})`">
                        <ion-icon name="image-outline" v-if="!series.poster"></ion-icon>
                        <div class="card-overlay">
                            <ion-icon name="play-circle-outline" class="play-icon"></ion-icon>
                        </div>
                    </div>
                    <div class="card-info">
                        <p class="card-title">{{ series.name }}</p>
                        <p class="card-year">{{ series.releaseInfo }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <Loading v-if="loadingTrending" class="loading" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import router from '@/router';
import StremioService from '@/services/stremio.service';

import AButton from '@/components/ui/Button.vue';
import TextInput from '@/components/ui/TextInput.vue';
import Loading from '@/components/ui/Loading.vue';

const loadingTrending = ref(true);
const quickSearch = ref('');
const trendingMovies = ref([]);
const trendingSeries = ref([]);
const featuredMovie = ref(null);

onMounted(async () => {
    try {
        // Fetch trending movies and series
        const movies = await StremioService.searchMovies('the');
        const series = await StremioService.searchSeries('the');
        
        trendingMovies.value = movies.slice(0, 12);
        trendingSeries.value = series.slice(0, 12);
        
        // Set featured movie
        if (trendingMovies.value.length > 0) {
            featuredMovie.value = trendingMovies.value[0];
        }
        
        loadingTrending.value = false;
    } catch (error) {
        console.error('Error loading trending content:', error);
        loadingTrending.value = false;
    }
});

const goToSearch = () => router.push({ name: 'search' });

const goToSearchWithQuery = () => {
    if (quickSearch.value.trim()) {
        router.push({ 
            name: 'search',
            query: { q: quickSearch.value }
        });
    }
};

const goToStream = (item) => {
    const streamType = item.type === 'series' ? 'series' : 'movie';
    router.push({ 
        name: 'stream', 
        params: { 
            type: streamType, 
            id: item.imdb_id || item.id 
        } 
    });
};
</script>

<style lang="scss" scoped>
.home {
    display: flex;
    flex-direction: column;
    gap: 40px;
    padding-bottom: 40px;
}

// Hero Section
.hero {
    position: relative;
    height: 500px;
    margin: -20px -20px 0 -20px;
    overflow: hidden;
    border-radius: 0 0 20px 20px;

    .hero-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        filter: brightness(0.4) blur(2px);
    }

    .hero-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            135deg,
            rgba(11, 9, 19, 0.8) 0%,
            rgba(11, 9, 19, 0.4) 50%,
            rgba(11, 9, 19, 0.8) 100%
        );
    }

    .hero-content {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        height: 100%;
        padding: 40px;

        .hero-text {
            max-width: 500px;
            color: white;
            animation: slideInLeft 0.8s ease-out;

            .hero-title {
                font-family: 'Montserrat-Bold';
                font-size: 3.5rem;
                margin: 0 0 15px 0;
                line-height: 1.1;
                text-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
            }

            .hero-subtitle {
                font-family: 'Montserrat-Medium';
                font-size: 1.2rem;
                color: $accent-color;
                margin: 0 0 10px 0;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            }

            .hero-description {
                font-family: 'Montserrat-Regular';
                font-size: 1rem;
                opacity: 0.9;
                margin: 0 0 30px 0;
                line-height: 1.5;
            }

            .hero-actions {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }
        }
    }
}

// Search Section
.search-section {
    padding: 0 20px;
    animation: slideInDown 0.6s ease-out;
}

// Content Sections
.content-section {
    padding: 0 20px;
    animation: fadeIn 0.6s ease-out;

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .section-title {
            font-family: 'Montserrat-Bold';
            font-size: 1.8rem;
            color: white;
            margin: 0;
        }
    }

    .carousel {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 15px;
        overflow-x: auto;
        padding-bottom: 10px;

        .movie-card {
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: scaleIn 0.5s ease-out;

            &:hover {
                transform: translateY(-10px);
                box-shadow: 0 15px 40px rgba($accent-color, 0.3);

                .card-overlay {
                    opacity: 1;
                }
            }

            .card-poster {
                position: relative;
                width: 100%;
                padding-bottom: 150%;
                background-color: rgba(white, 0.1);
                background-size: cover;
                background-position: center;
                border-radius: 12px;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;

                ion-icon {
                    font-size: 40px;
                    opacity: 0.5;
                }

                .card-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(11, 9, 19, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;

                    .play-icon {
                        font-size: 50px;
                        color: $accent-color;
                        filter: drop-shadow(0 0 10px $accent-color);
                    }
                }
            }

            .card-info {
                padding: 12px 0;

                .card-title {
                    font-family: 'Montserrat-Bold';
                    font-size: 0.95rem;
                    color: white;
                    margin: 0 0 5px 0;
                    line-height: 1.3;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .card-year {
                    font-family: 'Montserrat-Medium';
                    font-size: 0.85rem;
                    color: $accent-color;
                    opacity: 0.7;
                    margin: 0;
                }
            }
        }
    }
}

// Loading State
.loading {
    margin: 40px auto;
}

// Animations
@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

// Responsive Design
@media (max-width: 768px) {
    .hero {
        height: 350px;

        .hero-content {
            padding: 30px 20px;

            .hero-text {
                .hero-title {
                    font-size: 2.5rem;
                }

                .hero-subtitle {
                    font-size: 1rem;
                }

                .hero-description {
                    font-size: 0.9rem;
                }

                .hero-actions {
                    flex-direction: column;
                }
            }
        }
    }

    .content-section {
        .carousel {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
        }
    }
}

@media (max-width: 480px) {
    .home {
        gap: 30px;
    }

    .hero {
        height: 280px;
        border-radius: 0 0 15px 15px;

        .hero-content {
            padding: 20px 15px;

            .hero-text {
                .hero-title {
                    font-size: 1.8rem;
                }

                .hero-subtitle {
                    font-size: 0.9rem;
                }

                .hero-description {
                    font-size: 0.85rem;
                    margin-bottom: 20px;
                }

                .hero-actions {
                    gap: 10px;
                }
            }
        }
    }

    .search-section,
    .content-section {
        padding: 0 15px;
    }

    .content-section {
        .section-header {
            .section-title {
                font-size: 1.4rem;
            }
        }

        .carousel {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
        }
    }
}
</style>
