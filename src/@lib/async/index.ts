export function debounce(func: Function, wait: number) {
  let timeout: number | undefined;
  return function () {
    let later = function () {
      timeout = undefined;
      func();
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
