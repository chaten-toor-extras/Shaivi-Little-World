"use client";

import CollectiblePreviewCanvas from "@/components/world/collectibles/CollectiblePreviewCanvas";
import {
  COLLECTIBLE_MODELS,
  MODEL_KEYS,
} from "@/components/world/collectibles/modelRegistry";
import { ANCHOR_LIST } from "@/data/worldAnchors";
import { adminService } from "@/services/admin.service";
import { useCollectibleStore } from "@/store/useCollectibleStore";
import type {
  Collectible,
  CollectibleCategory,
  CollectibleModelKey,
  CollectibleRarity,
  CollectibleRotationPreset,
  CollectibleScalePreset,
  CollectibleSource,
  Mood,
} from "@/types";
import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  Col,
  Drawer,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./CollectiblesAdmin.module.css";

const CATEGORIES: { label: string; value: CollectibleCategory }[] = [
  { label: "Star (Celestial)", value: "STAR" },
  { label: "Flower (Botanical)", value: "FLOWER" },
  { label: "Art (Studio)", value: "ART" },
  { label: "Memory (Keepsake)", value: "MEMORY" },
  { label: "Music (Melody)", value: "MUSIC" },
  { label: "Letter (Message)", value: "LETTER" },
  { label: "Nature (Wild)", value: "NATURE" },
  { label: "Magic (Lore)", value: "MAGIC" },
];

const RARITIES: { label: string; value: CollectibleRarity; color: string }[] = [
  { label: "Common", value: "COMMON", color: "blue" },
  { label: "Special", value: "SPECIAL", color: "purple" },
  { label: "Rare", value: "RARE", color: "gold" },
];

const SCALE_PRESETS: { label: string; value: CollectibleScalePreset }[] = [
  { label: "Tiny (60%)", value: "TINY" },
  { label: "Small (80%)", value: "SMALL" },
  { label: "Normal (100%)", value: "NORMAL" },
  { label: "Featured (135%)", value: "FEATURED" },
];

const ROTATION_PRESETS: { label: string; value: CollectibleRotationPreset }[] = [
  { label: "Default (Upright)", value: "DEFAULT" },
  { label: "Upright", value: "UPRIGHT" },
  { label: "Flat on surface", value: "FLAT" },
  { label: "Artistic tilt", value: "TILTED" },
];

const IDLE_ANIMATIONS = [
  { label: "Gentle Float", value: "FLOAT" },
  { label: "Slow Spin", value: "SLOW_SPIN" },
  { label: "Soft Pulse", value: "SOFT_PULSE" },
  { label: "Stationary (None)", value: "NONE" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCollectiblesPage() {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // Responsive mobile state
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCollectible, setEditingCollectible] = useState<Collectible | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");

  // Interactive drawer preview state
  const [previewModelKey, setPreviewModelKey] = useState<CollectibleModelKey>("tiny_star");
  const [previewScale, setPreviewScale] = useState<CollectibleScalePreset>("NORMAL");
  const [previewRotation, setPreviewRotation] = useState<CollectibleRotationPreset>("DEFAULT");
  const [previewGlow, setPreviewGlow] = useState("#ffe8b2");
  const [previewAccent, setPreviewAccent] = useState("#f7d070");
  const [selectedSource, setSelectedSource] = useState<CollectibleSource>("WORLD");

  // Queries
  const { data: collectibles = [], isLoading: collectiblesLoading } = useQuery<Collectible[]>({
    queryKey: ["adminCollectibles"],
    queryFn: adminService.getCollectibles,
  });

  const { data: moods = [] } = useQuery<Mood[]>({
    queryKey: ["adminMoods"],
    queryFn: adminService.getMoods,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Collectible>) => adminService.createCollectible(data),
    onSuccess: () => {
      message.success("Collectible created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminCollectibles"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
      setDrawerOpen(false);
      setEditingCollectible(null);
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || "Failed to create collectible");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Collectible> }) =>
      adminService.updateCollectible(id, data),
    onSuccess: () => {
      message.success("Collectible updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminCollectibles"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
      setDrawerOpen(false);
      setEditingCollectible(null);
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || "Failed to update collectible");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCollectible(id),
    onSuccess: () => {
      message.success("Collectible deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminCollectibles"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || "Failed to delete collectible");
    },
  });

  // Filtered Collectibles list
  const filteredCollectibles = useMemo(() => {
    return collectibles.filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchSlug = item.slug.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        if (!matchName && !matchSlug && !matchCat) return false;
      }
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
      if (sourceFilter !== "ALL" && item.source !== sourceFilter) return false;
      return true;
    });
  }, [collectibles, searchQuery, categoryFilter, sourceFilter]);

  // Open Create Drawer
  const handleOpenCreate = () => {
    setEditingCollectible(null);
    setPreviewModelKey("tiny_star");
    setPreviewScale("NORMAL");
    setPreviewRotation("DEFAULT");
    setPreviewGlow("#ffe8b2");
    setPreviewAccent("#f7d070");
    setSelectedSource("WORLD");
    setDrawerOpen(true);
  };

  // Open Edit Drawer
  const handleOpenEdit = (record: Collectible) => {
    setEditingCollectible(record);
    setPreviewModelKey(record.model?.modelKey || "tiny_star");
    setPreviewScale(record.model?.scalePreset || "NORMAL");
    setPreviewRotation(record.model?.rotationPreset || "DEFAULT");
    setPreviewGlow(record.appearance?.glowColor || "#ffe8b2");
    setPreviewAccent(record.appearance?.accentColor || "#f7d070");
    setSelectedSource(record.source || "WORLD");
    setDrawerOpen(true);
  };

  // Synchronize form values whenever Drawer opens (guarantees form element is mounted)
  useEffect(() => {
    if (!drawerOpen) return;

    const timer = setTimeout(() => {
      if (editingCollectible) {
        form.setFieldsValue({
          name: editingCollectible.name,
          slug: editingCollectible.slug,
          description: editingCollectible.description || "",
          hint: editingCollectible.hint || "",
          category: editingCollectible.category || "STAR",
          rarity: editingCollectible.rarity || "COMMON",
          source: editingCollectible.source || "WORLD",
          enabled: editingCollectible.enabled ?? true,
          isPublished: editingCollectible.isPublished ?? true,
          adminNote: editingCollectible.adminNote || "",
          model: {
            modelKey: editingCollectible.model?.modelKey || "tiny_star",
            scalePreset: editingCollectible.model?.scalePreset || "NORMAL",
            rotationPreset: editingCollectible.model?.rotationPreset || "DEFAULT",
          },
          appearance: {
            glowColor: editingCollectible.appearance?.glowColor || "#ffe8b2",
            accentColor: editingCollectible.appearance?.accentColor || "#f7d070",
            idleAnimation: editingCollectible.appearance?.idleAnimation || "FLOAT",
          },
          placement: {
            anchor: editingCollectible.placement?.anchor || "POND_EDGE",
            offset: {
              x: editingCollectible.placement?.offset?.x ?? 0,
              y: editingCollectible.placement?.offset?.y ?? 0,
              z: editingCollectible.placement?.offset?.z ?? 0,
            },
            visibleInPeriods: editingCollectible.placement?.visibleInPeriods || [],
            requiredMood: editingCollectible.placement?.requiredMood || null,
          },
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          name: "",
          slug: "",
          description: "",
          hint: "",
          category: "STAR",
          rarity: "COMMON",
          source: "WORLD",
          enabled: true,
          isPublished: true,
          adminNote: "",
          model: {
            modelKey: "tiny_star",
            scalePreset: "NORMAL",
            rotationPreset: "DEFAULT",
          },
          appearance: {
            glowColor: "#ffe8b2",
            accentColor: "#f7d070",
            idleAnimation: "FLOAT",
          },
          placement: {
            anchor: "POND_EDGE",
            offset: { x: 0, y: 0, z: 0 },
            visibleInPeriods: [],
            requiredMood: null,
          },
        });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [drawerOpen, editingCollectible, form]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCollectible) {
      form.setFieldsValue({ slug: slugify(e.target.value) });
    }
  };

  const handleFormSubmit = async (values: any) => {
    const payload: Partial<Collectible> = {
      name: values.name.trim(),
      description: values.description?.trim() || "",
      hint: values.hint?.trim() || "",
      category: values.category,
      rarity: values.rarity,
      source: values.source,
      enabled: values.enabled,
      isPublished: values.isPublished,
      adminNote: values.adminNote?.trim() || "",
      model: {
        modelKey: values.model?.modelKey || "tiny_star",
        scalePreset: values.model?.scalePreset || "NORMAL",
        rotationPreset: values.model?.rotationPreset || "DEFAULT",
      },
      appearance: {
        glowColor: values.appearance?.glowColor || "#ffe8b2",
        accentColor: values.appearance?.accentColor || "#f7d070",
        idleAnimation: values.appearance?.idleAnimation || "FLOAT",
        revealEffect: "SPARKLE",
      },
      placement: {
        anchor: values.placement?.anchor || "POND_EDGE",
        offset: {
          x: Number(values.placement?.offset?.x) || 0,
          y: Number(values.placement?.offset?.y) || 0,
          z: Number(values.placement?.offset?.z) || 0,
        },
        visibleInPeriods: values.placement?.visibleInPeriods || [],
        requiredMood: values.placement?.requiredMood || null,
      },
      behavior: {
        hideAfterCollected: true,
      },
    };

    if (editingCollectible) {
      updateMutation.mutate({ id: editingCollectible._id, data: payload });
    } else {
      payload.slug = values.slug.trim();
      createMutation.mutate(payload);
    }
  };

  const handleResetLocalProgress = () => {
    modal.confirm({
      title: "Reset Local Collection Progress?",
      content:
        "This only resets your current browser's local collected items so you can discover them again. It does not affect database data.",
      okText: "Reset Progress",
      okType: "danger",
      onOk: () => {
        useCollectibleStore.getState().resetProgress();
        message.success("Browser collection progress reset");
      },
    });
  };

  // Table Columns
  const columns = [
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 70,
      render: (order: number) => (
        <span style={{ color: "#8c8c8c", fontVariantNumeric: "tabular-nums" }}>
          #{order + 1}
        </span>
      ),
    },
    {
      title: "Collectible Item",
      key: "name",
      render: (_: any, record: Collectible) => (
        <div>
          <div style={{ fontWeight: 600, color: "#262626" }}>{record.name}</div>
          <div style={{ fontSize: "0.75rem", color: "#8c8c8c", fontFamily: "monospace" }}>
            {record.slug}
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (cat: CollectibleCategory) => <Tag color="default">{cat}</Tag>,
    },
    {
      title: "Rarity",
      dataIndex: "rarity",
      key: "rarity",
      width: 100,
      render: (rarity: CollectibleRarity) => {
        const r = RARITIES.find((item) => item.value === rarity);
        return <Tag color={r?.color || "default"}>{r?.label || rarity}</Tag>;
      },
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      width: 110,
      render: (src: CollectibleSource) => (
        <Tag color={src === "WORLD" ? "green" : "gold"}>
          {src === "WORLD" ? "World Pickup" : "Secret Reward"}
        </Tag>
      ),
    },
    {
      title: "Anchor / Location",
      key: "placement",
      render: (_: any, record: Collectible) => {
        if (record.source === "SECRET") {
          return <span style={{ color: "#8c8c8c", fontSize: "0.85rem" }}>Granted via Secret</span>;
        }
        const anchorDef = ANCHOR_LIST.find((a) => a.key === record.placement?.anchor);
        return (
          <span style={{ fontSize: "0.85rem", color: "#595959" }}>
            {anchorDef ? anchorDef.name : record.placement?.anchor || "Pond Edge"}
          </span>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      render: (_: any, record: Collectible) => (
        <Tag color={record.enabled && record.isPublished ? "success" : "default"}>
          {record.enabled && record.isPublished ? "Live" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_: any, record: Collectible) => {
        const menuItems = [
          {
            key: "edit",
            label: "Edit Collectible",
            icon: <EditOutlined />,
            onClick: () => handleOpenEdit(record),
          },
          {
            type: "divider" as const,
          },
          {
            key: "delete",
            label: "Delete Collectible",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              modal.confirm({
                title: `Delete "${record.name}"?`,
                content:
                  "This will permanently delete this collectible item. Any secrets referencing it will be safely cleared.",
                okText: "Delete",
                okType: "danger",
                onOk: () => deleteMutation.mutate(record._id),
              });
            },
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
            <Tooltip title="Actions">
              <Button
                size="small"
                type="text"
                icon={<MoreOutlined style={{ fontSize: "16px" }} />}
              />
            </Tooltip>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <Card
        className={styles.tableCard}
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <span style={{ fontWeight: 600, fontSize: "1.05rem", color: "#262626" }}>
                Keepsakes & Collectibles ({collectibles.length})
              </span>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#8c8c8c" }}>
                Small tangible discoveries placed across the island or granted via secrets.
              </p>
            </div>

            <div className={styles.headerActions}>
              <Input
                placeholder="Search keepsakes..."
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                style={{ width: 190 }}
              />
              <Select
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 140 }}
                options={[
                  { label: "All Categories", value: "ALL" },
                  ...CATEGORIES.map((c) => ({ label: c.label.split(" ")[0], value: c.value })),
                ]}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetLocalProgress}
                title="Reset browser collection progress for local testing"
              >
                Reset Progress
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
                style={{ backgroundColor: "#8a6d79" }}
              >
                Add Collectible
              </Button>
            </div>
          </div>
        }
      >
        <Table
          dataSource={filteredCollectibles}
          columns={columns}
          rowKey="_id"
          loading={collectiblesLoading}
          pagination={{ pageSize: 12, showSizeChanger: false }}
          size="middle"
          scroll={{ x: 860 }}
        />
      </Card>

      {/* Create / Edit Drawer with forceRender and footer actions */}
      <Drawer
        forceRender
        title={
          <span style={{ fontWeight: 600, color: "#262626", fontSize: "1rem" }}>
            {editingCollectible
              ? `Edit Collectible: ${editingCollectible.name}`
              : "Create New Collectible"}
          </span>
        }
        size="large"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingCollectible(null);
        }}
        styles={{
          wrapper: isMobile
            ? { width: "100vw", maxWidth: "100vw" }
            : { width: "680px", maxWidth: "100vw" },
          body: {
            padding: isMobile ? "16px 14px 24px" : "20px 24px",
          },
          footer: {
            padding: isMobile ? "12px 14px" : "14px 24px",
          },
        }}
        footer={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              style={{ backgroundColor: "#8a6d79" }}
              loading={createMutation.isPending || updateMutation.isPending}
              onClick={() => form.submit()}
            >
              {editingCollectible ? "Save Changes" : "Create Collectible"}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{
            enabled: true,
            isPublished: true,
            category: "STAR",
            rarity: "COMMON",
            source: "WORLD",
          }}
        >
          {/* 1. Live 3D Model Preview Box */}
          <div className={styles.previewContainer}>
            <div className={styles.previewLabel}>3D Preview · {previewModelKey}</div>
            <CollectiblePreviewCanvas
              modelKey={previewModelKey}
              scalePreset={previewScale}
              rotationPreset={previewRotation}
              glowColor={previewGlow}
              accentColor={previewAccent}
            />
          </div>

          {/* 2. Choose Curated Model */}
          <Form.Item label="3D Model Asset" style={{ marginBottom: 14 }}>
            <div className={styles.modelCardGrid}>
              {MODEL_KEYS.map((mKey) => {
                const isSelected = previewModelKey === mKey;
                const mDef = COLLECTIBLE_MODELS[mKey];
                return (
                  <button
                    key={mKey}
                    type="button"
                    className={`${styles.modelCard} ${isSelected ? styles.selected : ""}`}
                    onClick={() => {
                      setPreviewModelKey(mKey);
                      form.setFieldsValue({ model: { modelKey: mKey } });
                    }}
                  >
                    <div className={styles.modelIcon}>✦</div>
                    <div className={styles.modelName}>{mDef.name}</div>
                  </button>
                );
              })}
            </div>
            <Form.Item name={["model", "modelKey"]} noStyle>
              <Input type="hidden" />
            </Form.Item>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Name is required" }]}
              >
                <Input placeholder="e.g. Little Star" onChange={handleNameChange} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Slug (Permanent ID)"
                name="slug"
                rules={[{ required: true, message: "Slug is required" }]}
              >
                <Input
                  placeholder="e.g. little-star"
                  disabled={Boolean(editingCollectible)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="Category" name="category">
                <Select options={CATEGORIES} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Rarity" name="rarity">
                <Select
                  options={RARITIES.map((r) => ({
                    label: r.label,
                    value: r.value,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Source" name="source">
                <Select
                  onChange={(val) => setSelectedSource(val)}
                  options={[
                    { label: "World Pickup (In Scene)", value: "WORLD" },
                    { label: "Secret Reward Only", value: "SECRET" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Poetic Description"
            name="description"
            tooltip="Displayed in the keepsakes book once discovered."
          >
            <Input.TextArea
              rows={2}
              placeholder="e.g. A tiny celestial fragment that fell from the night sky..."
            />
          </Form.Item>

          <Form.Item
            label="Discovery Hint"
            name="hint"
            tooltip="Displayed in the keepsakes book before the item is found."
          >
            <Input placeholder="e.g. Where the water softly catches the sky." />
          </Form.Item>

          {/* Model Transforms */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Scale Preset" name={["model", "scalePreset"]}>
                <Select
                  options={SCALE_PRESETS}
                  onChange={(val) => setPreviewScale(val)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Rotation Preset" name={["model", "rotationPreset"]}>
                <Select
                  options={ROTATION_PRESETS}
                  onChange={(val) => setPreviewRotation(val)}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Placement Settings (Only visible if source === WORLD) */}
          {selectedSource === "WORLD" && (
            <Card
              size="small"
              title="Island Placement"
              style={{ marginBottom: 16, background: "#faf8f5" }}
            >
              <Form.Item
                label="Named Anchor"
                name={["placement", "anchor"]}
                tooltip="Safe pre-calibrated locations on the island."
              >
                <Select
                  options={ANCHOR_LIST.map((a) => ({
                    label: `${a.name} — ${a.description}`,
                    value: a.key,
                  }))}
                />
              </Form.Item>

              <div style={{ fontSize: "0.8rem", color: "#8c8c8c", marginBottom: 8 }}>
                Position Fine-tuning Offsets (-2 to +2):
              </div>
              <Row gutter={16}>
                <Col xs={8}>
                  <Form.Item label="Offset X" name={["placement", "offset", "x"]}>
                    <InputNumber min={-2} max={2} step={0.05} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={8}>
                  <Form.Item label="Offset Y" name={["placement", "offset", "y"]}>
                    <InputNumber min={-1} max={2} step={0.05} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={8}>
                  <Form.Item label="Offset Z" name={["placement", "offset", "z"]}>
                    <InputNumber min={-2} max={2} step={0.05} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          {/* Appearance & Animation */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Idle Animation" name={["appearance", "idleAnimation"]}>
                <Select options={IDLE_ANIMATIONS} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item label="Glow Color" name={["appearance", "glowColor"]}>
                <Input
                  type="color"
                  onChange={(e) => setPreviewGlow(e.target.value)}
                  style={{ width: "100%", height: 32, padding: 2 }}
                />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item label="Accent Color" name={["appearance", "accentColor"]}>
                <Input
                  type="color"
                  onChange={(e) => setPreviewAccent(e.target.value)}
                  style={{ width: "100%", height: 32, padding: 2 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={12}>
              <Form.Item
                label="Enabled"
                name="enabled"
                valuePropName="checked"
                tooltip="Active in calculations and rewards"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item
                label="Published"
                name="isPublished"
                valuePropName="checked"
                tooltip="Visible to public visitors"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Admin Note" name="adminNote">
            <Input placeholder="Internal notes (optional)" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}

