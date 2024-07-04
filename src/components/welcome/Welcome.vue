<template>
    <div>
        <v-parallax src="@/assets/jumbo-background.jpg" height="250">
            <v-container class="fill-height">
                <v-row align="center">
                    <v-col>
                        <h1 class="text-white text-h2 text-center">Moolah</h1>
                    </v-col>
                </v-row>
            </v-container>
        </v-parallax>
        <v-container>
            <v-row class="fill-height">
                <feature-panel :icon="IconAccountBalance" headline="Businessy">
                    We've got a fancy looking icon and pretty pictures.<br />
                    Why wouldn't you love us?
                </feature-panel>
                <feature-panel :icon="IconLock" headline="Private">
                    We never sell your personal information to anyone.<br />
                    Mostly because we wouldn't know who to sell it to.
                </feature-panel>
                <feature-panel :icon="IconBugReport" headline="Buggy">
                    This is a crazy side project so it's probably buggy.<br />
                    But you'll probably be able to live with them.
                </feature-panel>
            </v-row>

            <v-row class="login-buttons" align="center" justify="space-around">
                <v-col class="text-center">
                    <a href="/api/googleauth"
                        ><img src="../../assets/auth/signin_google.png"
                    /></a>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script setup>
import IconAccountBalance from '~icons/mdi/accountBalance';
import IconLock from '~icons/mdi/lock';
import IconBugReport from '~icons/mdi/bugReport';
</script>

<script>
import FeaturePanel from './FeaturePanel.vue';

export default {
    name: 'welcome-hello',
    components: {
        FeaturePanel,
    },
    data() {
        return {};
    },
};
</script>

<style lang="scss">
.login-buttons {
    img {
        height: 40px;
    }
}
</style>
