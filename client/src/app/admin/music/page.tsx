"use client";

import AdminAudioUpload from "@/components/admin/AdminAudioUpload";
import AdminImageUpload from "@/components/admin/AdminImageUpload";
import MoodWorldEffectEditor from "@/components/admin/music/MoodWorldEffectEditor";
import MoodWorldPreview from "@/components/admin/music/MoodWorldPreview";
import { adminService } from "@/services/admin.service";
import type { Mood, PhotoData, Song } from "@/types";
import { MOOD_PRESETS } from "@/utils/moodPresets";
import {
  BgColorsOutlined,
  CustomerServiceOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
  PlusOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Image as AntImage,
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";

export default function AdminMusicPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("songs");

  // Song Modal State
  const [songModalOpen, setSongModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [cover, setCover] = useState<PhotoData | null>(null);
  const [audio, setAudio] = useState<{ url: string } | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [songForm] = Form.useForm();

  // Mood Modal State
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [editingMood, setEditingMood] = useState<Mood | null>(null);
  const [moodForm] = Form.useForm();

  // Queries
  const { data: songs = [], isLoading: songsLoading } = useQuery({
    queryKey: ["adminSongs"],
    queryFn: adminService.getSongs,
  });

  const { data: moods = [], isLoading: moodsLoading } = useQuery({
    queryKey: ["adminMoods"],
    queryFn: adminService.getMoods,
  });

  // Song Mutations
  const createSongMutation = useMutation({
    mutationFn: (data: Partial<Song>) => adminService.createSong(data),
    onSuccess: () => {
      message.success("Song uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["adminSongs"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
      setSongModalOpen(false);
      songForm.resetFields();
      setCover(null);
      setAudio(null);
    },
    onError: (err: any) =>
      message.error(err?.message || "Failed to create song"),
  });

  const updateSongMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Song> }) =>
      adminService.updateSong(id, data),
    onSuccess: () => {
      message.success("Song updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminSongs"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
      setSongModalOpen(false);
      setEditingSong(null);
      songForm.resetFields();
      setCover(null);
      setAudio(null);
    },
    onError: (err: any) =>
      message.error(err?.message || "Failed to update song"),
  });

  const deleteSongMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteSong(id),
    onSuccess: () => {
      message.success("Song deleted");
      queryClient.invalidateQueries({ queryKey: ["adminSongs"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
  });

  // Mood Mutations
  const createMoodMutation = useMutation({
    mutationFn: (data: Partial<Mood>) => adminService.createMood(data),
    onSuccess: () => {
      message.success("Mood palette created");
      queryClient.invalidateQueries({ queryKey: ["adminMoods"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
      setMoodModalOpen(false);
      moodForm.resetFields();
    },
  });

  const updateMoodMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Mood> }) =>
      adminService.updateMood(id, data),
    onSuccess: () => {
      message.success("Mood palette updated");
      queryClient.invalidateQueries({ queryKey: ["adminMoods"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
      setMoodModalOpen(false);
      setEditingMood(null);
      moodForm.resetFields();
    },
  });

  const deleteMoodMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteMood(id),
    onSuccess: () => {
      message.success("Mood deleted");
      queryClient.invalidateQueries({ queryKey: ["adminMoods"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
  });

  // Handlers
  const handleEditSong = (song: Song) => {
    setEditingSong(song);
    setCover(song.cover || null);
    setAudio(song.audio || null);
    setAudioDuration(song.duration || 0);
    songForm.setFieldsValue(song);
    setSongModalOpen(true);
  };

  const handleEditMood = (mood: Mood) => {
    setEditingMood(mood);
    moodForm.setFieldsValue({
      ...mood,
      worldEffect: mood.worldEffect || { ...MOOD_PRESETS.calm.effect },
    });
    setMoodModalOpen(true);
  };

  const onSongFinish = (values: any) => {
    if (!cover) {
      message.error("Please provide a cover image");
      return;
    }

    const userDuration = Number(values.duration);
    const finalDuration =
      !isNaN(userDuration) && userDuration > 0
        ? userDuration
        : audioDuration || 180;

    const payload = {
      title: values.title,
      artist: values.artist,
      duration: finalDuration,
      cover,
      audio: audio || undefined,
      isPublished: values.isPublished,
    };

    if (editingSong) {
      updateSongMutation.mutate({ id: editingSong._id, data: payload });
    } else {
      createSongMutation.mutate({ ...payload, order: songs.length });
    }
  };

  const onMoodFinish = (values: any) => {
    if (editingMood) {
      updateMoodMutation.mutate({ id: editingMood._id, data: values });
    } else {
      createMoodMutation.mutate({ ...values, order: moods.length });
    }
  };

  // Song Table Columns
  const songColumns = [
    {
      title: "Cover",
      dataIndex: "cover",
      key: "cover",
      width: 65,
      render: (img: PhotoData) => (
        <AntImage
          src={img?.src}
          alt={img?.alt || "Song cover"}
          width={40}
          height={40}
          style={{ objectFit: "cover", borderRadius: "4px" }}
        />
      ),
    },
    {
      title: "Title & Artist",
      key: "title",
      render: (_: any, record: Song) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.title}</div>
          <div style={{ fontSize: "0.75rem", color: "#8a7f8e" }}>
            {record.artist}
          </div>
        </div>
      ),
    },
    {
      title: "Audio Track",
      key: "audio",
      render: (_: any, record: Song) =>
        record.audio?.url ? (
          <span style={{ color: "#389e0d", fontSize: "0.85rem" }}>
            ● Real Audio Attached
          </span>
        ) : (
          <span style={{ color: "#d48800", fontSize: "0.85rem" }}>
            ○ Simulated / No Audio
          </span>
        ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 90,
      render: (d: number) =>
        `${Math.floor(d / 60)}:${String(d % 60).padStart(2, "0")}`,
    },
    {
      title: "Published",
      dataIndex: "isPublished",
      key: "isPublished",
      width: 90,
      render: (pub: boolean, record: Song) => (
        <Switch
          checked={pub}
          size="small"
          onChange={(checked) =>
            updateSongMutation.mutate({
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
      width: 100,
      render: (_: any, record: Song) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditSong(record)}
          />
          <Popconfirm
            title="Delete song?"
            onConfirm={() => deleteSongMutation.mutate(record._id)}
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

  // Mood Table Columns
  const moodColumns = [
    {
      title: "Mood",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Mood) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "4px",
              background: record.paperColor,
              border: `1px solid ${record.inkColor}`,
            }}
          />
          <span style={{ fontWeight: 600 }}>{name}</span>
        </div>
      ),
    },
    {
      title: "Colors",
      key: "colors",
      render: (_: any, record: Mood) => (
        <span style={{ fontSize: "0.8rem", color: "#706773" }}>
          Paper: {record.paperColor} · Ink: {record.inkColor}
        </span>
      ),
    },
    {
      title: "World Effect",
      key: "worldEffect",
      render: (_: any, record: Mood) => {
        const eff = record.worldEffect;
        if (!eff || eff.enabled === false) {
          return <Tag color="default">Disabled</Tag>;
        }
        return (
          <Space size={6} align="center">
            <Tag color="purple">
              Active ({Math.round((eff.intensity ?? 0.8) * 100)}%)
            </Tag>
            {eff.scene?.tint && (
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: eff.scene.tint,
                  border: "1px solid #c0b5c4",
                  verticalAlign: "middle",
                }}
                title={`Tint: ${eff.scene.tint}`}
              />
            )}
          </Space>
        );
      },
    },
    {
      title: "Assigned Songs",
      key: "songsCount",
      render: (_: any, record: Mood) => (
        <span>{record.songIds?.length || 0} tracks</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: any, record: Mood) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditMood(record)}
          />
          <Popconfirm
            title="Delete mood?"
            onConfirm={() => deleteMoodMutation.mutate(record._id)}
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
    <Card variant="borderless" style={{ borderRadius: "12px" }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "songs",
            label: (
              <span>
                <CustomerServiceOutlined /> Songs ({songs.length})
              </span>
            ),
            children: (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "16px",
                  }}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingSong(null);
                      setCover(null);
                      setAudio(null);
                      setAudioDuration(0);
                      songForm.resetFields();
                      songForm.setFieldsValue({
                        isPublished: true,
                        artist: "Shaivi",
                      });
                      setSongModalOpen(true);
                    }}
                    style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
                  >
                    Add Song
                  </Button>
                </div>

                <Table
                  dataSource={songs}
                  columns={songColumns}
                  rowKey="_id"
                  loading={songsLoading}
                  pagination={false}
                  scroll={{ x: 600 }}
                />
              </div>
            ),
          },
          {
            key: "moods",
            label: (
              <span>
                <SmileOutlined /> Mood Palettes ({moods.length})
              </span>
            ),
            children: (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "16px",
                  }}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingMood(null);
                      moodForm.resetFields();
                      moodForm.setFieldsValue({
                        isPublished: true,
                        paperColor: "#d7ddc5",
                        inkColor: "#354537",
                        songIds: songs.map((s) => s._id),
                        worldEffect: { ...MOOD_PRESETS.calm.effect },
                      });
                      setMoodModalOpen(true);
                    }}
                    style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
                  >
                    Add Mood
                  </Button>
                </div>

                <Table
                  dataSource={moods}
                  columns={moodColumns}
                  rowKey="_id"
                  loading={moodsLoading}
                  pagination={false}
                  scroll={{ x: 600 }}
                />
              </div>
            ),
          },
        ]}
      />

      {/* Song Modal */}
      <Modal
        title={editingSong ? "Edit Song" : "Add New Song"}
        open={songModalOpen}
        forceRender
        onCancel={() => {
          setSongModalOpen(false);
          setEditingSong(null);
          setCover(null);
          setAudio(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={songForm} layout="vertical" onFinish={onSongFinish}>
          <Form.Item label="Cover Artwork" required>
            <AdminImageUpload
              value={cover}
              onChange={setCover}
              folder="song-covers"
              aspectRatio="1 / 1"
              recommendedSize="800 × 800"
            />
          </Form.Item>

          <Form.Item label="Audio File (MP3, WAV, AAC)">
            <AdminAudioUpload
              value={audio}
              duration={audioDuration || songForm.getFieldValue("duration")}
              onChange={(val, dur) => {
                setAudio(val);
                if (dur && dur > 0) {
                  setAudioDuration(dur);
                  songForm.setFieldsValue({ duration: dur });
                }
              }}
            />
          </Form.Item>

          <Form.Item
            label="Song Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="e.g. After Rain" />
          </Form.Item>

          <Form.Item
            label="Artist Name"
            name="artist"
            rules={[{ required: true, message: "Artist is required" }]}
          >
            <Input placeholder="e.g. Shaivi" />
          </Form.Item>

          <Space size="large" align="start">
            <Form.Item
              label="Duration (seconds)"
              name="duration"
              extra="Auto-extracted upon audio upload, or manually adjust."
            >
              <InputNumber
                min={1}
                max={7200}
                placeholder="e.g. 214"
                style={{ width: "160px" }}
              />
            </Form.Item>

            <Form.Item
              label="Published"
              name="isPublished"
              valuePropName="checked"
            >
              <Switch checkedChildren="Published" unCheckedChildren="Draft" />
            </Form.Item>
          </Space>

          <Form.Item
            style={{ marginTop: "24px", marginBottom: 0, textAlign: "right" }}
          >
            <Space>
              <Button onClick={() => setSongModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={
                  createSongMutation.isPending || updateSongMutation.isPending
                }
                style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
              >
                {editingSong ? "Update Song" : "Upload Song"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Mood Modal */}
      <Modal
        title={
          editingMood ? `Edit Mood: ${editingMood.name}` : "Add Mood Palette"
        }
        open={moodModalOpen}
        forceRender
        onCancel={() => {
          setMoodModalOpen(false);
          setEditingMood(null);
        }}
        width="min(1060px, 96vw)"
        style={{ top: 16, maxWidth: "calc(100vw - 16px)" }}
        footer={null}
      >
        <Form form={moodForm} layout="vertical" onFinish={onMoodFinish}>
          <Row gutter={24}>
            <Col xs={24} lg={13}>
              <Tabs
                defaultActiveKey="general"
                items={[
                  {
                    key: "general",
                    label: (
                      <span>
                        <BgColorsOutlined /> Palette Details
                      </span>
                    ),
                    children: (
                      <div>
                        <Form.Item
                          label="Mood Name"
                          name="name"
                          rules={[
                            { required: true, message: "Name is required" },
                          ]}
                        >
                          <Input placeholder="e.g. Late Night" />
                        </Form.Item>

                        <Space
                          size="large"
                          style={{ display: "flex", marginBottom: "16px" }}
                        >
                          <Form.Item
                            label="Paper Color"
                            name="paperColor"
                            rules={[
                              {
                                required: true,
                                message: "Paper color required",
                              },
                            ]}
                          >
                            <Input
                              placeholder="#d7ddc5"
                              style={{ width: "140px" }}
                            />
                          </Form.Item>

                          <Form.Item
                            label="Ink Color"
                            name="inkColor"
                            rules={[
                              {
                                required: true,
                                message: "Ink color required",
                              },
                            ]}
                          >
                            <Input
                              placeholder="#354537"
                              style={{ width: "140px" }}
                            />
                          </Form.Item>
                        </Space>

                        <Form.Item
                          label="Included / Ordered Songs"
                          name="songIds"
                        >
                          <Select
                            mode="multiple"
                            placeholder="Select songs for this mood"
                            style={{ width: "100%" }}
                            options={songs.map((s) => ({
                              label: `${s.title} (${s.artist})`,
                              value: s._id,
                            }))}
                          />
                        </Form.Item>

                        <Form.Item
                          label="Published"
                          name="isPublished"
                          valuePropName="checked"
                          initialValue={true}
                        >
                          <Switch
                            checkedChildren="Published"
                            unCheckedChildren="Draft"
                          />
                        </Form.Item>
                      </div>
                    ),
                  },
                  {
                    key: "worldEffect",
                    label: (
                      <span>
                        <GlobalOutlined /> World Atmosphere Effect
                      </span>
                    ),
                    children: (
                      <div
                        style={{
                          maxHeight: "520px",
                          overflowY: "auto",
                          paddingRight: "8px",
                        }}
                      >
                        <MoodWorldEffectEditor form={moodForm} />
                      </div>
                    ),
                  },
                ]}
              />
            </Col>

            <Col xs={24} lg={11}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Typography.Text
                  strong
                  style={{
                    marginBottom: "8px",
                    fontSize: "12px",
                    color: "#5b4e5d",
                  }}
                >
                  Live Multi-Time 3D Preview:
                </Typography.Text>
                <Form.Item noStyle shouldUpdate>
                  {() => {
                    const values = moodForm.getFieldsValue();
                    const liveMood: Partial<Mood> = {
                      _id: editingMood?._id,
                      name: values?.name || editingMood?.name || "Preview Mood",
                      slug: editingMood?.slug,
                      paperColor:
                        values?.paperColor ||
                        editingMood?.paperColor ||
                        "#d7ddc5",
                      inkColor:
                        values?.inkColor || editingMood?.inkColor || "#354537",
                      songIds: values?.songIds || editingMood?.songIds || [],
                      order: editingMood?.order,
                      isPublished:
                        values?.isPublished ?? editingMood?.isPublished,
                      worldEffect:
                        values?.worldEffect ||
                        editingMood?.worldEffect ||
                        MOOD_PRESETS.calm.effect,
                    };
                    return <MoodWorldPreview mood={liveMood} />;
                  }}
                </Form.Item>
              </div>
            </Col>
          </Row>

          <Form.Item
            style={{
              marginTop: "20px",
              marginBottom: 0,
              paddingTop: "12px",
              borderTop: "1px solid #f0edf0",
              textAlign: "right",
            }}
          >
            <Space>
              <Button onClick={() => setMoodModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={
                  createMoodMutation.isPending || updateMoodMutation.isPending
                }
                style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
              >
                {editingMood ? "Update Mood" : "Create Mood"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
