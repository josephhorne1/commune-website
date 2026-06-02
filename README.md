# COMMUNE Website

COMMUNE is a static storefront and publishing prototype for communesystem.com. The site keeps a stark, minimal visual language: a locked landing gate, a video-led main entry, modular product sections, catalog imagery, sound content, and an OPERA product page.

## Main Pages

- `locked.html` - public password gate and email signup page.
- `index.html` - landing video and COMMUNE module storefront.
- `cart.html` - local cart review and quantity controls.
- `checkout.html` - temporary order inquiry placeholder.
- `catalog.html` - lookbook/catalog image viewer.
- `sound.html` - audio page.
- `opera.html` - OPERA product page.

## Current Architecture

This is a static HTML/CSS/JavaScript site. There is no framework build step and no package manager dependency required for normal local development.

- `style.css` contains the main shared layout, navigation, cart, sound, checkout, and OPERA styling.
- `modules.css` contains module-specific storefront positioning.
- `script.js` powers the landing screen, product module galleries, cart count, homepage add-to-cart behavior, SOUND playback, and OPERA add-to-cart behavior.
- `cart.js` powers the cart page and normalizes old cart formats.
- `catalog.js` powers the catalog image viewer.
- `checkout.js` powers the temporary checkout inquiry placeholder.
- `locked-script.js` powers the locked landing page slideshow, Formspree signup, and password modal.
- `worker.js` is the Cloudflare Worker that protects the site behind signed cookie auth.

## PR Review Note

The referenced PR #1 has not been reviewed from this local export. This folder does not include git metadata, so that PR still needs review later from a git-enabled checkout or the GitHub web interface.

## Local Development

You can open the HTML files directly in a browser, or run a small static server from the project root:

```sh
python -m http.server 4173
```

Then visit:

```text
http://localhost:4173/
```

Using a local server is recommended when testing browser storage, relative assets, audio, and video.

## Cart Data Model

Cart data is stored in `localStorage` under the key `commune-cart`.

Current cart items use this shape:

```js
{
  product: "COMFORT",
  size: "tall",
  price: 100,
  quantity: 1
}
```

Current product prices:

- COMFORT: 100
- BASE: 50
- UNDER: 25
- TRAVEL: 400
- RAIN: 150
- MASCOT T-SHIRT: 30

The cart code also normalizes older stored values, including string entries like `COMFORT - tall`, old em dash variants, and older `{ name, quantity }` objects.

## Password Gate Notes

The locked page and Cloudflare Worker password flow should remain intact. The Worker expects these environment variables:

- `ORIGIN_HOST`
- `LOCK_PASSWORD`
- `SIGNING_KEY`

The Worker handles `/api/login`, sets a signed `commune_auth` cookie, and proxies authenticated requests to the origin host.

## Known Unfinished Areas

- Checkout is not live payment. `checkout.html` is only a temporary order inquiry placeholder.
- Inventory counts are static display text.
- OPERA has one sample product wired into the cart.
- Catalog navigation is static and image-list based.
- There is no Shopify, Stripe, or backend order system.

## Deployment

The site is intended for `communesystem.com`, with `CNAME` set to that domain. The Cloudflare Worker should sit in front of the static origin when the password gate is active.
