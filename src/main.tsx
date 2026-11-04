import "bootstrap/dist/css/bootstrap.min.css";
import { mount } from "./mount";

const root = document.getElementById("root")!;
root.classList.add("container", "py-4");

// This only previews in-memory admin controls in Vite development, never in the Shell or production build.
const isDemoAdmin =
  import.meta.env.DEV && new URLSearchParams(location.search).get("demoAdmin") === "true";
mount(root, { isAdmin: isDemoAdmin });
