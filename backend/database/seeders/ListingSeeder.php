<?php

namespace Database\Seeders;

use App\Enums\ListingCondition;
use App\Enums\ListingStatus;
use App\Models\Category;
use App\Models\Listing;
use App\Models\ListingImage;
use App\Models\User;
use Illuminate\Database\Seeder;

class ListingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Listing::count() > 0) {
            return;
        }

        $budi = User::where('email', 'budi@example.com')->first();
        $siti = User::where('email', 'siti@example.com')->first();
        $ahmad = User::where('email', 'ahmad@example.com')->first();

        $categories = Category::all()->keyBy('slug');

        $listings = [
            // --- Kategori: Sepeda ---
            [
                'user_id' => $budi->id,
                'category_id' => $categories['sepeda']->id,
                'title' => 'Sepeda Lipat Dahon Boardwalk D7 Japan Domestic Market',
                'description' => 'Edisi klasik warna British Racing Green. Frame chromoly masih lempeng no peyang, cat orisinil 85%. Groupset Shimano 7-speed operan empuk. Cocok buat santai keliling komplek atau CFD-an. Alasan jual: garasi mulai sempit disuruh istri beresin koleksi.',
                'price' => 4_500_000,
                'condition' => ListingCondition::Good,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/dahon-1/800/600',
                    'https://picsum.photos/seed/dahon-2/800/600',
                ],
            ],
            [
                'user_id' => $siti->id,
                'category_id' => $categories['sepeda']->id,
                'title' => 'Roadbike Polygon Strattos S3 Size 50 (S) Alloy Carbon',
                'description' => 'Pembelian akhir 2023, jarak tempuh baru sekitar 300 km. Fork sudah carbon, groupset Shimano Sora 2x9 speed. Sudah upgrade ban Continental Ultra Sport 700x25c anti bocor. Bonus bottle cage dan sadel gel empuk. Kondisi mulus kinclong siap gowes pagi.',
                'price' => 6_200_000,
                'condition' => ListingCondition::LikeNew,
                'location' => 'Bandung',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/strattos-1/800/600',
                    'https://picsum.photos/seed/strattos-2/800/600',
                    'https://picsum.photos/seed/strattos-3/800/600',
                ],
            ],
            [
                'user_id' => $ahmad->id,
                'category_id' => $categories['sepeda']->id,
                'title' => 'Sepeda Gunung MTB United Clovis 5.10 29er 1x11 Speed',
                'description' => 'Kondisi sehat siap diajak main tanah atau blusukan. Shifter & RD Shimano Deore M5100 11-speed presisi. Rem hidrolik Shimano MT200 pakem. Ban Maxxis Ardent kembang tebal 90%. Lecet pemakaian wajar karena loading pickup.',
                'price' => 5_800_000,
                'condition' => ListingCondition::Good,
                'location' => 'Surabaya',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/clovis-1/800/600',
                    'https://picsum.photos/seed/clovis-2/800/600',
                ],
            ],
            [
                'user_id' => $budi->id,
                'category_id' => $categories['sepeda']->id,
                'title' => 'Sepeda Minivelo London Taxi 20 Inch Classic Putih',
                'description' => 'Sepeda santai retro gaya London. Keranjang depan rotan masih bagus, bel kring-kring khas bapak-bapak. Sadle kulit bawaan empuk. Kondisi wajar ada karat tipis di baut, tinggal semprot anti karat.',
                'price' => 2_300_000,
                'condition' => ListingCondition::Fair,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Sold,
                'images' => [
                    'https://picsum.photos/seed/londontaxi-1/800/600',
                ],
            ],

            // --- Kategori: Perkakas ---
            [
                'user_id' => $budi->id,
                'category_id' => $categories['perkakas']->id,
                'title' => 'Mesin Bor Cordless Bosch GSB 120-LI Baterai Ganda Lengkap Koper',
                'description' => 'Bor baterai impak multifungsi (bisa bor kayu, besi, dan tembok). Pembelian 6 bulan lalu buat proyek bikin meja taman pribadi, sekarang jarang dipakai. Baterai 2 unit 12V 2.0Ah masih awet normal, charger ori, dan koper bawaan komplit.',
                'price' => 1_150_000,
                'condition' => ListingCondition::LikeNew,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/bosch-bor-1/800/600',
                    'https://picsum.photos/seed/bosch-bor-2/800/600',
                ],
            ],
            [
                'user_id' => $ahmad->id,
                'category_id' => $categories['perkakas']->id,
                'title' => 'Toolkit Set Lengkap Kunci Pas Sok Tekiro 46 Pcs Kotak Besi',
                'description' => 'Baru dan belum pernah dipakai (masih plastikan). Hadiah doorprize gathering kantor daripada nganggur di lemari. Kualitas baja Chrome Vanadium (CR-V) jaminan kuat anti selip.',
                'price' => 420_000,
                'condition' => ListingCondition::New,
                'location' => 'Surabaya',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/tekiro-46/800/600',
                ],
            ],
            [
                'user_id' => $siti->id,
                'category_id' => $categories['perkakas']->id,
                'title' => 'Mesin Gerinda Tangan Makita 9553B 4 Inch Original Made in Japan',
                'description' => 'Mesin gerinda legendaris suara halus, getaran minim. Carbon brush masih panjang, saklar belakang enak digenggam. Bonus 3 mata potong gerinda tebal.',
                'price' => 550_000,
                'condition' => ListingCondition::Good,
                'location' => 'Bandung',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/makita-9553/800/600',
                ],
            ],
            [
                'user_id' => $budi->id,
                'category_id' => $categories['perkakas']->id,
                'title' => 'Mesin Las Inverter Lakoni Falcon 120E Hemat Listrik 450W',
                'description' => 'Mesin las rumahan hemat daya listrik 450 Watt bisa jalan. Kabel stang las dan stang massa komplit. Dijual karena pagar rumah sudah selesai diperbaiki.',
                'price' => 780_000,
                'condition' => ListingCondition::Good,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Sold,
                'images' => [
                    'https://picsum.photos/seed/lakoni-120/800/600',
                ],
            ],
            [
                'user_id' => $ahmad->id,
                'category_id' => $categories['perkakas']->id,
                'title' => 'Gergaji Circular Saw Stanley SC16 7 Inch 1600 Watt',
                'description' => 'Circular saw bertenaga buat potong kayu tebal dan triplek. Plat dasar kokoh dan presisi. Body luar baret wajar khas bengkel rumahan, mesin berputar stabil no macet.',
                'price' => 650_000,
                'condition' => ListingCondition::Fair,
                'location' => 'Surabaya',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/stanley-saw/800/600',
                ],
            ],

            // --- Kategori: Hobi ---
            [
                'user_id' => $budi->id,
                'category_id' => $categories['hobi']->id,
                'title' => 'Kamera Mirrorless Sony Alpha A6000 Kit Lensa 16-50mm OSS',
                'description' => 'Kamera andalan buat foto keluarga saat liburan. Shutter count rendah (sekitar 6 ribuan). Sensor bersih bebas jamur, layar tidak vignette, autofocus super cepat. Kelengkapan: body, lensa, strap ori, baterai ori 2 pcs, charger eksternal.',
                'price' => 4_800_000,
                'condition' => ListingCondition::Good,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/sony-a6000-1/800/600',
                    'https://picsum.photos/seed/sony-a6000-2/800/600',
                ],
            ],
            [
                'user_id' => $ahmad->id,
                'category_id' => $categories['hobi']->id,
                'title' => 'Set Joran Pancing Shimano Bassterra EV + Reel Daiwa BG 3000',
                'description' => 'Spek mancing galatama / kolam harian mantap. Ring guide Fuji asli mulus tidak ada goresan. Reel putaran sangat halus drag kuat. Senar PE 2 sudah terpasang. Tinggal pasang kail langsung nyemplung.',
                'price' => 1_450_000,
                'condition' => ListingCondition::LikeNew,
                'location' => 'Surabaya',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/pancing-1/800/600',
                    'https://picsum.photos/seed/pancing-2/800/600',
                ],
            ],
            [
                'user_id' => $siti->id,
                'category_id' => $categories['hobi']->id,
                'title' => 'Akuarium Aquascape 60cm Lengkap Filter Canister & Lampu LED RGB',
                'description' => 'Kaca bending tebal 6mm jernih tanpa bocor. Termasuk filter canister Yamano dan lampu LED gantung tanaman subur. Alasan jual: mau ganti ukuran yang lebih kecil untuk kamar anak.',
                'price' => 1_800_000,
                'condition' => ListingCondition::Good,
                'location' => 'Bandung',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/aquascape-1/800/600',
                ],
            ],
            [
                'user_id' => $budi->id,
                'category_id' => $categories['hobi']->id,
                'title' => 'Drone DJI Mini 2 Fly More Combo Lengkap Dus & Tas',
                'description' => 'Drone di bawah 249 gram bebas registrasi ribet. Kamera 4K tajam gimbal 3-axis stabil. Baterai 3 biji cycle count minim (di bawah 15x). Tidak pernah jatuh atau crash. Semua baling-baling cadangan masih utuh.',
                'price' => 4_900_000,
                'condition' => ListingCondition::LikeNew,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Sold,
                'images' => [
                    'https://picsum.photos/seed/dji-mini2-1/800/600',
                    'https://picsum.photos/seed/dji-mini2-2/800/600',
                ],
            ],

            // --- Kategori: Elektronik ---
            [
                'user_id' => $budi->id,
                'category_id' => $categories['elektronik']->id,
                'title' => 'Mesin Kopi Espresso Manual DeLonghi Dedica EC685 Silver',
                'description' => 'Alat ngopi bapak-bapak di pagi hari. Tekanan pompa 15 bar krema tebal nikmat. Sudah modifikasi non-pressurized basket 51mm biar hasil ekstraksi mirip cafe. Steam wand lancar buat bikin latte art. Dijual karena upgrade mesin lever manual.',
                'price' => 2_750_000,
                'condition' => ListingCondition::LikeNew,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/delonghi-1/800/600',
                    'https://picsum.photos/seed/delonghi-2/800/600',
                ],
            ],
            [
                'user_id' => $ahmad->id,
                'category_id' => $categories['elektronik']->id,
                'title' => 'Smart TV Samsung 43 Inch 4K UHD Crystal Processor BU8000',
                'description' => 'Resolusi 4K bening HDR10+, OS Tizen lancar no lemot (YouTube, Netflix, Vidio ready). Bodi ultra slim estetik. Remote SolarCell isi ulang tanpa baterai AA. Lengkap kaki meja dan kabel power.',
                'price' => 3_200_000,
                'condition' => ListingCondition::Good,
                'location' => 'Surabaya',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/tv-samsung/800/600',
                ],
            ],
            [
                'user_id' => $siti->id,
                'category_id' => $categories['elektronik']->id,
                'title' => 'Speaker Bluetooth Portable Marshall Kilburn II Black Brass',
                'description' => 'Suara bass nendang treble jernih khas musik rock lawas. Knop analog volume, bass, treble empuk berfungsi normal. Baterai tahan di atas 15 jam. Lengkap strap kulit bawaan dan charger adaptor.',
                'price' => 3_100_000,
                'condition' => ListingCondition::LikeNew,
                'location' => 'Bandung',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/marshall-1/800/600',
                    'https://picsum.photos/seed/marshall-2/800/600',
                ],
            ],
            [
                'user_id' => $budi->id,
                'category_id' => $categories['elektronik']->id,
                'title' => 'Monitor Gaming LG UltraGear 24GN60R IPS 144Hz 1ms FreeSync',
                'description' => 'Panel IPS warna akurat, refresh rate 144Hz mulus no ghosting. Pemakaian buat kerja WFH dan sesekali main game bola. Bebas dead pixel, layar no scratch. Kelengkapan komplit dus, adaptor, dan kabel HDMI.',
                'price' => 1_600_000,
                'condition' => ListingCondition::Good,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Sold,
                'images' => [
                    'https://picsum.photos/seed/lg-ultragear/800/600',
                ],
            ],

            // --- Kategori: Rumah Tangga ---
            [
                'user_id' => $budi->id,
                'category_id' => $categories['rumah-tangga']->id,
                'title' => 'Rak Besi Gudang Heavy Duty 5 Susun Kapasitas Beban 200kg/Ambalan',
                'description' => 'Kondisi gres baru rakit tapi ukuran kebesaran di sudut garasi. Ketebalan plat baja 1.2mm kokoh tanpa goyang. Sistem pasang boltless knock down mudah dipindah tanpa mur baut ribet.',
                'price' => 850_000,
                'condition' => ListingCondition::New,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/rak-besi/800/600',
                ],
            ],
            [
                'user_id' => $siti->id,
                'category_id' => $categories['rumah-tangga']->id,
                'title' => 'Air Fryer Digital Philips HD9252 Kapasitas 4.1 Liter Layar Sentuh',
                'description' => 'Menggoreng tanpa minyak untuk hidup lebih sehat. Ada 7 preset masak otomatis. Wadah anti lengket bersih tanpa baret, elemen pemanas berfungsi sempurna. Dus dan buku resep masih ada.',
                'price' => 950_000,
                'condition' => ListingCondition::LikeNew,
                'location' => 'Bandung',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/philips-airfryer/800/600',
                ],
            ],
            [
                'user_id' => $ahmad->id,
                'category_id' => $categories['rumah-tangga']->id,
                'title' => 'Kursi Santai Lipat Outdoor Lafuma RSX Clip Zero Gravity Original',
                'description' => 'Kursi ergonomis buat santai di teras belakang rumah sambil baca koran sore. Posisi kemiringan bisa diatur zero-gravity sangat nyaman buat pinggang. Kain Batyline kuat cuaca panas hujan.',
                'price' => 1_250_000,
                'condition' => ListingCondition::Good,
                'location' => 'Surabaya',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/lafuma-chair/800/600',
                ],
            ],
            [
                'user_id' => $budi->id,
                'category_id' => $categories['rumah-tangga']->id,
                'title' => 'Robot Vacuum Cleaner Xiaomi Mi Robot Vacuum-Mop Sensor Visual',
                'description' => 'Bantu nyapu dan pel lantai otomatis lewat aplikasi Mi Home. Daya hisap 2500Pa kencang. Tangki air dan mop pad cadangan masih ada. Baterai masih awet 1 jam non-stop.',
                'price' => 1_700_000,
                'condition' => ListingCondition::Good,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Sold,
                'images' => [
                    'https://picsum.photos/seed/mi-robot/800/600',
                ],
            ],

            // --- Kategori: Otomotif ---
            [
                'user_id' => $budi->id,
                'category_id' => $categories['otomotif']->id,
                'title' => 'Helm Arai RX7X Nakagami Size L Fullset Mulus Like New',
                'description' => 'Koleksi pribadi jarang dipakai riding jauh. Busa pipi tebal wangi bebas bau keringat. Visor clear jernih terpasang pinlock anti embun. Lengkap sarung ori dan kardus.',
                'price' => 7_500_000,
                'condition' => ListingCondition::LikeNew,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/arai-rx7x-1/800/600',
                    'https://picsum.photos/seed/arai-rx7x-2/800/600',
                ],
            ],
            [
                'user_id' => $ahmad->id,
                'category_id' => $categories['otomotif']->id,
                'title' => 'Pompa Ban Elektrik Portable Xiaomi Portable Electric Air Compressor 2',
                'description' => 'Gres baru masih segel kotak. Auto-stop saat tekanan PSI tercapai. Wajib ada di bagasi mobil buat antisipasi ban kurang angin di tol atau saat turing motor.',
                'price' => 390_000,
                'condition' => ListingCondition::New,
                'location' => 'Surabaya',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/pompa-xiaomi/800/600',
                ],
            ],
            [
                'user_id' => $siti->id,
                'category_id' => $categories['otomotif']->id,
                'title' => 'Roof Box Mobil Platinum Kapasitas 450L Lengkap Crossbar Universal',
                'description' => 'Roof box bagasi atas mobil untuk mudik keluarga. Bahan plastik ABS tebal tahan benturan, bukaan dua sisi dengan kunci pengaman ganda. Kaki crossbar jepit roof rail siap pasang.',
                'price' => 2_400_000,
                'condition' => ListingCondition::Good,
                'location' => 'Bandung',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/roofbox-1/800/600',
                    'https://picsum.photos/seed/roofbox-2/800/600',
                ],
            ],
            [
                'user_id' => $budi->id,
                'category_id' => $categories['otomotif']->id,
                'title' => 'Dongkrak Buaya Tekiro 2 Ton Portable Kotak Koper Merah',
                'description' => 'Dongkrak hidrolik lantai 2 ton merk Tekiro. Roda besi lancar, hidrolik normal tidak ada rembes oli. Sangat stabil untuk ganti ban darurat atau servis oli mesin sendiri.',
                'price' => 480_000,
                'condition' => ListingCondition::Good,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Sold,
                'images' => [
                    'https://picsum.photos/seed/dongkrak-tekiro/800/600',
                ],
            ],

            // --- Kategori: Olahraga ---
            [
                'user_id' => $budi->id,
                'category_id' => $categories['olahraga']->id,
                'title' => 'Set Stik Golf Callaway X Hot (Driver, Fairway Wood, Iron Set 5-PW, Putter)',
                'description' => 'Set golf lengkap beserta tas golf stand bag Callaway ori. Shaft regular flex cocok buat pegolf pemula hingga menengah. Face club masih terawat grip karet tidak licin. Bonus 1 lusin bola golf Titleist.',
                'price' => 6_800_000,
                'condition' => ListingCondition::Good,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/golf-set-1/800/600',
                    'https://picsum.photos/seed/golf-set-2/800/600',
                ],
            ],
            [
                'user_id' => $siti->id,
                'category_id' => $categories['olahraga']->id,
                'title' => 'Raket Badminton Yonex Astrox 88D Pro 4U G5 Made in Japan Original',
                'description' => 'Raket smash power handal untuk pemain ganda belakang. Tarikan senar Yonex BG66 Ultimax 28 lbs. Bebas retak/clash, stiker sunrise hologram resmi terpasang.',
                'price' => 1_950_000,
                'condition' => ListingCondition::LikeNew,
                'location' => 'Bandung',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/yonex-astrox/800/600',
                ],
            ],
            [
                'user_id' => $ahmad->id,
                'category_id' => $categories['olahraga']->id,
                'title' => 'Treadmill Manual Lipat Multifungsi Rumahan Ada Monitor Detak Jantung',
                'description' => 'Alat fitness hemat tempat tidak perlu colokan listrik. Ada fitur twister pinggang dan push up bar di bagian depan. Karpet lari masih tebal. Layar sensor kalori & denyut nadi normal.',
                'price' => 1_300_000,
                'condition' => ListingCondition::Fair,
                'location' => 'Surabaya',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/treadmill/800/600',
                ],
            ],
            [
                'user_id' => $budi->id,
                'category_id' => $categories['olahraga']->id,
                'title' => 'Set Dumbbell 20kg Barbell Chrome Koper Box Praktis',
                'description' => 'Piringan beban lapis chrome mengkilap tahan karat. Dilengkapi stik bar panjang extension untuk dijadikan barbell angkat dada. Pengunci putar bintang kencang dan aman.',
                'price' => 520_000,
                'condition' => ListingCondition::Good,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/dumbbell-20kg/800/600',
                ],
            ],

            // --- Kategori: Lainnya ---
            [
                'user_id' => $siti->id,
                'category_id' => $categories['lainnya']->id,
                'title' => 'Tenda Camping Dhaulagiri Tera 4 Orang Double Layer Anti Badai',
                'description' => 'Tenda kapasitas 4 orang dengan vestibule teras depan luas buat taruh sepatu dan masak. Frame alloy ringan tahan angin kencang gunung. Waterproof rating 3000mm bebas bocor. Dipakai kemping keluarga 2 kali saja.',
                'price' => 950_000,
                'condition' => ListingCondition::LikeNew,
                'location' => 'Bandung',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/tenda-camping/800/600',
                ],
            ],
            [
                'user_id' => $budi->id,
                'category_id' => $categories['lainnya']->id,
                'title' => 'Meja Kerja Belajar Lipat Minimalis Kayu Jati Belanda Asli Finishing Halus',
                'description' => 'Ukuran 100 x 50 cm tinggi 75 cm. Kaki besi hollow cat powder coating hitam doff kokoh. Daun meja serat kayu pinus alami vernis tahan air kopi/teh. Mudah dilipat jika tidak dipakai.',
                'price' => 450_000,
                'condition' => ListingCondition::Good,
                'location' => 'Jakarta Selatan',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/meja-lipat/800/600',
                ],
            ],
            [
                'user_id' => $ahmad->id,
                'category_id' => $categories['lainnya']->id,
                'title' => 'Jaket Kulit Domba Asli Garut Ukuran XL Cokelat Tua Vintage',
                'description' => 'Bahan 100% kulit domba asli tekstur empuk lentur, bukan imitasi/oscar. Furing dalam dormeuil England adem dipakai siang hari. Resleting YKK heavy duty lancar. Gaya klasik bapak-bapak anak motor.',
                'price' => 850_000,
                'condition' => ListingCondition::Good,
                'location' => 'Surabaya',
                'status' => ListingStatus::Available,
                'images' => [
                    'https://picsum.photos/seed/jaket-kulit/800/600',
                ],
            ],
        ];

        foreach ($listings as $listingData) {
            $images = $listingData['images'];
            unset($listingData['images']);

            $listing = Listing::create($listingData);

            foreach ($images as $position => $imagePath) {
                ListingImage::create([
                    'listing_id' => $listing->id,
                    'path' => $imagePath,
                    'position' => $position,
                ]);
            }
        }
    }
}
