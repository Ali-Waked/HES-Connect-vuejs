<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Appointment;
use App\Models\Article;
use App\Models\Facility;
use App\Models\JobPost;
use App\Models\Patient;
use App\Models\Staff;
use App\Models\Story;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * Copy this controller into your Laravel app at:
 * app/Http/Controllers/Api/PublicController.php
 *
 * Register routes in routes/api.php (no auth middleware):
 *
 * Route::prefix('api')->group(function () {
 *     Route::get('/stats', [PublicController::class, 'stats']);
 *     Route::get('/facilities/map', [PublicController::class, 'facilitiesMap']);
 *     Route::get('/facilities/counts-by-type', [PublicController::class, 'facilitiesCountsByType']);
 *     Route::get('/platform-overview', [PublicController::class, 'platformOverview']);
 *     Route::get('/facilities/top', [PublicController::class, 'facilitiesTop']);
 *     Route::get('/stories/latest', [PublicController::class, 'storiesLatest']);
 *     Route::get('/articles/latest', [PublicController::class, 'articlesLatest']);
 *     Route::get('/jobs/latest', [PublicController::class, 'jobsLatest']);
 *     Route::get('/doctors/top', [PublicController::class, 'doctorsTop']);
 *     Route::get('/announcements/active', [PublicController::class, 'announcementsActive']);
 * });
 */
class PublicController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'hospitals'   => Facility::where('facility_type', 'hospital')->count(),
            'doctors'     => Staff::count(),
            'pharmacies'  => Facility::where('facility_type', 'pharmacy')->count(),
            'patients'    => Patient::count(),
        ]);
    }

    public function facilitiesMap(): JsonResponse
    {
        $facilities = Facility::select('id', 'name', 'latitude', 'longitude', 'facility_type')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        return response()->json($facilities);
    }

    public function facilitiesCountsByType(): JsonResponse
    {
        $counts = Facility::select('facility_type', DB::raw('count(*) as total'))
            ->groupBy('facility_type')
            ->pluck('total', 'facility_type');

        return response()->json([
            'hospital'      => $counts['hospital'] ?? 0,
            'clinic'        => $counts['clinic'] ?? 0,
            'medical_point' => $counts['medical_point'] ?? 0,
            'pharmacy'      => $counts['pharmacy'] ?? 0,
        ]);
    }

    public function platformOverview(): JsonResponse
    {
        return response()->json([
            'total_users'             => User::count(),
            'appointments_completed'  => Appointment::where('status', 'completed')->count(),
            'articles_published'      => Article::where('status', 'published')->count(),
            'active_stories'          => Story::where('status', 'approved')->count(),
            'total_donations'         => Story::where('is_fundraising', true)->sum('collected_amount'),
        ]);
    }

    public function facilitiesTop(): JsonResponse
    {
        $limit = (int) request('limit', 6);

        $facilities = Facility::with(['organization', 'images'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->orderByDesc('reviews_avg_rating')
            ->limit($limit)
            ->get()
            ->map(fn ($f) => [
                'id'                => $f->id,
                'name'              => $f->name,
                'facility_type'     => $f->facility_type,
                'organization_name' => $f->organization?->name,
                'latitude'          => $f->latitude,
                'longitude'         => $f->longitude,
                'rating'            => round($f->reviews_avg_rating ?? 0, 1),
                'review_count'      => $f->reviews_count,
                'image'             => $f->images->first()?->path,
            ]);

        return response()->json($facilities);
    }

    public function storiesLatest(): JsonResponse
    {
        $limit = (int) request('limit', 3);

        $stories = Story::where('status', 'approved')
            ->where('is_fundraising', true)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($s) => [
                'id'               => $s->id,
                'title'            => $s->title,
                'patient_first_name' => explode(' ', $s->patient_name)[0] ?? 'Patient',
                'content_excerpt'  => str($s->content)->limit(120),
                'collected_amount' => $s->collected_amount,
                'target_amount'    => $s->target_amount,
                'cover_image'      => $s->cover_image,
            ]);

        return response()->json($stories);
    }

    public function articlesLatest(): JsonResponse
    {
        $limit = (int) request('limit', 3);

        $articles = Article::with(['author.user', 'category', 'tags'])
            ->where('status', 'published')
            ->latest('published_at')
            ->limit($limit)
            ->get()
            ->map(fn ($a) => [
                'id'           => $a->id,
                'title'        => $a->title,
                'category'     => $a->category?->name,
                'author_name'  => $a->author?->user?->name,
                'published_at' => $a->published_at?->format('M j, Y'),
                'views'        => $a->views,
                'tags'         => $a->tags->take(3)->map(fn ($t) => ['name' => $t->name, 'color' => $t->color]),
            ]);

        return response()->json($articles);
    }

    public function jobsLatest(): JsonResponse
    {
        $limit = (int) request('limit', 3);

        $jobs = JobPost::with('facility')
            ->where('status', 'approved')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($j) => [
                'id'            => $j->id,
                'facility_name' => $j->facility?->name,
                'facility_type' => $j->facility?->facility_type,
                'title'         => $j->title,
                'apply_method'  => $j->apply_method,
                'apply_value'   => $j->apply_value,
                'end_date'      => $j->end_date?->format('Y-m-d'),
            ]);

        return response()->json($jobs);
    }

    public function doctorsTop(): JsonResponse
    {
        $limit = (int) request('limit', 4);

        $doctors = Staff::with(['user.profile'])
            ->withAvg('reviews', 'rating')
            ->orderByDesc('reviews_avg_rating')
            ->limit($limit)
            ->get()
            ->map(fn ($d) => [
                'id'             => $d->id,
                'name'           => 'Dr. ' . ($d->user?->name ?? 'Unknown'),
                'specialization' => $d->specialization,
                'experience'     => $d->experience_years,
                'fee'            => $d->consultation_fee,
                'rating'         => round($d->reviews_avg_rating ?? 0, 1),
                'profile_image'  => $d->user?->profile?->profile_image,
            ]);

        return response()->json($doctors);
    }

    public function announcementsActive(): JsonResponse
    {
        $items = Announcement::where('is_active', true)
            ->latest()
            ->get()
            ->map(fn ($a) => [
                'id'      => $a->id,
                'title'   => $a->title,
                'content' => $a->content,
                'date'    => $a->created_at?->format('M j, Y'),
            ]);

        return response()->json($items);
    }
}
