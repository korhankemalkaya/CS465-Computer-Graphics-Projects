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

            // Calculating the side of the square as we want 30x30 square grid
            squareSide = Math.floor(canvas.width / 30);

            // Calculating the index of the square mouse is on
            var x_index = Math.floor(event.clientX /  squareSide);
            var y_index = Math.floor(event.clientY /  squareSide);

            // Calculate the relative position within the square unit
            var x_rel = event.clientX % squareSide;
            var y_rel = event.clientY % squareSide;
  
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
            console.log(event.clientX + "is x location and " +  center_x + " is center x");
            var center = vec2(center_x, center_y);
            
            // Calculate the slope
            slope = (y_rel-15) / (x_rel-15);

            // Coordinates of the vertex points
            var t;
            var leftTopC = vec2( x_index *squareSide, y_index*squareSide);
            var rightTopC = vec2( ( x_index +1 ) * squareSide, y_index *squareSide);
            var leftBottomC = vec2( x_index *squareSide, ( y_index +1 )*squareSide);
            var rightBottomC = vec2( (x_index + 1 )*squareSide, ( y_index +1 )*squareSide);
        
            // Determine which triangle the mouse is on based on slopes
            if (squareType === "leftTop") {
                if (slope > -1) {
                    // Mouse is on the left triangle
                    t = [leftTopC, leftBottomC, center];
                } else {
                    // Mouse is on the top triangle
                    t = [leftTopC, rightTopC, center];
                }
            } else if (squareType === "leftBottom") {
                if (slope < 1) {
                    // Mouse is on the left triangle
                    t = [leftTopC, leftBottomC, center];
                } else {
                    // Mouse is on the bottom triangle
                    t = [leftBottomC, rightBottomC, center];
                }
            } else if (squareType === "rightTop") {
                if (slope < 1) {
                    // Mouse is on the right triangle
                    t = [rightTopC, rightBottomC, center];
                } else {
                    // Mouse is on the top triangle
                    t = [leftTopC, rightTopC, center];
                }
            } else if (squareType === "rightBottom") {
                if (slope > -1) {
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
            console.log(t[0]);
            console.log(t[1]);
            console.log(t[2]);

            // Construct buffer subdata
            gl.bufferSubData(gl.ARRAY_BUFFER, 24 * index, flatten(t));

            //gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            //t = vec4(colors[index % 7]);
            //gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));
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
    gl.bufferData(gl.ARRAY_BUFFER, 24* maxNumVertices, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
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
    gl.drawArrays(gl.TRIANGLES, 0, index*3 );
    window.requestAnimationFrame(render);
}