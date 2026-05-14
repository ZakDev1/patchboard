"use server";

import { fetchUserRepos } from "@/lib/github/fetch-user-repos";
import { getGithubToken } from "@/lib/github/get-token";
import { redirect } from "next/navigation";

export async function getUserRepos() {
  const auth = await getGithubToken();
  if (!auth) redirect("/login");
  return fetchUserRepos(auth.accessToken);
}
