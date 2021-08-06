import ReactVersion from "../../shared/ReactVersion";

import {
  REACT_FRAGMENT_TYPE,
  REACT_DEBUG_TRACING_MODE_TYPE,
  REACT_PROFILER_TYPE,
  REACT_STRICT_MODE_TYPE,
  REACT_SUSPENSE_TYPE,
  REACT_SUSPENSE_LIST_TYPE,
  REACT_LEGACY_HIDDEN_TYPE,
  REACT_OFFSCREEN_TYPE,
  REACT_SCOPE_TYPE,
  REACT_CACHE_TYPE
} from "../../shared/ReactSymbols";
import { Component, PureComponent } from "./ReactBaseClasses";
import { createRef } from "./ReactCreateRef";

// @BREAKPOINT ReactChildren