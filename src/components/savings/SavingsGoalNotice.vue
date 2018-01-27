<template>
    <v-container v-if="hasSavings">
        <v-layout row>
            <v-flex xs12>
                <div class="subheading mb-2">Savings Goal</div>
            </v-flex>
        </v-layout>
        <v-layout row>
            <v-flex xs12>
                <savings-goal-description></savings-goal-description>
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
