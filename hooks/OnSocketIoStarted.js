var socket = require('socket.io')
    , Utils = require("../src/Utils")
    , RedisStore = socket.RedisStore
    , redis = require('redis');

/**
 * Handler for the event OnSocketIoStarted
 * */
exports.onEvent = function (io) {
    log.info("Socket IO Started:");

    //Export the io object
    global.__io = io;

    //Initialize the redis config
    var redisPort = _config.dataSource.redis.port
        , redisUrl = _config.dataSource.redis.url
        , pub = redis.createClient(redisPort, redisUrl)
        , sub = redis.createClient(redisPort, redisUrl)
        , client = redis.createClient(redisPort, redisUrl);

    io.configure(function () {
        io.set('store', new RedisStore({redisPub: pub, redisSub: sub, redisClient: client}));

        //Enable optimizations
        io.enable('browser client minification');  // send minified client
        io.enable('browser client etag');          // apply etag caching logic based on version number
        io.enable('browser client gzip');          // gzip the file

        //Reduce Logging for production
        if (__appEnv == "production") io.set('log level', 1);

        //Limit to certain transports.
        io.set('transports', [
            'websocket',
            'xhr-polling',
            'jsonp-polling'
        ]);

        //Secure the websocket, also decide which user room to associate to.
        io.set('authorization', function (handshakeData, callback) {
            var token = handshakeData.query.token;
            if (Boolean(token)) {
                Utils.verifyBearerToken(token, function (err, data) {
                    if (err) {
                        log.error(err);
                        callback(new Error("Invalid token."));
                    } else {
                        handshakeData.userId = data._id;
                        callback(null, true);
                    }
                });
            } else {
                callback(new Error("Access Token not provided. please provide a 'token' in the query."));
            }
        });
    });

    //Handle connections
    io.
        of(_config.socketEndpointURI).
        on('connection',function (socket) {

            log.debug("Connection Created for: ", socket.handshake.userId);

            //Error event for socket
            socket.on("error", function (err) {
                log.error(err);
            });

            //Say hello to connected user.
            socket.emit("HELLO", {message: "Hello From Server"});

            //Enable a ping check mechanism. For testing purposes of created sockets by client apps or other consumers.
            socket.on("PING", function (message) {
                log.debug("A PING is received from", socket.handshake.userId, message);
                socket.emit("PINGBACK", message);
            });

            //Enable broadcasting to all connections to the endpoint.
            socket.on("BROADCAST", function (message) {
                log.debug("A BROADCAST is received from", socket.handshake.userId, message);
                __io.in(socket.handshake.userId).emit("BROADCAST_MESSAGE", message);
            });

            //Log disconnection
            socket.on('disconnect', function () {
                log.debug("Socket disconnected");
            });

            //Join the room for user events.
            if (Boolean(socket.handshake.userId)) {
                log.trace("Joining Room:", socket.handshake.userId);
                socket.join(socket.handshake.userId);
                socket.emit("ready", {id: socket.handshake.userId});
            } else {
                socket.disconnect();
            }

            //Trigger an event.
            globalEvent.emit("OnSocketConnectionEstablished", socket.handshake.userId);
        }).
        on("error", function (err) {
            log.error(err);
        });

};
