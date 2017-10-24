canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext('2d');

var socket = io();

var paint = false;
var points = [];
var p1,p2;
var mycolor = 'blue';
ctx.strokeStyle = mycolor;
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.shadowBlur = 0.5;
ctx.shadowColor = 'blue'; 
ctx.lineWidth = 10;

$(document).ready(()=>{

    socket.on('connect',()=>{
    var d = new Date();
    console.log(`new connection at : ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);
    socket.emit('onConn',{
        hh: d.getHours(),
        mm: d.getMinutes(),
        ss: d.getSeconds()
        });
    });


    $('canvas').bind('mousedown mousemove mouseup mouseleave touchstart touchmove touchend', function (e) {
        
        var orig = e.originalEvent;
        if (e.type == 'mousedown') {
            e.preventDefault(); e.stopPropagation();

            points.push({x : e.clientX, y : e.clientY});
            
            startTime = new Date().getTime();
            socket.emit('drawing',{
                points : points
            });
            paint = true;
            
            draw(mycolor);

        } else if (e.type == 'mousemove') {
            if (paint == false) 
                return ;
                
                points.push({ x: e.clientX, y: e.clientY });
                
                socket.emit('drawing',{
                    points : points
                });
                draw(mycolor);
            }
          else if (e.type == 'mouseup') {
            endTime = new Date().getTime();
            paint = false;
            points.length = 0;
        } else if (e.type == 'mouseleave') {
            paint = false;
            points.length = 0;
        }
          else if (e.type == 'touchstart') {

            if (orig.touches.length == 1) {
                e.preventDefault(); e.stopPropagation();
    
                points.push({ x: orig.changedTouches[0].pageX, y: orig.changedTouches[0].pageY });                startTime = new Date().getTime();

                socket.emit('drawing',{
                    points : points
                });
                
                paint = true;
                draw(mycolor);
            }
        }
              else if (e.type == 'touchmove') {
                if (orig.touches.length == 1) {
                    if (paint == false) 
                        return ;
                        
                    points.push({ x: orig.changedTouches[0].pageX, y: orig.changedTouches[0].pageY });

                    socket.emit('drawing',{
                        points : points
                    });
                    
                    draw(mycolor);
                }
            } else if (e.type == 'touchend') {
                paint = false;
                endTime = new Date().getTime();
                points.length = 0;
            }
    })

});

socket.on('serverMsg',function(data){
    p1 = data.sPoints[0];
    p2 = data.sPoints[1];
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    for (var i = 1; i < data.sPoints.length; i++) {
        var midPt = midpoint(p1,p2);
        ctx.quadraticCurveTo(p1.x, p1.y, midPt.x, midPt.y);
        p1 = data.sPoints[i];
        p2 = data.sPoints[i+1];
    }
    ctx.lineTo(p1.x,p1.y);
    ctx.stroke();
});
 

$(document).ready(()=>{
    $('#clear').click(()=>{
        ctx.clearRect(0,0,canvas.width,canvas.height);
    });

    $('#limegreen,#blue,#indianred').click(function(){
        mycolor = this.id;
        ctx.shadowColor = this.id;
    });

    $('#blue-shadow,#red-shadow,#limegreen-shadow,#none-shadow').click(function(){
         ctx.shadowColor = this.id.split('-')[0];
         ctx.shadowBlur = 10;
    });
});

function draw(mycolor){
    p1 = points[0];
    p2 = points[1];
    ctx.strokeStyle = mycolor;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    for (var i = 1; i < points.length; i++) {
        var midPt = midpoint(p1,p2);
        ctx.quadraticCurveTo(p1.x, p1.y, midPt.x, midPt.y);
        p1 = points[i];
        p2 = points[i+1];
    }
    ctx.lineTo(p1.x,p1.y);
    ctx.stroke();
}

function midpoint(p1,p2){
    return {
        x: (p1.x + p2.x)/2,
        y: (p1.y + p2.y)/2
    };
}