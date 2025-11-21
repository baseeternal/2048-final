export const metadata = {
  title: '2048 Game',
  description: 'Play the classic 2048 puzzle game with leaderboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
