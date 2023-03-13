export interface Task<T = any> {
  finish: () => void;
  finished: Promise<T>;
}

export function taskOf<T>(task: Task<T>): Task<T> {
  let done = false;
  return {
    ...task,
    finish: () => {
      if (done) return;
      done = true;
      task.finish();
    },
  };
}

export function getPromiseParts() {
  let resolve: (value: unknown) => void;
  let reject: (reason?: any) => void;
  let promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  //@ts-ignore
  return { promise, resolve, reject };
}

const noop = function () {};

export const delay = (ms: number, fn = noop): Task => {
  const { promise, resolve } = getPromiseParts();
  const timeout = setTimeout(() => {
    resolve(fn());
  }, ms);
  return taskOf({
    finished: promise,
    finish: () => {
      clearTimeout(timeout);
      resolve(fn());
    },
  });
};

export const all = (tasks: Task[]): Task<any> => {
  const { promise, resolve } = getPromiseParts();

  Promise.all(tasks.map((t) => t.finished)).then(() => {
    resolve(null);
  });
  return taskOf({
    finished: promise as Promise<null>,
    finish: () => {
      tasks.forEach((t) => t.finish());
      resolve(null);
    },
  });
};

export const seq = (fns: (() => Task | void | null)[]): Task => {
  const { promise, resolve } = getPromiseParts();

  let pending: Task | void | null;
  let idx = -1;
  let finishing = false;

  function iterate() {
    if (finishing && pending) pending.finish();

    idx = idx + 1;
    if (idx >= fns.length) return resolve(null);

    pending = fns[idx]();
    if (pending && !finishing) pending.finished.then(iterate);

    if (!pending || finishing) iterate();
  }

  iterate();

  return taskOf({
    finished: promise,
    finish: () => {
      finishing = true;
      iterate();
    },
  });
};
