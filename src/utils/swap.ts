export default function swap<T>(a:T, b:T) {
  let temp: T = a;
  a = b;
  b = temp;
}