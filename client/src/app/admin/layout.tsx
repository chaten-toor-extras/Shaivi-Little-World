"use client";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { App, ConfigProvider, theme as antTheme } from "antd";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function RootAdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <ConfigProvider
      theme={{
        algorithm: antTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#8a6d79",
          colorInfo: "#8a6d79",
          colorBgBase: "#ffffff",
          colorTextBase: "#3d3745",
          borderRadius: 8,
          fontFamily:
            "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        },
      }}
    >
      <App>
        <AdminAuthGuard>
          {isLogin ? children : <AdminLayout>{children}</AdminLayout>}
        </AdminAuthGuard>
      </App>
    </ConfigProvider>
  );
}
