// Canvas props
var canvas, gl, program;

// Matrices
var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;

// Buffers
var vBuffer, nBuffer, tBuffer;
var vPosition, vNormal, vTexCoord;

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

var zoomMatrix = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
];
var zoomMatrixLoc;

// 0: wireframe / 1: phong / 2: Gouraud
var shading = 0;
var env_map = false;

var vertices = [];
var normals = [];
var textCoords = [];

var cubeMap;

var left = -10;
var right = 10;
var ytop = 10;
var bottom = -10;

var near = -10;
var far = 10;
var radius = 4.0;

var lightPosition = vec4(0.0, 5.0, 5.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var aa = 0.4;
var uValue = 14;
var vValue = 1;
var uPrecision = 0.1;
var vPrecision = 0.1;

function breather_formula(aa, u, v){
    var w = Math.sqrt(1 - aa * aa);
    var denom = aa * (Math.pow(w * Math.cosh(aa * u), 2) + Math.pow(aa * Math.sin(w * v), 2));
    //define x
    var x = -u + (2 * (1 - aa * aa) * Math.cosh(aa * u) * Math.sin(aa * u)) / denom;
    //define y
    var y = (2 * w * Math.cosh(aa * u) * (-w * Math.cos(v) * Math.cos(w * v) - Math.sin(v) * Math.sin(w * v))) / denom;
    //define z
    var z = (2 * w * Math.cosh(aa * u) * (-w * Math.sin(v) * Math.cos(w * v) + Math.cos(v) * Math.sin(w * v))) / denom;
     
    //Define normals
    var dxdu = 2 * ((1 - aa * aa) * Math.cos(aa * u) * Math.cosh(aa * u) / ((aa * aa * Math.sin(v * w) * Math.sin(v * w)) + (w * w * Math.cosh(aa * u) * Math.cosh(aa * u))))
            -(4 * (1 - aa * aa) * w * w * Math.sin(aa * u) * Math.sinh(aa * u) * Math.cosh(aa * u) * Math.cosh(aa * u)) / 
            ((aa * aa * Math.sin(v * w) * Math.sin(v * w) + w * w * Math.cosh(aa * u) * Math.cosh(aa * u)) * (aa * aa * Math.sin(v * w) * Math.sin(v * w) + w * w * Math.cosh(aa * u) * Math.cosh(aa * u)))
            +(2 * (1 - aa * aa) * Math.sin(aa * u) * Math.sinh(aa * u))/(aa * aa * Math.sin(v * w) * Math.sin(v * w) + w * w * Math.cosh(aa * u) * Math.cosh(aa * u)) - 1;
    
    var dydu = (2*Math.sinh(aa*u)*(Math.sin(v)*Math.sin(v*w)+w*Math.cos(v)*Math.cos(v*w))*(Math.pow(w,3)*Math.pow(Math.cosh(aa*u),2)-aa*aa*w*Math.pow(Math.sin(v*w),2)))
            /((aa*aa*Math.pow(Math.sin(v*w),2)+w*w*Math.pow(Math.cosh(aa*u),2))*(aa*aa*Math.pow(Math.sin(v*w),2)+w*w*Math.pow(Math.cosh(aa*u),2)));
    
    var dzdu = (2*Math.sinh(aa*u)*(w*Math.sin(v)*Math.cos(v*w)-Math.cos(v)*Math.sin(v*w))*(Math.pow(w,3)*Math.pow(Math.cosh(aa*u),2)-aa*aa*w*Math.pow(Math.sin(v*w),2)))
            /((aa*aa*Math.pow(Math.sin(v*w),2)+w*w*Math.pow(Math.cosh(aa*u),2))*(aa*aa*Math.pow(Math.sin(v*w),2)+w*w*Math.pow(Math.cosh(aa*u),2)));
    
    var dxdv = (4 * aa * (aa * aa - 1) * w * Math.sin(aa * u) * Math.cosh(aa * u) * Math.sin(v * w) * Math.cos(v * w))
            /((aa * aa * Math.sin(v * w) * Math.sin(v * w) + w * w * Math.cosh(aa * u) * Math.cosh(aa * u)) * (aa * aa * Math.sin(v * w) * Math.sin(v * w) + w * w * Math.cosh(aa * u) * Math.cosh(aa * u)));
    
    var dydv = ((2*w*Math.cosh(aa*u)*(w*w*Math.cos(v)*Math.sin(v*w)-Math.cos(v)*Math.sin(v*w)))
            /(aa*(aa*aa*Math.pow(Math.sin(v*w),2)+w*w*Math.pow(Math.cosh(aa*u),2))))
            -((4*aa*w*w*Math.cosh(aa*u)*Math.sin(v*w)*Math.cos(v*w)*(-Math.sin(v)*Math.sin(v*w)-w*Math.cos(v)*Math.cos(v*w)))
            /((aa*aa*Math.pow(Math.sin(v*w),2)+w*w*Math.pow(Math.cosh(aa*u),2))*(aa*aa*Math.pow(Math.sin(v*w),2)+w*w*Math.pow(Math.cosh(aa*u),2))));
    
    var dzdv = (((2*w*Math.cosh(aa*u)*(w*w*Math.sin(v)*Math.sin(v*w)-Math.sin(v)*Math.sin(v*w)))
            /(aa*(aa*aa*Math.pow(Math.sin(v*w),2)+w*w*Math.pow(Math.cosh(aa*u),2))))
            -((4*aa*w*w*Math.cosh(aa*u)*Math.sin(v*w)*Math.cos(v*w)*(Math.cos(v)*Math.sin(v*w)-w*Math.sin(v)*Math.cos(v*w)))
            /((aa*aa*Math.pow(Math.sin(v*w),2)+w*w*Math.pow(Math.cosh(aa*u),2))*(aa*aa*Math.pow(Math.sin(v*w),2)+w*w*Math.pow(Math.cosh(aa*u),2))))); 

    // Compute normal using cross product
    var nx = dydu * dzdv - dzdu * dydv;
    var ny = dzdu * dxdv - dxdu * dzdv;
    var nz = dxdu * dydv - dydu * dxdv;

    var points = vec4(x, y, z);
    var normal = vec4(nx, ny, nz);
    return {point: points , normal: normal};
} 

/**
    Generates Vertices according to Breather Surface
*/  
function generate_vertices() {
    var uSteps = Math.floor( 2*(uValue) / uPrecision);
    var vSteps = Math.floor(  (vValue * Math.PI) / vPrecision); 
    for (var i = 0; i < uSteps; i++) {
        for (var j = 0; j < vSteps; j++) {
            // Four vertices of the current quad
            var u0 = -uValue + i * uPrecision; 
            var v0 =  j * vPrecision;
            var u1 = -uValue + (i + 1) * uPrecision;
            var v1 =  (j + 1) * vPrecision;

            // Retrieve the points and normals for each vertex of the quad
            var p00 = breather_formula(aa, u0, v0);
            var p10 = breather_formula(aa, u1, v0);
            var p01 = breather_formula(aa, u0, v1);
            var p11 = breather_formula(aa, u1, v1);

            // Triangle 1
            vertices.push(...p00.point);
            normals.push(...p00.normal);
            textCoords.push(u0, v0);

            vertices.push(...p10.point);
            normals.push(...p10.normal);
            textCoords.push(u1, v0);

            vertices.push(...p01.point);
            normals.push(...p01.normal);
            textCoords.push(u0, v1);

            // Triangle 2
            vertices.push(...p10.point);
            normals.push(...p10.normal);
            textCoords.push(u1, v0);

            vertices.push(...p11.point);
            normals.push(...p11.normal);
            textCoords.push(u1, v1);

            vertices.push(...p01.point);
            normals.push(...p01.normal);
            textCoords.push(u0, v1);
        }
    }
}

//Camera rotate around y axis
function cameraRotateY(angleVar){
    var cosVar = Math.cos(angleVar);
    var sinVar = Math.sin(angleVar);

    cameraMatrixY[0] = cosVar;
    cameraMatrixY[2] = -sinVar;
    cameraMatrixY[8] = sinVar;
    cameraMatrixY[10] = cosVar;
}

//Camera rotate around x axis
function cameraRotateX(angleVar){
    var cosVar = Math.cos(angleVar);
    var sinVar = Math.sin(angleVar);

    cameraMatrixX[5] = cosVar;
    cameraMatrixX[6] = sinVar;
    cameraMatrixX[9] = -sinVar;
    cameraMatrixX[10] = cosVar;
}

function degreeToRadians(degreeVar){
    return degreeVar * Math.PI / 180;
}

function zoomIn(){
    zoomMatrix[15] = zoomMatrix[15] - 0.02;
}

function zoomOut(){
    zoomMatrix[15] = zoomMatrix[15] + 0.02;
}

// Environment Mapping (checker board pattern on outside cube)
var texSize = 64;

var temp = new Array();
for (var i = 0; i < texSize; i++){
    temp[i] = new Array();
}

for (var i = 0; i < texSize; i++){
    for (var j = 0; j < texSize; j++){
        temp[i][j] = new Float32Array(4);
    }
}
    
for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        var isRed = (((i & 0x8) == 0) ^ ((j & 0x8) == 0));
        if(isRed){
            // Red color
            temp[i][j] = [1, 0, 0, 1]; // Red with full opacity
        }else{
            // White color
            temp[i][j] = [1, 1, 1, 1]; // White with full opacity
        }
    }
}

// Convert floats to ubytes for texture
var pattern = new Uint8Array(4 * texSize * texSize);

for(var i = 0; i < texSize; i++){
    for(var j = 0; j < texSize; j++){
        for(var k = 0; k < 4; k++){
            pattern[4 * texSize * i + 4 * j + k] = 255 * temp[i][j][k];
        }
    }
}
    
// Onload
window.onload = function init(){
    // Canvas
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl){
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.DEPTH_TEST);

    updateProgram();

    document.getElementById('shading-type').addEventListener("change", function(){
        shading = parseInt(document.getElementById('shading-type').value);
        updateProgram();
    });
    document.getElementById('env-active').addEventListener("change", function(){
        env_map = this.checked;
        updateProgram();
    });
    document.getElementById('aa').onchange = function(){
        aa = parseFloat(this.value);
        generate_breather();
    };
    document.getElementById('uValue').onchange = function(){
        uValue = parseFloat(this.value);
        generate_breather();
    };
    document.getElementById('vValue').onchange = function(){
        vValue = parseFloat(this.value);
        generate_breather();
    };
    document.getElementById('uPrecision').onchange = function(){
        uPrecision = parseFloat(this.value);
        generate_breather();
    };
    document.getElementById('vPrecision').onchange = function(){
        vPrecision = parseFloat(this.value);
        generate_breather();
    };
    document.getElementById("rotateY").onchange = function(){
        radianDeg = degreeToRadians(event.srcElement.value);
        cameraRotateY(radianDeg);
    };
    document.getElementById("rotateX").onchange = function(){
        radianDeg = degreeToRadians(event.srcElement.value);
        cameraRotateX(radianDeg);
    };
    document.getElementById("zoom-in").onclick = function(){ 
        zoomIn(); 
    };
    document.getElementById("zoom-out").onclick = function(){ 
        zoomOut(); 
    };

    render();
}

// Breather surface
function generate_breather(){
    vertices = [];
    normals = [];

    generate_vertices();

    if(shading === 1 || shading === 2){
        nBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

        vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);

        tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(textCoords), gl.STATIC_DRAW );

        vTexCoord = gl.getAttribLocation(program, "vTexCoord");
        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTexCoord);

        // Environment map
        configureCubeMap();

        gl.activeTexture( gl.TEXTURE0);
        gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);
    }

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

// Rendering
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelViewMatrix = mat4();
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
    gl.uniformMatrix4fv( cameraMatrixLocY, false, flatten(cameraMatrixY));
    gl.uniformMatrix4fv( cameraMatrixLocX, false, flatten(cameraMatrixX));
    gl.uniformMatrix4fv( zoomMatrixLoc, false, flatten(zoomMatrix));

    // Draw
    for(var j = 0; j < vertices.length; j += 3){
        if(shading === 0)
            gl.drawArrays(gl.LINES, j, 3);
        else
            gl.drawArrays(gl.TRIANGLES, j, 3);
    }
    requestAnimFrame(render);
}

// Update program
function updateProgram(){
    if(shading === 0){
        program = initShaders(gl, "wire-frame-vertex-shader", "wire-frame-fragment-shader");
    }else if(shading === 1){
        if(env_map){
            program = initShaders(gl, "phong-vertex-shader", "phong-fragment-shader-env");
        }else{
            program = initShaders(gl, "phong-vertex-shader", "phong-fragment-shader");
        }
    }else if(shading === 2){
        if(env_map){
            program = initShaders(gl, "gouraud-vertex-shader", "gouraud-fragment-shader-env");
        }else{
            program = initShaders(gl, "gouraud-vertex-shader", "gouraud-fragment-shader");
        }
    }
    gl.useProgram(program);

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    // Generating vertices
    generate_breather();

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    cameraMatrixLocY = gl.getUniformLocation( program, "cameraMatrixY" );
    cameraMatrixLocX = gl.getUniformLocation( program, "cameraMatrixX" );
    zoomMatrixLoc = gl.getUniformLocation( program, "zoomMatrix" );

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct));
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct));
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct));
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition));
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess);
}

function configureCubeMap(){
    cubeMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, pattern);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, pattern);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, pattern);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, pattern);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, pattern);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, pattern);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
}

//TODO List:
// 3. En son kod düzeltmesi-değiştirmesi + html vsvs
// 4. UI düzenleme
// 5. Ufak tefek sorunlar var, ama Allahın izniyle düzelteceğiz. aslanım benim :D 