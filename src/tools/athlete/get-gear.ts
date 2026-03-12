import { z } from "zod";
import { defineTool } from "../types.ts";
import { getGear as fetchGear } from "../../api/gear.ts";
import { formatGearLine, capOutput, compactJson } from "../../format.ts";
import type { Gear } from "../../types.ts";

export const getGear = defineTool({
  name: "get_gear",
  description:
    "Get details about one or more pieces of gear (shoes or bikes) by ID. Accepts a single ID or an array of IDs. Works for both active and retired gear.",
  inputSchema: {
    gearIds: z
      .union([z.string(), z.array(z.string())])
      .describe(
        'Gear ID or array of IDs (e.g. "b12345" for bikes, "g12345" for shoes)',
      ),
    detail: z
      .enum(["summary", "full"])
      .default("summary")
      .describe(
        "summary: one-liner per gear (default). full: complete gear data as compact JSON.",
      ),
  },
  async handler({ gearIds, detail }) {
    const ids = Array.isArray(gearIds) ? gearIds : [gearIds];
    const results = await Promise.all(ids.map((id) => fetchGear(id)));

    const errors: string[] = [];
    const gear: Gear[] = [];

    results.forEach((result, i) => {
      if (result.ok) {
        gear.push(result.value);
      } else {
        errors.push(`${ids[i]}: ${result.error}`);
      }
    });

    if (gear.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Failed to get gear: ${errors.join("; ")}`,
          },
        ],
        isError: true,
      };
    }

    if (detail === "summary") {
      const lines = gear.map((g) => formatGearLine(g));
      let text = lines.join("\n");
      if (errors.length > 0) {
        text += `\n\nErrors:\n${errors.join("\n")}`;
      }

      return {
        content: [{ type: "text" as const, text: capOutput(text) }],
      };
    }

    const response: Record<string, unknown> = { gear };
    if (errors.length > 0) {
      response.errors = errors;
    }

    return {
      content: [
        {
          type: "text" as const,
          text: capOutput(compactJson(response)),
        },
      ],
    };
  },
});
