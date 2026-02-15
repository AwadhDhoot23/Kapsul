import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateInput) {
  if (!dateInput) return '';

  // Handle Firestore Timestamp
  const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'Saved just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Saved ${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Saved ${diffInHours}h ago`;
  }

  if (diffInHours < 48) {
    return 'Saved yesterday';
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Saved ${diffInDays} days ago`;
  }

  return `Saved on ${date.toLocaleDateString()}`;
}

export function compressImage(file, maxWidth = 1280, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Base64
        const base64 = canvas.toDataURL('image/jpeg', quality);

        // Safety check: Firestore document limit is 1MB. 
        // We aim for < 600KB to be safe with other data.
        if (base64.length > 600 * 1024) {
          // Recursive compression if still too big
          resolve(compressImage(file, maxWidth * 0.8, quality * 0.8));
        } else {
          resolve(base64);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
