import { pendingChanges } from "store/index";

export default function hadChanges() {
  return Object.values(pendingChanges).some((val) =>
    Array.isArray(val) ? val.length > 0 : !!val
  );
}
