<script lang="ts">
    import './layout.css';
    import './myshare.css';
    import favicons from '$lib/utils/favicons';
    import { ModeWatcher } from 'mode-watcher';
    import Background from '$lib/components/Background.svelte';
    let { children } = $props();
</script>

<svelte:head>
    <!-- eslint-disable-next-line -->
    {#each favicons as icon}
        <link rel="icon" {...icon} />
    {/each}
</svelte:head>
<ModeWatcher track={true} />
<Background />
{@render children()}
