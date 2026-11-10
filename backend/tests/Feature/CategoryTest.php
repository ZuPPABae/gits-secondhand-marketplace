<?php

namespace Tests\Feature;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_can_get_all_categories(): void
    {
        Category::factory()->create(['name' => 'Sepeda', 'slug' => 'sepeda']);
        Category::factory()->create(['name' => 'Elektronik', 'slug' => 'elektronik']);
        Category::factory()->create(['name' => 'Perkakas', 'slug' => 'perkakas']);

        $response = $this->getJson('/api/v1/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                    ],
                ],
            ]);

        $data = $response->json('data');
        $this->assertCount(3, $data);
        // Pastikan terurut berdasarkan nama asc: Elektronik, Perkakas, Sepeda
        $this->assertSame('Elektronik', $data[0]['name']);
        $this->assertSame('Perkakas', $data[1]['name']);
        $this->assertSame('Sepeda', $data[2]['name']);
    }

    public function test_categories_are_cached(): void
    {
        Category::factory()->create(['name' => 'Sepeda', 'slug' => 'sepeda']);

        $this->assertFalse(Cache::has('categories:all'));

        $this->getJson('/api/v1/categories')->assertStatus(200);

        $this->assertTrue(Cache::has('categories:all'));
    }
}
