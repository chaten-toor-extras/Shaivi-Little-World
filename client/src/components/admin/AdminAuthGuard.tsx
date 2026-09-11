"use client";

import { useAuth } from "@/hooks/useAuth";
import { Spin } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, isLoading } = useAuth();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoading) return;

    if (!admin && !isLoginPage) {
      router.replace("/admin/login");
    } else if (admin && isLoginPage) {
      router.replace("/admin");
    }
  }, [admin, isLoading, isLoginPage, router]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f4ee",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <Spin size="large" />
        <p style={{ marginTop: "1rem", color: "#706773", fontSize: "0.9rem" }}>
          Checking access to Shaivi&apos;s Little World…
        </p>
      </div>
    );
  }

  // If not authenticated and trying to view admin page (other than login), show loader while redirecting
  if (!admin && !isLoginPage) {
    return null;
  }

  // If authenticated and on login page, wait for redirect
  if (admin && isLoginPage) {
    return null;
  }

  return <>{children}</>;
}
