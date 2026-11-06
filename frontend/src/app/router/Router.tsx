import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  Link,
} from "react-router-dom";
import { useMe } from "../../services/queries";
import { ApiError } from "../../services/api";
import { ErrorState, Loading } from "../../components/common/Feedback";
import { Button } from "../../components/ui/button";

const AppShell = lazy(() => import("../layouts/AppShell"));
const Login = lazy(() => import("../../features/auth/LoginPage"));
const Dashboard = lazy(() => import("../../features/dashboard/DashboardPage"));
const Employees = lazy(() => import("../../features/employees/EmployeesPage"));
const EmployeeDetail = lazy(
  () => import("../../features/employees/EmployeeDetailPage"),
);
const EmployeeEditor = lazy(
  () => import("../../features/employees/EmployeeEditorPage"),
);
const Company = lazy(() => import("../../features/settings/CompanyPage"));
const Roles = lazy(() => import("../../features/settings/RolesPage"));
const Audit = lazy(() => import("../../features/settings/AuditPage"));
const Security = lazy(() => import("../../features/settings/SecurityPage"));
const Departments = lazy(
  () => import("../../features/organization/DepartmentsPage"),
);
const Positions = lazy(
  () => import("../../features/organization/PositionsPage"),
);

function Protected() {
  const me = useMe();
  if (me.isPending) return <Loading />;
  if (me.error instanceof ApiError && me.error.status === 401)
    return <Navigate to="/auth/login" replace />;
  if (me.error)
    return <ErrorState error={me.error} retry={() => void me.refetch()} />;
  return <Outlet />;
}
function NotFound() {
  return (
    <div className="not-found">
      <h1>This page isn’t here.</h1>
      <p>Let’s get you back to your workspace.</p>
      <Button asChild>
        <Link to="/app/dashboard">Back to overview</Link>
      </Button>
    </div>
  );
}
const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/app/dashboard" replace /> },
  { path: "/auth/login", element: <Login /> },
  {
    element: <Protected />,
    children: [
      {
        path: "/app",
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "people/employees", element: <Employees /> },
          { path: "people/departments", element: <Departments /> },
          { path: "people/positions", element: <Positions /> },
          { path: "people/employees/new", element: <EmployeeEditor /> },
          { path: "people/employees/:id", element: <EmployeeDetail /> },
          { path: "people/employees/:id/edit", element: <EmployeeEditor /> },
          { path: "settings/company", element: <Company /> },
          { path: "settings/roles", element: <Roles /> },
          { path: "settings/audit", element: <Audit /> },
          { path: "settings/security", element: <Security /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
export function Router() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
