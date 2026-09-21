/* =========================================================
   PORTFOLIO INTERACTION
   Hero → Observe → Focus → Structure → Bridge
========================================================= */

gsap.registerPlugin(ScrollTrigger);


/* =========================================================
   0. 기본 설정
========================================================= */

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;


/* Hero */
const hero = document.querySelector(".hero");
const heroStage = document.querySelector("[data-hero-stage]");


/* Main Image */
const mainImage = document.querySelector(".visual-main img");


/* Magnifier */
const magnifier = document.querySelector("[data-magnifier]");


/* Hero Images */
const visuals = [
    ...document.querySelectorAll("[data-visual]")
];


/* Hotspot */
const hotspots = [
    ...document.querySelectorAll("[data-target]")
];


/* Hero Final Image */
const finalTile = document.querySelector("[data-final-tile]");


/* Bridge */
const bridge = document.querySelector("[data-bridge]");
const bridgeTarget = document.querySelector("[data-bridge-target]");
const bridgeCopy = document.querySelector(".bridge-copy");


/* Mobile */
const mobileObservation = document.querySelector(
    "[data-mobile-observation]"
);

const mobileTabs = [
    ...document.querySelectorAll("[data-mobile-target]")
];



/* =========================================================
   1. MOBILE 단계별 데이터
========================================================= */

const stageData = {

    examine: {
        image: "./images/hero-examine.jpg",
        title: "EXAMINE",
        text: "Look closer before defining the problem."
    },

    detail: {
        image: "./images/hero-detail.jpg",
        title: "FOCUS",
        text: "Notice the small signals that are easy to miss."
    },

    pattern: {
        image: "./images/hero-pattern.jpg",
        title: "DISCOVER",
        text: "Find repetition, relationships and patterns."
    },

    structure: {
        image: "./images/hero-final.jpg",
        title: "STRUCTURE",
        text: "Turn observations into a clear design structure."
    }

};



/* =========================================================
   2. INTRO
   추상 나비 등장
   ↓
   날갯짓
   ↓
   확대
   ↓
   Main Image로 연결
========================================================= */

function runIntro() {

    const overlay = document.querySelector(".intro-overlay");

    const butterfly = document.querySelector(
        "[data-butterfly]"
    );

    const leftWing = document.querySelector(
        ".wing-left"
    );

    const rightWing = document.querySelector(
        ".wing-right"
    );


    /* 모션 최소화 옵션 사용자의 경우 */
    if (prefersReducedMotion) {

        if (overlay) {
            overlay.remove();
        }

        return;
    }


    /* 필요한 요소가 없다면 종료 */
    if (
        !overlay ||
        !butterfly ||
        !leftWing ||
        !rightWing
    ) {
        return;
    }



    /* Hero 처음 상태 */

    gsap.set(".hero-copy", {
        opacity: 0,
        y: 30
    });


    gsap.set(".hero-stage .visual", {

        opacity: 0,

        y: 25,

        scale: 0.95

    });



    /* Intro Timeline */

    const introTimeline = gsap.timeline({

        defaults: {

            ease: "power3.out"

        }

    });



    /* 01
       나비 화면 진입
    */

    introTimeline.fromTo(

        butterfly,

        {

            x: "30vw",

            y: "-15vh",

            rotation: -18,

            scale: 0.55,

            opacity: 0

        },

        {

            x: 0,

            y: 0,

            rotation: 0,

            scale: 1,

            opacity: 1,

            duration: 1.4

        }

    );



    /* 02
       왼쪽 날개
    */

    introTimeline.to(

        leftWing,

        {

            rotationY: 60,

            duration: 0.16,

            yoyo: true,

            repeat: 5,

            ease: "sine.inOut"

        },

        "-=0.9"

    );



    /* 03
       오른쪽 날개
    */

    introTimeline.to(

        rightWing,

        {

            rotationY: -60,

            duration: 0.16,

            yoyo: true,

            repeat: 5,

            ease: "sine.inOut"

        },

        "<"

    );



    /* 04
       나비 확대
       → 사진으로 전환
    */

    introTimeline.to(

        butterfly,

        {

            scale: 4,

            opacity: 0,

            duration: 0.8,

            ease: "power4.in"

        }

    );



    /* 05
       검은 Intro 화면 제거
    */

    introTimeline.to(

        overlay,

        {

            autoAlpha: 0,

            duration: 0.5,

            onComplete: () => {

                overlay.remove();

            }

        },

        "-=0.3"

    );



    /* 06
       Hero Main Image 등장
    */

    introTimeline.to(

        ".hero-stage .visual-main",

        {

            opacity: 1,

            y: 0,

            scale: 1,

            duration: 0.8

        },

        "-=0.3"

    );



    /* 07
       주변 이미지 등장
    */

    introTimeline.to(

        ".hero-stage .visual:not(.visual-main)",

        {

            opacity: 1,

            y: 0,

            scale: 1,

            duration: 0.7,

            stagger: 0.08

        },

        "-=0.45"

    );



    /* 08
       Hero 텍스트 등장
    */

    introTimeline.to(

        ".hero-copy",

        {

            opacity: 1,

            y: 0,

            duration: 0.8

        },

        "-=0.55"

    );

}



/* =========================================================
   3. HOTSPOT INTERACTION

   Hotspot에 hover / focus
   ↓
   연결된 이미지 강조
   ↓
   다른 이미지 opacity 감소
========================================================= */

function setActiveVisual(name) {

    visuals.forEach((visual) => {

        const visualName =
            visual.dataset.visual;


        const isTarget =
            visualName === name;


        const isMain =
            visualName === "observe";


        /* 선택 이미지 강조 */

        visual.classList.toggle(

            "is-active",

            isTarget

        );


        /* 나머지 이미지 흐리게 */

        visual.classList.toggle(

            "is-dimmed",

            !isTarget && !isMain

        );

    });



    /* hotspot 활성 상태 */

    hotspots.forEach((hotspot) => {

        hotspot.classList.toggle(

            "is-active",

            hotspot.dataset.target === name

        );

    });

}



/* 활성 상태 초기화 */

function clearActiveVisual() {

    visuals.forEach((visual) => {

        visual.classList.remove(

            "is-active",

            "is-dimmed"

        );

    });


    hotspots.forEach((hotspot) => {

        hotspot.classList.remove(

            "is-active"

        );

    });

}



/* hotspot 이벤트 */

hotspots.forEach((hotspot) => {

    const targetName =
        hotspot.dataset.target;



    /* Desktop hover */

    hotspot.addEventListener(

        "mouseenter",

        () => {

            setActiveVisual(targetName);

        }

    );



    hotspot.addEventListener(

        "mouseleave",

        () => {

            clearActiveVisual();

        }

    );



    /* Keyboard 접근성 */

    hotspot.addEventListener(

        "focus",

        () => {

            setActiveVisual(targetName);

        }

    );


    hotspot.addEventListener(

        "blur",

        () => {

            clearActiveVisual();

        }

    );



    /* Mobile tap */

    hotspot.addEventListener(

        "click",

        () => {

            if (window.innerWidth <= 767) {

                updateMobileObservation(
                    targetName
                );

            }

        }

    );

});



/* =========================================================
   4. MAGNIFIER
   Desktop Mouse Drag
   Mobile Touch Drag
========================================================= */

let isDraggingLens = false;



function updateMagnifier(

    clientX,

    clientY

) {

    if (
        !heroStage ||
        !mainImage ||
        !magnifier
    ) {
        return;
    }



    /* 이미지 위치 */

    const imageRect =
        mainImage.getBoundingClientRect();


    /* Hero Stage 위치 */

    const stageRect =
        heroStage.getBoundingClientRect();



    /* 이미지 바깥으로 나가지 않도록 제한 */

    const x = Math.min(

        Math.max(
            clientX,
            imageRect.left
        ),

        imageRect.right

    );


    const y = Math.min(

        Math.max(
            clientY,
            imageRect.top
        ),

        imageRect.bottom

    );



    /* Hero Stage 내부 위치 */

    const localX =
        x - stageRect.left;


    const localY =
        y - stageRect.top;



    /* Lens 위치 */

    magnifier.style.left =
        `${localX}px`;


    magnifier.style.top =
        `${localY}px`;



    /* 이미지 내 좌표를 %로 계산 */

    const percentX =

        (
            (
                x -
                imageRect.left
            )
            /
            imageRect.width
        )
        *
        100;


    const percentY =

        (
            (
                y -
                imageRect.top
            )
            /
            imageRect.height
        )
        *
        100;



    /* 확대 이미지 위치 */

    magnifier.style.backgroundPosition =

        `${percentX}% ${percentY}%`;

}



/* Lens 누르기 */

if (magnifier) {

    magnifier.addEventListener(

        "pointerdown",

        (event) => {

            isDraggingLens = true;


            magnifier.setPointerCapture(

                event.pointerId

            );


            updateMagnifier(

                event.clientX,

                event.clientY

            );

        }

    );



    /* Lens 이동 */

    magnifier.addEventListener(

        "pointermove",

        (event) => {

            if (!isDraggingLens) {

                return;

            }


            updateMagnifier(

                event.clientX,

                event.clientY

            );

        }

    );



    /* Lens 놓기 */

    magnifier.addEventListener(

        "pointerup",

        (event) => {

            isDraggingLens = false;


            if (

                magnifier.hasPointerCapture(
                    event.pointerId
                )

            ) {

                magnifier.releasePointerCapture(

                    event.pointerId

                );

            }



            /* 모바일에서는 원래 위치 복귀 */

            if (window.innerWidth <= 767) {

                gsap.to(

                    magnifier,

                    {

                        left: "61%",

                        top: "48%",

                        duration: 0.45,

                        ease: "power3.out"

                    }

                );

            }

        }

    );

}



/* =========================================================
   5. MOBILE OBSERVATION

   01 Observe
   02 Focus
   03 Discover
   04 Structure
========================================================= */

function updateMobileObservation(name) {

    if (
        !mobileObservation ||
        !stageData[name]
    ) {
        return;
    }


    const data =
        stageData[name];


    const image =
        mobileObservation.querySelector("img");


    const title =
        mobileObservation.querySelector("strong");


    const text =
        mobileObservation.querySelector("span");



    /* 내용 변경 */

    if (image) {

        image.src =
            data.image;


        image.alt =
            data.title;

    }


    if (title) {

        title.textContent =
            data.title;

    }


    if (text) {

        text.textContent =
            data.text;

    }



    /* 현재 탭 상태 */

    mobileTabs.forEach((tab) => {

        tab.classList.toggle(

            "is-active",

            tab.dataset.mobileTarget === name

        );

    });



    /* 변경 애니메이션 */

    gsap.fromTo(

        mobileObservation,

        {

            opacity: 0.2,

            y: 10

        },

        {

            opacity: 1,

            y: 0,

            duration: 0.35,

            ease: "power2.out"

        }

    );

}



/* Mobile Button */

mobileTabs.forEach((tab) => {

    tab.addEventListener(

        "click",

        () => {

            const target =
                tab.dataset.mobileTarget;


            updateMobileObservation(
                target
            );

        }

    );

});



/* =========================================================
   6. HERO 이미지 Scroll Animation

   스크롤하면서 Hero 이미지가
   조금씩 정리되는 느낌
========================================================= */

function buildHeroScrollAnimation() {

    if (
        prefersReducedMotion ||
        !hero
    ) {
        return;
    }


    const mm = gsap.matchMedia();



    /* Desktop */

    mm.add(

        "(min-width: 768px)",

        () => {

            const timeline =
                gsap.timeline({

                    scrollTrigger: {

                        trigger: hero,

                        start: "top top",

                        end: "bottom top",

                        scrub: 1

                    }

                });



            /* Blur Image */

            timeline.to(

                ".visual-blur",

                {

                    x: 30,

                    y: -20,

                    opacity: 0.25

                },

                0

            );



            /* Detail */

            timeline.to(

                ".visual-detail",

                {

                    x: 40,

                    y: -10

                },

                0

            );



            /* Pattern */

            timeline.to(

                ".visual-pattern",

                {

                    x: -35,

                    y: -20

                },

                0

            );



            /* Examine */

            timeline.to(

                ".visual-circle",

                {

                    x: -20,

                    y: 25

                },

                0

            );



            /* Final Design */

            timeline.to(

                ".visual-final",

                {

                    scale: 1.12

                },

                0

            );

        }

    );

}



/* =========================================================
   7. HERO → BRIDGE

   Hero의 Final Design 이미지가 강조된 뒤
   Bridge 이미지로 연결
========================================================= */

function buildBridgeTransition() {

    if (
        prefersReducedMotion ||
        !finalTile ||
        !bridgeTarget ||
        !bridge
    ) {
        return;
    }


    const mm = gsap.matchMedia();



    /* =====================================================
       DESKTOP
    ===================================================== */

    mm.add(

        "(min-width: 768px)",

        () => {

            /* Hero final image 복제 */

            const clone =
                finalTile.cloneNode(true);


            clone.classList.add(
                "transition-clone"
            );


            clone.removeAttribute(
                "data-final-tile"
            );


            document.body.appendChild(
                clone
            );



            /* Clone 기본 상태 */

            Object.assign(

                clone.style,

                {

                    position: "fixed",

                    zIndex: "60",

                    margin: "0",

                    pointerEvents: "none",

                    transformOrigin:
                        "top left",

                    opacity: "0"

                }

            );



            let startRect;



            /* 시작 위치 기억 */

            function calculateStart() {

                startRect =
                    finalTile.getBoundingClientRect();

            }



            calculateStart();



            /* 위치 업데이트 */

            function updateClone(progress) {

                if (!startRect) {

                    calculateStart();

                }


                const endRect =
                    bridgeTarget.getBoundingClientRect();



                /* progress */

                const p =
                    Math.min(
                        Math.max(progress, 0),
                        1
                    );



                /* 위치 계산 */

                const left =

                    startRect.left +

                    (
                        endRect.left -
                        startRect.left
                    )
                    *
                    p;


                const top =

                    startRect.top +

                    (
                        endRect.top -
                        startRect.top
                    )
                    *
                    p;



                /* 크기 */

                const width =

                    startRect.width +

                    (
                        endRect.width -
                        startRect.width
                    )
                    *
                    p;


                const height =

                    startRect.height +

                    (
                        endRect.height -
                        startRect.height
                    )
                    *
                    p;



                /* 적용 */

                Object.assign(

                    clone.style,

                    {

                        left:
                            `${left}px`,

                        top:
                            `${top}px`,

                        width:
                            `${width}px`,

                        height:
                            `${height}px`,

                        opacity:
                            p > 0.01
                                ? "1"
                                : "0"

                    }

                );



                /* 원본 처리 */

                finalTile.style.opacity =

                    p > 0.01
                        ? "0"
                        : "1";


                bridgeTarget.style.opacity =

                    p < 0.97
                        ? "0"
                        : "1";

            }



            /* ScrollTrigger */

            const trigger =
                ScrollTrigger.create({

                    trigger: hero,

                    start:
                        "bottom bottom",

                    endTrigger:
                        bridge,

                    end:
                        "top top",

                    scrub: true,

                    onEnter: () => {

                        calculateStart();

                    },

                    onUpdate: (self) => {

                        updateClone(
                            self.progress
                        );

                    },

                    onLeave: () => {

                        clone.style.opacity = "0";

                        bridgeTarget.style.opacity = "1";

                    },

                    onEnterBack: () => {

                        clone.style.opacity = "1";

                    },

                    onLeaveBack: () => {

                        updateClone(0);

                    },

                    onRefresh: () => {

                        calculateStart();

                    }

                });



            /* cleanup */

            return () => {

                trigger.kill();

                clone.remove();


                finalTile.style.opacity = "";

                bridgeTarget.style.opacity = "";

            };

        }

    );



    /* =====================================================
       MOBILE
       복잡한 Morph 대신
       Final → Bridge scale transition
    ===================================================== */

    mm.add(

        "(max-width: 767px)",

        () => {

            gsap.fromTo(

                bridgeTarget,

                {

                    scale: 0.86,

                    y: 50,

                    opacity: 0

                },

                {

                    scale: 1,

                    y: 0,

                    opacity: 1,

                    ease: "none",

                    scrollTrigger: {

                        trigger: bridge,

                        start:
                            "top 90%",

                        end:
                            "top 45%",

                        scrub: 1

                    }

                }

            );

        }

    );

}



/* =========================================================
   8. BRIDGE TEXT

   FROM OBSERVATION TO EXPERIENCE
   ↓
   I look closely before I design.
   ↓
   Body text
========================================================= */

function buildBridgeTextAnimation() {

    if (
        !bridgeCopy ||
        prefersReducedMotion
    ) {

        return;

    }


    const elements =
        bridgeCopy.children;



    gsap.from(

        elements,

        {

            y: 35,

            opacity: 0,

            duration: 0.85,

            stagger: 0.16,

            ease: "power3.out",

            scrollTrigger: {

                trigger: bridge,

                start:
                    "top 62%",

                toggleActions:
                    "play none none reverse"

            }

        }

    );

}



/* =========================================================
   9. NAVIGATION Smooth Scroll
========================================================= */

const navLinks =
    document.querySelectorAll(
        '.main-nav a[href^="#"]'
    );


navLinks.forEach((link) => {

    link.addEventListener(

        "click",

        (event) => {

            const targetId =
                link.getAttribute("href");


            const target =
                document.querySelector(
                    targetId
                );


            if (!target) {
                return;
            }


            event.preventDefault();


            target.scrollIntoView({

                behavior:
                    prefersReducedMotion
                        ? "auto"
                        : "smooth",

                block: "start"

            });

        }

    );

});



/* =========================================================
   10. RESIZE
========================================================= */

let resizeTimer;


window.addEventListener(

    "resize",

    () => {

        clearTimeout(
            resizeTimer
        );


        resizeTimer = setTimeout(

            () => {

                ScrollTrigger.refresh();

            },

            150

        );

    }

);



/* =========================================================
   11. INIT
========================================================= */

function initPortfolio() {

    runIntro();

    buildHeroScrollAnimation();

    buildBridgeTransition();

    buildBridgeTextAnimation();

}



/* DOM 준비 후 시작 */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(

        "DOMContentLoaded",

        initPortfolio

    );

} else {

    initPortfolio();

}



/* 이미지 로딩 후 위치 재계산 */

window.addEventListener(

    "load",

    () => {

        ScrollTrigger.refresh();

    }

);