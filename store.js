window.Store = (() => {
    const CART_KEY = "lewisinc_cart";
    const WISH_KEY = "lewisinc_wishlist";

    const products = window.LEWIS_PRODUCTS || [];

    function getProduct(id) {
        return products.find(p => p.id === id) || null;
    }

    // Cart
    function loadCart() {
        try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
        catch { return []; }
    }

    function saveCart(cart) {
        try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
    }

    function addToCart(id, qty = 1) {
        const cart = loadCart();
        const item = cart.find(x => x.id === id);
        if (item) item.qty += qty;
        else cart.push({ id, qty });
        saveCart(cart);
        return cart;
    }

    function changeQty(id, delta) {
        const cart = loadCart();
        const item = cart.find(x => x.id === id);
        if (!item) return cart;
        item.qty += delta;
        const next = cart.filter(x => x.qty > 0);
        saveCart(next);
        return next;
    }

    function removeFromCart(id) {
        const next = loadCart().filter(x => x.id !== id);
        saveCart(next);
        return next;
    }

    function clearCart() {
        saveCart([]);
    }

    function cartSummary() {
        const cart = loadCart();
        const items = cart.map(ci => {
            const p = getProduct(ci.id);
            return p ? ({ ...p, qty: ci.qty }) : null;
        }).filter(Boolean);

        const count = items.reduce((a, x) => a + x.qty, 0);
        const subtotal = items.reduce((a, x) => a + x.price * x.qty, 0);
        return { items, count, subtotal };
    }

    // Wishlist
    function loadWishlist() {
        try { return JSON.parse(localStorage.getItem(WISH_KEY) || "[]"); }
        catch { return []; }
    }

    function saveWishlist(list) {
        try { localStorage.setItem(WISH_KEY, JSON.stringify(list)); } catch {}
    }

    function isWished(id) {
        return loadWishlist().includes(id);
    }

    function toggleWishlist(id) {
        const list = loadWishlist();
        const on = list.includes(id);
        const next = on ? list.filter(x => x !== id) : [id, ...list];
        saveWishlist(next);
        return !on;
    }

    // Sorting
    function sortProducts(list, mode) {
        const copy = [...list];

        if (mode === "price_asc") return copy.sort((a, b) => a.price - b.price);
        if (mode === "price_desc") return copy.sort((a, b) => b.price - a.price);

        // newest default
        return copy.sort((a, b) => {
            const da = new Date(a.createdAt || 0).getTime();
            const db = new Date(b.createdAt || 0).getTime();
            return db - da;
        });
    }

    return {
        getProduct,
        loadCart, addToCart, changeQty, removeFromCart, clearCart, cartSummary,
        loadWishlist, isWished, toggleWishlist,
        sortProducts
    };
})();
