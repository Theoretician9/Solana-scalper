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

// Пример обработчика событий (дальше вставляется логика от основного бота)
ws.on('message', async (data) => {
  const parsed = JSON.parse(data.toString());
  const logData = parsed?.params?.result?.value?.logs?.join(" ") || "";
  const programId = parsed?.params?.result?.value?.programId;
  const isRaydiumSwap = programId === 'RVKd61ztZW9GdP7UJ4aLq9gGzjDvT9z9K3zjY1NxybQ';
  const isSwapLog = logData.includes("Swap") || logData.includes("swap") || logData.includes("swapSuccess");
  const validEvent = isRaydiumSwap && isSwapLog;

  if (!validEvent) return;

  // заглушка логики (вставляется из основной версии при необходимости)
  console.log('🔁 [SIMULATION MODE] Событие распознано, обработка симуляции...');
});
