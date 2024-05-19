/// <reference types="node" />

import axios from "axios";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: apiUrl, // Replace with your environment variable for the base URL
});

export const fetchSites = async () => {
  try {
    const response = await api.get("/api/site"); // Adjust the endpoint as necessary
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch sites:", error);
    throw error;
  }
};

export const createSite = async (data: { name: string; url: string }) => {
  try {
    const response = await api.post("/api/crawl", data); // Adjust the endpoint as necessary
    return response.data.data;
  } catch (error) {
    console.error("Failed to creating site:", error);
    throw error;
  }
};

export const getAnswer = async (data: { question: string; id: string }) => {
  try {
    const response = await api.post("/api/answer-question", data); // Adjust the endpoint as necessary
    return response.data.data;
  } catch (error) {
    console.error("Failed to creating site:", error);
    throw error;
  }
};

export default api;
