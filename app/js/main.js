(function($){
    "use strict";
    $.fn.extend({ 
        pCarousel: function(options) {

            //Settings list and the default values
            var defaults = {
                    maxWidth: '900px', //100%// px or em or %
                    maxHeight: 'max', // auto or full or max
                    prevControl: '.pCarousel-control-prev',
                    nextControl: '.pCarousel-control-next',
                    pagerControl: '.pCarousel-pager',
                    initVisible: 0,
                    displaySlides: 2,
                    moveSlides: 1,
                    aniamtion: 'slide', //fadeIn 
                    animationTiming: 'ease', //ease
                    animationTime: 1000
                },
                options = $.extend(defaults, options),
                itemLength = -1,
                currentVisible = -1,
                oldVisible = new Array(),
                oldNext = new Array(),
                oldPrev = new Array(),
                maxWidthItem = -1,
                unit = '%',
                inAnimation = false,
                usedPager = false;

        
            var setHeight = function() {
                var children    = options.$item,
                    maxHeight   = 0,
                    i           = 0;

                switch (options.maxHeight) {
                    case 'max':
                        for (; i < itemLength; i++) {
                            var $child  = options.$item.eq(i),
                                $height = parseInt($child.height(), 10);

                            maxHeight = Math.max(maxHeight, $height);
                        }
                        
                        options.$item.not('[data-pCarousel-ignore="true"]').css({ 'height': maxHeight });
                        options.$list.css({ 'height': maxHeight });
                    break;

                    case 'full':
                        $(window).trigger('resize');
                        options.$item.not('[data-pCarousel-ignore="true"]').addClass('full-height');
                        options.$list.addClass('full-height');
                    break;
                } 
            };

            var setWidth = function() {

                options.$list.css('width', options.maxWidth);  
            };

            var reSetVisible = function(currentWork) {
                var i = 0;

                for (; i < (options.displaySlides + options.moveSlides); i++) {
                    if (!currentWork[i][4]) {
                        options.$item.eq(currentWork[i][0]).removeClass('show');
                    }

                    options.$item.eq(currentWork[i][0]).css({
                        transitionDuration: '',
                        transitionTimingFunction: ''
                    });

                }
            };

            var setVisible = function(val, up) {
                if (up) {
                    return jQuery.inArray(val, oldNext) >= 0
                } else {
                    return jQuery.inArray(val, oldPrev) >= 0
                }
            };

            //currentWork = [imageIndex, from, to, isHide, keepShow ]
            var executeAnimation = function(currentWork) {
                var i = 0;

                for (; i < currentWork.length; i++) {
                    if (currentWork[i][3]) {
                        options.$item.eq(currentWork[i][0]).css('left', currentWork[i][1] + unit).addClass('show');
                    }
                }

                if (usedPager) {
                    fadeInAnimation(currentWork);
                } else {

                    switch (options.aniamtion) {
                        case 'slide':
                            slideAnimation(currentWork);
                        break;

                        case 'slideBack':
                            slideBackAnimation(currentWork);
                        break;

                        default :
                            fadeInAnimation(currentWork);
                        break;
                    }
                }
            };

            var slideBackAnimation = function(currentWork) {
                var i = 0;

                slideBackAnimationHelper(currentWork, 0.7, 0.9);

                slideAnimation(currentWork)

                setTimeout(function() { 
                    i = 0;
                    for (; i < currentWork.length; i++) {
                        slideBackAnimationHelper(currentWork, 1, 1);
                    }
                }, (options.animationTime * (2/3)));
            };

            var slideBackAnimationHelper = function(currentWork, val0, val1) {
                var i = 0;
                for (; i < currentWork.length; i++) {
                    options.$item.eq(currentWork[i][0]).css({
                        transitionDuration: options.animationTime + 'ms',
                        transitionTimingFunction: options.animationTiming,
                        transform: 'scale(' + val0 + ', ' + val1 + ')'
                    });
                }
            };

            var slideAnimation = function(currentWork) {
                var i = 0;

                setTimeout(function() { 
                    for (; i < currentWork.length; i++) {
                        options.$item.eq(currentWork[i][0]).css({
                            transitionDuration: options.animationTime + 'ms',
                            transitionTimingFunction: options.animationTiming,
                            left: currentWork[i][2] + unit
                        });
                    }
                }, 100);
            };

            var fadeInAnimation = function(currentWork) {
                var i = 0;

                for (; i < currentWork.length; i++) {
                    options.$item.eq(currentWork[i][0]).css({
                        left: currentWork[i][2] + unit,
                        opacity: 0
                    });
                }

                i = 0;

                setTimeout(function() { 
                    for (; i < currentWork.length; i++) {
                        options.$item.eq(currentWork[i][0]).css({
                            transitionDuration: options.animationTime + 'ms',
                            transitionTimingFunction: options.animationTiming,
                            opacity: 1
                        });
                    }
                }, 100);
            };

            var resetAnimation = function(currentWork) {
                options.$item.eq(currentWork[currentWork.length - 1][0]).one("transitionend", function(){
                    reSetVisible(currentWork);

                    setTimeout(function() { 
                        inAnimation = false;
                        //console.log('listo');
                    }, 400);
                });
            };

            var handleVisible = function(up, prev, next) {
                var currentWork = new Array();
                inAnimation = true;

                if (up) {
                    currentWork = defineFromTo(up, prev);  
                } else {
                    currentWork = defineFromTo(up, next);  
                }

                executeAnimation(currentWork);

                resetAnimation(currentWork);
            };

            var defineFromTo = function(up, q) {
                var from = 0,
                    to = 0,
                    i = 0,
                    diff = 0,
                    currentWorkPosition = -1,
                    keepShow = false,
                    currentWork = new Array();

                diff = maxWidthItem * options.moveSlides;

                for (; i < (options.displaySlides + options.moveSlides); i++) {
                    from = maxWidthItem * i;
                    to =  from - diff;

                    if (up) {
                        if (i < options.moveSlides) {
                            currentWorkPosition = q[i];
                            keepShow = false;
                        } else {
                            currentWorkPosition = currentVisible[i - options.moveSlides];
                            keepShow = true;
                        }
                        currentWork[i] = [currentWorkPosition, from, to, setVisible(currentWorkPosition, up), keepShow];
                    } else {
                        if (i < options.displaySlides) {
                            currentWorkPosition = currentVisible[i];
                            keepShow = true;
                        } else {
                            currentWorkPosition = q[i - options.displaySlides];
                            keepShow = false;
                        }
                        currentWork[i] = [currentWorkPosition, to, from, setVisible(currentWorkPosition, up), keepShow];
                    }
                }

                return currentWork;
            };

            var setControllerActive = function() {
                var i = 0,
                    $chil = options.$el.find(options.pagerControl).children();

                    $chil.removeClass('active');
                for (; i < currentVisible.length; i++) {
                    $chil.eq(currentVisible[i]).toggleClass('active');
                }
            };

            var createController = function() {
                var fragment = document.createDocumentFragment(),
                    li,
                    span,
                    i = 0;

                for(; i < itemLength; i++) {
                    li = fragment.appendChild(document.createElement('li'));
                    span = li.appendChild(document.createElement('span'));
                    $(span).attr('href', '#');
                }

                options.$el.find(options.pagerControl)[0].appendChild(fragment);
            };

            /* behavior*/
            var calcVisibles = function(first, up) {
                var prev = calcPrev(currentVisible),
                    next = calcNext(currentVisible),
                    i = 0,
                    j = 0;

                if (first) {
                    for (; i < options.displaySlides; i++) {
                        options.$item.eq(currentVisible[i]).addClass('show')
                                                           .css('left', (i*maxWidthItem) + unit);
                    }

                    //console.log(prev + '////' + currentVisible + '////' + next);
                } else {
                    
                    // console.log(oldPrev + '||||' + oldVisible + '||||' + oldNext)
                    console.log(prev + '////' + currentVisible + '////' + next);

                    handleVisible(up, prev, next);
                }

                for (; j < options.displaySlides; j++) {
                    oldVisible[j] = currentVisible[j];   
                }

                j = 0;

                for (; j < options.moveSlides; j++) {
                    oldPrev[j] = prev[j];   
                    oldNext[j] = next[j];   
                }

                setControllerActive();
            };

            var calcCentral = function(up, pagerNum) {
                var r, 
                    i = 0;

                if (pagerNum > -1) {
                    r = pagerNum;
                } else {
                    if (up) {
                        r = currentVisible[0] + options.moveSlides;
                    } else {
                        r = currentVisible[0] - options.moveSlides;
                    }
                }
                
                for (; i < options.displaySlides; i++) {
                    currentVisible[i] = r = resetCount(r);
                    r++;
                }
            };

            var calcPrev = function(val) {
                
                var newSlides = [],
                    r = val[0];

                for (var i = options.moveSlides; i > 0; i--) {
                    r = resetCount(--r);
                    newSlides[i-1] = r;
                }
                return newSlides;
            };

            var calcNext = function(val) {

                var newSlides = [],
                    r = val[options.displaySlides-1];

                for (var i = 0; i < options.moveSlides; i++) {
                    r = resetCount(++r);
                    newSlides[i] = r;
                }
                return newSlides;
            };

            var resetCount = function(val) {
                if (val < 0) {
                    val = itemLength + val; //val is already a negative number then will be ( + plus - equal + ) 

                }
                else if (val >= itemLength){
                    val = val - itemLength;
                }

                return val;
            };
            /* behavior */

            /* events */
            var prev = function() {
                if (!inAnimation) {
                    calcCentral(false, -1);
                    calcVisibles(false, false);
                }
            };

            var next = function() {
                if (!inAnimation) {
                    calcCentral(true, -1);
                    calcVisibles(false, true);
                }
            };

            var pager = function() {
                var i = 0,
                    $chil = options.$el.find(options.pagerControl).children();

                var f = $(this).index();

                var d = currentVisible;

                if (!inAnimation) {
                    usedPager = true;
                    calcCentral(true, f);
                    calcVisibles(false, true);
                    usedPager = false;
                }

            };

            $(window).resize(function(){

                $('.pCarousel-wrapper').height($(document).height());
            });
            /* events */

            var createArray = function() {
                var auxCurrentVisible = options.initVisible;
                currentVisible = [options.initVisible];

                for (var i=1; i < options.displaySlides; i++) {
                    auxCurrentVisible = resetCount(++auxCurrentVisible);
                    currentVisible[i] = auxCurrentVisible;
                }
            };

            var init = function() {
                createController();
                setHeight();
                setWidth();
                createArray(); //create the first array the central
                maxWidthItem = 100 / options.displaySlides;
                options.$item.css('width', maxWidthItem + unit);

                calcVisibles(true); //calc the others arrays


                setControllerActive();
            };

            var validate = function() {
                if (options.displaySlides > 0 && 
                    options.moveSlides > 0 && 
                    itemLength > options.initVisible  &&
                    options.displaySlides >= options.moveSlides &&
                    (options.displaySlides + options.moveSlides) <= itemLength) {

                    return true;
                } else {
                    return false;
                }
            };

            return this.each(function() {
                options.$el = $(this),
                options.$list = options.$el.children('.pCarousel-list'),
                options.$item = options.$list.children(),
                itemLength = options.$item.length;

                /*validar*/
                if (validate()) {

                    init();
                
                    options.$el.find(options.prevControl).on('click', prev);
                    options.$el.find(options.nextControl).on('click', next);
                    options.$el.find(options.pagerControl).on('click', 'li', pager);

                } else {
                    console.log('check values');
                }
                /*validar*/
            });
        }
    });
})(jQuery);