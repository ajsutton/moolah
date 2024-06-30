<template>
    <v-menu :close-on-content-click="false" v-model="showMenu" width="150">
        <template v-slot:activator="{ props }">
            <span v-bind="props">
                <monetary-amount :value="modelValue"></monetary-amount>
                <v-icon
                    size="small"
                    class="edit-icon"
                    :icon="IconEdit"
                ></v-icon>
            </span>
        </template>

        <template v-slot:default>
            <v-text-field
                ref="field"
                variant="solo"
                autofocus
                class="input"
                name="amount"
                v-model="text"
                prefix="$"
                @click:append-inner="save"
                @keyup.enter="save"
            >
                <template v-slot:append-inner>
                    <v-icon
                        :icon="IconTickCircle"
                        :color="iconColor"
                        @click="save"
                    ></v-icon>
                </template>
            </v-text-field>
        </template>
    </v-menu>
</template>

<script setup>
import IconTickCircle from '~icons/mdi/tickCircle';
import IconEdit from '~icons/mdi/edit';
</script>

<script>
import formatMoney from '../util/formatMoney';
import parseMoney from '../util/parseMoney';

export default {
    props: {
        modelValue: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            showMenu: false,
            text: formatMoney(this.modelValue, false, true),
        };
    },
    computed: {
        iconColor() {
            if (!isNaN(parseMoney(this.text))) {
                return 'primary';
            } else {
                return 'red';
            }
        },
    },
    emits: ['update:modelValue'],
    methods: {
        save() {
            const val = parseMoney(this.text);
            if (!isNaN(val)) {
                this.$emit('update:modelValue', parseMoney(this.text));
                this.showMenu = false;
            }
        },
    },
};
</script>
