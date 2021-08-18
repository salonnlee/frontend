import { takeLatest } from "redux-saga/effects";

export default function* () {
  yield takeLatest("FETCH_TEST", (...args) => {
    console.warn("FETCH_TEST", args);
  });
}
