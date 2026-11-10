<?php

namespace App\Http\Requests\Listings;

use App\Enums\ListingCondition;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreListingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'description' => ['required', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'condition' => ['required', 'string', Rule::in(ListingCondition::values())],
            'location' => ['required', 'string', 'max:255'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    /**
     * Custom message for validation errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul barang wajib diisi.',
            'category_id.required' => 'Kategori barang wajib dipilih.',
            'category_id.exists' => 'Kategori yang dipilih tidak valid.',
            'description.required' => 'Deskripsi barang wajib diisi.',
            'price.required' => 'Harga barang wajib diisi.',
            'price.integer' => 'Harga harus berupa angka bulat Rupiah.',
            'price.min' => 'Harga tidak boleh kurang dari Rp 0.',
            'condition.required' => 'Kondisi barang wajib dipilih.',
            'condition.in' => 'Kondisi barang tidak valid.',
            'location.required' => 'Lokasi COD / barang wajib diisi.',
            'images.max' => 'Maksimal 5 foto per listing.',
            'images.*.image' => 'File harus berupa gambar.',
            'images.*.mimes' => 'Format gambar harus berupa jpg, jpeg, png, atau webp.',
            'images.*.max' => 'Ukuran setiap gambar maksimal 2 MB.',
        ];
    }
}
