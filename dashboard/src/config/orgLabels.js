/**
 * Demo organization labels — LinkedIn-themed sample data.
 * Set VITE_ORG_MODE=external for extra-anonymized labels (Product Alpha, etc.).
 *
 *   npm run dev:external
 *   npm run build:external
 */

const DATA_KEY_PRODUCTS = ['Feed', 'Messaging', 'Jobs', 'Network', 'Premium']

const demo = {
  mode: 'demo',
  designSystemName: 'Horizon',
  designSystemFull: 'Horizon Design System',
  portfolioVisionPhrase: 'a unified member experience',
  portfolioCohesion: 'member experience',
  portfolioProducts: 'LinkedIn product surfaces',
  uiFromPatterns: 'of member-facing UI built from shared Horizon patterns',
  analyticsTag: 'Horizon Analytics',
  aiLayer: 'Insights AI',
  aiLayerDescription: 'Research synthesis assistant',
  productDisplayNames: {},
  launchProduct: 'Jobs',
}

const external = {
  mode: 'external',
  designSystemName: 'Nexus',
  designSystemFull: 'Nexus Design System',
  portfolioVisionPhrase: 'a unified product portfolio',
  portfolioCohesion: 'portfolio experience',
  portfolioProducts: 'key products',
  uiFromPatterns: 'of portfolio UI built from shared design system patterns',
  analyticsTag: 'Design System Analytics',
  aiLayer: 'AI synthesis layer',
  aiLayerDescription: 'Optional AI layer',
  productDisplayNames: {
    Feed: 'Product Alpha',
    Messaging: 'Product Beta',
    Jobs: 'Product Gamma',
    Network: 'Product Delta',
    Premium: 'Product Epsilon',
  },
  launchProduct: 'Product Gamma',
}

const mode = import.meta.env.VITE_ORG_MODE === 'external' ? 'external' : 'demo'
export const labels = mode === 'external' ? external : demo

export function displayProduct(name) {
  return labels.productDisplayNames[name] || name
}

export function filterKeyProducts(components) {
  return components
    .filter(c => DATA_KEY_PRODUCTS.includes(c.project))
    .map(c => ({ ...c, project: displayProduct(c.project) }))
}

export function countKeyProducts(components) {
  return components.filter(c => DATA_KEY_PRODUCTS.includes(c.project)).length
}

export const isExternalDemo = mode === 'external'
