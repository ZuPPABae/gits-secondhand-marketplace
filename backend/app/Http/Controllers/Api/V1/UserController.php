<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ListingResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Tampilkan profil publik pengguna beserta listing miliknya yang berstatus available.
     * Privasi: Tanpa email dan tanpa nomor telepon.
     */
    public function show(int|string $id): JsonResponse
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'message' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        $listings = $user->listings()
            ->available()
            ->with(['category', 'images', 'user:id,name,location'])
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'location' => $user->location,
                'created_at' => $user->created_at?->toISOString(),
            ],
            'listings' => ListingResource::collection($listings)->response()->getData(true),
        ]);
    }
}

