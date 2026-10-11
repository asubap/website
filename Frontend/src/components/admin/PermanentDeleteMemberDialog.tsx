import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ArchivedMember } from '../../services/memberArchiveService';

interface Props {
  member: ArchivedMember;
  isDeleting: boolean;
  onConfirm: (confirmationEmail: string) => void;
  onCancel: () => void;
}

export default function PermanentDeleteMemberDialog({ member, isDeleting, onConfirm, onCancel }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const canDelete = confirmationEmail === member.email && !isDeleting;

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  return createPortal(
    <dialog ref={dialog} aria-labelledby="permanent-delete-title" aria-describedby="permanent-delete-description"
      onCancel={event => { event.preventDefault(); if (!isDeleting) onCancel(); }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl p-6 shadow-xl backdrop:bg-black/50">
      <form onSubmit={event => { event.preventDefault(); if (canDelete) onConfirm(confirmationEmail); }}>
        <h2 id="permanent-delete-title" className="text-xl font-bold text-gray-900">Permanently delete member?</h2>
        <p className="mt-3 font-medium break-words">{member.name || member.email}</p>
        <p id="permanent-delete-description" className="mt-2 text-gray-700">
          This permanently removes their account, profile, photos, attendance, and hours. This cannot be undone.
        </p>
        <label htmlFor="delete-member-email" className="mt-5 block text-sm font-medium text-gray-800">
          Type <span className="font-bold break-all">{member.email}</span> to confirm
        </label>
        <input id="delete-member-email" type="text" autoComplete="off" spellCheck={false}
          value={confirmationEmail} onChange={event => setConfirmationEmail(event.target.value)}
          disabled={isDeleting} className="mt-2 w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-bapred" />
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={isDeleting}
            className="rounded-md border px-4 py-2 disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={!canDelete}
            className="rounded-md bg-bapred px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50">
            {isDeleting ? 'Deleting…' : 'Permanently delete'}
          </button>
        </div>
      </form>
    </dialog>, document.body
  );
}
