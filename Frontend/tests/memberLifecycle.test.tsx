import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArchivedMembersList from '../src/components/admin/ArchivedMembersList';
import PermanentDeleteMemberDialog from '../src/components/admin/PermanentDeleteMemberDialog';
import ProfileEditModal from '../src/components/member/ProfileEditModal';
import { formatMemberRank } from '../src/utils/memberRanks';
import { canAccessFeature, PermissionFeature } from '../src/utils/permissions';
import { MemberDetail } from '../src/types';

const { auth, toast } = vi.hoisted(() => ({
  auth: { session: { access_token: 'local-test-token' }, role: 'e-board' }, toast: vi.fn()
}));
vi.mock('../src/context/auth/authProvider', () => ({ useAuth: () => auth }));
vi.mock('../src/context/toast/ToastContext', () => ({ useToast: () => ({ showToast: toast }) }));
vi.mock('../src/context/auth/supabaseClient', () => ({ supabase: { auth: { getSession: async () => ({ data: { session: auth.session } }) } } }));
const member = { email: 'returning+test@example.test', name: 'Test Candidate', role: 'general-member', deleted_at: '2026-10-01', rank: 'returning-candidate' };
let fetchMock: ReturnType<typeof vi.fn>;
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
beforeEach(() => {
  auth.role = 'e-board'; toast.mockClear();
  fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([member]), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('returning candidate', () => {
  it('uses a distinct readable label and the same permissions as a pledge', () => {
    expect(formatMemberRank('returning-candidate')).toBe('Returning Candidate');
    for (const feature of ['event-rsvp', 'event-checkin', 'announcements', 'slack-access'] as PermissionFeature[]) {
      expect(canAccessFeature('returning-candidate', feature)).toBe(canAccessFeature('pledge', feature));
    }
  });
  it('allows an admin to select the rank and sends its canonical value', async () => {
    fetchMock.mockImplementation(async () => new Response('{}', { status: 200 }));
    const profile = { email: member.email, name: member.name, rank: 'pledge', phone: '5551234567', major: 'Accounting',
      graduationDate: '2028', status: 'Looking for Internship', about: 'Candidate', photoUrl: '/test-photo.png' } as MemberDetail;
    render(<ProfileEditModal isOpen onClose={vi.fn()} profileData={profile} onSave={vi.fn()} showRank />);
    await userEvent.selectOptions(screen.getByLabelText(/Member Rank/), 'returning-candidate');
    expect(screen.getByText(/All completed candidate hours carry forward/)).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).member_rank).toBe('returning-candidate');
  });
});

describe('permanent deletion', () => {
  it('requires the exact email and cancel never deletes', async () => {
    const confirm = vi.fn(), cancel = vi.fn();
    render(<PermanentDeleteMemberDialog member={member} isDeleting={false} onConfirm={confirm} onCancel={cancel} />);
    const button = screen.getByRole('button', { name: 'Permanently delete' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    await userEvent.type(screen.getByLabelText(/to confirm/), 'wrong@example.test');
    expect(button.disabled).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(cancel).toHaveBeenCalledOnce(); expect(confirm).not.toHaveBeenCalled();
  });
  it('blocks duplicate submissions and cancellation while deleting', () => {
    const confirm = vi.fn(), cancel = vi.fn();
    render(<PermanentDeleteMemberDialog member={member} isDeleting onConfirm={confirm} onCancel={cancel} />);
    expect((screen.getByRole('button', { name: 'Deleting…' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(cancel).not.toHaveBeenCalled(); expect(confirm).not.toHaveBeenCalled();
  });
  it('deletes through the authenticated API and removes the row only on success', async () => {
    fetchMock.mockImplementation(async (_url: string, init?: RequestInit) => new Response(JSON.stringify(init?.method === 'DELETE' ? { success: true } : [member]), { status: 200 }));
    render(<ArchivedMembersList />);
    await userEvent.click(await screen.findByRole('button', { name: `Permanently delete ${member.name}` }));
    await userEvent.type(screen.getByLabelText(/to confirm/), member.email);
    await userEvent.click(screen.getByRole('button', { name: 'Permanently delete', exact: true }));
    await screen.findByText('No archived members');
    const [url, options] = fetchMock.mock.calls.find(([, init]) => init?.method === 'DELETE')!;
    expect(url).toContain('/member-info/returning%2Btest%40example.test/permanent');
    expect(options.headers.Authorization).toBe('Bearer local-test-token');
    expect(JSON.parse(options.body)).toEqual({ confirmation_email: member.email });
  });
  it('retains failed deletions for retry and shows the server error', async () => {
    fetchMock.mockImplementation(async (_url: string, init?: RequestInit) => new Response(JSON.stringify(
      init?.method === 'DELETE' ? { error: 'File cleanup failed; retry deletion.' } : [member]
    ), { status: init?.method === 'DELETE' ? 502 : 200 }));
    render(<ArchivedMembersList />);
    await userEvent.click(await screen.findByRole('button', { name: `Permanently delete ${member.name}` }));
    await userEvent.type(screen.getByLabelText(/to confirm/), member.email);
    await userEvent.click(screen.getByRole('button', { name: 'Permanently delete', exact: true }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith('File cleanup failed; retry deletion.', 'error'));
    expect(await screen.findByRole('button', { name: `Permanently delete ${member.name}` })).toBeTruthy();
  });
  it('disables restore when deletion has started', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify([{ ...member, deletion_pending_at: '2026-10-11' }]), { status: 200 }));
    render(<ArchivedMembersList />);
    expect((await screen.findByRole('button', { name: `Restore ${member.name}` }) as HTMLButtonElement).disabled).toBe(true);
    expect(await screen.findByText('Deletion incomplete—retry to finish')).toBeTruthy();
  });
  it('does not offer deletion to non-admin users', async () => {
    auth.role = 'general-member';
    render(<ArchivedMembersList />);
    await screen.findByText(member.name);
    expect(screen.queryByRole('button', { name: /Permanently delete/ })).toBeNull();
  });
});
