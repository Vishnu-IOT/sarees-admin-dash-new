import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { SidebarProvider, useSidebar } from '../context/SidebarContext.jsx';
import Sidebar from './Sidebar.jsx';

function Shell() {
  const { open, close } = useSidebar();

  return (
    <div className="app-shell">
      <Sidebar />
      <div
        className={`sidebar-overlay${open ? ' visible' : ''}`}
        onClick={close}
        aria-hidden="true"
      />
      <div className="content-area">
        <Outlet />
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <Shell />
    </SidebarProvider>
  );
}
