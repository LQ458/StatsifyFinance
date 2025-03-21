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
  Switch,
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
import MyUpload from "../../_components/my-upload";
import dayjs from "dayjs";
// 只在客户端中引入富文本编辑器，不在编译的时候做处理
const MyEditor = dynamic(() => import("../../_components/my-editor"), {
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
type Category = {
  _id: string;
  title: string;
};

function AnalysisPage() {
  const per = 10;
  const page = 1;

  const [open, setOpen] = useState(false); // 控制modal显示隐藏
  const [list, setList] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    undefined,
  );
  const [myForm] = Form.useForm(); // 获取Form组件
  const [searchForm] = Form.useForm();
  const [tabVal, setTabVal] = useState("quantitative");
  const [currentPage, setCurrentPage] = useState(1);

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

  const onChange = (key: string) => {
    searchForm.resetFields();
    setTabVal(key);
    setQuery({
      page: 1,
      per,
      title: "",
    });
    setCurrentPage(1);
  };

  const items: TabsProps["items"] = [
    {
      key: "quantitative",
      label: "定量",
    },
    {
      key: "qualitative",
      label: "定性",
    },
  ];

  // 监听查询条件的改变
  useEffect(() => {
    fetch(
      `/api/admin/learn?page=${query.page}&per=${query.per}&title=${query.title}&type=${tabVal}`,
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

  useEffect(() => {
    getGategory();
  }, [tabVal]);

  // 查询所有分类
  const getGategory = async () => {
    await fetch(`/api/admin/category?page=1&per=1000&type=${tabVal}`)
      .then((res) => res.json())
      .then((res) => {
        setCategory(res.data.list);
      });
  };

  return (
    <Card
      title="分析-内容管理"
      extra={
        <>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={async () => {
              getGategory();
              setOpen(true);
            }}
          />
        </>
      }
    >
      <Tabs defaultActiveKey={tabVal} items={items} onChange={onChange} />
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
          current: currentPage,
          pageSize: per,
          total,
          onChange(page) {
            setQuery({
              ...query,
              page,
              per,
            });
            setCurrentPage(page);
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
            title: "首页推荐",
            render(v, r) {
              if (v.featured) {
                return "是";
              } else {
                return "";
              }
            },
          },
          {
            title: "标题",
            dataIndex: "title",
            width: 200,
          },
          {
            title: "英文标题",
            dataIndex: "enTitle",
            width: 200,
          },
          {
            title: "分类",
            render(v, r) {
              let categoryStr = "";
              category.forEach((item) => {
                console.log("找到：", item._id === v.category, item.title);
                if (item._id === v.category) {
                  categoryStr = item.title;
                }
              });
              return categoryStr;
            },
          },
          // {
          //   title: '简介',
          //   dataIndex: 'desc'
          // },
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
                      getGategory();
                      setOpen(true);
                      setCurrentId(r._id);
                      setImageUrl(r.image);
                      setHtml(r.content);
                      setSelectedValue(r.category);
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
                  type: tabVal,
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
          <Form.Item label="英文标题" name="enTitle">
            <Input placeholder="请输入英文标题" />
          </Form.Item>
          <Form.Item
            label="分类"
            name="category"
            rules={[
              {
                required: true,
                message: "分类不能为空",
              },
            ]}
          >
            <Select value={selectedValue}>
              {category &&
                category.map((item) => (
                  <Select.Option key={item._id} value={item._id}>
                    {item.title}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item label="推荐到首页" name="featured">
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
          <Form.Item label="详情">
            <MyEditor html={html} setHtml={setHtml} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default AnalysisPage;
