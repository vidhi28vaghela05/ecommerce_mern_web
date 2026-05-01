/* global io */
import { adminApi, authApi, catalogApi, storage, contactApi, chatApi } from "./api.js";

const state = {
  user: storage.getUser(),
  products: [],
  categories: [],
  orders: [],
  users: [],
  conversations: [],
  activeRoom: null,
  messages: [],
  socket: null,
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
  themeToggle: document.getElementById("theme-toggle"),
  recentOrders: document.getElementById("admin-recent-orders"),
  recentUsers: document.getElementById("admin-recent-users"),
  paymentsList: document.getElementById("admin-payments-list"),
  chatUserEmail: document.getElementById("chat-user-email"),
  conversationsList: document.getElementById("admin-conversations-list"),
  chatArea: document.getElementById("admin-chat-area"),
  chatPlaceholder: document.getElementById("admin-chat-placeholder"),
  messagesList: document.getElementById("admin-messages-list"),
  chatForm: document.getElementById("admin-chat-form"),
  chatInput: document.getElementById("admin-chat-input"),
  chatUserName: document.getElementById("chat-user-name"),
  contactsList: document.getElementById("admin-contacts-list"),
  contactsCount: document.getElementById("contacts-count"),
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
  } catch {
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
  const ordersHtml = state.orders
    .map(
      (order) => `
      <article class="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 class="text-lg font-bold">Order #${order._id.slice(-6).toUpperCase()}</h4>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${order.user?.name || 'Guest'} • ${money(order.totalAmount)}</p>
          </div>
          <select class="order-status rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" data-id="${order._id}">
            <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pending</option>
            <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>Shipped</option>
            <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>Delivered</option>
            <option value="canceled" ${order.status === "canceled" ? "selected" : ""}>Canceled</option>
          </select>
        </div>
      </article>
    `
    )
    .join("");
  
  if (els.ordersList) els.ordersList.innerHTML = ordersHtml;
};

const renderPayments = () => {
  if (!els.paymentsList) return;
  els.paymentsList.innerHTML = state.orders.length ? state.orders.map(order => `
    <article class="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-lg font-bold">Transaction #${order.stripeSessionId?.slice(-8) || order._id.slice(-8)}</h4>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Order #${order._id.slice(-6).toUpperCase()} • ${order.user?.email || 'Guest'}</p>
          <div class="mt-2">
            <span class="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
              order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
              order.paymentStatus === 'refunded' ? 'bg-blue-100 text-blue-700' : 
              'bg-amber-100 text-amber-700'
            }">${order.paymentStatus}</span>
          </div>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold ${order.paymentStatus === 'refunded' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}">${money(order.totalAmount)}</p>
          <p class="text-xs font-semibold text-slate-400">${new Date(order.createdAt).toLocaleDateString()}</p>
          ${order.paymentStatus === 'paid' ? `
            <button class="refund-payment mt-3 rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/30" data-id="${order._id}">Issue Refund</button>
          ` : ''}
        </div>
      </div>
    </article>
  `).join("") : `<p class="text-center text-slate-500 py-8">No payment transactions found.</p>`;
};

const renderRecent = () => {
  if (els.recentOrders) {
    els.recentOrders.innerHTML = state.orders.slice(0, 5).map(order => `
      <div class="flex items-center justify-between text-sm">
        <span>Order #${order._id.slice(-6).toUpperCase()}</span>
        <span class="font-bold">${money(order.totalAmount)}</span>
      </div>
    `).join("");
  }
  if (els.recentUsers) {
    els.recentUsers.innerHTML = state.users.slice(0, 5).map(user => `
      <div class="flex items-center justify-between text-sm">
        <span>${user.name}</span>
        <span class="text-slate-500">${user.email}</span>
      </div>
    `).join("");
  }
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
  renderProducts();
  renderCategories();
  renderOrders();
  renderPayments();
  renderRecent();
  renderUsers();
  renderCategoryOptions();
  loadConversations();
  loadContacts();
  setupSocket();
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

const setTheme = (theme) => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  storage.setTheme(theme);
};

const renderConversations = () => {
  if (!els.conversationsList) return;
  els.conversationsList.innerHTML = state.conversations
    .map(
      (conv) => `
      <div class="conversation-item flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition ${
        state.activeRoom === conv._id ? "bg-brand-50 text-brand-600 dark:bg-brand-600/10" : "hover:bg-slate-50 dark:hover:bg-slate-800"
      }" data-room="${conv._id}">
        <div class="h-10 w-10 rounded-full bg-brand-600/10 text-brand-600 flex items-center justify-center font-bold">
          ${(conv.userName || "U").charAt(0).toUpperCase()}
        </div>
        <div class="flex-1 overflow-hidden">
          <div class="flex justify-between items-center">
            <h5 class="font-semibold text-sm truncate">${conv.userName || conv._id}</h5>
            ${conv.unreadCount > 0 ? `<span class="bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">${conv.unreadCount}</span>` : ""}
          </div>
          <p class="text-xs text-slate-500 truncate">${conv.lastMessage}</p>
        </div>
      </div>
    `
    )
    .join("");

  document.querySelectorAll(".conversation-item").forEach((item) => {
    item.addEventListener("click", () => selectConversation(item.dataset.room));
  });
};

const renderMessages = () => {
  if (!els.messagesList) return;
  els.messagesList.innerHTML = state.messages
    .map(
      (msg) => `
      <div class="flex ${msg.sender === state.user._id || msg.sender === "admin" || (msg.sender && msg.sender.role === "admin") ? "justify-end" : "justify-start"}">
        <div class="max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
          msg.sender === state.user._id || msg.sender === "admin" || (msg.sender && msg.sender.role === "admin")
            ? "bg-brand-600 text-white rounded-br-none"
            : "bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200 rounded-bl-none"
        }">
          ${msg.message}
          <div class="text-[10px] mt-1 ${msg.sender === state.user._id || msg.sender === "admin" || (msg.sender && msg.sender.role === "admin") ? "text-brand-100" : "text-slate-400"}">
            ${new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    `
    )
    .join("");
  els.messagesList.scrollTop = els.messagesList.scrollHeight;
};

const selectConversation = async (room) => {
  state.activeRoom = room;
  els.chatPlaceholder.classList.add("hidden");
  els.chatArea.classList.remove("hidden");
  
  const conv = state.conversations.find((c) => c._id === room);
  els.chatUserName.textContent = conv && conv.userName ? conv.userName : `User ${room.slice(-6).toUpperCase()}`;
  els.chatUserEmail.textContent = conv && conv.userEmail ? conv.userEmail : room;

  renderConversations();

  try {
    const history = await chatApi.getHistory(room, "admin");
    state.messages = history;
    renderMessages();
    
    if (state.socket) {
      state.socket.emit("join", room);
    }
  } catch (error) {
    toast(error.message);
  }
};

const setupSocket = () => {
  if (state.socket) return;
  
  const SOCKET_URL = window.location.origin;
  state.socket = io(SOCKET_URL);

  state.socket.on("message", (message) => {
    if (message.chatType === "admin") {
      if (message.room === state.activeRoom) {
        state.messages.push(message);
        renderMessages();
      }
      loadConversations();
    }
  });
};

const loadConversations = async () => {
  try {
    const conversations = await chatApi.getConversations();
    state.conversations = conversations;
    renderConversations();
  } catch (error) {
    console.error("Error loading conversations:", error);
  }
};



const loadContacts = async () => {
  try {
    const { contacts } = await contactApi.list();
    const newCount = contacts.filter(c => c.status === "new").length;
    if (els.contactsCount) els.contactsCount.textContent = `${newCount} new`;
    if (!els.contactsList) return;
    if (!contacts.length) {
      els.contactsList.innerHTML = `<p class="text-slate-500 text-sm">No messages yet.</p>`;
      return;
    }
    els.contactsList.innerHTML = contacts.map(c => `
      <article class="rounded-3xl border border-slate-100 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50" data-contact-id="${c._id}">
        <div class="flex flex-col gap-4">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <div class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full ${c.status === 'new' ? 'bg-brand-600' : 'bg-slate-300'}"></span>
                  <h4 class="font-bold text-slate-900 dark:text-white truncate">${c.name}</h4>
                </div>
                <span class="text-xs text-slate-500 truncate">${c.email}</span>
                <span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  c.status === 'new' ? 'bg-brand-50 text-brand-600' :
                  c.status === 'replied' ? 'bg-green-50 text-green-600' :
                  'bg-slate-100 text-slate-500'
                }">${c.status}</span>
              </div>
              <p class="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">${c.message}</p>
              <p class="mt-3 text-[10px] text-slate-400 font-medium">${new Date(c.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button class="contact-reply-chat rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-700" data-email="${c.email}">Reply via Chat</button>
            ${c.status === 'new' ? `<button class="contact-mark-read rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold dark:border-slate-700" data-id="${c._id}">Mark Read</button>` : ''}
            <button class="contact-mark-replied rounded-xl border border-green-200 px-4 py-2 text-xs font-bold text-green-600" data-id="${c._id}">Mark Replied</button>
            <button class="contact-delete rounded-xl border border-rose-100 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50" data-id="${c._id}">Delete</button>
          </div>
        </div>
      </article>
    `).join("");
  } catch (error) {
    console.error("Error loading contacts:", error);
  }
};

const bindEvents = () => {
  els.themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    setTheme(nextTheme);
  });

  document.querySelectorAll(".admin-tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach((item) => {
        item.className = "admin-tab rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700";
      });
      button.className = "admin-tab rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white";
      document.querySelectorAll(".admin-panel").forEach((panel) => panel.classList.add("hidden"));
      document.getElementById(`tab-${button.dataset.adminTab}`).classList.remove("hidden");
      if (button.dataset.adminTab === "contacts") loadContacts();
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

  els.chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!els.chatInput.value.trim() || !state.activeRoom || !state.socket) return;

    const messageData = {
      room: state.activeRoom,
      sender: state.user._id,
      receiver: state.activeRoom,
      message: els.chatInput.value.trim(),
      isAiChat: false,
    };

    state.socket.emit("sendMessage", messageData);
    els.chatInput.value = "";
  });

  els.contactsList.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("contact-reply-chat")) {
      const email = e.target.dataset.email;
      const conversation = state.conversations.find((conv) => conv.userEmail === email);
      if (conversation) {
        selectConversation(conversation._id);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast("This user hasn't started a live chat yet. They must visit the 'Messages' page first.");
      }
      return;
    }

    if (e.target.classList.contains("contact-mark-read")) {
      await contactApi.updateStatus(id, "read");
      loadContacts();
    } else if (e.target.classList.contains("contact-mark-replied")) {
      await contactApi.updateStatus(id, "replied");
      loadContacts();
    } else if (e.target.classList.contains("contact-delete")) {
      if (confirm("Are you sure?")) {
        await contactApi.remove(id);
        loadContacts();
      }
    }
  });

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


    const refundBtn = event.target.closest(".refund-payment");
    if (refundBtn) {
      const orderId = refundBtn.dataset.id;
      if (!orderId) return;
      
      if (!confirm("Are you sure you want to refund this payment?")) return;
      
      try {
        refundBtn.disabled = true;
        refundBtn.textContent = "Processing...";
        
        await adminApi.updatePaymentStatus(orderId, "refunded");
        await loadDashboard();
        toast("Payment refunded successfully.");
      } catch (error) {
        console.error("Refund error:", error);
        toast(error.message);
        refundBtn.disabled = false;
        refundBtn.textContent = "Issue Refund";
      }
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

  document.body.addEventListener("click", async (event) => {
    const markRead = event.target.closest(".contact-mark-read");
    const markReplied = event.target.closest(".contact-mark-replied");
    const deleteBtn = event.target.closest(".contact-delete");

    if (markRead) {
      try { await contactApi.updateStatus(markRead.dataset.id, "read"); await loadContacts(); } catch(e) { toast(e.message); }
    }
    if (markReplied) {
      try { await contactApi.updateStatus(markReplied.dataset.id, "replied"); await loadContacts(); } catch(e) { toast(e.message); }
    }
    if (deleteBtn) {
      if (!confirm("Delete this message?")) return;
      try { await contactApi.remove(deleteBtn.dataset.id); await loadContacts(); } catch(e) { toast(e.message); }
    }
  });
};

const init = async () => {
  setTheme(storage.getTheme());
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
