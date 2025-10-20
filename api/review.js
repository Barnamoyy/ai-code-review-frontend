export const getReviews = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/getallreviews", {
      method: "GET",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch commits");
    }
    return data;
  } catch (error) {
    console.error("Error getting reviews: ", error); 
  }
};
