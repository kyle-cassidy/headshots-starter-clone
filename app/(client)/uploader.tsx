export async function clientUpload() {
  const filename = "articles/blob.txt";
  const content = "Hello World! We are retrieving from the server!";
  
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, content }),
  });

  if (!res.ok) throw new Error("Upload request failed");
  
  const data = await res.json();
  console.log("File uploaded to Blob at:", data.result.url);
} 