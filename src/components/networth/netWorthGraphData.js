export default function extrapolateBalances(dailyBalances, today) {
    if (dailyBalances.length === 0) {
        return dailyBalances;
    }
    const lastBalance = dailyBalances[dailyBalances.length - 1];
    if (lastBalance.date !== today) {
        return Array.concat([], dailyBalances, [{date: today, balance: lastBalance.balance}]);
    }
    return dailyBalances;
}