const express = require('express');
const http = require('http');
const socket = require('socket.io');

console.log("starting app..");

var app = express();
var server = http.createServer(app);
const port = process.env.PORT || 7777;
var io = socket(server);

app.use(express.static(__dirname+'/files'));


console.log('server started');

app.get('/draw',function(req,res){
    res.sendFile(__dirname + '/files/drawing.html');
});

io.on('connection',(socket)=>{
    console.log('...');
    socket.on('onConn',function(data){
        console.log(`new connection at ${data.hh}:${data.mm}:${data.ss}`);
    });
    socket.on('drawing',function(data){
        socket.broadcast.emit('serverMsg',{
            sPoints : data.points 
       });
    });

    
    // socket.on('mouseup',function(data){
            // socket.broadcast.emit('over',{
                
            // });
    // });
});


server.listen(port,()=>{
    console.log(`server is at ${port}`);
});