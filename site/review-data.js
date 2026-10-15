/* The review edition shares the source text but never mutates POEMS or MATTER.
   x/y specify the seal centre as percentages of the actual SVG viewBox. */
window.ARTBOOK_REVIEW = Object.freeze({
  version: 'artbook-18',
  document: './design-review.html',
  sealBase: './images/review/',
  poemIds: ['jiaolong', 'double-fifth', 'double-ninth-song', 'sleeping-lotus', 'yuanxi-stroll', 'farewell-song'],
  cover: './images/review/cover-branch.svg?v=artbook-18',
  artwork: {
    jiaolong: {
      image: './images/review/jiaolong.svg?v=artbook-18',
      imageAlt: '幾股近岸水脈穿過墨色岸線，匯入清亮開闊的蔚藍海面。',
      sealPosition: { x: 91, y: 19 }
    },
    'sleeping-lotus': {
      image: './images/review/sleeping-lotus.svg?v=artbook-18',
      imageAlt: '低垂的粉蓮、微傾的成熟蓮房與翻卷荷葉，在疏朗靜水間相伴入秋。',
      sealPosition: { x: 81, y: 84 }
    },
    'yuanxi-stroll': {
      image: './images/review/yuanxi-stroll.svg?v=artbook-18',
      imageAlt: '斜向街巷裡燈火漸疏，極小的獨行身影停在溫暖燈光與空街之間。',
      sealPosition: { x: 72, y: 80 }
    }
  }
});
