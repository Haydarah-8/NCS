// Every coded illustration has a light version (for white and grey sections) and a "-dark" version
// (for black sections), both on transparent backgrounds so they blend into whatever is behind them.
export function artSrc(src: string, tone: "light" | "dark" = "light") {
  return tone === "dark" ? src.replace(/\.svg$/, "-dark.svg") : src;
}
