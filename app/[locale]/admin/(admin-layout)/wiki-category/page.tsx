"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Modal,
  Space,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Option } = Select;

type Category = {
  _id: string;
  title: string;
  enTitle: string;
  parentId: string;
  path: string[];
};

function CategoryPage() {
  const per = 100;
  const page = 1;
  const [open, setOpen] = useState(false); // 控制modal显示隐藏
  const [list, setList] = useState<Category[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    undefined,
  );
  const [myForm] = Form.useForm(); // 获取Form组件

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
      `/api/admin/wiki-category?page=${query.page}&per=${query.per}&title=${query.title}`,
    )
      .then((res) => res.json())
      .then((res) => {
        const treeData = buildCategoryTree(res.data?.list);
        setList(treeData);
        setTotal(res.data?.total);
      });
  }, [query]);

  useEffect(() => {
    if (!open) {
      setCurrentId("");
    }
  }, [open]);

  return (
    <Card
      title="wiki分类管理"
      extra={
        <>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setOpen(true)}
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
            title: "分类名",
            dataIndex: "title",
          },
          {
            title: "英文分类名",
            dataIndex: "enTitle",
          },
          {
            title: "排序",
            dataIndex: "order",
          },
          {
            title: "父级分类",
            dataIndex: "parentId",
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
                      setTimeout(() => {
                        // 数据库里存的是Null,这里为了正常回显,赋值为''
                        if (r.parentId === null) {
                          r.parentId = "";
                        }
                        myForm.setFieldsValue(r);
                      }, 200);
                    }}
                  />
                  <Popconfirm
                    title="是否确认删除?"
                    onConfirm={async () => {
                      //
                      await fetch("/api/admin/wiki-category/" + r._id, {
                        method: "DELETE",
                      }).then((res) => res.json());
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
        width={"400px"}
      >
        <Form
          preserve={false} // 和modal结合使用的时候需要加上它，否则不会销毁
          layout="vertical"
          form={myForm}
          onFinish={async (v) => {
            // 处理parentId，如果为空字符串则设为null
            const parentId = v.parentId === "" ? null : v.parentId;

            if (currentId) {
              // 修改
              await fetch("/api/admin/wiki-category/" + currentId, {
                body: JSON.stringify({ ...v, parentId }),
                method: "PUT",
              }).then((res) => res.json());
            } else {
              // 新增时处理path
              let path: any = [];
              if (parentId) {
                const parent = list.find((item) => item._id === parentId);
                path = parent?.path ? [...parent.path, parentId] : [parentId];
              }

              await fetch("/api/admin/wiki-category", {
                method: "POST",
                body: JSON.stringify({ ...v, path, parentId }),
              }).then((res) => res.json());
            }

            setOpen(false);
            setQuery({ ...query }); // 改变query会重新去取数据
          }}
          initialValues={{ parentId: "" }}
        >
          <Form.Item
            label="父级分类"
            name="parentId"
          >
            <Select value={selectedValue} >
              <Select.Option value=''>
                    顶级分类
              </Select.Option>
              {renderOptions(list)}
              {/* {list &&
                list.map((item) => (
                  <Select.Option key={item._id} value={item._id}>
                    {item.title}
                  </Select.Option>
                ))} */}
            </Select>
          </Form.Item>

          <Form.Item
            label="分类名"
            name="title"
            rules={[
              {
                required: true,
                message: "分类名不能为空",
              },
            ]}
          >
            <Input placeholder="请输入分类名" />
          </Form.Item>
          <Form.Item
            label="英文分类名"
            name="enTitle"
            rules={[
              {
                required: true,
                message: "英文分类名不能为空",
              },
            ]}
          >
            <Input placeholder="请输入分类名" />
          </Form.Item>
          <Form.Item label="排序" name="order">
            <InputNumber
              style={{ width: "100%" }}
              min="1"
              max="100"
              step="1"
              placeholder="请输入排序数，越小越靠前"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default CategoryPage;
