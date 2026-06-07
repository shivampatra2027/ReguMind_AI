import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const Documents = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${apiBaseUrl}/documents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-100 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold text-slate-900">
          Document History
        </h1>

        <p className="mt-2 text-slate-600">
          Previously uploaded regulatory documents.
        </p>

        <div className="mt-8 space-y-4">
          {documents.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <p className="text-slate-500">
                No documents uploaded yet.
              </p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl bg-white p-6 shadow-lg"
              >
                <h2 className="font-semibold text-lg">
                  📄 {doc.originalFileName}
                </h2>

                <p className="mt-2 text-blue-600">
                  Status: {doc.status}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Uploaded:{" "}
                  {new Date(doc.createdAt).toLocaleString()}
                </p>
                <div className="mt-4 flex items-center justify-between">
      <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
        {doc.status}
      </span>

      <span className="text-sm text-slate-500">
        {new Date(doc.createdAt).toLocaleDateString()}
      </span>
    </div>

                <div className="mt-5 flex justify-end">
                  <Link
                    to={`/analysis/${doc.id}`}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-105"
                  >
                    View Analysis
                  </Link>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default Documents;
