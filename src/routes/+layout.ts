// SPA mode for GitHub Pages.
// The root layout prerenders static routes (/, /favorites, /berries get real
// HTML files), while dynamic detail routes render client-side via the SPA fallback.
export const prerender = true;
export const trailingSlash = 'ignore';
