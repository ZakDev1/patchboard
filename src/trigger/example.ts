import { schedules, logger } from "@trigger.dev/sdk/v3";
import { db } from "@/db";
import { profiles, projects } from "@/db/schema";
import { createSnapshot } from "@/lib/snapshots/create-snapshot";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encrypt";

export const weeklyDependencyScan = schedules.task({
  id: "weekly-dependency-scan",
  cron: "0 9 * * 1",
  maxDuration: 300,
  run: async () => {
    const allProjects = await db.select().from(projects);

    logger.log(`Scanning ${allProjects.length} projects`);

    for (const project of allProjects) {
      try {
        const [profile] = await db.select().from(profiles).where(eq(profiles.id, project.userId));

        const accessToken = decrypt(profile.githubAccessToken);

        await createSnapshot(project.id, project.repoOwner, project.repoName, accessToken);
        logger.log(`Scanned ${project.repoOwner}/${project.repoName}`);
      } catch (error) {
        logger.error(`Failed to scan ${project.repoOwner}/${project.repoName}`, { error });
      }
    }
  },
});
