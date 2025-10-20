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

export const addRepository = async (repository_name, github_username) => {
  try {
    const response = await fetch("http://localhost:8080/api/repositories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repository_name,
        github_username,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add user");
    }

    return data;
  } catch (error) {
    console.error("Error adding user:", error.message);
    throw error;
  }
}