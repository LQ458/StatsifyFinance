'use client';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Table,
  Modal,
  Space,
  Popconfirm,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dynamic from 'next/dynamic';
import MyUpload from '../../_components/my-upload';
// 只在客户端中引入富文本编辑器，不在编译的时候做处理
const MyEditor = dynamic(() => import('../../_components/my-editor'), {
  ssr: false,
});

type Article = {
  _id: string;
  title: string;
  desc: string;
  image: string;
  content: string;
};

function ArticlePage() {
  const [open, setOpen] = useState(false); // 控制modal显示隐藏
  const [list, setList] = useState<Article[]>([]);
  const [myForm] = Form.useForm(); // 获取Form组件

  // 图片路径
  const [imageUrl, setImageUrl] = useState<string>('');
  // 编辑器内容
  const [html, setHtml] = useState('');

  const [query, setQuery] = useState({
    per: 10,
    page: 1,
    title: '',
  });
  const [currentId, setCurrentId] = useState(''); // 使用一个当前id变量，表示是新增还是修改
  const [total, setTotal] = useState(0);
  // 如果存在表示修改，不存在表示新增

  // 监听查询条件的改变
  useEffect(() => {
    fetch(
      `/api/admin/articles-category?page=${query.page}&per=${query.per}&title=${query.title}`
    )
      .then((res) => res.json())
      .then((res) => {
        setList(res.data.list);
        setTotal(res.data.total);
      });
  }, [query]);

  useEffect(() => {
    if (!open) {
      setCurrentId('');
      setImageUrl('');
      setHtml('');
    }
  }, [open]);

  return (
    <Card
      title='分类管理'
      extra={
        <>
          <Button
            icon={<PlusOutlined />}
            type='primary'
            onClick={() => setOpen(true)}
          />
        </>
      }
    >
      <Form
        layout='inline'
        onFinish={(v) => {
          setQuery({
            page: 1,
            per: 10,
            title: v.title,
          });
        }}
      >
        <Form.Item label='标题' name='title'>
          <Input placeholder='请输入关键词' />
        </Form.Item>
        <Form.Item>
          <Button icon={<SearchOutlined />} htmlType='submit' type='primary' />
        </Form.Item>
      </Form>
      <Table
        style={{ marginTop: '8px' }}
        dataSource={list}
        rowKey='_id'
        pagination={{
          total,
          onChange(page) {
            setQuery({
              ...query,
              page,
              per: 10,
            });
          },
        }}
        columns={[
          {
            title: '序号',
            width: 80,
            render(v, r, i) {
              return i + 1;
            },
          },
          {
            title: '分类名',
            dataIndex: 'title',
          },
          {
            title: '排序',
            dataIndex: 'order',
          },
          {
            title: '操作',
            render(v, r) {
              return (
                <Space>
                  <Button
                    size='small'
                    icon={<EditOutlined />}
                    type='primary'
                    onClick={() => {
                      setOpen(true);
                      setCurrentId(r._id);
                      setImageUrl(r.image);
                      setHtml(r.content);
                      myForm.setFieldsValue(r);
                    }}
                  />
                  <Popconfirm
                    title='是否确认删除?'
                    onConfirm={async () => {
                      //
                      await fetch('/api/admin/articles-category/' + r._id, {
                        method: 'DELETE',
                      }).then((res) => res.json());
                      setQuery({ ...query, per: 10, page: 1 }); // 重制查询条件，重新获取数据
                    }}
                  >
                    <Button
                      size='small'
                      icon={<DeleteOutlined />}
                      type='primary'
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
        title='编辑'
        open={open}
        onCancel={() => setOpen(false)}
        destroyOnClose={true} // 关闭窗口之后销毁
        maskClosable={false} // 点击空白区域的时候不关闭
        onOk={() => {
          myForm.submit();
        }}
        width={'400px'}
      >
        <Form
          preserve={false} // 和modal结合使用的时候需要加上它，否则不会销毁
          layout='vertical'
          form={myForm}
          onFinish={async (v) => {
            // console.log(v);
            if (currentId) {
              // 修改
              await fetch('/api/admin/articles-category/' + currentId, {
                body: JSON.stringify({ ...v, image: imageUrl, content: html }),
                method: 'PUT',
              }).then((res) => res.json());
            } else {
              await fetch('/api/admin/articles-category', {
                method: 'POST',
                body: JSON.stringify({ ...v, image: imageUrl, content: html }),
              }).then((res) => res.json());
            }

            // 此处需要调接口
            setOpen(false);
            setQuery({ ...query }); // 改变query会重新去取数据
          }}
        >
          <Form.Item
            label='分类名'
            name='title'
            rules={[
              {
                required: true,
                message: '分类名不能为空',
              },
            ]}
          >
            <Input placeholder='请输入分类名' />
          </Form.Item>
          <Form.Item label='排序' name='order'>
            <InputNumber style={{ width: '100%' }} min="1" max="100" step="1" placeholder='请输入排序数，越小越靠前' />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default ArticlePage;
