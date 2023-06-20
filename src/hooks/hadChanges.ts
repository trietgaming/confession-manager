import { pendingChanges } from "store/index";

export default function hadChanges() {
  return Object.entries(pendingChanges).some(
    ([key, val]) =>
      key !== "posts" && (Array.isArray(val) ? val.length > 0 : !!val)
  );
}
