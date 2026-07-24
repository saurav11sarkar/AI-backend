import { readFile } from 'fs/promises';
import { join } from 'path';
import { PDFParse } from 'pdf-parse';

export const uploadPdf = async () => {
  const data = await readFile(
    join(process.cwd(), 'Bangladesh_Grocery_Price_List_1.pdf'),
  );
  const pdf = new PDFParse({ data });

  const result = await pdf.getText();

  return result;
};
