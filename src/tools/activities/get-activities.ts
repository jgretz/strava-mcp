import { z } from "zod";
import { defineTool } from "../types.ts";
import { listActivities } from "../../api/activities.ts";
import { mapActivity, toSummary } from "./map-activity.ts";
import { formatActivityLine, capOutput, compactJson } from "../../format.ts";

export const getActivities = defineTool({
  name: "get_activities",
  description:
    "List recent Strava activities with pagination and date filtering.",
  inputSchema: {
    page: z.number().optional().describe("Page number (default 1)"),
    perPage: z
      .number()
      .optional()
      .describe("Results per page (default 20, max 200)"),
    before: z
      .number()
      .optional()
      .describe("Unix timestamp — only activities before this time"),
    after: z
      .number()
      .optional()
      .describe("Unix timestamp — only activities after this time"),
    detail: z
      .enum(["basic", "splits", "full"])
      .optional()
      .describe(
        'Level of detail: "basic" (default) returns one-liner per activity, "splits" adds splits/laps, "full" returns all fields as JSON',
      ),
  },
  async handler({ page, perPage, before, after, detail }) {
    const limit = perPage ?? 20;
    const result = await listActivities({
      page,
      perPage: limit,
      before,
      after,
    });
    if (!result.ok) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Failed to list activities: ${result.error}`,
          },
        ],
        isError: true,
      };
    }

    const level = detail ?? "basic";

    if (level === "basic") {
      const lines = result.value.map((a) => formatActivityLine(toSummary(a)));
      const text = `## Activities (${result.value.length})\n${lines.join("\n")}`;
      return {
        content: [{ type: "text" as const, text: capOutput(text) }],
      };
    }

    const activities = result.value.map((a) => mapActivity(a, level));
    return {
      content: [
        { type: "text" as const, text: capOutput(compactJson(activities)) },
      ],
    };
  },
});
