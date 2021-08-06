export function createRef() {
  const refObject = {
    current: null
  };
  // eslint-disable-next-line no-undef
  if (__DEV__) {
    Object.seal(refObject);
  }
  return refObject;
}
