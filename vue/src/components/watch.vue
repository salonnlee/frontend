<template>
  <div class="watch"></div>
</template>

<script>
export default {
  name: "Watch",
  data: function() {
    return {
      obj: [{ msg: "I am a message" }]
    };
  },
  watch: {
    obj: {
      handler: function(val, oldVal) {
        console.warn("watch obj", { val, oldVal });
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    setTimeout(() => {
      this.obj[0].msg = "Hello World!";
    }, 1000);
  }
};
</script>
