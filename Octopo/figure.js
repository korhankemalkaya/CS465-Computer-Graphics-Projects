var canvas;
var gl;
var program;

var projectionMatrix; 
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

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
var numAngles = 25;
var angle = 0;

var theta = [0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0,
    -180, 0, 0];

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();
    
    switch(Id) {
    
    case torsoId:
        m = rotate(theta[torsoId], 0, 1, 0 );
        figure[torsoId] = createNode( m, torso, null, legs[0][0]);
        break;

    //Upper Arm
    case legs[0][0]://on sol
        m = translate(-(torsoWidth/2-upperLegWidth/2), (torsoHeight/2-upperLegHeight), -torsoWidth/2+upperLegWidth/2);
	    m = mult(m , rotate(theta[legs[0][0]], 1, 0, 1));
        figure[legs[0][0]] = createNode( m, upperLeg, legs[1][0], legs[0][1]);
        break;

    case legs[1][0]://on orta
        m = translate(0, (torsoHeight/2-upperLegHeight), -torsoWidth/2+upperLegWidth/2);
	    m = mult(m , rotate(theta[legs[1][0]], 1, 0, 0));
        figure[legs[1][0]] = createNode( m, upperLeg, legs[2][0], legs[1][1] );
        break;

    case legs[2][0]://on sag
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

    case legs[5][0]://arka sol
        m = translate(-(torsoWidth/2-upperLegWidth/2), (torsoHeight/2-upperLegHeight), torsoWidth/2-upperLegWidth/2);
	    m = mult(m , rotate(theta[legs[5][0]], 1, 0, 1));
        figure[legs[5][0]] = createNode( m, upperLeg, legs[6][0], legs[5][1] );
        break;

    case legs[6][0]://arka orta
        m = translate(0, (torsoHeight/2-upperLegHeight), torsoWidth/2-upperLegWidth/2);
	    m = mult(m , rotate(theta[legs[6][0]], 1, 0, 0));
        figure[legs[6][0]] = createNode( m, upperLeg, legs[7][0], legs[6][1] );
        break;

    case legs[7][0]://arka sag
        m = translate((torsoWidth/2-upperLegWidth/2), (torsoHeight/2-upperLegHeight), torsoWidth/2-upperLegWidth/2);
	    m = mult(m , rotate(theta[legs[7][0]], 1, 0, 1));
        figure[legs[7][0]] = createNode( m, upperLeg, null, legs[7][1] );
        break;


    //Middle Arm
    case legs[0][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[0][1]], 1, 0, 0));
        figure[legs[0][1]] = createNode( m, middleLeg, null, legs[0][2] );
        break;

    case legs[1][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[1][1]], 1, 0, 0));
        figure[legs[1][1]] = createNode( m, middleLeg, null, legs[1][2] );
        break;

    case legs[2][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[2][1]], 1, 0, 0));
        figure[legs[2][1]] = createNode( m, middleLeg, null, legs[2][2] );
        break;

    case legs[3][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[3][1]], 1, 0, 0));
        figure[legs[3][1]] = createNode( m, middleLeg, null, legs[3][2] );
        break;

    case legs[4][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[4][1]], 1, 0, 0));
        figure[legs[4][1]] = createNode( m, middleLeg, null, legs[4][2] );
        break;

    case legs[5][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[5][1]], 1, 0, 0));
        figure[legs[5][1]] = createNode( m, middleLeg, null, legs[5][2] );
        break;

    case legs[6][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[6][1]], 1, 0, 0));
        figure[legs[6][1]] = createNode( m, middleLeg, null, legs[6][2] );
        break;

    case legs[7][1]:
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[7][1]], 1, 0, 0));
        figure[legs[7][1]] = createNode( m, middleLeg, null, legs[7][2] );
        break;

    //Lower Arm
    case legs[0][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[0][2]], 1, 0, 0));
        figure[legs[0][2]] = createNode( m, lowerLeg, null, null );
        break;

    case legs[1][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[1][2]], 1, 0, 0));
        figure[legs[1][2]] = createNode( m, lowerLeg, null, null );
        break;

    case legs[2][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[2][2]], 1, 0, 0));
        figure[legs[2][2]] = createNode( m, lowerLeg, null, null );
        break;

    case legs[3][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[3][2]], 1, 0, 0));
        figure[legs[3][2]] = createNode( m, lowerLeg, null, null );
        break;

    case legs[4][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[4][2]], 1, 0, 0));
        figure[legs[4][2]] = createNode( m, lowerLeg, null, null );
        break;

    case legs[5][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[5][2]], 1, 0, 0));
        figure[legs[5][2]] = createNode( m, lowerLeg, null, null );
        break;

    case legs[6][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[6][2]], 1, 0, 0));
        figure[legs[6][2]] = createNode( m, lowerLeg, null, null );
        break;

    case legs[7][2]:
        m = translate(0.0, middleLegHeight, 0.0);
        m = mult(m, rotate(theta[legs[7][2]], 1, 0, 0));
        figure[legs[7][2]] = createNode( m, lowerLeg, null, null );
        break;
    }

}

function traverse(Id) {
   if(Id == null) return; 
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child); 
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling); 
}

function torso() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function upperLeg(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function middleLeg(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * middleLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(middleLegWidth, middleLegHeight, middleLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function lowerLeg(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     pointsArray.push(vertices[b]); 
     pointsArray.push(vertices[c]);     
     pointsArray.push(vertices[d]);    
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");
    
    gl.useProgram( program);

    instanceMatrix = mat4();
    
    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();

        
    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );
    
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")
    
    cube();
        
    vBuffer = gl.createBuffer();
        
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
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

    for(i=0; i<numNodes; i++) initNodes(i);
    
    render();
}


var render = function() {

        gl.clear( gl.COLOR_BUFFER_BIT );
        traverse(torsoId);
        requestAnimFrame(render);
}
