var canvas;
var gl;
var redraw = false;
var colors = [
    vec4(0.0, 0.0, 0.0, 1.0),   // black
    vec4(1.0, 0.0, 0.0, 1.0),   // red
    vec4(1.0, 1.0, 0.0, 1.0),   // yellow
    vec4(0.0, 1.0, 0.0, 1.0),   // green
    vec4(0.0, 0.0, 1.0, 1.0),   // blue
    vec4(1.0, 0.0, 1.0, 1.0),   // magenta
    vec4(0.0, 1.0, 1.0, 1.0)    // cyan
];

// Define the maximum number of vertices
var maxNumVertices = 3600; // 3600 triangles

// Initialize the index variable
var index = 0;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    canvas.addEventListener("mousedown", function(event) {
        redraw = true;
    });

    canvas.addEventListener("mouseup", function(event) {
        redraw = false;
    });

    canvas.addEventListener("mousemove", function(event) {
        if (redraw) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            var wind_x = 2 * event.clientX / canvas.width - 1;
            var wind_y = 2 * (canvas.height - event.clientY) / canvas.height - 1;

            //index eklendi
            //------------------------------------------------------------------------------------------------------------
            var x_index = Math.floor(wind_x / (2 / 30));
            var y_index = Math.floor(wind_y / (2 / 30));

            // Calculate the relative position within the square unit
            var x_rel = wind_x % (2 / 30);
            var y_rel = wind_y % (2 / 30);

            // Determine the square based on relative position
            var squareType = "";

            if (x_rel < 1 / 30 && y_rel < 1 / 30) {
                squareType = "leftTop";
            } else if (x_rel < 1 / 30 && y_rel >= 1 / 30) {
                squareType = "leftBottom";
            } else if (x_rel >= 1 / 30 && y_rel < 1 / 30) {
                squareType = "rightTop";
            } else {
                squareType = "rightBottom";
            }

            // Calculate slopes
            //x_index y_index olarak degisti
            //--------------------------------------------------------------------------------------------------------------
            var center_x = ((x_index * (2 / 30)) + 1/30);
            var center_y = ((y_index * (2 / 30)) + 1/30);

            var slope = (wind_y - center_y) / (wind_x - center_x);

            //vertexler degisti
            //---------------------------------------------------------------------------------------------------------------
            var vertexCenter = vec2(center_x , center_y);
            var vertexTopRight = vec2((x_index + 1) * 2 / 30, y_index * 2 / 30);
            var vertexTopLeft = vec2(x_index * 2 / 30, y_index * 2 / 30);
            var vertexBottomRight = vec2((x_index + 1) * 2 / 30, (y_index + 1) * 2 / 30);
            var vertexBottomLeft = vec2(x_index * 2 / 30, (y_index + 1) * 2 / 30);

            // Determine which triangle the mouse is on based on slopes
            var t;

            if (squareType === "leftTop") {
                if (slope > -1) {
                    // Mouse is on the left triangle
                    t = [vertexTopLeft, vertexCenter, vertexBottomLeft];
                } else {
                    // Mouse is on the top triangle
                    t = [vertexTopLeft, vertexCenter, vertexTopRight];
                }
            } else if (squareType === "leftBottom") {
                if (slope < 1) {
                    // Mouse is on the left triangle
                    t = [vertexTopLeft, vertexCenter, vertexBottomLeft];
                } else {
                    // Mouse is on the bottom triangle
                    t = [vertexBottomLeft, vertexCenter, vertexBottomRight];
                }
            } else if (squareType === "rightTop") {
                if (slope < 1) {
                    // Mouse is on the right triangle
                    t = [vertexTopRight, vertexCenter, vertexBottomRight];
                } else {
                    // Mouse is on the top triangle
                    t = [vertexTopLeft, vertexCenter, vertexTopRight];
                }
            } else if (squareType === "rightBottom") {
                if (slope > -1) {
                    // Mouse is on the right triangle
                    t = [vertexTopRight, vertexCenter, vertexBottomRight];
                } else {
                    // Mouse is on the bottom triangle
                    t = [vertexBottomLeft, vertexCenter, vertexBottomRight];
                }
            }

            gl.bufferSubData(gl.ARRAY_BUFFER, 12 * index, flatten(t));

            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            t = vec4(colors[index % 7]);
            gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));
            index++;
        }
    });

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 12 * maxNumVertices, gl.STATIC_DRAW);

    //vPosition, 2 ////vPosition, 3///
    //--------------------------------------------------------------------------------------------------------------------------------- 
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    //index*3 //// index ///
    //--------------------------------------------------------------------------------------------------------------------------------
    gl.drawArrays(gl.TRIANGLES, 0, index); // Multiply by 3 for the number of vertices
    window.requestAnimationFrame(render);
}