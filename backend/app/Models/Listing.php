<?php

namespace App\Models;

use App\Enums\ListingCondition;
use App\Enums\ListingStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;

class Listing extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $guarded = [
        'id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'condition' => ListingCondition::class,
            'status' => ListingStatus::class,
        ];
    }

    /**
     * Penjual pemilik listing.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Kategori listing.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Seluruh foto listing, diurutkan berdasarkan position.
     *
     * @return HasMany<ListingImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(ListingImage::class)->orderBy('position');
    }

    /**
     * Foto utama (urutan pertama / posisi terkecil).
     *
     * @return HasOne<ListingImage, $this>
     */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(ListingImage::class)->oldestOfMany('position');
    }

    /**
     * Scope untuk listing yang masih tersedia.
     *
     * @param  Builder<$this>  $query
     */
    public function scopeAvailable(Builder $query): void
    {
        $query->where('status', ListingStatus::Available);
    }

    /**
     * Scope pencarian judul menggunakan ILIKE / trigram index di PostgreSQL.
     *
     * @param  Builder<$this>  $query
     */
    public function scopeSearch(Builder $query, ?string $term): void
    {
        if (! $term) {
            return;
        }

        if (DB::getDriverName() === 'pgsql') {
            $query->whereRaw('title ILIKE ?', ['%'.$term.'%']);
        } else {
            $query->where('title', 'like', '%'.$term.'%');
        }
    }
}
