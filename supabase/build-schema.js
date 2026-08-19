import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Solução para ES Modules no Node
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const snippetsDir = path.join(__dirname, 'snippets');
const outputFile = path.join(__dirname, 'Master Schema.sql');

try {
  const files = fs.readdirSync(snippetsDir);
  const sqlFiles = files.filter((f) => f.endsWith('.sql') && f !== 'Master Schema.sql').sort(); // Garante a ordem numérica 00, 01, 02...

  let masterSql = `-- ====================================================================\n`;
  masterSql += `-- ⚠️ AVISO: ARQUIVO AUTO-GERADO!\n`;
  masterSql += `-- NÃO EDITE ESTE ARQUIVO DIRETAMENTE. ALTERE OS SNIPPETS E RODE db:build\n`;
  masterSql += `-- Gerado em: ${new Date().toISOString()}\n`;
  masterSql += `-- ====================================================================\n\n`;

  for (const file of sqlFiles) {
    const filePath = path.join(snippetsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    masterSql += `-- >>> INÍCIO DO SNIPPET: ${file} <<<\n`;
    masterSql += content;
    masterSql += `\n-- >>> FIM DO SNIPPET: ${file} <<<\n\n\n`;
  }

  fs.writeFileSync(outputFile, masterSql);
  console.log(`✅ Master Schema gerado com sucesso em: ${outputFile}`);
  console.log(`Incluiu ${sqlFiles.length} snippets.`);
} catch (error) {
  console.error('🔥 Erro ao gerar o Master Schema:', error);
  process.exit(1);
}
