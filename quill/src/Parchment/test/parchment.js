import Attributor from "../attributor/attributor.js";
import ClassAttributor from "../attributor/class.js";
import StyleAttributor from "../attributor/style.js";

import ShadowBlot from "../blot/abstract/shadow.js";
import ParentBlot from "../blot/abstract/parent.js";
import ContainerBlot from "../blot/abstract/container.js";
import LeafBlot from "../blot/abstract/leaf.js";

import ScrollBlot from "../blot/scroll.js";
import BlockBlot from "../blot/block.js";
import InlineBlot from "../blot/inline.js";
import EmbedBlot from "../blot/embed.js";
import TextBlot from "../blot/text.js";

import LinkedList from "../collection/LinkedList.js";
import Registry from "../registry.js";
import Scope from "../scope.js";

const TestRegistry = new Registry();

window["Attributor"] = Attributor;
window["ClassAttributor"] = ClassAttributor;
window["StyleAttributor"] = StyleAttributor;

window["ShadowBlot"] = ShadowBlot;
window["ParentBlot"] = ParentBlot;
window["LeafBlot"] = LeafBlot;
window["EmbedBlot"] = EmbedBlot;

window["ScrollBlot"] = ScrollBlot;
window["ContainerBlot"] = ContainerBlot;
window["BlockBlot"] = BlockBlot;
window["InlineBlot"] = InlineBlot;
window["TextBlot"] = TextBlot;

window["LinkedList"] = LinkedList;
window["Scope"] = Scope;
window["Registry"] = Registry;
window["TestRegistry"] = TestRegistry;

TestRegistry.register(ScrollBlot);
TestRegistry.register(BlockBlot);
TestRegistry.register(InlineBlot);
TestRegistry.register(TextBlot);
