const STORAGE_KEY = "miniPOS_v2";

const photo = id =>
`https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=80`;

// DATABASE PRODUK
const defaultProducts = [
{id:1,name:"Nasi Goreng",category:"Makanan",price:18000,stock:18,image:photo("photo-1603133872878-684f208fb84b")},
{id:2,name:"Mie Goreng",category:"Makanan",price:15000,stock:15,image:photo("photo-1569718212165-3a8278d5f624")},
{id:3,name:"Ayam Geprek",category:"Makanan",price:20000,stock:14,image:photo("photo-1604908176997-125f25cc6f3d")},
{id:4,name:"Sate Ayam",category:"Makanan",price:22000,stock:12,image:photo("photo-1529563021893-cc83c992d75d")},
{id:5,name:"Bakso",category:"Makanan",price:16000,stock:20,image:photo("photo-1563245372-f21724e3856d")},
{id:6,name:"Soto Ayam",category:"Makanan",price:17000,stock:10,image:photo("photo-1547592180-85f173990554")},
{id:7,name:"Rendang",category:"Makanan",price:25000,stock:9,image:photo("photo-1546833999-b9f581a1996d")},
{id:8,name:"Burger",category:"Makanan",price:23000,stock:11,image:photo("photo-1568901346375-23c9450c58cd")},
{id:9,name:"Pizza",category:"Makanan",price:19000,stock:8,image:photo("photo-1513104890138-7c749659a591")},
{id:10,name:"Kentang Goreng",category:"Makanan",price:12000,stock:22,image:photo("photo-1573080496219-bb080dd4f877")},
{id:11,name:"Roti Bakar",category:"Makanan",price:14000,stock:13,image:photo("photo-1525351484163-7529414344d8")},
{id:12,name:"Pisang Goreng",category:"Makanan",price:10000,stock:25,image:photo("photo-1587132137056-bfbf0166836e")},
{id:13,name:"Es Teh Manis",category:"Minuman",price:5000,stock:30,image:photo("photo-1556679343-c7306c1976bc")},
{id:14,name:"Es Jeruk",category:"Minuman",price:7000,stock:24,image:photo("photo-1513558161293-cdab765edfd4")},
{id:15,name:"Kopi Susu",category:"Minuman",price:12000,stock:20,image:photo("photo-1461023058943-07fcbe16d735")},
{id:16,name:"Jus Alpukat",category:"Minuman",price:13000,stock:12,image:photo("photo-1553530666-ba11a7da3888")},
{id:17,name:"Air Mineral",category:"Minuman",price:4000,stock:40,image:photo("photo-1560023907-5f339617ea30")},
{id:18,name:"Cappuccino",category:"Minuman",price:15000,stock:16,image:photo("photo-1572490122747-3968b75cc699")}
];

// DATA APLIKASI
let savedData;

try {
  savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
} catch (e) {
  savedData = null;
}

let products = savedData?.products || defaultProducts;
let transactions = savedData?.transactions || [];
let cart = [];
let category = "Semua";
let payment = "Tunai";

// SIMPAN DATA
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    products,
    transactions
  }));
}

// FORMAT RUPIAH
function rupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style:"currency",
    currency:"IDR",
    maximumFractionDigits:0
  }).format(number || 0);
}

// TANGGAL
function dateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

document.getElementById("today").textContent =
new Date().toLocaleDateString("id-ID", {
  weekday:"long",
  day:"numeric",
  month:"long",
  year:"numeric"
});

// RINGKASAN DASHBOARD
function renderDashboard() {
  const today = transactions.filter(t => t.date === dateKey());

  document.getElementById("revenue").textContent =
    rupiah(today.reduce((a,t) => a+t.total,0));

  document.getElementById("totalStock").textContent =
    products.reduce((a,p) => a+Number(p.stock),0);

  document.getElementById("transactionCount").textContent =
    today.length;
}

// TAMPILKAN PRODUK
function renderProducts() {
  const search = document.getElementById("search").value.toLowerCase();

  const filtered = products.filter(p =>
    (category === "Semua" || p.category === category) &&
    p.name.toLowerCase().includes(search)
  );

  document.getElementById("products").innerHTML =
  filtered.map(p => {

    let stockClass =
      p.stock === 0 ? "stock-out" :
      p.stock < 5 ? "stock-low" : "stock-safe";

    let stockText =
      p.stock === 0 ? "Stok habis" :
      p.stock < 5 ? "Stok menipis: "+p.stock :
      "Stok: "+p.stock;

    return `
    <div class="col-6 col-md-4">
      <div class="card product-card h-100">

        <img src="${p.image}"
        alt="${p.name}"
        onerror="this.src='https://placehold.co/640x420/f1ede8/777?text=Produk'">

        <div class="card-body">
          <h6>${p.name}</h6>

          <div class="price">${rupiah(p.price)}</div>

          <div class="${stockClass}">${stockText}</div>

          <button class="btn btn-add w-100 mt-2"
          onclick="addToCart(${p.id})"
          ${p.stock <= 0 ? "disabled" : ""}>
            + Beli
          </button>

          <button class="btn btn-sm text-danger w-100 mt-1"
          onclick="deleteProduct(${p.id})">
            🗑 Hapus
          </button>
        </div>
      </div>
    </div>`;
  }).join("");
}

// FILTER KATEGORI
function filterCategory(value) {
  category = value;
  renderProducts();
}

// TAMBAH KE KERANJANG
function addToCart(id) {
  const p = products.find(x => x.id === id);

  if (!p || p.stock <= 0) return;

  const item = cart.find(x => x.id === id);

  if (item) {
    if (item.qty >= p.stock) {
      alert("Stok tidak mencukupi!");
      return;
    }
    item.qty++;
  } else {
    cart.push({id,qty:1});
  }

  renderCart();
}

// HITUNG TOTAL
function getTotal() {
  return cart.reduce((sum,c) => {
    const p = products.find(x => x.id === c.id);
    return sum + (p ? p.price*c.qty : 0);
  },0);
}

// TAMPILKAN KERANJANG
function renderCart() {
  const container = document.getElementById("cartList");

  container.innerHTML = cart.map(c => {
    const p = products.find(x => x.id === c.id);

    if (!p) return "";

    return `
    <div class="cart-item d-flex align-items-center gap-2">

      <img src="${p.image}" alt="${p.name}">

      <div class="flex-grow-1">
        <strong>${p.name}</strong>
        <div class="small">${rupiah(p.price)}</div>

        <div class="d-flex align-items-center gap-2 mt-1">
          <button class="btn btn-sm btn-light"
          onclick="changeQty(${p.id},-1)">−</button>

          ${c.qty}

          <button class="btn btn-sm btn-light"
          onclick="changeQty(${p.id},1)">+</button>
        </div>
      </div>

      <div class="text-end">
        <strong class="small">${rupiah(p.price*c.qty)}</strong>

        <button class="btn btn-sm text-danger"
        onclick="removeItem(${p.id})">✕</button>
      </div>

    </div>`;
  }).join("");

  document.getElementById("subtotal").textContent =
    rupiah(getTotal());

  document.getElementById("total").textContent =
    rupiah(getTotal());

  updatePayment();
}

// UBAH JUMLAH
function changeQty(id,amount) {
  const item = cart.find(x => x.id === id);
  const p = products.find(x => x.id === id);

  if (!item || !p) return;

  if (amount > 0 && item.qty >= p.stock) {
    alert("Stok tidak mencukupi!");
    return;
  }

  item.qty += amount;

  if (item.qty <= 0) {
    removeItem(id);
  } else {
    renderCart();
  }
}

// HAPUS ITEM
function removeItem(id) {
  cart = cart.filter(x => x.id !== id);
  renderCart();
}

// KOSONGKAN KERANJANG
function clearCart() {
  cart = [];
  renderCart();
}

// PILIH PEMBAYARAN
function setPayment(method,button) {
  payment = method;

  document.querySelectorAll(".payment-btn").forEach(b => {
    b.classList.remove("active");
  });

  button.classList.add("active");

  updatePayment();
}

// HITUNG KEMBALIAN
function updatePayment() {
  const total = getTotal();

  const cash = Number(
    document.getElementById("cash").value || 0
  );

  const cashWrap = document.getElementById("cashWrap");
  const change = document.getElementById("change");
  const checkout = document.getElementById("checkout");

  cashWrap.style.display =
    payment === "Tunai" ? "block" : "none";

  if (payment === "Tunai") {
    if (cash >= total && total > 0) {
      change.textContent =
        "Kembalian: "+rupiah(cash-total);
      change.className = "text-success mt-2 small";
    } else {
      change.textContent =
        "Uang kurang: "+rupiah(total-cash);
      change.className = "text-danger mt-2 small";
    }
  } else {
    change.textContent = "Pembayaran "+payment+" dipilih.";
  }

  checkout.disabled =
    cart.length === 0 ||
    total <= 0 ||
    (payment === "Tunai" && cash < total);
}

// TAMBAH PRODUK BARU
document.getElementById("productForm")
.addEventListener("submit",function(e) {
  e.preventDefault();

  const name = document.getElementById("newName").value.trim();
  const cat = document.getElementById("newCategory").value;
  const price = Number(document.getElementById("newPrice").value);
  const stock = Number(document.getElementById("newStock").value);
  const image = document.getElementById("newImage").value.trim();

  if (!name || price <= 0 || stock < 0) {
    alert("Periksa kembali data produk!");
    return;
  }

  if (!image) {
    alert("Masukkan URL gambar produk yang sesuai agar foto produk tidak salah.");
    return;
  }

  products.push({
    id:Date.now(),
    name,
    category:cat,
    price,
    stock,
    image
  });

  saveData();
  this.reset();
  renderAll();

  alert("Produk berhasil ditambahkan!");
});

// HAPUS PRODUK
function deleteProduct(id) {
  if (cart.some(c => c.id === id)) {
    alert("Hapus produk dari keranjang terlebih dahulu!");
    return;
  }

  const p = products.find(x => x.id === id);

  if (!p || !confirm("Hapus "+p.name+"?")) return;

  products = products.filter(x => x.id !== id);

  saveData();
  renderAll();
}

// CETAK NOTA
function printReceipt(tx) {
  const receipt = document.getElementById("receipt");

  receipt.innerHTML = `
    <h3 style="text-align:center">MINI POS KASIR</h3>
    <p style="text-align:center">Kantin / Warung Sekolah</p>
    <hr>
    <p>No: ${tx.id}</p>
    <p>${new Date(tx.time).toLocaleString("id-ID")}</p>
    <hr>
    ${tx.items.map(i => `
      <div style="display:flex;justify-content:space-between">
        <span>${i.name} x${i.qty}</span>
        <span>${rupiah(i.price*i.qty)}</span>
      </div>
    `).join("")}
    <hr>
    <h4>Total: ${rupiah(tx.total)}</h4>
    <p>Metode: ${tx.method}</p>
    ${tx.method === "Tunai" ? `
      <p>Bayar: ${rupiah(tx.cash)}</p>
      <p>Kembalian: ${rupiah(tx.change)}</p>
    ` : ""}
    <hr>
    <p style="text-align:center">Terima kasih telah berbelanja!</p>
  `;

  window.print();
}

// PROSES PEMBAYARAN
function checkout() {
  const total = getTotal();
  const cash = Number(document.getElementById("cash").value || 0);

  if (!cart.length) return;

  if (payment === "Tunai" && cash < total) {
    alert("Uang pembayaran kurang!");
    return;
  }

  for (const c of cart) {
    const p = products.find(x => x.id === c.id);

    if (!p || p.stock < c.qty) {
      alert("Stok tidak mencukupi!");
      return;
    }
  }

  const items = cart.map(c => {
    const p = products.find(x => x.id === c.id);

    p.stock -= c.qty;

    return {
      name:p.name,
      price:p.price,
      qty:c.qty
    };
  });

  const tx = {
    id:"POS-"+Date.now(),
    date:dateKey(),
    time:new Date().toISOString(),
    items,
    total,
    method:payment,
    cash:payment === "Tunai" ? cash : total,
    change:payment === "Tunai" ? cash-total : 0
  };

  transactions.push(tx);

  saveData();

  cart = [];

  renderAll();

  printReceipt(tx);
}

// RENDER SEMUA
function renderAll() {
  renderDashboard();
  renderProducts();
  renderCart();
}

// EVENT
document.getElementById("search")
.addEventListener("input",renderProducts);

document.getElementById("cash")
.addEventListener("input",updatePayment);

// JALANKAN APLIKASI
renderAll();