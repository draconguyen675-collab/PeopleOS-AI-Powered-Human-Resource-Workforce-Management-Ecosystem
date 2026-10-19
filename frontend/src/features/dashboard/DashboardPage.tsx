import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../../services/api";
import { useCompany, useMe } from "../../services/queries";
import type { Overview } from "../../types/api";
import {
  ErrorState,
  Loading,
  PageHeading,
} from "../../components/common/Feedback";
import { Button } from "../../components/ui/button";

export default function DashboardPage() {
  const { data: me } = useMe();
  const { data: company } = useCompany();
  const query = useQuery({
    queryKey: ["overview"],
    queryFn: () => api<Overview>("/overview"),
  });
  if (query.isPending) return <Loading />;
  if (query.error)
    return (
      <ErrorState error={query.error} retry={() => void query.refetch()} />
    );
  const data = query.data;
  const canReadPeople = me?.permissions.includes("employees:read");
  const metrics = [
    {
      label: "Total employees",
      value: data.employees,
      note: "People in your workspace",
      icon: Users,
      color: "green",
    },
    {
      label: "Active employees",
      value: data.active,
      note: `${data.employees ? Math.round((data.active / data.employees) * 100) : 0}% of your workforce`,
      icon: UserCheck,
      color: "blue",
    },
    {
      label: "Getting started",
      value: data.onboarding,
      note: "Employees with onboarding status",
      icon: UserPlus,
      color: "orange",
    },
    {
      label: "Departments",
      value: data.departments,
      note: "Teams building together",
      icon: Building2,
      color: "purple",
    },
  ];
  return (
    <>
      <PageHeading
        eyebrow="YOUR WORKSPACE, AT A GLANCE"
        title={`Hello, ${me?.displayName.split(" ")[0] ?? "there"}.`}
        description="Here’s the big picture of your people today."
        action={
          <div className="date-label">
            <CalendarDays size={16} />
            {new Intl.DateTimeFormat("en", {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            }).format(new Date(`${data.asOf}T00:00:00Z`))}
          </div>
        }
      />
      <section className="welcome-banner">
        <div className="welcome-content">
          <span className="banner-eyebrow">
            <span className="status-dot" /> THE PEOPLE BEHIND THE POSSIBILITIES
          </span>
          <h2>
            Good things happen
            <br />
            when people come together.
          </h2>
          <p>
            A connected view of {company?.name ?? "your organization"},
            <br className="desktop-break" /> with room for every person to
            thrive.
          </p>
          {canReadPeople && (
            <Link to="/app/people/employees" className="banner-link">
              Meet your people <ArrowRight size={16} />
            </Link>
          )}
        </div>
        <div className="banner-art" aria-hidden="true">
          <div className="art-ring ring-a" />
          <div className="art-ring ring-b" />
          <div className="art-card card-back">
            <div className="mini-avatar">MT</div>
            <span />
            <span />
          </div>
          <div className="art-card card-front">
            <div className="mini-avatar peach">LN</div>
            <div>
              <strong>People first.</strong>
              <span>Always connected.</span>
            </div>
            <div className="art-check">
              <Check size={15} />
            </div>
          </div>
          <span className="art-spark">
            <Sparkles size={25} />
          </span>
          <span className="art-leaf" />
        </div>
      </section>
      <section className="metrics" aria-label="Workforce summary">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <div className="metric-top">
              <span>{metric.label}</span>
              <div className={`metric-icon ${metric.color}`}>
                <metric.icon size={19} />
              </div>
            </div>
            <div className="metric-value">
              {metric.value.toLocaleString()}
            </div>
            <p>{metric.note}</p>
          </article>
        ))}
      </section>
      <div className="dashboard-grid">
        <section className="panel hiring-panel">
          <div className="panel-heading">
            <div>
              <h2>A growing story</h2>
              <p>Employee start dates, grouped by month</p>
            </div>
            <span className="subtle-badge">All recorded dates</span>
          </div>
          <div
            className="chart-container"
            role="img"
            aria-label={`Employee starts per month. ${data.hiring.map((item) => `${item.month}: ${item.count}`).join(", ")}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.hiring}
                margin={{ top: 15, right: 12, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="hiring-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#258d76" stopOpacity={0.22} />
                    <stop
                      offset="100%"
                      stopColor="#258d76"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="var(--border)"
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) =>
                    new Intl.DateTimeFormat("en", {
                      month: "short",
                      timeZone: "UTC",
                    }).format(new Date(`${String(value)}-01T00:00:00Z`))
                  }
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    color: "var(--text)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Employee starts"
                  stroke="#258d76"
                  strokeWidth={2.5}
                  fill="url(#hiring-fill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-footer">
            <span>
              <span className="legend-dot" /> Employee starts
            </span>
            <span>Source: employee directory</span>
          </div>
        </section>
        <section className="panel department-panel">
          <div className="panel-heading">
            <div>
              <h2>Better, together</h2>
              <p>Your people by department</p>
            </div>
            <Building2 size={19} className="muted" />
          </div>
          <div className="department-bars">
            {data.distribution.slice(0, 6).map((department, index) => (
              <div className="department-row" key={department.name}>
                <div>
                  <span>{department.name}</span>
                  <strong>{department.count}</strong>
                </div>
                <div className="bar-track">
                  <div
                    className={`bar-fill bar-${index % 3}`}
                    style={{
                      width: `${Math.max(2, data.employees ? (department.count / data.employees) * 100 * 4 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="panel-footnote">
            {data.distribution.length > 6
              ? `Showing 6 of ${data.departments} departments`
              : `${data.departments} departments in your workspace`}
          </p>
        </section>
      </div>
      <div className="dashboard-bottom">
        <section className="panel quick-links">
          <div className="panel-heading">
            <div>
              <h2>Make yourself at home</h2>
              <p>A few good places to start</p>
            </div>
            <ArrowUpRight size={20} className="muted" />
          </div>
          <div className="quick-link-grid">
            {canReadPeople && (
              <Link to="/app/people/employees">
                <div className="quick-icon green">
                  <Users size={20} />
                </div>
                <div>
                  <strong>Explore your people</strong>
                  <span>Find the right person, faster</span>
                </div>
                <ArrowRight size={17} />
              </Link>
            )}
            <Link to="/app/settings/company">
              <div className="quick-icon blue">
                <Building2 size={20} />
              </div>
              <div>
                <strong>Your company details</strong>
                <span>A workspace that feels like you</span>
              </div>
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
        <section className="security-card">
          <div className="security-icon">
            <ShieldCheck size={23} />
          </div>
          <div>
            <h2>A little peace of mind.</h2>
            <p>
              Your workspace access is scoped to your role and organization.
            </p>
            {me?.permissions.includes("roles:read") && (
              <Button asChild variant="ghost">
                <Link to="/app/settings/roles">
                  View permissions <ArrowRight size={15} />
                </Link>
              </Button>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
