const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'app/internal/page.tsx');
console.log('Reading file:', filepath);

let content = fs.readFileSync(filepath, 'utf8');

// Find the index of director-global-finance to avoid hitting other sections
const directorFinanceIdx = content.indexOf("activeTab === 'director-global-finance'");
if (directorFinanceIdx === -1) {
  console.error('Could not find director-global-finance tab block!');
  process.exit(1);
}

// Find "const ledger = productsList.map" inside director-global-finance
const ledgerIdx = content.indexOf('const ledger = productsList.map', directorFinanceIdx);
// Find Card 2: "TỔNG LỢI NHUẬN RÒNG TOÀN CÔNG TY" after ledgerIdx
const card2Idx = content.indexOf('TỔNG LỢI NHUẬN RÒNG TOÀN CÔNG TY', ledgerIdx);

if (ledgerIdx === -1 || card2Idx === -1) {
  console.error('Could not find ledger or card2!');
  process.exit(1);
}

console.log('ledgerIdx:', ledgerIdx, 'card2Idx:', card2Idx);

// We want to find the "<div" of Card 2 (Net Profit)
const card2StartIdx = content.lastIndexOf('<div className="p-5 rounded-3xl bg-gradient-to-br', card2Idx);

if (card2StartIdx === -1) {
  console.error('Could not find card2StartIdx!');
  process.exit(1);
}

console.log('card2StartIdx:', card2StartIdx);

// The replacement text
const replacement = `const ledger = productsList.map((product: any) => {
                  const soldQty = allOrders
                    .filter((o: any) => o.status === 'completed')
                    .reduce((total: number, order: any) => {
                      const item = order.items.find((i: any) => i.product.id === product.id);
                      return total + (item ? item.quantity : 0);
                    }, 0);

                  const stockedQty = restockRecords
                    .filter((r: any) => r.productId === product.id)
                    .reduce((total: number, r: any) => total + r.amount, 0);

                  const revenue = soldQty * product.price;
                  const importCost = stockedQty * (product.price * 0.4);
                  const netProfit = revenue - importCost;

                  return {
                    product,
                    soldQty,
                    revenue,
                    stockedQty,
                    importCost,
                    netProfit,
                  };
                });

                const sortedLedger = [...ledger].sort((a, b) => b.revenue - a.revenue);

                return (
                  <div>
                    <h3 className="text-lg font-black text-neutral-955 tracking-tight mb-2 uppercase">Quyết toán tài chính toàn cầu</h3>
                    <p className="text-xs text-neutral-400 mb-8">Kiểm toán doanh số liên chi nhánh, doanh số thị phần, quyết toán thuế CIT và hạch toán P&L sản phẩm.</p>

                    {/* METRICS WIDGETS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                      <div className="p-5 rounded-3xl bg-neutral-950 text-white shadow-md border border-neutral-800 flex flex-col justify-between min-h-[120px]">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest font-black opacity-55 block mb-1">TỔNG DOANH THU TOÀN HỆ THỐNG</span>
                          <h4 className="text-base font-black tracking-tight">{formatPrice(totalRevenue)}</h4>
                        </div>
                        <span className="text-[8px] text-emerald-400 font-bold block mt-2">Tăng trưởng 15% so với tháng trước</span>
                      </div>
                      
                      `;

// Replace everything from ledgerIdx up to card2StartIdx with replacement
const newContent = content.substring(0, ledgerIdx) + replacement + content.substring(card2StartIdx);

fs.writeFileSync(filepath, newContent, 'utf8');
console.log('Successfully fixed ledger section in page.tsx!');
