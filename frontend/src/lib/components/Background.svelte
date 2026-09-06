<script lang="ts">
    import { mode } from 'mode-watcher';

    let x = 0.5;
    let y = 0.5;

    function updatePosition(event: MouseEvent) {
        x = event.clientX / window.innerWidth;
        y = event.clientY / window.innerHeight;
    }
</script>

<svelte:window onmousemove={updatePosition} />
<div
    class="fixed z-10 inset-0 pointer-events-none"
    role="presentation"
    style:background={`
        radial-gradient(
            600px circle at
            ${x * 100}%
            ${y * 100}%,
            rgba(30, 33, 189, ${mode.current === 'dark' ? 0.92 : 0.5}),
            transparent 60%
    )`}
></div>
