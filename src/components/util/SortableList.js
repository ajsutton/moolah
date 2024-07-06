import Sortable from 'sortablejs';

export default {
    beforeMount(el, binding, vnode) {
        const options = {
            handle: '.sortHandle',
            animation: 150,
            onUpdate: function (event) {
                binding.value(event);
            },
        };
        Sortable.create(el, options);
    },
};
