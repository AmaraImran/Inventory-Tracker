import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/sales/new", label: "New Sale" },
  { to: "/sales", label: "Sales" },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-navy text-cream md:flex-row">
      <aside className="flex flex-col gap-4 border-b border-cream/10 p-5 md:w-60 md:shrink-0 md:justify-between md:border-b-0 md:border-r">
        <div>
          <p className="mb-4 text-xl font-bold md:mb-8">{user.shopName}</p>
          <nav className="flex gap-4 text-sm md:flex-col md:gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
               end={l.to === "/" || l.to === "/sales"}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 ${
                    isActive ? "bg-coral text-white" : "text-cream/70 hover:bg-cream/10"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <button onClick={logout} className="rounded-lg border border-cream/30 px-3 py-2 text-left text-sm hover:bg-cream/10">
          Logout
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}