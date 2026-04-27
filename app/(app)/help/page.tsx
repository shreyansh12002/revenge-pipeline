import { Card } from "@/components/ui/Card";
import { Key, BookOpen, AlertCircle, Info } from "lucide-react";

const faqSections = [
  {
    icon: Key,
    iconColor: "text-accent",
    title: "Getting Started",
    items: [
      {
        q: "How do I get an Apify API token?",
        a: "Go to apify.com/account and sign up for a free account. Navigate to Account → Integrations → API tokens. Copy your default token. The free tier includes 5GB of monthly actor runs, which is sufficient for testing."
      },
      {
        q: "How do I get an Anthropic API key?",
        a: "Visit console.anthropic.com and create an account. Navigate to the API Keys section and create a new key. You'll need to add a credit card for API access, though new accounts get complimentary credits to start."
      },
      {
        q: "How does the content pipeline work?",
        a: "The pipeline has five stages: (1) Scrape - collect stories from Reddit using Apify; (2) Score - analyze stories for viral potential using AI; (3) Script - generate a YouTube-ready script with dramatic pacing; (4) Package - create thumbnails, titles, and metadata; (5) Export - download all assets for video editing."
      },
      {
        q: "What are viral scores and how are they calculated?",
        a: "Viral scores range from 0-100 and predict a story's performance potential. The score considers: upvotes (weighted heavily), comment count, story length, emotional triggers (revenge, justice, betrayal), and audience appeal. Stories above 70 are considered high-potential."
      }
    ]
  },
  {
    icon: BookOpen,
    iconColor: "text-accent-secondary",
    title: "Pipeline Tips",
    items: [
      {
        q: "Which subreddits perform best?",
        a: "r/ProRevenge and r/NuclearRevenge consistently outperform others. r/AmITheAsshole is good for relationship drama. r/MaliciousCompliance works well for workplace content. Mix different types to keep your channel diverse."
      },
      {
        q: "What makes a story \"high retention\"?",
        a: "High retention stories have: strong emotional hooks in the first 10 seconds, escalating tension every 20-30 seconds, clear villain and protagonist, multiple plot twists, and a satisfying payoff. The best stories make viewers think \"I need to know what happens next.\""
      },
      {
        q: "How can I write better scripts?",
        a: "Focus on dramatic tone: use short punchy sentences during tension, longer pauses for emotional moments, build suspense with phrases like \"What happened next shocked everyone\", and always deliver a satisfying ending. The script should feel like a rollercoaster."
      },
      {
        q: "What export formats are available?",
        a: "You can export as JSON (script + metadata for custom workflows), as a formatted document (ready for narration), or as a complete package including script, titles, description, tags, and thumbnail prompts. The complete package is recommended for most workflows."
      }
    ]
  },
  {
    icon: AlertCircle,
    iconColor: "text-warning",
    title: "Troubleshooting",
    items: [
      {
        q: "I'm getting API key errors",
        a: "First, verify your keys are saved in Settings. For Apify, check if you've exceeded your monthly limit at apify.com/account. For Anthropic, ensure your account has available credits. Keys can be updated anytime in the Settings page."
      },
      {
        q: "Scrape isn't returning results",
        a: "This usually happens when: (1) The subreddit doesn't have recent active posts, (2) Your Apify quota is exhausted, (3) Reddit's rate limiting is blocking requests. Try a different subreddit or wait a few hours and retry. Check the logs for specific error messages."
      },
      {
        q: "Script generation is failing",
        a: "Ensure your Anthropic key is valid and has available credits. Long stories may hit token limits - try shorter stories. If the AI returns empty content, it might be a prompt issue - try regenerating with the same story."
      },
      {
        q: "Export isn't working",
        a: "Check that your story has completed both script and package stages. The export requires both to be finished. If downloading a JSON file, your browser might be blocking downloads - try a different browser or disable popup blockers."
      }
    ]
  },
  {
    icon: Info,
    iconColor: "text-accent",
    title: "About",
    items: [
      {
        q: "What version is RevengeHub?",
        a: "RevengeHub is currently in active development. Features are added regularly based on user feedback and performance data."
      },
      {
        q: "What are the best practices for YouTube thumbnails?",
        a: "Use bold, contrasting text on simple backgrounds. For revenge stories, use phrases like \"BIG MISTAKE\", \"INSTANT KARMA\", or \"HE REGRETS IT\". Limit text to 4-6 words maximum. Use emotional facial expressions or dramatic imagery."
      },
      {
        q: "How often should I post?",
        a: "Consistency is more important than frequency. Aim for 2-3 videos per week at minimum. The algorithm rewards channels that maintain a regular upload schedule. Quality over quantity - one great video beats three mediocre ones."
      },
      {
        q: "Can I customize the content style?",
        a: "Yes! The system generates scripts based on viral patterns, but you can edit scripts before export. You can also add custom subreddits to target specific niches. The more you use the system, the more you can tailor it to your channel's voice."
      }
    ]
  }
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Help Center</h1>
        <p className="text-text-secondary mt-2">Get the most out of RevengeHub</p>
      </div>

      <div className="grid gap-6">
        {faqSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 bg-surface-elevated rounded-lg`}>
                  <Icon size={20} className={section.iconColor} />
                </div>
                <h2 className="text-lg font-semibold text-text-primary">{section.title}</h2>
              </div>

              <div className="space-y-6">
                {section.items.map((item, index) => (
                  <div key={index} className="border-b border-border last:border-0 pb-6 last:pb-0">
                    <h3 className="font-medium text-text-primary mb-2">{item.q}</h3>
                    <p className="text-text-secondary leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-surface-elevated">
        <h3 className="font-semibold text-text-primary mb-3">Need More Help?</h3>
        <p className="text-text-secondary mb-4">
          If you can't find what you're looking for, check the project documentation or reach out for support.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://apify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary hover:border-accent transition-colors"
          >
            Apify Documentation
          </a>
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary hover:border-accent transition-colors"
          >
            Anthropic Console
          </a>
          <a
            href="https://www.reddit.com/r/ProRevenge"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary hover:border-accent transition-colors"
          >
            r/ProRevenge
          </a>
        </div>
      </Card>
    </div>
  );
}