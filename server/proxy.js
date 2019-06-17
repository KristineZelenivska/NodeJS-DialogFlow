 
    var express = require('express');
    var https = require('https');
    var app      = express();
    var proxy = require('http-proxy-middleware');
    var serverOne = 'https://accqsdemo.accenture.com/';
    var fs = require('fs');

    const path = require("path");
    

    // on developement mode: hit https://<your localhost domain name>:3001 in order to allow Chrome to accept
    // the domain's ssl certificate. It will ask for the creditions but you can ignore this on the browser as 
    // this is handled by this piece of code. IF YOU DON'T DO THIS THE FETCHING WILL NOT WORK ON DEVELOPMENT.

    var ssl = 
    {
        key: fs.readFileSync(path.join(__dirname,'/server.key'), 'utf-8'),
        cert: fs.readFileSync(path.join(__dirname,'/server.cert'), 'utf-8'),
    };  

    var catchreq = {};

    var options = {
        ws:true,
        ssl:ssl,
        onProxyReq: function (proxyReq, req, socket, options, head){
            proxyReq.setHeader('hdr-usr', 'ACCENTURE-ESO\\carolina.rizental');
            proxyReq.setHeader('X-Qlik-xrfkey','123456789ABCDEFG');
            
            catchreq = proxyReq;
            console.log(proxyReq)
        },
        onProxyReqWs: function (proxyReq, req, socket, options, head){
            proxyReq.setHeader('hdr-usr', 'ACCENTURE-ESO\\carolina.rizental');
            proxyReq.setHeader('X-Qlik-xrfkey','123456789ABCDEFG');
            
            console.log(proxyReq)
        },
        target: serverOne,
        pathRewrite: function (path, req) {
            var regex = /xrfkey=123456789ABCDEFG/g;
            if(path.match(regex)){
                return path;

            } else{
                return path+'?xrfkey=123456789ABCDEFG';
            }        


        },
        changeOrigin:true
    };

    var wsProxy = proxy(options);

    app.all("/*", wsProxy);

    var httpsServer = https.createServer(ssl, app);
    var server = httpsServer.listen(3001);
    server.on('upgrade', wsProxy.upgrade); // <-- subscribe to http 'upgrade'}