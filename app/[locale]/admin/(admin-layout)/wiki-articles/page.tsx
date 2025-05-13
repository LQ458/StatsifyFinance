"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
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
import dynamic from "next/dynamic";
import MyUpload from "../../_components/my-upload";
import dayjs from "dayjs";
const { Option } = Select;
// 只在客户端中引入富文本编辑器，不在编译的时候做处理
const MyEditor = dynamic(() => import("../../_components/my-editor"), {
  ssr: false,
});

import MarkdownEditor from "../../_components/markdown-editor";

type Article = {
  _id: string;
  title: string;
  enTitle: string;
  content: string;
  enContent: string;
  category: string;
  createdAt: string;
};
type Category = {
  _id: string;
  title: string;
  enTitle: string;
};

function ArticlePage() {
  const per = 10;
  const page = 1;

  const [open, setOpen] = useState(false); // 控制modal显示隐藏
  const [list, setList] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [flatCategory, setFlatCategory] = useState<Category[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    undefined,
  );
  const [myForm] = Form.useForm(); // 获取Form组件

  // 编辑器内容
  const [html, setHtml] = useState("");
  const [enHtml, setEnHtml] = useState("");

  const [query, setQuery] = useState({
    per,
    page,
    title: "",
  });
  const [currentId, setCurrentId] = useState(""); // 使用一个当前id变量，表示是新增还是修改
  const [total, setTotal] = useState(0);

  function buildCategoryTree(data: any[]) {
    const map = new Map();
    const roots: any = [];
  
    data.forEach(item => {
      map.set(item._id, { ...item, children: [] });
    });
  
    map.forEach(item => {

      if (item.parentId !== null && map.has(item.parentId)) {
        const parent = map.get(item.parentId)!;
        parent.children.push(item);
      } else {
        // parent 不存在（可能为 null 或缺失），视为根节点
        roots.push(item);
      }
      // if (item.parentId === null) {
      //   roots.push(map.get(item._id));
      // } else {
      //   const parent = map.get(item.parentId);
      //   if (parent) {
      //     parent.children.push(map.get(item._id));
      //   }
      // }
    });
  
    return roots;
  }

  function renderOptions(tree: any[], level = 0) {
    return tree.flatMap((node) => {
      const indent = '\u00A0\u00A0'.repeat(level); // 每级2个空格
      const option = (
        <Option key={node._id} value={node._id}>
          {indent}{node.title}
        </Option>
      );
      const children: any = renderOptions(node.children || [], level + 1);
      return [option, ...children];
    });
  }


  // 监听查询条件的改变
  useEffect(() => {
    fetch(
      `/api/admin/wiki-articles?page=${query.page}&per=${query.per}&title=${query.title}`,
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
      setHtml("");
      setEnHtml("");
    }
  }, [open]);

  useEffect(() => {
    getGategory();
  }, []);

  // 查询所有分类
  const getGategory = async () => {
    await fetch(`/api/admin/wiki-category?page=1&per=1000`)
      .then((res) => res.json())
      .then((res) => {
        const treeData = buildCategoryTree(res.data?.list);
        setCategory(treeData);
        // 列表回显分类用
        setFlatCategory(res.data?.list)
      });
  };

  return (
    <Card
      title="wiki文章管理"
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
              flatCategory.forEach((item) => {
                if (item._id === v.category) {
                  categoryStr = item.title;
                }
              });
              return categoryStr;
            },
          },
          {
            title: "英文分类",
            render(v, r) {
              let categoryStr = "";
              flatCategory.forEach((item) => {
                if (item._id === v.category) {
                  categoryStr = item.enTitle;
                }
              });
              return categoryStr;
            },
          },
          // {
          //   title: "封面",
          //   align: "center",
          //   width: "100px",
          //   // dataIndex: 'title',
          //   render(v, r) {
          //     return (
          //       <img
          //         src={r.image}
          //         style={{
          //           display: "block",
          //           margin: "8px auto",
          //           width: "80px",
          //           maxHeight: "80px",
          //         }}
          //         alt={r.title}
          //       />
          //     );
          //   },
          // },
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
                      setHtml(r.content);
                      setEnHtml(r.enContent);
                      setSelectedValue(r.category);
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
                        "/api/admin/wiki-articles/" + r._id,
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
              const res = await fetch("/api/admin/wiki-articles/" + currentId, {
                body: JSON.stringify({
                  ...v,
                  content: html,
                  enContent: enHtml,
                }),
                method: "PUT",
              }).then((res) => res.json());
              if (!res.success) {
                return message.error(res.errorMessage || "操作失败！");
              }
            } else {
              const res = await fetch("/api/admin/wiki-articles", {
                method: "POST",
                body: JSON.stringify({
                  ...v,
                  content: html,
                  enContent: enHtml,
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
              {renderOptions(category)}
              {/* {category &&
                category.map((item) => (
                  <Select.Option key={item._id} value={item._id}>
                    {item.title}
                  </Select.Option>
                ))} */}
            </Select>
          </Form.Item> 
          <Form.Item label="详情">
            <MarkdownEditor value={html} onChange={setHtml} />
          </Form.Item>
          <Form.Item label="英文详情">
            <MarkdownEditor value={enHtml} onChange={setEnHtml} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default ArticlePage;
