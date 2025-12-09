<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Database\Factories\TenantFactory;

class Tenant extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return TenantFactory::new();
    }

    protected $fillable = [
        'name',
        'domain',
        'email',
        'phone',
        'timezone',
        'locale',
        'is_active',
        'subscription_status',
        'trial_ends_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'trial_ends_at' => 'datetime',
    ];

    /**
     * Relacionamento com usuários
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Relacionamento com tema
     */
    public function theme(): HasOne
    {
        return $this->hasOne(Theme::class);
    }

    /**
     * Relacionamento com assinatura
     */
    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class);
    }

    /**
     * Relacionamento com agendamentos
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Relacionamento com serviços
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    /**
     * Relacionamento com clientes
     */
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }
}
