/* =========================================================
   HERO INTRO

   STEP 01 — OBSERVE
   STEP 02 — FOCUS

   Base Canvas:
   1920 × 1050
========================================================= */

(() => {


    /* =====================================================
       01. ELEMENTS
    ===================================================== */

    const body =
        document.body;


    const hero =
        document.querySelector(".hero");


    const heroCanvas =
        document.querySelector(".hero-canvas");


    const mainVisual =
        document.querySelector(".visual-main");


    const circleVisual =
        document.querySelector(".visual-circle");


    const blurVisual =
        document.querySelector(".visual-blur");


    const detailVisual =
        document.querySelector(".visual-detail");


    const patternVisual =
        document.querySelector(".visual-pattern");


    const finalVisual =
        document.querySelector(".visual-final");


    const observeLabel =
        document.querySelector(
            ".hero-visual-label--observe"
        );


    const focusLabel =
        document.querySelector(
            ".hero-visual-label--focus"
        );


    const discoverLabel =
        document.querySelector(
            ".hero-visual-label--discover"
        );


    const structureLabel =
        document.querySelector(
            ".hero-visual-label--structure"
        );


    const heroCopy =
        document.querySelector(
            ".hero-copy"
        );


    const focusPoint =
        document.querySelector(
            ".intro-focus-point"
        );


    const focusLine =
        document.querySelector(
            ".intro-focus-line"
        );


    const focusLinePath =
        document.querySelector(
            ".intro-focus-line path"
        );



    /* =====================================================
       02. SAFETY
    ===================================================== */

    if (
        !hero ||
        !heroCanvas ||
        !mainVisual
    ) {

        body.classList.remove(
            "is-hero-intro"
        );


        window.dispatchEvent(

            new CustomEvent(
                "heroIntroComplete"
            )

        );


        return;
    }



    /* =====================================================
       03. REDUCED MOTION
    ===================================================== */

    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (prefersReducedMotion) {

        body.classList.remove(
            "is-hero-intro"
        );


        window.dispatchEvent(

            new CustomEvent(
                "heroIntroComplete"
            )

        );


        return;
    }



    /* =====================================================
       04. MOBILE

       Desktop Intro부터 제작.
    ===================================================== */

    if (window.innerWidth < 768) {

        body.classList.remove(
            "is-hero-intro"
        );


        window.dispatchEvent(

            new CustomEvent(
                "heroIntroComplete"
            )

        );


        return;
    }



    /* =====================================================
       05. BASE SIZE
    ===================================================== */

    const HERO_BASE_WIDTH = 1920;

    const HERO_BASE_HEIGHT = 1050;



    /* =====================================================
       06. MAIN IMAGE
       시작 위치 자동 계산
    ===================================================== */

    const mainCenterX =
        mainVisual.offsetLeft +
        mainVisual.offsetWidth / 2;


    const mainCenterY =
        mainVisual.offsetTop +
        mainVisual.offsetHeight / 2;


    const canvasCenterX =
        HERO_BASE_WIDTH / 2;


    const canvasCenterY =
        HERO_BASE_HEIGHT / 2;


    const mainStartX =
        canvasCenterX - mainCenterX;


    const mainStartY =
        canvasCenterY - mainCenterY;



    /* =====================================================
       07. CIRCLE 시작 위치 계산

       Circular Crop이 처음에는
       Focus Point 위치에서 시작하도록 자동 계산.
    ===================================================== */

    let circleStartX = 0;

    let circleStartY = 0;


    if (
        circleVisual &&
        focusPoint
    ) {

        const circleCenterX =
            circleVisual.offsetLeft +
            circleVisual.offsetWidth / 2;


        const circleCenterY =
            circleVisual.offsetTop +
            circleVisual.offsetHeight / 2;


        const focusCenterX =
            focusPoint.offsetLeft +
            focusPoint.offsetWidth / 2;


        const focusCenterY =
            focusPoint.offsetTop +
            focusPoint.offsetHeight / 2;


        circleStartX =
            focusCenterX -
            circleCenterX;


        circleStartY =
            focusCenterY -
            circleCenterY;

    }



    /* =====================================================
       08. FOCUS LINE LENGTH
    ===================================================== */

    let focusLineLength = 0;


    if (focusLinePath) {

        focusLineLength =
            focusLinePath.getTotalLength();


        gsap.set(
            focusLinePath,
            {
                strokeDasharray:
                    focusLineLength,

                strokeDashoffset:
                    focusLineLength
            }
        );

    }



    /* =====================================================
       09. INITIAL STATE
    ===================================================== */


    /* -----------------------------------------------------
       MAIN IMAGE
    ----------------------------------------------------- */

    gsap.set(

        mainVisual,

        {

            x: mainStartX,

            y: mainStartY,

            scale: 1.08,

            autoAlpha: 0,

            filter: "blur(16px)",

            transformOrigin:
                "50% 50%"

        }

    );



    /* -----------------------------------------------------
       CIRCULAR CROP

       Focus Point에서 시작
    ----------------------------------------------------- */

    if (circleVisual) {

        gsap.set(

            circleVisual,

            {

                x: circleStartX,

                y: circleStartY,

                scale: 0.06,

                autoAlpha: 0,

                transformOrigin:
                    "50% 50%"

            }

        );

    }



    /* -----------------------------------------------------
       아직 나오면 안 되는 이미지
    ----------------------------------------------------- */

    gsap.set(

        [
            blurVisual,
            detailVisual,
            patternVisual,
            finalVisual
        ],

        {

            autoAlpha: 0

        }

    );



    /* -----------------------------------------------------
       Observe Label
    ----------------------------------------------------- */

    gsap.set(

        observeLabel,

        {

            autoAlpha: 0,

            y: 10

        }

    );



    /* -----------------------------------------------------
       Focus Label
    ----------------------------------------------------- */

    gsap.set(

        focusLabel,

        {

            autoAlpha: 0,

            y: 10

        }

    );



    /* -----------------------------------------------------
       아직 나오면 안 되는 Label
    ----------------------------------------------------- */

    gsap.set(

        [
            discoverLabel,
            structureLabel
        ],

        {

            autoAlpha: 0

        }

    );



    /* -----------------------------------------------------
       Focus Point
    ----------------------------------------------------- */

    if (focusPoint) {

        gsap.set(

            focusPoint,

            {

                autoAlpha: 0,

                scale: 0

            }

        );

    }



    /* -----------------------------------------------------
       Focus Line
    ----------------------------------------------------- */

    if (focusLine) {

        gsap.set(

            focusLine,

            {

                autoAlpha: 0

            }

        );

    }



    /* -----------------------------------------------------
       HERO TEXT

       마지막 단계에서 등장
    ----------------------------------------------------- */

    gsap.set(

        heroCopy,

        {

            autoAlpha: 0

        }

    );



    /* =====================================================
       10. TIMELINE
    ===================================================== */

    const introTimeline =
        gsap.timeline({

            defaults: {

                ease: "power3.out"

            }

        });



    /* =====================================================
       STEP 01 — OBSERVE
    ===================================================== */


    /* -----------------------------------------------------
       01-A
       흐릿한 Main Image 등장
    ----------------------------------------------------- */

    introTimeline.to(

        mainVisual,

        {

            autoAlpha: 1,

            duration: 0.45

        }

    );



    /* -----------------------------------------------------
       01-B
       중앙 → 기존 위치
       Blur → Clear
    ----------------------------------------------------- */

    introTimeline.to(

        mainVisual,

        {

            x: 0,

            y: 0,

            scale: 1,

            filter: "blur(0px)",

            duration: 1.35,

            ease: "power3.inOut"

        },

        "-=0.08"

    );



    /* -----------------------------------------------------
       01-C
       01 Observe
    ----------------------------------------------------- */

    introTimeline.to(

        observeLabel,

        {

            autoAlpha: 1,

            y: 0,

            duration: 0.45,

            ease: "power2.out"

        },

        "-=0.25"

    );



    /* =====================================================
       STEP 02 — FOCUS
    ===================================================== */


    /* -----------------------------------------------------
       02-A
       Focus Point 등장
    ----------------------------------------------------- */

    if (focusPoint) {

        introTimeline.to(

            focusPoint,

            {

                autoAlpha: 1,

                scale: 1,

                duration: 0.3,

                ease: "back.out(1.5)"

            },

            "+=0.12"

        );

    }



    /* -----------------------------------------------------
       02-B
       Line 표시
    ----------------------------------------------------- */

    if (focusLine) {

        introTimeline.to(

            focusLine,

            {

                autoAlpha: 1,

                duration: 0.01

            }

        );

    }



    /* -----------------------------------------------------
       02-C
       Line Drawing
    ----------------------------------------------------- */

    if (
        focusLinePath &&
        focusLineLength
    ) {

        introTimeline.to(

            focusLinePath,

            {

                strokeDashoffset: 0,

                duration: 0.6,

                ease: "power2.inOut"

            }

        );

    }



    /* -----------------------------------------------------
       02-D
       Circular Crop

       Focus Point 위치
       ↓
       원래 Figma 위치
    ----------------------------------------------------- */

    if (circleVisual) {

        introTimeline.to(

            circleVisual,

            {

                x: 0,

                y: 0,

                scale: 1,

                autoAlpha: 1,

                duration: 0.8,

                ease: "power3.out"

            },

            "-=0.28"

        );

    }



    /* -----------------------------------------------------
       02-E
       02 Focus
    ----------------------------------------------------- */

    introTimeline.to(

        focusLabel,

        {

            autoAlpha: 1,

            y: 0,

            duration: 0.42,

            ease: "power2.out"

        },

        "-=0.3"

    );



    /* =====================================================
       아직 Intro Complete 하지 않음.

       다음:
       STEP 03 — DISCOVER
    ===================================================== */


})();