export async function apiGet(path: string, token?: string | null) {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = "Bearer " + token;
  const res = await fetch(path, { headers });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "API error");
  return json.data;
}

export async function apiPost(path: string, token?: string | null, body?: any) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = "Bearer " + token;
  const res = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body || {})
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "API error");
  return json.data;
}
