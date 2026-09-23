/**
 * A non-2xx response can come back as an HTML error page instead of JSON
 * (e.g. a platform-level timeout or gateway error) — a bare `response.json()`
 * would then throw a raw SyntaxError straight into the UI. Parse defensively
 * and fall back to a readable message keyed off the status code.
 */
export async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      response.ok
        ? "Received an unexpected response from the server. Please try again."
        : `Server error (${response.status}). Please try again.`,
    );
  }
}
