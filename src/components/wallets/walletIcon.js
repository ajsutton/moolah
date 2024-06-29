import IconBookmarkOutline from '~icons/mdi/bookmarkOutline';
import IconCreditCardOutline from '~icons/mdi/creditCardOutline';
import IconHome from '~icons/mdi/home';
import IconInsights from '~icons/mdi/chartTimelineVariantShimmer';
import IconBank from '~icons/mdi/bank';

export default function iconForType(type) {
    if (type === undefined) {
        return IconBookmarkOutline;
    }
    switch (type) {
        case 'cc':
            return IconCreditCardOutline;
        case 'asset':
            return IconHome;
        case 'earmark':
            return IconBookmarkOutline;
        case 'investment':
            return IconInsights;
        default:
            return IconBank;
    }
}
