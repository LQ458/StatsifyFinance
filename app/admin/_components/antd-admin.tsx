'use client';
import { useState, useEffect } from "react";
import { Layout, Menu, Button, theme, ConfigProvider } from 'antd';
// import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
const { Header, Sider, Content } = Layout;
import Link from "next/link";
import { signOut, useSession  } from "next-auth/react";

function AntdAdmin({ children }: any) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const nav = useRouter();

  // 退出
  const quit=()=>{
    signOut({ callbackUrl: '/' });  
  }

  useEffect(() => {
    // 恢复页面显示
    document.querySelector('.Js-fix-style')?.classList.remove('Js-fix-style')
  }, []);



  return (
    <>
      <Layout style={{ height: '100vh' }}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className='h-[32px] m-[16px] text-white text-[16px]'>
            <Link
            href="/"
            className="flex gap-2 text-[16px] !text-white self-center no-underline !hover:text-white flex-nowrap justify-center"
          >
              <img src="/logo-gold.svg" width={20} alt="" />
              <span className={`${collapsed ? 'hidden' : 'whitespace-nowrap'}`}>Statsify Finance</span>
            </Link>
          </div>
          <Menu
            theme='dark'
            mode='inline'
            defaultSelectedKeys={['1']}
            onClick={({ key }) => {
              if ( key ) {
                console.log('key:::', key)
                nav.push(key);
              }              
            }}
            items={[
              {
                key: '/admin/dashboard',
                icon: <DashboardOutlined />,
                label: '管理中心',
              },
              {
                key: '/admin/users',
                icon: <UserOutlined />,
                label: '用户管理',
              },
              {
                key: '',
                icon: <UploadOutlined />,
                label: '文章管理',
                children: [
                  {
                    key: '/admin/articles-category',
                    icon: <UserOutlined />,
                    label: '分类管理',
                  },
                  {
                    key: '/admin/articles',
                    icon: <UserOutlined />,
                    label: '文章列表',
                  }
                ]
              },
            ]}
          />
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <Button
              type='text'
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <div className='float-right pr-5'><a href="#" onClick={quit}>退出登录</a></div>
          </Header>
          <Content
            style={{
              margin: '12px',
              padding: '8px',
              minHeight: 280,
              background: colorBgContainer,
              overflow: 'auto',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </>
  );
}

export default AntdAdmin;
