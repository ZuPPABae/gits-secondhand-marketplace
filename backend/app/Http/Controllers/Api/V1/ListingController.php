<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ListingStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ListingDetailResource;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class ListingController extends Controller
{
    /**
     * Tampilkan daftar listing publik dengan pencarian, filter, pengurutan, dan paginasi.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Listing::query();

        // 1. Pencarian berdasarkan judul (menggunakan trigram/ILIKE di PostgreSQL)
        if ($request->filled('q')) {
            $query->search($request->input('q'));
        }

        // 2. Filter berdasarkan slug kategori
        if ($request->filled('category')) {
            $categorySlug = $request->input('category');
            $query->whereHas('category', function (Builder $categoryQuery) use ($categorySlug) {
                $categoryQuery->where('slug', $categorySlug);
            });
        }

        // 3. Filter berdasarkan kondisi barang (new, like_new, good, fair)
        if ($request->filled('condition')) {
            $query->where('condition', $request->input('condition'));
        }

        // 4. Filter status: default 'available' jika tidak ditentukan
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        } else {
            $query->where('status', ListingStatus::Available);
        }

        // 5. Pengurutan data (sort)
        match ($request->input('sort')) {
            'oldest' => $query->orderBy('created_at', 'asc'),
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        // 6. Eager loading untuk mencegah masalah query N+1
        // Nomor telepon dan email penjual sengaja tidak diseleksi demi privasi pada daftar
        $query->with([
            'category',
            'images',
            'user:id,name,location',
        ]);

        // 7. Paginasi: default 12, batas maksimal 50
        $perPage = (int) $request->input('per_page', 12);
        if ($perPage < 1) {
            $perPage = 12;
        } elseif ($perPage > 50) {
            $perPage = 50;
        }

        $listings = $query->paginate($perPage)->withQueryString();

        return ListingResource::collection($listings);
    }

    /**
     * Tampilkan detail lengkap suatu barang (dicache di Redis dengan TTL pendek 5 menit).
     */
    public function show(int|string $id): JsonResponse
    {
        $cacheKey = "listings:detail:{$id}";

        $listing = Cache::get($cacheKey);

        if (! $listing) {
            $listing = Listing::with([
                'category',
                'images',
                'user:id,name,phone,location',
            ])->find($id);

            if (! $listing) {
                return response()->json([
                    'message' => 'Barang tidak ditemukan.',
                ], 404);
            }

            Cache::put($cacheKey, $listing, now()->addMinutes(5));
        }

        return response()->json([
            'data' => new ListingDetailResource($listing),
        ]);
    }
}
