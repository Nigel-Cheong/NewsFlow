import { AppLayout } from '@/components/app-layout';

export default function NewsletterEditPage({ params }: { params: { id: string } }) {
  return <AppLayout newsletterId={params.id} />;
}
