<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ThemeController extends Controller
{
    /**
     * Obter tema do tenant
     */
    public function show(): JsonResponse
    {
        $theme = Theme::firstOrCreate(
            ['tenant_id' => auth()->user()->tenant_id],
            [
                'name' => 'default',
                'primary_color' => '#3b82f6',
                'secondary_color' => '#8b5cf6',
                'accent_color' => '#10b981',
                'background_color' => '#ffffff',
                'text_color' => '#1f2937',
            ]
        );

        return response()->json($theme);
    }

    /**
     * Atualizar tema
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'primary_color' => 'sometimes|string|max:7',
            'secondary_color' => 'sometimes|string|max:7',
            'accent_color' => 'sometimes|string|max:7',
            'background_color' => 'sometimes|string|max:7',
            'text_color' => 'sometimes|string|max:7',
            'custom_css' => 'nullable|string',
        ]);

        $theme = Theme::updateOrCreate(
            ['tenant_id' => auth()->user()->tenant_id],
            $validated
        );

        return response()->json($theme);
    }

    /**
     * Upload de logo
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $theme = Theme::firstOrCreate(
            ['tenant_id' => auth()->user()->tenant_id]
        );

        if ($theme->logo) {
            Storage::disk('public')->delete($theme->logo);
        }

        $path = $request->file('logo')->store('logos', 'public');
        $theme->update(['logo' => $path]);

        return response()->json([
            'logo' => Storage::url($path),
        ]);
    }

    /**
     * Upload de favicon
     */
    public function uploadFavicon(Request $request): JsonResponse
    {
        $request->validate([
            'favicon' => 'required|image|mimes:ico,png|max:512',
        ]);

        $theme = Theme::firstOrCreate(
            ['tenant_id' => auth()->user()->tenant_id]
        );

        if ($theme->favicon) {
            Storage::disk('public')->delete($theme->favicon);
        }

        $path = $request->file('favicon')->store('favicons', 'public');
        $theme->update(['favicon' => $path]);

        return response()->json([
            'favicon' => Storage::url($path),
        ]);
    }
}
