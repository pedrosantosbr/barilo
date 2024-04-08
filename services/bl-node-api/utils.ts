type getUsernameFromCookiesFn = (cookies: string | null) => string;
const getUsernameFromCookies: getUsernameFromCookiesFn = (cookies) => {
  return "peter";
};

export { getUsernameFromCookies };
