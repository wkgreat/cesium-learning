import { Viewer } from "cesium";
import S3MTilesLayer from './S3M_module/S3MTiles/S3MTilesLayer.js';

/**
 * @param {Viewer} viewer
 * @param {string} url
 * @returns {void}
*/
export const addS3MTiles = (viewer, url) => {

    let scene = viewer.scene;
    let layer = new S3MTilesLayer({
        context: scene._context,
        url: url
    });

    scene.primitives.add(layer);

    layer.readyPromise.then(function () {
        var position = layer._position;
        if (position && Cesium.defined(position)) {
            viewer.camera.flyTo({
                destination: position
            })
        } else {
            console.log('无法获取到 layer 的位置信息');
        }
    });

}

/**
 * @param {Viewer} viewer 
*/
export function case_addS3MTiles(viewer) {
    addS3MTiles(viewer, "http://localhost:9999/CBD/cbd.scp");
}