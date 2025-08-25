export async function apiGet(path: string, token: string) {
  const res = await fetch(path, { headers: { Authorization: "Bearer " + token } });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "API error");
  return json.data;
}

export async function apiPost(path: string, token: string, body?: any) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify(body || {})
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.message || "API error");
  return json.data;
}
