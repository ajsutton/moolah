<template>
    <div>
        <v-parallax
            :src="require('../../assets/jumbo-background.jpg')"
            height="250"
        >
            <v-container fill-height>
                <v-row align-center>
                    <v-col>
                        <h1 class="white--text display-3 text-center">
                            Moolah
                        </h1>
                    </v-col>
                </v-row>
            </v-container>
        </v-parallax>
        <v-container>
            <v-row fill-height>
                <feature-panel icon="account_balance" headline="Businessy">
                    We've got a fancy looking icon and pretty pictures.<br />
                    Why wouldn't you love us?
                </feature-panel>
                <feature-panel icon="lock" headline="Private">
                    We never sell your personal information to anyone.<br />
                    Mostly because we wouldn't know who to sell it to.
                </feature-panel>
                <feature-panel icon="bug_report" headline="Buggy">
                    This is a crazy side project so it's almost certain to be
                    buggy.<br />
                    But you'll probably be able to live with them.
                </feature-panel>
            </v-row>

            <v-row class="login-buttons" align="center" justify="space-around">
                <v-col class="text-center">
                    <a href="/api/googleauth"
                        ><img src="../../assets/auth/signin_google.png"
                    /></a>
                </v-col>
                <v-col class="text-center">
                    <a href="/api/facebookauth"
                        ><img src="../../assets/auth/signin_facebook.png"
                    /></a>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
import FeaturePanel from './FeaturePanel.vue';

export default {
    name: 'hello',
    data() {
        return {};
    },
    components: {
        FeaturePanel,
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
