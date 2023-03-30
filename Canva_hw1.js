
var canvas = document.querySelector("#myCanvas");
var textInput = document.querySelector("#text-input");
const SaveImg = document.querySelector("#saveImg");
const Clear = document.querySelector("#clear-canvas");
const Toolbtns = document.querySelectorAll(".toolbtn");
const ColorPicker = document.querySelectorAll(".color-picker");
const Slider = document.querySelector("#slider");
const Uploader = document.querySelector("#uploader");
const Undo = document.querySelector("#undo");
const Redo = document.querySelector("#redo");
const FontChooser = document.querySelector("#font-chooser");
const FontSizer = document.querySelector("#font-sizer");
// const Generator = document.querySelector(".generate-qr");


var ctx = canvas.getContext("2d");

// ctx.fillStyle = "#FF0000";
// ctx.fillRect(0,0,150,75);

;
let lastX, lastY,initX,initY;
let isDrawing = false;
let selectedTool = "brush";
let brushWidth = 10;
let selectedColor = "#000";
let lastMoveTime;
let path_rec = [];
let points = [];
let LastPath = [];
ctx.lineCap = 'round'


var ImageStack = new Array();
var step = -1;
var snapshot;
var cursorImage = "images/paint-brush.png";
var timeout = 0;
var delay = 800;

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", Drawing);
canvas.addEventListener("mouseup", stopDrawing);
// canvas.addEventListener("mouseleave", stopDrawing);
Snap();
document.getElementById("block").style.backgroundColor = selectedColor;

canvas.style.cursor = "url(" + cursorImage + "), auto";
console.log(canvas.style.cursor);
canvas.addEventListener('click', function(e) {
    // Show the text input element and position it at the mouse cursor
    if(selectedTool === "Text"){
        // const textInput = document.getElementById('text-input');
        textInput.style.display = 'block';
        textInput.style.top = e.offsetY + 'px';
        textInput.style.left = e.offsetX + 'px';
        console.log(textInput.style.left);
        lastY = e.offsetY; 
        lastX = e.offsetX;
        textInput.focus();
    }
});

textInput.addEventListener('keydown',function(e){
    if(e.key === 'Enter'){
        textInput.style.display = 'none';
        const text = textInput.value;
        ctx.font = `${FontSizer.value}px ${FontChooser.value}`
        ctx.fillStyle = selectedColor;
        ctx.fillText(text, lastX, lastY+15);
        textInput.value = '';
        Snap();
    }
});

function startDraw (e){
    isDrawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
    initX = e.offsetX;
    initY = e.offsetY;
    // startTime = new Date(); 

    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    snapshot = ctx.getImageData(0,0,canvas.width,canvas.height);
}

function Drawing(e){

    if(!isDrawing) return;
    if (!lastMoveTime) {
        lastMoveTime = new Date();
        console.log(lastMoveTime)
        return;
    }

    const currentTime = new Date();
    const timepass = currentTime - lastMoveTime;
    if (timepass > delay) timeout = 1;

    ctx.beginPath();
    if(selectedTool === "brush" && timeout != 1 || selectedTool === "eraser"){
        if(selectedTool === "eraser"){
            ctx.globalCompositeOperation ="destination-out";
        }
        else {
            ctx.globalCompositeOperation ="source-over";
        }
        ctx.moveTo(lastX, lastY); 
        ctx.lineTo(e.offsetX, e.offsetY+16);
        ctx.stroke();
        lastX = e.offsetX;
        lastY = e.offsetY+16;  
    }
    else if (selectedTool === "rectangle"){
        ctx.globalCompositeOperation ="source-over";
        ctx.putImageData(snapshot,0,0);
        ctx.strokeRect(e.offsetX, e.offsetY, lastX - e.offsetX, lastY - e.offsetY);
    }
    else if (selectedTool === "circle"){
        ctx.globalCompositeOperation ="source-over";
        ctx.putImageData(snapshot,0,0);
        drawCircle(e);
    }
    else if (selectedTool === "triangle"){
        ctx.globalCompositeOperation ="source-over";
        ctx.putImageData(snapshot,0,0);
        drawTriangle(e);
    }
    else if (selectedTool === "straight" || timeout == 1){
        ctx.globalCompositeOperation ="source-over";
        ctx.putImageData(snapshot,0,0);
        drawStraight(e);
    }
    else if(selectedTool === "Text"){
        ctx.globalCompositeOperation ="source-over";
    }
    lastMoveTime = currentTime;
}


function drawCircle(e){
    // ctx.beginPath();
    let centerX = (lastX + e.offsetX)/2;
    let centerY = (lastY + e.offsetY)/2;
    let diameter = Math.sqrt(Math.pow((lastX - e.offsetX), 2) + Math.pow((lastY - e.offsetY), 2));
    ctx.arc(centerX,centerY,diameter/2,0, 2*Math.PI);
    ctx.stroke();
}

function drawTriangle(e){

    ctx.moveTo(lastX,lastY);
    ctx.lineTo(e.offsetX,e.offsetY);
    ctx.lineTo(lastX - (e.offsetX - lastX), e.offsetY);
    ctx.closePath();
    ctx.stroke();
}

function drawStraight(e){
    // ctx.beginPath();
    ctx.moveTo(initX,initY);
    ctx.lineTo(e.offsetX,e.offsetY);
    
    ctx.closePath();
    ctx.stroke();
}

function stopDrawing(e){
    isDrawing = false;
    timeout = 0;
    lastMoveTime = null;
    if(selectedTool === "Text");
    else Snap();
}

function changeColor() {
    // Get the values of the inputs
    const redValue = document.getElementById("R").value;
    const greenValue = document.getElementById("G").value;
    const blueValue = document.getElementById("B").value;

    // Set the background color of the target element
    document.getElementById("block").style.backgroundColor = `rgb(${redValue}, ${greenValue}, ${blueValue})`;
    selectedColor = `rgb(${redValue}, ${greenValue}, ${blueValue})`;
}

// function changeFont() {
//     const font = FontChooser.value;
//     ctx.font = `${2 * brushWidth}px ${font}`;
//   }

function Snap() {

    step++;
    if (step < ImageStack.length) { ImageStack.length = step; }
    ImageStack.push(canvas.toDataURL());
    // document.title = step + ":" + ImageStack.length;
}

Toolbtns.forEach(btn => {
    btn.addEventListener("click", () => { 
    
        selectedTool = btn.id;
        // btn.style.backgroundColor = "#000";
        if (selectedTool === "brush") {
            cursorImage = "images/paint-brush.png";
        }
        else if (selectedTool === "eraser") {
            cursorImage = "images/eraser.png";
        }
        else if (selectedTool === "rectangle"){
            cursorImage = "images/rectangle.png";
        }
        else if(selectedTool === "straight"){
            cursorImage = "images/straight-line.png";
        }
        else if (selectedTool === "circle"){
            cursorImage = "images/circle.png";
        }
        else if (selectedTool === "Text"){
            cursorImage = "images/text.png";
        }
        else if (selectedTool === "triangle"){
            cursorImage = "images/triangle.png";
        }
        canvas.style.cursor = "url(" + cursorImage + "), auto";
    });
});

ColorPicker.forEach(btn => {
    btn.addEventListener("change",changeColor);
});

Undo.addEventListener("click",() => {
    if(step > 0){
        console.log("Undo");
        step--;
        console.log(step);
        var img = new Image();
        img.src = ImageStack[step];
        img.onload = function(){
            ctx.globalCompositeOperation ="source-over";
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img,0,0);
        }
    }
});

Redo.addEventListener("click",() => {
    
    if(step < ImageStack.length - 1){
        console.log("Redo");
        step++;
        console.log(step);
        var img = new Image();
        img.src = ImageStack[step];
        img.onload = function(){
            ctx.globalCompositeOperation ="source-over";
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img,0,0);
        }
    }
});

SaveImg.addEventListener("click",() => {

    link = document.createElement("a");
    link.download = "Image.jpg";
    link.href = canvas.toDataURL();
    link.click();
});

// Generator.addEventListener("click",() => {

//     const dataURL = canvas.toDataURL();
//     qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${dataURL}`;
//     const qrcode = document.getElementById('qrcode');
//     qrcode.src = qrImage;
// });

Slider.addEventListener("change", (e) => brushWidth = e.target.value)

Uploader.addEventListener("change", (e) => {
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        // Draw the image on the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img,0,0,canvas.width, canvas.height);
        ImageStack = new Array();
        step = -1;
        Snap();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
    Uploader.value = "";
});


Clear.addEventListener("click", () => {
    ImageStack = new Array();
    step = -1;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clearing whole canvas
    Snap();
});