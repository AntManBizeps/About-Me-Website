function loadImage(imageId, src) {
  return new Promise(function(resolve, reject) {
    const img = document.getElementById(imageId);
    img.onload = function() {
      resolve("Image " + imageId + " loaded successfully");
    };
    img.onerror = function() {
      reject("Error loading image " + imageId);
    };
    img.src = src;
  });
}

Promise.all([
  loadImage("image1", "../resources/malta.jpeg"),
  loadImage("image2", "../resources/sniezka.jpeg"),
  loadImage("image3", "../resources/silownia.jpeg"),
  loadImage("image4", "../resources/tance.jpeg"),
  loadImage("image5", "../resources/biegi.jpeg")
]);