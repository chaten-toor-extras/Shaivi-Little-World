"use client";

import { adminService } from "@/services/admin.service";
import type { ContactSettings } from "@/types";
import { SaveOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Col, Form, Input, Row, Skeleton } from "antd";
import { useEffect } from "react";

export default function AdminContactSettingsPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { data: contact, isLoading } = useQuery({
    queryKey: ["adminContactSettings"],
    queryFn: adminService.getContactSettings,
  });

  useEffect(() => {
    if (contact) {
      form.setFieldsValue(contact);
    }
  }, [contact, form]);

  const updateMutation = useMutation({
    mutationFn: (values: Partial<ContactSettings>) =>
      adminService.updateContactSettings(values),
    onSuccess: () => {
      message.success("Contact copy updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminContactSettings"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
    onError: (err: any) => {
      message.error(err?.message || "Failed to update contact settings.");
    },
  });

  const onFinish = (values: any) => {
    updateMutation.mutate(values);
  };

  return (
    <Card
      title={
        <span style={{ fontWeight: 600 }}>Post Office / Contact Form Copy</span>
      }
      variant="borderless"
      style={{ borderRadius: "12px" }}
    >
      {isLoading && (
        <div style={{ padding: "16px 0" }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={contact}
        style={{ display: isLoading ? "none" : "block" }}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Heading"
              name="heading"
              rules={[{ required: true, message: "Heading is required" }]}
            >
              <Input placeholder="Leave a little note." />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Contact Email Display"
              name="email"
              rules={[{ required: true, message: "Email is required" }]}
            >
              <Input placeholder="hello@example.com" />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item label="Introductory Text" name="intro">
              <Input.TextArea
                rows={2}
                placeholder="For a small idea, a big daydream, or just a hello."
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Handwritten Note Text" name="handwrittenNote">
              <Input.TextArea
                rows={2}
                placeholder="some things are better&#10;written down."
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Signoff Prefix" name="signoff">
              <Input placeholder="With a little curiosity," />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item label="Name Field Label" name={["fieldLabels", "name"]}>
              <Input placeholder="Your name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Email Field Label"
              name={["fieldLabels", "email"]}
            >
              <Input placeholder="Your email" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Message Field Label"
              name={["fieldLabels", "message"]}
            >
              <Input placeholder="Your little note" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Submit Button Label" name="buttonText">
              <Input placeholder="Post Letter" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Success Message" name="successMessage">
              <Input placeholder="Your letter has been placed in the mailbox." />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              label="Footer Disclaimer / Privacy Note"
              name="disclaimer"
            >
              <Input.TextArea
                rows={2}
                placeholder="Your letters are delivered directly to Shaivi's private studio inbox."
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: "20px" }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={updateMutation.isPending}
            style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
          >
            Save Contact Copy
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
