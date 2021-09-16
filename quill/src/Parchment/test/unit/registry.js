describe("TestRegistry", function () {
  describe("create()", function () {
    it("name", function () {
      // eslint-disable-next-line no-undef
      let blot = TestRegistry.create(this.scroll, "bold");
      // eslint-disable-next-line no-undef
      expect(blot instanceof BoldBlot).toBe(true);
      expect(blot.statics.blotName).toBe("bold");
    });

    it("node", function () {
      let node = document.createElement("strong");
      // eslint-disable-next-line no-undef
      let blot = TestRegistry.create(this.scroll, node);
      // eslint-disable-next-line no-undef
      expect(blot instanceof BoldBlot).toBe(true);
      expect(blot.statics.blotName).toBe("bold");
    });

    it("block", function () {
      // eslint-disable-next-line no-undef
      let blot = TestRegistry.create(this.scroll, Scope.BLOCK_BLOT);
      // eslint-disable-next-line no-undef
      expect(blot instanceof BlockBlot).toBe(true);
      expect(blot.statics.blotName).toBe("block");
    });

    it("inline", function () {
      // eslint-disable-next-line no-undef
      let blot = TestRegistry.create(this.scroll, Scope.INLINE_BLOT);
      // eslint-disable-next-line no-undef
      expect(blot instanceof InlineBlot).toBe(true);
      expect(blot.statics.blotName).toBe("inline");
    });

    it("string index", function () {
      // eslint-disable-next-line no-undef
      let blot = TestRegistry.create(this.scroll, "header", "2");
      // eslint-disable-next-line no-undef
      expect(blot instanceof HeaderBlot).toBe(true);
      expect(blot.formats()).toEqual({ header: "h2" });
    });

    it("invalid", function () {
      expect(() => {
        // eslint-disable-next-line no-undef
        TestRegistry.create(this.scroll, BoldBlot);
      }).toThrowError(/\[Parchment\]/);
    });
  });

  describe("register()", function () {
    it("invalid", function () {
      expect(function () {
        // eslint-disable-next-line no-undef
        TestRegistry.register({});
      }).toThrowError(/\[Parchment\]/);
    });

    it("abstract", function () {
      expect(function () {
        // eslint-disable-next-line no-undef
        TestRegistry.register(ShadowBlot);
      }).toThrowError(/\[Parchment\]/);
    });
  });

  describe("find()", function () {
    it("exact", function () {
      let blockNode = document.createElement("p");
      blockNode.innerHTML = "<span>01</span><em>23<strong>45</strong></em>";
      // eslint-disable-next-line no-undef
      let blockBlot = TestRegistry.create(this.scroll, blockNode);
      // eslint-disable-next-line no-undef
      expect(TestRegistry.find(document.body)).toBeFalsy();
      // eslint-disable-next-line no-undef
      expect(TestRegistry.find(blockNode)).toBe(blockBlot);
      // eslint-disable-next-line no-undef
      expect(TestRegistry.find(blockNode.querySelector("span"))).toBe(
        blockBlot.children.head
      );
      // eslint-disable-next-line no-undef
      expect(TestRegistry.find(blockNode.querySelector("em"))).toBe(
        blockBlot.children.tail
      );
      // eslint-disable-next-line no-undef
      expect(TestRegistry.find(blockNode.querySelector("strong"))).toBe(
        blockBlot.children.tail.children.tail
      );
      let text01 = blockBlot.children.head.children.head;
      let text23 = blockBlot.children.tail.children.head;
      let text45 = blockBlot.children.tail.children.tail.children.head;
      // eslint-disable-next-line no-undef
      expect(TestRegistry.find(text01.domNode)).toBe(text01);
      // eslint-disable-next-line no-undef
      expect(TestRegistry.find(text23.domNode)).toBe(text23);
      // eslint-disable-next-line no-undef
      expect(TestRegistry.find(text45.domNode)).toBe(text45);
    });

    it("bubble", function () {
      // eslint-disable-next-line no-undef
      let blockBlot = TestRegistry.create(this.scroll, "block");
      let textNode = document.createTextNode("Test");
      blockBlot.domNode.appendChild(textNode);
      // eslint-disable-next-line no-undef
      expect(TestRegistry.find(textNode)).toBeFalsy();
      // eslint-disable-next-line no-undef
      expect(TestRegistry.find(textNode, true)).toEqual(blockBlot);
    });

    it("detached parent", function () {
      let blockNode = document.createElement("p");
      blockNode.appendChild(document.createTextNode("Test"));
      // eslint-disable-next-line no-undef
      expect(TestRegistry.find(blockNode.firstChild)).toBeFalsy();
      // eslint-disable-next-line no-undef
      expect(TestRegistry.find(blockNode.firstChild, true)).toBeFalsy();
    });
  });

  describe("query()", function () {
    it("class", function () {
      let node = document.createElement("em");
      node.setAttribute("class", "author-blot");
      // eslint-disable-next-line no-undef
      expect(TestRegistry.query(node)).toBe(AuthorBlot);
    });

    it("type mismatch", function () {
      // eslint-disable-next-line no-undef
      let match = TestRegistry.query("italic", Scope.ATTRIBUTE);
      expect(match).toBeFalsy();
    });

    it("level mismatch for blot", function () {
      // eslint-disable-next-line no-undef
      let match = TestRegistry.query("italic", Scope.BLOCK);
      expect(match).toBeFalsy();
    });

    it("level mismatch for attribute", function () {
      // eslint-disable-next-line no-undef
      let match = TestRegistry.query("color", Scope.BLOCK);
      expect(match).toBeFalsy();
    });

    it("either level", function () {
      // eslint-disable-next-line no-undef
      let match = TestRegistry.query("italic", Scope.BLOCK | Scope.INLINE);
      // eslint-disable-next-line no-undef
      expect(match).toBe(ItalicBlot);
    });

    it("level and type match", function () {
      // eslint-disable-next-line no-undef
      let match = TestRegistry.query("italic", Scope.INLINE & Scope.BLOT);
      // eslint-disable-next-line no-undef
      expect(match).toBe(ItalicBlot);
    });

    it("level match and type mismatch", function () {
      // eslint-disable-next-line no-undef
      let match = TestRegistry.query("italic", Scope.INLINE & Scope.ATTRIBUTE);
      expect(match).toBeFalsy();
    });

    it("type match and level mismatch", function () {
      // eslint-disable-next-line no-undef
      let match = TestRegistry.query("italic", Scope.BLOCK & Scope.BLOT);
      expect(match).toBeFalsy();
    });
  });
});
