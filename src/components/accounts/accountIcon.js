export default function iconForType(type) {
    switch (type) {
        case 'cc':
            return 'credit_card';
        case 'asset':
            return 'home';
        case 'earmark':
            return 'bookmark_outline';
        default:
            return 'account_balance';
    }
}
