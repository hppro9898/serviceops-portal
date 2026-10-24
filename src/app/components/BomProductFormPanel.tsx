import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { X, Check } from 'lucide-react';
import { DEFAULT_EXCLUDE_PATHS } from './bomData';
import type { BomProduct } from './bomData';

/* Add / edit one scan scope on a host. Opened from the Manage products drawer, and stacked on
 * top of it — the two form one flow, so this sits at a higher z-index rather than replacing it. */

export interface ProductFormValue {
  key: string;
  name: string;
  version: string;
  path: string;
  excludePaths: string[];
}

interface BomProductFormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Product being edited, or null when adding a new one. */
  editing: BomProduct | null;
  onSave: (v: ProductFormValue) => void;
}

export function BomProductFormPanel({ isOpen, onClose, editing, onSave }: BomProductFormPanelProps) {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [path, setPath] = useState('');
  const [excludes, setExcludes] = useState('');
  // The standard exclusions live as removable chips, separate from what the admin types.
  const [defaultPaths, setDefaultPaths] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  const excludeRef = useRef<HTMLTextAreaElement>(null);
  const useDefaults = defaultPaths.length > 0;

  // Grow the textarea to its content — measured before paint so it never flashes at one row.
  useLayoutEffect(() => {
    const el = excludeRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 56)}px`;
  }, [excludes, isOpen]);

  // Seed from the product being edited each time the form opens.
  useEffect(() => {
    if (!isOpen) return;
    setName(editing?.name ?? '');
    setVersion(editing?.version ?? '');
    setPath(editing?.path ?? '');
    // Split what is already saved: anything matching the standard set comes back as chips, the
    // rest as typed text — so re-opening a product looks the way it was left.
    const saved = editing?.excludePaths ?? [];
    setDefaultPaths(DEFAULT_EXCLUDE_PATHS.filter((p) => saved.includes(p)));
    setExcludes(saved.filter((p) => !DEFAULT_EXCLUDE_PATHS.includes(p)).join(', '));
    setTouched(false);
  }, [isOpen, editing]);

  if (!isOpen) return null;

  const nameError = touched && !name.trim();
  const pathError = touched && !path.trim();
  const valid = !!name.trim() && !!path.trim();

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    onSave({
      key: editing?.key ?? name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: name.trim(),
      version: version.trim(),
      path: path.trim(),
      // Typed globs and the default chips are one list once saved; dedupe so a path the admin
      // also typed by hand does not appear twice.
      excludePaths: Array.from(new Set([
        ...excludes.split(',').map((s) => s.trim()).filter(Boolean),
        ...defaultPaths,
      ])),
    });
  };

  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label className="mb-1.5 block text-[13px] font-medium text-[#364658]">
      {children}{required && <span className="ml-0.5 text-[#DC2626]">*</span>}
    </label>
  );
  const field = (err: boolean) =>
    `h-9 w-full rounded border bg-white px-3 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 ${
      err ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#d1d5db] focus:border-[#3D8BD0] focus:ring-[#3D8BD0]'
    }`;

  return (
    // Sits above the Manage products drawer (z-[10000] vs its z-[9999]).
    <div className="fixed inset-0 z-[10000] flex items-center justify-end bg-black/40">
      <div className="flex h-full w-[560px] max-w-[95vw] flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <h3 className="text-[16px] font-semibold text-[#364658]">{editing ? 'Edit product' : 'Add product'}</h3>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="mb-4">
            <Label required>Product name</Label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Payments Web"
              className={field(nameError)}
            />
            {nameError && <p className="mt-1 text-[12px] text-[#DC2626]">Product name is required.</p>}
          </div>

          <div className="mb-4">
            <Label>Version</Label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Version"
              className={field(false)}
            />
          </div>

          <div className="mb-4">
            <Label required>Path</Label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="e.g. C:\Program Files\Payments   or   /opt/payments"
              className={`${field(pathError)} font-mono placeholder:font-mono`}
            />
            {pathError && <p className="mt-1 text-[12px] text-[#DC2626]">Path is required — it is what the scan walks.</p>}
          </div>

          <div className="mb-5">
            <Label>Exclude paths — this product only</Label>
            {/* Auto-growing: a scan config can accumulate a lot of globs, and a one-line input
                hides everything but the last few. */}
            <textarea
              ref={excludeRef}
              value={excludes}
              onChange={(e) => setExcludes(e.target.value)}
              rows={2}
              placeholder="Exclude here (optional, comma-sep)"
              className="w-full resize-none overflow-hidden rounded border border-[#d1d5db] bg-white px-3 py-2 font-mono text-[13px] leading-[1.6] text-[#364658] placeholder:font-mono placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]"
            />
            <p className="mt-1.5 text-[12px] text-[#7B8FA5]">
              Scoped to this product — these globs are skipped only under the path above.
            </p>

            {/* Opt into the standard exclusions rather than retyping them every time */}
            <label className="mt-3 flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={useDefaults}
                onChange={(e) => setDefaultPaths(e.target.checked ? DEFAULT_EXCLUDE_PATHS : [])}
                className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
              />
              <span className="min-w-0">
                <span className="block text-[13px] text-[#364658]">Add the default exclude paths</span>
                <span className="mt-0.5 block text-[12px] text-[#7B8FA5]">
                  Logs, caches, temp files and other runtime noise that never belongs in a BOM.
                </span>
              </span>
            </label>

            {defaultPaths.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {defaultPaths.map((p) => (
                  <span
                    key={p}
                    className="group inline-flex items-center gap-1 rounded-sm border border-[#E5E7EB] bg-[#F1F5F9] py-0.5 pl-1.5 pr-1 font-mono text-[11px] text-[#475467]"
                  >
                    {p}
                    <button
                      onClick={() => setDefaultPaths((prev) => prev.filter((x) => x !== p))}
                      title={`Remove ${p}`}
                      className="text-[#9CA3AF] opacity-0 transition-opacity hover:text-[#DC2626] group-hover:opacity-100"
                    ><X size={11} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#DFE5ED] px-5 py-3">
          <button onClick={onClose} className="inline-flex h-8 items-center rounded border border-[#DFE5ED] bg-white px-4 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]">
            Cancel
          </button>
          <button
            onClick={submit}
            className="inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#3479b5]"
          >
            <Check size={15} /> {editing ? 'Update product' : 'Add product'}
          </button>
        </div>
      </div>
    </div>
  );
}
