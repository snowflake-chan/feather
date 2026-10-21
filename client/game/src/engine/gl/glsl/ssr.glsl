// adapted from https://casual-effects.blogspot.com/2014/08/screen-space-ray-tracing.html

// By Morgan McGuire and Michael Mara at Williams College 2014
// Released as open source under the BSD 2-Clause License
// http://opensource.org/licenses/BSD-2-Clause
float distanceSquared(vec2 a, vec2 b) { a -= b; return dot(a, a); }

#define MAX_STEPS 30
#define RAY_LENGTH 100.
#define Z_THICKNESS 1.
#define STEP_MUL 1.
#define STEP_ADD 2.5

float traceScreenSpaceRay(
 vec3 csOrig, 
 vec3 csDir,
 mat4 proj, 
 sampler2D csZBuffer,
 vec2 csZBufferSize,
 float nearPlaneZ, 
 float jitter,
 out vec4 hitSample) {
    float rayLength = RAY_LENGTH;
    if (-(csOrig.z + csDir.z * rayLength) < nearPlaneZ) {
        rayLength = max(0., -(nearPlaneZ + csOrig.z) / csDir.z);
    }
    vec3 csEndPoint = csOrig + csDir * rayLength;

    vec2 zInv = 1. / csZBufferSize;

    vec4 H0 = proj * vec4(csOrig, 1.0);
    vec4 H1 = proj * vec4(csEndPoint, 1.0);
    
    vec2 P0 = 0.5 * csZBufferSize * (H0.xy / H0.w + 1.);
    vec2 P1 = 0.5 * csZBufferSize * (H1.xy / H1.w + 1.);

    vec2 Q0 = vec2(-csOrig.z / H0.w, 1. / H0.w);
    vec2 Q1 = vec2(-csEndPoint.z / H1.w, 1. / H1.w);

    P1 += vec2((distanceSquared(P0, P1) < 0.0001) ? 0.01 : 0.0);
    vec2 delta = P1 - P0;

    bool permute = false;
    if (abs(delta.x) < abs(delta.y)) { 
        permute = true;
        delta = delta.yx;
        P0 = P0.yx;
        P1 = P1.yx; 
        zInv = zInv.yx;
    }

    float stepDir = sign(delta.x);
    float invdx = stepDir / delta.x;

    vec2 dQ = (Q1 - Q0) * invdx;
    vec2 dP = vec2(stepDir, delta.y * invdx);

    P0 += dP * jitter; 
    Q0 += dQ * jitter;
    
    P0 *= zInv;
    P1 *= zInv;
    dP *= zInv;

    float end = P1.x * stepDir;
    float prevZ = csOrig.z;
    float rayZMin = prevZ;
    float rayZMax = prevZ;
    float stepSize = 1.;
    for (int stepCount = 0; stepCount < MAX_STEPS; ++stepCount) {
        vec2 Qt = Q0 + stepSize * dQ;
        vec2 Pt = P0 + stepSize * dP;
        float z = Qt.x / Qt.y;
        rayZMin = min(z, prevZ);
        rayZMax = max(z, prevZ);
        prevZ = z;

        vec2 hitPixel = permute ? Pt.yx : Pt;
        hitSample = texture2D(csZBuffer, hitPixel);
        
        float sceneZ = hitSample.a;
        if (min(rayZMax, sceneZ + Z_THICKNESS) >= max(rayZMin, sceneZ)) {
            vec2 weight = smoothstep(0.4, 0.5, abs(Pt - 0.5));
            return (1. - weight.x) * (1. - weight.y);
        }
        if (Pt.x * stepDir > end) {
            break;
        }

        stepSize = STEP_MUL * stepSize + STEP_ADD;
    }
    return 0.;
}

#pragma glslify: export(traceScreenSpaceRay)