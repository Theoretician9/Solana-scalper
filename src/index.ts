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
// WebSocket отключён — больше не используется



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
let inTrade = false;
async function mainLoop() {
  const mintAddress = 'So11111111111111111111111111111111111111112'; // SOL
  let inTrade = false;
  let entryPrice = 0;

  while (true) {
    try {
      if (!inTrade) {
        const marketData = {
          priceChange1m: 1.2, // заглушка
          volume1m: 25000,
          liquidity: 80000,
          tradeCount: 22,
          isFairLaunch: true
        };

        const conditionsPassed =
          marketData.priceChange1m > 1 &&
          marketData.volume1m > 20000 &&
          marketData.liquidity > 50000 &&
          marketData.tradeCount > 15 &&
          marketData.isFairLaunch;

        if (conditionsPassed) {
          entryPrice = 5.0; // заглушка
          inTrade = true;
          // Уведомление только при успешной сделке
          const buyMsg = `✅ BUY: SOL по $${entryPrice}`;
          console.log(buyMsg);
          await notifyTelegram(buyMsg);
          await logToSheet([
            new Date().toISOString(),
            'BUY',
            `${entryPrice.toFixed(4)}`,
            `+${marketData.priceChange1m}% / $${marketData.volume1m} / $${marketData.liquidity} / ${marketData.tradeCount}`,
            'Entered'
          ]);
          await swapToken(mintAddress, mintAddress);

          // Ожидание 3 минуты
          await new Promise(r => setTimeout(r, 900000));

          const exitPrice = 5.3; // заглушка
          const percentChange = ((exitPrice - entryPrice) / entryPrice) * 100;
          const sellMsg = `📤 SELL: $${exitPrice.toFixed(4)} (${percentChange.toFixed(2)}%)`;
          console.log(sellMsg);
          await notifyTelegram(sellMsg);
          await logToSheet([
            new Date().toISOString(),
            'SELL',
            `${exitPrice.toFixed(4)}`,
            `${percentChange.toFixed(2)}%`,
            percentChange >= 3 ? 'Take Profit' : percentChange <= -1 ? 'Stop Loss' : 'Timeout'
          ]);
          await sellToken(mintAddress, mintAddress);
          inTrade = false;
        } else {
          console.log('🚫 Условия входа не соблюдены. Пропуск.');
        }
      }
    } catch (err) {
      console.error('❌ Ошибка в mainLoop:', err);
    }

    await new Promise(r => setTimeout(r, 15000)); // Пауза 5 секунд
  }
}

mainLoop();
