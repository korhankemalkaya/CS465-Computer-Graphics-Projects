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
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0];

var thetaArr = [[0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0]] //Check if it is necessary

//TODO: CHECK IF SLIDER CASE MATH NECESSARY
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


function degreeToRadians(degreeVar){
    return degreeVar * Math.PI / 180;
}

function rotateY(angleVar){
    var cosVar = Math.cos(angleVar);
    var sinVar = Math.sin(angleVar);

    cameraMatrixY[0] = cosVar;
    cameraMatrixY[2] = -sinVar;
    cameraMatrixY[8] = sinVar;
    cameraMatrixY[10] = cosVar;

    //render();
}

function rotateX(angleVar){
    var cosVar = Math.cos(angleVar);
    var sinVar = Math.sin(angleVar);

    cameraMatrixX[5] = cosVar;
    cameraMatrixX[6] = sinVar;
    cameraMatrixX[9] = -sinVar;
    cameraMatrixX[10] = cosVar;

   // render();
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

    //
    //  Load shaders and initialize attribute buffers
    //
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
  
    document.getElementById("slider0").onchange = function() {
        theta[torsoId ] = event.srcElement.value;
        initNodes(torsoId);
    };
    document.getElementById("slider1").onchange = function() {
        theta[legs[0][0]] = event.srcElement.value;
        initNodes(legs[0][0]);
    };
    document.getElementById("slider2").onchange = function() {
        theta[legs[0][1]] =  event.srcElement.value;
        initNodes(legs[0][1]);
    };
    document.getElementById("slider3").onchange = function() {
        theta[legs[0][2]] =  event.srcElement.value;
        initNodes(legs[0][2]);
    };
    document.getElementById("slider4").onchange = function() {
        theta[legs[1][0]] = event.srcElement.value;
        initNodes(legs[1][0]);
    };
    document.getElementById("slider5").onchange = function() {
        theta[legs[1][1]] =  event.srcElement.value;
        initNodes(legs[1][1]);
    };
    document.getElementById("slider6").onchange = function() {
        theta[legs[1][2]] =  event.srcElement.value;
        initNodes(legs[1][2]);
    };
    document.getElementById("slider7").onchange = function() {
        theta[legs[2][0]] = event.srcElement.value;
        initNodes(legs[2][0]);
    };
    document.getElementById("slider8").onchange = function() {
        theta[legs[2][1]] =  event.srcElement.value;
        initNodes(legs[2][1]);
    };
    document.getElementById("slider9").onchange = function() {
        theta[legs[2][2]] =  event.srcElement.value;
        initNodes(legs[2][2]);
    };
    document.getElementById("slider10").onchange = function() {
        theta[legs[3][0]] = event.srcElement.value;
        initNodes(legs[3][0]);
    };
    document.getElementById("slider11").onchange = function() {
        theta[legs[3][1]] =  event.srcElement.value;
        initNodes(legs[3][1]);
    };
    document.getElementById("slider12").onchange = function() {
        theta[legs[3][2]] =  event.srcElement.value;
        initNodes(legs[3][2]);
    };
    document.getElementById("slider13").onchange = function() {
        theta[legs[4][0]] = event.srcElement.value;
        initNodes(legs[4][0]);
    };
    document.getElementById("slider14").onchange = function() {
        theta[legs[4][1]] =  event.srcElement.value;
        initNodes(legs[4][1]);
    };
    document.getElementById("slider15").onchange = function() {
        theta[legs[4][2]] =  event.srcElement.value;
        initNodes(legs[4][2]);
    };
    document.getElementById("slider16").onchange = function() {
        theta[legs[5][0]] = event.srcElement.value;
        initNodes(legs[5][0]);
    };
    document.getElementById("slider17").onchange = function() {
        theta[legs[5][1]] =  event.srcElement.value;
        initNodes(legs[5][1]);
    };
    document.getElementById("slider18").onchange = function() {
        theta[legs[5][2]] =  event.srcElement.value;
        initNodes(legs[5][2]);
    };
    document.getElementById("slider19").onchange = function() {
        theta[legs[6][0]] = event.srcElement.value;
        initNodes(legs[6][0]);
    };
    document.getElementById("slider20").onchange = function() {
        theta[legs[6][1]] =  event.srcElement.value;
        initNodes(legs[6][1]);
    };
    document.getElementById("slider21").onchange = function() {
        theta[legs[6][2]] =  event.srcElement.value;
        initNodes(legs[6][2]);
    };
    document.getElementById("slider22").onchange = function() {
        theta[legs[7][0]] = event.srcElement.value;
        initNodes(legs[7][0]);
    };
    document.getElementById("slider23").onchange = function() {
        theta[legs[7][1]] =  event.srcElement.value;
        initNodes(legs[7][1]);
    };
    document.getElementById("slider24").onchange = function() {
        theta[legs[7][2]] =  event.srcElement.value;
        initNodes(legs[7][2]);
    };
    document.getElementById("slider25").onchange = function() {
        radianDeg =  degreeToRadians(event.srcElement.value);
        rotateY(radianDeg);
    };
    document.getElementById("slider26").onchange = function() {
        radianDeg =  degreeToRadians(event.srcElement.value);
        rotateX(radianDeg);
    };
    //TODO: NEUTRAL POSE IMPLEMENTATION
    /*document.getElementById("NeutralPose").onclick = function(){
        theta[torsoId] = 0;
        theta[legs[0][0]] = -180;
        theta[legs[0][1]] = -180;
        theta[legs[0][2]] = -180;
        theta[legs[1][0]] = -180;
        theta[legs[1][1]] = -180;
        theta[legs[1][2]] = -180;
        theta[legs[2][0]] = -180;
        theta[legs[2][1]] = -180;
        theta[legs[2][2]] = -180;
        theta[legs[3][0]] = -180;
        theta[legs[3][1]] = -180;
        theta[legs[3][2]] = -180;
        theta[legs[4][0]] = -180;
        theta[legs[4][1]] = -180;
        theta[legs[4][2]] = -180;
        theta[legs[5][0]] = -180;
        theta[legs[5][1]] = -180;
        theta[legs[5][2]] = -180;
        theta[legs[6][0]] = -180;
        theta[legs[6][1]] = -180;
        theta[legs[6][2]] = -180;
        theta[legs[7][0]] = -180;
        theta[legs[7][1]] = -180;
        theta[legs[7][2]] = -180;
        initNodes(torsoId);
    };*/
    // Code segment for uploading JSON config.
// This is the event listener for the save button
    var saveButton = document.getElementById('savebutton'); // Make sure this is the correct ID for your save button
    saveButton.addEventListener("click", function() {
        try {
            // Call the interpolate method and ensure it returns a value
            var interpolatedThetaArr = interpolate(thetaArr);
            if (!interpolatedThetaArr) {
                throw new Error('Interpolation function returned no value.');
            }

            // Construct the JSON configuration object
            var config = {
                thetaArr: interpolatedThetaArr
            };

            // Convert the JSON object to a data URI
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config));

            // Create an anchor element if it doesn't exist
            var dlAnchorElem = document.getElementById('downloadAnchorElem');
            if (!dlAnchorElem) {
                dlAnchorElem = document.createElement('a');
                document.body.appendChild(dlAnchorElem);
            }

            // Set the href and download attributes for the anchor element
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", "config.json");

            // Trigger the download
            dlAnchorElem.click();

            // Clear the thetaArr if necessary
            thetaArr = [];
        } catch (error) {
            console.error('An error occurred:', error);
        }
    });    
    //It saves the current frame to the thetaArr so that it can be interpolated later.
    var saveFrameButton = document.getElementById("saveframebutton");
    saveFrameButton.addEventListener("click", function(){
        thetaArr.push(theta);
    }
    );



    var uploadInput = document.getElementById("uploadconfig");
    var uploadButton = document.getElementById("uploadbutton");
    var animateButton = document.getElementById("animatebutton");
    var uploadMsg = document.getElementById("uploadmsg");
    uploadButton.addEventListener("click", function(){
        var file = uploadInput.files[0];
        if(file){
            var reader = new FileReader(); // File reader to read the file
            var providedArr;
            reader.addEventListener('load', function() {
                var result = JSON.parse(reader.result); // Parse the result into an object

                providedArr = result.thetaArr;

                if(providedArr){
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

    document.getElementById("framedelay").onchange = function() {
        delay = this.value;
    };

    animateButton.addEventListener("click", function(){
        animToggle = !animToggle;
    });

    for(i=0; i<numNodes; i++) initNodes(i);
    render();
}

    


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
        for (var j = 0; j < curr.length; j++) {
            diff.push((next[j] - curr[j]) / 10);
        }
        for (var k = 0; k < 9; k++) {
            var temp = [];
            for (var l = 0; l < curr.length; l++) {
                //if (curr[l] + diff[l] * (k + 1) <= 180 && curr[l] + diff[l] * (k + 1) >= -180)
                    temp.push(curr[l] + diff[l] * (k + 1));
                //else if (curr[l] + diff[l] * (k + 1) > 180) {
                 //   temp.push(180);
                //}
                //else if (curr[l] + diff[l] * (k + 1) < -180) {
                 //   temp.push(-180);
               // }
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
// Interpolation problemi
// UI - arkaya deniz koymayi denesene
// Neutral pose butonu
// Constraints on legs. Yani bacaklar kafayi dönüyor falan

