<template>
    <v-card v-resize="handleResize">
        <v-app-bar v-if="title != ''" flat class="white">
            <v-toolbar-title class="text-body-2 grey--text">{{
                title
            }}</v-toolbar-title>
            <slot></slot>
        </v-app-bar>
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
@import '~c3/c3.css';

.chart {
    svg {
        font-family: inherit;
        font-size: inherit;
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
        stroke: #ddd;
    }
}
</style>
