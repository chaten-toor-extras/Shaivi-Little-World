"use client";

import AdminImageUpload from "@/components/admin/AdminImageUpload";
import { adminService } from "@/services/admin.service";
import type { Artwork, PhotoData } from "@/types";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Image as AntImage,
  App,
  Button,
  Card,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tooltip,
} from "antd";
import { useState } from "react";

export default function AdminGalleryPage() {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [image, setImage] = useState<PhotoData | null>(null);
  const [form] = Form.useForm();

  const { data: artworks = [], isLoading } = useQuery({
    queryKey: ["adminArtworks"],
    queryFn: adminService.getArtworks,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Artwork>) => adminService.createArtwork(data),
    onSuccess: () => {
      message.success("Artwork added successfully");
      queryClient.invalidateQueries({ queryKey: ["adminArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
      setModalOpen(false);
      form.resetFields();
      setImage(null);
    },
    onError: (err: any) =>
      message.error(err?.message || "Failed to create artwork"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Artwork> }) =>
      adminService.updateArtwork(id, data),
    onSuccess: () => {
      message.success("Artwork updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
      setModalOpen(false);
      setEditingArtwork(null);
      form.resetFields();
      setImage(null);
    },
    onError: (err: any) =>
      message.error(err?.message || "Failed to update artwork"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteArtwork(id),
    onSuccess: () => {
      message.success("Artwork deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
    onError: (err: any) =>
      message.error(err?.message || "Failed to delete artwork"),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; order: number }[]) =>
      adminService.reorderArtworks(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
  });

  const handleEdit = (art: Artwork) => {
    setEditingArtwork(art);
    setImage(art.image);
    form.setFieldsValue({
      ...art,
      positionX: art.initialPosition?.x ?? 20,
      positionY: art.initialPosition?.y ?? 20,
    });
    setModalOpen(true);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= artworks.length) return;

    const newArtworks = [...artworks];
    const [moved] = newArtworks.splice(index, 1);
    newArtworks.splice(targetIndex, 0, moved);

    const reordered = newArtworks.map((a, i) => ({ id: a._id, order: i }));
    reorderMutation.mutate(reordered);
  };

  const onFinish = (values: any) => {
    if (!image) {
      message.error("Please upload an image for the artwork");
      return;
    }

    const payload = {
      title: values.title,
      year: values.year,
      caption: values.caption,
      image,
      isPublished: values.isPublished,
      initialPosition: {
        x: values.positionX || 20,
        y: values.positionY || 20,
      },
      rotation: values.rotation || 0,
      scale: values.scale || 1,
    };

    if (editingArtwork) {
      updateMutation.mutate({ id: editingArtwork._id, data: payload });
    } else {
      createMutation.mutate({ ...payload, order: artworks.length });
    }
  };

  const columns = [
    {
      title: "Order",
      key: "order",
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Space size="small">
          <Button
            size="small"
            icon={<ArrowUpOutlined />}
            disabled={index === 0}
            onClick={() => handleMove(index, "up")}
          />
          <Button
            size="small"
            icon={<ArrowDownOutlined />}
            disabled={index === artworks.length - 1}
            onClick={() => handleMove(index, "down")}
          />
        </Space>
      ),
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 80,
      render: (img: PhotoData) => (
        <AntImage
          src={img?.src}
          alt={img?.alt || "Artwork thumbnail"}
          width={50}
          height={40}
          style={{ objectFit: "cover", borderRadius: "4px" }}
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: Artwork) => (
        <div>
          <div style={{ fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: "0.75rem", color: "#8a7f8e" }}>
            {record.year}
          </div>
        </div>
      ),
    },
    {
      title: "Caption",
      dataIndex: "caption",
      key: "caption",
      ellipsis: true,
    },
    {
      title: "Published",
      dataIndex: "isPublished",
      key: "isPublished",
      width: 90,
      render: (pub: boolean, record: Artwork) => (
        <Switch
          checked={pub}
          size="small"
          onChange={(checked) =>
            updateMutation.mutate({
              id: record._id,
              data: { isPublished: checked },
            })
          }
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_: any, record: Artwork) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: "Edit Artwork",
                icon: <EditOutlined />,
                onClick: () => handleEdit(record),
              },
              {
                type: "divider",
              },
              {
                key: "delete",
                label: "Delete Artwork",
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => {
                  modal.confirm({
                    title: "Delete artwork?",
                    content: "This will remove the artwork and its image.",
                    okText: "Delete",
                    okType: "danger",
                    onOk: () => deleteMutation.mutate(record._id),
                  });
                },
              },
            ],
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Tooltip title="Actions">
            <Button size="small" type="text" icon={<MoreOutlined style={{ fontSize: "16px" }} />} />
          </Tooltip>
        </Dropdown>
      ),
    },
  ];

  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600 }}>
            Art Workspace Studies ({artworks.length})
          </span>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingArtwork(null);
              setImage(null);
              form.resetFields();
              form.setFieldsValue({
                isPublished: true,
                year: new Date().getFullYear(),
                positionX: Math.floor(Math.random() * 60) + 10,
                positionY: Math.floor(Math.random() * 60) + 10,
                rotation: Math.floor(Math.random() * 16) - 8,
                scale: 1,
              });
              setModalOpen(true);
            }}
            style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
          >
            Add Artwork
          </Button>
        </div>
      }
      variant="borderless"
      style={{ borderRadius: "12px" }}
    >
      <Table
        dataSource={artworks}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        pagination={false}
        scroll={{ x: 600 }}
      />

      <Modal
        title={editingArtwork ? "Edit Artwork" : "Add New Artwork"}
        open={modalOpen}
        forceRender
        onCancel={() => {
          setModalOpen(false);
          setEditingArtwork(null);
          setImage(null);
        }}
        footer={null}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Artwork Image" required>
            <AdminImageUpload
              value={image}
              onChange={setImage}
              folder="artworks"
              aspectRatio="4 / 3"
            />
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="e.g. Summer Window" />
          </Form.Item>

          <Form.Item
            label="Year"
            name="year"
            rules={[{ required: true, message: "Year is required" }]}
          >
            <InputNumber min={2000} max={2099} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Caption / Note" name="caption">
            <Input.TextArea
              rows={2}
              placeholder="A study in noticing what almost slips past."
            />
          </Form.Item>

          <Space
            size="large"
            style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}
          >
            <Form.Item
              label="Desk X (%)"
              name="positionX"
              tooltip="Starting horizontal spot where this artwork paper sits on the workspace desk (0% = left, 90% = right)."
              style={{ marginBottom: 0 }}
            >
              <InputNumber min={0} max={90} />
            </Form.Item>

            <Form.Item
              label="Desk Y (%)"
              name="positionY"
              tooltip="Starting vertical spot on the workspace desk (0% = top, 90% = bottom)."
              style={{ marginBottom: 0 }}
            >
              <InputNumber min={0} max={90} />
            </Form.Item>

            <Form.Item
              label="Tilt Angle (°)"
              name="rotation"
              tooltip="Initial tilt angle of the paper on the desk (e.g. -6° or 8° for an organic, scattered look)."
              style={{ marginBottom: 0 }}
            >
              <InputNumber min={-15} max={15} />
            </Form.Item>

            <Form.Item
              label="Published"
              name="isPublished"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch checkedChildren="Published" unCheckedChildren="Draft" />
            </Form.Item>
          </Space>

          <Form.Item
            style={{ marginTop: "24px", marginBottom: 0, textAlign: "right" }}
          >
            <Space>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
              >
                {editingArtwork ? "Update Artwork" : "Create Artwork"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
