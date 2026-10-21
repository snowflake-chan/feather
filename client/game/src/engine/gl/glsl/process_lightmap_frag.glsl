#define SKY 1
#define HDR 1
#define FLOAT_MAX  1.70141184e38
#define FLOAT_MIN  1.17549435e-38

precision highp float;

varying vec2 uv;

uniform lowp sampler2D nightSampler;
uniform vec3 faceNormal, faceU, faceV;
uniform float timeOfDay, RGB;

#pragma glslify: getAtmosphereBruteForce = require('./atmosphere_scatter_brute_force.glsl')
#pragma glslify: ambientSky = require('./ambient_sky.glsl')

lowp vec4 encode_float(highp float v) {
    highp float av = abs(v);

    //Handle special cases
    if(av < FLOAT_MIN) {
    return vec4(0.0, 0.0, 0.0, 0.0);
    } else if(v > FLOAT_MAX) {
    return vec4(127.0, 128.0, 0.0, 0.0) / 255.0;
    } else if(v < -FLOAT_MAX) {
    return vec4(255.0, 128.0, 0.0, 0.0) / 255.0;
    }

    highp vec4 c = vec4(0,0,0,0);

    //Compute exponent and mantissa
    highp float e = floor(log2(av));
    highp float m = av * pow(2.0, -e) - 1.0;

    //Unpack mantissa
    c[1] = floor(128.0 * m);
    m -= c[1] / 128.0;
    c[2] = floor(32768.0 * m);
    m -= c[2] / 32768.0;
    c[3] = floor(8388608.0 * m);

    //Unpack exponent
    highp float ebias = e + 127.0;
    c[0] = floor(ebias / 2.0);
    ebias -= c[0] * 2.0;
    c[1] += floor(ebias) * 128.0;

    //Unpack sign bit
    c[0] += 128.0 * step(0.0, -v);

    //Scale back to range
    return c / 255.0;
}

void main() {
    float theta = 2. * PI * uv.x;
    float phi = 0.5 * PI * uv.y;
    vec3 position = normalize(faceNormal * cos(phi) + (faceU * cos(theta) + faceV * sin(theta)) * sin(phi));

    float angle = timeOfDay * 2.0 * 3.1415926535;
    vec3 sunDirection = normalize(vec3(cos(angle), sin(angle), 0));

    vec3 scatteringColor = getAtmosphereBruteForce(position, sunDirection);
    vec3 c = ambientSky(position, sunDirection, scatteringColor, timeOfDay, 0.0, nightSampler).rgb;

    vec3 RGBvec;
    float RGBf = floor(RGB);
    if(RGBf == 0.0) {
        RGBvec = vec3(1,0,0);
    }
    else if(RGBf == 1.0) {
        RGBvec = vec3(0,1,0);
    }
    else if(RGBf == 2.0) {
        RGBvec = vec3(0,0,1);
    }
    float channel = dot(c, RGBvec);
    gl_FragColor = encode_float(channel).abgr;
}