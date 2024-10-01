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

  const uploadAssets = async (assets) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      assets.forEach((asset, index) => {
        formData.append("assets", asset.file);
        formData.append(`comments[${index}]`, asset.comment);
      });
      formData.append("shipId", slug);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/upload-assets`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        return response.data.assets;
      } else {
        throw new Error("Failed to upload assets");
      }
    } catch (err) {
      setError("Failed to upload assets");
      console.error(err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const uploadTemporaryAssets = async (assets) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      assets.forEach((asset, index) => {
        formData.append("assets", asset.file);
        formData.append(`comments[${index}]`, asset.comment);
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/upload-temporary-assets`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        return response.data.assets;
      } else {
        throw new Error("Failed to upload temporary assets");
      }
    } catch (err) {
      setError("Failed to upload temporary assets");
      console.error(err);
      throw err;
    } finally {
      setSubmitting(false);
    }
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
    uploadAssets,
    uploadTemporaryAssets,
  };
}
