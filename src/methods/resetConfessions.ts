import { confessions } from "store/index";

export default function resetConfessions() {
  for (const key in confessions) {
    confessions[key as keyof typeof confessions] = [];
  }
}
