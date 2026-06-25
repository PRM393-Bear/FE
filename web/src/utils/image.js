/**
 * EcoCycle Web - Image Utilities
 * Handles client-side image compression using HTML5 Canvas.
 */

/**
 * Compress an image file using Canvas.
 * @param {File} file - The original File object from <input type="file">
 * @param {object} [options]
 * @param {number} [options.maxWidth=1200] - Max width of compressed image
 * @param {number} [options.maxHeight=1200] - Max height of compressed image
 * @param {number} [options.quality=0.8] - Image quality (0.0 to 1.0)
 * @returns {Promise<File>} Compressed File object as image/jpeg.
 */
export function compressImage(file, options = {}) {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = options;

  // If the file is not an image, resolve immediately
  if (!file.type.startsWith("image/")) {
    return Promise.resolve(file);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while preserving aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Draw onto canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Export as Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to original file if blob creation fails
              resolve(file);
              return;
            }

            // Create a new File from the blob
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        // Fallback to original file on load error
        resolve(file);
      };
    };

    reader.onerror = () => {
      // Fallback to original file on read error
      resolve(file);
    };
  });
}
