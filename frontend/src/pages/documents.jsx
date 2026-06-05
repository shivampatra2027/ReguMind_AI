import { useEffect, useState } from "react";
import axios from "axios";

const Documents = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/documents",
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
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default Documents;