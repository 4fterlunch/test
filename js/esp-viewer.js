"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const three_potree_loader_1 = require("@pix4d/three-potree-loader");
const esp_camera_controls_1 = require("./esp-camera-controls");
class EspViewer {
    constructor() {
        /*three js renderer */
        this.renderer = new three_1.WebGLRenderer();
        /*3D scene for visualisation */
        this.scene = new three_1.Scene();
        /* camera object */
        this.camera = new three_1.PerspectiveCamera(45, NaN, 0.1, 1000);
        /*controls for the cameera */
        this.cameraControls = new esp_camera_controls_1.EspCameraControls(this.camera);
        /*handeling point clouds etc */
        this.potree = new three_potree_loader_1.Potree();
        /* bucket for point clouds currently in the scene */
        this.pointClouds = [];
        this.resize = () => {
            const { width, height } = this.targetElement.getBoundingClientRect();
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        };
        this.loop = (time) => {
            this.reqAnimationFrameHandle = requestAnimationFrame(this.loop);
            const prevTime = this.previousTime;
            this.previousTime = time;
            if (prevTime === undefined) {
                return;
            }
            this.update(time - prevTime);
            this.render();
        };
    }
    load(fileName, baseUrl) {
        return this.potree
            .loadPointCloud(
        // The file name of the point cloud which is to be loaded.
        fileName, 
        // Given the relative URL of a file, should return a full URL.
        url => `${baseUrl}${url}`)
            .then((pco) => {
            // Add the point cloud to the scene and to our list of
            // point clouds. We will pass this list of point clouds to
            // potree to tell it to update them.
            this.scene.add(pco);
            this.pointClouds.push(pco);
            return pco;
        });
    }
    render() {
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
    }
    update(dt) {
        // Alternatively, you could use Three's OrbitControls or any other
        // camera control system.
        this.cameraControls.update(dt);
        // This is where most of the potree magic happens. It updates the
        // visiblily of the octree nodes based on the camera frustum and it
        // triggers any loads/unloads which are necessary to keep the number
        // of visible points in check.
        this.potree.updatePointClouds(this.pointClouds, this.camera, this.renderer);
    }
    initialise(targetElement) {
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
    destroy() {
        this.targetElement.removeChild(this.renderer.domElement);
        this.targetElement = undefined;
        window.removeEventListener("resize", this.resize);
        if (this.reqAnimationFrameHandle !== undefined) {
            cancelAnimationFrame(this.reqAnimationFrameHandle);
        }
    }
}
exports.EspViewer = EspViewer;
