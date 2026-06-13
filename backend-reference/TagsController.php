<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;

class TagsController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => Tag::count(),
            'used' => Tag::has('articles')->count(),
            'unused' => Tag::doesntHave('articles')->count(),
            'top_tag' => Tag::withCount('articles')
                ->orderByDesc('articles_count')
                ->first(),
        ]);
    }
}
