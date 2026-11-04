import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createHttpApi, type TeamsApi } from "./api";
import { ErrorBoundary } from "./ErrorBoundary";
import { createMemoryApi } from "./memoryApi";
import { TeamsAdminApp } from "./TeamsAdminApp";

/** Options for the standalone and legacy element-mount adapter. */
export interface MountOptions {
  /** API Gateway base URL. Omit to use demo data. */
  apiBaseUrl?: string;
  /** Returns the current bearer token; called on every request. */
  getToken?: () => string | undefined;
  /** UI hint from the host's authenticated session; the API must enforce every write independently. */
  isAdmin: boolean;
  /** Replaces the built-in API (tests). */
  api?: TeamsApi;
}

const roots = new WeakMap<Element, Root>();

export function mount(el: Element, options: MountOptions): void {
  unmount(el);
  const api =
    options.api ??
    (options.apiBaseUrl ? createHttpApi(options.apiBaseUrl, options.getToken) : createMemoryApi());
  const demoMode = !options.api && !options.apiBaseUrl;
  const root = createRoot(el);
  roots.set(el, root);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        {/* Fail closed: anything but a real `true` from the Shell is read-only. */}
        <TeamsAdminApp api={api} isAdmin={options.isAdmin === true} demoMode={demoMode} />
      </ErrorBoundary>
    </StrictMode>,
  );
}

export function unmount(el: Element): void {
  roots.get(el)?.unmount();
  roots.delete(el);
}
