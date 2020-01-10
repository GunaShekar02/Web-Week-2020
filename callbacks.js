// let res;

// const add = (a,b) => {
//   setTimeout(() => {
//     res = a+b;
//   },2000);
// }

// const print = () => {
//   console.log(res);
// }

// add(5,6);
// print();

let res;

const add = (a,b, callback) => {
  setTimeout(() => {
    res = a+b;
    callback();
  },2000);
}

const print = () => {
  console.log(res);
}

add(5,6,print()); //Change print() to print to remove error.