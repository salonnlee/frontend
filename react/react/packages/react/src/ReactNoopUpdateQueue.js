// This is the abstract API for an update queue.
const ReactNoopUpdateQueue = {
  // Checks whether or not this composite component is mounted.
  isMounted: function (publicInstance) {
    return false;
  },

  // Forces an update.
  enqueueForceUpdate: function (publicInstance, callback, callerName) {},

  // Replaces all of the state.
  enqueueReplaceState: function (
    publicInstance,
    completeState,
    callback,
    callerName
  ) {},

  // Sets a subset of the state.
  enqueueSetState: function (
    publicInstance,
    partialState,
    callback,
    callerName
  ) {}
};

export default ReactNoopUpdateQueue;
