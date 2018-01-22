<template>
    <v-container v-if="hasSavings">
        <v-layout row>
            <v-flex xs12>
                <div class="subheading mb-2">Savings Goal</div>
            </v-flex>
        </v-layout>
        <v-layout row>
            <v-flex xs12>
                <p>You have saved <monetary-amount :value="selectedAccount.balance" :omitZeroCents="true"></monetary-amount>
                    <template v-if="selectedAccount.savingsTarget">of <monetary-amount :value="selectedAccount.savingsTarget" :omitZeroCents="true"></monetary-amount></template>
                    <template v-if="selectedAccount.savingsStartDate">in {{daysElapsed}}.</template>
                    <template v-if="selectedAccount.savingsEndDate">There are {{daysRemaining}} remaining to reach your goal.</template>
                </p>
            </v-flex>
        </v-layout>
        <v-layout row wrap>
            <v-flex v-if="hasSavingsTarget" md6 xl3>
                <v-progress-circular :value="savingsPercent" :size="progressSize" :width="progressWidth" :rotate="180" :color="progressColor(savingsPercent)">
                    Saved<br>
                    <monetary-amount :value="selectedAccount.balance" :omitZeroCents="true"></monetary-amount><br>
                    Target<br>
                    <monetary-amount :value="selectedAccount.savingsTarget" :omitZeroCents="true"></monetary-amount>
                </v-progress-circular>
            </v-flex>
            <v-flex v-if="hasTargetDates" md6 xl3>
                <v-progress-circular :value="timePercent" :size="progressSize" :width="progressWidth" :rotate="180" :color="progressColor(savingsPercent)">
                    {{daysElapsed}} gone<br>
                    {{daysRemaining}} left
                </v-progress-circular>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import {VProgressCircular} from 'vuetify';
    import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
    import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

    export default {
        data() {
            return {
                progressSize: 180
            };
        },
        computed: {
            progressWidth() {
                return Math.floor(this.progressSize / 10);
            },

            hasSavingsTarget() {
                return this.hasSavings && this.selectedAccount.savingsTarget;
            },
            savingsPercent() {
                return this.selectedAccount.balance / this.selectedAccount.savingsTarget * 100;
            },

            hasTargetDates() {
                return this.hasSavings && this.selectedAccount.savingsStartDate && this.selectedAccount.savingsEndDate;
            },
            daysElapsed() {
                return distanceInWordsToNow(this.selectedAccount.savingsStartDate);
            },
            daysRemaining() {
                return distanceInWordsToNow(this.selectedAccount.savingsEndDate);
            },
            timePercent() {
                 const totalDays = differenceInCalendarDays(this.selectedAccount.savingsEndDate, this.selectedAccount.savingsStartDate);
                 const elapsedDays = differenceInCalendarDays(new Date(), this.selectedAccount.savingsStartDate);
                 return elapsedDays / totalDays * 100;
            },

            hasSavings() {
                return this.selectedAccount &&
                    (this.selectedAccount.savingsTarget ||
                        this.selectedAccount.savingsStartDate ||
                        this.selectedAccount.savingsEndDate);
            },
            ...mapGetters('accounts', ['accountName', 'selectedAccount']),
        },
        methods: {
            progressColor(percent) {
                if (percent < 100) {
                    return 'accent';
                } else {
                    return 'green';
                }
            },
        },
        components: {
            VProgressCircular,
            MonetaryAmount,
        },
    };
</script>
