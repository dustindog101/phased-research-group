/**
 * Vial SVG illustrations — procedural generation
 * Ported from js/app.js vialSVG() and vialThumbSVG()
 * Each product has a capColor that determines the vial cap color.
 */

interface VialSVGProps {
  capColor?: string;
  size?: number;
  className?: string;
}

export function VialSVG({ capColor = "#0d9488", size = 120, className }: VialSVGProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Research peptide vial"
    >
      {/* Cap */}
      <rect x="42" y="8" width="36" height="20" rx="3" fill={capColor} />
      <rect x="42" y="8" width="36" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
      {/* Neck */}
      <rect x="46" y="28" width="28" height="8" fill="#cbd5e1" />
      {/* Body */}
      <rect x="30" y="36" width="60" height="110" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Liquid */}
      <rect x="34" y="80" width="52" height="62" rx="3" fill={`${capColor}33`} />
      <rect x="34" y="80" width="52" height="6" fill={capColor} opacity="0.6" />
      {/* Label */}
      <rect x="34" y="50" width="52" height="22" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <rect x="38" y="55" width="32" height="3" rx="1" fill="#0f172a" />
      <rect x="38" y="62" width="20" height="2" rx="1" fill="#64748b" />
      <rect x="38" y="66" width="24" height="2" rx="1" fill="#94a3b8" />
      {/* Highlight */}
      <rect x="34" y="40" width="3" height="100" rx="1.5" fill="rgba(255,255,255,0.6)" />
    </svg>
  );
}

export function VialThumb({ capColor = "#0d9488", size = 40 }: VialSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="42" y="8" width="36" height="20" rx="3" fill={capColor} />
      <rect x="46" y="28" width="28" height="8" fill="#cbd5e1" />
      <rect x="30" y="36" width="60" height="110" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
      <rect x="34" y="80" width="52" height="62" rx="3" fill={`${capColor}33`} />
      <rect x="34" y="50" width="52" height="22" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  );
}
