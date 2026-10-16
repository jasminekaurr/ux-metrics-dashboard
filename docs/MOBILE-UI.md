# Mobile dashboard UI

The dashboard uses the same routes and data on desktop and mobile. The responsive rules live beside the components they affect; page-wide shell rules live in `dashboard/src/pages/ExecutiveSummary.css` and `dashboard/src/index.css`.

## Breakpoints

- **900px and below:** the fixed sidebar becomes a drawer under a 56px top bar. The main content uses the full viewport width. `Nav.jsx` owns open state; route selection, backdrop activation, and Escape close the drawer.
- **700px and below:** dense page grids and research charts stack. Strategic contribution cards become a list because the quadrant's absolute positions cannot remain readable on a phone.
- **600px and below:** content uses 14px side gutters, KPI cards use two columns, and wide tables scroll horizontally.

## Interaction rules

- Navigation links, period controls, expand buttons, and close buttons should have at least a 44px touch target.
- The month picker uses two taps for an inclusive range. Its calendar is scrollable within the mobile drawer. Keep the period instruction in tap language.
- Section help opens on tap or click as well as pointer hover. The tooltip remains positioned in the viewport when the page scrolls.
- Preserve keyboard access: the menu button exposes `aria-expanded`, Escape closes the drawer, and existing route links remain normal links.
- New charts should use responsive containers. If a data table cannot reflow without losing column meaning, let the table scroll horizontally.

## Local review

Run `pnpm lint` and `pnpm exec vite build --outDir /tmp/ux-metrics-mobile-build` from `dashboard/`. In a browser, review each route at approximately 375px, 600px, 900px, and desktop width in both themes. Check menu opening and dismissal, period selection, section help, expandable research details, chart legends, and the strategic detail drawer.
