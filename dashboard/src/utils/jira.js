import jiraLabelAdoption from '../data/jiraLabelAdoption.json'

const DEFAULT_JIRA_BROWSE_BASE_URL = 'https://jira.company.com/browse'

function toBrowseBaseUrl(value) {
  const baseUrl = String(value || '').trim().replace(/\/$/, '')
  if (!baseUrl) return DEFAULT_JIRA_BROWSE_BASE_URL
  return baseUrl.endsWith('/browse') ? baseUrl : `${baseUrl}/browse`
}

export const JIRA_BROWSE_BASE_URL = toBrowseBaseUrl(
  import.meta.env.VITE_JIRA_BROWSE_BASE_URL ||
    import.meta.env.VITE_JIRA_BASE_URL ||
    jiraLabelAdoption.browseBaseUrl
)

export function getJiraBrowseUrl(issueKey, browseBaseUrl) {
  const base = browseBaseUrl
    ? toBrowseBaseUrl(browseBaseUrl)
    : JIRA_BROWSE_BASE_URL
  return `${base}/${encodeURIComponent(issueKey)}`
}
