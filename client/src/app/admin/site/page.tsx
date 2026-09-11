"use client";

import { adminService } from "@/services/admin.service";
import type { SiteSettings } from "@/types";
import {
  MinusCircleOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Col, Form, Input, Row, Skeleton } from "antd";
import { useEffect } from "react";

export default function AdminSiteSettingsPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["adminSiteSettings"],
    queryFn: adminService.getSiteSettings,
  });

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        ...settings,
        secretMessages: settings.secretMessages || [],
      });
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: (values: Partial<SiteSettings>) =>
      adminService.updateSiteSettings(values),
    onSuccess: () => {
      message.success("Site settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminSiteSettings"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
    onError: (err: any) => {
      message.error(err?.message || "Failed to update site settings.");
    },
  });

  const onFinish = (values: any) => {
    updateMutation.mutate(values);
  };

  return (
    <Card
      title={<span style={{ fontWeight: 600 }}>Global Site Settings</span>}
      variant="borderless"
      style={{ borderRadius: "12px" }}
    >
      {isLoading && (
        <div style={{ padding: "16px 0" }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={settings}
        style={{ display: isLoading ? "none" : "block" }}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Website Title"
              name="title"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input placeholder="Shaivi's Little World" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Wordmark Symbol" name="wordmark">
              <Input placeholder="s✳" />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item label="Meta Description" name="description">
              <Input.TextArea
                rows={2}
                placeholder="A small world for big ideas..."
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Intro Heading" name="introHeading">
              <Input placeholder="Shaivi's little world." />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Intro Subtext (Welcome)" name="introSubtext">
              <Input placeholder="Welcome to Shaivi's little world." />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item label="Intro Description" name="introDescription">
              <Input.TextArea
                rows={2}
                placeholder="A place for ideas, daydreams..."
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Explore Button Label" name="exploreLabel">
              <Input placeholder="Explore" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Discovery Counter Label" name="discoveryLabel">
              <Input placeholder="little discoveries" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Footer Text (Island View)" name="footerWorldText">
              <Input placeholder="Follow your curiosity." />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Footer Text (Explore View)"
              name="footerExploreText"
            >
              <Input placeholder="A little closer." />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Footer Instruction (Island)"
              name="footerWorldInstruction"
            >
              <Input placeholder="Tap an object to explore · drag to look around" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Footer Instruction (Explore)"
              name="footerExploreInstruction"
            >
              <Input placeholder="Take your time. There's more to discover." />
            </Form.Item>
          </Col>
        </Row>

        {/* Butterfly Secret Messages */}
        <div style={{ marginTop: "16px", marginBottom: "16px" }}>
          <h4 style={{ color: "#3d3745", marginBottom: "12px" }}>
            Butterfly Secret Facts (Found by clicking the golden butterfly 3
            times)
          </h4>
          <Form.List name="secretMessages">
            {(fields, { add, remove }) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {fields.map(({ key, name, ...restField }) => (
                  <Row
                    key={key}
                    gutter={[12, 8]}
                    align="middle"
                    style={{
                      background: "rgba(64, 62, 69, 0.03)",
                      padding: "10px 12px",
                      borderRadius: "8px",
                    }}
                  >
                    <Col xs={20} sm={22}>
                      <Form.Item
                        {...restField}
                        name={[name]}
                        rules={[
                          {
                            required: true,
                            message: "Secret fact text required",
                          },
                        ]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Secret fact..." />
                      </Form.Item>
                    </Col>
                    <Col xs={4} sm={2} style={{ textAlign: "center" }}>
                      <Button
                        type="text"
                        danger
                        icon={
                          <MinusCircleOutlined style={{ fontSize: "18px" }} />
                        }
                        onClick={() => remove(name)}
                        aria-label="Remove secret fact"
                      />
                    </Col>
                  </Row>
                ))}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Secret Message
                  </Button>
                </Form.Item>
              </div>
            )}
          </Form.List>
        </div>

        <Form.Item style={{ marginTop: "24px" }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={updateMutation.isPending}
            style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
