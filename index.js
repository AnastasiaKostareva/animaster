addListeners();

function addListeners() {
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().addFadeIn(5000).play(block);
        });

    document.getElementById('fadeOutPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeOutBlock');
            animaster().addFadeOut(5000).play(block);
        });

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            animaster().addMove(1000, { x: 100, y: 10 }).play(block);
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animaster().addScale(1000, 1.25).play(block);
        });

    document.getElementById('moveAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            let controller = animaster().addMoveAndHide(1000).play(block);
            document.getElementById('moveAndHideReset')
                .addEventListener('click', function () {
                    controller.reset();
                });
        });

    document.getElementById('showAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('showAndHideBlock');
            animaster().addShowAndHide(1000).play(block);
        });

    document.getElementById('heartBeatingPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock');
            // Запуск бесконечной анимации сердцебиения
            let controller = animaster().addHeartBeating().play(block, true);
            document.getElementById('heartBeatingStop')
                .addEventListener('click', function () {
                    controller.stop();
                });
        });

    const worryAnimationHandler = animaster()
        .addMove(200, { x: 80, y: 0 })
        .addMove(200, { x: 0, y: 0 })
        .addMove(200, { x: 80, y: 0 })
        .addMove(200, { x: 0, y: 0 })
        .buildHandler();

    document.getElementById('worryAnimationBlock')
        .addEventListener('click', worryAnimationHandler);
}

function getTransform(translation, ratio) {
    const result = [];
    if (translation) {
        result.push(`translate(${translation.x}px,${translation.y}px)`);
    }
    if (ratio) {
        result.push(`scale(${ratio})`);
    }
    return result.join(' ');
}

function animaster() {
    function resetFadeIn(element) {
        element.classList.remove('show');
    }

    function resetFadeOut(element) {
        element.classList.remove('hide');
    }

    function resetMoveAndScale(element) {
        element.style.transitionDuration = null;
        element.style.transform = null;
    }

    function fadeIn(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    function fadeOut(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.add('hide');
        element.classList.remove('show');
    }

    function move(element, duration, translation) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(translation, null);
    }

    function scale(element, duration, ratio) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(null, ratio);
    }

    const _steps = [];

    return {
        move: move,
        fadeIn: fadeIn,
        fadeOut: fadeOut,
        scale: scale,

        addMove: function (duration, translation) {
            _steps.push({
                name: "move",
                duration: duration,
                params: translation
            });
            return this;
        },

        addFadeIn: function (duration) {
            _steps.push({
                name: "fadeIn",
                duration: duration
            });
            return this;
        },

        addFadeOut: function (duration) {
            _steps.push({
                name: "fadeOut",
                duration: duration
            });
            return this;
        },

        addScale: function (duration, ratio) {
            _steps.push({
                name: "scale",
                duration: duration,
                params: ratio
            });
            return this;
        },

        addDelay: function (duration) {
            _steps.push({
                name: "delay",
                duration: duration
            });
            return this;
        },

        addMoveAndHide: function (duration) {
            return this.addMove(duration * 0.4, { x: 100, y: 20 })
                .addFadeOut(duration * 0.6);
        },

        addShowAndHide: function (duration) {
            return this.addFadeIn(duration / 3)
                .addDelay(duration / 3)
                .addFadeOut(duration / 3);
        },

        addHeartBeating: function () {
            return this.addScale(500, 1.4)
                .addScale(500, 1);
        },

        play: function (element, cycled = false) {
            let timerIds = [];
            let intervalId = null;

            const originalState = {
                transform: element.style.transform,
                transitionDuration: element.style.transitionDuration,
                className: element.className
            };

            const runSteps = () => {
                let cumulativeTime = 0;
                _steps.forEach((step) => {
                    const timerId = setTimeout(() => {
                        switch (step.name) {
                            case "move":
                                move(element, step.duration, step.params);
                                break;
                            case "fadeIn":
                                fadeIn(element, step.duration);
                                break;
                            case "fadeOut":
                                fadeOut(element, step.duration);
                                break;
                            case "scale":
                                scale(element, step.duration, step.params);
                                break;
                            case "delay":
                                break;
                        }
                    }, cumulativeTime);
                    timerIds.push(timerId);
                    cumulativeTime += step.duration;
                });
                return cumulativeTime;
            };

            let totalTime = runSteps();

            if (cycled) {
                intervalId = setInterval(() => {
                    runSteps();
                }, totalTime);
            }

            return {
                stop: function () {
                    timerIds.forEach(clearTimeout);
                    if (intervalId) {
                        clearInterval(intervalId);
                    }
                },
                reset: function () {
                    this.stop();
                    if (originalState.className.indexOf('hide') !== -1) {
                        resetFadeIn(element);
                    } else {
                        resetFadeOut(element);
                    }
                    resetMoveAndScale(element);
                    element.style.transform = originalState.transform;
                    element.style.transitionDuration = originalState.transitionDuration;
                    element.className = originalState.className;
                }
            };
        },

        buildHandler: function (cycled = false) {
            const self = this;
            return function () {
                self.play(this, cycled);
            };
        }
    };
}
