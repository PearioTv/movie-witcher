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
@import '@/assets/styles/variables.scss';

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
    flex-wrap: wrap;

    &.home {
        padding: 0 12px;
    }

    .container {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;

        &:last-child {
            flex: 0 0 auto;
            justify-content: flex-end;
        }

        .history-back {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 40px;
            width: 40px;
            border-radius: 100%;
            font-size: 20px;
            color: $text-color;
            cursor: pointer;
            transition: background-color 0.1s ease-in-out;
            flex-shrink: 0;

            &:hover {
                background-color: rgba(white, 0.1);
            }
        }

        .logo {
            display: flex;
            align-items: center;
            text-decoration: none;
            min-width: 0;

            .logo-text {
                font-family: 'Anton', sans-serif;
                font-size: clamp(18px, 4vw, 28px);
                font-weight: 900;
                color: white;
                letter-spacing: 0.5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .witcher {
                margin-left: 4px;
                color: white;
            }
        }

        .version {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }

        .app-version {
            font-family: 'Montserrat-SemiBold';
            font-size: 12px;
            color: $text-color;
            opacity: 0.4;
            display: none;
        }

        .telegram-button {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2AABEE, #229ED9);
            color: white;
            font-size: 16px;
            box-shadow: 0 0 12px rgba(42, 171, 238, 0.6);
            transition: all 0.25s ease;
            text-decoration: none;
            flex-shrink: 0;

            &:hover {
                transform: translateY(-2px) scale(1.05);
                box-shadow: 0 0 18px rgba(42, 171, 238, 0.8);
            }
        }

        .tooltip {
            position: absolute;
            bottom: -35px;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
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

// للشاشات الصغيرة (480px وما فوق)
@media only screen and (min-width: 480px) {
    header {
        &.home {
            padding: 0 15px;
        }

        .container {
            gap: 10px;

            .history-back {
                height: 44px;
                width: 44px;
                font-size: 22px;
            }

            .app-version {
                display: inline;
                font-size: 13px;
            }

            .telegram-button {
                width: 34px;
                height: 34px;
                font-size: 17px;
            }
        }
    }
}

// للأجهزة اللوحية والحواسيب (768px وما فوق)
@media only screen and (min-width: 768px) and (min-height: 768px) {
    header {
        height: $header-height;
        line-height: $header-height;
        padding-left: 5px;
        padding-right: 20px;
        flex-wrap: nowrap;

        &.home {
            padding: 0 20px;
        }

        .container {
            gap: 15px;

            &:first-child {
                flex: 1;
            }

            .history-back {
                height: 45px;
                width: 45px;
                font-size: 25px;
            }

            .logo-text {
                font-size: 32px;
                letter-spacing: 1px;
            }

            .app-version {
                font-size: 15px;
            }

            .telegram-button {
                width: 36px;
                height: 36px;
                font-size: 18px;

                &:hover {
                    transform: translateY(-3px) scale(1.1);
                    box-shadow: 0 0 22px rgba(42, 171, 238, 0.95);
                }
            }

            .tooltip {
                bottom: -38px;
                padding: 6px 10px;
                font-size: 12px;
            }
        }
    }
}

// للحواسيب الكبيرة (1024px وما فوق)
@media only screen and (min-width: 1024px) {
    header {
        .container {
            gap: 18px;
        }
    }
}
</style>
