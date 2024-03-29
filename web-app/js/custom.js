// JavaScript Document
(function(){
  "use strict";
//Banner height
$(document).ready(function() {

	var viewport_width = window.innerWidth;
	var viewport_height = window.innerHeight;

//Banner
	$('.banner,.carousel .item ,.overlay').height((viewport_height));
	$(window).resize(function() {
	  var viewport_width = window.innerWidth;
	  var viewport_height = window.innerHeight;
		$('.banner,.carousel .item ,.overlay').height((viewport_height));
	});
	});
	
//Page Smooth Scrolling

$(document).ready(function() {
		$('ul.navi a,a').bind('click',function(event){
			var $anchor = $(this);
	
			$('html, body').stop().animate({
			scrollTop:( $($anchor.attr('href')).offset().top - 0) 
			}, 1500,'easeInOutExpo');
                    /*
                    if you don't want to use the easing effects:
                    $('html, body').stop().animate({
                        scrollTop: $($anchor.attr('href')).offset().top
                    }, 1000);
                    */
					event.preventDefault();
					});
			});

//Parallax banner
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};
jQuery(document).ready(function(){
    if( !isMobile.any() ){
        $(window).stellar({
				horizontalScrolling: false,
				hideDistantElements: true,
				verticalOffset: 0
	});
    }
	
});

//Opt-in Form

$(document).ready(function(){
 
$('#submit').click(function(){

$.post("send.php", $("#contactform").serialize(),  function(response) {
$('#message').html(response);
$( "#message" ).show(1000);
});
return false;
 
});	
});

//Contact Form

$(document).ready(function(){
 
$('#sendmsg').click(function(){

$.post("contact.php", $("#contactmsg").serialize(),  function(response) {
$('#contact-message').html(response);
$( "#contact-message" ).show(1000);
});
return false;
 
});	
});			
//Flexslider for testimonials
	// Can also be used with $(document).ready()
	$(window).load(function() {
	 
	  $('#testimonial').flexslider({
		animation: "slide",
		controlNav: true,
		directionNav:false,
		animationLoop: true,
		slideshow: false,
	
	  });
	});

		})();