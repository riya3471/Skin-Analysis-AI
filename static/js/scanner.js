const video = document.getElementById("video");
const statusText = document.getElementById("status");

navigator.mediaDevices.getUserMedia({
    video: true
})
.then(function(stream){

    video.srcObject = stream;

    statusText.innerHTML = "Detecting Face...";

    setTimeout(function(){

        statusText.innerHTML = "Analyzing Skin...";

    },2000);

    setTimeout(function(){

        statusText.innerHTML = "Generating Report...";

    },4000);

    setTimeout(function(){

        window.location.href="/result";

    },6000);

})
.catch(function(error){

    alert("Camera access denied!");

    console.log(error);

});