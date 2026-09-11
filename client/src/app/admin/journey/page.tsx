"use client";

import AdminImageUpload from "@/components/admin/AdminImageUpload";
import TelescopeStarEditor from "@/components/admin/journey/TelescopeStarEditor";
import { calculateAutoPositions } from "@/components/ui/telescope/telescopeUtils";
import { adminService } from "@/services/admin.service";
import type { JourneyMilestone, PhotoData } from "@/types";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Image as AntImage,
  App,
  Button,
  Card,
  ColorPicker,
  Form,
  Grid,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
} from "antd";
import { useState } from "react";

export default function AdminJourneyPage() {
  const screens = Grid.useBreakpoint();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] =
    useState<JourneyMilestone | null>(null);
  const [image, setImage] = useState<PhotoData | null>(null);
  const [form] = Form.useForm();

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ["adminMilestones"],
    queryFn: adminService.getMilestones,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<JourneyMilestone>) =>
      adminService.createMilestone(data),
    onSuccess: () => {
      message.success("Milestone created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminMilestones"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
      setModalOpen(false);
      form.resetFields();
      setImage(null);
    },
    onError: (err: any) =>
      message.error(err?.message || "Failed to create milestone"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<JourneyMilestone>;
    }) => adminService.updateMilestone(id, data),
    onSuccess: () => {
      message.success("Milestone updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminMilestones"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
      setModalOpen(false);
      setEditingMilestone(null);
      form.resetFields();
      setImage(null);
    },
    onError: (err: any) =>
      message.error(err?.message || "Failed to update milestone"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteMilestone(id),
    onSuccess: () => {
      message.success("Milestone deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminMilestones"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
    onError: (err: any) =>
      message.error(err?.message || "Failed to delete milestone"),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; order: number }[]) =>
      adminService.reorderMilestones(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMilestones"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
  });

  const [starCoord, setStarCoord] = useState<{ x: number; y: number }>({
    x: 50,
    y: 45,
  });

  const handleEdit = (m: JourneyMilestone) => {
    setEditingMilestone(m);
    setImage(m.image);
    const initialCoord = {
      x: m.telescope?.x ?? m.desktopPosition?.x ?? 50,
      y: m.telescope?.y ?? m.desktopPosition?.y ?? 45,
    };
    setStarCoord(initialCoord);
    form.setFieldsValue({
      ...m,
      posX: initialCoord.x,
      posY: initialCoord.y,
      telescopeEnabled: m.telescope?.enabled ?? true,
      starSize: m.telescope?.size ?? "normal",
      glowColor: m.telescope?.glowColor ?? "#C9B7E8",
      constellationOrder: m.telescope?.constellationOrder ?? m.order ?? 0,
    });
    setModalOpen(true);
  };

  const handleAutoArrangeAll = () => {
    const autoCoords = calculateAutoPositions(milestones.length);
    if (editingMilestone) {
      const idx = milestones.findIndex((m) => m._id === editingMilestone._id);
      if (idx !== -1 && autoCoords[idx]) {
        setStarCoord(autoCoords[idx]);
        form.setFieldsValue({
          posX: autoCoords[idx].x,
          posY: autoCoords[idx].y,
        });
      }
    } else {
      setStarCoord(autoCoords[0] || { x: 50, y: 45 });
      form.setFieldsValue({
        posX: autoCoords[0]?.x ?? 50,
        posY: autoCoords[0]?.y ?? 45,
      });
    }
    message.info("Arranged stars along celestial constellation arc");
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= milestones.length) return;

    const newMilestones = [...milestones];
    const [moved] = newMilestones.splice(index, 1);
    newMilestones.splice(targetIndex, 0, moved);

    const reordered = newMilestones.map((m, i) => ({ id: m._id, order: i }));
    reorderMutation.mutate(reordered);
  };

  const onFinish = (values: any) => {
    if (!image) {
      message.error("Please upload an image for the milestone");
      return;
    }

    const glowColorHex =
      typeof values.glowColor === "string"
        ? values.glowColor
        : values.glowColor?.toHexString
          ? values.glowColor.toHexString()
          : "#C9B7E8";

    const payload = {
      title: values.title,
      year: values.year,
      text: values.text,
      image,
      isPublished: values.isPublished,
      desktopPosition: { x: starCoord.x, y: starCoord.y },
      telescope: {
        enabled: values.telescopeEnabled ?? true,
        x: starCoord.x,
        y: starCoord.y,
        size: values.starSize || "normal",
        glowColor: glowColorHex,
        constellationOrder: values.constellationOrder ?? 0,
      },
    };

    if (editingMilestone) {
      updateMutation.mutate({ id: editingMilestone._id, data: payload });
    } else {
      createMutation.mutate({ ...payload, order: milestones.length });
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
            disabled={index === milestones.length - 1}
            onClick={() => handleMove(index, "down")}
          />
        </Space>
      ),
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 70,
      render: (img: PhotoData) => (
        <AntImage
          src={img?.src}
          alt={img?.alt || "Milestone thumbnail"}
          width={45}
          height={45}
          style={{ objectFit: "cover", borderRadius: "4px" }}
        />
      ),
    },
    {
      title: "Year & Title",
      key: "title",
      render: (_: any, record: JourneyMilestone) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.title}</div>
          <div style={{ fontSize: "0.75rem", color: "#8a7f8e" }}>
            {record.year}
          </div>
        </div>
      ),
    },
    {
      title: "Story",
      dataIndex: "text",
      key: "text",
      ellipsis: true,
    },
    {
      title: "Star in Sky",
      key: "telescope",
      width: 110,
      render: (_: any, record: JourneyMilestone) => {
        const x = record.telescope?.x ?? record.desktopPosition?.x ?? 50;
        const y = record.telescope?.y ?? record.desktopPosition?.y ?? 50;
        const color = record.telescope?.glowColor || "#C9B7E8";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 6px ${color}`,
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                fontFamily: "monospace",
                color: "#8a7f8e",
              }}
            >
              {x}%, {y}%
            </span>
          </div>
        );
      },
    },
    {
      title: "Published",
      dataIndex: "isPublished",
      key: "isPublished",
      width: 90,
      render: (pub: boolean, record: JourneyMilestone) => (
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
      width: 110,
      render: (_: any, record: JourneyMilestone) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete milestone?"
            description="This will remove this star from the constellation."
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            flexDirection: screens.md ? "row" : "column",
            justifyContent: "space-between",
            alignItems: screens.md ? "center" : "flex-start",
            gap: screens.md ? 0 : "12px",
          }}
        >
          <span style={{ fontWeight: 600 }}>
            Star Journey Milestones ({milestones.length})
          </span>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingMilestone(null);
              setImage(null);
              form.resetFields();
              setStarCoord({ x: 50, y: 45 });
              form.setFieldsValue({
                isPublished: true,
                year: String(new Date().getFullYear()),
                posX: 50,
                posY: 45,
                telescopeEnabled: true,
                starSize: "normal",
                glowColor: "#C9B7E8",
                constellationOrder: milestones.length,
              });
              setModalOpen(true);
            }}
            style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
          >
            Add Milestone
          </Button>
        </div>
      }
      variant="borderless"
      style={{ borderRadius: "12px" }}
    >
      <Table
        dataSource={milestones}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        pagination={false}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={editingMilestone ? "Edit Milestone" : "Add New Milestone"}
        open={modalOpen}
        forceRender
        onCancel={() => {
          setModalOpen(false);
          setEditingMilestone(null);
          setImage(null);
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Milestone Image" required>
            <AdminImageUpload
              value={image}
              onChange={setImage}
              folder="journey"
              aspectRatio="1 / 1"
            />
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="e.g. Experiments" />
          </Form.Item>

          <Form.Item
            label="Year / Period"
            name="year"
            rules={[{ required: true, message: "Year is required" }]}
          >
            <Input placeholder="e.g. 2026" />
          </Form.Item>

          <Form.Item
            label="Description / Text"
            name="text"
            rules={[{ required: true, message: "Story text is required" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Tell the story behind this milestone..."
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev?.year !== cur?.year}
          >
            {({ getFieldValue }) => (
              <Form.Item label="Constellation Star Placement">
                <TelescopeStarEditor
                  value={starCoord}
                  onChange={(coord) => {
                    setStarCoord(coord);
                    form.setFieldsValue({ posX: coord.x, posY: coord.y });
                  }}
                  otherMilestones={milestones}
                  currentId={editingMilestone?._id}
                  currentYear={getFieldValue("year") || "Star"}
                  onAutoArrange={handleAutoArrangeAll}
                />
              </Form.Item>
            )}
          </Form.Item>

          <Form.Item name="posX" noStyle>
            <InputNumber style={{ display: "none" }} />
          </Form.Item>
          <Form.Item name="posY" noStyle>
            <InputNumber style={{ display: "none" }} />
          </Form.Item>

          <Space
            size="large"
            style={{
              marginBottom: "16px",
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            <Form.Item
              label="Telescope Star"
              name="telescopeEnabled"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch checkedChildren="Visible" unCheckedChildren="Hidden" />
            </Form.Item>

            <Form.Item
              label="Star Size"
              name="starSize"
              style={{ marginBottom: 0, minWidth: 130 }}
            >
              <Select
                options={[
                  { label: "Small Star", value: "small" },
                  { label: "Normal Star", value: "normal" },
                  { label: "Featured (Bright)", value: "featured" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Glow Color"
              name="glowColor"
              style={{ marginBottom: 0 }}
            >
              <ColorPicker showText format="hex" />
            </Form.Item>

            <Form.Item
              label="Constellation Order"
              name="constellationOrder"
              tooltip="Sequential drawing order in the constellation lines"
              style={{ marginBottom: 0, width: 110 }}
            >
              <InputNumber min={0} max={99} />
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
                {editingMilestone ? "Update Milestone" : "Create Milestone"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
