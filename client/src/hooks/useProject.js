import { useState, useEffect } from "react";
import axios from "axios";
import { noop } from "@/lib/utils";

export function useProject(slug) {
  const [directoryStructure, setDirectoryStructure] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchDirectoryStructure = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/project-structure/${slug}`
      );
      setDirectoryStructure(response.data);
    } catch (err) {
      setError("Failed to fetch directory structure");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const readFile = async (filePath) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/site/${filePath}`
      );
      return response.data;
    } catch (err) {
      setError("Failed to read file");
      console.error(err);
      throw err;
    }
  };

  const updateFile = async (filePath, content, successCallback = noop) => {
    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/update-file`, {
        filePath,
        content,
      });
      successCallback();
    } catch (err) {
      setError("Failed to update file");
      console.error(err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteFile = async (filePath) => {
    try {
      await axios.delete(`http://localhost:3000/file/${filePath}`);
    } catch (err) {
      setError("Failed to delete file");
      console.error(err);
      throw err;
    }
  };

  const handledownloadzip = () => {
    const zipLink = `${import.meta.env.VITE_BACKEND_URL}/download/${slug}`;
    window.open(zipLink, "_blank");
  };

  useEffect(() => {
    fetchDirectoryStructure();
  }, [slug]);

  return {
    directoryStructure,
    fetchDirectoryStructure,
    readFile,
    updateFile,
    deleteFile,
    loading,
    error,
    submitting,
    handledownloadzip,
  };
}
