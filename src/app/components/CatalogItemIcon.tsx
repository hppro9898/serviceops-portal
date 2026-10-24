import { renderCatalogIcon, getIconBackgroundColor } from './CatalogIconUtils';

interface CatalogItemIconProps {
  icon: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function CatalogItemIcon({ icon, size = 'small', className = '' }: CatalogItemIconProps) {
  const sizeClasses = {
    small: 'w-[40px] h-[40px]',
    medium: 'w-[72px] h-[72px]',
    large: 'w-[96px] h-[96px]'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-lg flex items-center justify-center flex-shrink-0 ${getIconBackgroundColor(icon)} ${className}`}>
      {renderCatalogIcon(icon, size)}
    </div>
  );
}
