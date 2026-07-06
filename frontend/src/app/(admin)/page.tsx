import { redirect } from 'next/navigation';

/**
 * Root-level admin redirect — strips locale, sends to /en/admin
 */
export default function AdminRootPage() {
  redirect('/en/admin');
}