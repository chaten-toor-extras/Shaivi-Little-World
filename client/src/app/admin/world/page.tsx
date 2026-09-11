"use client";

import {
  EyeOutlined,
  MoonOutlined,
  MoreOutlined,
  ReloadOutlined,
  SaveOutlined,
  SoundOutlined,
  SunOutlined,
  ThunderboltOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Drawer,
  Dropdown,
  Form,
  Input,
  Popconfirm,
  Row,
  Segmented,
  Select,
  Skeleton,
  Slider,
  Space,
  Switch,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";

import WorldPreviewCanvas from "@/components/admin/WorldPreviewCanvas";
import { adminService } from "@/services/admin.service";
import type { WorldSettings } from "@/types/world";
import {
  DEFAULT_WORLD_SETTINGS,
  TIME_PROFILE_PRESETS,
  type TimeProfilePreset,
  WORLD_PRESETS,
  normalizeWorldSettings,
} from "@/utils/worldDefaults";

const { Text, Title, Paragraph } = Typography;

function ColorField({
  value,
  onChange,
  label,
}: {
  value?: string;
  onChange?: (val: string) => void;
  label?: string;
}) {
  const safeHex = value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#d5cbdc";

  return (
    <Space style={{ width: "100%" }}>
      <input
        type="color"
        value={safeHex}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: 36,
          height: 32,
          padding: 2,
          borderRadius: 6,
          border: "1px solid #d9d9d9",
          cursor: "pointer",
        }}
      />
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ width: 110, fontFamily: "monospace" }}
        placeholder="#ffffff"
      />
      {label && (
        <span style={{ color: "#706773", fontSize: "0.82rem" }}>{label}</span>
      )}
    </Space>
  );
}

export default function AdminWorldPage() {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<WorldSettings>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("identity");
  const [liveSettings, setLiveSettings] = useState<WorldSettings>(
    DEFAULT_WORLD_SETTINGS,
  );
  const [isDirty, setIsDirty] = useState(false);

  // Fetch world settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["adminWorldSettings"],
    queryFn: adminService.getWorldSettings,
  });

  const initialFormValues = useMemo(() => {
    return settings ? normalizeWorldSettings(settings) : DEFAULT_WORLD_SETTINGS;
  }, [settings]);

  useEffect(() => {
    if (settings) {
      const normalized = normalizeWorldSettings(settings);
      form.setFieldsValue(normalized);
      setLiveSettings(normalized);
      setIsDirty(false);
    }
  }, [settings, form]);

  const handleValuesChange = (_: any, allValues: any) => {
    const safeSections = allValues.sections
      ? { ...liveSettings.sections, ...allValues.sections }
      : liveSettings.sections;

    const merged = normalizeWorldSettings({
      ...(settings || DEFAULT_WORLD_SETTINGS),
      ...liveSettings,
      ...allValues,
      sections: safeSections,
    });
    setLiveSettings(merged);
    setIsDirty(true);
  };

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (values: Partial<WorldSettings>) =>
      adminService.updateWorldSettings(values),
    onSuccess: (res) => {
      message.success("World settings updated successfully!");
      if (res.data) {
        const normalized = normalizeWorldSettings(res.data);
        form.setFieldsValue(normalized);
        setLiveSettings(normalized);
      }
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["adminWorldSettings"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
    onError: (err: any) => {
      message.error(err?.message || "Failed to update world settings.");
    },
  });

  // Reset mutation
  const resetMutation = useMutation({
    mutationFn: (section?: string) => adminService.resetWorldSettings(section),
    onSuccess: (res) => {
      message.success("Settings reset to defaults successfully!");
      if (res.data) {
        const normalized = normalizeWorldSettings(res.data);
        form.setFieldsValue(normalized);
        setLiveSettings(normalized);
      }
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["adminWorldSettings"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
    onError: (err: any) => {
      message.error(err?.message || "Failed to reset settings.");
    },
  });

  const onFinish = (values: WorldSettings) => {
    const sectionKeys = [
      "ABOUT",
      "QUOTES",
      "GALLERY",
      "JOURNEY",
      "CONTACT",
      "MUSIC",
    ] as const;

    const fallbackSections =
      liveSettings.sections ||
      settings?.sections ||
      DEFAULT_WORLD_SETTINGS.sections;

    const formSections =
      values.sections || form.getFieldValue("sections") || {};

    const resolvedSections: Record<
      string,
      { enabled: boolean; label: string; icon: string }
    > = {};

    for (const k of sectionKeys) {
      const fallback =
        fallbackSections[k] || DEFAULT_WORLD_SETTINGS.sections[k];
      const formItem = formSections[k];

      resolvedSections[k] = {
        enabled:
          typeof formItem?.enabled === "boolean"
            ? formItem.enabled
            : (fallback?.enabled ?? true),
        label:
          typeof formItem?.label === "string" && formItem.label.trim()
            ? formItem.label.trim()
            : fallback?.label || DEFAULT_WORLD_SETTINGS.sections[k].label,
        icon:
          typeof formItem?.icon === "string" && formItem.icon.trim()
            ? formItem.icon.trim()
            : fallback?.icon || DEFAULT_WORLD_SETTINGS.sections[k].icon,
      };
    }

    // Safety guarantee: ensure at least one section is enabled
    const activeSectionCount = Object.values(resolvedSections).filter(
      (s) => s.enabled === true,
    ).length;
    if (activeSectionCount === 0) {
      resolvedSections.ABOUT.enabled = true;
    }

    // Combine full values so unmounted tab fields are never lost
    const fullValues = normalizeWorldSettings({
      ...(settings || DEFAULT_WORLD_SETTINGS),
      ...liveSettings,
      ...form.getFieldsValue(true),
      ...values,
      sections: resolvedSections,
    });
    fullValues.sections = resolvedSections as any;

    // Validate fog near < far
    if (
      fullValues.scene?.fog?.enabled &&
      fullValues.scene.fog.near >= fullValues.scene.fog.far
    ) {
      message.error(
        "Fog Near distance must be strictly less than Far distance.",
      );
      return;
    }

    // Validate dayNight schedule sequential ordering
    if (fullValues.dayNight?.enabled && fullValues.dayNight?.schedule) {
      const s = fullValues.dayNight.schedule;
      const parseTimeToMinutes = (t?: string) => {
        if (!t || typeof t !== "string") return 0;
        const [h, m] = t.split(":").map(Number);
        return (h || 0) * 60 + (m || 0);
      };
      const m = parseTimeToMinutes(s.morningStart);
      const d = parseTimeToMinutes(s.dayStart);
      const su = parseTimeToMinutes(s.sunsetStart);
      const n = parseTimeToMinutes(s.nightStart);
      if (!(m < d && d < su && su < n)) {
        message.error(
          "Schedule start times must follow sequential order: Morning < Day < Sunset < Night.",
        );
        return;
      }
    }

    const { _id, __v, createdAt, updatedAt, schemaVersion, ...cleanPayload } =
      fullValues as any;

    updateMutation.mutate(cleanPayload);
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = WORLD_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const currentSections =
      liveSettings.sections ||
      settings?.sections ||
      DEFAULT_WORLD_SETTINGS.sections;

    const currentValues = form.getFieldsValue(true);
    const updated = normalizeWorldSettings({
      ...liveSettings,
      ...currentValues,
      ...preset.settings,
      sections: currentSections,
    });
    updated.sections = { ...currentSections };

    form.setFieldsValue(updated);
    setLiveSettings(updated);
    setIsDirty(true);
    setPresetDropdownOpen(false);
    message.info(`Applied preset: ${preset.name}. Review and click Save.`);
  };

  const presetMenuItems = WORLD_PRESETS.map((p) => ({
    key: p.id,
    label: (
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
          {p.name}{" "}
          <Tag color="purple" style={{ marginLeft: 4 }}>
            {p.badge}
          </Tag>
        </div>
        <div style={{ fontSize: "0.75rem", color: "#8a7f8e" }}>
          {p.description}
        </div>
      </div>
    ),
    onClick: () => {
      setPresetDropdownOpen(false);
      handleApplyPreset(p.id);
    },
  }));

  // Count of currently enabled sections in live state
  const enabledSectionCount = useMemo(() => {
    return Object.values(liveSettings.sections || {}).filter((s) => s?.enabled)
      .length;
  }, [liveSettings.sections]);

  const [selectedProfileTab, setSelectedProfileTab] = useState<
    "morning" | "day" | "sunset" | "night"
  >("morning");

  const handleApplyTimeProfilePreset = (preset: TimeProfilePreset) => {
    const currentProfiles = form.getFieldValue(["dayNight", "profiles"]) || {};
    const updatedProfiles = {
      ...currentProfiles,
      [preset.period]: {
        ...(currentProfiles[preset.period] || {}),
        ...preset.profile,
      },
    };
    form.setFieldValue(["dayNight", "profiles"], updatedProfiles);
    const updatedAll = {
      ...form.getFieldsValue(true),
      dayNight: {
        ...form.getFieldValue("dayNight"),
        profiles: updatedProfiles,
      },
    };
    handleValuesChange({}, updatedAll);
    message.success(
      `Applied preset "${preset.name}" to ${preset.period.toUpperCase()}! Review and click Save.`,
    );
  };

  const handleResetProfile = async (
    period: "morning" | "day" | "sunset" | "night",
  ) => {
    try {
      const res = await adminService.resetWorldSettings(
        `dayNight.profiles.${period}`,
      );
      if (res.data) {
        const normalized = normalizeWorldSettings(res.data);
        form.setFieldsValue(normalized);
        setLiveSettings(normalized);
        setIsDirty(false);
        queryClient.invalidateQueries({ queryKey: ["adminWorldSettings"] });
        queryClient.invalidateQueries({ queryKey: ["publicContent"] });
        message.success(`Reset ${period.toUpperCase()} profile to defaults!`);
      }
    } catch (err: any) {
      message.error(err?.message || "Failed to reset profile.");
    }
  };

  const renderProfileEditor = (
    periodKey: "morning" | "day" | "sunset" | "night",
  ) => {
    const periodPresets = TIME_PROFILE_PRESETS.filter(
      (p) => p.period === periodKey,
    );

    const presetMenuItems = periodPresets.map((p) => ({
      key: p.id,
      label: (
        <div>
          <div style={{ fontWeight: 600 }}>{p.name}</div>
          <div style={{ fontSize: "0.75rem", color: "#8a7f8e" }}>
            {p.description}
          </div>
        </div>
      ),
      onClick: () => handleApplyTimeProfilePreset(p),
    }));

    return (
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            background: "#faf8f5",
            padding: "10px 16px",
            borderRadius: 8,
          }}
        >
          <Space>
            <Text strong style={{ fontSize: "1rem" }}>
              {periodKey === "morning" && (
                <>
                  <SunOutlined style={{ color: "#fa8c16" }} /> Dawn / Morning
                  Profile
                </>
              )}
              {periodKey === "day" && (
                <>
                  <SunOutlined style={{ color: "#fadb14" }} /> Daytime Profile
                </>
              )}
              {periodKey === "sunset" && (
                <>
                  <SunOutlined style={{ color: "#d4380d" }} /> Golden Sunset
                  Profile
                </>
              )}
              {periodKey === "night" && (
                <>
                  <MoonOutlined style={{ color: "#1677ff" }} /> Starlit Night
                  Profile
                </>
              )}
            </Text>
            <Tag
              color={
                periodKey === "night"
                  ? "purple"
                  : periodKey === "sunset"
                    ? "orange"
                    : periodKey === "morning"
                      ? "cyan"
                      : "blue"
              }
            >
              {periodKey.toUpperCase()}
            </Tag>
          </Space>
          <Space>
            {periodPresets.length > 0 && (
              <Dropdown menu={{ items: presetMenuItems }} trigger={["click"]}>
                <Button size="small" icon={<ThunderboltOutlined />}>
                  Load Preset
                </Button>
              </Dropdown>
            )}
            <Popconfirm
              title={`Reset ${periodKey.toUpperCase()} profile to defaults?`}
              description="This will restore this specific time profile to factory defaults."
              onConfirm={() => handleResetProfile(periodKey)}
              okText="Reset Profile"
              cancelText="Cancel"
            >
              <Button size="small" icon={<UndoOutlined />}>
                Reset Profile
              </Button>
            </Popconfirm>
          </Space>
        </div>

        <Row gutter={[24, 16]}>
          {/* Card 1: Sky & Atmosphere */}
          <Col xs={24} md={12}>
            <Card
              title="Sky & Atmosphere"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Sky / Canvas Background Color"
                name={["dayNight", "profiles", periodKey, "backgroundColor"]}
              >
                <ColorField label="Sky color" />
              </Form.Item>
              <Form.Item
                label="Cloud Tint Color"
                name={["dayNight", "profiles", periodKey, "cloudTint"]}
              >
                <ColorField label="Clouds color" />
              </Form.Item>
              <Form.Item
                label="Pond Water Color"
                name={["dayNight", "profiles", periodKey, "pondTint"]}
              >
                <ColorField label="Water color" />
              </Form.Item>
              <Form.Item
                label="Ambience Sound Volume Multiplier"
                name={["dayNight", "profiles", periodKey, "ambienceMultiplier"]}
              >
                <Slider
                  min={0}
                  max={2}
                  step={0.05}
                  marks={{ 0: "0x", 1: "1x", 2: "2x" }}
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Card 2: Fog */}
          <Col xs={24} md={12}>
            <Card
              title="Atmospheric Fog"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Enable Fog"
                name={["dayNight", "profiles", periodKey, "fog", "enabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Fog Tint Color"
                name={["dayNight", "profiles", periodKey, "fog", "color"]}
              >
                <ColorField label="Fog color" />
              </Form.Item>
              <Form.Item
                label="Fog Near Distance"
                name={["dayNight", "profiles", periodKey, "fog", "near"]}
              >
                <Slider min={10} max={50} />
              </Form.Item>
              <Form.Item
                label="Fog Far Distance"
                name={["dayNight", "profiles", periodKey, "fog", "far"]}
              >
                <Slider min={40} max={100} />
              </Form.Item>
            </Card>
          </Col>

          {/* Card 3: Hemisphere (Ambient) Light */}
          <Col xs={24} md={12}>
            <Card
              title="Hemisphere (Ambient) Light"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Enable Hemisphere Light"
                name={[
                  "dayNight",
                  "profiles",
                  periodKey,
                  "hemisphere",
                  "enabled",
                ]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Sky Light Color"
                name={[
                  "dayNight",
                  "profiles",
                  periodKey,
                  "hemisphere",
                  "skyColor",
                ]}
              >
                <ColorField label="Upper hemisphere" />
              </Form.Item>
              <Form.Item
                label="Ground Light Color"
                name={[
                  "dayNight",
                  "profiles",
                  periodKey,
                  "hemisphere",
                  "groundColor",
                ]}
              >
                <ColorField label="Lower bounce" />
              </Form.Item>
              <Form.Item
                label="Light Intensity"
                name={[
                  "dayNight",
                  "profiles",
                  periodKey,
                  "hemisphere",
                  "intensity",
                ]}
              >
                <Slider min={0} max={5} step={0.1} />
              </Form.Item>
            </Card>
          </Col>

          {/* Card 4: Directional Light (Sun / Moon) */}
          <Col xs={24} md={12}>
            <Card
              title="Directional Key Light (Sun / Moon)"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Enable Directional Light"
                name={[
                  "dayNight",
                  "profiles",
                  periodKey,
                  "directional",
                  "enabled",
                ]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Sun / Moon Light Color"
                name={[
                  "dayNight",
                  "profiles",
                  periodKey,
                  "directional",
                  "color",
                ]}
              >
                <ColorField label="Direct beam" />
              </Form.Item>
              <Form.Item
                label="Directional Intensity"
                name={[
                  "dayNight",
                  "profiles",
                  periodKey,
                  "directional",
                  "intensity",
                ]}
              >
                <Slider min={0} max={6} step={0.1} />
              </Form.Item>
              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item
                    label="Position X"
                    name={[
                      "dayNight",
                      "profiles",
                      periodKey,
                      "directional",
                      "position",
                      "x",
                    ]}
                  >
                    <Slider min={-15} max={15} step={0.5} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Position Y"
                    name={[
                      "dayNight",
                      "profiles",
                      periodKey,
                      "directional",
                      "position",
                      "y",
                    ]}
                  >
                    <Slider min={0} max={20} step={0.5} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Position Z"
                    name={[
                      "dayNight",
                      "profiles",
                      periodKey,
                      "directional",
                      "position",
                      "z",
                    ]}
                  >
                    <Slider min={-15} max={15} step={0.5} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Card 5: Island Lighting & Atmosphere */}
          <Col xs={24} md={12}>
            <Card
              title="Island Lighting & Atmosphere"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Window Glow Multiplier"
                name={[
                  "dayNight",
                  "profiles",
                  periodKey,
                  "windowGlowMultiplier",
                ]}
              >
                <Slider
                  min={0}
                  max={3}
                  step={0.05}
                  marks={{
                    0: "Off",
                    1: "1x Normal",
                    2: "2x Cozy",
                    3: "3x Bright",
                  }}
                />
              </Form.Item>
              <Form.Item
                label="Default Street Lamp Lit"
                name={["dayNight", "profiles", periodKey, "lampDefaultLit"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Fireflies / Motes Multiplier"
                name={[
                  "dayNight",
                  "profiles",
                  periodKey,
                  "firefliesMultiplier",
                ]}
              >
                <Slider
                  min={0}
                  max={3}
                  step={0.1}
                  marks={{ 0: "0x (Off)", 1: "1x", 2: "2x", 3: "3x" }}
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Card 6: Celestial (Stars & Moon) */}
          <Col xs={24} md={12}>
            <Card
              title="Celestial (Stars & Moon)"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label="Enable Stars"
                    name={[
                      "dayNight",
                      "profiles",
                      periodKey,
                      "stars",
                      "enabled",
                    ]}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Star Density"
                    name={[
                      "dayNight",
                      "profiles",
                      periodKey,
                      "stars",
                      "density",
                    ]}
                  >
                    <Select
                      options={[
                        { value: "OFF", label: "Off (0)" },
                        { value: "SPARSE", label: "Sparse (~80)" },
                        { value: "NORMAL", label: "Normal (~160)" },
                        { value: "FULL", label: "Full (~260)" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label="Stars Brightness"
                    name={[
                      "dayNight",
                      "profiles",
                      periodKey,
                      "stars",
                      "brightness",
                    ]}
                  >
                    <Slider min={0} max={1} step={0.05} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Stars Twinkle"
                    name={[
                      "dayNight",
                      "profiles",
                      periodKey,
                      "stars",
                      "twinkle",
                    ]}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label="Enable Moon"
                    name={[
                      "dayNight",
                      "profiles",
                      periodKey,
                      "moon",
                      "enabled",
                    ]}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Moon Size"
                    name={["dayNight", "profiles", periodKey, "moon", "size"]}
                  >
                    <Select
                      options={[
                        { value: "SMALL", label: "Small" },
                        { value: "NORMAL", label: "Normal" },
                        { value: "LARGE", label: "Large" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label="Moon Color"
                    name={["dayNight", "profiles", periodKey, "moon", "color"]}
                  >
                    <ColorField label="Moon tint" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Moon Glow / Brightness"
                    name={[
                      "dayNight",
                      "profiles",
                      periodKey,
                      "moon",
                      "brightness",
                    ]}
                  >
                    <Slider min={0} max={2} step={0.05} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const tabsItems = [
    {
      key: "identity",
      label: "Identity & Intro",
      forceRender: true,
      children: (
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Card
              title="World Identity"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item label="World Title" name={["identity", "worldTitle"]}>
                <Input placeholder="Shaivi's Little World" />
              </Form.Item>
              <Form.Item
                label="Wordmark Symbol"
                name={["identity", "wordmark"]}
              >
                <Input placeholder="s✳" />
              </Form.Item>
              <Form.Item
                label="Explore Menu Button"
                name={["identity", "exploreLabel"]}
              >
                <Input placeholder="Explore" />
              </Form.Item>
              <Form.Item
                label="Instruction Text"
                name={["identity", "instructionText"]}
              >
                <Input placeholder="Tap an object to explore · drag to look around" />
              </Form.Item>
              <Form.Item
                label="Discovery Counter Label"
                name={["identity", "discoveryLabel"]}
              >
                <Input placeholder="little discoveries" />
              </Form.Item>
              <Form.Item
                label="Secret Note Message"
                name={["identity", "secretMessage"]}
              >
                <Input placeholder="A tiny secret, found." />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title="Intro Experience"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Enable Intro Experience"
                name={["intro", "enabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item label="Eyebrow Text" name={["intro", "eyebrow"]}>
                <Input placeholder="YOU’RE ALWAYS WELCOME HERE" />
              </Form.Item>
              <Form.Item label="Heading" name={["intro", "heading"]}>
                <Input placeholder="Shaivi’s little world." />
              </Form.Item>
              <Form.Item label="Body / Intro Subtext" name={["intro", "body"]}>
                <Input.TextArea
                  rows={3}
                  placeholder="A place for ideas, daydreams, and everything in between."
                />
              </Form.Item>
              <Form.Item
                label="Enter / Skip Button Label"
                name={["intro", "enterButtonLabel"]}
              >
                <Input placeholder="Skip intro →" />
              </Form.Item>
              <Form.Item
                label="Show Intro Star Badge"
                name={["intro", "starEnabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      ),
    },

    {
      key: "scene",
      label: "Scene & Atmosphere",
      forceRender: true,
      children: (
        <>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="Dynamic Day & Night Atmosphere Notice"
            description="When Dynamic Day & Night is active (configured in the Day & Night tab), the active time profile sets sky color and fog. Disabling Day & Night or customizing profiles in the Day & Night tab will apply your changes directly."
          />
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Card
                title="Sky Background"
                variant="borderless"
                style={{ background: "#fcfaf7", borderRadius: 8 }}
              >
                <Form.Item
                  label="Background Sky Color"
                  name={["scene", "backgroundColor"]}
                >
                  <ColorField label="Clear sky background" />
                </Form.Item>
                <Paragraph type="secondary" style={{ fontSize: "0.85rem" }}>
                  Tip: Fog color blends into this background color seamlessly at
                  the horizon.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                title="Atmospheric Fog"
                variant="borderless"
                style={{ background: "#fcfaf7", borderRadius: 8 }}
              >
                <Form.Item
                  label="Enable Depth Fog"
                  name={["scene", "fog", "enabled"]}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item label="Fog Color" name={["scene", "fog", "color"]}>
                  <ColorField label="Horizon fog color" />
                </Form.Item>
                <Form.Item
                  label="Fog Near Distance"
                  name={["scene", "fog", "near"]}
                >
                  <Slider min={5} max={80} step={1} />
                </Form.Item>
                <Form.Item
                  label="Fog Far Distance"
                  name={["scene", "fog", "far"]}
                >
                  <Slider min={20} max={150} step={1} />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </>
      ),
    },

    {
      key: "lighting",
      label: "Lighting & Shadows",
      forceRender: true,
      children: (
        <>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="Dynamic Day & Night Light Override Notice"
            description="When Day & Night is active, hemisphere and sun colors/intensities are driven by the active time profile. Shadow casting and shadow level configured below always apply to the 3D scene."
          />
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Card
                title="Hemisphere Light (Sky & Ground Ambient)"
                variant="borderless"
                style={{ background: "#fcfaf7", borderRadius: 8 }}
              >
                <Form.Item
                  label="Enable Hemisphere Light"
                  name={["lighting", "hemisphere", "enabled"]}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label="Sky Color"
                  name={["lighting", "hemisphere", "skyColor"]}
                >
                  <ColorField label="Upper dome light" />
                </Form.Item>
                <Form.Item
                  label="Ground Reflection Color"
                  name={["lighting", "hemisphere", "groundColor"]}
                >
                  <ColorField label="Underside bounce light" />
                </Form.Item>
                <Form.Item
                  label="Hemisphere Intensity"
                  name={["lighting", "hemisphere", "intensity"]}
                >
                  <Slider min={0} max={5} step={0.1} />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                title="Directional Sunlight & Shadows"
                variant="borderless"
                style={{ background: "#fcfaf7", borderRadius: 8 }}
              >
                <Form.Item
                  label="Enable Directional Sun"
                  name={["lighting", "directional", "enabled"]}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label="Sun Color"
                  name={["lighting", "directional", "color"]}
                >
                  <ColorField label="Direct light beam" />
                </Form.Item>
                <Form.Item
                  label="Sun Intensity"
                  name={["lighting", "directional", "intensity"]}
                >
                  <Slider min={0} max={8} step={0.1} />
                </Form.Item>
                <Form.Item label="Sun Beam Position (X, Y, Z)">
                  <Space style={{ width: "100%" }} direction="vertical">
                    <Form.Item
                      name={["lighting", "directional", "position", "x"]}
                      label="X (Horizontal)"
                      style={{ marginBottom: 8 }}
                    >
                      <Slider min={-20} max={20} step={1} />
                    </Form.Item>
                    <Form.Item
                      name={["lighting", "directional", "position", "y"]}
                      label="Y (Height)"
                      style={{ marginBottom: 8 }}
                    >
                      <Slider min={1} max={30} step={1} />
                    </Form.Item>
                    <Form.Item
                      name={["lighting", "directional", "position", "z"]}
                      label="Z (Depth)"
                      style={{ marginBottom: 0 }}
                    >
                      <Slider min={-20} max={20} step={1} />
                    </Form.Item>
                  </Space>
                </Form.Item>
                <Form.Item
                  label="Cast Shadows"
                  name={["lighting", "directional", "castShadow"]}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label="Shadow Quality Level"
                  name={["lighting", "shadowLevel"]}
                >
                  <Select
                    options={[
                      { value: "OFF", label: "Off (Performance)" },
                      { value: "BALANCED", label: "Balanced (1024x1024)" },
                      { value: "HIGH", label: "High (2048x2048 Soft)" },
                    ]}
                  />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </>
      ),
    },

    {
      key: "dayNight",
      label: "Day & Night",
      forceRender: true,
      children: (
        <Space orientation="vertical" size={24} style={{ width: "100%" }}>
          {/* Card 1: System Settings */}
          <Card
            title="Day & Night Dynamic System"
            variant="borderless"
            style={{ background: "#fcfaf7", borderRadius: 8 }}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Enable Dynamic Day / Night"
                  name={["dayNight", "enabled"]}
                  valuePropName="checked"
                  tooltip="When disabled, world defaults to static Day settings."
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Cycle Mode"
                  name={["dayNight", "mode"]}
                  tooltip="Automatic transitions based on clock, or Fixed locks to a specific period."
                >
                  <Select
                    options={[
                      {
                        value: "automatic",
                        label: "Automatic (Schedule-based)",
                      },
                      { value: "fixed", label: "Fixed Time of Day" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Fixed Period (When in Fixed Mode)"
                  name={["dayNight", "fixedPeriod"]}
                >
                  <Select
                    options={[
                      { value: "MORNING", label: "🌅 Morning" },
                      { value: "DAY", label: "☀️ Day" },
                      { value: "SUNSET", label: "🌇 Sunset" },
                      { value: "NIGHT", label: "🌙 Night" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Clock Time Source"
                  name={["dayNight", "timeSource"]}
                  tooltip="Visitor Local uses browser clock; Fixed Timezone uses a designated IANA timezone."
                >
                  <Select
                    options={[
                      {
                        value: "visitor-local",
                        label: "Visitor's Local Clock",
                      },
                      { value: "fixed-timezone", label: "Fixed Timezone" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Fixed Timezone"
                  name={["dayNight", "fixedTimezone"]}
                  tooltip="Select or enter any valid IANA timezone name."
                >
                  <Select
                    showSearch
                    placeholder="e.g. Asia/Kolkata"
                    options={[
                      {
                        value: "Asia/Kolkata",
                        label: "Asia/Kolkata (IST +5:30)",
                      },
                      {
                        value: "UTC",
                        label: "UTC (Coordinated Universal Time)",
                      },
                      {
                        value: "America/New_York",
                        label: "America/New_York (US Eastern)",
                      },
                      {
                        value: "America/Chicago",
                        label: "America/Chicago (US Central)",
                      },
                      {
                        value: "America/Denver",
                        label: "America/Denver (US Mountain)",
                      },
                      {
                        value: "America/Los_Angeles",
                        label: "America/Los_Angeles (US Pacific)",
                      },
                      {
                        value: "Europe/London",
                        label: "Europe/London (UK GMT/BST)",
                      },
                      {
                        value: "Europe/Paris",
                        label: "Europe/Paris (Central Europe CET)",
                      },
                      {
                        value: "Asia/Dubai",
                        label: "Asia/Dubai (GST +4:00)",
                      },
                      {
                        value: "Asia/Singapore",
                        label: "Asia/Singapore (SGT +8:00)",
                      },
                      {
                        value: "Asia/Tokyo",
                        label: "Asia/Tokyo (JST +9:00)",
                      },
                      {
                        value: "Australia/Sydney",
                        label: "Australia/Sydney (AEST)",
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Allow Visitor Manual Override"
                  name={["dayNight", "allowVisitorOverride"]}
                  valuePropName="checked"
                  tooltip="Allows visitors on the public portfolio to choose their desired time of day."
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Smooth Lighting Transitions"
                  name={["dayNight", "transition", "enabled"]}
                  valuePropName="checked"
                  tooltip="Gradually lerps sky and light colors across seconds rather than jumping."
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Transition Duration (Seconds)"
                  name={["dayNight", "transition", "durationSeconds"]}
                  tooltip="How long atmospheric transitions take to complete."
                >
                  <Slider
                    min={0}
                    max={20}
                    marks={{
                      0: "Instant",
                      4: "4s",
                      6: "6s",
                      10: "10s",
                      15: "15s",
                      20: "20s",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Card: Music Mood Integration */}
          <Card
            title={
              <span>
                <SoundOutlined /> Music Mood Atmosphere Integration
              </span>
            }
            variant="borderless"
            style={{ background: "#fbf9fc", borderRadius: 8 }}
          >
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
              When enabled, selecting a music mood in the visitor music clock
              subtly modulates the 3D world lighting, fog, clouds, and float
              motion without replacing the base Day/Night cycle. Configure
              individual mood visual effects under{" "}
              <strong>Music &gt; Mood Palettes</strong>.
            </Paragraph>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Enable Music Mood Atmosphere Effects"
                  name={["musicMood", "enabled"]}
                  valuePropName="checked"
                  tooltip="Global toggle for whether visitor music mood selections alter 3D island atmosphere."
                >
                  <Switch
                    checkedChildren="Enabled"
                    unCheckedChildren="Disabled"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={16}>
                <Form.Item
                  label="Mood Transition Duration (Seconds)"
                  name={["musicMood", "transitionDuration"]}
                  tooltip="Cross-fade transition speed when the visitor switches music moods."
                >
                  <Slider
                    min={0.5}
                    max={10.0}
                    step={0.5}
                    marks={{
                      0.5: "0.5s",
                      2.5: "2.5s (Default)",
                      5: "5.0s",
                      10: "10.0s",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Card 2: 24h Daily Schedule */}
          <Card
            title="Daily Schedule (24-Hour Clock HH:mm)"
            variant="borderless"
            style={{ background: "#fcfaf7", borderRadius: 8 }}
          >
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
              Set start times in 24-hour format (e.g. <code>05:30</code>). Must
              maintain strict sequential order: Morning &lt; Day &lt; Sunset
              &lt; Night. Night spans past midnight to morning dawn.
            </Paragraph>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Form.Item
                  label={
                    <span>
                      <SunOutlined style={{ color: "#fa8c16" }} /> Dawn Start
                    </span>
                  }
                  name={["dayNight", "schedule", "morningStart"]}
                  rules={[
                    {
                      pattern: /^([01]\d|2[0-3]):([0-5]\d)$/,
                      message: "Format HH:mm",
                    },
                  ]}
                >
                  <Input placeholder="05:30" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item
                  label={
                    <span>
                      <SunOutlined style={{ color: "#fadb14" }} /> Daytime Start
                    </span>
                  }
                  name={["dayNight", "schedule", "dayStart"]}
                  rules={[
                    {
                      pattern: /^([01]\d|2[0-3]):([0-5]\d)$/,
                      message: "Format HH:mm",
                    },
                  ]}
                >
                  <Input placeholder="08:00" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item
                  label={
                    <span>
                      <SunOutlined style={{ color: "#d4380d" }} /> Sunset Start
                    </span>
                  }
                  name={["dayNight", "schedule", "sunsetStart"]}
                  rules={[
                    {
                      pattern: /^([01]\d|2[0-3]):([0-5]\d)$/,
                      message: "Format HH:mm",
                    },
                  ]}
                >
                  <Input placeholder="17:00" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item
                  label={
                    <span>
                      <MoonOutlined style={{ color: "#1677ff" }} /> Night Start
                    </span>
                  }
                  name={["dayNight", "schedule", "nightStart"]}
                  rules={[
                    {
                      pattern: /^([01]\d|2[0-3]):([0-5]\d)$/,
                      message: "Format HH:mm",
                    },
                  ]}
                >
                  <Input placeholder="19:00" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Card 3: Four Time Profiles */}
          <Card
            title="Time-of-Day Profiles"
            variant="borderless"
            style={{
              background: "#ffffff",
              borderRadius: 8,
              border: "1px solid #f0edf0",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <Segmented
                size="large"
                value={selectedProfileTab}
                onChange={(val) => setSelectedProfileTab(val as any)}
                options={[
                  {
                    label: (
                      <span>
                        <SunOutlined style={{ color: "#fa8c16" }} /> Dawn
                      </span>
                    ),
                    value: "morning",
                  },
                  {
                    label: (
                      <span>
                        <SunOutlined style={{ color: "#fadb14" }} /> Daytime
                      </span>
                    ),
                    value: "day",
                  },
                  {
                    label: (
                      <span>
                        <SunOutlined style={{ color: "#d4380d" }} /> Sunset
                      </span>
                    ),
                    value: "sunset",
                  },
                  {
                    label: (
                      <span>
                        <MoonOutlined style={{ color: "#1677ff" }} /> Night
                      </span>
                    ),
                    value: "night",
                  },
                ]}
              />
            </div>

            {renderProfileEditor(selectedProfileTab)}
          </Card>
        </Space>
      ),
    },

    {
      key: "island",
      label: "Island & Nature",
      forceRender: true,
      children: (
        <Row gutter={[24, 16]}>
          <Col xs={24} md={8}>
            <Card
              title="Terrain & Grass"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Terrain Underside Color"
                name={["island", "terrainColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Grass Edge Rim Color"
                name={["island", "grassEdgeColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Grass Top Surface Color"
                name={["island", "grassTopColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Stepping Stones Visible"
                name={["island", "steppingStonesVisible"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Stepping Stones Color"
                name={["island", "steppingStonesColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Wooden Bench Visible"
                name={["island", "benchVisible"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Bench Wood Color"
                name={["island", "benchWoodColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Bench Legs Color"
                name={["island", "benchLegsColor"]}
              >
                <ColorField />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              title="Trees & Foliage"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Enable Island Trees"
                name={["island", "trees", "enabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Tree Trunk Color"
                name={["island", "trees", "trunkColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Leaves Color"
                name={["island", "trees", "leavesColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Tree Sway Animation"
                name={["island", "trees", "swayEnabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Sway Strength"
                name={["island", "trees", "swayStrength"]}
              >
                <Slider min={0.005} max={0.04} step={0.002} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              title="Pond & Flowers"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Enable Pond"
                name={["island", "pond", "enabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Water Color"
                name={["island", "pond", "waterColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Pond Border Stones"
                name={["island", "pond", "stonesColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Pond Water Ripples"
                name={["island", "pond", "rippleEnabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Ripple Highlight Color"
                name={["island", "pond", "rippleColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Enable Flowers"
                name={["island", "flowers", "enabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Flower Density"
                name={["island", "flowers", "density"]}
              >
                <Select
                  options={[
                    { value: "LOW", label: "Low (30 flowers)" },
                    { value: "MEDIUM", label: "Medium (60 flowers)" },
                    { value: "HIGH", label: "High (90 flowers)" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="Primary Flower Color"
                name={["island", "flowers", "primaryColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Secondary Flower Color"
                name={["island", "flowers", "secondaryColor"]}
              >
                <ColorField />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      ),
    },

    {
      key: "environment",
      label: "Clouds & Details",
      forceRender: true,
      children: (
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Card
              title="Sky Clouds"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Enable Clouds"
                name={["environment", "clouds", "enabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Clouds Color"
                name={["environment", "clouds", "color"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Clouds Drift Motion"
                name={["environment", "clouds", "motionEnabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Clouds Drift Speed"
                name={["environment", "clouds", "speed"]}
              >
                <Slider min={0.2} max={3.0} step={0.1} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title="Environment Details"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Street Lamp"
                name={["environment", "details", "lampEnabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Lamp Default Lit State"
                name={["environment", "details", "lampDefaultLit"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Lamp Post Color"
                name={["environment", "details", "lampPostColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Lamp Glow Color"
                name={["environment", "details", "lampGlowColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Wood Bridge Visible"
                name={["environment", "details", "bridgeVisible"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Bridge Wood Color"
                name={["environment", "details", "bridgeColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Ambient Light Motes"
                name={["environment", "details", "motesEnabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Motes Amount"
                name={["environment", "details", "motesAmount"]}
              >
                <Select
                  options={[
                    { value: "OFF", label: "Off" },
                    { value: "SUBTLE", label: "Subtle (4 particles)" },
                    { value: "FULL", label: "Full (8 particles)" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="Motes Color"
                name={["environment", "details", "motesColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Tea Mug Steam Animation"
                name={["environment", "details", "mugSteamEnabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Books Stack Visible"
                name={["environment", "details", "booksVisible"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      ),
    },

    {
      key: "motion",
      label: "Motion & Interactions",
      forceRender: true,
      children: (
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Card
              title="Island Floating Motion"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Enable Island Floating Bob"
                name={["motion", "islandFloatEnabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Float Amplitude / Height"
                name={["motion", "islandFloatStrength"]}
              >
                <Slider min={0.01} max={0.25} step={0.01} />
              </Form.Item>
              <Form.Item
                label="Float Speed"
                name={["motion", "islandFloatSpeed"]}
              >
                <Slider min={0.1} max={1.5} step={0.05} />
              </Form.Item>
              <Form.Item
                label="Subtle Rotation Drift"
                name={["motion", "islandRotationDrift"]}
              >
                <Slider min={0} max={0.05} step={0.005} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title="Interactive Secrets & Tree Shaking"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Object Hover Scale Effect"
                name={["interactions", "hoverScale"]}
              >
                <Select
                  options={[
                    { value: "NONE", label: "None (1.0x)" },
                    { value: "SUBTLE", label: "Subtle (1.02x)" },
                    { value: "NORMAL", label: "Normal (1.035x)" },
                    { value: "PLAYFUL", label: "Playful (1.06x)" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="Enable Tree Shaking on Click"
                name={["interactions", "treeShakeEnabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Tree Shake Strength"
                name={["interactions", "treeShakeStrength"]}
              >
                <Select
                  options={[
                    { value: "SUBTLE", label: "Gentle" },
                    { value: "NORMAL", label: "Standard" },
                    { value: "PLAYFUL", label: "Playful / Vigorous" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="Enable Flying Page Secret (Hogwarts Style)"
                name={["interactions", "butterflySecret", "enabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Flying Page Parchment Color"
                name={["interactions", "butterflySecret", "butterflyColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Required Clicks to Catch Page"
                name={["interactions", "butterflySecret", "requiredClicks"]}
              >
                <Slider min={1} max={8} step={1} />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      ),
    },

    {
      key: "objects",
      label: "3D Objects Appearance",
      forceRender: true,
      children: (
        <Row gutter={[24, 16]}>
          {/* House (About) */}
          <Col xs={24} md={8}>
            <Card
              title="House (Meet Artist)"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Visible in Scene"
                name={["objects", "house", "visible"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Wall Color"
                name={["objects", "house", "wallColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Roof Color"
                name={["objects", "house", "roofColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Door Color"
                name={["objects", "house", "doorColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Window Glow"
                name={["objects", "house", "windowGlowEnabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Window Glow Color"
                name={["objects", "house", "windowGlowColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Window Glow Intensity"
                name={["objects", "house", "windowGlowIntensity"]}
              >
                <Slider min={0} max={1} step={0.05} />
              </Form.Item>
              <Form.Item
                label="Chimney Smoke"
                name={["objects", "house", "chimneySmokeEnabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Vines & Plants"
                name={["objects", "house", "plantsEnabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>

          {/* Desk (Quotes) */}
          <Col xs={24} md={8}>
            <Card
              title="Desk & Monitor (Quotes)"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Visible in Scene"
                name={["objects", "desk", "visible"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Wood Color"
                name={["objects", "desk", "woodColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Frame Metal Color"
                name={["objects", "desk", "frameColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Active Screen Color"
                name={["objects", "desk", "screenActiveColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Inactive Screen Color"
                name={["objects", "desk", "screenInactiveColor"]}
              >
                <ColorField />
              </Form.Item>
            </Card>
          </Col>

          {/* Art Wall (Gallery) */}
          <Col xs={24} md={8}>
            <Card
              title="Art Wall & Easel (Gallery)"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Visible in Scene"
                name={["objects", "artWall", "visible"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Frame Color"
                name={["objects", "artWall", "frameColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Canvas Color"
                name={["objects", "artWall", "canvasColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Easel Wood Color"
                name={["objects", "artWall", "easelColor"]}
              >
                <ColorField />
              </Form.Item>
            </Card>
          </Col>

          {/* Telescope (Journey) */}
          <Col xs={24} md={8}>
            <Card
              title="Telescope (Star Journey)"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Visible in Scene"
                name={["objects", "telescope", "visible"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Body Color"
                name={["objects", "telescope", "bodyColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Stand Color"
                name={["objects", "telescope", "standColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Accent Ring Color"
                name={["objects", "telescope", "accentColor"]}
              >
                <ColorField />
              </Form.Item>
            </Card>
          </Col>

          {/* Mailbox (Contact) */}
          <Col xs={24} md={8}>
            <Card
              title="Mailbox (Post a Letter)"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Visible in Scene"
                name={["objects", "mailbox", "visible"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Body Color"
                name={["objects", "mailbox", "bodyColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Post Color"
                name={["objects", "mailbox", "postColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Flag Color"
                name={["objects", "mailbox", "flagColor"]}
              >
                <ColorField />
              </Form.Item>
            </Card>
          </Col>

          {/* Record Player (Music) */}
          <Col xs={24} md={8}>
            <Card
              title="Music Player (Songs & Moods)"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item
                label="Visible in Scene"
                name={["objects", "clock", "visible"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Body Color"
                name={["objects", "clock", "bodyColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Turntable / Face Color"
                name={["objects", "clock", "faceColor"]}
              >
                <ColorField />
              </Form.Item>
              <Form.Item
                label="Needle / Hand Color"
                name={["objects", "clock", "handColor"]}
              >
                <ColorField />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      ),
    },

    {
      key: "sections",
      label: "Sections & Camera",
      forceRender: true,
      children: (
        <Row gutter={[24, 16]}>
          <Col xs={24} md={14}>
            <Card
              title={
                <Space>
                  <span>Sections Availability & Labels</span>
                  <Tag color="blue">{enabledSectionCount} of 6 Enabled</Tag>
                </Space>
              }
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              {(
                [
                  { key: "ABOUT", defaultLabel: "Artist", defaultIcon: "⌂" },
                  { key: "QUOTES", defaultLabel: "Quotes", defaultIcon: "✳" },
                  {
                    key: "GALLERY",
                    defaultLabel: "Art Gallery",
                    defaultIcon: "▧",
                  },
                  {
                    key: "JOURNEY",
                    defaultLabel: "Star Journey",
                    defaultIcon: "✧",
                  },
                  {
                    key: "CONTACT",
                    defaultLabel: "Post a Letter",
                    defaultIcon: "✉",
                  },
                  {
                    key: "MUSIC",
                    defaultLabel: "Music & Moods",
                    defaultIcon: "♫",
                  },
                ] as const
              ).map(({ key, defaultLabel, defaultIcon }) => {
                const isOnlyOneLeft =
                  enabledSectionCount <= 1 &&
                  liveSettings.sections?.[key]?.enabled;

                return (
                  <Card
                    key={key}
                    size="small"
                    variant="outlined"
                    style={{ marginBottom: 12, background: "#fff" }}
                  >
                    <Row gutter={16} align="middle">
                      <Col xs={8} sm={6}>
                        <Form.Item
                          name={["sections", key, "enabled"]}
                          valuePropName="checked"
                          noStyle
                        >
                          <Switch
                            disabled={isOnlyOneLeft}
                            checkedChildren="On"
                            unCheckedChildren="Off"
                          />
                        </Form.Item>
                        <span style={{ marginLeft: 8, fontWeight: 600 }}>
                          {key}
                        </span>
                      </Col>

                      <Col xs={10} sm={12}>
                        <Form.Item name={["sections", key, "label"]} noStyle>
                          <Input placeholder={defaultLabel} />
                        </Form.Item>
                      </Col>

                      <Col xs={6} sm={6}>
                        <Form.Item name={["sections", key, "icon"]} noStyle>
                          <Input
                            placeholder={defaultIcon}
                            style={{ textAlign: "center" }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                );
              })}
            </Card>
          </Col>

          <Col xs={24} md={10}>
            <Card
              title="Camera Behavior"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8 }}
            >
              <Form.Item label="Travel Speed" name={["camera", "travelSpeed"]}>
                <Select
                  options={[
                    { value: "INSTANT", label: "Instant (Snap)" },
                    { value: "FAST", label: "Fast & Snappy" },
                    { value: "NORMAL", label: "Balanced (Default)" },
                    { value: "CINEMATIC", label: "Slow & Meditative" },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Easing Curve" name={["camera", "easing"]}>
                <Select
                  options={[
                    { value: "SMOOTH", label: "Smooth (Cubic In/Out)" },
                    { value: "SOFT", label: "Soft (Sine Wave)" },
                    { value: "CINEMATIC", label: "Cinematic (Power3 In/Out)" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="Arc Height Lift"
                name={["camera", "arcStrength"]}
              >
                <Select
                  options={[
                    { value: "NONE", label: "None (Direct Line)" },
                    { value: "SUBTLE", label: "Subtle Arch" },
                    { value: "NORMAL", label: "Gentle Arch (Default)" },
                    { value: "CINEMATIC", label: "High Cinematic Arch" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="Enable Orbit Dragging in World"
                name={["camera", "orbitEnabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Orbit Drag Speed"
                name={["camera", "orbitSpeed"]}
              >
                <Slider min={0.1} max={1.0} step={0.05} />
              </Form.Item>
              <Form.Item label="Framing Preset" name={["camera", "framing"]}>
                <Select
                  options={[
                    { value: "CLOSE", label: "Close-up / Intimate" },
                    { value: "BALANCED", label: "Balanced Overview (Default)" },
                    { value: "WIDE", label: "Wide View / Expansive" },
                  ]}
                />
              </Form.Item>
            </Card>

            <Card
              title="Audio Ambience"
              variant="borderless"
              style={{ background: "#fcfaf7", borderRadius: 8, marginTop: 16 }}
            >
              <Form.Item
                label="Sound Enabled by Default"
                name={["ambience", "soundEnabled"]}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                label="Default Volume"
                name={["ambience", "defaultVolume"]}
              >
                <Slider min={0} max={100} step={5} />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div>
      {/* Top action bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            3D World Experience CMS
          </Title>
          <Text type="secondary" style={{ fontSize: "0.85rem" }}>
            Customize the Three.js island, lighting, atmosphere, and sections.
          </Text>
        </div>

        <Space wrap>
          {isDirty && (
            <Tag color="warning" icon={<ThunderboltOutlined />}>
              Unsaved Changes
            </Tag>
          )}

          <Button
            icon={<EyeOutlined />}
            onClick={() => setPreviewOpen(true)}
            style={{ borderColor: "#8a6d79", color: "#8a6d79" }}
          >
            Live 3D Preview
          </Button>

          <Dropdown
            menu={{
              items: [
                {
                  key: "presets",
                  icon: <ThunderboltOutlined />,
                  label: "Theme Presets",
                  children: presetMenuItems,
                },
                { type: "divider" },
                {
                  key: "reset-tab",
                  icon: <UndoOutlined />,
                  label: `Reset "${activeTab}" Tab`,
                },
                {
                  key: "reset-all",
                  icon: <ReloadOutlined />,
                  label: "Reset All Settings",
                  danger: true,
                },
              ],
              onClick: ({ key }) => {
                if (key === "reset-tab") {
                  modal.confirm({
                    title: "Reset this section to defaults?",
                    content: `This will reset only the "${activeTab}" category.`,
                    okText: "Reset Category",
                    cancelText: "Cancel",
                    onOk: () => resetMutation.mutate(activeTab),
                  });
                } else if (key === "reset-all") {
                  modal.confirm({
                    title: "Reset ALL world settings?",
                    content:
                      "This will restore the entire 3D world to original factory defaults.",
                    okText: "Reset All",
                    okButtonProps: { danger: true },
                    cancelText: "Cancel",
                    onOk: () => resetMutation.mutate(),
                  });
                }
              },
            }}
            trigger={["click"]}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={updateMutation.isPending}
            style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
          >
            Save World Settings
          </Button>
        </Space>
      </div>

      <Card
        variant="borderless"
        style={{ borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        {isLoading && <Skeleton active paragraph={{ rows: 12 }} />}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
          initialValues={initialFormValues}
          style={{ display: isLoading ? "none" : "block" }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabsItems}
            destroyOnHidden={false}
            tabBarStyle={{ marginBottom: 24 }}
          />
        </Form>
      </Card>

      {/* Live 3D Preview Drawer */}
      <Drawer
        title={
          <Space>
            <span>Live 3D World Preview</span>
            <Tag color="cyan">Interactive</Tag>
          </Space>
        }
        placement="right"
        size="large"
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        styles={{
          wrapper: { width: "min(720px, 100vw)" },
          body: { padding: 12, display: "flex", flexDirection: "column" },
        }}
      >
        <div style={{ flex: 1, minHeight: "clamp(280px, 50vh, 480px)" }}>
          <WorldPreviewCanvas settings={liveSettings} />
        </div>
        <div style={{ marginTop: 12, textAlign: "right" }}>
          <Space>
            <Button onClick={() => setPreviewOpen(false)}>Close Preview</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => {
                form.submit();
                setPreviewOpen(false);
              }}
              style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
            >
              Save Now
            </Button>
          </Space>
        </div>
      </Drawer>
    </div>
  );
}
