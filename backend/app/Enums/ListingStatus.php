<?php

namespace App\Enums;

enum ListingStatus: string
{
    case Available = 'available';
    case Sold = 'sold';

    /**
     * Label representasi status dalam Bahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::Available => 'Tersedia',
            self::Sold => 'Terjual',
        };
    }

    /**
     * Daftar seluruh nilai status.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
