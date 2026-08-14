export const FASHION_TURNTABLE_CYCLE_MS = 50000;

const fullBody = (id, sourceName) => ({
  id,
  sourceName,
  src: `/assets/media/fashion-turntables/animated/${id}.webp`,
  poster: `/assets/media/fashion-turntables/posters/${id}.webp`,
  width: 600,
  height: 750,
  scale: 1,
  offsetY: 0,
  crop: "full-body"
});

export const fashionTurntables = Object.freeze([
  fullBody("look-01", "Narion 4.gif"),
  fullBody("look-02", "Nation 1.gif"),
  fullBody("look-03", "Nation 1.7.1__0482dcd2.gif"),
  fullBody("look-04", "Nation 1.9__dd44119f.gif"),
  fullBody("look-05", "Nation 2.gif"),
  fullBody("look-06", "Nation 3.gif"),
  fullBody("look-07", "Nation 5.gif"),
  fullBody("look-08", "Nation 6.gif"),
  fullBody("look-09", "Nation 6.5.gif"),
  fullBody("look-10", "Nation 15__f3f3e811.gif"),
  fullBody("look-11", "Nation 16__1fa050f8.gif"),
  fullBody("look-12", "Nation 17__ced5b1f2.gif"),
  fullBody("look-13", "Nation 18__092cfe92.gif"),
  fullBody("look-14", "Alien 1.gif"),
  {
    ...fullBody("look-15", "Alien 2.gif"),
    scale: 0.82,
    crop: "upper-body"
  },
  fullBody("look-16", "Alien 3.gif"),
  {
    ...fullBody("look-17", "Basics 3.gif"),
    scale: 0.56,
    crop: "upper-body"
  },
  {
    ...fullBody("look-18", "1__06d1c551.gif"),
    scale: 0.62,
    crop: "upper-body"
  },
  fullBody("look-19", "111__3847b65d.gif"),
  fullBody("look-20", "1111__c436218d.gif")
]);
