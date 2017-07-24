<template>
    <v-layout column>
        <div class="analysis">
            <h2>Analysis</h2>
            <p>Let's pretend there's some really clever analysis here.</p>
        </div>
        <v-layout row>
            <v-flex md6>
                <div class="upcoming">
                    <upcoming-transactions></upcoming-transactions>
                </div>
            </v-flex>
            <v-flex md6>
                <div class="categories">
                </div>
            </v-flex>
        </v-layout>
    </v-layout>
</template>

<script>
    import UpcomingTransactions from '../transactions/UpcomingTransactions.vue';

    export default {
        components: {
            UpcomingTransactions
        }
    }
</script>
