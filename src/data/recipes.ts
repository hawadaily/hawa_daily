export interface Recipe {
  id: string;
  titleDv: string;
  titleEn: string;
  image: string;
  ingredients: {
    dv: string[];
    en: string[];
  };
  instructions: {
    dv: string;
    en: string;
  };
  category: string;
  prepTime: string;
  cookTime: string;
  servings: string;
}

export const recipes: Recipe[] = [
  {
    id: '1',
    titleDv: 'ކޭކް ރެސިޕީ',
    titleEn: 'Cake Recipe',
    image: '/images/cake.jpg',
    category: 'dessert',
    prepTime: '15 މިނިޓް',
    cookTime: '50 މިނިޓް',
    servings: '8 ބައި',
    ingredients: {
      dv: [
        '1 ކުޅި ބިސް',
        '4 ބިސް',
        '¾ ކަޕް ހިކިން',
        '1½ ސްޕޫން ކޭކް ޕައުޑަރ',
        '½ ކަޕް ފުށް (ހަނދުވަރު)',
        '1 ސްޕޫން ވޭނިލާ (ކުޅިޔާރަސް)',
        '1 ސްޕޫން ބަޓަރ'
      ],
      en: [
        '1 Egg',
        '4 Eggs',
        '¾ Cup Sugar',
        '1½ Tsp Baking Powder',
        '½ Cup Butter (Softened)',
        '1 Tsp Vanilla Essence',
        '1 Tsp Butter'
      ]
    },
    instructions: {
      dv: 'ބިސް ހަނދާ، ހިކިން އަދި ވޭނިލާ އެއްކޮށް ކަރައިން މިކްސް ކުރާށެވެ. މިކްސް ކުރާއިރު ހަނދާ ފުޅާކުރުމަށް 3–4 މިނިޓް ކަނޑައިލާށެވެ. އެއަށް ފުށާއި ކޭކް ޕައުޑަރ މިކްސް ކުރައްވާށެވެ. ފަހުން ބަޓަރ އަދި ވޭނިލާ އިތުރުކޮށް މިކްސް ކުރައްވާށެވެ. އޮވަން 180 ޑިގްރީގައި 10 މިނިޓް ފިއްޓާލާށެވެ. ފަހުން ހޫނުކުރައިގެން 30 މިނިޓް ފިއްޓާލާށެވެ. ކޭކް ހަމަޖެހުމަށް 30 މިނިޓް ކަނޑައިލާށެވެ. ފަހުން 10 މިނިޓް އެނބުރި ފިއްޓާލާށެވެ.',
      en: 'Beat eggs, sugar and vanilla together. Mix for 3-4 minutes to fluff the eggs. Then mix butter and baking powder. Finally add butter and vanilla and mix. Bake at 180 degrees for 10 minutes. Then reduce heat and bake for 30 minutes. Let cake rest for 30 minutes. Finally bake for another 10 minutes.'
    }
  },
  {
    id: '2',
    titleDv: 'މަސްހުނި ރެސިޕީ',
    titleEn: 'Mas Huni Recipe',
    image: '/images/mashuni.jpg',
    category: 'breakfast',
    prepTime: '10 މިނިޓް',
    cookTime: '0 މިނިޓް',
    servings: '2 ބައި',
    ingredients: {
      dv: [
        '2 ބިސް',
        '1 ކަޕް ބޮޑި ކިއުންފުށް',
        '1 ކަޕް ބޮޑި ބަތްތަކެތި',
        '2 ސްޕޫން ނޮންބު',
        '1 ލިމޫ',
        'މަސް ކައްކަވާ',
        'މިރިހާ'
      ],
      en: [
        '2 Eggs',
        '1 Cup Grated Coconut',
        '1 Cup Chopped Onions',
        '2 Tsp Lime Juice',
        '1 Lime',
        'Chopped Tuna',
        'Chili'
      ]
    },
    instructions: {
      dv: 'ބިސް ހަނދާ ފައިގެން ކިއުންފުށާއި ބަތްތަކެތި އަދި ނޮންބު އިތުރުކޮށް މިކްސް ކުރާށެވެ. އެއަށް މަސް ކައްކަވާ އަދި މިރިހާ އިތުރުކޮށް މިކްސް ކުރައްވާށެވެ. ލިމޫ ބޭނުންކޮށް ކައިފާށެވެ.',
      en: 'Beat eggs and mix with grated coconut, chopped onions and lime juice. Add chopped tuna and chili and mix well. Serve with lime.'
    }
  },
  {
    id: '3',
    titleDv: 'ބިއްޔަ ރެސިޕީ',
    titleEn: 'Fish Curry Recipe',
    image: '/images/fish-curry.jpg',
    category: 'main',
    prepTime: '20 މިނިޓް',
    cookTime: '30 މިނިޓް',
    servings: '4 ބައި',
    ingredients: {
      dv: [
        '500 ގްރާމް މަސް',
        '2 ބޮޑި ބަތްތަކެތި',
        '3 ބޮޑި ބަތްތަކެތި',
        '2 ސްޕޫން ކައްރިހާ ޕޭސްޓް',
        '1 ސްޕޫން ކައްރިހާ ޕައުޑަރ',
        '½ ސްޕޫން ތުރުމެރިކް',
        '1 ކަޕް ކިއުން މިލްކް',
        'ކަންމަތި',
        'މިރިހާ'
      ],
      en: [
        '500g Fish',
        '2 Chopped Onions',
        '3 Chopped Onions',
        '2 Tsp Chili Paste',
        '1 Tsp Chili Powder',
        '½ Tsp Turmeric',
        '1 Cup Coconut Milk',
        'Curry Leaves',
        'Chili'
      ]
    },
    instructions: {
      dv: 'ބަތްތަކެތި އަދި ކައްރިހާ ޕޭސްޓް އަދި ކައްރިހާ ޕައުޑަރ އަދި ތުރުމެރިކް އެއްކޮށް ކައިފާށެވެ. އެއަށް ކިއުން މިލްކް އަދި ކަންމަތި އިތުރުކޮށް ކައިފާށެވެ. އެއަށް މަސް އިތުރުކޮށް ކައިފާށެވެ. މިރިހާ އިތުރުކޮށް ކައިފާށެވެ.',
      en: 'Cook onions with chili paste, chili powder and turmeric. Add coconut milk and curry leaves and cook. Add fish and cook. Add chili and cook.'
    }
  },
  {
    id: '4',
    titleDv: 'ރޮސް ރެސިޕީ',
    titleEn: 'Roshi Recipe',
    image: '/images/roshi.jpg',
    category: 'side',
    prepTime: '30 މިނިޓް',
    cookTime: '10 މިނިޓް',
    servings: '6 ބައި',
    ingredients: {
      dv: [
        '2 ކަޕް ބިސް',
        '2 ކަޕް ބިސް',
        '1 ސްޕޫން ކަންމަތި',
        '½ ސްޕޫން ހިކި',
        '1 ސްޕޫން ފުށް',
        'ކަންމަތި'
      ],
      en: [
        '2 Cups Flour',
        '2 Cups Flour',
        '1 Tsp Salt',
        '½ Tsp Sugar',
        '1 Tsp Butter',
        'Water'
      ]
    },
    instructions: {
      dv: 'ބިސް އަދި ހިކި އަދި ކަންމަތި އެއްކޮށް މިކްސް ކުރާށެވެ. އެއަށް ފުށް އިތުރުކޮށް މިކްސް ކުރާށެވެ. އެއަށް ކަންމަތި އިތުރުކޮށް މިކްސް ކުރާށެވެ. އެއަށް ފުށް އިތުރުކޮށް މިކްސް ކުރާށެވެ. އެއަށް ކަންމަތި އިތުރުކޮށް މިކްސް ކުރާށެވެ. އެއަށް ފުށް އިތުރުކޮށް މިކްސް ކުރާށެވެ. އެއަށް ކަންމަތި އިތުރުކޮށް މިކްސް ކުރާށެވެ.',
      en: 'Mix flour, sugar and salt together. Add butter and mix. Add water and mix. Knead the dough. Roll into flat breads. Cook on a hot pan.'
    }
  }
];
