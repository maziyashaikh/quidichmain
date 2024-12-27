   document.addEventListener("DOMContentLoaded", () => {
    const shimmerWave = document.getElementById("shimmerWave");
    const video = document.getElementById("preloaderVideo");
    const preloader = document.getElementById("preloader");
    const progressBar = document.getElementById("progressBar");
    const leftBlob = document.querySelector(".blob.left");
    const rightBlob = document.querySelector(".blob.right");
    const firstVideoContainer = document.getElementById("firstVideoContainer");
    const secondVideoContainer = document.getElementById("secondVideoContainer");
    const scrollVideo1 = document.getElementById("scrollVideo1");
    const scrollVideo2 = document.getElementById("scrollVideo2");

    let firstVideoEnded = false;
    let isPaused = false;
    let currentPauseIndex = 0;
    let lastKnownScrollPosition = 0;
    let ticking = false;

    const pausePoints = [
        { time: 19, textId: "text-1" },
        { time: 28, textId: "text-2" },
        { time: 39, textId: "text-3" },
        { time: 43, textId: "text-4" },
        { time: 59, textId: "text-5" },
        { time: 66, textId: "text-6" },
    ];
    function disableScroll() {
        document.body.style.overflow = "hidden";
    }
    function enableScroll() {
        document.body.style.overflow = "";
    }
    function splitTextToSpans(element) {
        const text = element.textContent.trim();
        element.innerHTML = "";
        const spans = text.split("").map((char) => {
            const span = document.createElement("span");
            span.textContent = char === " " ? "\u00A0" : char;
            return span;
        });
        spans.forEach((span) => element.appendChild(span));
    }
    function animateBlobs() {
        gsap.timeline({ repeat: -1, yoyo: true })
            .to(leftBlob, { y: "-50vh", duration: 6, ease: "power1.inOut" })
            .to(leftBlob, { y: "50vh", duration: 6, ease: "power1.inOut" });

        gsap.timeline({ repeat: -1, yoyo: true })
            .to(rightBlob, { y: "50vh", duration: 6, ease: "power1.inOut" })
            .to(rightBlob, { y: "-50vh", duration: 6, ease: "power1.inOut" });
    }
    function animateText() {
        splitTextToSpans(shimmerWave);
        const timeline = gsap.timeline();
        timeline
            .to("#shimmerWave span", {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.05,
            })
            .to("#shimmerWave", {
                scale: 0.5,
                y: -window.innerHeight,
                duration: 1,
                ease: "power3.in",
                onComplete: () => {
                    gsap.to(video, {
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        opacity: 1,
                        duration: 1,
                        ease: "power3.out",
                        onStart: () => {
                            video.classList.remove("hidden");
                            video.play();
                        },
                        onComplete: () => startProgressBar(),
                    });
                },
            });
    }
    function startProgressBar() {
        video.addEventListener("timeupdate", () => {
            const progress = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${progress}%`;
        });
        video.addEventListener("ended", () => {
            gsap.to(preloader, {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    preloader.style.display = "none";
                    enableScroll();
                },
            });
        });
    }
    function handleFirstVideoScroll() {
    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    let ticking = false;
    let targetTime = 0; 
    let currentTime = 0; 
    const smoothFactor = 0.1; // Adjust for smoother easing (0.1–0.3 recommended)

    function updateVideoTime() {
        currentTime += (targetTime - currentTime) * smoothFactor;
        scrollVideo1.currentTime = currentTime;

        if (Math.abs(currentTime - targetTime) > 0.01) {
            requestAnimationFrame(updateVideoTime);
        }
    }

    window.addEventListener('scroll', () => {
        const scrollPercentage = window.scrollY / scrollHeight;
        if (!firstVideoEnded) {
            targetTime = scrollPercentage * scrollVideo1.duration;
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(() => {
                    updateVideoTime();
                    ticking = false;
                });
            }
        }
        if (scrollPercentage >= 1) {
            firstVideoEnded = true;
            scrollVideo1.pause();
            firstVideoContainer.style.display = 'none';
            secondVideoContainer.style.display = 'block';
            scrollVideo2.play();
            manageSecondVideoWithPauses();
        }
    });
}

    function manageSecondVideoWithPauses() {
        scrollVideo2.addEventListener("timeupdate", () => {
            if (
                currentPauseIndex < pausePoints.length &&
                scrollVideo2.currentTime >= pausePoints[currentPauseIndex].time &&
                !isPaused
            ) {
                scrollVideo2.pause();
                isPaused = true;
                const { textId } = pausePoints[currentPauseIndex];
                const textElement = document.getElementById(textId);
                const progressBar = document.getElementById(`timeline-${textId.split("-")[1]}`);
                if (textElement) {
                    textElement.style.display = "block";
                    textElement.style.opacity = 1;
                    if (progressBar) progressBar.style.width = "100%";
                }
            }
        });
        window.addEventListener("scroll", () => {
            if (isPaused && currentPauseIndex < pausePoints.length) {
                const { textId } = pausePoints[currentPauseIndex];
                const textElement = document.getElementById(textId);
                if (textElement) {
                    textElement.style.opacity = 0;
                    textElement.style.display = "none";
                }
                isPaused = false;
                scrollVideo2.play();
                currentPauseIndex++;
            }
        });
    }
    function initializePreloader() {
        disableScroll();
        animateBlobs();
        animateText();
    }
    initializePreloader();
    handleFirstVideoScroll();
});
