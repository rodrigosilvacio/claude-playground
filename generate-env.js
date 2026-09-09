#!/usr/bin/env node

/**
 * Script que gera env.json a partir do .env
 * Usado no build da Vercel para injeta variáveis no window
 */

const fs = require('fs');
const path = require('path');

function generateEnvJson() {
  const envFile = path.join(__dirname, '.env');
  const envJson = path.join(__dirname, 'env.json');

  const envVars = {};

  try {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf-8');
      content.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) {
            envVars[key.trim()] = value.trim();
          }
        }
      });
    }
  } catch (err) {
    console.warn('Aviso: Não foi possível ler .env:', err.message);
  }

  // Adicionar variáveis de ambiente do processo (Vercel)
  if (process.env.VITE_GEMINI_API_KEY) {
    envVars.VITE_GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
  }
  if (process.env.VITE_GEMINI_MODELS) {
    envVars.VITE_GEMINI_MODELS = process.env.VITE_GEMINI_MODELS;
  }

  // Escrever env.json
  fs.writeFileSync(envJson, JSON.stringify(envVars, null, 2));
  console.log('✅ env.json gerado com sucesso');
}

generateEnvJson();
