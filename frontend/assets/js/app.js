import { authApi, catalogApi, cartApi, orderApi, paymentApi, storage, wishlistApi } from "./api.js";

const state = {
  mode: "login",
  user: storage.getUser(),
  categories: [],
  featured: [],
  products: [],
  cart: { items: [], subtotal: 0, itemCount: 0 },
  orders: [],
  wishlist: [],
  currentPage: 1,
  totalPages: 1,
  filters: {
    search: "",
    category: "",
    sort: "",
  },
  selectedProduct: null,
  currentSlide: 0,
};

const els = {
  loadingOverlay: document.getElementById("loading-overlay"),
  toast: document.getElementById("toast"),
  authTrigger: document.getElementById("auth-trigger"),
  logoutTrigger: document.getElementById("logout-trigger"),
  heroAuthBtns: [], // Will be populated in bindEvents
  heroPrev: document.getElementById("hero-prev"),
  heroNext: document.getElementById("hero-next"),
  authModal: document.getElementById("auth-modal"),
  authClose: document.getElementById("auth-close"),
  adminLink: document.getElementById("admin-link"),
  authForm: document.getElementById("auth-form"),
  profileForm: document.getElementById("profile-form"),
  authTitle: document.getElementById("auth-title"),
  loginTab: document.getElementById("login-tab"),
  registerTab: document.getElementById("register-tab"),
  nameField: document.getElementById("name-field"),
  phoneField: document.getElementById("phone-field"),
  cartCount: document.getElementById("cart-count"),
  featuredGrid: document.getElementById("featured-grid"),
  productsGrid: document.getElementById("products-grid"),
  categoryFilter: document.getElementById("category-filter"),
  searchInput: document.getElementById("search-input"),
  sortFilter: document.getElementById("sort-filter"),
  searchBtn: document.getElementById("search-btn"),
  paginationLabel: document.getElementById("pagination-label"),
  prevPage: document.getElementById("prev-page"),
  nextPage: document.getElementById("next-page"),
  heroCategories: document.getElementById("hero-categories"),
  cartItems: document.getElementById("cart-items"),
  summaryItems: document.getElementById("summary-items"),
  summarySubtotal: document.getElementById("summary-subtotal"),
  checkoutSummary: document.getElementById("checkout-summary"),
  checkoutForm: document.getElementById("checkout-form"),
  ordersList: document.getElementById("orders-list"),
  wishlistGrid: document.getElementById("wishlist-grid"),
  themeToggle: document.getElementById("theme-toggle"),
  productModal: document.getElementById("product-modal"),
  productClose: document.getElementById("product-close"),
  modalName: document.getElementById("modal-product-name"),
  modalImage: document.getElementById("modal-product-image"),
  modalCategory: document.getElementById("modal-product-category"),
  modalDescription: document.getElementById("modal-product-description"),
  modalPrice: document.getElementById("modal-product-price"),
  modalAddCart: document.getElementById("modal-add-cart"),
  modalWishlist: document.getElementById("modal-wishlist"),
  scrollTop: document.getElementById("scroll-top"),
  navSearchInput: document.getElementById("nav-search-input"),
  paginationContainer: document.getElementById("pagination-container"),
};

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);

const setLoading = (show) => {
  els.loadingOverlay.classList.toggle("hidden", !show);
  els.loadingOverlay.classList.toggle("flex", show);
};

const showToast = (message, isError = false) => {
  els.toast.textContent = message;
  els.toast.className =
    `fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-3 text-sm font-medium shadow-2xl transition-all duration-300 ${
      isError
        ? "bg-rose-600 text-white toast-show"
        : "bg-slate-900 text-white dark:bg-white dark:text-slate-900 toast-show"
    }`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    els.toast.classList.remove("toast-show");
    els.toast.classList.add("toast-hide");
  }, 2500);
};

const requireAuth = () => {
  if (!state.user) {
    openAuthModal("login");
    showToast("Please login to continue.", true);
    return false;
  }
  return true;
};

const setTheme = (theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  storage.setTheme(theme);
};

const openAuthModal = (mode) => {
  state.mode = mode;
  els.authModal.classList.remove("hidden");
  els.authModal.classList.add("flex");
  const registerMode = mode === "register";
  els.authTitle.textContent = registerMode ? "Create your account" : "Welcome back";
  els.nameField.classList.toggle("hidden", !registerMode);
  els.phoneField.classList.toggle("hidden", !registerMode);
  els.loginTab.className = registerMode
    ? "rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700"
    : "rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white";
  els.registerTab.className = registerMode
    ? "rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
    : "rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700";
};

const closeAuthModal = () => {
  els.authModal.classList.add("hidden");
  els.authModal.classList.remove("flex");
  els.authForm.reset();
};

const switchSection = (sectionId) => {
  document.querySelectorAll("main section").forEach((section) => {
    section.classList.toggle("section-hidden", section.id !== `section-${sectionId}`);
  });

  if (sectionId === "orders" && state.user) {
    loadOrders();
  }
  if (sectionId === "shop") {
    setLoading(true);
    loadCatalog().then(() => loadProducts()).finally(() => setLoading(false));
  }
  if (sectionId === "home") {
    setLoading(true);
    loadCatalog().finally(() => setLoading(false));
  }
};

const renderCategoryOptions = () => {
  if (els.categoryFilter) {
    els.categoryFilter.innerHTML = `<option value="">All Categories</option>${state.categories
      .map((category) => `<option value="${category.name}">${category.name}</option>`)
      .join("")}`;
  }

  if (els.heroCategories) {
    els.heroCategories.innerHTML = state.categories
      .map(
        (category) =>
          `<button class="hero-category rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white" data-category="${category.name}">${category.name}</button>`
      )
      .join("");
  }
};

const productCard = (product) => {
  if (!product || !product._id) return "";
  const isInWishlist = state.wishlist.includes(product._id.toString());
  return `
  <article class="product-card group relative rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div class="overflow-hidden rounded-[1.5rem]">
      <img src="${product.images[0]}" alt="${product.name}" class="h-64 w-full object-cover transition duration-500 group-hover:scale-110" />
    </div>
    <button class="wishlist-toggle absolute top-6 right-6 rounded-full bg-white/80 p-2 text-slate-900 backdrop-blur-md transition hover:bg-rose-500 hover:text-white dark:bg-slate-900/80 dark:text-white ${isInWishlist ? 'bg-rose-500 text-white' : ''}" data-id="${product._id}">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    </button>
    <div class="mt-4">
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold text-brand-600">${product.categoryName || product.category?.name || ""}</p>
        <p class="text-sm font-bold text-slate-900 dark:text-white">${money(product.price)}</p>
      </div>
      <h3 class="mt-2 text-lg font-bold truncate">${product.name}</h3>
      <div class="mt-4 flex gap-2">
        <button class="view-product flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700" data-id="${product._id}">Details</button>
        <button class="add-cart flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700" data-id="${product._id}">Add Cart</button>
      </div>
    </div>
  </article>
`;
};

const renderFeatured = () => {
  if (els.featuredGrid) {
    els.featuredGrid.innerHTML = state.featured.length
      ? state.featured.map(productCard).join("")
      : `<div class="rounded-3xl border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Featured products will appear here.</div>`;
  }
};

const renderProducts = () => {
  if (els.productsGrid) {
    els.productsGrid.innerHTML = state.products.length
      ? state.products.map(productCard).join("")
      : `<div class="rounded-3xl border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No products matched your current filters.</div>`;
  }

  if (els.paginationContainer) {
    els.paginationContainer.classList.toggle("hidden", state.totalPages <= 1);
  }
  if (els.paginationLabel) {
    els.paginationLabel.textContent = `Page ${state.currentPage} of ${state.totalPages}`;
  }
  if (els.prevPage) {
    els.prevPage.disabled = state.currentPage <= 1;
    els.prevPage.classList.toggle("opacity-50", state.currentPage <= 1);
    els.prevPage.classList.toggle("cursor-not-allowed", state.currentPage <= 1);
  }
  if (els.nextPage) {
    els.nextPage.disabled = state.currentPage >= state.totalPages;
    els.nextPage.classList.toggle("opacity-50", state.currentPage >= state.totalPages);
    els.nextPage.classList.toggle("cursor-not-allowed", state.currentPage >= state.totalPages);
  }
};

const loadWishlist = async () => {
  if (!state.user) return;
  try {
    const res = await wishlistApi.get();
    state.wishlist = res.wishlist ? res.wishlist.productIds.filter(p => p).map(p => (p._id || p).toString()) : [];
    renderWishlist(res.wishlist ? res.wishlist.productIds.filter(p => p) : []);
    renderFeatured();
    renderProducts();
  } catch (error) {
    console.error("Wishlist load error:", error);
  }
};

const renderWishlist = (products = []) => {
  if (!els.wishlistGrid) return;
  els.wishlistGrid.innerHTML = products.length
    ? products.map(productCard).join("")
    : `<div class="col-span-full rounded-3xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Your wishlist is empty. Add items you love to save them for later.</div>`;
};

const handleWishlistToggle = async (productId) => {
  if (!state.user) {
    showToast("Please login to use wishlist", true);
    openAuthModal("login");
    return;
  }

  const isInWishlist = state.wishlist.includes(productId);
  try {
    if (isInWishlist) {
      await wishlistApi.remove(productId);
      state.wishlist = state.wishlist.filter(id => id !== productId);
      showToast("Removed from wishlist");
    } else {
      await wishlistApi.add(productId);
      state.wishlist.push(productId);
      showToast("Added to wishlist");
    }
    // Re-render current catalog, cart and wishlist
    renderFeatured();
    renderProducts();
    renderCart();
    if (state.selectedProduct && state.selectedProduct._id === productId) {
      updateModalWishlistBtn();
    }
    await loadWishlist();
  } catch (error) {
    showToast(error.message, true);
  }
};

const renderCart = () => {
  if (els.cartCount) els.cartCount.textContent = state.cart.itemCount || 0;
  if (els.summaryItems) els.summaryItems.textContent = state.cart.itemCount || 0;
  if (els.summarySubtotal) els.summarySubtotal.textContent = money(state.cart.subtotal || 0);
  if (els.checkoutSummary) els.checkoutSummary.innerHTML = "";

  if (!state.cart.items.length) {
    const emptyState = `<div class="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Your cart is empty. Add a few products to continue.</div>`;
    if (els.cartItems) els.cartItems.innerHTML = emptyState;
    if (els.checkoutSummary) els.checkoutSummary.innerHTML = emptyState;
    return;
  }

  if (els.cartItems) {
    els.cartItems.innerHTML = state.cart.items
      .map(
        (item) => `
        <div class="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
          <div class="flex flex-col gap-4 md:flex-row md:items-center">
            <img src="${item.image}" alt="${item.name}" class="h-24 w-24 rounded-2xl object-cover" />
            <div class="flex-1">
              <h4 class="text-lg font-bold">${item.name}</h4>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${money(item.price)} each</p>
            </div>
            <div class="flex items-center gap-3">
              <button class="wishlist-toggle rounded-xl border border-slate-200 px-3 py-2 transition hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-950/20 ${item.product && state.wishlist.includes((item.product._id || item.product).toString()) ? 'bg-rose-500 text-white border-rose-500' : ''}" data-id="${item.product ? (item.product._id || item.product) : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${item.product && state.wishlist.includes((item.product._id || item.product).toString()) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${item.product && state.wishlist.includes((item.product._id || item.product).toString()) ? 'text-white' : 'text-rose-500'}"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </button>
              <input type="number" min="1" value="${item.quantity}" data-qty="${item._id}" class="cart-qty w-20 rounded-xl border border-slate-200 px-3 py-2 text-center dark:border-slate-700 dark:bg-slate-950" />
              <button class="remove-cart rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600" data-id="${item._id}">Remove</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  }

  if (els.checkoutSummary) {
    els.checkoutSummary.innerHTML = state.cart.items
      .map(
        (item) => `
        <div class="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
          <span>${item.name} x ${item.quantity}</span>
          <span class="font-semibold">${money(item.lineTotal)}</span>
        </div>
      `
      )
      .join("");
  }
};

const renderOrders = () => {
  if (els.ordersList) {
    els.ordersList.innerHTML = state.orders.length
      ? state.orders
          .map(
            (order) => `
            <article class="rounded-[2rem] border border-slate-200 p-6 dark:border-slate-800">
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p class="text-sm font-semibold text-brand-600">Order #${order._id.slice(-6).toUpperCase()}</p>
                  <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">${new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                    'bg-slate-100 text-slate-700'
                  }">${order.status}</span>
                  <span class="rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                    order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                    order.paymentStatus === 'failed' ? 'bg-rose-100 text-rose-700' : 
                    'bg-amber-100 text-amber-700'
                  }">${order.paymentStatus === 'paid' ? 'Payment Success' : 'Payment Pending'}</span>
                  <span class="text-lg font-bold">${money(order.totalAmount)}</span>
                </div>
              </div>
              
              <!-- Tracking Timeline -->
              <div class="mt-6 flex items-center gap-2 overflow-x-auto pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <div class="flex items-center gap-2 ${order.status !== 'pending' ? 'text-emerald-600' : 'text-brand-600'}">
                  <div class="h-2 w-2 rounded-full bg-current"></div>
                  <span>Ordered</span>
                </div>
                <div class="h-px w-8 bg-slate-200"></div>
                <div class="flex items-center gap-2 ${['shipped', 'delivered'].includes(order.status) ? 'text-emerald-600' : ''}">
                  <div class="h-2 w-2 rounded-full bg-current"></div>
                  <span>Shipped</span>
                </div>
                <div class="h-px w-8 bg-slate-200"></div>
                <div class="flex items-center gap-2 ${order.status === 'delivered' ? 'text-emerald-600' : ''}">
                  <div class="h-2 w-2 rounded-full bg-current"></div>
                  <span>Delivered</span>
                </div>
              </div>

              <div class="mt-5 grid gap-3 md:grid-cols-2">
                ${order.items
                  .map(
                    (item) => `
                    <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-950">
                      <p class="font-semibold">${item.name}</p>
                      <p class="mt-1 text-slate-500 dark:text-slate-400">Qty ${item.quantity} • ${money(item.lineTotal)}</p>
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </article>
          `
          )
          .join("")
      : `<div class="rounded-3xl border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No orders found yet. Complete a checkout to see your history.</div>`;
  }
};

const renderAuthState = () => {
  if (state.user) {
    els.authTrigger.textContent = state.user.name;
    els.logoutTrigger.classList.remove("hidden");
    if (els.adminLink) {
      els.adminLink.classList.toggle("hidden", state.user.role !== "admin");
    }
    document.querySelectorAll(".hero-auth-btn").forEach(btn => btn.classList.add("hidden"));
    if (els.profileForm) {
      els.profileForm.name.value = state.user.name;
      els.profileForm.email.value = state.user.email;
      els.profileForm.phone.value = state.user.phone || "";
    }
  } else {
    els.authTrigger.textContent = "Login";
    els.logoutTrigger.classList.add("hidden");
    if (els.adminLink) {
      els.adminLink.classList.add("hidden");
    }
    document.querySelectorAll(".hero-auth-btn").forEach(btn => btn.classList.remove("hidden"));
  }
};

const loadCatalog = async () => {
  const [categoriesResponse, featuredResponse] = await Promise.all([
    catalogApi.categories(),
    catalogApi.featured(),
  ]);

  state.categories = categoriesResponse.categories || [];
  state.featured = featuredResponse.products || [];
  renderCategoryOptions();
  renderFeatured();
};

const loadProducts = async () => {
  const response = await catalogApi.products({
    page: state.currentPage,
    limit: 8,
    ...state.filters,
  });
  state.products = response.products || [];
  state.totalPages = response.pagination?.totalPages || 1;
  renderProducts();
};

const loadCart = async () => {
  if (!state.user) {
    state.cart = { items: [], subtotal: 0, itemCount: 0 };
    renderCart();
    return;
  }

  const cart = await cartApi.get();
  state.cart = cart;
  renderCart();
};

const loadOrders = async () => {
  if (!state.user) {
    state.orders = [];
    renderOrders();
    return;
  }

  const response = await orderApi.mine();
  state.orders = response.orders || [];
  renderOrders();
};

const hydrateUser = async () => {
  if (!storage.getToken()) {
    state.user = null;
    storage.clearUser();
    renderAuthState();
    return;
  }

  try {
    const response = await authApi.me();
    state.user = response.user;
    storage.setUser(response.user);
  } catch (_error) {
    state.user = null;
    storage.clearToken();
    storage.clearUser();
  }

  renderAuthState();
};

const handleAuthSubmit = async (event) => {
  event.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const response =
      state.mode === "register"
        ? await authApi.register(payload)
        : await authApi.login(payload);

    storage.setToken(response.token);
    storage.setUser(response.user);
    state.user = response.user;
    renderAuthState();
    closeAuthModal();
    await loadCart();
    showToast(state.mode === "register" ? "Account created successfully." : "Logged in successfully.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setLoading(false);
  }
};

const handleAddToCart = async (productId) => {
  if (!requireAuth()) return;

  setLoading(true);
  try {
    const response = await cartApi.add({ productId, quantity: 1 });
    state.cart = response.cart;
    renderCart();
    showToast("Item added to cart.");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setLoading(false);
  }
};

const openProductModal = async (productId) => {
  setLoading(true);
  try {
    const response = await catalogApi.product(productId);
    state.selectedProduct = response.product;
    els.modalName.textContent = state.selectedProduct.name;
    els.modalImage.src = state.selectedProduct.images[0];
    els.modalImage.alt = state.selectedProduct.name;
    els.modalCategory.textContent = state.selectedProduct.categoryName || state.selectedProduct.category?.name || "";
    els.modalDescription.textContent = state.selectedProduct.description;
    els.modalPrice.textContent = money(state.selectedProduct.price);
    updateModalWishlistBtn();
    els.productModal.classList.remove("hidden");
    els.productModal.classList.add("flex");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setLoading(false);
  }
};

const updateModalWishlistBtn = () => {
  if (!els.modalWishlist || !state.selectedProduct) return;
  const isInWishlist = state.wishlist.includes(state.selectedProduct._id);
  els.modalWishlist.textContent = isInWishlist ? "Remove Favorite" : "Add Favorite";
  els.modalWishlist.classList.toggle("bg-rose-500", isInWishlist);
  els.modalWishlist.classList.toggle("text-white", isInWishlist);
  els.modalWishlist.classList.toggle("border-rose-500", isInWishlist);
};

const initHeroSlider = () => {
  const slides = document.querySelectorAll(".hero-slide");
  const indicators = document.querySelectorAll("#slider-indicators div");
  let slideInterval;

  if (!slides.length) return;

  const showSlide = (index) => {
    state.currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle("opacity-100", i === state.currentSlide);
      slide.classList.toggle("opacity-0", i !== state.currentSlide);
      slide.style.zIndex = i === state.currentSlide ? "10" : "0";
    });
    indicators.forEach((indicator, i) => {
      indicator.className = i === state.currentSlide 
        ? "h-1.5 w-8 rounded-full bg-white transition-all duration-300" 
        : "h-1.5 w-4 rounded-full bg-white/40 transition-all duration-300";
    });
  };

  const nextSlide = () => showSlide(state.currentSlide + 1);
  const prevSlide = () => showSlide(state.currentSlide - 1);

  const startAutoPlay = () => {
    slideInterval = setInterval(nextSlide, 5000);
  };

  const resetInterval = () => {
    clearInterval(slideInterval);
    startAutoPlay();
  };

  if (els.heroNext) {
    els.heroNext.addEventListener("click", () => {
      nextSlide();
      resetInterval();
    });
  }

  if (els.heroPrev) {
    els.heroPrev.addEventListener("click", () => {
      prevSlide();
      resetInterval();
    });
  }

  startAutoPlay();
};

const bindEvents = () => {
  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => switchSection(button.dataset.sectionTarget));
  });

  els.authTrigger.addEventListener("click", () => {
    if (state.user) {
      switchSection("profile");
    } else {
      openAuthModal("login");
    }
  });

  document.querySelectorAll(".hero-auth-btn").forEach((btn) => {
    btn.addEventListener("click", () => openAuthModal("register"));
  });
  els.authClose.addEventListener("click", closeAuthModal);
  els.loginTab.addEventListener("click", () => openAuthModal("login"));
  els.registerTab.addEventListener("click", () => openAuthModal("register"));
  els.authForm.addEventListener("submit", handleAuthSubmit);

  els.logoutTrigger.addEventListener("click", async () => {
    await authApi.logout().catch(() => {});
    storage.clearToken();
    storage.clearUser();
    state.user = null;
    await loadCart();
    renderAuthState();
    switchSection("home");
    showToast("Logged out successfully.");
  });

  if (els.profileForm) {
    els.profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setLoading(true);
      try {
        const formData = new FormData(event.currentTarget);
        const payload = Object.fromEntries(formData.entries());
        if (!payload.password) delete payload.password;
        
        const response = await authApi.updateProfile(payload);
        storage.setUser(response.user);
        state.user = response.user;
        renderAuthState();
        showToast("Profile updated successfully!");
      } catch (error) {
        showToast(error.message, true);
      } finally {
        setLoading(false);
      }
    });
  }

  els.searchBtn.addEventListener("click", async () => {
    state.currentPage = 1;
    state.filters.search = els.searchInput.value.trim();
    state.filters.category = els.categoryFilter.value;
    state.filters.sort = els.sortFilter.value;
    setLoading(true);
    try {
      await loadProducts();
    } finally {
      setLoading(false);
    }
  });

  let searchTimeout;
  els.searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      state.currentPage = 1;
      state.filters.search = els.searchInput.value.trim();
      try {
        await loadProducts();
      } catch (e) {}
    }, 600);
  });

  let navSearchTimeout;
  els.navSearchInput.addEventListener("input", () => {
    clearTimeout(navSearchTimeout);
    navSearchTimeout = setTimeout(async () => {
      const val = els.navSearchInput.value.trim();
      if (!val) return;
      
      if (document.getElementById("section-shop").classList.contains("section-hidden")) {
        switchSection("shop");
      }
      
      // Reset filters for a clean individual search from navbar
      state.filters.category = "";
      state.filters.sort = "";
      els.categoryFilter.value = "";
      els.sortFilter.value = "";
      
      els.searchInput.value = val;
      state.currentPage = 1;
      state.filters.search = val;
      try {
        await loadProducts();
      } catch (e) {}
    }, 600);
  });

  els.prevPage.addEventListener("click", async () => {
    if (state.currentPage <= 1) return;
    state.currentPage -= 1;
    setLoading(true);
    try {
      await loadProducts();
    } finally {
      setLoading(false);
    }
  });

  els.nextPage.addEventListener("click", async () => {
    if (state.currentPage >= state.totalPages) return;
    state.currentPage += 1;
    setLoading(true);
    try {
      await loadProducts();
    } finally {
      setLoading(false);
    }
  });

  document.body.addEventListener("click", async (event) => {
    const addBtn = event.target.closest(".add-cart");
    const viewBtn = event.target.closest(".view-product");
    const categoryBtn = event.target.closest(".hero-category");
    const removeBtn = event.target.closest(".remove-cart");
    const wishlistBtn = event.target.closest(".wishlist-toggle");

    if (addBtn) {
      handleAddToCart(addBtn.dataset.id);
    }

    if (viewBtn) {
      openProductModal(viewBtn.dataset.id);
    }

    if (categoryBtn) {
      switchSection("shop");
      els.categoryFilter.value = categoryBtn.dataset.category;
      state.filters.category = categoryBtn.dataset.category;
      state.currentPage = 1;
      setLoading(true);
      try {
        await loadProducts();
      } finally {
        setLoading(false);
      }
    }

    if (removeBtn) {
      setLoading(true);
      try {
        const response = await cartApi.remove(removeBtn.dataset.id);
        state.cart = response.cart;
        renderCart();
        showToast("Item removed from cart.");
      } catch (error) {
        showToast(error.message, true);
      } finally {
        setLoading(false);
      }
    }

    if (wishlistBtn) {
      handleWishlistToggle(wishlistBtn.dataset.id);
    }
  });

  document.body.addEventListener("change", async (event) => {
    if (!event.target.classList.contains("cart-qty")) return;
    setLoading(true);
    try {
      const response = await cartApi.update(event.target.dataset.qty, {
        quantity: Number(event.target.value),
      });
      state.cart = response.cart;
      renderCart();
      showToast("Cart quantity updated.");
    } catch (error) {
      showToast(error.message, true);
    } finally {
      setLoading(false);
    }
  });

  els.checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!requireAuth()) return;

    const paymentMethod = new FormData(event.currentTarget).get("paymentMethod") || "cod";

    setLoading(true);
    try {
      const formData = new FormData(els.checkoutForm);
      const shippingAddress = Object.fromEntries(formData.entries());

      if (paymentMethod === "stripe") {
        const response = await paymentApi.createCheckoutSession({ shippingAddress });
        window.location.href = response.url;
        return;
      }

      await orderApi.checkout({ shippingAddress });
      els.checkoutForm.reset();
      await loadCart();
      await loadOrders();
      switchSection("orders");
      showToast("Order placed successfully.");
    } catch (error) {
      showToast(error.message, true);
    } finally {
      setLoading(false);
    }
  });

  els.themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    setTheme(nextTheme);
  });

  els.productClose.addEventListener("click", () => {
    els.productModal.classList.add("hidden");
    els.productModal.classList.remove("flex");
  });

  els.modalAddCart.addEventListener("click", () => {
    if (state.selectedProduct) {
      handleAddToCart(state.selectedProduct._id);
    }
  });

  els.modalWishlist.addEventListener("click", () => {
    if (state.selectedProduct) {
      handleWishlistToggle(state.selectedProduct._id);
    }
  });
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      els.scrollTop.classList.remove("translate-y-20");
    } else {
      els.scrollTop.classList.add("translate-y-20");
    }
  });

  els.scrollTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

const init = async () => {
  setTheme(storage.getTheme());
  bindEvents();
  setLoading(true);
  try {
    await hydrateUser();

    // Check for Stripe session ID in URL (search or hash)
    const urlParams = new URLSearchParams(window.location.search || window.location.hash.split("?")[1]);
    const sessionId = urlParams.get("session_id");

    if (sessionId && state.user) {
      try {
        await paymentApi.verifyPayment(sessionId);
        showToast("Payment successful! Order created.");
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      } catch (error) {
        showToast(error.message, true);
      }
    }

    await loadCatalog();
    await loadWishlist();
    await loadProducts();
    await loadCart();
    await loadOrders();
    initHeroSlider();

    // Handle hash routing
    const hash = window.location.hash.slice(1);
    const validSections = ["home", "shop", "cart", "orders", "wishlist", "profile"];
    if (validSections.includes(hash)) {
      switchSection(hash);
    }
  } catch (error) {
    showToast(error.message, true);
  } finally {
    setLoading(false);
  }
};

init();
