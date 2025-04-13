"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Row,
  Col,
  Card,
  Form,
  Input,
  Table,
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
import MyUpload from "../../_components/my-upload";
import dayjs from "dayjs";

type Article = {
  _id: string;
  title: string;
  enTitle: string;
  image: string;
  content: string;
  enContent: string;
  createdAt: string;
};

function FinanceTermsPage() {
  const per = 10;
  const page = 1;
  const [open, setOpen] = useState(false); // 控制modal显示隐藏
  const [list, setList] = useState<Article[]>([]);
  const [myForm] = Form.useForm(); // 获取Form组件

  // 图片路径
  const [imageUrl, setImageUrl] = useState<string>("");

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
      `/api/admin/finance-terms?page=${query.page}&per=${query.per}&title=${query.title}`,
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
    }
  }, [open]);

  return (
    <Card
      title="金融基础术语管理"
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
            title: "标题",
            dataIndex: "title",
          },
          {
            title: "英文标题",
            dataIndex: "enTitle",
          },
          {
            title: "封面",
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
            title: "内容",
            dataIndex: "content",
            width: 500,
          },
          {
            title: "英文内容",
            dataIndex: "enContent",
            width: 500,
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
                      setTimeout(() => {
                        myForm.setFieldsValue(r);
                      }, 200);
                    }}
                  />
                  <Popconfirm
                    title="是否确认删除?"
                    onConfirm={async () => {
                      //
                      const res = await fetch(
                        "/api/admin/finance-terms/" + r._id,
                        {
                          method: "DELETE",
                        },
                      ).then((res) => res.json());
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
              const res = await fetch("/api/admin/finance-terms/" + currentId, {
                body: JSON.stringify({ ...v, image: imageUrl }),
                method: "PUT",
              }).then((res) => res.json());
              if (!res.success) {
                return message.error(res.errorMessage || "操作失败！");
              }
            } else {
              const res = await fetch("/api/admin/finance-terms", {
                method: "POST",
                body: JSON.stringify({ ...v, image: imageUrl }),
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
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col span={12}>
              <Form.Item
                label="标题"
                name="title"
                rules={[
                  {
                    required: true,
                    message: "标题不能为空",
                  },
                ]}
              >
                <Input placeholder="请输入标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="英文标题"
                name="enTitle"
                rules={[
                  {
                    required: true,
                    message: "英文标题不能为空",
                  },
                ]}
              >
                <Input placeholder="请输入标题" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col span={12}>
              <Form.Item label="内容" name="content">
                <Input.TextArea placeholder="请输入内容" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="英文内容" name="enContent">
                <Input.TextArea placeholder="请输入内容" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="封面">
            <MyUpload imageUrl={imageUrl} setImageUrl={setImageUrl} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default FinanceTermsPage;
