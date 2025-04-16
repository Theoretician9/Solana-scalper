import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
// import { google } from 'googleapis';
// import { Telegraf } from 'telegraf';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

// WebSocket отключён — больше не используется









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
          // await notifyTelegram(buyMsg);
          // логирование в таблицу отключено
          await swapToken(mintAddress, mintAddress);

          // Ожидание 15 минут
          await new Promise(r => setTimeout(r, 900000));

          const exitPrice = 5.3; // заглушка
          const percentChange = ((exitPrice - entryPrice) / entryPrice) * 100;
          const sellMsg = `📤 SELL: $${exitPrice.toFixed(4)} (${percentChange.toFixed(2)}%)`;
          console.log(sellMsg);
          // await notifyTelegram(sellMsg);
          console.log('🧾 SELL logged to sheet (mock)');
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
