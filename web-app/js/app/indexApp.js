
var artLockApp = angular.module('artLockApp', []);
artLockApp.factory('responseInject', ['$q', '$location', function ($q, $location) {
    return {
        responseError: function (response) {
            if (response.status == 401 || response.status == 404) {
                $location.path('/');
                return response;
            }
            return response
        }
    };
}]);

artLockApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('responseInject');
}]);

artLockApp.controller('subscribeMailController', ['$scope', '$http', function ($scope, $http) {
        "use strict";
        $scope.subscribeMe = function () {
            var userName = $("#contactform #name").val();
            var subEmail = $("#contactform #email").val();
            if (!userName || !subEmail) {
                toastr.error("Please fill the form correctly before sending message", 'Failure!');
                return false;
            }

            var data = {
                name: userName,
                email: subEmail
            };

            $http.post('/api/sendsubscribemail', data).success(function (response) {
                // Display an error toast, with a title
                toastr.success(response.message, 'Thank You!')
            }).error(function (response) {
                    toastr.success(response, 'Failure!')
                });
            $("#contactform #name").val("");
            $("#contactform #email").val("");

        }
    }]).controller('contactMailController', ['$scope', '$http', function ($scope, $http) {
        $scope.contactMe = function () {
            var name = $("#contact-form #form-name").val();
            var email = $("#contact-form #form-email").val();
            var phone = $("#contact-form #form-phone").val();
            var message = $("#contact-form #form-message").val();
            if (!name || !email || !message) {
                toastr.error("Please fill the form correctly before sending message", 'Failure!');
                return false;
            }

            var data = {
                name: name,
                email: email,
                phone: phone,
                message: message
            };

            $http.post('/api/sendcontactmail', data).success(function (response) {
                // Display an error toast, with a title
                toastr.success(response.message, 'Thank You!')
            }).error(function (response) {
                    toastr.error(response, 'Failure!')
                });
            $("#contactform #name").val("");
            $("#contactform #email").val("");

        }
    }]);