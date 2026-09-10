import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSidebar } from '../context/SidebarContext.jsx';
import {
  IconDashboard, IconProducts, IconCategory, IconLayers,
  IconOrders, IconUsers, IconLogout, IconClose
} from './icons.jsx';

const navGroups = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: IconDashboard, end: true }]
  },
  {
    label: 'Catalogue',
    items: [
      { to: '/products', label: 'Products', icon: IconProducts },
      { to: '/categories', label: 'Categories', icon: IconCategory },
      { to: '/subcategories', label: 'Subcategories', icon: IconLayers },
      { to: '/looms', label: 'Direct-from-Loom', icon: IconProducts }
    ]
  },
  {
    label: 'Sales',
    items: [
      { to: '/orders', label: 'Orders', icon: IconOrders },
      { to: '/customers', label: 'Customers', icon: IconUsers }
    ]
  },
  {
    label: 'Support',
    items: [
      { to: '/service-requests', label: 'Service Requests', icon: IconOrders }
    ]
  },
  {
    label: 'Admin',
    items: [
      { to: '/users', label: 'Admin Users', icon: IconUsers }
    ]
  }
];

function BrandMark(props) {
  return (
    <svg viewBox="0 0 34 34" fill="none" {...props}>
      <circle cx="17" cy="17" r="17" fill="var(--ink-3)" />
      <path
        d="M17 7c4.5 4.3 6.8 8.3 6.8 11.3a6.8 6.8 0 1 1-13.6 0C10.2 15.3 12.5 11.3 17 7z"
        fill="var(--gold)"
      />
    </svg>
  );
}

export default function Sidebar() {
  const { session, logout } = useAuth();
  const { open, close } = useSidebar();

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-brand">
        <BrandMark className="sidebar-mark" />
        <div className="sidebar-brand-text">
          <span className="name">Lavanya Trends</span>
          <span className="tag">Sarees Admin</span>
        </div>
        <button className="sidebar-close" title="Close menu" onClick={close}>
          <IconClose />
        </button>
      </div>
      <div className="sidebar-thread" />

      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="sidebar-section-label">{group.label}</div>
            {group.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <Icon />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {(session?.email || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="u-name">{session?.email?.split('@')[0] || 'Admin'}</div>
            <div className="u-role">Store administrator</div>
          </div>
          <button className="sidebar-logout" title="Sign out" onClick={logout}>
            <IconLogout />
          </button>
        </div>
      </div>
    </aside>
  );
}
