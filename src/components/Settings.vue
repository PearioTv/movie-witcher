<template>
    <div class="modal" v-if="show">
        <div class="backdrop" @click="close()"></div>

        <div class="inner">
            <ATitle icon="settings-outline" type="secondary" translate="components.settings.title" />

            <div class="settings">
                <div class="setting">
                    <div class="label">
                        <ion-icon name="language"></ion-icon>
                        {{ $t('components.settings.lang') }}
                    </div>
                    <ASelect v-model="settings.locale" :options="localesOptions" />
                </div>

                <div class="setting">
                    <div class="label">
                        <ion-icon name="person"></ion-icon>
                        Username
                    </div>
                    <ATextInput :value="settings.username || client.user.name" @change="updateUsername($event)" />
                </div>

                <div class="setting">
                    <div class="label">
                        <ion-icon name="heart"></ion-icon>
                        {{ $t('components.settings.support') }}
                    </div>
                    <div class="support" ref="support"></div>
                </div>
            </div>

            <AButton clear large translate="components.settings.button" @click="close()" />
        </div>
    </div>
</template>

<script>
import { ref, watchEffect } from 'vue';
import postscribe from 'postscribe';
import ClientService from '../services/client.service';

import { where } from 'langs';
import ATitle from './ui/Title.vue';
import AButton from './ui/Button.vue';
import ASelect from './ui/Select.vue';
import ATextInput from './ui/TextInput.vue';

import store from '../store';

export default {
    components: {
        ATitle,
        AButton,
        ASelect,
        ATextInput
    },
    props: {
        show: Boolean
    },
    computed: {
        client: () => store.state.client,
        settings: () => store.state.settings,
        localesOptions() {
            return this.settings.locales.map(locale => ({
                name: this.getLocaleName(locale),
                value: locale
            }));
        }
    },
    watch: {
        'settings.locale'(value) {
            store.dispatch('settings/updateLocale', value);
            this.$i18n.locale = value;
        }
    },
    methods: {
        getLocaleName(locale) {
            return where('1', locale).local;
        },
        updateUsername({ target }) {
            const username = target.value.slice(0, 25);
            if (username.length > 0) {
                store.dispatch('settings/updateUsername', username);
                ClientService.send('user.update', { username });
            }
        },
        close() {
            this.$emit('update:show', !this.show);
        }
    },
    setup() {
        const support = ref(null);

        // Ko-fi only
        const kofiscript = document.createElement('script');
        kofiscript.setAttribute('src', 'https://storage.ko-fi.com/cdn/widget/Widget_2.js');

        const kofibuton = document.createElement('script');
        kofibuton.text =
            "kofiwidget2.init('Support Me on Ko-fi', '#29abe0', 'mwitcher');kofiwidget2.draw();";

        watchEffect(() => {
            if (support.value) {
                postscribe(support.value, kofiscript.outerHTML);
                postscribe(support.value, kofibuton.outerHTML);
            }
        });

        return {
            support
        };
    }
}
</script>

<style lang="scss" scoped>
.modal {
    z-index: 99;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .backdrop {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        backdrop-filter: blur(5px);
        background-color: rgba(0, 0, 0, 0.8);
        cursor: pointer;
    }

    .inner {
        z-index: 99;
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-height: 95%;
        width: 90%;
        padding: 25px;
        border-radius: 15px;
        background-color: $primary-color;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
        overflow-y: auto;
    }
}

.settings {
    flex: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;

    .setting {
        .label {
            display: flex;
            align-items: center;
            gap: 10px;
            height: 40px;
            font-family: 'Montserrat-SemiBold';
            color: $text-color;
        }

        input {
            width: 100%;
        }
    }

    .support {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
}

@media only screen and (orientation: landscape) {
    .modal {
        .inner {
            max-height: 100%;
            width: 100% !important;
        }
    }
}

@media only screen and (min-width: 768px) and (min-height: 768px) {
    .modal {
        .inner {
            width: auto !important;
            min-width: 350px;
        }
    }

    .setting {
        .support {
            flex-direction: row;
        }
    }
}
</style>
