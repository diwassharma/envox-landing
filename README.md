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

## Visual Assets

- `assets/envox-packaging-hero.png`
- `assets/envox-carton-collage.png`
- `assets/envox-paper-bag-collage.png`
- `assets/envox-boxes-collage.png`
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
