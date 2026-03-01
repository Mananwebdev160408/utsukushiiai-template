import { v4 as uuidv4 } from "uuid";

type Prefix = "usr" | "prj" | "pnl" | "rnd" | "yt" | "file";

export function generateId(prefix: Prefix): string {
  const short = uuidv4().replace(/-/g, "").slice(0, 12);
  return `${prefix}_${short}`;
}
