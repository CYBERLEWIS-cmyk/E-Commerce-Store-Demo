window.UI = (() => {
    const $ = (s, p = document) => p.querySelector(s);
    const $$ = (s, p = document) => [...p.querySelectorAll(s)];

    function fmt(n) { return Number(n).toFixed(0); }
    function esc(str) {
        return String(str).replace(/[&<>"']/g, m => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
        }[m]));
    }

    function heartSVG(filled = false) {
        return filled
            ? `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
           <path d="M12 21s-7-4.4-9.3-8.7C.5 8.4 3 5.5 6 5.5c1.7 0 3.3.9 4 2 .7-1.1 2.3-2 4-2 3 0 5.5 2.9 3.3 6.8C19 16.6 12 21 12 21Z" fill="currentColor"/>
         </svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
           <path d="M12 21s-7-4.4-9.3-8.7C.5 8.4 3 5.5 6 5.5c1.7 0 3.3.9 4 2 .7-1.1 2.3-2 4-2 3 0 5.5 2.9 3.3 6.8C19 16.6 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
         </svg>`;
    }

    function renderCategoryGrid(el, categories) {
        if (!el) return;

        el.innerHTML = categories.map(c => `
      <article class="category-card" data-category="${esc(c.name)}" tabindex="0" role="button" aria-label="Browse ${esc(c.name)}">
        <img src="${c.image}" alt="${esc(c.name)} category" loading="lazy" />
        <h3>${esc(c.name).toUpperCase()}</h3>
      </article>
    `).join("");

        el.addEventListener("click", (e) => {
            const card = e.target.closest(".category-card");
            if (!card) return;
            const name = card.dataset.category;
            window.location.href = `category.html?name=${encodeURIComponent(name)}`;
        });
    }

    function productCard(p) {
        const wished = Store.isWished(p.id);
        return `
      <article class="product-card" data-id="${esc(p.id)}" tabindex="0" role="button" aria-label="View ${esc(p.name)}">
        <div class="product-media">
          <img src="${p.image}" alt="${esc(p.name)}" loading="lazy" />
          <button class="wish-btn ${wished ? "is-on" : ""}" data-wish="${esc(p.id)}" aria-label="Wishlist">
            ${heartSVG(wished)}
          </button>
        </div>

        <div class="product-meta">
          <p class="product-cat">${esc(p.category)}</p>
          <h3 class="product-name">${esc(p.name)}</h3>
          <div class="product-price">$${fmt(p.price)}</div>
        </div>
      </article>
    `;
    }

    function renderProductGrid(el, list, { mode = "page" } = {}) {
        if (!el) return;

        el.innerHTML = list.map(productCard).join("");

        // wishlist toggle
        $$("[data-wish]", el).forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = btn.dataset.wish;
                const on = Store.toggleWishlist(id);
                btn.classList.toggle("is-on", on);
                btn.innerHTML = heartSVG(on);
            });
        });

        // card click
        $$(".product-card", el).forEach(card => {
            card.addEventListener("click", () => {
                const id = card.dataset.id;
                if (mode === "page") {
                    window.location.href = `product.html?id=${encodeURIComponent(id)}`;
                }
            });
        });
    }

    function openDrawer() {
        const drawer = $("#cartDrawer");
        if (!drawer) return;
        drawer.classList.add("is-open");
        drawer.setAttribute("aria-hidden", "false");
    }

    function closeDrawer() {
        const drawer = $("#cartDrawer");
        if (!drawer) return;
        drawer.classList.remove("is-open");
        drawer.setAttribute("aria-hidden", "true");
    }

    function renderCart() {
        const countEl = $("#cartCount");
        const itemsEl = $("#cartItems");
        const subtotalEl = $("#cartSubtotal");
        if (!countEl || !itemsEl || !subtotalEl) return;

        const { items, count, subtotal } = Store.cartSummary();
        countEl.textContent = String(count);
        subtotalEl.textContent = `$${fmt(subtotal)}`;

        if (!items.length) {
            itemsEl.innerHTML = `<p class="muted">Your cart is empty.</p>`;
            return;
        }

        itemsEl.innerHTML = items.map(x => `
      <div class="cart-row">
        <img src="${x.image}" alt="${esc(x.name)}" />
        <div>
          <h5>${esc(x.name)}</h5>
          <div class="muted small">${esc(x.category)} • $${fmt(x.price)}</div>

          <div class="qty" style="margin-top:10px;">
            <button aria-label="Decrease quantity" data-qty="-1" data-id="${esc(x.id)}">−</button>
            <span>${x.qty}</span>
            <button aria-label="Increase quantity" data-qty="1" data-id="${esc(x.id)}">+</button>

            <button class="icon-btn" aria-label="Remove item" data-remove="true" data-id="${esc(x.id)}"
              title="Remove" style="margin-left:auto;">✕</button>
          </div>
        </div>
        <strong>$${fmt(x.price * x.qty)}</strong>
      </div>
    `).join("");

        $$("[data-qty]", itemsEl).forEach(btn => {
            btn.addEventListener("click", () => {
                Store.changeQty(btn.dataset.id, Number(btn.dataset.qty));
                renderCart();
            });
        });

        $$("[data-remove='true']", itemsEl).forEach(btn => {
            btn.addEventListener("click", () => {
                Store.removeFromCart(btn.dataset.id);
                renderCart();
            });
        });
    }

    function wireCommonOverlays() {
        // open cart
        $("#cartBtn")?.addEventListener("click", (e) => {
            e.preventDefault?.();
            renderCart();
            openDrawer();
        });

        // close cart
        const drawer = $("#cartDrawer");
        drawer?.addEventListener("click", (e) => {
            if (e.target.dataset.closeCart === "true") closeDrawer();
        });

        // checkout from drawer
        $("#checkoutBtn")?.addEventListener("click", () => {
            window.location.href = "checkout.html";
        });

        // esc
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeDrawer();
        });
    }

    return {
        renderCategoryGrid,
        renderProductGrid,
        renderCart,
        wireCommonOverlays,
        openDrawer
    };
})();
