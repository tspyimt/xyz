'use strict';

/* Directives */


angular.module('myApp.directives', []).
    directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }]).
    directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;
                element.bind('change', function (e) {
                    e.preventDefault();
                    scope.fileChosen = element[0].files[0];
                    var _URL = window.URL || window.webkitURL;
                    var file = element[0].files[0];
                    if (scope.fileChosen)
                        scope.mediaSelected = true;
                    scope.$apply(function () {
                        modelSetter(scope, file);
                    });
                });
            }
        };
    }]).
    directive('creatorKey', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.inputmask("****-****-****-****",
                    {
                        onincomplete: function () {
                            $(this).val('');
                        }
                    });
                function verifyCreatorKey(e) {

                    var str = this.value;
                    str = str.replace(/[^0-9a-zA-Z]+/g, '');
                    if (str.length == 16) {
                        scope.checkValidCreatorKey(str);
                    } else {
                        $('#privatekeyhide').hide();
                        $('#privateIcon').removeClass('chkGreen').addClass('chkRed');
                        $('#creatorIcon').removeClass('chkGreen').addClass('chkRed');
                        element.addClass('form-error-field');
                    }
                    scope.$apply();
                }

                element.bind('change', verifyCreatorKey);
                element.bind('keyup', verifyCreatorKey);
            }
        };
    }]).
    directive('tradeKey', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.inputmask("****-****-****-****",
                    {
                        onincomplete: function () {
                            $(this).val('');
                        }
                    });
                function verifyCreatorKey(e) {

                    var str = this.value;
                    str = str.replace(/[^0-9a-zA-Z]+/g, '');
                    if (str.length == 16) {
                        scope.checkValidTradeKey(str);
                    } else {
                        $('#tradekeyhide').hide();
                        $('#tradeIcon').removeClass('chkGreen').addClass('chkRed');
                        element.addClass('form-error-field');
                        scope.keyMatch = false;
                    }
                    scope.$apply();
                }

                element.bind('change', verifyCreatorKey);
                element.bind('keyup', verifyCreatorKey);
            }
        };
    }]).

    directive('transferKey', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.inputmask("****-****-****-****",
                    {
                        onincomplete: function () {
                            $(this).val('');
                        }
                    });
                element.bind('keyup', function (e) {

                    //this.value = this.value.replace(/[^0-9\-]/g,'');
                    var str = this.value;
                    str = str.replace(/[^0-9a-zA-Z]+/g, '');
                    if (str.length == 16) {
                        scope.checkValidTransferKey(str);
                    } else {
                        $('#transferIcon').removeClass('chkGreen').addClass('chkRed');
                        element.addClass('form-error-field');
                    }
                    scope.$apply();
                });
            }
        };
    }]).
    directive('collapsible', [ function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var $mainEl = element.find(".purchase").eq(0);
                $mainEl.off('click').on('click', function () {
                    var $el = $mainEl.siblings('ul.playlist').eq(0);
                    angular.element("ul.playlist").not($el).stop().slideUp("slow");
                    $el.stop().slideToggle('slow');
                    element.toggleClass("active").siblings(".tableRow").removeClass("active");
                });
            }
        };
    }]).
    directive('mediaPopup', [ function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                setTimeout(function () {
                    if (element.hasClass('view-audio')) {
                        element.on('click', function () {
                            $('#media-audio-popup').children('audio').find('source').attr('src', $(this).data('source'));
                            $('.media-popup').width($('.page-main').width() - 240);
                            $('.media-popup').css('margin-left', '120px');
                        });
                        element.magnificPopup({
                            type: 'inline',
                            midClick: true
                        });
                    }
                    if (element.hasClass('view-video')) {
                        element.on('click', function () {
                            $('#media-video-popup').children('video').find('source').attr('src', $(this).data('source'));
                            $('.media-popup').width($('.page-main').width() - 240);
                            $('.media-popup').css('margin-left', '120px');
                        });
                        element.magnificPopup({
                            type: 'inline',
                            midClick: true
                        });
                    }
                    if (element.hasClass('view-picture')) {
                        element.on('click', function () {
                            $('#media-picture-popup').children('img').attr('src', $(this).data('source'));
                            $('.media-popup').width($('.page-main').width() - 240);
                            $('.media-popup').css('margin-left', '120px');
                        });
                        element.magnificPopup({
                            type: 'inline',
                            midClick: true
                        });
                    }
                }, 100);
            }
        };
    }]).
    directive('mediaPlayer', [ function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.off().on('click touchstart', function () {
                    $('body').load('/views/user/media-viewer.html');
                    $('body').removeClass('cbp-spmenu-push');
                    $('body').removeClass('cbp-spmenu-push-toleft');
                });
            }
        };
    }]).
    directive('thumbnailOverlay', [  function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                element.off('mouseenter').on('mouseenter', function () {
                    $(this).children('a').next('.shadow').stop(true, false).fadeTo(1000, 1);
                });

                element.off('mouseleave').on('mouseleave', function () {
                    $(this).children('a').next('.shadow').stop(true, false).fadeTo(400, 0);
                });
            }
        };
    }]).
    directive('stillLocationTimestamp', [function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.inputmask("99-99-99", {
                    onincomplete: function () {
                        $(this).val('');
                    }
                });
            }
        };
    }]).
    directive('creatorKey', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.inputmask("****-****-****-****",
                    {
                        onincomplete: function () {
                            $(this).val('');
                        }
                    });
                element.bind('keyup', function (e) {

                    //this.value = this.value.replace(/[^0-9\-]/g,'');
                    var str = this.value;
                    str = str.replace(/[^0-9a-zA-Z]+/g, '');
                    if (str.length == 16) {
                        scope.checkValidCreatorKey(str);
                    } else {
                        $('#privatekeyhide').hide();
                        $('#privateIcon').removeClass('chkGreen').addClass('chkRed');
                        $('#creatorIcon').removeClass('chkGreen').addClass('chkRed');
                        element.addClass('form-error-field');
                    }
                    scope.$apply();
                });
            }
        };
    }]);