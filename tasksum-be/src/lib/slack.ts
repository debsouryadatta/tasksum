// lib/slack.ts
import axios from "axios";

export async function sendToSlack(summary: string): Promise<boolean> {
  try {
    if (!process.env.SLACK_WEBHOOK_URL) {
      console.error("SLACK_WEBHOOK_URL is not set");
      return false;
    }
    
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: `*Todo Summary*\n${summary}`,
    });
    
    return true;
  } catch (error) {
    console.error("Failed to send to Slack:", error);
    return false;
  }
}
