var xStart,
    xEnd,
    yStart,
    yEnd,
    paint,
    // ctx = $('canvas')[0].getContext("2d");
    canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var ctx = canvas.getContext('2d');
var socket = io();                                          // sockets
var easing = 0.2;
var x, y, xE, yE, startTime, endTime=0;
var mycolor = 'blue';
socket.on('connect',()=>{
    var d = new Date();
    console.log(`new connection at : ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);
    socket.emit('onConn',{
        hh: d.getHours(),
        mm: d.getMinutes(),
        ss: d.getSeconds()
    });
});

$(document).ready(function () {

    if (typeof FlashCanvas != "undefined") {                // for internet explorer
        FlashCanvas.initElement($('canvas')[0]);
    }
    ctx.strokeStyle = 'blue';
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 10;


    $('canvas').bind('mousedown mousemove mouseup mouseleave touchstart touchmove touchend', function (e) {
        var orig = e.originalEvent;
        if (e.type == 'mousedown') {
            e.preventDefault(); e.stopPropagation();

            xStart = e.clientX;
            yStart = e.clientY;
            xEnd = xStart;
            yEnd = yStart;
            startTime = new Date().getTime();
            socket.emit('drawing',{
                x1: xStart,
                y1: yStart,
                x2: xEnd,
                y2: yEnd
            });
            paint = true;
            draw(mycolor);

        } else if (e.type == 'mousemove') {
            if (paint == true) {
                xEnd = e.clientX;
                yEnd = e.clientY;

                 
                socket.emit('drawing',{
                    x1: xStart,
                    y1: yStart,
                    x2: xEnd,
                    y2: yEnd
                });
                draw(mycolor);
            }
        } else if (e.type == 'mouseup') {
            endTime = new Date().getTime();
            paint = false;
        } else if (e.type == 'mouseleave') {
            paint = false;
        } else if (e.type == 'touchstart') {
            // console.log(orig);
            if (orig.touches.length == 1) {
                e.preventDefault(); e.stopPropagation();
                xStart = orig.changedTouches[0].pageX;
                yStart = orig.changedTouches[0].pageY;
                xEnd = xStart;
                yEnd = yStart;
                paint = true;   
                draw(mycolor);
            }
        } else if (e.type == 'touchmove') {
            if (orig.touches.length == 1) {
                if (paint == true) {
                    xEnd = orig.changedTouches[0].pageX;
                    yEnd = orig.changedTouches[0].pageY;



                    var x1 = xEnd,
                        x2 = xStart,
                        y1 = yEnd,
                        y2 = yStart;



                    ctx.lineWidth = 15;


                    draw(mycolor);
                }
            }
        } else if (e.type == 'touchend') {
            paint = false;
        }

    });
});

socket.on('serverMsg',function(data){
    ctx.beginPath();
    ctx.moveTo(data.sx1, data.sy1);
    ctx.lineTo(data.sx2,data.sy2);
    ctx.strokeStyle = 'red';
    ctx.stroke();
});


function draw(mycolor) {
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle=mycolor;
    SPEED = speed(distance(xStart,yStart,xEnd,yEnd) , endTime - startTime);
    // if(SPEED > 5){
        console.log(SPEED);
    // }
    ctx.stroke();

    xStart = xEnd;
    yStart = yEnd;
}

$(document).ready(()=>{
    $('#clear').click(()=>{
        ctx.clearRect(0,0,canvas.width,canvas.height);
    });

    $('#limegreen,#purple,#blue,#indianred').click(function(){
        mycolor = this.id;
    });
});

function distance(x1,y1,x2,y2){
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

function speed(d,t){
    return Math.abs(d/t);
}