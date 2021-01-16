export default function iconForType(type) {
    if (type === undefined) {
        return 'bookmark_outline';
    }
    switch (type) {
        case 'cc':
            return 'mdi-credit-card-outline';
        case 'asset':
            return 'mdi-home';
        case 'earmark':
            return 'mdi-bookmark-outline';
        case 'investment':
            return 'insights';
        default:
            return 'mdi-bank';
    }
}
