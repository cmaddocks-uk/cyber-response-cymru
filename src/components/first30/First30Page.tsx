// First 30 Minutes page. Two purposes, two surfaces:
//   - Screen + browser print: the laminate-quality First30Card (single-A4
//     wall sheet) — restored in v2.4.1 by user preference. Distinct from the
//     other reports because its job is "pin this on the wall", not "table at
//     the next governor meeting".
//   - Word export: the document-model `buildFirst30Report` multi-page exec
//     doc via the First30Toolbar.
// Both consume the same `getFirst30Data` selector — only the layout differs.

import { usePlanState } from '~/state/usePlanState';
import { First30Card } from './First30Card';
import { First30Toolbar } from './First30Toolbar';

export function First30Page() {
  const { plan } = usePlanState();
  return (
    <>
      <First30Toolbar plan={plan} />
      <First30Card plan={plan} />
    </>
  );
}
