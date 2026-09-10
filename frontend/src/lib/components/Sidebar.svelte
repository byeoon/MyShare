<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';

    let { toggleSidebar } = $props();

    let username = $state('');

    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }

    onMount(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch('/api/email', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: token,
                },
            });
            if (res.ok) {
                const data = await res.json();
                username = data.username || '';
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    });

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        goto(resolve(`/auth`));
    }
</script>

<div class="drawer min-h-screen fixed top-0 left-0 z-50 bg-black/30">
    <div class="w-[200px] absolute left-0 top-0 h-full">
        <aside
            class="menu bg-base-200/90 backdrop-blur-2xl border-r border-base-content/10 text-base-content min-h-full w-80 p-4 flex flex-col justify-between"
        >
            <div class="space-y-4">
                <div class="flex items-center justify-between p-2">
                    <h3 id="hellousername" class="text-lg font-bold">
                        {getGreeting()}{username ? `, ${username}` : ''}
                    </h3>
                    <button
                        class="btn btn-sm btn-circle btn-ghost"
                        aria-label="Close sidebar"
                        onclick={() => {
                            toggleSidebar();
                        }}
                    >
                        ✕
                    </button>
                </div>

                <button class="btn btn-primary shadow-md shadow-primary/20 font-bold w-full">
                    New Note
                </button>
                <div class="divider"></div>

                <ul class="menu p-0 gap-1">
                    <button class="btn btn-neutral font-bold w-full"> Test Button </button>
                </ul>
            </div>

            <div class="pt-4 border-t border-base-content/10">
                <button
                    type="button"
                    class="btn btn-ghost text-error hover:bg-error/10 w-full justify-start font-medium"
                    onclick={logout}
                >
                    Logout
                </button>
            </div>
        </aside>
    </div>
</div>
