<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'domain' => $this->faker->unique()->slug(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'timezone' => 'America/Sao_Paulo',
            'locale' => 'pt_BR',
            'is_active' => true,
            'subscription_status' => 'trial',
            'trial_ends_at' => now()->addDays(14),
        ];
    }
}
