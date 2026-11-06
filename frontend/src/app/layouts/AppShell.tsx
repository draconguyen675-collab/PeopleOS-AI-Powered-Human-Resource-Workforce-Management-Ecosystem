import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Building2,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Search,
  Sun,
  X,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCompany, useMe } from "../../services/queries";
import { logout } from "../../services/api";
import { usePreferences } from "../../stores/preferences";
import { initials } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { links, navigationGroups } from "./navigation";

export default function AppShell() {
  const { data: me } = useMe();
  const { data: company } = useCompany();
  const { theme, setTheme } = usePreferences();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [closedGroups, setClosedGroups] = useState<string[]>([]);
  const [navSearch, setNavSearch] = useState("");
  const [search, setSearch] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const client = useQueryClient();
  const location = useLocation();
  const { t } = useTranslation();
  const visibleGroups = navigationGroups
    .map((group) => ({
      group,
      items: links.filter(
        (link) =>
          link.group === group &&
          (!link.permission || me?.permissions.includes(link.permission)) &&
          `${link.label} ${group}`
            .toLowerCase()
            .includes(navSearch.trim().toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0);
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
        aria-label="PeopleOS"
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
      <div className="navigation-search">
        <Search size={15} aria-hidden="true" />
        <input
          aria-label="Search navigation"
          placeholder="Find a page…"
          value={navSearch}
          onChange={(event) => setNavSearch(event.target.value)}
        />
      </div>
      <nav aria-label="Main navigation">
        {visibleGroups.map(({ group, items }) => {
          const expanded =
            !!navSearch ||
            !closedGroups.includes(group) ||
            (collapsed && !open);
          return (
            <div className="nav-group" key={group}>
              <button
                className="nav-heading nav-group-toggle"
                aria-label={"Toggle " + group + " navigation"}
                aria-expanded={expanded}
                onClick={() =>
                  setClosedGroups((groups) =>
                    groups.includes(group)
                      ? groups.filter((item) => item !== group)
                      : [...groups, group],
                  )
                }
              >
                {group}
                <ChevronDown
                  size={13}
                  className={expanded ? "" : "group-chevron-closed"}
                />
              </button>
              {expanded &&
                items.map((link) => (
                  <NavLink
                    key={link.path}
                    className={({ isActive }) =>
                      "nav-link " + (isActive ? "active" : "")
                    }
                    to={link.path}
                    aria-label={link.label}
                    title={link.label}
                    onClick={() => {
                      setOpen(false);
                      setNavSearch("");
                    }}
                  >
                    <link.icon size={19} />
                    <span className="nav-label">{link.label}</span>
                  </NavLink>
                ))}
            </div>
          );
        })}
        {visibleGroups.length === 0 && (
          <p className="nav-empty" role="status">
            No matching pages
          </p>
        )}
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
          aria-label="Sign out"
          onClick={() => void signOut()}
          disabled={signingOut}
        >
          <LogOut size={17} />
          <span className="nav-label">
            {signingOut ? "Signing out…" : "Sign out"}
          </span>
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
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">{navigation}</aside>
      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <Button
              variant="ghost"
              className="desktop-nav-toggle"
              aria-label={
                collapsed ? "Expand navigation" : "Collapse navigation"
              }
              aria-expanded={!collapsed}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <PanelLeftOpen size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )}
            </Button>
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
                {links.find(
                  (link) =>
                    location.pathname === link.path ||
                    location.pathname.startsWith(`${link.path}/`),
                )?.label ?? "PeopleOS"}
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
