import React from 'react';
import AntdContainer from './_components/antd-container';

function AdminLayout({ children }: any) {
  return (
    <div className='admin-main'>
      <AntdContainer>{children}</AntdContainer>
    </div>
  );
}

export default AdminLayout;
