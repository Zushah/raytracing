const cb = Chalkboard;

const light = { pos: cb.vect.init(0, -5, 5), ambi: 0.1, diff: 1.0, spec: 1.0 };

const sphere = (pos, rad, clr, ambi, diff, spec, shin, refl, trans = 0, ior = 1.5) => {
    return { pos, rad, clr, ambi, diff, spec, shin, refl, trans, ior };
};
const prism = (pos, xlen, ylen, zlen, clr, ambi, diff, spec, shin, refl, rot = 0, trans = 0, ior = 1.5) => {
    let rotm  = cb.matr.rotator(0, cb.trig.toRad(rot), 0), irotm = cb.matr.rotator(0, -cb.trig.toRad(rot), 0);
    return { pos, xlen, ylen, zlen, clr, ambi, diff, spec, shin, refl, rot, rotm, irotm, trans, ior };
};
const cylinder = (pos, height, rad, clr, ambi, diff, spec, shin, refl, rot = 0, trans = 0, ior = 1.5) => {
    let rotm  = cb.matr.rotator(0, 0, cb.trig.toRad(rot)), irotm = cb.matr.rotator(0, 0, -cb.trig.toRad(rot));
    return { pos, height, rad, clr, ambi, diff, spec, shin, refl, rot, rotm, irotm, trans, ior };
};
const pyramid = (pos, width, height, clr, ambi, diff, spec, shin, refl, rot = 0, trans = 0, ior = 1.5) => {
    let rotm  = cb.matr.rotator(0, cb.trig.toRad(rot), 0), irotm = cb.matr.rotator(0, -cb.trig.toRad(rot), 0);
    return { pos, width, height, clr, ambi, diff, spec, shin, refl, rot, rotm, irotm, trans, ior };
};

const objs = [
    prism(cb.vect.init(0, 3.5, 0), 100, 1, 100, [255, 255, 255], 0, 1.0, 0, 0, 0),
    prism(cb.vect.init(0, -2, -10), 10, 10, 0.1, [255, 0, 0], 0.1, 0.5, 0.3, 100, 0.2),
    prism(cb.vect.init(5.05, -2, -4.95), 0.1, 10, 10, [0, 255, 0], 0.1, 0.5, 0.3, 100, 0.2),
    prism(cb.vect.init(-5.05, -2, -4.95), 0.1, 10, 10, [0, 0, 255], 0.1, 0.5, 0.3, 100, 0.2),
    cylinder(cb.vect.init(0, -5, -5), 10, 0.5, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0, 90),
    cylinder(cb.vect.init(0, -2.5, -7.5), 10, 0.5, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0, 90),
    cylinder(cb.vect.init(0, -2.5, -2.5), 10, 0.5, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0, 90),
    cylinder(cb.vect.init(0, 0, -5), 10, 0.5, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0, 90),
    prism(cb.vect.init(15, 0.5, 5), 5, 5, 5, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0),
    sphere(cb.vect.init(15, -5, 5), 3, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0),
    cylinder(cb.vect.init(15, -10, 5), 5, 2, [255, 255, 255], 0.1, 0.1, 1.0, 1000, 1.0, 90),
    pyramid(cb.vect.init(0, -2, 20), 10, 10, [255, 255, 0], 1.0, 0.3, 0.5, 1000, 0.5, 45),
    pyramid(cb.vect.init(1, -1, 21), 8, 8, [255, 255, 0], 1.0, 0.3, 0.5, 1000, 0.5, 45),
    pyramid(cb.vect.init(1, -1, 19), 8, 8, [255, 255, 0], 1.0, 0.3, 0.5, 1000, 0.5, 45),
    pyramid(cb.vect.init(-1, -1, 19), 8, 8, [255, 255, 0], 1.0, 0.3, 0.5, 1000, 0.5, 45),
    pyramid(cb.vect.init(-1, -1, 21), 8, 8, [255, 255, 0], 1.0, 0.3, 0.5, 1000, 0.5, 45),
    pyramid(cb.vect.init(0, -2, 20), 10, 10, [255, 255, 0], 1.0, 0.3, 0.5, 1000, 0.5),
    sphere(cb.vect.init(cb.numb.random(-10, -20), cb.numb.random(0, -10), cb.numb.random(-5, 15)), cb.numb.random(1, 3), cb.stat.random(3, 0, 255), 0.1, 0.5, 0.3, 100, 0.2),
    sphere(cb.vect.init(cb.numb.random(-10, -20), cb.numb.random(0, -10), cb.numb.random(-5, 15)), cb.numb.random(1, 3), cb.stat.random(3, 0, 255), 0.1, 0.5, 0.3, 100, 0.2),
    sphere(cb.vect.init(cb.numb.random(-10, -20), cb.numb.random(0, -10), cb.numb.random(-5, 15)), cb.numb.random(1, 3), cb.stat.random(3, 0, 255), 0.1, 0.5, 0.3, 100, 0.2),
    sphere(cb.vect.init(cb.numb.random(-10, -20), cb.numb.random(0, -10), cb.numb.random(-5, 15)), cb.numb.random(1, 3), cb.stat.random(3, 0, 255), 0.1, 0.5, 0.3, 100, 0.2),
    sphere(cb.vect.init(cb.numb.random(-10, -20), cb.numb.random(0, -10), cb.numb.random(-5, 15)), cb.numb.random(1, 3), cb.stat.random(3, 0, 255), 0.1, 0.5, 0.3, 100, 0.2),
    sphere(cb.vect.init(cb.numb.random(-10, -20), cb.numb.random(0, -10), cb.numb.random(-5, 15)), cb.numb.random(1, 3), cb.stat.random(3, 0, 255), 0.1, 0.5, 0.3, 100, 0.2),
    sphere(cb.vect.init(cb.numb.random(-10, -20), cb.numb.random(0, -10), cb.numb.random(-5, 15)), cb.numb.random(1, 3), cb.stat.random(3, 0, 255), 0.1, 0.5, 0.3, 100, 0.2),
    sphere(cb.vect.init(cb.numb.random(-10, -20), cb.numb.random(0, -10), cb.numb.random(-5, 15)), cb.numb.random(1, 3), cb.stat.random(3, 0, 255), 0.1, 0.5, 0.3, 100, 0.2),
    sphere(cb.vect.init(cb.numb.random(-10, -20), cb.numb.random(0, -10), cb.numb.random(-5, 15)), cb.numb.random(1, 3), cb.stat.random(3, 0, 255), 0.1, 0.5, 0.3, 100, 0.2),
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

let gl, program, uniformLocations = {};

const main = () => {
    alert("Controls:\n" + "- Click on canvas to enable movement\n" + "- WASD keys to move around\n" + "- Mouse to look around");
    
    const canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl");
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }
    
    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    
    gl.shaderSource(vs, vertexShader);
    gl.shaderSource(fs, fragmentShader);
    
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.error("Vertex shader error:", gl.getShaderInfoLog(vs));
        alert("Vertex shader compilation failed. See console for details.");
        return;
    }
    
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error("Fragment shader error:", gl.getShaderInfoLog(fs));
        alert("Fragment shader compilation failed. See console for details.");
        return;
    }
    
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        alert("Shader program linking failed. See console for details.");
        return;
    }
    
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
        gl.ARRAY_BUFFER, 
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), 
        gl.STATIC_DRAW
    );
    
    const posAttrib = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
    
    const getUniform = name => gl.getUniformLocation(program, name);
    uniformLocations = {
        uCameraPos: getUniform("uCameraPos"),
        uCameraDir: getUniform("uCameraDir"),
        uCameraUp: getUniform("uCameraUp"),
        uCameraRight: getUniform("uCameraRight"),
        uLightPos: getUniform("uLightPos"),
        uLightAmbi: getUniform("uLightAmbi"),
        uLightDiff: getUniform("uLightDiff"),
        uLightSpec: getUniform("uLightSpec"),
        uSphereCount: getUniform("uSphereCount"),
        uPrismCount: getUniform("uPrismCount"),
        uCylinderCount: getUniform("uCylinderCount"),
        uPyramidCount: getUniform("uPyramidCount")
    };
    
    const cacheArrayUniforms = (baseName, count) => {
        for (let i = 0; i < count; i++) {
            uniformLocations[`${baseName}${i}`] = getUniform(`${baseName}[${i}]`);
        }
    };
    
    ["uSpherePos","uSphereRad","uSphereColor","uSphereAmbi", "uSphereDiff","uSphereSpec","uSphereShin","uSphereRefl"].forEach((name) => cacheArrayUniforms(name, 10));
    ["uPrismPos","uPrismXLen","uPrismYLen","uPrismZLen","uPrismColor","uPrismAmbi","uPrismDiff", "uPrismSpec","uPrismShin","uPrismRefl","uPrismRotM","uPrismIRotM"].forEach((name) => cacheArrayUniforms(name, 5));
    ["uCylPos","uCylHeight","uCylRad","uCylColor","uCylAmbi", "uCylDiff","uCylSpec","uCylShin","uCylRefl","uCylRotM","uCylIRotM"].forEach((name) => cacheArrayUniforms(name, 5));
    ["uPyramidPos","uPyramidWidth","uPyramidHeight","uPyramidColor","uPyramidAmbi", "uPyramidDiff","uPyramidSpec","uPyramidShin","uPyramidRefl","uPyramidRotM","uPyramidIRotM"].forEach((name) => cacheArrayUniforms(name, 6));

    setupControls();

    requestAnimationFrame(drawloop);
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
    
    const canvas = document.getElementById("canvas");
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
    if (mouse.x !== 0 || mouse.y !== 0) {
        let yawrad = -mouse.x * camera.sensitivity;
        let yawrot = cb.matr.rotator(0, yawrad, 0);
        camera.dir = cb.matr.mulVector(yawrot, camera.dir);
        camera.right = cb.matr.mulVector(yawrot, camera.right);
        
        let pitchrad = mouse.y * camera.sensitivity;
        let pitchaxis = camera.right;
        let cos = cb.trig.cos(pitchrad);
        let sin = cb.trig.sin(pitchrad);
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

const drawloop = () => {
    updateCamera();
    const canvas = document.getElementById("canvas");
    const size = cb.stat.min([window.innerWidth, window.innerHeight]);
    canvas.width = canvas.height = size;
    canvas.style.width = canvas.style.height = `${size}px`;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform3fv(uniformLocations.uCameraPos, cb.vect.toTypedArray(camera.pos));
    gl.uniform3fv(uniformLocations.uCameraDir, cb.vect.toTypedArray(camera.dir));
    gl.uniform3fv(uniformLocations.uCameraUp, cb.vect.toTypedArray(camera.up));
    gl.uniform3fv(uniformLocations.uCameraRight, cb.vect.toTypedArray(camera.right));
    gl.uniform3fv(uniformLocations.uLightPos, cb.vect.toTypedArray(light.pos));
    gl.uniform1f(uniformLocations.uLightAmbi, light.ambi);
    gl.uniform1f(uniformLocations.uLightDiff, light.diff);
    gl.uniform1f(uniformLocations.uLightSpec, light.spec);

    let sphereCount = 0, prismCount = 0, cylinderCount = 0, pyramidCount = 0;
    objs.forEach((obj) => {
        if (obj.rad !== undefined && obj.height === undefined && sphereCount < 10) {
            gl.uniform3fv(uniformLocations[`uSpherePos${sphereCount}`], cb.vect.toTypedArray(obj.pos));
            gl.uniform1f(uniformLocations[`uSphereRad${sphereCount}`], obj.rad);
            gl.uniform3f(uniformLocations[`uSphereColor${sphereCount}`], obj.clr[0], obj.clr[1], obj.clr[2]);
            gl.uniform1f(uniformLocations[`uSphereAmbi${sphereCount}`], obj.ambi);
            gl.uniform1f(uniformLocations[`uSphereDiff${sphereCount}`], obj.diff);
            gl.uniform1f(uniformLocations[`uSphereSpec${sphereCount}`], obj.spec);
            gl.uniform1f(uniformLocations[`uSphereShin${sphereCount}`], obj.shin);
            gl.uniform1f(uniformLocations[`uSphereRefl${sphereCount}`], obj.refl);
            sphereCount++;
        } else if (obj.xlen !== undefined && prismCount < 5) {
            gl.uniform3fv(uniformLocations[`uPrismPos${prismCount}`], cb.vect.toTypedArray(obj.pos));
            gl.uniform1f(uniformLocations[`uPrismXLen${prismCount}`], obj.xlen);
            gl.uniform1f(uniformLocations[`uPrismYLen${prismCount}`], obj.ylen);
            gl.uniform1f(uniformLocations[`uPrismZLen${prismCount}`], obj.zlen);
            gl.uniform3f(uniformLocations[`uPrismColor${prismCount}`], obj.clr[0], obj.clr[1], obj.clr[2]);
            gl.uniform1f(uniformLocations[`uPrismAmbi${prismCount}`], obj.ambi);
            gl.uniform1f(uniformLocations[`uPrismDiff${prismCount}`], obj.diff);
            gl.uniform1f(uniformLocations[`uPrismSpec${prismCount}`], obj.spec);
            gl.uniform1f(uniformLocations[`uPrismShin${prismCount}`], obj.shin);
            gl.uniform1f(uniformLocations[`uPrismRefl${prismCount}`], obj.refl);
            gl.uniformMatrix3fv(uniformLocations[`uPrismRotM${prismCount}`], false, cb.matr.toTypedArray(obj.rotm));
            gl.uniformMatrix3fv(uniformLocations[`uPrismIRotM${prismCount}`], false, cb.matr.toTypedArray(obj.irotm));
            prismCount++;
        } else if (obj.height !== undefined && obj.rad !== undefined && cylinderCount < 5) {
            gl.uniform3fv(uniformLocations[`uCylPos${cylinderCount}`], cb.vect.toTypedArray(obj.pos));
            gl.uniform1f(uniformLocations[`uCylHeight${cylinderCount}`], obj.height);
            gl.uniform1f(uniformLocations[`uCylRad${cylinderCount}`], obj.rad);
            gl.uniform3f(uniformLocations[`uCylColor${cylinderCount}`], obj.clr[0], obj.clr[1], obj.clr[2]);
            gl.uniform1f(uniformLocations[`uCylAmbi${cylinderCount}`], obj.ambi);
            gl.uniform1f(uniformLocations[`uCylDiff${cylinderCount}`], obj.diff);
            gl.uniform1f(uniformLocations[`uCylSpec${cylinderCount}`], obj.spec);
            gl.uniform1f(uniformLocations[`uCylShin${cylinderCount}`], obj.shin);
            gl.uniform1f(uniformLocations[`uCylRefl${cylinderCount}`], obj.refl);
            gl.uniformMatrix3fv(uniformLocations[`uCylRotM${cylinderCount}`], false, cb.matr.toTypedArray(obj.rotm));
            gl.uniformMatrix3fv(uniformLocations[`uCylIRotM${cylinderCount}`], false, cb.matr.toTypedArray(obj.irotm));
            cylinderCount++;
        } else if (obj.width !== undefined && obj.height !== undefined && !obj.rad && pyramidCount < 6) {
            gl.uniform3fv(uniformLocations[`uPyramidPos${pyramidCount}`], cb.vect.toTypedArray(obj.pos));
            gl.uniform1f(uniformLocations[`uPyramidWidth${pyramidCount}`], obj.width);
            gl.uniform1f(uniformLocations[`uPyramidHeight${pyramidCount}`], obj.height);
            gl.uniform3f(uniformLocations[`uPyramidColor${pyramidCount}`], obj.clr[0], obj.clr[1], obj.clr[2]);
            gl.uniform1f(uniformLocations[`uPyramidAmbi${pyramidCount}`], obj.ambi);
            gl.uniform1f(uniformLocations[`uPyramidDiff${pyramidCount}`], obj.diff);
            gl.uniform1f(uniformLocations[`uPyramidSpec${pyramidCount}`], obj.spec);
            gl.uniform1f(uniformLocations[`uPyramidShin${pyramidCount}`], obj.shin);
            gl.uniform1f(uniformLocations[`uPyramidRefl${pyramidCount}`], obj.refl);
            gl.uniformMatrix3fv(uniformLocations[`uPyramidRotM${pyramidCount}`], false, cb.matr.toTypedArray(obj.rotm));
            gl.uniformMatrix3fv(uniformLocations[`uPyramidIRotM${pyramidCount}`], false, cb.matr.toTypedArray(obj.irotm));
            pyramidCount++;
        }
    });

    gl.uniform1i(uniformLocations.uSphereCount, sphereCount);
    gl.uniform1i(uniformLocations.uPrismCount, prismCount);
    gl.uniform1i(uniformLocations.uCylinderCount, cylinderCount);
    gl.uniform1i(uniformLocations.uPyramidCount, pyramidCount);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(drawloop);
};

main();
