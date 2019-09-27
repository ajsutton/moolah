export default {
    $keyListener: undefined,
    mounted() {
        this.$keyListener = e => {
            if (e.code === 'KeyI' && e.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();
                this.addTransaction();
            }
        };
        document.addEventListener('keydown', this.$keyListener);
    },
    beforeDestroy() {
        if (this.$keyListener !== undefined) {
            document.removeEventListener('keydown', this.$keyListener);
        }
    },
};
