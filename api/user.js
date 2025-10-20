export const addUser = async (github_username, github_access_token) => {
  try {
    const response = await fetch("http://localhost:8080/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        github_username,
        github_access_token,
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
