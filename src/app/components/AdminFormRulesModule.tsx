/* Request Form Rules — Admin › Request Management › Request Form Rule.
 *
 * The card has existed on the Overview since the admin hub was built; it just had an href and no
 * screen behind it. This puts the V0 prototype there — "rules without blocks", the baseline
 * direction: one rule is a single When → If → Then unit, with the conflict model and the derived
 * gap/conflict data the later versions build on.
 *
 * Mounted the same way BOM Management and Compliance Reports are: the prototype IS the screen
 * rather than a React re-implementation of it, so there is one place to change a rule's behaviour.
 *
 * ONE SOURCE, ONE COPY: `Test4/rule-studio-v0.html` is the source. After editing it, run
 * `sh sync-bom-reports.sh` from the Test4 root — the file under `public/` is a build artifact.
 *
 * Unlike the BOM prototypes this one draws no chrome of its own (the hub shell owns the product
 * rail, so V0 stopped rendering one), which is why there is no `?embed=1` here. */

const SRC = `${import.meta.env.BASE_URL}request-form-rules/index.html`;

export function AdminFormRulesModule() {
  return (
    /* The prototype scrolls itself, so this pane must not — two scrollbars for one list is the
       usual cost of nesting a scroller. */
    <iframe
      src={SRC}
      title="Request Form Rules"
      className="h-full w-full border-0 bg-white"
    />
  );
}
