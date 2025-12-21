import Script from 'next/script';

interface GameStructuredDataProps {
  name: string;
  description: string;
  url: string;
  image: string;
  genre?: string[];
  playMode?: 'SinglePlayer' | 'MultiPlayer';
  applicationCategory?: string;
}

export function GameStructuredData({
  name,
  description,
  url,
  image,
  genre = ['Puzzle'],
  playMode = 'SinglePlayer',
  applicationCategory = 'Game',
}: GameStructuredDataProps) {
  const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name,
    description,
    url,
    image,
    genre,
    playMode: `https://schema.org/${playMode}`,
    applicationCategory,
    gamePlatform: ['Web Browser'],
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
      availability: 'https://schema.org/InStock',
    },
    author: {
      '@type': 'Organization',
      name: 'ADA Lab',
      url: 'https://adalabtech.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ADA Lab',
      url: 'https://adalabtech.com',
    },
  };

  return (
    <Script
      id="game-structured-data"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(gameSchema),
      }}
    />
  );
}
