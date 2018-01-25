<template>
    <v-container v-if="hasSavings">
        <v-layout row>
            <v-flex xs12>
                <div class="subheading mb-2">Savings Goal</div>
            </v-flex>
        </v-layout>
        <v-layout row>
            <v-flex xs12>
                <p>You have saved
                    <monetary-amount :value="selectedAccount.balance" :omitZeroCents="true"></monetary-amount>
                    <template v-if="selectedAccount.savingsTarget">of your <monetary-amount :value="selectedAccount.savingsTarget" :omitZeroCents="true"></monetary-amount> target</template><!--
                    --><template v-if="selectedAccount.savingsStartDate && !startedToday && started"> in {{daysElapsed}}</template>.
                    <template v-if="hasReachedTarget">Congratulations!</template>
                    <template v-else-if="!started">Savings plan starts in {{daysElapsed}}.</template>
                    <template v-else>You are <monetary-amount :value="remainingAmount" :omitZeroCents="true" :invertColors="true"></monetary-amount> short of your target<template v-if="!selectedAccount.savingsEndDate">.</template>
                        <template v-else>
                            <template v-if="dueToday"> which is due today.</template>
                            <template v-else-if="overdue"> and the target end date was {{daysRemaining}} ago.</template>
                            <template v-else> with {{daysRemaining}} left.</template>
                        </template>
                    </template>
                </p>
            </v-flex>
        </v-layout>
        <v-layout row wrap>
            <v-flex v-if="hasSavingsTarget" md6 xl3>
                <v-progress-circular :value="savingsPercent" :size="progressSize" :width="progressWidth" :rotate="180" :color="savingsColor">
                    Saved<br>
                    <monetary-amount :value="selectedAccount.balance" :omitZeroCents="true"></monetary-amount>
                    <br>
                    Target<br>
                    <monetary-amount :value="selectedAccount.savingsTarget" :omitZeroCents="true"></monetary-amount>
                </v-progress-circular>
            </v-flex>
            <v-flex v-if="hasTargetDates && started" md6 xl3>
                <v-progress-circular :value="timePercent" :size="progressSize" :width="progressWidth" :rotate="180" :color="timeColor">
                    <template v-if="notStartedYet">Start in {{daysElapsed}}<br></template>
                    <template v-else-if="!startedToday">{{daysElapsed}} gone<br></template>

                    <template v-if="dueToday">Due today</template>
                    <template v-else-if="overdue">{{daysRemaining}} overdue</template>
                    <template v-else>{{daysRemaining}} left</template>
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
    import distanceInWords from 'date-fns/distance_in_words';
    import startOfToday from 'date-fns/start_of_today';

    export default {
        data() {
            return {
                progressSize: 200,
            };
        },
        computed: {
            progressWidth() {
                return Math.floor(this.progressSize / 10);
            },

            hasReachedTarget() {
                return this.hasSavingsTarget && this.selectedAccount.balance >= this.selectedAccount.savingsTarget;
            },

            remainingAmount() {
                return this.hasSavingsTarget && this.selectedAccount.savingsTarget - this.selectedAccount.balance;
            },

            hasSavingsTarget() {
                return this.hasSavings && this.selectedAccount.savingsTarget;
            },
            savingsPercent() {
                return this.selectedAccount.balance / this.selectedAccount.savingsTarget * 100;
            },
            savingsColor() {
                if (this.savingsPercent < 100) {
                    return 'accent';
                } else {
                    return 'success';
                }
            },

            hasTargetDates() {
                return this.hasSavings && this.selectedAccount.savingsStartDate && this.selectedAccount.savingsEndDate;
            },
            started() {
                return !this.notStartedYet;
            },
            notStartedYet() {
                return this.selectedAccount.savingsStartDate && differenceInCalendarDays(this.selectedAccount.savingsStartDate, startOfToday()) > 0;
            },
            startedToday() {
                return this.selectedAccount.savingsStartDate && differenceInCalendarDays(this.selectedAccount.savingsStartDate, startOfToday()) === 0;
            },
            daysElapsed() {
                return distanceInWords(startOfToday(), this.selectedAccount.savingsStartDate);
            },
            daysRemaining() {
                return distanceInWords(startOfToday(), this.selectedAccount.savingsEndDate);
            },
            dueToday() {
                return this.selectedAccount.savingsEndDate && differenceInCalendarDays(this.selectedAccount.savingsEndDate, startOfToday()) === 0;
            },
            overdue() {
                return this.selectedAccount.savingsEndDate && differenceInCalendarDays(this.selectedAccount.savingsEndDate, startOfToday()) < 0;
            },
            timePercent() {
                const totalDays = differenceInCalendarDays(this.selectedAccount.savingsEndDate, this.selectedAccount.savingsStartDate);
                const elapsedDays = differenceInCalendarDays(new Date(), this.selectedAccount.savingsStartDate);
                return elapsedDays / totalDays * 100;
            },
            timeColor() {
                if (this.timePercent < 100) {
                    return 'accent';
                } else {
                    return 'error';
                }
            },

            hasSavings() {
                return this.selectedAccount &&
                    (this.selectedAccount.savingsTarget ||
                        this.selectedAccount.savingsStartDate ||
                        this.selectedAccount.savingsEndDate);
            },
            ...mapGetters('accounts', ['accountName', 'selectedAccount']),
        },
        components: {
            VProgressCircular,
            MonetaryAmount,
        },
    };
</script>
