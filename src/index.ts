import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
// import { google } from 'googleapis';
// import { Telegraf } from 'telegraf';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY;

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
  let entryPrice = 0;

  while (true) {
    try {
      if (!inTrade) {
        const priceRes = await axios.get(
          'https://public-api.birdeye.so/public/token/price?address=So11111111111111111111111111111111111111112',
          {
            headers: {
              'X-API-KEY': process.env.BIRDEYE_API_KEY || ''
            }
          }
        );
        const priceUsd = priceRes.data?.data?.value || 0;
        const price24hAgo = priceUsd / 1.01; // заглушка на +1% для имитации прироста
        const marketData = {
          priceChange1m: ((priceUsd / price24hAgo) - 1) * 100,
          volume1m: 30000, // заглушка
          liquidity: 60000, // заглушка
          tradeCount: 20,   // заглушка
          isFairLaunch: true
        };

        console.log('📊 Live marketData:', marketData);

        const conditionsPassed =
          marketData.priceChange1m > 1 &&
          marketData.volume1m > 20000 &&
          marketData.liquidity > 50000 &&
          marketData.tradeCount > 15 &&
          marketData.isFairLaunch;

        if (conditionsPassed) {
          entryPrice = priceUsd
          inTrade = true;
          // Уведомление только при успешной сделке
          const buyMsg = `✅ BUY: SOL по $${entryPrice}`;
          console.log(buyMsg);
          // await notifyTelegram(buyMsg);
          // логирование в таблицу отключено
          await swapToken(mintAddress, mintAddress);

          // Ожидание 15 минут
          await new Promise(r => setTimeout(r, 900000));

          const exitPrice = priceUsd * 1.03
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
