<template>
    <header :class="{ 'home': isHome }">
        <div class="container">
            <div class="history-back" @click="$router.go(-1)" v-show="!isHome">
                <ion-icon name="arrow-back-sharp"></ion-icon>
            </div>

            <router-link class="logo" to="/">
                <span class="logo-text">
                    Movie<span class="witcher">Witcher</span>
                </span>
            </router-link>

            <div class="version">
                <span class="app-version">{{ appVersion }}</span>

                <a 
                    href="https://t.me/MWitcherr" 
                    target="_blank"
                    class="telegram-button"
                >
                    <ion-icon name="paper-plane"></ion-icon>
                    <span class="tooltip">Join our Telegram</span>
                </a>
            </div>
        </div>

        <div class="container">
            <AButton clear icon="settings-outline" v-model="showSettings" />
        </div>
    </header>

    <transition name="fade">
        <Settings v-model:show="showSettings"></Settings>
    </transition>
</template>

<script>
import store from '../store';
import AButton from './ui/Button.vue';
import Settings from './Settings';

export default {
    name: 'AHeader',
    components: {
        AButton,
        Settings
    },
    computed: {
        appVersion() {
            return store.state.info.appVersion;
        }
    },
    watch: {
        $route(to) {
            this.isHome = to.name === 'home';
        }
    },
    data() {
        return {
            isHome: true,
            showSettings: false
        }
    }
}
</script>

<style lang="scss" scoped>
header {
    z-index: 99;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: $header-height-mobile;
    line-height: $header-height-mobile;
    padding: 0 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: padding 0.1s ease-in-out;
    user-select: none;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(10px);

    &.home {
        padding: 0 20px;
    }

    .container {
        display: flex;
        align-items: center;
        gap: 12px;

        .history-back {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 45px;
            width: 45px;
            border-radius: 100%;
            font-size: 25px;
            color: $text-color;
            cursor: pointer;
            transition: background-color 0.1s ease-in-out;

            &:hover {
                background-color: rgba(white, 0.1);
            }
        }

        .logo {
            display: flex;
            align-items: center;
            text-decoration: none;

            .logo-text {
                font-family: 'Anton', sans-serif;
                font-size: 28px;
                font-weight: 900;
                color: white;
                letter-spacing: 1px;
            }

            .witcher {
                margin-left: 8px;
                color: white;
            }
        }

        .version {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .app-version {
            font-family: 'Montserrat-SemiBold';
            font-size: 15px;
            color: $text-color;
            opacity: 0.4;
        }

        .telegram-button {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2AABEE, #229ED9);
            color: white;
            font-size: 18px;
            box-shadow: 0 0 12px rgba(42, 171, 238, 0.6);
            transition: all 0.25s ease;
            text-decoration: none;
        }

        .telegram-button:hover {
            transform: translateY(-3px) scale(1.1);
            box-shadow: 0 0 22px rgba(42, 171, 238, 0.95);
        }

        .tooltip {
            position: absolute;
            bottom: -38px;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 12px;
            opacity: 0;
            white-space: nowrap;
            transition: opacity 0.2s ease;
            pointer-events: none;
        }

        .telegram-button:hover .tooltip {
            opacity: 1;
        }
    }
}

@media only screen and (min-width: 768px) and (min-height: 768px) {
    header {
        height: $header-height;
        line-height: $header-height;
        padding-left: 5px;
        padding-right: 20px;

        .container {
            gap: 15px;

            .logo-text {
                font-size: 32px;
            }
        }
    }
}
</style>
