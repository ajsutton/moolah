<template>
    <v-container class="savingsGoalNotice">
        <v-layout row wrap align-start justify-center>
            <v-flex xs12 lg4 xl2 d-flex v-if="hasStartDate || hasEndDate">
                <v-layout column text-sm-center>
                    <v-flex>
                        <v-progress-circular
                            :value="timePercent"
                            :size="progressSize"
                            :width="progressWidth"
                            :rotate="180"
                            :color="timeColor"
                        >
                            Time<br />
                            <span class="headline" v-if="hasTargetDates"
                                >{{ Math.floor(timePercent) }}%</span
                            >
                        </v-progress-circular>
                    </v-flex>

                    <v-flex xs12>
                        <table class="table data-table">
                            <tr v-if="hasStartDate">
                                <td class="text-sm-left">Start</td>
                                <td class="text-sm-right">
                                    {{
                                        selectedAccount.savingsStartDate | date
                                    }}
                                </td>
                            </tr>
                            <tr v-if="hasEndDate">
                                <td class="text-sm-left">End</td>
                                <td class="text-sm-right">
                                    {{ selectedAccount.savingsEndDate | date }}
                                </td>
                            </tr>
                            <tr v-if="hasEndDate">
                                <td class="text-sm-left">Time remaining</td>
                                <td class="text-sm-right">
                                    {{ daysRemaining }}
                                </td>
                            </tr>
                        </table>
                    </v-flex>
                </v-layout>
            </v-flex>

            <v-flex xs12 lg4 xl2 d-flex>
                <v-layout column text-sm-center>
                    <v-flex>
                        <v-progress-circular
                            :value="savingsPercent"
                            :size="progressSize"
                            :width="progressWidth"
                            :rotate="180"
                            :color="savingsColor"
                        >
                            Saved<br />
                            <span class="headline" v-if="hasSavingsTarget"
                                >{{ Math.floor(savingsPercent) }}%</span
                            >
                        </v-progress-circular>
                    </v-flex>

                    <v-flex xs12>
                        <table class="table data-table">
                            <tr>
                                <td class="text-sm-left">Saved</td>
                                <td class="text-sm-right">
                                    <monetary-amount
                                        :value="selectedAccount.saved"
                                    ></monetary-amount>
                                </td>
                            </tr>
                            <tr v-if="hasSavingsTarget">
                                <td class="text-sm-left">Budget</td>
                                <td class="text-sm-right">
                                    <monetary-amount
                                        :value="selectedAccount.savingsTarget"
                                    ></monetary-amount>
                                </td>
                            </tr>
                            <tr v-if="hasSavingsTarget">
                                <td class="text-sm-left">Remaining</td>
                                <td class="text-sm-right">
                                    <monetary-amount
                                        :value="remainingAmount"
                                    ></monetary-amount>
                                </td>
                            </tr>
                        </table>
                    </v-flex>
                </v-layout>
            </v-flex>

            <v-flex xs12 lg4 xl2 d-flex>
                <v-layout column text-sm-center>
                    <v-flex>
                        <v-progress-circular
                            :value="spentPercentOfEither"
                            :size="progressSize"
                            :width="progressWidth"
                            :rotate="180"
                            :color="savingsColor"
                        >
                            Spent<br />
                            <span class="headline" v-if="hasSaved"
                                >{{ Math.ceil(spentPercentOfEither) }}%</span
                            >
                        </v-progress-circular>
                    </v-flex>

                    <v-flex xs12>
                        <table class="table data-table">
                            <tr>
                                <td class="text-sm-left">Spent</td>
                                <td class="text-sm-right">
                                    <monetary-amount
                                        :value="selectedAccount.spent"
                                    ></monetary-amount>
                                </td>
                            </tr>
                            <tr v-if="hasSavingsTarget">
                                <td class="text-sm-left">Percent of budget</td>
                                <td class="text-sm-right">
                                    {{ Math.ceil(spentPercentOfTarget) }}%
                                </td>
                            </tr>
                            <tr v-if="hasSaved">
                                <td class="text-sm-left">Percent of actual</td>
                                <td class="text-sm-right">
                                    {{ Math.ceil(spentPercentOfActual) }}%
                                </td>
                            </tr>
                            <tr v-if="hasSavingsTarget">
                                <td class="text-sm-left">Budget remaining:</td>
                                <td class="text-sm-right">
                                    <monetary-amount
                                        :value="budgetRemaining"
                                    ></monetary-amount>
                                </td>
                            </tr>
                            <tr>
                                <td class="text-sm-left">Actual remaining</td>
                                <td class="text-sm-right">
                                    <monetary-amount
                                        :value="selectedAccount.balance"
                                    ></monetary-amount>
                                </td>
                            </tr>
                        </table>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import { VProgressCircular } from 'vuetify';
import MonetaryAmount from '../util/MonetaryAmount.vue';
import SavingsGoalMixin from './SavingsGoalMixin';
import { formatDate } from '../util/formatDate';

export default {
    mixins: [SavingsGoalMixin],
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
        date: formatDate,
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
