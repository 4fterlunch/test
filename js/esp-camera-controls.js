"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
/**
 * Simple camera controls which just make the camera spin around a target position.
 */
class EspCameraControls {
    constructor(camera) {
        this.camera = camera;
        this.rotationSpeed = 0.001;
        this.distance = 10.0;
        this.target = new three_1.Vector3();
        this.angle = 0.0;
    }
    update(dt) {
        this.angle += this.rotationSpeed * dt;
        const x = Math.sin(this.angle) * this.distance;
        const z = Math.cos(this.angle) * this.distance;
        this.camera.position.set(x, 0, z);
        this.camera.lookAt(this.target);
    }
}
exports.EspCameraControls = EspCameraControls;
