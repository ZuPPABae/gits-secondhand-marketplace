<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthTest extends TestCase
{
    public function test_health_check_returns_ok(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
            ]);
    }

    public function test_laravel_up_endpoint_returns_ok(): void
    {
        $response = $this->get('/up');

        $response->assertStatus(200);
    }
}
