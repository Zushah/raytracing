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

uniform int uPrismCount;
uniform vec3 uPrismPos[5];
uniform float uPrismXLen[5];
uniform float uPrismYLen[5];
uniform float uPrismZLen[5];
uniform vec3 uPrismColor[5];
uniform float uPrismAmbi[5];
uniform float uPrismDiff[5];
uniform float uPrismSpec[5];
uniform float uPrismShin[5];
uniform float uPrismRefl[5];
uniform mat3 uPrismRotM[5];
uniform mat3 uPrismIRotM[5];

uniform int uCylinderCount;
uniform vec3 uCylPos[5];
uniform float uCylHeight[5];
uniform float uCylRad[5];
uniform vec3 uCylColor[5];
uniform float uCylAmbi[5];
uniform float uCylDiff[5];
uniform float uCylSpec[5];
uniform float uCylShin[5];
uniform float uCylRefl[5];
uniform mat3 uCylRotM[5];
uniform mat3 uCylIRotM[5];

uniform int uPyramidCount;
uniform vec3 uPyramidPos[6];
uniform float uPyramidWidth[6];
uniform float uPyramidHeight[6];
uniform vec3 uPyramidColor[6];
uniform float uPyramidAmbi[6];
uniform float uPyramidDiff[6];
uniform float uPyramidSpec[6];
uniform float uPyramidShin[6];
uniform float uPyramidRefl[6];
uniform mat3 uPyramidRotM[6];
uniform mat3 uPyramidIRotM[6];

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

float intersectPrism(vec3 origin, vec3 dir, vec3 pos, float xlen, float ylen, float zlen, mat3 irotm) {
    vec3 localOrigin = irotm * (origin - pos);
    vec3 localDir = irotm * dir;
    
    float tmax = INFINITY;
    float tmin = -INFINITY;
    float halfXLen = xlen / 2.0;
    float halfYLen = ylen / 2.0;
    float halfZLen = zlen / 2.0;
    
    if (abs(localDir.x) < EPSILON) {
        if (localOrigin.x < -halfXLen || localOrigin.x > halfXLen) return INFINITY;
    } else {
        float t1 = (-halfXLen - localOrigin.x) / localDir.x;
        float t2 = (halfXLen - localOrigin.x) / localDir.x;
        if (t1 > t2) { float temp = t1; t1 = t2; t2 = temp; }
        tmin = max(tmin, t1);
        tmax = min(tmax, t2);
        if (tmin > tmax) return INFINITY;
    }
    
    if (abs(localDir.y) < EPSILON) {
        if (localOrigin.y < -halfYLen || localOrigin.y > halfYLen) return INFINITY;
    } else {
        float t1 = (-halfYLen - localOrigin.y) / localDir.y;
        float t2 = (halfYLen - localOrigin.y) / localDir.y;
        if (t1 > t2) { float temp = t1; t1 = t2; t2 = temp; }
        tmin = max(tmin, t1);
        tmax = min(tmax, t2);
        if (tmin > tmax) return INFINITY;
    }
    
    if (abs(localDir.z) < EPSILON) {
        if (localOrigin.z < -halfZLen || localOrigin.z > halfZLen) return INFINITY;
    } else {
        float t1 = (-halfZLen - localOrigin.z) / localDir.z;
        float t2 = (halfZLen - localOrigin.z) / localDir.z;
        if (t1 > t2) { float temp = t1; t1 = t2; t2 = temp; }
        tmin = max(tmin, t1);
        tmax = min(tmax, t2);
        if (tmin > tmax) return INFINITY;
    }
    
    if (tmin < 0.0) return (tmax < 0.0 ? INFINITY : tmax);
    return tmin;
}

float intersectCylinder(vec3 origin, vec3 dir, vec3 pos, float height, float rad, mat3 irotm) {
    vec3 o = irotm * (origin - pos);
    vec3 d = irotm * dir;
    
    float halfHeight = height / 2.0;
    
    float a = d.x * d.x + d.z * d.z;
    float b = 2.0 * (o.x * d.x + o.z * d.z);
    float c = o.x * o.x + o.z * o.z - rad * rad;
    float disc = b * b - 4.0 * a * c;
    
    float tSide = INFINITY;
    if (disc > 0.0) {
        float t1 = (-b - sqrt(disc)) / (2.0 * a);
        float t2 = (-b + sqrt(disc)) / (2.0 * a);
        
        if (t1 > 0.0) {
            float y = o.y + t1 * d.y;
            if (y >= -halfHeight && y <= halfHeight) tSide = t1;
        }
        
        if (t2 > 0.0) {
            float y = o.y + t2 * d.y;
            if (y >= -halfHeight && y <= halfHeight && t2 < tSide) tSide = t2;
        }
    }
    
    float tCap = INFINITY;
    if (abs(d.y) > EPSILON) {
        float t1 = (-halfHeight - o.y) / d.y;
        if (t1 > 0.0) {
            float x = o.x + t1 * d.x;
            float z = o.z + t1 * d.z;
            if (x*x + z*z <= rad*rad) tCap = t1;
        }
        float t2 = (halfHeight - o.y) / d.y;
        if (t2 > 0.0) {
            float x = o.x + t2 * d.x;
            float z = o.z + t2 * d.z;
            if (x*x + z*z <= rad*rad && t2 < tCap) tCap = t2;
        }
    }
    
    return min(tSide, tCap);
}

float intersectPyramid(vec3 origin, vec3 dir, vec3 pos, float width, float height, mat3 irotm) {
    vec3 o = irotm * (origin - pos);
    vec3 d = irotm * dir;
    
    float halfWidth = width / 2.0;
    
    float baseY = height / 2.0;
    float tBase = INFINITY;
    
    if (abs(d.y) > EPSILON) {
        float t = (baseY - o.y) / d.y;
        if (t > 0.0) {
            float x = o.x + d.x * t;
            float z = o.z + d.z * t;
            if (abs(x) <= halfWidth && abs(z) <= halfWidth) {
                tBase = t;
            }
        }
    }
    
    vec3 apex = vec3(0.0, -height / 2.0, 0.0);
    float tFaces = INFINITY;
    
    vec3 base0 = vec3(-halfWidth, baseY, -halfWidth);
    vec3 base1 = vec3(halfWidth, baseY, -halfWidth);
    vec3 base2 = vec3(halfWidth, baseY, halfWidth);
    vec3 base3 = vec3(-halfWidth, baseY, halfWidth);
    
    {
        vec3 v0 = apex;
        vec3 v1 = base0;
        vec3 v2 = base1;
        
        vec3 edge1 = v1 - v0;
        vec3 edge2 = v2 - v0;
        vec3 normal = normalize(cross(edge1, edge2));
        
        float denom = dot(normal, d);
        if (abs(denom) > EPSILON) {
            float t = dot(v0 - o, normal) / denom;
            if (t > 0.0) {
                vec3 p = o + d * t;
                
                vec3 c1 = cross(v1 - v0, p - v0);
                vec3 c2 = cross(v2 - v1, p - v1);
                vec3 c3 = cross(v0 - v2, p - v2);
                
                bool sameSide = dot(c1, normal) > 0.0 && dot(c2, normal) > 0.0 && dot(c3, normal) > 0.0;
                
                if (sameSide && t < tFaces) {
                    tFaces = t;
                }
            }
        }
    }
    
    {
        vec3 v0 = apex;
        vec3 v1 = base1;
        vec3 v2 = base2;
        
        vec3 edge1 = v1 - v0;
        vec3 edge2 = v2 - v0;
        vec3 normal = normalize(cross(edge1, edge2));
        
        float denom = dot(normal, d);
        if (abs(denom) > EPSILON) {
            float t = dot(v0 - o, normal) / denom;
            if (t > 0.0) {
                vec3 p = o + d * t;
                
                vec3 c1 = cross(v1 - v0, p - v0);
                vec3 c2 = cross(v2 - v1, p - v1);
                vec3 c3 = cross(v0 - v2, p - v2);
                
                bool sameSide = dot(c1, normal) > 0.0 && dot(c2, normal) > 0.0 && dot(c3, normal) > 0.0;
                
                if (sameSide && t < tFaces) {
                    tFaces = t;
                }
            }
        }
    }
    
    {
        vec3 v0 = apex;
        vec3 v1 = base2;
        vec3 v2 = base3;
        
        vec3 edge1 = v1 - v0;
        vec3 edge2 = v2 - v0;
        vec3 normal = normalize(cross(edge1, edge2));
        
        float denom = dot(normal, d);
        if (abs(denom) > EPSILON) {
            float t = dot(v0 - o, normal) / denom;
            if (t > 0.0) {
                vec3 p = o + d * t;
                
                vec3 c1 = cross(v1 - v0, p - v0);
                vec3 c2 = cross(v2 - v1, p - v1);
                vec3 c3 = cross(v0 - v2, p - v2);
                
                bool sameSide = dot(c1, normal) > 0.0 && dot(c2, normal) > 0.0 && dot(c3, normal) > 0.0;
                
                if (sameSide && t < tFaces) {
                    tFaces = t;
                }
            }
        }
    }
    
    {
        vec3 v0 = apex;
        vec3 v1 = base3;
        vec3 v2 = base0;
        
        vec3 edge1 = v1 - v0;
        vec3 edge2 = v2 - v0;
        vec3 normal = normalize(cross(edge1, edge2));
        
        float denom = dot(normal, d);
        if (abs(denom) > EPSILON) {
            float t = dot(v0 - o, normal) / denom;
            if (t > 0.0) {
                vec3 p = o + d * t;
                
                vec3 c1 = cross(v1 - v0, p - v0);
                vec3 c2 = cross(v2 - v1, p - v1);
                vec3 c3 = cross(v0 - v2, p - v2);
                
                bool sameSide = dot(c1, normal) > 0.0 && dot(c2, normal) > 0.0 && dot(c3, normal) > 0.0;
                
                if (sameSide && t < tFaces) {
                    tFaces = t;
                }
            }
        }
    }
    
    return min(tBase, tFaces);
}

bool findClosestObject(vec3 origin, vec3 dir, out float dist, out int objIndex, out bool isSphere, out bool isCylinder, out bool isPyramid) {
    dist = INFINITY;
    objIndex = -1;
    isSphere = false;
    isCylinder = false;
    isPyramid = false;
    
    float d;
    
    for (int i = 0; i < 10; i++) {
        if (i >= uSphereCount) break;
        d = intersectSphere(origin, dir, uSpherePos[i], uSphereRad[i]);
        if (d < dist) { 
            dist = d; 
            objIndex = i; 
            isSphere = true; 
            isCylinder = false; 
            isPyramid = false;
        }
    }
    
    for (int i = 0; i < 10; i++) {
        if (i >= uPrismCount) break;
        d = intersectPrism(origin, dir, uPrismPos[i], uPrismXLen[i], uPrismYLen[i], uPrismZLen[i], uPrismIRotM[i]);
        if (d < dist) { 
            dist = d; 
            objIndex = i; 
            isSphere = false; 
            isCylinder = false;
            isPyramid = false;
        }
    }
    
    for (int i = 0; i < 10; i++) {
        if (i >= uCylinderCount) break;
        d = intersectCylinder(origin, dir, uCylPos[i], uCylHeight[i], uCylRad[i], uCylIRotM[i]);
        if (d < dist) { 
            dist = d; 
            objIndex = i; 
            isSphere = false; 
            isCylinder = true;
            isPyramid = false;
        }
    }
    
    for (int i = 0; i < 10; i++) {
        if (i >= uPyramidCount) break;
        d = intersectPyramid(origin, dir, uPyramidPos[i], uPyramidWidth[i], uPyramidHeight[i], uPyramidIRotM[i]);
        if (d < dist) { 
            dist = d; 
            objIndex = i; 
            isSphere = false; 
            isCylinder = false;
            isPyramid = true;
        }
    }
    
    return objIndex != -1 && dist < INFINITY;
}

vec3 getSphereNormal(vec3 point, int index) {
    if (index == 0) return normalize(point - uSpherePos[0]);
    if (index == 1) return normalize(point - uSpherePos[1]);
    if (index == 2) return normalize(point - uSpherePos[2]);
    if (index == 3) return normalize(point - uSpherePos[3]);
    if (index == 4) return normalize(point - uSpherePos[4]);
    if (index == 5) return normalize(point - uSpherePos[5]);
    if (index == 6) return normalize(point - uSpherePos[6]);
    if (index == 7) return normalize(point - uSpherePos[7]);
    if (index == 8) return normalize(point - uSpherePos[8]);
    if (index == 9) return normalize(point - uSpherePos[9]);
    return vec3(0.0);
}

vec3 getPrismNormal(vec3 point, int index) {
    vec3 localPoint;
    vec3 localNormal;
    vec3 halfDims;

    if (index == 0) {
        localPoint = uPrismIRotM[0] * (point - uPrismPos[0]);
        halfDims = vec3(uPrismXLen[0] / 2.0, uPrismYLen[0] / 2.0, uPrismZLen[0] / 2.0);
    } else if (index == 1) {
        localPoint = uPrismIRotM[1] * (point - uPrismPos[1]);
        halfDims = vec3(uPrismXLen[1] / 2.0, uPrismYLen[1] / 2.0, uPrismZLen[1] / 2.0);
    } else if (index == 2) {
        localPoint = uPrismIRotM[2] * (point - uPrismPos[2]);
        halfDims = vec3(uPrismXLen[2] / 2.0, uPrismYLen[2] / 2.0, uPrismZLen[2] / 2.0);
    } else if (index == 3) {
        localPoint = uPrismIRotM[3] * (point - uPrismPos[3]);
        halfDims = vec3(uPrismXLen[3] / 2.0, uPrismYLen[3] / 2.0, uPrismZLen[3] / 2.0);
    } else if (index == 4) {
        localPoint = uPrismIRotM[4] * (point - uPrismPos[4]);
        halfDims = vec3(uPrismXLen[4] / 2.0, uPrismYLen[4] / 2.0, uPrismZLen[4] / 2.0);
    } else {
        return vec3(0.0);
    }
    
    vec3 normPoint = abs(localPoint) / halfDims;
    
    if (normPoint.x >= normPoint.y && normPoint.x >= normPoint.z) {
        localNormal = vec3(sign(localPoint.x), 0.0, 0.0);
    } else if (normPoint.y >= normPoint.x && normPoint.y >= normPoint.z) {
        localNormal = vec3(0.0, sign(localPoint.y), 0.0);
    } else {
        localNormal = vec3(0.0, 0.0, sign(localPoint.z));
    }
    
    if (index == 0) return normalize(uPrismRotM[0] * localNormal);
    if (index == 1) return normalize(uPrismRotM[1] * localNormal);
    if (index == 2) return normalize(uPrismRotM[2] * localNormal);
    if (index == 3) return normalize(uPrismRotM[3] * localNormal);
    if (index == 4) return normalize(uPrismRotM[4] * localNormal);
    
    return vec3(0.0);
}

vec3 getCylinderNormal(vec3 point, int index) {
    vec3 localPoint;
    float halfHeight;

    if (index == 0) {
        localPoint = uCylIRotM[0] * (point - uCylPos[0]);
        halfHeight = uCylHeight[0] / 2.0;
        if (abs(localPoint.y - halfHeight) < EPSILON) {
            return normalize(uCylRotM[0] * vec3(0.0, 1.0, 0.0));
        } else if (abs(localPoint.y + halfHeight) < EPSILON) {
            return normalize(uCylRotM[0] * vec3(0.0, -1.0, 0.0));
        } else {
            vec3 sideNormal = vec3(localPoint.x, 0.0, localPoint.z);
            return normalize(uCylRotM[0] * sideNormal);
        }
    } else if (index == 1) {
        localPoint = uCylIRotM[1] * (point - uCylPos[1]);
        halfHeight = uCylHeight[1] / 2.0;
        if (abs(localPoint.y - halfHeight) < EPSILON) {
            return normalize(uCylRotM[1] * vec3(0.0, 1.0, 0.0));
        } else if (abs(localPoint.y + halfHeight) < EPSILON) {
            return normalize(uCylRotM[1] * vec3(0.0, -1.0, 0.0));
        } else {
            vec3 sideNormal = vec3(localPoint.x, 0.0, localPoint.z);
            return normalize(uCylRotM[1] * sideNormal);
        }
    } else if (index == 2) {
        localPoint = uCylIRotM[2] * (point - uCylPos[2]);
        halfHeight = uCylHeight[2] / 2.0;
        if (abs(localPoint.y - halfHeight) < EPSILON) {
            return normalize(uCylRotM[2] * vec3(0.0, 1.0, 0.0));
        } else if (abs(localPoint.y + halfHeight) < EPSILON) {
            return normalize(uCylRotM[2] * vec3(0.0, -1.0, 0.0));
        } else {
            vec3 sideNormal = vec3(localPoint.x, 0.0, localPoint.z);
            return normalize(uCylRotM[2] * sideNormal);
        }
    } else if (index == 3) {
        localPoint = uCylIRotM[3] * (point - uCylPos[3]);
        halfHeight = uCylHeight[3] / 2.0;
        if (abs(localPoint.y - halfHeight) < EPSILON) {
            return normalize(uCylRotM[3] * vec3(0.0, 1.0, 0.0));
        } else if (abs(localPoint.y + halfHeight) < EPSILON) {
            return normalize(uCylRotM[3] * vec3(0.0, -1.0, 0.0));
        } else {
            vec3 sideNormal = vec3(localPoint.x, 0.0, localPoint.z);
            return normalize(uCylRotM[3] * sideNormal);
        }
    } else if (index == 4) {
        localPoint = uCylIRotM[4] * (point - uCylPos[4]);
        halfHeight = uCylHeight[4] / 2.0;
        if (abs(localPoint.y - halfHeight) < EPSILON) {
            return normalize(uCylRotM[4] * vec3(0.0, 1.0, 0.0));
        } else if (abs(localPoint.y + halfHeight) < EPSILON) {
            return normalize(uCylRotM[4] * vec3(0.0, -1.0, 0.0));
        } else {
            vec3 sideNormal = vec3(localPoint.x, 0.0, localPoint.z);
            return normalize(uCylRotM[4] * sideNormal);
        }
    }
    return vec3(0.0);
}

vec3 getPyramidNormal(vec3 point, int index) {
    vec3 localPoint;
    float halfWidth;
    float halfHeight;
    vec3 apex;
    
    if (index == 0) {
        localPoint = uPyramidIRotM[0] * (point - uPyramidPos[0]);
        halfWidth = uPyramidWidth[0] / 2.0;
        halfHeight = uPyramidHeight[0] / 2.0;
        apex = vec3(0.0, -halfHeight, 0.0);
        if (abs(localPoint.y - halfHeight) < EPSILON) {
            return normalize(uPyramidRotM[0] * vec3(0.0, 1.0, 0.0));
        }
    } else if (index == 1) {
        localPoint = uPyramidIRotM[1] * (point - uPyramidPos[1]);
        halfWidth = uPyramidWidth[1] / 2.0;
        halfHeight = uPyramidHeight[1] / 2.0;
        apex = vec3(0.0, -halfHeight, 0.0);
        if (abs(localPoint.y - halfHeight) < EPSILON) {
            return normalize(uPyramidRotM[1] * vec3(0.0, 1.0, 0.0));
        }
    } else if (index == 2) {
        localPoint = uPyramidIRotM[2] * (point - uPyramidPos[2]);
        halfWidth = uPyramidWidth[2] / 2.0;
        halfHeight = uPyramidHeight[2] / 2.0;
        apex = vec3(0.0, -halfHeight, 0.0);
        if (abs(localPoint.y - halfHeight) < EPSILON) {
            return normalize(uPyramidRotM[2] * vec3(0.0, 1.0, 0.0));
        }
    } else if (index == 3) {
        localPoint = uPyramidIRotM[3] * (point - uPyramidPos[3]);
        halfWidth = uPyramidWidth[3] / 2.0;
        halfHeight = uPyramidHeight[3] / 2.0;
        apex = vec3(0.0, -halfHeight, 0.0);
        if (abs(localPoint.y - halfHeight) < EPSILON) {
            return normalize(uPyramidRotM[3] * vec3(0.0, 1.0, 0.0));
        }
    } else if (index == 4) {
        localPoint = uPyramidIRotM[4] * (point - uPyramidPos[4]);
        halfWidth = uPyramidWidth[4] / 2.0;
        halfHeight = uPyramidHeight[4] / 2.0;
        apex = vec3(0.0, -halfHeight, 0.0);
        if (abs(localPoint.y - halfHeight) < EPSILON) {
            return normalize(uPyramidRotM[4] * vec3(0.0, 1.0, 0.0));
        }
    } else if (index == 5) {
        localPoint = uPyramidIRotM[5] * (point - uPyramidPos[5]);
        halfWidth = uPyramidWidth[5] / 2.0;
        halfHeight = uPyramidHeight[5] / 2.0;
        apex = vec3(0.0, -halfHeight, 0.0);
        if (abs(localPoint.y - halfHeight) < EPSILON) {
            return normalize(uPyramidRotM[5] * vec3(0.0, 1.0, 0.0));
        }
    }
    
    vec3 base0 = vec3(-halfWidth, halfHeight, -halfWidth);
    vec3 base1 = vec3(halfWidth, halfHeight, -halfWidth);
    vec3 base2 = vec3(halfWidth, halfHeight, halfWidth);
    vec3 base3 = vec3(-halfWidth, halfHeight, halfWidth);
    
    float minDist = INFINITY;
    vec3 normal = vec3(0.0);
    
    {
        vec3 v0 = apex;
        vec3 v1 = base0;
        vec3 v2 = base1;
        
        vec3 edge1 = v1 - v0;
        vec3 edge2 = v2 - v0;
        vec3 faceNormal = normalize(cross(edge1, edge2));
        
        float dist = abs(dot(faceNormal, localPoint - v0));
        
        if (dist < minDist) {
            minDist = dist;
            normal = faceNormal;
        }
    }
    
    {
        vec3 v0 = apex;
        vec3 v1 = base1;
        vec3 v2 = base2;
        
        vec3 edge1 = v1 - v0;
        vec3 edge2 = v2 - v0;
        vec3 faceNormal = normalize(cross(edge1, edge2));
        
        float dist = abs(dot(faceNormal, localPoint - v0));
        
        if (dist < minDist) {
            minDist = dist;
            normal = faceNormal;
        }
    }
    
    {
        vec3 v0 = apex;
        vec3 v1 = base2;
        vec3 v2 = base3;
        
        vec3 edge1 = v1 - v0;
        vec3 edge2 = v2 - v0;
        vec3 faceNormal = normalize(cross(edge1, edge2));
        
        float dist = abs(dot(faceNormal, localPoint - v0));
        
        if (dist < minDist) {
            minDist = dist;
            normal = faceNormal;
        }
    }
    
    {
        vec3 v0 = apex;
        vec3 v1 = base3;
        vec3 v2 = base0;
        
        vec3 edge1 = v1 - v0;
        vec3 edge2 = v2 - v0;
        vec3 faceNormal = normalize(cross(edge1, edge2));
        
        float dist = abs(dot(faceNormal, localPoint - v0));
        
        if (dist < minDist) {
            minDist = dist;
            normal = faceNormal;
        }
    }
    
    if (index == 0) return normalize(uPyramidRotM[0] * normal);
    if (index == 1) return normalize(uPyramidRotM[1] * normal);
    if (index == 2) return normalize(uPyramidRotM[2] * normal);
    if (index == 3) return normalize(uPyramidRotM[3] * normal);
    if (index == 4) return normalize(uPyramidRotM[4] * normal);
    if (index == 5) return normalize(uPyramidRotM[5] * normal);
    
    return vec3(0.0);
}

vec3 getSurfaceNormal(vec3 point, int objIndex, bool isSphere, bool isCylinder, bool isPyramid) {
    if (isSphere) {
        return getSphereNormal(point, objIndex);
    } else if (isCylinder) {
        return getCylinderNormal(point, objIndex);
    } else if (isPyramid) {
        return getPyramidNormal(point, objIndex);
    } else {
        return getPrismNormal(point, objIndex);
    }
}

vec3 reflectVector(vec3 v, vec3 n) {
    return v - 2.0 * dot(v, n) * n;
}

vec3 getObjectColor(int index, bool isSphere, bool isCylinder, bool isPyramid) {
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
    } else if (isCylinder) {
        if (index == 0) return uCylColor[0] / 255.0;
        if (index == 1) return uCylColor[1] / 255.0;
        if (index == 2) return uCylColor[2] / 255.0;
        if (index == 3) return uCylColor[3] / 255.0;
        if (index == 4) return uCylColor[4] / 255.0;
    } else if (isPyramid) {
        if (index == 0) return uPyramidColor[0] / 255.0;
        if (index == 1) return uPyramidColor[1] / 255.0;
        if (index == 2) return uPyramidColor[2] / 255.0;
        if (index == 3) return uPyramidColor[3] / 255.0;
        if (index == 4) return uPyramidColor[4] / 255.0;
        if (index == 5) return uPyramidColor[5] / 255.0;
    } else {
        if (index == 0) return uPrismColor[0] / 255.0;
        if (index == 1) return uPrismColor[1] / 255.0;
        if (index == 2) return uPrismColor[2] / 255.0;
        if (index == 3) return uPrismColor[3] / 255.0;
        if (index == 4) return uPrismColor[4] / 255.0;
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

ObjectProps getObjectProps(int index, bool isSphere, bool isCylinder, bool isPyramid) {
    ObjectProps props;
    props.ambi = 0.2; props.diff = 0.7; props.spec = 0.5; props.shin = 30.0; props.refl = 0.0;

    if (isSphere) {
        if (index == 0) {
            props.ambi = uSphereAmbi[0]; props.diff = uSphereDiff[0];
            props.spec = uSphereSpec[0]; props.shin = uSphereShin[0]; props.refl = uSphereRefl[0];
        } else if (index == 1) {
            props.ambi = uSphereAmbi[1]; props.diff = uSphereDiff[1];
            props.spec = uSphereSpec[1]; props.shin = uSphereShin[1]; props.refl = uSphereRefl[1];
        } else if (index == 2) {
            props.ambi = uSphereAmbi[2]; props.diff = uSphereDiff[2];
            props.spec = uSphereSpec[2]; props.shin = uSphereShin[2]; props.refl = uSphereRefl[2];
        } else if (index == 3) {
            props.ambi = uSphereAmbi[3]; props.diff = uSphereDiff[3];
            props.spec = uSphereSpec[3]; props.shin = uSphereShin[3]; props.refl = uSphereRefl[3];
        } else if (index == 4) {
            props.ambi = uSphereAmbi[4]; props.diff = uSphereDiff[4];
            props.spec = uSphereSpec[4]; props.shin = uSphereShin[4]; props.refl = uSphereRefl[4];
        } else if (index == 5) {
            props.ambi = uSphereAmbi[5]; props.diff = uSphereDiff[5];
            props.spec = uSphereSpec[5]; props.shin = uSphereShin[5]; props.refl = uSphereRefl[5];
        } else if (index == 6) {
            props.ambi = uSphereAmbi[6]; props.diff = uSphereDiff[6];
            props.spec = uSphereSpec[6]; props.shin = uSphereShin[6]; props.refl = uSphereRefl[6];
        } else if (index == 7) {
            props.ambi = uSphereAmbi[7]; props.diff = uSphereDiff[7];
            props.spec = uSphereSpec[7]; props.shin = uSphereShin[7]; props.refl = uSphereRefl[7];
        } else if (index == 8) {
            props.ambi = uSphereAmbi[8]; props.diff = uSphereDiff[8];
            props.spec = uSphereSpec[8]; props.shin = uSphereShin[8]; props.refl = uSphereRefl[8];
        } else if (index == 9) {
            props.ambi = uSphereAmbi[9]; props.diff = uSphereDiff[9];
            props.spec = uSphereSpec[9]; props.shin = uSphereShin[9]; props.refl = uSphereRefl[9];
        }
    } else if (isCylinder) {
        if (index == 0) {
            props.ambi = uCylAmbi[0]; props.diff = uCylDiff[0];
            props.spec = uCylSpec[0]; props.shin = uCylShin[0]; props.refl = uCylRefl[0];
        } else if (index == 1) {
            props.ambi = uCylAmbi[1]; props.diff = uCylDiff[1];
            props.spec = uCylSpec[1]; props.shin = uCylShin[1]; props.refl = uCylRefl[1];
        } else if (index == 2) {
            props.ambi = uCylAmbi[2]; props.diff = uCylDiff[2];
            props.spec = uCylSpec[2]; props.shin = uCylShin[2]; props.refl = uCylRefl[2];
        } else if (index == 3) {
            props.ambi = uCylAmbi[3]; props.diff = uCylDiff[3];
            props.spec = uCylSpec[3]; props.shin = uCylShin[3]; props.refl = uCylRefl[3];
        } else if (index == 4) {
            props.ambi = uCylAmbi[4]; props.diff = uCylDiff[4];
            props.spec = uCylSpec[4]; props.shin = uCylShin[4]; props.refl = uCylRefl[4];
        }
    } else if (isPyramid) {
        if (index == 0) {
            props.ambi = uPyramidAmbi[0]; props.diff = uPyramidDiff[0];
            props.spec = uPyramidSpec[0]; props.shin = uPyramidShin[0]; props.refl = uPyramidRefl[0];
        } else if (index == 1) {
            props.ambi = uPyramidAmbi[1]; props.diff = uPyramidDiff[1];
            props.spec = uPyramidSpec[1]; props.shin = uPyramidShin[1]; props.refl = uPyramidRefl[1];
        } else if (index == 2) {
            props.ambi = uPyramidAmbi[2]; props.diff = uPyramidDiff[2];
            props.spec = uPyramidSpec[2]; props.shin = uPyramidShin[2]; props.refl = uPyramidRefl[2];
        } else if (index == 3) {
            props.ambi = uPyramidAmbi[3]; props.diff = uPyramidDiff[3];
            props.spec = uPyramidSpec[3]; props.shin = uPyramidShin[3]; props.refl = uPyramidRefl[3];
        } else if (index == 4) {
            props.ambi = uPyramidAmbi[4]; props.diff = uPyramidDiff[4];
            props.spec = uPyramidSpec[4]; props.shin = uPyramidShin[4]; props.refl = uPyramidRefl[4];
        } else if (index == 5) {
            props.ambi = uPyramidAmbi[5]; props.diff = uPyramidDiff[5];
            props.spec = uPyramidSpec[5]; props.shin = uPyramidShin[5]; props.refl = uPyramidRefl[5];
        }
    } else {
        if (index == 0) {
            props.ambi = uPrismAmbi[0]; props.diff = uPrismDiff[0];
            props.spec = uPrismSpec[0]; props.shin = uPrismShin[0]; props.refl = uPrismRefl[0];
        } else if (index == 1) {
            props.ambi = uPrismAmbi[1]; props.diff = uPrismDiff[1];
            props.spec = uPrismSpec[1]; props.shin = uPrismShin[1]; props.refl = uPrismRefl[1];
        } else if (index == 2) {
            props.ambi = uPrismAmbi[2]; props.diff = uPrismDiff[2];
            props.spec = uPrismSpec[2]; props.shin = uPrismShin[2]; props.refl = uPrismRefl[2];
        } else if (index == 3) {
            props.ambi = uPrismAmbi[3]; props.diff = uPrismDiff[3];
            props.spec = uPrismSpec[3]; props.shin = uPrismShin[3]; props.refl = uPrismRefl[3];
        } else if (index == 4) {
            props.ambi = uPrismAmbi[4]; props.diff = uPrismDiff[4];
            props.spec = uPrismSpec[4]; props.shin = uPrismShin[4]; props.refl = uPrismRefl[4];
        }
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
        bool isCylinder;
        bool isPyramid;

        if (!findClosestObject(rayOrigin, rayDir, dist, objIndex, isSphere, isCylinder, isPyramid)) {
            break;
        }

        vec3 objColor = getObjectColor(objIndex, isSphere, isCylinder, isPyramid);
        ObjectProps props = getObjectProps(objIndex, isSphere, isCylinder, isPyramid);

        vec3 intersectionPoint = rayOrigin + dist * rayDir;
        vec3 normal = getSurfaceNormal(intersectionPoint, objIndex, isSphere, isCylinder, isPyramid);
        vec3 pointOrigin = normalize(rayOrigin - intersectionPoint);
        vec3 transPoint = intersectionPoint + normal * EPSILON;
        vec3 toLight = normalize(uLightPos - transPoint);
        vec3 illumination = vec3(props.ambi * uLightAmbi);

        float shadowDist;
        int shadowObjIndex;
        bool shadowIsSphere;
        bool shadowIsCylinder;
        bool shadowIsPyramid;
        bool inShadow = findClosestObject(transPoint, toLight, shadowDist, shadowObjIndex, shadowIsSphere, shadowIsCylinder, shadowIsPyramid) && shadowDist < distance(uLightPos, transPoint);

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
