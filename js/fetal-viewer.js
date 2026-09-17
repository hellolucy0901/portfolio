import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


/* =========================================================
   PETAL WIREFRAME VIEWER
========================================================= */

const mount = document.getElementById("petal-wireframe-viewer");

if (mount) {

    /* =========================================
       SCENE
    ========================================= */

    const scene = new THREE.Scene();


    /* =========================================
       CAMERA
    ========================================= */

    const camera = new THREE.PerspectiveCamera(
        32,
        mount.clientWidth / mount.clientHeight,
        0.1,
        100
    );

    camera.position.set(0, 0, 9);


    /* =========================================
       RENDERER
    ========================================= */

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
        mount.clientWidth,
        mount.clientHeight
    );

    renderer.setClearColor(0x000000, 0);

    mount.appendChild(renderer.domElement);


    /* =========================================
       ORBIT CONTROLS
    ========================================= */

    const controls = new OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enablePan = false;
    controls.enableZoom = false;

    controls.enableDamping = true;
    controls.dampingFactor = 0.07;

    controls.rotateSpeed = 0.55;

    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;

    controls.minPolarAngle = Math.PI * 0.25;
    controls.maxPolarAngle = Math.PI * 0.75;


    /* =========================================
       PETAL GROUP
    ========================================= */

    const petal = new THREE.Group();

    scene.add(petal);


    /* =========================================
       COLORS
    ========================================= */

    const COLOR_OUTLINE = 0xc6a96d;
    const COLOR_MAJOR = 0xd8d2c7;
    const COLOR_MINOR = 0x8e877d;
    const COLOR_NODE = 0xa9af73;


    /* =========================================
       PETAL SURFACE FUNCTION
    ========================================= */

    function petalPoint(u, v) {

        /*
            u
            0 = bottom
            1 = tip

            v
           -1 = left edge
            1 = right edge
        */


        /* 꽃잎 폭 */
        const width =
            1.55 *
            Math.pow(
                Math.sin(Math.PI * u),
                0.8
            ) *
            (1 - 0.16 * u);


        const x = v * width;


        /* 세로 길이 */
        const y = (u - 0.5) * 6.1;


        /* 가운데가 앞으로 볼록 */
        const volume =
            (1 - v * v) *
            0.68 *
            Math.sin(Math.PI * u);


        /* 꽃잎의 비틀림 */
        const twist =
            v *
            Math.sin(u * Math.PI * 1.7) *
            0.28;


        /* 전체적인 휨 */
        const bend =
            Math.sin(
                (u - 0.15) * Math.PI
            ) * 0.18;


        const z =
            volume +
            twist +
            bend;


        return new THREE.Vector3(
            x,
            y,
            z
        );
    }


    /* =========================================
       LINE HELPER
    ========================================= */

    function createLine(
        points,
        color,
        opacity = 1
    ) {

        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(points);


        const material =
            new THREE.LineBasicMaterial({
                color,
                transparent: true,
                opacity
            });


        const line =
            new THREE.Line(
                geometry,
                material
            );


        petal.add(line);

        return line;
    }


    /* =========================================
       POINT HELPER
    ========================================= */

    function createPoints(
        points,
        color,
        size = 0.055
    ) {

        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(points);


        const material =
            new THREE.PointsMaterial({
                color,
                size,
                transparent: true,
                opacity: 0.9,
                depthWrite: false
            });


        const particles =
            new THREE.Points(
                geometry,
                material
            );


        petal.add(particles);

        return particles;
    }


    /* =========================================
       OUTLINE
    ========================================= */

    const leftOutline = [];
    const rightOutline = [];
    const centerLine = [];


    for (let i = 0; i <= 100; i++) {

        const u = i / 100;

        leftOutline.push(
            petalPoint(u, -1)
        );

        rightOutline.push(
            petalPoint(u, 1)
        );

        centerLine.push(
            petalPoint(u, 0)
        );
    }


    createLine(
        leftOutline,
        COLOR_OUTLINE,
        1
    );

    createLine(
        rightOutline,
        COLOR_OUTLINE,
        1
    );

    createLine(
        centerLine,
        COLOR_MAJOR,
        0.95
    );


    /* =========================================
       LONGITUDINAL WIRES
    ========================================= */

    const longitudinalLines = [
        -0.85,
        -0.65,
        -0.45,
        -0.25,
        0.25,
        0.45,
        0.65,
        0.85
    ];


    longitudinalLines.forEach(
        (v, index) => {

            const points = [];


            for (
                let i = 0;
                i <= 90;
                i++
            ) {

                const u = i / 90;

                points.push(
                    petalPoint(u, v)
                );
            }


            createLine(
                points,
                index % 2 === 0
                    ? COLOR_MAJOR
                    : COLOR_MINOR,
                index % 2 === 0
                    ? 0.62
                    : 0.36
            );
        }
    );


    /* =========================================
       CROSS WIRES
    ========================================= */

    const crossSections = [
        0.08,
        0.14,
        0.21,
        0.29,
        0.38,
        0.48,
        0.58,
        0.68,
        0.78,
        0.87,
        0.94
    ];


    crossSections.forEach(
        (u, index) => {

            const points = [];


            for (
                let i = 0;
                i <= 70;
                i++
            ) {

                const v =
                    -1 +
                    (i / 70) * 2;


                points.push(
                    petalPoint(u, v)
                );
            }


            createLine(
                points,
                COLOR_MAJOR,
                index % 2 === 0
                    ? 0.34
                    : 0.20
            );
        }
    );


    /* =========================================
       DIAGONAL VEINS
    ========================================= */

    function createVein(
        startU,
        direction,
        length = 0.35
    ) {

        const points = [];


        for (
            let i = 0;
            i <= 50;
            i++
        ) {

            const t = i / 50;

            const u =
                startU +
                t * length;


            const v =
                direction *
                Math.pow(t, 0.86) *
                0.8;


            points.push(
                petalPoint(u, v)
            );
        }


        createLine(
            points,
            COLOR_MAJOR,
            0.45
        );
    }


    [
        0.16,
        0.25,
        0.34,
        0.43,
        0.52
    ].forEach((u) => {

        createVein(
            u,
            -1,
            0.31
        );

        createVein(
            u,
            1,
            0.31
        );
    });


    /* =========================================
       SMALL STRUCTURAL NODES
    ========================================= */

    const nodes = [];


    [
        0.12,
        0.22,
        0.34,
        0.48,
        0.63,
        0.78,
        0.91
    ].forEach((u) => {

        nodes.push(
            petalPoint(u, 0)
        );

    });


    [-0.55, 0.55].forEach((v) => {

        [
            0.28,
            0.48,
            0.68
        ].forEach((u) => {

            nodes.push(
                petalPoint(u, v)
            );

        });

    });


    createPoints(
        nodes,
        COLOR_NODE,
        0.065
    );


    /* =========================================
       INITIAL ROTATION
    ========================================= */

    petal.rotation.x = -0.22;
    petal.rotation.y = 0.55;
    petal.rotation.z = -0.1;

    petal.scale.set(
        0.92,
        0.92,
        0.92
    );


    /* =========================================
       USER INTERACTION
    ========================================= */

    let idleTimer;


    controls.addEventListener(
        "start",
        () => {

            controls.autoRotate = false;

            clearTimeout(
                idleTimer
            );

        }
    );


    controls.addEventListener(
        "end",
        () => {

            clearTimeout(
                idleTimer
            );


            idleTimer =
                setTimeout(() => {

                    controls.autoRotate = true;

                }, 1600);

        }
    );


    /* =========================================
       RESIZE
    ========================================= */

    function resizeViewer() {

        const width =
            mount.clientWidth;

        const height =
            mount.clientHeight;


        camera.aspect =
            width / height;


        camera.updateProjectionMatrix();


        renderer.setSize(
            width,
            height,
            false
        );
    }


    window.addEventListener(
        "resize",
        resizeViewer
    );


    /* =========================================
       ANIMATION
    ========================================= */

    const clock =
        new THREE.Clock();


    function animate() {

        requestAnimationFrame(
            animate
        );


        const time =
            clock.getElapsedTime();


        /*
            아주 작은 breathing
        */
        petal.position.y =
            Math.sin(time * 0.65) *
            0.045;


        controls.update();


        renderer.render(
            scene,
            camera
        );
    }


    resizeViewer();

    animate();
}