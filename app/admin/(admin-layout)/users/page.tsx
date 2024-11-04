"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Switch,
  Table,
  Modal,
  message,
  Space,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import MyUpload from "../../_components/my-upload";
import dayjs from "dayjs";

type User = {
  _id: string;
  username: string;
  originalPassword: string;
  admin: string;
  image: string;
  email: string;
  createdAt: string;
};

function UserPage() {
  const per = 10;
  const page = 1;
  const [open, setOpen] = useState(false); // 控制modal显示隐藏
  const [list, setList] = useState<User[]>([]);
  const [myForm] = Form.useForm(); // 获取Form组件

  // 图片路径
  const [imageUrl, setImageUrl] = useState<string>("");

  const [query, setQuery] = useState({
    per,
    page,
    username: "",
  });
  const [currentId, setCurrentId] = useState(""); // 使用一个当前id变量，表示是新增还是修改
  const [total, setTotal] = useState(0);

  // 监听查询条件的改变
  useEffect(() => {
    fetch(
      `/api/admin/users?page=${query.page}&per=${query.per}&username=${query.username}`,
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
    <Card title="用户管理">
      <Form
        layout="inline"
        onFinish={(v) => {
          setQuery({
            page,
            per,
            username: v.username,
          });
        }}
      >
        <Form.Item label="用户名" name="username">
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
            title: "帐号",
            dataIndex: "username",
          },
          {
            title: "邮箱",
            dataIndex: "email",
          },
          {
            title: "密码",
            dataIndex: "originalPassword",
          },
          {
            title: "头像",
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
                  alt={r.username}
                />
              );
            },
          },
          {
            title: "角色",
            // dataIndex: 'admin',
            render(v, r) {
              return <span>{r.admin ? "管理员" : "普通用户"}</span>;
            },
          },
          {
            title: "注册时间",
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
                      myForm.setFieldsValue(r);
                    }}
                  />
                  <Popconfirm
                    title="是否确认删除?"
                    onConfirm={async () => {
                      //
                      const res = await fetch("/api/admin/users/" + r._id, {
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
        title="编辑"
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
            // 修改
            const res = await fetch("/api/admin/users/" + currentId, {
              body: JSON.stringify({ ...v, image: imageUrl }),
              method: "PUT",
            }).then((res) => res.json());
            if (!res.success) {
              return message.error(res.errorMessage || "操作失败！");
            }

            // 此处需要调接口
            setOpen(false);
            setQuery({ ...query }); // 改变query会重新去取数据
          }}
        >
          <Form.Item label="用户名" name="username">
            <Input placeholder="请输入标题" readOnly />
          </Form.Item>
          <Form.Item
            label="密码"
            name="originalPassword"
            rules={[
              {
                required: true,
                message: "密码不能为空",
              },
            ]}
          >
            <Input placeholder="请输入密码" />
          </Form.Item>

          <Form.Item label="邮箱" name="email">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item label="管理员" name="admin">
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
              defaultChecked
            />
          </Form.Item>
          <Form.Item label="头像">
            <MyUpload imageUrl={imageUrl} setImageUrl={setImageUrl} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default UserPage;
