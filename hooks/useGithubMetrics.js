import { useState, useEffect } from 'react'
import axios from 'axios'

export const useGitHubMetrics = () => {
  const [data, setData] = useState({
    pullRequests: [],
    reviews: [],
    commits: [],
    loading: true,
    error: null
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prResponse, reviewsResponse, commitsResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/pullrequests'),
          axios.get('http://localhost:8080/api/getallreviews'),
          axios.get('http://localhost:8080/api/getallcommits')
        ])

        setData({
          pullRequests: prResponse.data.data || [],
          reviews: reviewsResponse.data || [],
          commits: commitsResponse.data || [],
          loading: false,
          error: null
        })
      } catch (error) {
        console.error("Error fetching GitHub metrics:", error)
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
      }
    }

    fetchData()
  }, [])

  return data
}
