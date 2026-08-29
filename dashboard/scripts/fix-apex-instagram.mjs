import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const paths = [
  resolve(__dirname, '../src/data/sample/apex.json'),
  resolve(__dirname, '../src/data/apex.json'),
]

const TEAM_KEY_MAP = {
  Messaging: 'DMs',
  Jobs: 'Reels',
  'Universal Banker': 'Reels',
  'DNA UX': 'Stories',
  'Core Advance': 'Feed',
  Portico: 'Explore',
  Network: 'Explore',
  'Applied AI': 'Creator',
  Premium: 'Creator',
  'APEX Design System': 'Prism Design System',
  'Horizon Design System': 'Prism Design System',
  'Aitrium UX': 'Creator Tools',
  'Insights UX': 'Creator Tools',
  'Data Acceleration': 'Stories',
  AppMarket: 'Shop',
  SnapPay: 'Checkout',
  'Client Onboarding': 'Sign-up',
  Premier: 'Subscriptions',
  Stabiliti: 'Stability',
  DataCompass: 'Insights',
  'Teller UX': 'Live UX',
  'DNA Verifast': 'Stories QA',
  Loancierge: 'Shop Checkout',
  'EPP Modernization': 'Platform Infra',
  'CUS Business Analysts': 'Growth Ops',
  'Merchant Solutions Products': 'Shop Payments',
  'Universal Branch': 'Profile Web',
  'Gift & Stored Value': 'Gifts',
  'Armor Project': 'Safety',
  'CANS-IRIS': 'Internal Tools',
  'File Transfer': 'Media Pipeline',
  CBS_Redesign: 'Core App Shell',
  'Access Advantage': 'Access',
  'CNS Modernization': 'Notifications',
  'Data Factory Dashboard': 'Insights Hub',
  Signature: 'Badges',
  'Consulting Work - Internal': 'Design Ops',
}

const TEAM_RANKING_RENAMES = {
  'Teller UX': 'Live UX',
  'DNA Verifast': 'Stories QA',
  Loancierge: 'Shop Checkout',
  Premier: 'Subscriptions',
  'EPP Modernization': 'Platform Infra',
  'CUS Business Analysts': 'Growth Ops',
  'Merchant Solutions Products': 'Shop Payments',
  'Universal Branch': 'Profile Web',
  'Gift & Stored Value': 'Gifts',
  'Armor Project': 'Safety',
  'CANS-IRIS': 'Internal Tools',
  'File Transfer': 'Media Pipeline',
  CBS_Redesign: 'Core App Shell',
  'Access Advantage': 'Access',
  'CNS Modernization': 'Notifications',
  'Data Factory Dashboard': 'Insights Hub',
  Signature: 'Badges',
  'Consulting Work - Internal': 'Design Ops',
  Stabiliti: 'Stability',
  DataCompass: 'Insights',
}

const TICKET_MAP = [
  ['CORE-', 'FEED-'],
  ['DNA-', 'REEL-'],
  ['UBA-', 'REEL-'],
  ['MSG-', 'DM-'],
  ['NET-', 'EXPL-'],
  ['PREM-', 'CRE-'],
]

function remapTickets(value) {
  if (typeof value !== 'string') return value
  let next = value
  for (const [from, to] of TICKET_MAP) next = next.split(from).join(to)
  return next
}

function walk(value) {
  if (Array.isArray(value)) return value.map(walk)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      const newKey = TEAM_KEY_MAP[k] ?? k
      out[newKey] = walk(v)
    }
    return out
  }
  return remapTickets(value)
}

for (const path of paths) {
  const data = JSON.parse(await readFile(path, 'utf8'))

  if (data.teamRanking) {
    data.teamRanking = data.teamRanking.map(row => ({
      ...row,
      team: TEAM_RANKING_RENAMES[row.team] ?? TEAM_KEY_MAP[row.team] ?? row.team,
    }))
  }

  const remapped = walk(data)
  await writeFile(path, `${JSON.stringify(remapped, null, 2)}\n`)
  console.log(`Fixed ${path}`)
}
