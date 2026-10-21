precision highp float;

attribute vec4 freqSeed, phaseSeed;

uniform float time, spinSpeed, fallSpeed;
uniform vec2 size, viewport;
uniform vec3 positionRange;
uniform mat4 view, projection;
uniform sampler2D voxelHeight;

varying vec3 worldPos;
varying vec2 spin;

void main() {
    float t = time * 0.2;
    vec4 phase = (2. * 3.14159265) * phaseSeed;
    vec4 freq = 10. * freqSeed;

    // first compute snow position
    vec2 positionXZ = 0.5 * (1. + cos(freq.xz * t * 0.1 + phase.xz));
    float positionY = mod((t * fallSpeed + phase.y ) * -1000.0, positionRange.y);

    // check if snow is within height limit
    float heightLimit = positionRange.y * texture2D(voxelHeight, positionXZ).r;
    if (positionY < heightLimit) {
        worldPos = vec3(0);
        spin = vec2(0);
        gl_Position = vec4(0);
        return;
    }

    // calcualte positio
    vec3 position = vec3(positionRange.x * positionXZ.x, positionY, positionRange.z * positionXZ.y);
    worldPos = position;
    vec4 cameraPosition = view * vec4(position, 1);

    // output spin
    float angle = spinSpeed * (t + phase.w);
    spin = vec2(cos(angle), sin(angle));

    // output position
    gl_Position = projection * cameraPosition;

    // output point size
    gl_PointSize = (size.x + size.y * freqSeed.w) * viewport.y / abs(cameraPosition.z);
}