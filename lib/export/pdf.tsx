"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatDuration } from "@/lib/utils";
import type { Story } from "@/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#0a0f14",
    color: "#e2e8f0",
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4a9eff",
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 20,
    color: "#94a3b8",
  },
  section: {
    marginTop: 16,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "bold",
    color: "#4a9eff",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  body: {
    fontSize: 10,
    marginBottom: 10,
    color: "#e2e8f0",
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: "#64748b",
    textAlign: "center",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    marginVertical: 16,
  },
});

interface ScriptPDFProps {
  story: Story;
}

export function ScriptPDF({ story }: ScriptPDFProps) {
  const script = story.script;
  const upvotes = story.upvotes ?? story.score ?? 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{story.title}</Text>
        <Text style={styles.subtitle}>
          r/{story.subreddit || "unknown"} | {upvotes.toLocaleString()} upvotes | By {story.author || "Anonymous"}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.section}>Hook (0:00 - 0:07)</Text>
        <Text style={styles.body}>{script?.hook || "N/A"}</Text>

        <Text style={styles.section}>Setup (0:07 - 0:40)</Text>
        <Text style={styles.body}>{script?.setup || "N/A"}</Text>

        <Text style={styles.section}>Conflict (0:40 - 2:00)</Text>
        <Text style={styles.body}>{script?.conflict || "N/A"}</Text>

        <Text style={styles.section}>Escalation (2:00 - 4:30)</Text>
        <Text style={styles.body}>{script?.escalation || "N/A"}</Text>

        <Text style={styles.section}>Revenge (4:30 - 7:30)</Text>
        <Text style={styles.body}>{script?.revenge || "N/A"}</Text>

        <Text style={styles.section}>Outcome (7:30 - 9:00)</Text>
        <Text style={styles.body}>{script?.outcome || "N/A"}</Text>

        <Text style={styles.section}>CTA (9:00+)</Text>
        <Text style={styles.body}>{script?.cta || "N/A"}</Text>

        <View style={styles.divider} />

        <Text style={styles.subtitle}>
          Word Count: {script?.word_count || 0} | Est. Duration: {script ? formatDuration(script.estimated_duration) : "N/A"}
        </Text>

        <Text style={styles.footer}>
          Exported from YouTube Content System | {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
}

export { pdf } from "@react-pdf/renderer";
