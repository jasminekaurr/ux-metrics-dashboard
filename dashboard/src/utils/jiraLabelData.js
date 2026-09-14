/**
 * jiraLabelData.js — normalize Jira label-adoption capture for UI.
 *
 * Maps capture issues into ticket objects and resolves browse URLs for Venn /
 * adoption views. Related: utils/jira.js, components/LabelAdoptionVennDark.jsx.
 */

export function ticketsFromJiraAdoption(data) {
  if (!data?.issues?.length) return []

  return data.issues.map(issue => ({
    id: issue.id,
    name: issue.name,
    labels: Array.isArray(issue.labels) ? issue.labels : [],
    url: issue.url,
  }))
}

export function ticketBrowseUrl(ticket, browseBaseUrl, getJiraBrowseUrl) {
  if (ticket?.url) return ticket.url
  return getJiraBrowseUrl(ticket.id, browseBaseUrl)
}
