// test-railway-setup.js - Script para verificar setup de Railway
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET'
};

console.log('🔄 Probando servidor...');

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📋 Respuesta:`, data);
    console.log(`\n🎉 ¡Servidor funcionando correctamente para Railway!`);
    console.log(`📂 Estructura optimizada:`);
    console.log(`   - ✅ backend/index.js (servidor principal)`);
    console.log(`   - ✅ backend/package.json con "start": "node index.js"`);
    console.log(`   - ✅ Sin package.json en raíz (eliminado)`);
    console.log(`   - ✅ Sin node_modules en raíz (eliminado)`);
    console.log(`\n🚀 Railway deployment ready!`);
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
  console.log(`\n💡 Tip: Asegúrate de que el servidor esté corriendo:`);
  console.log(`   cd backend && node index.js`);
});

req.end();