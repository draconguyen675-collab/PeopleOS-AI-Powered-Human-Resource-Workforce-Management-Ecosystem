import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  Users,
  X,
  History,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCompany, useMe } from "../../services/queries";
import { logout } from "../../services/api";
import { usePreferences } from "../../stores/preferences";
import { initials } from "../../lib/utils";
import { Button } from "../../components/ui/button";

const links = [
  {
    path: "/app/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    permission: "dashboard:read",
    group: "WORKSPACE",
  },
  {
    path: "/app/people/employees",
    label: "People directory",
    icon: Users,
    permission: "employees:read",
    group: "",
  },
  {
    path: "/app/settings/company",
    label: "Company",
    icon: Building2,
    permission: "company:read",
    group: "ADMINISTRATION",
  },
  {
    path: "/app/settings/roles",
    label: "Roles & permissions",
    icon: ShieldCheck,
    permission: "roles:read",
    group: "",
  },
  {
    path: "/app/settings/audit",
    label: "Activity & audit",
    icon: History,
    permission: "audit:read",
    group: "",
  },
  {
    path: "/app/settings/security",
    label: "Sign-in sessions",
    icon: Monitor,
    permission: "",
    group: "YOUR ACCOUNT",
  },
];
export default function AppShell() {
  const { data: me } = useMe();
  const { data: company } = useCompany();
  const { theme, setTheme } = usePreferences();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const client = useQueryClient();
  const location = useLocation();
  const { t } = useTranslation();
  useEffect(() => {
    const onExpired = () => {
      client.clear();
      navigate("/auth/login", { replace: true });
    };
    window.addEventListener("session-expired", onExpired);
    return () => window.removeEventListener("session-expired", onExpired);
  }, [client, navigate]);
  async function signOut() {
    setSigningOut(true);
    setError("");
    try {
      await logout();
      client.clear();
      navigate("/auth/login", { replace: true });
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Could not sign out.",
      );
    } finally {
      setSigningOut(false);
    }
  }
  const navigation = (
    <>
      <NavLink
        to="/app/dashboard"
        className="brand"
        onClick={() => setOpen(false)}
      >
        <img src="/favicon.svg" alt="" />
        People<span>OS</span>
      </NavLink>
      <div className="workspace-card">
        <div className="company-mark">{company?.name.slice(0, 1) ?? "N"}</div>
        <div>
          <strong>{company?.name ?? "Your workspace"}</strong>
          <span>People workspace</span>
        </div>
        <Building2 size={15} />
      </div>
      <nav aria-label="Main navigation">
        {links
          .filter(
            (link) =>
              !link.permission || me?.permissions.includes(link.permission),
          )
          .map((link) => (
            <div key={link.path}>
              {link.group && <div className="nav-heading">{link.group}</div>}
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                to={link.path}
                onClick={() => setOpen(false)}
              >
                <link.icon size={19} />
                {link.label}
              </NavLink>
            </div>
          ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="workspace-note">
          <span className="status-dot" />
          Your people, connected.<p>A shared space to do your best work.</p>
        </div>
        <div className="theme-control" aria-label="Appearance">
          {(
            [
              { value: "light", icon: Sun },
              { value: "dark", icon: Moon },
              { value: "system", icon: Monitor },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              aria-label={`${item.value} theme`}
              aria-pressed={theme === item.value}
              onClick={() => setTheme(item.value)}
            >
              <item.icon size={16} />
            </button>
          ))}
        </div>
        <button
          className="sign-out"
          onClick={() => void signOut()}
          disabled={signingOut}
        >
          <LogOut size={17} />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
        {error && (
          <small role="alert" className="field-error">
            {error}
          </small>
        )}
      </div>
    </>
  );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">{navigation}</aside>
      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
                <Button
                  variant="ghost"
                  className="mobile-menu"
                  aria-label="Open navigation"
                >
                  <Menu size={21} />
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content
                  className="nav-drawer"
                  aria-describedby={undefined}
                >
                  <Dialog.Title className="sr-only">
                    Workspace navigation
                  </Dialog.Title>
                  <Dialog.Close
                    className="drawer-close"
                    aria-label="Close navigation"
                  >
                    <X size={20} />
                  </Dialog.Close>
                  {navigation}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <span className="breadcrumb">
              Workspace <span>/</span>{" "}
              <strong>
                {links.find((link) => link.path === location.pathname)?.label ??
                  "PeopleOS"}
              </strong>
            </span>
          </div>
          <div className="topbar-right">
            {me?.permissions.includes("employees:read") && (
              <form
                className="global-search"
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  navigate(
                    `/app/people/employees?search=${encodeURIComponent(search)}`,
                  );
                  setSearch("");
                }}
              >
                <Search size={16} />
                <input
                  aria-label="Search people globally"
                  placeholder="Find someone…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <button aria-label="Search">
                  <ArrowUpRight size={15} />
                </button>
              </form>
            )}
            <div className="user-profile">
              <div className="avatar avatar-green">
                {initials(me?.displayName ?? "User")}
              </div>
              <div>
                <strong>{me?.displayName}</strong>
                <span>
                  {me?.role === "OWNER"
                    ? "Workspace owner"
                    : me?.role === "HR_ADMIN"
                      ? "HR administrator"
                      : "Workspace viewer"}
                </span>
              </div>
            </div>
          </div>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>
            PeopleOS <span className="footer-dot">·</span> {t("welcome")}
          </span>
          <span>
            <span className="status-dot" />
            Connected workspace
          </span>
        </footer>
      </div>
    </div>
  );
}
