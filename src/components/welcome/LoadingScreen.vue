<template>
    <v-container class="loading-screen" fluid fill-height>
        <v-layout column align-center justify-center>
            <v-flex>
                <div class="loading text-xs-center elevation-6">
                    <p><img :src="require('../../assets/moolah.svg')" width="310" height="310"></p>
                    <v-progress-linear :indeterminate="true" color="accent"></v-progress-linear>
                </div>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<style lang="scss">
    .loading-screen {
        .flex {
            flex: 0 0 auto;
        }

        @keyframes rotate {
            0% {
                transform: rotateY(0deg);
            }
            39%,41% {
                transform: rotateY(180deg);
            }
            80%,100% {
                transform: rotateY(360deg);
            }
        }

        .loading {
            display: block;
            /*animation-duration: 4s;*/
            /*animation-name: rotate;*/
            animation-iteration-count: infinite;
            transform-style: preserve-3d;
            animation-timing-function: linear;
            background-color: #1976d2;
            border-radius: 10px;
            padding: 10px;
        }
    }
</style>
