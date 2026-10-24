import { ChevronDown, ChevronRight, Pin as PinIcon, PinOff } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { AssetValueDisplay } from './AssetFields';
import type { AssetFieldState } from './AssetFields';
import { DEMO_CUSTOM_FORM_FIELDS } from './demoCustomFields';

interface PinnedFieldsAccordionProps {
  // Render pinned Hardware Asset field values instead of ticket field values
  assetMode?: boolean;
  assetState?: AssetFieldState;
  pinnedFieldsExpanded: boolean;
  setPinnedFieldsExpanded: (expanded: boolean) => void;
  pinnedFields: string[];
  
  // Field values
  selectedStatus: string;
  selectedPriority: string;
  selectedAssignee: string;
  selectedTechGroup: string;
  selectedUrgency: string;
  selectedImpact: string;
  selectedCategory: string;
  selectedDepartment: string;
  selectedSource: string;
  selectedLocation: string;
  selectedVendor: string;
  selectedSupportLevel: string;
  
  // Helper functions
  getCurrentStatusColor: () => string;
  getCurrentPriorityColor: () => string;
  getCurrentAssigneeColor: () => string;
  getCurrentUrgencyColor: () => string;
  getCurrentImpactColor: () => string;
  
  // Options
  priorityOptions: any[];
  assigneeOptions: any[];
  
  // Toggle function
  togglePinField: (field: string) => void;
}

export function PinnedFieldsAccordion(props: PinnedFieldsAccordionProps) {
  const {
    assetMode = false,
    assetState,
    pinnedFieldsExpanded,
    setPinnedFieldsExpanded,
    pinnedFields,
    selectedStatus,
    selectedPriority,
    selectedAssignee,
    selectedTechGroup,
    selectedUrgency,
    selectedImpact,
    selectedCategory,
    selectedDepartment,
    selectedSource,
    selectedLocation,
    selectedVendor,
    selectedSupportLevel,
    getCurrentStatusColor,
    getCurrentPriorityColor,
    getCurrentAssigneeColor,
    getCurrentUrgencyColor,
    getCurrentImpactColor,
    priorityOptions,
    assigneeOptions,
    togglePinField,
  } = props;

  // If no pinned fields, don't render
  if (pinnedFields.length === 0) {
    return null;
  }

  // Get field value based on field name
  const getFieldValue = (field: string) => {
    switch (field) {
      case 'Status':
        return selectedStatus;
      case 'Priority':
        return selectedPriority;
      case 'Assignee':
        return selectedAssignee;
      case 'Technician Group':
        return selectedTechGroup;
      case 'Urgency':
        return selectedUrgency;
      case 'Impact':
        return selectedImpact;
      case 'Category':
        return selectedCategory;
      case 'Department':
        return selectedDepartment;
      case 'Source':
        return selectedSource;
      case 'Location':
        return selectedLocation;
      case 'Vendor':
        return selectedVendor;
      case 'Support Level':
        return selectedSupportLevel;
      default:
        return '-';
    }
  };

  // Render field value with appropriate icon/indicator
  const renderFieldValue = (field: string) => {
    if (assetMode && assetState) {
      return <AssetValueDisplay field={field} state={assetState} />;
    }

    const value = getFieldValue(field);

    switch (field) {
      case 'Status':
        return (
          <div className="flex items-center gap-2">
            <div 
              className="size-2 rounded-full"
              style={{ backgroundColor: getCurrentStatusColor() }}
            />
            <span className="text-[13px] text-[#364658]">{value}</span>
          </div>
        );
      
      case 'Priority':
        const priorityOption = priorityOptions.find(p => p.label === value);
        return (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: priorityOption?.bars || 0 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[2px] h-2.5 rounded-sm"
                  style={{ backgroundColor: getCurrentPriorityColor() }}
                />
              ))}
            </div>
            <span className="text-[13px] text-[#364658]">{value}</span>
          </div>
        );
      
      case 'Assignee':
        const assigneeOption = assigneeOptions.find(a => a.label === value);
        return (
          <div className="flex items-center gap-2">
            <div 
              className="size-5 rounded flex items-center justify-center text-[10px] font-semibold text-white"
              style={{ backgroundColor: getCurrentAssigneeColor() }}
            >
              {assigneeOption?.initials || 'NA'}
            </div>
            <span className="text-[13px] text-[#364658]">{value}</span>
          </div>
        );
      
      case 'Urgency':
        return (
          <div className="flex items-center gap-2">
            <div 
              className="size-2 rounded-full"
              style={{ backgroundColor: getCurrentUrgencyColor() }}
            />
            <span className="text-[13px] text-[#364658]">{value}</span>
          </div>
        );
      
      case 'Impact':
        return (
          <div className="flex items-center gap-2">
            <div 
              className="size-2 rounded-full"
              style={{ backgroundColor: getCurrentImpactColor() }}
            />
            <span className="text-[13px] text-[#364658]">{value}</span>
          </div>
        );
      
      default: {
        // Known built-in fields (Department/Location/Vendor/etc.) resolve to a
        // real value here — only fall through to the demo custom lookup when the
        // field is otherwise unknown.
        const custom = value === '-' ? DEMO_CUSTOM_FORM_FIELDS.find((f) => f.label === field) : undefined;
        if (custom) {
          return (
            <div className="flex items-center gap-2 min-w-0">
              {custom.color && (
                <div className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: custom.color }} />
              )}
              <span className="text-[13px] text-[#364658] truncate min-w-0" title={custom.value}>{custom.value}</span>
            </div>
          );
        }
        return <span className="text-[13px] text-[#364658]">{value}</span>;
      }
    }
  };

  return (
    <div className="border border-[#DFE5ED] rounded-lg">
      <button
        onClick={() => setPinnedFieldsExpanded(!pinnedFieldsExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-[#F8F9FB] transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <PinIcon size={16} className="text-[#3D8BD0]" />
          <h3 className="text-[13px] font-semibold text-[#364658]">Pinned Fields</h3>
          <span className="text-[11px] text-[#7B8FA5] bg-[#F3F4F6] px-1.5 py-0.5 rounded">
            {pinnedFields.length}
          </span>
        </div>
        {pinnedFieldsExpanded ? (
          <ChevronDown size={16} className="text-[#7B8FA5]" />
        ) : (
          <ChevronRight size={16} className="text-[#7B8FA5]" />
        )}
      </button>

      {pinnedFieldsExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {pinnedFields.map((field) => (
            <div key={field} className="flex items-center justify-between gap-3 group/pinned">
              <div className="text-[12px] text-[#4A5568] flex-shrink-0 w-[120px] flex items-center gap-1">
                <span>{field}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinField(field);
                      }}
                      className="flex items-center opacity-0 group-hover/pinned:opacity-100 transition-opacity"
                    >
                      <PinOff
                        size={14}
                        className="text-[#3D8BD0]"
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Unpin this field
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex-1 min-w-0 py-2 px-3 bg-[#F9FAFB] rounded-md">
                {renderFieldValue(field)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}