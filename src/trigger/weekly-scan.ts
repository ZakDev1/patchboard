import { schedules, logger } from "@trigger.dev/sdk/v3";
import { db } from "@/db";
import { packageReviews, profiles, projects, snapshots } from "@/db/schema";
import { createSnapshot } from "@/lib/snapshots/create-snapshot";
import { desc, eq } from "drizzle-orm";
import { decrypt } from "@/lib/encrypt";
import { resend } from "@/lib/email";
import { WeeklyDigest } from "@/emails/weekly-digest";

export const weeklyDependencyScan = schedules.task({
  id: "weekly-dependency-scan",
  cron: "0 9 * * 1",
  maxDuration: 300,
  run: async () => {
    const allProfiles = await db.select().from(profiles);

    for (const profile of allProfiles) {
      try {
        if (profile.plan === "free") {
          return;
        }

        const userProjects = await db
          .select()
          .from(projects)
          .where(eq(projects.userId, profile.id));

        if (userProjects.length === 0) continue;

        const digestProjects = [];
        for (const project of userProjects) {
          try {
            const accessToken = decrypt(profile.githubAccessToken);

            await createSnapshot(
              project.id,
              project.repoOwner,
              project.repoName,
              accessToken,
            );

            const [latestSnapshot] = await db
              .select()
              .from(snapshots)
              .where(eq(snapshots.projectId, project.id))
              .orderBy(desc(snapshots.capturedAt))
              .limit(1);

            if (latestSnapshot) {
              const packages = await db
                .select()
                .from(packageReviews)
                .where(eq(packageReviews.snapshotId, latestSnapshot.id));

              if (packages.length > 0) {
                digestProjects.push({
                  repoOwner: project.repoOwner,
                  repoName: project.repoName,
                  packages,
                });
              }
            }
            logger.log(`Scanned ${project.repoOwner}/${project.repoName}`);
          } catch (error) {
            logger.error(
              `Failed to scan ${project.repoOwner}/${project.repoName}`,
              { error },
            );
          }
        }
        if (digestProjects.length > 0) {
          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: profile.email,
            subject: `Your weekly dependency digest`,
            react: WeeklyDigest({ projects: digestProjects }),
          });

          logger.log(`Send digest to ${profile.githubUsername}`);
        }
      } catch (error) {
        logger.error(`Failed to process user ${profile.id}`, { error });
      }
    }
  },
});
