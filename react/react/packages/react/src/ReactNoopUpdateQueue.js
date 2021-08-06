const didWarnStateUpdateForUnmountedComponent = {};

function warnNoop(publicInstance, callerName) {
  // eslint-disable-next-line no-undef
  if (__DEV__) {
    const constructor = publicInstance.constructor;
    const componentName =
      (constructor && (constructor.displayName || constructor.name)) ||
      "ReactClass";
    const warningKey = `${componentName}.${callerName}`;
    if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
      return;
    }
    console.error(
      "Can't call %s on a component that is not yet mounted. " +
        "This is a no-op, but it might indicate a bug in your application. " +
        "Instead, assign to `this.state` directly or define a `state = {};` " +
        "class property with the desired state in the %s component.",
      callerName,
      componentName
    );
    didWarnStateUpdateForUnmountedComponent[warningKey] = true;
  }
}

// This is the abstract API for an update queue.
const ReactNoopUpdateQueue = {
  isMounted: function (publicInstance) {
    return false;
  },
  enqueueForceUpdate: function (publicInstance, callback, callerName) {
    warnNoop(publicInstance, "forceUpdate");
  },
  enqueueSetState: function (
    publicInstance,
    partialState,
    callback,
    callerName
  ) {
    warnNoop(publicInstance, "setState");
  }
};

export default ReactNoopUpdateQueue;
