import { lazy, Suspense } from 'react';
const RichTextEditor = lazy(() => import('./RichTextEditor'));

export default function EditableRichText({ label, value, editing, onChange, disabled }: {
  label: string; value: string; editing: boolean; onChange: (value: string) => void; disabled?: boolean;
}) {
  return editing ? <Suspense fallback={<p role="status">Loading {label.toLowerCase()} editor…</p>}>
    <RichTextEditor label={label} value={value} onChange={onChange} disabled={disabled} />
  </Suspense> : <div
    className="font-pt-serif text-base text-gray-800 [&_p]:mb-4 [&_a]:text-bapred [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-4"
    // Only static defaults and allowlist-sanitized HTML from the page-content API reach this view.
    dangerouslySetInnerHTML={{ __html: value }}
  />;
}
