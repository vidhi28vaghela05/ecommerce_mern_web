import { adminApi, authApi, catalogApi, storage } from "./api.js";

const state = {
  user: storage.getUser(),
  products: [],
  categories: [],
  orders: [],
  users: [],
};

const els = {
  loginSection: document.getElementById("admin-login-section"),
  app: document.getElementById("admin-app"),
  loginForm: document.getElementById("admin-login-form"),
  logout: document.getElementById("admin-logout"),
  statsGrid: document.getElementById("stats-grid"),
  productsList: document.getElementById("admin-products-list"),
  categoriesList: document.getElementById("admin-categories-list"),
  ordersList: document.getElementById("admin-orders-list"),
  usersList: document.getElementById("admin-users-list"),
  productForm: document.getElementById("product-form"),
  categoryForm: document.getElementById("category-form"),
  productCategorySelect: document.getElementById("product-category-select"),
  productReset: document.getElementById("product-reset"),
  categoryReset: document.getElementById("category-reset"),
};

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);

const toast = (message) => window.alert(message);

const ensureAdmin = async () => {
  if (!storage.getToken()) return false;
  try {
    const response = await authApi.me();
    state.user = response.user;
    storage.setUser(response.user);
    return response.user.role === "admin";
  } catch (_error) {
    storage.clearToken();
    storage.clearUser();
    return false;
  }
};

const toggleAdminApp = (enabled) => {
  els.loginSection.classList.toggle("hidden", enabled);
  els.app.classList.toggle("hidden", !enabled);
};

const renderStats = (stats) => {
  const cards = [
    { label: "Users", value: stats.totalUsers },
    { label: "Orders", value: stats.totalOrders },
    { label: "Products", value: stats.totalProducts },
    { label: "Revenue", value: money(stats.totalRevenue) },
  ];

  els.statsGrid.innerHTML = cards
    .map(
      (card) => `
      <div class="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-slate-900">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">${card.label}</p>
        <p class="mt-3 text-3xl font-extrabold">${card.value}</p>
      </div>
    `
    )
    .join("");
};

const renderCategoryOptions = () => {
  els.productCategorySelect.innerHTML = state.categories
    .map((category) => `<option value="${category._id}">${category.name}</option>`)
    .join("");
};

const renderProducts = () => {
  els.productsList.innerHTML = state.products
    .map(
      (product) => `
      <article class="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
        <div class="flex flex-col gap-4 md:flex-row md:items-center">
          <img src="${product.images[0]}" alt="${product.name}" class="h-24 w-24 rounded-2xl object-cover" />
          <div class="flex-1">
            <h4 class="text-lg font-bold">${product.name}</h4>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${product.categoryName} • ${money(product.price)} • Stock ${product.stock}</p>
          </div>
          <div class="flex gap-3">
            <button class="edit-product rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700" data-id="${product._id}">Edit</button>
            <button class="delete-product rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600" data-id="${product._id}">Delete</button>
          </div>
        </div>
      </article>
    `
    )
    .join("");
};

const renderCategories = () => {
  els.categoriesList.innerHTML = state.categories
    .map(
      (category) => `
      <article class="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h4 class="text-lg font-bold">${category.name}</h4>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">${category.description || "No description"}</p>
          </div>
          <div class="flex gap-3">
            <button class="edit-category rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700" data-id="${category._id}">Edit</button>
            <button class="delete-category rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600" data-id="${category._id}">Delete</button>
          </div>
        </div>
      </article>
    `
    )
    .join("");
};

const renderOrders = () => {
  els.ordersList.innerHTML = state.orders
    .map(
      (order) => `
      <article class="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h4 class="text-lg font-bold">Order #${order._id.slice(-6).toUpperCase()}</h4>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${order.user?.name || "Guest"} • ${money(order.totalAmount)}</p>
          </div>
          <select class="order-status rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950" data-id="${order._id}">
            ${["pending", "shipped", "delivered"]
              .map((status) => `<option value="${status}" ${order.status === status ? "selected" : ""}>${status}</option>`)
              .join("")}
          </select>
        </div>
      </article>
    `
    )
    .join("");
};

const renderUsers = () => {
  els.usersList.innerHTML = state.users
    .map(
      (user) => `
      <article class="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 class="text-lg font-bold">${user.name}</h4>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${user.email} • ${user.role}</p>
          </div>
          <button class="delete-user rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600" data-id="${user._id}">Delete</button>
        </div>
      </article>
    `
    )
    .join("");
};

const resetProductForm = () => els.productForm.reset();
const resetCategoryForm = () => els.categoryForm.reset();

const fillProductForm = (product) => {
  els.productForm.productId.value = product._id;
  els.productForm.name.value = product.name;
  els.productForm.description.value = product.description;
  els.productForm.price.value = product.price;
  els.productForm.compareAtPrice.value = product.compareAtPrice || "";
  els.productForm.stock.value = product.stock;
  els.productForm.sku.value = product.sku;
  els.productForm.brand.value = product.brand || "";
  els.productForm.category.value = product.category?._id || product.category;
  els.productForm.featured.checked = Boolean(product.featured);
  els.productForm.imageUrls.value = product.images.join(", ");
};

const fillCategoryForm = (category) => {
  els.categoryForm.categoryId.value = category._id;
  els.categoryForm.name.value = category.name;
  els.categoryForm.description.value = category.description || "";
  els.categoryForm.image.value = category.image || "";
};

const loadDashboard = async () => {
  const [stats, productsResponse, categoriesResponse, ordersResponse, usersResponse] = await Promise.all([
    adminApi.stats(),
    catalogApi.products({ page: 1, limit: 50 }),
    adminApi.categories(),
    adminApi.orders(),
    adminApi.users(),
  ]);

  state.products = productsResponse.products || [];
  state.categories = categoriesResponse.categories || [];
  state.orders = ordersResponse.orders || [];
  state.users = usersResponse.users || [];

  renderStats(stats.stats);
  renderCategoryOptions();
  renderProducts();
  renderCategories();
  renderOrders();
  renderUsers();
};

const formDataFromProductForm = () => {
  const formData = new FormData();
  const files = els.productForm.images.files;
  [...files].forEach((file) => formData.append("images", file));
  formData.append("name", els.productForm.name.value);
  formData.append("description", els.productForm.description.value);
  formData.append("price", els.productForm.price.value);
  formData.append("compareAtPrice", els.productForm.compareAtPrice.value || 0);
  formData.append("stock", els.productForm.stock.value);
  formData.append("sku", els.productForm.sku.value);
  formData.append("brand", els.productForm.brand.value);
  formData.append("category", els.productForm.category.value);
  formData.append("featured", els.productForm.featured.checked);
  formData.append("imageUrls", els.productForm.imageUrls.value);
  return formData;
};

const bindEvents = () => {
  document.querySelectorAll(".admin-tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach((item) => {
        item.className = "admin-tab rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700";
      });
      button.className = "admin-tab rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white";
      document.querySelectorAll(".admin-panel").forEach((panel) => panel.classList.add("hidden"));
      document.getElementById(`tab-${button.dataset.adminTab}`).classList.remove("hidden");
    });
  });

  els.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await authApi.adminLogin(payload);
      storage.setToken(response.token);
      storage.setUser(response.user);
      toggleAdminApp(true);
      await loadDashboard();
      toast("Admin login successful.");
    } catch (error) {
      toast(error.message);
    }
  });

  els.logout.addEventListener("click", async () => {
    await authApi.logout().catch(() => {});
    storage.clearToken();
    storage.clearUser();
    toggleAdminApp(false);
  });

  els.productReset.addEventListener("click", resetProductForm);
  els.categoryReset.addEventListener("click", resetCategoryForm);

  els.productForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const id = els.productForm.productId.value;
      const data = formDataFromProductForm();
      if (id) {
        await adminApi.updateProduct(id, data);
      } else {
        await adminApi.createProduct(data);
      }
      resetProductForm();
      await loadDashboard();
      toast("Product saved successfully.");
    } catch (error) {
      toast(error.message);
    }
  });

  els.categoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      if (payload.categoryId) {
        await adminApi.updateCategory(payload.categoryId, payload);
      } else {
        await adminApi.createCategory(payload);
      }
      resetCategoryForm();
      await loadDashboard();
      toast("Category saved successfully.");
    } catch (error) {
      toast(error.message);
    }
  });

  document.body.addEventListener("click", async (event) => {
    const editProduct = event.target.closest(".edit-product");
    const deleteProduct = event.target.closest(".delete-product");
    const editCategory = event.target.closest(".edit-category");
    const deleteCategory = event.target.closest(".delete-category");
    const deleteUser = event.target.closest(".delete-user");

    if (editProduct) {
      const product = state.products.find((item) => item._id === editProduct.dataset.id);
      if (product) fillProductForm(product);
    }

    if (deleteProduct) {
      await adminApi.deleteProduct(deleteProduct.dataset.id);
      await loadDashboard();
      toast("Product deleted.");
    }

    if (editCategory) {
      const category = state.categories.find((item) => item._id === editCategory.dataset.id);
      if (category) fillCategoryForm(category);
    }

    if (deleteCategory) {
      try {
        await adminApi.deleteCategory(deleteCategory.dataset.id);
        await loadDashboard();
        toast("Category deleted.");
      } catch (error) {
        toast(error.message);
      }
    }

    if (deleteUser) {
      await adminApi.removeUser(deleteUser.dataset.id);
      await loadDashboard();
      toast("User deleted.");
    }
  });

  document.body.addEventListener("change", async (event) => {
    if (!event.target.classList.contains("order-status")) return;
    try {
      await adminApi.updateOrderStatus(event.target.dataset.id, event.target.value);
      await loadDashboard();
      toast("Order status updated.");
    } catch (error) {
      toast(error.message);
    }
  });
};

const init = async () => {
  bindEvents();
  const isAdmin = await ensureAdmin();
  if (isAdmin) {
    toggleAdminApp(true);
    await loadDashboard();
  } else {
    toggleAdminApp(false);
  }
};

init();
