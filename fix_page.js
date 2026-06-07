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

// We will find "DOANH THU THẢO ĐIỀN" inside this tab block
const firstTdIdx = content.indexOf('DOANH THU THẢO ĐIỀN', directorFinanceIdx);
const taxesWidgetIdx = content.indexOf('/* TAXES WIDGET */', directorFinanceIdx);

if (firstTdIdx === -1 || taxesWidgetIdx === -1) {
  console.error('Could not find indicators!');
  process.exit(1);
}

console.log('firstTdIdx:', firstTdIdx, 'taxesWidgetIdx:', taxesWidgetIdx);

// Let's locate the opening "<div" of the first Thảo Điền card
const cardStartIdx = content.lastIndexOf('<div className="p-5 rounded-3xl bg-white border border-neutral-100 shadow-sm flex flex-col justify-between min-h-[120px]"', firstTdIdx);
// Let's locate the closing "</div>" of the duplicated metrics widgets container right before TAXES WIDGET
const gridEndIdx = content.lastIndexOf('</div>', taxesWidgetIdx);

if (cardStartIdx === -1 || gridEndIdx === -1) {
  console.error('Could not locate start/end bounds!');
  process.exit(1);
}

// The end replacement boundary is after the </div>
const replaceEnd = gridEndIdx + 6;

console.log('cardStartIdx:', cardStartIdx, 'replaceEnd:', replaceEnd);

const cleanTdCardSection = `<div className="p-5 rounded-3xl bg-white border border-neutral-100 shadow-sm flex flex-col justify-between min-h-[120px]">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest font-black text-neutral-400 block mb-1">DOANH THU THẢO ĐIỀN</span>
                          <h4 className="text-base font-black tracking-tight text-neutral-955">{formatPrice(tdRevenue)}</h4>
                        </div>
                        <div className="w-full bg-neutral-100 h-1 rounded-full mt-3 overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: \`\${(tdRevenue / (totalRevenue || 1)) * 100}%\` }}></div>
                        </div>
                      </div>
                    </div>`;

const newContent = content.substring(0, cardStartIdx) + cleanTdCardSection + content.substring(replaceEnd);

fs.writeFileSync(filepath, newContent, 'utf8');
console.log('Successfully fixed page.tsx!');
