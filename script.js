const cb = Chalkboard;
const ctx = document.getElementById("canvas").getContext("2d");
const camera = cb.vect.init(0, 0, 1);
const light = { pos: cb.vect.init(10, -10, 5), ambi: 0.1, diff: 1.0, spec: 1.0 };
const sphere = (pos, rad, clr, ambi, diff, spec, shin, refl) => {
    return { pos: pos, rad: rad, clr: clr, ambi: ambi, diff: diff, spec: spec, shin: shin, refl: refl };
};
const cube = (pos, size, clr, ambi, diff, spec, shin, refl, rot = 0) => {
    let rotm = cb.matr.rotator(0, cb.trig.toRad(rot), 0), irotm = cb.matr.rotator(0, -cb.trig.toRad(rot), 0);
    return { pos: pos, size: size, clr: clr, ambi: ambi, diff: diff, spec: spec, shin: shin, refl: refl, rot: rot, rotm: rotm, irotm: irotm };
};
const objs = [
    cube(cb.vect.init(0, 53, -50), 100, [255, 255, 255], 0.1, 1.0, 0.1, 1, 0.0),
    sphere(cb.vect.init(-1, -2.00, -3), 1.0, [255, 0, 0], 0.1, 0.5, 0.3, 100, 0.2),
    sphere(cb.vect.init(-1,  0.00, -3), 1.0, [0, 255, 0], 0.1, 0.5, 0.3, 100, 0.2),
    sphere(cb.vect.init(-1,  2.00, -3), 1.0, [0, 0, 255], 0.1, 0.5, 0.3, 100, 0.2),
    cube(cb.vect.init(2, 2.00, -4), 2.0, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0, 45),
    cube(cb.vect.init(2, 0.50, -4), 1.0, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0, 45),
    sphere(cb.vect.init(0.5, 2.50, -2.5), 0.5, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0)
];

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

const main = () => {
    canvas.width = canvas.height = cb.stat.min([window.innerWidth, window.innerHeight]);
    let imageData = ctx.createImageData(canvas.width, canvas.height);
    for (let x = 0; x <= canvas.width; x++) {
        for (let y = 0; y <= canvas.height; y++) {
            let origin = camera, clr = [0, 0, 0], illumination = cb.vect.init(0, 0, 0);
            let dir = cb.vect.normalize(cb.vect.sub(cb.vect.init(cb.numb.map(x, [0, canvas.width], [-1, 1]), cb.numb.map(y, [0, canvas.height], [-1, 1]), 0), origin));
            let reflection = 1, i = 0;
            while (reflection > 0.1 && i < 1000) {
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
main();
