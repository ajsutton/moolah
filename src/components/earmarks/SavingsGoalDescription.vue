<script>
    import {mapState, mapGetters, mapActions, mapMutations} from 'vuex';
    import MonetaryAmount from '../util/MonetaryAmount.vue';
    import {VProgressCircular} from 'vuetify';
    import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
    import distanceInWords from 'date-fns/distance_in_words';
    import startOfToday from 'date-fns/start_of_today';
    import SavingsGoalMixin from './SavingsGoalMixin';

    export default {
        mixins: [
            SavingsGoalMixin
        ],
        render(h) {
            const money = (amount, invertColors = false) => h('monetary-amount', {
                props: {
                    value: amount,
                    omitZeroCents: true,
                    invertColors
                }
            });
            const children = [
                'You have saved ',
                money(this.selectedAccount.saved),
            ];
            if (this.selectedAccount.savingsTarget) {
                children.push(' of your ', money(this.selectedAccount.savingsTarget), ' target');
                if (this.selectedAccount.savingsStartDate && !this.startedToday && this.started) {
                    children.push(` in ${this.daysElapsed}`);
                }
                children.push('.');
            }
            if (this.hasReachedTarget) {
                children.push(' Congratulations!');
            } else if (!this.started) {
                children.push(` Savings plan starts in ${this.daysElapsed}`);
            } else if (this.selectedAccount.savingsTarget) {
                children.push(' You are ', money(this.remainingAmount, true), ' short of your target');
                if (this.selectedAccount.savingsEndDate) {
                    if (this.dueToday) {
                        children.push(' which is due today');
                    } else if (this.overdue) {
                        children.push(` and the target end date was ${this.daysRemaining} ago`);
                    } else {
                        children.push(` with ${this.daysRemaining} left`);
                    }
                }
            }
            return h(
                'p',
                children,
            );
        },
        components: {
            MonetaryAmount,
        },
    };
</script>
