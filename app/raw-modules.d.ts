// Vite returns the file contents as a string for "?raw" imports.
declare module "*?raw" {
  const content: string;
  export default content;
}
