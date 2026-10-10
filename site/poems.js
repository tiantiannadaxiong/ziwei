/* Poetry content and print folios used by the static reader. */
window.POEMS = [
  {
    id: "jiaolong", page: 1,
    image: "./images/jiaolong.svg?v=art-10",
    imageAlt: "淡月與遠山隱在江霧之中，幾道水脈於留白間緩緩相合，舒展向遼闊江海。",
    titles: { zh: "《蛟龍》", en: "The Dragon in the Waters", fr: "Le dragon des eaux" },
    verses: {
      zh: "遼河水，哺我初心故土濃；\n東江水，蘭馨又綻莞城東；\n香江水，紫荊園裡我從容；\n海之融，百川終入大洋中；\n海之翱，蔚藍圖卷屬蛟龍。",
      en: "River Liao, you nourished my love of home;\nAlong Dongjiang, white magnolias bloom anew in Dongguan;\nAlong Xiangjiang, among the bauhinias, I wander at ease;\nA hundred rivers join and flow into the open sea;\nAcross the boundless blue, the dragon takes flight.",
      fr: "Fleuve Liao, tu as nourri en moi l'amour du pays natal ;\nAu bord du Dongjiang, les magnolias blancs refleurissent à Dongguan ;\nLe long du Xiangjiang, je flâne en paix parmi les bauhinias ;\nCent fleuves se rejoignent et se jettent dans la mer ;\nDans l'immense azur, le dragon prend son essor."
    },
    meta: "2018年10月　寫於香港大埔寶湖",
    note: "白蘭花是東莞市花，紫荊花象徵香港。東江流經東莞，是東莞的母親河；戰功赫赫的「東江支隊」也因這條母親河而得名。「香江」是香港的別稱。一種說法認為，香港原有一條水質清甜的小溪，英國人登岸後，開始以「香江」稱呼這一帶天然海灣。另有說法認為，「香江」之名源於東莞一種有香味的莞草；莞草經香港口岸運往海外，因此得名。"
  },
  {
    id: "mid-autumn", page: 5,
    image: "./images/mid-autumn.svg?v=art-10",
    imageAlt: "疏梅枝影斜過秋月，遠山映在水面，幾縷淡金色光影留住團圓的暖意。",
    titles: { zh: "《中秋》", en: "Mid-Autumn Festival", fr: "La fête de la mi-automne" },
    verses: {
      zh: "秋月凝光寒，\n蓮蓉掌中暖。\n窗外風雖冽，\n闔家笑語歡。",
      en: "The autumn moon shines, clear and cold;\nA lotus-paste mooncake warms my hands.\nThough cold winds blow beyond the window,\nOur family's laughter fills the room.",
      fr: "La lune d'automne luit, froide et claire ;\nUn gâteau de lune à la pâte de lotus réchauffe mes mains.\nDehors, le vent d'automne mord les joues ;\nDedans, les rires des miens emplissent la maison."
    },
    note: "中秋時節，人們仰望星空中的秋月，品嚐手中的月餅，心中暖意融融。漸入深秋，窗外秋風瑟瑟，卻擋不住闔家團圓的歡聲笑語。"
  },
  {
    id: "double-fifth", page: 9,
    image: "./images/double-fifth.svg?v=art-10",
    imageAlt: "艾葉疏疏映在江岸，薄霧與淡金水痕勾出端午時節江面的清寂。",
    titles: { zh: "《話端午》", en: "The Double Fifth Festival", fr: "La fête du Double Cinq" },
    verses: {
      zh: "五五重午歲又重，\n青箬裹粽意正濃。\n曹娥子胥悲歌起，\n漁樵笠下泣無窮。\n\n三江哀咽東逝水，\n離騷天問傳千歲。\n祭罷魂隨駕鶴歸，\n龍舟艾香驅邪祟。",
      en: "The Double Fifth comes round again;\nGreen leaves enfold the fragrant rice dumplings.\nSongs of grief for Cao E and Wu Zixu arise;\nBeneath their hats, fishers and woodcutters weep.\n\nThree rivers mourn as their waters flow east;\nLi Sao and Tianwen echo through the ages.\nThe rites are done; the souls ride home on cranes;\nDragon boats race; mugwort wards off evil spirits.",
      fr: "La fête du Double Cinq revient chaque année ;\nLe riz gluant embaume, enveloppé de feuilles vertes.\nLes chants de deuil pour Cao E et Wu Zixu s'élèvent ;\nSous leurs chapeaux, pêcheurs et bûcherons pleurent sans fin.\n\nTrois fleuves se lamentent et roulent vers l'est ;\nLi Sao et Tianwen résonnent à travers les siècles.\nLe rite achevé, les âmes rentrent, portées par les grues ;\nLes bateaux-dragons s'élancent ; l'armoise chasse les mauvais esprits."
    },
    meta: "2018年6月18日　寫於香港大埔寶湖",
    note: "五月初五，端午節又到了。端午節又稱五五節、重午節、端陽節，流傳著紀念屈原、曹娥、伍子胥的不同傳說。每逢此日，江水深處彷彿又響起悲切的歌聲，漁樵斗笠下似有低低的哭聲。\n\n詩中的「三江」指汨羅江、曹娥江和錢塘江，分別與三位逝者的傳說相關。《離騷》《天問》是屈原的代表作，也是流傳千古的名篇。端午時節，人們以香粽祭祀先人，賽龍舟、掛艾草，寄託哀思，祈願逝者安息、天下太平。"
  }
];

/* Front and back matter for the static reader. Folios follow the print edition;
   the colophon has no folio and uses a short navigation label. */
window.MATTER = {
  front: [
    {
      id: "colophon", nav: "版權",
      body: "© 2026 紫薇。保留所有權利。\n2026 年初版（暫定）\n出版者：作者自印（暫定）\nISBN：待申請"
    },
    {
      id: "dedication", folio: "iii", label: "獻詞",
      body: "獻給故土與遠方，獻給所有在流轉歲月中仍願守護初心的人。"
    },
    {
      id: "epigraph", folio: "iv", label: "題記",
      body: "水有來處，香有歸處。"
    },
    {
      id: "foreword", folio: "v", label: "前言",
      body: "詩從水土與記憶中生長，也在不同語言間找到回聲。本書由一首寫水、故土與遠方的詩開始，願它在不同語言的節奏裡，仍保有同一股眷戀。"
    }
  ],
  back: [
    {
      id: "afterword", folio: "15", label: "後記",
      body: "願這些詩句如水入海，也願每一縷未曾說盡的幽香，都能抵達懂得它的人心中。"
    },
    {
      id: "about", folio: "16", label: "作者簡介",
      body: "紫薇以詩記錄水土、記憶與心中未散的幽香。《暗香集》以中文、英文和法文呈現詩作。"
    }
  ]
};
