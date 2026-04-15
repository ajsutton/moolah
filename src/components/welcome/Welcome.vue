<template>
    <div class="welcome-page">
        <section class="welcome-hero">
            <img
                src="@/assets/logo-icon.svg"
                alt="moolah.rocks"
                class="hero-icon"
            />
            <h1>
                Your <span class="text-accent-blue">money</span>,
                rock&nbsp;<span class="text-accent-gold">solid</span>.
            </h1>
            <p class="hero-sub">
                Money stuff should be boring. Locked down, sorted out, taken
                care of &mdash; so the rest of your life doesn't
                have&nbsp;to&nbsp;be.
            </p>
            <google-sign-in-button theme="dark" />
        </section>

        <section class="welcome-features">
            <div class="features-inner">
                <p class="section-label">The serious part</p>
                <h2 class="section-title">
                    We sweat the details. You&nbsp;don't.
                </h2>
                <div class="feature-cards">
                    <div class="feature-card">
                        <div class="card-icon icon-blue">
                            <v-icon :icon="IconAccountBalance" size="28" />
                        </div>
                        <h3>Every transaction, handled</h3>
                        <p>
                            Categories, splits, notes, search, recurring items
                            &mdash; the full toolkit for keeping your money in
                            order.
                        </p>
                    </div>
                    <div class="feature-card">
                        <div class="card-icon icon-red">
                            <v-icon :icon="IconChartLine" size="28" />
                        </div>
                        <h3>The picture, crystal clear</h3>
                        <p>
                            Spending trends, income vs. expenses, category
                            breakdowns &mdash; everything in clean charts that
                            make sense at a glance.
                        </p>
                    </div>
                    <div class="feature-card">
                        <div class="card-icon icon-gold">
                            <v-icon :icon="IconCheckCircle" size="28" />
                        </div>
                        <h3>Simple. Refreshingly simple.</h3>
                        <p>
                            Set it up, add your transactions, and get on with
                            your life. No fuss, no complexity.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section class="welcome-quote">
            <p>
                The boring money stuff?
                <span class="text-accent-gold">Locked&nbsp;down</span>.<br />
                The rest of your life?
                <span class="text-accent-blue">Wide&nbsp;open</span>.
            </p>
        </section>

        <section class="welcome-cta">
            <h2>Solid money. Chill&nbsp;vibes.</h2>
            <p class="cta-sub">Your money, your device, your rules.</p>
            <google-sign-in-button theme="dark" />
        </section>
    </div>
</template>

<script setup>
import IconAccountBalance from '~icons/mdi/accountBalance';
import IconChartLine from '~icons/mdi/chartLine';
import IconCheckCircle from '~icons/mdi/checkCircle';
</script>

<script>
import GoogleSignInButton from '../auth/GoogleSignInButton.vue';

export default {
    name: 'welcome-hello',
    components: {
        GoogleSignInButton,
    },
};
</script>

<style lang="scss">
.welcome-page {
    background: #02050f;
    color: #e8edf5;
    font-family: 'Poppins', 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;

    // ---- Hero ----
    .welcome-hero {
        min-height: 85vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 7rem 1.5rem 4rem;
        background: radial-gradient(
            ellipse 80% 60% at 50% 35%,
            #132a66 0%,
            #07102e 50%,
            #02050f 100%
        );
    }

    .hero-icon {
        width: 140px;
        height: 140px;
        border-radius: 28px;
        box-shadow:
            0 24px 80px rgba(30, 100, 238, 0.35),
            0 0 0 1px rgba(255, 255, 255, 0.08);
        margin-bottom: 2.5rem;
    }

    h1 {
        font-size: clamp(2.2rem, 5.5vw, 3.8rem);
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -0.03em;
        max-width: 700px;
        margin-bottom: 1.2rem;
    }

    .hero-sub {
        font-size: clamp(1rem, 2vw, 1.25rem);
        font-weight: 400;
        color: #aab4c8;
        max-width: 540px;
        line-height: 1.6;
        margin-bottom: 2.5rem;
    }

    .text-accent-blue {
        color: #7abdff;
    }
    .text-accent-gold {
        color: #ffd56b;
    }
    .text-accent-red {
        color: #ff787f;
    }

    // ---- Features ----
    .welcome-features {
        padding: 5rem 1.5rem;
        background: linear-gradient(
            180deg,
            #02050f 0%,
            #07102e 50%,
            #02050f 100%
        );
    }

    .features-inner {
        max-width: 1100px;
        margin: 0 auto;
    }

    .section-label {
        text-transform: uppercase;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.15em;
        color: #ffd56b;
        text-align: center;
        margin-bottom: 0.8rem;
    }

    .section-title {
        font-size: clamp(1.6rem, 3.5vw, 2.5rem);
        font-weight: 800;
        text-align: center;
        letter-spacing: -0.02em;
        margin-bottom: 3rem;
        line-height: 1.15;
    }

    .feature-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
    }

    .feature-card {
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 20px;
        padding: 2rem 1.6rem;
        transition:
            transform 0.3s,
            border-color 0.3s,
            box-shadow 0.3s;

        &:hover {
            transform: translateY(-4px);
            border-color: rgba(255, 255, 255, 0.14);
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
        }

        h3 {
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            letter-spacing: -0.01em;
        }

        p {
            font-size: 0.95rem;
            color: #aab4c8;
            line-height: 1.6;
        }
    }

    .card-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;

        &.icon-blue {
            background: rgba(30, 100, 238, 0.15);
            color: #7abdff;
        }
        &.icon-red {
            background: rgba(220, 34, 59, 0.15);
            color: #ff787f;
        }
        &.icon-gold {
            background: rgba(255, 213, 107, 0.15);
            color: #ffd56b;
        }
    }

    // ---- Quote strip ----
    .welcome-quote {
        padding: 3.5rem 1.5rem;
        background: #02050f;
        text-align: center;

        p {
            font-size: clamp(1.1rem, 2.5vw, 1.4rem);
            font-weight: 600;
            line-height: 1.5;
            max-width: 700px;
            margin: 0 auto;
        }
    }

    // ---- CTA ----
    .welcome-cta {
        padding: 4rem 1.5rem 5rem;
        text-align: center;
        background: radial-gradient(
            ellipse 70% 50% at 50% 60%,
            #0e2458 0%,
            #07102e 55%,
            #02050f 100%
        );

        h2 {
            font-size: clamp(1.6rem, 3.5vw, 2.4rem);
            font-weight: 800;
            letter-spacing: -0.02em;
            margin-bottom: 0.8rem;
        }

        .cta-sub {
            font-size: 1.05rem;
            color: #aab4c8;
            margin-bottom: 2rem;
        }
    }

    // ---- Responsive ----
    @media (max-width: 640px) {
        .welcome-hero {
            padding: 5rem 1.2rem 3rem;
        }
        .hero-icon {
            width: 100px;
            height: 100px;
            border-radius: 22px;
        }
    }
}
</style>
