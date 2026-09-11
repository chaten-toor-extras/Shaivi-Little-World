"use client";

import { adminService } from "@/services/admin.service";
import type { Letter } from "@/types";
import {
  CompassOutlined,
  CustomerServiceOutlined,
  EditOutlined,
  ExportOutlined,
  MailOutlined,
  MessageOutlined,
  PictureOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
} from "antd";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: adminService.getDashboardStats,
  });

  const { data: lettersData, isLoading: lettersLoading } = useQuery({
    queryKey: ["recentLetters"],
    queryFn: () => adminService.getLetters({ limit: 5 }),
  });

  const recentLetters = lettersData?.items || [];

  const columns = [
    {
      title: "Sender",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Letter) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag
          color={
            status === "unread"
              ? "gold"
              : status === "read"
                ? "blue"
                : "default"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => (
        <span style={{ fontSize: "0.8rem", color: "#8a7f8e" }}>
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #f0e8eb 0%, #e9dfe3 100%)",
          padding: "24px 28px",
          borderRadius: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "1.35rem",
              color: "#3d3745",
              fontWeight: 600,
            }}
          >
            Welcome back to Shaivi&apos;s Studio
          </h2>
          <p
            style={{
              margin: "4px 0 0 0",
              color: "#706773",
              fontSize: "0.9rem",
            }}
          >
            Manage the content, artworks, stories, and visitors of your 3D
            island.
          </p>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={() => window.open("/", "_blank")}
            style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
          >
            Preview Island
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col xs={12} sm={8} lg={4} key={i}>
              <Card
                variant="borderless"
                style={{ borderRadius: "10px", background: "#fff" }}
              >
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} lg={4}>
            <Card
              variant="borderless"
              style={{ borderRadius: "10px", background: "#fff" }}
            >
              <Statistic
                title="Artworks"
                value={stats?.artworks || 0}
                prefix={<PictureOutlined style={{ color: "#8a6d79" }} />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card
              variant="borderless"
              style={{ borderRadius: "10px", background: "#fff" }}
            >
              <Statistic
                title="Quotes"
                value={stats?.quotes || 0}
                prefix={<MessageOutlined style={{ color: "#8a6d79" }} />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card
              variant="borderless"
              style={{ borderRadius: "10px", background: "#fff" }}
            >
              <Statistic
                title="Songs"
                value={stats?.songs || 0}
                prefix={
                  <CustomerServiceOutlined style={{ color: "#8a6d79" }} />
                }
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card
              variant="borderless"
              style={{ borderRadius: "10px", background: "#fff" }}
            >
              <Statistic
                title="Milestones"
                value={stats?.milestones || 0}
                prefix={<CompassOutlined style={{ color: "#8a6d79" }} />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card
              variant="borderless"
              style={{ borderRadius: "10px", background: "#fff" }}
            >
              <Statistic
                title="Unread Letters"
                value={stats?.unreadLetters || 0}
                styles={{
                  content: {
                    color:
                      (stats?.unreadLetters || 0) > 0 ? "#d48800" : "#52c41a",
                  },
                }}
                prefix={<MailOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card
              variant="borderless"
              style={{ borderRadius: "10px", background: "#fff" }}
            >
              <Statistic
                title="Total Letters"
                value={stats?.totalLetters || 0}
                prefix={<MailOutlined style={{ color: "#8a7f8e" }} />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Quick Actions */}
      <Card
        title={<span style={{ fontWeight: 600 }}>Quick Actions</span>}
        variant="borderless"
        style={{ borderRadius: "12px" }}
      >
        <Space wrap size="middle">
          <Link href="/admin/gallery">
            <Button icon={<PlusOutlined />}>Add Artwork</Button>
          </Link>
          <Link href="/admin/quotes">
            <Button icon={<PlusOutlined />}>Add Quote</Button>
          </Link>
          <Link href="/admin/music">
            <Button icon={<PlusOutlined />}>Manage Songs & Moods</Button>
          </Link>
          <Link href="/admin/artist">
            <Button icon={<EditOutlined />}>Edit Artist Profile</Button>
          </Link>
          <Link href="/admin/site">
            <Button icon={<EditOutlined />}>Edit Global Site Copy</Button>
          </Link>
          <Link href="/admin/letters">
            <Button icon={<MailOutlined />}>View Letters Inbox</Button>
          </Link>
        </Space>
      </Card>

      {/* Recent Letters */}
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 600 }}>Recent Letters</span>
            <Link
              href="/admin/letters"
              style={{ fontSize: "0.85rem", color: "#8a6d79" }}
            >
              View all →
            </Link>
          </div>
        }
        variant="borderless"
        style={{ borderRadius: "12px" }}
      >
        <Table
          dataSource={recentLetters}
          columns={columns}
          rowKey="_id"
          loading={lettersLoading}
          pagination={false}
          scroll={{ x: 500 }}
        />
      </Card>
    </div>
  );
}
