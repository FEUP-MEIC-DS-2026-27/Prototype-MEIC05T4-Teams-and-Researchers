import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createHttpApi, type TeamsApi } from "./api";
import { createMemoryApi } from "./memoryApi";
import { TeamsAdminApp } from "./TeamsAdminApp";

/** What the Shell passes to `mount()`. */
export interface MountOptions {
  /** API Gateway base URL. Omit to use demo data. */
  apiBaseUrl?: string;
  /** Returns the current bearer token; called on every request. */
  getToken?: () => string | undefined;
  /** Whether the signed-in user is an administrator. Anything but `true` means read-only. */
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
  const root = createRoot(el);
  roots.set(el, root);
  root.render(
    <StrictMode>
      {/* Fail closed: anything but a real `true` from the Shell is read-only. */}
      <TeamsAdminApp api={api} isAdmin={options.isAdmin === true} />
    </StrictMode>,
  );
}

export function unmount(el: Element): void {
  roots.get(el)?.unmount();
  roots.delete(el);
}
