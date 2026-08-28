// Server entry for /c/[slug] - generates static params and renders client component.
// generateStaticParams MUST be exported from a server component for static export to
// enumerate the slugs at build time.

import PublicClinicClient from "./client";

export function generateStaticParams() {
  return [{ slug: "klinik-sehat" }];
}

export default function PublicClinicPage({ params }: { params: Promise<{ slug: string }> }) {
  return <PublicClinicClient params={params} />;
}
