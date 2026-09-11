"use client";

import { MOOD_PRESETS, NEUTRAL_WORLD_EFFECT } from "@/utils/moodPresets";
import {
  Button,
  Card,
  Col,
  Collapse,
  Form,
  type FormInstance,
  Input,
  Row,
  Slider,
  Space,
  Switch,
  Tag,
  Typography,
} from "antd";

function ColorField({
  value,
  onChange,
  label,
}: {
  value?: string;
  onChange?: (val: string) => void;
  label?: string;
}) {
  const safeHex =
    value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ffffff";

  return (
    <Space style={{ width: "100%" }}>
      <input
        type="color"
        value={safeHex}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: 34,
          height: 30,
          padding: 2,
          borderRadius: 6,
          border: "1px solid #d9d9d9",
          cursor: "pointer",
        }}
      />
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ width: 105, fontFamily: "monospace", fontSize: "12px" }}
        placeholder="#ffffff"
      />
      {label && (
        <span style={{ color: "#706773", fontSize: "0.8rem" }}>{label}</span>
      )}
    </Space>
  );
}

interface MoodWorldEffectEditorProps {
  form: FormInstance;
  onApplyPreset?: (presetKey: string) => void;
  onResetEffect?: () => void;
}

export default function MoodWorldEffectEditor({
  form,
  onApplyPreset,
  onResetEffect,
}: MoodWorldEffectEditorProps) {
  const handleApplyPreset = (key: string) => {
    const preset = MOOD_PRESETS[key];
    if (!preset) return;
    form.setFieldsValue({
      worldEffect: {
        ...preset.effect,
      },
    });
    onApplyPreset?.(key);
  };

  const handleReset = () => {
    form.setFieldsValue({
      worldEffect: {
        ...NEUTRAL_WORLD_EFFECT,
      },
    });
    onResetEffect?.();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Presets Toolbar */}
      <Card
        size="small"
        style={{ background: "#fbf9fa", borderRadius: "8px" }}
      >
        <Typography.Text
          strong
          style={{
            fontSize: "12px",
            display: "block",
            marginBottom: "8px",
            color: "#5b4e5d",
          }}
        >
          Curated Mood Presets:
        </Typography.Text>
        <Space wrap size={[6, 6]}>
          {Object.entries(MOOD_PRESETS).map(([key, item]) => (
            <Button
              key={key}
              size="small"
              onClick={() => handleApplyPreset(key)}
              style={{ fontSize: "12px" }}
            >
              {item.label}
            </Button>
          ))}
          <Button
            size="small"
            danger
            onClick={handleReset}
            style={{ fontSize: "12px" }}
          >
            Reset to Neutral
          </Button>
        </Space>
      </Card>

      {/* Master Controls */}
      <Row gutter={16}>
        <Col span={10}>
          <Form.Item
            label="World Effect Enabled"
            name={["worldEffect", "enabled"]}
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Disabled"
            />
          </Form.Item>
        </Col>
        <Col span={14}>
          <Form.Item
            label="Overall Intensity"
            name={["worldEffect", "intensity"]}
            initialValue={0.8}
            extra="Blends atmospheric effect strength (0% to 100%)"
          >
            <Slider
              min={0}
              max={1}
              step={0.05}
              marks={{ 0: "0%", 0.5: "50%", 1: "100%" }}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Accordion Panels for Dimensions */}
      <Collapse
        defaultActiveKey={["scene", "lighting", "atmosphere"]}
        size="small"
        items={[
          {
            key: "scene",
            label: "🌌 Scene & Fog",
            children: (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Background Tint"
                    name={["worldEffect", "scene", "tint"]}
                  >
                    <ColorField label="Atmosphere tint" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Tint Strength"
                    name={["worldEffect", "scene", "tintStrength"]}
                    initialValue={0.2}
                    extra="Blend weight (0.0 to 0.5)"
                  >
                    <Slider min={0} max={0.5} step={0.02} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Fog Density Multiplier"
                    name={["worldEffect", "scene", "fogMultiplier"]}
                    initialValue={1.0}
                    extra="> 1.0 brings fog closer and makes air denser"
                  >
                    <Slider
                      min={0.7}
                      max={1.5}
                      step={0.05}
                      marks={{ 0.7: "0.7x", 1.0: "1.0x", 1.5: "1.5x" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ),
          },
          {
            key: "lighting",
            label: "💡 Lighting & Sun",
            children: (
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Light Intensity Multiplier"
                    name={["worldEffect", "lighting", "intensityMultiplier"]}
                    initialValue={1.0}
                    extra="Modulates directional & hemisphere light intensity"
                  >
                    <Slider
                      min={0.5}
                      max={1.5}
                      step={0.05}
                      marks={{ 0.5: "Dim (0.5x)", 1.0: "1.0x", 1.5: "Bright (1.5x)" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Light Color Tint"
                    name={["worldEffect", "lighting", "tint"]}
                  >
                    <ColorField label="Sun/Ambient tint" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Light Tint Strength"
                    name={["worldEffect", "lighting", "tintStrength"]}
                    initialValue={0.2}
                  >
                    <Slider min={0} max={0.4} step={0.02} />
                  </Form.Item>
                </Col>
              </Row>
            ),
          },
          {
            key: "atmosphere",
            label: "✨ Atmosphere, Glow & Sky",
            children: (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Star Brightness"
                    name={["worldEffect", "atmosphere", "starBrightnessMultiplier"]}
                    initialValue={1.0}
                  >
                    <Slider min={0.5} max={1.5} step={0.05} marks={{ 0.5: "0.5x", 1.0: "1.0x", 1.5: "1.5x" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Firefly Density"
                    name={["worldEffect", "atmosphere", "fireflyMultiplier"]}
                    initialValue={1.0}
                  >
                    <Slider min={0} max={2.0} step={0.1} marks={{ 0: "0x", 1.0: "1.0x", 2.0: "2.0x" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Cloud Speed"
                    name={["worldEffect", "atmosphere", "cloudSpeedMultiplier"]}
                    initialValue={1.0}
                  >
                    <Slider min={0.2} max={2.5} step={0.1} marks={{ 0.2: "0.2x", 1.0: "1.0x", 2.5: "2.5x" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Moon Brightness"
                    name={["worldEffect", "atmosphere", "moonBrightnessMultiplier"]}
                    initialValue={1.0}
                  >
                    <Slider min={0.3} max={1.8} step={0.05} marks={{ 0.3: "0.3x", 1.0: "1.0x", 1.8: "1.8x" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Window Glow"
                    name={["worldEffect", "atmosphere", "windowGlowMultiplier"]}
                    initialValue={1.0}
                  >
                    <Slider min={0.2} max={2.5} step={0.1} marks={{ 0.2: "0.2x", 1.0: "1.0x", 2.5: "2.5x" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Lamp Glow"
                    name={["worldEffect", "atmosphere", "lampGlowMultiplier"]}
                    initialValue={1.0}
                  >
                    <Slider min={0.2} max={2.5} step={0.1} marks={{ 0.2: "0.2x", 1.0: "1.0x", 2.5: "2.5x" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Cloud Tint"
                    name={["worldEffect", "atmosphere", "cloudTint"]}
                  >
                    <ColorField label="Cloud color tint" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Cloud Tint Strength"
                    name={["worldEffect", "atmosphere", "cloudTintStrength"]}
                    initialValue={0.25}
                  >
                    <Slider min={0} max={0.5} step={0.02} />
                  </Form.Item>
                </Col>
              </Row>
            ),
          },
          {
            key: "environment",
            label: "🌿 Environment & Pond",
            children: (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Pond Water Tint"
                    name={["worldEffect", "environment", "pondTint"]}
                  >
                    <ColorField label="Water color tint" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Pond Tint Strength"
                    name={["worldEffect", "environment", "pondTintStrength"]}
                    initialValue={0.3}
                  >
                    <Slider min={0} max={0.5} step={0.02} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Flower Vibrancy Multiplier"
                    name={["worldEffect", "environment", "flowerBrightnessMultiplier"]}
                    initialValue={1.0}
                    extra="Adjust flower petal color brightness"
                  >
                    <Slider min={0.5} max={1.8} step={0.05} marks={{ 0.5: "0.5x", 1.0: "1.0x", 1.8: "1.8x" }} />
                  </Form.Item>
                </Col>
              </Row>
            ),
          },
          {
            key: "motion",
            label: "🌊 Motion & Float Drift",
            children: (
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Global Motion Speed Multiplier"
                    name={["worldEffect", "motion", "globalSpeedMultiplier"]}
                    initialValue={1.0}
                    extra="Modulates island float, tree sway, and motes speed (reduced motion always forces 0)"
                  >
                    <Slider
                      min={0.2}
                      max={2.0}
                      step={0.05}
                      marks={{ 0.2: "Gentle (0.2x)", 1.0: "1.0x", 2.0: "Breezy (2.0x)" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ),
          },
        ]}
      />
    </div>
  );
}
