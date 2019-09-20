import { EspViewer } from "./esp-viewer";

const viewer = new EspViewer();
viewer.initialise(document.getElementById("target"));
Headers.apply()
viewer
  .load(
    "cloud.js",
   "esperance/lion_takanawa_las/"
  )
  .then(pco => {
    // Make the lion shows up at the center of the screen.
    pco.translateX(-1);
    pco.rotateX(-Math.PI / 2);

    // The point cloud octree already comes with a material which
    // can be customized directly. Here we just set the size of the
    // points.
    pco.material.size = 1.0;
  })
  .catch(err => console.error(err));