<script lang="ts">
    import Background from '$lib/components/Background.svelte';
    import './dashboard.css';
</script>

<Background />
<div>This is the dashboardeyoon/ root page!</div>
<div class="drawer-side">
    <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
    <ul
        class="menu bg-base-200/90 backdrop-blur-2xl border-r border-base-content/10 text-base-content min-h-full w-80 p-4"
    >
        <h3 id="hellousername" class="text-lg font-bold p-2">Good morning/evening/night,</h3>
        <label for="my_modal_6" class="btn btn-primary shadow-md shadow-primary/20 font-bold"
            >Create a Note</label
        >
    </ul>
</div>
