/**
 * Normalize Jira label-adoption capture output for Venn / adoption views.
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
