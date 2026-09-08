<script lang="ts">
    import Sidebar from '$lib/components/Sidebar.svelte';
    import DashboardTabs from '$lib/components/DashboardTabs.svelte';
    import CreateNote from '$lib/components/CreateNote.svelte';
</script>

<Sidebar>
    <div class="flex flex-col items-center justify-start w-full py-4">
        <p class="text-lg font-bold">Welcome to the dashboard!</p>
        <DashboardTabs />
    </div>
    <CreateNote />
</Sidebar>
