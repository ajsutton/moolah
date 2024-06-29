<template>
    <v-container class="loading-screen fill-height" fluid>
        <v-row column align="center" justify="center">
            <v-col>
                <div class="loading text-sm-center">
                    <p>
                        <img
                            src="@/assets/moolah.svg"
                            width="310"
                            height="310"
                        />
                    </p>
                    <v-progress-linear
                        :indeterminate="true"
                        color="accent"
                    ></v-progress-linear>
                </div>
            </v-col>
        </v-row>
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
