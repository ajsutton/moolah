export default function iconForType(type) {
    switch (type) {
        case 'cc':
            return 'credit_card';
        case 'asset':
            return 'home';
        default:
            return 'account_balance';
    }
}
