# Panorama do Álcool

Um dashboard interativo que apresenta dados sobre consumo de bebidas alcoólicas por país.

## ✨ Características

- **Importação de dados**: Suporte para arquivos CSV e XLSX com interface de drag-and-drop
- **Visualizações interativas**: 4 gráficos SVG renderizados em tempo real
  - KPIs de resumo (total de países, média de álcool puro)
  - Ranking dos 15 maiores consumidores
  - Composição do consumo por tipo de bebida
  - Scatter plot: doses vs. litros de álcool puro
- **Tabela de dados**: Ordenação, busca e filtragem em tempo real
- **Tema adaptativo**: Suporte a modo claro/escuro com CSS custom properties
- **Responsivo**: Layout fluido que se adapta a diferentes tamanhos de tela
- **Totalmente local**: Processamento de dados no navegador, sem envio a servidores

## 🚀 Como usar

1. Abra `dashboard-bebidas.html` no navegador
2. Clique em "Escolher arquivo" ou arraste um arquivo CSV/XLSX
3. Selecione a planilha desejada (espera colunas: `country`, `beer_servings`, `spirit_servings`, `wine_servings`, `total_litres_of_pure_alcohol`)
4. Explore os gráficos, tabela e métricas de resumo
5. Use "Atualizar dados" para recarregar o dashboard com o mesmo arquivo
6. Use "Trocar arquivo" para carregar uma nova planilha

## 📊 Colunas esperadas

| Coluna | Descrição | Obrigatória |
|--------|-----------|------------|
| `country` | Nome do país | ✓ |
| `beer_servings` | Doses de cerveja por ano per capita | - |
| `spirit_servings` | Doses de destilados por ano per capita | - |
| `wine_servings` | Doses de vinho por ano per capita | - |
| `total_litres_of_pure_alcohol` | Total de álcool puro (L) consumido por ano per capita | - |

Pelo menos uma coluna numérica deve estar presente.

## 🛠️ Tecnologias

- **HTML5** com `<meta charset="utf-8">` e viewport responsivo
- **CSS3**: Custom properties, grid/flexbox, theme switching via `prefers-color-scheme`
- **JavaScript vanilla**: Lógica de importação, processamento e renderização
- **SVG**: Gráficos vetoriais nativos (barras, scatter, composição)
- **[XLSX.js](https://github.com/SheetJS/sheetjs)**: Leitura de planilhas (carregado via CDN)
- **Google Fonts**: Poppins (UI) e JetBrains Mono (dados)

## 📝 Autor

**Rodrigo Silva**

## 🎨 Branding

Logotipo Nitro extraído do Brand Book (Pomelli) e renderizado como máscara SVG em branco, herdando cores do tema.

## 📞 Suporte

Clique no botão WhatsApp flutuante no canto inferior direito.

---

*Dashboard desenvolvido com [Claude Code](https://claude.com/claude-code)*
