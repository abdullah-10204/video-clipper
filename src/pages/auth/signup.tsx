// src/pages/auth/signup.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDIO" | "AGENCY" | "EDITOR">("STUDIO");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Signup failed");
      return;
    }

    // auto sign in after signup
    const signRes = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (signRes?.error) {
      setError("Signup succeeded but signin failed. Go to login.");
      router.push("/auth/login");
      return;
    }

    // fetch session to know role and redirect
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    if (session.role === "STUDIO") router.push("/studio/dashboard");
    else if (session.role === "AGENCY") router.push("/agency/dashboard");
    else if (session.role === "EDITOR") router.push("/editor/dashboard");
    else router.push("/");
  };

  return (
    <div style={{ maxWidth: 480, margin: "50px auto" }}>
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          required
        />
        <br />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          required
        />
        <br />
        <select value={role} onChange={(e) => setRole(e.target.value as any)}>
          <option value="STUDIO">Studio</option>
          <option value="AGENCY">Agency</option>
          <option value="EDITOR">Editor</option>
        </select>
        <br />
        <button type="submit">Sign up</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
