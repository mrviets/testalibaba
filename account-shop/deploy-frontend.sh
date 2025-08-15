#!/bin/bash

# Deploy Frontend Next.js
echo "🚀 Deploy Frontend Next.js..."

# Kiểm tra thư mục
if [ ! -f "package.json" ]; then
    echo "❌ Không tìm thấy package.json. Hãy chạy script trong thư mục Next.js."
    exit 1
fi

# 1. Tạo file .env.local production
echo "⚙️ Tạo file .env.local production..."
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://api.dinhquocviet.space
NODE_ENV=production
EOF

# 2. Cài đặt dependencies (bao gồm devDependencies cho build)
echo "📥 Cài đặt npm dependencies..."
npm install

# 3. Kiểm tra và tạo các file components cần thiết
echo "🔧 Kiểm tra và tạo components..."
mkdir -p src/components/ui
mkdir -p src/contexts

# Tạo AuthContext nếu chưa có
if [ ! -f "src/contexts/AuthContext.tsx" ]; then
    echo "📝 Tạo AuthContext..."
    cat > src/contexts/AuthContext.tsx << 'EOF'
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { authAPI } from '@/lib/api';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const response = await authAPI.user();
        setUser(response.data.data || response.data);
      } catch (error) {
        Cookies.remove('token');
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { token, user: userData } = response.data.data || response.data;
    Cookies.set('token', token);
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
EOF
fi

# Tạo Layout component nếu chưa có
if [ ! -f "src/components/Layout.tsx" ]; then
    echo "📝 Tạo Layout component..."
    cat > src/components/Layout.tsx << 'EOF'
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function Layout({ children, requireAuth = true }: LayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
EOF
fi

# Tạo Card component nếu chưa có
if [ ! -f "src/components/ui/Card.tsx" ]; then
    echo "📝 Tạo Card component..."
    cat > src/components/ui/Card.tsx << 'EOF'
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-200", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardProps) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  );
}
EOF
fi

# Tạo Button component nếu chưa có
if [ ! -f "src/components/ui/Button.tsx" ]; then
    echo "📝 Tạo Button component..."
    cat > src/components/ui/Button.tsx << 'EOF'
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function Button({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
    ghost: "hover:bg-gray-100"
  };
  
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
EOF
fi

# Tạo utils file nếu chưa có
if [ ! -f "src/lib/utils.ts" ]; then
    echo "📝 Tạo utils file..."
    cat > src/lib/utils.ts << 'EOF'
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}
EOF
fi

# 4. Build production
echo "🔨 Build production..."
npm run build

# 5. Tạo PM2 ecosystem file
echo "📦 Tạo PM2 ecosystem file..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'account-shop-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/dinhquocviet.space',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/account-shop-frontend-error.log',
    out_file: '/var/log/pm2/account-shop-frontend-out.log',
    log_file: '/var/log/pm2/account-shop-frontend-combined.log',
    time: true
  }]
};
EOF

# 6. Tạo thư mục logs
echo "📁 Tạo thư mục logs..."
sudo mkdir -p /var/log/pm2
sudo chown accountshop:accountshop /var/log/pm2

# 7. Khởi động với PM2
echo "🚀 Khởi động với PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 8. Cấu hình quyền thư mục
echo "🔒 Cấu hình quyền thư mục..."
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod +x .next/standalone/server.js

echo ""
echo "✅ Deploy Frontend hoàn thành!"
echo ""
echo "📋 Checklist sau deploy:"
echo "1. ✅ Dependencies đã được cài đặt"
echo "2. ✅ Components đã được tạo"
echo "3. ✅ Production build đã được tạo"
echo "4. ✅ PM2 process đã được khởi động"
echo "5. ✅ Quyền thư mục đã được cấu hình"
echo ""
echo "🔧 Bước tiếp theo:"
echo "1. Kiểm tra PM2 status: pm2 status"
echo "2. Xem logs: pm2 logs account-shop-frontend"
echo "3. Cấu hình Nginx proxy"
echo ""
echo "🌐 Truy cập:"
echo "- Frontend: https://dinhquocviet.space"
echo "- PM2 Dashboard: pm2 monit"
echo ""
echo "📝 Ghi chú:"
echo "- PM2 logs: /var/log/pm2/"
echo "- Restart: pm2 restart account-shop-frontend"
echo "- Stop: pm2 stop account-shop-frontend"
