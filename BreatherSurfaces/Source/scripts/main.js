// Canvas props
var canvas, gl, program;

// Matrices
var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;

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

// Buffers

var vBuffer, nBuffer, tBuffer;
var vPosition, vNormal, vTexCoord;

var shading = 0;        // 0: wireframe / 1: phong / 2: Gouraud
var env_map = false;

var vertices = [];
var normals = [];
var textCoords = [];

// Texture / Environment mapping
//var texture, t_ind = 0;
//var tex_url = img_urls[t_ind];
var cubeMap;


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

// Onload
window.onload = function init()
{
    //loadTextures();

    // Canvas
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl)
        alert("WebGL isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.DEPTH_TEST);

    updateProgram();

    updateSliders();
    handleEvents();
    render();
}

// Breather surface
function generate_breather()
{
    vertices = [];
    normals = [];

    generate_vertices();

    if(shading === 1 || shading === 2)
    {
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

        // Texture map
        /*configureTexture();

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);*/
    }

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

// Rendering
function render()
{
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

    // Draw
    for(var j = 0; j < vertices.length; j += 3)
    {
        if(shading === 0)
            gl.drawArrays(gl.LINES, j, 3);
        else
            gl.drawArrays(gl.TRIANGLES, j, 3);
    }

    requestAnimFrame(render);
}

// Handling listeners/events
function handleEvents()
{
    // Options
    // Shading
    document.getElementById('shading-type').addEventListener("change", function()
    {
        shading = parseInt(document.getElementById('shading-type').value);
        updateSliders();
        updateProgram();
    });

    
    // Environment mapping
    document.getElementById('env-active').addEventListener("change", function()
    {
        env_map = this.checked;
        //document.getElementById("texture").disabled = env_map;
        updateProgram();
    });

    // Texture
    /*document.getElementById('texture').addEventListener("change", function()
    {
        options = document.getElementById("texture");

        t_ind = options.selectedIndex;
        tex_url = img_urls[t_ind];

        updateSliders();
        generate_breather();
    });*/

    // Slider
    document.getElementById('aa').onchange = function()
    {
        aa = parseFloat(this.value);
        updateSliders();
        generate_breather();
    };

    document.getElementById('uValue').onchange = function()
    {
        uValue = parseFloat(this.value);
        updateSliders();
        generate_breather();
    };

    document.getElementById('vValue').onchange = function()
    {
        vValue = parseFloat(this.value);
        updateSliders();
        generate_breather();
    };

    document.getElementById('uPrecision').onchange = function()
    {
        uPrecision = parseFloat(this.value);
        updateSliders();
        generate_breather();
    };
    document.getElementById('vPrecision').onchange = function()
    {
        vPrecision = parseFloat(this.value);
        updateSliders();
        generate_breather();
    };
    document.getElementById("rotateY").onchange = function() {
        radianDeg = degreeToRadians(event.srcElement.value);
        cameraRotateY(radianDeg);
    };
    document.getElementById("rotateX").onchange = function() {
        radianDeg = degreeToRadians(event.srcElement.value);
        cameraRotateX(radianDeg);
    };

    // Buttons
    document.getElementById("zoom-in").onclick = function(){ updateZoom('+'); };
    document.getElementById("zoom-out").onclick = function(){ updateZoom('-'); };

    

   
}

// Updating slider
function updateSliders()
{


    document.getElementById('env-active').disabled = (shading === 0);
    //document.getElementById("texture").disabled = (shading === 0);

    document.getElementById('aa').value = "" + aa;
    document.getElementById('aa').value = "" + aa;
    document.getElementById('aa_val').innerHTML = "" + aa;



    document.getElementById('uValue').value = "" + uValue;
    document.getElementById('vValue').value = "" + vValue;
    document.getElementById('uValue_val').innerHTML = "" + uValue;
    document.getElementById('vValue_val').innerHTML = "" + vValue;


  /*  document.getElementById('vMin').value = "" + vMin;
    document.getElementById('vMax').value = "" + vMax;
    document.getElementById('vMin_val').innerHTML = "" + vMin;
    document.getElementById('vMax_val').innerHTML = "" + vMax;*/


    document.getElementById('vPrecision').value = "" + vPrecision;
    document.getElementById('uPrecision').value = "" + uPrecision;
    document.getElementById('vPrecision_val').innerHTML = "" + vPrecision;
    document.getElementById('uPrecision_val').innerHTML = "" + uPrecision;
;

    document.getElementById("shading-type").value = shading;
    //document.getElementById("texture").value = t_ind + 1;
}

// Update program
function updateProgram()
{
    if(shading === 0)
        program = initShaders(gl, "wire-frame-vertex-shader", "wire-frame-fragment-shader");
    else if(shading === 1)
        program = (!env_map) ? initShaders(gl, "phong-vertex-shader", "phong-fragment-shader") : initShaders(gl, "phong-vertex-shader", "phong-fragment-shader-env");
    else if(shading === 2)
        program = (!env_map) ? initShaders(gl, "gouraud-vertex-shader", "gouraud-fragment-shader") : initShaders(gl, "gouraud-vertex-shader", "gouraud-fragment-shader-env");

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

    handleEvents();

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct));
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct));
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct));
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition));
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess);
}

/**
    Configuring texture

    Reference:

    Obtained from Lecture codes
    +
    https://webglfundamentals.org/webgl/lessons/webgl-cors-permission.html

*/
/*function configureTexture()
{
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    var textureInfo =
    {
        width: 1,
        height: 1,
        texture: texture,
    };

    var img = new Image();
    img.addEventListener('load', function()
    {
        textureInfo.width = img.width;
        textureInfo.height = img.height;

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    });

    requestCORSIfNotSameOrigin(img, tex_url);
    img.src = tex_url;
}*/

/**
    Obtained from Lecture codes
*/
//For pattern, rather than use a texture image not checkerboard pattern
//First use image metalic background texture and make it pattern
//Then use it as texture

function configureCubeMap() {

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


/**
    Reference:

    https://webglfundamentals.org/webgl/lessons/webgl-cors-permission.html
*/
/*function requestCORSIfNotSameOrigin(img, tex_url)
{
    if ((new URL(tex_url)).origin !== window.location.origin)
    {
        img.crossOrigin = "";
    }
}*/

/*function loadTextures()
{
    document.getElementById("texture").innerHTML = "";
    for(var i = 0; i < img_urls.length; i++)
    {
        var option = document.createElement("option");
        option.value = i + 1;
        option.innerHTML = "" + (i + 1);
        document.getElementById("texture").appendChild(option);
    }
}*/

//TODO List:
// 1. Shadingle beraber kamera bozuluyor
// 2. Yukarı aşağı oynamıyor ucu phi ile , dikeyde dönmüyor yani
// 3. En son kod düzeltmesi-değiştirmesi + html vsvs
// 4. UI düzenleme
// 5. Ufak tefek sorunlar var, ama Allahın izniyle düzelteceğiz. aslanım benim :D 