export async function generateVideoThumbnail(
  videoFile: File
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");

    const videoUrl = URL.createObjectURL(videoFile);

    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      if (
        !video.duration ||
        !video.videoWidth ||
        !video.videoHeight
      ) {
        URL.revokeObjectURL(videoUrl);
        reject(new Error("Invalid video"));
        return;
      }

      const targetTime = Math.min(
        video.duration * 0.2,
        10
      );

      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");

        const width = video.videoWidth;
        const height = video.videoHeight;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error(
            "Could not create canvas context"
          );
        }

        ctx.drawImage(
          video,
          0,
          0,
          width,
          height
        );

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(videoUrl);

            if (!blob) {
              reject(
                new Error(
                  "Failed to generate thumbnail"
                )
              );
              return;
            }

            resolve(blob);
          },
          "image/jpeg",
          0.85
        );
      } catch (error) {
        URL.revokeObjectURL(videoUrl);
        reject(error);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);

      reject(
        new Error(
          "Could not read video"
        )
      );
    };
  });
}