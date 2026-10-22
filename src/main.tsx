import { mount } from "./mount";

// Standalone dev host: demo data, administrator view (use ?role=user for read-only).
const isAdmin = new URLSearchParams(location.search).get("role") !== "user";
mount(document.getElementById("root")!, { isAdmin });
