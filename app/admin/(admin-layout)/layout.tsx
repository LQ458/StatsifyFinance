import React from "react";
import AntdAdmin from "../_components/antd-admin";

function AdminLayout({ children }: any) {
  return (
    <>
      <AntdAdmin>{children}</AntdAdmin>
    </>
  );
}

export default AdminLayout;
