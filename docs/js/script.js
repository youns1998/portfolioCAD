document.addEventListener("DOMContentLoaded", () => {

    const animatedElements =
        document.querySelectorAll(".animate-on-scroll");


    const checkAnimatedElements = () => {

        animatedElements.forEach((element) => {

            const rect =
                element.getBoundingClientRect();


            if (rect.top < window.innerHeight * 0.85) {

                element.classList.add("visible");

            }

        });

    };


    window.addEventListener(
        "scroll",
        checkAnimatedElements,
        { passive: true }
    );


    checkAnimatedElements();

});