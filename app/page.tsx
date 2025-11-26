import { HomeContent } from '@/components/HomeContent';
import { getAllPosts } from '@/lib/blog';

export default function Home() {
  const latestPosts = getAllPosts().slice(0, 3);

  return <HomeContent latestPosts={latestPosts} />;
}
