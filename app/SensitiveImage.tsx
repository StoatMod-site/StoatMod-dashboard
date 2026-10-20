"use client";

import { useState } from "react";

// Copies of removed images that Stoatmod keeps with a case (see case_images.py). Shown only after a click.
const FLAGGED: Record<string, { label: string; detail: string }> = {
  "flagged-gore.jpg": { label: "Content warning: graphic violence", detail: "A reduced copy of the image Stoatmod removed. Deleted automatically after 30 days." },
  "flagged-nudity-blurred.jpg": { label: "Content warning: explicit nudity", detail: "Permanently blurred; the original image is never kept. Deleted automatically after 30 days." },
};

export const CASE_IMAGE_AUTHOR = "STOATMOD_IMAGE_SCAN";

export function isFlaggedImage(filename: string) {
  return Object.prototype.hasOwnProperty.call(FLAGGED, filename);
}

export function SensitiveImage({ src, filename }: { src: string; filename: string }) {
  const [shown, setShown] = useState(false);
  const info = FLAGGED[filename] ?? { label: "Content warning", detail: "" };
  return <figure className="sensitive-image" data-shown={shown}>
    {shown
      ? <img src={src} alt={info.label}/>
      : <div className="sensitive-image-cover" role="note"><span aria-hidden="true">!</span><strong>{info.label}</strong><small>{info.detail}</small></div>}
    <button type="button" onClick={() => setShown((value) => !value)} aria-pressed={shown}>{shown ? "Hide image" : "Show image"}</button>
  </figure>;
}
