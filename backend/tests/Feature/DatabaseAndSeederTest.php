<?php

namespace Tests\Feature;

use App\Enums\ListingCondition;
use App\Enums\ListingStatus;
use App\Models\Category;
use App\Models\Listing;
use App\Models\ListingImage;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DatabaseAndSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_categories_seeded_correctly(): void
    {
        $expectedSlugs = [
            'sepeda',
            'perkakas',
            'hobi',
            'elektronik',
            'rumah-tangga',
            'otomotif',
            'olahraga',
            'lainnya',
        ];

        $this->assertSame(8, Category::count());

        foreach ($expectedSlugs as $slug) {
            $this->assertTrue(
                Category::where('slug', $slug)->exists(),
                "Kategori dengan slug '{$slug}' harus ada di database."
            );
        }
    }

    public function test_demo_users_seeded_correctly(): void
    {
        $this->assertSame(3, User::count());

        $budi = User::where('email', 'budi@example.com')->first();
        $this->assertNotNull($budi);
        $this->assertSame('Budi Santoso', $budi->name);
        $this->assertSame('6281234567801', $budi->phone);
        $this->assertSame('Jakarta Selatan', $budi->location);
        $this->assertTrue(Hash::check('password123', $budi->password));

        $siti = User::where('email', 'siti@example.com')->first();
        $this->assertNotNull($siti);
        $this->assertSame('Siti Rahayu', $siti->name);
        $this->assertSame('6281234567802', $siti->phone);
        $this->assertSame('Bandung', $siti->location);
        $this->assertTrue(Hash::check('password123', $siti->password));

        $ahmad = User::where('email', 'ahmad@example.com')->first();
        $this->assertNotNull($ahmad);
        $this->assertSame('Ahmad Fauzi', $ahmad->name);
        $this->assertSame('6281234567803', $ahmad->phone);
        $this->assertSame('Surabaya', $ahmad->location);
        $this->assertTrue(Hash::check('password123', $ahmad->password));
    }

    public function test_listings_and_relations_seeded_correctly(): void
    {
        $this->assertGreaterThanOrEqual(30, Listing::count());

        $firstListing = Listing::with(['user', 'category', 'images', 'primaryImage'])->first();

        $this->assertNotNull($firstListing);
        $this->assertInstanceOf(User::class, $firstListing->user);
        $this->assertInstanceOf(Category::class, $firstListing->category);
        $this->assertNotEmpty($firstListing->images);
        $this->assertInstanceOf(ListingImage::class, $firstListing->primaryImage);
        $this->assertInstanceOf(ListingCondition::class, $firstListing->condition);
        $this->assertInstanceOf(ListingStatus::class, $firstListing->status);
        $this->assertIsInt($firstListing->price);
    }

    public function test_listing_image_url_accessor(): void
    {
        $externalImage = new ListingImage(['path' => 'https://picsum.photos/seed/test/800/600']);
        $this->assertSame('https://picsum.photos/seed/test/800/600', $externalImage->url);

        $localImage = new ListingImage(['path' => 'listings/sample.jpg']);
        $expectedUrl = Storage::disk(config('filesystems.default'))->url('listings/sample.jpg');
        $this->assertSame($expectedUrl, $localImage->url);
    }

    public function test_trigram_search_scope(): void
    {
        $results = Listing::query()->search('Dahon')->get();
        $this->assertNotEmpty($results);
        $this->assertTrue($results->contains(fn ($item) => str_contains($item->title, 'Dahon')));
    }

    public function test_available_scope(): void
    {
        $availableCount = Listing::available()->count();
        $totalCount = Listing::count();

        $this->assertGreaterThan(0, $availableCount);
        $this->assertLessThan($totalCount, $availableCount);
    }
}
