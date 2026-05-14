import { githubFetch } from "./client";

interface Repo {
  id: number;
  full_name: string;
  owner: {
    login: string;
  };
  name: string;
  private: boolean;
  updated_at: string;
}

export async function fetchUserRepos(accessToken: string) {
  const github = githubFetch(accessToken);
  const response = await github("/user/repos?sort=updated&per_page=100&type=all");
  return response.map((repo: Repo) => ({
    id: repo.id,
    fullName: repo.full_name,
    owner: repo.owner.login,
    name: repo.name,
    private: repo.private,
    updatedAt: repo.updated_at,
  }));
}
