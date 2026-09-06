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
            550px circle at
            ${x * 100}%
            ${y * 100}%,
            rgba(30, 30, 190, ${mode.current === 'dark' ? 0.25 : 0.35}),
            transparent 50%
    )`}
></div>
