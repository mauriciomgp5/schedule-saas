<?php

namespace App\Models;

use App\Traits\TenantScoped;
use Database\Factories\ServiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Service extends Model
{
    use HasFactory, TenantScoped;

    protected static function newFactory()
    {
        return ServiceFactory::new();
    }

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'duration',
        'price',
        'category',
        'is_active',
        'color',
    ];

    protected $casts = [
        'duration' => 'integer',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Relacionamento com tenant
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Relacionamento com agendamentos
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Profissionais que atendem este serviço
     */
    public function professionals(): BelongsToMany
    {
        return $this->belongsToMany(Professional::class)->withTimestamps();
    }
}
