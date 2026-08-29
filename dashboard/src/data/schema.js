export const DATA_SCHEMA = {
  months: {
    description: 'Array of month labels shown in the month picker.',
    example: ['Jan 2026', 'Feb 2026'],
  },
  executive: {
    description: 'Monthly executive narratives and top decisions.',
  },
  roadmap: {
    description: 'Delivery health, projects, epics, velocity, blockers, and related roadmap metrics.',
  },
  research: {
    description: 'Research coverage, implementation, usability, and decision impact metrics.',
  },
  cost: {
    description: 'Business impact and monthly cost breakdown.',
  },
  projectComponents: {
    description: 'Custom vs design-system component tracking.',
  },
  strategic: {
    description: 'Innovation initiatives, POC funnel, and AI adoption.',
  },
  researchInitiatives: {
    description: 'Active research initiatives list.',
  },
  panelHealth: {
    description: 'Research panel health metrics.',
  },
  ubaIASpotlight: {
    description: 'Spotlight research initiative details.',
  },
  researchAsks: {
    description: 'Outstanding research asks.',
  },
  strategicContributions: {
    description: 'Strategic contribution cards for the matrix view.',
  },
  apex: {
    description: 'Design system analytics: weekly insertions, teams, detachments.',
  },
  jiraLabelAdoption: {
    description: 'Jira issues with UX label taxonomy for adoption visualizations.',
    shape: {
      generatedAt: 'ISO timestamp',
      browseBaseUrl: 'Jira browse URL base',
      issues: [{ id: 'string', name: 'string', labels: ['string'] }],
    },
  },
  fcubComponentVenn: {
    description: 'Jira component overlap data for Venn visualizations.',
  },
}
