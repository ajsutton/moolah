import {VProgressCircular} from 'vuetify';
import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
import distanceInWords from 'date-fns/distance_in_words';
import startOfToday from 'date-fns/start_of_today';

export default {
    props: {
        selectedAccount: {
            type: Object,
            required: true,
        },
    },
    computed: {
        hasReachedTarget() {
            return this.hasSavingsTarget && this.selectedAccount.saved >= this.selectedAccount.savingsTarget;
        },

        remainingAmount() {
            return this.hasSavingsTarget && this.selectedAccount.savingsTarget - this.selectedAccount.saved;
        },

        hasSavingsTarget() {
            return this.hasSavings && this.selectedAccount.savingsTarget;
        },
        savingsPercent() {
            return this.hasSavingsTarget ? this.selectedAccount.saved / this.selectedAccount.savingsTarget * 100 : 0;
        },
        savingsColor() {
            if (this.savingsPercent < 100) {
                return 'accent';
            } else {
                return 'success';
            }
        },

        spentPercentOfTarget() {
            return -this.selectedAccount.spent / this.selectedAccount.savingsTarget * 100;
        },

        spentPercentOfActual() {
            return -this.selectedAccount.spent / this.selectedAccount.saved * 100;
        },

        spentPercentOfEither() {
            return this.hasSavingsTarget ? this.spentPercentOfTarget : this.spentPercentOfActual;
        },

        balancePercentOfActual() {
            return this.selectedAccount.balance / this.selectedAccount.saved * 100;
        },

        balancePercentOfTarget() {
            return this.selectedAccount.balance / this.selectedAccount.savingsTarget * 100;
        },

        budgetRemaining() {
            return this.selectedAccount.savingsTarget + this.selectedAccount.spent;
        },

        budgetRemainingPercentOfTarget() {
            return this.budgetRemaining / this.selectedAccount.savingsTarget * 100;
        },

        budgetRemainingPercentOfActual() {
            return this.budgetRemaining / this.selectedAccount.saved * 100;
        },

        hasTargetDates() {
            return this.hasSavings && this.selectedAccount.savingsStartDate && this.selectedAccount.savingsEndDate;
        },
        hasStartDate() {
            return this.hasSavings && this.selectedAccount.savingsStartDate;
        },
        hasEndDate() {
            return this.hasSavings && this.selectedAccount.savingsEndDate;
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
            if (!this.hasTargetDates) {
                return 0;
            }
            const totalDays = differenceInCalendarDays(this.selectedAccount.savingsEndDate, this.selectedAccount.savingsStartDate);
            const elapsedDays = differenceInCalendarDays(new Date(), this.selectedAccount.savingsStartDate);
            return Math.max(0, elapsedDays / totalDays * 100);
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
    },
};