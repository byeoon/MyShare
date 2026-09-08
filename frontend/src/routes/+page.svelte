<script lang="ts">
    import Sidebar from '$lib/components/Sidebar.svelte';
    import TopBar from '$lib/components/TopBar.svelte';
    import DashboardTabs from '$lib/components/DashboardTabs.svelte';
    import CreateNote from '$lib/components/CreateNote.svelte';
    import Card from '$lib/components/Card.svelte';
    import type { Note } from '$lib/types';
    import Editor from './Editor.svelte';

    import { onMount } from 'svelte';

    let notes: Note[] = $state([]);

    onMount(async () => {
        notes = (await fetch('/api/notes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        }).then((res) => res.json())) as Note[];
    });

    async function postNote(note: Note) {
        const res = await fetch('/api/notes/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(note),
        });
        if (!res.ok) {
            try {
                const errorData = await res.json();
                return { success: false, message: errorData.message || 'Failed to create note' };
            } catch (error) {
                return { success: false, message: 'Failed to create note', error };
            }
        }
        return { success: true, note: await res.json() as Note };
    }

    let editorOpen = $state(false);
    let showSidebar = $state(false);
    function toggleSidebar() {
        showSidebar = !showSidebar;
    }
</script>

<TopBar toggleSidebar={toggleSidebar} />
{#if showSidebar}
    <Sidebar toggleSidebar={toggleSidebar} />
{/if}
<main class="flex-1 p-6">
    <div class="flex flex-col items-center justify-start w-full py-4">
        <p class="text-lg font-bold">Welcome to the dashboard!</p>
        <DashboardTabs />
    </div>
    <CreateNote onclick={() => (editorOpen = true)} />

    {#if notes.length > 0}
        <div class="flex flex-wrap gap-4 justify-center mt-4">
            {#each notes as note (note.id)}
                <Card {note} />
            {/each}
        </div>
    {:else}
        <p class="text-center mt-4">No notes found.</p>
    {/if}
</main>
{#if editorOpen}
    <Editor />
{/if}
