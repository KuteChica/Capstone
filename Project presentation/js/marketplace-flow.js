(function () {
    var STORAGE_KEYS = {
        selectedProduct: 'clearMySpaceSelectedProduct',
        orders: 'clearMySpaceOrders'
    };

    function readJson(key, fallback) {
        try {
            var raw = window.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function writeJson(key, value) {
        window.localStorage.setItem(key, JSON.stringify(value));
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(value);
    }

    function getSelectedProduct() {
        return readJson(STORAGE_KEYS.selectedProduct, null);
    }

    function setSelectedProduct(product) {
        writeJson(STORAGE_KEYS.selectedProduct, product);
    }

    function getOrders() {
        return readJson(STORAGE_KEYS.orders, []);
    }

    function saveOrders(orders) {
        writeJson(STORAGE_KEYS.orders, orders);
    }

    function createOrderId() {
        return 'CMS-' + Date.now().toString().slice(-6);
    }

    function getTimeline(deliveryOption) {
        return [
            { label: 'Payment confirmed', detail: 'Your order has been created and payment was received.', done: true },
            { label: 'Processing materials', detail: 'Warehouse team is preparing and verifying the recyclable lot.', done: true },
            {
                label: deliveryOption === 'Warehouse Pickup' ? 'Pickup ready' : 'Out for delivery',
                detail: deliveryOption === 'Warehouse Pickup'
                    ? 'Your order is packaged and ready for collection.'
                    : 'Logistics partner has the shipment and is routing it to the destination.',
                done: deliveryOption !== 'Standard Delivery'
            },
            {
                label: 'Delivered',
                detail: deliveryOption === 'Warehouse Pickup'
                    ? 'Customer has picked up the order.'
                    : 'Order delivered to the provided address.',
                done: false
            }
        ];
    }

    function attachMarketplaceHandlers() {
        var buttons = document.querySelectorAll('.buy-btn');
        if (!buttons.length) {
            return;
        }

        var summary = document.getElementById('selected-product-summary');
        var banner = document.getElementById('marketplace-status-banner');
        var bannerText = document.getElementById('marketplace-status-text');
        var currentSelection = getSelectedProduct();

        if (currentSelection && summary) {
            summary.textContent = currentSelection.name + ' selected for ' + formatCurrency(currentSelection.price) + '. Proceed to payment.';
        }

        if (currentSelection && banner && bannerText) {
            banner.classList.add('visible');
            bannerText.textContent = 'Current selection: ' + currentSelection.name + ' at ' + formatCurrency(currentSelection.price);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var product = {
                    name: button.dataset.productName,
                    price: Number(button.dataset.productPrice),
                    image: button.dataset.productImage,
                    category: button.dataset.productCategory,
                    deliveryEstimate: button.dataset.productDelivery
                };

                setSelectedProduct(product);
                window.location.href = 'payment.html';
            });
        });
    }

    function renderPaymentSummary(product) {
        var panel = document.getElementById('selected-product-panel');
        if (!panel || !product) {
            return;
        }

        panel.innerHTML = [
            '<img src="' + product.image + '" alt="' + product.name + '">',
            '<h2>' + product.name + '</h2>',
            '<p>Category: ' + product.category + '</p>',
            '<div class="summary-meta">',
            '<div class="summary-row"><span>Unit price</span><strong>' + formatCurrency(product.price) + '</strong></div>',
            '<div class="summary-row"><span>Estimated delivery</span><strong>' + product.deliveryEstimate + '</strong></div>',
            '<div class="summary-row total"><span>Payable today</span><strong id="payable-total">' + formatCurrency(product.price) + '</strong></div>',
            '</div>'
        ].join('');
    }

    function attachPaymentHandlers() {
        var form = document.getElementById('payment-form');
        if (!form) {
            return;
        }

        var product = getSelectedProduct();
        renderPaymentSummary(product);

        var quantityInput = document.getElementById('order-quantity');
        var totalNode = document.getElementById('payable-total');
        var feedback = document.getElementById('payment-feedback');

        function refreshTotal() {
            if (!product || !quantityInput || !totalNode) {
                return;
            }

            var quantity = Math.max(1, Number(quantityInput.value || 1));
            totalNode.textContent = formatCurrency(product.price * quantity);
        }

        if (quantityInput) {
            quantityInput.addEventListener('input', refreshTotal);
            refreshTotal();
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!product) {
                feedback.className = 'feedback visible error';
                feedback.textContent = 'Select a marketplace item before making payment.';
                return;
            }

            var customerName = document.getElementById('customer-name').value.trim();
            var customerEmail = document.getElementById('customer-email').value.trim();
            var customerPhone = document.getElementById('customer-phone').value.trim();
            var paymentMethod = document.getElementById('payment-method').value;
            var quantity = Math.max(1, Number(document.getElementById('order-quantity').value || 1));
            var deliveryOption = document.getElementById('delivery-option').value;
            var deliveryAddress = document.getElementById('delivery-address').value.trim();

            if (!customerName || !customerEmail || !customerPhone || !paymentMethod || !deliveryAddress) {
                feedback.className = 'feedback visible error';
                feedback.textContent = 'Complete all payment fields before submitting.';
                return;
            }

            var totalAmount = product.price * quantity;
            var order = {
                id: createOrderId(),
                productName: product.name,
                category: product.category,
                image: product.image,
                unitPrice: product.price,
                quantity: quantity,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                deliveryOption: deliveryOption,
                deliveryAddress: deliveryAddress,
                deliveryEstimate: product.deliveryEstimate,
                customerName: customerName,
                customerEmail: customerEmail,
                customerPhone: customerPhone,
                status: deliveryOption === 'Express Delivery' ? 'Preparing dispatch' : 'Processing',
                createdAt: new Date().toLocaleString(),
                timeline: getTimeline(deliveryOption)
            };

            var orders = getOrders();
            orders.unshift(order);
            saveOrders(orders);
            window.localStorage.removeItem(STORAGE_KEYS.selectedProduct);

            feedback.className = 'feedback visible success';
            feedback.textContent = 'Payment successful. Order ' + order.id + ' created. Redirecting to tracking.';

            window.setTimeout(function () {
                window.location.href = 'tracking.html?order=' + encodeURIComponent(order.id);
            }, 900);
        });
    }

    function renderInsights(orders) {
        var insights = document.getElementById('tracking-insights');
        if (!insights) {
            return;
        }

        var totalRevenue = orders.reduce(function (sum, order) {
            return sum + order.totalAmount;
        }, 0);

        insights.innerHTML = [
            '<div class="insight-item"><span>Total orders</span><strong>' + orders.length + '</strong></div>',
            '<div class="insight-item"><span>Paid value</span><strong>' + formatCurrency(totalRevenue) + '</strong></div>',
            '<div class="insight-item"><span>Latest status</span><strong>' + (orders[0] ? orders[0].status : 'No orders yet') + '</strong></div>'
        ].join('');
    }

    function orderCardMarkup(order) {
        var timelineMarkup = order.timeline.map(function (step) {
            return [
                '<div class="progress-step ' + (step.done ? 'done' : '') + '">',
                '<div class="progress-dot"></div>',
                '<div><strong>' + step.label + '</strong><p>' + step.detail + '</p></div>',
                '</div>'
            ].join('');
        }).join('');

        return [
            '<article class="order-card" data-order-id="' + order.id + '">',
            '<div class="order-header">',
            '<div><h3>' + order.productName + '</h3><p>Order ID: ' + order.id + '</p></div>',
            '<span class="status-pill">' + order.status + '</span>',
            '</div>',
            '<div class="order-meta">',
            '<div><span>Buyer</span><strong>' + order.customerName + '</strong></div>',
            '<div><span>Total paid</span><strong>' + formatCurrency(order.totalAmount) + '</strong></div>',
            '<div><span>Quantity</span><strong>' + order.quantity + '</strong></div>',
            '<div><span>Payment</span><strong>' + order.paymentMethod + '</strong></div>',
            '<div><span>Delivery</span><strong>' + order.deliveryOption + '</strong></div>',
            '<div><span>Created</span><strong>' + order.createdAt + '</strong></div>',
            '</div>',
            '<div class="progress">' + timelineMarkup + '</div>',
            '</article>'
        ].join('');
    }

    function renderOrders(filterOrderId) {
        var results = document.getElementById('tracking-results');
        if (!results) {
            return;
        }

        var orders = getOrders();
        renderInsights(orders);

        if (!orders.length) {
            results.innerHTML = '<div class="empty-orders"><h2>No orders yet</h2><p>Payments made in the marketplace will appear here for tracking.</p></div>';
            return;
        }

        var filtered = filterOrderId
            ? orders.filter(function (order) {
                return order.id.toLowerCase() === filterOrderId.toLowerCase();
            })
            : orders;

        if (!filtered.length) {
            results.innerHTML = '<div class="empty-orders"><h2>Order not found</h2><p>Check the order ID and try again.</p></div>';
            return;
        }

        results.innerHTML = filtered.map(orderCardMarkup).join('');
    }

    function attachTrackingHandlers() {
        var results = document.getElementById('tracking-results');
        if (!results) {
            return;
        }

        var input = document.getElementById('tracking-search-input');
        var button = document.getElementById('tracking-search-btn');
        var params = new URLSearchParams(window.location.search);
        var orderId = params.get('order');

        if (orderId && input) {
            input.value = orderId;
        }

        renderOrders(orderId);

        if (button) {
            button.addEventListener('click', function () {
                renderOrders(input.value.trim());
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        attachMarketplaceHandlers();
        attachPaymentHandlers();
        attachTrackingHandlers();
    });
}());
