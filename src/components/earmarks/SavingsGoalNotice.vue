<template>
    <v-container class="savingsGoalNotice">
        <v-row   align="start" justify="center">
            <v-col v-if="hasStartDate || hasEndDate" class="d-flex" cols="12" lg="4" xl="2">
                <v-row class="text-sm-center" column>
                    <v-col>
                        <v-progress-circular
                            :value="timePercent"
                            :size="progressSize"
                            :width="progressWidth"
                            :rotate="180"
                            :color="timeColor"
                        >
                            Time<br />
                            <span v-if="hasTargetDates" class="text-h5"
                                >{{ Math.floor(timePercent) }}%</span
                            >
                        </v-progress-circular>
                    </v-col>

                    <v-col cols="12">
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
                    </v-col>
                </v-row>
            </v-col>

            <v-col class="d-flex" cols="12" lg="4" xl="2">
                <v-row class="text-sm-center" column>
                    <v-col>
                        <v-progress-circular
                            :value="savingsPercent"
                            :size="progressSize"
                            :width="progressWidth"
                            :rotate="180"
                            :color="savingsColor"
                        >
                            Saved<br />
                            <span v-if="hasSavingsTarget" class="text-h5"
                                >{{ Math.floor(savingsPercent) }}%</span
                            >
                        </v-progress-circular>
                    </v-col>

                    <v-col cols="12">
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
                    </v-col>
                </v-row>
            </v-col>

            <v-col class="d-flex" cols="12" lg="4" xl="2">
                <v-row class="text-sm-center" column>
                    <v-col>
                        <v-progress-circular
                            :value="spentPercentOfEither"
                            :size="progressSize"
                            :width="progressWidth"
                            :rotate="180"
                            :color="savingsColor"
                        >
                            Spent<br />
                            <span v-if="hasSaved" class="text-h5"
                                >{{ Math.ceil(spentPercentOfEither) }}%</span
                            >
                        </v-progress-circular>
                    </v-col>

                    <v-col cols="12">
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
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { VProgressCircular } from 'vuetify';
import MonetaryAmount from '../util/MonetaryAmount.vue';
import SavingsGoalMixin from './SavingsGoalMixin';
import { formatDate } from '../util/formatDate';

export default {
    filters: {
        date: formatDate,
    },
    components: {
        VProgressCircular,
        MonetaryAmount,
    },
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
