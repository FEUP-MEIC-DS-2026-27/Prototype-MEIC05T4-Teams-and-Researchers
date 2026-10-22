import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createHttpApi, type TeamsApi } from "./api";
import { createMemoryApi } from "./memoryApi";
import { TeamsAdminApp } from "./TeamsAdminApp";

export interface MountOptions {
  /** API Gateway base URL. Omit to use demo data. */
  apiBaseUrl?: string;
  getToken?: () => string | undefined;
  isAdmin: boolean;
  api?: TeamsApi;
}

const roots = new WeakMap<Element, Root>();

// TODO [Pessoa 5]: integrar com a Microfrontend Shell (carregamento em runtime, rota, tema partilhado).
export function mount(el: Element, options: MountOptions): void {
  unmount(el);
  const api =
    options.api ??
    (options.apiBaseUrl ? createHttpApi(options.apiBaseUrl, options.getToken) : createMemoryApi());
  const root = createRoot(el);
  roots.set(el, root);
  root.render(
    <StrictMode>
      <TeamsAdminApp api={api} isAdmin={options.isAdmin} />
    </StrictMode>,
  );
}

export function unmount(el: Element): void {
  roots.get(el)?.unmount();
  roots.delete(el);
}
