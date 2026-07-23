'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/client';
import {
  createProvisioningRequest,
  type ProvisioningRequest,
  type ToonExpoModule,
} from '@/lib/api/toonexpo';
import type { OrganizationType } from '@/lib/api/types';
import { Dialog } from '@/components/ui/dialog';
import { showToast } from '@/components/ui/toast';
import {
  availableModulesForCompanyType,
  defaultModulesForCompanyType,
} from '@/features/toonexpo/constants';

type ProvisioningRequestDialogProps = {
  open: boolean;
  organizationId: string;
  eventCycleId: string;
  companyType: Extract<OrganizationType, 'BUILDER' | 'PARTNER'>;
  onClose: () => void;
  onCreated: (request: ProvisioningRequest) => void;
};

export function ProvisioningRequestDialog({
  open,
  organizationId,
  eventCycleId,
  companyType,
  onClose,
  onCreated,
}: ProvisioningRequestDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <ProvisioningRequestDialogInner
      key={companyType}
      organizationId={organizationId}
      eventCycleId={eventCycleId}
      companyType={companyType}
      onClose={onClose}
      onCreated={onCreated}
    />
  );
}

type ProvisioningRequestDialogInnerProps = Omit<ProvisioningRequestDialogProps, 'open'>;

function ProvisioningRequestDialogInner({
  organizationId,
  eventCycleId,
  companyType,
  onClose,
  onCreated,
}: ProvisioningRequestDialogInnerProps) {
  const t = useTranslations('toonexpo');
  const tCommon = useTranslations('common');
  const [selectedModules, setSelectedModules] = useState<ToonExpoModule[]>(() =>
    defaultModulesForCompanyType(companyType),
  );
  const [busy, setBusy] = useState(false);

  function toggleModule(module: ToonExpoModule) {
    setSelectedModules((prev) =>
      prev.includes(module) ? prev.filter((item) => item !== module) : [...prev, module],
    );
  }

  async function handleSubmit() {
    if (selectedModules.length === 0) {
      showToast(t('account.modulesRequired'), 'error');
      return;
    }

    setBusy(true);
    try {
      const request = await createProvisioningRequest({
        organizationId,
        eventCycleId,
        companyType,
        requestedModules: selectedModules,
      });
      onCreated(request);
      onClose();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : tCommon('unexpectedError'), 'error');
    } finally {
      setBusy(false);
    }
  }

  const modules = availableModulesForCompanyType(companyType);

  return (
    <Dialog
      open
      title={t('account.requestDialogTitle')}
      description={t('account.requestDialogDescription')}
      confirmLabel={busy ? tCommon('saving') : t('account.requestSubmit')}
      cancelLabel={tCommon('cancel')}
      busy={busy}
      onConfirm={() => void handleSubmit()}
      onCancel={onClose}
    >
      <fieldset className="mt-3 flex flex-col gap-2">
        <legend className="text-xs font-medium text-[var(--color-muted)]">
          {t('account.modulesLabel')}
        </legend>
        {modules.map((module) => (
          <label key={module} className="flex items-center gap-2 text-sm text-[var(--color-fg)]">
            <input
              type="checkbox"
              checked={selectedModules.includes(module)}
              onChange={() => toggleModule(module)}
              disabled={busy}
            />
            {t(`modules.${module}`)}
          </label>
        ))}
      </fieldset>
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        {t(`companyType.${companyType}`)}
      </p>
    </Dialog>
  );
}
