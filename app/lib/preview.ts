export function isPrivatePreview() {
  return process.env.STOATMOD_PRIVATE_PREVIEW?.trim().toLowerCase() === "true";
}
