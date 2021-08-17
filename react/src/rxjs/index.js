function subscribe(observer) {
  let count = 0;
  const intervalID = setInterval(() => {
    observer.next(`next ${++count}`);
  }, 1000);
  return {
    unsubscribe: function () {
      clearInterval(intervalID);
    }
  };
}

const subscription = subscribe({ next: (x) => console.log(x) });

setTimeout(() => {
  subscription.unsubscribe();
}, 6000);
