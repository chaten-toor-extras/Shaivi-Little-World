"use client";

import { useAuth } from "@/hooks/useAuth";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onFinish = async (values: { email: string; password: string }) => {
    setErrorMsg(null);
    try {
      await login(values);
      router.replace("/admin");
    } catch (err: any) {
      if (
        err?.message?.includes("429") ||
        err?.message?.toLowerCase().includes("too many")
      ) {
        setErrorMsg(
          "Too many login attempts. Please wait 15 minutes before trying again.",
        );
      } else {
        setErrorMsg(err?.message || "Invalid email or password.");
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f7f3ee 0%, #efe7f0 50%, #f4eee6 100%)",
        padding: "20px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "#8a6d79",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "20px",
            boxShadow: "0 4px 12px rgba(138, 109, 121, 0.25)",
            marginBottom: "12px",
          }}
        >
          s✳
        </div>
        <h1
          style={{
            fontFamily: "'Italiana', serif",
            fontSize: "1.75rem",
            fontWeight: 400,
            color: "#3d3745",
            margin: 0,
          }}
        >
          Shaivi&apos;s Little World
        </h1>
        <p style={{ color: "#706773", fontSize: "0.85rem", marginTop: "4px" }}>
          Studio Content Management Portal
        </p>
      </div>

      <Card
        variant="borderless"
        style={{
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 10px 30px rgba(64, 62, 69, 0.08)",
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(10px)",
        }}
      >
        {errorMsg && (
          <Alert
            title={errorMsg}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMsg(null)}
            style={{ marginBottom: "20px", borderRadius: "8px" }}
          />
        )}

        <Form
          layout="vertical"
          name="admin_login"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            label={
              <span style={{ fontWeight: 500, color: "#3d3745" }}>Email</span>
            }
            name="email"
            rules={[
              { required: true, message: "Please enter your admin email" },
              {
                type: "email",
                message: "Please enter a valid email address",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#8a7f8e" }} />}
              placeholder="admin@example.com"
              size="large"
              disabled={isLoggingIn}
            />
          </Form.Item>

          <Form.Item
            label={
              <span style={{ fontWeight: 500, color: "#3d3745" }}>
                Password
              </span>
            }
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#8a7f8e" }} />}
              placeholder="••••••••••••"
              size="large"
              disabled={isLoggingIn}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: "24px", marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoggingIn}
              style={{
                height: "44px",
                fontWeight: 600,
                background: "#8a6d79",
                borderColor: "#8a6d79",
              }}
            >
              Sign in to Studio
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <div style={{ marginTop: "24px", fontSize: "0.8rem", color: "#8a7f8e" }}>
        Authorized studio access only · Protected by JWT HttpOnly sessions
      </div>
    </div>
  );
}
