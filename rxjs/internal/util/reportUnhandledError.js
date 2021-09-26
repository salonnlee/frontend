import { timeoutProvider } from "../scheduler/timeoutProvider";

export function reportUnhandledError(err) {
  timeoutProvider.setTimeout(() => {
    throw err;
  });
}
