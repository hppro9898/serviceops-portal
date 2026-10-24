// Placeholder - Service Catalog functionality temporarily disabled to reduce bundle size
// This will be properly implemented in a future update

export interface CatalogItem {
  id: string | number;
  name: string;
  description?: string;
  price: string;
  category: string;
  icon: string;
  iconColor: string;
  quantity: number;
  configuration?: {
    [key: string]: string;
  };
}

interface ServiceCatalogPopupProps {
  onClose: () => void;
  onAddItem: (item: CatalogItem) => void;
}

export function ServiceCatalogPopup({ onClose, onAddItem }: ServiceCatalogPopupProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md">
        <h2 className="text-lg font-semibold text-[#364658] mb-4">Service Catalog</h2>
        <p className="text-sm text-[#7B8FA5] mb-4">
          Service catalog functionality is being optimized. Please use the main ticket management features.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#3D8BD0] text-white rounded hover:bg-[#2F7AB8] text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}
