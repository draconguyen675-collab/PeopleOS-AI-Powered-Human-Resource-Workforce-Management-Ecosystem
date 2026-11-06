export default async () => new Response(JSON.stringify({
  status: 503,
  detail: "Online sign-in is not available yet. Please contact your workspace administrator.",
}), {
  status: 503,
  headers: { "Content-Type": "application/problem+json", "Cache-Control": "no-store" },
});
