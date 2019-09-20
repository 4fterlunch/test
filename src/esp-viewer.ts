import {PerspectiveCamera, Scene, WebGLRenderer} from  "three";
import {Potree, PointCloudOctree} from "@pix4d/three-potree-loader";
import { EspCameraControls } from "./esp-camera-controls";

export class EspViewer {
    /* element to insert the canvas */
    private targetElement: HTMLElement | undefined;

    /*three js renderer */
    private renderer = new WebGLRenderer();

    /*3D scene for visualisation */
    private scene = new Scene();

    /* camera object */
    private camera = new PerspectiveCamera(45, NaN, 0.1, 1000);

    /*controls for the cameera */
    private cameraControls = new EspCameraControls(this.camera);

    /*handeling point clouds etc */
    private potree = new Potree();

    /* bucket for point clouds currently in the scene */
    private pointClouds: PointCloudOctree[] = [];

    /* time between loop() being called */
    private previousTime: number | undefined;

    private reqAnimationFrameHandle: number | undefined;

    load(fileName: string, baseUrl: string): Promise<PointCloudOctree> {
        return this.potree
          .loadPointCloud(
            // The file name of the point cloud which is to be loaded.
            fileName,
            // Given the relative URL of a file, should return a full URL.
            url => `${baseUrl}${url}`
          )
          .then((pco: PointCloudOctree) => {
            // Add the point cloud to the scene and to our list of
            // point clouds. We will pass this list of point clouds to
            // potree to tell it to update them.
            this.scene.add(pco);
            this.pointClouds.push(pco);
    
            return pco;
          });
      }

    resize = () => {
        const {width, height} = this.targetElement.getBoundingClientRect();
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };

    render(): void {
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
    }

    update(dt: number): void {
        // Alternatively, you could use Three's OrbitControls or any other
        // camera control system.
        this.cameraControls.update(dt);
    
        // This is where most of the potree magic happens. It updates the
        // visiblily of the octree nodes based on the camera frustum and it
        // triggers any loads/unloads which are necessary to keep the number
        // of visible points in check.
        this.potree.updatePointClouds(this.pointClouds, this.camera, this.renderer);
      }

    loop = (time: number): void => {
        this.reqAnimationFrameHandle = requestAnimationFrame(this.loop);
    
        const prevTime = this.previousTime;
        this.previousTime = time;
        if (prevTime === undefined) {
          return;
        }
    
        this.update(time - prevTime);
        this.render();
      };



    initialise(targetElement: HTMLElement): void {
        /* check if element already set or if passed in 
            element doesn't exist */
        if (this.targetElement || !targetElement) {
            return;
        }
        //inside
        this.targetElement = targetElement;
        //outside
        targetElement.appendChild(this.renderer.domElement);

        this.resize();
        window.addEventListener("resize", this.resize);
        requestAnimationFrame(this.loop);
    }

    destroy(): void {
        this.targetElement.removeChild(this.renderer.domElement);
        this.targetElement = undefined;
        window.removeEventListener("resize", this.resize);

        if (this.reqAnimationFrameHandle !== undefined) {
            cancelAnimationFrame(this.reqAnimationFrameHandle);
        }
    }

}
