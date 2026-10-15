interface Fetcher {
  fetch(request: Request): Promise<Response>;
}
