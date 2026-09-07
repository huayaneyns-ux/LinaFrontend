import React from 'react';
import { Outlet } from 'react-router-dom';

export interface ModuleTab {
  to: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

interface AdminModuleLayoutProps {
  title?: string;
  subtitle?: string;
  tabs?: ModuleTab[];
  actions?: React.ReactNode;
}

export const AdminModuleLayout: React.FC<AdminModuleLayoutProps> = () => {
  return <Outlet />;
};

export default AdminModuleLayout;
