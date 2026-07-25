import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { PDFParse } from 'pdf-parse';

export const uploadPdf = async () => {
  const data = await readFile(
    join(process.cwd(), 'Bangladesh_Grocery_Price_List_1.pdf'),
  );
  const pdf = new PDFParse({ data });

  const result = await pdf.getText();
  const text = result.text;
  const spiltter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const docs = await spiltter.createDocuments([text]);
  console.dir(docs, { depth: null });
  return docs;
};
