/**
 * Demo organization labels — Instagram-themed sample data.
 * Set VITE_ORG_MODE=external for extra-anonymized labels (Product Alpha, etc.).
 */

const DATA_KEY_PRODUCTS = ['Feed', 'Reels', 'DMs', 'Explore', 'Creator']

const demo = {
  mode: 'demo',
  designSystemName: 'Prism',
  designSystemFull: 'Prism Design System',
  portfolioVisionPhrase: 'a cohesive creator and consumer experience',
  portfolioCohesion: 'Instagram experience',
  portfolioProducts: 'Instagram product surfaces',
  uiFromPatterns: 'of Instagram UI built from shared Prism patterns',
  analyticsTag: 'Prism Analytics',
  aiLayer: 'Spark AI',
  aiLayerDescription: 'Creative assistant layer',
  productDisplayNames: {},
  launchProduct: 'Reels',
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
    Reels: 'Product Beta',
    DMs: 'Product Gamma',
    Explore: 'Product Delta',
    Creator: 'Product Epsilon',
  },
  launchProduct: 'Product Beta',
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
