var aa = 0.4;
var uMin = -14;
var uMax = 14;
var vMin = 0;
var vMax = 2 * Math.PI;
var uPrecision = 0.1;
var vPrecision = 0.1;
//Parametric formular for breather surface
//Parametrization of the Breather Surfaces as follows:
//Parameter of the family is aa E [0,1]
//If w:= sqrt(1-aa^2) is rational, then the surfaces are periodic
//denom := aa * ((wcosh(aa*u))^2 + (aasin(w*v))^2)
//x := -u + (2(1-aa^2) * cosh(aa*u) * sin(aa*u)) / denom
//y := (2*w * cosh(aa*u) * ( -wcos(v)cos(wv)-sin(v)sin(wv)) / denom
//z := (2*w * cosh(aa*u) * ( -wsin(v)cos(wv)+cos(v)sin(wv) ) / denom

//Looping over the u and v variables, we can generate points on the surface to construct the triangles that will form the surface geometry. 
//We can generate higher or lower detail shapes by increasing or decreasing the precision of the u and v variables. 
//For example, in your loop, incrementing the u variable by 1 or 0.01 will generate surfaces of different quality. 
//The variable aa determines the shape of the resulting surface. 
//Your program should enable the user to set the range and precision of the u and v variables and the value of the aa variable to regenerate the surface geometry.

function breather_formula(aa, u, v)
{
    var w = Math.sqrt(1 - aa * aa);
    var denom = aa * (Math.pow(w * Math.cosh(aa * u), 2) + Math.pow(w * Math.sin(w * v), 2));
    //define x
    var x = -u + (2 * (1 - aa * aa) * Math.cosh(aa * u) * Math.sin(aa * u)) / denom;
    //define y
    var y = (2 * w * Math.cosh(aa * u) * (-w * Math.cos(v) * Math.cos(w * v) - Math.sin(v) * Math.sin(w * v))) / denom;
    //define z
    var z = (2 * w * Math.cosh(aa * u) * (-w * Math.sin(v) * Math.cos(w * v) + Math.cos(v) * Math.sin(w * v))) / denom;
    /* 
    //Define normals
    //Compute partial derivatives for normals
    //Compute dxdu
    var dxdu = 
    var dydu = 
    var dzdu =
    var dxdv = /* partial derivative of x with respect to v 
    var dydv = /* partial derivative of y with respect to v 
    var dzdv = /* partial derivative of z with respect to v 

    // Compute normal using cross product
    var nx = dydu * dzdv - dzdu * dydv;
    var ny = dzdu * dxdv - dxdu * dzdv;
    var nz = dxdu * dydv - dydu * dxdv;*/

    x = (isNaN(x)) ? 0 : x;
    y = (isNaN(y)) ? 0 : y;
    z = (isNaN(z)) ? 0 : z;


    var points = vec4(x, y, z);
    // var normal = vec4(nx, ny, nz);
    return {    point: points, 
                // normal: normal
            };

}
    


/**
    Generates Vertices according to Breather Surface
*/  
function generate_vertices() {
    var vertices = [];
    //var normals = [];
    //var texCoords = [];

    var uSteps = Math.floor((uMax - uMin) / uPrecision);
    var vSteps = Math.floor((vMax - vMin) / vPrecision);

    for (var i = 0; i < uSteps; i++) {
        for (var j = 0; j < vSteps; j++) {
            // Four vertices of the current quad
            var u0 = uMin + i * uPrecision;
            var v0 = vMin + j * vPrecision;
            var u1 = uMin + (i + 1) * uPrecision;
            var v1 = vMin + (j + 1) * vPrecision;

            // Retrieve the points and normals for each vertex of the quad
            var p00 = breather_formula(aa, u0, v0);
            var p10 = breather_formula(aa, u1, v0);
            var p01 = breather_formula(aa, u0, v1);
            var p11 = breather_formula(aa, u1, v1);

            // Triangle 1
            vertices.push(...p00.point);
            //normals.push(...p00.normal);
            //texCoords.push(u0, v0);

            vertices.push(...p10.point);
            //normals.push(...p10.normal);
            //texCoords.push(u1, v0);

            vertices.push(...p01.point);
            //normals.push(...p01.normal);
            //texCoords.push(u0, v1);

            // Triangle 2
            vertices.push(...p10.point);
            //normals.push(...p10.normal);
            //texCoords.push(u1, v0);

            vertices.push(...p11.point);
            //normals.push(...p11.normal);
            //texCoords.push(u1, v1);

            vertices.push(...p01.point);
            //normals.push(...p01.normal);
            //texCoords.push(u0, v1);
        }
    }
}



