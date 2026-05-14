import AddProjectForm from "@/components/add-project-form";
import ProjectCard from "@/components/project-card";
import { getProjects } from "../actions/projects";

export default async function DashboardPage() {
  const projects = await getProjects();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Projects</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Track dependency updates across your repos</p>
        </div>
        <AddProjectForm />
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed border-zinc-300 rounded-xl py-16 text-center">
          <p className="text-sm text-zinc-400">No projects yet</p>
          <p className="text-xs text-zinc-400 mt-1">Add a GitHub repo to get started</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
