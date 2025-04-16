// package.json
{
  "name": "solana-scalper-simulator",
  "version": "1.0.0",
  "main": "src/index.ts",
  "scripts": {
    "start": "ts-node src/index.ts"
  },
  "dependencies": {
    "@solana/web3.js": "^1.89.0",
    "axios": "^1.6.0",
    "dotenv": "^16.0.3",
    "googleapis": "^127.0.0",
    "telegraf": "^4.12.2",
    "ws": "^8.13.0"
  },
  "devDependencies": {
    "ts-node": "^10.9.1",
    "typescript": "^5.2.2"
  }
}

// tsconfig.json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}

// src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import { WebSocket } from 'ws';
import axios from 'axios';
import { google } from 'googleapis';
import { Telegraf } from 'telegraf';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

const bot = TELEGRAM_BOT_TOKEN ? new Telegraf(TELEGRAM_BOT_TOKEN) : null;
const ws = new WebSocket(`wss://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`);

ws.on('open', () => {
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "logsSubscribe",
    params: [
      { filter: { mentions: ["RVKd61ztZW9GdP7UJ4aLq9gGzjDvT9z9K3zjY1NxybQ"] } },
      { commitment: "processed" }
    ]
  }));
});

async function notifyTelegram(message: string) {
  if (bot && TELEGRAM_CHAT_ID) {
    try {
      await bot.telegram.sendMessage(TELEGRAM_CHAT_ID, message);
    } catch (err) {
      console.error('❌ Telegram error:', err);
    }
  }
}

const sheets = google.sheets('v4');
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);

async function logToSheet(row: any[]) {
  try {
    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'A1',
      valueInputOption: 'RAW',
      requestBody: { values: [row] }
    });
  } catch (err) {
    console.error('❌ Google Sheet error:', err);
  }
}

// 🧪 Заменённые функции
async function swapToken(inputMint: string, outputMint: string, amount = 5000000) {
  console.log(`🧪 [SIMULATED BUY] ${inputMint} → ${outputMint} на $5`);
  return true;
}

async function sellToken(outputMint: string, inputMint: string) {
  console.log(`🧪 [SIMULATED SELL] ${outputMint} → ${inputMint}`);
  return true;
}

// Работаем только с одной монетой — SOL
setInterval(async () => {
  const mintAddress = 'So11111111111111111111111111111111111111112'; // SOL
  const marketData = {
    priceChange1m: 3.5, // заглушка
    volume1m: 25000,
    liquidity: 80000,
    tradeCount: 22,
    isFairLaunch: true
  };

  const conditionsPassed =
    marketData.priceChange1m > 3 &&
    marketData.volume1m > 20000 &&
    marketData.liquidity > 50000 &&
    marketData.tradeCount > 15 &&
    marketData.isFairLaunch;

  if (!conditionsPassed) {
    console.log('🚫 Условия входа не соблюдены. Пропуск.');
    return;
  }

  const entryPrice = 5.0; // заглушка
  await notifyTelegram(`✅ BUY: SOL по $${entryPrice}`);
  await logToSheet([
    new Date().toISOString(),
    'BUY',
    `${entryPrice.toFixed(4)}`,
    `+${marketData.priceChange1m}% / $${marketData.volume1m} / $${marketData.liquidity} / ${marketData.tradeCount}`,
    'Entered'
  ]);

  await swapToken(mintAddress, mintAddress);

  setTimeout(async () => {
    const exitPrice = 5.3; // заглушка
    const percentChange = ((exitPrice - entryPrice) / entryPrice) * 100;
    await notifyTelegram(`📤 SELL: $${exitPrice.toFixed(4)} (${percentChange.toFixed(2)}%)`);
    await logToSheet([
      new Date().toISOString(),
      'SELL',
      `${exitPrice.toFixed(4)}`,
      `${percentChange.toFixed(2)}%`,
      percentChange >= 5 ? 'Take Profit' : percentChange <= -3 ? 'Stop Loss' : 'Timeout'
    ]);
    await sellToken(mintAddress, mintAddress);
  }, 3 * 60 * 1000); // 3 минуты

}, 30 * 1000); // Каждые 30 секунд проверка условий
});
