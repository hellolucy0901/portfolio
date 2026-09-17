gsap.to(".card-01", {
    y: -12,
    x: 6,
    rotation: 0.5,
    duration: 6.4,
    delay: 0,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

gsap.to(".card-02", {
    y: 11,
    x: -7,
    rotation: -0.6,
    duration: 5.8,
    delay: 0.35,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

gsap.to(".card-03", {
    y: -13,
    x: 7,
    rotation: 0.6,
    duration: 6.9,
    delay: 0.7,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

gsap.to(".card-04", {
    y: 12,
    x: 5,
    rotation: -0.5,
    duration: 6.1,
    delay: 0.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

gsap.to(".card-05", {
    y: -11,
    x: -6,
    rotation: 0.4,
    duration: 6.6,
    delay: 0.55,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

gsap.to(".card-06", {
    y: 10,
    x: 7,
    rotation: -0.7,
    duration: 5.9,
    delay: 0.9,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

/* =========================================
   CARD HOVER EASE
========================================= */

document.querySelectorAll(".visual-card").forEach((card) => {

    const media = card.querySelector(".card-media");
    const image = card.querySelector(".card-image");
    const focusFrame = card.querySelector(".focus-frame");
    const corners = card.querySelectorAll(".focus-corner");


    /* -----------------------------
       MOUSE ENTER
    ----------------------------- */
    card.addEventListener("mouseenter", () => {

        /* 카드가 앞으로 살짝 떠오름 */
        gsap.to(media, {
            y: -4,
            scale: 1.012,

            duration: 0.5,
            ease: "power3.out",

            overwrite: "auto"
        });


        /* 내부 이미지는 아주 미세하게 확대 */
        gsap.to(image, {
            scale: 1.008,

            duration: 0.75,
            ease: "power2.out",

            overwrite: "auto"
        });


        /* 포커스 프레임 등장 */
        if (focusFrame) {
            gsap.to(focusFrame, {
                opacity: 1,
                scale: 1,

                duration: 0.4,
                ease: "power2.out",

                overwrite: "auto"
            });
        }


        /* 모서리가 바깥으로 살짝 열림 */
        corners.forEach((corner) => {

            let x = 0;
            let y = 0;

            if (corner.classList.contains("top-left")) {
                x = -4;
                y = -4;
            }

            if (corner.classList.contains("top-right")) {
                x = 4;
                y = -4;
            }

            if (corner.classList.contains("bottom-left")) {
                x = -4;
                y = 4;
            }

            if (corner.classList.contains("bottom-right")) {
                x = 4;
                y = 4;
            }

            gsap.to(corner, {
                x: x,
                y: y,

                duration: 0.45,
                ease: "power3.out",

                overwrite: "auto"
            });

        });

    });


    /* -----------------------------
       MOUSE LEAVE
    ----------------------------- */
    card.addEventListener("mouseleave", () => {

        /* 카드 원위치 */
        gsap.to(media, {
            y: 0,
            scale: 1,

            duration: 0.7,
            ease: "power2.inOut",

            overwrite: "auto"
        });


        /* 이미지 원위치 */
        gsap.to(image, {
            scale: 1,

            duration: 0.75,
            ease: "power2.inOut",

            overwrite: "auto"
        });


        /* 프레임 사라짐 */
        if (focusFrame) {
            gsap.to(focusFrame, {
                opacity: 0,

                duration: 0.35,
                ease: "power1.out",

                overwrite: "auto"
            });
        }


        /* 모서리 원위치 */
        gsap.to(corners, {
            x: 0,
            y: 0,

            duration: 0.6,
            ease: "power2.inOut",

            overwrite: "auto"
        });

    });

});
