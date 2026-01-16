(function () {
    const $ = (s, p = document) => p.querySelector(s);
    const $$ = (s, p = document) => [...p.querySelectorAll(s)];

    const products = window.LEWIS_PRODUCTS || [];
    const categories = window.LEWIS_CATEGORIES || [];

    // year
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // mobile nav
    const navToggle = $(".nav-toggle");
    const navLinks = $("#navLinks");
    navToggle?.addEventListener("click", () => {
        const open = navLinks.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(open));
    });

    UI.wireCommonOverlays();
    UI.renderCart();

    // search -> products.html?q=
    const searchInput = $("#searchInput");
    const searchBtn = $("#searchBtn");
    const runSearch = () => {
        const q = (searchInput?.value || "").trim();
        if (!q) return;
        window.location.href = `products.html?q=${encodeURIComponent(q)}`;
    };
    searchBtn?.addEventListener("click", runSearch);
    searchInput?.addEventListener("keydown", (e) => (e.key === "Enter" ? runSearch() : null));

    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const params = new URLSearchParams(location.search);

    function money(n) { return `$${Number(n).toFixed(0)}`; }
    function safeJSONParse(raw, fallback) {
        try { return JSON.parse(raw); } catch { return fallback; }
    }

    // HOME
    if (path === "index.html" || path === "") {
        UI.renderCategoryGrid($("#categoryGrid"), categories);

        const featured = Store.sortProducts(products, "newest").slice(0, 2);
        UI.renderProductGrid($("#productGrid"), featured, { mode: "page" });
        return;
    }

    // PRODUCTS
    if (path === "products.html") {
        UI.renderCategoryGrid($("#categoryGrid"), categories);

        const sortSelect = $("#sortSelect");
        const prodGrid = $("#productGrid");

        let filter = "All";
        let sortMode = params.get("sort") || "newest";
        let q = params.get("q") || "";

        if (sortSelect) sortSelect.value = sortMode;
        if (q && searchInput) searchInput.value = q;

        function apply() {
            const filtered = products.filter(p => {
                const byCat = filter === "All" ? true : p.category === filter;
                const byQ = !q ? true : (p.name + " " + p.category).toLowerCase().includes(q.toLowerCase());
                return byCat && byQ;
            });

            const sorted = Store.sortProducts(filtered, sortMode);
            UI.renderProductGrid(prodGrid, sorted, { mode: "page" });
        }

        $$(".chip").forEach(chip => {
            chip.addEventListener("click", () => {
                $$(".chip").forEach(c => c.classList.remove("is-active"));
                chip.classList.add("is-active");
                filter = chip.dataset.filter;
                apply();
            });
        });

        sortSelect?.addEventListener("change", () => {
            sortMode = sortSelect.value;
            apply();
        });

        // sign in modal
        const signInBtn = $("#signInBtn");
        const signInModal = $("#signInModal");
        const signInForm = $("#signInForm");

        if (location.hash === "#signin") signInBtn?.click();
        if (location.hash === "#cart") UI.openDrawer();

        signInBtn?.addEventListener("click", () => {
            signInModal?.classList.add("is-open");
            signInModal?.setAttribute("aria-hidden", "false");
        });

        signInModal?.addEventListener("click", (e) => {
            if (e.target.dataset.closeSignin === "true") {
                signInModal.classList.remove("is-open");
                signInModal.setAttribute("aria-hidden", "true");
            }
        });

        signInForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Portfolio demo: authentication not implemented.");
            signInModal.classList.remove("is-open");
            signInModal.setAttribute("aria-hidden", "true");
        });

        apply();
        return;
    }

    // CATEGORY
    if (path === "category.html") {
        const name = params.get("name") || "All";
        $("#categoryTitle").textContent = name;

        const sortSelect = $("#sortSelect");
        const prodGrid = $("#productGrid");
        let sortMode = "newest";

        function apply() {
            const filtered = products.filter(p => p.category === name);
            const sorted = Store.sortProducts(filtered, sortMode);
            UI.renderProductGrid(prodGrid, sorted, { mode: "page" });
        }

        sortSelect?.addEventListener("change", () => {
            sortMode = sortSelect.value;
            apply();
        });

        apply();
        return;
    }

    // PRODUCT
    if (path === "product.html") {
        const id = params.get("id");
        const p = id ? Store.getProduct(id) : null;
        const host = $("#productView");

        if (!p) {
            host.innerHTML = `<p class="muted">Product not found. <a class="link" href="products.html">Browse products</a></p>`;
            return;
        }

        const wished = Store.isWished(p.id);

        host.innerHTML = `
      <div class="toolbar">
        <a class="btn btn-outline btn-pill" href="products.html">← Back</a>
        <a class="btn btn-outline btn-pill" href="category.html?name=${encodeURIComponent(p.category)}">View ${p.category}</a>
      </div>

      <div class="product-page">
        <div class="img">
          <img src="${p.image}" alt="${p.name}">
        </div>

        <div class="info">
          <p class="kicker">${p.category.toUpperCase()}</p>
          <h1 class="section-title" style="margin-bottom:8px;">${p.name}</h1>
          <div class="product-price" style="margin: 0 0 14px;">$${Number(p.price).toFixed(0)}</div>
          <p class="muted" style="line-height:1.9;">${p.description || ""}</p>

          <div class="modal-actions" style="margin-top:16px;">
            <button class="btn btn-dark btn-pill" id="addToCartBtn">ADD TO CART</button>
            <button class="btn btn-outline btn-pill" id="wishBtn">${wished ? "WISHLISTED" : "WISHLIST"}</button>
            <a class="btn btn-outline btn-pill" href="checkout.html">CHECKOUT</a>
          </div>

          <p class="muted small" style="margin-top:12px;">
            Portfolio demo — connect to a backend when you’re ready.
          </p>
        </div>
      </div>
    `;

        $("#addToCartBtn").addEventListener("click", () => {
            Store.addToCart(p.id, 1);
            UI.renderCart();
            UI.openDrawer();
        });

        $("#wishBtn").addEventListener("click", () => {
            const on = Store.toggleWishlist(p.id);
            $("#wishBtn").textContent = on ? "WISHLISTED" : "WISHLIST";
        });

        return;
    }

    // CHECKOUT
    if (path === "checkout.html") {
        const itemsEl = $("#checkoutItems");
        const subEl = $("#summarySubtotal");
        const delEl = $("#summaryDelivery");
        const totEl = $("#summaryTotal");

        function renderSummary() {
            const { items, subtotal } = Store.cartSummary();

            if (!items.length) {
                itemsEl.innerHTML = `<p class="muted">Your cart is empty. <a class="link" href="products.html">Browse products</a></p>`;
                subEl.textContent = money(0);
                delEl.textContent = money(0);
                totEl.textContent = money(0);
                return;
            }

            itemsEl.innerHTML = items.map(x => `
        <div class="summary-row">
          <img src="${x.image}" alt="${x.name}">
          <div>
            <h5>${x.name}</h5>
            <div class="muted small">${x.category} • Qty ${x.qty}</div>
          </div>
          <strong>${money(x.price * x.qty)}</strong>
        </div>
      `).join("");

            const checked = document.querySelector("input[name='delivery']:checked");
            const delivery = checked?.value === "express" ? 25 : 0;

            subEl.textContent = money(subtotal);
            delEl.textContent = money(delivery);
            totEl.textContent = money(subtotal + delivery);
        }

        document.querySelectorAll("input[name='delivery']").forEach(r => r.addEventListener("change", renderSummary));

        $("#checkoutForm").addEventListener("submit", (e) => {
            e.preventDefault();

            const { items, subtotal } = Store.cartSummary();
            if (!items.length) {
                alert("Your cart is empty.");
                return;
            }

            const checked = document.querySelector("input[name='delivery']:checked");
            const delivery = checked?.value === "express" ? 25 : 0;
            const total = subtotal + delivery;

            const orderId = `LI-${Date.now().toString().slice(-7)}`;

            const orderSnapshot = {
                id: orderId,
                createdAt: new Date().toISOString(),
                items: items.map(x => ({ id: x.id, name: x.name, category: x.category, price: x.price, qty: x.qty, image: x.image })),
                subtotal, delivery, total
            };

            try { localStorage.setItem("lewisinc_last_order", JSON.stringify(orderSnapshot)); } catch {}

            Store.clearCart();
            UI.renderCart();

            window.location.href = `order-success.html?order=${encodeURIComponent(orderId)}`;
        });

        renderSummary();
        return;
    }

    // ORDER SUCCESS
    if (path === "order-success.html") {
        const orderIdEl = $("#orderId");
        const itemsEl = $("#orderItems");
        const subEl = $("#orderSubtotal");
        const delEl = $("#orderDelivery");
        const totEl = $("#orderTotal");

        const requestedId = params.get("order") || "";
        const snap = safeJSONParse(localStorage.getItem("lewisinc_last_order") || "null", null);

        if (!snap || (requestedId && snap.id !== requestedId)) {
            orderIdEl.textContent = requestedId || "—";
            itemsEl.innerHTML = `<p class="muted">No order data found (demo). <a class="link" href="products.html">Return to products</a></p>`;
            subEl.textContent = money(0);
            delEl.textContent = money(0);
            totEl.textContent = money(0);
            return;
        }

        orderIdEl.textContent = snap.id;

        itemsEl.innerHTML = snap.items.map(x => `
      <div class="summary-row">
        <img src="${x.image}" alt="${x.name}">
        <div>
          <h5>${x.name}</h5>
          <div class="muted small">${x.category} • Qty ${x.qty}</div>
        </div>
        <strong>${money(x.price * x.qty)}</strong>
      </div>
    `).join("");

        subEl.textContent = money(snap.subtotal);
        delEl.textContent = money(snap.delivery);
        totEl.textContent = money(snap.total);

        return;
    }
})();
