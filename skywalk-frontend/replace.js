const fs = require('fs');
const file = '/Users/tenecoulibaly/GPE_SKYWALK/skywalk-frontend/src/features/comparison/components/ComparisonTable.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<(ComparisonRow\b(?![A-Za-z]))/g, '<$1 countries={countries}');
content = content.replace(/<(ComparisonRowWithBar\b(?![A-Za-z]))/g, '<$1 countries={countries}');
content = content.replace(/<(ComparisonRowScore\b(?![A-Za-z]))/g, '<$1 countries={countries}');

fs.writeFileSync(file, content);
console.log('done');
