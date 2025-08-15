<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        //
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // Log thay đổi số dư
        if ($user->isDirty('balance')) {
            $oldBalance = $user->getOriginal('balance');
            $newBalance = $user->balance;
            $change = $newBalance - $oldBalance;

            \Log::info('Balance changed', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'old_balance' => $oldBalance,
                'new_balance' => $newBalance,
                'change' => $change,
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
