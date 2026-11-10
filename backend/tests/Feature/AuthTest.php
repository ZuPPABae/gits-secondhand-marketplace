<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app('cache')->flush();
        $this->withoutMiddleware(ValidateCsrfToken::class);
        $this->withHeaders([
            'Origin' => 'http://localhost:5173',
            'Referer' => 'http://localhost:5173/',
            'Accept' => 'application/json',
        ]);
    }

    public function test_csrf_cookie_endpoint_is_accessible(): void
    {
        $this->withMiddleware(ValidateCsrfToken::class);
        $response = $this->get('/sanctum/csrf-cookie');
        $response->assertStatus(204);
        $response->assertCookie('XSRF-TOKEN');
    }

    public function test_user_can_register_successfully(): void
    {
        $payload = [
            'name' => 'Budi Santoso',
            'email' => 'budi.santoso@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '6281234567890',
            'location' => 'Bandung, Jawa Barat',
        ];

        $response = $this->postJson('/api/v1/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'phone',
                    'location',
                    'created_at',
                ],
            ])
            ->assertJson([
                'message' => 'Pendaftaran akun berhasil.',
                'user' => [
                    'name' => 'Budi Santoso',
                    'email' => 'budi.santoso@example.com',
                    'phone' => '6281234567890',
                    'location' => 'Bandung, Jawa Barat',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'budi.santoso@example.com',
            'name' => 'Budi Santoso',
            'phone' => '6281234567890',
        ]);

        $this->assertAuthenticated();
    }

    public function test_register_validation_fails_with_missing_fields(): void
    {
        $response = $this->postJson('/api/v1/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password', 'phone', 'location']);
    }

    public function test_register_validation_fails_with_invalid_phone_format(): void
    {
        $payload = [
            'name' => 'Agus',
            'email' => 'agus@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '08123456789', // Harusnya berawalan 62
            'location' => 'Jakarta Selatan',
        ];

        $response = $this->postJson('/api/v1/auth/register', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_register_validation_fails_when_password_does_not_match_confirmation(): void
    {
        $payload = [
            'name' => 'Agus',
            'email' => 'agus@example.com',
            'password' => 'password123',
            'password_confirmation' => 'passwordBerbeda',
            'phone' => '6281234567890',
            'location' => 'Jakarta Selatan',
        ];

        $response = $this->postJson('/api/v1/auth/register', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_register_validation_fails_when_email_already_exists(): void
    {
        User::factory()->create([
            'email' => 'sudahada@example.com',
        ]);

        $payload = [
            'name' => 'Agus Baru',
            'email' => 'sudahada@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '6281234567890',
            'location' => 'Surabaya',
        ];

        $response = $this->postJson('/api/v1/auth/register', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_login_successfully(): void
    {
        $user = User::factory()->create([
            'email' => 'pak.budi@example.com',
            'password' => Hash::make('rahasia123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'pak.budi@example.com',
            'password' => 'rahasia123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'phone',
                    'location',
                ],
            ])
            ->assertJson([
                'message' => 'Login berhasil.',
                'user' => [
                    'id' => $user->id,
                    'email' => 'pak.budi@example.com',
                ],
            ]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_validation_fails_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'pak.budi@example.com',
            'password' => Hash::make('rahasia123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'pak.budi@example.com',
            'password' => 'passwordSalah',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertGuest();
    }

    public function test_login_validation_fails_when_fields_are_missing(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_user_can_logout_successfully(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'web')
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Berhasil keluar.',
            ]);

        $this->assertGuest('web');
    }

    public function test_unauthenticated_user_cannot_access_me_returns_401(): void
    {
        $response = $this->getJson('/api/v1/me');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_access_me(): void
    {
        $user = User::factory()->create([
            'name' => 'Pak Joko',
            'email' => 'joko@example.com',
            'phone' => '628111222333',
            'location' => 'Semarang',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/me');

        $response->assertStatus(200)
            ->assertJson([
                'user' => [
                    'id' => $user->id,
                    'name' => 'Pak Joko',
                    'email' => 'joko@example.com',
                    'phone' => '628111222333',
                    'location' => 'Semarang',
                ],
            ]);
    }

    public function test_login_is_rate_limited_returns_429(): void
    {
        // Limit is 5 per minute for IP + email
        $payload = [
            'email' => 'spam@example.com',
            'password' => 'wrongpass',
        ];

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', $payload)
                ->assertStatus(422);
        }

        // 6th attempt should return 429
        $response = $this->postJson('/api/v1/auth/login', $payload);
        $response->assertStatus(429);
    }

    public function test_register_is_rate_limited_returns_429(): void
    {
        $payload = [
            'name' => 'Spammer',
            'email' => 'spammer@example.com',
            'password' => 'pass12345',
            'password_confirmation' => 'pass12345',
            'phone' => '6281234567890',
            'location' => 'Jakarta',
        ];

        for ($i = 0; $i < 5; $i++) {
            // Rate limit evaluates IP + email
            $this->postJson('/api/v1/auth/register', $payload);
        }

        // 6th attempt should be blocked
        $response = $this->postJson('/api/v1/auth/register', $payload);
        $response->assertStatus(429);
    }
}
