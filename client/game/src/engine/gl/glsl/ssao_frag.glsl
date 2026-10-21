precision highp float;

uniform vec2 shape;
uniform sampler2D depthStencil;

#define DL 2.399963229728653
#define EULER 2.718281828459045

const int samples = 8;
const bool useNoise = false;
const float noiseAmount = 0.0003;
const float radius = 7.6306692;
const float diffArea = 0.0391316;
const float gDisplace = 0.0397193;
const float aoClamp = 0.8251521;
const float zNear = 1.;
const float zFar = 100.;


vec2 rand( const vec2 coord ) {
    vec2 noise;
    if ( useNoise ) {
        float nx = dot ( coord, vec2( 12.9898, 78.233 ) );
        float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );
        noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );
    } else {
        float ff = fract( 1.0 - coord.s * ( shape.x / 2.0 ) );
        float gg = fract( coord.t * ( shape.y / 2.0 ) );
        noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;
    }
    return ( noise * 2.0  - 1.0 ) * noiseAmount;
}

float readDepth(vec2 coord) {
    float cameraFarPlusNear = zFar + zNear;
    float cameraFarMinusNear = zFar - zNear;
    float cameraCoef = 2.0 * zNear;
    return cameraCoef / ( cameraFarPlusNear - texture2D(depthStencil, coord).r * cameraFarMinusNear );
}

float compareDepths( const in float depth1, const in float depth2, inout int far ) {
    float garea = 2.0;
    float diff = ( depth1 - depth2 ) * 100.0;
    if ( diff < gDisplace ) {
        garea = diffArea;
    } else {
        far = 1;
    }
    float dd = diff - gDisplace;
    float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );
    return gauss;
}
float calcAO( vec2 vUv, float depth, float dw, float dh) {
    float dd = radius - depth * radius;
    vec2 vv = vec2( dw, dh );
    vec2 coord1 = vUv + dd * vv;
    vec2 coord2 = vUv - dd * vv;
    float temp1 = 0.0;
    float temp2 = 0.0;
    int far = 0;
    temp1 = compareDepths( depth, readDepth( coord1 ), far );
    if ( far > 0 ) {
        temp2 = compareDepths( readDepth( coord2 ), depth, far );
        temp1 += ( 1.0 - temp1 ) * temp2;
    }
    return temp1;
}
void main() {
    vec2 vUv = (gl_FragCoord.xy) / shape;
    vec2 noise = rand( vUv );
    float depth = readDepth( vUv );

    float tt = clamp( depth, aoClamp, 1.0 );
    float aspect = shape.y / shape.x;
    float w = 0.0015 * aspect / tt + ( noise.x * ( 1.0 - noise.x ) );
    float h = 0.0015 / tt + ( noise.y * ( 1.0 - noise.y ) );
    float ao = 0.0;
    float dz = 1.0 / float( samples );
    float z = 1.0 - dz / 2.0;
    float l = 0.0;
    for ( int i = 0; i <= samples; i ++ ) {
        float r = sqrt( 1.0 - z );
        float pw = cos( l ) * r;
        float ph = sin( l ) * r;
        ao += calcAO( vUv, depth, pw * w, ph * h );
        z = z - dz;
        l = l + DL;
    }
    ao = 1.0 - (ao / float( samples ) - 0.4253319);
    gl_FragColor = vec4( vec3(ao), 1. );
}
