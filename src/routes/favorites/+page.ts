/**
 * Favorites page load — no server data; favorites come from localStorage.
 * This load just ensures the route is set up. The component reads from the store.
 */

import type { PageLoad } from "./$types";

export const load: PageLoad = async () => (
  {}
);
