export type Category = {
  id: string;
  title: string;
  titleEn: string;
  color: string;
};

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  publishedAt: string;
  author: string;
  views: number;
  readingTime: string;
  body: string[] | string;
  video?: string;
  trending: boolean;
};

export const categories: Category[] = [
  { id: 'local', title: 'ލޯކަލް', titleEn: 'Local', color: 'bg-cyan-500' },
  { id: 'politics', title: 'ސިޔާސީ', titleEn: 'Politics', color: 'bg-amber-500' },
  { id: 'sports', title: 'ކުޅިވަރު', titleEn: 'Sports', color: 'bg-emerald-500' },
  { id: 'islamic', title: 'އިސްލާމީ', titleEn: 'Islamic', color: 'bg-violet-500' },
  { id: 'business', title: 'ވިޔަފާރި', titleEn: 'Business', color: 'bg-sky-500' },
  { id: 'technology', title: 'ޓެކްނޮލޮޖީ', titleEn: 'Technology', color: 'bg-fuchsia-500' },
  { id: 'world', title: 'ދުނިޔެ', titleEn: 'World', color: 'bg-rose-500' },
  { id: 'entertainment', title: 'މަޖާ', titleEn: 'Entertainment', color: 'bg-indigo-500' },
  { id: 'health', title: 'ސިއްޙަތު', titleEn: 'Health', color: 'bg-lime-500' },
  { id: 'life', title: 'ދިރިއުޅުން', titleEn: 'Life', color: 'bg-teal-500' },
  { id: 'education', title: 'ތަޢުލީމް', titleEn: 'Education', color: 'bg-orange-500' },
  { id: 'children', title: 'ކުޑަ ކުދީން', titleEn: 'Children', color: 'bg-pink-500' },
  { id: 'human-rights', title: 'ޙަޤީޤީ ހާދިސާ', titleEn: 'Human Rights', color: 'bg-red-500' },
  { id: 'weather', title: 'މޫސުމް', titleEn: 'Weather', color: 'bg-blue-400' },
  { id: 'religion', title: 'ދީން', titleEn: 'Religion', color: 'bg-purple-600' },
];

export const articles: Article[] = [
  {
    id: 'a1',
    title: 'ފިލްމާގެ އެކްސްޕެމް އިން ވެރިފިއިޑް ސްކޯޕް އިން ހިޔާރު ދީން',
    excerpt: 'މާސީސް ފެށިންނަށް އަހަރެއް، މީހަންޖެހޭ ހުރި އާންމުން ޚިޔާރު އެހެން ދަން.',
    category: 'local',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    publishedAt: 'މާރޗް 22, 2026',
    author: 'މީހާން އައިސިން',
    views: 1324,
    readingTime: '4މިނިޓް',
    body: [
      'މި އިންޓަރނެޓް ސްކޯޕް ދެއްކުން މާހަކަށް ދިދުމާގެ ބޭއްވި ހިޔާރު އެދުމަށް އެހެން އެމީލްކޮށްލާނެ',
      'ހާދިސާ ފެންނަށް ދިވެހި ބޭނުން މަސްލަތް ޖަވާބު އެންމެ ހުރިހާ ފަހުގައި އެކަން ސިޔާސީ ދައްކާނެ.',
    ],
    trending: true,
  },
  {
    id: 'a2',
    title: 'ހުރި ކުރިއްޔާ ރާއްޖެ އިންޑިއާ ވެއްޓްޑް ދިވެހި ސެކްޓަރުތަކާއި ނިންމާ',
    excerpt: 'މަޖިލިސްތަކަށް ސެހިޔާގެ ރިސްކު ބަލާވެއްޖޮސް ދެއްކުން މިހާން ބައިންސެސް ޚިދުމާގެ',
    category: 'business',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    publishedAt: 'މެއި 03, 2026',
    author: 'މަހަރަހް ގަޑި',
    views: 2290,
    readingTime: '6މިނިޓް',
    body: [
      'ބޭންސްތައް ކަންކަނޑުން ދިރާއްޖޭގެ ޚިޔާރު ސޮލުޝަންތަކެއް މީހުންނާ ބޭންސެސް ވެކި ޑިގިޓަލް ނެޓްވޯރްކުތަކެއް ހަދާނެ.',
      'އެންމެ އެހެން ބައިންސް ކިޔަވާނެ ތައްޔާރީ ރައިމްބަރު އިން ޖަނަވާ ކުރަން ވެޑިއޮ ހިތްވާލުގެ އިސްޓެކްސްޓިންގް ކުޑަނީ.',
    ],
    trending: false,
  },
  {
    id: 'a3',
    title: 'ސްޕޯރޓް ފެންނަށް ދިވެހި ޕްރޮފެޓްސް އެޑްތާކެއް އިސްޓެގް ހުރިން',
    excerpt: 'މާލެޑިވްސް ސްޕޯރޓް ހުރިހާ އަހަރެއް ފަހަތްތައް ހިމެނޭނެ.',
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
    publishedAt: 'އޯގަސްޓް 16, 2026',
    author: 'ރަންޑީއެން ރްފީ',
    views: 4800,
    readingTime: '5މިނިޓް',
    body: [
      'ސްޕޯރޓް އެންޑްފަންސް ނެތް ސެކްޓަރުތަކުން ދިވެހިގެ މަސްލާތު އަހަރެއް އަނިޔާ ވިޔަރަތްތަކެއް ހިންގި.',
      'ހައްޓީ ދިން ފިންހާ ބައިން ސެންޓަރުން ފުރުހަތަށް ބަހައްޓާގެ މީހުންނާ މަސްލިސް އެންނައިގެ ބައިންސް އެދުމަށް ގުޅުން.',
    ],
    trending: true,
  },
  {
    id: 'a4',
    title: 'ޓެކްނޮލޮޖީ ސެކްޓަރު މިއަދު ސީޓީ ލިބުންނާ ކަމެއް ހިދުމަށް',
    excerpt: 'މިކަމަށް ޓެކްނޮލޮޖީ ކަންކަނޑުން ދިވެހި އަހަރެއް އެކަން އިޚްތިފާ ފެންނަށް ހިހާ.',
    category: 'technology',
    image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1200&q=80',
    publishedAt: 'އޮކްޓޯބަރ 10, 2026',
    author: 'ފައިސީލް ސަޙީލް',
    views: 3800,
    readingTime: '7މިނިޓް',
    body: [
      'ޓެކްނޮލޮޖީ ހިމެނޭނެ ދިވެހި އޯފީސް އެންޑް ސިޓީ ކުރަން ހިތްވަނީ.',
      'މި ދިވެހި ސެކްޓަރު ހިންގި ފަހުގެ ކުރިން ލީޝަރޓް ކިޔުން އަހަރެއްގެ ދިޔައަށް މެޗިންގް ކުރަން ހޯދައި.',
    ],
    trending: false,
  }
];
