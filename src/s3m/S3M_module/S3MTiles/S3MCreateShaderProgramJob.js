import ProgramDefines from './Enum/ProgramDefines.js';
import VertexCompressOption from './Enum/VertexCompressOption.js';
import InstanceMode from './Enum/InstanceMode.js';

const defined = Cesium.defined;
function S3MCreateShaderProgramJob(){
    this.model = undefined;
    this.context = undefined;
}

S3MCreateShaderProgramJob.prototype.set = function(context, model) {
    this.model = model;
    this.context = context;
};

function getExtension(gl, names) {
    let length = names.length;
    for (let i = 0; i < length; ++i) {
        let extension = gl.getExtension(names[i]);
        if (extension) {
            return extension;
        }
    }

    return undefined;
}

function isNeedAdjustColor(layer){
    return (layer._brightness !== 1.0 || layer._contrast !== 1.0 || layer._hue !== 0.0 || layer._saturation !== 1.0 || layer._gamma !== 1.0);
}

S3MCreateShaderProgramJob.prototype.execute = function(){
    const context = this.context;
    const model = this.model;
    const layer = model.layer;
    let vs = model.vs;
    let fs = model.fs;
    const attributeLocations = model.attributeLocations;
    const material = model.material;
    const vertexPackage = model.vertexPackage;
    if(context.webgl2 && Cesium.VERSION.length > 4){
        const prefixVertex = [
            'precision mediump sampler2DArray;',
            '#define attribute in',
            '#define varying out',
            '#define texture2D texture'
        ].join( '\n' ) + '\n';
        const prefixFragment = [
            '#define varying in',
            //'layout(location = 0) out highp vec4 out_fragColor;',
            '#define gl_FragColor out_FragColor',
            '#define gl_FragDepthEXT gl_FragDepth',
            '#define texture2D texture',
            '#define textureCube texture',
            '#define texture2DProj textureProj',
            '#define texture2DLodEXT textureLod',
            '#define texture2DProjLodEXT textureProjLod',
            '#define textureCubeLodEXT textureLod',
            '#define texture2DGradEXT textureGrad',
            '#define texture2DProjGradEXT textureProjGrad',
            '#define textureCubeGradEXT textureGrad'
        ].join( '\n' ) + '\n';
        vs = prefixVertex + vs;
        fs = prefixFragment + fs;
    }
    let vsNew = model.batchTable ? model.batchTable.getVertexShaderCallback()(vs) : vs;

    if(context.texturelod === undefined){
        context.texturelod = Cesium.defaultValue(getExtension(context._gl, ['EXT_shader_texture_lod']), false);
    }

    let vp = new Cesium.ShaderSource({
        sources : [vsNew]
    });

    let fp = new Cesium.ShaderSource({
        sources : [fs]
    });

    if(Cesium.defined(attributeLocations['aNormal'])) {
        vp.defines.push(ProgramDefines.VertexNormal);
        fp.defines.push(ProgramDefines.VertexNormal);
    }

    if(Cesium.defined(attributeLocations['aColor'])) {
        vp.defines.push(ProgramDefines.VertexColor);
    }

    if(material && material._RGBTOBGR){
        fp.defines.push('RGBTOBGR');
    }

    if(material && material.textures.length > 0) {
        vp.defines.push(ProgramDefines.COMPUTE_TEXCOORD);
        fp.defines.push(ProgramDefines.COMPUTE_TEXCOORD);
    }

    if(material && material.textures.length === 2) {
        vp.defines.push(ProgramDefines.TexCoord2);
        fp.defines.push(ProgramDefines.TexCoord2);
    }

    if(Cesium.defined(attributeLocations['aTexCoord0'])) {
        vp.defines.push('TexCoord');
        fp.defines.push('TexCoord');
    }

    if(vertexPackage.instanceIndex > -1){
        vp.defines.push(ProgramDefines.Instance);
    }

    if(vertexPackage.instanceMode === InstanceMode.BIM || vertexPackage.instanceMode === InstanceMode.BIM2){
        vp.defines.push(ProgramDefines.InstanceBim);
    }

    if(vertexPackage.instanceMode === InstanceMode.PIPELINE){
        vp.defines.push(ProgramDefines.InstancePipe);
    }

    if(Cesium.defined(vertexPackage.compressOptions)){
        let compressOptions = vertexPackage.compressOptions;
        if((compressOptions & VertexCompressOption.SVC_Vertex) === VertexCompressOption.SVC_Vertex){
            vp.defines.push(ProgramDefines.COMPRESS_VERTEX);
        }

        if((compressOptions & VertexCompressOption.SVC_Normal) === VertexCompressOption.SVC_Normal){
            vp.defines.push(ProgramDefines.COMPRESS_NORMAL);
        }

        if((compressOptions & VertexCompressOption.SVC_VertexColor) === VertexCompressOption.SVC_VertexColor){
            vp.defines.push(ProgramDefines.COMPRESS_COLOR);
        }

        if((compressOptions & VertexCompressOption.SVC_TexutreCoord) === VertexCompressOption.SVC_TexutreCoord){
            vp.defines.push(ProgramDefines.COMPRESS_TEXCOORD);
        }
    }

    if(vertexPackage.textureCoordIsW && attributeLocations['TexCoord']){
        vp.defines.push(ProgramDefines.TEXTURE_COORD_ONE_IS_W);
    }
     
    if(Cesium.defined(vertexPackage.customVertexAttribute) && Cesium.defined(vertexPackage.customVertexAttribute['TextureCoordMatrix'])) {
        vp.defines.push('USE_TextureCoordMatrix');
    }

    // meshopt
    if(layer._vertexCompressionType === "MESHOPT") {
        vp.defines.push('MeshOPT_Compress');
    }

    if(vertexPackage.textureCoordIsW && attributeLocations['aTexCoord0']){
        vp.defines.push('TEXTURE_COORD_ONE_IS_W');
    }

    if(material.batchTable){
        vp.defines.push(ProgramDefines.TextureAtlas);
        fp.defines.push(ProgramDefines.TextureAtlas);
    }

    if(material.batchTableBake){
        vp.defines.push(ProgramDefines.TextureAtlasSec);
        fp.defines.push(ProgramDefines.TextureAtlasSec);
    }

    if(Cesium.defined(model.arrIndexPackage) && model.arrIndexPackage.length > 0 && model.arrIndexPackage[0].primitiveType === 2){
        fp.defines.push(ProgramDefines.UseLineColor);
    }

    if(isNeedAdjustColor(layer)){
        fp.defines.push(ProgramDefines.ADJUST_COLOR);
    }

    if(context.webgl2){
        vp.defines.push('WEBGL2');
        fp.defines.push('WEBGL2');
    }
  

    model.shaderProgram = Cesium.ShaderProgram.fromCache({
        context : context,
        vertexShaderSource : vp,
        fragmentShaderSource : fp,
        attributeLocations : attributeLocations
    });
};


export default S3MCreateShaderProgramJob;