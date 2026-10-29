import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page not found | NoteHub',
  description: 'Sorry, the page you are looking for does not exist.',
  openGraph: {
    title: '404 - Page not found | NoteHub',
    description: 'Sorry, the page you are looking for does not exist.',
    url: 'https://09-auth-three-ruby.vercel.app/404',
    images: [
      {
        url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
        width: 1200,
        height: 630,
        alt: 'NoteHub application preview',
      },
    ],
  },
};

export default function NotFound() {
  return (
    <>
      <h1>404 - Page not found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
    </>
  );
}
