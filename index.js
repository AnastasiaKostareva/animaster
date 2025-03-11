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
            animaster().addMove(1000, {x: 100, y: 10}).play(block);
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animaster().addScale(1000, 1.25).play(block);
        });

    document.getElementById('moveAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            let x = animaster().addMoveAndHide(1000).play(block);

            document.getElementById('moveAndHideReset')
                .addEventListener('click', function () {
                    const block = document.getElementById('moveAndHideBlock');
                    x.reset();
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
            let x = animaster().addHeartBeating().play(block);

            document.getElementById('heartBeatingStop')
                .addEventListener('click', function () {
                    const block = document.getElementById('heartBeatingBlock');
                    x.stop();
                });
        });
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

let currentBeat = false;

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

    function moveAndHide(element, duration) {
        move(element, duration * 2 / 5, {x: 100, y: 20});
        setTimeout(() => fadeOut(element, duration * 3 / 5), duration * 2 / 5);

        return {
            reset: () => {
                resetFadeOut(element);
                resetMoveAndScale(element);
            }
        }
    }

    function showAndHide(element, duration) {
        setTimeout(() => fadeIn(element, duration * 1 / 3), duration * 1 / 3);
        setTimeout(() => fadeOut(element, duration * 1 / 3), duration * 2 / 3);
    }

    function heartBeating(element) {
        let a = setInterval(() => {
            if (!currentBeat) {
                scale(element, 500, 1.4);
                currentBeat = true;
            } else {
                scale(element, 500, 1);
                currentBeat = false;
            }
        }, 500);

        return {
            stop: () => {
                clearInterval(a);
            }
        }
    }

    function move(element, duration, translation) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(translation, null);
    }

    function scale(element, duration, ratio) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(null, ratio);
    }

    return {
        _steps: [],

        addMove: function (duration, translation) {
            this._steps.push({
                elementaryOperation: "move",
                stepDuration: duration,
                params: translation
            });
            return this;
        },

        addFadeIn: function (duration) {
            this._steps.push({
                elementaryOperation: "fadeIn",
                stepDuration: duration,
                params: undefined
            });
            return this;
        },

        addFadeOut: function (duration) {
            this._steps.push({
                elementaryOperation: "fadeOut",
                stepDuration: duration,
                params: undefined
            });
            return this;
        },

        addMoveAndHide: function (duration) {
            this._steps.push({
                elementaryOperation: "moveAndHide",
                stepDuration: duration,
                params: undefined
            });
            return this;
        },

        addShowAndHide: function (duration) {
            this._steps.push({
                elementaryOperation: "showAndHide",
                stepDuration: duration,
                params: undefined
            });
            return this;
        },

        addScale: function (duration, ratio) {
            this._steps.push({
                elementaryOperation: "scale",
                stepDuration: duration,
                params: ratio
            });
            return this;
        },

        addHeartBeating: function () {
            this._steps.push({
                elementaryOperation: "heartBeating",
                stepDuration: undefined,
                params: undefined
            });
            return this;
        },


        play: function (element) {
            let control;
            for (let step of this._steps) {
                let method;
                switch (step.elementaryOperation) {
                    case "move":
                        method = move;
                        break;
                    case "fadeIn":
                        method = fadeIn;
                        break;
                    case "fadeOut":
                        method = fadeOut;
                        break;
                    case "moveAndHide":
                        method = moveAndHide;
                        break;
                    case "showAndHide":
                        method = showAndHide;
                        break;
                    case "scale":
                        method = scale;
                        break;
                    case "heartBeating":
                        method = heartBeating;
                        break;
                }
                control = method(element, step.stepDuration, step.params);
            }
            return control;
        }


    }
}