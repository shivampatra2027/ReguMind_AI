import { useState } from "react";

const UploadPDF = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    console.log("Selected File:", file);

    // Backend API call will go here later
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-100 p-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-xl">

        <h1 className="text-4xl font-bold text-slate-900">
          Upload Regulatory Document
        </h1>

        <p className="mt-3 text-slate-600">
          Upload a PDF document for AI-powered compliance analysis.
        </p>

        <div className="mt-8 rounded-2xl border-2 border-dashed border-blue-300 p-10 text-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full"
          />

          {file && (
            <p className="mt-4 text-blue-700 font-medium">
              Selected: {file.name}
            </p>
          )}
        </div>

        <button
          onClick={handleUpload}
          className="mt-8 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
        >
          Upload PDF
        </button>
      </div>
    </main>
  );
};

export default UploadPDF;