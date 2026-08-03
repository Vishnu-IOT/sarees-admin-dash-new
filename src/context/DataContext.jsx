import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import * as categoriesApi from '../api/categories';
import * as subcategoriesApi from '../api/subcategories';
import * as productsApi from '../api/products';
import * as ordersApi from '../api/orders';
import * as loomsApi from '../api/looms';
import * as usersApi from '../api/users';
import * as customersApi from '../api/customers';
import * as serviceRequestsApi from '../api/serviceRequests';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { isAuthenticated } = useAuth();

  // ---- Live API-backed resources ----
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pageProducts, setPageProducts] = useState([]);
  const [productsCollection, setProductsCollection] = useState('ALL'); // ALL | SAREE | JEWEL
  const [orders, setOrders] = useState([]);
  const [ordersMeta, setOrdersMeta] = useState({ currentPage: 1, totalPages: 1, totalOrders: 0 });
  const [looms, setLooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customersMeta, setCustomersMeta] = useState({ currentPage: 1, totalPages: 1, totalCustomers: 0 });
  const [serviceRequests, setServiceRequests] = useState([]);
  const [serviceRequestsMeta, setServiceRequestsMeta] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [loomsLoading, setLoomsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [serviceRequestsLoading, setServiceRequestsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const data = await categoriesApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Categories fetch error:', err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchSubcategories = useCallback(async () => {
    try {
      const data = await subcategoriesApi.getSubCategories();
      setSubcategories(data);
    } catch (err) {
      console.error('Subcategories fetch error:', err);
      setSubcategories([]);
    }
  }, []);

  const fetchProducts = useCallback(async (page = 1, limit = 10, collection = 'ALL') => {
    setProductsLoading(true);
    setProductsCollection(collection);
    try {
      const data = await productsApi.getProductsByCollection(collection, page, limit);
      setProducts(data.products || []);
      setPageProducts(data || []);
    } catch (err) {
      console.error('Products fetch error:', err);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async (params = {}) => {
    setOrdersLoading(true);
    try {
      const data = await ordersApi.getOrders(params);
      const rows = data.data || data.orders || (Array.isArray(data) ? data : []);
      setOrders(rows);
      setOrdersMeta({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalOrders: data.totalOrders || rows.length,
      });
    } catch (err) {
      console.error('Orders fetch error:', err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchLooms = useCallback(async () => {
    setLoomsLoading(true);
    try {
      const data = await loomsApi.getLooms();
      setLooms(data || []);
    } catch (err) {
      console.error('Failed to fetch looms', err);
    } finally {
      setLoomsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await usersApi.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async (page = 1, limit = 10) => {
    setCustomersLoading(true);
    try {
      const data = await customersApi.getCustomers(page, limit);
      setCustomers(data.data || []);
      setCustomersMeta({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalCustomers: data.totalCustomers || 0,
      });
    } catch (err) {
      console.error('Failed to fetch customers', err);
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  const fetchServiceRequests = useCallback(async (params = {}) => {
    setServiceRequestsLoading(true);
    try {
      const data = await serviceRequestsApi.getServiceRequests(params);
      const rows = data.data || data.requests || (Array.isArray(data) ? data : []);
      setServiceRequests(rows);
      setServiceRequestsMeta({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        total: data.total || rows.length,
      });
    } catch (err) {
      console.error('Service requests fetch error:', err);
      setServiceRequests([]);
    } finally {
      setServiceRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCategories();
    fetchSubcategories();
    fetchProducts();
    fetchOrders();
    fetchLooms();
    fetchUsers();
    fetchCustomers();
  }, [isAuthenticated, fetchCategories, fetchSubcategories, fetchProducts, fetchOrders, fetchLooms, fetchUsers, fetchCustomers]);

  // ---------- Categories ----------
  const addCategory = useCallback(
    async (payload) => {
      const res = await categoriesApi.createCategory(payload);
      await fetchCategories();
      return res;
    },
    [fetchCategories]
  );

  const editCategory = useCallback(
    async (id, payload) => {
      const res = await categoriesApi.updateCategory(id, payload);
      await fetchCategories();
      return res;
    },
    [fetchCategories]
  );

  const removeCategory = useCallback(
    async (id) => {
      await categoriesApi.deleteCategory(id);
      await fetchCategories();
      await fetchSubcategories();
    },
    [fetchCategories, fetchSubcategories]
  );

  // ---------- Sub-categories ----------
  const addSubCategory = useCallback(
    async (payload) => {
      const res = await subcategoriesApi.createSubCategory(payload);
      await fetchSubcategories();
      return res;
    },
    [fetchSubcategories]
  );

  const editSubCategory = useCallback(
    async (id, payload) => {
      const res = await subcategoriesApi.updateSubCategory(id, payload);
      await fetchSubcategories();
      return res;
    },
    [fetchSubcategories]
  );

  const removeSubCategory = useCallback(
    async (id) => {
      await subcategoriesApi.deleteSubCategory(id);
      await fetchSubcategories();
    },
    [fetchSubcategories]
  );

  // ---------- Products ----------
  const addProduct = useCallback(
    async (formData) => {
      const res = await productsApi.createProduct(formData);
      await fetchProducts(1, 10, productsCollection);
      await fetchLooms();
      return res;
    },
    [fetchProducts, fetchLooms, productsCollection]
  );

  const editProduct = useCallback(
    async (id, payload) => {
      const res = await productsApi.updateProduct(id, payload);
      await fetchProducts(1, 10, productsCollection);
      await fetchLooms();
      return res;
    },
    [fetchProducts, fetchLooms, productsCollection]
  );

  const removeProduct = useCallback(
    async (id) => {
      await productsApi.deleteProduct(id);
      await fetchProducts(1, 10, productsCollection);
      await fetchLooms();
    },
    [fetchProducts, fetchLooms, productsCollection]
  );

  // ---------- Orders ----------
  const changeOrderStatus = useCallback(
    async (id, status) => {
      const res = await ordersApi.updateOrderStatus(id, status);
      await fetchOrders();
      return res;
    },
    [fetchOrders]
  );

  // ---------- Looms (Direct-from-Loom product tagging) ----------
  const addToLoom = useCallback(
    async (productId) => {
      const res = await loomsApi.addToLoom(productId);
      await fetchLooms();
      await fetchProducts(1, 10, productsCollection);
      return res;
    },
    [fetchLooms, fetchProducts, productsCollection]
  );

  const removeLoom = useCallback(
    async (productId) => {
      await loomsApi.removeFromLoom(productId);
      await fetchLooms();
      await fetchProducts(1, 10, productsCollection);
    },
    [fetchLooms, fetchProducts, productsCollection]
  );

  // ---------- Users (Admin Dashboard Users) ----------
  const addUser = useCallback(
    async (userData) => {
      const res = await usersApi.createUser(userData);
      await fetchUsers();
      return res;
    },
    [fetchUsers]
  );

  const editUser = useCallback(
    async (id, updates) => {
      const res = await usersApi.updateUser(id, updates);
      await fetchUsers();
      return res;
    },
    [fetchUsers]
  );

  const removeUser = useCallback(
    async (id) => {
      await usersApi.deleteUser(id);
      await fetchUsers();
    },
    [fetchUsers]
  );

  // ---------- Service Requests ----------
  const addServiceRequest = useCallback(
    async (payload) => {
      const res = await serviceRequestsApi.createServiceRequest(payload);
      await fetchServiceRequests();
      return res;
    },
    [fetchServiceRequests]
  );

  const editServiceRequest = useCallback(
    async (id, payload) => {
      const res = await serviceRequestsApi.updateServiceRequest(id, payload);
      await fetchServiceRequests();
      return res;
    },
    [fetchServiceRequests]
  );

  const updateServiceRequestStatus = useCallback(
    async (id, payload) => {
      const res = await serviceRequestsApi.updateServiceRequestStatus(id, payload);
      await fetchServiceRequests();
      return res;
    },
    [fetchServiceRequests]
  );

  const removeServiceRequest = useCallback(
    async (id) => {
      await serviceRequestsApi.deleteServiceRequest(id);
      await fetchServiceRequests();
    },
    [fetchServiceRequests]
  );

  const value = {
    // Categories
    categories,
    categoriesLoading,
    addCategory,
    editCategory,
    removeCategory,
    fetchCategories,

    // Subcategories
    subcategories,
    addSubCategory,
    editSubCategory,
    removeSubCategory,

    // Products
    products,
    pageProducts,
    productsCollection,
    productsLoading,
    addProduct,
    editProduct,
    removeProduct,
    fetchProducts,

    // Orders
    orders,
    ordersMeta,
    ordersLoading,
    changeOrderStatus,
    fetchOrders,

    // Looms
    looms,
    loomsLoading,
    addToLoom,
    removeLoom,
    fetchLooms,

    // Users
    users,
    usersLoading,
    addUser,
    editUser,
    removeUser,
    fetchUsers,

    // Customers
    customers,
    customersMeta,
    customersLoading,
    fetchCustomers,

    // Service Requests
    serviceRequests,
    serviceRequestsMeta,
    serviceRequestsLoading,
    addServiceRequest,
    editServiceRequest,
    updateServiceRequestStatus,
    removeServiceRequest,
    fetchServiceRequests,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
}
