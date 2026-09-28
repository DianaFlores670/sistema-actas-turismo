import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import CloudConvert from "cloudconvert";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();

    const apiKey = process.env.CLOUDCONVERT_API_KEY;

    if (!apiKey) {
      throw new Error(
        "No se encontró CLOUDCONVERT_API_KEY en las variables de entorno"
      );
    }

    // 1. Leer plantilla Word
    const rutaPlantilla = path.join(
      process.cwd(),
      "templates",
      "proyecto-grado.docx"
    );

    const contenido = fs.readFileSync(rutaPlantilla);

    // 2. Rellenar plantilla
    const zip = new PizZip(contenido);

    const documento = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: "{{",
        end: "}}",
      },
    });

    documento.render({
      postulante: datos.postulante,
      tribunal1: datos.tribunal1,
      tribunal2: datos.tribunal2,
      tutor: datos.tutor,
      presidente: datos.presidente,

      hora: datos.hora,
      fechaTexto: datos.fechaTexto,

      articulo:
        datos.genero === "femenino"
          ? "la"
          : "el",

      tema: datos.tema,
      nota: datos.nota,
    });

    // 3. Generar DOCX en memoria
    const docx = documento.getZip().generate({
      type: "uint8array",
      compression: "DEFLATE",
    });

    // 4. Convertir DOCX a Base64
    const docxBase64 = Buffer.from(docx).toString("base64");

    // 5. Conectar con CloudConvert
    const cloudConvert = new CloudConvert(apiKey);

    // 6. Crear trabajo DOCX -> PDF
    let job = await cloudConvert.jobs.create({
      tasks: {
        "import-docx": {
          operation: "import/base64",
          file: docxBase64,
          filename: "acta-proyecto-grado.docx",
        },

        "convertir-pdf": {
          operation: "convert",
          input: "import-docx",
          input_format: "docx",
          output_format: "pdf",
        },

        "exportar-pdf": {
          operation: "export/url",
          input: "convertir-pdf",
          inline: true,
        },
      },
    });

    // 7. Esperar la conversión
    job = await cloudConvert.jobs.wait(job.id);

    // 8. Obtener URL del PDF
    const archivos =
      cloudConvert.jobs.getExportUrls(job);

    if (!archivos.length) {
      throw new Error(
        "CloudConvert no devolvió ningún PDF"
      );
    }

    const archivoPdf = archivos[0];

if (!archivoPdf || !archivoPdf.url) {
  throw new Error(
    "CloudConvert no devolvió una URL válida para el PDF"
  );
}

const respuestaPdf = await fetch(archivoPdf.url);

    if (!respuestaPdf.ok) {
      throw new Error(
        "No se pudo descargar el PDF generado"
      );
    }

    const pdf = await respuestaPdf.arrayBuffer();

    // 10. Devolver PDF al navegador
    return new NextResponse(pdf, {
      status: 200,

      headers: {
        "Content-Type": "application/pdf",

        "Content-Disposition":
          'inline; filename="acta-proyecto-grado.pdf"',
      },
    });
  } catch (error) {
    console.error(
      "Error generando PDF:",
      error
    );

    const mensaje =
      error instanceof Error
        ? error.message
        : "Error desconocido";

    return NextResponse.json(
      {
        error: mensaje,
      },
      {
        status: 500,
      }
    );
  }
}