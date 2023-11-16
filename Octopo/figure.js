//Variable Initiation
var delay = 0;

var canvas;
var gl;
var program;

var projectionMatrix; 
var modelViewMatrix;
var instanceMatrix;

var modelViewMatrixLoc;

var cameraMatrixY = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
];
var cameraMatrixLocY;

var cameraMatrixX = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
];
var cameraMatrixLocX;

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var torsoId = 0;
var legs = [[1,2,3],[4,5,6],[7,8,9],[10,11,12],[13,14,15],[16,17,18],[19,20,21],[22,23,24]];

var torsoHeight = 6.0;
var torsoWidth = 5.0;

var upperLegHeight = 3.0;
var middleLegHeight = 3.0;
var lowerLegHeight = 3.0;

var upperLegWidth  = 0.8;
var middleLegWidth = 0.6;
var lowerLegWidth  = 0.4;

var numNodes = 25;

var theta = [0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0];

var neutralTheta = [0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0];

var thetaArr = [[0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0,
    180, 0, 0]] 

//Animation Variables
var animFrameCounter = 0;
var animFrameLen = thetaArr.length - 1;
var animToggle = false;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];
var normalsArray = [];

var lightPosition = vec4(1.0, 0.0, 1.0, 0.0 );
var lightAmbient = vec4(0.3, 0.1, 0.3, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 0.6, 0.0, 0.4, 1.0);
var materialSpecular = vec4( 0.6, 0.0, 0.4, 1.0 );
var materialShininess = 80.0;

//Functions

//Degree to radians converter
function degreeToRadians(degreeVar){
    return degreeVar * Math.PI / 180;
}

//Camera rotate around y axis
function rotateY(angleVar){
    var cosVar = Math.cos(angleVar);
    var sinVar = Math.sin(angleVar);

    cameraMatrixY[0] = cosVar;
    cameraMatrixY[2] = -sinVar;
    cameraMatrixY[8] = sinVar;
    cameraMatrixY[10] = cosVar;
}

//Camera rotate around x axis
function rotateX(angleVar){
    var cosVar = Math.cos(angleVar);
    var sinVar = Math.sin(angleVar);

    cameraMatrixX[5] = cosVar;
    cameraMatrixX[6] = sinVar;
    cameraMatrixX[9] = -sinVar;
    cameraMatrixX[10] = cosVar;
}

function scale4(a, b, c){
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}

function initNodes(Id){
    var m = mat4();
    
    switch(Id) {
    
    case torsoId:
        m = rotate(theta[torsoId], 0, 1, 0 );
        figure[torsoId] = createNode( m, torso, null, legs[0][0]);
        break;

    //Upper Arm
    case legs[0][0]://arka sol
        m = translate(-(torsoWidth/2-upperLegWidth/2), (torsoHeight/2-upperLegHeight), -torsoWidth/2+upperLegWidth/2);
	    m = mult(m , rotate(theta[legs[0][0]], 1, 0, -1));
        figure[legs[0][0]] = createNode( m, upperLeg, legs[1][0], legs[0][1]);
        break;

    case legs[1][0]://arka orta
        m = translate(0, (torsoHeight/2-upperLegHeight), -torsoWidth/2+upperLegWidth/2);
	    m = mult(m , rotate(theta[legs[1][0]], 1, 0, 0));
        figure[legs[1][0]] = createNode( m, upperLeg, legs[2][0], legs[1][1] );
        break;

    case legs[2][0]://arka sag
        m = translate((torsoWidth/2-upperLegWidth/2), (torsoHeight/2-upperLegHeight), -torsoWidth/2+upperLegWidth/2);
	    m = mult(m , rotate(theta[legs[2][0]], 1, 0, 1));
        figure[legs[2][0]] = createNode( m, upperLeg, legs[3][0], legs[2][1] );
        break;

    case legs[3][0]://orta sol
        m = translate(-(torsoWidth/2-upperLegWidth/2), (torsoHeight/2-upperLegHeight), 0.0);
	    m = mult(m , rotate(theta[legs[3][0]], 0, 0, 1));
        figure[legs[3][0]] = createNode( m, upperLeg, legs[4][0], legs[3][1] );
        break;

    case legs[4][0]://orta sag
        m = translate((torsoWidth/2-upperLegWidth/2), (torsoHeight/2-upperLegHeight), 0.0);
	    m = mult(m , rotate(theta[legs[4][0]], 0, 0, 1));
        figure[legs[4][0]] = createNode( m, upperLeg, legs[5][0], legs[4][1] );
        break;

    case legs[5][0]://on sol
        m = translate(-(torsoWidth/2-upperLegWidth/2), (torsoHeight/2-upperLegHeight), torsoWidth/2-upperLegWidth/2);
	    m = mult(m , rotate(theta[legs[5][0]], 1, 0, 1));
        figure[legs[5][0]] = createNode( m, upperLeg, legs[6][0], legs[5][1] );
        break;

    case legs[6][0]://on orta
        m = translate(0, (torsoHeight/2-upperLegHeight), torsoWidth/2-upperLegWidth/2);
	    m = mult(m , rotate(theta[legs[6][0]], 1, 0, 0));
        figure[legs[6][0]] = createNode( m, upperLeg, legs[7][0], legs[6][1] );
        break;

    case legs[7][0]://on sag
        m = translate((torsoWidth/2-upperLegWidth/2), (torsoHeight/2-upperLegHeight), torsoWidth/2-upperLegWidth/2);
	    m = mult(m , rotate(theta[legs[7][0]], 1, 0, -1));
        figure[legs[7][0]] = createNode( m, upperLeg, null, legs[7][1] );
        break;


    //Middle Arm
    case legs[0][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[0][1]], 1, 0, -1));
        figure[legs[0][1]] = createNode( m, middleLeg, null, legs[0][2] );
        break;

    case legs[1][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[1][1]], 1, 0, 0));
        figure[legs[1][1]] = createNode( m, middleLeg, null, legs[1][2] );
        break;

    case legs[2][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[2][1]], 1, 0, 1));
        figure[legs[2][1]] = createNode( m, middleLeg, null, legs[2][2] );
        break;

    case legs[3][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[3][1]], 0, 0, 1));
        figure[legs[3][1]] = createNode( m, middleLeg, null, legs[3][2] );
        break;

    case legs[4][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[4][1]], 0, 0, 1));
        figure[legs[4][1]] = createNode( m, middleLeg, null, legs[4][2] );
        break;

    case legs[5][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[5][1]], 1, 0, 1));
        figure[legs[5][1]] = createNode( m, middleLeg, null, legs[5][2] );
        break;

    case legs[6][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[6][1]], 1, 0, 0));
        figure[legs[6][1]] = createNode( m, middleLeg, null, legs[6][2] );
        break;

    case legs[7][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[7][1]], 1, 0, -1));
        figure[legs[7][1]] = createNode( m, middleLeg, null, legs[7][2] );
        break;

    //Lower Arm
    case legs[0][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[0][2]], 1, 0, -1));
        figure[legs[0][2]] = createNode( m, lowerLeg, null, null );
        break;

    case legs[1][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[1][2]], 1, 0, 0));
        figure[legs[1][2]] = createNode( m, lowerLeg, null, null );
        break;

    case legs[2][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[2][2]], 1, 0, 1));
        figure[legs[2][2]] = createNode( m, lowerLeg, null, null );
        break;

    case legs[3][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[3][2]], 0, 0, 1));
        figure[legs[3][2]] = createNode( m, lowerLeg, null, null );
        break;

    case legs[4][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[4][2]], 0, 0, 1));
        figure[legs[4][2]] = createNode( m, lowerLeg, null, null );
        break;

    case legs[5][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[5][2]], 1, 0, 1));
        figure[legs[5][2]] = createNode( m, lowerLeg, null, null );
        break;

    case legs[6][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[6][2]], 1, 0, 0));
        figure[legs[6][2]] = createNode( m, lowerLeg, null, null );
        break;

    case legs[7][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[7][2]], 1, 0, -1));
        figure[legs[7][2]] = createNode( m, lowerLeg, null, null );
        break;
    }
}

function initAllNodes(){
    initNodes(torsoId);
    initNodes(legs[0][0]);
    initNodes(legs[0][1]);
    initNodes(legs[0][2]);
    initNodes(legs[1][0]);
    initNodes(legs[1][1]);
    initNodes(legs[1][2]);
    initNodes(legs[2][0]);
    initNodes(legs[2][1]);
    initNodes(legs[2][2]);
    initNodes(legs[3][0]);
    initNodes(legs[3][1]);
    initNodes(legs[3][2]);
    initNodes(legs[4][0]);
    initNodes(legs[4][1]);
    initNodes(legs[4][2]);
    initNodes(legs[5][0]);
    initNodes(legs[5][1]);
    initNodes(legs[5][2]);
    initNodes(legs[6][0]);
    initNodes(legs[6][1]);
    initNodes(legs[6][2]);
    initNodes(legs[7][0]);
    initNodes(legs[7][1]);
    initNodes(legs[7][2]);
}

function resetCamera(){
    cameraMatrixY = [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ];
    
    cameraMatrixX = [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ];
}

function resetAllSliders(thetaArrTemp){
    document.getElementById("slider0").value = thetaArrTemp[0];
    document.getElementById("slider1").value = thetaArrTemp[1];
    document.getElementById("slider2").value = thetaArrTemp[2];
    document.getElementById("slider3").value = thetaArrTemp[3];
    document.getElementById("slider4").value = thetaArrTemp[4];
    document.getElementById("slider5").value = thetaArrTemp[5];
    document.getElementById("slider6").value = thetaArrTemp[6];
    document.getElementById("slider7").value = thetaArrTemp[7];
    document.getElementById("slider8").value = thetaArrTemp[8];
    document.getElementById("slider9").value = thetaArrTemp[9];
    document.getElementById("slider10").value = thetaArrTemp[10];
    document.getElementById("slider11").value = thetaArrTemp[11];
    document.getElementById("slider12").value = thetaArrTemp[12];
    document.getElementById("slider13").value = thetaArrTemp[13];
    document.getElementById("slider14").value = thetaArrTemp[14];
    document.getElementById("slider15").value = thetaArrTemp[15];
    document.getElementById("slider16").value = thetaArrTemp[16];
    document.getElementById("slider17").value = thetaArrTemp[17];
    document.getElementById("slider18").value = thetaArrTemp[18];
    document.getElementById("slider19").value = thetaArrTemp[19];
    document.getElementById("slider20").value = thetaArrTemp[20];
    document.getElementById("slider21").value = thetaArrTemp[21];
    document.getElementById("slider22").value = thetaArrTemp[22];
    document.getElementById("slider23").value = thetaArrTemp[23];
    document.getElementById("slider24").value = thetaArrTemp[24];
}

function resetCameraSliders(){
    document.getElementById("slider25").value = 0;
    document.getElementById("slider26").value = 0;
}

function traverse(Id){
    if(Id == null) return; 
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if(figure[Id].child != null) traverse(figure[Id].child); 
    modelViewMatrix = stack.pop();
    if(figure[Id].sibling != null) traverse(figure[Id].sibling); 
}

function torso(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 36);
}

function upperLeg(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 36);
}

function middleLeg(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * middleLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(middleLegWidth, middleLegHeight, middleLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 36);
}

function lowerLeg(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 36);
}

function quad(a, b, c, d){
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
}

function cube(){
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 219/255, 240/255, 254/255, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader");
    
    gl.useProgram( program);
    cube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    instanceMatrix = mat4();
    modelViewMatrix = mat4();
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    cameraMatrixLocY = gl.getUniformLocation( program, "cameraMatrixY" );
    cameraMatrixLocX = gl.getUniformLocation( program, "cameraMatrixX" );

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
        flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
        flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
        flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"),materialShininess);

    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );
  
    //Initiation for sliders
    document.getElementById("slider0").onchange = function() {
        theta[torsoId ] = parseInt(event.srcElement.value);
        initNodes(torsoId);
    };
    document.getElementById("slider1").onchange = function() {
        theta[legs[0][0]] = parseInt(event.srcElement.value);
        initNodes(legs[0][0]);
    };
    document.getElementById("slider2").onchange = function() {
        theta[legs[0][1]] = parseInt(event.srcElement.value);
        initNodes(legs[0][1]);
    };
    document.getElementById("slider3").onchange = function() {
        theta[legs[0][2]] = parseInt(event.srcElement.value);
        initNodes(legs[0][2]);
    };
    document.getElementById("slider4").onchange = function() {
        theta[legs[1][0]] = parseInt(event.srcElement.value);
        initNodes(legs[1][0]);
    };
    document.getElementById("slider5").onchange = function() {
        theta[legs[1][1]] = parseInt(event.srcElement.value);
        initNodes(legs[1][1]);
    };
    document.getElementById("slider6").onchange = function() {
        theta[legs[1][2]] = parseInt(event.srcElement.value);
        initNodes(legs[1][2]);
    };
    document.getElementById("slider7").onchange = function() {
        theta[legs[2][0]] = parseInt(event.srcElement.value);
        initNodes(legs[2][0]);
    };
    document.getElementById("slider8").onchange = function() {
        theta[legs[2][1]] = parseInt(event.srcElement.value);
        initNodes(legs[2][1]);
    };
    document.getElementById("slider9").onchange = function() {
        theta[legs[2][2]] = parseInt(event.srcElement.value);
        initNodes(legs[2][2]);
    };
    document.getElementById("slider10").onchange = function() {
        theta[legs[3][0]] = parseInt(event.srcElement.value);
        initNodes(legs[3][0]);
    };
    document.getElementById("slider11").onchange = function() {
        theta[legs[3][1]] = parseInt(event.srcElement.value);
        initNodes(legs[3][1]);
    };
    document.getElementById("slider12").onchange = function() {
        theta[legs[3][2]] = parseInt(event.srcElement.value);
        initNodes(legs[3][2]);
    };
    document.getElementById("slider13").onchange = function() {
        theta[legs[4][0]] = parseInt(event.srcElement.value);
        initNodes(legs[4][0]);
    };
    document.getElementById("slider14").onchange = function() {
        theta[legs[4][1]] = parseInt(event.srcElement.value);
        initNodes(legs[4][1]);
    };
    document.getElementById("slider15").onchange = function() {
        theta[legs[4][2]] = parseInt(event.srcElement.value);
        initNodes(legs[4][2]);
    };
    document.getElementById("slider16").onchange = function() {
        theta[legs[5][0]] = parseInt(event.srcElement.value);
        initNodes(legs[5][0]);
    };
    document.getElementById("slider17").onchange = function() {
        theta[legs[5][1]] = parseInt(event.srcElement.value);
        initNodes(legs[5][1]);
    };
    document.getElementById("slider18").onchange = function() {
        theta[legs[5][2]] = parseInt(event.srcElement.value);
        initNodes(legs[5][2]);
    };
    document.getElementById("slider19").onchange = function() {
        theta[legs[6][0]] = parseInt(event.srcElement.value);
        initNodes(legs[6][0]);
    };
    document.getElementById("slider20").onchange = function() {
        theta[legs[6][1]] = parseInt(event.srcElement.value);
        initNodes(legs[6][1]);
    };
    document.getElementById("slider21").onchange = function() {
        theta[legs[6][2]] = parseInt(event.srcElement.value);
        initNodes(legs[6][2]);
    };
    document.getElementById("slider22").onchange = function() {
        theta[legs[7][0]] = parseInt(event.srcElement.value);
        initNodes(legs[7][0]);
    };
    document.getElementById("slider23").onchange = function() {
        theta[legs[7][1]] = parseInt(event.srcElement.value);
        initNodes(legs[7][1]);
    };
    document.getElementById("slider24").onchange = function() {
        theta[legs[7][2]] = parseInt(event.srcElement.value);
        initNodes(legs[7][2]);
    };
    document.getElementById("slider25").onchange = function() {
        radianDeg = degreeToRadians(event.srcElement.value);
        rotateY(radianDeg);
    };
    document.getElementById("slider26").onchange = function() {
        radianDeg = degreeToRadians(event.srcElement.value);
        rotateX(radianDeg);
    };

    //Neutral Pose Button
    document.getElementById("neutralPoseButton").addEventListener("click", function(){
        theta = neutralTheta;
        initAllNodes();
        resetAllSliders(neutralTheta);
        resetCamera();
        resetCameraSliders();
    });

    // This is the event listener for the save button
    var saveButton = document.getElementById('savebutton');
    saveButton.addEventListener("click", function() {
        try {
            //Interpolate the key frame theta calues to download
            var interpolatedThetaArr = interpolate(thetaArr);
            if (!interpolatedThetaArr) {
                throw new Error('Interpolation function returned no value.');
            }

            //Json Config obj
            var config = {
                thetaArr: interpolatedThetaArr
            };

            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config));

            //Create an anchor element if it doesn't exist
            var dlAnchorElem = document.getElementById('downloadAnchorElem');
            if (!dlAnchorElem) {
                dlAnchorElem = document.createElement('a');
                document.body.appendChild(dlAnchorElem);
            }

            //Set the href and download attributes for the anchor element
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", "config.json");
            dlAnchorElem.click();

            //Clear the thetaArr
            thetaArr = [];
        } catch (error) {
            console.error('An error occurred:', error);
        }
    });

    //It saves the current frame to the thetaArr so that it can be interpolated later.
    var saveFrameButton = document.getElementById("saveframebutton");
    saveFrameButton.addEventListener("click", function(){
        thetaArr.push(theta);
    });

    var uploadInput = document.getElementById("uploadconfig");
    var uploadButton = document.getElementById("uploadbutton");
    var animateButton = document.getElementById("animatebutton");
    var uploadMsg = document.getElementById("uploadmsg");

    //Upload button functionality
    uploadButton.addEventListener("click", function(){
        var file = uploadInput.files[0];
        if(file){
            var reader = new FileReader();
            var providedArr;
            reader.addEventListener('load', function() {
                var result = JSON.parse(reader.result);
                //Store the thetaArr in text into a temp variable
                providedArr = result.thetaArr;
                if(providedArr){
                    //save contents of file in thetaArr
                    thetaArr = providedArr;
                    animFrameLen = thetaArr.length -1;
                    animFrameCounter = 0;
                    uploadMsg.style.display = "none";
                } else {
                    uploadMsg.innerText = "This is not a suitable config!";
                    uploadMsg.style.display = "block";
                }
            });
            reader.readAsText(file);
        } else {
            uploadMsg.innerText = "No file has been provided!";
            uploadMsg.style.display = "block";
        }
    });

    //Delay slider
    document.getElementById("framedelay").onchange = function() {
        delay = this.value;
    };

    //Run-Stop Animation Button
    animateButton.addEventListener("click", function(){
        animToggle = !animToggle;
    });

    for(i=0; i<numNodes; i++) initNodes(i);
    render();
}

//Render function
var render = async function() {
    if (animToggle) {
        await new Promise(r => setTimeout(r, delay));
        run_anim();
    }
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.uniformMatrix4fv( cameraMatrixLocY, false, flatten(cameraMatrixY));
    gl.uniformMatrix4fv( cameraMatrixLocX, false, flatten(cameraMatrixX));
    traverse(torsoId);
    requestAnimFrame(render);
}

function run_anim(){
    animFrameCounter++;
    if(animFrameCounter > animFrameLen)
        animFrameCounter = 0
    theta = thetaArr[animFrameCounter];
    resetAllSliders(theta);
    for(i=0; i<numNodes; i++) initNodes(i);
}

//Interpolation function
function interpolate( currArr) {
    var interpolatedArr = [];
    var len = currArr.length;
    for (var i = 0; i < len - 1; i++) {
        interpolatedArr.push(currArr[i]);
        var curr = currArr[i];
        var next = currArr[i + 1];
        var diff = [];
        //Calculate differences of theta values in keyframes
        for (var j = 0; j < curr.length; j++) {
            diff.push((next[j] - curr[j]) / 10);
        }
        //Generate intermediate theta values
        for (var k = 0; k < 9; k++) {
            var temp = [];
            for (var l = 0; l < curr.length; l++) {
                temp.push(curr[l] + diff[l] * (k + 1));
            }
            interpolatedArr.push(temp);
        }
    }
    interpolatedArr.push(currArr[len - 1]);
    return interpolatedArr;
}

//TODO:
//KAFADAKI GOCUK-- QUAD fonksiyonu alakalı 
//Silindir yapisi, tipi duzeltme
// Iki tane animasyon butonu
// UI - arkaya deniz koymayi denesene