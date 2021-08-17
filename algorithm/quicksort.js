const swap = (arr, i, j) => {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
};

// 获取 pivot 交换完后的 index
const partition = (arr, pivot, left, right) => {
  const pivotVal = arr[pivot];
  let startIndex = left;
  for (let i = left; i < right; i++) {
    if (arr[i] < pivotVal) {
      swap(arr, i, startIndex);
      startIndex++;
    }
  }
  swap(arr, startIndex, pivot);
  return startIndex;
};

const quickSort = (arr, left, right) => {
  if (left < right) {
    let pivot = right;
    let partitionIndex = partition(arr, pivot, left, right);
    quickSort(arr, left, partitionIndex - 1 < left ? left : partitionIndex - 1);
    quickSort(
      arr,
      partitionIndex + 1 > right ? right : partitionIndex + 1,
      right
    );
  }
};

const arr = [6, 11, 3, 9, 8];
quickSort(arr, 0, arr.length - 1);
console.log(arr);
