interface Props {
  label: string; value: string; onChange: (value: string) => void;
  multiline?: boolean; maxLength?: number;
}
export default function EditableText({ label, value, onChange, multiline = false, maxLength = 5000 }: Props) {
  const className = 'w-full rounded-md border border-gray-300 bg-white p-3 text-base text-gray-900 focus:border-bapred focus:outline-none focus:ring-2 focus:ring-red-100';
  return <label className="block w-full mb-3">
    <span className="mb-1 block text-sm font-semibold text-gray-700">{label}</span>
    {multiline
      ? <textarea aria-label={label} className={className} value={value} onChange={e => onChange(e.target.value)} rows={4} maxLength={maxLength} />
      : <input aria-label={label} className={className} value={value} onChange={e => onChange(e.target.value)} maxLength={maxLength} />}
  </label>;
}
