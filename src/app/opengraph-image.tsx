import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Phase Research Group — Premium Research Peptides";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#070A11",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Background glow top right */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-150px",
            width: "650px",
            height: "650px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(2, 132, 199, 0.35) 0%, rgba(15, 23, 42, 0) 70%)",
          }}
        />
        {/* Background glow bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-150px",
            width: "650px",
            height: "650px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(13, 148, 136, 0.30) 0%, rgba(15, 23, 42, 0) 70%)",
          }}
        />

        {/* Card Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "1080px",
            height: "520px",
            padding: "45px 50px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.78) 100%)",
            border: "1.5px solid rgba(56, 189, 248, 0.35)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #0284C7 0%, #0D9488 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: "26px",
                  letterSpacing: "1px",
                  boxShadow: "0 10px 20px rgba(2, 132, 199, 0.4)",
                }}
              >
                PR
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    color: "#FFFFFF",
                    fontSize: "30px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  Phase Research
                </span>
                <span
                  style={{
                    color: "#94A3B8",
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "5px",
                    textTransform: "uppercase",
                  }}
                >
                  Group
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 20px",
                borderRadius: "20px",
                backgroundColor: "#0F172A",
                border: "1px solid rgba(2, 132, 199, 0.5)",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                }}
              />
              <span
                style={{
                  color: "#38BDF8",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "1.5px",
                }}
              >
                3RD-PARTY LAB TESTED
              </span>
            </div>
          </div>

          {/* Main Text Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span
              style={{
                color: "#2DD4BF",
                fontSize: "15px",
                fontWeight: 600,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Laboratory Research Supplies
            </span>
            <span
              style={{
                color: "#FFFFFF",
                fontSize: "44px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                lineHeight: 1.1,
              }}
            >
              Premium Research Peptides
            </span>
            <span
              style={{
                color: "#94A3B8",
                fontSize: "20px",
                fontWeight: 400,
                lineHeight: 1.4,
              }}
            >
              High-purity peptides for qualified research. 3rd-party lab verified with Certificates of Analysis (COA) for every batch.
            </span>
          </div>

          {/* Footer Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingTop: "20px",
              borderTop: "1px solid rgba(51, 65, 85, 0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span
                style={{
                  color: "#38BDF8",
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                phaseresearch.org
              </span>
              <span style={{ color: "#64748B", fontSize: "16px" }}>•</span>
              <span style={{ color: "#94A3B8", fontSize: "16px", fontWeight: 500 }}>
                dev.phaseresearch.org
              </span>
            </div>
            <span style={{ color: "#64748B", fontSize: "14px" }}>
              Lawful Laboratory Use Only
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
