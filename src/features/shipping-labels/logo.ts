export async function readLogo(file: File): Promise<string> {
  if (!["image/png", "image/jpeg"].includes(file.type) || file.size > 1_000_000)
    throw new Error("logo");
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("logo"));
    reader.onerror = () => reject(new Error("logo"));
    reader.readAsDataURL(file);
  });
  const image = new Image();
  image.src = data;
  await image.decode();
  if (!image.naturalWidth || image.naturalWidth > 4096 || image.naturalHeight > 4096)
    throw new Error("logo");
  return data;
}
