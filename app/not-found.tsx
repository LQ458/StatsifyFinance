import {redirect} from 'next/navigation';
import {defaultLocale} from './i18n';

// This page is not rendered, but it is necessary to prevent a build error.
// It redirects to the default locale's not-found page.
export default function RootNotFound() {
  redirect(`/${defaultLocale}/not-found`);
}
