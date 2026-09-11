"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  CheckCircleFilled,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Alert, App, Button, Card, Descriptions, Form, Input, Space } from "antd";

export default function AdminSettingsPage() {
  const { message } = App.useApp();
  const { admin, changePassword, isChangingPassword } = useAuth();
  const [form] = Form.useForm();

  const onPasswordFinish = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("New passwords do not match");
      return;
    }

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      message.success(
        "Password changed successfully! Old sessions have been revoked.",
      );
      form.resetFields();
    } catch (err: any) {
      message.error(
        err?.message ||
          "Failed to change password. Please check your current password.",
      );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Account Info */}
      <Card
        title={<span style={{ fontWeight: 600 }}>Account Profile</span>}
        variant="borderless"
        style={{ borderRadius: "12px" }}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label={<Space><MailOutlined /> Admin Email</Space>}>
            {admin?.email}
          </Descriptions.Item>
          <Descriptions.Item label={<Space><UserOutlined /> Role</Space>}>
            <span style={{ textTransform: "capitalize" }}>{admin?.role}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<Space><SafetyCertificateOutlined /> Session Security</Space>}>
            Your session is secured with automatic encryption and refresh
          </Descriptions.Item>
          <Descriptions.Item label={<Space><CheckCircleFilled style={{ color: "#52c41a" }} /> Studio Status</Space>}>
            Active
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Change Password */}
      <Card
        title={<span style={{ fontWeight: 600 }}>Security & Password</span>}
        variant="borderless"
        style={{ borderRadius: "12px" }}
      >
        <Alert
          title="Changing your password will automatically invalidate all existing refresh sessions."
          type="info"
          showIcon
          style={{ marginBottom: "20px" }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={onPasswordFinish}
          style={{ maxWidth: "440px" }}
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[
              { required: true, message: "Please enter your current password" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••••••••"
            />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please enter a new password" },
              {
                min: 8,
                message: "Password must be at least 8 characters long",
              },
            ]}
          >
            <Input.Password
              prefix={<SafetyCertificateOutlined />}
              placeholder="••••••••••••"
            />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match"),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<SafetyCertificateOutlined />}
              placeholder="••••••••••••"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: "24px", marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isChangingPassword}
              style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
            >
              Update Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
