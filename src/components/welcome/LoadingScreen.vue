<template>
    <v-container class="loading-screen fill-height" fluid>
        <v-row column align="center" justify="center">
            <v-col>
                <div class="loading text-sm-center">
                    <p>
                        <img
                            src="@/assets/logo-stacked-on-dark.png"
                            width="200"
                            height="200"
                        />
                    </p>
                    <v-progress-linear
                        :indeterminate="true"
                        color="#FFD56B"
                    ></v-progress-linear>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<style lang="scss">
.loading-screen {
    background-color: #07102e;

    .flex {
        flex: 0 0 auto;
    }
}
</style>
