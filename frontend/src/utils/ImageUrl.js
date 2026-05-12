const API_URL = import.meta.env.VITE_API_URL;

export const imageUrl = (img) => {
  if (!img) return null;

  // if already full URL (cloudinary or external)
  if (img.startsWith("http")) return img;

  // normalize local uploads path
  return `${API_URL}/uploads/${img.startsWith("/") ? img.slice(1) : img}`;
};