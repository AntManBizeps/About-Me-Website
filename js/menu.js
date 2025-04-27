const toggleButton = document.getElementById("menu-toggle");
const menu = document.getElementById("nav-list");

function handleResize() {
  if (window.innerWidth > 768) {
    menu.style.animation = "none";
    menu.classList.remove("show");
    toggleButton.classList.remove("active");
  } else {
    menu.style.animation = "";
  }
}

toggleButton.addEventListener("click", function() {
  toggleButton.classList.toggle("active");

  if (menu.classList.contains("show")) {
    menu.classList.remove("show");
    menu.style.animation = "slideOut 0.5s forwards";
  } else {
    menu.classList.add("show");
    menu.style.animation = "slideIn 0.5s forwards";
  }
});
  window.addEventListener("resize", handleResize);

  handleResize();

