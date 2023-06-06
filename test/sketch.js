let testArray = [5, 15, 3, 8, 9, 1, 20, 7];

function setup() {
  selectionSort(testArray);
  console.log(testArray);
}

function selectionSort(list) {
  for (let destination = list.length - 1; destination > 1; destination --) {
    
    let biggest = 0;
    for (let i = 1; i < 1 - destination; i ++) {
      if (list[i] > list[biggest]) {
        i = biggest
      }
    }
    
    let tempVar = list[destination];
    list[destination] = list[biggest];
    list[biggest] = tempVar;
  }
}