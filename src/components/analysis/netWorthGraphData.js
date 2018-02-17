export default function extrapolateBalances(dailyBalances, scheduledBalances, today, forecastUntil) {
    const data = {};
    extendUntil(dailyBalances, today).forEach(balance => {
        data[balance.date] = balance;
    });
    extendUntil(extendBackTo(scheduledBalances, dailyBalances, today), forecastUntil).forEach(scheduledBalance => {
        const balance = (data[scheduledBalance.date]) || {date: scheduledBalance.date};
        balance.scheduled = scheduledBalance.balance;
        balance.scheduledAvailableFunds = scheduledBalance.availableFunds;
        const bestFit = balance.bestFit || scheduledBalance.bestFit;
        if (bestFit !== undefined) {
            balance.bestFit = bestFit;
        }
        data[scheduledBalance.date] = balance;
    });
    return Object.values(data);
}

function extendUntil(balances, until) {
    if (balances.length === 0) {
        return balances;
    }
    const lastBalance = balances[balances.length - 1];
    if (lastBalance.date !== until) {
        return Array.concat([], balances, [{date: until, balance: lastBalance.balance, availableFunds: lastBalance.availableFunds}]);
    }
    return balances;
}

function extendBackTo(forecastBalances, balances, startDate) {
    if (forecastBalances.length === 0 || balances.length === 0) {
        return forecastBalances;
    }
    if (forecastBalances[0].date !== startDate) {
        const lastBalance = balances[balances.length - 1];
        return Array.concat([{date: startDate, balance: lastBalance.balance, availableFunds: lastBalance.availableFunds}], forecastBalances);
    }
    return forecastBalances;
}
