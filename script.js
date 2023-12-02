const ctx = document.getElementById("canvas").getContext("2d");
if(window.innerHeight >= window.innerWidth) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerWidth;
} else if(window.innerHeight < window.innerWidth) {
    canvas.width = window.innerHeight;
    canvas.height = window.innerHeight;
}
const cb = Chalkboard;

const camera = cb.vec3.new(0, 0, 1);
const light = { pos: cb.vec3.new(10, -10, 10), ambi: 0.1, diff: 0.5, spec: 1 };
function sphere(c, r, clr, ambi, diff, spec, shin) {
    return { c: c, r: r, clr: clr, ambi: ambi, diff: diff, spec: spec, shin: shin };
}
const objs = [
    sphere(cb.vec3.new(0, 100, -25), 100, color(255, 255, 255), 0.1, 1, 1, 10),
    sphere(cb.vec3.new(0, -2.25, -3), 1, color(255, 0, 0), 0.1, 1, 1, 100),
    sphere(cb.vec3.new(0, -0.25, -3), 1, color(0, 255, 0), 0.1, 1, 1, 100),
    sphere(cb.vec3.new(0, 1.75, -3) , 1, color(0, 0, 255), 0.1, 1, 1, 100)
];
function color(r, g, b) {
    return r << 16 | g << 8 | b;
}
function intersection(sphere, origin, direction) {
    let a = 1,
        b = cb.vec3.dot(direction, cb.vec3.sub(origin, sphere.c)) * 2,
        c = cb.vec3.magsq(cb.vec3.sub(origin, sphere.c)) - (sphere.r * sphere.r);
    if(cb.real.discriminant(a, b, c) > 0) {
        let x = cb.real.quadraticFormula(a, b, c);
        if(x[0] > 0 && x[1] > 0) {
            return cb.stat.min(x);
        }
    } else {
        return Infinity;
    }
}
function closestobj(obj, origin, direction) {
    let closest = null;
    let mindistance = Infinity;
    for(let i = 0; i < obj.length; i++) {
        const distance = intersection(obj[i], origin, direction);
        if(distance && distance < mindistance) {
            mindistance = distance;
            closest = obj[i];
        }
    }
    return { closest: closest, mindistance: mindistance };
}
function illumination(obj, light, intersection, origin) {
    const surfacenormal = cb.vec3.normalize(cb.vec3.sub(intersection, obj.c));
    const pointshift = cb.vec3.add(intersection, cb.vec3.scl(surfacenormal, 1e-5));
    const lightintersection = cb.vec3.normalize(cb.vec3.sub(light.pos, pointshift));
    const m = closestobj(objs, pointshift, lightintersection);
    const pointlightdist = cb.vec3.mag(cb.vec3.sub(light.pos, pointshift));
    const withinshadow = pointlightdist > m.mindistance;
    if(withinshadow) {
        return [0, 0, 0];
    } else {
        let blinnphong = (obj.ambi * light.ambi) + (obj.diff * light.diff * cb.vec3.dot(lightintersection, surfacenormal)) + (Math.pow(obj.spec * light.spec * cb.vec3.dot(surfacenormal, cb.vec3.normalize(cb.vec3.add(lightintersection, cb.vec3.normalize(cb.vec3.sub(origin, intersection))))), obj.shin / 4));
        blinnphong = Math.min(Math.max(blinnphong, 0), 1);
        return [(obj.clr >> 16 & 0xff) * blinnphong, (obj.clr >> 8 & 0xff) * blinnphong, (obj.clr & 0xff) * blinnphong];
    }
}
function render(x, y) {
    const dir = cb.vec3.normalize(cb.vec3.sub(cb.vec3.new(x, y, 0), camera));
    const n = closestobj(objs, camera, dir);
    if(n.mindistance < Infinity) {
        return illumination(n.closest, light, cb.vec3.add(cb.vec3.scl(dir, n.mindistance), camera), camera);
    } else {
        return [0, 0, 0];
    }
}

let imageData = ctx.createImageData(canvas.width, canvas.height),
    pixels = imageData.data;
for(let x = 0; x <= canvas.width; x++) {
    for(let y = 0; y <= canvas.height; y++) {
        let renderclr = render(cb.numb.map(x, [0, canvas.width], [-1, 1]), cb.numb.map(y, [0, canvas.height], [-1, 1]));
        let px = (x + y * canvas.width) * 4;
        pixels[px + 0] = renderclr[0];
        pixels[px + 1] = renderclr[1];
        pixels[px + 2] = renderclr[2];
        pixels[px + 3] = 255;
    }
}
ctx.putImageData(imageData, 0, 0);