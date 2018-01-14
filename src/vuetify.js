import Vue from 'vue'
import {
    Vuetify,
    VApp,
    VNavigationDrawer,
    VFooter,
    VToolbar,
    VList,
    VDivider,
    VJumbotron,
    VIcon,
    VChip,
    VBtn,
    VCard,
    VSelect,
    VTextField,
    VDialog,
    VRadioGroup,
    VGrid,
    VMenu,
    VDataTable,
    VProgressLinear,
    VPagination,
    VAlert,
    VBadge,
    VSwitch,
    VDatePicker,
    VBreadcrumbs,
    transitions
} from 'vuetify'

import {
    Ripple,
    Resize
} from 'vuetify/es5/directives'

export function useVuetify() {
    Vue.config.productionTip = false;
    Vue.use(Vuetify, {
        components: {
            VApp,
            VNavigationDrawer,
            VFooter,
            VToolbar,
            VList,
            VDivider,
            VJumbotron,
            VIcon,
            VChip,
            VBtn,
            VCard,
            VSelect,
            VTextField,
            VDialog,
            VRadioGroup,
            VGrid,
            VMenu,
            VDataTable,
            VProgressLinear,
            VPagination,
            VAlert,
            VBadge,
            VSwitch,
            VDatePicker,
            VBreadcrumbs,
            transitions
        },
        directives: {
            Ripple,
            Resize,
        }
    });
}
