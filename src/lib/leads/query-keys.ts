export const LEADS_HISTORY_QUERY_KEY = ["leads", "history"] as const;
export const LEADS_BOARD_QUERY_KEY = ["leads", "board"] as const;

export function leadsSearchDetailsQueryKey(searchId: string): readonly [string, string, string] {
  return ["leads", "history", searchId] as const;
}
