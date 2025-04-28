const fragmentShader = `
precision highp float;
varying vec2 vUV;

uniform vec3 uCameraPos;
uniform vec3 uCameraDir;
uniform vec3 uCameraUp;
uniform vec3 uCameraRight;

uniform vec3 uLightPos;
uniform float uLightAmbi;
uniform float uLightDiff;
uniform float uLightSpec;

uniform int uSphereCount;
uniform vec3 uSpherePos[10];
uniform float uSphereRad[10];
uniform vec3 uSphereColor[10];
uniform float uSphereAmbi[10];
uniform float uSphereDiff[10];
uniform float uSphereSpec[10];
uniform float uSphereShin[10];
uniform float uSphereRefl[10];

uniform int uCubeCount;
uniform vec3 uCubePos[10];
uniform float uCubeSize[10];
uniform vec3 uCubeColor[10];
uniform float uCubeAmbi[10];
uniform float uCubeDiff[10];
uniform float uCubeSpec[10];
uniform float uCubeShin[10];
uniform float uCubeRefl[10];
uniform mat3 uCubeRotM[10];
uniform mat3 uCubeIRotM[10];

const float EPSILON = 0.0001;
const float INFINITY = 1000000.0;
const int MAX_REFLECTIONS = 10;

float intersectSphere(vec3 origin, vec3 dir, vec3 pos, float rad) {
    vec3 oc = origin - pos;
    float a = dot(dir, dir);
    float b = 2.0 * dot(dir, oc);
    float c = dot(oc, oc) - rad * rad;
    float discriminant = b * b - 4.0 * a * c;
    
    if (discriminant > 0.0) {
        float t1 = (-b - sqrt(discriminant)) / (2.0 * a);
        float t2 = (-b + sqrt(discriminant)) / (2.0 * a);
        if (t1 > 0.0 && t2 > 0.0) return min(t1, t2);
    }
    return INFINITY;
}

float intersectCube(vec3 origin, vec3 dir, vec3 pos, float size, mat3 irotm) {
    vec3 localOrigin = irotm * (origin - pos);
    vec3 localDir = irotm * dir;
    
    float tmax = INFINITY;
    float tmin = -INFINITY;
    float halfSize = size / 2.0;
    
    if (abs(localDir.x) < EPSILON) {
        if (localOrigin.x < -halfSize || localOrigin.x > halfSize) return INFINITY;
    } else {
        float t1 = (-halfSize - localOrigin.x) / localDir.x;
        float t2 = (halfSize - localOrigin.x) / localDir.x;
        if (t1 > t2) { float temp = t1; t1 = t2; t2 = temp; }
        tmin = max(tmin, t1);
        tmax = min(tmax, t2);
        if (tmin > tmax) return INFINITY;
    }
    
    if (abs(localDir.y) < EPSILON) {
        if (localOrigin.y < -halfSize || localOrigin.y > halfSize) return INFINITY;
    } else {
        float t1 = (-halfSize - localOrigin.y) / localDir.y;
        float t2 = (halfSize - localOrigin.y) / localDir.y;
        if (t1 > t2) { float temp = t1; t1 = t2; t2 = temp; }
        tmin = max(tmin, t1);
        tmax = min(tmax, t2);
        if (tmin > tmax) return INFINITY;
    }
    
    if (abs(localDir.z) < EPSILON) {
        if (localOrigin.z < -halfSize || localOrigin.z > halfSize) return INFINITY;
    } else {
        float t1 = (-halfSize - localOrigin.z) / localDir.z;
        float t2 = (halfSize - localOrigin.z) / localDir.z;
        if (t1 > t2) { float temp = t1; t1 = t2; t2 = temp; }
        tmin = max(tmin, t1);
        tmax = min(tmax, t2);
        if (tmin > tmax) return INFINITY;
    }
    
    if (tmin < 0.0) return (tmax < 0.0 ? INFINITY : tmax);
    return tmin;
}

bool findClosestObject(vec3 origin, vec3 dir, out float dist, out int objIndex, out bool isSphere) {
    dist = INFINITY;
    objIndex = -1;
    isSphere = false;
    
    float d;
    if (uSphereCount > 0) {
        d = intersectSphere(origin, dir, uSpherePos[0], uSphereRad[0]);
        if (d < dist) { dist = d; objIndex = 0; isSphere = true; }
    }
    if (uSphereCount > 1) {
        d = intersectSphere(origin, dir, uSpherePos[1], uSphereRad[1]);
        if (d < dist) { dist = d; objIndex = 1; isSphere = true; }
    }
    if (uSphereCount > 2) {
        d = intersectSphere(origin, dir, uSpherePos[2], uSphereRad[2]);
        if (d < dist) { dist = d; objIndex = 2; isSphere = true; }
    }
    if (uSphereCount > 3) {
        d = intersectSphere(origin, dir, uSpherePos[3], uSphereRad[3]);
        if (d < dist) { dist = d; objIndex = 3; isSphere = true; }
    }
    if (uSphereCount > 4) {
        d = intersectSphere(origin, dir, uSpherePos[4], uSphereRad[4]);
        if (d < dist) { dist = d; objIndex = 4; isSphere = true; }
    }
    if (uSphereCount > 5) {
        d = intersectSphere(origin, dir, uSpherePos[5], uSphereRad[5]);
        if (d < dist) { dist = d; objIndex = 5; isSphere = true; }
    }
    if (uSphereCount > 6) {
        d = intersectSphere(origin, dir, uSpherePos[6], uSphereRad[6]);
        if (d < dist) { dist = d; objIndex = 6; isSphere = true; }
    }
    if (uSphereCount > 7) {
        d = intersectSphere(origin, dir, uSpherePos[7], uSphereRad[7]);
        if (d < dist) { dist = d; objIndex = 7; isSphere = true; }
    }
    if (uSphereCount > 8) {
        d = intersectSphere(origin, dir, uSpherePos[8], uSphereRad[8]);
        if (d < dist) { dist = d; objIndex = 8; isSphere = true; }
    }
    if (uSphereCount > 9) {
        d = intersectSphere(origin, dir, uSpherePos[9], uSphereRad[9]);
        if (d < dist) { dist = d; objIndex = 9; isSphere = true; }
    }
    
    if (uCubeCount > 0) {
        d = intersectCube(origin, dir, uCubePos[0], uCubeSize[0], uCubeIRotM[0]);
        if (d < dist) { dist = d; objIndex = 0; isSphere = false; }
    }
    if (uCubeCount > 1) {
        d = intersectCube(origin, dir, uCubePos[1], uCubeSize[1], uCubeIRotM[1]);
        if (d < dist) { dist = d; objIndex = 1; isSphere = false; }
    }
    if (uCubeCount > 2) {
        d = intersectCube(origin, dir, uCubePos[2], uCubeSize[2], uCubeIRotM[2]);
        if (d < dist) { dist = d; objIndex = 2; isSphere = false; }
    }
    if (uCubeCount > 3) {
        d = intersectCube(origin, dir, uCubePos[3], uCubeSize[3], uCubeIRotM[3]);
        if (d < dist) { dist = d; objIndex = 3; isSphere = false; }
    }
    if (uCubeCount > 4) {
        d = intersectCube(origin, dir, uCubePos[4], uCubeSize[4], uCubeIRotM[4]);
        if (d < dist) { dist = d; objIndex = 4; isSphere = false; }
    }
    if (uCubeCount > 5) {
        d = intersectCube(origin, dir, uCubePos[5], uCubeSize[5], uCubeIRotM[5]);
        if (d < dist) { dist = d; objIndex = 5; isSphere = false; }
    }
    if (uCubeCount > 6) {
        d = intersectCube(origin, dir, uCubePos[6], uCubeSize[6], uCubeIRotM[6]);
        if (d < dist) { dist = d; objIndex = 6; isSphere = false; }
    }
    if (uCubeCount > 7) {
        d = intersectCube(origin, dir, uCubePos[7], uCubeSize[7], uCubeIRotM[7]);
        if (d < dist) { dist = d; objIndex = 7; isSphere = false; }
    }
    if (uCubeCount > 8) {
        d = intersectCube(origin, dir, uCubePos[8], uCubeSize[8], uCubeIRotM[8]);
        if (d < dist) { dist = d; objIndex = 8; isSphere = false; }
    }
    if (uCubeCount > 9) {
        d = intersectCube(origin, dir, uCubePos[9], uCubeSize[9], uCubeIRotM[9]);
        if (d < dist) { dist = d; objIndex = 9; isSphere = false; }
    }
    
    return objIndex != -1 && dist < INFINITY;
}

vec3 getSphereNormal(vec3 point, int index) {
    vec3 normal = vec3(0.0);
    
    if (index == 0) normal = normalize(point - uSpherePos[0]);
    else if (index == 1) normal = normalize(point - uSpherePos[1]);
    else if (index == 2) normal = normalize(point - uSpherePos[2]);
    else if (index == 3) normal = normalize(point - uSpherePos[3]);
    else if (index == 4) normal = normalize(point - uSpherePos[4]);
    else if (index == 5) normal = normalize(point - uSpherePos[5]);
    else if (index == 6) normal = normalize(point - uSpherePos[6]);
    else if (index == 7) normal = normalize(point - uSpherePos[7]);
    else if (index == 8) normal = normalize(point - uSpherePos[8]);
    else if (index == 9) normal = normalize(point - uSpherePos[9]);
    
    return normal;
}

vec3 getCubeNormal(vec3 point, int index) {
    vec3 normal = vec3(0.0);
    vec3 localPoint;
    mat3 rotMatrix;
    
    if (index == 0) {
        localPoint = uCubeIRotM[0] * (point - uCubePos[0]);
        rotMatrix = uCubeRotM[0];
    } else if (index == 1) {
        localPoint = uCubeIRotM[1] * (point - uCubePos[1]);
        rotMatrix = uCubeRotM[1];
    } else if (index == 2) {
        localPoint = uCubeIRotM[2] * (point - uCubePos[2]);
        rotMatrix = uCubeRotM[2];
    } else if (index == 3) {
        localPoint = uCubeIRotM[3] * (point - uCubePos[3]);
        rotMatrix = uCubeRotM[3];
    } else if (index == 4) {
        localPoint = uCubeIRotM[4] * (point - uCubePos[4]);
        rotMatrix = uCubeRotM[4];
    } else if (index == 5) {
        localPoint = uCubeIRotM[5] * (point - uCubePos[5]);
        rotMatrix = uCubeRotM[5];
    } else if (index == 6) {
        localPoint = uCubeIRotM[6] * (point - uCubePos[6]);
        rotMatrix = uCubeRotM[6];
    } else if (index == 7) {
        localPoint = uCubeIRotM[7] * (point - uCubePos[7]);
        rotMatrix = uCubeRotM[7];
    } else if (index == 8) {
        localPoint = uCubeIRotM[8] * (point - uCubePos[8]);
        rotMatrix = uCubeRotM[8];
    } else if (index == 9) {
        localPoint = uCubeIRotM[9] * (point - uCubePos[9]);
        rotMatrix = uCubeRotM[9];
    }
    
    vec3 absLocal = abs(localPoint);
    vec3 localNormal;
    
    if (absLocal.x >= absLocal.y && absLocal.x >= absLocal.z) {
        localNormal = vec3(sign(localPoint.x), 0.0, 0.0);
    } else if (absLocal.y >= absLocal.x && absLocal.y >= absLocal.z) {
        localNormal = vec3(0.0, sign(localPoint.y), 0.0);
    } else {
        localNormal = vec3(0.0, 0.0, sign(localPoint.z));
    }
    
    return normalize(rotMatrix * localNormal);
}

vec3 getSurfaceNormal(vec3 point, int objIndex, bool isSphere) {
    if (isSphere) {
        return getSphereNormal(point, objIndex);
    } else {
        return getCubeNormal(point, objIndex);
    }
}

vec3 reflectVector(vec3 v, vec3 n) {
    return v - 2.0 * dot(v, n) * n;
}

vec3 getObjectColor(int index, bool isSphere) {
    if (isSphere) {
        if (index == 0) return uSphereColor[0] / 255.0;
        if (index == 1) return uSphereColor[1] / 255.0;
        if (index == 2) return uSphereColor[2] / 255.0;
        if (index == 3) return uSphereColor[3] / 255.0;
        if (index == 4) return uSphereColor[4] / 255.0;
        if (index == 5) return uSphereColor[5] / 255.0;
        if (index == 6) return uSphereColor[6] / 255.0;
        if (index == 7) return uSphereColor[7] / 255.0;
        if (index == 8) return uSphereColor[8] / 255.0;
        if (index == 9) return uSphereColor[9] / 255.0;
    } else {
        if (index == 0) return uCubeColor[0] / 255.0;
        if (index == 1) return uCubeColor[1] / 255.0;
        if (index == 2) return uCubeColor[2] / 255.0;
        if (index == 3) return uCubeColor[3] / 255.0;
        if (index == 4) return uCubeColor[4] / 255.0;
        if (index == 5) return uCubeColor[5] / 255.0;
        if (index == 6) return uCubeColor[6] / 255.0;
        if (index == 7) return uCubeColor[7] / 255.0;
        if (index == 8) return uCubeColor[8] / 255.0;
        if (index == 9) return uCubeColor[9] / 255.0;
    }
    return vec3(1.0, 0.0, 1.0);
}

struct ObjectProps {
    float ambi;
    float diff;
    float spec;
    float shin;
    float refl;
};

ObjectProps getObjectProps(int index, bool isSphere) {
    ObjectProps props;
    
    if (isSphere) {
        if (index == 0) { props.ambi = uSphereAmbi[0]; props.diff = uSphereDiff[0]; props.spec = uSphereSpec[0]; props.shin = uSphereShin[0]; props.refl = uSphereRefl[0]; }
        else if (index == 1) { props.ambi = uSphereAmbi[1]; props.diff = uSphereDiff[1]; props.spec = uSphereSpec[1]; props.shin = uSphereShin[1]; props.refl = uSphereRefl[1]; }
        else if (index == 2) { props.ambi = uSphereAmbi[2]; props.diff = uSphereDiff[2]; props.spec = uSphereSpec[2]; props.shin = uSphereShin[2]; props.refl = uSphereRefl[2]; }
        else if (index == 3) { props.ambi = uSphereAmbi[3]; props.diff = uSphereDiff[3]; props.spec = uSphereSpec[3]; props.shin = uSphereShin[3]; props.refl = uSphereRefl[3]; }
        else if (index == 4) { props.ambi = uSphereAmbi[4]; props.diff = uSphereDiff[4]; props.spec = uSphereSpec[4]; props.shin = uSphereShin[4]; props.refl = uSphereRefl[4]; }
        else if (index == 5) { props.ambi = uSphereAmbi[5]; props.diff = uSphereDiff[5]; props.spec = uSphereSpec[5]; props.shin = uSphereShin[5]; props.refl = uSphereRefl[5]; }
        else if (index == 6) { props.ambi = uSphereAmbi[6]; props.diff = uSphereDiff[6]; props.spec = uSphereSpec[6]; props.shin = uSphereShin[6]; props.refl = uSphereRefl[6]; }
        else if (index == 7) { props.ambi = uSphereAmbi[7]; props.diff = uSphereDiff[7]; props.spec = uSphereSpec[7]; props.shin = uSphereShin[7]; props.refl = uSphereRefl[7]; }
        else if (index == 8) { props.ambi = uSphereAmbi[8]; props.diff = uSphereDiff[8]; props.spec = uSphereSpec[8]; props.shin = uSphereShin[8]; props.refl = uSphereRefl[8]; }
        else if (index == 9) { props.ambi = uSphereAmbi[9]; props.diff = uSphereDiff[9]; props.spec = uSphereSpec[9]; props.shin = uSphereShin[9]; props.refl = uSphereRefl[9]; }
    } else {
        if (index == 0) { props.ambi = uCubeAmbi[0]; props.diff = uCubeDiff[0]; props.spec = uCubeSpec[0]; props.shin = uCubeShin[0]; props.refl = uCubeRefl[0]; }
        else if (index == 1) { props.ambi = uCubeAmbi[1]; props.diff = uCubeDiff[1]; props.spec = uCubeSpec[1]; props.shin = uCubeShin[1]; props.refl = uCubeRefl[1]; }
        else if (index == 2) { props.ambi = uCubeAmbi[2]; props.diff = uCubeDiff[2]; props.spec = uCubeSpec[2]; props.shin = uCubeShin[2]; props.refl = uCubeRefl[2]; }
        else if (index == 3) { props.ambi = uCubeAmbi[3]; props.diff = uCubeDiff[3]; props.spec = uCubeSpec[3]; props.shin = uCubeShin[3]; props.refl = uCubeRefl[3]; }
        else if (index == 4) { props.ambi = uCubeAmbi[4]; props.diff = uCubeDiff[4]; props.spec = uCubeSpec[4]; props.shin = uCubeShin[4]; props.refl = uCubeRefl[4]; }
        else if (index == 5) { props.ambi = uCubeAmbi[5]; props.diff = uCubeDiff[5]; props.spec = uCubeSpec[5]; props.shin = uCubeShin[5]; props.refl = uCubeRefl[5]; }
        else if (index == 6) { props.ambi = uCubeAmbi[6]; props.diff = uCubeDiff[6]; props.spec = uCubeSpec[6]; props.shin = uCubeShin[6]; props.refl = uCubeRefl[6]; }
        else if (index == 7) { props.ambi = uCubeAmbi[7]; props.diff = uCubeDiff[7]; props.spec = uCubeSpec[7]; props.shin = uCubeShin[7]; props.refl = uCubeRefl[7]; }
        else if (index == 8) { props.ambi = uCubeAmbi[8]; props.diff = uCubeDiff[8]; props.spec = uCubeSpec[8]; props.shin = uCubeShin[8]; props.refl = uCubeRefl[8]; }
        else if (index == 9) { props.ambi = uCubeAmbi[9]; props.diff = uCubeDiff[9]; props.spec = uCubeSpec[9]; props.shin = uCubeShin[9]; props.refl = uCubeRefl[9]; }
    }
    
    return props;
}

void main() {
    vec3 rayOrigin = uCameraPos;
    vec3 rayDir = normalize(uCameraDir + (2.0 * vUV.x - 1.0) * uCameraRight + (1.0 - 2.0 * vUV.y) * uCameraUp);
    
    vec3 finalColor = vec3(0.0);
    float reflection = 1.0;
    
    for (int i = 0; i < MAX_REFLECTIONS; i++) {
        if (reflection <= 0.1) break;
        
        float dist;
        int objIndex;
        bool isSphere;
        
        if (!findClosestObject(rayOrigin, rayDir, dist, objIndex, isSphere)) {
            break;
        }
        
        vec3 objColor = getObjectColor(objIndex, isSphere);
        ObjectProps props = getObjectProps(objIndex, isSphere);
        
        vec3 intersectionPoint = rayOrigin + dist * rayDir;
        vec3 normal = getSurfaceNormal(intersectionPoint, objIndex, isSphere);
        vec3 pointOrigin = normalize(rayOrigin - intersectionPoint);
        
        vec3 transPoint = intersectionPoint + normal * EPSILON;
        
        vec3 toLight = normalize(uLightPos - transPoint);
        
        vec3 illumination = vec3(props.ambi * uLightAmbi);
        
        float shadowDist;
        int shadowObjIndex;
        bool shadowIsSphere;
        bool inShadow = findClosestObject(transPoint, toLight, shadowDist, shadowObjIndex, shadowIsSphere) && shadowDist < distance(uLightPos, transPoint);
        
        if (!inShadow) {
            float diff = max(0.0, dot(toLight, normal));
            illumination += vec3(props.diff * uLightDiff * diff);
            float spec = pow(max(0.0, dot(normalize(toLight + pointOrigin), normal)), props.shin);
            illumination += vec3(props.spec * uLightSpec * spec);
        }
        
        illumination = min(illumination, vec3(1.0)) * reflection;
        finalColor += objColor * illumination;
        
        reflection *= props.refl;
        rayOrigin = transPoint;
        rayDir = reflectVector(rayDir, normal);
    }
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;
