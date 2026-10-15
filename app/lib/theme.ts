export type Theme = "light" | "dark";

const storageKey = "stoatmod-theme";
const changeEvent = "stoatmod-theme-change";
let unsavedTheme: Theme | undefined;

// Runs in the head before the page is painted. Keep this independent of the
// client bundle, including when storage is disabled in the browser.
export const themeBootstrap = `(function(){
  if(location.pathname==='/'){document.documentElement.removeAttribute('data-theme');return}
  var saved;try{saved=localStorage.getItem('stoatmod-theme')}catch(e){}
  var theme=saved==='dark'||saved==='light'?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  document.documentElement.setAttribute('data-theme',theme);
})()`;

export function getThemeSnapshot(): Theme {
  if (unsavedTheme) return unsavedTheme;
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // System preference still works when local storage is unavailable.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function restoreTheme() {
  const root = document.documentElement;
  // The homepage has its own fixed palette; visiting it must not clear the
  // preference used by the rest of the website.
  if (window.location.pathname === "/") {
    if (root.hasAttribute("data-theme")) root.removeAttribute("data-theme");
    return;
  }
  const theme = getThemeSnapshot();
  if (root.getAttribute("data-theme") !== theme) root.setAttribute("data-theme", theme);
}

export function setTheme(theme: Theme) {
  unsavedTheme = theme;
  try {
    window.localStorage.setItem(storageKey, theme);
    unsavedTheme = undefined;
  } catch {
    // Keep the choice for this page even if the browser cannot save it.
  }
  restoreTheme();
  window.dispatchEvent(new Event(changeEvent));
}

export function subscribeTheme(listener: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const sync = () => { restoreTheme(); listener(); };
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) {
      unsavedTheme = undefined;
      sync();
    }
  };
  // Recover the preference if a client render replaces the root attributes.
  const observer = new MutationObserver(sync);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  window.addEventListener(changeEvent, sync);
  window.addEventListener("storage", onStorage);
  window.addEventListener("pageshow", sync);
  media.addEventListener("change", sync);
  sync();
  return () => {
    observer.disconnect();
    window.removeEventListener(changeEvent, sync);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("pageshow", sync);
    media.removeEventListener("change", sync);
  };
}
