"use client";

import { useSyncExternalStore } from "react";
import { privacyUpdate } from "./lib/privacy-update";
import styles from "./PrivacyUpdate.module.css";

const listeners = new Set<() => void>();
let dismissedThisVisit = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function isVisible() {
  const now = Date.now();
  if (now < privacyUpdate.bannerStart || now >= privacyUpdate.bannerEnd || dismissedThisVisit) return false;
  try {
    return window.localStorage.getItem(privacyUpdate.dismissKey) !== "1";
  } catch {
    return true;
  }
}

function dismiss() {
  dismissedThisVisit = true;
  try {
    window.localStorage.setItem(privacyUpdate.dismissKey, "1");
  } catch {
    // Storage can be unavailable; the banner still stays hidden for this visit.
  }
  listeners.forEach((listener) => listener());
}

// Dashboard announcement for the privacy update. Shown for seven days after publication
// unless the moderator dismisses it; the dismissal is remembered in this browser.
export function PrivacyUpdateBanner() {
  const visible = useSyncExternalStore(subscribe, isVisible, () => false);
  if (!visible) return null;

  return (
    <aside className={styles.banner} role="region" aria-label="Privacy update">
      <span className={styles.badge}>New · {privacyUpdate.publishedLabel}</span>
      <div className={styles.text}>
        <strong>We&apos;ve rebuilt how Stoatmod handles your members&apos; data.</strong>
        <p>Your server&apos;s moderation now runs on our own AI, with deletion deadlines for everything we keep. Here&apos;s what changed for you and your members, and why we&apos;re asking Stoat for one set of rules for every bot.</p>
      </div>
      <div className={styles.bannerActions}>
        <a className={styles.link} href={privacyUpdate.href} target="_blank" rel="noreferrer">Read the changes <span aria-hidden="true">↗</span></a>
        <a className={styles.secondaryLink} href={privacyUpdate.emailsHref} target="_blank" rel="noreferrer">Read the emails (PDF)</a>
      </div>
      <button type="button" className={styles.dismiss} aria-label="Dismiss this message permanently" title="Don't show this again" onClick={dismiss}>×</button>
    </aside>
  );
}
