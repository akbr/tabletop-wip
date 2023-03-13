import { delay, Task } from "@lib/async/task";
import { createEmitter, ReadOnlyEmitter } from "@lib/emitter";

export type MeterStatus<T> = {
  state: T;
  states: T[];
  idx: number;
  waitingFor: Task<any>[];
  playing: boolean;
};

export type Meter<T> = {
  emitter: ReadOnlyEmitter<MeterStatus<T>>;
  pushStates: (...states: T[]) => void;
  resetStates: (...states: T[]) => void;
  setIdx: (idx: number | ((idx: number, length: number) => number)) => void;
  waitFor: (task?: Task<any> | number) => void;
  togglePlay: (toggle: boolean | ((status: boolean) => boolean)) => void;
  toggleHistory: (val: boolean) => void;
  reset: (state: T) => void;
  unlock: () => void;
};

export const createMeter = <T>(
  initial: T,
  { history } = { history: false }
): Meter<T> => {
  let states = [initial];
  let idx = 0;
  let playing = true;
  let waitingFor: Task<any>[] = [];
  let locked = false;

  function getStatus(): MeterStatus<T> {
    return {
      state: states[idx],
      states,
      idx,
      playing,
      waitingFor,
    };
  }

  const { subscribe, get, next } = createEmitter(getStatus());

  function update() {
    const status = getStatus();
    next(status);
  }

  function updateState(nextIdx: number) {
    if (locked) return;
    if (nextIdx < 0 || nextIdx > states.length - 1) return;

    idx = nextIdx;

    if (!history) {
      states = states.slice(idx);
      idx = 0;
    }

    locked = true;
    update();
  }

  function iterate(): false | void {
    const isWaiting = waitingFor.length > 0;
    if (isWaiting || !playing) {
      update();
    } else {
      updateState(idx + 1);
    }
  }

  function clearWaiting() {
    if (waitingFor.length > 0) {
      waitingFor.forEach((task) => {
        task.finish();
      });
      waitingFor = [];
    }
    locked = false;
  }
  return {
    emitter: { subscribe, get },
    reset: (state) => {
      clearWaiting();
      states = [state];
      idx = 0;
      update();
    },
    pushStates: (...incoming) => {
      states = [...states, ...incoming];
      iterate();
    },
    resetStates: (...incoming) => {
      idx = -1;
      states = [...incoming];
      iterate();
    },
    toggleHistory: (val) => {
      history = val;
    },
    waitFor: (task) => {
      if (!task) return;
      const realTask = typeof task === "number" ? delay(task) : task;
      realTask.finished.then(() => {
        waitingFor = waitingFor.filter((x) => x !== realTask);
        iterate();
      });
      waitingFor = [...waitingFor, realTask];
      iterate();
    },
    togglePlay: (toggle) => {
      typeof toggle === "function"
        ? (playing = toggle(playing))
        : (playing = toggle);
      update();
      iterate();
    },
    setIdx: (input) => {
      const nextIdx =
        typeof input === "function" ? input(idx, states.length) : input;

      playing = false;
      clearWaiting();
      updateState(nextIdx);
    },
    unlock: () => {
      locked = false;
      iterate();
    },
  };
};

export default createMeter;
