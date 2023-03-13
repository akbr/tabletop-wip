import { createEmitter, ReadOnlyEmitter } from "@lib/emitter";
import { delay, Task } from "@lib/async/task";
import { shallow } from "@lib/compare";

export type MeterStatus<T> = {
  states: T[];
  idx: number;
  mode: "playing" | "paused" | "idle";
};

export type Meter<T> = {
  emitter: ReadOnlyEmitter<MeterStatus<T>>;
  pushStates: (...states: T[]) => void;
  setIdx: (idx: number | ((idx: number, length: number) => number)) => void;
  setPlay: (toggle: boolean | ((status: boolean) => boolean)) => void;
  waitFor: (task?: Task<any> | number) => void;
};

export const createMeter = <T>(initial: T): Meter<T> => {
  let states = [initial];
  let idx = 0;
  let waitingFor: Task<any>[] = [];
  let playing = true;
  let clearing = false;

  function getMode() {
    if (!playing) return "paused";
    if (waitingFor.length > 0 || idx < states.length - 1) return "playing";
    return "idle";
  }

  function getStatus() {
    return { states, idx, mode: getMode() } as const;
  }

  const { subscribe, get, next } = createEmitter(getStatus(), {
    isEqual: shallow,
  });

  function emit() {
    next(getStatus());
  }

  function updateState(nextIdx: number) {
    if (nextIdx > states.length - 1 || nextIdx < 0) {
      emit();
      return;
    }

    idx = nextIdx;
    /**
     *     if (!history) {
      states = states.slice(idx);
      idx = 0;
    }
     */

    emit();
    // client receives -- sets waitFors
    onChange();
  }

  function onChange() {
    if (waitingFor.length > 0 || !playing) {
      emit();
      return;
    }

    updateState(idx + 1);
  }

  function clearWaiting() {
    clearing = true;
    waitingFor.forEach((task) => {
      task.finish();
    });
    clearing = false;
    waitingFor = [];
  }

  return {
    emitter: { subscribe, get },
    pushStates: (...incoming) => {
      states = [...states, ...incoming];
      onChange();
    },
    setIdx: (input) => {
      const nextIdx =
        typeof input === "function" ? input(idx, states.length) : input;

      playing = false;
      clearWaiting();
      updateState(nextIdx);
    },
    setPlay: (toggle) => {
      typeof toggle === "function"
        ? (playing = toggle(playing))
        : (playing = toggle);
      onChange();
    },
    waitFor: (task) => {
      if (!task) return;
      const realTask = typeof task === "number" ? delay(task) : task;
      realTask.finished.then(() => {
        if (clearing) return;
        waitingFor = waitingFor.filter((x) => x !== realTask);
        onChange();
      });
      waitingFor = [...waitingFor, realTask];
      onChange();
    },
  };
};

export default createMeter;
