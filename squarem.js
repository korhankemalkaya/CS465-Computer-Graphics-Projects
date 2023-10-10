var canvas;
var gl;

 
var redraw = false;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    canvas.addEventListener("mousedown", function(event){
      redraw = true;
    });

    canvas.addEventListener("mouseup", function(event){
      redraw = false;
    });
    //canvas.addEventListener("mousedown", function(){
    canvas.addEventListener("mousemove", function(event){

        if(redraw) {
          gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
          wind_x = 2*event.clientX/canvas.width-1;
          wind_y = 2*(canvas.height-event.clientY)/canvas.height-1;
          
          var x_index = Math.floor(wind_x / (2 / 30));
          var y_index = Math.floor(wind_y / (2 / 30));

          // Calculate the relative position within the square unit
          var x_rel = wind_x % (2 / 30);
          var y_rel = wind_y % (2 / 30);

          left_up = vec2(x_index * 2/30, y_index * 2/30);
          right_up = vec2((x_index+1) * 2/30, y_index * 2/30);
          left_down = vec2(x_index * 2/30, (y_index+1) * 2/30);
          right_down = vec2((x_index+1) * 2/30, (y_index+1) * 2/30);

              // Define the vertices of the four triangles
              let leftTriangle = [left_up, left_down, vertex1]; // Assuming vertex1 is the common vertex for the left triangle
              let upTriangle = [left_up, right_up, vertex2]; // Assuming vertex2 is the common vertex for the up triangle
              let rightTriangle = [right_up, right_down, vertex3]; // Assuming vertex3 is the common vertex for the right triangle
              let lowerTriangle = [left_down, right_down, vertex4]; // Assuming vertex4 is the common vertex for the lower triangle

              // Check which triangle the point is in based on wind_x and wind_y
              if (wind_x <= 0 && wind_y >= 0) {
                // Point is in the left triangle
                // Access the vertices of the left triangle as leftTriangle[0], leftTriangle[1], leftTriangle[2]
              } else if (wind_x >= 0 && wind_y >= 0) {
                // Point is in the up triangle
                // Access the vertices of the up triangle as upTriangle[0], upTriangle[1], upTriangle[2]
              } else if (wind_x >= 0 && wind_y <= 0) {
                // Point is in the right triangle
                // Access the vertices of the right triangle as rightTriangle[0], rightTriangle[1], rightTriangle[2]
              } else {
                // Point is in the lower triangle
                // Access the vertices of the lower triangle as lowerTriangle[0], lowerTriangle[1], lowerTriangle[2]
              }


          dist_left_up = distance(vec2(wind_x, windy), left_up);
          dist_right_up = distance(vec2(wind_x, windy), right_up);
          dist_left_down = distance(vec2(wind_x, windy), left_down);
          dist_right_down= distance(vec2(wind_x, windy), right_down);

          min_dist
          if ( x_rel <= 1/30 ) {

          }
          else if (x_rel > 1/30) {

          }
          else if ( y_rel<= 1/30 ) {

          }
          else if ( x_rel > 1/30 ) {

          }

          gl.bufferSubData(gl.ARRAY_BUFFER, 12*index, flatten(t));

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        t = vec4(colors[(index)%7]);
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(t));
        index++;
      }

    } );


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, 12*maxNumVertices, gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    render();

}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE, 0, index );

    window.requestAnimFrame(render);

}
