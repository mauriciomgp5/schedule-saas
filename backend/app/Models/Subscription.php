<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'plan',
        'status',
        'starts_at',
        'ends_at',
        'canceled_at',
        'stripe_subscription_id',
        'stripe_customer_id',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'canceled_at' => 'datetime',
    ];

    const PLAN_BASIC = 'basic';

    const PLAN_PROFESSIONAL = 'professional';

    const PLAN_ENTERPRISE = 'enterprise';

    const STATUS_ACTIVE = 'active';

    const STATUS_CANCELED = 'canceled';

    const STATUS_EXPIRED = 'expired';

    /**
     * Relacionamento com tenant
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
