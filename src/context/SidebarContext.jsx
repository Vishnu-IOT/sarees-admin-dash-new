import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile nav automatically whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const api = {
    open,
    toggle: () => setOpen((v) => !v),
    close: () => setOpen(false)
  };

  return <SidebarContext.Provider value={api}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
