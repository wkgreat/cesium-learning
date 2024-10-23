window.CESIUM_BASE_URL = "/";

import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

import { case_addS3MTiles } from './s3m/addS3MTiles';

// Your access token can be found at: https://cesium.com/ion/tokens.
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZTk1Y2U2ZC0wNTZjLTRlZWUtYmI3ZC00YTliMjA1ZWY3MTAiLCJpZCI6NDMzMzQsImlhdCI6MTYxMjQ0Njc4OX0.IkhInR9fEeIbjprLTjVJPhDBkD4pAhwrc7zytMBbCQk';
// Initialize the Cesium Viewer in the HTML element with the "cesiumContainer" ID.
const viewer = new Cesium.Viewer('cesiumContainer', {
    infoBox: false
});
// Add Cesium OSM Buildings, a global 3D buildings layer.
// Fly the camera to San Francisco at the given longitude, latitude, and height.
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 400),
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-15.0),
    }
});

case_addS3MTiles(viewer);
