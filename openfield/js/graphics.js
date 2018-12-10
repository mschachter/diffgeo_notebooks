const randomString = (stringLength=5) =>
{
    return Math.random().toString(36).substring(2, stringLength);
}

/* Convert an array to a LALOlib vector. */
const a2v = array2vec;

/* Convert an array to a Babylon vector. */
const a2b = (p) =>
{
    return new BABYLON.Vector3(p[0], p[1], p[2]);
}

/* Convert a LALOlib vector to a Babylon vector, */
const v2b = (p) =>
{
    return a2b(p);
}

/* Convert a Babylon vecotr to a LALOlib vector. */
const b2v = (p) =>
{
    return a2v(p.asArray());
}

/* Convert an RGB color to a Babylon color vector. */
const rgb2color = (r, g, b) =>
{
    return new BABYLON.Color3(r, g, b);
}

/* Convert hex to RGB, taken from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb */
function hex2rgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/* Convert a hex code to a Babylon color vector. */
const hex2color = (hexColor) =>
{
    let rgbObj = hex2rgb(hexColor);
    return rgb2color(rgbObj.r, rgbObj.g, rgbObj.b);
}

/* Compute the cross product between two vectors. Returns the cross product as an Array. */
const cross = (v, w) =>
{
    return [v[1]*w[2] - v[2]*w[1], v[2]*w[0] - v[0]*w[2], v[0]*w[1] - v[1]*w[0]];
}

/* Compute the angle in radians between two vectors. */
const angle = (v, w) =>
{
    return Math.acos(dot(v, w), norm(v)*norm(w));
}

const makeTextPlane = (text, color, size, scene) =>
{
    var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
    dynamicTexture.hasAlpha = true;
    dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
    var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
    plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
    plane.material.backFaceCulling = false;
    plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    plane.material.diffuseTexture = dynamicTexture;
    return plane;
}

const drawGlobalAxis = (size, scene) =>
{
    var axisX = BABYLON.Mesh.CreateLines("axisX", [
        new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
        new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
    ], scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    var xChar = makeTextPlane("X", "red", size / 10, scene);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);

    var axisY = BABYLON.Mesh.CreateLines("axisY", [
        new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
        new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
    ], scene);
    axisY.color = new BABYLON.Color3(0, 1, 0);
    var yChar = makeTextPlane("Y", "green", size / 10, scene);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);

    var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
        new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
        new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
    ], scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    var zChar = makeTextPlane("Z", "blue", size / 10, scene);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
}

/*
  Draw an arrow at location p with magnitude/direction specified by vector v.

  p: origin, array/vector of length 3
  v: vector, array/vector of length 3
  scene: babylon scene object
  originDiameter: the diameter of the origin spere
  showOrigin: whether or not to plot the origin
  name: the base name of the objects created by this function call
 */
const drawArrow = (p, v, scene,
                   shaftColor=rgb2color(0, 0, 0), originColor=rgb2color(0, 0, 0), headColor=rgb2color(0, 0, 0),
                   showOrigin=true, originDiameter=0.05, headLength=0.1, name=null) =>
{
    let baseName;
    if (name === null)
    {
        baseName = randomString();
    } else {
        baseName = name;
    }

    let pvec = v2b(p);
    let vvec = v2b(v);

    // create the arrow origin
    const sphere = BABYLON.MeshBuilder.CreateSphere("arrOrig_" + baseName, {diameter:originDiameter}, scene);
    sphere.position = pvec;

    // draw the shaft of the arrow
    let arrowPoints = new Array();
    let hvec = pvec.add(vvec);
    arrowPoints.push(pvec);
    arrowPoints.push(hvec);
    var shaft = BABYLON.Mesh.CreateLines("shaft_" + baseName, arrowPoints, scene);
    shaft.color = shaftColor;

    // draw the arrow head
    let head = BABYLON.MeshBuilder.CreateCylinder("cone_" + baseName,
                                                 {diameter: originDiameter, diameterTop: 0, tessellation: 12, height: headLength},
                                                 scene);

    // define an orthogonal axis to rotate the arrow head into it's correct position
    let w = [0, 1, 0];
    let ovec = a2b(cross(v, w));
    let s = Math.sign(v[2])
    let sb = s >= 0 ? 1 : 0;
    let a = Math.acos(norm(v), norm(w));
    console.log('a=',a)
    let rotAngle =  (1-sb)*Math.PI - s*((Math.PI/2) - a);
    //let rotAngle = Math.PI - Math.abs(Math.acos(norm(v), norm(w)));
    
    // position and rotate the arrow head
    head.position = hvec;
    head.rotationQuaternion = new BABYLON.Quaternion.RotationAxis(ovec, rotAngle);
}
