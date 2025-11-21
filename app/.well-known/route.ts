export async function GET() {
  const config = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: ""
    },
    frame: {
      version: "1",
      name: "2048",
      iconUrl: "https://framerusercontent.com/images/2fA1A2q9aXqfVr5TjDfLv6n6s.png",
      homeUrl: "https://your-deployment-url.vercel.app",
      imageUrl: "https://framerusercontent.com/images/2fA1A2q9aXqfVr5TjDfLv6n6s.png",
      buttonTitle: "Play 2048",
      splashImageUrl: "https://framerusercontent.com/images/2fA1A2q9aXqfVr5TjDfLv6n6s.png",
      splashBackgroundColor: "#3b82f6",
      webhookUrl: "https://your-deployment-url.vercel.app/api/webhook",
      screenshotUrls: [
        "https://framerusercontent.com/images/2fA1A2q9aXqfVr5TjDfLv6n6s.png"
      ],
      primaryCategory: "games",
      tags: ["puzzle", "game", "2048", "numbers"],
      heroImageUrl: "https://framerusercontent.com/images/2fA1A2q9aXqfVr5TjDfLv6n6s.png",
      tagline: "Slide, merge, and compete!",
      ogTitle: "2048 on Base",
      ogDescription: "Play the classic 2048 puzzle game with leaderboard",
      ogImageUrl: "https://framerusercontent.com/images/2fA1A2q9aXqfVr5TjDfLv6n6s.png",
      subtitle: "The Classic Numbers Game",
      description: "Join the numbers and get to the 2048 tile! Compete on the leaderboard and show your puzzle skills."
    }
  };

  return Response.json(config);
}
