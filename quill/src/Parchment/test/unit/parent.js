describe("Parent", function () {
  beforeEach(function () {
    let node = document.createElement("p");
    node.innerHTML = "<span>0</span><em>1<strong>2</strong><img></em>4";
    // eslint-disable-next-line no-undef
    this.blot = TestRegistry.create(this.scroll, node);
  });

  describe("descendants()", function () {
    it("all", function () {
      // eslint-disable-next-line no-undef
      expect(this.blot.descendants(ShadowBlot).length).toEqual(8);
    });

    it("container", function () {
      // eslint-disable-next-line no-undef
      expect(this.blot.descendants(ParentBlot).length).toEqual(3);
    });

    it("leaf", function () {
      // eslint-disable-next-line no-undef
      expect(this.blot.descendants(LeafBlot).length).toEqual(5);
    });

    it("embed", function () {
      // eslint-disable-next-line no-undef
      expect(this.blot.descendants(EmbedBlot).length).toEqual(1);
    });

    it("range", function () {
      // eslint-disable-next-line no-undef
      expect(this.blot.descendants(TextBlot, 1, 3).length).toEqual(2);
    });

    it("function match", function () {
      expect(
        this.blot.descendants(
          function (blot) {
            // eslint-disable-next-line no-undef
            return blot instanceof TextBlot;
          },
          1,
          3
        ).length
      ).toEqual(2);
    });
  });

  describe("descendant", function () {
    it("index", function () {
      // eslint-disable-next-line no-undef
      let [blot, offset] = this.blot.descendant(ItalicBlot, 3);
      // eslint-disable-next-line no-undef
      expect(blot instanceof ItalicBlot).toBe(true);
      expect(offset).toEqual(2);
    });

    it("function match", function () {
      let [blot, offset] = this.blot.descendant(function (blot) {
        // eslint-disable-next-line no-undef
        return blot instanceof ItalicBlot;
      }, 3);
      // eslint-disable-next-line no-undef
      expect(blot instanceof ItalicBlot).toBe(true);
      expect(offset).toEqual(2);
    });

    it("no match", function () {
      // eslint-disable-next-line no-undef
      let [blot, offset] = this.blot.descendant(VideoBlot, 1);
      expect(blot).toEqual(null);
      expect(offset).toEqual(-1);
    });
  });

  it("detach()", function () {
    // eslint-disable-next-line no-undef
    expect(Registry.blots.get(this.blot.domNode)).toEqual(this.blot);
    // eslint-disable-next-line no-undef
    expect(this.blot.descendants(ShadowBlot).length).toEqual(8);
    this.blot.detach();
    // eslint-disable-next-line no-undef
    expect(Registry.blots.has(this.blot.domNode)).toBe(false);
    // eslint-disable-next-line no-undef
    this.blot.descendants(ShadowBlot).forEach((blot) => {
      // eslint-disable-next-line no-undef
      expect(Registry.blots.has(blot.domNode)).toBe(false);
    });
  });

  it("attach unknown blot", function () {
    let node = document.createElement("p");
    node.appendChild(document.createElement("input"));
    expect(() => {
      this.scroll.create(node);
    }).not.toThrowError(/\[Parchment\]/);
  });

  it("allowedChildren", function () {
    this.scroll.domNode.innerHTML = "<p>A</p>B<span>C</span><p>D</p>";
    this.scroll.update();
    expect(this.scroll.domNode.innerHTML).toEqual("<p>A</p><p>D</p>");
  });
});
