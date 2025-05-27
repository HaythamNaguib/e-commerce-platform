
document.addEventListener("DOMContentLoaded", () => {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    document.getElementById("productCount").textContent = products.length;
    document.getElementById("orderCount").textContent = orders.length;

    const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    document.getElementById("totalSales").textContent = totalSales.toFixed(2) + " جنيه";

    const productList = document.getElementById("productList");
    products.forEach(product => {
        const item = document.createElement("div");
        item.className = "product-item";
        item.innerHTML = `
            <span>${product.name} - ${product.price} جنيه</span>
            <button onclick="deleteProduct(${product.id})">حذف</button>
        `;
        productList.appendChild(item);
    });
});

function deleteProduct(id) {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products = products.filter(p => p.id !== id);
    localStorage.setItem("products", JSON.stringify(products));
    location.reload();
}
