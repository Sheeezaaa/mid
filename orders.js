document.addEventListener("DOMContentLoaded", () => {
    const ORDERS_STORAGE_KEY = "freshgrocer_orders";

    const ui = {
        menuToggle: document.getElementById("menu-toggle"),
        navbar: document.getElementById("navbar"),
        ordersList: document.getElementById("orders-list"),
        clearOrdersBtn: document.getElementById("clear-orders-btn")
    };

    function formatPrice(value) {
        return `$${Number(value).toFixed(2)}`;
    }

    function getStoredOrders() {
        try {
            const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    function renderOrders() {
        const orders = getStoredOrders();

        if (!orders.length) {
            ui.ordersList.innerHTML = "<p class='orders-empty'>Abhi tak koi order place nahi hua.</p>";
            return;
        }

        ui.ordersList.innerHTML = orders
            .map((order) => {
                return `
                    <article class="order-card">
                        <div class="order-card-head">
                            <p class="order-id">Order #${order.id}</p>
                            <p class="order-time">${order.time}</p>
                        </div>
                        <div class="order-meta">
                            <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
                            <p><strong>Payment:</strong> ${order.method}</p>
                            <p><strong>Status:</strong> Confirmed</p>
                        </div>
                        <p class="order-items"><strong>Items:</strong> ${order.itemsSummary}</p>
                    </article>
                `;
            })
            .join("");
    }

    ui.clearOrdersBtn.addEventListener("click", () => {
        localStorage.removeItem(ORDERS_STORAGE_KEY);
        renderOrders();
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

    renderOrders();
});