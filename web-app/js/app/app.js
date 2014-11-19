'use strict';

// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', [
    'ngRoute',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers'
]);

myApp.factory('responseInject', ['$q', '$location', function ($q, $location) {
    return {
        responseError: function (response) {
            if (response.status == 401 || response.status == 404 || response.status == 0) {
                window.location = "/";
                return response;
            }
            return response
        }
    };
}]);
myApp.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $httpProvider.interceptors.push('responseInject');
    $routeProvider.when('/main-dashboard', {templateUrl: '/partials/main-dashboard.html', controller: 'DashboardController'})
        .when('/add-work', {templateUrl: '/partials/add-work.html', controller: 'AddWorkController'})
        .when('/art-rent', {templateUrl: '/partials/art-rent.html', controller: 'ArtRentController'})
        .when('/affiliates', {templateUrl: '/partials/affiliates.html', controller: 'AffiliatesController'})
        .when('/audit-reporting', {templateUrl: '/partials/audit-reporting.html', controller: 'AuditReportingController'})
        .when('/audit-resporting', {templateUrl: '/partials/audit-resporting.html', controller: 'AuditResportingController'})
        .when('/backups', {templateUrl: '/partials/backups.html', controller: 'BackupsController'})
        .when('/documents', {templateUrl: '/partials/documents.html', controller: 'DocumentsController'})
        .when('/exhibitions', {templateUrl: '/partials/exhibitions.html', controller: 'ExhibitionsController'})
        .when('/fair-art-trade', {templateUrl: '/partials/fair-art-trade.html', controller: 'FairArtTradeController'})
        .when('/inventory/:mediaObject/:offSet/:limit', {templateUrl: '/partials/inventory.html', controller: 'InventoryController', resolve: myApp.InventoryResolve})
        .when('/lfp', {templateUrl: '/partials/lfp.html', controller: 'LFPController'})
        .when('/manage-inventory', {templateUrl: '/partials/manage-inventory.html', controller: 'ManageInventoryController'})
        .when('/playlist', {templateUrl: '/partials/playlist.html', controller: 'PlaylistController'})
        .when('/marketplaces', {templateUrl: '/partials/marketplaces.html', controller: 'MarketController'})
        .when('/profile', {templateUrl: '/partials/profile.html', controller: 'ProfileController'})
        .when('/reset', {templateUrl: '/partials/reset.html', controller: 'ResetController'})
        .when('/sell-work/:mediaObject/:offSet/:limit', {templateUrl: '/partials/sell-work.html', controller: 'SellWorkController'})
        .when('/trace', {templateUrl: '/partials/trace.html', controller: 'TraceController'})
        .when('/transfer-work', {templateUrl: '/partials/transfer-work.html', controller: 'TransferWorkController'})
        .when('/salesInfo/:workId', {templateUrl: '/partials/inventory_step2.html', controller: 'SalesInfoController'})
        .when('/finalSalesInfo/:workId', {templateUrl: '/partials/inventory_step3.html', controller: 'FinalSalesInfoController'})
        .when('/viewInfo/:workId', {templateUrl: '/partials/inventory-inner.html', controller: 'ViewInfoController'})
        .when('/transfer-work-init/:workId', {templateUrl: '/partials/transfer-work-step1.html', controller: 'transferWorkStep1'})
        .when('/transfer-work-step2/:workId/', {templateUrl: '/partials/transfer-work-step2.html', controller: 'transferWorkStep2'})
        .when('/works/reserved', {redirectTo: '/works/reserved/all'})
        .when('/works/reserved/:mediaObject', {templateUrl: '/partials/reserved-works.html', controller: 'reservedWorks'})
        .when('/media-player', {templateUrl: '/views/user/media-viewer.html', controller: 'MediaPlayerController'})
        .when('/work/transfer/confirm/:workId/:workCopyId/:copyNumber', {templateUrl: '/partials/transfer-work-step3.html', controller: 'transferWorkStep3'})
        .when('/transfer-work-step4/:workId/', {templateUrl: '/partials//transfer-work-step4.html', controller: 'transferWorkStep4'})
        .when('/works/unclaimed', {redirectTo:'/works/unclaimed/all'})
        .when('/works/unclaimed/:mediaObject', {templateUrl: '/partials/unclaimed-listing.html', controller:'trasnferWorkUnclaimed'})
        .otherwise({redirectTo: '/main-dashboard'});
}]);


myApp.InventoryResolve = {
    currentUser: function ($q, $rootScope, $http) {
        var deferred = $q.defer();
        if ($rootScope.currentUser) {
            deferred.resolve($rootScope.currentUser);
        } else {
            $http.get('/api/user/current').success(function (response) {
                $rootScope.currentUser = response;
                deferred.resolve($rootScope.currentUser);
            });
        }
        return deferred.promise;
    }
};