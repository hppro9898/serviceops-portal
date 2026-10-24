import { Bold, Italic, Underline, List, ListOrdered, Link2, Image as ImageIcon, Type } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function RichTextEditor({ content, onChange, onSave, onCancel }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: Link2, command: 'createLink', title: 'Insert Link', requiresValue: true },
    { icon: ImageIcon, command: 'insertImage', title: 'Insert Image', requiresValue: true },
    { icon: Type, command: 'removeFormat', title: 'Clear Formatting' },
  ];

  const handleToolbarClick = (button: typeof toolbarButtons[0]) => {
    if (button.requiresValue) {
      const value = prompt(`Enter ${button.title.toLowerCase()}:`);
      if (value) {
        execCommand(button.command, value);
      }
    } else {
      execCommand(button.command);
    }
  };

  return (
    <div className="border border-[#3D8BD0] rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleToolbarClick(button)}
            className="p-1.5 hover:bg-white rounded transition-colors"
            title={button.title}
          >
            <button.icon size={16} className="text-[#364658]" />
          </button>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        className="min-h-[200px] max-h-[400px] overflow-y-auto p-3 text-[13px] text-[#364658] leading-relaxed outline-none"
        style={{
          wordBreak: 'break-word',
        }}
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-[#E5E7EB] bg-[#F9FAFB]">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-[13px] text-[#364658] hover:bg-white rounded transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-3 py-1.5 text-[13px] bg-[#3D8BD0] text-white rounded hover:bg-[#2E7ABF] transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}
