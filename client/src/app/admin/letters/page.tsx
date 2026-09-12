"use client";

import { adminService } from "@/services/admin.service";
import type { Letter, LetterStatus } from "@/types";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  InboxOutlined,
  MailOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  Drawer,
  Dropdown,
  Input,
  Popconfirm,
  Segmented,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { useState } from "react";

export default function AdminLettersPage() {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);

  const filterStatus =
    selectedStatus === "all" ? undefined : (selectedStatus as LetterStatus);

  const { data, isLoading } = useQuery({
    queryKey: ["adminLetters", page, pageSize, filterStatus, search],
    queryFn: () =>
      adminService.getLetters({
        page,
        limit: pageSize,
        status: filterStatus,
        search: search || undefined,
      }),
  });

  const letters = data?.items || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 10, pages: 1 };

  // Status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LetterStatus }) =>
      adminService.updateLetterStatus(id, status),
    onSuccess: (_, vars) => {
      message.success(`Letter marked as ${vars.status}`);
      queryClient.invalidateQueries({ queryKey: ["adminLetters"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      if (activeLetter && activeLetter._id === vars.id) {
        setActiveLetter({ ...activeLetter, status: vars.status });
      }
    },
    onError: () => message.error("Could not update letter status"),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteLetter(id),
    onSuccess: () => {
      message.success("Letter deleted permanently");
      queryClient.invalidateQueries({ queryKey: ["adminLetters"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      setActiveLetter(null);
    },
    onError: () => message.error("Could not delete letter"),
  });

  const handleOpenLetter = (letter: Letter) => {
    setActiveLetter(letter);
    // Mark as read automatically when opening if unread
    if (letter.status === "unread") {
      updateStatusMutation.mutate({ id: letter._id, status: "read" });
    }
  };

  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: LetterStatus) => {
        const color =
          status === "unread" ? "gold" : status === "read" ? "blue" : "default";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Sender",
      key: "sender",
      render: (_: any, record: Letter) => (
        <div>
          <div style={{ fontWeight: 600, color: "#3d3745" }}>{record.name}</div>
          <div style={{ fontSize: "0.75rem", color: "#8a7f8e" }}>
            {record.email}
          </div>
        </div>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
    },
    {
      title: "Received",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (d: string) => (
        <span style={{ fontSize: "0.8rem", color: "#706773" }}>
          {new Date(d).toLocaleString(undefined, {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_: any, record: Letter) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "read",
                label: "Read Letter",
                icon: <EyeOutlined />,
                onClick: () => handleOpenLetter(record),
              },
              {
                type: "divider",
              },
              {
                key: "delete",
                label: "Delete Letter",
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => {
                  modal.confirm({
                    title: "Delete letter permanently?",
                    content: "Are you sure? This cannot be undone.",
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
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span style={{ fontWeight: 600 }}>
            Visitor Mailbox ({meta.total})
          </span>
          <Space wrap>
            <Segmented
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val as string);
                setPage(1);
              }}
              options={[
                { label: "All", value: "all" },
                { label: "Unread", value: "unread" },
                { label: "Read", value: "read" },
                { label: "Archived", value: "archived" },
              ]}
            />
            <Input.Search
              placeholder="Search by name or email..."
              allowClear
              onSearch={(val) => {
                setSearch(val);
                setPage(1);
              }}
              style={{ width: 220 }}
            />
          </Space>
        </div>
      }
      variant="borderless"
      style={{ borderRadius: "12px" }}
    >
      <Table
        dataSource={letters}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        scroll={{ x: 600 }}
        pagination={{
          current: page,
          pageSize,
          total: meta.total,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      {/* Detail Drawer */}
      <Drawer
        title="Letter Details"
        placement="right"
        size="large"
        styles={{ wrapper: { width: "min(480px, 100vw)" } }}
        onClose={() => setActiveLetter(null)}
        open={!!activeLetter}
        extra={
          activeLetter && (
            <Space>
              {activeLetter.status !== "archived" ? (
                <Button
                  size="small"
                  icon={<InboxOutlined />}
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: activeLetter._id,
                      status: "archived",
                    })
                  }
                >
                  Archive
                </Button>
              ) : (
                <Button
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: activeLetter._id,
                      status: "read",
                    })
                  }
                >
                  Unarchive
                </Button>
              )}
              {activeLetter.status !== "unread" && (
                <Button
                  size="small"
                  icon={<MailOutlined />}
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: activeLetter._id,
                      status: "unread",
                    })
                  }
                >
                  Mark Unread
                </Button>
              )}
              <Popconfirm
                title="Delete this letter?"
                onConfirm={() => deleteMutation.mutate(activeLetter._id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )
        }
      >
        {activeLetter && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div
              style={{
                background: "#faf6f0",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid rgba(64,62,69,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "#3d3745",
                  }}
                >
                  {activeLetter.name}
                </span>
                <Tag
                  color={
                    activeLetter.status === "unread"
                      ? "gold"
                      : activeLetter.status === "read"
                        ? "blue"
                        : "default"
                  }
                >
                  {activeLetter.status.toUpperCase()}
                </Tag>
              </div>

              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#8a7f8e",
                  marginBottom: "4px",
                }}
              >
                Email:{" "}
                <a href={`mailto:${activeLetter.email}`}>
                  {activeLetter.email}
                </a>
              </div>

              <div style={{ fontSize: "0.8rem", color: "#706773" }}>
                Received: {new Date(activeLetter.createdAt).toLocaleString()}
              </div>
            </div>

            <div>
              <h4 style={{ color: "#3d3745", marginBottom: "8px" }}>
                Message Content
              </h4>
              <div
                style={{
                  background: "#fff",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(64,62,69,0.1)",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                  color: "#3d3745",
                  whiteSpace: "pre-wrap",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {activeLetter.message}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </Card>
  );
}
