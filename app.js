const retailProducts = [
  {
    id: "sweet-mini",
    name: "Mini Sweet Box Set",
    category: "Sweet Boxes",
    pack: "Pack of 100",
    price: 850,
    description: "Compact mithai boxes for festive sampling, counters, and gifting."
  },
  {
    id: "bakery-window",
    name: "Bakery Window Box",
    category: "Bakery Boxes",
    pack: "Pack of 50",
    price: 720,
    description: "Window boxes for pastries, cookies, cupcakes, and counter display."
  },
  {
    id: "meal-kraft",
    name: "Kraft Meal Box",
    category: "Restaurant Packaging",
    pack: "Pack of 100",
    price: 960,
    description: "Takeaway meal boxes for restaurants, cafes, and cloud kitchens."
  },
  {
    id: "burger-box",
    name: "Burger Box",
    category: "Restaurant Packaging",
    pack: "Pack of 100",
    price: 780,
    description: "Food box for burgers, sandwiches, snacks, and QSR counters."
  },
  {
    id: "paper-carry",
    name: "Kraft Carry Bag",
    category: "Paper Bags",
    pack: "Pack of 100",
    price: 1100,
    description: "Retail and takeaway paper bags for small business packaging."
  },
  {
    id: "starter-carton",
    name: "Starter Shipping Carton",
    category: "Cartons",
    pack: "Pack of 25",
    price: 650,
    description: "Small dispatch cartons for ecommerce, gifting, and stock movement."
  }
];

const b2bUnits = [
  {
    unit: "Envox Carton",
    groups: [
      {
        name: "Corrugated Cartons",
        products: ["3 ply corrugated box", "5 ply corrugated box", "7 ply heavy duty carton", "regular slotted carton"]
      },
      {
        name: "Special Cartons",
        products: ["fruit carton", "ecommerce shipping carton", "die-cut carton", "printed carton"]
      }
    ]
  },
  {
    unit: "Envox Paper Bag",
    groups: [
      {
        name: "Carry Bags",
        products: ["kraft paper carry bag", "printed paper bag", "retail shopping bag", "custom logo paper bag"]
      },
      {
        name: "Food Bags",
        products: ["SOS takeaway bag", "flat paper bag", "bakery paper bag", "restaurant delivery bag"]
      }
    ]
  },
  {
    unit: "Envox Boxes",
    groups: [
      {
        name: "Sweet & Bakery",
        products: ["sweet box", "mithai box", "dry fruit box", "cake box", "pastry window box"]
      },
      {
        name: "Restaurant Packaging",
        products: ["burger box", "meal box", "snack box", "food tray", "QSR takeaway box"]
      }
    ]
  }
];

const formatCurrency = (amount) => `Rs. ${amount.toLocaleString("en-IN")}`;

function initRetail() {
  const productRoot = document.querySelector("#retail-products");
  const bagItemsRoot = document.querySelector("#bag-items");
  const bagCount = document.querySelector("#bag-count");
  const bagTotal = document.querySelector("#bag-total");
  const checkoutButton = document.querySelector("[data-checkout-placeholder]");
  const checkoutNote = document.querySelector("#checkout-note");

  if (!productRoot || !bagItemsRoot || !bagCount || !bagTotal) return;

  const bag = new Map();

  function renderProducts() {
    productRoot.innerHTML = retailProducts.map((product) => `
      <article class="retail-card">
        <span>${product.category}</span>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="retail-card-meta">
          <strong>${formatCurrency(product.price)}</strong>
          <small>${product.pack}</small>
        </div>
        <button class="button secondary" type="button" data-add-product="${product.id}">
          Add to Bag
        </button>
      </article>
    `).join("");
  }

  function renderBag() {
    const items = [...bag.values()];
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    bagCount.textContent = String(count);
    bagTotal.textContent = formatCurrency(total);
    bagItemsRoot.innerHTML = items.length
      ? items.map((item) => `
          <div class="bag-item">
            <div>
              <strong>${item.name}</strong>
              <span>${item.pack}</span>
            </div>
            <div class="bag-qty">
              <button type="button" data-decrement="${item.id}">-</button>
              <span>${item.quantity}</span>
              <button type="button" data-increment="${item.id}">+</button>
            </div>
          </div>
        `).join("")
      : "<p class=\"empty-state\">Your bag is empty. Add retail packaging SKUs from the catalogue.</p>";
  }

  productRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-product]");
    if (!button) return;
    const product = retailProducts.find((item) => item.id === button.dataset.addProduct);
    if (!product) return;
    const current = bag.get(product.id) || { ...product, quantity: 0 };
    current.quantity += 1;
    bag.set(product.id, current);
    renderBag();
  });

  bagItemsRoot.addEventListener("click", (event) => {
    const increment = event.target.closest("[data-increment]");
    const decrement = event.target.closest("[data-decrement]");
    const id = increment?.dataset.increment || decrement?.dataset.decrement;
    if (!id || !bag.has(id)) return;
    const item = bag.get(id);
    item.quantity += increment ? 1 : -1;
    if (item.quantity <= 0) bag.delete(id);
    renderBag();
  });

  checkoutButton?.addEventListener("click", () => {
    checkoutNote.textContent = "Payment gateway integration placeholder. Connect Razorpay or a suitable retail payment account before accepting live payments.";
  });

  renderProducts();
  renderBag();
}

function initB2B() {
  const treeRoot = document.querySelector("#b2b-product-tree");
  const selectedRoot = document.querySelector("#b2b-selected-products");
  const selectedField = document.querySelector("#selected-products-field");
  const submitButton = document.querySelector("[data-b2b-submit]");
  const note = document.querySelector("#b2b-note");

  if (!treeRoot || !selectedRoot || !selectedField) return;

  const selectedProducts = new Map();

  function productKey(unit, group, product) {
    return `${unit} | ${group} | ${product}`;
  }

  function renderTree() {
    treeRoot.innerHTML = b2bUnits.map((unit) => `
      <article class="unit-tree">
        <h3>${unit.unit}</h3>
        ${unit.groups.map((group) => `
          <div class="tree-group">
            <button class="tree-group-title" type="button" aria-expanded="true">
              ${group.name}
            </button>
            <div class="tree-products">
              ${group.products.map((product) => {
                const key = productKey(unit.unit, group.name, product);
                return `
                  <label class="product-check">
                    <input type="checkbox" value="${key}" data-unit="${unit.unit}" data-group="${group.name}" data-product="${product}">
                    <span>${product}</span>
                  </label>
                `;
              }).join("")}
            </div>
          </div>
        `).join("")}
      </article>
    `).join("");
  }

  function syncSelected() {
    const values = [...selectedProducts.values()];
    selectedRoot.innerHTML = values.length
      ? values.map((item) => `
          <div class="selected-chip">
            <strong>${item.product}</strong>
            <span>${item.unit} / ${item.group}</span>
            <button type="button" data-remove-product="${item.key}">Remove</button>
          </div>
        `).join("")
      : "<p class=\"empty-state\">Select products from the unit tree to build your enquiry.</p>";

    selectedField.value = values.map((item) => `${item.unit} > ${item.group} > ${item.product}`).join("\n");
  }

  treeRoot.addEventListener("change", (event) => {
    const input = event.target.closest("input[type='checkbox']");
    if (!input) return;
    const key = input.value;
    if (input.checked) {
      selectedProducts.set(key, {
        key,
        unit: input.dataset.unit,
        group: input.dataset.group,
        product: input.dataset.product
      });
    } else {
      selectedProducts.delete(key);
    }
    syncSelected();
  });

  treeRoot.addEventListener("click", (event) => {
    const button = event.target.closest(".tree-group-title");
    if (!button) return;
    const products = button.nextElementSibling;
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isExpanded));
    products.hidden = isExpanded;
  });

  selectedRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-product]");
    if (!button) return;
    selectedProducts.delete(button.dataset.removeProduct);
    const checkbox = treeRoot.querySelector(`input[value="${CSS.escape(button.dataset.removeProduct)}"]`);
    if (checkbox) checkbox.checked = false;
    syncSelected();
  });

  submitButton?.addEventListener("click", () => {
    const count = selectedProducts.size;
    note.textContent = count
      ? `Enquiry summary prepared with ${count} selected product${count === 1 ? "" : "s"}. Connect this form to email, CRM, or backend storage before launch.`
      : "Select at least one product before preparing the enquiry summary.";
  });

  renderTree();
  syncSelected();
}

document.addEventListener("DOMContentLoaded", () => {
  initRetail();
  initB2B();
});
