"use client";

import { Card, Skeleton, Space } from "antd";

export default function AdminLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Card variant="borderless" style={{ borderRadius: "12px" }}>
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <Skeleton.Input active size="large" style={{ width: 240 }} />
          <Skeleton active paragraph={{ rows: 6 }} />
        </Space>
      </Card>
    </div>
  );
}
