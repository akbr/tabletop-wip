import { createEmitter, ReadOnlyEmitter } from "@lib/emitter";
import { delay, Task } from "@lib/async/task";

export type MeterStatus<T> = {
  state: T;
  states: T[];
  idx: number;
  waitingFor: Task<any>[];
  playing: boolean;
  willEmit: boolean;
};

export type Meter<T> = {
  emitter: ReadOnlyEmitter<MeterStatus<T>>;
  pushStates: (...states: T[]) => void;
  reset: (...states: T[]) => void;
  setIdx: (idx: number | ((idx: number, length: number) => number)) => void;
  waitFor: (task?: Task<any> | number) => void;
  togglePlay: (toggle: boolean | ((status: boolean) => boolean)) => void;
  toggleHistory: (val: boolean) => void;
};

export const createMeter = <T>(
  initial: T,
  { history } = { history: false }
): Meter<T> => {
  let states = [initial];
  let idx = 0;
  let playing = true;
  let waitingFor: Task<any>[] = [];

  let emitting = false;
  let changedOnEmit = false;

  function getStatus(): MeterStatus<T> {
    return {
      state: states[idx],
      states,
      idx,
      playing,
      waitingFor,
      willEmit: playing && idx === states.length - 1 && waitingFor.length === 0,
    };
  }

  const { subscribe, get, next } = createEmitter(getStatus());

  function emit() {
    emitting = true;
    next(getStatus());
    emitting = false;
    if (changedOnEmit) {
      changedOnEmit = false;
      iterate();
    }
  }

  function updateState(nextIdx: number) {
    if (nextIdx < 0 || nextIdx > states.length - 1) return;

    idx = nextIdx;

    if (!history) {
      states = states.slice(idx);
      idx = 0;
    }

    emit();
    iterate();
  }

  function iterate() {
    if (emitting) {
      changedOnEmit = true;
      return;
    }

    const isWaiting = waitingFor.length > 0;

    if (isWaiting || !playing) {
      emit();
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
  }
  return {
    emitter: { subscribe, get },
    pushStates: (...incoming) => {
      states = [...states, ...incoming];
      iterate();
    },
    reset: (...incoming) => {
      clearWaiting();
      states = [...incoming];
      idx = 0;
      emit();
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
      emit();
      iterate();
    },
    setIdx: (input) => {
      const nextIdx =
        typeof input === "function" ? input(idx, states.length) : input;

      playing = false;
      clearWaiting();
      updateState(nextIdx);
    },
  };
};

export default createMeter;
