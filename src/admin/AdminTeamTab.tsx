import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  MailPlus,
  Shield,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  X,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import {
  ADMIN_EMAIL,
  approveAccessRequestWithRole,
  deleteAccessRequest,
  deleteTeamInvite,
  inviteTeamMember,
  rejectAccessRequest,
  removeAdminMember,
  revokeTeamInvite,
  updateAdminMember,
} from '../lib/adminFirestore';
import {
  ADMIN_ROLES,
  ALL_PERMISSIONS,
  getPermissionsForRole,
  getRoleLabel,
  normalizePermissions,
  PERMISSION_DEFINITIONS,
} from '../lib/permissions';
import {
  AccessRequest,
  AdminMember,
  AdminMemberStatus,
  AdminPermission,
  AdminRole,
  TeamInvite,
} from '../types/dalka';

interface AdminTeamTabProps {
  currentEmail: string;
  teamMembers: AdminMember[];
  teamInvites: TeamInvite[];
  accessRequests: AccessRequest[];
}

function formatDate(val: unknown): string {
  if (val && typeof (val as { toDate?: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toLocaleDateString();
  }
  return '—';
}

export function AdminTeamTab({
  currentEmail,
  teamMembers,
  teamInvites,
  accessRequests,
}: AdminTeamTabProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Invite form state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('editor');
  const [invitePerms, setInvitePerms] = useState<AdminPermission[]>(
    getPermissionsForRole('editor'),
  );
  const [inviting, setInviting] = useState(false);

  // Approve pending request modal state
  const [approvingReq, setApprovingReq] = useState<AccessRequest | null>(null);
  const [approveRole, setApproveRole] = useState<AdminRole>('editor');
  const [approvePerms, setApprovePerms] = useState<AdminPermission[]>(
    getPermissionsForRole('editor'),
  );
  const [approveName, setApproveName] = useState('');
  const [approvingSaving, setApprovingSaving] = useState(false);

  // Edit existing admin member modal state
  const [editingMember, setEditingMember] = useState<AdminMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<AdminRole>('editor');
  const [editPerms, setEditPerms] = useState<AdminPermission[]>([]);
  const [editStatus, setEditStatus] = useState<AdminMemberStatus>('active');
  const [editingSaving, setEditingSaving] = useState(false);

  // Delete confirmation state
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const pendingRequests = accessRequests.filter((r) => r.status === 'pending');
  const activeOrRevokedInvites = teamInvites.filter((inv) => inv.status !== 'claimed');
  const activeCount = teamMembers.filter((m) => m.status === 'active').length + 1; // +1 owner

  function handleRoleSelectChange(
    nextRole: AdminRole,
    setRole: (r: AdminRole) => void,
    setPerms: (p: AdminPermission[]) => void,
  ) {
    setRole(nextRole);
    if (nextRole !== 'custom') {
      setPerms(getPermissionsForRole(nextRole));
    }
  }

  function togglePermissionInList(
    perm: AdminPermission,
    currentList: AdminPermission[],
    setPerms: (p: AdminPermission[]) => void,
    setRole: (r: AdminRole) => void,
  ) {
    if (perm === 'overview') return; // always enabled
    const exists = currentList.includes(perm);
    const next = exists
      ? currentList.filter((p) => p !== perm)
      : [...currentList, perm];
    const normalized = normalizePermissions(next, 'custom');
    setPerms(normalized);

    const matchingPreset = ADMIN_ROLES.find(
      (r) =>
        r.id !== 'custom' &&
        r.defaultPermissions.length === normalized.length &&
        r.defaultPermissions.every((p) => normalized.includes(p)),
    );
    setRole(matchingPreset ? matchingPreset.id : 'custom');
  }

  async function handleInviteSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setInviting(true);
    try {
      await inviteTeamMember({
        email: inviteEmail,
        displayName: inviteName,
        role: inviteRole,
        permissions: invitePerms,
        invitedBy: currentEmail,
      });
      setNotice(
        `Role invite saved for ${inviteEmail.trim().toLowerCase()}. Once they create an account or sign in and verify their email, their ${getRoleLabel(inviteRole)} permissions activate automatically.`,
      );
      setInviteEmail('');
      setInviteName('');
      setInviteRole('editor');
      setInvitePerms(getPermissionsForRole('editor'));
      setShowInviteForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send invite.');
    } finally {
      setInviting(false);
    }
  }

  function openApproveModal(req: AccessRequest) {
    setError(null);
    setNotice(null);
    setApprovingReq(req);
    setApproveName(req.displayName || '');
    setApproveRole('editor');
    setApprovePerms(getPermissionsForRole('editor'));
  }

  async function handleApproveSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!approvingReq) return;
    setError(null);
    setNotice(null);
    setApprovingSaving(true);
    try {
      await approveAccessRequestWithRole({
        request: approvingReq,
        role: approveRole,
        permissions: approvePerms,
        invitedBy: currentEmail,
        displayName: approveName,
      });
      setNotice(
        `${approvingReq.email} was assigned the ${getRoleLabel(approveRole)} role and can now access their permitted admin tabs.`,
      );
      setApprovingReq(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to approve access request.');
    } finally {
      setApprovingSaving(false);
    }
  }

  function openEditMember(member: AdminMember) {
    setError(null);
    setNotice(null);
    const role: AdminRole = member.role === 'admin' ? 'super_admin' : member.role;
    setEditingMember(member);
    setEditName(member.displayName || '');
    setEditRole(role);
    setEditPerms(normalizePermissions(member.permissions, member.role));
    setEditStatus(member.status || 'active');
  }

  async function handleEditMemberSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingMember) return;
    setError(null);
    setNotice(null);
    setEditingSaving(true);
    try {
      await updateAdminMember(editingMember.id, {
        displayName: editName,
        role: editRole,
        permissions: editPerms,
        status: editStatus,
      });
      setNotice(`Updated role & permissions for ${editingMember.email}.`);
      setEditingMember(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update team member.');
    } finally {
      setEditingSaving(false);
    }
  }

  async function handleQuickToggleStatus(member: AdminMember) {
    setError(null);
    setNotice(null);
    const nextStatus: AdminMemberStatus = member.status === 'active' ? 'suspended' : 'active';
    const role: AdminRole = member.role === 'admin' ? 'super_admin' : member.role;
    try {
      await updateAdminMember(member.id, {
        displayName: member.displayName,
        role,
        permissions: normalizePermissions(member.permissions, member.role),
        status: nextStatus,
      });
      setNotice(
        `${member.email} is now ${nextStatus === 'active' ? 'Active' : 'Suspended'}.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to change member status.');
    }
  }

  async function handleRemoveMember(member: AdminMember) {
    setError(null);
    setNotice(null);
    try {
      await removeAdminMember(member.id);
      setConfirmRemoveId(null);
      setNotice(`Removed admin access for ${member.email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove team member.');
    }
  }

  const inputClass =
    'w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-[#0B1C30] dark:text-[#F1F5F9] placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648D4]/30 focus:border-[#4648D4]';

  function renderPermissionGrid(
    selectedPerms: AdminPermission[],
    onToggle: (perm: AdminPermission) => void,
    disabledAll = false,
  ) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PERMISSION_DEFINITIONS.map((perm) => {
          const checked = selectedPerms.includes(perm.id);
          const locked = disabledAll || perm.id === 'overview';
          return (
            <label
              key={perm.id}
              className={`flex items-start gap-2.5 p-3 rounded-lg border transition-colors ${
                checked
                  ? 'border-[#4648D4]/50 dark:border-[#6366F1]/60 bg-[#EFF4FF]/60 dark:bg-[#1E2430]'
                  : 'border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0D1117]'
              } ${locked ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={locked}
                onChange={() => onToggle(perm.id)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#4648D4] focus:ring-[#4648D4]"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                  {perm.label}
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400 leading-snug">
                  {perm.description}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0B1C30] dark:text-[#F8FAFC]">
            Team, Roles &amp; Permissions
          </h1>
          <p className="mt-1 text-sm text-[#464554] dark:text-slate-300">
            Invite staff accounts with predefined or custom module permissions, and assign roles to newly registered users.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setNotice(null);
            setShowInviteForm((prev) => !prev);
          }}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] transition-colors whitespace-nowrap shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>{showInviteForm ? 'Close Invite Form' : 'Invite Team Member'}</span>
        </button>
      </div>

      {/* Role Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">
              Active Team Accounts
            </span>
            <ShieldCheck className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">
            {activeCount}
          </div>
        </div>

        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">
              Awaiting Role Assignment
            </span>
            <Clock className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#4648D4] dark:text-[#818CF8] tabular-nums">
            {pendingRequests.length}
          </div>
        </div>

        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">
              Pending Invites
            </span>
            <MailPlus className="h-4 w-4 text-[#4648D4] dark:text-[#818CF8]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0B1C30] dark:text-[#F8FAFC] tabular-nums">
            {teamInvites.filter((i) => i.status === 'pending').length}
          </div>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-[#4648D4]/25 dark:border-[#6366F1]/40 bg-[#EFF4FF] dark:bg-[#1E2430] px-4 py-3 text-sm text-[#4648D4] dark:text-[#818CF8]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-[#93000A] dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Invite / Pre-assign Role Form */}
      {showInviteForm && (
        <form
          onSubmit={handleInviteSubmit}
          className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                Pre-Assign Role for New Staff Member
              </h2>
              <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-400">
                Enter their email and pick a role. When they create an account on the admin signup page (or sign in with Google) and verify their email, these permissions activate immediately.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowInviteForm(false)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-[#64748B] dark:text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                Staff Email *
              </label>
              <input
                type="email"
                required
                maxLength={160}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="staff@dalkajobs.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                Full Name (Optional)
              </label>
              <input
                type="text"
                maxLength={80}
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Amina Hassan"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                Role Preset *
              </label>
              <select
                value={inviteRole}
                onChange={(e) =>
                  handleRoleSelectChange(
                    e.target.value as AdminRole,
                    setInviteRole,
                    setInvitePerms,
                  )
                }
                className={inputClass}
              >
                {ADMIN_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                Module Permissions ({invitePerms.length}/{ALL_PERMISSIONS.length})
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                {ADMIN_ROLES.find((r) => r.id === inviteRole)?.summary}
              </span>
            </div>
            {renderPermissionGrid(invitePerms, (perm) =>
              togglePermissionInList(perm, invitePerms, setInvitePerms, setInviteRole),
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowInviteForm(false)}
              className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#464554] dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviting}
              className="h-10 px-5 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-60"
            >
              {inviting ? 'Saving Invite...' : 'Save Role Invite'}
            </button>
          </div>
        </form>
      )}

      {/* Pending Access Requests (New users created who need a role assigned) */}
      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
              New Users Awaiting Role Assignment
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-400">
              Verified users who registered via the admin portal without a prior invite appear here for role assignment.
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums font-semibold text-[#4648D4] dark:text-[#818CF8]">
            {pendingRequests.length} pending
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="px-6 py-6 text-xs text-[#64748B] dark:text-slate-400">
            No pending user registrations right now.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="text-sm font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                    {req.displayName || req.email}
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-slate-400 font-mono">
                    {req.email} · Requested {formatDate(req.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openApproveModal(req)}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-xs font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8]"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Assign Role &amp; Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectAccessRequest(req.id)}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#93000A] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Members Table */}
      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
            Team Members &amp; Assigned Roles
          </h2>
          <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-400">
            Manage active administrator roles, permission scopes, or suspend access immediately.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-[#1E2430] border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-[#64748B] dark:text-slate-400">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Permissions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {/* Root Owner Row */}
              <tr className="bg-[#F8F9FF]/60 dark:bg-[#1E2430]/40">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                    Workspace Owner
                  </div>
                  <div className="text-xs font-mono text-[#64748B] dark:text-slate-400">
                    {ADMIN_EMAIL}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Super Admin (Root)</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs text-[#464554] dark:text-slate-300">
                  Full platform access ({ALL_PERMISSIONS.length} modules)
                </td>
                <td className="py-3.5 px-4 text-xs font-semibold text-[#4648D4] dark:text-[#818CF8]">
                  Active
                </td>
                <td className="py-3.5 px-4 text-right text-xs text-[#64748B] dark:text-slate-500">
                  Protected
                </td>
              </tr>

              {teamMembers
                .filter((m) => m.email.toLowerCase() !== ADMIN_EMAIL)
                .map((member) => {
                  const perms = normalizePermissions(member.permissions, member.role);
                  return (
                    <tr key={member.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E2430]">
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#0B1C30] dark:text-[#F8FAFC]">
                          {member.displayName || member.email.split('@')[0]}
                        </div>
                        <div className="text-xs font-mono text-[#64748B] dark:text-slate-400">
                          {member.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                        {getRoleLabel(member.role)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#464554] dark:text-slate-300 max-w-xs">
                        {perms
                          .filter((p) => p !== 'overview')
                          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                          .join(' · ') || 'Overview only'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleQuickToggleStatus(member)}
                          className={`text-xs font-semibold hover:underline ${
                            member.status === 'active'
                              ? 'text-[#4648D4] dark:text-[#818CF8]'
                              : 'text-[#93000A] dark:text-red-400'
                          }`}
                        >
                          {member.status === 'active' ? 'Active' : 'Suspended'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {confirmRemoveId === member.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member)}
                              className="h-8 px-2.5 rounded-md bg-[#BA1A1A] text-white text-xs font-semibold"
                            >
                              Confirm Remove
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmRemoveId(null)}
                              className="h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-[#464554] dark:text-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditMember(member)}
                              aria-label={`Edit role for ${member.email}`}
                              className="h-8 px-2.5 inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-[#0B1C30] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#262E3D]"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>Edit Role</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmRemoveId(member.id)}
                              aria-label={`Remove ${member.email}`}
                              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-[#464554] dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-[#93000A] dark:hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending / Revoked Invites Table */}
      {activeOrRevokedInvites.length > 0 && (
        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
              Pre-Assigned Invites
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-400">
              Waiting for the invited staff member to sign up or sign in with a verified email.
            </p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeOrRevokedInvites.map((inv) => (
              <div
                key={inv.id}
                className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-medium text-[#0B1C30] dark:text-[#F8FAFC]">
                    {inv.displayName ? `${inv.displayName} · ` : ''}
                    <span className="font-mono text-xs">{inv.email}</span>
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-slate-400">
                    Assigned role: <span className="font-semibold">{getRoleLabel(inv.role)}</span> ·{' '}
                    Status: <span className="capitalize font-semibold">{inv.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {inv.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => revokeTeamInvite(inv.id, currentEmail)}
                      className="h-8 px-3 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-[#464554] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2430]"
                    >
                      Revoke
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteTeamInvite(inv.id)}
                    aria-label={`Delete invite for ${inv.email}`}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-[#64748B] hover:text-[#93000A] dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Access Requests cleanup list */}
      {accessRequests.some((r) => r.status === 'rejected') && (
        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
            Rejected Access Requests
          </h3>
          <div className="space-y-2">
            {accessRequests
              .filter((r) => r.status === 'rejected')
              .map((req) => (
                <div key={req.id} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#464554] dark:text-slate-300">{req.email}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openApproveModal(req)}
                      className="font-semibold text-[#4648D4] dark:text-[#818CF8] hover:underline"
                    >
                      Assign Role
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAccessRequest(req.id)}
                      className="text-[#64748B] hover:text-[#93000A] dark:hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Approve Access Request Modal */}
      {approvingReq && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 dark:bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleApproveSubmit}
            className="w-full max-w-2xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 my-8"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                  Assign Role &amp; Approve User
                </h2>
                <p className="text-xs font-mono text-[#64748B] dark:text-slate-400 mt-0.5">
                  {approvingReq.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApprovingReq(null)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={approveName}
                  onChange={(e) => setApproveName(e.target.value)}
                  placeholder="Staff member name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                  Role Preset *
                </label>
                <select
                  value={approveRole}
                  onChange={(e) =>
                    handleRoleSelectChange(
                      e.target.value as AdminRole,
                      setApproveRole,
                      setApprovePerms,
                    )
                  }
                  className={inputClass}
                >
                  {ADMIN_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                Granular Permissions ({approvePerms.length}/{ALL_PERMISSIONS.length})
              </div>
              {renderPermissionGrid(approvePerms, (perm) =>
                togglePermissionInList(perm, approvePerms, setApprovePerms, setApproveRole),
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setApprovingReq(null)}
                className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#464554] dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={approvingSaving}
                className="h-10 px-5 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-60"
              >
                {approvingSaving ? 'Activating...' : 'Approve & Activate Access'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Existing Member Role Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 dark:bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleEditMemberSubmit}
            className="w-full max-w-2xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 my-8"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                  Edit Role &amp; Permissions
                </h2>
                <p className="text-xs font-mono text-[#64748B] dark:text-slate-400 mt-0.5">
                  {editingMember.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                  Role Preset
                </label>
                <select
                  value={editRole}
                  onChange={(e) =>
                    handleRoleSelectChange(
                      e.target.value as AdminRole,
                      setEditRole,
                      setEditPerms,
                    )
                  }
                  className={inputClass}
                >
                  {ADMIN_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC] mb-1.5">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as AdminMemberStatus)}
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">
                Permissions ({editPerms.length}/{ALL_PERMISSIONS.length})
              </div>
              {renderPermissionGrid(editPerms, (perm) =>
                togglePermissionInList(perm, editPerms, setEditPerms, setEditRole),
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#464554] dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editingSaving}
                className="h-10 px-5 rounded-lg bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] dark:hover:bg-[#818CF8] disabled:opacity-60"
              >
                {editingSaving ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
