<?php

namespace App\Http\Resources;

use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Listing
 */
class ListingDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $sellerPhone = $this->user?->phone;
        $priceFormatted = 'Rp '.number_format($this->price, 0, ',', '.');
        $whatsappMessage = "Halo, saya tertarik dengan *{$this->title}* seharga {$priceFormatted} di marketplace komunitas. Apakah masih tersedia?";
        $whatsappUrl = $sellerPhone
            ? 'https://wa.me/'.$sellerPhone.'?text='.rawurlencode($whatsappMessage)
            : null;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price,
            'condition' => $this->condition->value,
            'condition_label' => $this->condition->label(),
            'location' => $this->location,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'user' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'location' => $this->user?->location,
                'phone' => $sellerPhone,
                'whatsapp_url' => $whatsappUrl,
            ],
            'images' => ListingImageResource::collection($this->whenLoaded('images')),
            'primary_image_url' => $this->relationLoaded('images')
                ? $this->images->first()?->url
                : ($this->relationLoaded('primaryImage') ? $this->primaryImage?->url : null),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
