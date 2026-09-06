<script lang="ts">
    import Background from '$lib/components/Background.svelte';
    import Stats from '$lib/components/Stats.svelte';
    import { mode } from 'mode-watcher';
    import { goto } from '$app/navigation';

    import myshare_black from '$lib/assets/myshare_black.png';
    import myshare_white from '$lib/assets/myshare_white.png';

    let email: string;
    let username: string;
    let password: string;
    let traceback: string | null = null;

    let authType: 'login' | 'register' = 'login';

    async function postToServer() {
        const userData = {
            email,
            username,
            password,
        };
        try {
            if (authType === 'register') {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData),
                });
                if (!response.ok) {
                    if (response.status === 400) {
                        const errorData = await response.json();
                        traceback = `Error: ${errorData.error}`;
                    } else {
                        traceback = `Error: ${response.status} ${response.statusText}`;
                    }
                    traceback = `Error: ${response.status} ${response.statusText}`;
                }
                const responseData = await response.json();
                // TODO: Return session token and redirect to home page
            } else {
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData),
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        const errorData = await response.json();
                        traceback = `Error: ${errorData.error}`;
                    } else {
                        traceback = `Error: ${response.status} ${response.statusText}`;
                    }
                    return;
                }
                const data = await response.json();

                localStorage.setItem('token', data.token);
                goto('/');
            }
        } catch (error) {
            console.error('Error posting to server:', error);
            traceback = `Error: ${error}`;
        }
    }
</script>

<Background />

<div
    class="hero bg-base-200 min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden"
>
    <div class="flex flex-col gap-4 items-center relative z-10">
        <div
            class="card card-border bg-base-300/80 backdrop-blur-2xl border-base-100 w-96 shadow-xl"
        >
            <div class="card-body">
                <div
                    class="container"
                    style="
                        display: grid;
                        align-items: center;
                        grid-template-columns: 1fr 1fr 1fr;
                        column-gap: 2px;
                        padding: 8px;
                    "
                >
                    <img
                        src={mode.current == 'dark' ? myshare_white : myshare_black}
                        style="height: 64px; width: 64px"
                        alt="myshare logo"
                    />
                    <h2 class="text-2xl font-bold py-2">Login</h2>
                </div>

                <input
                    id="email"
                    placeholder="Email"
                    class="input input-bordered mt-2 bg-base-200/60 backdrop-blur-sm"
                    bind:value={email}
                />
                {#if authType == 'register'}
                    <input
                        id="username"
                        placeholder="Username"
                        class="input input-bordered mt-2 bg-base-200/60 backdrop-blur-sm"
                        bind:value={username}
                    />
                {/if}
                <input
                    id="pw"
                    type="password"
                    placeholder="Password"
                    class="input input-bordered p-4 mt-2 bg-base-200/60 backdrop-blur-sm"
                    bind:value={password}
                />
                <button
                    class="btn btn-primary mt-4 shadow-lg shadow-primary/20"
                    style="padding: 20px"
                    id="login"
                    type="submit"
                    onclick={postToServer}
                >
                    Login
                </button>
                {#if traceback}
                    <p class="text-red-600 dark:text-red-400 text-center mt-2">{traceback}</p>
                {/if}
                <div class="divider"></div>
                <center>
                    {#if authType == 'login'}
                        <p2 class="text-center"
                            >Don't have an account?
                            <a class="link" onclick={() => (authType = 'register')}>Register!</a>
                        </p2>
                    {:else}
                        <p2 class="text-center"
                            >Already have an account?
                            <a class="link" onclick={() => (authType = 'login')}>Login!</a>
                        </p2>
                    {/if}
                </center>
            </div>
        </div>

        <Stats />
    </div>
</div>
