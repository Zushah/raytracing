const cb = Chalkboard;
const ctx = document.getElementById("canvas").getContext("2d");
const light = { pos: cb.vect.init(10, -10, 5), ambi: 0.1, diff: 1.0, spec: 1.0 };
const sphere = (pos, rad, clr, ambi, diff, spec, shin, refl) => {
    return { pos: pos, rad: rad, clr: clr, ambi: ambi, diff: diff, spec: spec, shin: shin, refl: refl };
};
const cube = (pos, size, clr, ambi, diff, spec, shin, refl, rot = 0) => {
    let rotm = cb.matr.rotator(0, cb.trig.toRad(rot), 0), irotm = cb.matr.rotator(0, -cb.trig.toRad(rot), 0);
    return { pos: pos, size: size, clr: clr, ambi: ambi, diff: diff, spec: spec, shin: shin, refl: refl, rot: rot, rotm: rotm, irotm: irotm };
};
const objs = [
    cube(cb.vect.init(0, 53, 0), 100, [255, 255, 255], 0.1, 1.0, 0.1, 1, 0.0),
    sphere(cb.vect.init(-1, -2.00, -3), 1.0, [255, 0, 0], 0.1, 0.5, 0.3, 100, 0.2),
    sphere(cb.vect.init(-1,  0.00, -3), 1.0, [0, 255, 0], 0.1, 0.5, 0.3, 100, 0.2),
    sphere(cb.vect.init(-1,  2.00, -3), 1.0, [0, 0, 255], 0.1, 0.5, 0.3, 100, 0.2),
    cube(cb.vect.init(2, 2.00, -4), 2.0, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0, 45),
    cube(cb.vect.init(2, 0.50, -4), 1.0, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0, 45),
    sphere(cb.vect.init(0.5, 2.50, -2.5), 0.5, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0),
    sphere(cb.vect.init(3.5, 2.50, -2.5), 0.5, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0),
    sphere(cb.vect.init(3.5, 2.50, -5.5), 0.5, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0),
    sphere(cb.vect.init(0.5, 2.50, -5.5), 0.5, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0)
];
const camera = {
    pos: cb.vect.init(0, 0, 1),
    dir: cb.vect.init(0, 0, -1),
    up: cb.vect.init(0, 1, 0),
    right: cb.vect.init(1, 0, 0),
    speed: 0.1, sensitivity: 0.002
};
const keys = { w: false, a: false, s: false, d: false };
let mouse = cb.vect.init(0, 0);
let isPointerLocked = false;
let isMoving = false;
let lastmovetime = 0;
let renderQuality = 1.0;

const intersection = (obj, origin, dir) => {
    if (obj.rad !== undefined) {
        let a = 1, b = 2 * cb.vect.dot(dir, cb.vect.sub(origin, obj.pos)), c = cb.vect.magsq(cb.vect.sub(origin, obj.pos)) - (obj.rad * obj.rad);
        let discriminant = cb.real.discriminant(a, b, c);
        if (discriminant > 0) {
            let x = cb.real.quadraticFormula(a, b, c);
            if (x[0] > 0 && x[1] > 0) return cb.stat.min(x);
        }
        return Infinity;
    } else if (obj.size !== undefined) {
        let localOrigin = cb.matr.mulVector(obj.irotm, cb.vect.sub(origin, obj.pos)), localDir = cb.matr.mulVector(obj.irotm, dir);
        let tmax = Infinity, tmin = -Infinity;
        for (let axis of ["x", "y", "z"]) {
            if ((localDir[axis] * cb.numb.sgn(localDir[axis])) < 1e-6) {
                if (localOrigin[axis] < -(obj.size / 2) || localOrigin[axis] > (obj.size / 2)) return Infinity;
            } else {
                let t1 = (-(obj.size / 2) - localOrigin[axis]) / localDir[axis], t2 = ((obj.size / 2) - localOrigin[axis]) / localDir[axis];
                if (t1 > t2) { let temp = t1; t1 = t2; t2 = temp; }
                tmin = cb.stat.max([tmin, t1]), tmax = cb.stat.min([tmax, t2]);
                if (tmin > tmax) return Infinity;
            }
        }
        if (tmin < 0) return (tmax < 0 ? Infinity : tmax);
        return tmin;
    }
};
const closestobj = (objs, origin, dir) => {
    let closest = null, distance = Infinity;
    for (let i = 0; i < objs.length; i++) {
        let d = intersection(objs[i], origin, dir);
        if (d && d < distance) {
            distance = d;
            closest = objs[i];
        }
    }
    if (distance < Infinity) return { closest: closest, distance: distance };
    return null;
};
const setupControls = () => {
    document.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "w") keys.w = true;
        if (e.key.toLowerCase() === "a") keys.a = true;
        if (e.key.toLowerCase() === "s") keys.s = true;
        if (e.key.toLowerCase() === "d") keys.d = true;
    });
    document.addEventListener("keyup", (e) => {
        if (e.key.toLowerCase() === "w") keys.w = false;
        if (e.key.toLowerCase() === "a") keys.a = false;
        if (e.key.toLowerCase() === "s") keys.s = false;
        if (e.key.toLowerCase() === "d") keys.d = false;
    });
    canvas.addEventListener("click", () => {
        canvas.requestPointerLock();
    });
    document.addEventListener("pointerlockchange", () => {
        isPointerLocked = document.pointerLockElement === canvas;
    });
    document.addEventListener("mousemove", (e) => {
        if (isPointerLocked) {
            mouse.x += e.movementX;
            mouse.y += e.movementY;
        }
    });
};
const updateCamera = () => {
    const now = Date.now();
    const isCurrentlyMoving = mouse.x !== 0 || mouse.y !== 0 || keys.w || keys.a || keys.s || keys.d;
    if (isCurrentlyMoving) {
        isMoving = true;
        lastmovetime = now;
        renderQuality = 0.2;
    } else if (isMoving) {
        const timestopped = now - lastmovetime;
        if (timestopped > 250) {
            isMoving = false;
            renderQuality = 1.0;
        } else {
            renderQuality = cb.numb.map(timestopped, [0, 100], [0.1, 1.0]);
        }
    }
    if (mouse.x !== 0 || mouse.y !== 0) {
        let yawrad = -mouse.x * camera.sensitivity;
        let yawrot = cb.matr.rotator(0, yawrad, 0);
        camera.dir = cb.matr.mulVector(yawrot, camera.dir);
        camera.right = cb.matr.mulVector(yawrot, camera.right);
        let pitchrad = mouse.y * camera.sensitivity;
        let pitchaxis = camera.right;
        let cos = Math.cos(pitchrad);
        let sin = Math.sin(pitchrad);
        let pitchrot = cb.matr.init(
            [
                cos + pitchaxis.x * pitchaxis.x * (1 - cos), 
                pitchaxis.x * pitchaxis.y * (1 - cos) - pitchaxis.z * sin, 
                pitchaxis.x * pitchaxis.z * (1 - cos) + pitchaxis.y * sin
            ],
            [
                pitchaxis.y * pitchaxis.x * (1 - cos) + pitchaxis.z * sin, 
                cos + pitchaxis.y * pitchaxis.y * (1 - cos), 
                pitchaxis.y * pitchaxis.z * (1 - cos) - pitchaxis.x * sin
            ],
            [
                pitchaxis.z * pitchaxis.x * (1 - cos) - pitchaxis.y * sin, 
                pitchaxis.z * pitchaxis.y * (1 - cos) + pitchaxis.x * sin, 
                cos + pitchaxis.z * pitchaxis.z * (1 - cos)
            ]
        );
        camera.dir = cb.matr.mulVector(pitchrot, camera.dir);
        mouse.x = 0;
        mouse.y = 0;
    }
    camera.dir = cb.vect.normalize(camera.dir);
    camera.right = cb.vect.normalize(cb.vect.cross(camera.dir, cb.vect.init(0, 1, 0)));
    camera.up = cb.vect.normalize(cb.vect.cross(camera.right, camera.dir));
    let moveDir = cb.vect.init(0, 0, 0);
    if (keys.w) moveDir = cb.vect.add(moveDir, camera.dir);
    if (keys.s) moveDir = cb.vect.add(moveDir, cb.vect.scl(camera.dir, -1));
    if (keys.a) moveDir = cb.vect.add(moveDir, cb.vect.scl(camera.right, -1));
    if (keys.d) moveDir = cb.vect.add(moveDir, camera.right);
    if (cb.vect.magsq(moveDir) > 0) {
        moveDir = cb.vect.normalize(moveDir);
        camera.pos = cb.vect.add(camera.pos, cb.vect.scl(moveDir, camera.speed));
    }
};
const render = () => {
    const size = cb.stat.min([window.innerWidth, window.innerHeight]);
    canvas.style.width = `${size}px`, canvas.style.height = `${size}px`, canvas.width = canvas.height = Math.floor(size * renderQuality);
    let imageData = ctx.createImageData(canvas.width, canvas.height);
    for (let x = 0; x <= canvas.width; x++) {
        for (let y = 0; y <= canvas.height; y++) {
            let origin = camera.pos, clr = [0, 0, 0], illumination = cb.vect.init(0, 0, 0);
            let dir = cb.vect.normalize(cb.vect.add(camera.dir, cb.vect.add(cb.vect.scl(camera.right, cb.numb.map(x, [0, canvas.width], [-1, 1])), cb.vect.scl(camera.up, cb.numb.map(y, [0, canvas.height], [-1, 1])))));
            let reflection = 1, i = 0;
            const maxReflections = isMoving ? 5 : 10;
            while (reflection > 0.1 && i < maxReflections) {
                i++;
                let closest = closestobj(objs, origin, dir);
                if (!closest) break;
                let obj = closest.closest;
                let intersectionpoint = cb.vect.add(origin, cb.vect.scl(dir, closest.distance));
                let pointorigin = cb.vect.normalize(cb.vect.sub(origin, intersectionpoint));
                let surfacenormal;
                if (obj.rad !== undefined) {
                    surfacenormal = cb.vect.normalize(cb.vect.sub(intersectionpoint, obj.pos));
                } else if (obj.size !== undefined) {
                    let localIntersection = cb.matr.mulVector(obj.irotm, cb.vect.sub(intersectionpoint, obj.pos)), absLocal = cb.vect.absolute(localIntersection), localNormal;
                    if (absLocal.x >= absLocal.y && absLocal.x >= absLocal.z) {
                        localNormal = cb.vect.init(cb.numb.sgn(localIntersection.x), 0, 0);
                    } else if (absLocal.y >= absLocal.x && absLocal.y >= absLocal.z) {
                        localNormal = cb.vect.init(0, cb.numb.sgn(localIntersection.y), 0);
                    } else {
                        localNormal = cb.vect.init(0, 0, cb.numb.sgn(localIntersection.z));
                    }
                    surfacenormal = cb.matr.mulVector(obj.rotm, localNormal);
                }
                let transpoint = cb.vect.add(intersectionpoint, cb.vect.scl(surfacenormal, 1e-6));
                let pointlight = cb.vect.normalize(cb.vect.sub(light.pos, transpoint));
                illumination = cb.vect.add(illumination, cb.vect.fill(obj.ambi * light.ambi, 3));
                let shadowed = closestobj(objs, transpoint, pointlight);
                if (!(shadowed && shadowed.distance < cb.vect.mag(cb.vect.sub(light.pos, transpoint)))) {
                    let diffuse = cb.numb.constrain(cb.vect.dot(pointlight, surfacenormal), [0, 1]);
                    illumination = cb.vect.add(illumination, cb.vect.fill(obj.diff * light.diff * diffuse, 3));
                    let specular = cb.numb.constrain(cb.real.pow(cb.vect.dot(cb.vect.normalize(cb.vect.add(pointlight, pointorigin)), surfacenormal), obj.shin), [0, 1]);
                    illumination = cb.vect.add(illumination, cb.vect.fill(obj.spec * light.spec * specular, 3));
                }
                illumination = cb.vect.constrain(cb.vect.scl(illumination, reflection), [0, 255]);
                clr = [clr[0] + illumination.x * obj.clr[0], clr[1] + illumination.y * obj.clr[1], clr[2] + illumination.z * obj.clr[2]];
                reflection *= obj.refl;
                origin = transpoint; 
                dir = cb.vect.reflect(dir, surfacenormal); 
            }
            clr = cb.stat.constrain(clr, [0, 255]);
            let pixels = imageData.data, px = (x + y * canvas.width) * 4;
            pixels[px + 0] = clr[0], pixels[px + 1] = clr[1], pixels[px + 2] = clr[2], pixels[px + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

const main = () => {
    alert("Controls:\n" + "- Click on canvas to enable mouse control\n" + "- WASD keys to move around\n" + "- Mouse to look around");
    setupControls();
    const drawloop = () => {
        updateCamera();
        render();
        requestAnimationFrame(drawloop);
    };
    requestAnimationFrame(drawloop);
};
main();
