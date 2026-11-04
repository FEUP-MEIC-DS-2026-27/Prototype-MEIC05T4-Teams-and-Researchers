import { NavLink } from "react-router-dom";

export interface TeamsNavigationLinkProps {
  basePath: string;
}

export default function TeamsNavigationLink({ basePath }: TeamsNavigationLinkProps) {
  const prefix = basePath.replace(/\/+$/, "");
  const to = prefix ? `${prefix}/teams` : "/teams";

  return (
    <NavLink
      end
      className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
      to={to}
    >
      Teams
    </NavLink>
  );
}
