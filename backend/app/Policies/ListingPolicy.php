<?php

namespace App\Policies;

use App\Models\Listing;
use App\Models\User;

class ListingPolicy
{
    /**
     * Tentukan apakah user dapat memperbarui listing.
     */
    public function update(User $user, Listing $listing): bool
    {
        return $user->id === $listing->user_id;
    }

    /**
     * Tentukan apakah user dapat menghapus listing.
     */
    public function delete(User $user, Listing $listing): bool
    {
        return $user->id === $listing->user_id;
    }

    /**
     * Tentukan apakah user dapat mengubah status listing.
     */
    public function updateStatus(User $user, Listing $listing): bool
    {
        return $user->id === $listing->user_id;
    }
}
