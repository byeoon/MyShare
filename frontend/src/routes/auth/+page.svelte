<script lang="ts">
    import './auth.css';
    import Stats from '$lib/components/Stats.svelte';
    import { mode } from 'mode-watcher';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';

    import myshare_black from '$lib/assets/myshare_black.png';
    import myshare_white from '$lib/assets/myshare_white.png';
    import Divider from '$lib/components/Divider.svelte';

    let email: string = $state('');
    let username: string = $state('');
    let password: string = $state('');
    let traceback: string | null = $state(null);

    let authType: 'login' | 'register' = $state('login');

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
                    return;
                }
                const responseData = await response.json();
                localStorage.setItem('token', responseData.token);
                goto(resolve('/'));
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
                // eslint-disable-next-line
                goto('/');
            }
        } catch (error) {
            console.error('Error posting to server:', error);
            traceback = `Error: ${error}`;
        }
    }
</script>

<div
    class="hero bg-spooky-black min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden"
>
    <div class="flex flex-col gap-4 items-center relative z-10">
        <div class="card-scene w-96">
            <div class="card-flipper" class:is-flipped={authType === 'register'}>
                <div
                    class="card-face card-front card border bg-light-black/20 backdrop-blur-2xl border-space-gray/30 w-full shadow-xl rounded-lg"
                    inert={authType === 'register'}
                >
                    <div class="card-body">
                        <div class="flex items-center gap-2.5 pb-2">
                            <img
                                src={mode.current == 'dark' ? myshare_white : myshare_black}
                                class="h-10 w-10 object-contain"
                                alt="myshare logo"
                            />
                            <h2 class="text-2xl font-bold">Login</h2>
                        </div>

                        <label class="input w-full mt-2 bg-base-200/60 backdrop-blur-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-6"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                />
                            </svg>

                            <input id="email" type="email" placeholder="Email" bind:value={email} />
                        </label>
                        <label class="input w-full mt-2 bg-base-200/60 backdrop-blur-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-6"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                                />
                            </svg>

                            <input
                                id="pw"
                                type="password"
                                placeholder="Password"
                                bind:value={password}
                            />
                        </label>
                        <button
                            class="btn mt-4 shadow-lg shadow-primary/20 bg-ms-main"
                            style="padding: 20px"
                            id="login"
                            type="submit"
                            onclick={postToServer}
                        >
                            Login
                        </button>
                        {#if traceback && authType === 'login'}
                            <p class="text-red-600 dark:text-red-400 text-center mt-2">
                                {traceback}
                            </p>
                        {/if}
                        <Divider />
                        <div class="text-center">
                            <p class="text-center">
                                Don't have an account?
                                <button
                                    type="button"
                                    class="link link-primary inline p-0 bg-transparent border-0 cursor-pointer"
                                    onclick={() => {
                                        authType = 'register';
                                        traceback = null;
                                    }}
                                >
                                    Register!
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    class="card-face card-back card border bg-light-black/20 backdrop-blur-2xl border-space-gray/30 w-full shadow-xl rounded-lg"
                    inert={authType === 'login'}
                >
                    <div class="card-body">
                        <div class="flex items-center gap-2.5 pb-2">
                            <img
                                src={mode.current == 'dark' ? myshare_white : myshare_black}
                                class="h-10 w-10 object-contain"
                                alt="myshare logo"
                            />
                            <h2 class="text-2xl font-bold">Register</h2>
                        </div>

                        <label class="input w-full mt-2 bg-base-200/60 backdrop-blur-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-6"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                />
                            </svg>

                            <input
                                id="email-register"
                                type="email"
                                placeholder="Email"
                                bind:value={email}
                            />
                        </label>
                        <label class="input w-full mt-2 bg-base-200/60 backdrop-blur-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-6"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                />
                            </svg>

                            <input
                                id="username-register"
                                placeholder="Username"
                                bind:value={username}
                            />
                        </label>
                        <label class="input w-full mt-2 bg-base-200/60 backdrop-blur-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-6"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                                />
                            </svg>

                            <input
                                id="pw-register"
                                type="password"
                                placeholder="Password"
                                bind:value={password}
                            />
                        </label>
                        <button
                            class="btn mt-4 shadow-xl shadow-primary/20 bg-ms-main"
                            style="padding: 20px"
                            id="register-btn"
                            type="submit"
                            onclick={postToServer}
                        >
                            Register
                        </button>
                        {#if traceback && authType === 'register'}
                            <p class="text-red-600 dark:text-red-400 text-center mt-2">
                                {traceback}
                            </p>
                        {/if}
                        <Divider />
                        <div class="text-center">
                            <p class="text-center">
                                Already have an account?
                                <button
                                    type="button"
                                    class="link link-primary inline p-0 bg-transparent border-0 cursor-pointer"
                                    onclick={() => {
                                        authType = 'login';
                                        traceback = null;
                                    }}
                                >
                                    Login!
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Stats />
    </div>
</div>
