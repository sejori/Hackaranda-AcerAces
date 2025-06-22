const ranks = [1, 2, 3, 4, 5, 6, 7, 8];

const output = [];
function getAllPermutations(arr) {
  console.log(arr);
  if (arr.length <= 1) {
    return [arr];
  }
  let out = [];
  for (let a of arr) {
    console.log({a});
    const newArr = arr.filter(b => b!==a);
    const perms = getAllPermutations(newArr);
    console.log({perms});
    for (let perm of perms) {
      console.log({perm});
      out.push([a, ...perm]);
    }
  }
  return out;
}
console.log(getAllPermutations(ranks));
