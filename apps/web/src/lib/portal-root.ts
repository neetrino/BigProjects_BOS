const APP_PORTAL_ROOT_ID = 'app-portal-root';

/** Portal target inside the zoomed desktop stage when present; otherwise body. */
export function getAppPortalRoot(): HTMLElement {
  if (typeof document === 'undefined') {
    throw new Error('getAppPortalRoot requires a browser document');
  }
  return document.getElementById(APP_PORTAL_ROOT_ID) ?? document.body;
}

export { APP_PORTAL_ROOT_ID };
