<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DemoRestaurantSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $user = User::query()->where('email', 'demo@simplemenu.test')->first()
            ?? User::query()->whereNotNull('phone_verified_at')->first()
            ?? User::first();

        if ($user === null) {
            $this->command?->warn('No demo user found. Run php artisan db:seed first.');

            return;
        }

        foreach ($this->restaurants() as $spec) {
            $this->createRestaurant($user, $spec);
        }

        $this->command?->info('Demo restaurants created for '.$user->email.'.');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function restaurants(): array
    {
        return [
            // 1 — English + Arabic, full data with images, EGP, no discounts.
            [
                'slug' => 'golden-cairo-grill',
                'translations' => [
                    'en' => ['name' => 'Golden Cairo Grill', 'description' => 'Egyptian kitchen & grill in the heart of downtown Cairo. Fresh ingredients, charcoal-grilled classics and homemade favorites since day one.'],
                    'ar' => ['name' => 'جولدن كايرو جريل', 'description' => 'مطبخ مصري ومشويات في قلب وسط البلد بالقاهرة. مكونات طازجة ومشويات على الفحم وأطباق بيتي أصيلة.'],
                ],
                'address' => '15 Tahrir St, Downtown, Cairo',
                'latitude' => 30.0444,
                'longitude' => 31.2357,
                'social_links' => [
                    ['name' => 'facebook', 'url' => 'https://facebook.com/goldencairogrill', 'icon' => 'facebook'],
                    ['name' => 'tiktok', 'url' => 'https://tiktok.com/@goldencairogrill', 'icon' => 'tiktok'],
                    ['name' => 'instagram', 'url' => 'https://instagram.com/goldencairogrill', 'icon' => 'instagram'],
                ],
                'banner' => true,
                'menu' => ['name' => 'Main Menu', 'currency' => 'EGP', 'languages' => ['en', 'ar']],
                'categories' => [
                    [
                        'translations' => ['en' => ['name' => 'Starters'], 'ar' => ['name' => 'مقبلات']],
                        'items' => [
                            $this->item(45, ['en' => ['Koshari', 'Lentils, rice, pasta and crispy onions with spicy tomato sauce.'], 'ar' => ['كشري', 'عدس وأرز ومكرونة وبصل محمر مع صلصة طماطم حارة.']], '🥘'),
                            $this->item(60, ['en' => ['Alexandrian Liver Sandwich', 'Seared liver with lemon, green pepper and pickles in toasted baladi bread.'], 'ar' => ['ساندوتش كبدة اسكندراني', 'كبدة مقلية مع ليمون وفلفل أخضر ومخلل في عيش بلدي محمص.']], '🥖'),
                            $this->item(70, ['en' => ['Bamia', 'Slow-cooked okra in rich tomato sauce with tender beef.'], 'ar' => ['بامية', 'بامية مطهية ببطء في صلصة طماطم غنية مع قطع لحمة طرية.']], '🫛'),
                            $this->item(40, ['en' => ['Hummus', 'Silky chickpea dip with tahini, olive oil and warm baladi bread.'], 'ar' => ['حمص', 'حمص ناعم مع طحينة وزيت زيتون مع عيش بلدي ساخن.']], '🥣'),
                        ],
                    ],
                    [
                        'translations' => ['en' => ['name' => 'Charcoal Grills'], 'ar' => ['name' => 'مشويات']],
                        'items' => [
                            $this->item(220, ['en' => ['Mix Grill Plate', 'Lamb kofta, shish tawook and grilled quail served with rice and salad.'], 'ar' => ['طبق مشويات مشكل', 'كفتة لحم وشيش طاووق وسمان مشوي مع أرز وسلطة.']], '🍢'),
                            $this->item(180, ['en' => ['Lamb Kofta', 'Charcoal-grilled minced lamb with parsley, onion and warm spices.'], 'ar' => ['كفتة لحم', 'كفتة لحم مفروم مشوية على الفحم مع بقدونس وبصل وتوابل.']], '🥩'),
                            $this->item(160, ['en' => ['Shish Tawook', 'Marinated chicken skewers with garlic sauce and grilled tomatoes.'], 'ar' => ['شيش طاووق', 'أسياخ فراخ متبلة مع صلصة ثوم وطماطم مشوية.']], '🍗'),
                            $this->item(150, ['en' => ['Half Grilled Chicken', 'Whole half-chicken marinated overnight, charcoal grilled to order.'], 'ar' => ['نص فرخة مشوية', 'نصف فرخة متبلة طول الليل ومشوية على الفحم عند الطلب.']], '🍗'),
                        ],
                    ],
                    [
                        'translations' => ['en' => ['name' => 'Pasta & Rice'], 'ar' => ['name' => 'مكرونة وأرز']],
                        'items' => [
                            $this->item(140, ['en' => ['Seafood Pasta', 'Shrimp and calamari tossed with basil tomato sauce and linguine.'], 'ar' => ['مكرونة بحري', 'جمبري وكاليماري مع صلصة طماطم بالريحان ومكرونة.']], '🍝'),
                            $this->item(120, ['en' => ['Sayadieh Rice', 'Golden rice with fried fish fillet and caramelised onions.'], 'ar' => ['رز صيادية', 'أرز ذهبي مع فيليه سمك مقلي وبصل مكرمل.']], '🍚'),
                            $this->item(95, ['en' => ['Macarona Béchamel', 'Baked pasta with creamy béchamel and minced beef.'], 'ar' => ['مكرونة بشاميل', 'مكرونة مخبوزة مع بشاميل كريمي ولحمة مفرومة.']], '🧀'),
                        ],
                    ],
                    [
                        'translations' => ['en' => ['name' => 'Cold Drinks'], 'ar' => ['name' => 'مشروبات باردة']],
                        'items' => [
                            $this->item(35, ['en' => ['Fresh Mint Lemonade', 'Hand-pressed lemon with garden mint over crushed ice.'], 'ar' => ['ليمون بالنعناع', 'ليمون معصور طازج مع نعناع أخضر على ثلج مجروش.']], '🍋'),
                            $this->item(30, ['en' => ['Sugarcane Juice', 'Freshly pressed sugarcane, chilled and served tall.'], 'ar' => ['عصير قصب', 'عصير قصب طازج بارد.']], '🥤'),
                            $this->item(25, ['en' => ['Hibiscus Tea', 'Deep-red karkadeh, sweet and served cold.'], 'ar' => ['كركديه', 'كركديه عميق اللون محلى ويقدم بارد.']], '🌺'),
                        ],
                    ],
                    [
                        'translations' => ['en' => ['name' => 'Desserts'], 'ar' => ['name' => 'حلويات']],
                        'items' => [
                            $this->item(55, ['en' => ['Om Ali', 'Warm baked pastry with milk, nuts and raisins.'], 'ar' => ['أم علي', 'عجينة مخبوزة ساخنة مع حليب ومكسرات وزبيب.']], '🍮'),
                            $this->item(40, ['en' => ['Basbousa', 'Semolina cake soaked in syrup with fresh cream.'], 'ar' => ['بسبوسة', 'كيك سميد مغموس في شربات مع كريمة طازجة.']], '🍯'),
                            $this->item(35, ['en' => ['Mahalabeya', 'Milk pudding scented with rose water and crushed nuts.'], 'ar' => ['مهلبية', 'مهلبية الحليب بنكهة ماء الورد مع مكسرات مجروشة.']], '🥛'),
                        ],
                    ],
                ],
            ],

            // 2 — Arabic only, items with no images, no discounts.
            [
                'slug' => 'al-aseel-restaurant',
                'translations' => [
                    'ar' => ['name' => 'مطعم الأصيل', 'description' => 'مطبخ بيتي أصيل في الجيزة. أطباق منزلية طازجة تحضر يومياً بنفس وصفات الجدة.'],
                ],
                'address' => '8 الجمهورية الجديدة، الجيزة',
                'latitude' => 30.0131,
                'longitude' => 31.2089,
                'social_links' => [
                    ['name' => 'instagram', 'url' => 'https://instagram.com/alaseel.restaurant', 'icon' => 'instagram'],
                ],
                'banner' => false,
                'menu' => ['name' => 'القائمة الرئيسية', 'currency' => 'EGP', 'languages' => ['ar']],
                'categories' => [
                    [
                        'translations' => ['ar' => ['name' => 'مقبلات']],
                        'items' => [
                            $this->item(35, ['ar' => ['سلطة بلدي', 'طماطم وخيار وبصل مع زيت زيتون وليمون.']]),
                            $this->item(55, ['ar' => ['ملوخية', 'ملوخية خضراء مع قطع فراخ وأرز أبيض.']]),
                            $this->item(40, ['ar' => ['بابا غنوج', 'باذنجان مشوي مع طحينة وليمون.']]),
                            $this->item(20, ['ar' => ['مخلل مشكل', 'تشكيلة مخللات منزلية.']]),
                        ],
                    ],
                    [
                        'translations' => ['ar' => ['name' => 'أطباق رئيسية']],
                        'items' => [
                            $this->item(160, ['ar' => ['فراخ مشوية', 'فراخ بالتتبيلة البيتي مع أرز بسمتي.']]),
                            $this->item(120, ['ar' => ['محشي كرنب', 'ورق كرنب محشي بالأرز واللحمة مع رقاق.']]),
                            $this->item(110, ['ar' => ['كفتة بالأرز', 'كفتة لحم مع صلصة طماطم وأرز ورقاق.']]),
                            $this->item(45, ['ar' => ['رز معمر', 'رز مطبوخ مع الحليب والسمن البلدي.']]),
                        ],
                    ],
                    [
                        'translations' => ['ar' => ['name' => 'مشروبات']],
                        'items' => [
                            $this->item(15, ['ar' => ['شاي بالنعناع', 'شاي بلدي طازج مع نعناع.']]),
                            $this->item(25, ['ar' => ['قهوة بلدي', 'قهوة تركي على الرمل.']]),
                            $this->item(45, ['ar' => ['عصير مانجو', 'مانجو طازج مطحون.']]),
                        ],
                    ],
                    [
                        'translations' => ['ar' => ['name' => 'حلويات']],
                        'items' => [
                            $this->item(60, ['ar' => ['كنافة بالمكسرات', 'كنافة ساخنة محشوة بالمكسرات.']]),
                            $this->item(35, ['ar' => ['فطيرة بالعسل', 'فطيرة طرية مع عسل نحل.']]),
                        ],
                    ],
                ],
            ],

            // 3 — Arabic + French, Algerian restaurant, full item data, DZD, no discounts.
            [
                'slug' => 'chez-karim-alger',
                'translations' => [
                    'ar' => ['name' => 'مطعم شيز كريم', 'description' => 'مطبخ جزائري أصيل في قلب الجزائر العاصمة. كسكس، طواجن ومشويات على الطريقة التقليدية.'],
                    'fr' => ['name' => 'Chez Karim', 'description' => 'Cuisine algérienne authentique au cœur d’Alger. Couscous, tajines et grillades faits maison.'],
                ],
                'address' => '12 Rue Didouche Mourad, Alger Centre',
                'latitude' => 36.7538,
                'longitude' => 3.0588,
                'social_links' => [
                    ['name' => 'facebook', 'url' => 'https://facebook.com/chezkarimalger', 'icon' => 'facebook'],
                    ['name' => 'instagram', 'url' => 'https://instagram.com/chez.karim', 'icon' => 'instagram'],
                ],
                'banner' => true,
                'menu' => ['name' => 'Carte Principale', 'currency' => 'DZD', 'languages' => ['ar', 'fr']],
                'categories' => [
                    [
                        'translations' => ['ar' => ['name' => 'مقبلات'], 'fr' => ['name' => 'Entrées']],
                        'items' => [
                            $this->item(350, ['ar' => ['شربة فريك', 'حساء لحم الغنم بالفريك والكسبرة والنعناع.'], 'fr' => ['Chorba Frik', 'Ragoût de mouton au frik, coriandre et menthe.']], '🍲'),
                            $this->item(300, ['ar' => ['بريك بالبيض', 'رقاقة بريك مقرمشة محشوة بالبيض والتونة والبطاطس.'], 'fr' => ['Brik à l’Œuf', 'Feuille de brick croustillante garnie d’œuf, thon et pommes de terre.']], '🥟'),
                            $this->item(250, ['ar' => ['معقودة', 'قرص بطاطس بالتوابل مع صلصة هريسة.'], 'fr' => ['Maakouda', 'Galette de pommes de terre aux épices, sauce harissa.']], '🥔'),
                            $this->item(280, ['ar' => ['شكشوكة', 'فلفل وطماطم مطهوة مع البيض.'], 'fr' => ['Chakchouka', 'Poivrons et tomates mijotés avec des œufs.']], '🍳'),
                        ],
                    ],
                    [
                        'translations' => ['ar' => ['name' => 'أطباق رئيسية'], 'fr' => ['name' => 'Plats Principaux']],
                        'items' => [
                            $this->item(900, ['ar' => ['كسكس باللحم', 'سميد ناعم مع خضار الموسم ولحم الغنم الطري.'], 'fr' => ['Couscous au Mouton', 'Semoule fine, légumes de saison et agneau fondant.']], '🍛'),
                            $this->item(750, ['ar' => ['طاجين زيتون', 'دجاج بلدي بالزيتون والليمون المخلل.'], 'fr' => ['Tajine Zitoune', 'Poulet de ferme aux olives et citrons confits.']], '🍗'),
                            $this->item(700, ['ar' => ['رشطة', 'شعرية رفيعة منزلية مع صلصة بيضاء بالدجاج والحمص.'], 'fr' => ['Rechta', 'Nouilles fines faites maison, sauce blanche au poulet et pois chiches.']], '🍜'),
                            $this->item(600, ['ar' => ['متوقم', 'ثوم ولحم غنم وحمص بصلصة بيضاء منزلية.'], 'fr' => ['Mtewem', 'Ail, mouton et pois chiches dans une sauce blanche maison.']], '🧄'),
                        ],
                    ],
                    [
                        'translations' => ['ar' => ['name' => 'مشويات'], 'fr' => ['name' => 'Grillades']],
                        'items' => [
                            $this->item(400, ['ar' => ['مرقاز', 'سجق لحم الغنم الحار مشوي على الفحم.'], 'fr' => ['Merguez', 'Saucisses d’agneau épicées grillées au charbon.']], '🌭'),
                            $this->item(550, ['ar' => ['أقراص لحم غنم', 'أسياخ لحم الغنم المتبل مع طماطم وبصل مشوي.'], 'fr' => ['Brochettes d’Agneau', 'Brochettes d’agneau marinées, tomates et oignons grillés.']], '🍢'),
                            $this->item(500, ['ar' => ['دجاج مشوي', 'دجاجة كاملة متبلة مع بطاطس مقلية منزلية وسلطة.'], 'fr' => ['Poulet Grillé', 'Poulet entier mariné, frites maison et salade.']], '🍗'),
                        ],
                    ],
                    [
                        'translations' => ['ar' => ['name' => 'حلويات وشاي'], 'fr' => ['name' => 'Desserts & Thé']],
                        'items' => [
                            $this->item(350, ['ar' => ['بقلاوة', 'عجينة باللوز والعسل وماء زهر البرتقال.'], 'fr' => ['Baklawa', 'Feuilleté aux amandes, miel et fleur d’oranger.']], '🧁'),
                            $this->item(300, ['ar' => ['مقروط', 'سميد بالتمر مقلي ومغموس بالعسل.'], 'fr' => ['Makroud', 'Semoule aux dattes, frit et trempé dans le miel.']], '🥮'),
                            $this->item(150, ['ar' => ['شاي بالنعناع', 'شاي أخضر بالنعناع الطازج على الطريقة التقليدية.'], 'fr' => ['Thé à la Menthe', 'Thé vert à la menthe fraîche, servi à la tradition.']], '🍵'),
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $spec
     */
    private function createRestaurant(User $user, array $spec): void
    {
        $restaurant = Restaurant::create([
            'user_id' => $user->id,
            'slug' => $spec['slug'],
            'latitude' => $spec['latitude'],
            'longitude' => $spec['longitude'],
            'maps_url' => null,
            'address' => $spec['address'],
            'banner' => $spec['banner'] ? $this->asset('restaurants/'.$user->id, $spec['slug'].'-banner', 1200, 400, '🍽️') : null,
            'logo' => $this->asset('restaurants/'.$user->id, $spec['slug'].'-logo', 240, 240, '🍽️'),
            'social_links' => $spec['social_links'],
        ]);

        foreach ($spec['translations'] as $locale => $translation) {
            $restaurant->translations()->create($translation + ['locale' => $locale]);
        }

        $menu = Menu::create([
            'restaurant_id' => $restaurant->id,
            'slug' => 'menu-'.$restaurant->slug,
            'name' => $spec['menu']['name'],
            'currency' => $spec['menu']['currency'],
            'languages' => $spec['menu']['languages'],
        ]);

        foreach ($spec['categories'] as $order => $category) {
            $cat = MenuCategory::create([
                'menu_id' => $menu->id,
                'sort_order' => $order,
            ]);

            foreach ($category['translations'] as $locale => $translation) {
                $cat->translations()->create($translation + ['locale' => $locale]);
            }

            foreach ($category['items'] as $itemOrder => $item) {
                /** @var array<string, mixed> $item */
                $image = $item['emoji'] !== null
                    ? $this->asset('menus/'.$user->id, $spec['slug'].'-cat-'.$order.'-item-'.$itemOrder, 400, 300, $item['emoji'])
                    : null;

                $menuItem = MenuItem::create([
                    'menu_category_id' => $cat->id,
                    'price' => $item['price'],
                    'discount_price' => null,
                    'image' => $image,
                    'sort_order' => $itemOrder,
                ]);

                foreach ($item['translations'] as $locale => $translation) {
                    $menuItem->translations()->create($translation + ['locale' => $locale]);
                }
            }
        }
    }

    private function asset(string $folder, string $name, int $width, int $height, string $emoji): string
    {
        $path = $folder.'/'.$name.'.svg';
        $this->writeSvg($path, $this->svg($width, $height, $emoji));

        return $path;
    }

    private function svg(int $width, int $height, string $emoji): string
    {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="'.$width.'" height="'.$height.'" viewBox="0 0 '.$width.' '.$height.'">'
            .'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
            .'<stop offset="0" stop-color="#b45309"/><stop offset="1" stop-color="#78350f"/>'
            .'</linearGradient></defs>'
            .'<rect width="'.$width.'" height="'.$height.'" fill="url(#g)"/>'
            .'<circle cx="'.($width / 2).'" cy="'.round($height * 0.36).'" r="'.round($height * 0.28).'" fill="rgba(255,255,255,0.12)"/>'
            .'<text x="'.($width / 2).'" y="'.round($height * 0.52).'" font-size="'.round($height * 0.42).'" text-anchor="middle">'.$emoji.'</text>'
            .'<text x="'.($width / 2).'" y="'.($height - round($height * 0.08)).'" font-family="ui-sans-serif, system-ui, sans-serif" font-size="'.round($width * 0.045).'" fill="rgba(255,255,255,0.75)" text-anchor="middle">SimpleMenu</text>'
            .'</svg>';
    }

    /**
     * @param  array<string, array{0: string, 1: string}>  $translations
     * @return array<string, mixed>
     */
    private function item(int|float $price, array $translations, ?string $emoji = null): array
    {
        $normalized = [];

        foreach ($translations as $locale => [$name, $description]) {
            $normalized[$locale] = ['name' => $name, 'description' => $description];
        }

        return [
            'emoji' => $emoji,
            'price' => $price,
            'translations' => $normalized,
        ];
    }

    private function writeSvg(string $path, string $svg): void
    {
        $absolute = storage_path('app/public/'.$path);

        if (! is_dir(dirname($absolute))) {
            mkdir(dirname($absolute), 0755, true);
        }

        file_put_contents($absolute, $svg);
    }
}
