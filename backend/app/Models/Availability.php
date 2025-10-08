<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Availability extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'service_id',
        'day_of_week',
        'start_time',
        'end_time',
        'type',
        'exception_date',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'exception_date' => 'date',
    ];

    /**
     * Tenant ao qual a disponibilidade pertence
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Serviço específico (opcional)
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
