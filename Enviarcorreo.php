<?php
  $destinatario = 'danielgiacinto@gmail.com';
  // este es el correo a donde se envia el mensaje

  $nombre = $_POST['nombre'];
  $correo = $_POST['correo'];
  $asunto = $_POST['asunto'];
  $mensaje = $_POST['mensaje'];

  $header = "Enviado desde la pagina de Daniel Giacinto";
  $mensajeCompleto = $mensaje . "\nCorreo: " . $correo . "\nAtentamente: " . $nombre;

  mail($destinatario, $asunto, $mensajeCompleto, $header);
  echo "<script>alert('correo enviado exitosamente')</script>";
  echo "<script> setTimeout(\"location.href='index.html'\", 1000)</script>";
?>

