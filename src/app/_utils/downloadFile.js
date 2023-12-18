import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default async function handleDownload(storageUrl, type) {

  const supabase = createClientComponentClient();
  // Extract the file path, excluding any query parameters
  const isImage = ['jpg', 'png', 'gif', 'jpeg'].includes(type.toLowerCase());
  const filePath = isImage ? 'images/' : 'docs/';
  const startIndex = storageUrl.indexOf(filePath);
  const extractedPath = startIndex !== -1 ? storageUrl.substring(startIndex) : "";

  if (!extractedPath) {
    console.error("Invalid file path");
    return;
  }

  const {data, error} = await supabase
    .storage
    .from('client_files')
    .download(extractedPath);

  if (error) {
    console.error(error);
    return;
  }
  const blob = new Blob([data], { type: 'application/octet-stream' });

  // Extract and decode the file name, then remove any query parameters
  // Using a fallback value in case of 'undefined'
  const fileNameParts = extractedPath.split('/');
  const rawFileName = fileNameParts.pop();
  const fileName = decodeURIComponent(rawFileName ? rawFileName.split('?')[0] : 'default-filename');

  // Create a link element, use it to download the file, and remove it afterwards
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName; // Use the extracted and decoded file name
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href); // Clean up the URL object
}