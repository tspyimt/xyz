'use strict';

/* Controllers */

var constants = {
    'StartYear': 1960,
    'CurrentYear': new Date().getFullYear(),
    'CategoryDropDown': ['Still Image' , 'Moving Image', 'Sound Art']
};
angular.module('myApp.controllers', [])
    .controller('AddWorkController', ['$scope', '$rootScope', '$http', '$location', function ($scope, $rootScope, $http, $location) {
        $scope.collect = false;
        $http.get('/api/user/current').success(function (response) {
            $scope.currentUser = response;
            for (var state in $scope.currentUser.roles) {
                if ($scope.currentUser.roles.hasOwnProperty(state)) {
                    if ($scope.currentUser.roles[state] == 'collector')
                        $scope.collector = true;
                }
            }
        });
        $scope.artYear = constants.CurrentYear;
        $scope.startYear = constants.StartYear - 1;
        $scope.endYear = constants.CurrentYear;
        $scope.artCategory = constants.CategoryDropDown[1];
        $scope.categoryArray = constants.CategoryDropDown;
        $scope.user = {};
        $scope.mediaSelected = false;
        $scope.fileChosen = {};
        $scope.errorAddingWork = false;
        $scope.ajaxCallInProgress = false;


        $scope.checkValidPrivateKey = function (key) {
            $http.post('/user/checkValidPrivateKey', {key: key}).success(function (response) {
                $('#privatekeyhide').show();
                $('#privateIcon').removeClass('chkRed').addClass('chkGreen');
                $('#privatekey').removeClass('form-error-field');
                $scope.artist = response;
            }).error(function (response) {
                    $('#privatekeyhide').hide();
                    $('#privateIcon').removeClass('chkGreen').addClass('chkRed');
                    $('#privatekey').addClass('form-error-field');
                });
        };

        $scope.checkValidTradeKey = function (key) {
            $http.post('/user/checkValidTradeKey', {key: key}).success(function (response) {
                $('#tradekeyhide').show();
                $('#privateIcon').removeClass('chkRed').addClass('chkGreen');
                $('#tradekey').removeClass('form-error-field');
                $scope.artist = response;
            }).error(function (response) {
                    $('#tradekeyhide').hide();
                    $('#privateIcon').removeClass('chkGreen').addClass('chkRed');
                    $('#tradekey').addClass('form-error-field');
                });
        };

        $scope.checkValidCreatorKey = function (key) {
            $http.post('/user/checkValidCreatorKey', {key: key}).success(function (response) {
                if (response && response._id) {
                    $('#creatorkeyhide').show();
                    $('#privateIcon').removeClass('chkRed').addClass('chkGreen');
                    $('#creatorkey').removeClass('form-error-field');
                    $scope.artist = response;
                } else {
                    $('#creatorkeyhide').hide();
                    $('#privateIcon').removeClass('chkGreen').addClass('chkRed');
                    $('#creatorkey').addClass('form-error-field');
                }
            }).error(function (response) {
                    $('#creatorkeyhide').hide();
                    $('#privateIcon').removeClass('chkGreen').addClass('chkRed');
                    $('#creatorkey').addClass('form-error-field');
                });
        };

        $scope.checkValidTransferKey = function (key) {
            $http.post('/api/checkValidTransferKey', {key: key}).success(function (response) {
                $('#transferIcon').removeClass('chkRed').addClass('chkGreen');
                $('#transferKey').removeClass('form-error-field');
                $scope.artist = response[0];
            }).error(function (response) {
                    $('#transferIcon').removeClass('chkGreen').addClass('chkRed');
                    $('#transferKey').addClass('form-error-field');
                });
        };


        $scope.removeMedia = function () {
            $scope.fileChosen = {};
            $scope.mediaSelected = false;
        };
        $scope.addWork = function (evt) {
            var work = {
                year: $scope.artYear,
                category: $scope.artCategory,
                title: $scope.title,
                material: $scope.material,
                description: $scope.description
            };
            $scope.uploadProgressPercentage = 0;
            var fd = new FormData();
            fd.append('workData', angular.toJson(work));
            fd.append('media', $scope.fileChosen);
            if (addworkValidate()) {
                $scope.ajaxCallInProgress = true;

                var xhr = new XMLHttpRequest;

                xhr.upload.onprogress = function (e) {
                    $scope.uploadProgressPercentage = (e.loaded / e.total) * 100;
                    $scope.$apply();
                };

                xhr.upload.onload = function (e) {
                    $rootScope.newWorkAdded = true;
                    $location.path('/inventory/all/0/25');
                    $scope.$apply();
                };

                xhr.upload.onerror = function (e) {
                    $scope.errorAddingWork = true;
                    $scope.$apply();
                };

                xhr.open("POST", "/work/create");
                xhr.send(fd);

            }
        };
        $scope.closeErrorDiv = function () {
            $scope.errorAddingWork = false;
        };

        $scope.transfer = function () {
            $scope.transferError = null;
            $http.post('/api/ownership/claim', {
                loginPassword: $scope.loginPassword,
                key: $scope.transferKey
            }).success(function (response) {
                    if (response && response.error) {
                        $scope.transferError = response.error;
                        return;
                    }
                    $location.path('/inventory/all/0/25');
                }).error(function (response) {
                    if (response && response.error) {
                        $scope.transferError = response.error;
                    }
                });
        }
    }])
    .controller('ArtRentController', ['$scope', function () {

    }])
    .controller('AffiliatesController', ['$scope', function () {

    }])
    .controller('AuditReportingController', ['$scope', function () {

    }])
    .controller('BackupsController', ['$scope', function () {

    }])
    .controller('DashboardController', ['$scope', function () {

    }])
    .controller('rightMenuController', ['$scope', '$http', function ($scope, $http) {
        $scope.market = 'Marketplaces';
        $scope.ismarketList = false;

        $http.get('/api/user/current').success(function(userInfo) {
            if(userInfo.roles.indexOf('artist') != -1) {
                $scope.ismarketList = true;
            }
        })


    }])
    .controller('DocumentsController', ['$scope', function () {

    }])
    .controller('ExhibitionsController', ['$scope', function () {

    }])
    .controller('FinalSalesInfoController', ['$scope', '$location', '$rootScope', '$http', '$routeParams', '$sce', function ($scope, $location, $rootScope, $http, $routeParams, $sce) {
        $scope.ajaxCallInProgress = false;

        if ($rootScope.updatedWork.copies == 1)
            $rootScope.updatedWork['copyForArtRent'] = 1;
        else if ($rootScope.updatedWork.copies == 2)
            $rootScope.updatedWork['copyForExhibition'] = 1;
        else if ($rootScope.updatedWork.copies == 3) {
            $rootScope.updatedWork['copyForArtRent'] = 1;
            $rootScope.updatedWork['copyForExhibition'] = 1;
        }
        $scope.loader = 1;
        $scope.updateButtonClass = function () {
            switch ($rootScope.currentWork.category) {
                case "Moving Image":
                    $scope.disableButton = !($scope.clipTime);
                    break;
                default:
                    $scope.disableButton = false;
            }
        };
        $http.get('/api/work/get?workId=' + $routeParams.workId).success(function (work) {
            $rootScope.currentWork = work;
            $scope.updateButtonClass();
            $rootScope.currentWork.description = $sce.trustAsHtml($rootScope.currentWork.description.replace(/\r?\n/g, '<br />'));
        });
        $scope.updateWorkCopies = function () {
            if ($rootScope.updatedWork.copies == 1)
                $rootScope.updatedWork['copyForArtRent'] = 1;
            else if ($rootScope.updatedWork.copies == 2)
                $rootScope.updatedWork['copyForExhibition'] = 1;
            else if ($rootScope.updatedWork.copies == 3) {
                $rootScope.updatedWork['copyForArtRent'] = 1;
                $rootScope.updatedWork['copyForExhibition'] = 1;
            }
            delete $rootScope.updatedWork['copies'];
            $scope.ajaxCallInProgress = true;

        };

        $scope.updateWork = function () {
            $scope.loader = 0;
            $scope.ajaxCallInProgress = true;
            $scope.updateWorkCopies();

            $http.post('/api/media/convert', {
                workId: $rootScope.currentWork._id,
                time: $scope.clipTime,
                text: $scope.watermarkText || ""
            }).success(function (response) {
                });
            $http.post('/api/work/updateSalesInfo/' + $rootScope.currentWork._id, $rootScope.updatedWork).success(function (response) {
                $scope.loader = 1;
                $location.path('/inventory/all/0/25');
            });


        };
    }
    ])
    .controller('FairArtTradeController', ['$scope', function () {

    }])
    .controller('InventoryController', ['$scope', '$http', '$routeParams', '$location', "$rootScope", "$sce", "$q", "currentUser", function ($scope, $http, $routeParams, $location, $rootScope, $sce, $q, currentUser) {
        if ($rootScope.newWorkAdded == true) {
            $scope.setTimeout = true;
            setTimeout(function () {
                $scope.setTimeout = false;
                $rootScope.newWorkAdded = false;
                location.reload();
            }, 7000);
        }
        $scope.offSet = $routeParams.offSet || 0;
        $scope.limit = $routeParams.limit || 0;
        $scope.mediaObject = $routeParams.mediaObject || 'all';
        $scope.works = {};
        $scope.artist = false;

        $rootScope.currentUser = $rootScope.currentUser || currentUser;

        for (var state in $rootScope.currentUser.roles) {
            if ($rootScope.currentUser.roles.hasOwnProperty(state)) {
                if ($rootScope.currentUser.roles[state] == 'artist')
                    $scope.artist = true;
            }
        }
        $scope.check = parseInt($scope.offSet) + parseInt($scope.limit);
        if ($rootScope.currentUser) {
            $scope.userRoleCollector = $rootScope.currentUser.roles[$rootScope.currentUser.roles.indexOf('collector')];
            $scope.userRoleArtist = $rootScope.currentUser.roles[$rootScope.currentUser.roles.indexOf('artist')];
        }
        $http.get('/api/playlist/getByUserId').success(function (playlists) {
            $scope.myPlaylists = playlists;
        });


        $scope.mediaCategory = [
            { "value": "all", "category": "ALL MEDIA"},
            { "value": "Still Image", "category": "Still Image" },
            { "value": "Moving Image", "category": "Moving Image"},
            {"value": "Sound Art", "category": "Sound Art"}
        ];

        $scope.changeCategory = function (mediaObject) {
            $scope.mediaObject = mediaObject;
            $location.path('/inventory/' + $scope.mediaObject + "/" + $scope.offSet + "/" + $scope.limit);
        };

        $http.get('/api/inventoryWorksCount/' + $scope.mediaObject).success(function (response) {
            $scope.pageCount = (response.count / $scope.limit) - 1;
            $scope.count = response.count;
            if (parseInt($scope.offSet) < 0 || parseInt($scope.offSet) > $scope.count) {
                $scope.offSet = 0;
                $location.path('/inventory/' + $scope.mediaObject + "/" + $scope.offSet + "/" + $scope.limit);
            }
        });

        $http.get('/api/inventoryWorks/' + $scope.mediaObject + '/' + $scope.offSet + '/' + $scope.limit).success(function (response) {
            $scope.works = response;
        });

        $scope.changeFlag = function (workId) {
            $scope.flagDiv = workId
        };
        $scope.nextPage = function () {
            if ($scope.offSet <= $scope.count) {
                $scope.offSet = parseInt($scope.offSet) + parseInt($scope.limit);
                $location.path('/inventory/' + $scope.mediaObject + "/" + $scope.offSet + "/" + $scope.limit);
                $http.get('/api/inventoryWorks/' + $scope.mediaObject + "/" + $scope.offSet + '/' + $scope.limit).success(function (response) {
                    $scope.works = response;
                })
            }
        };
        $scope.previousPage = function () {
            if ($scope.offSet > 0) {
                $scope.offSet = parseInt($scope.offSet) - parseInt($scope.limit) || 0;
                $location.path('/inventory/' + $scope.mediaObject + "/" + $scope.offSet + "/" + $scope.limit);
                $http.get('/api/inventoryWorks/' + $scope.mediaObject + "/" + $scope.offSet + '/' + $scope.limit).success(function (response) {
                    $scope.works = response;
                });
            }
        };


/////*****************************************************************code of viewInfoController**********************
    


        $scope.openPlaylistCRUD = function (workId, index) {
            $scope.isArtist = false;
            $scope.workId = workId;
            $scope.flagDiv = workId;
            $scope.showPlaylistCRUD = true;
            $scope.currentIndex = index;
            $http.get('/api/work/get?workId=' + workId).success(function (work) {
                $rootScope.currentWork = work;
                $rootScope.currentWork.description = $sce.trustAsHtml($rootScope.currentWork.description.replace(/\r?\n/g, '<br />'));
            });
        };

        $http.get('/api/user/current').success(function(userInfo) {
            if(userInfo.roles.indexOf('artist') != -1) {
                $scope.isArtist = true;
            }
        })

        $scope.closePlaylistCRUD = function (workId) {
            $scope.workId = workId;
            $scope.flagDiv = workId;
            $scope.showPlaylistCRUD = false;
        };

        $scope.showPlaylistCRUD = false;

        $scope.openViewInfo = function (id, copy) {
            $rootScope.copy = copy;
            $location.path('/viewInfo/' + id);
        };

        $scope.addWorkToPlaylist = function (playlist) {
            var workId = $scope.workId;
            $http.post('/api/playlist/addWork', {playlistId: playlist._id, workId: workId}).success(function (response) {
                angular.forEach($scope.myPlaylists, function (ele) {
                    if (ele._id == playlist._id) {
                        ele.works.push(workId);
                    }
                });
            });
        };

        $scope.removeWorkFromPlaylist = function (playlist) {
            var workId = $scope.workId;
            $http.post('/api/playlist/removeWork', {playlistId: playlist._id, workId: workId }).success(function (response) {
                angular.forEach($scope.myPlaylists, function (ele) {
                    if (ele._id == playlist._id) {
                        var index = ele.works.indexOf(workId);
                        if (index != -1)
                            ele.works.splice(index, 1);
                    }
                });
            });
        };
        $scope.isPresentInPlayList = function (works) {
            var status = false;
            angular.forEach(works, function (ele) {
                if (ele == $scope.workId) {
                    status = true;
                }
            });
            return status;
        }


    }])
    .controller('LFPController', ['$scope', function () {

    }])
    .controller('ManageInventoryController', ['$scope', function () {

    }])
    .controller('MediaPlayerController', ['$scope', '$location', '$rootScope', '$http', '$routeParams', function ($scope, $location, $rootScope, $http, $routeParams) {
        $scope.artist = false;
        if ($rootScope.currentPlaylistInMediaPlayer && $rootScope.currentPlaylistInMediaPlayer.length > 0) {
            $scope.currentMediaPlaying = $rootScope.currentPlaylistInMediaPlayer[0];
        }
        else {
            $location.path('/playlist');
        }
        $scope.userRoleCollector = $rootScope.currentUser.roles[$rootScope.currentUser.roles.indexOf('collector')];
        if ($("#cbp-spmenu-s2").hasClass('cbp-spmenu-open')) {
            showRightBar();
        }

        function updatePublicUrl() {
            var matches = window.location.href.match(/^https?:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
            var domain = matches && matches[1];  // domain will be null if no match is found
            try {
                $scope.publicPageLink = "http://" + domain + "/content/" + ($scope.currentMediaPlaying.workCopy && $scope.currentMediaPlaying.workCopy.publicKey || $scope.currentMediaPlaying.publicKey);
            } catch (c) {

            }
        }

        updatePublicUrl();

        setTimeout(function () {
            updatePublicUrl();
            angular.element('.qrcode.videoqr').html("");
            angular.element('.qrcode.videoqr').qrcode({
                render: 'div',
                width: 100,
                height: 100,
                size: 200,
                color: '#000',
                text: $scope.publicPageLink
            });
        }, 10);
        for (var state in $rootScope.currentUser.roles) {
            if ($rootScope.currentUser.roles.hasOwnProperty(state)) {
                if ($rootScope.currentUser.roles[state] == 'artist')
                    $scope.artist = true;
            }
        }
        if ($('.bodyCont .container').css('position') == 'relative') {
            $('.bodyCont .container').css('position', 'static');
        }


        $scope.showMediaDetailsPopup = function () {
            updatePublicUrl();
            angular.element('.qrcode').html("");
            angular.element('.qrcode').qrcode({
                render: "div",
                width: 100,
                height: 100,
                color: '#000',
                text: $scope.publicPageLink
            });
        };
        $scope.setCurrentPlaying = function (work) {
            $scope.currentMediaPlaying = work;
            updatePublicUrl();
            angular.element('.qrcode.videoqr').html("");
            angular.element('.qrcode.videoqr').qrcode({
                render: 'div',
                width: 100,
                height: 100,
                size: 200,
                color: '#000',
                text: $scope.publicPageLink
            });
        };
        $('.mediaPreview').on('loading', function (e, title) {
            $scope.currentPlaylistInMediaPlayer.forEach(function (el, idx) {
                if (el.title == title) {
                    $scope.currentMediaPlaying = el;
                    updatePublicUrl();
                    angular.element('.qrcode').html("");
                    angular.element('.qrcode').qrcode({
                        render: "div",
                        size: 50,
                        width: 100,
                        height: 100,
                        color: '#000',
                        text: $scope.publicPageLink
                    });
                    $scope.$apply();
                }
            });
        });
    }])
    .controller('MasterController', ['$scope', '$location', '$rootScope', '$http', '$routeParams', function ($scope, $location, $rootScope, $http, $routeParams) {
        $rootScope.roles = {
            ARTIST: "artist",
            COLLECTOR: "collector"
        };
        $http.get('/api/user/current').success(function (response) {
            $rootScope.currentUser = response;

            if ($rootScope.currentUser.roles.indexOf($rootScope.roles.ARTIST) != -1) {
                $rootScope.learnMoreURL = "/";
            } else if ($rootScope.currentUser.roles.indexOf($rootScope.roles.COLLECTOR) != -1) {
                $rootScope.learnMoreURL = "/";
            } else {
                $rootScope.learnMoreURL = "/trade";
            }
        });
    }])

    // MarketController
    .controller('MarketController', ['$scope', '$http', function($scope, $http) {
        $scope.marketFilter = {_id: ""};
        

        $http.get('/api/market/getMarketByUserId').success(function(market) {
            $scope.myMarket = market;
        });
        $scope.getMarketWorks = function (marketId) {
            // $scope.currentPlaylistOpenedId = marketId;
            $http.get('/api/market/getWork/' + marketId).success(function(works) {
                $scope.workInCurrentMarket = works;
                // console.log(works);
            })
        };

        $scope.addMarket = function() {
            $scope.newMarketNameInput = true;
            $scope.confirmMarketName = function() {
                var market = $scope.newMarketName;
                console.log(market);
                if (market) {
                    $http.post('/api/market/create', {name : market}).success(function (res) {
                        $http.get('/api/market/getMarketByUserId').success(function(market) {
                            $scope.myMarket = market;
                            hidePlaylists();
                            $scope.newMarketNameInput = false;
                            $scope.newMarketName = null;
                        });
                    });
                } else {
                    $scope.newMarketNameInput = false;
                    $scope.newMarketName = null;
                }
            }
        }


        $scope.updateMarketLayout = function () {
            hideMarket();
        };

        function hideMarket() {
            setTimeout(function () {
                angular.element('ul.playlist').hide();
            }, 10);
        }
    }])



    // Playlist Controller
    .controller('PlaylistController', ['$scope', '$http', '$rootScope', '$location', function ($scope, $http, $rootScope, $location) {
        $scope.isLoaded = false;
        $scope.ajaxProgress = false;
        $scope.isMylisa = true;
        $scope.workInCurrentMarket = [];

        // Get all market sites
        $http.get('/api/market/getMarketByUserId').success(function(markets) {
            $scope.listMarket = markets;
        });


        // Playlist default (where contain all site partner as mylisa.co, mylisa.tv)
        $scope.getListSites = function() {
            if($scope.isLoaded == true) {
                $scope.isLoaded = false;
            } else {
                $scope.isLoaded = true;
            }
        }

        $scope.listWorkInMarket = function(marketId) {
            if($scope.isLoaded == true) {
                $scope.isLoaded = false;
            } else {
                $scope.isLoaded = true;
            }
            $http.get('/api/market/getWork/' + marketId).success(function(works) {
                $scope.workInCurrentMarket = works;
                // console.log(works);
            })
        }


        $scope.getWorkById = function() {
            
        }



        // Playlist interaction
        $scope.ajaxCallInProgress = false;
        $scope.worksInCurrentPlaylist = [];
        $scope.playlistFilter = {_id: ""};
        $rootScope.isMediaPlaying = false;
        $scope.myPlaylist = [];

        $http.get('/api/playlist/getByUserId').success(function (playlists) {
            $scope.myPlaylists = playlists;
            hidePlaylists();
        });
        $scope.updateListLayout = function () {
            hidePlaylists();
        };
        $scope.addPlaylist = function () {
            $scope.newPlaylistNameInput = true;
            $scope.confirmPlaylistName = function () {
                var playlist = $scope.newPlaylistName;
                if (playlist) {
                    $http.post('/api/playlist/create', {title: playlist}).success(function (response) {
                        // $scope.myPlaylists.push(response);
                        $http.get('/api/playlist/getByUserId').success(function (playlists) {
                            $scope.myPlaylists = playlists;
                            hidePlaylists();
                            $scope.newPlaylistNameInput = false;
                            $scope.newPlaylistName = null;
                        });
                    });
                } else {
                    $scope.newPlaylistNameInput = false;
                    $scope.newPlaylistName = null;
                }
            };
        };

        $scope.removePlaylist = function (playlistId, index) {
            $http.post('/api/playlist/delete', {playlistId: playlistId}).success(function (response) {
                $scope.myPlaylists.splice(index, 1);
                $http.get('/api/playlist/getByUserId').success(function (playlists) {
                    $scope.myPlaylists = playlists;
                    hidePlaylists();
                });
            });
        };

        $scope.getPlaylistWorks = function (playlistId) {
            $scope.ajaxCallInProgress = true;
            $scope.currentPlaylistOpenedId = playlistId;
            $http.get('/api/playlist/getPlaylistWork/' + playlistId).success(function (response) {
                $scope.ajaxCallInProgress = false;
                $scope.worksInCurrentPlaylist = response;
            });
        };
        $scope.addPlaylistToMediaPlayer = function (playlistId) {
            $http.get('/api/playlist/getPlaylistWork/' + playlistId).success(function (response) {
                $scope.ajaxCallInProgress = false;
                $scope.worksInCurrentPlaylist = response;
                $rootScope.currentPlaylistInMediaPlayer = $scope.worksInCurrentPlaylist;

                if ($scope.worksInCurrentPlaylist.length) {
                    $rootScope.isMediaPlaying = true;
                    $location.path('/media-player');
                }

            });
        };
        $scope.removeWorkFromPlaylist = function (workId) {
            $http.post('/api/playlist/removeWork', {playlistId: $scope.currentPlaylistOpenedId, workId: workId }).success(function (response) {
                angular.forEach($scope.worksInCurrentPlaylist, function (ele, idx) {
                    if (ele._id == workId) {
                        $scope.worksInCurrentPlaylist.splice(idx, 1);
                    }
                });
            });
        };
        $scope.renamePlaylist = function (playlist) {
            $scope["newPlaylistNameInput" + playlist._id] = true;
            $scope.confirmNewPlaylistName = function (playlist, playlistName) {
//                var playlistName = $scope["updatedPlaylistName"];
                if (playlistName) {
                    $http.put('/api/playlist/update/' + playlist._id, {title: playlistName}).success(function (response) {
                        // $scope.myPlaylists.push(response);
                        $http.get('/api/playlist/getByUserId').success(function () {
                            $scope.myPlaylists.forEach(function (el, idx) {
                                if (el._id == playlist._id) {
                                    el.title = playlistName;
                                }
                            });
                            $scope["newPlaylistNameInput" + playlist._id] = false;
                            $scope.updatedPlaylistName = null;
                        });
                    });
                } else {
                    $scope["newPlaylistNameInput" + playlist._id] = false;
                    $scope.updatedPlaylistName = null;
                }
            };
        };
        $scope.closeUpdateField = function (name) {
            $scope[name] = false;
        };
        $scope.generateDynamicName = function (a1, a2) {
            return a1 + a2;
        };
        function hidePlaylists() {
            setTimeout(function () {
                angular.element('ul.playlist').hide();
            }, 10);
        }
    }])
    // --- End Playlist Controller ----


    .controller('ProfileController', ['$rootScope', '$scope', '$http', '$window', function ($rootScope, $scope, $http, $window) {
        $scope.user = {};
        $scope.passwordStatus = false;
        $http.get('/api/user/current').success(function (response) {
            $scope.currentUser = response;
            $scope.userRoleCollector = $scope.currentUser.roles[$scope.currentUser.roles.indexOf('collector')];
            $scope.userRoleArtist = $scope.currentUser.roles[$scope.currentUser.roles.indexOf('artist')];
        });

        $scope.viewPrivateKeyPDF = function () {
            $window.open('/api/pdf/privateKey/' + $scope.currentUser._id);
        };

        $scope.viewTradeKeyPDF = function () {
            $window.open('/api/pdf/tradeKey/' + $scope.currentUser._id);
        };

        $scope.viewCreatorKeyPDF = function () {
            $window.open('/api/pdf/creatorKey/' + $scope.currentUser._id);
        };
        $scope.createKeyError = true;
        $scope.updateUserFields = function (model) {
            if (model == 'name') {
                if ($scope.user[model]) {
                    $scope.currentUser.firstName = $scope.user[model].split(' ')[0] || '';
                    $scope.currentUser.lastName = $scope.user[model].split(' ')[1] || '';
                    $scope.ajaxBackendUpdate({'firstName': $scope.currentUser.firstName, 'lastName': $scope.currentUser.lastName});
                } else {
                    $scope.user[model] = $scope.currentUser.firstName || '';
                    $scope.user[model] = $scope.currentUser.lastName || '';
                }
            }
            if (model == 'address') {

                if ($scope.user[model]) {
                    $scope.currentUser.address = $scope.user[model] || '';
                    $scope.currentUser.zip = $scope.user.zip || '';
                    $scope.currentUser.streetNumber = $scope.user.streetNumber || '';

                    $scope.changeCountry = function () {
                        //$scope.currentUser.country
                    };


                    $scope.currentUser.city = $scope.user.city || '';

                    $scope.ajaxBackendUpdate({'address': $scope.currentUser.address, 'zip': $scope.currentUser.zip, 'country': $scope.currentUser.country, 'streetNumber': $scope.currentUser.streetNumber, 'city': $scope.currentUser.city})
                }
                else {
                    $scope.user[model] = $scope.currentUser.address;
                    $scope.user.zip = $scope.currentUser.zip;
                    $scope.user.country = $scope.currentUser.country;
                    $scope.user.state = $scope.currentUser.state;
                    $scope.user.city = $scope.currentUser.city;
                    $scope.user.streetNumber = $scope.currentUser.streetNumber;

                }
            }
            if (model == 'phone') {
                if ($scope.user[model]) {
                    $scope.currentUser.phone.business = parseInt($scope.user[model].business);
                    $scope.currentUser.phone.mobile = parseInt($scope.user[model].mobile);
                    if ($scope.currentUser.phone.business != '' || $scope.currentUser.phone.mobile != '')
                        $scope.ajaxBackendUpdate({'phone.business': $scope.currentUser.phone.business, 'phone.mobile': $scope.currentUser.phone.mobile})
                } else {
                    if ($scope.currentUser.phone)
                        $scope.user[model] = {business: $scope.currentUser.phone.business, mobile: $scope.currentUser.phone.mobile}
                }
            }
            if (model == 'email') {
                if ($scope.user[model]) {

                    $scope.currentUser.email.temp = $scope.user[model].temp;

                    if ($scope.currentUser.email.temp != '' && $scope.currentUser.email.temp != $scope.currentUser.email.primary) {
                        var data = {
                            email: $scope.user.email.temp,
                            userId: $scope.currentUser._id
                        };
                        $http.post('/api/auth/updateEmail', data).success(function (response) {
                        });
                    }

                    $scope.currentUser.email.paypal = $scope.user[model].paypal;
                    if ($scope.user.email.paypal != '' && $scope.user.email.paypal != $scope.currentUser.email.paypal)
                        $scope.ajaxBackendUpdate({'email.paypal': $scope.currentUser.email.paypal})
                } else {
                    if ($scope.currentUser.email)
                        $scope.user[model] = {paypal: $scope.currentUser.email.paypal}
                }
            }
            if (model == 'businessInfo') {
                if ($scope.user[model]) {
                    $scope.currentUser.businessInfo.company = $scope.user[model].company || '';
                    $scope.currentUser.businessInfo.companyNumber = $scope.user[model].companyNumber || '';
                    if ($scope.currentUser.businessInfo.company != '' && $scope.currentUser.businessInfo.companyNumber != '')
                        $scope.ajaxBackendUpdate({'businessInfo.company': $scope.currentUser.businessInfo.company, 'businessInfo.companyNumber': $scope.currentUser.businessInfo.companyNumber})
                } else {
                    if ($scope.currentUser.businessInfo)
                        $scope.user[model] = {'company': $scope.currentUser.businessInfo.company, 'companyNumber': $scope.currentUser.businessInfo.companyNumber};
                }
            }
            if (model == 'password') {
                $scope.passwordStatus = true;
                $http.post('/api/auth/changePassword', {email: $scope.currentUser.email.primary}).success(function (response) {
                });
            }
            if (model == 'privateKey') {
                $scope.createKeyError = $scope.currentUser["firstName"]
                    && ($scope.currentUser["address"] || $scope.currentUser["city"] || $scope.currentUser["country"] || $scope.currentUser["zip"])
                    && ($scope.currentUser["phone"].business || $scope.currentUser["phone"].mobile)
                    && $scope.currentUser["email"] || "";
                setTimeout(function () {
                    $scope.createKeyError = true;
                    $scope.$apply();
                }, 20000);
                if ($scope.userRoleArtist == "artist") {
                    $scope.createKeyError = $scope.createKeyError && $scope.currentUser["businessInfo"].company || "";
                }
                if (!$scope.createKeyError)
                    return false;
                $scope.keyGenerated = null;
                $http.post('/api/auth/generatePrivateKey', $scope.currentUser).success(function (response) {
                    $scope.keyGenerated = response;
                    $scope.currentUser.privateKey = response;
                });
            }
            if (model == 'tradeKey') {
                $scope.createKeyError = $scope.currentUser["firstName"]
                    && ($scope.currentUser["address"] || $scope.currentUser["city"] || $scope.currentUser["country"] || $scope.currentUser["zip"])
                    && ($scope.currentUser["phone"].business || $scope.currentUser["phone"].mobile)
                    && $scope.currentUser["email"] || "";
                setTimeout(function () {
                    $scope.createKeyError = true;
                    $scope.$apply();
                }, 20000);
                if ($scope.userRoleArtist == "artist") {
                    $scope.createKeyError = $scope.createKeyError && $scope.currentUser["businessInfo"].company || "";
                }
                if (!$scope.createKeyError)
                    return false;
                $scope.TradeKeyGenerated = null;
                $http.post('/api/auth/generateTradeKey', $scope.currentUser).success(function (response) {
                    $scope.TradeKeyGenerated = response;
                    $scope.currentUser.tradeKey = response;
                });
            }
            if (model == 'creatorKey') {
                $scope.createKeyError = $scope.currentUser["firstName"]
                    && ($scope.currentUser["address"] || $scope.currentUser["city"] || $scope.currentUser["country"] || $scope.currentUser["zip"])
                    && ($scope.currentUser["phone"].business || $scope.currentUser["phone"].mobile)
                    && $scope.currentUser["email"]
                    && $scope.currentUser["businessInfo"].company || "";
                setTimeout(function () {
                    $scope.createKeyError = true;
                    $scope.$apply();
                }, 20000);
                if (!$scope.createKeyError)
                    return false;
                $scope.creatorKeyGenerated = null;
                $http.post('/api/auth/generateCreatorKey', $scope.currentUser).success(function (response) {
                    $scope.creatorKeyGenerated = response;
                    $scope.currentUser.creatorKey = response;
                });
            }
            if (model == 'hideName') {
                if ($scope.user[model]) {
                    $scope.currentUser.hideName = $scope.user[model].hideName;
                    $scope.ajaxBackendUpdate({'hideName': $scope.currentUser.hideName})
                }
                else {
                    if ($scope.currentUser.hideName)
                        $scope.user[model] = {hideName: $scope.currentUser.hideName}
                }
            }

        };

        $scope.ajaxBackendUpdate = function (data) {
            $http.post('/api/user/update', data).success(function (response) {
                // $scope.user = {};
            });
        };

        $scope.checkDigit = function (e, id) {
            if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                e.preventDefault();
            }
        }
    }])
    .controller('ResetController', ['$scope', function () {

    }])
    .controller('SellWorkController', ['$scope', '$http', '$routeParams', '$location', '$rootScope', function ($scope, $http, $routeParams, $location, $rootScope) {
        $scope.offSet = $routeParams.offSet || 0;
        $scope.limit = $routeParams.limit || 0;
        $scope.mediaObject = $routeParams.mediaObject || 'all';
        $scope.works = {};
        $scope.check = parseInt($scope.offSet) + parseInt($scope.limit);
        $scope.userRoleCollector = $scope.currentUser.roles[$scope.currentUser.roles.indexOf('collector')];
        $scope.userRoleArtist = $scope.currentUser.roles[$scope.currentUser.roles.indexOf('artist')];
        for (var state in $rootScope.currentUser.roles) {
            if ($rootScope.currentUser.roles.hasOwnProperty(state)) {
                if ($rootScope.currentUser.roles[state] == 'artist')
                    $scope.artist = true;
            }
        }
        $scope.mediaCategory = [
            { "value": "all", "category": "ALL MEDIA"},
            { "value": "Still Image", "category": "Still Image" },
            { "value": "Moving Image", "category": "Moving Image"},
            {"value": "Sound Art", "category": "Sound Art"}
        ];
        $scope.changeCategory = function (mediaObject) {
            $scope.mediaObject = mediaObject;
            $location.path('/sell-work/' + $scope.mediaObject + "/" + $scope.offSet + "/" + $scope.limit);
        };


        $http.get('/api/sellWorkCount/' + $scope.mediaObject).success(function (response) {
            $scope.pageCount = (response.count / $scope.limit) - 1;
            $scope.count = response.count;
            if (parseInt($scope.offSet) < 0 || parseInt($scope.offSet) > $scope.count) {
                $scope.offSet = 0;
                $location.path('/sell-work/' + $scope.mediaObject + "/" + $scope.offSet + "/" + $scope.limit);
            }
        });
        $http.get('/api/sellWorks/' + $scope.mediaObject + '/' + $scope.offSet + '/' + $scope.limit).success(function (response) {
            $scope.works = response;
        });

        $scope.nextPage = function () {
            if ($scope.offSet <= $scope.count) {
                $scope.offSet = parseInt($scope.offSet) + parseInt($scope.limit);
                $location.path('/sell-work/' + $scope.mediaObject + "/" + $scope.offSet + "/" + $scope.limit);
                $http.get('/api/sellWorks/' + $scope.mediaObject + "/" + $scope.offSet + '/' + $scope.limit).success(function (response) {
                    $scope.works = response;
                })
            }
        };
        $scope.previousPage = function () {
            if ($scope.offSet > 0) {
                $scope.offSet = parseInt($scope.offSet) - parseInt($scope.limit) || 0;
                $location.path('/sell-work/' + $scope.mediaObject + "/" + $scope.offSet + "/" + $scope.limit);
                $http.get('/api/sellWorks/' + $scope.mediaObject + "/" + $scope.offSet + '/' + $scope.limit).success(function (response) {
                    $scope.works = response;
                });
            }
        };
    }])
    .controller('SalesInfoController', ['$scope', '$location', '$routeParams', '$http', '$rootScope', "$sce", function ($scope, $location, $routeParams, $http, $rootScope, $sce) {


        $http.get('/api/work/get?workId=' + $routeParams.workId).success(function (work) {
            $rootScope.currentWork = work;
            $rootScope.currentWork.description = $sce.trustAsHtml($rootScope.currentWork.description.replace(/\r?\n/g, '<br />'));
        });

        $rootScope.updatedWork = {};
        $rootScope.updatedWork.copies = 2;
        $rootScope.updatedWork.offerIn = 'false';
        $rootScope.updatedWork.currency = 'USD';
        $rootScope.updatedWork.copiesOnMDisk = 0;
        $scope.checkValidPrivateKey = function (key) {
            $http.post('/user/checkValidKeyByUserRole', {key: key}).success(function (response) {
                $('#creatorIcon').removeClass('chkRed').addClass('chkGreen');
                $('#creatorkey').removeClass('form-error-field');
                $scope.artist = response;
            }).error(function (response) {
                    $('#creatorIcon').removeClass('chkGreen').addClass('chkRed');
                    $('#creatorkey').addClass('form-error-field');
                });
        };

        $scope.checkValidCreatorKey = function (key) {
            $http.post('/user/checkValidCreatorKey', {key: key}).success(function (response) {
                $scope.keyMatch = true;
                $('#creatorIcon').removeClass('chkRed').addClass('chkGreen');
                $scope.artist = response;
            }).error(function (response) {
                    $('#privateIcon').removeClass('chkGreen').addClass('chkRed');
                    $scope.keyMatch = false;
                });
        };

        //Verifications
        $scope.checkValidTradeKey = function (key) {
            $http.post('/user/checkValidTradeKey', {key: key}).success(function (response) {
                if (response && response._id) {
                    $scope.keyMatch = true;
                    $('#tradeIcon').removeClass('chkRed').addClass('chkGreen');
                    $scope.artist = response;
                } else {
                    $scope.keyMatch = false;
                    $('#tradeIcon').removeClass('chkGreen').addClass('chkRed');
                }
            }).error(function (response) {
                    $scope.keyMatch = false;
                    $('#tradeIcon').removeClass('chkGreen').addClass('chkRed');
                });
        };


        $scope.next = function () {
            if (inventoryValidate()) {
                $location.path('/finalSalesInfo/' + $scope.currentWork._id);
            }
        };
        $rootScope.allWork = function () {
            $location.path('/inventory/all/0/25');
        };
        $scope.checkDigit = function (e, id) {
            if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                e.preventDefault();
            }
        }

    }])
    .controller('TraceController', ['$scope', function () {

    }])
    .controller('TransferWorkController', ['$scope', function () {

    }])
    .controller('transferWorkStep1', ['$scope', '$location', '$rootScope', '$http', '$routeParams', '$sce', function ($scope, $location, $rootScope, $http, $routeParams, $sce) {
        $scope.toLink = function (link) {
            $location.path(link);
        };
        $scope.isEmail = function (email) {
            var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return regex.test(email);
        };
        $scope.ajaxCallInProgress = false;
        $rootScope.artFairAgreement = false;
        $rootScope.offeredFromLFP = false;
        $scope.artist = false;
        for (var state in $rootScope.currentUser.roles) {
            if ($rootScope.currentUser.roles.hasOwnProperty(state)) {
                if ($rootScope.currentUser.roles[state] == 'artist')
                    $scope.artist = true;
            }
        }

        //get user type
        $scope.isArtist = ($rootScope.currentUser && $rootScope.currentUser.roles.indexOf("artist") != -1);

        $http.get('/api/work/getWorkAndOneOwnedCopy?workId=' + $routeParams.workId).success(function (work) {
            $scope.noCopyToSellError = false;
            $rootScope.currentWork = work;
            $scope.currentWork = work;
            $rootScope.currentWork.targetWorkCopyNumber = false;
            if ($scope.currentWork.workCopyLFP && $scope.currentWork.workCopyLFP._id) {
                $scope.currentWork.workCopy = $scope.currentWork.workCopyLFP;
                $rootScope.offeredFromLFP = true;
                $rootScope.currentWork.targetWorkCopyNumber = $rootScope.currentWork.targetWorkCopyNumber || $scope.currentWork.workCopyLFP.copyNumber;
                $rootScope.currentWork.targetWorkCopyNumber = $rootScope.currentWork.targetWorkCopyNumber > $scope.currentWork.workCopyLFP.copyNumber ? $scope.currentWork.workCopyLFP.copyNumber : $rootScope.currentWork.targetWorkCopyNumber;
            } else if ($scope.currentWork.workCopyNonLFP && $scope.currentWork.workCopyNonLFP._id) {
                $scope.currentWork.workCopy = $scope.currentWork.workCopyNonLFP;
                $rootScope.offeredFromLFP = false;
                $rootScope.currentWork.targetWorkCopyNumber = $rootScope.currentWork.targetWorkCopyNumber || $scope.currentWork.workCopyNonLFP.copyNumber;
                $rootScope.currentWork.targetWorkCopyNumber = $rootScope.currentWork.targetWorkCopyNumber > $scope.currentWork.workCopyNonLFP.copyNumber ? $scope.currentWork.workCopyNonLFP.copyNumber : $rootScope.currentWork.targetWorkCopyNumber;
            } else {
                //todo No copy to sell
                $scope.noCopyToSellError = true;
            }

            //figure out copy number
            if ($scope.currentWork.workCopyLFP && $scope.currentWork.workCopyLFP._id) {
                $rootScope.currentWork.targetWorkCopyNumber = $rootScope.currentWork.targetWorkCopyNumber || $scope.currentWork.workCopyLFP.copyNumber;
                $rootScope.currentWork.targetWorkCopyNumber = $rootScope.currentWork.targetWorkCopyNumber > $scope.currentWork.workCopyLFP.copyNumber ? $scope.currentWork.workCopyLFP.copyNumber : $rootScope.currentWork.targetWorkCopyNumber;
            }
            if ($scope.currentWork.workCopyNonLFP && $scope.currentWork.workCopyNonLFP._id) {
                $rootScope.currentWork.targetWorkCopyNumber = $rootScope.currentWork.targetWorkCopyNumber || $scope.currentWork.workCopyNonLFP.copyNumber;
                $rootScope.currentWork.targetWorkCopyNumber = $rootScope.currentWork.targetWorkCopyNumber > $scope.currentWork.workCopyNonLFP.copyNumber ? $scope.currentWork.workCopyNonLFP.copyNumber : $rootScope.currentWork.targetWorkCopyNumber;
            }

            $rootScope.currentPrice = $scope.currentWork.pricePerWork;
            $rootScope.currentWork.description = $sce.trustAsHtml($rootScope.currentWork.description.replace(/\r?\n/g, '<br />'));
            $rootScope.artFairAgreement = !!$scope.currentWork.workCopy.artFairAgreement;

        });
        $scope.paymentOption = 'Paypal';
        $rootScope.paypalBuyerEmail = $scope.paypalEmail;
        $scope.ajaxSuccess = false;
        $scope.changeOfferedFromLFPStatus = function (status) {
            $rootScope.offeredFromLFP = status && $rootScope.currentWork.workCopyLFP && $rootScope.currentWork.workCopyLFP._id;
            if ($rootScope.offeredFromLFP) $scope.currentWork.workCopy = $rootScope.currentWork.workCopyLFP;
            else  $scope.currentWork.workCopy = $rootScope.currentWork.workCopyNonLFP;
        };
        $scope.getCoaUrl = function () {
            if (!$rootScope.currentWork) return null;
            if ($rootScope.currentWork.artistUserId.toString() == $rootScope.currentUser._id.toString()) return null;
            return "/api/coa/pdf/" + $rootScope.currentWork._id + "/" + $rootScope.currentWork.workCopy._id;
        };
        $scope.getContractUrl = function () {
            if (!$rootScope.currentWork) return null;
            if ($rootScope.currentWork.artistUserId.toString() == $rootScope.currentUser._id.toString()) return null;
            return "/api/contract/pdf/" + $rootScope.currentWork._id + "/" + $rootScope.currentWork.workCopy._id;
        };
        $scope.changeArtFairAgreement = function (status) {
            if ($scope.isArtist) {
                $rootScope.artFairAgreement = status;
            }
        };
        $scope.updatePrice = function () {
            if ($scope.paymentOption == 'No payment request') {
                $rootScope.currentPrice = 0;
            } else {
                $rootScope.currentPrice = $scope.currentWork.pricePerWork;
            }
        };
        $scope.requestPayment = function () {

            //For free transfer
            if ($scope.paymentOption == 'No payment request') {
                $location.path('/work/transfer/confirm/' + $routeParams.workId + "/" + $scope.currentWork.workCopy._id + "/" + $scope.currentWork.targetWorkCopyNumber)
                    .search("lfp", $rootScope.offeredFromLFP ? 1 : 0)
                    .search("afa", $rootScope.artFairAgreement ? 1 : 0);
                return;
            }

            //In case of Reserved Works then no need for any ajax call to server.
            if ($scope.paymentOption == 'Reserved Works') {
                $location.path('/works/reserved');
                return;
            }

            //In case of Unclaimed Works then no need for any ajax call to server.
            if ($scope.paymentOption == 'Unclaimed Works') {
                $location.path('/works/unclaimed');
                return;
            }

            //Mark as in progress
            $scope.ajaxCallInProgress = true;

            //Build the object
            var transferRequestData = {
                paymentOption: $scope.paymentOption,
                workId: $routeParams.workId,
                currentPrice: $scope.currentPrice,
                artFairAgreement: $rootScope.artFairAgreement,
                copyTypeLFP: $rootScope.offeredFromLFP,
                workCopyId: $rootScope.currentWork.workCopy._id
            };
            if ($scope.paymentOption == 'Paypal') {
                transferRequestData["buyerEmail"] = $scope.paypalEmail;
            } else if ($scope.paymentOption == 'Bank transfer') {
                transferRequestData["buyerEmail"] = $scope.email;
                transferRequestData["bankDetails"] = $scope.bank;
            }

            //Send AJAX request
            $http.post('/api/work/transfer/initiate', transferRequestData).success(function (response) {
                if (response.error) {
                    $scope.ajaxSuccess = true;
                    $scope.ajaxError = response.error;
                    //Mark as in progress
                    $scope.ajaxCallInProgress = false;
                } else {
                    $location.path('/works/reserved');
                }
            });
        }
    }])
    .controller('transferWorkStep2', ['$scope', '$location', '$rootScope', '$http', '$routeParams', '$sce', function ($scope, $location, $rootScope, $http, $routeParams, $sce) {
        $scope.toLink = function (link) {
            $location.path(link);
        };
        $http.get('/api/work/get?workId=' + $routeParams.workId).success(function (work) {
            $rootScope.currentWork = work;
            $scope.date = new Date().toDateString();
            $rootScope.currentWork.description = $sce.trustAsHtml($rootScope.currentWork.description.replace(/\r?\n/g, '<br />'));
            if (($rootScope.currentWork.stillAnnotatedImage && $rootScope.currentWork.stillAnnotatedImage.png) || $rootScope.currentWork.category == "Sound Art") {
                if ($rootScope.currentUser && $rootScope.currentUser.roles.indexOf("collector") != -1) {
                    if ($rootScope.copy) {
                        $scope.coaURL = '/api/coa/pdf/' + $rootScope.currentWork._id + "/" + $rootScope.copy._id;
                        $scope.contractURL = "/api/contract/pdf/" + $rootScope.currentWork._id + "/" + $rootScope.copy._id;
                    } else {
                        $location.path("/inventory/all/10/0");
                    }
                } else {
                    $scope.coaURL = '/api/coa/pdf/' + $rootScope.currentWork._id;
                    $scope.contractURL = "/api/contract/pdf/" + $rootScope.currentWork._id;
                }
                $scope.disableFlag = true;
            }
            else {
                if ($rootScope.currentUser && $rootScope.currentUser.roles.indexOf("collector") != -1) {
                    if ($rootScope.copy) {
                        $scope.contractURL = "/api/contract/pdf/" + $rootScope.currentWork._id + "/" + $rootScope.copy._id;
                    } else {
                        $location.path("/inventory/all/10/0");
                    }
                } else {
                    $scope.contractURL = "/api/contract/pdf/" + $rootScope.currentWork._id;
                }
                $scope.disableFlag = false;
                $scope.coaURL = 'javascript:void(0)'
            }
        });

        $scope.continue = function () {
            $location.path('/transfer-work-step3/' + $routeParams.workId + '/');
        }
    }])
    .controller('reservedWorks', ['$scope', '$location', '$rootScope', '$http', '$routeParams', '$sce', function ($scope, $location, $rootScope, $http, $routeParams, $sce) {
        $scope.mediaObject = $routeParams.mediaObject || 'all';
        $scope.works = [];
        $scope.mediaCategory = [
            { "value": "all", "category": "ALL MEDIA"},
            { "value": "Still Image", "category": "Still Image" },
            { "value": "Moving Image", "category": "Moving Image"},
            {"value": "Sound Art", "category": "Sound Art"}
        ];
        $scope.changeCategory = function (mediaObject) {
            $scope.mediaObject = mediaObject;
            $location.path('/works/reserved/' + $scope.mediaObject);
        };

        $scope.openDetailsBox = function (id) {
            $scope.openDivId = id;
        };

        $scope.closeDetailsBox = function (id) {
            $scope.openDivId = null;
        };

        $scope.resendPaymentInfo = function (workCopyId) {
            $scope.loaderWorkCopyId = workCopyId.toString();
            $http.post("/api/work/payment/info/resend/" + workCopyId).success(function (updatedWorkCopy) {
                angular.forEach($scope.works, function (el, index) {
                    if (el._id == workCopyId) {
                        $scope.works[index] = updatedWorkCopy;
                    }
                });
                $scope.loaderWorkCopyId = null;
            });
        };

        $scope.removeReservedWork = function (workCopyId) {
            $scope.loaderWorkCopyId = workCopyId.toString();
            $http.delete("/api/work/copy/delete/" + workCopyId).success(function (resp) {
                var indexToSplice = null;
                angular.forEach($scope.works, function (el, index) {
                    if (el._id == workCopyId) {
                        indexToSplice = index;
                        $scope.works[index] = null;
                    }
                });
                if (indexToSplice != null) $scope.works.splice(indexToSplice, 1);
                $scope.loaderWorkCopyId = null;
            });
        };

        $http.get('/api/work/reserved/' + $scope.mediaObject).success(function (response) {
            $scope.works = response;
        });

    }])
    .controller('transferWorkStep3', ['$scope', '$location', '$rootScope', '$http', '$routeParams', '$sce', function ($scope, $location, $rootScope, $http, $routeParams, $sce) {
        $scope.toLink = function (link) {
            $location.path(link);
        };
        $scope.isEmail = function (email) {
            var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return regex.test(email);
        };
        //See if artist
        $scope.artist = false;
        for (var state in $rootScope.currentUser.roles) {
            if ($rootScope.currentUser.roles.hasOwnProperty(state)) {
                if ($rootScope.currentUser.roles[state] == 'artist')
                    $scope.artist = true;
            }
        }

        //Transfer button handler
        $scope.transferWork = function () {
            $rootScope.buyerEmail = $scope.buyerEmail;
            $http.post('/api/ownership/transfer', {artFairAgreement: $rootScope.artFairAgreement, offeredFromLFP: $rootScope.offeredFromLFP, buyerEmail: $scope.buyerEmail, workCopyId: $routeParams.workCopyId}).success(function (response) {
                if (response)
                    $location.path('/works/unclaimed');
            }).error(function (err) {
                    alert("We were unable to process your request. " + err);
                })
        };

        //Get data
        $http.get('/api/work/getWorkAndOneOwnedCopy?workId=' + $routeParams.workId + "&workCopyId=" + $routeParams.workCopyId).success(function (work) {
            $rootScope.currentWork = work;
            $rootScope.currentWork.description = $sce.trustAsHtml($rootScope.currentWork.description.replace(/\r?\n/g, '<br />'));
            $rootScope.currentWork.targetWorkCopyNumber = $routeParams.copyNumber && parseInt($routeParams.copyNumber, 10) || $rootScope.currentWork.workCopy.copyNumber;
            $scope.showCKBox = $scope.artist;
            $scope.showPKBox = !$scope.artist;
            $scope.artFairAgreement = $location.search().afa == 1 ? true : $location.search().afa == 0 ? false : $rootScope.currentWork.workCopy.artFairAgreement;
            $scope.offeredFromLFP = $location.search().lfp == 1 ? true : $location.search().lfp == 0 ? false : $rootScope.currentWork.workCopy.copyTypeLFP;
        });

        //URL gens
        $scope.getCoaUrl = function () {
            if (!$rootScope.currentWork) return null;
            if ($rootScope.currentWork.artistUserId.toString() == $rootScope.currentUser._id.toString()) return null;
            return "/api/coa/pdf/" + $rootScope.currentWork._id + "/" + $rootScope.currentWork.workCopy._id;
        };
        $scope.getContractUrl = function () {
            if (!$rootScope.currentWork) return null;
            if ($rootScope.currentWork.artistUserId.toString() == $rootScope.currentUser._id.toString()) return null;
            return "/api/contract/pdf/" + $rootScope.currentWork._id + "/" + $rootScope.currentWork.workCopy._id;
        };

        //Verifications
        $scope.checkValidTradeKey = function (key) {
            $http.post('/user/checkValidTradeKey', {key: key}).success(function (response) {
                if (response && response._id) {
                    $scope.keyMatch = true;
                    $('#tradeIcon').removeClass('chkRed').addClass('chkGreen');
                    $('#tradekey').removeClass('form-error-field');
                } else {
                    $scope.keyMatch = false;
                    $('#tradeIcon').removeClass('chkGreen').addClass('chkRed');
                    $('#tradekey').addClass('form-error-field');
                }
            }).error(function (response) {
                    $scope.keyMatch = false;
                    $('#tradeIcon').removeClass('chkGreen').addClass('chkRed');
                    $('#tradekey').addClass('form-error-field');

                });
            $scope.date = new Date().toDateString();
        };

    }])
    .controller('transferWorkStep4', ['$scope', '$location', '$rootScope', '$http', '$routeParams', '$sce', function ($scope, $location, $rootScope, $http, $routeParams, $sce) {
        $scope.toLink = function (link) {
            $location.path(link);
        };
        $http.get('/api/work/get?workId=' + $routeParams.workId).success(function (work) {
            $rootScope.currentWork = work;
            $rootScope.currentWork.description = $sce.trustAsHtml($rootScope.currentWork.description.replace(/\r?\n/g, '<br />'));
            if (($rootScope.currentWork.stillAnnotatedImage && $rootScope.currentWork.stillAnnotatedImage.png) || $rootScope.currentWork.category == "Sound Art") {
                if ($rootScope.currentUser && $rootScope.currentUser.roles.indexOf("collector") != -1) {
                    if ($rootScope.copy) {
                        $scope.coaURL = '/api/coa/pdf/' + $rootScope.currentWork._id + "/" + $rootScope.copy._id;
                        $scope.contractURL = "/api/contract/pdf/" + $rootScope.currentWork._id + "/" + $rootScope.copy._id;
                    } else {
                        $location.path("/inventory/all/10/0");
                    }
                } else {
                    $scope.coaURL = '/api/coa/pdf/' + $rootScope.currentWork._id;
                    $scope.contractURL = "/api/contract/pdf/" + $rootScope.currentWork._id;
                }
                $scope.disableFlag = true;
            }
            else {
                if ($rootScope.currentUser && $rootScope.currentUser.roles.indexOf("collector") != -1) {
                    if ($rootScope.copy) {
                        $scope.contractURL = "/api/contract/pdf/" + $rootScope.currentWork._id + "/" + $rootScope.copy._id;
                    } else {
                        $location.path("/inventory/all/10/0");
                    }
                } else {
                    $scope.contractURL = "/api/contract/pdf/" + $rootScope.currentWork._id;
                }
                $scope.disableFlag = false;
                $scope.coaURL = 'javascript:void(0)'
            }
            $scope.email = $rootScope.buyerEmail;
            $scope.date = new Date().toDateString();
            $scope.send = true;
            $scope.resendTransferKey = function () {
                $http.post('/api/resendTransferKey', {key: $rootScope.transferKey}).success(function (response) {
                    if (response)
                        $scope.send = false;
                }).error(function (err) {
                    })
            }
        })
    }])
    .controller('trasnferWorkUnclaimed', ['$scope', '$http', '$routeParams', '$location', "$rootScope", "$sce", "$q", function ($scope, $http, $routeParams, $location, $rootScope, $sce, $q) {
        $scope.mediaObject = $routeParams.mediaObject || 'all';
        $scope.works = [];
        $scope.processingRequest = false;
        $scope.mediaCategory = [
            { "value": "all", "category": "ALL WORKS"},
            { "value": "Still Image", "category": "Still Image" },
            { "value": "Moving Image", "category": "Moving Image"},
            {"value": "Sound Art", "category": "Sound Art"}
        ];
        $scope.changeCategory = function (mediaObject) {
            $scope.mediaObject = mediaObject;
            $location.path('/works/unclaimed/' + $scope.mediaObject);
        };

        $http.get('/api/work/unclaimed/' + $scope.mediaObject).success(function (response) {
            $scope.works = response;
        });

        $scope.editDetails = function (workerId) {
            $scope.flagDiv = workerId;
        };

        $scope.resendTransferKey = function (workCopyId) {
            $scope.processingRequest = true;
            $http.post('/api/key/transfer/resend/' + workCopyId).success(function () {
                $scope.processingRequest = false;
                alert("Transfer key sent");
            }).error(function (err) {
                    $scope.processingRequest = false;
                    alert("Error while sending transfer key.");
                });
        };

        $scope.removeFromSalesTransaction = function (workCopyId) {
            $scope.processingRequest = true;
            $http.post('/api/removeFromSales', {workCopyId: workCopyId}).success(function (response) {
                if (response) {
                    alert("Removed from Sales transaction : " + workCopyId);
                    $scope.processingRequest = false;
                    var indexToSplice = null;
                    angular.forEach($scope.works, function (el, index) {
                        if (el._id == workCopyId) {
                            indexToSplice = index;
                            $scope.works[index] = null;
                        }
                    });
                    if (indexToSplice != null) $scope.works.splice(indexToSplice, 1);
                }
            }).error(function (err) {
                    $scope.processingRequest = false;
                    alert("Error while Removing .");
                })
        };

    }])
    .controller('ViewInfoController', ['$scope', '$location', '$rootScope', '$http', '$routeParams', '$sce', function ($scope, $location, $rootScope, $http, $routeParams, $sce) {
        $scope.showPlaylistCRUD = false;
        $scope.showEmbedCode = false;


        $scope.showMarketCRUD = false;
        $scope.isAddNew = true;
        $scope.isShowText = true;
        $scope.sites = {};



        $scope.isShowInput = false;
        
        

        $http.get('/api/market/getMarketByUserId').success(function (market) {
            $scope.myMarket = market;
        });



        $scope.btnCreateNew = function() {
            $scope.isAddNew = false;
            $scope.isShowText = false;
        }


        $scope.createNewSite = function() {
            if($scope.sites.name === undefined || $scope.sites.name === "") {
                alert('Please enter your site');
            } else {
                $http.post('/api/market/create', {name : $scope.sites.name}).success(function (res) {
                    alert('Added new site success');
                    $scope.myMarket.push(res);
                    $scope.sites.name = '';
                });
            }
        }



        

        
        $scope.openMarketCRUD = function() {
            $scope.showMarketCRUD = true;
        };

        $scope.closeMarketCRUD = function() {
            $scope.showMarketCRUD = false;
        };



        $scope.addWorkToMarket = function (market) {
            var workId = $routeParams.workId;
            $http.post('/api/market/addWork', {marketId: market._id, workId: workId}).success(function (response) {
                angular.forEach($scope.myMarket, function (ele) {
                    if (ele._id == market._id) {
                        ele.sites.works.push(workId);
                    }
                });
            });
        };

        $scope.removeWorkFromMarket = function (market) {
            var workId = $routeParams.workId;
            $http.post('/api/market/removeWork', {marketId: market._id, workId: workId }).success(function (response) {
                angular.forEach($scope.myMarket, function (ele) {
                    if (ele._id == market._id) {
                        var index = ele.sites.works.indexOf(workId);
                        if (index != -1)
                            ele.sites.works.splice(index, 1);
                    }
                });
            });
        };

        $scope.isPresentInMarket = function (works) {
            var status = false;
            angular.forEach(works, function (ele) {
                if (ele == $routeParams.workId) {
                    status = true;
                }
            });
            return status;
        };





        //get user type
        $scope.isArtist = ($rootScope.currentUser && $rootScope.currentUser.roles.indexOf("artist") != -1);

        if ($scope.isArtist) {
            $http.get('/api/work/get?workId=' + $routeParams.workId).success(function (work) {
                $rootScope.currentWork = work;
                $rootScope.currentWork.description = $sce.trustAsHtml($rootScope.currentWork.description.replace(/\r?\n/g, '<br />'));
            });
        } else {
            $http.get('/api/workcopy/get?workId=' + $routeParams.workId).success(function (work) {
                $rootScope.currentWork = work;
                $rootScope.currentWork.description = $sce.trustAsHtml($rootScope.currentWork.workInfo.description.replace(/\r?\n/g, '<br />'));
                $scope.coaURL = '/api/coa/pdf/' + $rootScope.currentWork.workId + "/" + $rootScope.currentWork._id;
                $scope.contractURL = "/api/contract/pdf/" + $rootScope.currentWork.workId + "/" + $rootScope.currentWork._id;
            });


            /*$http.get('/api/work/get?workId=' + $routeParams.workId).success(function (work) {
             $rootScope.currentWork = work;
             $rootScope.currentWork.description = $sce.trustAsHtml($rootScope.currentWork.description.replace(/\r?\n/g, '<br />'));

             if (($rootScope.currentWork.stillAnnotatedImage && $rootScope.currentWork.stillAnnotatedImage.png) || $rootScope.currentWork.category == "Sound Art") {

             if ($rootScope.currentUser && $rootScope.currentUser.roles.indexOf("collector") != -1) {
             if ($rootScope.copy) {
             $scope.coaURL = '/api/coa/pdf/' + $rootScope.currentWork._id + "/" + $rootScope.copy._id;
             $scope.contractURL = "/api/contract/pdf/" + $rootScope.currentWork._id + "/" + $rootScope.copy._id;
             } else {
             $location.path("/inventory/all/10/0");
             }
             } else {
             $scope.coaURL = '/api/coa/pdf/' + $rootScope.currentWork._id;
             $scope.contractURL = "/api/contract/pdf/" + $rootScope.currentWork._id;
             }

             $scope.disableFlag = true;
             }
             else {
             if ($rootScope.currentUser && $rootScope.currentUser.roles.indexOf("collector") != -1) {
             if ($rootScope.copy) {
             $scope.contractURL = "/api/contract/pdf/" + $rootScope.currentWork._id + "/" + $rootScope.copy._id;
             } else {
             $location.path("/inventory/all/10/0");
             }
             } else {
             $scope.contractURL = "/api/contract/pdf/" + $rootScope.currentWork._id;
             }
             $scope.coaURL = 'javascript:void(0)';
             $scope.disableFlag = false;
             }

             });*/
        }


        $http.get('/api/playlist/getByUserId').success(function (playlists) {
            $scope.myPlaylists = playlists;
        });
        $scope.openPlaylistCRUD = function () {
            $scope.showPlaylistCRUD = true;
        };

        $scope.closePlaylistCRUD = function () {
            $scope.showPlaylistCRUD = false;
        };

        $scope.addWorkToPlaylist = function (playlist) {
            var workId = $routeParams.workId;
            $http.post('/api/playlist/addWork', {playlistId: playlist._id, workId: workId}).success(function (response) {
                angular.forEach($scope.myPlaylists, function (ele) {
                    if (ele._id == playlist._id) {
                        ele.works.push(workId);
                    }
                });
            });
        };

        $scope.removeWorkFromPlaylist = function (playlist) {
            var workId = $routeParams.workId;
            $http.post('/api/playlist/removeWork', {playlistId: playlist._id, workId: workId }).success(function (response) {
                angular.forEach($scope.myPlaylists, function (ele) {
                    if (ele._id == playlist._id) {
                        var index = ele.works.indexOf(workId);
                        if (index != -1)
                            ele.works.splice(index, 1);
                    }
                });
            });
        };

        $scope.isPresentInPlayList = function (works) {
            var status = false;
            angular.forEach(works, function (ele) {
                if (ele == $routeParams.workId) {
                    status = true;
                }
            });
            return status;
        };

        $scope.getEmbedCode = function () {
            $scope.showEmbedCode = true;
            var src = window.location.origin + '/embed/' + $routeParams.workId;
            $scope.embedCode = '<iframe width="560" height="315" src="' + src + '" frameborder="0"></iframe>';
        };

        $scope.closeEmbedCode = function () {
            $scope.showEmbedCode = false;

        }

    }]);

