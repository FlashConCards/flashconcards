const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 FlashConCards - Desenvolvimento Local + Deploy Automático');
console.log('📁 Monitorando mudanças...');
console.log('🌐 Local: http://localhost:3000');
console.log('🌐 Vercel: https://flashconcards.vercel.app');

// Função para fazer deploy
function deploy() {
  console.log('📤 Fazendo deploy para Vercel...');
  exec('git add . && git commit -m "auto-deploy $(date)" && git push', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erro no deploy:', error);
      return;
    }
    console.log('✅ Deploy realizado com sucesso!');
    console.log('🌐 Vercel: https://flashconcards.vercel.app');
  });
}

// Função para iniciar servidor local
function startLocalServer() {
  console.log('🏠 Iniciando servidor local...');
  exec('npm run dev:local', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erro no servidor local:', error);
      return;
    }
    console.log(stdout);
  });
}

// Monitorar mudanças nos arquivos
function watchFiles() {
  const directories = ['app', 'components', 'lib', 'types'];
  
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (filename && !filename.includes('node_modules') && !filename.includes('.git')) {
          console.log(`📝 Arquivo alterado: ${filename}`);
          console.log('⏳ Aguardando 3 segundos para deploy...');
          
          // Aguardar 3 segundos para evitar múltiplos deploys
          setTimeout(() => {
            deploy();
          }, 3000);
        }
      });
    }
  });
}

// Iniciar tudo
console.log('🎯 Iniciando desenvolvimento...');
startLocalServer();
watchFiles();

console.log('\n📋 Comandos disponíveis:');
console.log('   npm run dev:local    - Servidor local apenas');
console.log('   npm run dev:fast     - Servidor local com Turbo');
console.log('   npm run deploy       - Deploy manual');
console.log('   npm run dev:deploy   - Local + Deploy automático');
console.log('\n💡 Dica: Use Ctrl+C para parar'); 