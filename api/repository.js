import { Octokit } from "@octokit/rest";

const createOctokit = (token) => {
  return new Octokit({
    auth: token,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
};

export const getRepositories = async (token, user) => {
  const octokit = createOctokit(token); 

  try {
    const response = await octokit.request(`GET /users/{username}/repos`, {
      username: user,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (response.status === 200) {
      return response;
    }
  } catch (error) {
    console.error("Error fetching repositories:", error);
  }
};
