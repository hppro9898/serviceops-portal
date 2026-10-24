import React from 'react';
import { X, ChevronDown, Check, Plus, Minus } from 'lucide-react';

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  icon: string;
}

interface CatalogItemDetailsModalProps {
  selectedCatalogItem: CatalogItem;
  onClose: () => void;
  processorDropdownRef: React.RefObject<HTMLDivElement>;
  ramDropdownRef: React.RefObject<HTMLDivElement>;
  storageDropdownRef: React.RefObject<HTMLDivElement>;
  displayDropdownRef: React.RefObject<HTMLDivElement>;
  graphicsDropdownRef: React.RefObject<HTMLDivElement>;
  colorDropdownRef: React.RefObject<HTMLDivElement>;
  showProcessorDropdown: boolean;
  setShowProcessorDropdown: (show: boolean) => void;
  showRAMDropdown: boolean;
  setShowRAMDropdown: (show: boolean) => void;
  showStorageDropdown: boolean;
  setShowStorageDropdown: (show: boolean) => void;
  showDisplayDropdown: boolean;
  setShowDisplayDropdown: (show: boolean) => void;
  showGraphicsDropdown: boolean;
  setShowGraphicsDropdown: (show: boolean) => void;
  showColorDropdown: boolean;
  setShowColorDropdown: (show: boolean) => void;
  selectedProcessor: string;
  setSelectedProcessor: (value: string) => void;
  selectedRAM: string;
  setSelectedRAM: (value: string) => void;
  selectedStorage: string;
  setSelectedStorage: (value: string) => void;
  selectedDisplay: string;
  setSelectedDisplay: (value: string) => void;
  selectedGraphics: string;
  setSelectedGraphics: (value: string) => void;
  selectedColor: string;
  setSelectedColor: (value: string) => void;
  catalogItemQuantity: number;
  setCatalogItemQuantity: (quantity: number) => void;
  onAddToRequest: () => void;
}

export const CatalogItemDetailsModal: React.FC<CatalogItemDetailsModalProps> = ({
  selectedCatalogItem,
  onClose,
  processorDropdownRef,
  ramDropdownRef,
  storageDropdownRef,
  displayDropdownRef,
  graphicsDropdownRef,
  colorDropdownRef,
  showProcessorDropdown,
  setShowProcessorDropdown,
  showRAMDropdown,
  setShowRAMDropdown,
  showStorageDropdown,
  setShowStorageDropdown,
  showDisplayDropdown,
  setShowDisplayDropdown,
  showGraphicsDropdown,
  setShowGraphicsDropdown,
  showColorDropdown,
  setShowColorDropdown,
  selectedProcessor,
  setSelectedProcessor,
  selectedRAM,
  setSelectedRAM,
  selectedStorage,
  setSelectedStorage,
  selectedDisplay,
  setSelectedDisplay,
  selectedGraphics,
  setSelectedGraphics,
  selectedColor,
  setSelectedColor,
  catalogItemQuantity,
  setCatalogItemQuantity,
  onAddToRequest
}) => {
  const renderIcon = () => {
    switch (selectedCatalogItem.icon) {
      case 'macbook':
        return (
          <svg width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">
            <rect x=\"2\" y=\"4\" width=\"20\" height=\"14\" rx=\"1\" stroke=\"white\" strokeWidth=\"2\"/>
            <path d=\"M1 17H23V18.5C23 19.3284 22.3284 20 21.5 20H2.5C1.67157 20 1 19.3284 1 18.5V17Z\" stroke=\"white\" strokeWidth=\"2\"/>
          </svg>
        );
      case 'monitor':
        return (
          <svg width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">
            <rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\" stroke=\"white\" strokeWidth=\"2\"/>
            <path d=\"M8 21H16\" stroke=\"white\" strokeWidth=\"2\" strokeLinecap=\"round\"/>
            <path d=\"M12 17V21\" stroke=\"white\" strokeWidth=\"2\" strokeLinecap=\"round\"/>
          </svg>
        );
      case 'keyboard':
        return (
          <svg width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">
            <rect x=\"3\" y=\"7\" width=\"18\" height=\"10\" rx=\"2\" stroke=\"white\" strokeWidth=\"2\"/>
            <path d=\"M7 14H17\" stroke=\"white\" strokeWidth=\"2\" strokeLinecap=\"round\"/>
            <circle cx=\"7\" cy=\"11\" r=\"0.5\" fill=\"white\"/>
            <circle cx=\"10\" cy=\"11\" r=\"0.5\" fill=\"white\"/>
            <circle cx=\"14\" cy=\"11\" r=\"0.5\" fill=\"white\"/>
            <circle cx=\"17\" cy=\"11\" r=\"0.5\" fill=\"white\"/>
          </svg>
        );
      case 'chair':
        return (
          <svg width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">
            <path d=\"M6 16V8C6 6.89543 6.89543 6 8 6H16C17.1046 6 18 6.89543 18 8V16\" stroke=\"white\" strokeWidth=\"2\"/>
            <path d=\"M4 16H20\" stroke=\"white\" strokeWidth=\"2\" strokeLinecap=\"round\"/>
            <path d=\"M7 16V20\" stroke=\"white\" strokeWidth=\"2\" strokeLinecap=\"round\"/>
            <path d=\"M17 16V20\" stroke=\"white\" strokeWidth=\"2\" strokeLinecap=\"round\"/>
          </svg>
        );
      case 'office':
        return (
          <svg width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">
            <rect x=\"4\" y=\"4\" width=\"7\" height=\"7\" fill=\"white\"/>
            <rect x=\"13\" y=\"4\" width=\"7\" height=\"7\" fill=\"white\"/>
            <rect x=\"4\" y=\"13\" width=\"7\" height=\"7\" fill=\"white\"/>
            <rect x=\"13\" y=\"13\" width=\"7\" height=\"7\" fill=\"white\"/>
          </svg>
        );
      case 'iphone':
        return (
          <svg width=\"22\" height=\"36\" viewBox=\"0 0 14 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">
            <rect x=\"1\" y=\"1\" width=\"12\" height=\"22\" rx=\"2\" stroke=\"white\" strokeWidth=\"2\"/>
            <circle cx=\"7\" cy=\"20\" r=\"1\" fill=\"white\"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const DropdownField = ({ 
    label, 
    value, 
    options, 
    showDropdown, 
    setShowDropdown, 
    setValue, 
    dropdownRef 
  }: { 
    label: string; 
    value: string; 
    options: string[]; 
    showDropdown: boolean; 
    setShowDropdown: (show: boolean) => void; 
    setValue: (value: string) => void; 
    dropdownRef: React.RefObject<HTMLDivElement>; 
  }) => (
    <div>
      <label className=\"text-[12px] text-[#7B8FA5] mb-1 block\">{label}</label>
      <div className=\"relative\" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className=\"w-full flex items-center justify-between px-3 py-2 text-[13px] text-[#364658] font-medium border border-[#E5E7EB] rounded hover:border-[#3D8BD0] transition-colors\"
        >
          <span>{value}</span>
          <ChevronDown className={`size-4 text-[#6B7280] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>
        {showDropdown && (
          <div className=\"absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg overflow-hidden z-[120]\"  style={{maxHeight: '200px', overflowY: 'auto'}}>
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setValue(option);
                  setShowDropdown(false);
                }}
                className=\"w-full flex items-center justify-between px-3 py-2 text-[13px] text-[#364658] hover:bg-[#F3F4F6] transition-colors text-left\"
              >
                <span className={value === option ? 'font-semibold' : 'font-normal'}>{option}</span>
                {value === option && <Check className=\"size-4 text-[#3D8BD0]\" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const getIconBgColor = () => {
    if (selectedCatalogItem.icon === 'macbook' || selectedCatalogItem.icon === 'iphone') return 'bg-[#5A5A5A]';
    if (selectedCatalogItem.icon === 'monitor') return 'bg-[#0076CE]';
    if (selectedCatalogItem.icon === 'keyboard') return 'bg-[#00A4EF]';
    if (selectedCatalogItem.icon === 'chair') return 'bg-[#6B7280]';
    if (selectedCatalogItem.icon === 'office') return 'bg-[#D83B01]';
    return 'bg-[#6B7280]';
  };

  return (
    <div className=\"fixed inset-0 z-[100] flex items-center justify-center bg-black/50\">
      <div className=\"bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl\">
        {/* Header */}
        <div className=\"flex items-center justify-between p-6 border-b border-[#EAECEF]\">
          <h2 className=\"text-[18px] font-semibold text-[#364658]\">Item Details</h2>
          <button onClick={onClose} className=\"p-1 hover:bg-[#F3F4F6] rounded transition-colors\">
            <X className=\"size-5 text-[#6B7280]\" />
          </button>
        </div>

        {/* Content */}
        <div className=\"flex-1 overflow-y-auto p-6\">
          {/* Product Overview */}
          <div className=\"flex gap-6 mb-6\">
            {/* Icon */}
            <div className=\"flex-shrink-0\">
              <div className={`w-[100px] h-[100px] rounded-lg flex items-center justify-center ${getIconBgColor()}`}>
                {renderIcon()}
              </div>
            </div>

            {/* Product Details */}
            <div className=\"flex-1\">
              <div className=\"flex items-start justify-between mb-2\">
                <div>
                  <h3 className=\"font-semibold text-[#364658] mb-1 text-[16px]\">{selectedCatalogItem.name}</h3>
                  <p className=\"text-[13px] text-[#7B8FA5]\">{selectedCatalogItem.category}</p>
                </div>
                <span className=\"font-bold text-[#3D8BD0] text-[16px]\">{selectedCatalogItem.price}</span>
              </div>
              <p className=\"text-[14px] text-[#364658] leading-relaxed\">
                {selectedCatalogItem.description}
              </p>
            </div>
          </div>

          {/* Description and Configuration */}
          <div className=\"mb-6\">
            <h4 className=\"text-[14px] font-semibold text-[#364658] mb-3\">Description</h4>
            <p className=\"text-[#364658] leading-relaxed mb-6 text-[14px]\">
              High-performance laptop designed for professionals. Features the latest Apple M-series chip, stunning Retina display, and all-day battery life. Perfect for development, design, and creative work.
            </p>

            <h4 className=\"text-[14px] font-semibold text-[#364658] mb-3\">Laptop Configuration</h4>
            <div className=\"grid grid-cols-2 gap-4\">
              <DropdownField
                label=\"Processor\"
                value={selectedProcessor}
                options={['Apple M3', 'Apple M3 Pro', 'Apple M3 Max', 'Intel Core i7', 'Intel Core i9']}
                showDropdown={showProcessorDropdown}
                setShowDropdown={setShowProcessorDropdown}
                setValue={setSelectedProcessor}
                dropdownRef={processorDropdownRef}
              />
              <DropdownField
                label=\"RAM\"
                value={selectedRAM}
                options={['8 GB', '16 GB', '32 GB', '64 GB']}
                showDropdown={showRAMDropdown}
                setShowDropdown={setShowRAMDropdown}
                setValue={setSelectedRAM}
                dropdownRef={ramDropdownRef}
              />
              <DropdownField
                label=\"Storage\"
                value={selectedStorage}
                options={['256 GB SSD', '512 GB SSD', '1 TB SSD', '2 TB SSD']}
                showDropdown={showStorageDropdown}
                setShowDropdown={setShowStorageDropdown}
                setValue={setSelectedStorage}
                dropdownRef={storageDropdownRef}
              />
              <DropdownField
                label=\"Display\"
                value={selectedDisplay}
                options={['13\" Retina', '14\" Retina', '15\" Retina', '16\" Retina']}
                showDropdown={showDisplayDropdown}
                setShowDropdown={setShowDisplayDropdown}
                setValue={setSelectedDisplay}
                dropdownRef={displayDropdownRef}
              />
              <DropdownField
                label=\"Graphics\"
                value={selectedGraphics}
                options={['Integrated GPU', 'NVIDIA RTX 3060', 'NVIDIA RTX 4070', 'AMD Radeon Pro']}
                showDropdown={showGraphicsDropdown}
                setShowDropdown={setShowGraphicsDropdown}
                setValue={setSelectedGraphics}
                dropdownRef={graphicsDropdownRef}
              />
              <DropdownField
                label=\"Color\"
                value={selectedColor}
                options={['Space Gray', 'Silver', 'Midnight', 'Starlight']}
                showDropdown={showColorDropdown}
                setShowDropdown={setShowColorDropdown}
                setValue={setSelectedColor}
                dropdownRef={colorDropdownRef}
              />
            </div>
          </div>

          {/* Quantity Selection */}
          <div className=\"mb-4\">
            <label className=\"text-[12px] text-[#7B8FA5] mb-2 block\">Quantity</label>
            <div className=\"flex items-center gap-3\">
              <button
                onClick={() => catalogItemQuantity > 1 && setCatalogItemQuantity(catalogItemQuantity - 1)}
                className=\"p-2 border border-[#E5E7EB] rounded hover:bg-[#F3F4F6] transition-colors disabled:opacity-50\"
                disabled={catalogItemQuantity <= 1}
              >
                <Minus className=\"size-4 text-[#6B7280]\" />
              </button>
              <input
                type=\"number\"
                value={catalogItemQuantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setCatalogItemQuantity(Math.max(1, value));
                }}
                className=\"w-20 text-center px-3 py-2 border border-[#E5E7EB] rounded text-[13px] text-[#364658] focus:outline-none focus:border-[#3D8BD0] focus:ring-1 focus:ring-[#3D8BD0]\"
              />
              <button
                onClick={() => setCatalogItemQuantity(catalogItemQuantity + 1)}
                className=\"p-2 border border-[#E5E7EB] rounded hover:bg-[#F3F4F6] transition-colors\"
              >
                <Plus className=\"size-4 text-[#6B7280]\" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className=\"flex items-center justify-between p-6 border-t border-[#EAECEF]\">
          <div>
            <p className=\"text-[13px] text-[#7B8FA5] mb-1\">Total</p>
            <p className=\"text-[18px] font-bold text-[#3D8BD0]\">{selectedCatalogItem.price}</p>
          </div>
          <div className=\"flex gap-3\">
            <button onClick={onClose} className=\"px-4 py-2 text-[13px] font-medium text-[#6B7280] hover:text-[#364658] hover:bg-[#F3F4F6] rounded transition-colors\">
              Cancel
            </button>
            <button onClick={onAddToRequest} className=\"px-4 py-2 text-[13px] font-medium text-white bg-[#3D8BD0] hover:bg-[#2E6FA0] rounded transition-colors\">
              Add to Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
