import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpCompany } from "../api/auth.js";
import { useToast } from "../context/ToastContext.jsx";
import { Card, Field, Input, Textarea, Button } from "../components/ui.jsx";

export default function SignupCompany() {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    compName: "",
    email: "",
    password: "",
    compDescription: "",
  });
  const [busy, setBusy] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await signUpCompany(form);
      if (result.emailConfirmationRequired) {
        toast.info(
          "Check your email to confirm your account, then log in — your profile will finish setting up automatically.",
        );
        navigate("/login");
      } else {
        toast.success("Company account and profile created.");
        navigate("/"); // already logged in — go straight to the dashboard
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center px-5 py-10">
      <div className="w-full max-w-md animate-riseIn">
        <div className="mb-8 text-center">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-tut-red shadow-redGlow" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-white">
            WIL CONNECT<span className="text-tut-red">.</span>
          </h1>
          <p className="mt-1.5 text-sm text-white/45">Register your company.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Company name">
              <Input
                required
                value={form.compName}
                onChange={set("compName")}
              />
            </Field>
            <Field label="Company email" hint="Used to log in">
              <Input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
              />
            </Field>
            <Field label="Description">
              <Textarea
                rows={3}
                value={form.compDescription}
                onChange={set("compDescription")}
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={set("password")}
              />
            </Field>
            <Button type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create company account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-white/35">
            Already registered?{" "}
            <Link
              to="/login"
              className="text-tut-red underline underline-offset-2"
            >
              Log in
            </Link>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}
