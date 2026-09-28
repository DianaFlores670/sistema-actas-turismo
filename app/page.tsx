export default function Home() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Sistema de Generación de Actas
        </h1>

        <p className="mt-2 text-slate-600">
          Seleccione un tipo de acta desde el menú lateral.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Proyecto de Grado
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Generación de actas de defensa pública de Proyecto de Grado.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Docentes
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Los docentes serán administrados desde el panel de administración.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Documentos
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Los documentos se generarán únicamente cuando sean requeridos.
          </p>
        </div>
      </div>
    </div>
  );
}