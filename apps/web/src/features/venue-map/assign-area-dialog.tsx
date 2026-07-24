'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import { listDeals } from '@/lib/api/deals';
import { listPartners } from '@/lib/api/partners';
import type { DealListItem, PartnerListItem } from '@/lib/api/types';
import { createSpaceAllocation } from '@/lib/api/venue-map';
import { Button } from '@/components/ui/button';
import { Field, SearchInput } from '@/components/ui/field';
import { ModalFrame } from '@/components/ui/modal-frame';
import { showToast } from '@/components/ui/toast';

type AssignTab = 'builders' | 'partners';

type AssignAreaDialogProps = {
  open: boolean;
  areaId: string;
  cycleId: string;
  onAssigned: () => void;
  onClose: () => void;
};

export function AssignAreaDialog({
  open,
  areaId,
  cycleId,
  onAssigned,
  onClose,
}: AssignAreaDialogProps) {
  const [sessionKey, setSessionKey] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSessionKey((key) => key + 1);
    }
  }

  return (
    <AssignAreaDialogInner
      key={sessionKey}
      open={open}
      areaId={areaId}
      cycleId={cycleId}
      onAssigned={onAssigned}
      onClose={onClose}
    />
  );
}

type AssignAreaDialogInnerProps = {
  open: boolean;
  areaId: string;
  cycleId: string;
  onAssigned: () => void;
  onClose: () => void;
};

function AssignAreaDialogInner({
  open,
  areaId,
  cycleId,
  onAssigned,
  onClose,
}: AssignAreaDialogInnerProps) {
  const t = useTranslations('venueMap');
  const tCommon = useTranslations('common');
  const [tab, setTab] = useState<AssignTab>('builders');
  const [search, setSearch] = useState('');
  const [deals, setDeals] = useState<DealListItem[]>([]);
  const [partners, setPartners] = useState<PartnerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    void Promise.all([listDeals({ cycleId }), listPartners({ cycleId })])
      .then(([dealItems, partnerItems]) => {
        if (!cancelled) {
          setDeals(dealItems.filter((deal) => deal.stage !== 'LOST'));
          setPartners(partnerItems);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, areaId, cycleId, tCommon]);

  const filteredDeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return deals;
    }
    return deals.filter((deal) => deal.organization.name.toLowerCase().includes(q));
  }, [deals, search]);

  const filteredPartners = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return partners;
    }
    return partners.filter((partner) => partner.organization.name.toLowerCase().includes(q));
  }, [partners, search]);

  async function assignBuilder(dealId: string) {
    setBusyId(dealId);
    try {
      await createSpaceAllocation(areaId, { builderDealId: dealId });
      onAssigned();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function assignPartner(partnerId: string) {
    setBusyId(partnerId);
    try {
      await createSpaceAllocation(areaId, { partnerParticipationId: partnerId });
      onAssigned();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ModalFrame
      open={open}
      onClose={onClose}
      busy={busyId !== null}
      labelledBy="assign-area-title"
      panelClassName="flex max-h-[80vh] max-w-md flex-col overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-lift)]"
    >
      <div className="border-b border-[var(--color-border)] px-4 py-3">
        <h2 id="assign-area-title" className="text-base font-semibold text-[var(--color-fg)]">
          {t('assign.title')}
        </h2>
        <div className="mt-3 flex gap-2">
          <Button
            variant={tab === 'builders' ? 'primary' : 'secondary'}
            onClick={() => setTab('builders')}
          >
            {t('assign.builders')}
          </Button>
          <Button
            variant={tab === 'partners' ? 'primary' : 'secondary'}
            onClick={() => setTab('partners')}
          >
            {t('assign.partners')}
          </Button>
        </div>
        <div className="mt-3">
          <Field label={t('assign.search')} htmlFor="assign-search">
            <SearchInput
              id="assign-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('assign.searchPlaceholder')}
            />
          </Field>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {loading ? (
          <p className="py-4 text-sm text-[var(--color-muted)]">{tCommon('loading')}</p>
        ) : null}
        {!loading && tab === 'builders' ? (
          filteredDeals.length === 0 ? (
            <p className="py-4 text-sm text-[var(--color-muted)]">{t('assign.emptyBuilders')}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {filteredDeals.map((deal) => (
                <li
                  key={deal.id}
                  className="flex items-center justify-between gap-2 rounded px-2 py-2 hover:bg-[var(--color-bg)]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--color-fg)]">
                      {deal.organization.name}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">{deal.stage}</p>
                  </div>
                  <Button
                    variant="primary"
                    disabled={busyId !== null}
                    onClick={() => void assignBuilder(deal.id)}
                  >
                    {busyId === deal.id ? tCommon('saving') : t('assign.pick')}
                  </Button>
                </li>
              ))}
            </ul>
          )
        ) : null}
        {!loading && tab === 'partners' ? (
          filteredPartners.length === 0 ? (
            <p className="py-4 text-sm text-[var(--color-muted)]">{t('assign.emptyPartners')}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {filteredPartners.map((partner) => (
                <li
                  key={partner.id}
                  className="flex items-center justify-between gap-2 rounded px-2 py-2 hover:bg-[var(--color-bg)]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--color-fg)]">
                      {partner.organization.name}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">{partner.stage}</p>
                  </div>
                  <Button
                    variant="primary"
                    disabled={busyId !== null}
                    onClick={() => void assignPartner(partner.id)}
                  >
                    {busyId === partner.id ? tCommon('saving') : t('assign.pick')}
                  </Button>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>
      <div className="border-t border-[var(--color-border)] px-4 py-3">
        <Button variant="secondary" onClick={onClose}>
          {tCommon('cancel')}
        </Button>
      </div>
    </ModalFrame>
  );
}
