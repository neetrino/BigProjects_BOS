'use client';

import type { ContactListItem } from '@/lib/api/types';
import { ContactCard } from '@/features/organizations/contact-card';

type ContactsBoardProps = {
  contacts: ContactListItem[];
  onOpenOrganization: (organizationId: string) => void;
};

/** Flat card grid for contacts. */
export function ContactsBoard({ contacts, onOpenOrganization }: ContactsBoardProps) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <ul className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {contacts.map((contact, index) => (
          <li key={contact.id} className="min-h-0">
            <div
              role="button"
              tabIndex={0}
              className="flex h-full w-full cursor-pointer text-left"
              onClick={() => onOpenOrganization(contact.organization.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpenOrganization(contact.organization.id);
                }
              }}
            >
              <ContactCard contact={contact} enterIndex={index} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
