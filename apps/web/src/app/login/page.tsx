import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/app/login/login-form';
import { fetchCurrentUserServer } from '@/lib/api/auth-server';
import { APP_PORTAL_ROOT_ID } from '@/lib/portal-root';

export default async function LoginPage() {
  const user = await fetchCurrentUserServer();
  if (user) {
    redirect('/builder-sales');
  }

  const t = await getTranslations('login');
  const tNav = await getTranslations('nav');

  return (
    <div className="desktop-fluid-frame">
      <div className="desktop-fluid-stage">
        <main className="flex min-h-fluid-screen items-center justify-center px-6 py-16">
          <div className="page-enter w-full max-w-[26rem]">
            <div className="mb-7 flex justify-center">
              <div className="inline-flex items-center gap-3.5">
                <div className="-translate-x-0.5 flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
                  <Image
                    src="/brand-logo.webp"
                    alt=""
                    width={38}
                    height={38}
                    className="size-[38px] object-contain"
                  />
                </div>
                <p className="brand-mark m-0 text-[calc(1.4rem+0.5px)] leading-none tracking-tight">
                  {tNav('brand')}
                </p>
              </div>
            </div>

            <div className="surface-card rounded-[1.4rem] p-8">
              <h1 className="font-[family-name:var(--font-display)] text-[calc(2.35rem+0.5px)] font-medium leading-none tracking-tight text-[var(--color-fg)]">
                {t('title')}
              </h1>
              <div className="mt-4 h-px w-14 bg-gradient-to-r from-[var(--color-brass)] to-transparent" />
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                {t('description')}
              </p>
              <div className="mt-8">
                <LoginForm />
              </div>
            </div>
          </div>
        </main>
        <div id={APP_PORTAL_ROOT_ID} />
      </div>
    </div>
  );
}
