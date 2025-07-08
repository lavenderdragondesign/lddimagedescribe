// App.jsx
import React, { useState } from "react";
import { FileImage, PlayCircle, Copy } from "lucide-react";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState("");
  const [shortKeywords, setShortKeywords] = useState("");
  const [longKeywords, setLongKeywords] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    loadFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    loadFile(file);
  };

  const loadFile = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setDescription("");
    setShortKeywords("");
    setLongKeywords("");
    setMetaTitle("");
  };

  const generateDescription = async () => {
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);

    const res = await fetch("/.netlify/functions/generate", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    const descriptionText = data.text || "No description returned.";
    setDescription(descriptionText);
    setShortKeywords(generateShortTail(descriptionText));
    setLongKeywords(generateLongTail(descriptionText));
    setMetaTitle(generateMetaTitle(descriptionText));
    setLoading(false);
  };

  const generateShortTail = (text) => {
    return text
      .split(" ")
      .filter((w) => w.length > 4)
      .slice(0, 5)
      .join(", ");
  };

  const generateLongTail = (text) => {
    return text
      .match(/([^.?!]{5,80}[.?!])/g)?.slice(0, 2)
      .join(" ") || "";
  };

  const generateMetaTitle = (text) => {
    return text
      .split(" ")
      .slice(0, 6)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") + " | AI Generated";
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Image Description Generator</h1>

      <div
        className="w-full max-w-md h-64 border-4 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-gray-400"
        onClick={() => document.getElementById("fileInput").click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <FileImage className="w-12 h-12 mb-2" />
        <p>Drag & drop your image here, or click to browse</p>
        <input
          type="file"
          accept="image/*"
          id="fileInput"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {preview && (
        <div className="mt-4 flex flex-col items-center">
          <img src={preview} alt="Preview" className="w-48 h-48 object-contain rounded" />
          <button
            onClick={generateDescription}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            {loading ? "Generating..." : "Generate Description"}
          </button>
        </div>
      )}

      {description && (
        <div className="mt-6 w-full max-w-md bg-white p-4 rounded shadow space-y-4">
          <div>
            <h2 className="font-semibold">Description:</h2>
            <p className="text-gray-800 whitespace-pre-line">{description}</p>
            <button
              onClick={() => copyToClipboard(description)}
              className="mt-1 text-blue-600 flex items-center"
            >
              <Copy className="w-5 h-5 mr-1" /> Copy Description
            </button>
          </div>

          <div>
            <h2 className="font-semibold">Short-Tail Keywords:</h2>
            <p className="text-gray-700">{shortKeywords}</p>
            <button
              onClick={() => copyToClipboard(shortKeywords)}
              className="mt-1 text-blue-600 flex items-center"
            >
              <Copy className="w-5 h-5 mr-1" /> Copy Short Keywords
            </button>
          </div>

          <div>
            <h2 className="font-semibold">Long-Tail Keywords:</h2>
            <p className="text-gray-700">{longKeywords}</p>
            <button
              onClick={() => copyToClipboard(longKeywords)}
              className="mt-1 text-blue-600 flex items-center"
            >
              <Copy className="w-5 h-5 mr-1" /> Copy Long Keywords
            </button>
          </div>

          <div>
            <h2 className="font-semibold">Meta Title:</h2>
            <p className="text-gray-700">{metaTitle}</p>
            <button
              onClick={() => copyToClipboard(metaTitle)}
              className="mt-1 text-blue-600 flex items-center"
            >
              <Copy className="w-5 h-5 mr-1" /> Copy Meta Title
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md mt-8">
        <h2 className="text-xl font-semibold mb-2">FAQs</h2>
        <details className="mb-2">
          <summary className="font-medium">Is this free?</summary>
          <p className="pl-4 text-gray-700">
            Yep. No login required. It just works. 🧙‍♂️
          </p>
        </details>
      </div>
    </main>
  );
}

export default App;
