import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { PDFParse } from 'pdf-parse';
import { vectorStore } from './googlevectordb';

const DEFAULT_PDF = 'Bangladesh_Grocery_Price_List_1.pdf';

export const uploadPdf = async (fileBuffer?: Buffer, source?: string) => {
  const data = fileBuffer ?? (await readFile(join(process.cwd(), DEFAULT_PDF)));

  const pdf = new PDFParse({ data });
  const result = await pdf.getText();
  const text = result.text;

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const docs = await splitter.createDocuments(
    [text],
    [{ source: source ?? DEFAULT_PDF }],
  );

  await vectorStore.addDocuments(docs);

  return { chunkCount: docs.length };
};
