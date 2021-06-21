<template>
  <div class="for-if">
    <ul>
      <!-- eslint-disable vue/no-use-v-if-with-v-for -->
      <li
        v-for="(item, index) in (log('v-for'), list)"
        :key="item.id"
        v-if="(log('v-if'), index > 1)"
      >
        {{ index }}. id:{{ (log('li'), item.id) }} title:{{ item.title }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "ForIf",
  data: function() {
    return {
      list: [
        { id: 1, title: "I am FIRST" },
        { id: 2, title: "I am SECONDE" },
        { id: 3, title: "I am THIRD" }
      ]
    };
  },
  methods: {
    log(...args) {
      console.log(...args);
    }
  }
};
</script>
