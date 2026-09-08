<script lang="ts">
    let { toggleSidebar } = $props();
</script>


<div class="drawer-content flex flex-col w-full">
    <button id="my-drawer-2" class="drawer-toggle" aria-label="Toggle sidebar" onclick={toggleSidebar}></button>
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
</div>
