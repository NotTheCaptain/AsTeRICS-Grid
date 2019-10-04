import { L } from "../util/lquery.js";
import $ from 'jquery';
import {inputEventHandler} from "./inputEventHandler";
import {util} from "../util/util";
import {speechService} from "../service/speechService";
import {i18nService} from "../service/i18nService";
import {MainVue} from "../vue/mainVue";
import {stateService} from "../service/stateService";
import {constants} from "../util/constants";

function Hover(itemSelector, hoverTimeoutMs, hoverActiveClass, demoMode) {
    var thiz = this;
    var _itemSelector = itemSelector;
    var _hoverTimeoutMs = hoverTimeoutMs || 1000;
    let _demoMode = demoMode;
    var _selectionListener = null;

    var _hoverMap = {};
    let _elements = [];
    let _lastElement = null;
    let _lastTouchEvent = null;
    let _touchElementHidden = false;
    let _inputEventHandler = null;

    function mouseEnter(event, targetParam) {
        var target = targetParam || this;
        event.preventDefault();
        onElement(target);
        _lastElement = target;
        _lastTouchEvent = event;
    }

    function mouseLeave(event, targetParam) {
        if (!_touchElementHidden) {
            return;
        }
        var target = targetParam || this;
        event.preventDefault();
        offElement(target);
    }

    function mouseMove(event) {
        if (!_touchElementHidden) {
            setTouchElementVisibility(false);
        }
        util.debounce(() => {
            setTouchElementVisibility(true);
        }, _hoverTimeoutMs + 10, 'hovering-mouseMove');
    }

    function mouseUp() {
        offElement(_lastElement);
    }

    function touchStart(event) {
        let element = getTouchEventElement(event);
        onElement(element);
        _lastElement = element;
    }

    function touchEnd(event) {
        offElement(_lastElement);
    }

    function touchMove(event) {
        if (!_demoMode) {
            event.preventDefault();
        }
        util.throttle(() => {
            let element = getTouchEventElement(event);
            onElement(element);
            _lastElement = element;
            _lastTouchEvent = event;
        }, [], 50, 'hovering-touchmove');
    }

    function clickHandler(event) {
        speechService.speak(i18nService.translate('speech output activated // Sprachausgabe aktiviert'));
        MainVue.clearTooltip();
        stateService.setState(constants.STATE_ACTIVATED_TTS, true);
        setTouchElementVisibility(true);
        _elements.forEach(function (item) {
            item.removeEventListener('click', clickHandler);
        });
    }

    function onElement(element) {
        if (_lastElement && _lastElement !== element) {
            offElement(_lastElement);
        }
        if (!element || _hoverMap[element]) {
            return;
        }
        L.addClass(element, 'mouseentered');
        _hoverMap[element] = setTimeout(function () {
            if (_selectionListener) {
                _selectionListener(element);
            }
        }, _hoverTimeoutMs);
    }

    function offElement(element) {
        if (!element) {
            return;
        }
        L.removeClass(element, 'mouseentered');
        clearTimeout(_hoverMap[element]);
        _hoverMap[element] = null;
        _lastElement = null;
    }

    function getTouchEventElement(event) {
        if (event.touches && event.touches.length === 0) {
            event = _lastTouchEvent;
        }
        if (!event) {
            log.warn('no event');
            return;
        }
        let x = event.touches ? event.touches[0].pageX : event.pageX || event.clientX;
        let y = event.touches ? event.touches[0].pageY : event.pageY || event.clientY;
        return util.getElement(_elements, x, y);
    }

    function setTouchElementVisibility(visible) {
        _touchElementHidden = !visible;
        if (!_demoMode) {
            if (visible) {
                $('#touchElement').show();
            } else {
                $('#touchElement').hide();
            }
        }
    }

    thiz.startHovering = function () {
        _elements = L.selectAsList(_itemSelector);
        let alreadyActivatedTTS = stateService.getState(constants.STATE_ACTIVATED_TTS);
        if (speechService.speechSupported() && !alreadyActivatedTTS && !_demoMode) {
            MainVue.setTooltip(i18nService.translate('Tap/click on any element to activate speech output // Klicken/tippen Sie auf ein beliebiges Element um Sprachausgabe zu aktivieren'));
            stateService.onStateChanged(constants.STATE_ACTIVATED_TTS, (acivatedTTS) => {
                if (acivatedTTS) {
                    MainVue.clearTooltip();
                }
            });
            _elements.forEach(function (item) {
                item.addEventListener('click', clickHandler);
            });
        } else {
            setTouchElementVisibility(true);
        }
        _elements.forEach(function (item) {
            item.addEventListener('mouseenter', mouseEnter);
            item.addEventListener('mouseleave', mouseLeave);
            item.addEventListener('mouseup', mouseUp);
        });
        _inputEventHandler = inputEventHandler.instance();
        _inputEventHandler.onTouchStart(touchStart);
        _inputEventHandler.onTouchEnd(touchEnd);
        _inputEventHandler.onTouchMove(touchMove);
        _inputEventHandler.startListening();
        document.addEventListener("mousemove", mouseMove);
    };

    thiz.destroy = function () {
        util.clearDebounce('hovering-mouseMove');
        _elements.forEach(function (item) {
            item.removeEventListener('mouseenter', mouseEnter);
            item.removeEventListener('mouseleave', mouseLeave);
            item.removeEventListener('mouseup', mouseUp);
            item.removeEventListener('click', clickHandler);
        });
        _inputEventHandler.destroy();
        document.removeEventListener("mousemove", mouseMove);
        Object.keys(_hoverMap).forEach(key => {
            clearTimeout(_hoverMap[key]);
        });
        stateService.clearListeners(constants.STATE_ACTIVATED_TTS);
    };

    thiz.setHoverTimeout = function (timeoutMs) {
        _hoverTimeoutMs = timeoutMs;
    };

    thiz.setSelectionListener = function (fn) {
        _selectionListener = fn;
    };
}


export {Hover};