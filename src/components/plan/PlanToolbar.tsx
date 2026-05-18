// Save / load / reset row at the top of the Plan Builder. The file picker is
// hidden and triggered by clicking "Load saved file"; the import goes through
// the schema-strict importJsonText() in the store so a corrupt or hostile
// JSON file can't break the running plan.

import { useRef } from 'react';
import { usePlanState } from '~/state/usePlanState';
import { downloadText, slugify } from '~/lib/download';

export function PlanToolbar() {
  const { plan, exportJsonText, importJsonText, resetAll } = usePlanState();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSave = () => {
    const slug = slugify(plan.meta.schoolName || 'school');
    const date = new Date().toISOString().slice(0, 10);
    downloadText(exportJsonText(), `cyber-response-plan-${slug}-${date}.json`);
  };

  const handleLoadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same filename
    if (!file) return;

    const MAX_BYTES = 1024 * 1024;
    if (file.size > MAX_BYTES) {
      alert('File is too large to be a plan export (over 1MB). Import cancelled.');
      return;
    }
    const text = await file.text();
    const result = importJsonText(text);
    if (!result.ok) {
      alert(result.reason);
      return;
    }
    alert('Saved file loaded successfully.');
  };

  const handleReset = () => {
    if (
      !confirm('This will erase all your readiness answers and plan data. Continue?')
    ) {
      return;
    }
    resetAll();
  };

  return (
    <div className="card">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">Plan builder</h2>
      <p className="m-0 mb-2.5 text-sm text-muted">
        Work through each section to build your school's Cyber Incident Response Plan. You can
        save your progress to a file at any time and continue later. Empty fields will appear as
        <em> "to be completed"</em> in the final plan — useful as a working draft.
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-md border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa]"
        >
          💾 Save progress to file
        </button>
        <button
          type="button"
          onClick={handleLoadClick}
          className="rounded-md border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa]"
        >
          📂 Load saved file
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-[#f4c5c0] bg-white px-3 py-1.5 text-[13px] font-semibold text-danger transition hover:bg-[#fbe9e7]"
        >
          🗑️ Reset all data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
