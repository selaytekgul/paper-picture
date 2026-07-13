const paperlogOrigin = "https://paperlog.net";

export function paperlogUrlForDoi(doi: string) {
  const url = new URL("/paper/resolve", paperlogOrigin);
  url.searchParams.set("doi", `doi:${doi.trim()}`);
  return url.toString();
}
