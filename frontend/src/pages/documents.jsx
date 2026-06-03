const Documents = () => {
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

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="font-semibold text-lg">
              📄 RBI_KYC_Guidelines.pdf
            </h2>

            <p className="mt-2 text-green-600">
              Status: Uploaded
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="font-semibold text-lg">
              📄 SEBI_Compliance.pdf
            </h2>

            <p className="mt-2 text-yellow-600">
              Status: Processing
            </p>
          </div>

        </div>

      </div>
    </main>
  );
};

export default Documents;