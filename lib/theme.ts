export const THEME_COOKIE = "floras-theme";
export const THEME_STORAGE_KEY = "theme";

export type AppTheme = "light" | "dark";

export function parseTheme(value: string | undefined | null): AppTheme {
  return value === "dark" ? "dark" : "light";
}

export function themeCookieScript(): string {
  return `(function(){try{var c="${THEME_COOKIE}";var k=${JSON.stringify(THEME_STORAGE_KEY)};var m=document.cookie.match(new RegExp("(?:^|; )"+c+"=([^;]*)"));var t=m?decodeURIComponent(m[1]):null;if(t!=="dark"&&t!=="light"){t=localStorage.getItem(k);if(t==="dark"||t==="light"){document.cookie=c+"="+t+"; path=/; max-age=31536000; SameSite=Lax"}else{t="light"}}else{localStorage.setItem(k,t)}var d=document.documentElement;d.classList.remove("light","dark");d.classList.add(t);d.style.colorScheme=t}catch(e){}})();`;
}

export function setThemeCookie(theme: AppTheme): void {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}
