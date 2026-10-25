import { ImageResponse } from "next/og";
import { SITE_TAGLINE } from "@/lib/site";

export const alt = `Paylane — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#0b0d12";
const SURFACE = "#13161d";
const TEXT = "#f2f4f8";
const MUTED = "#8a93a6";
const ACCENT = "#2db7ff";

function Chip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "20px 28px",
        borderRadius: 20,
        background: SURFACE,
        border: `1px solid ${accent ? "rgba(45,183,255,0.45)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <div style={{ display: "flex", fontSize: 22, color: MUTED }}>{label}</div>
      <div
        style={{
          display: "flex",
          fontSize: 40,
          fontWeight: 700,
          color: accent ? ACCENT : TEXT,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          color: TEXT,
          background: `radial-gradient(900px 500px at 85% 110%, rgba(45,183,255,0.22), rgba(11,13,18,0) 70%), ${BG}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", fontSize: 44, fontWeight: 700 }}>
          <span style={{ display: "flex" }}>paylane</span>
          <span style={{ display: "flex", color: ACCENT }}>.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: "-0.04em",
            }}
          >
            Accept cards.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: "-0.04em",
              color: ACCENT,
            }}
          >
            Settle in USDC.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Chip label="Card payment" value="$1,000.00" />
            <div style={{ display: "flex", fontSize: 44, color: MUTED }}>→</div>
            <Chip label="Settled" value="979.00 USDC" accent />
          </div>
          <div style={{ display: "flex", fontSize: 24, color: MUTED }}>
            Demo payment gateway
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
