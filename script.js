
document.addEventListener("DOMContentLoaded", () => {
    const ORDERS_STORAGE_KEY = "freshgrocer_orders";

    const products = [
        {
             id: 1, 
             name: "Fresh Apples",
              price: 3.49, 
             category: "Fruits", 
             image: "image/product-1.png" 
            },
        { id: 2,
             name: "Orange Pack",
              price: 4.29,
               category: "Fruits",
                image: "image/product-2.png"
             },
        {
             id: 3,
             name: "Organic Tomatoes",
              price: 2.79,
               category: "Vegetables",
                image: "image/product-3.png"
             } ,
        { 
            id: 4,
             name: "Carrot Bunch", 
             price: 1.99,
              category: "Vegetables",
               image: "image/product-4.png" }
               ,
        { id: 5,
             name: "Full Cream Milk",
              price: 2.39,
               category: "Dairy",
                  image: "image/product-5.png" 
            },
        { id: 6,
             name: "Cheddar Cheese",
              price: 5.99,
               category: "Dairy",
                image: "image/product-6.png"
             },
        { id: 7,
             name: "Whole Wheat Bread",
              price: 2.59,
               category: "Bakery", 
               image: "image/product-7.png" 
            },
        { id: 8,
             name: "Granola Mix",
              price: 6.49,
               category: "Snacks", 
               image: "image/product-8.png" }
    ];

    const state = {
        cart: [],
        filteredProducts: products
    };

    const ui = {
        productsGrid: document.getElementById("products-grid"),
        searchInput: document.getElementById("search-input"),
        searchBtn: document.getElementById("search-btn"),
        cartCount: document.getElementById("cart-count"),
        cartToggle: document.getElementById("cart-toggle"),
        cartSidebar: document.getElementById("cart-sidebar"),
        closeCart: document.getElementById("close-cart"),
        cartItems: document.getElementById("cart-items"),
        cartTotal: document.getElementById("cart-total"),
        checkoutBtn: document.querySelector(".checkout-btn"),
        emptyState: document.getElementById("empty-state"),
        toast: document.getElementById("toast"),
        menuToggle: document.getElementById("menu-toggle"),
        navbar: document.getElementById("navbar"),
        paymentModal: document.getElementById("payment-modal"),
        paymentClose: document.getElementById("payment-close"),
        paymentAmount: document.getElementById("payment-amount"),
        payNowBtn: document.getElementById("pay-now-btn")
    };

    function formatPrice(value) {
        return `$${value.toFixed(2)}`;
    }

    function findProductById(id) {
        return products.find((product) => product.id === id);
    }

    function getStoredOrders() {
        const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    function saveStoredOrders(orders) {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    }

    function showToast(message) {
        ui.toast.textContent = message;
        ui.toast.classList.add("show");

        window.clearTimeout(showToast.timeoutId);
        showToast.timeoutId = window.setTimeout(() => {
            ui.toast.classList.remove("show");
        }, 1600);
    }

    function updateCartCount() {
        const totalItems = state.cart.reduce((total, item) => total + item.quantity, 0);
        ui.cartCount.textContent = String(totalItems);
    }

    function updateCartUI() {
        if (state.cart.length === 0) {
            ui.cartItems.innerHTML = "<p class='empty-cart'>Your cart is empty.</p>";
            ui.cartTotal.textContent = "$0.00";
            updateCartCount();
            return;
        }

        const itemsMarkup = state.cart
            .map((item) => {
                return `
                    <article class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <h4>${item.name}</h4>
                            <p>${formatPrice(item.price)} each</p>
                            <div class="cart-item-row">
                                <div class="qty-controls">
                                    <button type="button" data-action="decrease" data-id="${item.id}">-</button>
                                    <span>${item.quantity}</span>
                                    <button type="button" data-action="increase" data-id="${item.id}">+</button>
                                </div>
                                <button type="button" class="remove-btn" data-action="remove" data-id="${item.id}">Remove</button>
                            </div>
                        </div>
                    </article>
                `;
            })
            .join("");

        ui.cartItems.innerHTML = itemsMarkup;
        const totalPrice = state.cart.reduce((total, item) => total + item.price * item.quantity, 0);
        ui.cartTotal.textContent = formatPrice(totalPrice);
        updateCartCount();
    }

    function addToCart(productId) {
        const product = findProductById(productId);
        if (!product) {
            return;
        }

        const cartItem = state.cart.find((item) => item.id === product.id);
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            state.cart.push({ ...product, quantity: 1 });
        }

        updateCartUI();
        showToast(`${product.name} added to cart`);
    }

    function handleCartAction(action, productId) {
        const index = state.cart.findIndex((item) => item.id === productId);
        if (index === -1) {
            return;
        }

        if (action === "increase") {
            state.cart[index].quantity += 1;
        } else if (action === "decrease") {
            state.cart[index].quantity -= 1;
            if (state.cart[index].quantity <= 0) {
                state.cart.splice(index, 1);
            }
        } else if (action === "remove") {
            state.cart.splice(index, 1);
        }

        updateCartUI();
    }

    function getCartTotalAmount() {
        return state.cart.reduce((total, item) => total + item.price * item.quantity, 0);
    }

    function openPaymentModal() {
        if (state.cart.length === 0) {
            showToast("Cart is empty. Add products first.");
            return;
        }

        ui.paymentAmount.textContent = formatPrice(getCartTotalAmount());
        ui.paymentModal.classList.add("active");
        ui.paymentModal.setAttribute("aria-hidden", "false");
    }

    function closePaymentModal() {
        ui.paymentModal.classList.remove("active");
        ui.paymentModal.setAttribute("aria-hidden", "true");
    }

    function completeDemoPayment() {
        if (state.cart.length === 0) {
            closePaymentModal();
            return;
        }

        const selectedMethodInput = document.querySelector("input[name='payment-method']:checked");
        const selectedMethod = selectedMethodInput ? selectedMethodInput.value : "UPI";
        const paidTotal = getCartTotalAmount();
        const itemsSummary = state.cart.map((item) => `${item.name} x${item.quantity}`).join(", ");
        const orderId = Date.now().toString().slice(-6);

        const orders = getStoredOrders();
        orders.unshift({
            id: orderId,
            total: paidTotal,
            method: selectedMethod,
            time: new Date().toLocaleString(),
            itemsSummary
        });
        saveStoredOrders(orders);

        state.cart = [];
        updateCartUI();
        closePaymentModal();
        ui.cartSidebar.classList.remove("active");
        showToast(`Payment successful via ${selectedMethod} (Demo)`);
    }

    function renderProducts(list) {
        if (!list.length) {
            ui.productsGrid.innerHTML = "";
            ui.emptyState.classList.remove("hidden");
            return;
        }

        ui.emptyState.classList.add("hidden");

        ui.productsGrid.innerHTML = list
            .map((product) => {
                return `
                    <article class="product-card">
                        <div class="product-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="product-body">
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-meta">${product.category}</p>
                            <div class="product-price-row">
                                <span class="product-price">${formatPrice(product.price)}</span>
                            </div>
                            <button type="button" class="btn btn-primary add-to-cart" data-id="${product.id}">
                                Add to Cart
                            </button>
                        </div>
                    </article>
                `;
            })
            .join("");
    }

    function filterProducts(query) {
        const text = query.trim().toLowerCase();

        state.filteredProducts = products.filter((product) => {
            return (
                product.name.toLowerCase().includes(text) ||
                product.category.toLowerCase().includes(text)
            );
        });

        renderProducts(state.filteredProducts);
    }

    function setupEventListeners() {
        ui.productsGrid.addEventListener("click", (event) => {
            const addButton = event.target.closest(".add-to-cart");
            if (!addButton) {
                return;
            }

            const productId = Number(addButton.dataset.id);
            addToCart(productId);
        });

        ui.searchInput.addEventListener("input", (event) => {
            filterProducts(event.target.value);
        });

        ui.searchBtn.addEventListener("click", () => {
            filterProducts(ui.searchInput.value);
        });

        ui.cartToggle.addEventListener("click", () => {
            ui.cartSidebar.classList.add("active");
        });

        ui.closeCart.addEventListener("click", () => {
            ui.cartSidebar.classList.remove("active");
        });

        ui.checkoutBtn.addEventListener("click", openPaymentModal);
        ui.paymentClose.addEventListener("click", closePaymentModal);
        ui.payNowBtn.addEventListener("click", completeDemoPayment);

        document.addEventListener("click", (event) => {
            const clickedInsideCart = ui.cartSidebar.contains(event.target);
            const clickedCartButton = ui.cartToggle.contains(event.target);
            if (!clickedInsideCart && !clickedCartButton) {
                ui.cartSidebar.classList.remove("active");
            }

            if (event.target === ui.paymentModal) {
                closePaymentModal();
            }
        });

        ui.cartItems.addEventListener("click", (event) => {
            const actionButton = event.target.closest("button[data-action]");
            if (!actionButton) {
                return;
            }

            const action = actionButton.dataset.action;
            const productId = Number(actionButton.dataset.id);
            handleCartAction(action, productId);
        });

        ui.menuToggle.addEventListener("click", () => {
            const isOpen = ui.navbar.classList.toggle("open");
            ui.menuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        ui.navbar.addEventListener("click", (event) => {
            if (event.target.matches("a")) {
                ui.navbar.classList.remove("open");
                ui.menuToggle.setAttribute("aria-expanded", "false");
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closePaymentModal();
            }
        });
    }

    renderProducts(products);
    updateCartUI();
    setupEventListeners();
});



