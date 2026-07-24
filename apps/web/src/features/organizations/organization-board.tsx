'use client';

import type { OrganizationListItem } from '@/lib/api/types';
import { OrganizationCard } from '@/features/organizations/organization-card';

type OrganizationBoardProps = {
  organizations: OrganizationListItem[];
  onOpen: (organizationId: string) => void;
};

/** Flat card grid — organizations have no workflow stages to columnize. */
export function OrganizationBoard({ organizations, onOpen }: OrganizationBoardProps) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <ul className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {organizations.map((organization) => (
          <li key={organization.id} className="min-h-0">
            <div
              role="button"
              tabIndex={0}
              className="flex h-full w-full cursor-pointer text-left"
              onClick={() => onOpen(organization.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpen(organization.id);
                }
              }}
            >
              <OrganizationCard organization={organization} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
