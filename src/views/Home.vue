<template>
    <div class="home">
        <div class="title">
            <ATitle>Movie Witcher</ATitle>
            <ATitle type="tertiary">
                {{ $t('views.home.sub') }}
            </ATitle>
        </div>

        <div class="actions">
            <AButton large icon="search-outline" @click="goToSearch()">
                {{ $t('views.search.title') }}
            </AButton>
        </div>
    </div>
</template>

<script setup>
import router from '@/router';

import ATitle from '@/components/ui/Title.vue';
import AButton from '@/components/ui/Button.vue';

const goToSearch = () => router.push({ name: 'search' });
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.home {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    gap: clamp(25px, 8vw, 45px);
    text-align: center;
    padding: 20px;

    .title {
        display: flex;
        flex-direction: column;
        gap: clamp(10px, 3vw, 15px);
        width: 100%;
        max-width: 600px;
    }

    .actions {
        display: flex;
        gap: clamp(12px, 3vw, 20px);
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
    }
}

// للشاشات الصغيرة جداً (320px - 479px)
@media (max-width: 479px) {
    .home {
        min-height: 50vh;
        gap: 20px;
        padding: 15px;

        .title {
            gap: 10px;
        }

        .actions {
            gap: 10px;

            :deep(button) {
                font-size: 12px;
                padding: 8px 12px;
            }
        }
    }
}

// للشاشات الصغيرة (480px - 767px)
@media (min-width: 480px) and (max-width: 767px) {
    .home {
        min-height: 55vh;
        gap: 30px;
        padding: 18px;

        .title {
            gap: 12px;
        }

        .actions {
            gap: 15px;

            :deep(button) {
                font-size: 13px;
                padding: 10px 14px;
            }
        }
    }
}

// للأجهزة اللوحية والحواسيب (768px وما فوق)
@media (min-width: 768px) {
    .home {
        min-height: 70vh;
        gap: 45px;
        padding: 25px;

        .title {
            gap: 15px;
        }

        .actions {
            gap: 20px;

            :deep(button) {
                font-size: 14px;
                padding: 12px 20px;
            }
        }
    }
}
</style>
