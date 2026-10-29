// Shared class strings so buttons, links and page widths stay identical across the site.

/** Full layout width, used for tiles, grids and the navigation. */
export const container = "mx-auto w-full max-w-[1200px] px-5 sm:px-8";
/** Reading width for headlines and copy. */
export const narrow = "mx-auto w-full max-w-[980px] px-5 sm:px-8";

const pill =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-[22px] py-[11px] text-[17px] leading-[1.2] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c41616]";

export const btnPrimary = `${pill} bg-[#a01010] text-white hover:bg-[#c41616]`;
export const btnSecondary = `${pill} border border-[#a01010] text-[#a01010] hover:bg-[#a01010] hover:text-white`;
export const btnSecondaryDark = `${pill} border border-white/80 text-white hover:bg-white hover:text-[#1d1d1f]`;

export const linkMore = "inline-flex items-center gap-0.5 text-[17px] text-[#a01010] hover:underline";
export const linkMoreDark = "inline-flex items-center gap-0.5 text-[17px] text-[#ff5a5a] hover:underline";
