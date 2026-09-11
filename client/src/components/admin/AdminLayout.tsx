"use client";

import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/admin.service";
import {
  CloudOutlined,
  CompassOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  ExportOutlined,
  GlobalOutlined,
  InboxOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuOutlined,
  MessageOutlined,
  PictureOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Badge, Button, Drawer, Dropdown, Layout, Menu } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Prefetch all admin routes for instant client-side transitions
    const routes = [
      "/admin",
      "/admin/world",
      "/admin/site",
      "/admin/artist",
      "/admin/quotes",
      "/admin/gallery",
      "/admin/journey",
      "/admin/music",
      "/admin/contact",
      "/admin/letters",
      "/admin/settings",
    ];
    routes.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  // Unread letters badge
  const { data: stats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: adminService.getDashboardStats,
    refetchInterval: 30000,
  });

  const unreadCount = stats?.unreadLetters || 0;

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/world",
      icon: <CloudOutlined />,
      label: "3D World CMS",
    },
    {
      key: "/admin/site",
      icon: <GlobalOutlined />,
      label: "Site Settings",
    },
    {
      key: "/admin/artist",
      icon: <UserOutlined />,
      label: "Artist Profile",
    },
    {
      key: "/admin/quotes",
      icon: <MessageOutlined />,
      label: "Quotes TV",
    },
    {
      key: "/admin/gallery",
      icon: <PictureOutlined />,
      label: "Art Gallery",
    },
    {
      key: "/admin/journey",
      icon: <CompassOutlined />,
      label: "Star Journey",
    },
    {
      key: "/admin/music",
      icon: <CustomerServiceOutlined />,
      label: "Music & Moods",
    },
    {
      key: "/admin/contact",
      icon: <MailOutlined />,
      label: "Contact Copy",
    },
    {
      key: "/admin/letters",
      icon: (
        <Badge count={unreadCount} size="small" offset={[6, 0]}>
          <InboxOutlined />
        </Badge>
      ),
      label: `Letters ${unreadCount > 0 ? `(${unreadCount})` : ""}`,
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: "Account Settings",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key && key.startsWith("/admin") && key !== pathname) {
      router.push(key);
      if (isMobile) {
        setMobileOpen(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/admin/login");
    } catch {
      router.replace("/admin/login");
    }
  };

  const userMenuItems = [
    {
      key: "email",
      disabled: true,
      label: (
        <span style={{ color: "#706773", fontSize: "0.85rem" }}>
          {admin?.email}
        </span>
      ),
    },
    {
      type: "divider" as const,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: <Link href="/admin/settings">Settings</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      danger: true,
      label: "Log out",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#fbf8f3" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          width={240}
          style={{
            background: "#faf6f0",
            borderRight: "1px solid rgba(64, 62, 69, 0.08)",
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderBottom: "1px solid rgba(64, 62, 69, 0.06)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#8a6d79",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              s✳
            </div>
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "#3d3745",
                }}
              >
                Shaivi&apos;s CMS
              </div>
              <div style={{ fontSize: "0.75rem", color: "#8a7f8e" }}>
                Little World Studio
              </div>
            </div>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              background: "transparent",
              borderRight: 0,
              padding: "12px 8px",
            }}
          />
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          title="Shaivi's Little World CMS"
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          styles={{ wrapper: { width: 280 }, body: { padding: "8px 0" } }}
        >
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ borderRight: 0 }}
          />
        </Drawer>
      )}

      {/* Main Area */}
      <Layout style={{ background: "transparent" }}>
        <Header
          style={{
            background: "#faf6f0",
            borderBottom: "1px solid rgba(64, 62, 69, 0.08)",
            padding: isMobile ? "0 16px" : "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              />
            )}
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? "1rem" : "1.15rem",
                fontWeight: 600,
                color: "#3d3745",
              }}
            >
              {pathname === "/admin"
                ? "Dashboard"
                : pathname
                    .replace("/admin/", "")
                    .replace("-", " ")
                    .toUpperCase()}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Button
              type="dashed"
              size="small"
              icon={<ExportOutlined />}
              onClick={() => window.open("/", "_blank")}
            >
              {!isMobile && "View Public World"}
            </Button>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <Avatar
                  style={{ backgroundColor: "#8a6d79" }}
                  icon={<UserOutlined />}
                />
                {!isMobile && (
                  <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    {admin?.email?.split("@")[0]}
                  </span>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            padding: isMobile ? "14px 12px 28px" : "28px 32px",
            maxWidth: "1200px",
            width: "100%",
            margin: "0 auto",
            overflowX: "hidden",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
