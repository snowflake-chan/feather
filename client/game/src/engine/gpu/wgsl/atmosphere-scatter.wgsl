//6:00 = 0 = 1
const GROUND_6 = vec3f(0.2510, 0.2549, 0.2588);
const GROUND1_6 = vec3f(0.2784, 0.2745, 0.2667);
const GROUND2_6 = vec3f(0.4824, 0.4392, 0.3176);

const LEVEL_GROUND_6 = vec3f(0.7529, 0.6667, 0.3922);
const LEVEL_6 = vec3f(1.0, 0.8784, 0.4941);
const LEVEL_SKY_6 = vec3f(0.9529, 0.7961, 0.5961);

const SKY1_6 = vec3f(0.6314, 0.7451, 0.8157);
const SKY2_6 = vec3f(0.5020, 0.6588, 0.8549);
const SKY_6 = vec3f(0.4157, 0.6471, 0.9020);

//12:00 = 0.25
const GROUND_12 = vec3f(0.2706, 0.2314, 0.2902);
const GROUND1_12 = vec3f(0.3059, 0.2902, 0.3137);
const GROUND2_12 = vec3f(0.3843, 0.4039, 0.3804);

const LEVEL_GROUND_12 = vec3f(0.6627, 0.6863, 0.5725);
const LEVEL_12 = vec3f(0.9333, 1.0, 0.8118);
const LEVEL_SKY_12 = vec3f(0.9098, 1.0, 0.8275);

const SKY1_12 = vec3f(0.6510, 0.9647, 0.9373);
const SKY2_12 = vec3f(0.2980, 0.8353, 0.9804);
const SKY_12 = vec3f(0.1216, 0.6078, 0.8196);

//18:00 = 0.5
const GROUND_18 = vec3f(0.2471, 0.2510, 0.2588);
const GROUND1_18 = vec3f(0.2824, 0.2824, 0.2667);
const GROUND2_18 = vec3f(0.5216, 0.4706, 0.3176);

const LEVEL_GROUND_18 = vec3f(0.7490, 0.6745, 0.3804);
const LEVEL_18 = vec3f(0.9882, 0.9059, 0.4745);
const LEVEL_SKY_18 = vec3f(0.9882, 0.8745, 0.4196);

const SKY1_18 = vec3f(0.9843, 0.8275, 0.3490);
const SKY2_18 = vec3f(0.5961, 0.7765, 0.7961);
const SKY_18 = vec3f(0.3020, 0.4627, 0.7608);

//21:00 = 0.625
const GROUND_21 = vec3f(0.0667, 0.2549, 0.4039);
const GROUND1_21 = vec3f(0.0549, 0.3098, 0.4824);
const GROUND2_21 = vec3f(0.0549, 0.4667, 0.6627);

const LEVEL_GROUND_21 = vec3f(0.0588, 0.5686, 0.7725);
const LEVEL_21 = vec3f(0.1059, 0.8078, 1.0);
const LEVEL_SKY_21 = vec3f(0.1412, 0.7608, 0.9922);

const SKY1_21 = vec3f(0.2902, 0.6157, 0.8941);
const SKY2_21 = vec3f(0.2902, 0.4392, 0.7373);
const SKY_21 = vec3f(0.2118, 0.3216, 0.5569);

struct SkyColor {
    ground : vec3f,
    ground1 : vec3f,
    ground2 : vec3f,
    levelGround : vec3f,
    level : vec3f,
    levelSky : vec3f,
    sky1 : vec3f,
    sky2 : vec3f,
    sky : vec3f,
};


struct SkyColorStep {
    smoothStep1 : f32,
    smoothStep2 : f32,
    smoothStep3 : f32,
    smoothStep4 : f32,
    smoothStep5 : f32,
    smoothStep6 : f32,
    smoothStep7 : f32,
    smoothStep8 : f32,
    step1 : f32,
    step2 : f32,
    step3 : f32,
    step4 : f32,
    step5 : f32,
    step6 : f32,
    step7 : f32,
    step8 : f32,
};

fn getStep(r : vec3f) -> SkyColorStep {
    var res : SkyColorStep;
    res.smoothStep1 = smoothstep(-1.0, -0.2, r.y);
    res.smoothStep2 = smoothstep(-0.2, -0.08, r.y);
    res.smoothStep3 = smoothstep(-0.08, -0.02, r.y);
    res.smoothStep4 = smoothstep(-0.02, 0.0, r.y);
    res.smoothStep5 = smoothstep(0.0, 0.02, r.y);
    res.smoothStep6 = smoothstep(0.02, 0.08, r.y);
    res.smoothStep7 = smoothstep(0.08, 0.2, r.y);
    res.smoothStep8 = smoothstep(0.2, 1.0, r.y);

    res.step1 = 1. - step(-0.2, r.y);
    res.step2 = step(-0.2, r.y) * (1. - step(-0.08, r.y));
    res.step3 = step(-0.08, r.y) * (1. - step(-0.02, r.y));
    res.step4 = step(-0.02, r.y) * (1. - step(0.0, r.y));
    res.step5 = step(0.0, r.y) * (1. - step(0.02, r.y));
    res.step6 = step(0.02, r.y) * (1. - step(0.08, r.y));
    res.step7 = step(0.08, r.y) * (1. - step(0.2, r.y));
    res.step8 = step(0.2, r.y);
    return res;
}

fn getColor(skyColor : SkyColor, skyColorStep : SkyColorStep) -> vec3f
{
    var color = lerp(skyColor.ground, skyColor.ground1, skyColorStep.smoothStep1) * skyColorStep.step1;
    color += lerp(skyColor.ground1, skyColor.ground2, skyColorStep.smoothStep2) * skyColorStep.step2;

    color += lerp(skyColor.ground2, skyColor.levelGround, skyColorStep.smoothStep3) * skyColorStep.step3;
    color += lerp(skyColor.levelGround, skyColor.level, skyColorStep.smoothStep4) * skyColorStep.step4;
    color += lerp(skyColor.level, skyColor.levelSky, skyColorStep.smoothStep5) * skyColorStep.step5;
    color += lerp(skyColor.levelSky, skyColor.sky1, skyColorStep.smoothStep6) * skyColorStep.step6;

    color += lerp(skyColor.sky1, skyColor.sky2, skyColorStep.smoothStep7) * skyColorStep.step7;
    color += lerp(skyColor.sky2, skyColor.sky, skyColorStep.smoothStep8) * skyColorStep.step8;
    return color;
}

fn getScatterColor(r : vec3f, timeOfDay : f32) -> vec3f
{
    var skyColorStep = getStep(r);

    var skyColor6 : SkyColor;
    skyColor6.ground = GROUND_6;
    skyColor6.ground1 = GROUND1_6;
    skyColor6.ground2 = GROUND2_6;
    skyColor6.levelGround = LEVEL_GROUND_6;
    skyColor6.level = LEVEL_6;
    skyColor6.levelSky = LEVEL_SKY_6;
    skyColor6.sky1 = SKY1_6;
    skyColor6.sky2 = SKY2_6;
    skyColor6.sky = SKY_6;
    var color6 = getColor(skyColor6, skyColorStep);

    var skyColor12 : SkyColor;
    skyColor12.ground = GROUND_12;
    skyColor12.ground1 = GROUND1_12;
    skyColor12.ground2 = GROUND2_12;
    skyColor12.levelGround = LEVEL_GROUND_12;
    skyColor12.level = LEVEL_12;
    skyColor12.levelSky = LEVEL_SKY_12;
    skyColor12.sky1 = SKY1_12;
    skyColor12.sky2 = SKY2_12;
    skyColor12.sky = SKY_12;
    var color12 = getColor(skyColor12, skyColorStep);

    var skyColor18 : SkyColor;
    skyColor18.ground = GROUND_18;
    skyColor18.ground1 = GROUND1_18;
    skyColor18.ground2 = GROUND2_18;
    skyColor18.levelGround = LEVEL_GROUND_18;
    skyColor18.level = LEVEL_18;
    skyColor18.levelSky = LEVEL_SKY_18;
    skyColor18.sky1 = SKY1_18;
    skyColor18.sky2 = SKY2_18;
    skyColor18.sky = SKY_18;
    var color18 = getColor(skyColor18, skyColorStep);

    var skyColor21 : SkyColor;
    skyColor21.ground = GROUND_21;
    skyColor21.ground1 = GROUND1_21;
    skyColor21.ground2 = GROUND2_21;
    skyColor21.levelGround = LEVEL_GROUND_21;
    skyColor21.level = LEVEL_21;
    skyColor21.levelSky = LEVEL_SKY_21;
    skyColor21.sky1 = SKY1_21;
    skyColor21.sky2 = SKY2_21;
    skyColor21.sky = SKY_21;
    var color21 = getColor(skyColor21, skyColorStep);

    var color = lerp(color6, color12, smoothstep(0.0, 0.25, timeOfDay)) * (1. - step(0.25, timeOfDay));
    color += lerp(color12, color18, smoothstep(0.25, 0.5, timeOfDay)) * step(0.25, timeOfDay) * (1. - step(0.5, timeOfDay));
    color += lerp(color18, color21, smoothstep(0.5, 0.625, timeOfDay)) * step(0.5, timeOfDay) * (1. - step(0.625, timeOfDay));
    color += lerp(color21, color6, smoothstep(0.625, 1.0, timeOfDay)) * step(0.625, timeOfDay);

    return color;
}
