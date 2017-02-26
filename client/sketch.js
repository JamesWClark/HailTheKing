var socket;

function setup() {
    createCanvas(640, 480);
    socket = io.connect('http://localhost:3000');
    
    socket.on('mouse', function(data) {
        fill(0,0,255);
        noStroke();
        ellipse(data.x, data.y, 80, 80);
    });
}

function draw() {
    if (mouseIsPressed) {
        fill(0);
    } else {
        fill(255);
    }
    ellipse(mouseX, mouseY, 80, 80);
}

function mouseDragged() {
    var data = {
        x : mouseX,
        y : mouseY
    };
    
    socket.emit('mouse', data);
}