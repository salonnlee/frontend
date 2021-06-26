<template>
  <div class="vue-template"></div>
</template>

<script>
export default {
  name: "VueTemplate",
  mounted() {
    const compiler = require("vue-template-compiler");

    const template1 = "<p>{{message}}</p>";
    // with(this) { return _c("p", [_v(_s(message))]); }
    // _c = createElement, _v = createTextVNode, _s = toString, return vnode

    const template2 =
      '<div id="div1" class="container"><img :src="imgUrl" @click="handleImgClick" /></div>';
    // with(this) { return _c("div",
    //                       { staticClass: "container", attrs: { id: "div1" } },
    //                       [_c("img", { attrs: { src: imgUrl }, on: { click: handleImgClick } })]); }

    const template3 = '<input type="text" v-model="title" />';
    // with(this) { return _c("input",
    //                        { directives: [{ name: "model", rawName: "v-model",
    //                          value: title, expression: "title" }],
    //                          attrs: { type: "text" },
    //                          domProps: { value: title },
    //                          on: { input: function ($event) { if ($event.target.composing) return; title = $event.target.value; } }
    //                        }); }

    const { render: render1 } = compiler.compile(template1);
    const { render: render2 } = compiler.compile(template2);
    const { render: render3 } = compiler.compile(template3);
    console.warn(render1);
    console.warn(render2);
    console.warn(render3);
    // render = function () { with(this) { ... }; }
  }
};
</script>
