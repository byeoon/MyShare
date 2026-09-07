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
                <a href="/"><button class="btn btn-neutral px-10">Dashboard</button> </a>
            </center>
        </div>
    </div>
</div>
