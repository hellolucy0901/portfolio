import * as THREE from "three";

import {
    RoomEnvironment
} from "three/addons/environments/RoomEnvironment.js";

import {
    mergeVertices
} from "three/addons/utils/BufferGeometryUtils.js";


/* =========================================================
   GSAP
========================================================= */

const gsap =
    window.gsap;

const ScrollTrigger =
    window.ScrollTrigger;


gsap.registerPlugin(
    ScrollTrigger
);


/* =========================================================
   1. THREE.JS BASIC SETUP
========================================================= */

const canvas =
    document.querySelector("#webgl");


const scene =
    new THREE.Scene();


const camera =
    new THREE.PerspectiveCamera(
        32,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );


camera.position.set(
    0,
    0.05,
    8.6
);


const renderer =
    new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        1.75
    )
);


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure =
    1.08;


renderer.shadowMap.enabled =
    true;


renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


/* =========================================================
   2. ENVIRONMENT
========================================================= */

const pmremGenerator =
    new THREE.PMREMGenerator(
        renderer
    );


const roomEnvironment =
    new RoomEnvironment();


const envTexture =
    pmremGenerator
        .fromScene(
            roomEnvironment
        )
        .texture;


scene.environment =
    envTexture;


roomEnvironment.dispose();

pmremGenerator.dispose();


/* =========================================================
   3. LIGHTING
========================================================= */

/*
  우측 상단의 메인 하이라이트
*/

const rimLight =
    new THREE.DirectionalLight(
        0xffffff,
        2.4
    );


rimLight.position.set(
    4,
    4.5,
    5
);


scene.add(
    rimLight
);


/*
  좌측에서 들어오는 차가운 보조광
*/

const coolLight =
    new THREE.DirectionalLight(
        0xc9d5df,
        1.25
    );


coolLight.position.set(
    -4,
    0.5,
    3
);


scene.add(
    coolLight
);


/*
  하단에 아주 약한 반사광

  바닥은 제거했지만
  오브젝트 하단이 완전히 묻히지 않도록
  약하게 유지
*/

const lowerLight =
    new THREE.PointLight(
        0xffffff,
        8,
        7,
        2
    );


lowerLight.position.set(
    2.2,
    -1.4,
    2.8
);


scene.add(
    lowerLight
);


/* =========================================================
   4. OBJECT RIG STRUCTURE

   rig
      ↓
   floatRig
      ↓
   blob

   rig
   = 화면 위치 / 전체 구조

   floatRig
   = ScrollTrigger 회전

   blob
   = hover + drag + idle rotation
========================================================= */

const rig =
    new THREE.Group();


const floatRig =
    new THREE.Group();


scene.add(
    rig
);


rig.add(
    floatRig
);


/* =========================================================
   5. GEOMETRY
========================================================= */

const isMobile =
    window.matchMedia(
        "(max-width: 720px)"
    ).matches;


const widthSegments =
    isMobile
        ? 72
        : 112;


const heightSegments =
    isMobile
        ? 54
        : 84;


const geometry =
    new THREE.SphereGeometry(
        1.46,
        widthSegments,
        heightSegments
    );


/*
  완벽한 구가 아니라
  살짝 길쭉하고 유기적인 Egg 형태
*/

geometry.scale(
    1,
    1.075,
    0.95
);


geometry.computeVertexNormals();


const position =
    geometry.attributes.position;


const vertexCount =
    position.count;


/*
  원래 형태 저장
*/

const basePositions =
    new Float32Array(
        position.array
    );


/*
  Scroll 후 구조화될 형태
*/

const structuredPositions =
    new Float32Array(
        position.array.length
    );


/*
  Vertex별 미세한 움직임의
  phase를 다르게 하기 위한 값
*/

const randomPhase =
    new Float32Array(
        vertexCount
    );


const temp =
    new THREE.Vector3();


/* =========================================================
   6. STRUCTURED TARGET

   Organic Sphere
        ↓
   Geometric Form

   Scroll 시 사용
========================================================= */

for (
    let i = 0;
    i < vertexCount;
    i++
) {

    const i3 =
        i * 3;


    const x =
        basePositions[i3];


    const y =
        basePositions[i3 + 1];


    const z =
        basePositions[i3 + 2];


    temp
        .set(
            x,
            y / 1.075,
            z / 0.95
        )
        .normalize();


    const maxAxis =
        Math.max(
            Math.abs(temp.x),
            Math.abs(temp.y),
            Math.abs(temp.z),
            0.0001
        );


    /*
      Sphere 방향을 Cube Surface로 projection
    */

    const cubeX =
        (
            temp.x /
            maxAxis
        ) *
        1.18;


    const cubeY =
        (
            temp.y /
            maxAxis
        ) *
        0.94;


    const cubeZ =
        (
            temp.z /
            maxAxis
        ) *
        1.03;


    structuredPositions[i3] =
        cubeX;


    structuredPositions[i3 + 1] =
        cubeY;


    structuredPositions[i3 + 2] =
        cubeZ;


    randomPhase[i] =
        Math.random() *
        Math.PI *
        2;

}


/* =========================================================
   7. MATERIAL

   Black
   Liquid
   Resin
   Glossy membrane
========================================================= */

const material =
    new THREE.MeshPhysicalMaterial({

        color:
            new THREE.Color(
                "#020202"
            ),

        metalness:
            0.12,

        roughness:
            0.115,

        clearcoat:
            1,

        clearcoatRoughness:
            0.065,

        ior:
            1.46,

        reflectivity:
            1,

        envMapIntensity:
            2,

        specularIntensity:
            1,

        specularColor:
            new THREE.Color(
                "#ffffff"
            )

    });


const blob =
    new THREE.Mesh(
        geometry,
        material
    );


blob.castShadow =
    true;


blob.receiveShadow =
    false;


floatRig.add(
    blob
);

const deformState = {
    /*
      기존 큰 형태 변화
      너무 강하지 않게 유지
    */
    macroAmount: 0.10,

    /*
      기존 표면 질감 그대로
    */
    microAmount: 0.022,
    microFrequency: 4.2,

    breath: 1.0,
    energy: 0,

    sphereMorph: 0,
    smoothness: 0,

    /*
      새로 추가
  
      내부에서 특정 지점을
      밀어내는 힘
    */
    pressureAmount: 0.28,

    /*
      압력점 이동 속도
    */
    pressureSpeed: 1
};

/* =========================================================
   9. POINTER STATE

   Hover
   Surface Pressure
   Tilt
========================================================= */

const pointer = {

    ndc:
        new THREE.Vector2(
            9,
            9
        ),


    /*
      현재 부드럽게 따라가는 위치
    */
    localPoint:
        new THREE.Vector3(
            0,
            0,
            2
        ),


    /*
      실제 raycast hit 위치
    */
    targetLocalPoint:
        new THREE.Vector3(
            0,
            0,
            2
        ),


    /*
      Hover surface deformation strength
    */
    strength:
        0,


    targetStrength:
        0,


    /*
      Hover tilt
    */
    tiltX:
        0,

    tiltY:
        0,


    targetTiltX:
        0,

    targetTiltY:
        0

};


const raycaster =
    new THREE.Raycaster();


/* =========================================================
   10. DRAG ROTATION STATE

   Mouse Down
       ↓
   Drag
       ↓
   Object Rotation
       ↓
   Mouse Up
       ↓
   Inertia
========================================================= */

const drag = {

    isDragging:
        false,


    lastX:
        0,

    lastY:
        0,


    /*
      사용자가 직접 만든 회전값
    */

    rotationX:
        0,

    rotationY:
        0,


    /*
      Mouse Up 이후 관성
    */

    velocityX:
        0,

    velocityY:
        0,


    /*
      회전 감도
  
      낮을수록 묵직함
    */

    sensitivity:
        0.0045,


    /*
      관성 감쇠
  
      높을수록 오래 회전
    */

    damping:
        0.95

};


/* =========================================================
   11. RESPONSIVE OBJECT POSITION
========================================================= */

function setBlobLayout() {

    const width =
        window.innerWidth;


    /* =========================
       MOBILE
    ========================= */

    if (
        width <= 720
    ) {

        rig.position.set(
            0.1,
            1.65,
            0
        );


        rig.scale.setScalar(
            0.68
        );

    }


    /* =========================
       TABLET
    ========================= */

    else if (
        width <= 1100
    ) {

        rig.position.set(
            1.6,
            0.9,
            0
        );


        rig.scale.setScalar(
            0.88
        );

    }


    /* =========================
       DESKTOP / 1920
    ========================= */

    else {

        rig.position.set(
            2.25,

            /*
              바닥 제거 후
              아주 조금 아래로 이동
            */

            -0.12,

            0
        );


        rig.scale.setScalar(
            1.12
        );

    }

}


setBlobLayout();


/* =========================================================
   12. POINTER → OBJECT INTERACTION
========================================================= */

function updatePointer(
    event
) {

    /* =========================
       SCREEN →
       NORMALIZED DEVICE COORDINATE
    ========================= */

    pointer.ndc.x =

        (
            event.clientX /
            window.innerWidth
        )

        *

        2

        -

        1;


    pointer.ndc.y =

        -(

            event.clientY /
            window.innerHeight

        )

        *

        2

        +

        1;


    /* =========================
       POINTER TILT
    ========================= */

    pointer.targetTiltY =

        THREE.MathUtils.clamp(
            pointer.ndc.x,
            -1,
            1
        )

        *

        0.085;


    pointer.targetTiltX =

        THREE.MathUtils.clamp(
            -pointer.ndc.y,
            -1,
            1
        )

        *

        0.055;


    /* =========================
       RAYCAST
    ========================= */

    raycaster.setFromCamera(
        pointer.ndc,
        camera
    );


    const hit =
        raycaster.intersectObject(
            blob,
            false
        )[0];


    /* =========================
       POINTER IS ON BLOB
    ========================= */

    if (
        hit
    ) {

        /*
          World position →
          Blob local position
        */

        const localHit =
            blob.worldToLocal(
                hit.point.clone()
            );


        pointer
            .targetLocalPoint
            .copy(
                localHit
            );


        pointer.targetStrength =
            1;

    }


    /* =========================
       POINTER OUTSIDE BLOB
    ========================= */

    else {

        pointer.targetStrength =
            0;

    }

}


/*
  기존 Hover 기능 유지
*/

window.addEventListener(
    "pointermove",
    updatePointer,
    {
        passive: true
    }
);


/*
  브라우저 밖으로 나가면
  Hover 효과 복귀
*/

window.addEventListener(
    "pointerleave",
    () => {

        pointer.targetStrength =
            0;


        pointer.targetTiltX =
            0;


        pointer.targetTiltY =
            0;

    }
);


/* =========================================================
   13. DRAG START

   실제 Object를 클릭한 경우에만 시작
========================================================= */

canvas.addEventListener(
    "pointerdown",
    (
        event
    ) => {

        pointer.ndc.x =

            (
                event.clientX /
                window.innerWidth
            )

            *

            2

            -

            1;


        pointer.ndc.y =

            -(

                event.clientY /
                window.innerHeight

            )

            *

            2

            +

            1;


        raycaster.setFromCamera(
            pointer.ndc,
            camera
        );


        /*
          3D object hit test
        */

        const hit =
            raycaster.intersectObject(
                blob,
                false
            )[0];


        /*
          빈 배경을 클릭했다면
          아무것도 하지 않음
        */

        if (
            !hit
        ) {

            return;

        }


        /* =========================
           DRAG START
        ========================= */

        drag.isDragging =
            true;


        drag.lastX =
            event.clientX;


        drag.lastY =
            event.clientY;


        /*
          새로 잡았을 때는
          이전 관성 제거
        */

        drag.velocityX =
            0;


        drag.velocityY =
            0;


        /*
          CSS cursor
          grab → grabbing
        */

        canvas.classList.add(
            "is-dragging"
        );


        /*
          마우스가 Canvas 바깥으로 이동해도
          Drag 계속 유지
        */

        try {

            canvas.setPointerCapture(
                event.pointerId
            );

        }

        catch (
        error
        ) {

            // Pointer capture를 지원하지 않는 경우 무시

        }

    }
);


/* =========================================================
   14. DRAG MOVE
========================================================= */

canvas.addEventListener(
    "pointermove",
    (
        event
    ) => {

        if (
            !drag.isDragging
        ) {

            return;

        }


        /*
          이전 Mouse 위치와
          현재 Mouse 위치 차이
        */

        const deltaX =

            event.clientX

            -

            drag.lastX;


        const deltaY =

            event.clientY

            -

            drag.lastY;


        /* =========================
           LEFT / RIGHT
    
           → Y AXIS ROTATION
        ========================= */

        drag.rotationY +=

            deltaX

            *

            drag.sensitivity;


        /* =========================
           UP / DOWN
    
           → X AXIS ROTATION
        ========================= */

        drag.rotationX +=

            deltaY

            *

            drag.sensitivity;


        /*
          X축이 완전히 뒤집히지 않도록 제한
    
          약 ±72도
        */

        drag.rotationX =

            THREE.MathUtils.clamp(
                drag.rotationX,
                -1.25,
                1.25
            );


        /* =========================
           INERTIA VELOCITY
        ========================= */

        drag.velocityY =

            deltaX

            *

            drag.sensitivity;


        drag.velocityX =

            deltaY

            *

            drag.sensitivity;


        /* =========================
           UPDATE LAST POSITION
        ========================= */

        drag.lastX =
            event.clientX;


        drag.lastY =
            event.clientY;

    }
);


/* =========================================================
   15. DRAG END
========================================================= */

function endDrag(
    event
) {

    if (
        !drag.isDragging
    ) {

        return;

    }


    drag.isDragging =
        false;


    canvas.classList.remove(
        "is-dragging"
    );


    if (
        event.pointerId !==
        undefined
    ) {

        try {

            canvas.releasePointerCapture(
                event.pointerId
            );

        }

        catch (
        error
        ) {

            /*
              이미 pointer capture가
              해제된 경우 무시
            */

        }

    }

}


canvas.addEventListener(
    "pointerup",
    endDrag
);


canvas.addEventListener(
    "pointercancel",
    endDrag
);


/* =========================================================
   16. SMOOTHSTEP
========================================================= */

function smoothstep(
    edge0,
    edge1,
    value
) {

    const t =

        THREE.MathUtils.clamp(

            (
                value -
                edge0
            )

            /

            (
                edge1 -
                edge0
            ),

            0,

            1

        );


    return (

        t

        *

        t

        *

        (
            3 -
            2 * t
        )

    );

}


/* =========================================================
   17. BLOB DEFORMATION
========================================================= */

let frame =
    0;


function deformBlob(
    time
) {

    /* =========================
       Hover Position
       부드럽게 추적
    ========================= */

    pointer
        .localPoint
        .lerp(
            pointer.targetLocalPoint,
            0.11
        );


    /* =========================
       Hover strength
       부드럽게 증가 / 감소
    ========================= */

    pointer.strength =

        THREE.MathUtils.lerp(

            pointer.strength,

            pointer.targetStrength,

            0.085

        );


    const px =
        pointer.localPoint.x;


    const py =
        pointer.localPoint.y;


    const pz =
        pointer.localPoint.z;


    const structure =
        deformState.structure;


    /*
      구조화될수록
      organic deformation 감소
    */

    const organicKeep =

        1

        -

        structure *
        0.88;


    /* =======================================================
       EACH VERTEX
    ======================================================= */
    /* =====================================================
       INTERNAL PRESSURE POINTS
    
       오브젝트 내부에서
       몇 개의 힘이 천천히 이동하면서
       특정 표면을 밀어내는 구조
    ===================================================== */

    const pressureTime =
        time *
        deformState.pressureSpeed;


    /* -----------------------------------------------------
       PRESSURE 01
       가장 강한 메인 압력점
    ----------------------------------------------------- */

    let p1x =
        Math.sin(
            pressureTime * 0.41
        );

    let p1y =
        Math.cos(
            pressureTime * 0.33
        ) * 0.75;

    let p1z =
        Math.cos(
            pressureTime * 0.27
        );


    let p1Length =
        Math.sqrt(
            p1x * p1x +
            p1y * p1y +
            p1z * p1z
        );


    p1x /= p1Length;
    p1y /= p1Length;
    p1z /= p1Length;


    /* -----------------------------------------------------
       PRESSURE 02
       반대편에서 조금 느리게 움직이는 힘
    ----------------------------------------------------- */

    let p2x =
        Math.cos(
            pressureTime * 0.26 + 2.1
        );

    let p2y =
        Math.sin(
            pressureTime * 0.38 + 1.2
        );

    let p2z =
        Math.sin(
            pressureTime * 0.31 + 0.8
        );


    let p2Length =
        Math.sqrt(
            p2x * p2x +
            p2y * p2y +
            p2z * p2z
        );


    p2x /= p2Length;
    p2y /= p2Length;
    p2z /= p2Length;


    /* -----------------------------------------------------
       PRESSURE 03
       작은 보조 압력
    ----------------------------------------------------- */

    let p3x =
        Math.sin(
            pressureTime * 0.22 + 4.2
        );

    let p3y =
        Math.sin(
            pressureTime * 0.29 + 2.6
        );

    let p3z =
        Math.cos(
            pressureTime * 0.36 + 1.4
        );


    let p3Length =
        Math.sqrt(
            p3x * p3x +
            p3y * p3y +
            p3z * p3z
        );


    p3x /= p3Length;
    p3y /= p3Length;
    p3z /= p3Length;
    for (
        let i = 0;
        i < vertexCount;
        i++
    ) {

        const i3 =
            i * 3;


        /* =========================
           BASE
        ========================= */

        const bx =
            basePositions[i3];


        const by =
            basePositions[i3 + 1];


        const bz =
            basePositions[i3 + 2];


        /* =========================
           STRUCTURED TARGET
        ========================= */

        const sx =
            structuredPositions[i3];


        const sy =
            structuredPositions[i3 + 1];


        const sz =
            structuredPositions[i3 + 2];


        /*
          Organic →
          Structure
        */

        let x =

            THREE.MathUtils.lerp(
                bx,
                sx,
                structure
            );


        let y =

            THREE.MathUtils.lerp(
                by,
                sy,
                structure
            );


        let z =

            THREE.MathUtils.lerp(
                bz,
                sz,
                structure
            );


        /* =====================================================
           APPROXIMATE NORMAL
        ===================================================== */

        const nx =
            bx;


        const ny =

            by /
            1.075;


        const nz =

            bz /
            0.95;


        const invLength =

            1

            /

            Math.max(

                Math.sqrt(

                    nx * nx

                    +

                    ny * ny

                    +

                    nz * nz

                ),

                0.0001

            );


        const nX =

            nx *
            invLength;


        const nY =

            ny *
            invLength;


        const nZ =

            nz *
            invLength;


            /* =====================================================
   LOCAL PRESSURE FIELD

   vertex가 pressure direction에
   가까울수록 많이 튀어나온다
===================================================== */


/* -----------------------------------------------------
   pressure point 1
----------------------------------------------------- */

const dot1 =
  nX * p1x +
  nY * p1y +
  nZ * p1z;


/*
  중심부
*/

const bulge1 =
  smoothstep(
    0.70,
    0.96,
    dot1
  );


/*
  튀어나온 부분 주변은
  살짝 안쪽으로 당긴다

  → 단순한 부피 증가가 아니라
    "안에서 밀어낸" 느낌
*/

const ring1 =

  smoothstep(
    0.42,
    0.72,
    dot1
  )

  *

  (
    1 -
    smoothstep(
      0.72,
      0.91,
      dot1
    )
  );


/* -----------------------------------------------------
   pressure point 2
----------------------------------------------------- */

const dot2 =
  nX * p2x +
  nY * p2y +
  nZ * p2z;


const bulge2 =
  smoothstep(
    0.74,
    0.97,
    dot2
  );


const ring2 =

  smoothstep(
    0.48,
    0.74,
    dot2
  )

  *

  (
    1 -
    smoothstep(
      0.74,
      0.92,
      dot2
    )
  );


/* -----------------------------------------------------
   pressure point 3
----------------------------------------------------- */

const dot3 =
  nX * p3x +
  nY * p3y +
  nZ * p3z;


const bulge3 =
  smoothstep(
    0.78,
    0.97,
    dot3
  );


/* -----------------------------------------------------
   FINAL PRESSURE

   1번이 가장 큼
   2번은 중간
   3번은 작은 포인트
----------------------------------------------------- */

const internalPressure =

  (
    bulge1 * 1.0

    -

    ring1 * 0.34

    +

    bulge2 * 0.68

    -

    ring2 * 0.22

    +

    bulge3 * 0.42
  )

  *

  deformState.pressureAmount;
        /* =====================================================
           ORGANIC WAVE
    
           Random Noise처럼 떨리는 것이 아니라
           천천히 서로 연결된 Surface Motion
        ===================================================== */

        const waveA =

            Math.sin(

                bx *
                2.15

                +

                time *
                0.72

            )

            *

            Math.sin(

                by *
                2

                -

                time *
                0.52

            );


        const waveB =

            Math.sin(

                (
                    bx +
                    by +
                    bz
                )

                *

                2.85

                +

                time *
                0.31

            );


        const waveC =

            Math.cos(

                bz *
                2.55

                -

                time *
                0.61

            )

            *

            Math.sin(

                bx *
                1.65

                +

                time *
                0.23

            );


        const organicWave =

            waveA *
            0.55

            +

            waveB *
            0.27

            +

            waveC *
            0.18;


        /* =====================================================
           BREATHING
        ===================================================== */

        const breath =

            Math.sin(

                time *
                1.08

                +

                randomPhase[i]

            )

            *

            0.011

            *

            deformState.breath;


        /* =====================================================
           COMPLEXITY ENERGY
        ===================================================== */

        const energyWave =

            Math.sin(

                time *
                2.4

                +

                randomPhase[i] *
                0.7

            )

            *

            deformState.energy

            *

            0.026;


        /* =====================================================
           BASE DISPLACEMENT
        ===================================================== */

        let displacement =

            organicWave

            *

            deformState.amount

            *

            organicKeep

            +

            breath *
            organicKeep

            +

            energyWave;


        /* =====================================================
           HOVER SURFACE PRESSURE
    
           중요:
           Drag 중에도 그대로 유지됨
        ===================================================== */

        if (
            pointer.strength >
            0.001
        ) {

            const dx =
                bx - px;


            const dy =
                by - py;


            const dz =
                bz - pz;


            const distance =

                Math.sqrt(

                    dx * dx

                    +

                    dy * dy

                    +

                    dz * dz

                );


            /*
              Cursor 중심부가
              살짝 바깥쪽으로 튀어나옴
            */

            const core =

                (
                    1

                    -

                    smoothstep(
                        0,
                        0.72,
                        distance
                    )
                )

                *

                0.14;


            /*
              Core 주변에
              미세한 음의 압력 Ring
            */

            const ringDistance =

                Math.abs(
                    distance -
                    0.62
                );


            const ring =

                (
                    1

                    -

                    smoothstep(
                        0,
                        0.24,
                        ringDistance
                    )
                )

                *

                -0.026;


            displacement +=

                (
                    core +
                    ring
                )

                *

                pointer.strength

                *

                organicKeep;

        }


        /* =====================================================
           APPLY DISPLACEMENT
        ===================================================== */

        x +=
            nX *
            displacement;


        y +=
            nY *
            displacement;


        z +=
            nZ *
            displacement;


        /* =====================================================
           STRUCTURE COMPRESSION
        ===================================================== */

        y *=

            1

            -

            deformState.flatten *
            0.12;


        z *=

            1

            -

            deformState.flatten *
            0.09;


        /* =====================================================
           WRITE POSITION
        ===================================================== */

        position.array[i3] =
            x;


        position.array[i3 + 1] =
            y;


        position.array[i3 + 2] =
            z;

    }


    position.needsUpdate =
        true;


    /*
      Glossy Highlight가
      실시간 변형된 Surface를 따라가도록
  
      성능을 위해 매 2 frame마다 계산
    */

    if (
        frame % 2 === 0
    ) {

        geometry.computeVertexNormals();

    }

}


/* =========================================================
   18. INTRO ANIMATION
========================================================= */

const intro =
    gsap.timeline({

        defaults: {
            ease: "power3.out"
        }

    });


intro

    /* =========================
       LOGO
    ========================= */

    .from(
        ".brand",
        {

            opacity:
                0,

            y:
                -10,

            duration:
                0.8

        }
    )


    /* =========================
       NAV
    ========================= */

    .from(
        ".site-nav a",
        {

            opacity:
                0,

            y:
                -10,

            stagger:
                0.06,

            duration:
                0.6

        },

        0.1
    )


    /* =========================
       EYEBROW
    ========================= */

    .from(
        ".hero__statement .eyebrow",
        {

            opacity:
                0,

            y:
                12,

            duration:
                0.65

        },

        0.25
    )


    /* =========================
       HEADLINE
    ========================= */

    .from(
        ".headline__line",
        {

            opacity:
                0,

            yPercent:
                105,

            rotate:
                1.5,

            stagger:
                0.075,

            duration:
                1.1

        },

        0.22
    )


    /* =========================
       META
    ========================= */

    .from(
        ".hero__meta",
        {

            opacity:
                0,

            y:
                15,

            duration:
                0.75

        },

        0.62
    )


    /* =========================
       FOOTER
    ========================= */

    .from(
        ".hero__footer, .hero__index",
        {

            opacity:
                0,

            duration:
                0.8

        },

        0.8
    );


/* =========================================================
   19. HERO SCROLL STORY

   01
   INTRO

   02
   COMPLEXITY

   03
   STRUCTURE

   04
   SELECTED WORK
========================================================= */

const scrollTl =
    gsap.timeline({

        scrollTrigger: {

            trigger:
                ".hero",


            start:
                "top top",


            /*
              Hero를 약 2.6 viewport 동안
              pin 상태로 유지
            */

            end:
                "+=260%",


            scrub:
                1.05,


            pin:
                true,


            /*
              다음 Section이
              Hero 위로 올라오는 현상 방지
            */

            pinSpacing:
                true,


            anticipatePin:
                1,


            onUpdate(
                self
            ) {

                const progress =
                    self.progress;


                /* =========================
                   STEP NUMBER
                ========================= */

                const currentStep =

                    progress <
                        0.34

                        ? "01"

                        : progress <
                            0.7

                            ? "02"

                            : "03";


                const stepElement =
                    document.querySelector(
                        "#step-current"
                    );


                if (
                    stepElement
                ) {

                    stepElement.textContent =
                        currentStep;

                }


                /* =========================
                   PROGRESS LINE
                ========================= */

                gsap.set(
                    ".hero__index-line i",
                    {

                        scaleY:

                            0.33

                            +

                            progress *
                            0.67

                    }
                );

            }

        }

    });


/* =========================================================
   20. SCROLL PHASE 01
   COMPLEXITY
========================================================= */

scrollTl

    .to(
        deformState,
        {

            amount:
                0.145,

            energy:
                1,

            duration:
                0.22,

            ease:
                "none"

        },

        0.16
    )


    .to(
        ".headline__line--complexity",
        {

            x:
                24,

            letterSpacing:
                "-0.025em",

            duration:
                0.20,

            ease:
                "none"

        },

        0.18
    )


    /*
      중요:
  
      Drag Rotation은 blob에 적용되고
      Scroll Rotation은 floatRig에 적용되므로
      서로 충돌하지 않음
    */

    .to(
        floatRig.rotation,
        {

            z:
                0.12,

            y:
                0.34,

            duration:
                0.28,

            ease:
                "none"

        },

        0.18
    );


/* =========================================================
   21. HERO COPY EXIT
========================================================= */

scrollTl

    .to(
        ".hero__statement",
        {

            opacity:
                0,

            x:
                -34,

            duration:
                0.16,

            ease:
                "none"

        },

        0.39
    )


    .to(
        ".scroll-hint",
        {

            opacity:
                0,

            duration:
                0.1,

            ease:
                "none"

        },

        0.39
    );


/* =========================================================
   22. SCROLL PHASE 02
   OBSERVE → FOCUS → STRUCTURE
========================================================= */

scrollTl

    .to(
        ".hero__process",
        {

            opacity:
                1,

            duration:
                0.16,

            ease:
                "none"

        },

        0.46
    )


    .fromTo(

        ".process-word strong",

        {

            yPercent:
                100

        },

        {

            yPercent:
                0,

            stagger:
                0.035,

            duration:
                0.18,

            ease:
                "none"

        },

        0.46

    )


    /* =========================
       GRID
    ========================= */

    .to(
        ".structure-grid",
        {

            opacity:
                1,

            duration:
                0.18,

            ease:
                "none"

        },

        0.50
    )


    /* =========================
       ORGANIC →
       STRUCTURED OBJECT
    ========================= */

    .to(
        deformState,
        {

            amount:
                0.035,

            energy:
                0,

            structure:
                0.84,

            flatten:
                1,

            duration:
                0.30,

            ease:
                "none"

        },

        0.50
    )


    /* =========================
       SCROLL ROTATION
    ========================= */

    .to(
        floatRig.rotation,
        {

            x:
                -0.13,

            y:
                0.74,

            z:
                0.23,

            duration:
                0.30,

            ease:
                "none"

        },

        0.50
    );


/* =========================================================
   23. FINAL HERO TRANSITION
========================================================= */

scrollTl

    .to(
        ".hero__process",
        {

            opacity:
                0,

            y:
                -20,

            duration:
                0.12,

            ease:
                "none"

        },

        0.79
    )


    .to(
        ".hero__descriptor, .hero__index",
        {

            opacity:
                0,

            duration:
                0.10,

            ease:
                "none"

        },

        0.80
    )


    .to(
        ".structure-grid",
        {

            opacity:
                0.28,

            scale:
                0.96,

            duration:
                0.18,

            ease:
                "none"

        },

        0.79
    )


    /* =========================
       SELECTED WORK
    ========================= */

    .to(
        ".hero__transition-title",
        {

            opacity:
                1,

            y:
                0,

            duration:
                0.16,

            ease:
                "none"

        },

        0.82
    )


    /* =========================
       OBJECT FINAL POSITION
    ========================= */

    .to(
        floatRig.position,
        {

            y:
                0.22,

            duration:
                0.18,

            ease:
                "none"

        },

        0.82
    )


    /* =========================
       MATERIAL TRANSITION
    ========================= */

    .to(
        material,
        {

            roughness:
                0.20,

            envMapIntensity:
                1.35,

            duration:
                0.18,

            ease:
                "none"

        },

        0.82
    );


/* =========================================================
   24. RENDER LOOP
========================================================= */

const clock =
    new THREE.Clock();


function render() {

    const elapsed =
        clock.getElapsedTime();


    /* =========================
       SURFACE DEFORMATION
    ========================= */

    deformBlob(
        elapsed
    );


    /* =======================================================
       DRAG INERTIA
  
       Drag 중이 아닐 때만
       Velocity를 계속 Rotation에 더함
    ======================================================= */

    if (
        !drag.isDragging
    ) {

        drag.rotationX +=
            drag.velocityX;


        drag.rotationY +=
            drag.velocityY;


        /* =========================
           DECELERATION
        ========================= */

        drag.velocityX *=
            drag.damping;


        drag.velocityY *=
            drag.damping;


        /*
          아주 작은 값이 무한히 남지 않도록
          완전한 0 처리
        */

        if (
            Math.abs(
                drag.velocityX
            ) <
            0.00005
        ) {

            drag.velocityX =
                0;

        }


        if (
            Math.abs(
                drag.velocityY
            ) <
            0.00005
        ) {

            drag.velocityY =
                0;

        }

    }


    /*
      관성 때문에 X rotation이
      clamp 밖으로 나가는 것도 방지
    */

    drag.rotationX =

        THREE.MathUtils.clamp(
            drag.rotationX,
            -1.25,
            1.25
        );


    /* =======================================================
       EXISTING POINTER TILT
  
       Drag Interaction과 별개로
       계속 유지
    ======================================================= */

    pointer.tiltX =

        THREE.MathUtils.lerp(

            pointer.tiltX,

            pointer.targetTiltX,

            0.04

        );


    pointer.tiltY =

        THREE.MathUtils.lerp(

            pointer.tiltY,

            pointer.targetTiltY,

            0.04

        );


    /* =======================================================
       FINAL OBJECT ROTATION
  
       DRAG
         +
       POINTER TILT
         +
       IDLE LIVING MOTION
  
       세 가지가 합쳐짐
    ======================================================= */

    blob.rotation.x =

        drag.rotationX

        +

        pointer.tiltX

        +

        Math.sin(
            elapsed *
            0.25
        )

        *

        0.016;


    blob.rotation.y =

        drag.rotationY

        +

        pointer.tiltY

        +

        Math.sin(
            elapsed *
            0.19
        )

        *

        0.023;


    blob.rotation.z =

        Math.sin(
            elapsed *
            0.31
        )

        *

        0.009;


    /* =======================================================
       SUBTLE FLOAT
  
       바닥은 없지만
       공중에 크게 떠다니는 느낌은 피하고
       매우 작은 움직임만 적용
    ======================================================= */

    blob.position.y =

        Math.sin(
            elapsed *
            0.72
        )

        *

        0.018;


    /* =========================
       RENDER
    ========================= */

    renderer.render(
        scene,
        camera
    );


    frame +=
        1;


    requestAnimationFrame(
        render
    );

}


/*
  Start
*/

render();


/* =========================================================
   25. WINDOW RESIZE
========================================================= */

function onResize() {

    /* =========================
       CAMERA
    ========================= */

    camera.aspect =

        window.innerWidth

        /

        window.innerHeight;


    camera.updateProjectionMatrix();


    /* =========================
       RENDERER
    ========================= */

    renderer.setPixelRatio(

        Math.min(
            window.devicePixelRatio,
            1.75
        )

    );


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


    /* =========================
       OBJECT LAYOUT
    ========================= */

    setBlobLayout();


    /* =========================
       GSAP
    ========================= */

    ScrollTrigger.refresh();

}


window.addEventListener(
    "resize",
    onResize
);


/* =========================================================
   26. REDUCED MOTION
========================================================= */

if (

    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches

) {

    deformState.amount =
        0.025;


    deformState.breath =
        0.25;


    deformState.energy =
        0;


    pointer.targetStrength =
        0;


    /*
      관성도 거의 제거
    */

    drag.damping =
        0.8;

}