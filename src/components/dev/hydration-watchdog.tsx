"use client";

import { useEffect } from "react";

/** Dev only. Tells the inline watchdog script (below) that React started */
function HydrationFlag() {
  useEffect(() => {
    (window as unknown as { __plHydrated?: boolean }).__plHydrated = true;
    document.getElementById("pl-watchdog")?.remove();
  }, []);
  return null;
}

const WATCHDOG = `
setTimeout(function () {
  if (window.__plHydrated || document.getElementById("pl-watchdog")) return;
  var d = document.createElement("div");
  d.id = "pl-watchdog";
  d.setAttribute("role", "alert");
  d.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;max-width:560px;padding:14px 16px;border-radius:14px;background:#2a0f14;color:#ffd9de;border:1px solid #ff5c70;font:14px/1.5 system-ui,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.5)";
  d.innerHTML = "<b>Paylane dev: scripts did not start.</b><br>The page is showing, but nothing interactive works. Usual causes:<br>1) Open <b>http://localhost:3000</b> (the Local address), not the Network address.<br>2) Stop the server, run <b>npm run dev:clean</b>.<br>3) Press F12, open Console, and read the first red error.";
  document.body.appendChild(d);
}, 7000);
`;

/**
 * Development-only safety net. In production this renders nothing.
 * If React has not started 7 seconds after load, shows a red banner that says why
 */
export function HydrationWatchdog() {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <>
      <HydrationFlag />
      <script dangerouslySetInnerHTML={{ __html: WATCHDOG }} />
    </>
  );
}
