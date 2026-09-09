<script lang="ts">
    import './auth.css';
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
                // eslint-disable-next-line
                const responseData = await response.json();
                // TODO: Return session token and redirect to home page
                console.log(responseData);
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
    class="hero bg-base-200 min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden"
>
    <div class="flex flex-col gap-4 items-center relative z-10">
        <div class="card-scene w-96">
            <div class="card-flipper" class:is-flipped={authType === 'register'}>
                <div
                    class="card-face card-front card card-border bg-base-300/80 backdrop-blur-2xl border-base-100 w-full shadow-xl"
                    inert={authType === 'register'}
                >
                    <div class="card-body">
                        <div class="flex items-center gap-2.5 pb-2">
                            <img
                                src={mode.current == 'dark' ? myshare_white : myshare_black}
                                class="h-8 w-8 object-contain"
                                alt="myshare logo"
                            />
                            <h2 class="text-2xl font-bold">Login</h2>
                        </div>

                        <label class="input w-full mt-2 bg-base-200/60 backdrop-blur-sm">
                            <svg
                                class="h-[1em] opacity-50"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <g
                                    stroke-linejoin="round"
                                    stroke-linecap="round"
                                    stroke-width="2.5"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                </g>
                            </svg>
                            <input id="email" type="email" placeholder="Email" bind:value={email} />
                        </label>
                        <label class="input w-full mt-2 bg-base-200/60 backdrop-blur-sm">
                            <svg
                                class="h-[1em] opacity-50"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <g
                                    stroke-linejoin="round"
                                    stroke-linecap="round"
                                    stroke-width="2.5"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </g>
                            </svg>
                            <input
                                id="pw"
                                type="password"
                                placeholder="Password"
                                bind:value={password}
                            />
                        </label>
                        <button
                            class="btn btn-primary mt-4 shadow-lg shadow-primary/20"
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
                        <div class="divider"></div>
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
                    class="card-face card-back card card-border bg-base-300/80 backdrop-blur-2xl border-base-100 w-full shadow-xl"
                    inert={authType === 'login'}
                >
                    <div class="card-body">
                        <div class="flex items-center gap-2.5 pb-2">
                            <img
                                src={mode.current == 'dark' ? myshare_white : myshare_black}
                                class="h-8 w-8 object-contain"
                                alt="myshare logo"
                            />
                            <h2 class="text-2xl font-bold">Register</h2>
                        </div>

                        <label class="input w-full mt-2 bg-base-200/60 backdrop-blur-sm">
                            <svg
                                class="h-[1em] opacity-50"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <g
                                    stroke-linejoin="round"
                                    stroke-linecap="round"
                                    stroke-width="2.5"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                </g>
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
                                class="h-[1em] opacity-50"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <g
                                    stroke-linejoin="round"
                                    stroke-linecap="round"
                                    stroke-width="2.5"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </g>
                            </svg>
                            <input
                                id="username-register"
                                placeholder="Username"
                                bind:value={username}
                            />
                        </label>
                        <label class="input w-full mt-2 bg-base-200/60 backdrop-blur-sm">
                            <svg
                                class="h-[1em] opacity-50"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <g
                                    stroke-linejoin="round"
                                    stroke-linecap="round"
                                    stroke-width="2.5"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </g>
                            </svg>
                            <input
                                id="pw-register"
                                type="password"
                                placeholder="Password"
                                bind:value={password}
                            />
                        </label>
                        <button
                            class="btn btn-primary mt-4 shadow-lg shadow-primary/20"
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
                        <div class="divider"></div>
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
