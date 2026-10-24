import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, ChevronsUpDown, ChevronsDownUp, Search, X, ShieldAlert, Unlink, GitCompare, Check, Boxes, Package } from 'lucide-react';
import type { DepGraph, DepNode } from './bomData';

/* The dependency view.
 *
 * A flat component list says WHAT is installed. It cannot say why — and "why" decides the fix:
 * a vulnerable library you declared yourself is a version bump; the same library four levels
 * down is someone else's release you wait for or override. The tree exists to separate those
 * two cases, so everything here is bent toward that question rather than toward rendering a
 * graph faithfully.
 *
 * What makes a tree unreadable at 250+ nodes is not the node count. It is asking the eye to do
 * two jobs it is bad at: measuring whitespace to judge depth, and guessing which rows are
 * pressable. So depth is DRAWN — every child list carries a guide rail and an open branch tints
 * its own container — and clickability is drawn too: a row that opens has a fill and a border at
 * rest, a leaf has neither. Neither fact should require a hover to discover.
 *
 * Two more decisions carry the rest:
 *   · search AUTO-EXPANDS to its matches and prunes everything else — a match you cannot see is
 *     the same as no match, and in a 7-hop tree highlight-only search finds nothing;
 *   · shared components expand once and are referenced afterwards, so a diamond in the graph
 *     cannot multiply into a tree bigger than the estate.
 */

const INDENT = 18;        // px of indent per level
/* Row height, 15% up from the 32px the rows started at (32 -> 35 -> 37). Everything in a layer
   list is one row tall, so this is the single number that sets the density of the whole view. */
const ROW_H = 37;
/* And a gap between TOP-LEVEL rows only, so one parent's subtree reads as separate from the
   next. Deeper rows stay flush: a gap at every level would break the column the indentation
   draws, which is the thing holding the hierarchy together. */
const PARENT_GAP = 5;
const DIRECT_PAGE = 25;   // direct dependencies rendered before the "show more" tail
/* Rows materialised per pass. Expand-all on a big product is hundreds of edges; painting them in
   one frame is the jank this budget exists to prevent. The tail loads as it scrolls into view. */
const ROW_PAGE = 200;

/** The change cuts, in the order the panel's own tabs use them. */
const CHANGES = ['Added', 'Updated', 'Removed', 'Unchanged'] as const;
type Change = (typeof CHANGES)[number];

interface Props {
  graph: DepGraph;
  /** Opens the component list filtered to one name — the tree hands off rather than duplicating. */
  onInspect?: (name: string) => void;
  /** What this version did to a build, supplied by the panel so the two agree. Without it the
   *  change filter is simply not offered rather than being offered against nothing. */
  changeOf?: (name: string, version?: string) => string;
}

/** One node as it is actually shown: after the search, the filter and the render budget. */
interface VisNode {
  id: string;
  node: DepNode;
  depth: number;
  parentId: string | null;
  children: VisNode[];
  expandable: boolean;
  open: boolean;
  /** Direct children in the GRAPH — the "3 deps" pill. Not `children.length`, which is what
   *  survived the current filter. */
  deps: number;
  /** This node's own name/PURL matched the search — distinct from merely being on the path. */
  hit: boolean;
}

/** Nodes whose subtree (or self) satisfies a predicate. One pass, so the recursive test does not
 *  get re-run per node while the tree is being built. */
function collectSubtrees(tree: DepNode[], test: (n: DepNode) => boolean): Set<DepNode> {
  const out = new Set<DepNode>();
  const walk = (n: DepNode): boolean => {
    let any = test(n);
    n.children.forEach((c) => { if (walk(c)) any = true; });
    if (any) out.add(n);
    return any;
  };
  tree.forEach(walk);
  return out;
}

/** The matched run, marked in place. No background swatch — the row is small enough that weight
 *  and colour carry it, and a marker would fight the row's own hover state. */
function Mark({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="font-semibold text-[#3D8BD0]">{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </>
  );
}

export function BomDependencyTree({ graph, onInspect, changeOf, initialQuery = '' }: Props & { initialQuery?: string }) {
  /* Arriving from a component's own drawer, the question is already "where does log4j come from
     on this host" — so the tree opens on that name rather than on the whole graph. It is the
     tree's own search, not a second mechanism: whatever the user types next behaves the same. */
  const [query, setQuery] = useState(initialQuery);
  const [q, setQ] = useState(initialQuery);
  const [vulnOnly, setVulnOnly] = useState(false);
  /* Null = every change kind. The graph is the default view; "Added" and the rest are cuts
     through it, so none of them is a starting state. */
  const [change, setChange] = useState<Change | null>(null);
  /* The unplaceable components, which are not part of the tree at all — they have no edges.
     Shown as their own list rather than as orphan roots, because rendering them as tree nodes
     would claim a structure the scanner could not find. */
  const [standalone, setStandalone] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  /* Two ways to be open, because "expand all" cannot mean "write every id into a set" when the
     point is not to walk the whole graph: in default mode `expanded` holds what is open, in
     all-mode `collapsed` holds the exceptions. */
  const [allOpen, setAllOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [shownDirect, setShownDirect] = useState(DIRECT_PAGE);
  const [budget, setBudget] = useState(ROW_PAGE);
  const [focusId, setFocusId] = useState<string | null>(null);

  const changeRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const sentinelRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ allOpen, expanded, collapsed });
  stateRef.current = { allOpen, expanded, collapsed };
  /** The expand state before a search started, so clearing the box puts the tree back. */
  const preSearch = useRef<typeof stateRef.current | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setQ(query.trim().toLowerCase()), 150);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (q && !preSearch.current) preSearch.current = stateRef.current;
    else if (!q && preSearch.current) {
      const s = preSearch.current;
      preSearch.current = null;
      setAllOpen(s.allOpen); setExpanded(s.expanded); setCollapsed(s.collapsed);
    }
  }, [q]);

  useEffect(() => { setShownDirect(DIRECT_PAGE); setBudget(ROW_PAGE); }, [q, vulnOnly, change, graph]);
  /* Leaving the standalone list open while a tree-only filter is set would show an unfiltered
     list under a toolbar that says otherwise. */
  useEffect(() => { if (standalone) { setVulnOnly(false); setChange(null); setChangeOpen(false); } }, [standalone]);
  useEffect(() => {
    if (!changeOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setChangeOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [changeOpen]);

  /** What this version did to a build. `Unchanged` when the panel supplied no map. */
  const changeFor = (n: DepNode) => (changeOf ? changeOf(n.name, n.version) : 'Unchanged');
  /* Counted over the whole graph, once, so the pills say how many exist rather than how many
     survived whatever is already filtered. */
  const changeCounts = useMemo(() => {
    const out: Record<string, number> = { Added: 0, Updated: 0, Removed: 0, Unchanged: 0 };
    const seenKey = new Set<string>();
    const walk = (n: DepNode) => {
      if (!seenKey.has(n.key)) { seenKey.add(n.key); out[changeFor(n)] = (out[changeFor(n)] ?? 0) + 1; }
      n.children.forEach(walk);
    };
    graph.tree.forEach(walk);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph.tree, changeOf]);
  const totalChanges = Object.values(changeCounts).reduce((t, x) => t + x, 0);

  const isOpen = (id: string) => (allOpen ? !collapsed.has(id) : expanded.has(id));

  /* A direct dependency with nothing under it draws a one-line "branch" that answers nothing —
     it belongs with the components that have no edges at all. Only TOP-LEVEL rows move: a leaf
     deeper down is the end of a real path, and showing what a vulnerable component hangs off is
     the entire job of this view. */
  const { treeRoots, noDeps } = useMemo(() => {
    const childless = graph.tree.filter((n) => n.children.length === 0);
    return {
      treeRoots: graph.tree.filter((n) => n.children.length > 0),
      noDeps: [...graph.standalone, ...childless].sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [graph.tree, graph.standalone]);

  /* ONE derivation of what is on screen, consumed twice: recursively for the render (nested
     containers are what draw the rails and the branch tint) and flattened for keyboard
     navigation. Deriving those separately is how the two drift apart. */
  const { roots, eligible, truncated } = useMemo(() => {
    const vulnSet = vulnOnly ? collectSubtrees(graph.tree, (n) => n.cves > 0) : null;
    const matchSet = q
      ? collectSubtrees(graph.tree, (n) => n.name.toLowerCase().includes(q) || n.purl.toLowerCase().includes(q))
      : null;
    /* Subtree-scoped like the others: a component that CHANGED four levels down is only
       findable if the path to it survives the filter. Keeping just the matching nodes would
       leave them stranded with no way to see what pulled them in — which is the one question
       this whole view exists to answer. */
    const changeSet = change ? collectSubtrees(graph.tree, (n) => changeFor(n) === change) : null;
    const keeps = (n: DepNode) =>
      (!vulnSet || vulnSet.has(n)) && (!matchSet || matchSet.has(n)) && (!changeSet || changeSet.has(n));
    const searching = !!q || vulnOnly || !!change;

    let used = 0;
    let cut = false;
    const build = (n: DepNode, path: string, depth: number, parentId: string | null): VisNode | null => {
      if (!keeps(n)) return null;
      // Budget is spent in screen order, so what gets dropped is always the tail.
      if (used >= budget) { cut = true; return null; }
      used++;
      const id = `${path}/${n.key}`;
      // Searching and filtering open the tree themselves — the point of both is to be seen.
      const open = searching || isOpen(id);
      const children = open
        ? n.children.map((c) => build(c, id, depth + 1, id)).filter((c): c is VisNode => c !== null)
        : [];
      return {
        id, node: n, depth, parentId, children,
        // A closed branch is never walked, so the count comes off the graph, not the render.
        expandable: searching ? children.length > 0 : n.children.length > 0,
        deps: n.children.length,
        open,
        hit: !!q && (n.name.toLowerCase().includes(q) || n.purl.toLowerCase().includes(q)),
      };
    };

    const eligibleRoots = treeRoots.filter(keeps);
    const built: VisNode[] = [];
    for (const n of eligibleRoots.slice(0, shownDirect)) {
      const v = build(n, 'root', 1, null);
      if (v) built.push(v);
    }
    return { roots: built, eligible: eligibleRoots.length, truncated: cut };
    // `isOpen` closes over allOpen/expanded/collapsed, which are all listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeRoots, q, vulnOnly, change, changeOf, expanded, collapsed, allOpen, shownDirect, budget]);

  const hiddenDirect = eligible - roots.length;

  /* Grow the budget as the tail comes into view. Falls back to a clickable row where there is no
     IntersectionObserver, so it is never a dead end. */
  useEffect(() => {
    if (!truncated || typeof IntersectionObserver === 'undefined') return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setBudget((b) => b + ROW_PAGE);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [truncated, budget]);

  /** Rows in screen order — the keyboard's model of the tree. */
  const flat = useMemo(() => {
    const out: VisNode[] = [];
    const walk = (v: VisNode) => { out.push(v); if (v.open) v.children.forEach(walk); };
    roots.forEach(walk);
    return out;
  }, [roots]);

  const matchCount = useMemo(() => {
    if (!q) return 0;
    let n = 0;
    const walk = (v: VisNode) => { if (v.hit) n++; v.children.forEach(walk); };
    roots.forEach(walk);
    return n;
  }, [roots, q]);

  const vulnerablePaths = useMemo(
    () => graph.tree.filter((n) => collectSubtrees([n], (x) => x.cves > 0).has(n)).length,
    [graph.tree],
  );

  const flip = (s: Set<string>, id: string) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; };
  const toggle = (id: string) => (allOpen ? setCollapsed((p) => flip(p, id)) : setExpanded((p) => flip(p, id)));
  const expandAll = () => { setAllOpen(true); setCollapsed(new Set()); setBudget(ROW_PAGE); };
  const collapseAll = () => { setAllOpen(false); setExpanded(new Set()); setCollapsed(new Set()); setBudget(ROW_PAGE); };

  const focusRow = (v?: VisNode) => {
    if (!v) return;
    setFocusId(v.id);
    rowRefs.current.get(v.id)?.focus();
  };

  /* WAI-ARIA tree keys. There is no tree primitive in this codebase and no tree library in the
     bundle, so this is the minimum that makes the control usable without a mouse. */
  const onKeyDown = (e: React.KeyboardEvent, v: VisNode) => {
    const i = flat.findIndex((f) => f.id === v.id);
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); focusRow(flat[i + 1]); break;
      case 'ArrowUp': e.preventDefault(); focusRow(flat[i - 1]); break;
      case 'Home': e.preventDefault(); focusRow(flat[0]); break;
      case 'End': e.preventDefault(); focusRow(flat[flat.length - 1]); break;
      case 'ArrowRight':
        e.preventDefault();
        if (v.expandable && !v.open) toggle(v.id);
        else if (v.open) focusRow(flat[i + 1]);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (v.expandable && v.open) toggle(v.id);
        else focusRow(flat.find((f) => f.id === v.parentId));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        v.expandable ? toggle(v.id) : onInspect?.(v.node.name);
        break;
    }
  };

  /** Where a build came from in this version, as a chip. Only when it is news. */
  const ChangeChip = ({ n }: { n: DepNode }) => {
    const c = changeOf ? changeFor(n) : 'Unchanged';
    if (c === 'Unchanged') return null;
    const tone = c === 'Added'
      ? 'bg-[#ECFDF3] text-[#22A06B]'
      : c === 'Removed' ? 'bg-[#FEF3F2] text-[#DC2626]' : 'bg-[#FFFAEB] text-[#B54708]';
    return (
      <span className={`flex-shrink-0 rounded-sm px-1.5 py-0.5 text-[10.5px] font-medium leading-none ${tone}`}>
        {c}
      </span>
    );
  };

  const renderNode = (v: VisNode): React.ReactNode => {
    const n = v.node;
    const tabbable = focusId ? focusId === v.id : v.id === flat[0]?.id;

    /* ONE row shape for every node, the way a layer panel does it: a fixed disclosure slot, a
       type icon, the name, then whatever the row has to say — and the actions only on hover.

       This replaced a card-for-branches / plain-row-for-leaves split. That split existed so the
       eye could tell which rows had something behind them without hovering; the chevron and the
       icon say it now, which is exactly what lets a layer panel keep one row shape at any depth.
       Indentation carries the nesting, so the rails and tinted containers are gone too. */
    const meta: string[] = [];
    if (v.expandable) meta.push(`${v.deps} ${v.deps === 1 ? 'dependency' : 'dependencies'}`);
    if (n.uses > 1) meta.push(`\u00d7${n.uses} used`);
    if (n.repeat) meta.push('shown above');

    return (
      /* The gap rides on the top-level WRAPPER, not the row, so it separates whole subtrees
         rather than opening a hole between a parent and its own first child. */
      <div key={v.id} style={v.depth === 1 ? { marginTop: PARENT_GAP } : undefined}>
        <div
          ref={(el) => { el ? rowRefs.current.set(v.id, el) : rowRefs.current.delete(v.id); }}
          role="treeitem"
          aria-level={v.depth}
          aria-expanded={v.expandable ? v.open : undefined}
          aria-label={`${n.name} ${n.version}`}
          tabIndex={tabbable ? 0 : -1}
          onFocus={() => setFocusId(v.id)}
          onKeyDown={(e) => onKeyDown(e, v)}
          /* The row toggles; it no longer navigates. Opening a branch is the thing you do
             dozens of times walking a graph, so it stays the cheap gesture. */
          onClick={() => { if (v.expandable) toggle(v.id); }}
          className={`group flex select-none items-center gap-1.5 rounded pr-1.5 outline-none transition-colors focus-visible:ring-1 focus-visible:ring-[#3D8BD0] ${
            v.expandable ? 'cursor-pointer' : 'cursor-default'
          } ${v.open ? 'bg-[#F4F7FA]' : 'hover:bg-[#F4F7FA]'}`}
          style={{ height: ROW_H, paddingLeft: 6 + (v.depth - 1) * INDENT }}
        >
          {/* The disclosure slot is reserved on EVERY row, filled or not — it is what keeps the
              icons in one column so the indent reads as depth rather than as ragged text. */}
          <span className="flex size-[14px] flex-shrink-0 items-center justify-center">
            {v.expandable ? (
              <ChevronRight
                size={12}
                className={`transition-transform duration-150 ${v.open ? 'rotate-90 text-[#3D8BD0]' : 'text-[#7B8FA5]'}`}
              />
            ) : null}
          </span>

          {/* Type icon: what a layer panel uses to say what a row IS before you read it. */}
          <span className="flex size-[14px] flex-shrink-0 items-center justify-center">
            {v.expandable
              ? <Boxes size={13} className={v.open ? 'text-[#3D8BD0]' : 'text-[#94A3B8]'} />
              : <Package size={12} className="text-[#CBD5E1]" />}
          </span>

          <span className={`min-w-0 truncate font-mono text-[12.5px] leading-none ${v.expandable ? 'font-semibold text-[#364658]' : 'text-[#364658]'}`}>
            <Mark text={n.name} q={q} />
          </span>
          <span className="flex-shrink-0 font-mono text-[11.5px] leading-none text-[#9CA3AF]">{n.version}</span>
          {n.cves > 0 && (
            <span
              className="inline-flex flex-shrink-0 items-center gap-0.5 rounded-sm bg-[#FEF3F2] px-1.5 py-0.5 text-[10.5px] font-medium leading-none text-[#DC2626]"
              title={`${n.cves} known vulnerabilit${n.cves === 1 ? 'y' : 'ies'} in this build`}
            ><ShieldAlert size={10} />{n.cves}</span>
          )}
          <ChangeChip n={n} />

          {/* Right edge: what the row has to say, and — on hover — the one thing it can do. */}
          <span className="ml-auto flex flex-shrink-0 items-center gap-1.5 pl-2">
            {meta.length > 0 && (
              <span className="hidden text-[11.5px] leading-none text-[#9CA3AF] sm:block">{meta.join(' \u00b7 ')}</span>
            )}
            {onInspect && (
              <button
                onClick={(e) => { e.stopPropagation(); onInspect(n.name); }}
                tabIndex={-1}
                title={`Open ${n.name}@${n.version} in the component list`}
                /* Hover ONLY. group-focus-within was here too, and clicking a row focuses it —
                   so the button stayed on screen for the rest of the session on every row that
                   had been touched, which read as "always visible". */
                className="rounded px-1.5 py-1 text-[11.5px] font-medium leading-none text-[#3D8BD0] opacity-0 transition-opacity hover:bg-[#EBF5FF] focus-visible:opacity-100 group-hover:opacity-100"
              >View component</button>
            )}
          </span>
        </div>

        {v.open && v.children.length > 0 && v.children.map(renderNode)}
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 px-5 py-2.5">
        <div className="relative min-w-[180px] max-w-[320px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }}
            placeholder="Find a package..."
            className="h-8 w-full rounded border border-[#d1d5db] bg-white pl-8 pr-8 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#364658]"
              aria-label="Clear search"
            ><X size={14} /></button>
          )}
        </div>

        {q && (
          <span className="flex-shrink-0 text-[12px] tabular-nums text-[#7B8FA5]">
            {matchCount} match{matchCount === 1 ? '' : 'es'}
          </span>
        )}

        {/* At this depth the only reason to walk the tree is to find what a vulnerable component
            is hanging off — so this filter is the shortcut past the whole exercise. */}
        <button
          onClick={() => { setVulnOnly((v) => !v); setStandalone(false); }}
          className={`inline-flex h-8 flex-shrink-0 items-center gap-1.5 rounded border px-2.5 text-[13px] font-medium transition-colors ${
            vulnOnly
              ? 'border-[#FCA5A5] bg-[#FEF3F2] text-[#DC2626]'
              : 'border-[#DFE5ED] bg-white text-[#DC2626] hover:border-[#FCA5A5] hover:bg-[#FEF3F2]'
          }`}
          aria-pressed={vulnOnly}
        >
          <ShieldAlert size={14} />
          Vulnerable paths
          <span className="tabular-nums text-[#DC2626]/70">&middot; {vulnerablePaths}</span>
        </button>

        {/* Beside the vulnerability cut, because it answers the other half of "what am I not
            seeing": these components are installed and simply have no edges to draw. They are
            NOT a tree, so the toggle swaps the view rather than filtering it. */}
        <button
          onClick={() => setStandalone((v) => !v)}
          className={`inline-flex h-8 flex-shrink-0 items-center gap-1.5 rounded border px-2.5 text-[13px] font-medium transition-colors ${
            standalone
              ? 'border-[#3D8BD0] bg-[#EBF5FF] text-[#3D8BD0]'
              : 'border-[#DFE5ED] bg-white text-[#364658] hover:border-[#3D8BD0] hover:bg-[#F5F7FA]'
          }`}
          aria-pressed={standalone}
          title={`${noDeps.length} components with nothing underneath them: ${graph.standalone.length} the scanner could not place at all, and ${noDeps.length - graph.standalone.length} declared directly that pull nothing in. Neither draws a branch, so neither is in the tree.`}
        >
          <Unlink size={14} className={standalone ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'} />
          Standalone
          <span className="tabular-nums text-[#7B8FA5]">&middot; {noDeps.length}</span>
        </button>

        {/* A dropdown rather than five pills: it is ONE choice, and five mutually exclusive
            buttons spend a whole row saying so. Disabled rather than hidden while the standalone
            list is up — it does not apply there, and removing it would make the row jump.
            Offered only when the panel supplied a change map; on v1 there is nothing to differ
            from. */}
        {changeOf && (
          <div className="relative flex-shrink-0" ref={changeRef}>
            <button
              onClick={() => setChangeOpen((v) => !v)}
              disabled={standalone}
              aria-haspopup="listbox"
              aria-expanded={changeOpen}
              title={standalone ? 'Applies to the graph, not to the standalone list' : 'Filter by what this version did'}
              className={`inline-flex h-8 items-center gap-1.5 rounded border px-2.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                change
                  ? 'border-[#3D8BD0] bg-[#EBF5FF] text-[#3D8BD0]'
                  : 'border-[#DFE5ED] bg-white text-[#364658] hover:border-[#3D8BD0] hover:bg-[#F5F7FA]'
              }`}
            >
              <GitCompare size={14} className={change ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'} />
              {change ?? 'All changes'}
              <span className={`tabular-nums ${change ? 'text-[#3D8BD0]/70' : 'text-[#7B8FA5]'}`}>
                &middot; {change ? changeCounts[change] ?? 0 : totalChanges}
              </span>
              <ChevronDown size={14} className={`transition-transform ${changeOpen ? 'rotate-180' : ''} ${change ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'}`} />
            </button>
            {changeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setChangeOpen(false)} />
                <div role="listbox" className="absolute left-0 top-full z-50 mt-1 w-[220px] rounded-lg border border-[#DFE5ED] bg-white py-1 shadow-lg">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#7B8FA5]">
                    Changed in this version
                  </div>
                  {([[null, 'All changes'], ...CHANGES.map((c) => [c, c] as const)] as const).map(([id, label]) => {
                    const n = id === null ? totalChanges : changeCounts[id] ?? 0;
                    const on = change === id;
                    return (
                      <button
                        key={label}
                        role="option"
                        aria-selected={on}
                        disabled={n === 0 && id !== null}
                        onClick={() => { setChange(id as Change | null); setChangeOpen(false); }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-[#364658] transition-colors hover:bg-[#F5F7FA] disabled:cursor-not-allowed disabled:text-[#B8C4D2] disabled:hover:bg-transparent"
                      >
                        <Check size={14} className={on ? 'text-[#3D8BD0]' : 'text-transparent'} />
                        <span className="flex-1">{label}</span>
                        <span className="tabular-nums text-[#7B8FA5]">{n}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tertiary, and at the far edge. It acts on the whole tree rather than narrowing it,
            so it does not belong in the run of filters — and borderless keeps it from reading as
            one more thing that changes what is shown.

            ONE button, naming the move it would make: two buttons meant one of them was always
            the no-op for the state you were already in. */}
        <div className="ml-auto flex-shrink-0">
          <button
            onClick={() => (allOpen ? collapseAll() : expandAll())}
            aria-expanded={allOpen}
            className="inline-flex h-8 items-center gap-1.5 rounded px-2 text-[13px] font-medium text-[#64748B] transition-colors hover:bg-[#F5F7FA] hover:text-[#364658]"
          >
            {allOpen ? <ChevronsDownUp size={14} /> : <ChevronsUpDown size={14} />}
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
      </div>

      {standalone ? (
        /* Not a tree: a flat list of everything with nothing underneath it. Rendering these as
           branches would claim a structure that is not there. */
        <div className="min-h-0 flex-1 overflow-auto px-5 pb-3">
          <div className="sticky top-0 z-10 flex h-[30px] items-center gap-2 bg-white">
            <Unlink size={13} className="flex-shrink-0 text-[#7B8FA5]" />
            <span className="truncate text-[12.5px] font-semibold text-[#364658]">Nothing depends on these</span>
            <span className="flex-shrink-0 text-[11px] text-[#7B8FA5]">
              {noDeps.length} of {graph.total} · no components hang off them
            </span>
          </div>
          {noDeps.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[14px] font-medium text-[#364658]">Everything pulls something in</p>
              <p className="mt-1 text-[13px] text-[#7B8FA5]">Every component in this scope has dependencies under it.</p>
            </div>
          ) : noDeps
            .filter((n) => !q || n.name.toLowerCase().includes(q) || n.purl.toLowerCase().includes(q))
            .map((n) => (
              <div
                key={n.key}
                onClick={() => onInspect?.(n.name)}
                className="mb-px flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2 transition-colors hover:bg-[#F4F7FA]"
              >
                <span className="flex w-3 flex-shrink-0 justify-center text-[#CBD5E1]">&middot;</span>
                <span className="min-w-0 truncate font-mono text-[12.5px] leading-none text-[#364658]">
                  <Mark text={n.name} q={q} />
                </span>
                <span className="flex-shrink-0 font-mono text-[11.5px] leading-none text-[#9CA3AF]">{n.version}</span>
                {n.cves > 0 && (
                  <span className="inline-flex flex-shrink-0 items-center gap-0.5 rounded-sm bg-[#FEF3F2] px-1.5 py-0.5 text-[10.5px] font-medium leading-none text-[#DC2626]">
                    <ShieldAlert size={10} />{n.cves}
                  </span>
                )}
                <ChangeChip n={n} />
              </div>
            ))}
        </div>
      ) : (
      <div className="min-h-0 flex-1 overflow-auto px-5 pb-3">
        {roots.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px] font-medium text-[#364658]">
              {q ? 'Nothing matches that search'
                : vulnOnly ? 'No vulnerable dependency paths'
                : `Nothing was ${(change ?? '').toLowerCase()} in this version`}
            </p>
            <p className="mt-1 text-[13px] text-[#7B8FA5]">
              {q ? 'Search runs over package names and PURLs.'
                : vulnOnly ? 'Every declared dependency and everything under it is clean.'
                : 'The graph is unchanged from the previous version by this measure.'}
            </p>
          </div>
        ) : (
          <>
            {/* The product heading that sat here is gone: the drawer header already names the
                product, and naming it twice on one screen said nothing the second time. */}

            {/* No rail or tint at this level. It was tried — to draw the direct list as hanging
                off the root the way deeper levels are drawn — and a grey band running the width
                of the drawer behind a row of white cards read worse than the ambiguity it fixed.
                The root line and the wording carry that job instead. */}
            <div role="tree" aria-label="Dependency tree">
              {roots.map(renderNode)}
            </div>

            {truncated && (
              <div
                ref={sentinelRef}
                onClick={() => setBudget((b) => b + ROW_PAGE)}
                className="mt-1 flex h-8 cursor-pointer items-center rounded-lg px-2 text-[12px] text-[#7B8FA5] transition-colors hover:bg-[#F5F7FA]"
              >Loading deeper branches...</div>
            )}

            {hiddenDirect > 0 && (
              <button
                onClick={() => setShownDirect((n) => n + DIRECT_PAGE)}
                className="mt-1 h-8 rounded-lg px-2 text-[12px] text-[#3D8BD0] transition-colors hover:bg-[#F5FAFF]"
              >Show {Math.min(DIRECT_PAGE, hiddenDirect)} more direct dependencies...</button>
            )}
          </>
        )}
      </div>
      )}
    </div>
  );
}
