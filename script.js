const cb = Chalkboard;

const light = { pos: cb.vect.init(10, -10, 5), ambi: 0.1, diff: 1.0, spec: 1.0 };
const sphere = (pos, rad, clr, ambi, diff, spec, shin, refl, trans = 0, ior = 1.5) => {
    return { pos: pos, rad: rad, clr: clr, ambi: ambi, diff: diff, spec: spec, shin: shin, refl: refl, trans: trans, ior: ior };
};
const cube = (pos, size, clr, ambi, diff, spec, shin, refl, rot = 0, trans = 0, ior = 1.5) => {
    let rotm = cb.matr.rotator(0, cb.trig.toRad(rot), 0), irotm = cb.matr.rotator(0, -cb.trig.toRad(rot), 0);
    return { pos: pos, size: size, clr: clr, ambi: ambi, diff: diff, spec: spec, shin: shin, refl: refl, rot: rot, rotm: rotm, irotm: irotm, trans: trans, ior: ior };
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

let gl, program, uniformLocations = {};

const main = () => {
    alert("Controls:\n" + 
          "- Click on canvas to enable movement\n" + 
          "- WASD keys to move around\n" + 
          "- Mouse to look around");
    
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
        uCubeCount: getUniform("uCubeCount")
    };
    
    const cacheArrayUniforms = (baseName, count) => {
        for (let i = 0; i < count; i++) {
            uniformLocations[`${baseName}${i}`] = getUniform(`${baseName}[${i}]`);
        }
    };
    
    ['uSpherePos', 'uSphereRad', 'uSphereColor', 'uSphereAmbi', 
     'uSphereDiff', 'uSphereSpec', 'uSphereShin', 'uSphereRefl'].forEach(name => {
        cacheArrayUniforms(name, 10);
    });
    
    ['uCubePos', 'uCubeSize', 'uCubeColor', 'uCubeAmbi', 'uCubeDiff',
     'uCubeSpec', 'uCubeShin', 'uCubeRefl', 'uCubeRotM', 'uCubeIRotM'].forEach(name => {
        cacheArrayUniforms(name, 10);
    });
    
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
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.width = canvas.height = size;
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.uniform3fv(uniformLocations.uCameraPos, cb.vect.toTypedArray(camera.pos));
    gl.uniform3fv(uniformLocations.uCameraDir, cb.vect.toTypedArray(camera.dir));
    gl.uniform3fv(uniformLocations.uCameraUp, cb.vect.toTypedArray(camera.up));
    gl.uniform3fv(uniformLocations.uCameraRight, cb.vect.toTypedArray(camera.right));
    
    gl.uniform3fv(uniformLocations.uLightPos, cb.vect.toTypedArray(light.pos));
    gl.uniform1f(uniformLocations.uLightAmbi, light.ambi);
    gl.uniform1f(uniformLocations.uLightDiff, light.diff);
    gl.uniform1f(uniformLocations.uLightSpec, light.spec);
    
    let sphereCount = 0;
    let cubeCount = 0;
    
    objs.forEach(obj => {
        if (obj.rad !== undefined && sphereCount < 10) {
            gl.uniform3fv(uniformLocations[`uSpherePos${sphereCount}`], cb.vect.toTypedArray(obj.pos));
            gl.uniform1f(uniformLocations[`uSphereRad${sphereCount}`], obj.rad);
            gl.uniform3f(uniformLocations[`uSphereColor${sphereCount}`], obj.clr[0], obj.clr[1], obj.clr[2]);
            gl.uniform1f(uniformLocations[`uSphereAmbi${sphereCount}`], obj.ambi);
            gl.uniform1f(uniformLocations[`uSphereDiff${sphereCount}`], obj.diff);
            gl.uniform1f(uniformLocations[`uSphereSpec${sphereCount}`], obj.spec);
            gl.uniform1f(uniformLocations[`uSphereShin${sphereCount}`], obj.shin);
            gl.uniform1f(uniformLocations[`uSphereRefl${sphereCount}`], obj.refl);
            sphereCount++;
        } 
        else if (obj.size !== undefined && cubeCount < 10) {
            gl.uniform3fv(uniformLocations[`uCubePos${cubeCount}`], cb.vect.toTypedArray(obj.pos));
            gl.uniform1f(uniformLocations[`uCubeSize${cubeCount}`], obj.size);
            gl.uniform3f(uniformLocations[`uCubeColor${cubeCount}`], obj.clr[0], obj.clr[1], obj.clr[2]);
            gl.uniform1f(uniformLocations[`uCubeAmbi${cubeCount}`], obj.ambi);
            gl.uniform1f(uniformLocations[`uCubeDiff${cubeCount}`], obj.diff);
            gl.uniform1f(uniformLocations[`uCubeSpec${cubeCount}`], obj.spec);
            gl.uniform1f(uniformLocations[`uCubeShin${cubeCount}`], obj.shin);
            gl.uniform1f(uniformLocations[`uCubeRefl${cubeCount}`], obj.refl);
            gl.uniformMatrix3fv(uniformLocations[`uCubeRotM${cubeCount}`], false, cb.matr.toTypedArray(obj.rotm));
            gl.uniformMatrix3fv(uniformLocations[`uCubeIRotM${cubeCount}`], false, cb.matr.toTypedArray(obj.irotm));
            cubeCount++;
        }
    });
    
    gl.uniform1i(uniformLocations.uSphereCount, sphereCount);
    gl.uniform1i(uniformLocations.uCubeCount, cubeCount);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    requestAnimationFrame(drawloop);
};

main();
