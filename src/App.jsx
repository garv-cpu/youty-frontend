import React, { useState, useEffect } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const extractVideoId = (url) => {
    const regExp =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : "";
  };

  useEffect(() => {
    if (metadata) {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [metadata]);

  
  const handleUrlChange = (e) => {
    const input = e.target.value;
    setUrl(input);
    const id = extractVideoId(input);
    setVideoId(id);
    setMetadata(null);
    setError("");
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!videoId) return;
      try {
        const response = await fetch(
          `https://youty-backend-1.onrender.com/metadata?url=${encodeURIComponent(
            url
          )}`
        );
        if (!response.ok) throw new Error("Failed to fetch metadata");
        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error(err);
        setMetadata(null);
      }
    };
    fetchMetadata();
  }, [videoId]);

  const handleDownload = async () => {
    if (!url || !videoId) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://youty-backend-1.onrender.com/download?url=${encodeURIComponent(
          url
        )}`
      );
      if (!response.ok) throw new Error("Failed to download");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : "audio.mp3";

      link.download = filename;
      link.click();
    } catch (err) {
      console.error(err);
      setError("Failed to convert video.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#15202B] flex items-center justify-center px-4">
      <div className="bg-[#192734] shadow-xl rounded-2xl p-6 w-full max-w-md text-white">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6 text-center text-[#1DA1F2]">
          You are at Youty!
        </h1>

        <input
          type="text"
          placeholder="Paste YouTube URL..."
          value={url}
          onChange={handleUrlChange}
          className="w-full p-3 rounded-md bg-[#253341] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1DA1F2] mb-4"
        />

        {videoId && (
          <>
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt="Thumbnail"
              className="w-full rounded-md mb-4"
            />
            {metadata && (
              <div className="mb-4">
                <h2 className="text-lg font-bold text-white mb-2">
                  {metadata.title}
                </h2>
                <p className="text-sm text-gray-400 whitespace-pre-line line-clamp-4">
                  {metadata.description}.
                </p>
              </div>
            )}
          </>
        )}

        <button
          onClick={handleDownload}
          disabled={loading}
          className={`w-full p-3 rounded-md font-semibold transition duration-200 ${
            loading
              ? "bg-[#1DA1F2]/70 cursor-not-allowed"
              : "bg-[#1DA1F2] hover:bg-[#1A91DA]"
          }`}
        >
          {loading ? "Converting..." : "Convert to MP3"}
        </button>
            
        {error && (
          <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
        )}

        <p className="text-gray-400 text-xs text-center mt-6">
          By using this tool, you agree not to violate YouTube's Terms of
          Service.
        </p>
        <p className="text-gray-400 text-xs text-center mt-1">
          Converting may take a few seconds.
        </p>
      </div>
    </div>
  );
}

export default App;
