"use client";

import AdminImageUpload from "@/components/admin/AdminImageUpload";
import { adminService } from "@/services/admin.service";
import type { ArtistContent, PhotoData } from "@/types";
import {
  MinusCircleOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Col, Form, Input, Row, Skeleton, Tag } from "antd";
import { useEffect, useState } from "react";

export default function AdminArtistPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [portrait, setPortrait] = useState<PhotoData | null>(null);
  const [smallImage, setSmallImage] = useState<PhotoData | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [inputTagVisible, setInputTagVisible] = useState(false);
  const [inputTagValue, setInputTagValue] = useState("");

  const { data: artist, isLoading } = useQuery({
    queryKey: ["adminArtist"],
    queryFn: adminService.getArtist,
  });

  useEffect(() => {
    if (artist) {
      form.setFieldsValue(artist);
      setPortrait(artist.portrait || null);
      setSmallImage(artist.smallImage || null);
      setTags(artist.tags || []);
    }
  }, [artist, form]);

  const updateMutation = useMutation({
    mutationFn: (values: Partial<ArtistContent>) =>
      adminService.updateArtist(values),
    onSuccess: () => {
      message.success("Artist profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminArtist"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
    onError: (err: any) => {
      message.error(err?.message || "Failed to update artist profile.");
    },
  });

  const onFinish = (values: any) => {
    const sanitizeImage = (img: any) => {
      if (!img) return undefined;
      const src = img.src || img.url || img.secureUrl;
      if (!src) return undefined;
      return {
        src,
        url: src,
        alt: img.alt || "Artist image",
        source: img.source || "",
        credit: img.credit || "",
      };
    };

    updateMutation.mutate({
      ...values,
      portrait: sanitizeImage(portrait),
      smallImage: sanitizeImage(smallImage),
      tags,
    });
  };

  const handleTagClose = (removedTag: string) => {
    setTags(tags.filter((t) => t !== removedTag));
  };

  const handleTagConfirm = () => {
    if (inputTagValue && !tags.includes(inputTagValue)) {
      setTags([...tags, inputTagValue]);
    }
    setInputTagVisible(false);
    setInputTagValue("");
  };

  return (
    <Card
      title={<span style={{ fontWeight: 600 }}>Artist Profile</span>}
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
        initialValues={artist}
        style={{ display: isLoading ? "none" : "block" }}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Artist Name"
              name="name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input placeholder="Shaivi" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Role / Title"
              name="label"
              rules={[{ required: true, message: "Label is required" }]}
            >
              <Input placeholder="Artist / Visual Explorer" />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item label="Short Caption" name="caption">
              <Input placeholder="Collecting small details, quiet ideas..." />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item label="Biography" name="bio">
              <Input.TextArea
                rows={4}
                placeholder="A creative mind interested in..."
              />
            </Form.Item>
          </Col>

          {/* Media Section */}
          <Col xs={24} md={12}>
            <Form.Item label="Main Portrait Photo">
              <AdminImageUpload
                value={portrait}
                onChange={setPortrait}
                folder="artist"
                aspectRatio="3 / 4"
                recommendedSize="1000 × 1333"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Small Decorative Photo (Bottom Right of Frame)">
              <AdminImageUpload
                value={smallImage}
                onChange={setSmallImage}
                folder="artist"
                aspectRatio="1 / 1"
                recommendedSize="600 × 600"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Annotation Text (Tilted Handwriting)">
              <Input.TextArea
                rows={2}
                placeholder="always noticing&#10;the little things ↗"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Section Kicker">
              <Input placeholder="MEET THE ARTIST / PROFILE" />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item label="Portrait Note / Disclaimer" name="note">
              <Input placeholder="Demo artist profile · replace with Shaivi's own story and portrait." />
            </Form.Item>
          </Col>
        </Row>

        {/* Tags */}
        <div style={{ marginTop: "12px", marginBottom: "20px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            Artist Tags
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              alignItems: "center",
            }}
          >
            {tags.map((tag) => (
              <Tag
                key={tag}
                closable
                onClose={() => handleTagClose(tag)}
                style={{ padding: "4px 10px", fontSize: "0.85rem" }}
              >
                {tag}
              </Tag>
            ))}
            {inputTagVisible ? (
              <Input
                type="text"
                size="small"
                style={{ width: 100 }}
                value={inputTagValue}
                onChange={(e) => setInputTagValue(e.target.value)}
                onBlur={handleTagConfirm}
                onPressEnter={handleTagConfirm}
                autoFocus
              />
            ) : (
              <Tag
                onClick={() => setInputTagVisible(true)}
                style={{
                  background: "#fff",
                  borderStyle: "dashed",
                  cursor: "pointer",
                  padding: "4px 10px",
                }}
              >
                <PlusOutlined /> New Tag
              </Tag>
            )}
          </div>
        </div>

        {/* Dynamic Detail Rows */}
        <div style={{ marginTop: "12px", marginBottom: "20px" }}>
          <h4 style={{ color: "#3d3745", marginBottom: "12px" }}>
            Artist Details (Key / Value pairs)
          </h4>
          <Form.List name="details">
            {(fields, { add, remove }) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {fields.map(({ key, name, ...restField }) => (
                  <Row
                    key={key}
                    gutter={[12, 8]}
                    align="middle"
                    style={{
                      background: "rgba(64, 62, 69, 0.03)",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <Col xs={24} sm={9}>
                      <Form.Item
                        {...restField}
                        name={[name, "label"]}
                        rules={[{ required: true, message: "Label required" }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Label (e.g. Based in)" />
                      </Form.Item>
                    </Col>
                    <Col xs={20} sm={13}>
                      <Form.Item
                        {...restField}
                        name={[name, "value"]}
                        rules={[{ required: true, message: "Value required" }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Value (e.g. Earth)" />
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
                        aria-label="Remove detail row"
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
                    Add Detail Row
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
            Save Profile
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
