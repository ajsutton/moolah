<template>
    <div class="welcome-page">
        <div class="welcome-hero">
            <v-container class="fill-height">
                <v-row align="center" justify="center">
                    <v-col cols="12" class="text-center">
                        <img
                            src="@/assets/logo-stacked-on-dark.png"
                            alt="moolah.rocks"
                            height="120"
                            class="mb-6"
                        />
                        <h1 class="welcome-tagline">Your money, rock solid.</h1>
                        <p class="welcome-subhead">
                            Money stuff should be boring. Locked down, sorted out,
                            taken care of — so the rest of your life doesn't have to be.
                        </p>
                    </v-col>
                </v-row>
            </v-container>
        </div>
        <v-container>
            <v-row class="fill-height">
                <feature-panel :icon="IconAccountBalance" headline="Solid">
                    The boring stuff — budgets, categories, recurring bills — locked down.
                    The rest of your life? Wide open.
                </feature-panel>
                <feature-panel :icon="IconLock" headline="Private">
                    Your data lives on your device.
                    No accounts, no cloud servers, no one looking over your shoulder.
                </feature-panel>
                <feature-panel :icon="IconChartLine" headline="Clear">
                    Everything you need to know, visible in seconds.
                    Less time worrying, more time doing literally anything else.
                </feature-panel>
            </v-row>

            <v-row class="login-buttons" align="center" justify="space-around">
                <v-col class="text-center">
                    <v-btn
                        href="/api/googleauth"
                        color="#1E64EE"
                        size="large"
                        class="text-white"
                    >
                        Sign In to Get Started
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script setup>
import IconAccountBalance from '~icons/mdi/accountBalance';
import IconLock from '~icons/mdi/lock';
import IconChartLine from '~icons/mdi/chartLine';
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
.welcome-page {
    .welcome-hero {
        background-color: #07102E;
        min-height: 350px;
        display: flex;
        align-items: center;
    }

    .welcome-tagline {
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
        font-size: 48px;
        color: #FFFFFF;
        letter-spacing: -0.03em;
        margin-bottom: 16px;
    }

    .welcome-subhead {
        font-family: 'Poppins', sans-serif;
        font-weight: 400;
        font-size: 18px;
        color: #AAB4C8;
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
    }

    .login-buttons {
        padding: 32px 0;
    }
}
</style>
