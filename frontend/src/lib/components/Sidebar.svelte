<script lang="ts">
    import type { Snippet } from 'svelte';
    import { onMount } from 'svelte';

    let { children }: { children?: Snippet } = $props();
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
        window.location.href = '/auth';
    }
</script>

<div class="drawer min-h-screen">
    <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col min-h-screen">
        <div
            class="flex items-center gap-2 p-4 border-b border-base-content/10 bg-base-100/50 backdrop-blur-md sticky top-0 z-30"
        >
            <label for="my-drawer-2" class="btn btn-square btn-ghost" aria-label="Open menu">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block h-6 w-6 stroke-current"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                </svg>
            </label>
            <span class="font-bold text-lg">MyShare</span>
        </div>

        <main class="flex-1 p-6">
            {@render children?.()}
        </main>
    </div>
    <div class="drawer-side z-40">
        <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
        <aside
            class="menu bg-base-200/90 backdrop-blur-2xl border-r border-base-content/10 text-base-content min-h-full w-80 p-4 flex flex-col justify-between"
        >
            <div class="space-y-4">
                <div class="flex items-center justify-between p-2">
                    <h3 id="hellousername" class="text-lg font-bold">
                        {getGreeting()}{username ? `, ${username}` : ''}
                    </h3>
                    <label
                        for="my-drawer-2"
                        class="btn btn-sm btn-circle btn-ghost"
                        aria-label="Close sidebar"
                    >
                        ✕
                    </label>
                </div>

                <label
                    for="my_modal_6"
                    class="btn btn-primary shadow-md shadow-primary/20 font-bold w-full"
                >
                    Create Note
                </label>

                <ul class="menu p-0 gap-1">
                    <li></li>
                    <li></li>
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
