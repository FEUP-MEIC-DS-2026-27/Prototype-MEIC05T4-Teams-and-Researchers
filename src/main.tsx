import "bootstrap/dist/css/bootstrap.min.css";
import { mount } from "./mount";

const root = document.getElementById("root")!;
root.classList.add("container", "py-4");

// Standalone demo (in-memory data): administrator view by default, ?role=user for the regular view.
const isAdmin = new URLSearchParams(location.search).get("role") !== "user";
mount(root, { isAdmin });
