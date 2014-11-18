// JavaScript Document

// JavaScript Document

function checkEmail() {

    var email = $.trim($('.signup .email').val());

    if (email == '') {

        return 'Email is required<br />';

    } else if (!IsEmail(email)) {

        return 'Email is not in a valid format<br />';

    } else {

        return '';

    }

}

function checkPass() {

    var password = $('.signup .password').val();

    if (password == '') {

        return 'Password is required<br />';

    } else if (password.length < 8) {

        return 'Password should be at least of 8 characters long<br />';

    } else {

        return '';

    }

}

function checkConfPass() {

    var conf_password = $('.signup .conf_password').val();

    var password = $('.signup .password').val();

    if (conf_password == '') {

        return 'Confirm Password is required<br />';

    } else if (conf_password != password) {

        return 'Both passwords must be same<br />';

    } else {

        return '';

    }

}

function IsEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}


/*function signInValidate(frm){

 $('.errors').remove();

 var msg = '';

 if($.trim($('.signin .email').val())=='' ||  $('.signin .password').val()==''){

 msg = 'Both fields are required';

 if($.trim($('.signin .email').val())=='') $('.signin .email').addClass('form-error-field');

 if($('.signin .password').val()=='') $('.signin .password').addClass('form-error-field');

 }else if(!IsEmail($.trim($('.signin .email').val()))){

 msg = 'Incorrect email address or<br /> password. Please try again.';

 $('.signin .email').addClass('form-error-field');

 $('.signin .password').addClass('form-error-field');

 }else{

 $('.signin .email').removeClass('form-error-field');

 $('.signin .password').removeClass('form-error-field');

 }



 if(msg!=''){

 $('.signin .secHeading').after('<div class="errors"></div>');

 $('.errors').html(msg);

 $('.errors').slideDown();

 return false;

 }else{
 //loadjscssfile('css/d-board.css','css');
 //$('link[title=login]')[0].disabled=true;

 $.ajax({
 url: "/auth/login",
 type: "post",
 data: data,
 dataType: 'json',
 success: function(data){
 log.error(data);
 console.log("Data---",data);
 if(data){
 window.location.href = 'dashboard/dashboard.html'
 }
 },
 error: function(err) {
 alert(err+" did happen, please retry");
 }
 });





 // window.location = 'dashboard.html';
 return false;

 }

 }*/

function loadjscssfile(filename, filetype) {
    if (filetype == "js") { //if filename is a external JavaScript file
        var fileref = document.createElement('script')
        fileref.setAttribute("type", "text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype == "css") { //if filename is an external CSS file
        var fileref = document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref != "undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}


/*function signUpValidate(frm){
 $('.errors').remove();
 var msgs = [];
 var msg='';
 msg = checkEmail();
 if(msg!=''){
 msgs.push(msg);
 $('.signup .email').addClass('form-error-field');
 msg='';
 }else{
 $('.signup .email').removeClass('form-error-field');
 }
 msg = checkPass();
 if(msg!=''){
 msgs.push(msg);
 $('.signup .password').addClass('form-error-field');
 msg='';
 }else{
 $('.signup .password').removeClass('form-error-field');
 }
 msg = checkConfPass();
 if(msg!=''){
 msgs.push(msg);
 $('.signup .conf_password').addClass('form-error-field');
 msg='';
 }else{
 $('.signup .conf_password').removeClass('form-error-field');
 }
 if(msgs.length>0){
 msg = msgs.join('');
 $('.signup .secHeading').after('<div class="errors"></div>');
 $('.errors').html(msg);
 $('.errors').slideDown();
 msgs = [];
 return false;
 }else{
 $('.signup .email').removeClass('form-error-field');
 $('.signup .password').removeClass('form-error-field');
 $('.signup .conf_password').removeClass('form-error-field');
 msgs = [];
 showDiv('agree-terms',false);
 return false;
 }
 }*/



/*function forgotValidate(form){

 $('.errors').remove();

 var msg = '';

 var email = $.trim($('.forgot .email').val());



 if(email==''){

 msg = 'Email is required<br />';

 $('.forgot .email').addClass('form-error-field');

 }else if(!IsEmail(email)){

 msg = 'Email is not in a valid format<br />';

 $('.forgot .email').addClass('form-error-field');

 }else{

 $('.forgot .email').removeClass('form-error-field');

 }



 if(msg!=''){

 $('.forgot .secHeading').after('<div class="errors"></div>');

 $('.errors').html(msg);

 $('.errors').slideDown();

 return false;

 }else{


 showDiv('reset-message',true)

 return false;

 }

 }*/


/*
 function changeEmailValidate(frm){

 $('.errors').remove();

 var msg = '';

 if($.trim($('.changeemail .email').val())=='' ||  $('.changeemail .password').val()==''){

 msg = 'Both fields are required';

 if($.trim($('.changeemail .email').val())==''){

 $('.changeemail .email').addClass('form-error-field');

 }

 if($('.changeemail .password').val()=='')

 $('.changeemail .password').addClass('form-error-field');

 }else if(!IsEmail($.trim($('.changeemail .email').val()))){

 msg = 'Incorrect email address or<br /> password. Please try again.';

 $('.changeemail .email').addClass('form-error-field');

 $('.changeemail .password').addClass('form-error-field');

 }else{

 $('.changeemail .email').removeClass('form-error-field');

 $('.changeemail .password').removeClass('form-error-field');

 }



 if(msg!=''){

 $('.changeemail .secHeading').after('<div class="errors"></div>');

 $('.errors').html(msg);

 $('.errors').slideDown();

 return false;

 }else{

 $('.changeemail .email').removeClass('form-error-field');

 $('.changeemail .password').removeClass('form-error-field');

 return false;

 }

 }*/


function showDiv(div, reverse) {
    console.log(div, reverse)
    $('input').removeClass('form-error-field');

    $('.errors').fadeOut('slow', function () {

        $('.errors').remove();

    });
    if (!reverse) {
        $("." + div).css({
            opacity: 0
        });
        function showDiv() {
            $("." + div).show("slide", {
                direction: "right"
            }, 400);
            $("." + div).animate({
                opacity: 1
            }, 400,function () {
            }).dequeue();
        }

        if ($("." + div).siblings(':visible').length) {
            $("." + div).siblings(':visible').hide('fast', showDiv);
        } else {
            showDiv();
        }
    } else {
        if ($("." + div).siblings(':visible').length) {
            $("." + div).siblings(':visible').hide("slide", {
                direction: "right"
            }, 400, function () {
                $("." + div).fadeIn('slow', function () {
                });
            });
        } else {
            $("." + div).fadeIn('slow', function () {
            });
        }
        $("." + div).siblings().fadeOut(400).dequeue();
    }
}

/*
 function profileValidate(frm){

 $('.errors').remove();

 var msgs = [];
 var msg='';

 var firstname = $.trim($('.complete-profile .firstname').val());
 var lastname = $.trim($('.complete-profile .lastname').val());
 var country = $.trim($('.complete-profile .country').val());
 var zip = $.trim($('.complete-profile .zip').val());


 if(firstname==''){
 msg = 'First name is required'
 }
 if(msg!=''){
 msgs.push(msg);
 $('.complete-profile .firstname').addClass('form-error-field');
 msg='';
 }else{
 $('.complete-profile .firstname').removeClass('form-error-field');
 }


 if(lastname==''){
 msg = 'Last name is required'
 }
 if(msg!=''){
 msgs.push(msg);
 $('.complete-profile .lastname').addClass('form-error-field');
 msg='';
 }else{
 $('.complete-profile .lastname').removeClass('form-error-field');
 }


 if(country==''){
 msg = 'Your Country name is required'
 }
 if(msg!=''){
 msgs.push(msg);
 $('.complete-profile .country').addClass('form-error-field');
 msg='';
 }else{
 $('.complete-profile .country').removeClass('form-error-field');
 }

 if(zip==''){
 msg = 'Zipcode is required'
 }
 if(msg!=''){
 msgs.push(msg);
 $('.complete-profile .zip').addClass('form-error-field');
 msg='';
 }else{
 $('.complete-profile .zip').removeClass('form-error-field');
 }

 if(msgs.length>0){

 msg = msgs.join('<br />');

 $('.complete-profile .secHeading').after('<div class="errors"></div>');

 $('.errors').html(msg);

 $('.errors').slideDown();

 msgs = [];

 return false;

 }else{

 $('.complete-profile .firstname').removeClass('form-error-field');
 $('.complete-profile .lastname').removeClass('form-error-field');
 $('.complete-profile .country').removeClass('form-error-field');
 $('.complete-profile .zip').removeClass('form-error-field');
 msgs = [];
 $('body').load('home.html');
 $('body').removeClass('cbp-spmenu-push-toleft');
 $('body').removeClass('bg-gradiant');
 $('body').addClass('cbp-spmenu-push');
 $('body').css('background-color','#fff');


 return false;
 }
 }*/
