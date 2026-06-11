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
const firebaseModuleUrls = {
  app: "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js",
  firestore: "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"
};

const retailCartStorageKey = "envoxRetailCart";
let firebaseClientPromise;

function getFirebaseConfig() {
  return window.ENVOX_FIREBASE_CONFIG && typeof window.ENVOX_FIREBASE_CONFIG === "object"
    ? window.ENVOX_FIREBASE_CONFIG
    : null;
}

function isFirebaseConfigured(config) {
  const requiredFields = ["apiKey", "authDomain", "projectId", "appId"];
  return Boolean(config) && requiredFields.every((field) => {
    const value = config[field];
    return typeof value === "string" && value.trim() && !value.includes("YOUR_");
  });
}

async function getFirebaseClient() {
  const config = getFirebaseConfig();

  if (!isFirebaseConfigured(config)) {
    throw new Error("Firebase is not configured yet. Add your project values in firebase-config.js before accepting live data.");
  }

  if (!firebaseClientPromise) {
    firebaseClientPromise = Promise
      .all([import(firebaseModuleUrls.app), import(firebaseModuleUrls.firestore)])
      .then(([firebaseApp, firestore]) => {
        const app = firebaseApp.getApps().length
          ? firebaseApp.getApp()
          : firebaseApp.initializeApp(config);

        return {
          addDoc: firestore.addDoc,
          collection: firestore.collection,
          db: firestore.getFirestore(app),
          getDocs: firestore.getDocs,
          query: firestore.query,
          where: firestore.where,
          serverTimestamp: firestore.serverTimestamp
        };
      });
  }

  return firebaseClientPromise;
}

async function getFirebaseRfqClient() {
  return getFirebaseClient();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function formValue(form, name) {
  return String(new FormData(form).get(name) || "").trim();
}

function buildRfqPayload(form, selectedProducts) {
  return {
    status: "new",
    source: "envox-b2b-web",
    customer: {
      company: formValue(form, "company"),
      person: formValue(form, "person"),
      phone: formValue(form, "phone"),
      email: formValue(form, "email"),
      city: formValue(form, "city"),
      businessType: formValue(form, "businessType")
    },
    selectedProducts: [...selectedProducts.values()].map((item) => ({
      unit: item.unit,
      group: item.group,
      product: item.product
    })),
    selectedProductsText: formValue(form, "selectedProducts"),
    requirements: {
      quantity: formValue(form, "quantity"),
      size: formValue(form, "size"),
      printRequirement: formValue(form, "printRequirement"),
      material: formValue(form, "material"),
      timeline: formValue(form, "timeline"),
      message: formValue(form, "message")
    },
    pagePath: window.location.pathname,
    submittedFrom: window.location.href,
    userAgent: navigator.userAgent,
    clientSubmittedAt: new Date().toISOString()
  };
}

function initRetail() {
  const productRoot = document.querySelector("#retail-products");
  const bagItemsRoot = document.querySelector("#bag-items");
  const bagCount = document.querySelector("#bag-count");
  const bagTotal = document.querySelector("#bag-total");
  const checkoutSummary = document.querySelector("#checkout-cart-summary");
  const checkoutButton = document.querySelector("[data-checkout-placeholder]");
  const checkoutNote = document.querySelector("#checkout-note");

  if (!productRoot || !bagItemsRoot || !bagCount || !bagTotal) return;

  const bag = new Map(loadRetailCart().map((item) => [item.key, item]));
  let products = [];
  let productIndex = new Map();

  function loadRetailCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(retailCartStorageKey) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => item && item.key) : [];
    } catch {
      return [];
    }
  }

  function saveRetailCart() {
    localStorage.setItem(retailCartStorageKey, JSON.stringify([...bag.values()]));
  }

  function normaliseVariant(variant, index) {
    const id = String(variant.id || variant.sku || `variant-${index}`);
    const price = Number(variant.price || 0);

    return {
      id,
      label: String(variant.label || variant.size || variant.pack || "Standard"),
      size: String(variant.size || variant.label || ""),
      pack: String(variant.pack || ""),
      price: Number.isFinite(price) ? price : 0,
      sku: String(variant.sku || id).toUpperCase(),
      stockStatus: String(variant.stockStatus || "In stock"),
      active: variant.active !== false
    };
  }

  function normaliseProduct(doc) {
    const data = doc.data();
    const variants = Array.isArray(data.variants)
      ? data.variants.map(normaliseVariant).filter((variant) => variant.active)
      : [];

    return {
      id: doc.id,
      name: String(data.name || "Untitled packaging SKU"),
      category: String(data.category || "Retail packaging"),
      description: String(data.description || ""),
      badge: String(data.badge || ""),
      imageAlt: String(data.imageAlt || data.name || "Retail packaging product"),
      imageUrl: String(data.imageUrl || ""),
      sortOrder: Number(data.sortOrder || 0),
      variants
    };
  }

  function pruneUnavailableCartItems() {
    bag.forEach((item, key) => {
      const product = productIndex.get(item.productId);
      const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
      if (!product || !variant) bag.delete(key);
    });
    saveRetailCart();
  }

  function renderProducts() {
    productRoot.innerHTML = products.length
      ? products.map((product) => {
        const firstVariant = product.variants[0];
        const disabled = firstVariant ? "" : "disabled";

        return `
      <article class="retail-card">
        ${product.imageUrl ? `
          <div class="retail-card-image">
            <img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.imageAlt)}" loading="lazy">
          </div>
        ` : ""}
        <div class="retail-card-topline">
          <span>${escapeHtml(product.category)}</span>
          ${product.badge ? `<small>${escapeHtml(product.badge)}</small>` : ""}
        </div>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description)}</p>
        <label class="variant-picker">
          Size / pack
          <select data-variant-select="${escapeHtml(product.id)}" ${disabled}>
            ${product.variants.map((variant) => `
              <option value="${escapeHtml(variant.id)}">
                ${escapeHtml(variant.label)} - ${escapeHtml(variant.pack)} - ${formatCurrency(variant.price)}
              </option>
            `).join("")}
          </select>
        </label>
        <div class="retail-card-meta" data-product-meta="${escapeHtml(product.id)}">
          ${firstVariant ? renderVariantMeta(firstVariant) : "<strong>Unavailable</strong><small>No active sizes</small>"}
        </div>
        <button class="button secondary" type="button" data-add-product="${escapeHtml(product.id)}" ${disabled}>
          Add to Bag
        </button>
      </article>
    `;
      }).join("")
      : "<p class=\"empty-state full-span\">No retail SKUs are listed right now. Add active products in Firestore collection retailProducts.</p>";
  }

  function renderVariantMeta(variant) {
    return `
      <div>
        <strong>${formatCurrency(variant.price)}</strong>
        <small>${escapeHtml(variant.stockStatus)}</small>
      </div>
      <div class="retail-sku">
        <span>${escapeHtml(variant.sku)}</span>
        <small>${escapeHtml(variant.size || variant.pack)}</small>
      </div>
    `;
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
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(item.variantLabel)} / ${escapeHtml(item.pack)}</span>
              <small>${escapeHtml(item.sku)} - ${formatCurrency(item.price)} each</small>
            </div>
            <div class="bag-qty">
              <button type="button" data-decrement="${escapeHtml(item.key)}">-</button>
              <span>${item.quantity}</span>
              <button type="button" data-increment="${escapeHtml(item.key)}">+</button>
            </div>
          </div>
        `).join("")
      : "<p class=\"empty-state\">Your bag is empty. Add retail packaging SKUs from the catalogue.</p>";

    if (checkoutSummary) {
      checkoutSummary.innerHTML = items.length
        ? `
            <div class="checkout-summary-header">
              <strong>${count} item${count === 1 ? "" : "s"} in bag</strong>
              <span>${formatCurrency(total)}</span>
            </div>
            ${items.map((item) => `
              <div class="checkout-summary-line">
                <span>${escapeHtml(item.name)} (${escapeHtml(item.variantLabel)}) x ${item.quantity}</span>
                <strong>${formatCurrency(item.quantity * item.price)}</strong>
              </div>
            `).join("")}
          `
        : "<p class=\"empty-state\">Cart summary will appear here after products are added.</p>";
    }
  }

  function selectedVariantFor(product) {
    const select = productRoot.querySelector(`[data-variant-select="${CSS.escape(product.id)}"]`);
    const selectedId = select?.value || product.variants[0]?.id;
    return product.variants.find((variant) => variant.id === selectedId) || product.variants[0];
  }

  productRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-product]");
    if (!button) return;
    const product = productIndex.get(button.dataset.addProduct);
    if (!product) return;
    const variant = selectedVariantFor(product);
    if (!variant) return;
    const key = `${product.id}:${variant.id}`;
    const current = bag.get(key) || {
      key,
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      variantLabel: variant.label,
      pack: variant.pack,
      price: variant.price,
      sku: variant.sku,
      quantity: 0
    };
    current.quantity += 1;
    bag.set(key, current);
    saveRetailCart();
    renderBag();
  });

  productRoot.addEventListener("change", (event) => {
    const select = event.target.closest("[data-variant-select]");
    if (!select) return;
    const product = productIndex.get(select.dataset.variantSelect);
    const variant = product?.variants.find((item) => item.id === select.value);
    const meta = productRoot.querySelector(`[data-product-meta="${CSS.escape(select.dataset.variantSelect)}"]`);
    if (variant && meta) meta.innerHTML = renderVariantMeta(variant);
  });

  bagItemsRoot.addEventListener("click", (event) => {
    const increment = event.target.closest("[data-increment]");
    const decrement = event.target.closest("[data-decrement]");
    const id = increment?.dataset.increment || decrement?.dataset.decrement;
    if (!id || !bag.has(id)) return;
    const item = bag.get(id);
    item.quantity += increment ? 1 : -1;
    if (item.quantity <= 0) bag.delete(id);
    saveRetailCart();
    renderBag();
  });

  checkoutButton?.addEventListener("click", () => {
    checkoutNote.textContent = "Payment gateway integration placeholder. Connect Razorpay or a suitable retail payment account before accepting live payments.";
  });

  renderBag();
  loadRetailProducts();

  async function loadRetailProducts() {
    productRoot.innerHTML = "<p class=\"empty-state full-span\">Loading retail SKUs from Firestore...</p>";

    try {
      const firebase = await getFirebaseClient();
      const snapshot = await firebase.getDocs(firebase.query(
        firebase.collection(firebase.db, "retailProducts"),
        firebase.where("active", "==", true)
      ));

      products = snapshot.docs
        .map(normaliseProduct)
        .filter((product) => product.variants.length)
        .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));
      productIndex = new Map(products.map((product) => [product.id, product]));
      pruneUnavailableCartItems();
      renderProducts();
      renderBag();
    } catch (error) {
      console.error("Retail catalogue failed to load", error);
      productRoot.innerHTML = "<p class=\"empty-state full-span\">Retail catalogue is unavailable. Check Firestore retailProducts and security rules.</p>";
    }
  }
}

function initB2B() {
  const treeRoot = document.querySelector("#b2b-product-tree");
  const selectedRoot = document.querySelector("#b2b-selected-products");
  const selectedField = document.querySelector("#selected-products-field");
  const submitButton = document.querySelector("[data-b2b-submit]");
  const note = document.querySelector("#b2b-note");
  const form = submitButton?.closest("form");

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
    form?.requestSubmit();
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const count = selectedProducts.size;

    if (!count) {
      note.textContent = "Select at least one product before submitting the RFQ.";
      return;
    }

    if (!form.reportValidity()) return;

    const originalLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Submitting RFQ...";
    note.textContent = "Submitting RFQ to Envox...";

    try {
      const firebase = await getFirebaseRfqClient();
      const payload = buildRfqPayload(form, selectedProducts);
      payload.createdAt = firebase.serverTimestamp();

      const docRef = await firebase.addDoc(
        firebase.collection(firebase.db, "rfqRequests"),
        payload
      );

      form.reset();
      selectedProducts.clear();
      treeRoot.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
        checkbox.checked = false;
      });
      syncSelected();
      note.textContent = `RFQ submitted successfully. Reference: ${docRef.id}`;
    } catch (error) {
      console.error("RFQ submission failed", error);
      note.textContent = error instanceof Error
        ? error.message
        : "Unable to submit the RFQ right now. Please try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  });

  renderTree();
  syncSelected();
}

document.addEventListener("DOMContentLoaded", () => {
  initRetail();
  initB2B();
});
