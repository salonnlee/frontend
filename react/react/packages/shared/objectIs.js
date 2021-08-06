function is(x, y) {
  if (x === y) {
    // +0 != -0
    return x !== 0 || 1 / x === 1 / y;
  } else {
    // NaN == NaN
    // eslint-disable-next-line no-self-compare
    return x !== x && y !== y;
  }
}

const objectIs = typeof Object.is === "function" ? Object.is : is;

export default objectIs;
