export const CLIENT_TABLE_NAME = 'clients'
export const CLIENT_ID_COL = 'client_id'
export const CLIENT_NAME_COL = 'last_name'

export function getClientDisplayName(client) {
  const firstName = typeof client?.first_name === 'string' ? client.first_name.trim() : ''
  const lastName = typeof client?.last_name === 'string' ? client.last_name.trim() : ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()

  return fullName || client?.client_name || 'Unnamed Client'
}

export function normalizeClient(client) {
  return {
    ...client,
    id: client?.id ?? client?.[CLIENT_ID_COL] ?? null,
    client_name: getClientDisplayName(client),
  }
}