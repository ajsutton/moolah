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
                    Savings<br>
                    <span class="headline">{{Math.floor(savingsPercent)}}%</span>
                </v-progress-circular>
            </v-flex>
            <v-flex v-if="hasTargetDates && started" md6 xl3>
                <v-progress-circular :value="timePercent" :size="progressSize" :width="progressWidth" :rotate="180" :color="timeColor">
                    Time<br>
                    <span class="headline">{{Math.floor(timePercent)}}%</span>
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
