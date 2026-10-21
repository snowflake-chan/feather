precision highp float;

attribute vec2 tc;

uniform vec3 faceNormal, faceU, faceV;
uniform mat4 projection, view;
uniform vec3 eye;

uniform vec4 ambient[27];

varying vec2 texCoord;
varying vec3 viewDirection;
varying vec4 light00, light01, light10, light11;
varying vec3 fposition;

// this is horrible - mik
vec4 getLight (vec3 p) {
    if (p.x < 0.) {
        if (p.y < 0.) {
            if (p.z < 0.) {
                return ambient[0];
            } else if (p.z > 0.) {
                return ambient[2];
            } else {
                return ambient[1];
            }
        } else if (p.y > 0.) {
            if (p.z < 0.) {
                return ambient[6];
            } else if (p.z > 0.) {
                return ambient[8];
            } else {
                return ambient[7];
            }
        } else {
            if (p.z < 0.) {
                return ambient[3];
            } else if (p.z > 0.) {
                return ambient[5];
            } else {
                return ambient[4];
            }
        }
    } else if (p.x > 0.) {
        if (p.y < 0.) {
            if (p.z < 0.) {
                return ambient[18];
            } else if (p.z > 0.) {
                return ambient[20];
            } else {
                return ambient[19];
            }
        } else if (p.y > 0.) {
            if (p.z < 0.) {
                return ambient[24];
            } else if (p.z > 0.) {
                return ambient[26];
            } else {
                return ambient[25];
            }
        } else {
            if (p.z < 0.) {
                return ambient[21];
            } else if (p.z > 0.) {
                return ambient[23];
            } else {
                return ambient[22];
            }
        }
    } else {
        if (p.y < 0.) {
            if (p.z < 0.) {
                return ambient[9];
            } else if (p.z > 0.) {
                return ambient[11];
            } else {
                return ambient[10];
            }
        } else if (p.y > 0.) {
            if (p.z < 0.) {
                return ambient[15];
            } else if (p.z > 0.) {
                return ambient[17];
            } else {
                return ambient[16];
            }
        } else {
            if (p.z < 0.) {
                return ambient[12];
            } else if (p.z > 0.) {
                return ambient[14];
            } else {
                return ambient[13];
            }
        }
    }
}

void main () {
    vec2 offset = 2. * tc - 1.;
    vec3 position = faceNormal + faceU * offset.x + faceV * offset.y;
    texCoord = tc;
    viewDirection = eye - position;

    light00 = getLight(position - faceU - faceV);
    light01 = getLight(position + faceU - faceV);
    light10 = getLight(position - faceU + faceV);
    light11 = getLight(position + faceU + faceV);

    fposition = position;

    gl_Position = projection * view * vec4(position, 1);
}