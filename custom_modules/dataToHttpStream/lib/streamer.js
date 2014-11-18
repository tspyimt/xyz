var send = require("send");

exports.bufferToHTTPStream = function (req, res, buffer, fileName, contentType) {
    if (arguments.length != 5) throw "Invalid number of arguments passed in the streamer";
    var headers = {
        "Content-Type": contentType,
        "Content-Length": buffer.length + "",
        "Cache-Control": "public, max-age=0",
        "Content-Disposition": "inline; filename=" + fileName,
        "Content-Transfer-Encoding": "binary",
        "Accept-Ranges": "bytes"
    };
    if (Boolean(req.headers.range)) {
        var start, end;
        req.headers.range.replace(/[^=]+= *([^ \-]+) *- *([^ \-]*)/g, function (a, st, en) {
            start = parseInt(st, 10);
            end = parseInt(en, 10);
            end = isNaN(end) && buffer.length || end;
        });
        headers["Content-Range"] = "bytes " + start + "-" + end + "/" + (buffer.length);
        headers["Content-Length"] = ((end - start) + 1) + "";
        headers['Transfer-Encoding'] = 'chunked';
        headers['Accept-Ranges'] = 'bytes';
        headers["Connection"] = "Keep-Alive";
        log.trace("STREAMING file", fileName, "With Ranged bytes. START:", start, ", END:", end, req.headers, headers);
        res.writeHead(206, headers);
        res.write(buffer.slice(start, end) + "0", "binary");
        res.end();
    } else {
        log.trace("STREAMING file", fileName, "With full bytes", req.headers, headers);
        res.writeHead(200, headers);
        res.end(buffer);
    }
};

exports.filePathToStream = function (req, res, filePath) {
    log.trace("STREAMING via path", filePath);
    send(req, filePath)
        .maxage(0)
        //.root(filePath)
        .hidden(true)
        .on('error', function (err) {
            log.error("UNABLE TO STREAM: ", err);
        })
        .on("stream", function () {
            log.trace("STREAM START for file", filePath);
        })
        .on("end", function () {
            log.trace("STREAM END for file", filePath);
        })
        .pipe(res);
};