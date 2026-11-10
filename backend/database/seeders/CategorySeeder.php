<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Sepeda', 'slug' => 'sepeda'],
            ['name' => 'Perkakas', 'slug' => 'perkakas'],
            ['name' => 'Hobi', 'slug' => 'hobi'],
            ['name' => 'Elektronik', 'slug' => 'elektronik'],
            ['name' => 'Rumah Tangga', 'slug' => 'rumah-tangga'],
            ['name' => 'Otomotif', 'slug' => 'otomotif'],
            ['name' => 'Olahraga', 'slug' => 'olahraga'],
            ['name' => 'Lainnya', 'slug' => 'lainnya'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                ['name' => $category['name']]
            );
        }
    }
}
