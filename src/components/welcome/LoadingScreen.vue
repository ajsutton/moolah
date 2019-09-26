<template>
    <v-container class="loading-screen" fluid fill-height>
        <v-layout column align-center justify-center>
            <v-flex>
                <div class="loading text-xs-center">
                    <p>
                        <img
                            :src="require('../../assets/moolah.svg')"
                            width="310"
                            height="310"
                        />
                    </p>
                    <v-progress-linear
                        :indeterminate="true"
                        color="accent"
                    ></v-progress-linear>
                </div>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<style lang="scss">
.loading-screen {
    background-color: #1976d2;

    .flex {
        flex: 0 0 auto;
    }
}
</style>
