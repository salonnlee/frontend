<template>
  <div id="app">
    <watch></watch>
    <for-if></for-if>
  </div>
</template>

<script>
import Watch from "./components/watch.vue";
import ForIf from "./components/for-if.vue";

export default {
  name: "App",
  components: {
    Watch,
    ForIf
  }
};
</script>

<style>
html,
body {
  font-family: "Fira Code";
}
</style>
