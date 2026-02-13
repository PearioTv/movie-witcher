<template>
    <div class="search">
        <div class="header">
            <div class="title">
                <ATitle>{{ $t('views.search.title') }}</ATitle>
                <ATitle type="tertiary">{{ $t('views.search.sub') }}</ATitle>
            </div>

            <div class="search-controls">
                <TextInput large v-model="search" :placeholder="t('views.search.placeholder') || 'Search movies or series...'"/>
                <Segments :segments="types" v-model="type" v-show="!loading && search">
                    <template #segment="{ segment }">
                        {{ $t(`views.search.segments.${segment}`) }}
                    </template>
                </Segments>
            </div>
        </div>

        <Loading class="loading" v-show="loading" />

        <div class="results-grid" v-if="results[type].length">
            <div 
                v-for="item in results[type]" 
                :key="item.id" 
                class="movie-card"
                @click="goToStream(item)"
            >
                <div class="poster-wrapper">
                    <img v-if="item.poster" :src="item.poster" :alt="item.name" loading="lazy">
                    <div v-else class="no-poster">
                        <ion-icon name="image-outline"></ion-icon>
                    </div>
                    <div class="overlay">
                        <ion-icon name="play-circle"></ion-icon>
                    </div>
                </div>
                <div class="info">
                    <div class="name">{{ item.name }}</div>
                    <div class="year">{{ item.releaseInfo }}</div>
                </div>
            </div>
        </div>

        <div class="no-results" v-else-if="search && !loading">
            No results found for "{{ search }}"
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import StremioService from '@/services/stremio.service';

import ATitle from '@/components/ui/Title.vue';
import TextInput from '@/components/ui/TextInput.vue';
import Segments from '@/components/ui/Segments.vue';
import Loading from '@/components/ui/Loading.vue';

const { t } = useI18n();
const loading = ref(false);
const search = ref('');
const type = ref('movies');
const types = ['movies', 'series'];
const results = ref({
    movies: [],
    series: []
});

let debouncer = null;
watch(search, (value) => {
    loading.value = true;
    clearTimeout(debouncer);
    debouncer = setTimeout(async () => {
        if (value.length) {
            try {
                results.value.movies = await StremioService.searchMovies(value) || [];
                results.value.series = await StremioService.searchSeries(value) || [];
            } catch (e) {
                console.error("Search failed", e);
            }
        } else results.value = {
            movies: [],
            series: []
        };
        loading.value = false;
    }, 500);
});

const goToStream = (item) => {
    const streamType = type.value === 'movies' ? 'movie' : 'series';
    router.push({ name: 'stream', params: { type: streamType, id: item.imdb_id || item.id } });
};
</script>

<style lang="scss" scoped>
.search {
    position: relative;
    padding-bottom: 50px;

    .header {
        z-index: 97;
        top: 0;
        position: sticky;
        display: flex;
        flex-direction: column;
        gap: 30px;
        background-color: $primary-color;
        padding: 20px 0;

        .title {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }

        .search-controls {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
    }

    .loading {
        margin: 50px auto;
    }

    .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 25px;
        margin-top: 30px;

        .movie-card {
            cursor: pointer;
            transition: transform 0.3s ease;

            &:hover {
                transform: scale(1.05);
                
                .poster-wrapper .overlay {
                    opacity: 1;
                }
            }

            .poster-wrapper {
                position: relative;
                aspect-ratio: 2/3;
                border-radius: 12px;
                overflow: hidden;
                background: rgba(255,255,255,0.05);
                box-shadow: 0 10px 20px rgba(0,0,0,0.3);

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .no-poster {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 40px;
                    opacity: 0.3;
                }

                .overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    font-size: 60px;
                    color: white;
                }
            }

            .info {
                margin-top: 12px;
                
                .name {
                    font-family: 'Montserrat-Bold';
                    font-size: 16px;
                    color: white;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .year {
                    font-size: 14px;
                    opacity: 0.6;
                    margin-top: 4px;
                }
            }
        }
    }

    .no-results {
        text-align: center;
        margin-top: 100px;
        font-size: 18px;
        opacity: 0.5;
    }
}

@media (max-width: 600px) {
    .results-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 15px;
    }
}
</style>
