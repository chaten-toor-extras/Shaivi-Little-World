"use client";

import SecretRevealLayer from "@/components/ui/secret/SecretRevealLayer";
import { adminService, type ReorderItem } from "@/services/admin.service";
import { secretStorage } from "@/services/secretStorage";
import { useSecretStore } from "@/store/useSecretStore";
import type {
  Collectible,
  Mood,
  Secret,
  SecretRevealPayload,
  SecretRevealType,
  SecretTargetType,
  SecretTriggerType,
  SecretVisualEffect,
} from "@/types";
import {
  AimOutlined,
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  BookOutlined,
  BranchesOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  CopyOutlined,
  CustomerServiceOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  GiftOutlined,
  GlobalOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  LockOutlined,
  MailOutlined,
  MessageOutlined,
  MoreOutlined,
  PictureOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  SoundOutlined,
  SyncOutlined,
  ThunderboltOutlined,
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
  Slider,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./SecretAdmin.module.css";

const { Text } = Typography;

// Helper to auto-generate clean slugs from user-typed names
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Clean headline display without decorative symbols
function cleanDisplayTitle(title?: string): string {
  if (!title) return "Discovery Card";
  return title.replace(/[✦✧☽✳*]/g, "").trim() || title;
}

// Format trigger for clean, single-glance table presentation
function formatTriggerSummary(trigger?: Secret["trigger"]): { main: string; sub?: string } {
  if (!trigger) return { main: "Single Click" };
  const count = trigger.requiredCount || 1;
  const windowSec = trigger.windowMs ? Math.round(trigger.windowMs / 1000) : 0;
  const sub = windowSec > 0 ? `within ${windowSec}s` : undefined;

  switch (trigger.type) {
    case "MULTI_CLICK":
      return { main: `${count} Clicks`, sub };
    case "CLICK":
      return { main: count > 1 ? `${count} Clicks` : "Single Click", sub };
    case "TOGGLE":
      return { main: count > 1 ? `${count} Toggles` : "Toggle State", sub };
    case "RIPPLE":
      return { main: `${count} Ripples`, sub };
    case "SHAKE":
      return { main: count > 1 ? `${count} Shakes` : "Shake Tree", sub };
    case "LETTER_SENT":
      return { main: "Send Letter" };
    case "JOURNEY_VIEWED":
      return { main: "View Journey" };
    case "MOOD_SELECTED":
      return { main: "Change Mood" };
    case "VISIT_SECTION":
      return { main: "Visit Section" };
    case "HOVER":
      return { main: "Hover Cursor" };
    case "TIME_ENTERED":
      return { main: "Time Change" };
    default:
      return { main: trigger.type, sub };
  }
}

// Friendly presets for 3D world interactive targets
interface TargetPreset {
  key: string;
  type: SecretTargetType;
  defaultId: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  recommendedTrigger: SecretTriggerType;
  recommendedCount: number;
}

const TARGET_PRESETS: TargetPreset[] = [
  {
    key: "butterfly",
    type: "BUTTERFLY",
    defaultId: "golden-butterfly",
    label: "Golden Living Butterfly",
    icon: <GiftOutlined />,
    description: "The realistic golden butterfly fluttering around the meadow and flowers.",
    recommendedTrigger: "MULTI_CLICK",
    recommendedCount: 3,
  },
  {
    key: "flying-page",
    type: "FLYING_PAGE",
    defaultId: "flying-paper",
    label: "Enchanted Flying Paper",
    icon: <FileTextOutlined />,
    description: "The magical open parchment book soaring through the sky around the island.",
    recommendedTrigger: "MULTI_CLICK",
    recommendedCount: 3,
  },
  {
    key: "lamp",
    type: "LAMP",
    defaultId: "main-lamp",
    label: "Island Porch Lantern",
    icon: <BulbOutlined />,
    description: "The stone lantern beside the path that toggles illumination.",
    recommendedTrigger: "TOGGLE",
    recommendedCount: 1,
  },
  {
    key: "pond",
    type: "POND",
    defaultId: "main-pond",
    label: "Garden Reflection Pond",
    icon: <SyncOutlined />,
    description: "The circular water pond with interactive ripple physics.",
    recommendedTrigger: "RIPPLE",
    recommendedCount: 5,
  },
  {
    key: "tree",
    type: "TREE",
    defaultId: "",
    label: "Whispering Island Tree",
    icon: <BranchesOutlined />,
    description: "The blossoming foliage tree that rustles when tapped.",
    recommendedTrigger: "SHAKE",
    recommendedCount: 1,
  },
  {
    key: "books",
    type: "BOOKS",
    defaultId: "island-books",
    label: "Stack of Magic Books",
    icon: <BookOutlined />,
    description: "The leather-bound volumes resting beside the stone table.",
    recommendedTrigger: "CLICK",
    recommendedCount: 1,
  },
  {
    key: "window",
    type: "HOUSE_WINDOW",
    defaultId: "front-window",
    label: "Studio Front Window",
    icon: <HomeOutlined />,
    description: "The glowing glass pane of the artist cottage studio.",
    recommendedTrigger: "CLICK",
    recommendedCount: 1,
  },
  {
    key: "mailbox",
    type: "MAILBOX",
    defaultId: "contact-mailbox",
    label: "Contact Letterbox",
    icon: <MailOutlined />,
    description: "The vintage mailbox for submitting letters to Shaivi.",
    recommendedTrigger: "LETTER_SENT",
    recommendedCount: 1,
  },
  {
    key: "clock",
    type: "CLOCK",
    defaultId: "",
    label: "Atmosphere Clock Tower",
    icon: <ClockCircleOutlined />,
    description: "The tower clock governing day/night and musical moods.",
    recommendedTrigger: "MOOD_SELECTED",
    recommendedCount: 1,
  },
  {
    key: "telescope",
    type: "TELESCOPE",
    defaultId: "",
    label: "Stargazing Telescope",
    icon: <CompassOutlined />,
    description: "The brass telescope looking into the Journey starfield.",
    recommendedTrigger: "JOURNEY_VIEWED",
    recommendedCount: 1,
  },
  {
    key: "section",
    type: "SECTION",
    defaultId: "ABOUT",
    label: "Website Page or Destination",
    icon: <GlobalOutlined />,
    description: "Visiting a specific section or portfolio page.",
    recommendedTrigger: "VISIT_SECTION",
    recommendedCount: 1,
  },
  {
    key: "flowers",
    type: "FLOWERS",
    defaultId: "",
    label: "Meadow Flowers",
    icon: <AppstoreOutlined />,
    description: "The flower bed surrounding the garden knoll.",
    recommendedTrigger: "CLICK",
    recommendedCount: 1,
  },
  {
    key: "bench",
    type: "BENCH",
    defaultId: "",
    label: "Garden Bench",
    icon: <EnvironmentOutlined />,
    description: "The wooden resting bench by the garden path.",
    recommendedTrigger: "CLICK",
    recommendedCount: 1,
  },
  {
    key: "world",
    type: "WORLD",
    defaultId: "",
    label: "General Island Environment",
    icon: <GlobalOutlined />,
    description: "The full 3D island atmosphere and environment transitions.",
    recommendedTrigger: "TIME_ENTERED",
    recommendedCount: 1,
  },
];

function findTargetPreset(type?: SecretTargetType, id?: string): TargetPreset {
  if (!type) return TARGET_PRESETS[0];
  const found = TARGET_PRESETS.find(
    (p) => p.type === type && (p.defaultId === "" || p.defaultId === id)
  );
  return found || TARGET_PRESETS.find((p) => p.type === type) || TARGET_PRESETS[0];
}

const SECTION_OPTIONS = [
  { label: "Artist Profile (About)", value: "ABOUT" },
  { label: "Quotes TV (Quotes)", value: "QUOTES" },
  { label: "Art Gallery (Gallery)", value: "GALLERY" },
  { label: "Journey Starfield (Journey)", value: "JOURNEY" },
  { label: "Contact Letterbox (Contact)", value: "CONTACT" },
  { label: "Music Lounge (Music)", value: "MUSIC" },
];

const TRIGGER_DEFINITIONS: Record<
  SecretTriggerType,
  { label: string; icon: React.ReactNode; description: string }
> = {
  CLICK: { label: "Single Click / Tap", icon: <AimOutlined />, description: "Triggers on a single click or tap." },
  MULTI_CLICK: { label: "Multiple Consecutive Clicks", icon: <ThunderboltOutlined />, description: "Requires multiple clicks within a specific time window." },
  TOGGLE: { label: "Toggle State", icon: <BulbOutlined />, description: "Toggling a state on or off (e.g. lantern)." },
  RIPPLE: { label: "Water Ripple", icon: <SyncOutlined />, description: "Tapping the water surface to generate ripples." },
  SHAKE: { label: "Shake / Rustle", icon: <SyncOutlined />, description: "Interacting with the tree to cause physical movement." },
  LETTER_SENT: { label: "Send Contact Letter", icon: <MailOutlined />, description: "Triggered upon confirmed submission of a contact letter." },
  JOURNEY_VIEWED: { label: "Explore Telescope Journey", icon: <CompassOutlined />, description: "Triggered upon opening and viewing the Journey starfield." },
  MOOD_SELECTED: { label: "Change Music Mood", icon: <CustomerServiceOutlined />, description: "Triggered when a visitor changes the background music mood." },
  VISIT_SECTION: { label: "Visit Specific Section", icon: <GlobalOutlined />, description: "Triggered upon completing navigation to a portfolio section." },
  HOVER: { label: "Cursor Hover", icon: <EyeOutlined />, description: "Triggered when mouse cursor hovers over the element." },
  TIME_ENTERED: { label: "Time Period Transition", icon: <FieldTimeOutlined />, description: "Triggered when the island enters a specific time period." },
  CUSTOM_EVENT: { label: "Custom Application Event", icon: <SettingOutlined />, description: "Triggered by a developer-defined semantic event." },
};

const REVEAL_DEFINITIONS: Record<
  SecretRevealType,
  { label: string; icon: React.ReactNode; description: string }
> = {
  MESSAGE: { label: "Story Card with Message", icon: <FileTextOutlined />, description: "Displays a discovery headline and story text." },
  QUOTE: { label: "Inspirational Quote", icon: <MessageOutlined />, description: "Displays a formatted quote with attribution." },
  IMAGE: { label: "Artwork / Media Showcase", icon: <PictureOutlined />, description: "Displays an image alongside descriptive text." },
  SOUND: { label: "Audio Chime Only", icon: <SoundOutlined />, description: "Plays an audio chime without visual dialog." },
  VISUAL_EFFECT: { label: "Particle Effect Only", icon: <GiftOutlined />, description: "Displays a particle animation without text." },
  COLLECTIBLE: { label: "Award Keepsake", icon: <GiftOutlined />, description: "Unlocks an exploration keepsake into visitor's collection." },
  COLLECTIBLE_PLACEHOLDER: { label: "Collectible Token (Legacy)", icon: <GiftOutlined />, description: "Reserved for future inventory progression." },
  CUSTOM: { label: "Custom Presentation", icon: <SettingOutlined />, description: "Custom component presentation." },
};

const VISUAL_EFFECT_OPTIONS: { label: string; value: SecretVisualEffect }[] = [
  { label: "None", value: "NONE" },
  { label: "Golden Sparkles", value: "SPARKLE" },
  { label: "Soft Glow Halo", value: "GLOW" },
  { label: "Twinkling Stardust", value: "TINY_STARS" },
  { label: "Falling Flower Petals", value: "PETALS" },
  { label: "Soft Pulse", value: "SOFT_PULSE" },
];

export default function AdminSecretsPage() {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // Mobile detection for responsive drawer and layout
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);

  // Form interactive state
  const [selectedTargetKey, setSelectedTargetKey] = useState<string>("butterfly");
  const [showAdvancedTarget, setShowAdvancedTarget] = useState<boolean>(false);
  const [selectedTriggerType, setSelectedTriggerType] = useState<SecretTriggerType>("MULTI_CLICK");
  const [selectedRevealType, setSelectedRevealType] = useState<SecretRevealType>("MESSAGE");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ENABLED" | "DISABLED">("ALL");
  const [targetFilter, setTargetFilter] = useState<string>("ALL");

  // Queries
  const { data: secrets = [], isLoading: secretsLoading } = useQuery<Secret[]>({
    queryKey: ["adminSecrets"],
    queryFn: adminService.getSecrets,
  });

  const { data: moods = [] } = useQuery<Mood[]>({
    queryKey: ["adminMoods"],
    queryFn: adminService.getMoods,
  });

  const { data: collectibles = [] } = useQuery<Collectible[]>({
    queryKey: ["adminCollectibles"],
    queryFn: adminService.getCollectibles,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Secret>) => adminService.createSecret(data),
    onSuccess: () => {
      message.success("Secret created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminSecrets"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
      setDrawerOpen(false);
      setEditingSecret(null);
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || "Failed to create secret");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Secret> }) =>
      adminService.updateSecret(id, data),
    onSuccess: () => {
      message.success("Secret updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminSecrets"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
      setDrawerOpen(false);
      setEditingSecret(null);
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || "Failed to update secret");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteSecret(id),
    onSuccess: () => {
      message.success("Secret deleted");
      queryClient.invalidateQueries({ queryKey: ["adminSecrets"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || "Failed to delete secret");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => adminService.duplicateSecret(id),
    onSuccess: () => {
      message.success("Secret duplicated as copy");
      queryClient.invalidateQueries({ queryKey: ["adminSecrets"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || "Failed to duplicate secret");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: ReorderItem[]) => adminService.reorderSecrets(items),
    onSuccess: () => {
      message.success("Order updated");
      queryClient.invalidateQueries({ queryKey: ["adminSecrets"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || "Failed to reorder secrets");
    },
  });

  // Filtered secrets list
  const filteredSecrets = useMemo(() => {
    return secrets.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchSlug = item.slug.toLowerCase().includes(q);
        const matchTarget = (item.target?.type || "").toLowerCase().includes(q);
        if (!matchName && !matchSlug && !matchTarget) return false;
      }
      if (statusFilter === "ENABLED" && !item.enabled) return false;
      if (statusFilter === "DISABLED" && item.enabled) return false;
      if (targetFilter !== "ALL" && item.target?.type !== targetFilter) return false;
      return true;
    });
  }, [secrets, searchQuery, statusFilter, targetFilter]);

  // Handle choosing target preset
  const handleSelectPreset = (presetKey: string) => {
    setSelectedTargetKey(presetKey);
    const preset = TARGET_PRESETS.find((p) => p.key === presetKey);
    if (!preset) return;

    form.setFieldsValue({
      target: {
        type: preset.type,
        id: preset.defaultId,
      },
    });

    if (!editingSecret) {
      setSelectedTriggerType(preset.recommendedTrigger);
      form.setFieldsValue({
        trigger: {
          type: preset.recommendedTrigger,
          requiredCount: preset.recommendedCount,
        },
      });
    }
  };

  // Open Create Drawer
  const handleOpenCreate = () => {
    setEditingSecret(null);
    setSelectedTargetKey("butterfly");
    setShowAdvancedTarget(false);
    setSelectedTriggerType("MULTI_CLICK");
    setSelectedRevealType("MESSAGE");
    setDrawerOpen(true);
  };

  // Open Edit Drawer
  const handleOpenEdit = (record: Secret) => {
    setEditingSecret(record);
    const preset = findTargetPreset(record.target?.type, record.target?.id);
    setSelectedTargetKey(preset.key);
    setShowAdvancedTarget(false);
    setSelectedTriggerType(record.trigger?.type || "CLICK");
    setSelectedRevealType(record.reveal?.type || "MESSAGE");
    setDrawerOpen(true);
  };

  // Synchronize form values whenever Drawer is open and mounted
  useEffect(() => {
    if (!drawerOpen) return;

    const timer = setTimeout(() => {
      if (editingSecret) {
        setSelectedRevealType(editingSecret.reveal?.type || "MESSAGE");
        form.setFieldsValue({
          name: editingSecret.name,
          slug: editingSecret.slug,
          enabled: editingSecret.enabled ?? true,
          isPublished: editingSecret.isPublished ?? true,
          adminNote: editingSecret.adminNote || "",
          target: {
            type: editingSecret.target?.type || "BUTTERFLY",
            id: editingSecret.target?.id || "",
          },
          trigger: {
            type: editingSecret.trigger?.type || "CLICK",
            requiredCount: editingSecret.trigger?.requiredCount || 1,
            eventName: editingSecret.trigger?.eventName || "",
          },
          triggerWindowSeconds: editingSecret.trigger?.windowMs
            ? Math.round(editingSecret.trigger.windowMs / 1000)
            : 0,
          cooldownSeconds: editingSecret.behavior?.cooldownMs
            ? Math.round(editingSecret.behavior.cooldownMs / 1000)
            : 0,
          behavior: {
            repeatable: editingSecret.behavior?.repeatable ?? false,
            oncePerSession: editingSecret.behavior?.oncePerSession ?? false,
          },
          conditions: {
            timeOfDay: editingSecret.conditions?.timeOfDay || [],
            moods: editingSecret.conditions?.moods || [],
            sectionsVisited: editingSecret.conditions?.sectionsVisited || [],
            letterSent: editingSecret.conditions?.letterSent ?? false,
            journeyViewed: editingSecret.conditions?.journeyViewed ?? false,
            requiresSecretIds: editingSecret.conditions?.requiresSecretIds || [],
          },
          reveal: {
            type: editingSecret.reveal?.type || "MESSAGE",
            collectibleId: editingSecret.reveal?.collectibleId || undefined,
            title: editingSecret.reveal?.title || "",
            message: editingSecret.reveal?.message || "",
            position: editingSecret.reveal?.position || "center",
            duration: editingSecret.reveal?.duration || "NORMAL",
            visualEffect: editingSecret.reveal?.visualEffect || "NONE",
            soundUrl: editingSecret.reveal?.soundUrl || "",
            soundVolume: editingSecret.reveal?.soundVolume ?? 0.5,
            quoteText: editingSecret.reveal?.quoteText || "",
            quoteAuthor: editingSecret.reveal?.quoteAuthor || "",
            imageUrl: editingSecret.reveal?.image?.url || "",
          },
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          name: "",
          slug: "",
          enabled: true,
          isPublished: true,
          adminNote: "",
          target: {
            type: "BUTTERFLY",
            id: "golden-butterfly",
          },
          trigger: {
            type: "MULTI_CLICK",
            requiredCount: 3,
            eventName: "",
          },
          triggerWindowSeconds: 12,
          cooldownSeconds: 15,
          behavior: {
            repeatable: true,
            oncePerSession: false,
          },
          conditions: {
            timeOfDay: [],
            moods: [],
            sectionsVisited: [],
            letterSent: false,
            journeyViewed: false,
            requiresSecretIds: [],
          },
          reveal: {
            type: "MESSAGE",
            title: "Enchanted Discovery",
            message: "You discovered something special on the island.",
            position: "center",
            duration: "NORMAL",
            visualEffect: "SPARKLE",
            soundUrl: "",
            soundVolume: 0.5,
          },
        });
        setSelectedRevealType("MESSAGE");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [drawerOpen, editingSecret, form]);

  // Name change: auto-populate slug for new secrets
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingSecret) {
      const val = e.target.value;
      form.setFieldsValue({ slug: slugify(val) });
    }
  };

  // Form Submit
  const handleFormSubmit = async (values: any) => {
    const preset = TARGET_PRESETS.find((p) => p.key === selectedTargetKey);
    const targetType = preset ? preset.type : (values.target?.type || "BUTTERFLY");

    let targetId = values.target?.id?.trim() || "";
    if (!targetId && preset) {
      targetId = preset.defaultId;
    }

    const payload: Partial<Secret> = {
      name: values.name.trim(),
      enabled: values.enabled,
      isPublished: values.isPublished,
      adminNote: values.adminNote?.trim() || "",
      target: {
        type: targetType,
        id: targetId,
      },
      trigger: {
        type: values.trigger.type,
        requiredCount: Number(values.trigger.requiredCount) || 1,
        windowMs: (Number(values.triggerWindowSeconds) || 0) * 1000,
        eventName: values.trigger.eventName?.trim() || "",
      },
      behavior: {
        repeatable: Boolean(values.behavior?.repeatable),
        cooldownMs: (Number(values.cooldownSeconds) || 0) * 1000,
        oncePerSession: Boolean(values.behavior?.oncePerSession),
      },
      conditions: {
        timeOfDay: values.conditions?.timeOfDay || [],
        moods: values.conditions?.moods || [],
        sectionsVisited: values.conditions?.sectionsVisited || [],
        letterSent: Boolean(values.conditions?.letterSent),
        journeyViewed: Boolean(values.conditions?.journeyViewed),
        requiresSecretIds: values.conditions?.requiresSecretIds || [],
      },
      reveal: {
        type: values.reveal.type,
        collectibleId: values.reveal.collectibleId || undefined,
        title: values.reveal.title?.trim() || "",
        message: values.reveal.message?.trim() || "",
        position: values.reveal.position || "center",
        duration: values.reveal.duration || "NORMAL",
        visualEffect: values.reveal.visualEffect || "NONE",
        soundUrl: values.reveal.soundUrl?.trim() || "",
        soundVolume: Number(values.reveal.soundVolume ?? 0.5),
        quoteText: values.reveal.quoteText?.trim() || "",
        quoteAuthor: values.reveal.quoteAuthor?.trim() || "",
      },
    };

    if (values.reveal?.imageUrl?.trim()) {
      payload.reveal!.image = {
        url: values.reveal.imageUrl.trim(),
        alt: values.reveal.title || "Secret reveal image",
      };
    }

    if (editingSecret) {
      updateMutation.mutate({ id: editingSecret._id, data: payload });
    } else {
      payload.slug = values.slug.trim().toLowerCase();
      createMutation.mutate(payload);
    }
  };

  // Reordering
  const handleMove = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= filteredSecrets.length) return;

    const list = [...secrets];
    const fromId = filteredSecrets[index]._id;
    const toId = filteredSecrets[targetIndex]._id;

    const fromIdx = list.findIndex((s) => s._id === fromId);
    const toIdx = list.findIndex((s) => s._id === toId);
    if (fromIdx === -1 || toIdx === -1) return;

    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);

    const reordered: ReorderItem[] = list.map((s, idx) => ({ id: s._id, order: idx }));
    reorderMutation.mutate(reordered);
  };

  // Live Test Preview
  const handleTestPreview = (reveal: SecretRevealPayload, slug?: string, secretId?: string) => {
    useSecretStore.getState().enqueueReveal(reveal, {
      slug: slug || "preview-secret",
      secretId: secretId || "preview-id",
      previewMode: true,
    });
    message.info("Secret preview activated in test mode");
  };

  const handleFormPreview = () => {
    const values = form.getFieldsValue();
    const revealPayload: SecretRevealPayload = {
      type: values.reveal?.type || "MESSAGE",
      title: values.reveal?.title || "Discovery Preview",
      message: values.reveal?.message || "This is a live preview of how this discovery appears to visitors.",
      position: values.reveal?.position || "center",
      duration: values.reveal?.duration || "NORMAL",
      visualEffect: values.reveal?.visualEffect || "SPARKLE",
      soundUrl: values.reveal?.soundUrl || "",
      soundVolume: values.reveal?.soundVolume ?? 0.5,
      quoteText: values.reveal?.quoteText || "",
      quoteAuthor: values.reveal?.quoteAuthor || "",
    };
    if (values.reveal?.imageUrl) {
      revealPayload.image = {
        url: values.reveal.imageUrl,
        alt: values.reveal.title || "Preview image",
      };
    }
    handleTestPreview(revealPayload, values.slug || "form-preview");
  };

  const currentPreset = TARGET_PRESETS.find((p) => p.key === selectedTargetKey) || TARGET_PRESETS[0];

  const dependencyOptions = useMemo(() => {
    return secrets
      .filter((s) => !editingSecret || s._id !== editingSecret._id)
      .map((s) => ({
        label: `${s.name} (${s.slug})`,
        value: s._id,
      }));
  }, [secrets, editingSecret]);

  const moodOptions = useMemo(() => {
    return moods.map((m) => ({
      label: m.name,
      value: m._id,
    }));
  }, [moods]);

  // Table Columns - Clean, professional, and compact
  const columns = [
    {
      title: "#",
      key: "order",
      width: 55,
      align: "center" as const,
      render: (_: any, record: Secret, index: number) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <Tooltip title="Move Up" placement="top">
            <Button
              size="small"
              type="text"
              style={{ height: "18px", width: "24px", padding: 0, color: index === 0 ? "#d9d9d9" : "#595959" }}
              icon={<ArrowUpOutlined style={{ fontSize: "11px" }} />}
              disabled={index === 0 || reorderMutation.isPending}
              onClick={() => handleMove(index, -1)}
            />
          </Tooltip>
          <Tooltip title="Move Down" placement="top">
            <Button
              size="small"
              type="text"
              style={{ height: "18px", width: "24px", padding: 0, color: index === filteredSecrets.length - 1 ? "#d9d9d9" : "#595959" }}
              icon={<ArrowDownOutlined style={{ fontSize: "11px" }} />}
              disabled={index === filteredSecrets.length - 1 || reorderMutation.isPending}
              onClick={() => handleMove(index, 1)}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Secret",
      key: "name",
      width: 220,
      render: (_: any, record: Secret) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 600, color: "#1f1f1f", fontSize: "0.88rem" }}>
              {record.name}
            </span>
            {record.adminNote && (
              <Tooltip title={record.adminNote} placement="top">
                <InfoCircleOutlined style={{ color: "#8c8c8c", fontSize: "12px", cursor: "pointer" }} />
              </Tooltip>
            )}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#8c8c8c", fontFamily: "monospace", marginTop: 2 }}>
            {record.slug}
          </div>
        </div>
      ),
    },
    {
      title: "Target Object",
      key: "target",
      width: 190,
      render: (_: any, record: Secret) => {
        const preset = findTargetPreset(record.target?.type, record.target?.id);
        return (
          <Space size={8} style={{ color: "#262626" }}>
            <span style={{ color: "#595959", fontSize: "13px" }}>{preset.icon}</span>
            <span style={{ fontSize: "0.84rem" }}>{preset.label}</span>
          </Space>
        );
      },
    },
    {
      title: "Trigger",
      key: "trigger",
      width: 170,
      render: (_: any, record: Secret) => {
        const summary = formatTriggerSummary(record.trigger);
        return (
          <div>
            <div style={{ fontSize: "0.84rem", fontWeight: 500, color: "#262626" }}>
              {summary.main}
            </div>
            {summary.sub && (
              <div style={{ fontSize: "0.75rem", color: "#8c8c8c" }}>
                {summary.sub}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Prerequisites",
      key: "conditions",
      width: 170,
      render: (_: any, record: Secret) => {
        const conds = record.conditions || {};
        const tags: React.ReactNode[] = [];

        if (conds.timeOfDay && conds.timeOfDay.length > 0) {
          tags.push(
            <Tag key="time" style={{ margin: 0, fontSize: "11px" }}>
              {conds.timeOfDay.join(", ")}
            </Tag>
          );
        }
        if (conds.letterSent) {
          tags.push(
            <Tag key="letter" color="green" style={{ margin: 0, fontSize: "11px" }}>
              Letter
            </Tag>
          );
        }
        if (conds.journeyViewed) {
          tags.push(
            <Tag key="journey" color="blue" style={{ margin: 0, fontSize: "11px" }}>
              Journey
            </Tag>
          );
        }
        if (conds.requiresSecretIds && conds.requiresSecretIds.length > 0) {
          tags.push(
            <Tag key="req" color="purple" style={{ margin: 0, fontSize: "11px" }}>
              {conds.requiresSecretIds.length} Required
            </Tag>
          );
        }
        if (tags.length === 0) {
          return <span style={{ color: "#bfbfbf", fontSize: "0.82rem" }}>—</span>;
        }
        return <Space size={[0, 4]} wrap>{tags}</Space>;
      },
    },
    {
      title: "Reveal",
      key: "reveal",
      width: 200,
      render: (_: any, record: Secret) => {
        const reveal = record.reveal;
        const effectLabel =
          reveal?.visualEffect && reveal.visualEffect !== "NONE"
            ? VISUAL_EFFECT_OPTIONS.find((o) => o.value === reveal.visualEffect)?.label
            : null;

        return (
          <div>
            <div style={{ fontSize: "0.84rem", fontWeight: 500, color: "#262626" }}>
              {cleanDisplayTitle(reveal?.title)}
            </div>
            {effectLabel && (
              <span style={{ fontSize: "0.74rem", color: "#8c8c8c" }}>
                {effectLabel}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 130,
      render: (_: any, record: Secret) => (
        <Space size={8} align="center">
          <Tooltip title={record.enabled ? "Active in the 3D world" : "Disabled"}>
            <Switch
              size="small"
              checked={record.enabled}
              onChange={(checked) =>
                updateMutation.mutate({
                  id: record._id,
                  data: { enabled: checked },
                })
              }
            />
          </Tooltip>
          <Tag
            color={record.isPublished ? "success" : "default"}
            style={{ margin: 0, fontSize: "11px", padding: "0 6px" }}
          >
            {record.isPublished ? "Published" : "Draft"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_: any, record: Secret) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "preview",
                label: "Preview Reveal",
                icon: <EyeOutlined />,
                onClick: () => handleTestPreview(record.reveal, record.slug, record._id),
              },
              {
                key: "edit",
                label: "Edit Secret",
                icon: <EditOutlined />,
                onClick: () => handleOpenEdit(record),
              },
              {
                key: "duplicate",
                label: "Duplicate",
                icon: <CopyOutlined />,
                onClick: () => duplicateMutation.mutate(record._id),
              },
              {
                type: "divider",
              },
              {
                key: "delete",
                label: "Delete Secret",
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => {
                  modal.confirm({
                    title: "Delete this secret?",
                    content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
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
    <div className={styles.pageContainer}>
      {/* Live Preview Layer */}
      <SecretRevealLayer />

      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div>
          <h1 className={styles.headerTitle}>
            <BulbOutlined style={{ color: "#8a6d79" }} />
            Secrets & Easter Eggs Engine
          </h1>
          <p className={styles.headerSub}>
            Author and configure interactive discoveries throughout the 3D world.
            Visitor discovery state is stored securely in local browser storage without server writes.
          </p>
        </div>
        <Space size={12} wrap>
          <Tooltip title="Clear your local browser discovery records to test the discovery flow again">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                secretStorage.resetProgress();
                useSecretStore.getState().resetProgress();
                message.success("Browser discovery records reset for testing");
              }}
            >
              Reset Test Discoveries
            </Button>
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ backgroundColor: "#8a6d79" }}
            onClick={handleOpenCreate}
          >
            Create Secret
          </Button>
        </Space>
      </div>

      {/* Filters Card */}
      <Card className={styles.filterCard} styles={{ body: { padding: "14px 18px" } }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={10} md={8}>
            <Input
              placeholder="Search by name, identifier, or target..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={7} md={6}>
            <Select
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              options={[
                { label: "All Statuses", value: "ALL" },
                { label: "Active Only", value: "ENABLED" },
                { label: "Disabled Only", value: "DISABLED" },
              ]}
            />
          </Col>
          <Col xs={12} sm={7} md={6}>
            <Select
              style={{ width: "100%" }}
              value={targetFilter}
              onChange={(v) => setTargetFilter(v)}
              options={[
                { label: "All Target Objects", value: "ALL" },
                ...TARGET_PRESETS.map((p) => ({
                  label: p.label,
                  value: p.type,
                })),
              ]}
            />
          </Col>
          <Col xs={24} md={4} style={{ textAlign: isMobile ? "left" : "right" }}>
            <Text type="secondary" style={{ fontSize: "0.85rem" }}>
              Showing {filteredSecrets.length} of {secrets.length} records
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredSecrets}
          loading={secretsLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
          scroll={{ x: 1050 }}
        />
      </Card>

      {/* Responsive Drawer for Create / Edit */}
      <Drawer
        forceRender
        title={
          <span style={{ fontWeight: 600, color: "#262626", fontSize: "1rem" }}>
            {editingSecret ? `Edit Secret: ${editingSecret.name}` : "Create New Secret"}
          </span>
        }
        size="large"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingSecret(null);
        }}
        styles={{
          wrapper: isMobile ? { width: "100vw", maxWidth: "100vw" } : { width: "720px", maxWidth: "100vw" },
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
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <Button
              icon={<EyeOutlined />}
              onClick={handleFormPreview}
              style={{ width: isMobile ? "100%" : "auto" }}
            >
              Preview Reveal
            </Button>
            <Space
              size={8}
              style={{
                width: isMobile ? "100%" : "auto",
                justifyContent: isMobile ? "space-between" : "flex-end",
                display: "flex",
              }}
            >
              <Button
                onClick={() => setDrawerOpen(false)}
                style={{ flex: isMobile ? 1 : "none", minWidth: isMobile ? "90px" : "80px" }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                style={{ backgroundColor: "#8a6d79", flex: isMobile ? 1 : "none", minWidth: isMobile ? "120px" : "100px" }}
                loading={createMutation.isPending || updateMutation.isPending}
                onClick={() => form.submit()}
              >
                {editingSecret ? "Save Changes" : "Create Secret"}
              </Button>
            </Space>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Tabs
            defaultActiveKey="identity"
            size={isMobile ? "small" : "middle"}
            items={[
              {
                key: "identity",
                label: "Target & Identification",
                children: (
                  <>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={14}>
                        <Form.Item
                          name="name"
                          label="Secret Name"
                          rules={[{ required: true, message: "Secret name is required" }]}
                          tooltip="A readable name for identifying this secret within the CMS."
                        >
                          <Input
                            placeholder="e.g. Butterfly Whisper, Night Window Mystery"
                            maxLength={100}
                            onChange={handleNameChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={10}>
                        <Form.Item
                          name="slug"
                          label="Identifier Key (Slug)"
                          rules={[
                            { required: true, message: "Identifier key is required" },
                            {
                              pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                              message: "Must be lowercase letters, numbers, and hyphens only",
                            },
                          ]}
                          tooltip={
                            editingSecret
                              ? "Locked after creation to ensure persistent visitor discovery records remain intact."
                              : "Auto-generated from the secret name. Serves as the immutable storage key."
                          }
                        >
                          <Input
                            placeholder="e.g. butterfly-whisper"
                            disabled={Boolean(editingSecret)}
                            prefix={editingSecret ? <LockOutlined style={{ color: "#bfbfbf" }} /> : null}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Non-technical Target Object Selection */}
                    <Form.Item
                      label="Target Object"
                      required
                      tooltip="Choose which 3D island element or action activates this secret."
                    >
                      <Select
                        value={selectedTargetKey}
                        onChange={handleSelectPreset}
                        size={isMobile ? "middle" : "large"}
                        options={TARGET_PRESETS.map((p) => ({
                          label: (
                            <Space size={8}>
                              <span style={{ color: "#8a6d79" }}>{p.icon}</span>
                              <span>{p.label}</span>
                            </Space>
                          ),
                          value: p.key,
                        }))}
                      />
                    </Form.Item>

                    {/* Illustrated target overview card */}
                    <div className={styles.targetCard}>
                      <div className={styles.targetIconWrapper}>
                        {currentPreset.icon}
                      </div>
                      <div className={styles.targetInfo}>
                        <span className={styles.targetTitle}>{currentPreset.label}</span>
                        <span className={styles.targetDesc}>{currentPreset.description}</span>
                      </div>
                    </div>

                    {/* Sub-selector for Section Destination */}
                    {selectedTargetKey === "section" && (
                      <Form.Item
                        name={["target", "id"]}
                        label="Target Section"
                        rules={[{ required: true, message: "Please select a target section" }]}
                        tooltip="Select which section the visitor must enter to discover this secret."
                      >
                        <Select options={SECTION_OPTIONS} />
                      </Form.Item>
                    )}

                    <Row gutter={[16, 16]}>
                      <Col xs={12} sm={12}>
                        <Form.Item
                          name="enabled"
                          label="Engine Evaluation"
                          valuePropName="checked"
                          tooltip="When active, the secret engine processes visitor events for this secret."
                        >
                          <Switch checkedChildren="Active" unCheckedChildren="Disabled" />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={12}>
                        <Form.Item
                          name="isPublished"
                          label="Public Visibility"
                          valuePropName="checked"
                          tooltip="When published, this secret is distributed to public visitors."
                        >
                          <Switch checkedChildren="Published" unCheckedChildren="Draft" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="adminNote"
                      label="Internal Editorial Notes"
                      tooltip="Optional documentation notes for editors and administrators."
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="e.g. Discovered by clicking the lantern during night mode..."
                      />
                    </Form.Item>

                    {/* Collapsible Advanced Settings for Developers */}
                    <div style={{ marginTop: 16 }}>
                      <Button
                        type="link"
                        size="small"
                        icon={<SettingOutlined />}
                        onClick={() => setShowAdvancedTarget(!showAdvancedTarget)}
                        style={{ color: "#8a6d79", padding: 0 }}
                      >
                        {showAdvancedTarget ? "Hide Advanced Parameters" : "Advanced Parameters"}
                      </Button>

                      {showAdvancedTarget && (
                        <div className={styles.advancedBox}>
                          <div className={styles.infoBanner}>
                            <InfoCircleOutlined style={{ marginTop: 2, flexShrink: 0 }} />
                            <span>
                              Target codes and component IDs are assigned automatically based on the selected object.
                              Only adjust these if integrating custom 3D mesh components.
                            </span>
                          </div>
                          <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                              <Form.Item
                                name={["target", "type"]}
                                label="Target Enum Code"
                              >
                                <Input disabled />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                              <Form.Item
                                name={["target", "id"]}
                                label="Component Identifier"
                              >
                                <Input placeholder="e.g. golden-butterfly" />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </div>
                  </>
                ),
              },
              {
                key: "trigger",
                label: "Trigger & Interaction",
                children: (
                  <>
                    <Form.Item
                      name={["trigger", "type"]}
                      label="Interaction Type"
                      rules={[{ required: true, message: "Please select an interaction type" }]}
                      tooltip="The specific visitor interaction required to trigger this secret."
                    >
                      <Select
                        size={isMobile ? "middle" : "large"}
                        onChange={(val) => setSelectedTriggerType(val)}
                        options={Object.entries(TRIGGER_DEFINITIONS).map(([k, v]) => ({
                          label: (
                            <Space size={8}>
                              <span style={{ color: "#8a6d79" }}>{v.icon}</span>
                              <span>{v.label}</span>
                              {!isMobile && (
                                <span style={{ color: "#8c8c8c", fontSize: "0.82rem" }}>— {v.description}</span>
                              )}
                            </Space>
                          ),
                          value: k,
                        }))}
                      />
                    </Form.Item>

                    {(selectedTriggerType === "MULTI_CLICK" || selectedTriggerType === "CLICK") && (
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name={["trigger", "requiredCount"]}
                            label="Required Interaction Count"
                            tooltip="The number of times the visitor must interact with the object."
                          >
                            <InputNumber min={1} max={50} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label="Time Window"
                            tooltip="Maximum seconds allowed between consecutive interactions. Set to 0 for no time limit."
                          >
                            <Space.Compact style={{ width: "100%" }}>
                              <Form.Item name="triggerWindowSeconds" noStyle>
                                <InputNumber
                                  min={0}
                                  placeholder="0 (unlimited)"
                                  style={{ width: "calc(100% - 75px)" }}
                                />
                              </Form.Item>
                              <Button disabled style={{ width: "75px", cursor: "default", color: "rgba(0,0,0,0.45)", background: "#fafafa" }}>
                                sec
                              </Button>
                            </Space.Compact>
                          </Form.Item>
                        </Col>
                      </Row>
                    )}

                    {selectedTriggerType === "RIPPLE" && (
                      <Form.Item
                        name={["trigger", "requiredCount"]}
                        label="Required Ripple Count"
                        tooltip="The number of water surface ripples required to unlock the secret."
                      >
                        <InputNumber min={1} max={20} style={{ width: "100%" }} />
                      </Form.Item>
                    )}

                    <div className={styles.sectionHeader}>Repetition & Cooldown Policies</div>

                    <Row gutter={[16, 16]}>
                      <Col xs={12} sm={12}>
                        <Form.Item
                          name={["behavior", "repeatable"]}
                          label="Repeatable"
                          valuePropName="checked"
                          tooltip="When disabled, visitors can only discover this secret once permanently in their browser."
                        >
                          <Switch checkedChildren="Yes" unCheckedChildren="Once" />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={12}>
                        <Form.Item
                          name={["behavior", "oncePerSession"]}
                          label="Session Limit"
                          valuePropName="checked"
                          tooltip="When enabled, restricts the secret to triggering at most once per browsing session."
                        >
                          <Switch checkedChildren="Once/session" unCheckedChildren="Unlimited" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      label="Cooldown Duration"
                      tooltip="Minimum duration in seconds that must elapse before this secret can trigger again."
                    >
                      <Space.Compact style={{ width: isMobile ? "100%" : "220px" }}>
                        <Form.Item name="cooldownSeconds" noStyle>
                          <InputNumber
                            min={0}
                            placeholder="e.g. 15"
                            style={{ width: isMobile ? "calc(100% - 75px)" : "calc(100% - 75px)" }}
                          />
                        </Form.Item>
                        <Button disabled style={{ width: "75px", cursor: "default", color: "rgba(0,0,0,0.45)", background: "#fafafa" }}>
                          sec
                        </Button>
                      </Space.Compact>
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "conditions",
                label: "Prerequisites & Availability",
                children: (
                  <>
                    <div className={styles.infoBanner}>
                      <InfoCircleOutlined style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>
                        Prerequisites are optional. If all fields are left unconfigured, the secret is discoverable anytime.
                      </span>
                    </div>

                    <Form.Item
                      name={["conditions", "timeOfDay"]}
                      label="Time of Day Restrictions (Optional)"
                      tooltip="Restrict discovery to specific island times of day."
                    >
                      <Select
                        mode="multiple"
                        placeholder="Available across all time periods"
                        options={[
                          { label: "Morning", value: "MORNING" },
                          { label: "Day", value: "DAY" },
                          { label: "Sunset", value: "SUNSET" },
                          { label: "Night", value: "NIGHT" },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item
                      name={["conditions", "moods"]}
                      label="Music Mood Restrictions (Optional)"
                      tooltip="Restrict discovery to specific active music atmospheres."
                    >
                      <Select
                        mode="multiple"
                        placeholder="Available across all musical moods"
                        options={moodOptions}
                      />
                    </Form.Item>

                    <Row gutter={[16, 16]}>
                      <Col xs={12} sm={12}>
                        <Form.Item
                          name={["conditions", "letterSent"]}
                          label="Require Contact Letter"
                          valuePropName="checked"
                          tooltip="Requires the visitor to have successfully sent a letter via the contact form."
                        >
                          <Switch checkedChildren="Required" unCheckedChildren="Optional" />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={12}>
                        <Form.Item
                          name={["conditions", "journeyViewed"]}
                          label="Require Telescope Exploration"
                          valuePropName="checked"
                          tooltip="Requires the visitor to have opened and explored the Journey telescope."
                        >
                          <Switch checkedChildren="Required" unCheckedChildren="Optional" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name={["conditions", "sectionsVisited"]}
                      label="Required Prior Section Visits (Optional)"
                      tooltip="Specifies portfolio sections the visitor must have visited."
                    >
                      <Select
                        mode="multiple"
                        placeholder="No prior section prerequisites"
                        options={SECTION_OPTIONS}
                      />
                    </Form.Item>

                    <Form.Item
                      name={["conditions", "requiresSecretIds"]}
                      label="Prerequisite Secrets (Chained Secrets)"
                      tooltip="Requires the visitor to have unlocked these specific secrets beforehand."
                    >
                      <Select
                        mode="multiple"
                        placeholder="No prerequisite secrets required"
                        options={dependencyOptions}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: "reveal",
                label: "Reveal Presentation",
                children: (
                  <>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name={["reveal", "type"]}
                          label="Presentation Format"
                          rules={[{ required: true, message: "Please select a presentation format" }]}
                        >
                          <Select
                            size={isMobile ? "middle" : "large"}
                            onChange={(val) => setSelectedRevealType(val as SecretRevealType)}
                            options={Object.entries(REVEAL_DEFINITIONS).map(([k, v]) => ({
                              label: (
                                <Space size={8}>
                                  <span style={{ color: "#8a6d79" }}>{v.icon}</span>
                                  <span>{v.label}</span>
                                </Space>
                              ),
                              value: k,
                            }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name={["reveal", "visualEffect"]}
                          label="Visual Particle Effect"
                        >
                          <Select
                            size={isMobile ? "middle" : "large"}
                            options={VISUAL_EFFECT_OPTIONS}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {selectedRevealType === "COLLECTIBLE" && (
                      <Form.Item
                        name={["reveal", "collectibleId"]}
                        label="Awarded Keepsake"
                        rules={[{ required: true, message: "Please select a keepsake to award" }]}
                        tooltip="The collectible item added to the visitor's keepsakes book upon discovering this secret."
                      >
                        <Select
                          size={isMobile ? "middle" : "large"}
                          placeholder="Select keepsake..."
                          options={collectibles.map((c) => ({
                            label: `${c.name} (${c.slug})`,
                            value: c._id,
                          }))}
                        />
                      </Form.Item>
                    )}

                    <Form.Item
                      name={["reveal", "title"]}
                      label="Headline Title"
                      rules={[{ required: true, message: "Headline title is required" }]}
                      tooltip="Primary heading displayed on the discovery card."
                    >
                      <Input placeholder="e.g. Enchanted Discovery, A Whisper in the Dark" maxLength={80} />
                    </Form.Item>

                    <Form.Item
                      name={["reveal", "message"]}
                      label="Narrative Message"
                      tooltip="The narrative copy or story excerpt displayed to the visitor."
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Write the narrative message or discovery copy here..."
                        maxLength={500}
                        showCount
                      />
                    </Form.Item>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name={["reveal", "position"]}
                          label="Screen Placement"
                        >
                          <Select
                            options={[
                              { label: "Center Screen", value: "center" },
                              { label: "Bottom Center", value: "bottom-center" },
                              { label: "Near Target Object", value: "near-target" },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name={["reveal", "duration"]}
                          label="Display Duration"
                        >
                          <Select
                            options={[
                              { label: "Short (4 seconds)", value: "SHORT" },
                              { label: "Standard (7 seconds)", value: "NORMAL" },
                              { label: "Long (12 seconds)", value: "LONG" },
                              { label: "Persistent until closed by visitor", value: "UNTIL_CLOSED" },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <div className={styles.sectionHeader}>Audio & Supporting Media (Optional)</div>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={16}>
                        <Form.Item
                          name={["reveal", "soundUrl"]}
                          label="Audio Chime URL (Optional)"
                          tooltip="Plays on an independent audio channel without interrupting background music."
                        >
                          <Input placeholder="https://res.cloudinary.com/.../chime.mp3" prefix={<SoundOutlined style={{ color: "#bfbfbf" }} />} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          name={["reveal", "soundVolume"]}
                          label="Audio Volume"
                        >
                          <Slider min={0} max={1} step={0.05} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name={["reveal", "imageUrl"]}
                      label="Illustration / Image URL (Optional)"
                    >
                      <Input placeholder="https://res.cloudinary.com/.../illustration.jpg" prefix={<PictureOutlined style={{ color: "#bfbfbf" }} />} />
                    </Form.Item>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={16}>
                        <Form.Item
                          name={["reveal", "quoteText"]}
                          label="Quote Excerpt (Optional)"
                        >
                          <Input placeholder="Inspirational quote text..." prefix={<MessageOutlined style={{ color: "#bfbfbf" }} />} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          name={["reveal", "quoteAuthor"]}
                          label="Quote Attribution"
                        >
                          <Input placeholder="e.g. Shaivi" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Drawer>
    </div>
  );
}
