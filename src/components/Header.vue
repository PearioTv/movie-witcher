<template>
    <header :class="{ 'home': isHome }">
        <div class="container">
            <div class="history-back" @click="$router.go(-1)" v-show="!isHome">
                <ion-icon name="arrow-back-sharp"></ion-icon>
            </div>

            <router-link class="logo" to="/">
                <span class="logo-text">
                    Movie<span>Witcher</span>
                </span>
            </router-link>

            <div class="version">
                {{ appVersion }}
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
        gap: 10px;

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
            text-decoration: none;
            user-select: none;
            vertical-align: middle;
            display: flex;
            align-items: center;

            .logo-text {
                font-family: 'Anton', sans-serif;
                font-size: 28px;
                font-weight: 900;
                color: white;
                letter-spacing: 1px;

                span {
                    color: white;
                }
            }
        }

        .version {
            font-family: 'Montserrat-SemiBold';
            font-size: 15px;
            color: $text-color;
            opacity: 0.3;
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

            .logo {
                .logo-text {
                    font-size: 32px;
                }
            }
        }
    }
}
</style>
