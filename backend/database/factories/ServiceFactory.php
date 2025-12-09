<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'duration' => $this->faker->randomElement([30, 45, 60, 90]),
            'price' => $this->faker->randomFloat(2, 20, 200),
            'category' => $this->faker->word(),
            'is_active' => true,
            'color' => $this->faker->hexColor(),
        ];
    }
}
