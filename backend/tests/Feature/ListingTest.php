<?php

namespace Tests\Feature;

use App\Enums\ListingCondition;
use App\Enums\ListingStatus;
use App\Models\Category;
use App\Models\Listing;
use App\Models\ListingImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ListingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_can_get_paginated_listings_with_default_12_per_page(): void
    {
        $category = Category::factory()->create();
        $user = User::factory()->create();

        Listing::factory()->count(15)->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'status' => ListingStatus::Available,
        ]);

        $response = $this->getJson('/api/v1/listings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'description',
                        'price',
                        'condition',
                        'condition_label',
                        'location',
                        'status',
                        'status_label',
                        'category' => ['id', 'name', 'slug'],
                        'user' => ['id', 'name', 'location'],
                        'images',
                        'primary_image_url',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'links' => ['first', 'last', 'prev', 'next'],
                'meta' => ['current_page', 'from', 'last_page', 'per_page', 'to', 'total'],
            ]);

        $this->assertCount(12, $response->json('data'));
        $this->assertSame(12, $response->json('meta.per_page'));
        $this->assertSame(15, $response->json('meta.total'));
    }

    public function test_pagination_respects_custom_per_page_and_clamps_max_50(): void
    {
        $category = Category::factory()->create();
        $user = User::factory()->create();

        Listing::factory()->count(20)->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'status' => ListingStatus::Available,
        ]);

        // Custom per_page = 5
        $res5 = $this->getJson('/api/v1/listings?per_page=5');
        $res5->assertStatus(200);
        $this->assertCount(5, $res5->json('data'));
        $this->assertSame(5, $res5->json('meta.per_page'));

        // Clamp max per_page to 50 if given higher value
        $resMax = $this->getJson('/api/v1/listings?per_page=100');
        $resMax->assertStatus(200);
        $this->assertSame(50, $resMax->json('meta.per_page'));
    }

    public function test_default_status_filter_only_returns_available_listings(): void
    {
        $category = Category::factory()->create();
        $user = User::factory()->create();

        Listing::factory()->count(3)->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'status' => ListingStatus::Available,
        ]);

        Listing::factory()->count(2)->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'status' => ListingStatus::Sold,
        ]);

        $response = $this->getJson('/api/v1/listings');

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));

        foreach ($response->json('data') as $item) {
            $this->assertSame(ListingStatus::Available->value, $item['status']);
        }
    }

    public function test_can_filter_by_status(): void
    {
        $category = Category::factory()->create();
        $user = User::factory()->create();

        Listing::factory()->count(2)->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'status' => ListingStatus::Available,
        ]);

        Listing::factory()->count(3)->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'status' => ListingStatus::Sold,
        ]);

        $response = $this->getJson('/api/v1/listings?status=sold');

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));

        foreach ($response->json('data') as $item) {
            $this->assertSame(ListingStatus::Sold->value, $item['status']);
        }
    }

    public function test_can_filter_by_category_slug(): void
    {
        $sepedaCat = Category::factory()->create(['name' => 'Sepeda', 'slug' => 'sepeda']);
        $otomotifCat = Category::factory()->create(['name' => 'Otomotif', 'slug' => 'otomotif']);
        $user = User::factory()->create();

        Listing::factory()->count(2)->create([
            'category_id' => $sepedaCat->id,
            'user_id' => $user->id,
            'status' => ListingStatus::Available,
        ]);

        Listing::factory()->count(3)->create([
            'category_id' => $otomotifCat->id,
            'user_id' => $user->id,
            'status' => ListingStatus::Available,
        ]);

        $response = $this->getJson('/api/v1/listings?category=sepeda');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));

        foreach ($response->json('data') as $item) {
            $this->assertSame('sepeda', $item['category']['slug']);
        }
    }

    public function test_can_filter_by_condition(): void
    {
        $category = Category::factory()->create();
        $user = User::factory()->create();

        Listing::factory()->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'condition' => ListingCondition::New,
            'status' => ListingStatus::Available,
        ]);

        Listing::factory()->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'condition' => ListingCondition::Good,
            'status' => ListingStatus::Available,
        ]);

        $response = $this->getJson('/api/v1/listings?condition=new');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('new', $response->json('data.0.condition'));
    }

    public function test_can_search_by_title_using_scope_search(): void
    {
        $category = Category::factory()->create();
        $user = User::factory()->create();

        Listing::factory()->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'title' => 'Sepeda Lipat Polygon Urbano',
            'status' => ListingStatus::Available,
        ]);

        Listing::factory()->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'title' => 'Kamera Mirrorless Sony A6400',
            'status' => ListingStatus::Available,
        ]);

        $response = $this->getJson('/api/v1/listings?q=Polygon');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Sepeda Lipat Polygon Urbano', $response->json('data.0.title'));
    }

    public function test_can_sort_listings(): void
    {
        $category = Category::factory()->create();
        $user = User::factory()->create();

        $item1 = Listing::factory()->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'price' => 100_000,
            'created_at' => now()->subDays(2),
            'status' => ListingStatus::Available,
        ]);

        $item2 = Listing::factory()->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'price' => 500_000,
            'created_at' => now()->subDay(),
            'status' => ListingStatus::Available,
        ]);

        $item3 = Listing::factory()->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'price' => 250_000,
            'created_at' => now(),
            'status' => ListingStatus::Available,
        ]);

        // Sort price_asc
        $resAsc = $this->getJson('/api/v1/listings?sort=price_asc');
        $this->assertSame($item1->id, $resAsc->json('data.0.id'));
        $this->assertSame($item3->id, $resAsc->json('data.1.id'));
        $this->assertSame($item2->id, $resAsc->json('data.2.id'));

        // Sort price_desc
        $resDesc = $this->getJson('/api/v1/listings?sort=price_desc');
        $this->assertSame($item2->id, $resDesc->json('data.0.id'));
        $this->assertSame($item3->id, $resDesc->json('data.1.id'));
        $this->assertSame($item1->id, $resDesc->json('data.2.id'));

        // Sort oldest
        $resOldest = $this->getJson('/api/v1/listings?sort=oldest');
        $this->assertSame($item1->id, $resOldest->json('data.0.id'));
    }

    public function test_listings_index_does_not_leak_seller_phone_or_email(): void
    {
        $category = Category::factory()->create();
        $user = User::factory()->create([
            'name' => 'Pak Bambang',
            'email' => 'bambang@secret.com',
            'phone' => '6281234567890',
            'location' => 'Jakarta Timur',
        ]);

        Listing::factory()->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'status' => ListingStatus::Available,
        ]);

        $response = $this->getJson('/api/v1/listings');

        $response->assertStatus(200);
        $userData = $response->json('data.0.user');

        $this->assertSame($user->id, $userData['id']);
        $this->assertSame('Pak Bambang', $userData['name']);
        $this->assertSame('Jakarta Timur', $userData['location']);

        // WAJIB: Phone dan Email TIDAK BOLEH bocor di daftar
        $this->assertArrayNotHasKey('phone', $userData);
        $this->assertArrayNotHasKey('email', $userData);
    }

    public function test_can_get_listing_detail_with_images_category_and_seller_phone(): void
    {
        $category = Category::factory()->create(['name' => 'Perkakas', 'slug' => 'perkakas']);
        $user = User::factory()->create([
            'name' => 'Pak Hartono',
            'email' => 'hartono@private.com',
            'phone' => '6281198765432',
            'location' => 'Surabaya',
        ]);

        $listing = Listing::factory()->create([
            'category_id' => $category->id,
            'user_id' => $user->id,
            'title' => 'Mesin Bor Bosch Lengkap',
            'price' => 750_000,
            'condition' => ListingCondition::Good,
            'status' => ListingStatus::Available,
        ]);

        ListingImage::factory()->create([
            'listing_id' => $listing->id,
            'path' => 'https://picsum.photos/seed/bor1/800/600',
            'position' => 0,
        ]);

        ListingImage::factory()->create([
            'listing_id' => $listing->id,
            'path' => 'https://picsum.photos/seed/bor2/800/600',
            'position' => 1,
        ]);

        $response = $this->getJson('/api/v1/listings/'.$listing->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'description',
                    'price',
                    'condition',
                    'condition_label',
                    'location',
                    'status',
                    'status_label',
                    'category' => ['id', 'name', 'slug'],
                    'user' => [
                        'id',
                        'name',
                        'location',
                        'phone',
                        'whatsapp_url',
                    ],
                    'images' => [
                        '*' => ['id', 'url', 'position'],
                    ],
                    'primary_image_url',
                    'created_at',
                    'updated_at',
                ],
            ]);

        $data = $response->json('data');
        $this->assertSame('Mesin Bor Bosch Lengkap', $data['title']);
        $this->assertSame(750_000, $data['price']);
        $this->assertSame('perkakas', $data['category']['slug']);
        $this->assertCount(2, $data['images']);

        // Seller data in detail
        $this->assertSame('6281198765432', $data['user']['phone']);
        $this->assertStringContainsString('6281198765432', $data['user']['whatsapp_url']);

        // WAJIB: Email penjual JANGAN PERNAH bocor
        $this->assertArrayNotHasKey('email', $data['user']);
    }

    public function test_listing_detail_caches_response(): void
    {
        $listing = Listing::factory()->create();

        $cacheKey = "listings:detail:{$listing->id}";
        $this->assertFalse(Cache::has($cacheKey));

        $this->getJson('/api/v1/listings/'.$listing->id)->assertStatus(200);

        $this->assertTrue(Cache::has($cacheKey));

        // Panggilan kedua tetap 200 dan mengambil dari cache
        $this->getJson('/api/v1/listings/'.$listing->id)->assertStatus(200);
    }

    public function test_listing_detail_returns_404_when_not_found(): void
    {
        $response = $this->getJson('/api/v1/listings/999999');

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Barang tidak ditemukan.',
            ]);
    }
}
