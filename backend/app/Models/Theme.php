<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Theme extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'name',
        'primary_color',
        'secondary_color',
        'accent_color',
        'background_color',
        'text_color',
        'logo',
        'favicon',
        'custom_css',
    ];

    /**
     * Relacionamento com tenant
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
