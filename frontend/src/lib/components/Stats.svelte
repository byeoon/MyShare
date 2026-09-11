<script lang="ts">
    import { onMount } from 'svelte';
    let uploads = $state(0);
    let users = $state(0);

    onMount(async () => {
        try {
            const response = await fetch('/api/stats');
            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }
            const data = await response.json();
            uploads = data.totalNotes;
            users = data.totalUsers;
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    });
</script>

<div class="rounded-lg border border-zinc-200/10 bg-zinc-900/60 p-6 backdrop-blur-xl shadow-xl">
    <div class="flex justify-center space-x-8">
        <div class="stat">
            <div class="stat-value text-center text-primary text-center" id="totalUserValue">
                {users}
            </div>
            <div class="stat-title text-base-content/70 text-xs text-center font-medium">
                Instance Users
            </div>
        </div>
        <div class="stat">
            <div class="stat-value text-center text-primary text-center" id="totalNotesValue">
                {uploads}
            </div>
            <div class="stat-title text-base-content/70 text-xs text-center font-medium">
                Instance Uploads
            </div>
        </div>
    </div>
</div>
