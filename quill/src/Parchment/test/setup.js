beforeEach(function () {
  this.container = document.createElement("div");
  // eslint-disable-next-line no-undef
  this.scroll = new ScrollBlot(TestRegistry, this.container);
});

afterEach(function () {
  this.container = null;
  this.scroll = null;
});
