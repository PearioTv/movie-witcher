<template>
    <div class="search">
        <div class="header">
            <div class="title">
                <ATitle>{{ $t('views.search.title') }}</ATitle>
                <ATitle type="tertiary">{{ $t('views.search.sub') }}</ATitle>
            </div>

            <TextInput large v-model="search" placeholder="Parasite, Fight Club, ..."/>
            <Segments :segments="types" v-model="type" v-show="!loading && search">
                <template #segment="{ segment }">
                    {{ $t(`views.search.segments.${segment}`) }}
                </template>
            </Segments>
        </div>

        <Loading class="loading" v-show="loading" />

        <List class="list" :items="results[type]" itemKey="id" @click="goToStream($event)">
            <template #left="{ item }">
                <div class="poster" :style="`background-image: url(${item.poster})`">
                    <ion-icon name="image-outline" v-if="!item.poster"></ion-icon>
                </div>
            </template>
            <template #right="{ item }">
                <div class="info">
                    <span class="name">{{ item.name }}</span>
                    <span class="year">{{ item.releaseInfo }}</span>
                </div>
            </template>
        </List>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import router from '@/router';
import StremioService from '@/services/stremio.service';

import ATitle from '@/components/ui/Title.vue';
import TextInput from '@/components/ui/TextInput.vue';
import Segments from '@/components/ui/Segments.vue';
import List from '@/components/ui/List.vue';
import Loading from '@/components/ui/Loading.vue';

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
            results.value.movies = await StremioService.searchMovies(value);
            results.value.series = await StremioService.searchSeries(value);
        } else results.value = {
            movies: [],
            series: []
        };
        loading.value = false;
    }, 250);
});

const goToStream = ({ type, imdb_id, id }) => {
    const streamType = type === 'series' ? 'series' : 'movie';
    router.push({ name: 'stream', params: { type: streamType, id: imdb_id || id } });
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.search {
    position: relative;

    .header {
        z-index: 97;
        top: 0;
        position: sticky;
        display: flex;
        flex-direction: column;
        gap: clamp(15px, 4vw, 30px);
        background-color: $primary-color;
        padding-top: clamp(12px, 3vw, 20px);
        padding-bottom: clamp(12px, 3vw, 20px);

        .title {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: clamp(10px, 2vw, 15px);
        }
    }

    .loading {
        z-index: 0;
        position: absolute;
        height: 12rem;
        left: 50%;
        transform: translateX(-50%);
    }

    .list {
        position: relative;
        z-index: 0;

        .poster {
            display: grid;
            align-content: center;
            height: clamp(120px, 25vw, 150px);
            width: clamp(80px, 18vw, 100px);
            overflow: hidden;
            background-color: rgba(white, 0.1);
            background-size: cover;
            background-position: center;
            border-radius: 6px;
            flex-shrink: 0;

            ion-icon {
                font-size: clamp(20px, 5vw, 30px);
                opacity: 0.8;
                margin: auto;
            }
        }
        
        .info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding-left: clamp(10px, 3vw, 15px);
            min-width: 0;

            .name {
                font-family: 'Montserrat-Bold';
                font-size: clamp(14px, 3vw, 20px);
                color: white;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }

            .year {
                font-family: 'Montserrat-Medium';
                font-size: clamp(12px, 2vw, 15px);
                font-style: italic;
                opacity: 0.6;
            }
        }
    }
}

// للشاشات الصغيرة جداً (320px - 479px)
@media (max-width: 479px) {
    .search {
        .header {
            gap: 15px;
            padding-top: 12px;
            padding-bottom: 12px;

            .title {
                gap: 10px;
            }
        }

        .list {
            .poster {
                height: 120px;
                width: 80px;
                border-radius: 5px;

                ion-icon {
                    font-size: 20px;
                }
            }

            .info {
                gap: 3px;
                padding-left: 10px;

                .name {
                    font-size: 13px;
                    -webkit-line-clamp: 1;
                }

                .year {
                    font-size: 11px;
                }
            }
        }
    }
}

// للشاشات الصغيرة (480px - 767px)
@media (min-width: 480px) and (max-width: 767px) {
    .search {
        .header {
            gap: 20px;
            padding-top: 15px;
            padding-bottom: 15px;

            .title {
                gap: 12px;
            }
        }

        .list {
            .poster {
                height: 130px;
                width: 90px;
                border-radius: 7px;

                ion-icon {
                    font-size: 24px;
                }
            }

            .info {
                gap: 4px;
                padding-left: 12px;

                .name {
                    font-size: 15px;
                    -webkit-line-clamp: 2;
                }

                .year {
                    font-size: 12px;
                }
            }
        }
    }
}

// للأجهزة اللوحية والحواسيب (768px وما فوق)
@media (min-width: 768px) {
    .search {
        .header {
            gap: 30px;
            padding-top: 20px;
            padding-bottom: 20px;

            .title {
                gap: 15px;
            }
        }

        .list {
            .poster {
                height: 150px;
                width: 100px;
                border-radius: 8px;

                ion-icon {
                    font-size: 30px;
                }
            }

            .info {
                gap: 5px;
                padding-left: 15px;

                .name {
                    font-size: 20px;
                    -webkit-line-clamp: 3;
                }

                .year {
                    font-size: 15px;
                }
            }
        }
    }
}
</style>
