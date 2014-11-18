$(document).ready(function () {

    "use strict";

    // Initialize Sliders

    $('#testimonials-slider').flexslider({
        directionNav: false
    });


    $('.divider').each(function () {
        var imgSrc = $(this).children('.divider-bg').attr('src');
        $(this).css('background', 'url("' + imgSrc + '")');
        $(this).children('.divider-bg').remove();
    });

});