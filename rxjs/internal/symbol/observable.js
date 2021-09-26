// Symbol.observable or a string "@@observable". used for interop
export const observable = (() =>
  (typeof Symbol === "function" && Symbol.observable) || "@@observable")();
