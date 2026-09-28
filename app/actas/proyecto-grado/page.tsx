import { supabase } from "@/lib/supabase";
import FormularioProyectoGrado from "./FormularioProyectoGrado";

export default async function ProyectoGradoPage() {
  const { data: docentes, error } = await supabase
    .from("docentes")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  const { data: presidente } = await supabase
    .from("configuracion")
    .select("valor")
    .eq("clave", "presidente_tribunal")
    .single();

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600">
          Error al cargar docentes: {error.message}
        </p>
      </div>
    );
  }

  return (
    <FormularioProyectoGrado
      docentes={docentes ?? []}
      presidente={presidente?.valor ?? ""}
    />
  );
}