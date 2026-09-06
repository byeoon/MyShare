<script lang="ts">
	import './layout.css';
	import favicons from '$lib/utils/favicons';
	import { ModeWatcher } from "mode-watcher";

	let { children } = $props();
</script>

<svelte:head>
   	{#each favicons as icon}
		<link rel="icon" {...icon} />
	{/each}
</svelte:head>
<ModeWatcher track={true} />
{@render children()}
