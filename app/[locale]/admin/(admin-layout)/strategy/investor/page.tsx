"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Table,
  Tabs,
  TabsProps,
  Modal,
  message,
  Space,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";
import MyUpload from "../../../_components/my-upload";
import dayjs from "dayjs";
// 只在客户端中引入富文本编辑器，不在编译的时候做处理
const MyEditor = dynamic(() => import("../../../_components/my-editor"), {
  ssr: false,
});

type Article = {
  _id: string;
  title: string;
  desc: string;
  image: string;
  content: string;
  category: string;
  createdAt: string;
};

function InvestorPage() {
  const per = 10;
  const page = 1;
  const type = "investor";
  const [open, setOpen] = useState(false); // 控制modal显示隐藏
  const [list, setList] = useState<Article[]>([]);
  const [myForm] = Form.useForm(); // 获取Form组件
  const [searchForm] = Form.useForm();

  // 图片路径
  const [imageUrl, setImageUrl] = useState<string>("");
  // 编辑器内容
  const [html, setHtml] = useState("");

  const [query, setQuery] = useState({
    per,
    page,
    title: "",
  });
  const [currentId, setCurrentId] = useState(""); // 使用一个当前id变量，表示是新增还是修改
  const [total, setTotal] = useState(0);

  // 监听查询条件的改变
  useEffect(() => {
    fetch(
      `/api/admin/learn?page=${query.page}&per=${query.per}&title=${query.title}&type=${type}`,
    )
      .then((res) => res.json())
      .then((res) => {
        setList(res.data?.list);
        setTotal(res.data?.total);
      });
  }, [query]);

  useEffect(() => {
    if (!open) {
      setCurrentId("");
      setImageUrl("");
      setHtml("");
    }
  }, [open]);

  return (
    <Card
      title="策略-投资者管理"
      extra={
        <>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={async () => {
              setOpen(true);
            }}
          />
        </>
      }
    >
      <Form
        form={searchForm}
        layout="inline"
        onFinish={(v) => {
          setQuery({
            page,
            per,
            title: v.title,
          });
        }}
      >
        <Form.Item label="标题" name="title">
          <Input placeholder="请输入关键词" />
        </Form.Item>
        <Form.Item>
          <Button icon={<SearchOutlined />} htmlType="submit" type="primary" />
        </Form.Item>
      </Form>
      <Table
        style={{ marginTop: "16px" }}
        dataSource={list}
        rowKey="_id"
        pagination={{
          pageSize: per,
          total,
          onChange(page) {
            setQuery({
              ...query,
              page,
              per,
            });
          },
        }}
        columns={[
          {
            title: "序号",
            width: 80,
            render(v, r, i) {
              return i + 1;
            },
          },
          {
            title: "姓名",
            dataIndex: "title",
            width: 200,
          },
          {
            title: "照片",
            align: "center",
            width: "100px",
            // dataIndex: 'title',
            render(v, r) {
              return (
                <img
                  src={r.image}
                  style={{
                    display: "block",
                    margin: "8px auto",
                    width: "80px",
                    maxHeight: "80px",
                  }}
                  alt={r.title}
                />
              );
            },
          },
          {
            title: "发布时间",
            dataIndex: "createdAt",
            render(v, r) {
              return (
                <span>{dayjs(r.createdAt).format("YYYY-MM-DD HH:mm:ss")}</span>
              );
            },
          },
          {
            title: "操作",
            render(v, r) {
              return (
                <Space>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    type="primary"
                    onClick={() => {
                      setOpen(true);
                      setCurrentId(r._id);
                      setImageUrl(r.image);
                      setHtml(r.content);
                      myForm.setFieldsValue(r);
                    }}
                  />
                  <Popconfirm
                    title="是否确认删除?"
                    onConfirm={async () => {
                      //
                      const res = await fetch("/api/admin/learn/" + r._id, {
                        method: "DELETE",
                      }).then((res) => res.json());
                      if (!res.success) {
                        return message.error(res.errorMessage || "操作失败！");
                      }
                      setQuery({ ...query, per, page }); // 重制查询条件，重新获取数据
                    }}
                  >
                    <Button
                      size="small"
                      icon={<DeleteOutlined />}
                      type="primary"
                      danger
                    />
                  </Popconfirm>
                </Space>
              );
            },
          },
        ]}
      />
      <Modal
        title={`${currentId ? "编辑" : "新增"}`}
        open={open}
        onCancel={() => setOpen(false)}
        destroyOnClose={true} // 关闭窗口之后销毁
        maskClosable={false} // 点击空白区域的时候不关闭
        onOk={() => {
          myForm.submit();
        }}
        width={"75vw"}
      >
        <Form
          preserve={false} // 和modal结合使用的时候需要加上它，否则不会销毁
          layout="vertical"
          form={myForm}
          onFinish={async (v) => {
            // console.log(v);
            if (currentId) {
              // 修改
              const res = await fetch("/api/admin/learn/" + currentId, {
                body: JSON.stringify({ ...v, image: imageUrl, content: html }),
                method: "PUT",
              }).then((res) => res.json());
              if (!res.success) {
                return message.error(res.errorMessage || "操作失败！");
              }
            } else {
              const res = await fetch("/api/admin/learn", {
                method: "POST",
                body: JSON.stringify({
                  ...v,
                  image: imageUrl,
                  content: html,
                  type,
                }),
              }).then((res) => res.json());
              if (!res.success) {
                return message.error(res.errorMessage || "操作失败！");
              }
            }

            // 此处需要调接口
            setOpen(false);
            setQuery({ ...query }); // 改变query会重新去取数据
          }}
        >
          <Form.Item
            label="姓名"
            name="title"
            rules={[
              {
                required: true,
                message: "姓名不能为空",
              },
            ]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item label="照片">
            <MyUpload imageUrl={imageUrl} setImageUrl={setImageUrl} />
          </Form.Item>
          <Form.Item label="介绍">
            <MyEditor html={html} setHtml={setHtml} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default InvestorPage;
