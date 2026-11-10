<?php

namespace App\Enums;

enum ListingCondition: string
{
    case New = 'new';
    case LikeNew = 'like_new';
    case Good = 'good';
    case Fair = 'fair';

    /**
     * Label representasi kondisi dalam Bahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::New => 'Baru',
            self::LikeNew => 'Seperti Baru',
            self::Good => 'Bagus / Mulus',
            self::Fair => 'Cukup / Wajar',
        };
    }

    /**
     * Daftar seluruh nilai kondisi.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
