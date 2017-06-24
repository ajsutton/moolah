<template>
  <div id="app">
    <account-list></account-list>
  </div>
</template>

<script>
  import AccountList from "./AccountList";
  export default {
    name: 'app',
    components: {
      AccountList
    }
  }
</script>

<style lang="stylus">
  @import '../node_modules/vuetify/src/stylus/main.styl';
</style>
