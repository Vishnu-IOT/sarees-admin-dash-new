import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import AppLayout from './components/AppLayout.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProductsList from './pages/Products/ProductsList.jsx';
import ProductDetail from './pages/Products/ProductDetail.jsx';
import CategoriesList from './pages/Categories/CategoriesList.jsx';
import SubcategoriesList from './pages/Subcategories/SubcategoriesList.jsx';
import OrdersList from './pages/Orders/OrdersList.jsx';
import OrderDetail from './pages/Orders/OrderDetail.jsx';
import UsersList from './pages/Users/UsersList.jsx';
import UserDetail from './pages/Users/UserDetail.jsx';
import LoomsList from './pages/Looms/LoomsList.jsx';
import CustomersList from './pages/Customers/CustomersList.jsx';
import ServiceRequestsList from './pages/ServiceRequests/ServiceRequestsList.jsx';
import CustomerDetail from './pages/Customers/CustomerDetail.jsx';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<ProductsList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/categories" element={<CategoriesList />} />
              <Route path="/subcategories" element={<SubcategoriesList />} />
              <Route path="/orders" element={<OrdersList />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/users" element={<UsersList />} />
              <Route path="/users/:id" element={<UserDetail />} />
              <Route path="/looms" element={<LoomsList />} />
              <Route path="/customers" element={<CustomersList />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/service-requests" element={<ServiceRequestsList />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}
