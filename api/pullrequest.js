export const getPullRequests = async () => {
    try {
        const response = await fetch("http://localhost:8080/api/pullrequests", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch pull requests");
        }
        return data; 
    } catch (error) {
        console.error("Error fetching pull requests:", error);
        throw error;
    }
}