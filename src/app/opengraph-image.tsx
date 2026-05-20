import { ImageResponse } from "next/og";

export const alt = "AR-TRANS вантажні перевезення Україна та Європа";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0b111a 0%, #172033 56%, #0b111a 100%)",
          color: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter, Arial, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          overflow: "hidden",
          padding: 64,
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "rgba(59, 130, 246, .22)",
            borderRadius: 520,
            height: 520,
            position: "absolute",
            right: -120,
            top: -160,
            width: 520,
          }}
        />
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 22,
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "#123f90",
              border: "4px solid rgba(255, 211, 77, .78)",
              borderRadius: 24,
              color: "#ffd34d",
              display: "flex",
              fontSize: 44,
              fontWeight: 900,
              height: 92,
              justifyContent: "center",
              width: 156,
            }}
          >
            AR
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 44, fontWeight: 900 }}>AR-TRANS</div>
            <div style={{ color: "#cbd5e1", fontSize: 20, fontWeight: 700 }}>transport company</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 760 }}>
          <div style={{ color: "#ffd34d", fontSize: 24, fontWeight: 900, letterSpacing: 2 }}>
            УКРАЇНА • ЄВРОПА • 24/7
          </div>
          <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.02 }}>
            Вантажні та рефрижераторні перевезення для бізнесу
          </div>
          <div style={{ color: "#cbd5e1", fontSize: 28, lineHeight: 1.35 }}>
            Контроль маршруту, термінів, температури і безпеки вантажу.
          </div>
        </div>
        <div
          style={{
            alignItems: "flex-end",
            display: "flex",
            height: 142,
            justifyContent: "flex-end",
            position: "absolute",
            right: 60,
            bottom: 58,
            width: 520,
          }}
        >
          <div style={{ background: "#d62828", borderRadius: "34px 22px 10px 10px", height: 92, width: 156 }} />
          <div style={{ background: "#f8fafc", borderRadius: "16px 16px 8px 8px", height: 110, width: 310 }} />
          <div style={{ background: "#0f172a", borderRadius: 999, height: 58, marginLeft: -386, width: 58 }} />
          <div style={{ background: "#0f172a", borderRadius: 999, height: 58, marginLeft: 264, width: 58 }} />
        </div>
      </div>
    ),
    size,
  );
}
