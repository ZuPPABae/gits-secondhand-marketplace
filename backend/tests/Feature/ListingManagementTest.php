<?php

namespace Tests\Feature;

use App\Enums\ListingStatus;
use App\Models\Category;
use App\Models\Listing;
use App\Models\ListingImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ListingManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        Storage::fake(config('filesystems.default'));
    }

    public function test_unauthenticated_user_cannot_create_update_delete_listing_returns_401(): void
    {
        $listing = Listing::factory()->create();

        $this->postJson('/api/v1/listings', [])->assertStatus(401);
        $this->putJson('/api/v1/listings/'.$listing->id, [])->assertStatus(401);
        $this->patchJson('/api/v1/listings/'.$listing->id.'/status', ['status' => 'sold'])->assertStatus(401);
        $this->deleteJson('/api/v1/listings/'.$listing->id)->assertStatus(401);
        $this->getJson('/api/v1/me/listings')->assertStatus(401);
    }

    public function test_user_can_create_listing_with_images_successfully(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        $file1 = UploadedFile::fake()->image('sepeda1.jpg', 800, 600)->size(1000);
        $file2 = UploadedFile::fake()->image('sepeda2.webp', 800, 600)->size(800);

        $payload = [
            'category_id' => $category->id,
            'title' => 'Sepeda Balap Vintage Road Bike',
            'description' => 'Kondisi mulus terawat, siap gowes santai.',
            'price' => 3500000,
            'condition' => 'good',
            'location' => 'Bandung Kota',
            'images' => [$file1, $file2],
            // user_id spoofing attempt: harus diabaikan dan diganti dengan user aktif
            'user_id' => 99999,
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/listings', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Listing barang berhasil dipasang.',
                'data' => [
                    'title' => 'Sepeda Balap Vintage Road Bike',
                    'price' => 3500000,
                    'condition' => 'good',
                    'condition_label' => 'Bagus / Mulus',
                    'status' => 'available',
                    'user' => [
                        'id' => $user->id,
                    ],
                ],
            ]);

        $createdListingId = $response->json('data.id');

        $this->assertDatabaseHas('listings', [
            'id' => $createdListingId,
            'user_id' => $user->id,
            'title' => 'Sepeda Balap Vintage Road Bike',
            'status' => ListingStatus::Available->value,
        ]);

        $this->assertDatabaseCount('listing_images', 2);

        $images = ListingImage::where('listing_id', $createdListingId)->get();
        foreach ($images as $img) {
            Storage::disk(config('filesystems.default'))->assertExists($img->path);
        }
    }

    public function test_create_listing_validation_fails_with_invalid_file_type_and_large_size(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        // 1. Bukan file gambar (misal file text/pdf)
        $invalidFile = UploadedFile::fake()->create('dokumen.pdf', 500, 'application/pdf');
        $resType = $this->actingAs($user, 'sanctum')->postJson('/api/v1/listings', [
            'category_id' => $category->id,
            'title' => 'Barang Uji',
            'description' => 'Deskripsi',
            'price' => 100000,
            'condition' => 'good',
            'location' => 'Jakarta',
            'images' => [$invalidFile],
        ]);
        $resType->assertStatus(422)
            ->assertJsonValidationErrors(['images.0']);

        // 2. File terlalu besar (> 2 MB = 2048 KB)
        $largeFile = UploadedFile::fake()->image('besar.jpg')->size(2500);
        $resSize = $this->actingAs($user, 'sanctum')->postJson('/api/v1/listings', [
            'category_id' => $category->id,
            'title' => 'Barang Uji 2',
            'description' => 'Deskripsi',
            'price' => 100000,
            'condition' => 'good',
            'location' => 'Jakarta',
            'images' => [$largeFile],
        ]);
        $resSize->assertStatus(422)
            ->assertJsonValidationErrors(['images.0']);

        // 3. Lebih dari 5 foto
        $sixFiles = [
            UploadedFile::fake()->image('f1.jpg'),
            UploadedFile::fake()->image('f2.jpg'),
            UploadedFile::fake()->image('f3.jpg'),
            UploadedFile::fake()->image('f4.jpg'),
            UploadedFile::fake()->image('f5.jpg'),
            UploadedFile::fake()->image('f6.jpg'),
        ];
        $resMax = $this->actingAs($user, 'sanctum')->postJson('/api/v1/listings', [
            'category_id' => $category->id,
            'title' => 'Barang Uji 3',
            'description' => 'Deskripsi',
            'price' => 100000,
            'condition' => 'good',
            'location' => 'Jakarta',
            'images' => $sixFiles,
        ]);
        $resMax->assertStatus(422)
            ->assertJsonValidationErrors(['images']);
    }

    public function test_owner_can_update_listing_data(): void
    {
        $user = User::factory()->create();
        $listing = Listing::factory()->create([
            'user_id' => $user->id,
            'title' => 'Judul Lama',
            'price' => 100000,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/listings/'.$listing->id, [
                'title' => 'Judul Baru Diperbarui',
                'price' => 150000,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Listing berhasil diperbarui.',
                'data' => [
                    'id' => $listing->id,
                    'title' => 'Judul Baru Diperbarui',
                    'price' => 150000,
                ],
            ]);

        $this->assertDatabaseHas('listings', [
            'id' => $listing->id,
            'title' => 'Judul Baru Diperbarui',
            'price' => 150000,
        ]);
    }

    public function test_owner_can_add_and_delete_images_on_update(): void
    {
        $user = User::factory()->create();
        $listing = Listing::factory()->create(['user_id' => $user->id]);

        $disk = config('filesystems.default');
        $fileOld = UploadedFile::fake()->image('lama.jpg')->store('listings', $disk);
        $oldImage = ListingImage::create([
            'listing_id' => $listing->id,
            'path' => $fileOld,
            'position' => 0,
        ]);

        Storage::disk($disk)->assertExists($fileOld);

        $newFile = UploadedFile::fake()->image('baru.png');

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/listings/'.$listing->id, [
                'delete_image_ids' => [$oldImage->id],
                'images' => [$newFile],
            ]);

        $response->assertStatus(200);

        // Foto lama terhapus dari storage dan database
        Storage::disk($disk)->assertMissing($fileOld);
        $this->assertDatabaseMissing('listing_images', ['id' => $oldImage->id]);

        // Foto baru masuk
        $this->assertDatabaseCount('listing_images', 1);
    }

    public function test_non_owner_cannot_update_listing_returns_403(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $listing = Listing::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($stranger, 'sanctum')
            ->putJson('/api/v1/listings/'.$listing->id, [
                'title' => 'Mencoba Bajak Listing',
            ]);

        $response->assertStatus(403);
    }

    public function test_owner_can_update_listing_status(): void
    {
        $user = User::factory()->create();
        $listing = Listing::factory()->create([
            'user_id' => $user->id,
            'status' => ListingStatus::Available,
        ]);

        // Ubah status ke sold
        $resSold = $this->actingAs($user, 'sanctum')
            ->patchJson('/api/v1/listings/'.$listing->id.'/status', [
                'status' => 'sold',
            ]);

        $resSold->assertStatus(200)
            ->assertJson([
                'message' => 'Status listing berhasil diubah.',
                'data' => [
                    'status' => 'sold',
                    'status_label' => 'Terjual',
                ],
            ]);

        $this->assertDatabaseHas('listings', [
            'id' => $listing->id,
            'status' => ListingStatus::Sold->value,
        ]);

        // Ubah status kembali ke available
        $resAvailable = $this->actingAs($user, 'sanctum')
            ->patchJson('/api/v1/listings/'.$listing->id.'/status', [
                'status' => 'available',
            ]);

        $resAvailable->assertStatus(200)
            ->assertJson([
                'data' => [
                    'status' => 'available',
                    'status_label' => 'Tersedia',
                ],
            ]);
    }

    public function test_non_owner_cannot_update_listing_status_returns_403(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $listing = Listing::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($stranger, 'sanctum')
            ->patchJson('/api/v1/listings/'.$listing->id.'/status', [
                'status' => 'sold',
            ]);

        $response->assertStatus(403);
    }

    public function test_owner_can_delete_listing_and_files_are_deleted_from_storage(): void
    {
        $user = User::factory()->create();
        $listing = Listing::factory()->create(['user_id' => $user->id]);

        $disk = config('filesystems.default');
        $storedPath = UploadedFile::fake()->image('hapus.jpg')->store('listings', $disk);
        ListingImage::create([
            'listing_id' => $listing->id,
            'path' => $storedPath,
            'position' => 0,
        ]);

        Storage::disk($disk)->assertExists($storedPath);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/v1/listings/'.$listing->id);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Listing berhasil dihapus.',
            ]);

        $this->assertDatabaseMissing('listings', ['id' => $listing->id]);
        $this->assertDatabaseCount('listing_images', 0);

        // WAJIB: File terhapus dari disk
        Storage::disk($disk)->assertMissing($storedPath);
    }

    public function test_non_owner_cannot_delete_listing_returns_403(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $listing = Listing::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($stranger, 'sanctum')
            ->deleteJson('/api/v1/listings/'.$listing->id);

        $response->assertStatus(403);
    }

    public function test_cache_is_cleared_after_listing_update_delete_and_status_change(): void
    {
        $user = User::factory()->create();
        $listing = Listing::factory()->create(['user_id' => $user->id]);

        $cacheKey = "listings:detail:{$listing->id}";

        // 1. Panggil GET detail untuk menghangatkan cache
        $this->getJson('/api/v1/listings/'.$listing->id)->assertStatus(200);
        $this->assertTrue(Cache::has($cacheKey));

        // 2. Update listing -> cache harus terhapus
        $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/listings/'.$listing->id, ['title' => 'Judul Baru'])
            ->assertStatus(200);
        $this->assertFalse(Cache::has($cacheKey));

        // 3. Hangatkan kembali lalu ubah status -> cache harus terhapus
        $this->getJson('/api/v1/listings/'.$listing->id)->assertStatus(200);
        $this->assertTrue(Cache::has($cacheKey));

        $this->actingAs($user, 'sanctum')
            ->patchJson('/api/v1/listings/'.$listing->id.'/status', ['status' => 'sold'])
            ->assertStatus(200);
        $this->assertFalse(Cache::has($cacheKey));

        // 4. Hangatkan kembali lalu delete listing -> cache harus terhapus
        $this->getJson('/api/v1/listings/'.$listing->id)->assertStatus(200);
        $this->assertTrue(Cache::has($cacheKey));

        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/v1/listings/'.$listing->id)
            ->assertStatus(200);
        $this->assertFalse(Cache::has($cacheKey));
    }

    public function test_user_can_view_my_listings_including_sold(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        // 2 listing available & 1 sold milik user
        Listing::factory()->count(2)->create([
            'user_id' => $user->id,
            'status' => ListingStatus::Available,
        ]);
        Listing::factory()->create([
            'user_id' => $user->id,
            'status' => ListingStatus::Sold,
        ]);

        // 1 listing milik user lain
        Listing::factory()->create([
            'user_id' => $otherUser->id,
            'status' => ListingStatus::Available,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/me/listings');

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));

        $statuses = array_column($response->json('data'), 'status');
        $this->assertContains('available', $statuses);
        $this->assertContains('sold', $statuses);
    }
}
