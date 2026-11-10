<?php

namespace Tests\Feature;

use App\Enums\ListingStatus;
use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_public_user_profile_with_available_listings(): void
    {
        $user = User::factory()->create([
            'name' => 'Pak Joko Widodo',
            'email' => 'joko.secret@domain.com',
            'phone' => '6281299998888',
            'location' => 'Solo, Jawa Tengah',
        ]);

        $category = Category::factory()->create();

        // 2 listing available
        Listing::factory()->count(2)->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'status' => ListingStatus::Available,
        ]);

        // 1 listing sold (tidak boleh tampil di profil publik)
        Listing::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'status' => ListingStatus::Sold,
        ]);

        $response = $this->getJson('/api/v1/users/'.$user->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'location',
                    'created_at',
                ],
                'listings' => [
                    'data' => [
                        '*' => [
                            'id',
                            'title',
                            'price',
                            'condition',
                            'status',
                        ],
                    ],
                    'links',
                    'meta',
                ],
            ]);

        $userData = $response->json('user');
        $this->assertSame($user->id, $userData['id']);
        $this->assertSame('Pak Joko Widodo', $userData['name']);
        $this->assertSame('Solo, Jawa Tengah', $userData['location']);

        // WAJIB: Tanpa email dan tanpa nomor telepon pada profil publik
        $this->assertArrayNotHasKey('email', $userData);
        $this->assertArrayNotHasKey('phone', $userData);

        // Hanya 2 listing available yang tampil
        $listingsData = $response->json('listings.data');
        $this->assertCount(2, $listingsData);
        foreach ($listingsData as $item) {
            $this->assertSame('available', $item['status']);
        }
    }

    public function test_public_user_profile_returns_404_when_user_not_found(): void
    {
        $response = $this->getJson('/api/v1/users/999999');

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Pengguna tidak ditemukan.',
            ]);
    }
}
