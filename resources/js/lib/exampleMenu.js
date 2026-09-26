/**
 * A fictional restaurant used to demonstrate the product on the landing page.
 *
 * The dishes, prices and translations are invented for the demo. The layout,
 * the language switcher and the price formatting mirror the real menu page.
 */
export const EXAMPLE_MENU = {
    currency: 'EGP',
    languages: ['ar', 'en', 'fr'],
    name: {
        en: 'Golden Cairo Grill',
        ar: 'جولدن كايرو جريل',
        fr: 'Golden Cairo Grill',
    },
    description: {
        en: 'Egyptian kitchen & charcoal grill in Downtown Cairo.',
        ar: 'مطبخ مصري ومشويات على الفحم في وسط البلد بالقاهرة.',
        fr: 'Cuisine égyptienne et grillades au charbon au cœur du Caire.',
    },
    menuName: {
        en: 'Main Menu',
        ar: 'القائمة الرئيسية',
        fr: 'Carte Principale',
    },
    categories: [
        {
            id: 'starters',
            emoji: '🥘',
            name: { en: 'Starters', ar: 'مقبلات', fr: 'Entrées' },
            items: [
                {
                    emoji: '🥘',
                    name: { en: 'Koshari', ar: 'كشري', fr: 'Koshari' },
                    description: {
                        en: 'Lentils, rice, pasta and crispy onions with spicy tomato sauce.',
                        ar: 'عدس وأرز ومكرونة وبصل محمر مع صلصة طماطم حارة.',
                        fr: 'Lentilles, riz, pâtes et oignons croustillants, sauce tomate épicée.',
                    },
                    price: 45,
                },
                {
                    emoji: '🥖',
                    name: { en: 'Alexandrian Liver Sandwich', ar: 'ساندوتش كبدة اسكندراني', fr: 'Sandwich alexandrin' },
                    description: {
                        en: 'Seared liver with lemon, green pepper and pickles in toasted bread.',
                        ar: 'كبدة مقلية مع ليمون وفلفل أخضر ومخلل في عيش بلدي محمص.',
                        fr: 'Foie mariné, citron, piment vert et pickles dans du pain grillé.',
                    },
                    price: 60,
                },
                {
                    emoji: '🫛',
                    name: { en: 'Bamia', ar: 'بامية', fr: 'Bamia' },
                    description: {
                        en: 'Slow-cooked okra in rich tomato sauce with tender beef.',
                        ar: 'بامية مطهية ببطء في صلصة طماطم غنية مع قطع لحمة طرية.',
                        fr: 'Okra mijotée, sauce tomate riche et bœuf fondant.',
                    },
                    price: 70,
                },
            ],
        },
        {
            id: 'grills',
            emoji: '🍢',
            name: { en: 'Charcoal Grills', ar: 'مشويات', fr: 'Grillades' },
            items: [
                {
                    emoji: '🍢',
                    name: { en: 'Mix Grill Plate', ar: 'طبق مشويات مشكل', fr: 'Assiette mixte' },
                    description: {
                        en: 'Lamb kofta, shish tawook and grilled quail with rice and salad.',
                        ar: 'كفتة لحم وشيش طاووق وسمان مشوي مع أرز وسلطة.',
                        fr: 'Kofta d’agneau, chich taouok et caille, riz et salade.',
                    },
                    price: 220,
                },
                {
                    emoji: '🥩',
                    name: { en: 'Lamb Kofta', ar: 'كفتة لحم', fr: 'Kofta d’agneau' },
                    description: {
                        en: 'Charcoal-grilled minced lamb with parsley, onion and warm spices.',
                        ar: 'كفتة لحم مفروم مشوية على الفحم مع بقدونس وبصل وتوابل.',
                        fr: 'Agneau haché grillé au charbon, persil, oignon et épices.',
                    },
                    price: 180,
                },
                {
                    emoji: '🍗',
                    name: { en: 'Shish Tawook', ar: 'شيش طاووق', fr: 'Chich taouok' },
                    description: {
                        en: 'Marinated chicken skewers with garlic sauce and grilled tomatoes.',
                        ar: 'أسياخ فراخ متبلة مع صلصة ثوم وطماطم مشوية.',
                        fr: 'Brochettes de poulet mariné, sauce à l’ail, tomates grillées.',
                    },
                    price: 160,
                },
            ],
        },
        {
            id: 'drinks',
            emoji: '🍋',
            name: { en: 'Cold Drinks', ar: 'مشروبات باردة', fr: 'Boissons' },
            items: [
                {
                    emoji: '🍋',
                    name: { en: 'Fresh Mint Lemonade', ar: 'ليمون بالنعناع', fr: 'Citronnade à la menthe' },
                    description: {
                        en: 'Hand-pressed lemon with garden mint over crushed ice.',
                        ar: 'ليمون معصور طازج مع نعناع أخضر على ثلج مجروش.',
                        fr: 'Citron pressé, menthe fraîche et glace pilée.',
                    },
                    price: 35,
                },
                {
                    emoji: '🥤',
                    name: { en: 'Sugarcane Juice', ar: 'عصير قصب', fr: 'Jus de canne' },
                    description: {
                        en: 'Freshly pressed sugarcane, chilled and served tall.',
                        ar: 'عصير قصب طازج بارد.',
                        fr: 'Jus de canne frais, servi glacé.',
                    },
                    price: 30,
                },
            ],
        },
        {
            id: 'desserts',
            emoji: '🍮',
            name: { en: 'Desserts', ar: 'حلويات', fr: 'Desserts' },
            items: [
                {
                    emoji: '🍮',
                    name: { en: 'Om Ali', ar: 'أم علي', fr: 'Om Ali' },
                    description: {
                        en: 'Warm baked pastry with milk, nuts and raisins.',
                        ar: 'عجينة مخبوزة ساخنة مع حليب ومكسرات وزبيب.',
                        fr: 'Pâtisserie chaude, lait, noix et raisins secs.',
                    },
                    price: 55,
                },
                {
                    emoji: '🥛',
                    name: { en: 'Mahalabeya', ar: 'مهلبية', fr: 'Mahalabeya' },
                    description: {
                        en: 'Milk pudding scented with rose water and crushed nuts.',
                        ar: 'مهلبية الحليب بنكهة ماء الورد مع مكسرات مجروشة.',
                        fr: 'Crème au lait, eau de rose et noix concassées.',
                    },
                    price: 35,
                    discountPrice: 29,
                },
            ],
        },
    ],
};

export function translated(field, locale) {
    return field?.[locale] ?? field?.en ?? '';
}

export function discountPercent(item) {
    if (!item.discountPrice || item.discountPrice >= item.price) {
        return null;
    }

    return Math.round((1 - item.discountPrice / item.price) * 100);
}
