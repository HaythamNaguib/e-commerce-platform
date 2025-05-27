// cart/cart.js
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const tbody = document.querySelector("tbody");
const totalPriceEl = document.getElementById("total-price");

function renderCart() {
    tbody.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
        const row = document.createElement("tr");
        const subtotal = item.price * item.quantity;
        total += subtotal;
        row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.price}</td>
      <td>${subtotal}</td>
    `;
        tbody.appendChild(row);
    });
    totalPriceEl.textContent = total.toFixed(2);
    localStorage.setItem("cart", JSON.stringify(cart));
}

function applyPromo() {
    const code = document.getElementById("promo-code").value.trim();
    const total = parseFloat(totalPriceEl.textContent);
    const discounted = applyPromoCode(code, total); // from promo.js
    if (discounted !== total) {
        totalPriceEl.textContent = discounted.toFixed(2);
        alert("تم تطبيق الخصم!");
    } else {
        alert("كود الخصم غير صالح.");
    }
}

function checkout() {
    const order = {
        id: "ORD" + Date.now(),
        items: cart,
        total: parseFloat(totalPriceEl.textContent),
        status: "Pending"
    };
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));
    cart = [];
    localStorage.removeItem("cart");
    window.location.href = "thankyou.html";
}

renderCart();
