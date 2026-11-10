<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * Tampilkan seluruh kategori (dicache di Redis dengan TTL panjang 24 jam).
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = Cache::remember('categories:all', now()->addDay(), function () {
            return Category::orderBy('name')->get();
        });

        return CategoryResource::collection($categories);
    }
}
