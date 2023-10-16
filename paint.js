var canvas;
var gl;
var vBuffer;
var cBuffer;
var redraw = false;
var zoomMatrixLoc;
var zoomMatrix = [1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1];
var colors = [
    vec4(0.0, 0.0, 0.0, 1.0),   // black
    vec4(1.0, 0.0, 0.0, 1.0),   // red
    vec4(1.0, 1.0, 0.0, 1.0),   // yellow
    vec4(0.0, 1.0, 0.0, 1.0),   // green
    vec4(0.0, 0.0, 1.0, 1.0),   // blue
    vec4(1.0, 0.0, 1.0, 1.0),   // magenta
    vec4(0.0, 1.0, 1.0, 1.0)    // cyan
];

var triangles = []
var colorsSaved = []

var strokeTriangleNumber = 0;
var strokeStartIndex = 0;
var strokeNumber = 0;

var strokes = [];
var strokeColors = [];

var redo = [];
var redoColors = [];
var redoPossible = false;

var cindex = 0;
var tool = 0;

// Get the chosen color
function changed(value){
    cindex = value;
}

function toolChanged(value){
    tool = value;
}

// Define the maximum number of vertices
var maxNumVertices = 3600*3; // 3600 triangles

// Initialize the index variable
var index = 0;

var mouseX = 0;
var mouseY = 0;
var canvasX = -1;
var canvasY = +1;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    window.addEventListener("keydown", function(event){
        if((event.keyCode == 90) && event.ctrlKey){ //undo CTRL + Z
            undoAction();
        }
        if((event.keyCode == 89) && event.ctrlKey){ //redo CTRL + Y
            redoAction();
        }
    });

    canvas.addEventListener("wheel", event => {
        const delta = Math.sign(event.deltaY);
        
        const rect = canvas.getBoundingClientRect()
        var newMouseX = event.clientX - rect.left;
        var newMouseY = event.clientY - rect.top;

        if(newMouseX != mouseX || newMouseY != mouseY){
            mouseX = newMouseX;
            mouseY = newMouseY;
            canvasX = (2 * mouseX / canvas.width - 1);
            canvasY = (2*(canvas.height - mouseY)/canvas.height -1);   
        }

        if(delta < 0){
            zoomOut(canvasX , canvasY);
        }else if(delta > 0){
            zoomIn(canvasX , canvasY);
        }
    });

    canvas.addEventListener("mousedown", function(event) {
        redraw = true;
        if (tool == "0") {
            render();
        }
    });

    canvas.addEventListener("mouseup", function(event) {
        if (tool == "0"){
            redraw = false;
            if (strokeTriangleNumber > 0 ) {
                strokes[strokeNumber] = []
                strokeColors[strokeNumber] = []
                for(var i = 0; i < strokeTriangleNumber; i++){
                    strokes[strokeNumber].push(triangles[strokeStartIndex + i]);
                    strokeColors[strokeNumber].push(colorsSaved[strokeStartIndex + i]);
                }
        
                strokeStartIndex += strokeTriangleNumber;
                strokeTriangleNumber = 0;
                strokeNumber++;
                redo = [];
                redoColors = [];
                redoPossible= false;
            }       
        }
    });

    canvas.addEventListener("mousemove", function(event) {
        if (redraw) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            const rect = canvas.getBoundingClientRect()
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // Calculating the side of the square as we want 30x30 square grid
            squareSide = Math.floor(canvas.width / 30);

            // Calculating the index of the square mouse is on
            var x_index = Math.floor(x /  squareSide);
            var y_index = Math.floor(y /  squareSide);

            // Calculate the relative position within the square unit
            var x_rel = x % squareSide;
            var y_rel = y % squareSide;
  
            // Determine the square based on relative position
            var squareType = "";

            if (x_rel < squareSide/2 && y_rel < squareSide/2) {
                squareType = "leftTop";
            } else if (x_rel < squareSide/2 && y_rel >= squareSide/2) {
                squareType = "leftBottom";
            } else if (x_rel >=  squareSide/2 && y_rel < squareSide/2) {
                squareType = "rightTop";
            } else {
                squareType = "rightBottom";
            }

            // Calculate center point
            var center_x = x_index * (squareSide) + (squareSide / 2);
            var center_y = y_index * (squareSide) + (squareSide / 2);
            var center = vec2(center_x, center_y);
            
            // Calculate the slope
            slope = (y_rel - (squareSide / 2)) / (x_rel - (squareSide / 2));
            slopeSq = slope * slope;

            // Coordinates of the vertex points
            var t;
            var leftTopC = vec2( x_index *squareSide, y_index*squareSide);
            var rightTopC = vec2( ( x_index +1 ) * squareSide, y_index *squareSide);
            var leftBottomC = vec2( x_index *squareSide, ( y_index +1 )*squareSide);
            var rightBottomC = vec2( (x_index + 1 )*squareSide, ( y_index +1 )*squareSide);
        
            // Determine which triangle the mouse is on based on slopes
            if (squareType === "leftTop") {
                if (slopeSq < 1) {
                    // Mouse is on the left triangle
                    t = [leftTopC, leftBottomC, center];
                } else {
                    // Mouse is on the top triangle
                    t = [leftTopC, rightTopC, center];
                }
            } else if (squareType === "leftBottom") {
                if (slopeSq < 1) {
                    // Mouse is on the left triangle
                    t = [leftTopC, leftBottomC, center];
                } else {
                    // Mouse is on the bottom triangle
                    t = [leftBottomC, rightBottomC, center];
                }
            } else if (squareType === "rightTop") {
                if (slopeSq < 1) {
                    // Mouse is on the right triangle
                    t = [rightTopC, rightBottomC, center];
                } else {
                    // Mouse is on the top triangle
                    t = [leftTopC, rightTopC, center];
                }
            } else if (squareType === "rightBottom") {
                if (slopeSq < 1) {
                    // Mouse is on the right triangle
                    t = [rightTopC, rightBottomC, center];
                } else {
                    // Mouse is on the bottom triangle
                    t = [leftBottomC, rightBottomC, center];
                }
            }

            // Normalize between -1 and 1
            function normalize(coord, width, height) {
                return vec2(2 * coord[0] / width - 1, 2*(height - coord[1])/height -1);
            }
            t = t.map(coord => normalize(coord, canvas.width, canvas.height));

            if(tool == "0"){
                var found = false;
                var iterateIndex = 0;
                while(!found && iterateIndex < triangles.length){
                    if(triangles[iterateIndex][0][0] == t[0][0] && triangles[iterateIndex][0][1] == t[0][1]){
                        if(triangles[iterateIndex][1][0] == t[1][0] && triangles[iterateIndex][1][1] == t[1][1]){
                            if(triangles[iterateIndex][2][0] == t[2][0] && triangles[iterateIndex][2][1] == t[2][1]){
                                found = true;
                            }
                        }
                    }
                    iterateIndex++;
                }
                //Check if colors are different
                if(found){
                    if(colorsSaved[iterateIndex-1][0][0] != colors[cindex][0] || colorsSaved[iterateIndex-1][0][1] != colors[cindex][1] || colorsSaved[iterateIndex-1][0][2] != colors[cindex][2]){
                        found = false;
                    }
                }

                if(!found){
                    triangles.push(t);
                    strokeTriangleNumber += 1;
                    index++;
                }
                
                // Construct buffer subdata
                gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
                gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles.flat()) , gl.STATIC_DRAW);
    
                // Load color
                t = [vec4(colors[cindex]) , vec4(colors[cindex]) , vec4(colors[cindex])];

                if(!found){
                    colorsSaved.push(t);
                }
  
                gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
                gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsSaved.flat()) , gl.STATIC_DRAW);
    
            }else if(tool == "1"){
                var found = false;
                var iterateIndex = 0;
                var delIndex = -1;

                while(!found && iterateIndex < triangles.length){
                    if(triangles[iterateIndex][0][0] == t[0][0] && triangles[iterateIndex][0][1] == t[0][1]){
                        if(triangles[iterateIndex][1][0] == t[1][0] && triangles[iterateIndex][1][1] == t[1][1]){
                            if(triangles[iterateIndex][2][0] == t[2][0] && triangles[iterateIndex][2][1] == t[2][1]){
                                delIndex = iterateIndex;
                                found = true;
                            }
                        }
                    }
                    iterateIndex++;
                }

                if(found){                    
                    triangles.splice(delIndex,1);
                    colorsSaved.splice(delIndex,1);

                    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsSaved.flat()) , gl.STATIC_DRAW);
                    
                    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles.flat()) , gl.STATIC_DRAW);

                    index--;
                }
            }
        }
    });

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 24 * maxNumVertices, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 48 * maxNumVertices, gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    zoomMatrixLoc = gl.getUniformLocation( program, "zoomMatrix" );

    render();
}

function redoAction(){
    if(redoPossible && redo.length > 0){
        strokeStartIndex += redo[redo.length-1].length;
        strokeNumber++;

        var temp = redo.pop();
        strokes.push(temp);
        
        //triangles
        for(let i = 0; i < temp.length; i++){
            triangles.push(temp[i]);
        }

        index += temp.length

        temp = redoColors.pop();
        strokeColors.push(temp);
        
        //colorsSaved
        for(let i = 0; i <temp.length; i++){
            colorsSaved.push(temp[i]);
        }

        gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsSaved.flat()) , gl.STATIC_DRAW);
                    
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles.flat()) , gl.STATIC_DRAW);

        if (redo.length == 0){
            redoPossible = false;
        }
        render();
    }
}

function undoAction(){
    if(strokeNumber > 0){
        strokeStartIndex -= strokes[strokeNumber-1].length;
        strokeNumber--;

        var temp = strokes.pop();
        redo.push(temp);
        
        //triangles delete
        for(let i = 0; i < temp.length; i++){
            triangles.pop();
        }

        index -= temp.length

        temp = strokeColors.pop();
        redoColors.push(temp);
        
        //triangleColorsDelete
        for(let i = 0; i < temp.length; i++){
            colorsSaved.pop();
        }

        redoPossible = true;

        gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsSaved.flat()) , gl.STATIC_DRAW);
                    
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles.flat()) , gl.STATIC_DRAW);

        render();
    }
}

function zoomIn(canvasX , canvasY){
    zoomMatrix[15] = zoomMatrix[15] - 0.02;
    if(zoomMatrix[13] != -canvasY){
        zoomMatrix[13] -= 0.02*canvasY;
    }
    if(zoomMatrix[12] != -canvasX){
        zoomMatrix[12] -= 0.02*canvasX;
    }
    render();
}

function zoomOut(canvasX , canvasY){
    zoomMatrix[15] = zoomMatrix[15] + 0.02;
    if(zoomMatrix[13] != -canvasY){
        zoomMatrix[13] += 0.02*canvasY;
    }
    if(zoomMatrix[12] != -canvasX){
        zoomMatrix[12] += 0.02*canvasX;
    }
    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv( zoomMatrixLoc, false, flatten(zoomMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, index * 3 );
    window.requestAnimationFrame(render);
}