const volumeImage = (index, width, height) => ({
  id: `volume-${String(index).padStart(2, "0")}`,
  src: `/assets/media/home-collections/volume/volume-${String(index).padStart(2, "0")}.webp`,
  width,
  height
});

export const volumeImages = Object.freeze([
  volumeImage(1, 1200, 1800),
  volumeImage(2, 1800, 1012),
  volumeImage(3, 1082, 1623),
  volumeImage(4, 1800, 1013),
  volumeImage(5, 1440, 1800),
  volumeImage(6, 1800, 1012),
  volumeImage(7, 915, 1372),
  volumeImage(8, 1800, 1012),
  volumeImage(9, 1200, 1800),
  volumeImage(10, 1800, 1440),
  volumeImage(11, 1200, 1800),
  volumeImage(12, 1800, 1012),
  volumeImage(13, 915, 1372),
  volumeImage(14, 1800, 1012),
  volumeImage(15, 1200, 1800),
  volumeImage(16, 1800, 1012),
  volumeImage(17, 1200, 1800),
  volumeImage(18, 1440, 1800),
  volumeImage(19, 1440, 1800),
  volumeImage(20, 1440, 1800),
  volumeImage(21, 1440, 1800),
  volumeImage(22, 1440, 1800),
  volumeImage(23, 1440, 1800),
  volumeImage(24, 1440, 1800)
]);

export const practiceGridImages = Object.freeze(
  Array.from({ length: 50 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      id: `practice-${number}`,
      src: `/assets/media/home-collections/practice-grid/practice-${number}.webp`,
      width: 720,
      height: 720
    };
  })
);
