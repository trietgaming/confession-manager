import { pendingChanges } from "store/index";

export default function hadChanges() {
  return Object.values(pendingChanges).reduce(
    (prev, val) => ((Array.isArray(val) ? val.length : val) || prev),
    false
  );
}
