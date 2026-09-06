<script lang="ts">
    import Sidebar from '$lib/components/Sidebar.svelte';
    import DashboardContainer from '$lib/components/DashboardContainer.svelte';
</script>

<Sidebar>
    <div class="flex flex-col items-center justify-start w-full py-4">
        <p class="text-lg font-bold">
            This is text before the dashboard container. Feel free to add notifications here, or
            something. (ex. if we do maintenancce)
        </p>
        <DashboardContainer />
    </div>
</Sidebar>
