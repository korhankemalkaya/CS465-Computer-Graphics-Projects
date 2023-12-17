var aa = 0.4;
var uValue = 14; //between -14 and 14
var vValue = 1; //between 0 and 2pi
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
    var denom = aa * (Math.pow(w * Math.cosh(aa * u), 2) + Math.pow(aa * Math.sin(w * v), 2));
    //define x
    var x = -u + (2 * (1 - aa * aa) * Math.cosh(aa * u) * Math.sin(aa * u)) / denom;
    //define y
    var y = (2 * w * Math.cosh(aa * u) * (-w * Math.cos(v) * Math.cos(w * v) - Math.sin(v) * Math.sin(w * v))) / denom;
    //define z
    var z = (2 * w * Math.cosh(aa * u) * (-w * Math.sin(v) * Math.cos(w * v) + Math.cos(v) * Math.sin(w * v))) / denom;
     
    //Define normals
    //Compute partial derivatives for normals
    //Compute dxdu
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

   /* x = (isNaN(x)) ? 0 : x;
    y = (isNaN(y)) ? 0 : y;
    z = (isNaN(z)) ? 0 : z;*/


    var points = vec4(x, y, z);
    var normal = vec4(nx, ny, nz);
    return {    point: points, 
                 normal: normal
            };
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



