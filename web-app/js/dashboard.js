var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
var url_pattern = new RegExp(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i);
$(document).ready(function () {

    $(document).on('click', '.btn-change-update', function (event) {
        if ($(this).hasClass('chng-update')) {

            // Validation code for Profile page's each row form
            var errors = [];
            var frm_elements = $(this).parent().parent().find('.editProfile').find('input,select');
            frm_elements.each(function (ele) {
                if ($(this).hasClass('required')) {

                    var val = $(this).val();

                    if ($(this).hasClass('privatekey')) {
                        val = val.replace(/[^0-9a-zA-Z]+/g, '');
                    }

                    if ($(this).val() == '') {
                        if ($(this).prop("tagName").toLowerCase() != 'select') {
                            errors.push($(this).data('label') + ' is required');
                        } else {
                            errors.push('Please Select ' + $(this).data('label'));
                        }
                        if ($(this).prop("tagName").toLowerCase() != 'select') {
                            $(this).removeClass('bg-notify-valid').addClass('bg-notify-invalid');
                        }
                        $(this).addClass('form-error-field');
                    } else {
                        if ($(this).prop("tagName").toLowerCase() != 'select') {
                            $(this).removeClass('bg-notify-invalid').addClass('bg-notify-valid');
                        }
                        $(this).removeClass('form-error-field');
                    }
                }

                if ($(this).hasClass('email')) {
                    emailAddress = $(this).val();

                    if (!pattern.test(emailAddress)) {
                        errors.push($(this).data('label') + ' should be an email address');
                        $(this).removeClass('bg-notify-valid').addClass('bg-notify-invalid');
                        $(this).addClass('form-error-field');
                    } else {
                        $(this).removeClass('bg-notify-invalid').addClass('bg-notify-valid');
                        $(this).removeClass('form-error-field');
                    }
                }

                if ($(this).hasClass('url')) {
                    url = $(this).val();
                    if (!url_pattern.test(url)) {
                        errors.push($(this).data('label') + ' should be an valid URL ');
                        $(this).removeClass('bg-notify-valid').addClass('bg-notify-invalid');
                        $(this).addClass('form-error-field');
                    } else {
                        $(this).removeClass('bg-notify-invalid').addClass('bg-notify-valid');
                        $(this).removeClass('form-error-field');
                    }
                }
            });

            if (errors.length == 0) {
                $(this).parent().parent().children('.editProfile').hide();
                $(this).parent().parent().children('.viewProfile').show();
                $(this).removeClass('chng-update').addClass('chng-change');
                $(this).parents('.profile-box-main').find('.errors').remove();
                $(this).val('Change');

            } else {
                $(this).parents('.profile-box-main').find('.errors').remove();
                $(this).parents('.profile-box-main').prepend('<div class="errors">' + errors.join('<br />') + '</div>');
                $(this).parents('.profile-box-main').find('.errors').show();
            }
        } else if ($(this).hasClass('chng-change')) {
            $(this).parent().parent().children('.viewProfile').hide();
            $(this).parent().parent().children('.editProfile').show();
            $(this).removeClass('chng-change').addClass('chng-update');
            $(this).val('Update');
        }
    });

    $(window).on('resize', function () {
        if ($('#cbp-spmenu-s2').hasClass('cbp-spmenu-open')) {
            if ($(window).width() > 640) {
                $('.page-main').css('width', $(window).width() - $('#cbp-spmenu-s2').width());
                $(body).removeClass('cbp-spmenu-push-toleft');
            } else {
                $('.page-main').css('width', $(window).width());
                $(body).addClass('cbp-spmenu-push-toleft');
            }
        } else {
            $('.page-main').css('width', $(window).width());
        }

    });

    $(document).on('click touchstart', '.leftNav li a.inner_link, .inner-page-change', function (e) {

//        $('.inner-page-change').removeClass('current');
//        $('.inner-page-change').removeClass('currentsub');

        if ($(this).hasClass('transferWorkPageFour')) {

            $('.transfer-work-page1 .errors').remove();
            $('.transfer-work-page1 .transferTypes-Main').before('<div class="errors"></div>');
            var str = $("#privatekeyb").val();
            str = (str || "").replace(/[^0-9a-zA-Z]+/g, '');

            var msg = '';
            $('.transfer-work-page1 .errors').html('');


            if (str.length == 16) {
                $('#privatekeybdiv').removeClass('chkRed').addClass('chkGreen');
                $('#privatekeyb').removeClass('form-error-field');
            } else {
                $('#privatekeybdiv').removeClass('chkGreen').addClass('chkRed');
                $('#privatekeyb').addClass('form-error-field');
                msg += "Private Key is required.<br />";
            }

            emailAddress = $("#privatekeyemail").val();

            if (pattern.test(emailAddress)) {
                $('#privatekeyemaildiv').removeClass('chkRed').addClass('chkGreen');
                $('#privatekeyemail').removeClass('form-error-field');
            } else {
                $('#privatekeyemaildiv').removeClass('chkGreen').addClass('chkRed');
                $('#privatekeyemail').addClass('form-error-field');
                msg += "Buyers Email is required.<br />";
            }

            reEmailAddress = $("#privatekeyreemail").val();

            if (pattern.test(reEmailAddress)) {
                $('#privatekeyreemaildiv').removeClass('chkRed').addClass('chkGreen');
                $('#privatekeyreemail').removeClass('form-error-field');
            } else {
                $('#privatekeyreemaildiv').removeClass('chkGreen').addClass('chkRed');
                $('#privatekeyreemail').addClass('form-error-field');
                msg += "Buyers Re-Email is required.<br />";
            }

            if (reEmailAddress != emailAddress) {
                msg += "Buyers Email and Re-Email should be same.<br />";
            }

            if (msg != '') {
                $('.transfer-work-page1 .errors').show().html(msg);
                $('.transfer-work-page1 .errors').slideDown();
                return false;
            }
            var msg = '';
            $('.transfer-work-page1 .errors').remove();

        }

        if ($(this).prop('id') == '' && !$(this).hasClass('manage-inventory') && !$(this).hasClass('transfer-work-page3') && !$(this).hasClass('trace-page2')) {
            return;
        }

        if (intervalPageChange == false) {
            intervalPageChange = true;

            if (!$(this).hasClass('current') && !$(this).hasClass('currentsub') && $('.inner-container').length == 1) {

                var page_id = $(this).prop('id');

                /*var active = '';
                 if(page_id=='' && $(this).hasClass('manage-inventory')){
                 page_id = 'manage-inventory';
                 }else if(page_id=='' && $(this).hasClass('transfer-work-page3')){
                 page_id = 'transfer-work-page3';
                 }else if(page_id=='' && $(this).hasClass('trace-page2')){
                 page_id = 'trace-page2';
                 }else if($(this).hasClass('inner-page-change')){

                 }else{
                 $(".usermenu").removeClass('maind');
                 $(".mailmenu").removeClass('maind');
                 $(".sub_link").removeClass('currentsub');
                 $('.inner_link').removeClass('current');
                 $('.fnctNav a').removeClass('act');
                 $(this).addClass('current');
                 }

                 if($(this).hasClass('sub_link')){
                 $(".inner_link").removeClass('current');
                 $(".sub_link").removeClass('currentsub');
                 $('.fnctNav a').removeClass('act');

                 if($(this).parent('li').parent('ul').hasClass('usermenu')){
                 $('.fnctNav .user').addClass('act');
                 $(".usermenu").addClass('maind');
                 }else if($(this).parent().parent().hasClass('mailmenu')){
                 $('.fnctNav .mail').addClass('act');
                 $(".mailmenu").addClass('maind');
                 }
                 $(this).addClass('currentsub');
                 }*/

                if (page_id != '') {

                    $('.change-div').stop(false, false);

                    $('.errors').html('');
                    $('.errors').hide();
                    $('#creatorkey').removeClass('form-error-field');
                    $('#creatorkey').val('');
                    $('#editionof').removeClass('form-error-field');
                    $('#editionof').val('');
                    $('#artrent').removeClass('form-error-field');
                    $('#artrent').val('');
                    $('#priceper').removeClass('form-error-field');
                    $('#priceper').val('');
                    $('#offerIn').removeClass('form-error-field');
                    $('#offerIn').val('');
                    $('#currencyIn').removeClass('form-error-field');
                    $('#currencyIn').val('');
                    $('#numOfCopies').removeClass('form-error-field');
                    $('#numOfCopies').val('');
                    msgs = [];

                    showDiv(page_id, false);


                    $('title, .pgTitle').html($('body .' + page_id + ' .hidden-title').html());
                    $('body').height('auto');

                    /*			
                     if(page_id == 'transfer-work-page3'){
                     $('select.payment-option').val('Paypal');
                     $('select.payment-option').trigger('change');
                     }*/

                    if (r != null) {
                        r.isotope('destroy');
                    }

                    r = $('.' + page_id + ' #GridCollection');

                    if (r.length == 1) {

                        r.isotope({
                            itemSelector: "." + page_id + " .mixCollection",
                            resizabe: !1,
                            itemPositionDataEnabled: true,
                            animationEngine: "jquery",
                            onLayout: function ($elems, instance) {

                                if ($(window).width() > 640) {
                                    $(window).trigger('resize');
                                }

                                $(window).on('resize', function () {
                                    clearTimeout(tmpInval);
                                    tmpInval = setTimeout(function () {
                                        if (r != null) {
                                            r.isotope('reLayout');
                                        }
                                    }, 0);
                                });

                                $('#showRightPush').click(function () {
                                    tmpInval = setTimeout(function () {
                                        if (r != null) {
                                            r.isotope('reLayout');
                                        }
                                    }, 0);
                                });
                            }
                        });

                        $("." + page_id + " .filters a").click(function () {
                            var a = $(this).data("filter");
                            r.isotope({
                                filter: a
                            });
                            return !1
                        });

                        $("." + page_id + " .filters select").on('change', function () {
                            if ($(this).hasClass('playlist-page-filter-select')) {
                                return;
                            }

                            if ($(this).data("filter") !== '*') {
                                $("." + page_id + " .filters a:first-child").trigger('click');
                            }

                            var a = $(this).val();
                            r.isotope({
                                filter: a
                            });
                            return !1
                        });

                        $('.' + page_id + ' .mixCollection').off('mouseenter').on('mouseenter', function () {
                            $(this).children('a').next('.shadow').stop(true, false).fadeTo(1000, 1);
                        })

                        $('.' + page_id + ' .mixCollection').off('mouseleave').on('mouseleave', function () {
                            $(this).children('a').next('.shadow').stop(true, false).fadeTo(400, 0);
                        });
                    } else {
                        r = null;
                    }

                } else {
                    intervalPageChange = true;
                }
                return;
            } else {
                intervalPageChange = true;
            }
        }
    });


    $(".leftNav>li>a.inner_link").on("click touchstart", function () {
        $(this).parent("li").siblings().find("a.inner_link").removeClass("current");
        $(".leftNav>li>ul.submenu").removeClass("maind");
        $(this).addClass("current");
    });

    $(".leftNav>li>ul.submenu>li>a.sub_link").on("click touchstart", function () {
        $(this).parent("li").siblings().find("a.sub_link").removeClass("currentsub");
        $(this).addClass("currentsub");
    });


    $('.collection-page .filterNav select').on('change', function () {
        if ($(this).val() !== '') {
            $('.collection-page .auditMain .audit-row').fadeOut();
            $('.collection-page .auditMain .audit-row' + $(this).val()).fadeIn();
        } else {
            $('.collection-page .auditMain .audit-row').fadeIn();
        }
    });

    $(document).on('mouseenter', '.transfer-work-page3 .usethumbs', function () {
        $(this).children('a').next('.shadow').stop(true, false).fadeTo(1000, 1);
    })

    $(document).on('mouseleave', '.transfer-work-page3 .usethumbs', function () {
        $(this).children('a').next('.shadow').stop(true, false).fadeTo(400, 0);
    });

    $(document).on('click', '.trace-page2 .auditTypeBox a', function () {
        $('.trace-page2 .auditTypeBox label, .trace-page2 .trace-row-head label').removeClass('redline');
        $('.trace-page2 .tableRow').hide();
        $('.trace-page2 .tableRow.' + $(this).data('filter')).show();
        $('.trace-page2 .auditTypeBox label.' + $(this).data('filter') + ', .trace-page2 .trace-row-head label.' + $(this).data('filter')).addClass('redline');
    });

    $(document).on('change', '.manage-inventory #editionof', function () {
        if (!isNaN(parseInt($(this).val())) && $(this).val() >= 1 && $(this).val() <= 5) {
            $('.manage-inventory #numOfCopies').val($(this).val());
        } else {
            $('.manage-inventory #numOfCopies').val('');
        }
    });

    $(document).on('change', '.manage-inventory #numOfCopies', function () {
        if (!isNaN(parseInt($(this).val())) && $(this).val() >= 1 && $(this).val() <= 5) {
            $('.manage-inventory #editionof').val($(this).val());
        } else {
            $('.manage-inventory #editionof').val('');
        }
    });


    $(document).on('change', '.transfer-work-page3 .sellForm select.payment-option', function () {

        if ($(this).val() == 'Paypal') {
            $('.sellForm .sellFromBtn1').removeClass('continue');
            if (!$('.sellForm .sellFromBtn1').hasClass('show-resend-paypal-payment-request')) {
                $('.sellForm .sellFromBtn1').addClass('show-resend-paypal-payment-request');
            }
            $('.sellForm .sellFormBankDetails').hide();

            $('.sellForm .sellFromBtn1.btn-sell-first').attr('id', 'transfer-work-page2');

            $('.sellForm .paypal-email').show();

            $('.sellForm .sellFromBtn1').val('REQUEST PAYPAL PAYMENT');
        }
        if ($(this).val() == 'Bank transfer') {
            $('.sellForm .sellFromBtn1').removeClass('continue');
            if (!$('.sellForm .sellFromBtn1').hasClass('show-resend-paypal-payment-request')) {
                $('.sellForm .sellFromBtn1').addClass('show-resend-paypal-payment-request');
            }
            $('.sellForm .paypal-email').hide();
            $('.sellForm .sellFormBankDetails').show();

            $('.sellForm .sellFromBtn1.btn-sell-first').attr('id', 'transfer-work-page2');

            $('.sellForm .sellFromBtn1').val('REQUEST BANK TRANSFER PAYMENT');
        }
        if ($(this).val() == 'No payment request' || $(this).val() == 'Unclaimed Works' || $(this).val() == 'Reserved Works') {
            $('.sellForm .sellFromBtn1').removeClass('show-resend-paypal-payment-request');
            if (!$('.sellForm .sellFromBtn1').hasClass('continue-without-payment-request')) {
                $('.sellForm .sellFromBtn1').addClass('continue-without-payment-request');
            }
            $('.sellForm .paypal-email').hide();
            $('.sellForm .sellFormBankDetails').hide();
            $('.sellForm .sellFromBtn1.btn-sell-first').attr('id', 'transfer-work-page1');
            $('.sellForm .sellFromBtn1').val('CONTINUE');
        }
    });

    $(document).on('click', '.filters .addWork', function () {
        $('.leftNav li a.inner_link').each(function () {
            if ($(this).hasClass('current')) {
                $(this).removeClass('current');
                $(this).trigger('click');
            }
        });
    });


    $(document).on('keyup', 'input.numeric', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    $(document).on('click', '.popup-description .close', function () {
        $(this).parent('.popup-description').hide();
    });

    $(document).on('click', '.playerIcons .listmenu', function () {
        $('.popup-description').toggle();
    });

    /* code to active deactive selected menu */
    $(document).on('click', ".user", function () {
        $(".usermenu").toggleClass('maind');
        $(".mailmenu").removeClass('maind');
        $(".user").toggleClass("act");
        $(".mail").removeClass("act");
        $(".inner_link").removeClass('current');
    });

    $(document).on('click', ".mail", function () {
        $(".usermenu").removeClass('maind');
        $(".mailmenu").toggleClass('maind');
        $(".mail").toggleClass("act");
        $(".user").removeClass("act");
        $(".inner_link").removeClass('current');
    });


    /* -----OVER code to active deactive selected menu ------- */
    $('ul.leftNav li a#dashboard-page').trigger('click');


    //start script for playlist page

    $(".playlist-page-filter-select").on('change', function () {
        var a = $(this).val();
        $('.tableRow').fadeOut();
        $('.tableRow' + a).fadeIn();

        $('.tableRow.active').find('.playlist').slideUp('slow', function () {
        });
        $('.tableRow.active').removeClass('active');

    });

    $(".lfp-vault-page .filters select").on('change', function () {
        var a = $(this).val();

        if (a != '') {
            $('.lfp-vault-page .audit-row').fadeOut();
            $('.lfp-vault-page .audit-row' + a).fadeIn();
        } else {
            $('.lfp-vault-page .audit-row').fadeIn();
        }
    });

    $(".sell-work-page .filters select").on('change', function () {
        var a = $(this).val();

        if (a != '') {
            $('.sell-work-page .audit-row').fadeOut();
            $('.sell-work-page .audit-row' + a).fadeIn();
        } else {
            $('.sell-work-page .audit-row').fadeIn();
        }
    });

    $('.mix').off('mouseenter').on('mouseenter', function () {
        $(this).children('a').next('.shadow').stop(true, false).fadeTo(1000, 1);
    })

    $('.mix').off('mouseleave').on('mouseleave', function () {
        $(this).children('a').next('.shadow').stop(true, false).fadeTo(400, 0);
    });

    $('a.view.media-viewer').off().on('click touchstart', function () {
        $('body').load('/views/user/media-viewer.html');
        $('body').removeClass('cbp-spmenu-push');
        $('body').removeClass('cbp-spmenu-push-toleft');
    });

    $('.tableRow .purchase a').off('click').on('click', function (e) {
        $('.tableRow').find('.playlist').stop(true, false);
        var ele = $(this).parents('.tableRow');

        if ($(ele).hasClass('active')) {
            $(ele).removeClass('active');
            $(ele).find('.playlist').slideUp('slow');
        } else {
            if ($('.tableRow.active').length == 1) {
                $('.tableRow.active').find('.playlist').slideUp('slow', function () {
                });
                $('.tableRow.active').removeClass('active');

                $(ele).addClass('active');
                $(ele).find('.playlist').slideDown('slow');
            } else {
                $(ele).addClass('active');
                $(ele).find('.playlist').slideDown('slow');
            }
        }
    });
//    $('.playlist').hide();


    //start script for collection screen


    // start script for add a work screen

    $(document).on('click', '#fileupload_view', function () {
        $('#file').trigger('click');
    });

    $(document).on('click', '.playlist-page .playlist a.removeItem', function () {
        $(this).parents('.mix').fadeOut('slow', function () {
            $(this).remove();
        });
    });

    $('#file').on('change', function () {
        $('#fileupload_view label').html($('#file').val());
    });

});

var menuRight = document.getElementById('cbp-spmenu-s2'),
    showRightPush = document.getElementById('showRightPush'),
    body = document.body;

showRightPush.onclick = function () {

    if (parseInt($(window).width()) > 640) {
        if ($('#cbp-spmenu-s2').css('right') != '0px') {
            $('.page-main').width($(window).width() - $('#cbp-spmenu-s2').width());
            $('#cbp-spmenu-s2').addClass('cbp-spmenu-open');
        } else {
            $('.page-main').width($('.page-main').width() + $('#cbp-spmenu-s2').width());
            $('#cbp-spmenu-s2').removeClass('cbp-spmenu-open');
        }

        if ($('#cbp-spmenu-s2').hasClass('cbp-spmenu-open') && $(window).width() >= 768 && $('.bodyCont').width() <= 980) {
            $('.bodyCont').addClass('tabbody');
        } else {
            $('.bodyCont').removeClass('tabbody');
        }

        if ($('#cbp-spmenu-s2').hasClass('cbp-spmenu-open') && $(window).width() == 1024) {
            $('.bodyCont').addClass('tabbody1');
        } else {
            $('.bodyCont').removeClass('tabbody1');
        }


    } else {
        classie.toggle(this, 'active');
        classie.toggle(body, 'cbp-spmenu-push-toleft');
        classie.toggle(menuRight, 'cbp-spmenu-open');
        disableOther('showRightPush');
    }
};

function showRightBar() {
    if (parseInt($(window).width()) > 640) {
        if ($('#cbp-spmenu-s2').css('right') != '0px') {
            $('.page-main').width($(window).width() - $('#cbp-spmenu-s2').width());
            $('#cbp-spmenu-s2').addClass('cbp-spmenu-open');
        } else {
            $('.page-main').width($('.page-main').width() + $('#cbp-spmenu-s2').width());
            $('#cbp-spmenu-s2').removeClass('cbp-spmenu-open');
        }

        if ($('#cbp-spmenu-s2').hasClass('cbp-spmenu-open') && $(window).width() >= 768 && $('.bodyCont').width() <= 980) {
            $('.bodyCont').addClass('tabbody');
        } else {
            $('.bodyCont').removeClass('tabbody');
        }

        if ($('#cbp-spmenu-s2').hasClass('cbp-spmenu-open') && $(window).width() == 1024) {
            $('.bodyCont').addClass('tabbody1');
        } else {
            $('.bodyCont').removeClass('tabbody1');
        }
    } else {
        classie.toggle(this, 'active');
        classie.toggle(body, 'cbp-spmenu-push-toleft');
        classie.toggle(menuRight, 'cbp-spmenu-open');
        disableOther('showRightPush');
    }
}

function disableOther(button) {
    if (button !== 'showRightPush') {
        classie.toggle(showRightPush, 'disabled');
    }
}

var r = null;

var lfp_vault_r = null;

var tmpInval = null;
var intervalPageChange = false

function showDiv(div, reverse) {
    if (!reverse) {

        $("." + div + '.change-div').css({
            opacity: 0
        });

        if ($("." + div + '.change-div').siblings(":visible").length == 1) {
            $("." + div + '.change-div').siblings(":visible").animate({
                opacity: 0
            }, 1000, function () {
            });
            $("." + div + '.change-div').siblings(":visible").hide(0,function () {
            }).dequeue();
        }

        $("." + div + '.change-div').show("slide", {
            direction: "right"
        }, 1000).dequeue();
        $("." + div + '.change-div').animate({
            opacity: 1
        }, 1000,function () {
            intervalPageChange = false;
        }).dequeue();

    } else {
        $("." + div + '.change-div').css({
            opacity: 0
        });

        $("." + div + '.change-div').siblings(":visible").hide("slide", {
            direction: "left"
        }, 1000);
        $("." + div + '.change-div').siblings(":visible").fadeOut(1000);

        $("." + div + '.change-div').show("slide", {
            direction: "left"
        }, 1000);
        $("." + div + '.change-div').animate({
            opacity: 1
        }, 1000, function () {
        });
    }
}
/*..27-feb-2014 add a work form validation start here..*/
$(document).ready(function () {
    $('#privatekeyb').inputmask("****-****-****-****", {
        onincomplete: function () {
            $(this).val('');
        }
    });


    $('#privatekeyb').on('keyup', function () {
        var str = this.value;
        str = str.replace(/[^0-9a-zA-Z]+/g, '');
        if (str.length == 16) {
            $('#privatekeyb').removeClass('bg-notify-invalid').addClass('bg-notify-valid');
            $('#privatekeyb').removeClass('form-error-field');
        } else {
            $('#privatekeyb').removeClass('bg-notify-valid').addClass('bg-notify-invalid');
            $('#privatekeyb').addClass('form-error-field');
        }
    });


    $('#privatekeyUpdate').inputmask("****-****-****-****", {
        onincomplete: function () {
            $(this).val('');
        }
    });

    $('#privatekeyUpdate').on('keyup', function () {
        var str = this.value;
        str = str.replace(/[^0-9a-zA-Z]+/g, '');
        if (str.length == 16) {
            $('#privatekeyUpdate').removeClass('bg-notify-invalid').addClass('bg-notify-valid');
            $('#privatekeyUpdate').removeClass('form-error-field');
        } else {
            $('#privatekeyUpdate').removeClass('bg-notify-valid').addClass('bg-notify-invalid');
            $('#privatekeyUpdate').addClass('form-error-field');
        }
    });


    /* $('#privatekey').inputmask("****-****-****-****",
     {
     */
    /*        "placeholder": "....-....-....-....",*/
    /*
     onincomplete: function(){
     $(this).val('');
     }
     });
     $('#privatekey').on('keyup', function () {
     //this.value = this.value.replace(/[^0-9\-]/g,'');
     var str=this.value;
     str=str.replace(/[^0-9a-zA-Z]+/g,'');
     //        alert(str+"@@@"+str.length);
     //        return;
     if(str.length==16){
     $('#privatekeyhide').show();
     $('#privateIcon').removeClass('chkRed').addClass('chkGreen');
     $('#privatekey').removeClass('form-error-field');
     }else{
     $('#privatekeyhide').hide();
     $('#privateIcon').removeClass('chkGreen').addClass('chkRed');
     $('#privatekey').addClass('form-error-field');
     }
     });*/


    $('#creatorkey').inputmask("****-****-****-****",
        {
            /*        "placeholder": "....-....-....-....",*/
            onincomplete: function () {
                $(this).val('');
            }
        });

    $('#creatorkey').on('keyup', function () {
        // this.value = this.value.replace(/[^ 0-9A-Za-z\.]/,'');
        var str = this.value;
        str = str.replace(/[^0-9a-zA-Z]+/g, '');
        //        alert(str+"@@@"+str.length);
        //        return;
        if (str.length == 16) {
            //$('#privatekeyhide').show();
            $('#creatorIcon').removeClass('chkRed').addClass('chkGreen');
            $('#creatorkey').removeClass('form-error-field');
        } else {
            //$('#privatekeyhide').hide();
            $('#creatorIcon').removeClass('chkGreen').addClass('chkRed');
            $('#creatorkey').addClass('form-error-field');
        }
    });

    $('#priceper').on('keyup', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        //$('#priceper').addClass('form-error-field');
    });

    $(document).on('keyup', 'input.email', function () {
        emailAddress = $(this).val();
        if (!pattern.test(emailAddress)) {
            $(this).removeClass('bg-notify-valid').addClass('bg-notify-invalid');
            $(this).addClass('form-error-field');
        } else {
            if ($(this).prop('id') == 'privatekeyreemail') {
                if ($(this).val() == $('#privatekeyemail').val()) {
                    $(this).removeClass('bg-notify-invalid').addClass('bg-notify-valid');
                    $(this).removeClass('form-error-field');
                } else {
                    $(this).removeClass('bg-notify-valid').addClass('bg-notify-invalid');
                    $(this).addClass('form-error-field');
                }
            } else {
                $(this).removeClass('bg-notify-invalid').addClass('bg-notify-valid');
                $(this).removeClass('form-error-field');
            }
        }
    });

    $(document).on('keyup', 'input.url', function () {
        url = $(this).val();
        if (!url_pattern.test(url)) {
            $(this).removeClass('bg-notify-valid').addClass('bg-notify-invalid');
            $(this).addClass('form-error-field');
        } else {
            $(this).removeClass('bg-notify-invalid').addClass('bg-notify-valid');
            $(this).removeClass('form-error-field');
        }
    });

    $(document).on('keyup', 'input.required', function () {
        var val = $(this).val();
        if (!$(this).hasClass('privatekey')) {
            if (val == '') {
                $(this).removeClass('bg-notify-valid').addClass('bg-notify-invalid');
                $(this).addClass('form-error-field');
            } else {
                $(this).removeClass('bg-notify-invalid').addClass('bg-notify-valid');
                $(this).removeClass('form-error-field');
            }
        }
    });

    $(document).on('change', 'select.required', function () {
        var val = $(this).val();
        if (val == '') {
            if ($(this).prop("tagName").toLowerCase() != 'select') {
                $(this).removeClass('bg-notify-valid').addClass('bg-notify-invalid');
            }
            $(this).addClass('form-error-field');
        } else {
            if ($(this).prop("tagName").toLowerCase() != 'select') {
                $(this).removeClass('bg-notify-invalid').addClass('bg-notify-valid');
            }
            $(this).removeClass('form-error-field');
        }
    });

    $(document).on('change', '#secQuest', function () {
        $('.secQuestAnswer ').val('');
        if ($(this).val() == '') {
            $('.secQuestAnswer ').hide();
            $('.secQuestAnswer ').val('');
        } else {
            $('.secQuestAnswer ').show();
        }
    });


    $(document).on('click', '.view-audio', function () {
        $('#media-audio-popup').children('audio').find('source').attr('src', $(this).data('source'));
        $('.media-popup').width($('.page-main').width() - 240);
        $('.media-popup').css('margin-left', '120px');

    });
    $(document).on('click', '.view-video', function () {
        $('#media-video-popup').children('video').find('source').attr('src', $(this).data('source'));
        $('.media-popup').width($('.page-main').width() - 240);
        $('.media-popup').css('margin-left', '120px');
    });
    $(document).on('click', '.view-picture', function () {
        $('#media-picture-popup').children('img').attr('src', $(this).data('source'));
        $('.media-popup').width($('.page-main').width() - 240);
        $('.media-popup').css('margin-left', '120px');
    });

    //$('.bodyCont').css('min-height',$(window).height()+'px');

    $('.inventory-inner-page').on('click', '.show-next-panel', function () {
        if ($(this).parents('.audit-rt-block').hasClass('active')) {
            var ele = $(this).parents('.audit-rt-block');
            $(ele).removeClass('active');
            var ele_btn = $(this);
            var lbl = $(ele_btn).data('label');
            $(ele_btn).attr('data-label', $(ele_btn).html());
            $(ele_btn).html(lbl);
            $(ele).next('.main-box').slideUp();
        } else {
            var ele = $(this).parents('.audit-rt-block');
            $(ele).addClass('active');
            var ele_btn = $(this);
            var lbl = $(ele_btn).data('label');
            $(ele_btn).attr('data-label', $(ele_btn).html());
            $(ele_btn).html(lbl);
            $(ele).next('.main-box').slideDown();
        }
    });

});
function addworkValidate() {
    $('.errors').remove();
    var msgs = [];
    var msg = '';
    var privatekey = $.trim($('#creatorkey').val());
    str = privatekey.replace(/[^0-9a-zA-Z]+/g, '');
    if (privatekey == '') {
        $('#privatekeyhide').show();
        msg = 'Creator key is required<br />';
    } else if (str.length != 16) {
        $('#privatekeyhide').show();
        msg = 'Private key must be only 16 digits.<br />';
    } else {
        msg = '';
    }

    if (msg != '') {
        msgs.push(msg);
        $('#privatekey').addClass('form-error-field');
        $('#privateIcon').removeClass('chkGreen').addClass('chkRed');
        msg = '';
    } else {
        $('#privatekey').removeClass('form-error-field');
        $('#privateIcon').removeClass('chkRed').addClass('chkGreen');
    }

    var artistname = $.trim($('#artistname').val());
    if (artistname == '') {
        msg = 'Artist name is required<br />';
    }
    if (msg != '') {
        msgs.push(msg);
        $('#artistname').addClass('form-error-field');
        msg = '';
    } else {
        $('#artistname').removeClass('form-error-field');
    }

    var title = $.trim($('#title').val());
    if (title == '') {
        msg = 'Title is required<br />';
    }
    if (msg != '') {
        msgs.push(msg);
        $('#title').addClass('form-error-field');
        msg = '';
    } else {
        $('#title').removeClass('form-error-field');
    }

    var material = $.trim($('#material').val());
    if (material == '') {
        msg = 'Materials is required<br />';
    }
    if (msg != '') {
        msgs.push(msg);
        $('#material').addClass('form-error-field');
        msg = '';
    } else {
        $('#material').removeClass('form-error-field');
    }

    var description = $.trim($('#description').val());
    if (description == '') {
        msg = 'Description is required<br />';
    }
    if (msg != '') {
        msgs.push(msg);
        $('#description').addClass('form-error-field');
        msg = '';
    } else {
        $('#description').removeClass('form-error-field');
    }

    var artyear = $.trim($('#artyear').val());
    if (artyear == '') {
        msg = 'Year is required<br />';
    }
    if (msg != '') {
        msgs.push(msg);
        $('#artyear').addClass('form-error-field');
        msg = '';
    } else {
        $('#artyear').removeClass('form-error-field');
    }

    var artcategory = $.trim($('#artcategory').val());
    if (artcategory == '') {
        msg = 'Category is required<br />';
    }
    if (msg != '') {
        msgs.push(msg);
        $('#artcategory').addClass('form-error-field');
        msg = '';
    } else {
        $('#artcategory').removeClass('form-error-field');
    }
    if (msgs.length > 0) {
        msg = msgs.join('');
        $('.add-work-page .addworkForm').before('<div class="errors"></div>');
        $('.errors').html(msg);
        $('.errors').slideDown();
        msgs = [];
        return false;
    } else {
        $('#privatekey').removeClass('form-error-field');
        $('#privateIcon').removeClass('chkRed').addClass('chkGreen');
        $('#artistname').removeClass('form-error-field');
        $('#title').removeClass('form-error-field');
        $('#material').removeClass('form-error-field');
        $('#description').removeClass('form-error-field');
        $('#artyear').removeClass('form-error-field');
        $('#artcategory').removeClass('form-error-field');
        msgs = [];
        return true;
    }
}
function inventoryValidate() {
    $('.errors').remove();
    var msgs = [];
    var msg = '';
    /*var creatorkey = $.trim($('#creatorkey').val());
     str=creatorkey.replace(/[^0-9a-zA-Z]+/g,'');
     if(creatorkey==''){
     msg='Creator key is required<br />';
     }else if(str.length!=16){
     msg='Creator key must be only 16 digits.<br />';
     }else{
     msg='';
     }

     if(msg!=''){
     msgs.push(msg);
     $('#creatorkey').addClass('form-error-field');
     $('#creatorIcon').removeClass('chkGreen').addClass('chkRed');
     msg='';
     }else{
     $('#creatorkey').removeClass('form-error-field');
     $('#creatorIcon').removeClass('chkRed').addClass('chkGreen');
     }*/

    var editionof = $.trim($('#editionof').val());
    if (editionof == '') {
        msg = 'Editionof is required<br />';
    }
    if (msg != '') {
        msgs.push(msg);
        $('#editionof').addClass('form-error-field');
        msg = '';
    } else {
        $('#editionof').removeClass('form-error-field');
    }

    var artrent = $.trim($('#artrent').val());
    if (artrent == '') {
        msg = 'Artrent is required<br />';
    }
    if (msg != '') {
        msgs.push(msg);
        $('#artrent').addClass('form-error-field');
        msg = '';
    } else {
        $('#artrent').removeClass('form-error-field');
    }

    var priceper = $.trim($('#priceper').val());
    if (priceper == '') {
        msg = 'Price per work is required<br />';
    }
    if (msg != '') {
        msgs.push(msg);
        $('#priceper').addClass('form-error-field');
        msg = '';
    } else {
        $('#priceper').removeClass('form-error-field');
    }

    var offerIn = $.trim($('#offerIn').val());
    if (offerIn == '') {
        msg = 'Offered from the lfp is required<br />';
    }
    if (msg != '') {
        msgs.push(msg);
        $('#offerIn').addClass('form-error-field');
        msg = '';
    } else {
        $('#offerIn').removeClass('form-error-field');
    }

    var currencyIn = $.trim($('#currencyIn').val());
    if (currencyIn == '') {
        msg = 'Currency is required<br />';
    }
    if (msg != '') {
        msgs.push(msg);
        $('#currencyIn').addClass('form-error-field');
        msg = '';
    } else {
        $('#currencyIn').removeClass('form-error-field');
    }

    var numOfCopies = $.trim($('#numOfCopies').val());
    if (numOfCopies == '') {
        msg = 'Number of copies on m-disk in lfp is required<br />';
    }
    if (msg != '') {
        msgs.push(msg);
        $('#numOfCopies').addClass('form-error-field');
        msg = '';
    } else {
        $('#numOfCopies').removeClass('form-error-field');
    }


    if (msgs.length > 0) {
        msg = msgs.join('');
        $('.manage-inventory-form').before('<div class="errors"></div>');
        $('.errors').html(msg);
        $('.errors').slideDown();
        msgs = [];
        return false;
    } else {
        $('#creatorkey').removeClass('form-error-field');
        $('#editionof').removeClass('form-error-field');
        $('#artrent').removeClass('form-error-field');
        $('#priceper').removeClass('form-error-field');
        $('#offerIn').removeClass('form-error-field');
        $('#currencyIn').removeClass('form-error-field');
        $('#numOfCopies').removeClass('form-error-field');
        msgs = [];
        return true;
    }
}


$('.view-audio').magnificPopup({
    type: 'inline',
    midClick: true // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
});

$('.view-video').magnificPopup({
    type: 'inline',
    midClick: true // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
});

$('.view-picture').magnificPopup({
    type: 'inline',
    midClick: true // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
});

/*..27-feb-2014 add a work form validation end here..*/

