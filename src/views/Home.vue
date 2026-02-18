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
.home {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 70vh;
    gap: 45px;
    text-align: center;

    .title {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .actions {
        display: flex;
        gap: 20px;
    }
}
</style>
