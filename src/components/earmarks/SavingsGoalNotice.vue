<template>
    <v-container class="savingsGoalNotice">
        <v-layout row wrap align-start justify-center>
            <v-flex xs12 lg4 xl2 d-flex v-if="hasStartDate || hasEndDate">
                <v-layout column text-xs-center>
                    <v-flex>
                        <v-progress-circular :value="timePercent" :size="progressSize" :width="progressWidth" :rotate="180" :color="timeColor">
                            Time<br>
                            <span class="headline" v-if="hasTargetDates">{{Math.floor(timePercent)}}%</span>
                        </v-progress-circular>
                    </v-flex>

                    <v-flex xs12>
                        <table class="table data-table">
                            <tr v-if="hasStartDate">
                                <td class="text-xs-left">Start</td>
                                <td class="text-xs-right">{{selectedAccount.savingsStartDate | date}}</td>
                            </tr>
                            <tr v-if="hasEndDate">
                                <td class="text-xs-left">End</td>
                                <td class="text-xs-right">{{selectedAccount.savingsEndDate | date}}</td>
                            </tr>
                            <tr v-if="hasEndDate">
                                <td class="text-xs-left">Time remaining</td>
                                <td class="text-xs-right">{{daysRemaining}}</td>
                            </tr>
                        </table>
                    </v-flex>
                </v-layout>
            </v-flex>

            <v-flex xs12 lg4 xl2 d-flex>
                <v-layout column text-xs-center>
                    <v-flex>
                        <v-progress-circular :value="savingsPercent" :size="progressSize" :width="progressWidth" :rotate="180" :color="savingsColor">
                            Saved<br>
                            <span class="headline" v-if="hasSavingsTarget">{{Math.floor(savingsPercent)}}%</span>
                        </v-progress-circular>
                    </v-flex>

                    <v-flex xs12>
                        <table class="table data-table">
                            <tr>
                                <td class="text-xs-left">Saved</td>
                                <td class="text-xs-right"><monetary-amount :value="selectedAccount.saved"></monetary-amount></td>
                            </tr>
                            <tr v-if="hasSavingsTarget">
                                <td class="text-xs-left">Budget</td>
                                <td class="text-xs-right"><monetary-amount :value="selectedAccount.savingsTarget"></monetary-amount></td>
                            </tr>
                            <tr v-if="hasSavingsTarget">
                                <td class="text-xs-left">Remaining</td>
                                <td class="text-xs-right"><monetary-amount :value="remainingAmount"></monetary-amount></td>
                            </tr>
                        </table>
                    </v-flex>
                </v-layout>
            </v-flex>

            <v-flex xs12 lg4 xl2 d-flex>
                <v-layout column text-xs-center>
                    <v-flex>
                        <v-progress-circular :value="spentPercentOfEither" :size="progressSize" :width="progressWidth" :rotate="180" :color="savingsColor">
                            Spent<br>
                            <span class="headline" v-if="hasSaved">{{Math.ceil(spentPercentOfEither)}}%</span>
                        </v-progress-circular>
                    </v-flex>

                    <v-flex xs12>
                        <table class="table data-table">
                            <tr>
                                <td class="text-xs-left">Spent</td>
                                <td class="text-xs-right"><monetary-amount :value="selectedAccount.spent"></monetary-amount></td>
                            </tr>
                            <tr v-if="hasSavingsTarget">
                                <td class="text-xs-left">Percent of budget</td>
                                <td class="text-xs-right">{{Math.ceil(spentPercentOfTarget)}}%</td>
                            </tr>
                            <tr v-if="hasSaved">
                                <td class="text-xs-left">Percent of actual</td>
                                <td class="text-xs-right">{{Math.ceil(spentPercentOfActual)}}%</td>
                            </tr>
                            <tr v-if="hasSavingsTarget">
                                <td class="text-xs-left">Budget remaining:</td>
                                <td class="text-xs-right"><monetary-amount :value="budgetRemaining"></monetary-amount></td>
                            </tr>
                            <tr>
                                <td class="text-xs-left">Actual remaining</td>
                                <td class="text-xs-right"><monetary-amount :value="selectedAccount.balance"></monetary-amount></td>
                            </tr>
                        </table>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import {mapState, mapGetters, mapActions} from 'vuex';
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import {VProgressCircular} from 'vuetify';
    import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
    import distanceInWords from 'date-fns/formatDistance';
    import startOfToday from 'date-fns/startOfToday';
    import SavingsGoalMixin from './SavingsGoalMixin';
    import {formatDate} from '../util/formatDate';

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
        filters: {
            date: formatDate
        },
        components: {
            VProgressCircular,
            MonetaryAmount,
        },
    };
</script>

<style lang="scss">
    .savingsGoalNotice {
        .table.data-table {
            max-width: 80%;
            margin-left: auto;
            margin-right: auto;
        }
    }
</style>
