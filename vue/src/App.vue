<template>
  <div id="app">
    <!-- <watch></watch> -->
    <!-- <for-if></for-if> -->
    <observer></observer>
  </div>
</template>

<script>
import Watch from "./components/watch.vue";
import ForIf from "./components/for-if.vue";
import Observer from "./components/observer.vue";

export default {
  name: "App",
  components: {
    /* eslint-disable vue/no-unused-components */
    Watch,
    ForIf,
    /* eslint-enable vue/no-unused-components */
    Observer
  }
};
</script>

<style>
html,
body {
  font-family: "Fira Code";
}
</style>
