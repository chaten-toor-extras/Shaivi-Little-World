"use client";

import { adminService } from "@/services/admin.service";
import type { Quote } from "@/types";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Input as AntInput,
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
} from "antd";
import { useState } from "react";

export default function AdminQuotesPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [search, setSearch] = useState("");
  const [form] = Form.useForm();

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["adminQuotes"],
    queryFn: adminService.getQuotes,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Quote>) => adminService.createQuote(data),
    onSuccess: () => {
      message.success("Quote created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminQuotes"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
      setModalOpen(false);
      form.resetFields();
    },
    onError: (err: any) =>
      message.error(err?.message || "Failed to create quote"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quote> }) =>
      adminService.updateQuote(id, data),
    onSuccess: () => {
      message.success("Quote updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminQuotes"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
      setModalOpen(false);
      setEditingQuote(null);
      form.resetFields();
    },
    onError: (err: any) =>
      message.error(err?.message || "Failed to update quote"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteQuote(id),
    onSuccess: () => {
      message.success("Quote deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminQuotes"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
    onError: (err: any) =>
      message.error(err?.message || "Failed to delete quote"),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; order: number }[]) =>
      adminService.reorderQuotes(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminQuotes"] });
      queryClient.invalidateQueries({ queryKey: ["publicContent"] });
    },
  });

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    form.setFieldsValue(quote);
    setModalOpen(true);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= quotes.length) return;

    const newQuotes = [...quotes];
    const [moved] = newQuotes.splice(index, 1);
    newQuotes.splice(targetIndex, 0, moved);

    const reordered = newQuotes.map((q, i) => ({ id: q._id, order: i }));
    reorderMutation.mutate(reordered);
  };

  const onFinish = (values: any) => {
    if (editingQuote) {
      updateMutation.mutate({ id: editingQuote._id, data: values });
    } else {
      createMutation.mutate({ ...values, order: quotes.length });
    }
  };

  const filteredQuotes = quotes.filter(
    (q) =>
      q.text.toLowerCase().includes(search.toLowerCase()) ||
      q.category.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      title: "Order",
      key: "order",
      width: 90,
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
            disabled={index === quotes.length - 1}
            onClick={() => handleMove(index, "down")}
          />
        </Space>
      ),
    },
    {
      title: "Quote Text",
      dataIndex: "text",
      key: "text",
      render: (text: string) => (
        <span style={{ fontStyle: "italic" }}>&ldquo;{text}&rdquo;</span>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 160,
      render: (cat: string) => <Tag color="purple">{cat}</Tag>,
    },
    {
      title: "Published",
      dataIndex: "isPublished",
      key: "isPublished",
      width: 100,
      render: (pub: boolean, record: Quote) => (
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
      width: 120,
      render: (_: any, record: Quote) => (
        <Space orientation="horizontal">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete quote?"
            description="This will remove this quote from the TV broadcast."
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
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <span style={{ fontWeight: 600 }}>
            Quotes TV Channels ({quotes.length})
          </span>
          <Space>
            <AntInput.Search
              placeholder="Search quotes..."
              allowClear
              onSearch={setSearch}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingQuote(null);
                form.resetFields();
                form.setFieldsValue({ isPublished: true });
                setModalOpen(true);
              }}
              style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
            >
              Add Quote
            </Button>
          </Space>
        </div>
      }
      variant="borderless"
      style={{ borderRadius: "12px" }}
    >
      <Table
        dataSource={filteredQuotes}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        pagination={false}
        scroll={{ x: 600 }}
      />

      <Modal
        title={editingQuote ? "Edit Quote" : "Add New Quote"}
        open={modalOpen}
        forceRender
        onCancel={() => {
          setModalOpen(false);
          setEditingQuote(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ isPublished: true }}
        >
          <Form.Item
            label="Quote Text"
            name="text"
            rules={[{ required: true, message: "Quote text is required" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Some ideas arrive loudly. The good ones usually stay quietly."
            />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Category is required" }]}
          >
            <Input placeholder="e.g. On noticing, Small beginnings, Late night thoughts" />
          </Form.Item>

          <Form.Item
            label="Publish Status"
            name="isPublished"
            valuePropName="checked"
          >
            <Switch checkedChildren="Published" unCheckedChildren="Draft" />
          </Form.Item>

          <Form.Item
            style={{ marginTop: "20px", marginBottom: 0, textAlign: "right" }}
          >
            <Space>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
              >
                {editingQuote ? "Update Quote" : "Create Quote"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
