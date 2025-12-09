<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'tenant_name' => 'Test Business',
            'tenant_domain' => 'test-business',
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'timezone' => 'America/Sao_Paulo',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'tenant_id',
                ],
                'tenant' => [
                    'id',
                    'name',
                    'domain',
                ],
                'token',
            ]);

        $this->assertDatabaseHas('tenants', [
            'domain' => 'test-business',
            'name' => 'Test Business',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User',
        ]);
    }

    public function test_user_cannot_register_with_duplicate_domain(): void
    {
        // Criar primeiro tenant
        $this->postJson('/api/auth/register', [
            'tenant_name' => 'First Business',
            'tenant_domain' => 'duplicate-domain',
            'name' => 'First User',
            'email' => 'first@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        // Tentar criar segundo com mesmo domínio
        $response = $this->postJson('/api/auth/register', [
            'tenant_name' => 'Second Business',
            'tenant_domain' => 'duplicate-domain',
            'name' => 'Second User',
            'email' => 'second@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tenant_domain']);
    }

    public function test_user_cannot_register_with_invalid_data(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'tenant_name' => '',
            'tenant_domain' => '',
            'name' => '',
            'email' => 'invalid-email',
            'password' => '123',
            'password_confirmation' => '456',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'tenant_name',
                'tenant_domain',
                'name',
                'email',
                'password',
            ]);
    }

    public function test_user_can_login(): void
    {
        // Criar usuário primeiro
        $this->postJson('/api/auth/register', [
            'tenant_name' => 'Login Test',
            'tenant_domain' => 'login-test',
            'name' => 'Login User',
            'email' => 'login@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        // Fazer login
        $response = $this->postJson('/api/auth/login', [
            'email' => 'login@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                ],
                'token',
            ]);
    }

    public function test_user_cannot_login_with_wrong_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'wrong@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'As credenciais fornecidas estão incorretas.',
            ]);
    }
}

