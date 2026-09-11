<script lang="ts">
    let { onclick }: { onclick?: () => void } = $props();
</script>

<button
    type="button"
    class="fixed bottom-6 right-6 z-0 btn btn-circle btn-lg btn-primary shadow-xl hover:scale-105 active:scale-95 transition-all"
    aria-label="Create Note"
    {onclick}
>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
    >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
</button>
