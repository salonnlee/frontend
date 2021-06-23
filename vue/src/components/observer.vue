<template>
  <div class="observer">响应式原理</div>
</template>

<script>
export default {
  name: "Observer",
  mounted() {
    // 视图更新
    function updateView() {
      console.log("view updated!");
    }

    // 监听数组原型方法
    const ArrayPrototypeObserved = Object.create(Array.prototype);
    ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(
      (methodName) => {
        ArrayPrototypeObserved[methodName] = function() {
          updateView();
          return Array.prototype[methodName].call(this, ...arguments);
        };
      }
    );

    // 响应式属性定义
    function defineProperty(target, key, value) {
      observer(target); // 深度监听
      Object.defineProperty(target, key, {
        get() {
          return value;
        },
        set(newValue) {
          if (newValue !== value) {
            value = newValue;
            observer(value); // 深度监听
            updateView();
          }
        }
      });
    }

    // 目标监听
    function observer(target) {
      if (typeof target !== "object" || target === null) {
        return target;
      }

      // 监听数组
      if (Array.isArray(target)) {
        target.__proto__ = ArrayPrototypeObserved;
      }

      // 监听对象
      for (let key in target) {
        defineProperty(target, key, target[key]);
      }
    }
  }
};
</script>
