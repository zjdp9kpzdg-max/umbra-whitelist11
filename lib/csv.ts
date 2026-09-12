import type { ApplicationStatus, Registration } from "@/lib/db";

function escapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function registrationsToCsv(
  rows: Registration[],
  filter?: ApplicationStatus
): string {
  const selected = filter ? rows.filter((row) => row.status === filter) : rows;
  const header = [
    "status",
    "wallet_address",
    "twitter_handle",
    "twitter_user_id",
    "liked",
    "retweeted",
    "submitted_at",
    "reviewed_at",
  ];
  const lines = [header.join(",")];
  for (const row of selected) {
    lines.push(
      [
        escapeCell(row.status),
        escapeCell(row.walletAddress ?? ""),
        escapeCell(row.twitterHandle),
        escapeCell(row.twitterUserId),
        row.liked ? "true" : "false",
        row.retweeted ? "true" : "false",
        escapeCell(row.submittedAt),
        escapeCell(row.reviewedAt ?? ""),
      ].join(",")
    );
  }
  return `${lines.join("\n")}\n`;
}
