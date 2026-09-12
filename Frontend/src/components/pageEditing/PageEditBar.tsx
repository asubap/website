interface Props {
  canEdit: boolean; isEditing: boolean; loading: boolean; saving: boolean; dirty: boolean;
  error: string; loadError: string; message: string;
  startEditing: () => void; cancel: () => void; save: () => Promise<void>; retry: () => void;
}
export default function PageEditBar(props: Props) {
  if (!props.canEdit) return null;
  return <div className="w-full mb-6 rounded-lg border border-red-100 bg-white p-4 shadow-sm" aria-label="Page editing controls">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-gray-900">{props.isEditing ? 'Editing this page' : 'Manage page content'}</p>
        <p className="text-sm text-gray-600">{props.isEditing ? 'Edit the sections below. Save changes to publish them.' : 'Only admins can edit. Saved changes are visible to everyone.'}</p>
      </div>
      <div className="flex gap-2">
        {props.isEditing ? <>
          <button type="button" disabled={props.saving} onClick={props.cancel} className="rounded-md border px-4 py-2 disabled:opacity-50">Cancel</button>
          <button type="button" disabled={props.saving || !props.dirty} onClick={() => void props.save()} className="rounded-md bg-bapred px-4 py-2 text-white disabled:opacity-50">{props.saving ? 'Saving…' : 'Save changes'}</button>
        </> : <button type="button" onClick={props.startEditing} disabled={props.loading || !!props.loadError} className="rounded-md bg-bapred px-4 py-2 text-white disabled:opacity-50">{props.loading ? 'Loading…' : 'Edit page'}</button>}
      </div>
    </div>
    {props.loadError && <p role="alert" className="mt-3 text-sm text-red-700">{props.loadError} <button type="button" onClick={props.retry} className="underline font-semibold">Retry</button></p>}
    {props.error && <p role="alert" className="mt-3 text-sm text-red-700">{props.error}</p>}
    {props.message && <p role="status" className="mt-3 text-sm text-green-800">{props.message}</p>}
  </div>;
}
