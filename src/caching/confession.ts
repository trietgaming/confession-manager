import { Confession } from "types";

const initCache = () => {
  let confessions: Confession[] = [];

  return {
    get: () => confessions,
    add: (val: Confession[]) => confessions = [...confessions, ...val],
    set: (val: Confession[]) => confessions = [...val]
  }
};

export default initCache();