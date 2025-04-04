const ctx = document.getElementById("canvas").getContext("2d");
if(window.innerHeight >= window.innerWidth) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerWidth;
} else if(window.innerHeight < window.innerWidth) {
    canvas.width = window.innerHeight;
    canvas.height = window.innerHeight;
}
const cb = Chalkboard;

const camera = cb.vect.init(0, 0, 1);
const light = { pos: cb.vect.init(10, -10, 10), ambi: 0.1, diff: 1.0, spec: 1.0 };
function sphere(pos, rad, clr, ambi, diff, spec, shin, refl) {
    return { pos: pos, rad: rad, clr: clr, ambi: ambi, diff: diff, spec: spec, shin: shin, refl: refl };
}
const objs = [
    sphere(cb.vect.init(0, 100, -25), 100, [255, 255, 255], 0.1, 1.0, 1.0, 100, 0.0),
    sphere(cb.vect.init(0, -2.25, -3), 1, [255, 0, 0], 0.1, 0.5, 0.3, 100, 0.2),
    sphere(cb.vect.init(0, -0.25, -3), 1, [0, 255, 0], 0.1, 0.5, 0.3, 100, 0.2),
    sphere(cb.vect.init(0,  1.75, -3), 1, [0, 0, 255], 0.1, 0.5, 0.3, 100, 0.2)
];

function intersection(obj, origin, dir) {
    let a = 1,
        b = 2 * cb.vect.dot(dir, cb.vect.sub(origin, obj.pos)),
        c = cb.vect.magsq(cb.vect.sub(origin, obj.pos)) - (obj.rad * obj.rad);
    let discriminant = cb.real.discriminant(a, b, c);
    if (discriminant > 0) {
        let x = cb.real.quadraticFormula(a, b, c);
        if (x[0] > 0 && x[1] > 0) {
            return cb.stat.min(x);
        }
    }
    return Infinity;
}
function closestobj(obj, origin, dir) {
    let closest = null;
    let distance = Infinity;
    for (let i = 0; i < obj.length; i++) {
        let distances = intersection(obj[i], origin, dir);
        if (distances && distances < distance) {
            distance = distances;
            closest = obj[i];
        }
    }
    if (distance < Infinity) {
        return { closest: closest, distance: distance };
    }
    return null;
}

let imageData = ctx.createImageData(canvas.width, canvas.height);
for (let x = 0; x <= canvas.width; x++) {
    for (let y = 0; y <= canvas.height; y++) {
        let origin = camera,
            dir = cb.vect.normalize(cb.vect.sub(cb.vect.init(cb.numb.map(x, [0, canvas.width], [-1, 1]), cb.numb.map(y, [0, canvas.height], [-1, 1]), 0), origin));
        let clr = [0, 0, 0],
            illumination = cb.vect.init(0, 0, 0);
        let i = 0,
            reflection = 1;

        while (reflection > 0.1 && i < 1000) {
            i++;
            let closest = closestobj(objs, origin, dir);
            if (!closest) {
                break;
            }
            let obj = closest.closest;

            let intersectionpoint = cb.vect.add(origin, cb.vect.scl(dir, closest.distance));
            let pointorigin = cb.vect.normalize(cb.vect.sub(origin, intersectionpoint));
            let surfacenormal = cb.vect.normalize(cb.vect.sub(intersectionpoint, obj.pos));
            let transpoint = cb.vect.add(intersectionpoint, cb.vect.scl(surfacenormal, 1e-6));
            let pointlight = cb.vect.normalize(cb.vect.sub(light.pos, transpoint));
            illumination = cb.vect.add(illumination, cb.vect.fill(obj.ambi * light.ambi, 3));
            let shadowed = closestobj(objs, transpoint, pointlight);
            if (!(shadowed && shadowed.distance < cb.vect.mag(cb.vect.sub(light.pos, transpoint)))) {
                let diffuse = cb.numb.constrain(cb.vect.dot(pointlight, surfacenormal), [0, 1]);
                illumination = cb.vect.add(illumination, cb.vect.fill(obj.diff * light.diff * diffuse, 3));
                let specular = cb.numb.constrain(
                    cb.real.pow(
                        cb.vect.dot(cb.vect.normalize(cb.vect.add(pointlight, pointorigin)), surfacenormal),
                        obj.shin
                    ),
                    [0, 1]
                );
                illumination = cb.vect.add(illumination, cb.vect.fill(obj.spec * light.spec * specular, 3));
            }
            illumination = cb.vect.scl(illumination, reflection);
            illumination = cb.vect.constrain(illumination, [0, 255]);
            clr = [
                clr[0] + illumination.x * obj.clr[0],
                clr[1] + illumination.y * obj.clr[1],
                clr[2] + illumination.z * obj.clr[2]
            ];

            reflection *= obj.refl;
            origin = transpoint; 
            dir = cb.vect.reflect(dir, surfacenormal); 
        }

        clr = cb.stat.constrain(clr, [0, 255]);
        let pixels = imageData.data,
            px = (x + y * canvas.width) * 4;
        pixels[px + 0] = clr[0];
        pixels[px + 1] = clr[1];
        pixels[px + 2] = clr[2];
        pixels[px + 3] = 255;
    }
}
ctx.putImageData(imageData, 0, 0);