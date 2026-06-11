const fs = require("fs");
const https = require("https");
const path = require("path");
const { execFileSync } = require("child_process");

const projectId = "envox-website";
const databaseId = "(default)";
const tokenPath = path.join(
  process.env.HOME,
  ".config",
  "configstore",
  "firebase-tools.json"
);

const products = [
  {
    id: "sweet-mini",
    active: true,
    sortOrder: 10,
    name: "Mini Sweet Box Set",
    category: "Sweet Boxes",
    badge: "Ready stock",
    description: "Compact mithai boxes for counters, gifting, and festive sampling.",
    imageUrl: "/assets/retail-sweet-mini.jpg",
    imageAlt: "Mini sweet packaging boxes with mithai compartments",
    variants: [
      {
        id: "4x4-pack-100",
        label: "4 x 4 inch",
        size: "4 x 4 x 1.5 inch",
        pack: "Pack of 100",
        price: 850,
        sku: "ENX-SWT-MINI-4X4-100",
        stockStatus: "In stock",
        active: true
      },
      {
        id: "6x6-pack-100",
        label: "6 x 6 inch",
        size: "6 x 6 x 1.75 inch",
        pack: "Pack of 100",
        price: 1180,
        sku: "ENX-SWT-MINI-6X6-100",
        stockStatus: "In stock",
        active: true
      }
    ]
  },
  {
    id: "bakery-window",
    active: true,
    sortOrder: 20,
    name: "Bakery Window Box",
    category: "Bakery Boxes",
    badge: "Window lid",
    description: "Window boxes for pastries, cookies, cupcakes, and counter display.",
    imageUrl: "/assets/retail-bakery-window.jpg",
    imageAlt: "Bakery boxes with clear window lids for pastries and cookies",
    variants: [
      {
        id: "6x6-pack-50",
        label: "6 x 6 inch",
        size: "6 x 6 x 2.5 inch",
        pack: "Pack of 50",
        price: 720,
        sku: "ENX-BKY-WIN-6X6-50",
        stockStatus: "In stock",
        active: true
      },
      {
        id: "8x8-pack-50",
        label: "8 x 8 inch",
        size: "8 x 8 x 3 inch",
        pack: "Pack of 50",
        price: 980,
        sku: "ENX-BKY-WIN-8X8-50",
        stockStatus: "In stock",
        active: true
      }
    ]
  },
  {
    id: "meal-kraft",
    active: true,
    sortOrder: 30,
    name: "Kraft Meal Box",
    category: "Restaurant Packaging",
    badge: "Food grade",
    description: "Takeaway meal boxes for restaurants, cafes, and cloud kitchens.",
    imageUrl: "/assets/retail-meal-kraft.jpg",
    imageAlt: "Kraft takeaway meal boxes in multiple sizes",
    variants: [
      {
        id: "500ml-pack-100",
        label: "500 ml",
        size: "500 ml",
        pack: "Pack of 100",
        price: 960,
        sku: "ENX-MEAL-KFT-500-100",
        stockStatus: "In stock",
        active: true
      },
      {
        id: "750ml-pack-100",
        label: "750 ml",
        size: "750 ml",
        pack: "Pack of 100",
        price: 1240,
        sku: "ENX-MEAL-KFT-750-100",
        stockStatus: "In stock",
        active: true
      }
    ]
  },
  {
    id: "burger-box",
    active: true,
    sortOrder: 40,
    name: "Burger Box",
    category: "Restaurant Packaging",
    badge: "QSR",
    description: "Food box for burgers, sandwiches, snacks, and quick service counters.",
    imageUrl: "/assets/retail-burger-box.jpg",
    imageAlt: "Kraft clamshell burger boxes for QSR packaging",
    variants: [
      {
        id: "regular-pack-100",
        label: "Regular",
        size: "4.5 x 4.5 x 3 inch",
        pack: "Pack of 100",
        price: 780,
        sku: "ENX-BGR-REG-100",
        stockStatus: "In stock",
        active: true
      },
      {
        id: "large-pack-100",
        label: "Large",
        size: "5 x 5 x 3.5 inch",
        pack: "Pack of 100",
        price: 940,
        sku: "ENX-BGR-LRG-100",
        stockStatus: "In stock",
        active: true
      }
    ]
  },
  {
    id: "paper-carry",
    active: true,
    sortOrder: 50,
    name: "Kraft Carry Bag",
    category: "Paper Bags",
    badge: "Carry bag",
    description: "Retail and takeaway paper bags for small business packaging.",
    imageUrl: "/assets/retail-paper-carry.jpg",
    imageAlt: "Kraft paper carry bags with twisted handles",
    variants: [
      {
        id: "small-pack-100",
        label: "Small",
        size: "8 x 10 x 4 inch",
        pack: "Pack of 100",
        price: 1100,
        sku: "ENX-BAG-KFT-S-100",
        stockStatus: "In stock",
        active: true
      },
      {
        id: "medium-pack-100",
        label: "Medium",
        size: "10 x 12 x 4 inch",
        pack: "Pack of 100",
        price: 1420,
        sku: "ENX-BAG-KFT-M-100",
        stockStatus: "In stock",
        active: true
      }
    ]
  },
  {
    id: "starter-carton",
    active: true,
    sortOrder: 60,
    name: "Starter Shipping Carton",
    category: "Cartons",
    badge: "Ecommerce",
    description: "Small dispatch cartons for ecommerce, gifting, and stock movement.",
    imageUrl: "/assets/retail-starter-carton.jpg",
    imageAlt: "Corrugated ecommerce shipping cartons in small sizes",
    variants: [
      {
        id: "9x6x4-pack-25",
        label: "9 x 6 x 4 inch",
        size: "9 x 6 x 4 inch",
        pack: "Pack of 25",
        price: 650,
        sku: "ENX-CRT-9X6X4-25",
        stockStatus: "In stock",
        active: true
      },
      {
        id: "12x9x6-pack-25",
        label: "12 x 9 x 6 inch",
        size: "12 x 9 x 6 inch",
        pack: "Pack of 25",
        price: 920,
        sku: "ENX-CRT-12X9X6-25",
        stockStatus: "In stock",
        active: true
      }
    ]
  },
  {
    id: "printed-paper-bag-sample",
    active: false,
    sortOrder: 70,
    name: "Printed Paper Bag Sample",
    category: "Paper Bags",
    badge: "Unlisted",
    description: "Inactive sample SKU to verify Firestore unlisting behavior.",
    imageUrl: "/assets/retail-paper-carry.jpg",
    imageAlt: "Printed paper bag sample packaging",
    variants: [
      {
        id: "medium-pack-100",
        label: "Medium",
        size: "10 x 12 x 4 inch",
        pack: "Pack of 100",
        price: 1800,
        sku: "ENX-BAG-PRT-M-100",
        stockStatus: "Sample",
        active: true
      }
    ]
  }
];

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  return {
    mapValue: {
      fields: Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [key, toFirestoreValue(nestedValue)])
      )
    }
  };
}

function requestJson(url, options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : {});
        } else {
          reject(new Error(`${res.statusCode} ${res.statusMessage}: ${data}`));
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const accessToken = await getAccessToken();

  for (const product of products) {
    const { id, ...document } = product;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/retailProducts/${encodeURIComponent(id)}`;
    await requestJson(
      url,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      },
      JSON.stringify({
        fields: Object.fromEntries(
          Object.entries(document).map(([key, value]) => [key, toFirestoreValue(value)])
        )
      })
    );
    console.log(`Seeded retailProducts/${id}`);
  }
}

function getFirebaseCliOAuthConfig() {
  const firebaseBin = fs.realpathSync(execFileSync("which", ["firebase"], { encoding: "utf8" }).trim());
  const firebaseToolsRoot = path.resolve(path.dirname(firebaseBin), "..", "..");
  const firebaseApi = require(path.join(firebaseToolsRoot, "lib", "api.js"));

  return {
    clientId: firebaseApi.clientId(),
    clientSecret: firebaseApi.clientSecret()
  };
}

async function getAccessToken() {
  const firebaseConfig = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
  const refreshToken = firebaseConfig.tokens?.refresh_token;

  if (!refreshToken) {
    throw new Error("Firebase CLI refresh token not found. Run firebase login --reauth first.");
  }

  const { clientId, clientSecret } = getFirebaseCliOAuthConfig();
  const form = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token"
  });

  const response = await requestJson(
    "https://www.googleapis.com/oauth2/v3/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(form.toString())
      }
    },
    form.toString()
  );

  if (!response.access_token) {
    throw new Error("Unable to refresh Firebase CLI access token. Run firebase login --reauth first.");
  }

  return response.access_token;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
