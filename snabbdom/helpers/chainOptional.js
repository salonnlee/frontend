export default function chainOptional(objOrFn, ...args) {
  if (objOrFn === null || objOrFn === void 0) {
    return void 0;
  }
  if (typeof objOrFn === "function") {
    return objOrFn(...args);
  }
  return objOrFn[args[0]];
}
