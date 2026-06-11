# Envox Industries Website

Static website concept for Envox Industries using the selected Theme 3 palette.

## Pages

- `index.html` - homepage with classic scroll sections for Envox Carton, Envox Paper Bag, and Envox Boxes
- `carton.html` - corrugated carton manufacturing page
- `paper-bags.html` - paper bag manufacturing page
- `boxes.html` - sweet boxes, bakery boxes, and restaurant packaging page
- `retail.html` - ecommerce-style retail catalogue, bag, checkout form, and payment gateway placeholder
- `b2b.html` - interactive B2B product selector and RFQ form
- `app.js` - client-side static interactions for retail cart and B2B product selection
- `firebase-config.js` - browser Firebase project config used by the RFQ form
- `firestore.rules` - create-only Firestore rules for public RFQ submissions

## Firebase RFQ Setup

The B2B RFQ form writes new enquiries to a Firestore collection named `rfqRequests`.

1. Create or open a Firebase project.
2. Add a Web App in Firebase project settings.
3. Copy the web config values into both `firebase-config.js` and `public/firebase-config.js`.
4. Enable Firestore in Native mode.
5. Publish the rules from `firestore.rules`.
6. Deploy the site. Cloudflare serves the files from `public/`, so make sure `public/firebase-config.js` has the live project values.

The Firebase web config is not a private secret, but Firestore rules still matter. The included rules allow unauthenticated users to create RFQ documents only and block client-side reads, edits, and deletes.

## Retail SKU Setup

The retail catalogue reads from Firestore collection `retailProducts`. Public users can read only documents with `active: true`; use the Firebase Console to list or unlist products by toggling that field.

Example document:

```js
{
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
    }
  ]
}
```

Set a product document `active` to `false` to unlist the whole SKU. Set a variant `active` to `false` to hide one size/pack option while keeping the product listed.

## Visual Assets

- `assets/envox-packaging-hero.png`
- `assets/envox-carton-collage.png`
- `assets/envox-paper-bag-collage.png`
- `assets/envox-boxes-collage.png`
- `assets/retail-sweet-mini.jpg`
- `assets/retail-bakery-window.jpg`
- `assets/retail-meal-kraft.jpg`
- `assets/retail-burger-box.jpg`
- `assets/retail-paper-carry.jpg`
- `assets/retail-starter-carton.jpg`
- `assets/envox-logo.jpg` - approved compact logo mark, used for favicon/logo contexts
- `assets/envox-full-logo.jpg` - approved full horizontal logo, used in the website header
- `assets/envox-mark-print.svg` - earlier single-color print mark retained as an experimental backup
- `assets/envox-logo.svg` - earlier vector lockup retained as an experimental backup

## Brand Palette

All website colors are defined once in `styles.css` under `:root`.

| Role | Token | Hex |
| --- | --- | --- |
| Primary | `--color-forest` | `#173F35` |
| Secondary | `--color-kraft` | `#A97945` |
| Background | `--color-off-white` | `#F4EFE6` |
| Text | `--color-graphite` | `#303633` |
| Accent | `--color-copper` | `#B76E42` |

Future sections should use these tokens or derived tokens from `:root`, not raw ad hoc colors.
