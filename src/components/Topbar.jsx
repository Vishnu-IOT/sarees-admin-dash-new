import React from 'react';
import { IconSearch, IconMenu } from './icons.jsx';
import { useSidebar } from '../context/SidebarContext.jsx';

export default function Topbar({ eyebrow, title, search, onSearchChange, searchPlaceholder = 'Search…' }) {
  const { toggle } = useSidebar();

  return (
    <header className="topbar">
      <button className="topbar-menu-btn" title="Open menu" onClick={toggle}>
        <IconMenu />
      </button>
      <div className="topbar-titles">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
      </div>
      <div className="topbar-right">
        {onSearchChange && (
          <div className="topbar-search">
            <IconSearch />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>
        )}
      </div>
    </header>
  );
}
