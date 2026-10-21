#define PI 3.1415926535

// 6:00 = 0 = 1
#define GROUND_6        vec3(0.2510, 0.2549, 0.2588)
#define GROUND1_6       vec3(0.2784, 0.2745, 0.2667)
#define GROUND2_6       vec3(0.4824, 0.4392, 0.3176)

#define LEVEL_GROUND_6  vec3(0.7529, 0.6667, 0.3922)
#define LEVEL_6         vec3(1.0, 0.8784, 0.4941)
#define LEVEL_SKY_6     vec3(0.9529, 0.7961, 0.5961)

#define SKY1_6          vec3(0.6314, 0.7451, 0.8157)
#define SKY2_6          vec3(0.5020, 0.6588, 0.8549)
#define SKY_6           vec3(0.4157, 0.6471, 0.9020)

// 12:00 = 0.25
#define GROUND_12        vec3(0.2706, 0.2314, 0.2902)
#define GROUND1_12       vec3(0.3059, 0.2902, 0.3137)
#define GROUND2_12       vec3(0.3843, 0.4039, 0.3804)

#define LEVEL_GROUND_12  vec3(0.6627, 0.6863, 0.5725)
#define LEVEL_12         vec3(0.9333, 1.0, 0.8118)
#define LEVEL_SKY_12     vec3(0.9098, 1.0, 0.8275)

#define SKY1_12          vec3(0.6510, 0.9647, 0.9373)
#define SKY2_12          vec3(0.2980, 0.8353, 0.9804)
#define SKY_12           vec3(0.1216, 0.6078, 0.8196)

// 18:00 = 0.5
#define GROUND_18        vec3(0.2471, 0.2510, 0.2588)
#define GROUND1_18       vec3(0.2824, 0.2824, 0.2667)
#define GROUND2_18       vec3(0.5216, 0.4706, 0.3176)

#define LEVEL_GROUND_18  vec3(0.7490, 0.6745, 0.3804)
#define LEVEL_18         vec3(0.9882, 0.9059, 0.4745)
#define LEVEL_SKY_18     vec3(0.9882, 0.8745, 0.4196)

#define SKY1_18          vec3(0.9843, 0.8275, 0.3490)
#define SKY2_18          vec3(0.5961, 0.7765, 0.7961)
#define SKY_18           vec3(0.3020, 0.4627, 0.7608)

// 21:00 = 0.625
#define GROUND_21        vec3(0.0667, 0.2549, 0.4039)
#define GROUND1_21       vec3(0.0549, 0.3098, 0.4824)
#define GROUND2_21       vec3(0.0549, 0.4667, 0.6627)

#define LEVEL_GROUND_21  vec3(0.0588, 0.5686, 0.7725)
#define LEVEL_21         vec3(0.1059, 0.8078, 1.0)
#define LEVEL_SKY_21     vec3(0.1412, 0.7608, 0.9922)

#define SKY1_21          vec3(0.2902, 0.6157, 0.8941)
#define SKY2_21          vec3(0.2902, 0.4392, 0.7373)
#define SKY_21           vec3(0.2118, 0.3216, 0.5569)

struct SkyColor {
    vec3 ground, ground1, ground2, levelGround, level, levelSky, sky1, sky2, sky;
};

struct SkyColorStep {
    float smoothStep1, smoothStep2, smoothStep3, smoothStep4, smoothStep5, smoothStep6, smoothStep7, smoothStep8;
    float step1, step2, step3, step4, step5, step6, step7, step8;
};

mediump vec3 lerp(vec3 x, vec3 y, float t) {
    return (1.0 - t) * x + t * y;
}

SkyColorStep getStep(const highp vec3 r) {
    return SkyColorStep(
        smoothstep(-1.0, -0.2, r.y),
        smoothstep(-0.2, -0.08, r.y),
        smoothstep(-0.08, -0.02, r.y),
        smoothstep(-0.02, 0.0, r.y),
        smoothstep(0.0, 0.02, r.y),
        smoothstep(0.02, 0.08, r.y),
        smoothstep(0.08, 0.2, r.y),
        smoothstep(0.2, 1.0, r.y),

        1. - step(-0.2, r.y),
        step(-0.2, r.y) * (1. - step(-0.08, r.y)),
        step(-0.08, r.y) * (1. - step(-0.02, r.y)),
        step(-0.02, r.y) * (1. - step(0.0, r.y)),
        step(0.0, r.y) * (1. - step(0.02, r.y)),
        step(0.02, r.y) * (1. - step(0.08, r.y)),
        step(0.08, r.y) * (1. - step(0.2, r.y)),
        step(0.2, r.y));
}

mediump vec3 getColor(SkyColor skyColor, SkyColorStep skyColorStep) {
    vec3 color = lerp(skyColor.ground, skyColor.ground1, skyColorStep.smoothStep1) * skyColorStep.step1;
    color += lerp(skyColor.ground1, skyColor.ground2, skyColorStep.smoothStep2) * skyColorStep.step2;

    color += lerp(skyColor.ground2, skyColor.levelGround, skyColorStep.smoothStep3) * skyColorStep.step3;
    color += lerp(skyColor.levelGround, skyColor.level, skyColorStep.smoothStep4) * skyColorStep.step4;
    color += lerp(skyColor.level, skyColor.levelSky, skyColorStep.smoothStep5) * skyColorStep.step5;
    color += lerp(skyColor.levelSky, skyColor.sky1, skyColorStep.smoothStep6) * skyColorStep.step6;

    color += lerp(skyColor.sky1, skyColor.sky2, skyColorStep.smoothStep7) * skyColorStep.step7;
    color += lerp(skyColor.sky2, skyColor.sky, skyColorStep.smoothStep8) * skyColorStep.step8;
    return color;
}

mediump vec3 getScatterColor(const highp vec3 r, const highp float timeOfDay) {

    SkyColorStep skyColorStep = getStep(r);

    vec3 color6 = getColor(
        SkyColor(
            GROUND_6,
            GROUND1_6,
            GROUND2_6,
            LEVEL_GROUND_6,
            LEVEL_6,
            LEVEL_SKY_6,
            SKY1_6,
            SKY2_6,
            SKY_6),
        skyColorStep);
    vec3 color12 = getColor(
        SkyColor(
            GROUND_12,
            GROUND1_12,
            GROUND2_12,
            LEVEL_GROUND_12,
            LEVEL_12,
            LEVEL_SKY_12,
            SKY1_12,
            SKY2_12,
            SKY_12),
        skyColorStep);
    vec3 color18 = getColor(
        SkyColor(
            GROUND_18,
            GROUND1_18,
            GROUND2_18,
            LEVEL_GROUND_18,
            LEVEL_18,
            LEVEL_SKY_18,
            SKY1_18,
            SKY2_18,
            SKY_18),
        skyColorStep);
    vec3 color21 = getColor(
        SkyColor(
            GROUND_21,
            GROUND1_21,
            GROUND2_21,
            LEVEL_GROUND_21,
            LEVEL_21,
            LEVEL_SKY_21,
            SKY1_21,
            SKY2_21,
            SKY_21),
        skyColorStep);
    vec3 color = lerp(color6, color12, smoothstep(0.0, 0.25, timeOfDay)) * (1. - step(0.25, timeOfDay));
    color += lerp(color12, color18, smoothstep(0.25, 0.5, timeOfDay)) * step(0.25, timeOfDay) * (1. - step(0.5, timeOfDay));
    color += lerp(color18, color21, smoothstep(0.5, 0.625, timeOfDay)) * step(0.5, timeOfDay) * (1. - step(0.625, timeOfDay));
    color += lerp(color21, color6, smoothstep(0.625, 1.0, timeOfDay)) * step(0.625, timeOfDay);

    return color;
}

#pragma glslify:export(getScatterColor)