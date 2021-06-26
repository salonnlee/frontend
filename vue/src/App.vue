<template>
  <div id="app">
    <!-- <watch></watch> -->
    <!-- <for-if></for-if> -->
    <!-- <observer></observer> -->
    <!-- <vdom-diff></vdom-diff> -->
    <vue-template></vue-template>
  </div>
</template>

<script>
import Watch from "./components/watch.vue";
import ForIf from "./components/for-if.vue";
import Observer from "./components/observer.vue";
import VdomDiff from "./components/vdom-diff.vue";
import VueTemplate from './components/template.vue'

export default {
  name: "App",
  components: {
    /* eslint-disable vue/no-unused-components */
    Watch,
    ForIf,
    Observer,
    VdomDiff,
    /* eslint-enable vue/no-unused-components */
    VueTemplate
  }
};
</script>

<style>
html,
body {
  font-family: "Fira Code";
}
</style>
