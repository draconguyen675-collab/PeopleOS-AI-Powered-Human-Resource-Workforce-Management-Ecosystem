import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Check, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { login } from "../../services/api";
import { Button } from "../../components/ui/button";

const loginSchema = z.object({
  workspace: z
    .string()
    .trim()
    .min(1, "Enter your workspace.")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens."),
  email: z.email("Enter a valid work email.").max(254),
  password: z.string().min(1, "Enter your password.").max(72),
});
export default function LoginPage() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { workspace: "novatech", email: "", password: "" },
  });
  const submit = handleSubmit(async (values) => {
    setError("");
    try {
      await login(values.workspace, values.email, values.password);
      client.clear();
      navigate("/app/dashboard", { replace: true });
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Sign-in failed. Please try again.",
      );
    }
  });
  return (
    <main className="login-page">
      <section className="login-story">
        <a href="/" className="brand">
          <img src="/favicon.svg" alt="" />
          People<span>OS</span>
        </a>
        <div className="login-copy">
          <span className="pill">MADE FOR YOUR PEOPLE</span>
          <h1>
            Great work
            <br />
            starts with
            <br />
            <em>connected people.</em>
          </h1>
          <p>
            A clearer view of your organization.
            <br />
            More space for the people who make it.
          </p>
          <div className="story-illustration" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit-center">
              <img src="/favicon.svg" alt="" />
            </div>
            <span className="person-dot dot-one">LN</span>
            <span className="person-dot dot-two">MT</span>
            <span className="person-dot dot-three">AL</span>
            <span className="connection-tag">
              <Check size={14} /> Better together
            </span>
          </div>
        </div>
        <p className="login-footer">One workspace. A world of potential.</p>
      </section>
      <section className="login-form-section">
        <div className="login-form">
          <div className="eyebrow">YOUR PEOPLE WORKSPACE</div>
          <h2>Welcome back.</h2>
          <p className="muted">Sign in to keep your people moving forward.</p>
          <form onSubmit={submit} noValidate>
            <label htmlFor="workspace">Workspace</label>
            <input
              id="workspace"
              autoComplete="organization"
              {...register("workspace")}
              aria-invalid={!!errors.workspace}
              aria-describedby={
                errors.workspace ? "workspace-error" : undefined
              }
            />
            {errors.workspace && (
              <small id="workspace-error" className="field-error">
                {errors.workspace.message}
              </small>
            )}
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="username"
              {...register("email")}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <small id="email-error" className="field-error">
                {errors.email.message}
              </small>
            )}
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                id="password"
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                {...register("password")}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                aria-label={visible ? "Hide password" : "Show password"}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <small id="password-error" className="field-error">
                {errors.password.message}
              </small>
            )}
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="login-submit"
            >
              {isSubmitting ? "Signing in…" : "Sign in to your workspace"}
              <ArrowRight size={17} />
            </Button>
          </form>
          <div className="secure-note">
            <ShieldCheck size={17} />
            <span>Your workspace uses a secure, private session.</span>
          </div>
          <div className="demo-note">
            <strong>Exploring the local demo?</strong>
            <p>
              Use workspace <code>novatech</code>, email{" "}
              <code>owner@example.test</code>, and the demo password configured
              during setup.
            </p>
          </div>
        </div>
        <p className="login-bottom">
          PeopleOS · Thoughtfully built for people.
        </p>
      </section>
    </main>
  );
}
