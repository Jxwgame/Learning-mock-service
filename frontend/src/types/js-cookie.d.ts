declare module "js-cookie" {
  const Cookies: {
    get(name: string): string | undefined;
    set(name: string, value: string, options?: Cookies.CookieAttributes): void;
    remove(name: string, options?: Cookies.CookieAttributes): void;
  };
  export = Cookies;
}
