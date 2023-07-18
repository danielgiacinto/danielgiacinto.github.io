
// Calcular la altura de la barra del nav
document.addEventListener("DOMContentLoaded", function() {
    var navbarHeight = document.querySelector('.navbar-measure').offsetHeight;
    var inicioSection = document.querySelector('.inicio');
    inicioSection.style.minHeight = `calc(100vh - ${navbarHeight}px)`;
});

// Cerrar barra de navegacion
function closeNavbar() {
  var navbarCollapse = document.getElementById("navbarSupportedContent");
  navbarCollapse.classList.remove("show");
}

// animar el texto
function typeWriterEffect() {
    var typingText = document.getElementById("typing-text");
    var typingCursor = document.getElementById("typing-cursor");
    var originalText = typingText.innerText;
    typingText.innerText = "";
    var charIndex = 0;
  
    function typeWriter() {
      if (charIndex < originalText.length) {
        typingText.innerText += originalText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 250);
      } else {
        typingCursor.style.visibility = "hidden"; // Oculta el cursor al finalizar la escritura
        setTimeout(pauseBeforeRestart, 2000);
      }
    }
  
    function pauseBeforeRestart() {
      typingCursor.style.visibility = "visible"; // Muestra el cursor durante la pausa
      setTimeout(restartAnimation, 2000);
    }
  
    function restartAnimation() {
      charIndex = 0;
      typingText.innerText = "";
      typingCursor.style.visibility = "visible"; // Muestra el cursor al reiniciar la animación
      setTimeout(typeWriter, 200);
    }
  
    window.onload = typeWriter;
  }
  
typeWriterEffect();

//Cambiar palabras

var words = ["Daniel José Giacinto.", "Web Developer.", "Full-Stack Developer."]; // Array de palabras a mostrar
var currentWordIndex = 0;
var danielElement = document.getElementById("daniel");

function changeWord() {
  danielElement.style.animation = "fadeOut 1s forwards";

  setTimeout(function () {
    danielElement.textContent = words[currentWordIndex];
    danielElement.style.animation = "fadeIn 1s forwards";

    currentWordIndex++;
    if (currentWordIndex >= words.length) {
      currentWordIndex = 0;
    }
  }, 1000);
}

function repeatAnimation() {
  changeWord();
  setTimeout(repeatAnimation, 3000); // Ajusta el tiempo de espera entre cada cambio de palabra
}

repeatAnimation();

// Ver CV
function verCv(){
  window.open('CV_Giacinto, Daniel.pdf', '_blank')
}

  // Mostrar educacion
$(document).ready(function () {

  $("#educacion").click(function(event){
     event.preventDefault();
     $("#tup").slideToggle("slow");
     $("#cole").slideToggle("slow");
  });

  // Mostrar experiencia
  $("#experiencia").click(function(event){
     event.preventDefault();
     $("#conti").slideToggle("slow");
     $("#baioco").slideToggle("slow");
  });
});


function limpiarCampos(){
  document.getElementById("nombre").value = "";
  document.getElementById("email").value = "";
  document.getElementById("texto").value = "";
}

// Validar formulario
$(document).ready(function(){
  $("#validar").validate({
      rules: {
        nombre: {
          required: true,
          minlength: 3
        },
        email: {
          required: true,
          email: true
        },
        texto: {
          required: true,
          minlength: 3
        }
      },
      errorClass: 'is-invalid',
      validClass: 'is-valid',

      submitHandler: function() {

        Swal.fire({
          icon: 'success',
          title: 'Correo enviado !!',
          text: 'Datos ingresados correctamente',
          timer: 2000
        })
        limpiarCampos();
      }
  });
});

// Traducir las validaciones

jQuery.extend(jQuery.validator.messages, {
  required: "Este campo es obligatorio.",
  email: "Por favor, escribe una dirección de correo válida",
  maxlength: jQuery.validator.format("Por favor, no escribas más de {0} caracteres."),
  minlength: jQuery.validator.format("Por favor, no escribas menos de {0} caracteres."),
});

// Función para desplazarse al principio de la página
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Función para mostrar u ocultar el círculo al hacer scroll
function handleScroll() {
    var circle = document.getElementById('circle');
    if (window.scrollY > 0) {
        circle.classList.add('visible');
    } else {
        circle.classList.remove('visible');
    }
}

// Evento de escucha para el evento de scroll
window.addEventListener('scroll', handleScroll);