<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantSetting extends Model
{
    protected $fillable = [
        'tenant_id',
        'slot_duration',
        'interval_between_slots',
        'advance_booking_days',
        'min_booking_notice',
        'max_bookings_per_day',
        'auto_confirm_bookings',
        'allow_cancellation',
        'cancellation_notice',
        'notify_new_booking',
        'notify_cancellation',
        'notify_reminder',
        'reminder_hours',
        'primary_color',
        'secondary_color',
        'timezone',
        'locale',
        'currency',
        'social_links',
        'extra_settings',
    ];

    protected $casts = [
        'auto_confirm_bookings' => 'boolean',
        'allow_cancellation' => 'boolean',
        'notify_new_booking' => 'boolean',
        'notify_cancellation' => 'boolean',
        'notify_reminder' => 'boolean',
        'social_links' => 'array',
        'extra_settings' => 'array',
    ];

    /**
     * Tenant ao qual as configurações pertencem
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
