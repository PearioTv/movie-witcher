<template>
    <metainfo>
        <template v-slot:title="{ content }">{{ content }}</template>
    </metainfo>

    <Header></Header>
    
    <Error :type="client.error.type" v-if="client.error"></Error>

    <div class="view-container">
        <div class="inner">
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useMeta } from 'vue-meta';

import Header from '@/components/Header.vue';
import Error from '@/components/Error.vue';
import { APP_TITLE } from '@/common/config';

import store from './store';
import ClientService from './services/client.service';

const client = computed(() => store.state.client);
const settings = computed(() => store.state.settings);

const updateUserSettings = () => {
    if (settings.value.username)
        ClientService.send('user.update', { username: settings.value.username });
};

const updateLocaleNavigator = () => {
    const navigatorLocale = navigator.language.slice(0, 2);
    if (Object.keys(settings.value.locales).includes(navigatorLocale))
        store.dispatch('settings/updateLocale', navigatorLocale);
};

watch(() => client.value.ready, updateUserSettings);

onMounted(() => {
    store.dispatch('client/start');
    store.dispatch('settings/load');
    updateLocaleNavigator();
});

useMeta({
    title: APP_TITLE
});
</script>

<style lang="scss">
@import './assets/styles/main.scss';

*, *::before, *::after {
    box-sizing: border-box;
}

html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow-x: hidden;
}

#app {
    min-height: 100%;
    width: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.view-container {
    position: relative;
    top: $header-height-mobile;
    width: 100%;
    min-height: calc(100vh - #{$header-height-mobile});
    overflow-y: auto;
    overflow-x: hidden;

    .inner {
        width: 100%;
        max-width: 100%;
        margin: 0;
        padding: 0;
    }
}

@media only screen and (min-width: 768px) and (min-height: 768px) {
    .view-container {
        top: $header-height;
        min-height: calc(100vh - #{$header-height});

        .inner {
            width: 100%;
            max-width: 100%;
            padding: 0;
        }
    }
}
</style>
