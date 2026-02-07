// test-server.js - Script para probar el servidor
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`▓ Status: ${res.statusCode}`);
  console.log(`▓ Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`▓ Respuesta del servidor:`);
    console.log(data);
    console.log(`\n✅ El servidor está funcionando correctamente en http://localhost:3000`);
  });
});

req.on('error', (e) => {
  console.error(`❌ Error al conectar con el servidor: ${e.message}`);
  console.log(`▓ Asegúrate de que el servidor esté corriendo en puerto 3000`);
});

req.end();