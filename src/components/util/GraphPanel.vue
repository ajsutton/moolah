<template>
    <v-card v-resize="handleResize">
        <v-toolbar v-if="title != ''">
            <v-toolbar-title>{{ title }}</v-toolbar-title>
            <slot></slot>
        </v-toolbar>
        <slot name="chart">
            <div ref="chart" class="chart"></div>
        </slot>
        <slot name="footer"></slot>
    </v-card>
</template>

<script>
import { mapState } from 'pinia';
import debounce from 'debounce';
import { useRootStore } from '../../stores/root';

export default {
    props: {
        title: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            handleResize: debounce(() => this.$emit('resize'), 100),
        };
    },
    computed: {
        chart() {
            return this.$refs.chart;
        },
        ...mapState(useRootStore, ['showEditTransactionPanel', 'showMainNav']),
    },
    watch: {
        showEditTransactionPanel() {
            this.handleNavChange();
        },
        showMainNav() {
            this.handleNavChange();
        },
    },
    methods: {
        handleNavChange() {
            const listener = () => {
                this.handleResize();
                document.body.removeEventListener('transitionend', listener);
            };
            document.body.addEventListener('transitionend', listener);
        },
    },
};
</script>

<style lang="scss">
@import 'c3/c3.css';

.chart {
    svg {
        font-family: inherit;
        font-size: 11px;
    }

    // Make chart text adapt to light/dark theme
    .c3 text,
    .c3 .tick text {
        fill: currentColor;
    }

    .c3-xgrid-line text {
        fill: currentColor;
    }

    * {
        shape-rendering: geometricPrecision !important;
    }

    .c3-line {
        stroke-width: 2px;
    }

    .c3-line-bestFit {
        stroke-width: 1px;
    }

    .c3-ygrid {
        stroke-dasharray: none;
        stroke: rgba(128, 128, 128, 0.3);
    }
}
</style>
