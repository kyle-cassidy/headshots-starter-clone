const blob = await upload(file.name, file, {
  access: "public",
  handleUploadUrl: "/astria/train-model/image-upload",
  // ...
}); 