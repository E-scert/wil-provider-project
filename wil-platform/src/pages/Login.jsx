import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { Card, Field, Input, Button } from "../components/ui.jsx";

export default function Login() {
  const { session } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // already logged in — no need to see the login form again
  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn({ email, password });
      toast.success("Welcome back.");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm animate-riseIn">
        <div className="mb-8 text-center">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-tut-red shadow-redGlow" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-white">
            WIL CONNECT<span className="text-tut-red">.</span>
          </h1>
          <p className="mt-1.5 text-sm text-white/45">
            Log in to your account.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email">
              <Input
                type="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <Button type="submit" disabled={busy}>
              {busy ? "…" : "Log in"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-white/35">
            New here?{" "}
            <Link
              to="/signup/student"
              className="text-tut-red underline underline-offset-2"
            >
              Sign up as a student
            </Link>{" "}
            or{" "}
            <Link
              to="/signup/company"
              className="text-tut-red underline underline-offset-2"
            >
              as a company
            </Link>
            .
          </p>
        </Card>

        <p className="mt-6 text-center">
          <Link
            to="/programs"
            className="text-xs text-white/30 underline underline-offset-2 hover:text-white/50"
          >
            ← browse open programs without logging in
          </Link>
        </p>
      </div>
    </div>
  );
}
