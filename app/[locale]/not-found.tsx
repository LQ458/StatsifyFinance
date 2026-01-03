'use client';

// This is a workaround for a bug in Next.js where `unstable_setRequestLocale` is not
// automatically called on the not-found page, causing `useTranslations` to fail.
import {unstable_setRequestLocale} from 'next-intl/server';

export default function NotFound({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);

  return (
    <div>
      <h1>Not Found</h1>
      <p>The requested resource could not be found.</p>
    </div>
  );
}
