import { AppLayout } from '@/components/app-layout';
import { getNewsletter } from '@/app/actions';

export default async function NewsletterEditPage({ params }: { params: { id: string } }) {
  const newsletter = await getNewsletter(params.id);

  if (!newsletter) {
    return <div>Newsletter not found.</div>;
  }
  
  return <AppLayout initialNewsletter={newsletter} />;
}
