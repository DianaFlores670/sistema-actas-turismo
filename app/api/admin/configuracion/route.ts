import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("configuracion")
      .select("id, clave, valor")
      .eq("clave", "presidente_tribunal")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      presidente: data?.valor ?? "",
    });
  } catch (error) {
    console.error(
      "Error obteniendo configuración:",
      error
    );

    return NextResponse.json(
      {
        error: "No se pudo obtener la configuración",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: NextRequest
) {
  try {
    const { presidente } = await request.json();

    if (
      !presidente ||
      !presidente.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "El nombre del presidente es obligatorio",
        },
        {
          status: 400,
        }
      );
    }

    const { data: existente, error: errorConsulta } =
      await supabaseAdmin
        .from("configuracion")
        .select("id")
        .eq("clave", "presidente_tribunal")
        .maybeSingle();

    if (errorConsulta) {
      throw errorConsulta;
    }

    if (existente) {
      const { error } = await supabaseAdmin
        .from("configuracion")
        .update({
          valor: presidente.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existente.id);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await supabaseAdmin
        .from("configuracion")
        .insert({
          clave: "presidente_tribunal",
          valor: presidente.trim(),
        });

      if (error) {
        throw error;
      }
    }

    return NextResponse.json({
      mensaje: "Presidente actualizado correctamente",
      presidente: presidente.trim(),
    });
  } catch (error) {
    console.error(
      "Error actualizando presidente:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo actualizar el presidente",
      },
      {
        status: 500,
      }
    );
  }
}