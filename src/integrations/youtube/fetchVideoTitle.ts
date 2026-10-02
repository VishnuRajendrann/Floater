export async function fetchVideoTitle(url: string): Promise<string | null> {
  try {
    const endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { title?: string };
    return typeof data.title === "string" && data.title.length > 0
      ? data.title
      : null;
  } catch {
    return null;
  }
}
