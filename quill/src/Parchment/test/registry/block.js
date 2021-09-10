/* eslint-disable no-undef */

class HeaderBlot extends BlockBlot {}
HeaderBlot.blotName = "header";
HeaderBlot.tagName = ["h1", "h2"];

TestRegistry.register(HeaderBlot);
