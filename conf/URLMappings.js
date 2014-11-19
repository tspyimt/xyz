/**
 * URL Mappings are done in this file.
 *
 * "_app" is the express app object. Rest is all express.
 * */

//Require Controllers
var controllers = {
    cluster: require("../controllers/ClusterController"),
    home: require("../controllers/HomeController"),
    auth: require("../controllers/AuthController"),
    dashboard: require("../controllers/DashboardController"),
    work: require("../controllers/WorkController"),
    user: require("../controllers/UserController"),
    playlist: require("../controllers/PlaylistController"),
    market: require("../controllers/MarketController"),
    others: require("../controllers/OthersUtilityController")
};


//Cluster API
_app.get("/cluster/worker/list", controllers.cluster.list);

//Home URL Mappings
_app.get('/', controllers.home.index);
_app.get('/artists', controllers.home.artists);
_app.get('/collectors', controllers.home.collectors);
_app.get('/developers', controllers.home.developers);
_app.get('/trade', controllers.home.trade);

//Public Key URL's
_app.get('/content/:publicKey', controllers.work.publicWork);


//Registration and Authentication Routes

_app.post('/api/auth/login', controllers.auth.authenticate);
_app.post('/api/auth/signUp', controllers.auth.signUp);
_app.post('/api/auth/signUpClick', controllers.auth.signUpClick);
_app.post('/api/auth/changeEmail', controllers.auth.changeEmail);
_app.post('/api/auth/reSendVerification', controllers.auth.reSendVerification);
_app.post('/api/auth/changePassword', controllers.auth.changePassword);
_app.post('/api/auth/changePasswordClick', controllers.auth.changePasswordClick);
_app.post('/api/auth/basicInfo', controllers.auth.basicInfo);
_app.post('/api/auth/generateTradeKey', controllers.auth.generateTradeKey);
_app.post('/api/auth/generatePrivateKey', controllers.auth.generatePrivateKey);
_app.post('/api/auth/generateCreatorKey', controllers.auth.generateCreatorKey);

_app.post('/api/auth/updateEmail', controllers.auth.updateEmail);


_app.get('/auth/logout', controllers.auth.logout);

_app.get('/auth/verifyEmail/:verificationToken', controllers.auth.verifyEmail);

_app.get('/auth/updateVerifyEmail/:verificationToken', controllers.auth.updateVerifyEmail);

_app.get('/auth/resetPassword/:tokenId', controllers.auth.resetPassword);
_app.get('/auth/signIn', controllers.auth.signIn);
_app.get('/auth/email-verification', controllers.auth.emailVerification);
_app.get('/auth/email-verified', controllers.auth.emailVerified);
_app.get('/auth/agree-terms', controllers.auth.agreeTerms);
_app.get('/auth/TOS', controllers.auth.tos);


//Dashboards routes
_app.get('/user/dashboard', controllers.dashboard.dashboard);
_app.post('/user/checkValidPrivateKey', controllers.dashboard.checkValidPrivateKey);
_app.post('/user/checkValidCreatorKey', controllers.dashboard.checkValidCreatorKey);
_app.post('/user/checkValidTradeKey', controllers.dashboard.checkValidTradeKey);
_app.post('/user/checkValidKeyByUserRole', controllers.dashboard.checkValidKeyByUserRole);


//Work routes
_app.post('/work/create', controllers.work.saveWork);
_app.get('/api/work/get', controllers.work.getWorkById);// query ?workId=work_id
_app.get('/api/work/getWorkAndOneOwnedCopy', controllers.work.getWorkAndOneOwnedCopyById);
_app.get('/api/workcopy/get', controllers.work.getWorkCopyById);
_app.get('/api/work/update/:workId', controllers.work.updateWork);
_app.get('/user/mainscreen', controllers.dashboard.mainscreen);

//User Routes
_app.get('/api/user/current', controllers.user.getUser);
_app.get('/api/getEmailId/:userId', controllers.user.getUserEmailId);
_app.post('/api/user/update', controllers.user.updateUser);

//Work Routes
_app.get('/api/sellWorkCount/:mediaObject', controllers.work.getSellAbleWorksCount);
_app.get('/api/sellWorks/:mediaObject/:offSet/:limit', controllers.work.getSellAbleWorks);
_app.get('/api/inventoryWorksCount/:mediaObject', controllers.work.getInventoryWorksCount);
_app.get('/api/inventoryWorks/:mediaObject/:offSet/:limit', controllers.work.getInventoryWorks);
_app.post('/api/work/updateSalesInfo/:workId', controllers.work.updateSalesInfo);
_app.get('/embed/:workId', controllers.work.showEmbedWork);
_app.post('/api/ownership/transfer', controllers.work.transferOwnership);
_app.post('/api/ownership/claim', controllers.work.claimOwnership);
_app.post('/api/checkValidTransferKey', controllers.work.validateTransferKey);
_app.get('/api/work/unclaimed/:mediaObject', controllers.work.getUnclaimedWorks);
_app.post('/api/removeFromSales', controllers.work.removeFromSalesTransaction);

//Transfer work
_app.post("/api/work/transfer/initiate", controllers.work.initiateTransfer);
_app.get("/api/work/reserved/:category", controllers.work.listReservedWorks);
_app.post("/api/work/payment/info/resend/:workCopyId", controllers.work.resendPaymentInfo);
_app.delete("/api/work/copy/delete/:workCopyId", controllers.work.removeReservedWork);
_app.post('/api/key/transfer/resend/:workCopyId', controllers.work.resendTransferKey);

// Market Routes
_app.post('/api/market/create', controllers.market.saveMarket);
_app.get('/api/market/getMarketByUserId', controllers.market.getMarketByUserId);
_app.get('/api/market/getWork/:marketId', controllers.market.getWorkByMarketId);
_app.post('/api/market/addwork', controllers.market.addWorkToMarket);
_app.post('/api/market/removeWork', controllers.market.removeWorkFromMarket)


//Playlist Routes
_app.post('/api/playlist/create', controllers.playlist.savePlaylist);
_app.post('/api/playlist/addWork', controllers.playlist.addWorkToPlaylist);
_app.post('/api/playlist/removeWork', controllers.playlist.removeWorkFromPlaylist);
_app.post('/api/playlist/delete', controllers.playlist.deletePlaylist);
_app.get('/api/playlist/getByUserId', controllers.playlist.getPlaylistByUserId);
_app.get('/api/playlist/getPlaylistWork/:playlistId', controllers.playlist.getWorksInPlaylist);
_app.put('/api/playlist/update/:playlistId', controllers.playlist.updatePlaylist);


//Media URLS
_app.get('/api/workThumbnail/:workId', controllers.work.fetchMediaThumbnail);

//_app.get('/api/media/stream', controllers.work.streamMedia);
_app.get('/api/pdf/:type/:userId', controllers.work.fetchPDFDocument);
_app.get('/api/media/stream/:workId', controllers.work.fetchMediaForStreaming);
_app.get('/api/media/stream/embed/:workId', controllers.work.fetchMediaForEmbedWork);
_app.get('/api/media/thumbnail/:workId', controllers.work.fetchMediaThumbnail);
_app.get('/api/media/thumbnail/withoutWTM/:workId', controllers.work.fetchMediaThumbnailWithoutWatermark);
_app.get('/api/contract/pdf/:workId', controllers.work.fetchContractPDF);
_app.get('/api/contract/pdf/:workId/:copyDetailId', controllers.work.fetchContractPDF);
_app.get('/api/coa/pdf/:workId', controllers.work.fetchCoaPDF);
_app.get('/api/coa/pdf/:workId/:copyDetailId', controllers.work.fetchCoaPDF);
_app.post('/api/media/convert', controllers.work.processMediaForStreaming);

//mailer api
_app.post('/api/sendsubscribemail', controllers.others.sendSubscribeMail);
_app.post('/api/sendcontactmail', controllers.others.sendContactMail);
