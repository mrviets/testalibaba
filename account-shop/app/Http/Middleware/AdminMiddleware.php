<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Kiểm tra user đã đăng nhập và có role admin
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return redirect('/login')->with('error', 'Bạn không có quyền truy cập trang này');
        }

        return $next($request);
    }
}
