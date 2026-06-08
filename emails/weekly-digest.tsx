import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";

interface Package {
  packageName: string;
  currentVersion: string;
  latestVersion: string;
  isMajor: boolean;
}

interface Project {
  repoOwner: string;
  repoName: string;
  packages: Package[];
}

interface WeeklyDigestProps {
  projects: Project[];
}

export function WeeklyDigest({ projects }: WeeklyDigestProps) {
  const totalOutdated = projects.reduce((acc, p) => acc + p.packages.length, 0);

  return (
    <Html>
      <Head />
      <Preview>
        You have {totalOutdated.toString()} outdated packages across your repos
      </Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9f9f9" }}>
        <Container
          style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}
        >
          <Heading>Weekly Dependency Digest</Heading>
          <Text>
            You have {totalOutdated} outdated packages across {projects.length}{" "}
            repos.
          </Text>

          {projects.map((project) => (
            <Section key={`${project.repoOwner}/${project.repoName}`}>
              <Heading as="h2">
                {project.repoOwner}/{project.repoName}
              </Heading>
              {project.packages.map((pkg) => (
                <Row key={pkg.packageName}>
                  <Column>{pkg.packageName}</Column>
                  <Column>
                    {pkg.currentVersion} → {pkg.latestVersion}
                  </Column>
                  <Column>{pkg.isMajor ? "⚠️ Major" : ""}</Column>
                </Row>
              ))}
            </Section>
          ))}

          <Link href="https://patchboard.vercel.app/dashboard">
            Review updates on Patchboard
          </Link>
        </Container>
      </Body>
    </Html>
  );
}
