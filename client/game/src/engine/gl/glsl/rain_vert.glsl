precision mediump float;

attribute vec4 position;

uniform mat4 viewProj;
uniform float time, interference;
uniform vec3 positionRange, velocity;
uniform vec2 rainLength;
uniform sampler2D voxelHeight;

varying vec3 worldPos;

void main(void) {
    vec3 trajectory = velocity + cos(position.xyz) * interference;

    float dropLen = 10. * step(position.w, 0.) * (rainLength.x + mod(position.w, rainLength.y));
    vec3 posStart = mod(position.xyz - time * trajectory, positionRange);
    worldPos = posStart + dropLen * normalize(trajectory);

    // apply height limit
    float height = texture2D(voxelHeight, posStart.xz / positionRange.xz).r * positionRange.y;
    if (posStart.y < height) {
        gl_Position = vec4(0.);
    } else {
        gl_Position = viewProj * vec4(worldPos, 1.);
    }
}
