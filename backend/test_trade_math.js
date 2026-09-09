// test_trade_math.js — guards the trade accounting model (no DB needed).
// Run: node test_trade_math.js
const assert = require('assert');

// Mirror of the controller's money model:
//  - opening reserves entry * qty of capital
//  - closing returns that capital plus realized P&L
const reserve = (entry, qty) => entry * qty;
const pnl = (type, entry, exit, qty) =>
  type === 'BUY' ? (exit - entry) * qty : (entry - exit) * qty;
const credit = (type, entry, exit, qty) => reserve(entry, qty) + pnl(type, entry, exit, qty);

// A full round trip: open then close. Net cash change must equal the P&L.
const roundTripNet = (type, entry, exit, qty) =>
  -reserve(entry, qty) + credit(type, entry, exit, qty);

// BUY, price up: profit
assert.strictEqual(pnl('BUY', 100, 120, 10), 200);
assert.strictEqual(credit('BUY', 100, 120, 10), 1200);          // == exit*qty (unchanged BUY behavior)
assert.strictEqual(roundTripNet('BUY', 100, 120, 10), 200);

// BUY, price down: loss
assert.strictEqual(roundTripNet('BUY', 100, 90, 10), -100);

// SELL (short), price down: profit — no more "free money"
assert.strictEqual(pnl('SELL', 100, 80, 10), 200);
assert.strictEqual(credit('SELL', 100, 80, 10), 1200);
assert.strictEqual(roundTripNet('SELL', 100, 80, 10), 200);

// SELL (short), price up: loss
assert.strictEqual(roundTripNet('SELL', 100, 130, 10), -300);

// Net worth right after opening (price unchanged) must equal starting cash:
// cash after open = start - reserve; position liquidation value = reserve + 0 unrealized
const start = 100000, entry = 100, qty = 10;
const cashAfterOpen = start - reserve(entry, qty);
const positionValue = reserve(entry, qty) + pnl('BUY', entry, entry, qty); // unrealized 0
assert.strictEqual(cashAfterOpen + positionValue, start);

console.log('✅ trade math OK: cash conserved, round-trip net == P&L for BUY and SELL');
