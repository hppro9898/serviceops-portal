export const renderCatalogIcon = (iconType: string, size: 'small' | 'medium' | 'large' = 'medium') => {
  const dimensions = {
    small: { macbook: { w: 19, h: 23 }, monitor: { w: 20, h: 17 }, keyboard: { w: 20, h: 20 }, chair: { w: 20, h: 20 }, office: { w: 20, h: 20 }, iphone: { w: 12, h: 20 } },
    medium: { macbook: { w: 23, h: 27 }, monitor: { w: 24, h: 20 }, keyboard: { w: 24, h: 24 }, chair: { w: 24, h: 24 }, office: { w: 24, h: 24 }, iphone: { w: 14, h: 24 } },
    large: { macbook: { w: 34, h: 41 }, monitor: { w: 36, h: 31 }, keyboard: { w: 36, h: 36 }, chair: { w: 36, h: 36 }, office: { w: 36, h: 36 }, iphone: { w: 21, h: 36 } }
  };

  const iconDim = dimensions[size][iconType as keyof typeof dimensions.small] || dimensions[size].macbook;

  if (iconType === 'macbook') {
    return (
      <svg width={iconDim.w} height={iconDim.h} viewBox="0 0 23 27" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath={`url(#clip0_${iconType}_${size})`}>
          <path d="M18.7936 14.3444C18.8324 18.4297 22.4622 19.7901 22.5005 19.8074C22.4699 19.9034 21.9208 21.7447 20.5885 23.6475C19.4368 25.2901 18.2411 26.9326 16.3583 26.965C14.5079 26.9983 13.913 25.8928 11.7975 25.8928C9.68201 25.8928 9.02209 26.9309 7.27166 26.9983C5.45399 27.0653 4.06994 25.2197 2.90873 23.581C0.535885 20.2289 -1.27748 14.1086 1.15744 9.97738C2.36563 7.92589 4.5264 6.6266 6.87382 6.5929C8.65873 6.55963 10.3432 7.76627 11.4346 7.76627C12.526 7.76627 14.5721 6.31494 16.7242 6.52804C17.6251 6.56469 20.154 6.88393 21.7781 9.20665C21.6488 9.28583 18.7609 10.9279 18.7919 14.3449M15.3143 4.31104C16.2794 3.16968 16.929 1.58063 16.7518 0C15.3609 0.0547513 13.679 0.905503 12.6811 2.04644C11.7872 3.05723 11.004 4.67324 11.2156 6.2227C12.7674 6.33978 14.3501 5.45281 15.3148 4.31104" fill="white"/>
        </g>
        <defs>
          <clipPath id={`clip0_${iconType}_${size}`}>
            <rect width="22.5" height="27" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    );
  } else if (iconType === 'monitor') {
    return (
      <svg width={iconDim.w} height={iconDim.h} viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="13" rx="1" stroke="white" strokeWidth="2"/>
        <path d="M8 18H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 15V18" stroke="white" strokeWidth="2"/>
      </svg>
    );
  } else if (iconType === 'keyboard') {
    return (
      <svg width={iconDim.w} height={iconDim.h} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="7" width="18" height="10" rx="1" stroke="white" strokeWidth="2"/>
        <line x1="7" y1="10" x2="7" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="11" y1="10" x2="11" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="15" y1="10" x2="15" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="7" y1="14" x2="7" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="11" y1="14" x2="11" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="15" y1="14" x2="15" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  } else if (iconType === 'chair') {
    return (
      <svg width={iconDim.w} height={iconDim.h} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 16V8C6 6.89543 6.89543 6 8 6H16C17.1046 6 18 6.89543 18 8V16" stroke="white" strokeWidth="2"/>
        <path d="M4 16H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M7 16V20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M17 16V20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  } else if (iconType === 'office') {
    return (
      <svg width={iconDim.w} height={iconDim.h} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="7" height="7" fill="white"/>
        <rect x="13" y="4" width="7" height="7" fill="white"/>
        <rect x="4" y="13" width="7" height="7" fill="white"/>
        <rect x="13" y="13" width="7" height="7" fill="white"/>
      </svg>
    );
  } else if (iconType === 'iphone') {
    return (
      <svg width={iconDim.w} height={iconDim.h} viewBox="0 0 14 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="12" height="22" rx="2" stroke="white" strokeWidth="2"/>
        <circle cx="7" cy="20" r="1" fill="white"/>
      </svg>
    );
  }
  return null;
};

export const getIconBackgroundColor = (iconType: string) => {
  if (iconType === 'macbook' || iconType === 'iphone') return 'bg-[#5A5A5A]';
  if (iconType === 'monitor') return 'bg-[#0076CE]';
  if (iconType === 'keyboard') return 'bg-[#00A4EF]';
  if (iconType === 'chair') return 'bg-[#6B7280]';
  if (iconType === 'office') return 'bg-[#D83B01]';
  return 'bg-[#6B7280]';
};
