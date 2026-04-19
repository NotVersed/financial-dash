// clients/dataInformation.js

// TABLE NAMES
export const CLIENT_TABLE_NAME = 'clients'
export const METRICS_TABLE_NAME = 'financial_metrics'

// COLUMN NAMES (THIS IS WHAT YOU WERE MISSING)
export const CLIENT_ID_COL = 'client_id'
export const CLIENT_NAME_COL = 'last_name' // or 'first_name' depending on sort preference

// Normalize client object (VERY important for UI consistency)
export function normalizeClient(client) {
  if (!client) return null

  return {
    id: client.client_id,
    first_name: client.first_name ?? '',
    last_name: client.last_name ?? '',
    email: client.email ?? '',
    status: client.status ?? 'active',

    // Derived
    client_name: `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim(),

    // Financials (current snapshot)
    current_credit_score: client.current_credit_score ?? null,
    current_net_income: client.current_net_income ?? null,
    current_net_worth: client.current_net_worth ?? null,

    // Goals
    goal_credit_score: client.goal_credit_score ?? null,
    goal_net_income: client.goal_net_income ?? null,
    goal_net_worth: client.goal_net_worth ?? null,
  }
}

// Display helper (used in ClientList)
export function getClientDisplayName(client) {
  if (!client) return 'Unnamed Client'

  const fullName = `${client.first_name ?? ''} ${client.last_name ?? ''}`.trim()
  return fullName || client.client_name || 'Unnamed Client'
}

// Merge latest financial_metrics into clients
export function mergeClientWithMetrics(clients, metrics) {
  const latestMap = new Map()

  for (const row of metrics) {
    if (!latestMap.has(row.client_id)) {
      latestMap.set(row.client_id, row)
    }
  }

  return clients.map((client) => {
    const metric = latestMap.get(client.client_id)

    return {
      ...client,
      current_credit_score:
        metric?.current_credit_score ?? client.current_credit_score ?? null,
      current_net_income:
        metric?.current_net_income ?? client.current_net_income ?? null,
      current_net_worth:
        metric?.current_net_worth ?? client.current_net_worth ?? null,
    }
  })
}