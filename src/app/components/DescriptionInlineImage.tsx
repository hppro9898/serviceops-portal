// A self-contained image rendered directly inside a description body. It
// simulates content (rich text + an embedded image) that a user pasted from a
// Word document — shown as a live, inline preview rather than as a downloadable
// attachment chip. The graphic is a pure inline SVG so it always renders with
// no network request or external asset, and it is wrapped in <span> elements
// (phrasing content) so it remains valid inside the description <p>.
export function DescriptionInlineImage({ caption }: { caption?: string }) {
  return (
    <span className="block my-4 max-w-[600px]">
      <span className="block rounded-lg border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
        <svg
          viewBox="0 0 600 250"
          className="block w-full h-auto"
          role="img"
          aria-label="Network connectivity diagnostics diagram"
        >
          <rect x="0" y="0" width="600" height="250" fill="#FFFFFF" />

          {/* Title */}
          <text x="20" y="30" fontSize="15" fontWeight="700" fill="#1E293B">
            Network Connectivity Diagnostics
          </text>
          <text x="20" y="49" fontSize="11" fill="#94A3B8">
            Captured from network-diagnosis.pdf · 02 Mar 2025, 09:14 AM
          </text>
          <line x1="20" y1="62" x2="580" y2="62" stroke="#EEF2F6" strokeWidth="1" />

          {/* Connector lines between the nodes */}
          <line x1="120" y1="150" x2="164" y2="150" stroke="#3D8BD0" strokeWidth="2.5" />
          <line x1="268" y1="150" x2="312" y2="150" stroke="#3D8BD0" strokeWidth="2.5" />
          <line x1="416" y1="150" x2="460" y2="150" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="5 4" />

          {/* Node cards */}
          <rect x="16" y="114" width="104" height="72" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />
          <rect x="164" y="114" width="104" height="72" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />
          <rect x="312" y="114" width="104" height="72" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />
          <rect x="460" y="114" width="104" height="72" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />

          {/* Laptop (node 1, cx 68) */}
          <rect x="53" y="124" width="30" height="19" rx="2" fill="none" stroke="#3D8BD0" strokeWidth="2" />
          <path d="M48 147 H88 l-2 3 H50 Z" fill="#3D8BD0" />

          {/* Wi-Fi access point (node 2, cx 216) */}
          <circle cx="216" cy="145" r="2.4" fill="#3D8BD0" />
          <path d="M210 141 q6 -6 12 0" fill="none" stroke="#3D8BD0" strokeWidth="2" strokeLinecap="round" />
          <path d="M206 137 q10 -10 20 0" fill="none" stroke="#3D8BD0" strokeWidth="2" strokeLinecap="round" />
          <path d="M202 133 q14 -14 28 0" fill="none" stroke="#3D8BD0" strokeWidth="2" strokeLinecap="round" />

          {/* Gateway / router (node 3, cx 364) */}
          <rect x="346" y="131" width="36" height="15" rx="3" fill="none" stroke="#3D8BD0" strokeWidth="2" />
          <circle cx="353" cy="138.5" r="1.6" fill="#3D8BD0" />
          <circle cx="359" cy="138.5" r="1.6" fill="#3D8BD0" />
          <path d="M376 131 l3 -7 M370 131 l-1 -6" fill="none" stroke="#3D8BD0" strokeWidth="2" strokeLinecap="round" />

          {/* Internet / globe (node 4, cx 512) — unreachable, drawn in gray */}
          <circle cx="512" cy="138" r="12" fill="none" stroke="#94A3B8" strokeWidth="2" />
          <ellipse cx="512" cy="138" rx="5" ry="12" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="500" y1="138" x2="524" y2="138" stroke="#94A3B8" strokeWidth="1.5" />

          {/* Broken-link marker on the failing hop */}
          <circle cx="438" cy="150" r="10" fill="#FEE2E2" />
          <path d="M434 146 l8 8 M442 146 l-8 8" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />

          {/* Node labels */}
          <text x="68" y="176" textAnchor="middle" fontSize="12" fontWeight="600" fill="#475569">Laptop</text>
          <text x="216" y="176" textAnchor="middle" fontSize="12" fontWeight="600" fill="#475569">Wi-Fi AP</text>
          <text x="364" y="176" textAnchor="middle" fontSize="12" fontWeight="600" fill="#475569">Gateway</text>
          <text x="512" y="176" textAnchor="middle" fontSize="12" fontWeight="600" fill="#94A3B8">Internet</text>

          {/* Status pill */}
          <rect x="150" y="206" width="300" height="28" rx="14" fill="#FEF2F2" stroke="#FECACA" />
          <text x="300" y="224" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#DC2626">
            Link down: Gateway → ISP · 100% packet loss
          </text>
        </svg>
      </span>
      <span className="block text-[12px] text-[#94A3B8] mt-1.5 italic">
        {caption ?? 'Figure 1 — Network connectivity path captured during diagnostics (pasted from the report).'}
      </span>
    </span>
  );
}
