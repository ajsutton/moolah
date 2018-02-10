<template>
    <v-container fluid>
        <v-layout align-center text-xs-center>
            <v-flex xs12>
                <savings-goal-description :selectedAccount="selectedAccount"></savings-goal-description>
            </v-flex>
        </v-layout>
        <v-layout row wrap v-if="hasSavings" class="text-xs-center" justify-center>
            <v-flex v-if="hasTargetDates && started" md4 xl3>
                <v-progress-circular :value="timePercent" :size="progressSize" :width="progressWidth" :rotate="180" :color="timeColor">
                    Time<br>
                    <span class="headline">{{Math.floor(timePercent)}}%</span>
                </v-progress-circular>
            </v-flex>
            <v-flex v-if="hasSavingsTarget" md4 xl3>
                <v-progress-circular :value="savingsPercent" :size="progressSize" :width="progressWidth" :rotate="180" :color="savingsColor">
                    Saved<br>
                    <span class="headline">{{Math.floor(savingsPercent)}}%</span>
                </v-progress-circular>
            </v-flex>
            <v-flex v-if="hasSavingsTarget" md4 xl3>
                <v-progress-circular :value="spentPercentOfTarget" :size="progressSize" :width="progressWidth" :rotate="180" :color="savingsColor">
                    Spent<br>
                    <span class="headline">{{Math.ceil(spentPercentOfTarget)}}%</span>
                </v-progress-circular>
            </v-flex>
        </v-layout>
        <v-layout row align-start justify-center xs12>
            <v-flex xs2 d-flex>
                <v-layout column align-center>
                    <v-flex>Savings Target</v-flex>
                    <v-flex>
                        <monetary-amount :value="selectedAccount.savingsTarget"></monetary-amount>
                    </v-flex>
                </v-layout>
            </v-flex>
            <v-flex xs2 d-flex>
                <v-layout column align-center>
                    <v-flex>Income</v-flex>
                    <v-flex>
                        <monetary-amount :value="selectedAccount.saved"></monetary-amount>
                    </v-flex>
                    <v-flex>{{Math.floor(savingsPercent)}}% of target</v-flex>
                </v-layout>
            </v-flex>

            <v-flex xs2 d-flex>
                <v-layout column align-center>
                    <v-flex>Expenses</v-flex>
                    <v-flex>
                        <monetary-amount :value="selectedAccount.spent"></monetary-amount>
                    </v-flex>
                    <v-flex>{{Math.ceil(spentPercentOfTarget)}}% of target</v-flex>
                    <v-flex>{{Math.ceil(spentPercentOfActual)}}% of actual</v-flex>
                </v-layout>
            </v-flex>

            <v-flex xs2 d-flex>
                <v-layout column align-center>
                    <v-flex>Actual Remaining</v-flex>
                    <v-flex>
                        <monetary-amount :value="selectedAccount.balance"></monetary-amount>
                    </v-flex>
                    <v-flex>{{Math.floor(balancePercentOfTarget)}}% of target</v-flex>
                    <v-flex>{{Math.floor(balancePercentOfActual)}}% of actual</v-flex>
                </v-layout>
            </v-flex>

            <v-flex xs2 d-flex>
                <v-layout column align-center>
                    <v-flex>Budget Remaining</v-flex>
                    <v-flex>
                        <monetary-amount :value="budgetRemaining"></monetary-amount>
                    </v-flex>
                    <v-flex>{{Math.floor(budgetRemainingPercentOfTarget)}}% of target</v-flex>
                    <v-flex>{{Math.floor(budgetRemainingPercentOfActual)}}% of actual</v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import {mapState, mapGetters, mapActions} from 'vuex';
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import SavingsGoalDescription from './SavingsGoalDescription.vue';
    import {VProgressCircular} from 'vuetify';
    import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
    import distanceInWords from 'date-fns/distance_in_words';
    import startOfToday from 'date-fns/start_of_today';
    import SavingsGoalMixin from './SavingsGoalMixin';

    export default {
        mixins: [
            SavingsGoalMixin
        ],
        data() {
            return {
                progressSize: 200,
            };
        },
        computed: {
            progressWidth() {
                return Math.floor(this.progressSize / 10);
            },
        },
        components: {
            VProgressCircular,
            MonetaryAmount,
            SavingsGoalDescription,
        },
    };
</script>
