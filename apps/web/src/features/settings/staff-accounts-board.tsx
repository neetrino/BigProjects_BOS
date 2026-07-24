'use client';

import type { UserAccount } from '@/lib/api/types';
import { StaffAccountCard } from '@/features/settings/staff-account-card';

type StaffAccountsBoardProps = {
  users: UserAccount[];
  currentUserId: string;
  onToggleStatus: (account: UserAccount) => void;
};

/** Flat card grid for staff accounts. */
export function StaffAccountsBoard({
  users,
  currentUserId,
  onToggleStatus,
}: StaffAccountsBoardProps) {
  return (
    <ul className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {users.map((account) => (
        <li key={account.id} className="min-h-0">
          <StaffAccountCard
            account={account}
            isCurrentUser={account.id === currentUserId}
            onToggleStatus={onToggleStatus}
          />
        </li>
      ))}
    </ul>
  );
}
