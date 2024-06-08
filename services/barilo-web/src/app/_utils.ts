import { cookies } from "next/headers";

export function getNextCookie(key: string) {
  return cookies().get(key)?.value;
}
