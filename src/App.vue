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
@import './assets/styles/variables.scss';

#app {
    min-height: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

// متغيرات الحشو (Padding) للأجهزة المختلفة
$padding-mobile: 12px;
$padding-tablet: 20px;
$padding-desktop: 25px;

.view-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    top: $header-height-mobile;
    height: calc(100vh - #{$header-height-mobile});
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0;

    .inner {
        width: 100%;
        max-width: 100%;
        margin: auto;
        padding: 0 $padding-mobile;
        box-sizing: border-box;
    }
}

// للشاشات الصغيرة (480px وما فوق)
@media only screen and (min-width: 480px) {
    .view-container {
        .inner {
            padding: 0 $padding-tablet;
        }
    }
}

// للأجهزة اللوحية والحواسيب (768px وما فوق)
@media only screen and (min-width: 768px) and (min-height: 768px) {
    .view-container {
        overflow-y: auto;
        top: $header-height;
        height: calc(100vh - #{$header-height});

        .inner {
            width: $inner-width;
            padding: 0;
        }
    }
}

// للحواسيب الكبيرة (1024px وما فوق)
@media only screen and (min-width: 1024px) {
    .view-container {
        .inner {
            width: 90%;
            max-width: $inner-width;
        }
    }
}
</style>
