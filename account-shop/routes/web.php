<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| This application is API-only. All routes are handled by the frontend.
| The backend only serves API endpoints.
|
*/

// API Info page
Route::get('/', function () {
    return view('api-info');
});

// Catch all other routes and redirect to frontend
Route::fallback(function () {
    $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
    return redirect($frontendUrl . request()->getPathInfo());
});
