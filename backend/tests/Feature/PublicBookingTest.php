<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_tenant_by_domain(): void
    {
        $tenant = Tenant::factory()->create([
            'name' => 'Test Tenant',
            'domain' => 'test-tenant',
            'email' => 'test@example.com',
            'is_active' => true,
        ]);

        $response = $this->getJson("/api/public/{$tenant->domain}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $tenant->id,
                'name' => $tenant->name,
                'domain' => $tenant->domain,
            ]);
    }

    public function test_cannot_get_inactive_tenant(): void
    {
        $tenant = Tenant::factory()->create([
            'name' => 'Inactive Tenant',
            'domain' => 'inactive-tenant',
            'email' => 'inactive@example.com',
            'is_active' => false,
        ]);

        $response = $this->getJson("/api/public/{$tenant->domain}");

        $response->assertStatus(404);
    }

    public function test_can_get_services_for_tenant(): void
    {
        $tenant = Tenant::factory()->create([
            'name' => 'Services Test',
            'domain' => 'services-test',
            'email' => 'services@example.com',
            'is_active' => true,
        ]);

        $service = Service::factory()->create([
            'tenant_id' => $tenant->id,
            'is_active' => true,
        ]);

        $response = $this->getJson("/api/public/{$tenant->domain}/services");

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment([
                'id' => $service->id,
                'name' => $service->name,
            ]);
    }
}

