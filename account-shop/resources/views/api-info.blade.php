<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Shop API</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            width: 90%;
        }
        .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        h1 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 2rem;
        }
        .subtitle {
            color: #666;
            margin-bottom: 2rem;
            font-size: 1.1rem;
        }
        .info {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: left;
        }
        .info h3 {
            margin-top: 0;
            color: #333;
        }
        .endpoint {
            background: #e9ecef;
            padding: 0.5rem;
            border-radius: 5px;
            font-family: monospace;
            margin: 0.5rem 0;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            margin: 0.5rem;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .status {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🛍️</div>
        <h1>Account Shop API</h1>
        <div class="status">✅ API Running</div>
        <p class="subtitle">Backend API cho hệ thống bán tài khoản và tools</p>
        
        <div class="info">
            <h3>📡 API Endpoints</h3>
            <div class="endpoint">GET /api/products</div>
            <div class="endpoint">POST /api/auth/login</div>
            <div class="endpoint">POST /api/orders</div>
            <div class="endpoint">GET /api/user</div>
        </div>

        <div class="info">
            <h3>🔧 Thông tin hệ thống</h3>
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Laravel:</strong> {{ app()->version() }}</p>
            <p><strong>Environment:</strong> {{ app()->environment() }}</p>
            <p><strong>Database:</strong> Connected ✅</p>
        </div>

        <div style="margin-top: 2rem;">
            <a href="{{ env('FRONTEND_URL', 'http://localhost:3000') }}" class="btn">
                🌐 Truy cập Website
            </a>
            <a href="/api/documentation" class="btn">
                📚 API Docs
            </a>
        </div>

        <div style="margin-top: 2rem; color: #666; font-size: 0.9rem;">
            <p>🚀 Hệ thống hoạt động hoàn toàn qua API</p>
            <p>Frontend: React/Next.js | Backend: Laravel</p>
        </div>
    </div>
</body>
</html>
