<script lang="ts">
    import { page } from '$app/state';
</script>

<div class="hero min-h-screen">
    <div class="hero-content flex-col lg:flex-row">
        <div>
            <h1 class="text-5xl font-bold text-center" style="font-size: 92px;">
                {page.status}
            </h1>
            <h1 class="text-2xl text-center">{page.error!.message}</h1>
            <p class="py-6 text-center">You are not supposed to be here... go back?</p>
            <center>
                <!-- eslint-disable-next-line -->
                <a href="/"
                    ><button class="btn bg-ms-main px-14 shadow-xl shadow-primary/20">
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
                                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                            />
                        </svg>
                        Dashboard</button
                    >
                </a>
            </center>
        </div>
    </div>
</div>
